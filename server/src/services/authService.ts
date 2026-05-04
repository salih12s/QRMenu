import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { HttpError } from '../middlewares/errorHandler';

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, 'Invalid email or password');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, 'Invalid email or password');

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions,
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },
};
