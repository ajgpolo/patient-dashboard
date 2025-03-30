import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LabResult, PatientRecommendations } from '../types';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import FeedbackIcon from '@mui/icons-material/Feedback';
import axios from 'axios';

const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  backgroundColor: '#ffffff',
}));

const ActionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  borderRadius: theme.spacing(2),
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
  },
}));

interface BiologicalAge {
  biologicalAge: number;
  chronologicalAge: number;
  analysis: string;
}

interface DashboardProps {
  patientId: string;
}

export default function Dashboard({ patientId }: DashboardProps) {
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [recommendations, setRecommendations] = useState<PatientRecommendations | null>(null);
  const [biologicalAge, setBiologicalAge] = useState<BiologicalAge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultsResponse, recommendationsResponse, bioAgeResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/lab-results'),
          axios.get('http://localhost:8000/api/recommendations'),
          axios.get('http://localhost:8000/api/biological-age')
        ]);

        setLabResults(resultsResponse.data);
        setRecommendations(recommendationsResponse.data);
        setBiologicalAge(bioAgeResponse.data);
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

  const normalResults = labResults.filter(result => result.status === 'normal').length;
  const outOfRangeResults = labResults.filter(result => result.status !== 'normal').length;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Upcoming Lab Visit */}
          <StyledCard sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="h6">Upcoming Lab Visit</Typography>
              <ArrowForwardIcon />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ 
                width: 100, 
                height: 100, 
                bgcolor: '#f5f5f5', 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <LocationOnIcon sx={{ color: '#ff4444', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Annual Lab Visit (1 of 2)</Typography>
                <Typography variant="h6" sx={{ my: 0.5 }}>Wed, Mar 28, 2024</Typography>
                <Typography variant="body2">9:15 AM — Quest Diagnostics</Typography>
                <Typography variant="body2" color="textSecondary">2148 Patterson Road, New York</Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="subtitle2">Appointment Code</Typography>
              <Typography variant="h4" sx={{ fontFamily: 'monospace', mt: 0.5 }}>VNGBAQ</Typography>
            </Box>
          </StyledCard>

          {/* Biological Age */}
          <StyledCard sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Biological Age Analysis</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, my: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                  {biologicalAge?.biologicalAge || '-'}
                </Typography>
                <Typography variant="body2" color="textSecondary">Biological Age</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                  {biologicalAge?.chronologicalAge || '-'}
                </Typography>
                <Typography variant="body2" color="textSecondary">Chronological Age</Typography>
              </Box>
            </Box>
            <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 2 }}>
              <Typography variant="body2" color="textSecondary">
                {biologicalAge?.analysis || 'Upload lab results to see your biological age analysis.'}
              </Typography>
            </Box>
            <Button variant="text" size="small" sx={{ mt: 1 }}>View detailed analysis</Button>
          </StyledCard>

          {/* All Biomarkers */}
          <StyledCard>
            <Typography variant="h6" gutterBottom>All Biomarkers</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ color: '#4caf50' }}>{normalResults}</Typography>
                <Typography variant="body2" color="textSecondary">In Range</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ color: '#ff9800' }}>{outOfRangeResults}</Typography>
                <Typography variant="body2" color="textSecondary">Out of Range</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ color: '#2196f3' }}>12</Typography>
                <Typography variant="body2" color="textSecondary">Improving</Typography>
              </Box>
            </Box>
            <Button variant="outlined" size="small" fullWidth>View all</Button>
          </StyledCard>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <Typography variant="h6" gutterBottom>Your Action Plan</Typography>
            
            {/* Foods Section */}
            <ActionCard>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <RestaurantIcon />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1">Foods</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {recommendations?.recommended_foods.slice(0, 3).join(', ')}...
                  </Typography>
                </Box>
                <ArrowForwardIcon />
              </CardContent>
            </ActionCard>

            {/* Supplements Section */}
            <ActionCard>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <LocalPharmacyIcon />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1">Supplements</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {recommendations?.recommended_supplements.slice(0, 3).join(', ')}...
                  </Typography>
                </Box>
                <ArrowForwardIcon />
              </CardContent>
            </ActionCard>

            {/* Feedback Section */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>How are we doing?</Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Please take a moment to tell us how we can make this experience better for you.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                size="small"
                startIcon={<FeedbackIcon />}
                sx={{ mt: 1.5 }}
              >
                Share Feedback
              </Button>
            </Box>
          </StyledCard>
        </Grid>
      </Grid>
    </Container>
  );
} 