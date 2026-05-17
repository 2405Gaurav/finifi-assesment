import app from './app';
import { config } from './config/config';
import connectDB from './config/database';

const startServer = async () => {
  await connectDB();
  
  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
};

startServer();


