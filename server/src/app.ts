import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import routes from './routes/v1';
import swaggerOptions from './config/swagger';
import { errorConverter, errorHandler } from './middlewares/error.middleware';
import httpStatus from 'http-status';
import ApiError from './utils/ApiError';

const app: Express = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// enable cors
app.use(cors());

// Swagger UI
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// v1 api routes
app.use('/api/v1', routes);

app.get('/', (req, res) => {
  res.send({ message: 'Server is running', swagger: '/api-docs' });
});

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Route not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
