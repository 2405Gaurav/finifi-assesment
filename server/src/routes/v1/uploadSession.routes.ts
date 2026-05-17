import express from 'express';
import { getUploadSession, getUploadSessions } from '../../controllers/uploadSession.controller';
import { validate } from '../../middlewares/validate.middleware';
import { uploadSessionValidators } from '../../validators/document.validator';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Saved upload session snapshots
 */

router.get('/', validate(uploadSessionValidators.listSessions), getUploadSessions);
router.get('/:id', validate(uploadSessionValidators.getSession), getUploadSession);

export default router;
