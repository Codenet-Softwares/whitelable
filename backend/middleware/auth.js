import jwt from 'jsonwebtoken';
import { apiResponseErr } from '../helper/errorHandler.js';
import { statusCode } from '../helper/statusCodes.js';
import admins from '../models/admin.model.js';
import { string } from '../constructor/string.js';

export const Authorize = (roles) => {
  return async (req, res, next) => {
    try {
      const authToken = req.headers.authorization;

      if (!authToken) {
        return res.status(statusCode.unauthorize).json(apiResponseErr(null, false, statusCode.unauthorize, 'Authorization token is missing.'));
      }

      const tokenParts = authToken.split(' ');
      if (tokenParts.length !== 2 || !(tokenParts[0] === 'Bearer' && tokenParts[1])) {
        return res.status(statusCode.unauthorize).json(apiResponseErr(null, false, statusCode.unauthorize, 'Invalid token format. Expected "Bearer <token>".'));
      }

      const user = jwt.verify(tokenParts[1], process.env.JWT_SECRET_KEY);
      if (!user) {
        return res.status(statusCode.unauthorize).json(apiResponseErr(null, false, statusCode.unauthorize, 'Invalid or expired token.'));
      }

      const existingUser = await admins.findOne({ where: { adminId: user.adminId } });

      if (!existingUser) {
        return res.status(statusCode.unauthorize).json(apiResponseErr(null, false, statusCode.unauthorize, 'User not found.'));
      }

      const userRoles = existingUser.roles;
      if (existingUser.locked === false) {
        return res.status(statusCode.forbidden).json(apiResponseErr(null, false, statusCode.forbidden, 'Your account is locked.'));
      }

      if (roles && roles.length > 0) {
        let userHasRequiredRole = false;
        let userHasRequiredPermission = false;

        roles.forEach((role) => {
          userRoles.forEach((userRole) => {
            if (userRole.role === role || (Array.isArray(userRole.permission) && userRole.permission.includes(role))) {
              userHasRequiredRole = true;
              userHasRequiredPermission = true;
            }
          });
        });

        if (!userHasRequiredRole && !userHasRequiredPermission) {
          return res.status(statusCode.forbidden).json(apiResponseErr(null, false, statusCode.forbidden, 'You do not have the required role or permission.'));
        }
      }
      const checkRoles = [
        string.superAdmin,
        string.whiteLabel,
        string.superAgent,
        string.hyperAgent,
        string.masterAgent
      ];

      if (checkRoles.includes(user.roles[0].role)) {
        if (existingUser.token !== tokenParts[1]) {
          return res.status(statusCode.unauthorize).json(apiResponseErr(null, false, statusCode.unauthorize, 'Token mismatch. Unauthorized access.'));
        }
      }
      
      req.user = existingUser;
      next();
    } catch (err) {
      console.error('Authorization Error:', err.message);
      return res.status(statusCode.internalServerError).json(apiResponseErr(null, false, statusCode.internalServerError, 'An unexpected error occurred during authorization.'));
    }
  };
};
