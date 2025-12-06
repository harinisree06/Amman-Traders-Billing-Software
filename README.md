# Billing Software - Invoice Generator

A modern invoice generation system built with React, TypeScript, and Express.js.

## Features

- ✅ Create professional tax invoices
- ✅ Automatic bill number generation
- ✅ Save and manage invoices
- ✅ PDF generation and download
- ✅ Preview before printing
- ✅ GST/CGST/SGST/IGST calculations
- ✅ Indian currency formatting
- ✅ Responsive design

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **State Management**: Zustand
- **PDF Generation**: html2pdf.js

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Bill
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

### Development

1. **Start the backend server** (Terminal 1)
   ```bash
   cd server
   npm run dev
   ```
   Server runs on `http://localhost:4000`

2. **Start the frontend** (Terminal 2)
   ```bash
   cd client
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

3. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

1. **Build the server**
   ```bash
   cd server
   npm run build
   ```

2. **Build the client**
   ```bash
   cd client
   npm run build
   ```

The built files will be in:
- Server: `server/dist/`
- Client: `client/dist/`

## Project Structure

```
Bill/
├── client/          # React frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── InvoicePrint.tsx
│   │   ├── SavedBills.tsx
│   │   ├── store.ts
│   │   └── ...
│   └── package.json
├── server/          # Express backend
│   ├── src/
│   │   └── index.ts
│   └── package.json
└── README.md
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options:

1. **Railway** (Backend) + **Vercel** (Frontend) - Recommended
2. **Render** (Full Stack)
3. **Netlify** (Frontend) + **Railway** (Backend)

## Environment Variables

### Backend
- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Set to `production` for production

### Frontend
- `VITE_API_URL`: Backend API URL (for production)

## API Endpoints

- `GET /health` - Health check
- `POST /api/invoices` - Create/save invoice
- `GET /api/invoices` - Get all saved invoices
- `GET /api/invoices/:id` - Get specific invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/get_bill_details` - Get all bills (alternative endpoint)

## License

Private - All rights reserved

