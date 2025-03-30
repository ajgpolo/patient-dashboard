export interface LabResult {
  title: string;
  value: number;
  range: string;
  status: 'normal' | 'high' | 'low';
  unit: string;
  date: string;
}

export interface PatientRecommendations {
  clinician_summary: string;
  recommended_foods: string[];
  foods_to_limit: string[];
  self_care_recommendations: string[];
  recommended_supplements: string[];
  recommended_medications: string[];
} 