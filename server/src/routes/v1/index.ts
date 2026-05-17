import express from 'express';
import documentRoutes from './document.routes';
import matchRoutes from './match.routes';
import uploadSessionRoutes from './uploadSession.routes';
import { generalApiRateLimiter } from '../../middlewares/rateLimit.middleware';

const router = express.Router();

// Apply general rate limiter to all v1 routes
router.use(generalApiRateLimiter);

const defaultRoutes = [
  {
    path: '/documents',
    route: documentRoutes,
  },
  {
    path: '/match',
    route: matchRoutes,
  },
  {
    path: '/sessions',
    route: uploadSessionRoutes,
  },
];


defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
