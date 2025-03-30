import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Box, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LabResult } from '../types';

interface UploadResponse {
  message: string;
  count: number;
  results: LabResult[];
}

const DropzoneContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  border: `2px dashed ${theme.palette.primary.main}`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const AdminUpload: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<{
    loading: boolean;
    error: string | null;
    success: boolean;
    results?: LabResult[];
  }>({
    loading: false,
    error: null,
    success: false,
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (file.type !== 'text/csv') {
      setUploadStatus({
        loading: false,
        error: 'Please upload a CSV file',
        success: false,
      });
      return;
    }

    setUploadStatus({
      loading: true,
      error: null,
      success: false,
    });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<UploadResponse>(
        'http://localhost:8000/api/admin/upload-lab-results',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setUploadStatus({
        loading: false,
        error: null,
        success: true,
        results: response.data.results,
      });
    } catch (error) {
      setUploadStatus({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to upload file',
        success: false,
      });
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
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Upload Lab Results
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        Please upload a CSV file with the following columns:
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" component="div">
          <ul>
            <li>Column 1: Lab Title</li>
            <li>Column 2: Lab Value (numeric)</li>
            <li>Column 3: Normal/Healthy Range (e.g., "10-20")</li>
          </ul>
        </Typography>
      </Box>

      <DropzoneContainer {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography>Drop the CSV file here...</Typography>
        ) : (
          <Typography>Drag and drop a CSV file here, or click to select one</Typography>
        )}
      </DropzoneContainer>

      {uploadStatus.loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {uploadStatus.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {uploadStatus.error}
        </Alert>
      )}

      {uploadStatus.success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Successfully uploaded {uploadStatus.results?.length} lab results!
        </Alert>
      )}

      {uploadStatus.success && uploadStatus.results && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Results Preview:
          </Typography>
          <Paper sx={{ p: 2 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Lab Title</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Value</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Range</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {uploadStatus.results.map((result, index) => (
                  <tr key={index}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{result.title}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{result.value}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{result.range}</td>
                    <td style={{ 
                      padding: '8px', 
                      borderBottom: '1px solid #ddd',
                      color: result.status === 'normal' ? 'green' : result.status === 'high' ? 'red' : 'orange'
                    }}>
                      {result.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default AdminUpload; 