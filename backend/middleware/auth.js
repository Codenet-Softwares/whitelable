import jwt from 'jsonwebtoken';
import { apiResponseErr } from '../helper/errorHandler.js';
import { statusCode } from '../helper/statusCodes.js';
import admins from '../models/admin.model.js';
import Permission from '../models/permissions.model.js';
import { string } from '../constructor/string.js';

export const Authorize = (requiredRolesOrPermissions = []) => {
  return async (req, res, next) => {
    try {
      const authToken = req.headers.authorization;

      if (!authToken) {
        return res.status(statusCode.unauthorize).json(
          apiResponseErr(null, false, statusCode.unauthorize, 'Authorization token is missing.')
        );
      }

      const tokenParts = authToken.split(' ');
      if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer' || !tokenParts[1]) {
        return res.status(statusCode.unauthorize).json(
          apiResponseErr(null, false, statusCode.unauthorize, 'Invalid token format. Expected "Bearer <token>".')
        );
      }

      const decoded = jwt.verify(tokenParts[1], process.env.JWT_SECRET_KEY);
      if (!decoded) {
        return res.status(statusCode.unauthorize).json(
          apiResponseErr(null, false, statusCode.unauthorize, 'Invalid or expired token.')
        );
      }

      const existingUser = await admins.findOne({ where: { userName : decoded.userName } });

      if (!existingUser) {
        return res.status(statusCode.unauthorize).json(
          apiResponseErr(null, false, statusCode.unauthorize, 'User not found.')
        );
      }

      if (existingUser.locked === false) {
        return res.status(statusCode.forbidden).json(
          apiResponseErr(null, false, statusCode.forbidden, 'Your account is locked.')
        );
      }

      // Fetch permissions from Permission table
      const permissions = await Permission.findAll({
        where: { UserId: existingUser.adminId }
      });
      const userPermissions = permissions.map(p => p.permission);

      // Role and permission check
      const userRole = existingUser.role;
      let hasAccess = false;

      if (!requiredRolesOrPermissions.length) {
        hasAccess = true;
      } else {
        hasAccess = requiredRolesOrPermissions.some(req =>
          userRole === req || userPermissions.includes(req)
        );
      }

      if (!hasAccess) {
        return res.status(statusCode.forbidden).json(
          apiResponseErr(null, false, statusCode.forbidden, 'You do not have the required role or permission.')
        );
      }

      // Token consistency check for specific roles
      const checkRoles = [
        string.superAdmin,
        string.whiteLabel,
        string.superAgent,
        string.hyperAgent,
        string.masterAgent,
        string.subAdmin,
        string.subWhiteLabel,
        string.subHyperAgent,
        string.subMasterAgent,
        string.subSuperAgent
      ];

      if (checkRoles.includes(userRole)) {
        if (existingUser.token !== tokenParts[1]) {
          return res.status(statusCode.unauthorize).json(
            apiResponseErr(null, false, statusCode.unauthorize, 'Token mismatch. Unauthorized access.')
          );
        }
      }

      req.user = existingUser;
      next();
    } catch (err) {
      console.error('Authorization Error:', err.message);
      return res.status(statusCode.internalServerError).json(
        apiResponseErr(null, false, statusCode.internalServerError, 'An unexpected error occurred during authorization.')
      );
    }
  };
};
