import * as dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import { supabase } from './supabase';
import tracksRouter from './tracksRouter';
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.get('/', (req: Request, res: Response) => {
    const status = supabase ? 'Supabase Ready' : 'Supabase Client Failed to Initialize';
    res.status(200).send(`Express Server is Running and ${status}.`);
});
app.use('/api/tracks', tracksRouter);
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
