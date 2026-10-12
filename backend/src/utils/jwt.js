import jwt from 'jsonwebtoken';

export const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'dev_secret_local_business_finder_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'dev_secret_local_business_finder_key';
  return jwt.verify(token, secret);
};
