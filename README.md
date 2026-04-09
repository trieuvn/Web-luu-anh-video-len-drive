# React Google Drive Gallery

A mobile-friendly web application for easily viewing and uploading photos and videos directly to a public Google Drive folder.

## Features
- 📱 Mobile-first responsive and modern UI with glassmorphism.
- 🖼️ Card-style list view of images/videos.
- 📄 Pagination (10 items per page).
- 📤 Direct native picker upload for photos and videos to Google Drive.
- 🔍 High-resolution detail viewer.

## Setup Instructions

### 1. Prerequisites
- Node.js installed

### 2. Google Drive API Config
Since Google Drive requires API Keys / OAuth for POST requests, we must securely store our keys.

1. Go to Google Cloud Console.
2. Enable Google Drive API.
3. Create an API Key (for reading) and an OAuth Client ID or Service Account for uploading.
4. Duplicate `frontend/.env.example` as `frontend/.env` and paste your credentials. (The `.env` file is safely ignored via `.gitignore` to prevent GitHub leaks).

### 3. Installation & Running
```bash
cd frontend
npm install
npm run dev
```

Enjoy your gallery app!
