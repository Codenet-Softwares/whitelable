import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import admins from '../models/admin.model.js';
import { apiResponseErr, apiResponseSuccess } from '../helper/errorHandler.js';
import { messages, string } from '../constructor/string.js';
import { statusCode } from '../helper/statusCodes.js';
import CustomError from '../helper/extendError.js';
import axios from 'axios';
import { admin_Balance } from './transaction.controller.js';
import Permission from '../models/permissions.model.js';

// done
export const adminLogin = async (req, res) => {
    try {
        const { userName, password, persist } = req.body;

        const existingAdmin = await admins.findOne({ where: { userName } });

        if (!existingAdmin) {
            return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Admin doesn`t exist'));
        }

        if (existingAdmin.locked === false) {
            await existingAdmin.update({ loginStatus: 'login failed' });
            throw new CustomError('Account is locked', null, statusCode.badRequest);
        }
        
        const roles = existingAdmin.role;
        if (roles === string.user) {
            await existingAdmin.update({ loginStatus: 'login failed' });
            return res.status(statusCode.unauthorize).send(apiResponseErr(null, false, statusCode.unauthorize, 'User does not exist'));
        }

        const passwordValid = await bcrypt.compare(password, existingAdmin.password);
        if (!passwordValid) {
            await existingAdmin.update({ loginStatus: 'login failed' });
            return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, messages.invalidPassword));
        }

        if (roles === string.superAdmin) {
            existingAdmin.isReset = false;
        }
        let permission = [];

        if (
          roles === string.superAdmin ||
          roles === string.hyperAgent ||
          roles === string.superAgent ||
          roles === string.masterAgent
        ) {
          const result = await Permission.findOne({ where: { UserId: existingAdmin.adminId } });
          permission = result ? [result.permission] : [];
        } else if (
          roles === string.subAdmin ||
          roles === string.subWhiteLabel ||
          roles === string.subHyperAgent ||
          roles === string.subSuperAgent ||
          roles === string.subMasterAgent
        ) {
          const results = await Permission.findAll({ where: { UserId: existingAdmin.adminId } });
          permission = results.map((perm) => perm.permission);
        }

        if (existingAdmin.isReset === true) {
            const resetTokenResponse = {
                id: null,
                userName: null,
                userType: null,
                isReset: existingAdmin.isReset,
                role: ''
            };
            return res
        .status(statusCode.success)
        .send(
          apiResponseSuccess(
            {
              ...resetTokenResponse,
            },
            true,
            statusCode.success,
            'Password reset required.',
          ),
        );
        }
        else {
            let adminIdToSend;

            if ([string.superAdmin, string.whiteLabel, string.hyperAgent, string.superAgent].includes(roles)) {
                adminIdToSend = existingAdmin.adminId;
            } else if ([string.subWhiteLabel, string.subAdmin, string.subHyperAgent, string.subSuperAgent, string.subMasterAgent].includes(roles)) {
                adminIdToSend = existingAdmin.createdById;
            } else {
                adminIdToSend = existingAdmin.adminId;
            }

            const adminBalance = await admin_Balance(existingAdmin.adminId)

            const accessTokenResponse = {
                adminId: adminIdToSend,
                createdById: existingAdmin.createdById,
                createdByUser: existingAdmin.createdByUser,
                userName: existingAdmin.userName,
                balance : adminBalance[0]?.[0].adminBalance,
                role: existingAdmin.role,
                permission: permission || [],
                status: existingAdmin.isActive
                    ? 'active'
                    : !existingAdmin.locked
                        ? 'locked'
                        : !existingAdmin.isActive
                            ? 'suspended'
                            : '',
            };

            const accessToken = jwt.sign({
                adminId: adminIdToSend,
                createdById: existingAdmin.createdById,
                createdByUser: existingAdmin.createdByUser,
                userName: existingAdmin.userName,
                balance : adminBalance,
                role: existingAdmin.role,
                permission: permission || [],
                status: existingAdmin.isActive
                    ? 'active'
                    : !existingAdmin.locked
                        ? 'locked'
                        : !existingAdmin.isActive
                            ? 'suspended'
                            : '',
            }, process.env.JWT_SECRET_KEY, {
                expiresIn: persist ? '1y' : '8h',
            })

            existingAdmin.token = accessToken
            const loginTime = new Date();
            

            await existingAdmin.update({ lastLoginTime: loginTime, loginStatus: 'login success' });
            await existingAdmin.save()

            return res.status(statusCode.success).send(
                apiResponseSuccess(
                    { accessToken, ...accessTokenResponse },
                    true,
                    statusCode.success,
                    'Admin login successfully',
                ),
            );
        }

    } catch (error) {
        console.log('Error in adminLogin:', error);
        res.status(statusCode.internalServerError).send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
    }
};

export const adminPasswordResetCode = async (req, res) => {
    try {
        const admin = req.user
        const { userName, adminPassword, password } = req.body;
        const existingUser = await admins.findOne({ where: { userName } });
        if (!existingUser) {
            return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, messages.adminNotFound));
        }
        if (admin.adminId !== existingUser.createdById) {

            return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Admin Does not have permission to reset Password'));
        }

        if (existingUser.isActive === false) {
            return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Account is inactive'));

          }
      
          if (existingUser.locked === false) {
            return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.unauthorize, "Account is locked"));
            
          }
        const isAdminPasswordCorrect = await bcrypt.compare(adminPassword, admin.password);
        if (!isAdminPasswordCorrect) {
            return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Invalid Admin password'));
        }
        const passwordIsDuplicate = await bcrypt.compare(password, existingUser.password);
        if (passwordIsDuplicate) {
            return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'New Password Cannot Be The Same As Existing Password'));
        }
        const passwordSalt = await bcrypt.genSalt();
        const encryptedPassword = await bcrypt.hash(password, passwordSalt);

        const token = jwt.sign({ role: req.user.role }, process.env.JWT_SECRET_KEY);

        const baseUrl = process.env.COLOR_GAME_URL;

        const dataToSend = {
            userName,
            password
        }

        if(existingUser.role === "user"){
            const response = await axios.post(
                `${baseUrl}/api/external-reset-password`,
                dataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.data.success) {
                return res
                    .status(statusCode.badRequest)
                    .send(apiResponseErr(null, false, statusCode.badRequest, "Failed to fetch data"));
            }
        }
        
        if (existingUser.role === "subAdmin") {
            await admins.update({ password: encryptedPassword, isReset: true }, { where: { userName } });
        } else {
            await admins.update({ password: encryptedPassword }, { where: { userName } });
        }

        return res.status(statusCode.success).send(apiResponseSuccess(existingUser, true, statusCode.success, 'Password Reset Successful!'));
    } catch (error) {
        res.status(statusCode.internalServerError).send(apiResponseErr(null, false, statusCode.internalServerError, error.message));
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { userName, oldPassword } = req.body;

        const existingAdmin = await admins.findOne({ where: { userName } });

        if (!existingAdmin) {
            return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'Invalid User Name or password'));
        }

        const passwordValid = await bcrypt.compare(oldPassword, existingAdmin.password);

        if (!passwordValid) {
            return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.invalidPassword));
        }

        const result = {
            userId: existingAdmin.adminId,
            userName: existingAdmin.userName,
            balance: existingAdmin.balance,
            authenticate: true
        }

        return res.status(statusCode.success).send(
            apiResponseSuccess(
                result,
                true,
                statusCode.success,
                'Authenticate true',
            ),
        );
    } catch (error) {
        res.status(statusCode.internalServerError).send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
    }
};

export const loginResetPassword = async (req, res) => {
    try {
        const { userName, oldPassword, newPassword } = req.body;

        const existingUser = await admins.findOne({ where: { userName } });       
        const isPasswordMatch = await bcrypt.compare(oldPassword, existingUser.password);
        if (!isPasswordMatch) {
            return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Invalid old password.'));
        }
        if(oldPassword === newPassword){
            return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Old password and New password can not be same'));

        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await existingUser.update({ password: hashedPassword, isReset: false });

        return res.status(statusCode.success).send(apiResponseSuccess(null, true, statusCode.success, 'Password reset successfully.'));
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(statusCode.internalServerError).send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
    }
};

export const logout = async (req, res) => {
    try {
        const { adminId } = req.body;

        const users = await admins.findOne({ where: { adminId } });

        if (!users) {
            return res
                .status(statusCode.badRequest)
                .send(apiResponseErr(null, false, statusCode.badRequest, 'User not found'));
        }

        users.token = null;
        await users.save();

        return res
            .status(statusCode.success)
            .send(apiResponseSuccess(null, true, statusCode.success, 'Logged out successfully'));
    } catch (error) {
        return res
            .status(statusCode.internalServerError)
            .send(
                apiResponseErr(
                    null,
                    false,
                    statusCode.internalServerError,
                    error.message
                )
            );
    }
};

export const superAdminResetPassword = async (req, res) => {
    try {
      const { userName, oldPassword, newPassword } = req.body;
  
      const existingUser = await admins.findOne({ where: { userName } });

      if(!existingUser){
        return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Admin not Found'));
      }
  
      const isPasswordMatch = await bcrypt.compare(oldPassword, existingUser.password);
      if (!isPasswordMatch) {
        return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Invalid old password.'));
      }
      const passwordIsDuplicate = await bcrypt.compare(newPassword, existingUser.password);
      if (passwordIsDuplicate) {
          return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'New Password Cannot Be The Same As Existing Password'));
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      await existingUser.update({ password: hashedPassword, isReset: false });
  
      return res.status(statusCode.success).send(apiResponseSuccess(null, true, statusCode.success, 'Password reset successfully.'));
    } catch (error) {
      res.status(statusCode.internalServerError).send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
    }
  };

