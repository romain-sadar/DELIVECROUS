import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export type AccessTokenPayload = {
  userId: number;
  type: 'access';
};

export type RefreshTokenPayload = {
  userId: number;
  type: 'refresh';
};

export function signAccessToken(userId: number): string {
  return jwt.sign(
    { userId, type: 'access' } as AccessTokenPayload,
    config.jwtAccessSecret,
    { expiresIn: '15m' }
  );
}

export function signRefreshToken(userId: number): string {
  return jwt.sign(
    { userId, type: 'refresh' } as RefreshTokenPayload,
    config.jwtRefreshSecret,
    { expiresIn: '7d' }
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.jwtAccessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, config.jwtRefreshSecret) as RefreshTokenPayload;
}
