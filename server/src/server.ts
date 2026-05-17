import app from './app';
import { config } from './config/config';
import connectDB from './config/database';

const startServer = async () => {
  await connectDB();
  
  app.listen(config.port, () => {
    const baseUrl = `http://localhost:${config.port}`;
    const swaggerUrl = `${baseUrl}/api-docs`;

    console.log('\n================================================');
    console.log('🚀 Server running successfully');
    console.log(`🌐 Backend: ${baseUrl}`);
    console.log(`📘 Swagger Docs: ${swaggerUrl}`);
    console.log('================================================\n');
  });
};

startServer();
