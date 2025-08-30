// Minimal auth controller implementing Argon2 + rotated refresh tokens
import { validationResult } from 'express-validator';
import User from '../models/user.model.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const ACCESS_EXP = process.env.JWT_ACCESS_EXP || '15m';
const REFRESH_EXP_DAYS = parseInt(
  process.env.REFRESH_TOKEN_EXP_DAYS || '30',
  10,
);

if (!ACCESS_SECRET) {
  console.error('JWT_ACCESS_SECRET must be set in .env');
  process.exit(1);
}

function signAccess(user) {
  return jwt.sign(
    { sub: String(user._id), roles: user.roles || [] },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXP },
  );
}

async function createRefreshToken() {
  // Use a random UUID as the refresh token, store only hashed version.
  return uuidv4();
}

async function hashToken(token) {
  return await argon2.hash(token);
}

async function verifyHashedToken(hash, token) {
  try {
    return await argon2.verify(hash, token);
  } catch (e) {
    return false;
  }
}

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ message: 'User exists' });

    const passwordHash = await argon2.hash(password);
    const user = await User.create({ username, email, passwordHash });

    res.status(201).json({ id: user._id });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = signAccess(user);
    const refreshToken = await createRefreshToken();
    const refreshHash = await hashToken(refreshToken);

    user.refreshTokens.push({ tokenHash: refreshHash, createdAt: new Date() });
    await user.save();

    const cookieOpts = {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    };

    res.cookie('access_token', accessToken, {
      ...cookieOpts,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      ...cookieOpts,
      maxAge: REFRESH_EXP_DAYS * 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'Logged in' });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.refresh_token;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    // Find matching hashed token in DB
    const user = await User.findOne({
      'refreshTokens.tokenHash': { $exists: true },
    });
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    // Find which hash matches (linear scan - OK for starter; limit stored tokens in production)
    let idx = -1;
    for (let i = 0; i < user.refreshTokens.length; i++) {
      if (await argon2.verify(user.refreshTokens[i].tokenHash, token)) {
        idx = i;
        break;
      }
    }
    if (idx === -1) return res.status(401).json({ message: 'Invalid token' });

    // Rotate: remove old refresh token, issue new
    user.refreshTokens.splice(idx, 1);
    const newRefresh = await createRefreshToken();
    const newHash = await hashToken(newRefresh);

    user.refreshTokens.push({ tokenHash: newHash, createdAt: new Date() });
    await user.save();

    const accessToken = signAccess(user);
    const cookieOpts = {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    };

    res.cookie('access_token', accessToken, {
      ...cookieOpts,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', newRefresh, {
      ...cookieOpts,
      maxAge: REFRESH_EXP_DAYS * 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'Refreshed' });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.refresh_token;
    if (!token) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return res.json({ message: 'Logged out' });
    }

    // Remove matching refresh token(s)
    const users = await User.find({}); // starter; in prod query by id
    for (const user of users) {
      const newList = [];
      for (const rt of user.refreshTokens) {
        let ok = false;
        try {
          ok = await argon2.verify(rt.tokenHash, token);
        } catch (e) {
          ok = false;
        }
        if (!ok) newList.push(rt);
      }
      user.refreshTokens = newList;
      await user.save();
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};
