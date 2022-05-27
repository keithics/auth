import jwt from 'jsonwebtoken';
import { catchAsync } from '@keithics/errors/lib/catch-async';
import { assert, ErrorInvalidToken } from '@keithics/errors/lib/assert';

export const jwtVerify = function ({ adminToken, level = 'superadmin' }: { adminToken: string; level: string }) {
  return catchAsync(async function (req, res, next): Promise<void> {
    const jwtUser = req.headers?.authorization?.replace('Bearer ', '') || null;
    assert(jwtUser, ErrorInvalidToken);
    const decoded = jwt.verify(jwtUser, adminToken);
    assert(decoded?.user.level === level, ErrorInvalidToken, 'user token is invalid');
    req.user = decoded.user;
    next();
  });
};
