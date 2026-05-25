const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');

const signToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const e = new Error('JWT_SECRET not configured');
    e.statusCode = 500;
    throw e;
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
    secret,
    { expiresIn }
  );
};

const validateRegister = (body) => {
  const errors = [];
  if (!body.name || String(body.name).trim() === '') errors.push('name is required');
  if (!body.email || String(body.email).trim() === '') errors.push('email is required');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) errors.push('email format invalid');
  if (!body.password || String(body.password).length < 6) errors.push('password is required (min 6 characters)');
  return errors;
};

const registerUser = async (body) => {
  try {
    const errs = validateRegister(body);
    if (errs.length) {
      const e = new Error(errs.join('; '));
      e.statusCode = 400;
      throw e;
    }
    const existing = await User.findOne({ email: String(body.email).toLowerCase() });
    if (existing) {
      const e = new Error('Email already registered');
      e.statusCode = 409;
      throw e;
    }
    const hashed = await bcrypt.hash(String(body.password), 10);
    const user = await User.create({
      name: String(body.name).trim(),
      email: String(body.email).toLowerCase().trim(),
      password: hashed,
      role: 'user',
      isVerified: false,
    });
    const token = signToken(user);
    return {
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
      token,
    };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const loginUser = async (body) => {
  try {
    if (!body.email || !body.password) {
      const e = new Error('email and password are required');
      e.statusCode = 400;
      throw e;
    }
    const user = await User.findOne({ email: String(body.email).toLowerCase() }).select('+password');
    if (!user) {
      const e = new Error('Invalid credentials');
      e.statusCode = 401;
      throw e;
    }
    const ok = await bcrypt.compare(String(body.password), user.password);
    if (!ok) {
      const e = new Error('Invalid credentials');
      e.statusCode = 401;
      throw e;
    }
    const token = signToken(user);
    return {
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
      token,
    };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const logoutUser = async () => {
  try {
    return { message: 'Logged out (client should discard token)' };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const getProfile = async (userId) => {
  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      const e = new Error('User not found');
      e.statusCode = 404;
      throw e;
    }
    return { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const updateProfile = async (userId, body) => {
  try {
    const updates = {};
    if (body.name) updates.name = String(body.name).trim();
    const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).lean();
    if (!user) {
      const e = new Error('User not found');
      e.statusCode = 404;
      throw e;
    }
    return { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};


const deleteProfile = async (userId) => {
  try {
    const r = await User.findByIdAndDelete(userId);
    if (!r) {
      const e = new Error('User not found');
      e.statusCode = 404;
      throw e;
    }
    return { deleted: true };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const forgotPassword = async (email) => {
  try {
    if (!email) {
      const e = new Error('email is required');
      e.statusCode = 400;
      throw e;
    }
    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return { message: 'If the email exists, reset instructions would be sent' };
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    return { message: 'If the email exists, reset instructions would be sent', tokenDev: process.env.NODE_ENV === 'development' ? token : undefined };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const resetPassword = async (body) => {
  try {
    if (!body.token || !body.password) {
      const e = new Error('token and password are required');
      e.statusCode = 400;
      throw e;
    }
    if (String(body.password).length < 6) {
      const e = new Error('password must be at least 6 characters');
      e.statusCode = 400;
      throw e;
    }
    const user = await User.findOne({
      resetPasswordToken: body.token,
      resetPasswordExpiry: { $gt: new Date() },
    }).select('+password');
    if (!user) {
      const e = new Error('Invalid or expired token');
      e.statusCode = 400;
      throw e;
    }
    user.password = await bcrypt.hash(String(body.password), 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();
    return { message: 'Password reset successful' };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const changePassword = async (userId, body) => {
  try {
    if (!body.currentPassword || !body.newPassword) {
      const e = new Error('currentPassword and newPassword are required');
      e.statusCode = 400;
      throw e;
    }
    if (String(body.newPassword).length < 6) {
      const e = new Error('newPassword must be at least 6 characters');
      e.statusCode = 400;
      throw e;
    }
    const user = await User.findById(userId).select('+password');
    if (!user) {
      const e = new Error('User not found');
      e.statusCode = 404;
      throw e;
    }
    const ok = await bcrypt.compare(String(body.currentPassword), user.password);
    if (!ok) {
      const e = new Error('Current password is incorrect');
      e.statusCode = 400;
      throw e;
    }
    user.password = await bcrypt.hash(String(body.newPassword), 10);
    await user.save();
    return { message: 'Password changed' };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const verifyEmail = async (body) => {
  try {
    if (!body.email) {
      const e = new Error('email is required');
      e.statusCode = 400;
      throw e;
    }
    const user = await User.findOneAndUpdate(
      { email: String(body.email).toLowerCase() },
      { $set: { isVerified: true } },
      { new: true }
    ).lean();
    if (!user) {
      const e = new Error('User not found');
      e.statusCode = 404;
      throw e;
    }
    return { message: 'Email marked verified', user: { id: user._id, isVerified: user.isVerified } };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const generateTokenForPayload = async (payload) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      const e = new Error('JWT_SECRET not configured');
      e.statusCode = 500;
      throw e;
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const data = {
      id: payload.id || payload.userId,
      email: payload.email || 'demo@example.com',
      role: payload.role || 'user',
      name: payload.name || 'Demo',
    };
    if (!data.id) {
      const e = new Error('id (or userId) is required in body');
      e.statusCode = 400;
      throw e;
    }
    const token = jwt.sign(data, secret, { expiresIn });
    return { token, expiresIn };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const verifyTokenString = async (token) => {
  try {
    if (!token) {
      const e = new Error('token is required');
      e.statusCode = 400;
      throw e;
    }
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    return { valid: true, decoded };
  } catch (err) {
    const e = new Error('Invalid token');
    e.statusCode = 400;
    throw e;
  }
};

const refreshToken = async (user) => {
  try {
    const u = await User.findById(user.id);
    if (!u) {
      const e = new Error('User not found');
      e.statusCode = 404;
      throw e;
    }
    const token = signToken(u);
    return { token };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};