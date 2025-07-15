import os
import re
from dotenv import load_dotenv

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore

from langchain_core.prompts import PromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain import hub

load_dotenv()

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large",
    openai_api_key=os.environ.get("OPENAI_API_KEY")
)

llm = ChatOpenAI(
    model_name="gpt-4o",
    temperature=0
)

vectorstore = PineconeVectorStore(
    index_name=os.environ["INDEX_NAME"],
    embedding=embeddings
)

prompt_template = """
You are a helpful assistant providing clear, accurate, and safe drug information.

Use ONLY the retrieved context below to answer the user’s question.
Do NOT make up any information that is not in the context.

If the question is about a drug’s details (such as generic name, class, usage, warnings, or side effects)
and some of that information is missing from the context, clearly say so — for example:
“There is no information available about side effects for this drug.”

If the question is about drug-to-drug interactions or mixing/combining/taking drugs together,
and no interactions are found in the context,
respond: “There are no known interactions for these drugs in the current data.”

If interaction details are found, provide them in clear, factual sentences.

Keep your answers concise and factual.
Write in clear, natural sentences.

Always remind the user that this information does not replace professional medical advice
and they should consult a healthcare professional for any medical questions.

Context:
{context}

Question: {input}

Helpful Answer:
"""

prompt = PromptTemplate(input_variables=["context", "input"], template=prompt_template)
stuff_chain = create_stuff_documents_chain(llm=llm, prompt=prompt)
rephrase_prompt = hub.pull("langchain-ai/chat-langchain-rephrase")

DISCLAIMER_PATTERN = re.compile(
    r"(Please\s+remember\s+that\s+)?this\s+information\s+does\s+not\s+replace\s+professional\s+medical\s+advice.*?("
    r"consult.*?questions\.)",
    re.IGNORECASE | re.DOTALL
)

extract_drugs_prompt = PromptTemplate(
    input_variables=["input"],
    template="""
You are a helpful extraction assistant.
Extract ONLY the unique drug names mentioned in this question.
Return them as a PLAIN Python list of strings.
Do NOT add any additional text or explanation — return JUST the list.

Question: {input}

Drugs list:
"""
)


def extract_drug_names(question: str) -> list:
    extraction_prompt = extract_drugs_prompt.format(input=question)
    response = llm.invoke(extraction_prompt)

    clean_response = re.sub(r"```[a-z]*", "", response.content, flags=re.IGNORECASE).replace("```", "").strip()

    try:
        extracted_drugs = eval(clean_response)
        if isinstance(extracted_drugs, list):
            return list(set([d.strip() for d in extracted_drugs if d.strip()]))
    except Exception as e:
        print(f"Error parsing extracted drugs: {e}")
        return []
    return []


def generate_pairs(meds: list):
    all_pairs = []
    n = len(meds)
    for i in range(n):
        for j in range(i + 1, n):
            all_pairs.append((meds[i], meds[j]))
    return all_pairs


def get_history_aware_retriever(question: str, normalized_drugs: list):
    if any(keyword in question.lower() for keyword in
           ["interaction", "interact", "interactions", "mix", "mixing", "combining", "combine", "combination",
            "together"]):
        filters = {"type": "interaction"}
        if len(normalized_drugs) > 1:
            filters = {
                "$or": [
                    {"drug_name": {"$in": normalized_drugs}},
                    {"interacts_with_generic_name": {"$in": normalized_drugs}}
                ],
                "type": "interaction"
            }
        retriever = vectorstore.as_retriever(search_kwargs={"k": 30, "filter": filters})
    else:
        retriever = vectorstore.as_retriever(search_kwargs={"k": 25, "filter": {"type": "drug"}})

    history_retriever = create_history_aware_retriever(
        llm=llm,
        retriever=retriever,
        prompt=rephrase_prompt
    )
    return history_retriever


def run_retrieval_chain(query: str, history: list, normalized_drugs: list):
    retriever = get_history_aware_retriever(query, normalized_drugs)
    rag_chain = create_retrieval_chain(
        retriever=retriever,
        combine_docs_chain=stuff_chain
    )
    result = rag_chain.invoke({
        "input": query,
        "chat_history": history
    })
    return result["answer"]


def run_rag(user_question: str, chat_history: list):
    drugs = extract_drug_names(user_question)

    if any(keyword in user_question.lower() for keyword in
           ["interaction", "interact", "interactions", "mix", "mixing", "combining", "combine", "combination",
            "together"]):
        if len(drugs) > 1:
            pairs = generate_pairs(drugs)
            answers = []
            for pair in pairs:
                pair_query = f"What are the drug-to-drug interactions between {pair[0]} and {pair[1]}?"
                pair_answer = run_retrieval_chain(pair_query, chat_history, drugs)
                cleaned_answer = DISCLAIMER_PATTERN.sub("", pair_answer).strip()
                answers.append(f"**{pair[0]} and {pair[1]}:**\n{cleaned_answer}")
            final_answer = "\n\n".join(answers)
            final_answer += ("\n\nPlease remember that this information does not replace professional medical "
                             "advice, and you should consult a healthcare professional for any medical questions.")
        else:
            final_answer = run_retrieval_chain(user_question, chat_history, drugs)
    else:
        final_answer = run_retrieval_chain(user_question, chat_history, [])

    chat_history.append({"role": "user", "content": user_question})
    chat_history.append({"role": "assistant", "content": final_answer})
    return final_answer
