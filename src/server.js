// Entry point
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is required in .env');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI, { autoIndex: false });
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start', err);
  process.exit(1);
});
