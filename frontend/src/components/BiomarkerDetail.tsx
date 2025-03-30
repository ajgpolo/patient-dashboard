import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BlockIcon from '@mui/icons-material/Block';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import WarningIcon from '@mui/icons-material/Warning';
import ScienceIcon from '@mui/icons-material/Science';
import ArticleIcon from '@mui/icons-material/Article';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: '#ffffff',
  marginBottom: theme.spacing(3),
}));

const RangeIndicator = styled(Box)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: '#f5f5f5',
  position: 'relative',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
}));

const RangeMarker = styled(Box)<{ value: number }>(({ theme, value }) => ({
  width: 16,
  height: 16,
  borderRadius: '50%',
  backgroundColor: '#2196f3',
  position: 'absolute',
  top: '50%',
  left: `${value}%`,
  transform: 'translate(-50%, -50%)',
  border: '2px solid #fff',
  boxShadow: theme.shadows[2],
}));

interface BiomarkerData {
  title: string;
  value: number;
  unit: string;
  range: string;
  status: string;
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

interface DotProps {
  cx: number;
  cy: number;
  payload: {
    value: number;
  };
}

export default function BiomarkerDetail() {
  const { category, biomarker } = useParams<{ category: string; biomarker: string }>();
  const [data, setData] = useState<BiomarkerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('whyItMatters');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data for:', { category, biomarker });
        const response = await axios.get(`http://localhost:8000/api/biomarker/${category}/${biomarker}`);
        console.log('API Response:', response.data);
        setData(response.data);
      } catch (err) {
        console.error('Error fetching biomarker data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, biomarker]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Alert severity="error" sx={{ mb: 4 }}>
        {error || 'Failed to load biomarker data'}
      </Alert>
    );
  }

  const handleSectionToggle = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Parse the range values
  const [minRange, maxRange] = data.range.split('-').map(num => parseFloat(num.trim()));

  // Prepare chart data
  const chartData = data.history.map(point => ({
    date: point.date,
    value: point.value,
  }));

  // Get status color
  const getStatusColor = (value: number) => {
    if (value < minRange) return '#ff9800'; // Below range - orange
    if (value > maxRange) return '#f44336'; // Above range - red
    return '#4caf50'; // In range - green
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="textSecondary">
          {category}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          /
        </Typography>
        <Typography variant="body2">
          {data.title}
        </Typography>
      </Box>

      {/* Main Biomarker Card */}
      <StyledCard>
        <Typography variant="h5" gutterBottom>
          {data.title}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {data.description}
        </Typography>

        {/* Value and Chart in Two Columns */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 2fr',
          gap: 4,
          mt: 4, 
          mb: 4,
          alignItems: 'center'
        }}>
          {/* Left Column - Value and Range */}
          <Box>
            <Typography variant="h3" sx={{ color: getStatusColor(data.value), fontWeight: 'bold', mb: 1 }}>
              {data.value}
              <Typography component="span" variant="h6" color="textSecondary" sx={{ ml: 1 }}>
                {data.unit}
              </Typography>
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 0.5 }}>
              Range: {data.range} {data.unit}
            </Typography>
            <Typography variant="body1" sx={{ color: getStatusColor(data.value), fontWeight: 'medium' }}>
              Status: {data.status}
            </Typography>
          </Box>

          {/* Right Column - Chart */}
          <Box sx={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                  }}
                />
                <YAxis 
                  domain={[
                    Math.min(minRange * 0.8, Math.min(...chartData.map(d => d.value))), 
                    Math.max(maxRange * 1.2, Math.max(...chartData.map(d => d.value)))
                  ]} 
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} ${data.unit}`, data.title]}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                  }}
                />
                {/* Background zones */}
                <rect
                  x="0%"
                  y="0%"
                  width="100%"
                  height={`${(100 * (minRange - Math.min(minRange * 0.8, Math.min(...chartData.map(d => d.value))))) / 
                    (Math.max(maxRange * 1.2, Math.max(...chartData.map(d => d.value))) - 
                     Math.min(minRange * 0.8, Math.min(...chartData.map(d => d.value))))}%`}
                  fill="#ffebee"
                  fillOpacity="0.3"
                />
                <rect
                  x="0%"
                  y={`${(100 * (minRange - Math.min(minRange * 0.8, Math.min(...chartData.map(d => d.value))))) / 
                    (Math.max(maxRange * 1.2, Math.max(...chartData.map(d => d.value))) - 
                     Math.min(minRange * 0.8, Math.min(...chartData.map(d => d.value))))}%`}
                  width="100%"
                  height={`${(100 * (maxRange - minRange)) / 
                    (Math.max(maxRange * 1.2, Math.max(...chartData.map(d => d.value))) - 
                     Math.min(minRange * 0.8, Math.min(...chartData.map(d => d.value))))}%`}
                  fill="#e8f5e9"
                  fillOpacity="0.3"
                />
                <rect
                  x="0%"
                  y={`${(100 * (maxRange - Math.min(minRange * 0.8, Math.min(...chartData.map(d => d.value))))) / 
                    (Math.max(maxRange * 1.2, Math.max(...chartData.map(d => d.value))) - 
                     Math.min(minRange * 0.8, Math.min(...chartData.map(d => d.value))))}%`}
                  width="100%"
                  height="100%"
                  fill="#ffebee"
                  fillOpacity="0.3"
                />
                <Line 
                  type="linear"
                  dataKey="value" 
                  stroke="#2196f3" 
                  strokeWidth={2}
                  dot={({ cx, cy, payload }) => {
                    const value = payload.value as number;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={value >= minRange && value <= maxRange ? '#4caf50' : '#f44336'}
                        stroke="white"
                        strokeWidth={2}
                      />
                    );
                  }}
                  activeDot={({ cx, cy, payload }) => {
                    const value = payload.value as number;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill={value >= minRange && value <= maxRange ? '#4caf50' : '#f44336'}
                        stroke="white"
                        strokeWidth={2}
                      />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </StyledCard>

      {/* Information Sections */}
      <StyledCard>
        {/* Why it matters */}
        <Button
          fullWidth
          onClick={() => handleSectionToggle('whyItMatters')}
          sx={{ justifyContent: 'space-between', mb: 1 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpOutlineIcon sx={{ mr: 1 }} />
            <Typography>Why it matters?</Typography>
          </Box>
          {expandedSection === 'whyItMatters' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Button>
        <Collapse in={expandedSection === 'whyItMatters'}>
          <Typography variant="body2" sx={{ pl: 4, pr: 2, pb: 2 }}>
            {data.whyItMatters}
          </Typography>
        </Collapse>
        <Divider />

        {/* Causes */}
        <Button
          fullWidth
          onClick={() => handleSectionToggle('causes')}
          sx={{ justifyContent: 'space-between', mt: 1, mb: 1 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ mr: 1 }} />
            <Typography>Causes</Typography>
          </Box>
          {expandedSection === 'causes' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Button>
        <Collapse in={expandedSection === 'causes'}>
          <List dense sx={{ pl: 3 }}>
            {data.causes.map((cause, index) => (
              <ListItem key={index}>
                <ListItemText primary={cause} />
              </ListItem>
            ))}
          </List>
        </Collapse>
        <Divider />

        {/* Foods to eat */}
        <Button
          fullWidth
          onClick={() => handleSectionToggle('foodsToEat')}
          sx={{ justifyContent: 'space-between', mt: 1, mb: 1 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RestaurantIcon sx={{ mr: 1 }} />
            <Typography>Foods to eat</Typography>
          </Box>
          {expandedSection === 'foodsToEat' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Button>
        <Collapse in={expandedSection === 'foodsToEat'}>
          <List dense sx={{ pl: 3 }}>
            {data.foodsToEat.map((food, index) => (
              <ListItem key={index}>
                <ListItemText primary={food} />
              </ListItem>
            ))}
          </List>
        </Collapse>
        <Divider />

        {/* Foods to limit */}
        <Button
          fullWidth
          onClick={() => handleSectionToggle('foodsToLimit')}
          sx={{ justifyContent: 'space-between', mt: 1, mb: 1 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BlockIcon sx={{ mr: 1 }} />
            <Typography>Foods to limit</Typography>
          </Box>
          {expandedSection === 'foodsToLimit' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Button>
        <Collapse in={expandedSection === 'foodsToLimit'}>
          <List dense sx={{ pl: 3 }}>
            {data.foodsToLimit.map((food, index) => (
              <ListItem key={index}>
                <ListItemText primary={food} />
              </ListItem>
            ))}
          </List>
        </Collapse>
        <Divider />

        {/* Supplements */}
        <Button
          fullWidth
          onClick={() => handleSectionToggle('supplements')}
          sx={{ justifyContent: 'space-between', mt: 1, mb: 1 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalPharmacyIcon sx={{ mr: 1 }} />
            <Typography>Supplements</Typography>
          </Box>
          {expandedSection === 'supplements' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Button>
        <Collapse in={expandedSection === 'supplements'}>
          <List dense sx={{ pl: 3 }}>
            {data.supplements.map((supplement, index) => (
              <ListItem key={index}>
                <ListItemText primary={supplement} />
              </ListItem>
            ))}
          </List>
        </Collapse>
        <Divider />

        {/* Additional tests */}
        <Button
          fullWidth
          onClick={() => handleSectionToggle('additionalTests')}
          sx={{ justifyContent: 'space-between', mt: 1, mb: 1 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ScienceIcon sx={{ mr: 1 }} />
            <Typography>Additional tests</Typography>
          </Box>
          {expandedSection === 'additionalTests' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Button>
        <Collapse in={expandedSection === 'additionalTests'}>
          <List dense sx={{ pl: 3 }}>
            {data.additionalTests.map((test, index) => (
              <ListItem key={index}>
                <ListItemText primary={test} />
              </ListItem>
            ))}
          </List>
        </Collapse>
        <Divider />

        {/* Sources */}
        <Button
          fullWidth
          onClick={() => handleSectionToggle('sources')}
          sx={{ justifyContent: 'space-between', mt: 1, mb: 1 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ArticleIcon sx={{ mr: 1 }} />
            <Typography>Sources</Typography>
          </Box>
          {expandedSection === 'sources' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Button>
        <Collapse in={expandedSection === 'sources'}>
          <List dense sx={{ pl: 3 }}>
            {data.sources.map((source, index) => (
              <ListItem key={index}>
                <ListItemText primary={source} />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </StyledCard>
    </Container>
  );
} 