from fastapi import FastAPI, File, UploadFile, Form
from pydantic import BaseModel, Field # To define data model/structure
from db import supabase
import os
import json
import shutil
from query import answerUserQuery
from ingestion import buildIndex

class User(BaseModel):
    name: str | None = Field(default=None)
    email: str 
    password: str

app = FastAPI()

def saveFile(file: UploadFile = File(...)):
    # Create data directory if it doesn't exist
    os.makedirs("data", exist_ok=True)
    # Save file directly to data directory
    file_path = f"data/{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

def removeFile(file_path:str):
    os.remove(file_path)

@app.get("/")
async def root():
    return {"message": "Hello World"}

# Get all users
@app.get("/users")
async def getAllUsersData():
    response = supabase.table("User").select("name email").execute()
    return response

# Get single user
@app.get("/user/{userId}")
async def getUserData(userId):
    print(userId)
    response = supabase.table("User").select("*").eq("id",4).execute()
    return response

# Create new user
@app.post("/user")
async def createUser(data:User):
    print(data)
    response = supabase.table("User").insert(data.model_dump()).execute()
    return response

# Upload pdf.
@app.post("/api/upload")
async def upload_file(userId:str,file: UploadFile = File(...)):
    print(userId)
    saveFile(file)
    buildIndex(userId)
    removeFile(f"data/{file.filename}")
    return {
        "filename": file.filename,
        "content_type": file.content_type,
    }

# Ask query.
@app.get("/api/userquery")
def user_query(userId:str, pdfName:str, query: str):
    print(f"userId -> {userId}")
    print(f"user query -> {query}")
    print(f"pdfName -> {pdfName}")
    response = answerUserQuery(userId, pdfName, query)
    return {"answer": str(response)}

