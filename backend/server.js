/* eslint-disable no-undef */
import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import cors from 'cors';
import jose from 'node-jose';
import fs from 'fs/promises';

const app = express();
const PORT = process.env.PORT || 5001;

// Environment variable validation
const requiredEnvVars = ['SESSION_SECRET', 'IDME_CLIENT_ID', 'IDME_CLIENT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

async function setupServer() {
  try {
    // Load the private key and key ID
    const privateKeyPem = await fs.readFile('private_key.pem', 'utf8');
    const kid = (await fs.readFile('key_id.txt', 'utf8')).trim();

    // Create a keystore with the private key
    const keystore = jose.JWK.createKeyStore();
    await keystore.add(privateKeyPem, 'pem', { kid: kid });

    // Middleware
    app.use(cors({
      origin: 'http://localhost:5173',
      credentials: true
    }));

    app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
      }
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    // Passport configuration
    configurePassport(keystore);

    // Routes
    setupRoutes(app);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Key ID (kid): ${kid}`);
    });
  } catch (err) {
    console.error('Error setting up server:', err);
    process.exit(1);
  }
}

function configurePassport(keystore) {
  passport.use(new OAuth2Strategy({
    authorizationURL: 'https://api.idmelabs.com/oauth/authorize',
    tokenURL: 'https://api.idmelabs.com/oauth/token',
    clientID: process.env.IDME_CLIENT_ID,
    clientSecret: process.env.IDME_CLIENT_SECRET,
    callbackURL: 'http://localhost:5001/auth/idme/callback',
    issuer: "https://api.idmelabs.com/oidc",
    scope: ['openid', 'http://idmanagement.gov/ns/assurance/ial/2/aal/2']
  },
  async function(accessToken, refreshToken, params, profile, cb) {
    try {
      const result = await jose.JWE.createDecrypt(keystore).decrypt(params.id_token);
      const decodedPayload = jose.util.base64url.decode(result.payload.toString().split('.')[1]);
      const decodedToken = JSON.parse(decodedPayload.toString());
      return cb(null, decodedToken);
    } catch (error) {
      console.error('Error decrypting or parsing JWE:', error);
      return cb(error);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
}

function setupRoutes(app) {
  app.get('/auth/idme', passport.authenticate('oauth2'));

  app.get('/auth/idme/callback', 
    passport.authenticate('oauth2', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('http://localhost:5173?login=success');
    }
  );

  app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });
}

setupServer();