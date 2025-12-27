import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, storage

# Load env vars (Railway injects them automatically)
# load_dotenv() is NOT needed in production
# but keeping it doesn't hurt local dev
from dotenv import load_dotenv
load_dotenv()

# Read Firebase service account JSON from env
firebase_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")

if not firebase_json:
    raise RuntimeError("❌ FIREBASE_SERVICE_ACCOUNT env variable is missing")

# Initialize Firebase only once
if not firebase_admin._apps:
    cred = credentials.Certificate(json.loads(firebase_json))
    firebase_admin.initialize_app(
        cred,
        {
            "storageBucket": os.getenv("STORAGE_BUCKET")
        }
    )

# Firestore client
db = firestore.client()

# Storage bucket client
bucket = storage.bucket()
