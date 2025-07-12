import os
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
and some of that information is missing from the context, clearly say so —
for example: “There is no information available about side effects for this drug.”

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

prompt = PromptTemplate(
    input_variables=["context", "input"],
    template=prompt_template
)

stuff_chain = create_stuff_documents_chain(
    llm=llm,
    prompt=prompt
)

rephrase_prompt = hub.pull("langchain-ai/chat-langchain-rephrase")

def get_history_aware_retriever(question: str):
    if any(keyword in question.lower() for keyword in ["interaction", "interact", "interactions", "mix", "mixing", "combining", "combine", "together"]):
        retriever = vectorstore.as_retriever(search_kwargs={"k": 20, "filter": {"type": "interaction"}})
    else:
        retriever = vectorstore.as_retriever(search_kwargs={"k": 15, "filter": {"type": "drug"}})

    history_retriever = create_history_aware_retriever(
        llm=llm,
        retriever=retriever,
        prompt=rephrase_prompt
    )
    return history_retriever


if __name__ == "__main__":
    print("Med Assistant Chat with Memory\n")
    print("Ask your drug-related question. Type 'q' or 'exit' to quit.\n")

    chat_history = []

    while True:
        user_question = input("Your question: ").strip()

        if user_question.lower() in ["q", "quit", "exit"]:
            print("Goodbye!")
            break

        history_aware_retriever = get_history_aware_retriever(user_question)

        rag_chain = create_retrieval_chain(
            retriever=history_aware_retriever,
            combine_docs_chain=stuff_chain
        )

        result = rag_chain.invoke({
            "input": user_question,
            "chat_history": chat_history
        })

        chat_history.append({"role": "user", "content": user_question})
        chat_history.append({"role": "assistant", "content": result["answer"]})

        print("\nAnswer:\n")
        print(result["answer"])
        print("\n" + "-" * 72 + "\n")
