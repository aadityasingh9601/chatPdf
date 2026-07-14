from llama_index.core import SimpleDirectoryReader
from llama_index.readers.file import (
    PDFReader,
)
from llama_index.core import VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core import Settings
from embeddings import embed_model

print(embed_model)

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

# per-index
index = VectorStoreIndex.from_documents(
    documents, transformations=[text_splitter],
    show_progress = True
)

# Prints the embeddings
print(index)

# With your text indexed, it is now technically ready for querying! However, embedding all your text can be 
# time-consuming and, if you are using a hosted LLM, it can also be expensive. To save time and money you will 
# want to STORE YOUR EMBEDDINGS FIRST.