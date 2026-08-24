# SaaS Document Verification Platform

> **A Full-Stack SaaS Platform for Identity Verification, Business Verification, Wallet Management and API-based Verification Services**

Production-ready SaaS application built using **Next.js, NestJS, Prisma, PostgreSQL, Razorpay, and Nerotix APIs**.

The platform enables businesses, fintech companies, HR platforms, logistics companies, developers and enterprises to integrate real-time verification services through secure API keys with wallet-based billing.

---

# Table of Contents

* Overview
* Features
* User Roles
* Verification Services
* System Workflow
* Technology Stack
* Project Structure
* Installation Guide
* Environment Variables
* Database Setup
* Running the Project
* Frontend Setup
* Backend Setup
* Default Project Flow
* API Key Flow
* Wallet Flow
* Support System
* Project Status
* Troubleshooting
* License

---

# Project Overview

The SaaS Document Verification Platform is a complete verification ecosystem where users can:

* Register and Login
* Generate API Keys
* Recharge Wallet
* Verify documents
* View verification history
* Manage support tickets
* Integrate APIs into their own applications

Administrators can:

* Manage users
* Manage staff
* Control pricing
* View analytics
* Manage support tickets
* Refund wallets
* Enable/Disable API keys
* Monitor platform revenue

Staff members receive role-based permissions to perform only the tasks assigned by the Super Admin.

---

# Features

## Authentication

* User Registration
* User Login
* JWT Authentication
* Refresh Tokens
* Secure Password Hashing
* Change Password
* Role Based Authentication

---

## User Management

* Customer Accounts
* Staff Accounts
* Super Admin Accounts
* Role Management
* User Profile Management

---

## Wallet System

Every customer receives a wallet.

Features:

* Wallet Creation
* Wallet Balance
* Wallet Top-up
* Wallet Transactions
* Automatic Verification Charges
* Wallet Refund (Admin)
* Revenue Tracking

---

## API Key Management

Each customer can create multiple API keys but only a single active one.

Features:

* Generate API Keys
* Activate API Keys
* Deactivate API Keys
* Regenerate Keys
* API Usage Tracking
* API Key Validation

---

## Verification Services

Integrated with Nerotix APIs.

### Identity Verification

* Aadhaar OTP
* DigiLocker
* PAN Verification
* PAN 360
* Passport Verification
* Driving License
* Voter ID

---

### Business Verification

* GST Verification
* PAN to GST
* CIN Lookup
* Udyam Verification
* PAN to Udyam

---

### Banking Verification

* Penny Drop Verification

---

### Face Intelligence

* Face Match
* Face Liveness Detection
* Name Match

---

### Telecom Intelligence

* Number Lookup

---

### Vehicle Intelligence

* Vehicle RC Verification

---

### Employment Verification

* Employment 360

---

### Location Intelligence

* Reverse Geocoding

---

Total Verification Services

**20 Integrated Services**

---

# Verification Workflow

Every verification request follows the same workflow.

1. User generates API Key.
2. User funds wallet.
3. User selects verification service.
4. Backend validates API Key.
5. Wallet balance is verified.
6. Pricing is fetched.
7. Verification amount is deducted.
8. Nerotix API is called.
9. Response is stored.
10. Transaction is created.
11. Verification history is saved.
12. Response is returned to the frontend.

---

# User Roles

## Customer

* Manage Profile
* Change Password
* Generate API Keys
* Recharge Wallet
* Verify Documents
* View Transactions
* View Verification History
* Create Support Tickets

---

## Staff

Permissions assigned by Super Admin.

Supported Permissions

* View Users
* View Transactions
* View Verifications
* View & Manage Support Tickets

---

## Super Admin

Complete platform access.

Features

* Dashboard Analytics
* User Management
* Staff Management
* Pricing Management
* Wallet Refunds
* API Key Management
* Support Management
* Revenue Analytics
* Verification Analytics
* Transaction Monitoring

---

# Dashboard Modules

## Customer Dashboard

* Dashboard
* Wallet
* Transactions
* API Keys
* Services
* Verification History
* Support
* Settings

---

## Staff Dashboard

* Dashboard
* Users
* Transactions
* Verifications
* Support Management
* Settings

Permission visibility is controlled using RBAC.

---

## Super Admin Dashboard

* Dashboard Analytics
* Users
* Staff Management
* Pricing
* Transactions
* Verifications
* API Keys
* Wallet Refund
* Support
* Settings

---

# Support Ticket System

Users can:

* Create Support Tickets
* View Their Tickets

Staff can:

* View Tickets
* Reply to Tickets
* Change Ticket Status

Super Admin can:

* View All Tickets
* Reply
* Change Status

Supported Statuses

* OPEN
* CLOSED

---

# Pricing Management

Dynamic pricing is supported for every verification service.

Administrators can:

* Update Pricing
* Enable Services
* Disable Services

Pricing updates immediately affect verification billing.

---

# Transaction Management

Every verification automatically creates a transaction.

Stored Information

* User
* Service
* Amount
* Status
* Timestamp

---

# Verification History

Every verification stores:

* Request
* Response
* User
* Service
* Status
* Cost
* Timestamp

---

# Developer API 

Users can immediately integrate the APIs into their own applications using their own API key.

---

# Technology Stack

## Frontend

* Next.js 15
* React
* TypeScript
* Tailwind CSS
* Axios
* Lucide Icons

---

## Backend

* NestJS
* TypeScript

---

## Database

* PostgreSQL
* Prisma ORM

Hosted on:

* Neon PostgreSQL

---

## Authentication

* JWT
* bcrypt

---

## Payments

* Razorpay

---

## Verification Provider

* Nerotix API

---

## Security

* JWT Authentication
* RBAC
* Permission Guards
* API Key Validation
* Validation Pipes

---

# Project Structure

```
saas-project
│
├── frontend
│   ├── app
│   ├── components
│   ├── lib
│   ├── public
│   └── package.json
│
├── backend
│   ├── prisma
│   ├── src
│   │
│   ├── admin
│   ├── api-keys
│   ├── auth
│   ├── dashboard
│   ├── permissions
│   ├── pricing
│   ├── razorpay
│   ├── staff
│   ├── support
│   ├── transactions
│   ├── users
│   ├── verifications
│   ├── wallet
│   ├── webhooks
│   └── health
│
├── README.md
└── .gitignore
```

---

# Prerequisites

Install the following before running the project.

* Node.js (v20 or newer)
* PostgreSQL (or Neon PostgreSQL)
* Git
* npm
* Docker (Optional)

---

# Installation Guide

## 1. Clone Repository

```bash
git clone https://github.com/Faiz2501/saas-project.git

cd saas-project
```

---

## 2. Install Backend Dependencies

```bash
cd backend

npm install
```

---

## 3. Install Frontend Dependencies

Open another terminal.

```bash
cd frontend

npm install
```

---

# Environment Variables

## Backend (.env)

```env
DATABASE_URL=postgresql://...

JWT_SECRET=your_secret

PORT=3000

NEROTIX_BASE_URL=https://api.nerofy.in/api/v1

NEROTIX_TOKEN=your_token

RAZORPAY_KEY_ID=your_key

RAZORPAY_KEY_SECRET=your_secret

RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

---

## Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_key_secret
```

---

# Database Setup

From the backend folder.

Generate Prisma Client

```bash
npx prisma generate
```

Push Database Schema

```bash
npx prisma db push
```

(Optional) Open Prisma Studio

```bash
npx prisma studio
```

---

# Running the Backend

Navigate to the backend directory.

```bash
cd backend
```

Run the development server.

```bash
npm run start:dev
```

The backend will be available at:

```
http://localhost:3000
```

---

# Running the Frontend

Open a new terminal.

Navigate to the frontend.

```bash
cd frontend
```

Start the development server.

```bash
npm run dev
```

The frontend will be available at:

```
http://localhost:3001
```

*(If your project uses another port, use the port shown in the terminal output.)*

---

# First-Time Setup Checklist

After starting both servers:

1. Register a new customer account.
2. Log in.
3. Generate an API key.
4. Add wallet balance using Razorpay (or manually if testing).
5. Open the Services page.
6. Perform a verification.
7. View the verification result.
8. Check Transactions.
9. Check Verification History.
10. Create a Support Ticket.
11. Log in as Super Admin.
12. Manage Pricing.
13. Create Staff users.
14. Assign Staff permissions.
15. Verify Staff dashboard access.

---

# Available Dashboards

### Customer

* Dashboard
* Wallet
* API Keys
* Services
* Transactions
* Verification History
* Support
* Settings

---

### Staff

* Dashboard
* Users
* Transactions
* Verifications
* Support
* Settings

---

### Super Admin

* Dashboard
* Users
* Staff
* Pricing
* Transactions
* Verifications
* API Keys
* Wallet Refund
* Support
* Settings

---

# Current Project Status

## Completed

* Authentication System
* JWT Authentication
* Change Password
* Role-Based Access Control (RBAC)
* Staff Permission Management
* Wallet System
* Razorpay Wallet Top-up
* Wallet Refund (Admin)
* Dynamic Pricing
* API Key Generation & Management
* API Key Validation
* Verification History
* Transaction Management
* User Support Ticket System
* Staff Support Management
* Admin Support Management
* User Management
* Staff Management
* Dashboard Analytics
* Verification Result Viewer
* Verification Response Storage
* Nerotix API Integration
* 20+ Verification Services
* PostgreSQL Database
* Prisma ORM Integration
* Neon Database Support

---

# Troubleshooting

### Prisma Client Error

```bash
npx prisma generate
```

---

### Database Not Updated

```bash
npx prisma db push
```

---

### Backend Won't Start

* Check `.env`
* Verify `DATABASE_URL`
* Ensure PostgreSQL/Neon is accessible.
* Run `npm install`.

---

### Frontend Can't Reach Backend

Verify:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Ensure the backend is running before starting the frontend.

---

### Verification Returns "No Active API Key"

* Generate an API key from the customer dashboard.
* Ensure the API key is active.
* Verify the key is being passed in the `x-api-key` header.

---

# License

This project was developed as a full-stack SaaS application for an internship under [**Techgen Cyber Solution PVT. LTD**](https://techgencybersolution.com/). It demonstrates a production-style architecture using modern web technologies, secure authentication, role-based access control, wallet-based billing, and third-party verification service integration.