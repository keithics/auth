import jwt from 'jsonwebtoken';
import { catchAsync } from '@keithics/errors/lib/catch-async';
import { arkAssert, ArkErrorInvalidToken } from '@keithics/errors/lib/ark.assert';

interface AuthenticationInterface {
  token: string;
  level: string;
  roles: string[];
  exactRoles?: boolean;
  allUsers?: boolean;
}

type AuthenticationUserType = { jwt: string } & AuthenticationInterface;

interface AccessInterface {
  userRoles: string[];
  exactRoles: boolean;
  roles: string[];
}

/**
 * Authenticate JWT
 * @param token - JWT token
 * @param level - user level eg: user or superadmin
 * @param roles - needed roles, array of user roles, skipped checking if super admin or roles has ['*']
 * @param exactRoles - if true, all roles must be satisfied otherwise use false if only a subset of roles is found
 *
 * eg:
 * exactRoles = false
 * user roles = ['a','b'] and neededRoles are ['a','b','c'] == returns true
 * exactRoles = true
 * user roles = ['a','b'] and neededRoles are ['a','b','c'] == returns false, must be exact and lacks 'c' role
 * @param allUsers - no checking of roles needed
 */

export const authenticate = function ({ token, level, roles, exactRoles = true, allUsers = false }: AuthenticationInterface) {
  return catchAsync(async (req, res, next): Promise<void> => {
    const jwt = req.headers?.authorization?.replace('Bearer ', '') || null;
    const decoded = authenticateUser({ jwt, token, level, roles, exactRoles, allUsers });
    req.user = decoded.user;
    next();
  });
};

/***
 * Separated function for easier testing
 */
export const authenticateUser = ({ jwt: jwtUser, token, level, roles, exactRoles = true, allUsers = false }: AuthenticationUserType) => {
  arkAssert(jwtUser, ArkErrorInvalidToken, 'JWT Token is invalid');
  const decoded = jwt.verify(jwtUser, token);
  arkAssert(decoded?.user.level === level, ArkErrorInvalidToken, 'user token is invalid');
  const { level: userLevel, roles: userRoles } = decoded?.user;

  if (userLevel !== 'superadmin') {
    arkAssert(userRoles, ArkErrorInvalidToken, 'user role is empty');
    if (!userRoles.includes('*') && !allUsers) {
      const isDenied = isAccessDenied({ exactRoles, userRoles, roles });
      arkAssert(isDenied, ArkErrorInvalidToken, 'user role is not allowed');
    }
  }

  return decoded;
};

const isAccessDenied = ({ exactRoles, userRoles, roles }: AccessInterface): boolean => {
  let accessDenied;
  if (exactRoles === false) {
    accessDenied = roles.some((r) => userRoles.includes(r));
  } else {
    accessDenied = roles.every((r) => userRoles.includes(r));
  }

  return accessDenied;
};
