import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import UploadSessionModel from './src/models/uploadSession.model';
import { MatchStatus } from './src/models/matchResult.model';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/finifi';

const seedData: any[] = [
  {
    poNumber: 'CI4PO05788',
    title: 'CI4PO05788 - Sample Session',
    documents: {
      po: {
        documentType: 'po' as const,
        poNumber: 'CI4PO05788',
        documentNumber: 'CI4PO05788',
        documentDate: new Date('2026-03-17'),
        vendorName: 'M/s AFP',
        items: [
          { itemCode: '11423', description: 'Cheesy Spicy Veg Momos 24 Pieces', quantity: 50 },
          { itemCode: '11797', description: 'Meatigo Hot Wings 250g', quantity: 75 },
          { itemCode: '18003', description: 'Meatigo Chicken Curry Cut Skinless Frozen 450g', quantity: 120 },
          { itemCode: '18004', description: 'Meatigo Chicken Boneless Breast Frozen 450g', quantity: 540 },
          { itemCode: '33390', description: 'Chicken Seekh Kebab 500g', quantity: 272 },
        ],
      },
      grn: {
        documentType: 'grn' as const,
        poNumber: 'CI4PO05788',
        documentNumber: 'CI4000020234',
        documentDate: new Date('2026-03-24'),
        vendorName: 'M/s AFP',
        items: [
          { itemCode: '11423', description: 'Spicy Veg Momos 24 Pieces', quantity: 50 },
          { itemCode: '11797', description: 'Meatigo Hot Wings 250g', quantity: 75 },
          { itemCode: '18003', description: 'Meatigo Chicken Curry Cut Skinless Frozen 450g', quantity: 30 },
          { itemCode: '18004', description: 'Meatigo Chicken Boneless Breast Frozen 450g', quantity: 30 },
        ],
      },
      invoice: {
        documentType: 'invoice' as const,
        poNumber: 'CI4PO05788',
        documentNumber: 'IN25MH2504251',
        documentDate: new Date('2026-03-24'),
        vendorName: 'Ample Foods Private',
        items: [
          { itemCode: 'FG-P-F-0503', description: 'Cheesy Spicy Vegetable Momos 24 Pcs', quantity: 50 },
          { itemCode: 'FG-M-F-1703', description: 'Meatigo Hot Wings 250g', quantity: 75 },
          { itemCode: 'FG-M-F-0620', description: 'Meatigo Chicken Curry Cuts 450g', quantity: 30 },
          { itemCode: 'FG-M-F-0619', description: 'Meatigo Chicken Boneless Breast 450g', quantity: 30 },
        ],
      },
    },
    matchResult: {
      status: MatchStatus.PARTIALLY_MATCHED,
      mismatchReasons: [],
      itemResults: [
        {
          itemCode: '11423',
          description: 'Cheesy Spicy Veg Momos 24 Pieces',
          poQuantity: 50,
          totalGrnQuantity: 50,
          totalInvoiceQuantity: 50,
          status: MatchStatus.MATCHED,
          reasons: [],
        },
        {
          itemCode: '11797',
          description: 'Meatigo Hot Wings 250g',
          poQuantity: 75,
          totalGrnQuantity: 75,
          totalInvoiceQuantity: 75,
          status: MatchStatus.MATCHED,
          reasons: [],
        },
        {
          itemCode: '18003',
          description: 'Meatigo Chicken Curry Cut Skinless Frozen 450g',
          poQuantity: 120,
          totalGrnQuantity: 30,
          totalInvoiceQuantity: 30,
          status: MatchStatus.PARTIALLY_MATCHED,
          reasons: [],
        },
        {
          itemCode: '18004',
          description: 'Meatigo Chicken Boneless Breast Frozen 450g',
          poQuantity: 540,
          totalGrnQuantity: 30,
          totalInvoiceQuantity: 30,
          status: MatchStatus.PARTIALLY_MATCHED,
          reasons: [],
        },
      ],
      lastMatchedAt: new Date(),
    },
  },
];

const seed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URL);
    console.log('Connected.');

    console.log('Cleaning existing sessions...');
    await UploadSessionModel.deleteMany({ poNumber: 'CI4PO05788' });

    console.log('Seeding sample session...');
    for (const data of seedData) {
      await UploadSessionModel.create(data);
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
