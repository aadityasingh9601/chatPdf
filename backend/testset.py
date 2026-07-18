import os
import pandas as pd
from dotenv import load_dotenv
from llama_index.readers.file import PDFReader
from llama_index.core import SimpleDirectoryReader
from ragas.llms import llm_factory
from ragas.embeddings.base import embedding_factory
from ragas.testset import TestsetGenerator
from openai import OpenAI
from google import genai

load_dotenv()

print(os.getenv("GROQ_API_KEY"))

# Documents (same as ingestion.py)
parser = PDFReader()
file_extractor = {".pdf": parser}
documents = SimpleDirectoryReader(
    "./data", file_extractor=file_extractor
).load_data()

# LLM — Groq free tier (llama-3.3-70b-versatile, 30 req/min)
# Ragas instructor adapter doesn't work with groq SDK directly,
# so we use OpenAI client pointed at Groq's OpenAI-compatible endpoint.
groq_client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)
llm = llm_factory("llama-3.3-70b-versatile", provider="openai", client=groq_client)

# Embeddings — Google free tier (groq doesn't serve embeddings)
genai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
embeddings = embedding_factory("google", client=genai_client)

# Generator
generator = TestsetGenerator(llm=llm, embedding_model=embeddings)
testset = generator.generate_with_llamaindex_docs(
    documents,
    testset_size=10,
    with_debugging_logs=True,
)

# Save to backend directory
output_dir = os.path.dirname(os.path.abspath(__file__))

csv_path = os.path.join(output_dir, "testset.csv")
df = testset.to_pandas()
df.to_csv(csv_path, index=False)

json_path = os.path.join(output_dir, "testset.json")
df.to_json(json_path, orient="records", indent=2)

print(f"Generated {len(df)} test samples")
print(f"Saved to: {csv_path}")
print(f"Saved to: {json_path}")
print(df.head())
