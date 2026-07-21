from colorama import Fore, Back, Style
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.vector_stores.supabase import SupabaseVectorStore
from llama_index.core.vector_stores import MetadataFilter, MetadataFilters
from embeddings import embed_model
from llm import llm
import os
import textwrap
from dotenv import load_dotenv
load_dotenv()

# print("Enter question ->")
# userQuery = input()
# print("AI searching the PDF...")

def answerUserQuery(userId:str, pdfName:str, userQuery: str):
    print(f"Received user query -> {userQuery}")
    vector_store = SupabaseVectorStore(
    postgres_connection_string=os.getenv("DATABASE_URL"),
    collection_name="embeddings",
    dimension=768
  )

    index = VectorStoreIndex.from_vector_store(vector_store, embed_model=embed_model)
    filters = MetadataFilters(filters=[
    MetadataFilter(key="user_id", value=userId),
    MetadataFilter(key="file_name", value=pdfName)
])
    query_engine = index.as_query_engine(llm=llm, filters=filters)
    response = query_engine.query(userQuery)

    print(Fore.GREEN + str(response))
    return response


def answerUserQueryStream(userId: str, pdfName: str, userQuery: str):
    print(f"Received user query (stream) -> {userQuery}")
    vector_store = SupabaseVectorStore(
        postgres_connection_string=os.getenv("DATABASE_URL"),
        collection_name="embeddings",
        dimension=768
    )
    index = VectorStoreIndex.from_vector_store(vector_store, embed_model=embed_model)
    filters = MetadataFilters(filters=[
        MetadataFilter(key="user_id", value=userId),
        MetadataFilter(key="file_name", value=pdfName)
    ])

    retriever = index.as_retriever(filters=filters, similarity_top_k=5)
    nodes = retriever.retrieve(userQuery)
    context = "\n\n".join([node.text for node in nodes])

    prompt = (
        "Given the context information below, answer the question. "
        "If the answer cannot be found in the context, say so.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {userQuery}\n\n"
        "Answer:"
    )

    stream = llm.stream_complete(prompt)
    for token in stream:
        if hasattr(token, "delta") and token.delta:
            print(Fore.GREEN + str(token.delta))
            yield f"data: {token.delta}\n\n"
    yield "data: [DONE]\n\n"


if __name__ == "__main__":
    answerUserQuery()

# print(textwrap.fill(str(response), 100))