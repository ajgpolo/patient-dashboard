import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs-extra';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
fs.ensureDirSync(dataDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dataDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv') {
      cb(new Error('Only CSV files are allowed'));
      return;
    }
    cb(null, true);
  },
});

// Types
interface LabResult {
  test_name: string;
  value: number;
  unit: string;
  reference_range: string;
  date: string;
  patient_id?: string;
}

interface PatientRecommendations {
  clinician_summary: string;
  recommended_foods: string[];
  foods_to_limit: string[];
  self_care_recommendations: string[];
  recommended_supplements: string[];
  recommended_medications: string[];
}

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Patient Dashboard API' });
});

// Admin route for uploading CSV
app.post('/api/admin/upload-lab-results', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    const results: LabResult[] = [];
    const parser = fs
      .createReadStream(req.file.path)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true
      }));

    for await (const record of parser) {
      results.push({
        test_name: record.test_name,
        value: parseFloat(record.value),
        unit: record.unit,
        reference_range: record.reference_range,
        date: record.date,
        patient_id: record.patient_id
      });
    }

    // Save to local JSON file
    const jsonFilePath = path.join(dataDir, 'lab_results.json');
    let existingData: LabResult[] = [];
    
    if (await fs.pathExists(jsonFilePath)) {
      existingData = await fs.readJson(jsonFilePath);
    }
    
    await fs.writeJson(jsonFilePath, [...existingData, ...results], { spaces: 2 });

    // Clean up uploaded CSV
    await fs.remove(req.file.path);

    res.json({ 
      message: 'Lab results uploaded successfully',
      count: results.length
    });
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to process file'
    });
  }
});

// Get all lab results
app.get('/api/lab-results', async (req: Request, res: Response) => {
  try {
    const jsonFilePath = path.join(dataDir, 'lab_results.json');
    const results = await fs.readJson(jsonFilePath);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lab results' });
  }
});

// Get recommendations based on lab results
app.get('/api/recommendations/:patientId', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const jsonFilePath = path.join(dataDir, 'lab_results.json');
    const allResults: LabResult[] = await fs.readJson(jsonFilePath);
    
    const patientResults = allResults.filter(result => result.patient_id === patientId);
    const recommendations = generateRecommendations(patientResults);
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Helper function to generate recommendations
function generateRecommendations(labResults: LabResult[]): PatientRecommendations {
  // This is where you would implement your lab result analysis logic
  // For now, returning mock data
  return {
    clinician_summary: "Based on the lab results, your overall health indicators are within normal ranges.",
    recommended_foods: [
      "Leafy greens",
      "Lean proteins",
      "Whole grains",
      "Fresh fruits",
      "Healthy fats"
    ],
    foods_to_limit: [
      "Processed foods",
      "Added sugars",
      "Saturated fats",
      "Sodium-rich foods",
      "Refined carbohydrates"
    ],
    self_care_recommendations: [
      "30 minutes of moderate exercise daily",
      "7-8 hours of sleep per night",
      "Stress management techniques",
      "Regular hydration",
      "Mindfulness practices"
    ],
    recommended_supplements: [
      "Vitamin D",
      "Omega-3 fatty acids",
      "Probiotics",
      "Magnesium",
      "B-complex vitamins"
    ],
    recommended_medications: [
      "Consult with your healthcare provider for personalized medication recommendations"
    ]
  };
}

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 