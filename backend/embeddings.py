from llama_index.embeddings.google_genai import GoogleGenAIEmbedding
from google.genai.types import EmbedContentConfig
from dotenv import load_dotenv, dotenv_values
from llama_index.llms.google_genai import GoogleGenAI
import os
load_dotenv()

key: str = os.getenv("GOOGLE_GEMINI_KEY")

embed_model = GoogleGenAIEmbedding(
    model_name="gemini-embedding-2-preview",
    embed_batch_size=100,
    api_key=key,
)

# Pass the indexes here in-place of "Google Gemini Embeddings"
embeddings = embed_model.get_text_embedding("Google Gemini Embeddings.")
print(embeddings)