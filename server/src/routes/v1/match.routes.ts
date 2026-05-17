import express from 'express';
import { getMatchByPoNumber } from '../../controllers/match.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Matching
 *   description: Three-way matching results and analysis
 */

/**
 * @swagger
 * /match/{poNumber}:
 *   get:
 *     summary: Get three-way match results for a specific PO
 *     description: Retrieves the latest recomputed matching state for a given Purchase Order number.
 *     tags: [Matching]
 *     parameters:
 *       - in: path
 *         name: poNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The Purchase Order number to retrieve matching results for
 *         example: "PO-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved matching result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean', example: true }
 *                 data: { $ref: '#/components/schemas/MatchResult' }
 *       400:
 *         description: Missing PO number
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: No matching results found for the provided PO number
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:poNumber', getMatchByPoNumber);

export default router;
