from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.vector_stores.supabase import SupabaseVectorStore
from embeddings import embed_model
from llm import llm
import os
import textwrap
from dotenv import load_dotenv
load_dotenv()


vector_store = SupabaseVectorStore(
    postgres_connection_string=os.getenv("DATABASE_URL"),
    collection_name="base_demo",
    dimension=768
)

index = VectorStoreIndex.from_vector_store(vector_store, embed_model=embed_model)

query_engine = index.as_query_engine(llm=llm)
response = query_engine.query("What is report's heading?")

print(response)
print(textwrap.fill(str(response), 100))