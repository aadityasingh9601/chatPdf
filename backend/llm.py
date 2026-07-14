from dotenv import load_dotenv, dotenv_values
from llama_index.llms.google_genai import GoogleGenAI
import os
load_dotenv()

# You can use other gemini flash models too, like 1.5-flash which has higher request/min allowed (15)
# gemini-2.5-flash has 10 rpm

key: str = os.getenv("GOOGLE_GEMINI_KEY")

llm = GoogleGenAI(
    model="gemini-3.5-flash",
)

# resp = llm.complete("Who is Paul Graham?")
# print(resp)

