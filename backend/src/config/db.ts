import {Pool} from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  },
    connectionTimeoutMillis: 10000,
    
});


export const query = (text: string, params?: (string | number | boolean | null | Date)[]) => pool.query(text, params);