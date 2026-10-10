import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './src/config/db.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

connectDB();

import briefRoutes from './src/routes/briefRoutes.js';

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'RaahX API is healthy' });
});

app.use('/api/brief', briefRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
