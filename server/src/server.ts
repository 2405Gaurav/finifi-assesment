import app from './app';
import { config } from './config/config';
import connectDB from './config/database';

const startServer = async () => {
  await connectDB();
  
  const server = app.listen(config.port, () => {
    const baseUrl = `http://localhost:${config.port}`;
    const swaggerUrl = `${baseUrl}/api-docs`;

    console.log('\n================================================');
    console.log('🚀 Server running successfully');
    console.log(`🌐 Backend: ${baseUrl}`);
    console.log(`📘 Swagger Docs: ${swaggerUrl}`);
    console.log('================================================\n');
  });

  // Increase server timeout to 2 minutes for processing large PDFs/AI calls
  server.timeout = 120000;
};

startServer();
