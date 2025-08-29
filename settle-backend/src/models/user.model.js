import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      default: 'New User'
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    avatar: {
      type: String,
      default: 'https://i.pravatar.cc/150'
    },
    preferences: {
        notifications: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {

  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();

});

userSchema.methods.isPasswordCorrect = async function (password) {
  
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model('User', userSchema);