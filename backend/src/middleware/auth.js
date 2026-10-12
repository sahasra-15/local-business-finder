import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { errorResponse } from '../utils/response.js';

export const protect = async (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized. Please login to continue.', 401);
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 'The user for this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired token. Please log in again.', 401);
  }
};

export const optionalAuth = async (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid token in optional auth
  }

  next();
};
