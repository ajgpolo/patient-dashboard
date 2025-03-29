import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import Dashboard from './components/Dashboard';
import AdminUpload from './components/AdminUpload';

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

function App() {
  // Hardcoded patient ID for demo purposes
  const demoPatientId = 'DEMO123';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Patient Dashboard
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/admin">
              Admin
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg">
          <Box sx={{ mt: 4 }}>
            <Routes>
              <Route path="/" element={<Dashboard patientId={demoPatientId} />} />
              <Route path="/admin" element={<AdminUpload />} />
            </Routes>
          </Box>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App; 