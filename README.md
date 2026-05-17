# Finifi Three-Way Match Engine

A comprehensive full-stack solution for validating Purchase Orders (PO), Goods Receipt Notes (GRN), and Invoices using AI-powered extraction and a robust three-way matching logic.

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd server
npm install
# Add your MONGO_URI and GEMINI_API_KEY to .env
npm run dev
```
For detailed backend documentation, including API endpoints and architecture, see the [Backend README](./server/README.md).

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## ✨ Core Features

- **AI-Powered Extraction:** Uses Gemini 2.5 Flash to parse complex PDF structures into clean JSON data.
- **Three-Way Matching:** Real-time validation across PO, GRN, and Invoice quantities and item codes.
- **Persistence:** All documents and match results are stored in MongoDB for reliability.
- **Responsive UI:** A modern, clean dashboard built with React, Tailwind CSS, and Lucide icons.

---

## 🎁 Bonus Features (Beyond Requirements)

### 1. Session History & Snapshots
- **Save Sessions:** Every successful processing run is saved as a "Session Snapshot".
- **Reopen Results:** Users can reopen previous results from the "Saved Sessions" panel without re-uploading PDFs.
- **Lightweight Storage:** We only store the extracted values and match results per session, not the heavy PDF files.
- **Pagination:** The session history is fully paginated to handle hundreds of previous matches efficiently.

### 2. Robust Rate Limiting
- **General Protection:** Standard API endpoints are protected by an in-memory rate limiter (120 requests / 15 min).
- **Upload Protection:** Resource-intensive PDF processing is strictly limited (20 uploads / 15 min) to prevent abuse and manage AI costs.

### 3. Enhanced Error Transparency
- **Humorous Alerts:** When the AI fails or hits limits, users see a friendly "AI is resting" message.
- **Full Debug Info:** Developers can expand the error alert to see the full raw Gemini response or system error.

---

## 🛠 Tech Stack

- **Frontend:** React, Vite, Zustand (State Management), Tailwind CSS, Lucide Icons.
- **Backend:** Node.js, Express, MongoDB (Mongoose), Gemini AI API.
- **Validation:** Joi (Request Validation), Multer (File Handling).

---

## 📖 Additional Documentation

- [Backend Documentation](./server/README.md) - Deep dive into matching logic and API spec.
- [Matching Service](./server/src/services/matching.service.ts) - The core logic for 3-way validation.
- [Gemini Service](./server/src/services/gemini.service.ts) - AI prompt engineering and parsing logic.
