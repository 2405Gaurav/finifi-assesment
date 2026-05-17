import express from 'express';
import documentRoutes from './document.routes';
import matchRoutes from './match.routes';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/documents',
    route: documentRoutes,
  },
  {
    path: '/match',
    route: matchRoutes,
  },
];


defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
