import './config/env';

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import employeeRoutes from './routes/employee.routes';
import customerRoutes from './routes/customer.routes';
const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'WorkFlowX API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/customers', customerRoutes);
app.listen(PORT, () => {
  console.log('WorkFlowX server running on http://localhost:' + PORT);
});