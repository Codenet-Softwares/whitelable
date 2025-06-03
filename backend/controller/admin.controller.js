import { apiResponseErr, apiResponseSuccess } from '../helper/errorHandler.js';
import { v4 as uuid4 } from 'uuid';
import bcrypt from 'bcrypt';
import admins from '../models/admin.model.js';
import { messages, string } from '../constructor/string.js';
import { Op, fn, col, Sequelize } from 'sequelize';
import { sql, sequelize } from '../db.js';
import { statusCode } from '../helper/statusCodes.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { admin_Balance, balance_hierarchy } from './transaction.controller.js';
import { findCreatorHierarchy } from '../helper/createHierarchy.js';
import { getAllConnectedUsers, getHierarchyUsers } from '../controller/lotteryGame.controller.js'
import Permission from '../models/permissions.model.js';
import CreditRef from '../models/creditRefs.model.js';
import Partnership from '../models/partnerships.model.js';

dotenv.config();

/**
 *Op refers to the set of operators provided by Sequelize's query language ,
 *fn is function for call SQL functions directly within your Sequelize queries,
 *col function is used to reference a column in your database within a Sequelize query
 **/

const globalUsernames = [];
// done
export const createAdmin = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;

    const { userName, password, role } = req.body;

    const checkRolesMap = {
      [string.superAdmin]: [
        string.whiteLabel,
        string.hyperAgent,
        string.superAgent,
        string.masterAgent,
      ],
      [string.whiteLabel]: [
        string.superAgent,
        string.hyperAgent,
        string.masterAgent,
        string.user,
      ],
      [string.hyperAgent]: [
        string.superAgent,
        string.masterAgent,
        string.user,
      ],
      [string.superAgent]: [
        string.masterAgent,
        string.user,
      ],
      [string.masterAgent]: [string.user],
    };

    const allowedRoles = checkRolesMap[user.role] || [];

    const isValidRole = allowedRoles.includes(role);

    if (!isValidRole) {
      return res.status(statusCode.forbidden).send(
        apiResponseErr(null, false, statusCode.forbidden, "You are not authorized to create one or more of the specified roles.")
      );
    }

    const isUserRole = role === string.user;

    const [existingAdmin, existingTrashUser] = await Promise.all([
      admins.findOne({ where: { userName } }),
    ]);

    if (existingAdmin || existingTrashUser) {
      const errorMessage = isUserRole ? messages.userExists : messages.adminExists;
      throw apiResponseErr(null, false, statusCode.exist, errorMessage);
    }

    if (user.isActive === false) {
      throw apiResponseErr(null, false, statusCode.badRequest, "Account is inactive");
    }

    if (user.locked === false) {
      throw apiResponseErr(null, false, statusCode.unauthorize, "Account is locked");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = await admins.create({
      adminId: uuid4(),
      userName,
      password: hashedPassword,
      role,
      createdById: user.adminId,
      createdByUser: user.userName,
    }, { transaction });

    await Permission.create({
      UserId: newAdmin.adminId,
      permission: 'all-access',
    }, { transaction })

    const token = jwt.sign({ role: req.user.role }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });


    let message = '';

    if (isUserRole) {
      const dataToSend = {
        userId: newAdmin.adminId,
        userName,
        password,
      };

      try {
        const baseUrl = process.env.COLOR_GAME_URL;

        const response = await axios.post(`${baseUrl}/api/user-create`, dataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        //console.log(response, "response");

        if (!response.data.success) {
          throw new Error('Failed to create user');
        } else {
          message = 'successfully';
        }
      } catch (error) {
        console.error("Error from API:", error.response ? error.response.data : error.message);
        throw new Error('Failed to create user in external system');
      }
    }

    const isSubRole = [
      string.subWhiteLabel,
      string.subAdmin,
      string.subHyperAgent,
      string.subSuperAgent,
      string.subMasterAgent,
    ].includes(user.role);

    if (isSubRole) {
      await newAdmin.update({ createdById: user.createdById || user.adminId }, { transaction });
    }
    // if (user.adminId) {
    //   await calculateLoadBalance(user.adminId, transaction);
    // }

    await transaction.commit();
    const successMessage = isUserRole ? 'User created' : 'Admin created successfully';

    return res.status(statusCode.create).send(apiResponseSuccess(null, true, statusCode.create, successMessage));
  } catch (error) {
    console.error("Error during creation:", error);
    await transaction.rollback();
    return res.status(statusCode.internalServerError).send(apiResponseErr(null, false, statusCode.internalServerError, error.errMessage));
  };
}

// done
export const createSubAdmin = async (req, res) => {
  try {
    const { userName, password, permission } = req.body;
    const user = req.user;

    if (user.isActive === false) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.accountInactive));
    }

    const existingAdmin = await admins.findOne({ where: { userName } });
    if (existingAdmin) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.adminExists));
    }

    let subRole = '';
    switch (user.role) {
      case string.superAdmin:
        subRole = string.subAdmin;
        break;
      case string.whiteLabel:
        subRole = string.subWhiteLabel;
        break;
      case string.hyperAgent:
        subRole = string.subHyperAgent;
        break;
      case string.superAgent:
        subRole = string.subSuperAgent;
        break;
      case string.masterAgent:
        subRole = string.subMasterAgent;
        break;
      default:
        return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.invalidRole));
    }

    const adminId = uuid4();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newSubAdmin = await admins.create({
      adminId,
      userName,
      password: hashedPassword,
      role: subRole,
      createdById: user.adminId,
      createdByUser: user.userName,
    });

    if (Array.isArray(permission)) {
      const permissionData = permission.map((perm) => ({
        UserId: adminId,
        permission: perm,
      }));
      await Permission.bulkCreate(permissionData);
    }
    return res.status(statusCode.create).json(apiResponseSuccess(newSubAdmin, true, statusCode.create, messages.subAdminCreated));
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

// done
export const getIpDetail = async (req, res) => {
  try {
    const userName = req.params.userName;
    let admin = await admins.findOne({ where: { userName } });
    if (!admin) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.adminNotFound));
    }
    const loginTime = admin.lastLoginTime;
    let clientIP = req.ip;
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const forwardedIps = forwardedFor.split(',');
      clientIP = forwardedIps[0].trim();
    }
    const data = await fetch(`http://ip-api.com/json/${clientIP}`);
    const collect = await data.json();
    await admins.update({ lastLoginTime: loginTime }, { where: { userName } });
    const responseObj = {
      userName: admin.userName,
      ip: {
        iP: clientIP,
        country: collect.country,
        region: collect.regionName,
        timezone: collect.timezone,
        isp: collect.isp
      },
      lastLoginTime: admin.lastLoginTime,
      loginStatus: admin.loginStatus,
      isActive: admin.isActive,
      locked: admin.locked,
      lastLoginTime: loginTime,
    };
    return res.status(statusCode.success).json(apiResponseSuccess(responseObj, null, statusCode.success, true, 'Data Fetched'));
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const calculateLoadBalance = async (adminId) => {
  try {
    const [result] = await sql.query(
      'SELECT getLoadBalance(?)',
      [adminId]
    );
    console.log("result", result);
    const totalBalance = result[0]?.totalBalance ?? 0;
    return totalBalance;
  } catch (error) {
    console.error('Error calculating load balance:', error);
    return null;
  }
};

export const calculateExposure = async (adminId) => {
  try {
    const [result] = await sql.query(
      'SELECT getExposure(?)',
      [adminId]
    );
    const totalExposure = result[0]?.totalBalance ?? 0;
    return totalExposure;
  } catch (error) {
    console.error('Error calculating load balance:', error);
    return null;
  }
};

// done
export const viewAllCreates = async (req, res) => {
  try {
    const createdById = req.params.createdById;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const userName = req.query.userName || '';

    const [results] = await sql.query(
      `CALL getAllAdminData(?,?,?,?)`,
      [userName, createdById, pageSize, page]
    );

    const users = results[0];
    const totalRecords = results[1][0]?.totalCount || 0;
    const totalPages = Math.ceil(totalRecords / pageSize);

    return res.status(statusCode.success).json(
      apiResponseSuccess(users, true, statusCode.success, messages.success, {
        totalRecords,
        totalPages,
        currentPage: page,
        pageSize,
      })
    );
  } catch (error) {
    console.log("error", error);
    return res.status(statusCode.internalServerError).json(
      apiResponseErr(
        error.data ?? null,
        false,
        error.responseCode ?? statusCode.internalServerError,
        error.errMessage ?? error.message
      )
    );
  }
};


// done
export const viewAllSubAdminCreates = async (req, res) => {
  try {
    const createdById = req.params.createdById;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const userName = req.query.userName || '';

    const [results] = await sql.query(
      `CALL getAllSubAdminData(?,?,?,?)`,
      [userName, createdById, pageSize, page]
    );

    const users = results[0];
    const totalRecords = results[1][0]?.totalCount || 0;
    const totalPages = Math.ceil(totalRecords / pageSize);

    return res.status(statusCode.success).json(
      apiResponseSuccess(users, true, statusCode.success, messages.success, {
        totalRecords,
        totalPages,
        currentPage: page,
        pageSize,
      })
    );
  } catch (error) {
    return res.status(statusCode.internalServerError).json(
      apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message),
    );
  }
};
// done
export const addCreditRef = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const authAdmin = req.user;
    const { creditRef, password } = req.body;

    if (typeof creditRef !== 'number') {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'CreditRef must be a number'));
    }
    const admin = await admins.findOne({ where: { adminId } });
    if (!admin) {
      return res.status(statusCode.notFound).json(apiResponseErr(null, false, statusCode.notFound, messages.adminNotFound));
    }

    const isPasswordValid = await bcrypt.compare(password, authAdmin.password);
    if (!isPasswordValid) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.invalidPassword));
    }
    if (!admin.isActive) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, "Account is suspend"));
    }
    if (admin.locked === false) {
      return res.status(statusCode.unauthorize).json(apiResponseErr(null, false, statusCode.unauthorize, "Account is locked"));
    }

    const newCreditRefEntry = await CreditRef.create({
      UserId: admin.adminId,
      CreditRef: creditRef,
    });

    const adminDetails = {
      adminId: admin.adminId,
      userName: admin.userName,
    };

    return res.status(statusCode.success).json(apiResponseSuccess({ adminDetails, creditRef: newCreditRefEntry }, true, statusCode.success, 'CreditRef add successfully'));
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};
// done
export const addPartnership = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const authAdmin = req.user;
    const { partnership, password } = req.body;

    if (typeof partnership !== 'number') {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.numberPartnership));
    }

    const admin = await admins.findOne({ where: { adminId } });
    if (!admin) {
      return res.status(statusCode.notFound).json(apiResponseErr(null, false, statusCode.notFound, messages.adminNotFound));
    }

    const isPasswordValid = await bcrypt.compare(password, authAdmin.password);
    if (!isPasswordValid) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.invalidPassword));
    }

    if (!admin.isActive) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, "Account is suspend"));
    }
    if (admin.locked === false) {
      return res.status(statusCode.unauthorize).json(apiResponseErr(null, false, statusCode.unauthorize, "Account is locked"));
    }

    const newPartnershipEntry = await Partnership.create({
      UserId: admin.adminId,
      partnership: partnership,
    });

    const adminDetails = {
      adminId: admin.adminId,
      userName: admin.userName,
    };
    return res.status(statusCode.success).json(apiResponseSuccess({ adminDetails, partnerships: newPartnershipEntry }, true, statusCode.success, 'Partnership Add successfully'));
  } catch (error) {
    return res.status(statusCode.internalServerError).json(
      apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message)
    );
  }
};
// done
export const partnershipView = async (req, res) => {
  try {
    const adminId = req.params.adminId;

    const admin = await admins.findOne({ where: { adminId } });
    if (!admin) {
      return res.status(statusCode.notFound).json(apiResponseErr(null, false, statusCode.notFound, messages.adminNotFound));
    }

    const partnershipsData = await Partnership.findAll({
      where: { UserId: admin.adminId },
      order: [['id', 'DESC']],
      limit: 10,
    })

    if (!partnershipsData || partnershipsData.length === 0) {
      return res.status(statusCode.success).json(apiResponseErr(null, true, statusCode.success, messages.noRecordsFound));
    }

    const result = partnershipsData.map((item) => {
      return {
        userName: admin.userName,
        partnerships: item.partnership,
        date: item.createdAt,
      };
    });

    return res.status(statusCode.success).json(apiResponseSuccess(result, true, statusCode.success, messages.success));
  } catch (error) {
    return res.status(statusCode.internalServerError).send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};
// done
export const creditRefView = async (req, res) => {
  try {
    const adminId = req.params.adminId;

    const admin = await admins.findOne({ where: { adminId } });
    if (!admin) {
      return res.status(statusCode.notFound).json(apiResponseErr(null, false, statusCode.notFound, messages.adminNotFound));
    }

    const creditRefsData = await CreditRef.findAll({
      where: { UserId: admin.adminId },
      order: [['id', 'DESC']],
      limit: 10,
    })

    if (!creditRefsData || creditRefsData.length === 0) {
      return res.status(statusCode.success).json(apiResponseErr(null, true, statusCode.success, messages.noRecordsFound));
    }

    const result = creditRefsData.map((item) => {
      return {
        userName: admin.userName,
        creditRef: item.CreditRef,
        date: item.createdAt,
      };
    });


    return res.status(statusCode.success).json(apiResponseSuccess(result, true, statusCode.success, messages.success));
  } catch (error) {
    return res.status(statusCode.internalServerError).send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};
// done
export const activeStatus = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const activateStatus = await admins.findOne({ where: { adminId } });
    const active = {
      adminId: activateStatus.adminId,
      isActive: activateStatus.isActive,
      locked: activateStatus.locked,
      status: activateStatus.isActive ? "Active" : !activateStatus.locked ? "Locked" : !activateStatus.isActive ? "Suspended" : ""

    };
    return res.status(statusCode.success).json(apiResponseSuccess(active, null, statusCode.success, true, 'successfully'));
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};
// done
export const profileView = async (req, res) => {
  try {
    const userName = req.params.userName;
    const admin = await admins.findOne({ where: { userName } });
    if (!admin) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.adminNotFound));
    }
    const transferData = {
      adminId: admin.adminId,
      role: admin.role,
      userName: admin.userName,
      createdById: admin.createdById
    };
    return res.status(statusCode.success).json(apiResponseSuccess(transferData, true, statusCode.success, 'successfully'));
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};
// done NOT IN USE
// export const buildRootPath = async (req, res) => {
//   try {
//     const { userName, action } = req.params;
//     const searchName = req.query.userName || '';
//     const page = parseInt(req.query.page, 10) || 1;
//     const pageSize = parseInt(req.query.pageSize, 10) || 10;

//     const [results] = await sql.query(
//       `CALL getAllAdminDataByPath(?,?,?,?,?)`,
//       [searchName, userName, action, pageSize, page]
//     );
    
//     const users = results[0];
//     const totalRecords = results[1][0]?.totalCount || 0;
//     const totalPages = Math.ceil(totalRecords / pageSize);

//     return res.status(statusCode.success).json(
//       apiResponseSuccess(users, true, statusCode.success, messages.success, {
//         totalRecords,
//         totalPages,
//         currentPage: page,
//         pageSize,
//       })
//     );
    
//   } catch (error) {
//     return res
//       .status(statusCode.internalServerError)
//       .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
//   }
// };


// done
export const viewSubAdmins = async (req, res) => {
  try {
    const id = req.params.adminId;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 5;
    const searchName = req.query.searchName || '';

    const allowedRoles = [
      string.subAdmin,
      string.subHyperAgent,
      string.subMasterAgent,
      string.subWhiteLabel,
      string.subSuperAgent
    ];

    const subAdmins = await admins.findAll({
      attributes: ['adminId', 'userName', 'role', 'isActive', 'locked'],
      where: {
        createdById: id,
        role: {
          [Op.or]: allowedRoles
        },
        userName: {
          [Op.like]: `%${searchName}%`
        }
      },
    });

    if (!subAdmins || subAdmins.length === 0) {
      return res.status(statusCode.notFound).json(apiResponseErr(null, false, statusCode.notFound, 'No data found'));
    }

    const users = subAdmins.map(user => ({
      adminId: user.adminId,
      userName: user.userName,
      role: user.role,
      status: user.isActive ? "Active" : !user.locked ? "Locked" : !user.isActive ? "Suspended" : ""
    }));

    const totalCount = users.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedUsers = users.slice((page - 1) * pageSize, page * pageSize);

    return res.status(statusCode.success).json(apiResponseSuccess(paginatedUsers, true, statusCode.success, messages.success, {
      currentPage: page,
      totalPages: totalPages,
      totalCount: totalCount,
    }));
  } catch (error) {
    return res.status(statusCode.internalServerError).json(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};
// done
export const singleSubAdmin = async (req, res) => {
  try {
    const adminId = req.params.adminId;

    const subAdmin = await admins.findOne({
      attributes: ['userName', 'role'],
      where: {
        adminId: adminId
      }
    });

    if (!subAdmin) {
      return res.status(statusCode.notFound).json(apiResponseErr(null, false, statusCode.notFound, 'Sub Admin not found with the given Id'));
    }

    const permissions = await Permission.findAll({
      where: { UserId: adminId },
      attributes: ['permission']
    })

    const permissionValues = permissions.map(permission => permission.permission);

    const data = {
      userName: subAdmin.userName,
      role: subAdmin.role,
      permission: permissionValues,
    };

    return res.status(statusCode.success).json(apiResponseSuccess(data, true, statusCode.success, messages.success));
  } catch (error) {
    res.status(statusCode.internalServerError).json(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};
// done
export const subAdminPermission = async (req, res) => {
  try {
    const subAdminId = req.params.adminId;
    const { permission } = req.body;

    if (!subAdminId) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'Id not found'));
    }

    const subAdmin = await admins.findOne({
      where: {
        adminId: subAdminId
      }
    });

    if (!subAdmin) {
      return res.status(statusCode.notFound).json(apiResponseErr(null, false, statusCode.notFound, 'Sub Admin not found'));
    }

    let role = subAdmin.role;

    if (!role || role.length === 0) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'Roles not found for Sub Admin'));
    }

    const permissionsArray = Array.isArray(permission) ? permission : [permission];

    await Permission.destroy({
      where: { UserId: subAdminId }
    });

    const bulkPermissions = permissionsArray.map(per => ({
      UserId: subAdminId,
      permission: per
    }));

    await Permission.bulkCreate(bulkPermissions);

    return res.status(statusCode.success).json(apiResponseSuccess(bulkPermissions, true, statusCode.success, `${subAdmin.userName} permissions edited successfully`));
  } catch (error) {
    res.status(statusCode.internalServerError).json(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};
// done
export const userStatus = async (req, res) => {
  try {
    const userName = req.params.userName;

    const user = await admins.findOne({
      where: {
        userName: userName
      }
    });

    if (!user) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.userNotFound));
    }

    const userStatus = {
      status: user.isActive ? "Active" : !user.locked ? "Locked" : !user.isActive ? "Suspended" : ""
    };

    return res.status(statusCode.success).json(apiResponseSuccess(userStatus, true, statusCode.success, messages.success));
  } catch (error) {
    res.status(statusCode.internalServerError).json(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const syncWithUserBackend = async (req, res) => {
  try {
    const { amount, userId, exposure } = req.body;

    const user = await admins.findOne({ where: { adminId: userId } });
    if (!user) {
      return res
        .status(statusCode.badRequest)
        .json(apiResponseErr(null, false, statusCode.badRequest, 'User Not Found'));
    }


    await admins.update(
      { balance: amount, exposure, loadBalance: amount },
      { where: { adminId: userId } },
    );

    if (user.createdById) {
      await calculateLoadBalance(user.createdById);
    }

    return res
      .status(statusCode.success)
      .json(apiResponseSuccess(null, true, statusCode.success, 'Balance updated successful'));
  } catch (error) {
    console.error('Error sending balance:', error);
    res
      .status(statusCode.internalServerError)
      .json(apiResponseErr(null, false, statusCode.internalServerError, error.message));
  }
};

export const fetchUserHierarchy = async (req, res) => {
  const { userName } = req.params;
  try {
    const hierarchy = await findCreatorHierarchy(userName);

    if (!hierarchy) {
      return res
        .status(statusCode.notFound)
        .json(apiResponseErr(null, false, statusCode.notFound, 'User Not Found'));
    }

    const formattedHierarchy = hierarchy.map(item => ({
      userName: item.userName,
      createdByUser: item.createdByUser,
      createdById: item.createdById,
      roles: item.roles,
    }));
    return res
      .status(statusCode.success)
      .json(apiResponseSuccess(formattedHierarchy, true, statusCode.success, 'Hierarchy retractive successfully'));
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .json(apiResponseErr(null, false, statusCode.internalServerError, error.message));
  }
};

export const getHierarchyWiseUsers = async (req, res) => {
  try {
    const { userName } = req.params;

    const getAllowedUserNames = async (userName) => {
      const users = await admins.findAll({
        where: {
          createdByUser: userName,
        },
        attributes: ["adminId", "userName", "createdByUser", "role"],
      });

      let allowedUserNames = [];
      for (const user of users) {
        const nestedUsers = await getAllowedUserNames(user.userName);
        allowedUserNames.push({
          userId: user.adminId,
          userName: user.userName,
          role: user.role,
        });
        allowedUserNames = allowedUserNames.concat(nestedUsers);
      }
      return allowedUserNames;
    };

    const hierarchyWiseUsers = await getAllowedUserNames(userName);

    const filteredUsers = hierarchyWiseUsers.filter((user) => {
      if (!user.role) return false;

      if (Array.isArray(user.role)) {
        return user.role.some((roleObj) => roleObj.role === "user");
      }

      return user.role === "user";
    });


    const formattedData = {
      users: filteredUsers.map((user) => ({
        userId: user.userId,
        userName: user.userName,
      })),
    };

    return res.status(statusCode.success).send(
      apiResponseSuccess(
        formattedData,
        true,
        statusCode.success,
        "Hierarchy-wise users fetched successfully"
      )
    );
  } catch (error) {
    res.status(statusCode.internalServerError).send(
      apiResponseErr(
        null,
        false,
        statusCode.internalServerError,
        error.message
      )
    );
  }
};


export const downLineUsers = async (req, res) => {
  try {
    const createdById = req.params.createdById;
    const searchTerm = req.query.searchTerm || '';
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const {dataType,startDate, endDate} = req.query;

    let profitLossResponse = { data: [] };
    try {
     const baseURL = process.env.COLOR_GAME_URL;
      const response = await axios.get(`${baseURL}/api/user-profit-loss`,
        {
          params: {
            dataType,
            startDate,
            endDate
          }
        }
      );
      if (response.data.success) {
        profitLossResponse = response.data;
      }
    } catch (error) {
      console.error("Error fetching profit/loss data:", error.message);
    }

    const profitLossMap = {};
    profitLossResponse.data.forEach(user => {
      profitLossMap[user.userId] = parseFloat(user.profitLoss) || 0;
    });

    const allAdmins = await admins.findAll({
      raw: true,
      attributes: ['adminId', 'userName', 'role', 'createdById']
    });

    const downlineMap = {};
    allAdmins.forEach(admin => {
      if (!downlineMap[admin.createdById]) {
        downlineMap[admin.createdById] = [];
      }
      downlineMap[admin.createdById].push(admin);
    });

    const getPrimaryRole = (roles) => {
      if (!roles || !roles.length) return null;
      return roles; 
    };

    const calculateDownlineProfitLoss = (adminId, role) => {
      let total = 0;
      const queue = [...(downlineMap[adminId] || [])];

      while (queue.length > 0) {
        const current = queue.shift();
        if (current.adminId !== adminId) {
          total += profitLossMap[current.adminId] || 0;
        }

        const currentRole = getPrimaryRole(current.role);

        if (role === string.whiteLabel) {
          if ([string.hyperAgent, string.superAgent, string.masterAgent, string.user].includes(currentRole)) {
            queue.push(...(downlineMap[current.adminId] || []));
          }
        }
        else if (role === string.hyperAgent) {
          if ([string.superAgent, string.masterAgent, string.user].includes(currentRole)) {
            queue.push(...(downlineMap[current.adminId] || []));
          }
        }
        else if (role === string.superAgent) {
          if ([string.masterAgent, string.user].includes(currentRole)) {
            queue.push(...(downlineMap[current.adminId] || []));
          }
        }
        else if (role === string.masterAgent) {
          if ([string.user].includes(currentRole)) {
            queue.push(...(downlineMap[current.adminId] || []));
          }
        }
      }

      return total;
    };

    const allowedRoles = [
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent,
      string.user,
    ];

    const baseWhere = {
      createdById,
      role: {
        [Op.in]: allowedRoles,
      },
    };

    if (searchTerm) {
      baseWhere.userName = {
        [Op.like]: `%${searchTerm}%`,
      };
    }

    const totalRecords = await admins.count({
      where: baseWhere
    });

    if (totalRecords === 0) {
      return res.status(statusCode.success).json({
        data: [],
        success: true,
        successCode: statusCode.success,
        message: messages.noRecordsFound,
        pagination: {
          totalRecords: 0,
          totalPages: 0,
          currentPage: page,
          pageSize
        }
      });
    }

    const offset = (page - 1) * pageSize;
    const adminsData = await admins.findAll({
      where: baseWhere,
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
      raw: true
    });

    const users = adminsData.map((admin) => {
      const primaryRole = getPrimaryRole(admin.role);
      const personalProfitLoss = (profitLossMap[admin.adminId] || 0);
      let downLineProfitLoss = 0;

      if ([string.masterAgent, string.superAgent, string.hyperAgent, string.whiteLabel].includes(primaryRole)) {
        downLineProfitLoss = calculateDownlineProfitLoss(admin.adminId, primaryRole);
      }

      const agentProfitLoss = [string.masterAgent, string.superAgent, string.hyperAgent, string.whiteLabel].includes(primaryRole)
        ? (personalProfitLoss + downLineProfitLoss).toFixed(2)
        : personalProfitLoss.toFixed(2);

      const commission = "0";

      return {
        adminId: admin.adminId,
        userName: admin.userName,
        role: admin.role,
        createdById: admin.createdById,
        createdByUser: admin.createdByUser,
        profitLoss: agentProfitLoss,
        downLineProfitLoss: [string.masterAgent, string.superAgent, string.hyperAgent, string.whiteLabel].includes(primaryRole)
          ? agentProfitLoss
          : downLineProfitLoss.toFixed(2),
        commission: commission
      };
    });

    const totalPages = Math.ceil(totalRecords / pageSize);

    return res.status(statusCode.success).json({
      data: users,
      success: true,
      successCode: statusCode.success,
      message: messages.success,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: page,
        pageSize,
      }
    });
  } catch (error) {
    if (error.response) {
      return apiResponseErr(
        null,
        false,
        error.response.status,
        error.response.data.message || error.response.data.errMessage,
        res
      );
    } else {
      return apiResponseErr(
        null,
        false,
        statusCode.internalServerError,
        error.message,
        res
      );
    }
  }
};


export const getTotalProfitLoss = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = "", dataType, startDate, endDate } = req.query;
    const offset = (page - 1) * pageSize;
    const adminId = req.user?.adminId;
    const userId = await getHierarchyUsers(adminId);
    const token = jwt.sign(
      { role: req.user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const baseURL = process.env.COLOR_GAME_URL;
    const response = await axios.post(
      `${baseURL}/api/external-profit_loss`,
      {
        userId,
      },
      {
        headers,
        params: {
          dataType,
          startDate,
          endDate
        },
      }
    );

    let data = Array.isArray(response.data)
      ? response.data
      : response.data?.data || [];

    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter((item) =>
        item.gameName?.toLowerCase().includes(searchLower)
      );
    }

    if (data.length == 0) {
      return res
        .status(statusCode.success)
        .send(
          apiResponseSuccess([], true, statusCode.success, "Data not found!")
        );
    }

    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedData = data.slice(offset, offset + parseInt(pageSize));

    const Pagination = {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages,
      totalItems,
    };

    return res
      .status(statusCode.success)
      .send(
        apiResponseSuccess(
          paginatedData,
          true,
          statusCode.success,
          "Hierarchy-wise porfit/loss fetched successfully",
          Pagination
        )
      );
  } catch (error) {
    if (error.response) {
      return apiResponseErr(
        null,
        false,
        error.response.status,
        error.response.data.message || error.response.data.errMessage,
        res
      );
    } else {
      return apiResponseErr(
        null,
        false,
        statusCode.internalServerError,
        error.message,
        res
      );
    }
  }
};

export const getMarketWiseProfitLoss = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = "", type, dataType, startDate, endDate } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const adminId = req.user?.adminId;
    const userId = await getHierarchyUsers(adminId);

    const token = jwt.sign(
      { role: req.user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const baseURL = process.env.COLOR_GAME_URL;
    const response = await axios.post(
      `${baseURL}/api/external/market-wise-profit-loss`,
      {
        userId,
      },
      {
        headers,
        params: {
          type,
          dataType,
          startDate,
          endDate
        },
      }
    );

    let data = Array.isArray(response.data)
      ? response.data
      : response.data?.data || [];

    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter((item) =>
        item.marketName?.toLowerCase().includes(searchLower)
      );
    }

    if (data.length == 0) {
      return res
        .status(statusCode.success)
        .send(
          apiResponseSuccess([], true, statusCode.success, "Data not found!")
        );
    };

    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / parseInt(pageSize));
    const paginatedData = data.slice(offset, offset + parseInt(pageSize));

    const Pagination = {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages,
      totalItems,
    };

    return res
      .status(statusCode.success)
      .send(
        apiResponseSuccess(
          paginatedData,
          true,
          statusCode.success,
          "Market-wise porfit/loss fetched successfully",
          Pagination
        )
      );
  } catch (error) {
    if (error.response) {
      return apiResponseErr(
        null,
        false,
        error.response.status,
        error.response.data.message || error.response.data.errMessage,
        res
      );
    } else {
      return apiResponseErr(
        null,
        false,
        statusCode.internalServerError,
        error.message,
        res
      );
    }
  }
};

export const getAllUserProfitLoss = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = "", dataType, startDate, endDate } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const adminId = req.user?.adminId;
    const userId = await getHierarchyUsers(adminId);

    const token = jwt.sign(
      { role: req.user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const baseURL = process.env.COLOR_GAME_URL;
    const response = await axios.post(
      `${baseURL}/api/external/allUser-profit-loss/${req.params.marketId}`,
      {
        userId,
      },
      {
        headers,
        params: {
          dataType,
          startDate,
          endDate
        },
      }
    );

    let data = Array.isArray(response.data)
      ? response.data
      : response.data?.data || [];

    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter((item) =>
        item.userName?.toLowerCase().includes(searchLower)
      );
    }

    if (data.length == 0) {
      return res
        .status(statusCode.success)
        .send(
          apiResponseSuccess([], true, statusCode.success, "Data not found!")
        );
    };

    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / parseInt(pageSize));
    const paginatedData = data.slice(offset, offset + parseInt(pageSize));

    const Pagination = {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages,
      totalItems,
    };

    return res
      .status(statusCode.success)
      .send(
        apiResponseSuccess(
          paginatedData,
          true,
          statusCode.success,
          "Market-wise all-user porfit/loss fetched successfully",
          Pagination
        )
      );
  } catch (error) {
    if (error.response) {
      return apiResponseErr(
        null,
        false,
        error.response.status,
        error.response.data.message || error.response.data.errMessage,
        res
      );
    } else {
      return apiResponseErr(
        null,
        false,
        statusCode.internalServerError,
        error.message,
        res
      );
    }
  }
}


