import express from 'express';
import documentRoutes from './document.routes';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/documents',
    route: documentRoutes,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
