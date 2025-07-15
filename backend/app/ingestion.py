import os
from dotenv import load_dotenv
import pandas as pd

from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

load_dotenv()

drugs_data_path = "/backend/app/data/csv/drugs_data_final.csv"
interactions_data_path = "/backend/app/data/csv/drug_to_drug_interactions_final.csv"

drugs_df = pd.read_csv(drugs_data_path)
interactions_df = pd.read_csv(interactions_data_path)

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large",
    openai_api_key=os.environ.get("OPENAI_API_KEY")
)

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=200
)


def batch(iterable, batch_size):
    """Split a list into batches"""
    for i in range(0, len(iterable), batch_size):
        yield iterable[i:i + batch_size]


def create_drug_documents():
    documents = []
    for _, row in drugs_df.iterrows():
        generic_name = row['Generic Name'] if pd.notnull(row['Generic Name']) else ""
        drug_class = row['Drug Class'] if pd.notnull(row['Drug Class']) else ""
        usage = row['Usage'] if pd.notnull(row['Usage']) else ""
        warnings = row['Warnings'] if pd.notnull(row['Warnings']) else ""
        side_effects = row['Side Effects'] if pd.notnull(row['Side Effects']) else ""

        text = f"""
        Drug Name: {row['Drug Name']}
        Generic Name: {generic_name}
        Drug Class: {drug_class}
        Usage: {usage}
        Warnings: {warnings}
        Side Effects: {side_effects}
        """

        metadata = {
            "type": "drug",
            "drug_id": str(row['Drug ID']),
            "drug_name": row['Drug Name'],
            "generic_name": generic_name
        }

        documents.append(Document(page_content=text.strip(), metadata=metadata))
    return documents


def create_interaction_documents():
    documents = []
    for _, row in interactions_df.iterrows():
        text = f"""
        Drug: {row['Drug Name']}
        Interacts With: {row['Interacts With Generic Name']}
        Interaction Details: {row['Interaction']}
        """
        metadata = {
            "type": "interaction",
            "drug_id": row['Drug ID'],
            "drug_name": row['Drug Name'],
            "interacts_with_generic_name": row['Interacts With Generic Name'],
        }
        documents.append(Document(page_content=text.strip(), metadata=metadata))
    return documents


def ingest_to_pinecone(documents, doc_type):
    chunks = text_splitter.split_documents(documents)
    print(f"Splitting done: {len(chunks)} chunks for {doc_type}.")

    batch_size = 100
    for i, chunk_batch in enumerate(batch(chunks, batch_size)):
        print(f"> Uploading batch {i + 1}/{(len(chunks) // batch_size) + 1} with {len(chunk_batch)} chunks...")
        PineconeVectorStore.from_documents(
            chunk_batch,
            embeddings,
            index_name=os.environ["INDEX_NAME"]
        )

    print(f"Finished ingesting {doc_type} data into Pinecone.\n")


def main():
    print("Starting ingestion process...")

    drug_docs = create_drug_documents()
    ingest_to_pinecone(drug_docs, "Drugs")

    interaction_docs = create_interaction_documents()
    ingest_to_pinecone(interaction_docs, "Drug Interactions")

    print("All data ingested successfully!")


if __name__ == "__main__":
    main()
