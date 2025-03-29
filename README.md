# Patient Dashboard

A comprehensive patient dashboard application that analyzes lab results and provides personalized health recommendations. The application includes data visualization, trend analysis, and personalized recommendations based on lab results.

## Features

- CSV file upload for lab results
- Data visualization using Recharts
- Personalized health recommendations including:
  - Clinician summary
  - Recommended foods based on biology
  - Foods to limit
  - Self-care recommendations
  - Recommended supplements and medications
- Separate admin interface for data management
- Modern, responsive UI using Material-UI

## Project Structure

```
patient_dashboard/
├── backend/
│   ├── src/
│   │   └── server.ts
│   ├── data/
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.tsx
    │   │   └── AdminUpload.tsx
    │   ├── App.tsx
    │   └── types/
    ├── public/
    └── package.json
```

## Technology Stack

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - Recharts for data visualization
  - React Router for navigation
  - React Dropzone for file uploads

- Backend:
  - Node.js
  - Express
  - TypeScript
  - CSV parsing
  - Local JSON storage (prepared for Supabase integration)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Usage

1. Access the admin interface at `/admin` to upload lab results
2. Upload CSV files containing lab results (see `backend/sample_data.csv` for format)
3. View the dashboard at `/` to see visualizations and recommendations
4. Lab results will be stored locally in `backend/data/lab_results.json`

## Future Enhancements

- [ ] Supabase integration for data persistence
- [ ] User authentication and authorization
- [ ] More sophisticated lab result analysis
- [ ] Additional data visualizations
- [ ] Patient history tracking
- [ ] Integration with medical databases
- [ ] Export functionality for reports
- [ ] Mobile app version

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 