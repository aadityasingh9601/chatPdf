from fastapi import FastAPI
from pydantic import BaseModel, Field # To define data model/structure
from db import supabase
import json

class User(BaseModel):
    name: str | None = Field(default=None)
    email: str 
    password: str

app = FastAPI()

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
