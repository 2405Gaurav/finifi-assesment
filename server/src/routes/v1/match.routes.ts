import express from 'express';
import { getMatchByPoNumber } from '../../controllers/match.controller';


const router = express.Router();

router.get('/:poNumber', getMatchByPoNumber);

export default router;
