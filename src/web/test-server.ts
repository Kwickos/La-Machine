import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.WEB_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mock stats endpoint for testing
app.get('/api/stats/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      briefs: { total: 42, published: 35 },
      submissions: { total: 128 },
      engagement: { average: 75 },
      topContributors: [
        { username: 'Alice', submissions: 15 },
        { username: 'Bob', submissions: 12 },
        { username: 'Charlie', submissions: 8 }
      ]
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});