import jwt from 'jsonwebtoken';
import { config } from './config.js';

export interface JWTPayload {
  userId: string;
  email: string;
  workspaceId: string;
  role: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, config.jwtSecret) as JWTPayload;
}
