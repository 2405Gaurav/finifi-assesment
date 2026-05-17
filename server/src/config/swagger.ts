import { Options } from 'swagger-jsdoc';
import { config } from './config';

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finifi Three-Way Match Engine API',
      version: '1.0.0',
      description: 'API documentation for the Finifi Three-Way Match Engine backend.',
      contact: {
        name: 'API Support',
        email: 'support@finifi.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error message description' },
          },
        },
        DocumentItem: {
          type: 'object',
          properties: {
            itemCode: { type: 'string', example: 'ITEM-001' },
            description: { type: 'string', example: 'Widget description' },
            quantity: { type: 'number', example: 100 },
          },
        },
        Document: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d5ecb84f10400015a68888' },
            documentType: { type: 'string', enum: ['po', 'grn', 'invoice'], example: 'po' },
            poNumber: { type: 'string', example: 'PO-12345' },
            documentNumber: { type: 'string', example: 'PO-12345' },
            documentDate: { type: 'string', format: 'date-time' },
            vendorName: { type: 'string', example: 'ACME Corp' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/DocumentItem' },
            },
            processingStatus: { type: 'string', enum: ['pending', 'processed', 'failed'], example: 'processed' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        MatchResult: {
          type: 'object',
          properties: {
            poNumber: { type: 'string', example: 'PO-12345' },
            status: { type: 'string', enum: ['matched', 'partially_matched', 'mismatch', 'insufficient_documents'], example: 'matched' },
            mismatchReasons: {
              type: 'array',
              items: { type: 'string' },
              example: ['grn_qty_exceeds_po_qty'],
            },
            itemResults: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  itemCode: { type: 'string' },
                  description: { type: 'string' },
                  poQuantity: { type: 'number' },
                  totalGrnQuantity: { type: 'number' },
                  totalInvoiceQuantity: { type: 'number' },
                  status: { type: 'string' },
                  reasons: { type: 'array', items: { type: 'string' } },
                },
              },
            },
            lastMatchedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/v1/*.ts', './src/models/*.ts'], // Path to the API docs
};

export default swaggerOptions;
