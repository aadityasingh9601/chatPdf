from dotenv import load_dotenv, dotenv_values
from llama_index.llms.google_genai import GoogleGenAI
import os
load_dotenv()

# You can use other gemini flash models too

key: str = os.getenv("GOOGLE_GEMINI_KEY")

llm = GoogleGenAI(
    model="gemini-3.5-flash",
)

# resp = llm.complete("Who is Paul Graham? Answer in 50 words")
# print(resp)

