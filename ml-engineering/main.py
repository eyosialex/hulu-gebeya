from fastapi import FastAPI
from rag import rag_pipeline

app = FastAPI(title="SmartMap Full RAG System")

@app.get("/")
def home():
    return {"message": "SmartMap RAG running"}

@app.post("/query")
def query(data: dict):
    query_text = data.get("query")
    location = data.get("location") # Expected: {"lat": ..., "lng": ...}
    return rag_pipeline(query_text, location=location)