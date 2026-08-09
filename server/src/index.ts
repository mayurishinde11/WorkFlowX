import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req: Request, res: Response) => {  res.json({
    success: true,
    message: 'WorkFlowX API is running',
  });
});

app.listen(PORT, () => {
  console.log('WorkFlowX server running on http://localhost:' + PORT);
});