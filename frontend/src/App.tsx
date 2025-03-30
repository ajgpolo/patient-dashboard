import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Box, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Dashboard from './components/Dashboard';
import TestResults from './components/TestResults';
import AdminUpload from './components/AdminUpload';
import BiomarkerDetail from './components/BiomarkerDetail';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function NavButton({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Button
      component={Link}
      to={to}
      sx={{
        color: isActive ? '#2196f3' : '#666',
        borderRadius: 2,
        px: 2,
        backgroundColor: isActive ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
        '&:hover': {
          backgroundColor: isActive ? 'rgba(33, 150, 243, 0.12)' : 'rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      {children}
    </Button>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static" sx={{ backgroundColor: '#fff', boxShadow: 1 }}>
          <Container maxWidth="lg">
            <Toolbar disableGutters>
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{
                  mr: 4,
                  color: '#2196f3',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                Patient Dashboard
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <NavButton to="/">Overview</NavButton>
                <NavButton to="/results">Test Results</NavButton>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <NavButton to="/admin">Admin</NavButton>
            </Toolbar>
          </Container>
        </AppBar>

        <Container maxWidth="lg">
          <Box sx={{ mt: 4 }}>
            <Routes>
              <Route path="/" element={<Dashboard patientId="123" />} />
              <Route path="/results" element={<TestResults patientId="123" />} />
              <Route path="/results/:category/:biomarker" element={<BiomarkerDetail />} />
              <Route path="/admin" element={<AdminUpload />} />
            </Routes>
          </Box>
        </Container>
      </Router>
    </ThemeProvider>
  );
} 