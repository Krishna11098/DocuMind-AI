import firebase_admin
from firebase_admin import credentials, firestore, storage

from dotenv import load_dotenv
import os

load_dotenv()


# Initialize Firebase with service account
cred = credentials.Certificate("firebase_json.json")
firebase_admin.initialize_app(cred, {
    "storageBucket": os.getenv("STORAGE_BUCKET")  
})

# Firestore client
db = firestore.client()

# Storage bucket client
bucket = storage.bucket()
