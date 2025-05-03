# InvoLedger
Invoice, Client and Ledger Management System

📌 A full-stack web application to manage your clients, generate professional invoices, and keep track of your business finances all in one place.

## Demo
https://aboutinvoledger.netlify.app/

## 🚀 Features
✔️ User Authentication
  - Google Sign-In via Passport.js
  - Multi-Session Support: Users can log in from multiple devices and track active sessions.
  - Access & Refresh Tokens for secure session management.

✔️ Client Management
  - Add, edit, and delete client profiles.
  - Store essential business/client information.

✔️ Invoice Generation
  - Create professional invoices with itemized details.
  - Auto-calculate tax based on tax percentage and region.
  - Download invoices as PDF.
    
✔️ Client Ledger
  - Maintain real-time financial records for each client.
  - Track payments, dues, and transaction history.

✔️ PWA Support
   - Installable as an app on mobile and desktop for better accessibility.

## 🛠 Tech Stack
  - Frontend: React, React Query, Zustand, TailwindCSS
  - Backend: Node.js, Express.js
  - Database: PostgreSQL via Prisma ORM
  - Authentication: Google Auth via Passport.js
  - Session Security: Access & Refresh Tokens

## Backend Env Variables
- PORT= PORT
- DATABASE_URL= Your Database URL
- GOOGLE_CLIENT_SECRET= Your Google Client Secret
- GOOGLE_CALLBACK_URL= Your Google Client Callback URL
- SESSION_SECRET= Your Session Secret
- REFRESH_TOKEN_SECRET= Your Refresh Token Secret
- ACCESS_TOKEN_SECRET= Your Access Token Secret
- FRONTEND_URL= Your Frontend URL
- CORS_ORIGIN= Your Frontend URL

## Frontend Env Variables
- VITE_BACKEND_URL= Your Backend server URL

#### Landing Page
![image](https://github.com/user-attachments/assets/a74e193f-bf18-4075-97e6-428bd1762a46)

#### Dashboard Page
![image](https://github.com/user-attachments/assets/5f4a3d1b-2fe1-4ab9-8732-86c9cb0cb840)

#### Clients Page
![image](https://github.com/user-attachments/assets/76db66ef-ef11-4fbf-bcf3-2a7722e90049)

#### Invoices Page
![image](https://github.com/user-attachments/assets/044401a5-7028-4611-b592-cf7a923ecd83)

#### Ledger Page
![image](https://github.com/user-attachments/assets/96877bdf-2fef-4f54-816c-c88cffe2bd0d)

#### Sample Invoice 
![image](https://github.com/user-attachments/assets/26a13b48-0bb1-4e3a-a3ba-d38a629bfc70)


## :man_in_tuxedo: Author

[![Twitter](https://img.shields.io/badge/follow-%40amanthukral-1DA1F2?style=flat&logo=Twitter)](https://twitter.com/aman_thukral12)

[![LinkedIn](https://img.shields.io/badge/connect-%40amanthukral-%230077B5?style=flat&logo=LinkedIn)](https://www.linkedin.com/in/aman-thukral-574b37150/)
