# Sales & Management Assistant Application (MERN Stack)

A production-quality internal web application built for **Sales Operations / Business Development Assistants** to manage leads, sales funnel activities, follow-ups, internal tasks, CEO updates, and award/funding opportunities.

---

## Architecture Overview

* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, React Router v6, Axios.
* **Backend:** Node.js, Express.js, REST API, JWT Auth, Bcrypt, Mongoose.
* **Database:** MongoDB / MongoDB Atlas.

---

## Local Development Setup

### 1. Backend Server Setup
```bash
cd server
npm install
npm start
```
* Backend runs at: `http://localhost:5000`
* Health Check: `http://localhost:5000/api/health`

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
* Frontend runs at: `http://localhost:3000`

---

## Deployment Guide

### A. Push Code to GitHub

Initialize git repository at project root and push to GitHub:
```bash
# In project root directory
git init
git add .
git commit -m "Initial production commit for Sales Assistant App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sales-management-assistant.git
git push -u origin main
```

---

### B. Backend Deployment on Render

1. Log in to [Render.com](https://render.com) and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Set the following configuration:
   * **Root Directory:** `server`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
4. Add the Environment Variables in Render settings:
   * `PORT`: `5000`
   * `NODE_ENV`: `production`
   * `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/sales_db?retryWrites=true&w=majority`
   * `JWT_SECRET`: `<YOUR_SECURE_JWT_SECRET>`
   * `CLIENT_URL`: `https://your-app-name.vercel.app` (Your Vercel URL)
5. Click **Deploy Web Service**.
6. Copy your Render backend URL (e.g. `https://sales-assistant-api.onrender.com`).

---

### C. Frontend Deployment on Vercel

1. Log in to [Vercel.com](https://vercel.com) and click **Add New** -> **Project**.
2. Import your GitHub repository.
3. Configure project settings:
   * **Framework Preset:** `Vite`
   * **Root Directory:** `client`
4. Add Environment Variable in Vercel settings:
   * `VITE_API_URL`: `https://sales-assistant-api.onrender.com/api` (Your Render backend URL + `/api`)
5. Click **Deploy**.

---

## Default Seed Credentials

Upon database initialization, the server automatically bootstraps initial role accounts:
* **Assistant:** `assistant@company.com` / `password123`
* **Admin:** `admin@company.com` / `password123`
* **Sales:** `sales@company.com` / `password123`
* **CEO / Mgmt:** `ceo@company.com` / `password123`
