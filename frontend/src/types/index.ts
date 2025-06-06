export interface LabResult {
  title: string;
  value: number;
  range: string;
  status?: 'normal' | 'high' | 'low';
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