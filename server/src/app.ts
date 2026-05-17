import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app: Express = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// enable cors
app.use(cors());
// app.options('*', cors()); // Express 5.x has issues with '*' wildcard in some contexts, and cors() already handles preflight


app.get('/', (req, res) => {
  res.send({ message: 'Server is running' });
});

export default app;
