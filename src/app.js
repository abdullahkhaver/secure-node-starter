// Express app with secure defaults
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import csrf from 'csurf';
import authRoutes from './routes/auth.js';

const app = express();

// Basic logging
app.use(morgan('tiny'));

// Security headers
app.use(helmet());

// Rate limiting - tune according to needs
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// CORS - restrict origin in production
const whitelist = [process.env.ORIGIN || 'http://localhost:5173'];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || whitelist.indexOf(origin) !== -1) return cb(null, true);
      cb(new Error('CORS not allowed'));
    },
    credentials: true,
  }),
);

// CSRF - provide token endpoint for SPA clients to read
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  },
});
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Routes
app.use('/api/auth', authRoutes);

// Error handler (simple)
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res
    .status(err.status || 500)
    .json({ message: err.message || 'Internal Server Error' });
});

export default app;
