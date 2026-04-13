# Login Flow Project

Secure authentication backend with Multi-Factor Authentication.

### Tech Stack
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB via Docker Compose  
- **Security**: JWT, bcrypt, TOTP MFA (Google Authenticator)

### Features
- User register/login with hashed passwords
- JWT access tokens
- TOTP MFA setup & verification flow
- Containerized database with Docker
- TypeScript for type safety

### Quick Start
```bash
cd backend
npm install
docker-compose up -d
npm run dev
