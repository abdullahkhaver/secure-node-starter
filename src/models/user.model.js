import mongoose from 'mongoose';

const RefreshSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const UserSchema = new mongoose.Schema({
  username: { type: String, index: true, unique: true, required: true },
  email: { type: String, index: true, unique: true, required: true },
  passwordHash: { type: String, required: true },
  roles: { type: [String], default: [] },
  refreshTokens: { type: [RefreshSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);

export default User;
