from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
from datetime import datetime

app = FastAPI(title="Patient Dashboard API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LabResult(BaseModel):
    test_name: str
    value: float
    unit: str
    reference_range: str
    date: datetime

class PatientRecommendations(BaseModel):
    clinician_summary: str
    recommended_foods: List[str]
    foods_to_limit: List[str]
    self_care_recommendations: List[str]
    recommended_supplements: List[str]
    recommended_medications: List[str]

@app.post("/upload-lab-report")
async def upload_lab_report(file: UploadFile = File(...)):
    try:
        # Read the uploaded file (assuming it's a CSV)
        df = pd.read_csv(file.file)
        
        # Process the lab results and generate recommendations
        recommendations = generate_recommendations(df)
        
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def generate_recommendations(lab_data: pd.DataFrame) -> PatientRecommendations:
    # This is a placeholder function that would contain the logic to analyze lab results
    # and generate personalized recommendations
    return PatientRecommendations(
        clinician_summary="Based on your lab results, your overall health indicators are within normal ranges.",
        recommended_foods=["Leafy greens", "Lean proteins", "Whole grains"],
        foods_to_limit=["Processed foods", "Added sugars", "Saturated fats"],
        self_care_recommendations=[
            "30 minutes of moderate exercise daily",
            "7-8 hours of sleep per night",
            "Stress management techniques"
        ],
        recommended_supplements=["Vitamin D", "Omega-3 fatty acids"],
        recommended_medications=["Consult with your healthcare provider"]
    )

@app.get("/")
async def root():
    return {"message": "Welcome to the Patient Dashboard API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 