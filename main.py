import os
from dotenv import load_dotenv

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore

from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough

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


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


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

Question: {question}

Helpful Answer:
"""

prompt = PromptTemplate(
    input_variables=["context", "question"],
    template=prompt_template
)

retriever = vectorstore.as_retriever(
    search_kwargs={"k": 15}
)

rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
)

if __name__ == "__main__":
    print("Med Assistant Chat\n")
    print("Ask your drug-related question. Type 'q' or 'exit' or press Ctrl+C to quit.\n")

    while True:
        user_question = input("Your question: ").strip()

        if user_question.lower() in ["q", "quit", "exit"]:
            print("Goodbye!")
            break

        answer = rag_chain.invoke(user_question)

        print("Answer:\n")
        print(answer.content)
        print("\n------------------------------------------------------------------------\n")
