import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LabResult, PatientRecommendations } from '../types';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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

const CategoryHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(3),
}));

const ResultRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
  },
}));

interface TestResultsProps {
  patientId: string;
}

interface CategoryData {
  title: string;
  biomarkerCount: number;
  outOfRange: number;
  results: LabResult[];
}

export default function TestResults({ patientId }: TestResultsProps) {
  const navigate = useNavigate();
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [recommendations, setRecommendations] = useState<PatientRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultsResponse, recommendationsResponse] = await Promise.all([
          axios.get<LabResult[]>('http://localhost:8000/api/lab-results'),
          axios.get<PatientRecommendations>('http://localhost:8000/api/recommendations'),
        ]);

        setLabResults(resultsResponse.data);
        setRecommendations(recommendationsResponse.data);
        
        // Organize results into categories
        const heartResults = resultsResponse.data.filter((result: LabResult) => 
          result.title.toLowerCase().includes('ldl') || 
          result.title.toLowerCase().includes('hdl') ||
          result.title.toLowerCase().includes('cholesterol')
        );

        const femaleHealthResults = resultsResponse.data.filter((result: LabResult) =>
          result.title.toLowerCase().includes('dhea') ||
          result.title.toLowerCase().includes('hormone') ||
          result.title.toLowerCase().includes('prolactin') ||
          result.title.toLowerCase().includes('testosterone')
        );

        const categories: CategoryData[] = [
          {
            title: 'Female Health',
            biomarkerCount: femaleHealthResults.length,
            outOfRange: femaleHealthResults.filter((r: LabResult) => r.status !== 'normal').length,
            results: femaleHealthResults
          },
          {
            title: 'Heart',
            biomarkerCount: heartResults.length,
            outOfRange: heartResults.filter((r: LabResult) => r.status !== 'normal').length,
            results: heartResults
          }
        ];

        setCategories(categories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  const handleCategoryClick = (category: string) => {
    // For now, just navigate to the first biomarker in the category
    const firstBiomarker = categories.find(c => c.title === category)?.results[0];
    if (firstBiomarker) {
      navigate(`/results/${category.toLowerCase().replace(/\s+/g, '-')}/${firstBiomarker.title.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  const handleBiomarkerClick = (category: string, biomarker: LabResult) => {
    navigate(`/results/${category.toLowerCase().replace(/\s+/g, '-')}/${biomarker.title.toLowerCase().replace(/\s+/g, '-')}`);
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'high':
        return <TrendingUpIcon sx={{ color: '#f44336' }} />;
      case 'low':
        return <TrendingDownIcon sx={{ color: '#ff9800' }} />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Left Column - Test Results */}
        <Grid item xs={12} md={8}>
          <StyledCard>
            <Typography variant="h6" gutterBottom>Test Results</Typography>
            
            {categories.map((category, index) => (
              <React.Fragment key={category.title}>
                {index > 0 && <Divider sx={{ my: 2 }} />}
                <CategoryHeader
                  onClick={() => handleCategoryClick(category.title)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {category.title}
                      <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                        {category.biomarkerCount} Biomarkers · {category.outOfRange} Out of Range
                      </Typography>
                    </Typography>
                  </Box>
                  <ArrowForwardIcon sx={{ color: '#666' }} />
                </CategoryHeader>

                {category.results.map((result) => (
                  <ResultRow
                    key={result.title}
                    onClick={() => handleBiomarkerClick(category.title, result)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Box>
                      <Typography variant="subtitle1">{result.title}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {result.status === 'normal' ? 'In Range' : result.status === 'high' ? 'Above Range' : 'Below Range'} · {result.value} {result.unit}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" color="textSecondary">
                          {result.range}
                        </Typography>
                      </Box>
                      {getStatusIcon(result.status)}
                    </Box>
                  </ResultRow>
                ))}
              </React.Fragment>
            ))}
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