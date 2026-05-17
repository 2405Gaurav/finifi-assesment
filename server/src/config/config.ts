import dotenv from 'dotenv';

dotenv.config(); 

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongoose: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/finifi',
    options: {},
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};
