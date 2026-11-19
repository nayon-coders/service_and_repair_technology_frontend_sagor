# 1 Service & Repair Technology - Frontend Client

Modern web and desktop (PWA) client for **1 Service & Repair Technology ERP & Management System**.

## Tech Stack
- **Framework**: React 18 (TypeScript)
- **Bundler**: Vite 5
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios with centralized API client
- **Routing**: React Router v6
- **Desktop Application**: Progressive Web App (PWA) with offline service worker & standalone desktop install

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

### 5. Desktop App Installation
Open the web app in Chrome, Edge, or Safari, and click **Install as Desktop App** or use the browser address bar install prompt to install as a standalone native desktop software.
