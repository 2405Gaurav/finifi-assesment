# Three-Way Match Engine Backend

A production-grade Node.js backend for matching Purchase Orders (PO), Goods Receipt Notes (GRN), and Invoices using AI-powered extraction.

## 🚀 Overview

This service automates the procurement reconciliation process by:
1.  Extracting structured data from PDF documents using **Gemini 2.5 Flash**.
2.  Storing documents independently in **MongoDB**.
3.  Recomputing a **Three-Way Match** whenever new documents arrive, regardless of order.

## 🛠️ Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express with TypeScript
-   **Database**: MongoDB (Mongoose)
-   **AI**: Google Generative AI (Gemini 2.5 Flash)
-   **PDF Engine**: `unpdf` (robust PDF text extraction)
-   **Validation**: Zod
-   **Documentation**: Swagger/OpenAPI 3.0

## 📐 Architecture

The project follows a **Clean Architecture** pattern:
-   **Controllers**: Handle HTTP requests and response orchestration.
-   **Services**: Encapsulate business logic (Matching Engine, AI Parsing, Persistence).
-   **Models**: Define data structures and MongoDB schemas.
-   **Middlewares**: Handle cross-cutting concerns like File Uploads, Error Handling, and Validation.

### **Matching Logic & Strategy**

-   **Item Matching Key**: We use `itemCode` (or SKU) as the primary key for matching items across documents. This is chosen because item descriptions often vary between vendors and internal systems, while codes remain consistent.
-   **Aggregation**: Quantities are aggregated by `itemCode` across all linked GRNs and Invoices for a specific PO.
-   **Out-of-Order Handling**: Every upload triggers a **Full Recalculation**. We fetch all documents linked to the `poNumber` and re-run the engine. This ensures the match state is always correct, even if an Invoice is uploaded before a PO.

### **Matching Rules**
1.  **Rule 1**: Total GRN quantity must not exceed PO quantity.
2.  **Rule 2**: Total Invoice quantity must not exceed total GRN quantity.
3.  **Rule 3**: Total Invoice quantity must not exceed PO quantity.
4.  **Rule 4**: Invoice date must not be after the PO date.

## 🚦 API Endpoints

### **Documents**
-   `POST /api/v1/documents/process`: Upload PO, GRN, and Invoice PDFs concurrently.
-   `POST /api/v1/documents/upload`: Upload a single PDF by type (`po`, `grn`, `invoice`).
-   `GET /api/v1/documents/:id`: Retrieve a specific parsed document.

### **Matching**
-   `GET /api/v1/match/:poNumber`: Get the latest matching state and mismatch reasons for a PO.

### **Documentation**
-   `GET /api-docs`: Interactive Swagger UI documentation.

## 🛠️ Setup & Installation

1.  **Clone the repo**.
2.  **Install dependencies**:
    ```bash
    cd server
    npm install
    ```
3.  **Configure Environment**: Create a `.env` file in the `server` directory:
    ```env
    PORT=5000
    MONGODB_URL=your_mongodb_uri
    GEMINI_API_KEY=your_google_ai_key
    NODE_ENV=development
    ```
4.  **Build & Run**:
    ```bash
    npm run build
    npm start
    ```

## 🧪 Testing

-   Use the **Swagger UI** at `http://localhost:5000/api-docs` to test endpoints directly.
-   A sample Postman collection is also provided in the repository.

## 📝 Assumptions & Tradeoffs

-   **Assumption**: Each document contains a clearly identifiable PO Number used for linking.
-   **Tradeoff**: We recompute the full match state on every upload. While slightly more expensive than incremental updates, it guarantees 100% accuracy for out-of-order arrivals in a low-to-medium volume environment.
-   **AI Parsing**: We use Gemini 2.5 Flash for high-speed, cost-effective extraction. Rare extraction failures are handled via validation errors and descriptive logs.
