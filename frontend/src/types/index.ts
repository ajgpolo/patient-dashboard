export interface LabResult {
  test_name: string;
  value: number;
  unit: string;
  reference_range: string;
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

export interface DashboardState {
  labResults: LabResult[];
  recommendations: PatientRecommendations | null;
  loading: boolean;
  error: string | null;
} 