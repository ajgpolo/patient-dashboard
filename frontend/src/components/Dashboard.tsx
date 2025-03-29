import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { LabResult, PatientRecommendations } from '../types';

interface DashboardProps {
  patientId: string;
}

export default function Dashboard({ patientId }: DashboardProps) {
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [recommendations, setRecommendations] = useState<PatientRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultsResponse, recommendationsResponse] = await Promise.all([
          fetch('http://localhost:8000/api/lab-results'),
          fetch(`http://localhost:8000/api/recommendations/${patientId}`)
        ]);

        if (!resultsResponse.ok || !recommendationsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const results = await resultsResponse.json();
        const recommendations = await recommendationsResponse.json();

        setLabResults(results);
        setRecommendations(recommendations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 4 }}>
        {error}
      </Alert>
    );
  }

  // Group lab results by test name for trending
  const testGroups = labResults.reduce((acc, result) => {
    if (!acc[result.test_name]) {
      acc[result.test_name] = [];
    }
    acc[result.test_name].push({
      ...result,
      date: new Date(result.date).toLocaleDateString(),
    });
    return acc;
  }, {} as Record<string, LabResult[]>);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Health Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Lab Results Trends */}
          {Object.entries(testGroups).map(([testName, results]) => (
            <Grid item xs={12} md={6} key={testName}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {testName} Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      name={`${testName} (${results[0]?.unit || ''})`}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          ))}

          {/* Recommendations */}
          {recommendations && (
            <>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Clinician Summary
                  </Typography>
                  <Typography paragraph>
                    {recommendations.clinician_summary}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Recommended Foods
                  </Typography>
                  <ul>
                    {recommendations.recommended_foods.map((food, index) => (
                      <li key={index}>{food}</li>
                    ))}
                  </ul>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Foods to Limit
                  </Typography>
                  <ul>
                    {recommendations.foods_to_limit.map((food, index) => (
                      <li key={index}>{food}</li>
                    ))}
                  </ul>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Self-Care Recommendations
                  </Typography>
                  <ul>
                    {recommendations.self_care_recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Recommended Supplements
                  </Typography>
                  <ul>
                    {recommendations.recommended_supplements.map((supp, index) => (
                      <li key={index}>{supp}</li>
                    ))}
                  </ul>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Recommended Medications
                  </Typography>
                  <ul>
                    {recommendations.recommended_medications.map((med, index) => (
                      <li key={index}>{med}</li>
                    ))}
                  </ul>
                </Paper>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </Container>
  );
} 