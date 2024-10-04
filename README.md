# React ID.me Integration

This project demonstrates integration with ID.me for authentication using React and Express with encryption.

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

## Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd react-idme
   ```

2. Install dependencies for both frontend and backend:
   ```
   npm install
   cd backend
   npm install
   cd ..
   ```

3. Generate keys for the backend:
   ```
   cd backend
   npm run generate-keys
   cd ..
   ```
   This will create `private_key.pem`, `public_key.pem`, `certificate.pem`, and `key_id.txt` files in the backend directory.

    Reach out to your dedicated ID.me Solutions Consultant in regards to having these keys integrated into your application on ID.me's end. 

4. Set up environment variables:
   - Copy the `.env.sample` file in the backend directory to `.env`:
     ```
     cp backend/.env.sample backend/.env
     ```
   - Open `backend/.env` and fill in the required values:
     - `SESSION_SECRET`: A random string for session encryption
     - `IDME_CLIENT_ID`: Your ID.me client ID
     - `IDME_CLIENT_SECRET`: Your ID.me client secret
     - `PORT`: The port for the backend server (default is 5001)

5. Start the development servers:
   - For frontend (from the project root):
     ```
     npm run start:frontend
     ```
   - For backend (from the project root):
     ```
     npm run start:backend
     ```

   Alternatively, you can start both servers simultaneously with:
   ```
   npm start
   ```

6. Open your browser and navigate to `http://localhost:5173` to view the application.

## Project Structure

- `/src`: React frontend code
- `/backend`: Express backend code
- `/backend/private_key.pem`: RSA private key for JWT decryption
- `/backend/key_id.txt`: Key ID for the RSA key pair

## Notes

- Ensure that your ID.me client is properly configured with the correct redirect URI (`http://localhost:5001/auth/idme/callback`).
- Keep your `.env` file and generated keys secure and never commit them to version control.
