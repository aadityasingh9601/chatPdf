from llama_index.core import (VectorStoreIndex, SimpleDirectoryReader, Document, StorageContext, Settings)
from llama_index.readers.file import PDFReader
from llama_index.core.node_parser import SentenceSplitter
from embeddings import embed_model
from llama_index.vector_stores.supabase import SupabaseVectorStore
import textwrap
import logging
import sys
import os
from dotenv import load_dotenv, dotenv_values
from llm import llm


# Uncomment to see debug logs
# logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
# logging.getLogger().addHandler(logging.StreamHandler(stream=sys.stdout))

# print(embed_model)

# Loading the documents.
# PDF Reader with `SimpleDirectoryReader`
parser = PDFReader()
file_extractor = {".pdf": parser}
documents = SimpleDirectoryReader(
    "../data", file_extractor=file_extractor
).load_data()
# print(documents)

# Transformations -> Chunking, extracting meta-data & embed each chunk.
text_splitter = SentenceSplitter(chunk_size=512, chunk_overlap=20)
# Set the text_splitter & embedding model globally.
Settings.text_splitter = text_splitter
Settings.embed_model = embed_model
Settings.llm = llm

# Prints the embeddings
#print(index)

# With your text indexed, it is now technically ready for querying! However, embedding all your text again can be 
# time-consuming and, if you are using a hosted LLM, it can also be expensive. To save time and money you will 
# want to STORE YOUR EMBEDDINGS FIRST.

# Storing the embeddings.

vector_store = SupabaseVectorStore(
    postgres_connection_string=(
        os.getenv("DATABASE_URL")
    ),
    collection_name="base_demo",
    dimension=768
)
# Whatever model you chose, look up its dimension and pass that exact number.
# The number must match exactly. If your model outputs 768 dimensions but your pgvector column is set to 1536, 
#it will throw an error on insert.

storage_context = StorageContext.from_defaults(vector_store=vector_store)

# per-index
index = VectorStoreIndex.from_documents(
    documents, transformations=[text_splitter],
    storage_context=storage_context,
    show_progress = True
)

# We're all set, we can ask questions using our index.
query_engine = index.as_query_engine()
response = query_engine.query("What is the title of the report?")

print(textwrap.fill(str(response), 100))