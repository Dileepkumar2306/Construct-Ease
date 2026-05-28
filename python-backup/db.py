import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# Use localhost by default
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

def get_db():
    client = MongoClient(MONGO_URI)
    return client['construct_ease_db']
