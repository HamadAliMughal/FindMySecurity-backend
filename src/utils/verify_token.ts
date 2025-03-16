import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.SESSION_SECRET || ''
interface AuthenticatedRequest extends Request {
  user?: any;
}

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];

  const validMethod = 'GET' === req.method

  const validUrl = req.originalUrl.includes('/api/stories/') || req.originalUrl.includes('/api/memory/')
  const validAnotherUrl = req.originalUrl.includes('/api/stories/checkPassword') || req.originalUrl === '/api/file'
  if (((validMethod && validUrl) || validAnotherUrl || (req.method === 'POST' && req.originalUrl.includes('/api/memory/'))) && !token) next()
  else {
    if (!token) {

      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
  }
}; 