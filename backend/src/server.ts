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
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
  title: string;
  value: number;
  range: string;
  status: 'normal' | 'high' | 'low';
  unit: string;
  date?: string;
}

interface PatientRecommendations {
  clinician_summary: string;
  recommended_foods: string[];
  foods_to_limit: string[];
  self_care_recommendations: string[];
  recommended_supplements: string[];
  recommended_medications: string[];
}

interface BiologicalAge {
  biologicalAge: number;
  chronologicalAge: number;
  analysis: string;
}

interface BiomarkerDetail {
  title: string;
  value: number;
  unit: string;
  range: string;
  status: 'normal' | 'high' | 'low';
  description: string;
  whyItMatters: string;
  causes: string[];
  foodsToEat: string[];
  foodsToLimit: string[];
  supplements: string[];
  symptoms: string[];
  additionalTests: string[];
  sources: string[];
  history: Array<{
    date: string;
    value: number;
  }>;
}

// Helper function to determine if a value is within range
function determineStatus(value: number, range: string): 'normal' | 'high' | 'low' {
  const [min, max] = range.split('-').map(num => parseFloat(num.trim()));
  if (isNaN(min) || isNaN(max)) return 'normal';
  
  if (value < min) return 'low';
  if (value > max) return 'high';
  return 'normal';
}

// Helper function to calculate biological age
function calculateBiologicalAge(labResults: LabResult[]): BiologicalAge {
  // This is a simplified model. In a real application, you would use a more sophisticated
  // algorithm based on research and multiple biomarker weightings
  const normalizedScores = labResults.map(result => {
    const [min, max] = result.range.split('-').map(num => parseFloat(num.trim()));
    if (isNaN(min) || isNaN(max)) return 1;
    
    const midpoint = (min + max) / 2;
    const deviation = Math.abs(result.value - midpoint) / (max - min);
    return 1 - Math.min(deviation, 1);
  });

  const averageScore = normalizedScores.reduce((a, b) => a + b, 0) / normalizedScores.length;
  const chronologicalAge = 35; // In a real app, this would come from patient data
  const ageDifference = (averageScore - 0.5) * 10; // Scale to ±5 years
  
  return {
    biologicalAge: Math.round((chronologicalAge - ageDifference) * 10) / 10,
    chronologicalAge,
    analysis: ageDifference <= 0 
      ? `Your biological age is ${Math.abs(ageDifference).toFixed(1)} years higher than your chronological age.`
      : `Your biological age is ${ageDifference.toFixed(1)} years lower than your chronological age.`
  };
}

function processLabResult(title: string, value: number, range: string): LabResult {
  const [min, max] = range.split('-').map(num => parseFloat(num.trim()));
  let status: 'normal' | 'high' | 'low' = 'normal';
  
  if (!isNaN(min) && !isNaN(max)) {
    if (value < min) status = 'low';
    else if (value > max) status = 'high';
  }

  return {
    title,
    value,
    range,
    status,
    unit: 'mcg/dL', // Default unit, in a real app this would come from the data
  };
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
        columns: ['title', 'value', 'range'],
        skip_empty_lines: true,
        from_line: 2 // Skip header row
      }));

    for await (const record of parser) {
      const value = parseFloat(record.value);
      const result: LabResult = processLabResult(record.title.trim(), value, record.range.trim());
      results.push(result);
    }

    // Save to local JSON file
    const jsonFilePath = path.join(dataDir, 'lab_results.json');
    await fs.writeJson(jsonFilePath, results, { spaces: 2 });

    // Clean up uploaded CSV
    await fs.remove(req.file.path);

    res.json({ 
      message: 'Lab results uploaded successfully',
      count: results.length,
      results
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
    if (await fs.pathExists(jsonFilePath)) {
      const results = await fs.readJson(jsonFilePath);
      res.json(results);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lab results' });
  }
});

// Get recommendations based on lab results
app.get('/api/recommendations', async (req: Request, res: Response) => {
  try {
    const jsonFilePath = path.join(dataDir, 'lab_results.json');
    const results: LabResult[] = await fs.readJson(jsonFilePath);
    
    // Generate recommendations based on lab results
    const abnormalResults = results.filter(result => result.status !== 'normal');
    const recommendations = generateRecommendations(abnormalResults);
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Helper function to generate recommendations
function generateRecommendations(abnormalResults: LabResult[]): PatientRecommendations {
  const summary = abnormalResults.length > 0
    ? `You have ${abnormalResults.length} lab results outside the normal range.`
    : "All your lab results are within normal ranges.";

  return {
    clinician_summary: summary,
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

// Get biological age analysis
app.get('/api/biological-age', async (req: Request, res: Response) => {
  try {
    const jsonFilePath = path.join(dataDir, 'lab_results.json');
    if (await fs.pathExists(jsonFilePath)) {
      const results = await fs.readJson(jsonFilePath);
      const bioAge = calculateBiologicalAge(results);
      res.json(bioAge);
    } else {
      res.status(404).json({ error: 'No lab results found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate biological age' });
  }
});

// Get detailed biomarker information
app.get('/api/biomarker/:category/:biomarker', async (req: Request, res: Response) => {
  try {
    const { category, biomarker } = req.params;
    console.log('Received request for:', { category, biomarker });
    const jsonFilePath = path.join(dataDir, 'lab_results.json');
    
    if (await fs.pathExists(jsonFilePath)) {
      const results = await fs.readJson(jsonFilePath) as LabResult[];
      console.log('Available biomarkers:', results.map(r => r.title));
      
      // Normalize the search term
      const searchTerm = biomarker.replace(/-/g, ' ').toLowerCase();
      console.log('Searching for normalized term:', searchTerm);
      
      // Find exact match first
      let result = results.find(r => r.title.toLowerCase() === searchTerm);
      
      // If no exact match, try partial match
      if (!result) {
        result = results.find(r => {
          const normalizedTitle = r.title.toLowerCase();
          return normalizedTitle.includes(searchTerm) || searchTerm.includes(normalizedTitle);
        });
      }

      if (!result) {
        console.log('Biomarker not found. Available biomarkers:', results.map(r => r.title));
        res.status(404).json({ 
          error: 'Biomarker not found',
          availableBiomarkers: results.map(r => r.title)
        });
        return;
      }

      // Mock historical data
      const history = [
        { date: '2022-01', value: result.value * 0.9 },
        { date: '2022-06', value: result.value * 0.95 },
        { date: '2023-01', value: result.value * 1.1 },
        { date: '2023-06', value: result.value * 1.05 },
        { date: '2024-01', value: result.value }
      ];

      // Mock detailed information
      const biomarkerDetail: BiomarkerDetail = {
        ...result,
        unit: result.unit || 'mcg/dL',
        description: "Can help gauge reproductive function and the health of your adrenal gland.",
        whyItMatters: "Dehydroepiandrosterone sulfate (DHEA-S) is the most abundant hormone in the human body. It is associated with longevity, positive reproductive outcomes, and immune system regulation. DHEA-S production gradually increases from age 10, peaks during your 20s, and slowly decreases with age.",
        causes: [
          "Age-related decline",
          "Adrenal gland dysfunction",
          "Stress",
          "Certain medications",
          "Autoimmune conditions"
        ],
        foodsToEat: [
          "Wild-caught fatty fish",
          "Eggs from pasture-raised chickens",
          "Leafy greens",
          "Brazil nuts",
          "Avocados"
        ],
        foodsToLimit: [
          "Processed foods",
          "Excessive caffeine",
          "Alcohol",
          "Added sugars",
          "Refined carbohydrates"
        ],
        supplements: [
          "DHEA (under medical supervision)",
          "Vitamin D3",
          "Magnesium",
          "Omega-3 fatty acids",
          "Adaptogenic herbs"
        ],
        symptoms: [
          "Fatigue",
          "Decreased muscle mass",
          "Mood changes",
          "Reduced bone density",
          "Changes in libido"
        ],
        additionalTests: [
          "Cortisol",
          "Testosterone",
          "Thyroid panel",
          "Comprehensive metabolic panel"
        ],
        sources: [
          "National Institutes of Health",
          "Journal of Clinical Endocrinology & Metabolism",
          "Mayo Clinic",
          "American Journal of Medicine"
        ],
        history
      };

      res.json(biomarkerDetail);
    } else {
      res.status(404).json({ error: 'No lab results found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch biomarker details' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 