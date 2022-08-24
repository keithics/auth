import jwt from 'jsonwebtoken';
import { authenticateUser } from './authenticate';
import { ArkErrorInvalidToken } from '@keithics/errors/lib/ark.assert';

const body = {
  user: {
    _id: '61a9143ff6d9d2000dc3bceb',
    email: 'keith.lumanog@unitedintegral.com',
    level: 'user',
    roles: ['a', 'b', 'z'],
  },
};

const token = 'token';
const jwtUser = jwt.sign(body, token);

body.user.roles = ['*'];
const jwtUserAllRoles = jwt.sign(body, token);

delete body.user.roles;
const jwtUserNoRoles = jwt.sign(body, token);

body.user.level = 'superadmin';
const jwtAdmin = jwt.sign(body, token);

describe('Authentication test', () => {
  test('Should be 😞 if user has no roles', async () => {
    expect(() => {
      authenticateUser({ jwt: jwtUserNoRoles, token, level: 'user', roles: ['c'] });
    }).toThrowError(ArkErrorInvalidToken);
  });

  test('Should be 😞 if user has no access, needs to have c role', async () => {
    expect(() => {
      authenticateUser({ jwt: jwtUserNoRoles, token, level: 'user', roles: ['c'] });
    }).toThrowError(ArkErrorInvalidToken);
  });

  test('Should be 👌 if user has SOME of the access, common role is b', async () => {
    expect(authenticateUser({ jwt: jwtUser, token, level: 'user', roles: ['c', 'b'], exactRoles: false })).toMatchSnapshot();
  });

  test('Should be 👌 if user has SOME of the access, common role is b and z', async () => {
    expect(
      authenticateUser({
        jwt: jwtUser,
        token,
        level: 'user',
        roles: ['c', 'b', 'z'],
        exactRoles: false,
      })
    ).toMatchSnapshot();
  });

  test('Should be 👌 if user has ALL a,b and z roles ', async () => {
    expect(authenticateUser({ jwt: jwtUser, token, level: 'user', roles: ['a', 'b', 'z'] })).toMatchSnapshot();
  });

  test('Should be 😞 if user has SOME a and b roles but no c role ', async () => {
    expect(() => {
      authenticateUser({ jwt: jwtUser, token, level: 'user', roles: ['a', 'b', 'c'] });
    }).toThrowError(ArkErrorInvalidToken);
  });

  test('Should be 😞 if user has ALL a,b and z roles but no c role ', async () => {
    expect(() => {
      authenticateUser({ jwt: jwtUser, token, level: 'user', roles: ['a', 'b', 'z', 'c'] });
    }).toThrowError(ArkErrorInvalidToken);
  });

  test('Should be 👌 if user is a superadmin, no roles needed', async () => {
    expect(authenticateUser({ jwt: jwtAdmin, token, level: 'superadmin', roles: [] })).toMatchSnapshot();
  });

  test("Should be 👌 if even if the user doesn't have the role because allUsers is true", async () => {
    expect(authenticateUser({ jwt: jwtUser, token, level: 'user', roles: ['x'], allUsers: true })).toMatchSnapshot();
  });

  test('Should be 👌 if even if the user role is equal to *', async () => {
    expect(authenticateUser({ jwt: jwtUserAllRoles, token, level: 'user', roles: ['x'] })).toMatchSnapshot();
  });

  test('Should be 👌 if even if the user role is equal to * and allUsers: true', async () => {
    expect(authenticateUser({ jwt: jwtUserAllRoles, token, level: 'user', roles: ['x'], allUsers: true })).toMatchSnapshot();
  });
});
