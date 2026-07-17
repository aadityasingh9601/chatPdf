from llama_index.llms.google_genai import GoogleGenAI
from dotenv import load_dotenv, dotenv_values
import os
load_dotenv()

# You can use other gemini flash models too

key: str = os.getenv("GOOGLE_GEMINI_KEY")

llm = GoogleGenAI(
    model="gemini-3.1-flash-lite",
)

# resp = llm.complete("Who is Paul Graham? Answer in 50 words")
# print(resp)

