from llama_index.core import SimpleDirectoryReader
# from llama_index.llms.google_genai import GoogleGenAI
from llama_index.readers.file import PDFReader
# from llama_index.embeddings.google_genai import GoogleGenAIEmbedding
from ragas.testset import TestsetGenerator
from dotenv import load_dotenv, dotenv_values

import os
load_dotenv()

ai_key: str = os.getenv("GOOGLE_GEMINI_KEY")
print(ai_key)

# parser = PDFReader()
# file_extractor = {".pdf": parser}
# documents = SimpleDirectoryReader("./data", file_extractor=file_extractor).load_data()

# # generator with openai models
# generator_llm = GoogleGenAI(model="gemini-3.5-flash")
# embeddings = GoogleGenAI(model="gemini-embedding-2-preview")

# generator = TestsetGenerator.from_llama_index(
#     llm=generator_llm,
#     embedding_model=embeddings,
# )

# # generate testset
# testset = generator.generate_with_llamaindex_docs(
#     documents,
#     testset_size=5,
# )

# print(f"testset -> {testset}")

# df = testset.to_pandas()
# df.head()

# # Build the query engine next.

import os
from google import genai
from ragas.llms import llm_factory
from ragas.embeddings import embedding_factory
from ragas.testset import TestsetGenerator

parser = PDFReader()
file_extractor = {".pdf": parser}
documents = SimpleDirectoryReader("./data", file_extractor=file_extractor).load_data()

# LLM
client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))
llm = llm_factory("gemini-3.5-flash", provider="google", client=client)

# Embeddings
embeddings = embedding_factory("google", client=client)

# Generator
generator = TestsetGenerator(llm=llm, embedding_model=embeddings)
testset = generator.generate_with_llamaindex_docs(documents, testset_size=20)

print(f"testset -> {testset}")

df = testset.to_pandas()
df.head()
