import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface PreviewData {
  test_name: string;
  value: number;
  unit: string;
  reference_range: string;
  date: string;
  patient_id: string;
}

export default function AdminUpload() {
  const [previewData, setPreviewData] = useState<PreviewData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/admin/upload-lab-results', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      setSuccess(`Successfully uploaded ${result.count} lab results`);
      
      // Reset preview after successful upload
      setPreviewData([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Upload Lab Results
      </Typography>

      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          mb: 4,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive
            ? 'Drop the CSV file here'
            : 'Drag and drop a CSV file here, or click to select'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Only CSV files are accepted
        </Typography>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 4 }}>
          {success}
        </Alert>
      )}

      {previewData.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Test Name</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Reference Range</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Patient ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {previewData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.test_name}</TableCell>
                  <TableCell>{row.value}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell>{row.reference_range}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.patient_id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
} 