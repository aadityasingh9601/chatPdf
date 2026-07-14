from llama_index.core import SimpleDirectoryReader
from llama_index.readers.file import (
    PDFReader,
)

# Document loading
# PDF Reader with `SimpleDirectoryReader`
parser = PDFReader()
file_extractor = {".pdf": parser}
documents = SimpleDirectoryReader(
    "../data", file_extractor=file_extractor
).load_data()

print(documents)