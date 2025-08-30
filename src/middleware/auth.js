import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function (req, res, next) {
  const token = req.cookies && req.cookies.access_token;
  if (!token) return res.status(401).json({ message: 'Missing access token' });

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findById(payload.sub).select(
      '-passwordHash -refreshTokens',
    );
    if (!user) return res.status(401).json({ message: 'Invalid token user' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
