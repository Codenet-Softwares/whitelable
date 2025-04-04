import { apiResponseErr, apiResponseSuccess } from '../helper/errorHandler.js';
import { v4 as uuid4 } from 'uuid';
import bcrypt from 'bcrypt';
import admins from '../models/admin.model.js';
import { messages, string } from '../constructor/string.js';
import { Op, fn, col, Sequelize } from 'sequelize';
import sequelize from '../db.js';
import { statusCode } from '../helper/statusCodes.js';
import trash from '../models/trash.model.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { admin_Balance, balance_hierarchy } from './transaction.controller.js';
import { findCreatorHierarchy } from '../helper/createHierarchy.js';
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
    const { userName, password, roles } = req.body;
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

    const allowedRoles = checkRolesMap[user.roles[0].role] || [];

    const isValidRole = roles.every((role) => allowedRoles.includes(role));
    if (!isValidRole) {
      return res.status(statusCode.forbidden).send(
        apiResponseErr(null, false, statusCode.forbidden, "You are not authorized to create one or more of the specified roles.")
      );
    }
    const isUserRole = roles.includes(string.user)
    const [existingAdmin, existingTrashUser] = await Promise.all([
      admins.findOne({ where: { userName } }),
      trash.findOne({ where: { userName } }),
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

    const defaultPermission = ['all-access'];
    const rolesWithDefaultPermission = roles.map((role) => ({
      role,
      permission: defaultPermission,
    }));

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = await admins.create({
      adminId: uuid4(),
      userName,
      password: hashedPassword,
      roles: rolesWithDefaultPermission,
      createdById: user.adminId,
      createdByUser: user.userName,
    }, { transaction });

    const token = jwt.sign({ roles: req.user.roles }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

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
    ].includes(user.roles[0].role);

    if (isSubRole) {
      await newAdmin.update({ createdById: user.createdById || user.adminId }, { transaction });
    }
    if (user.adminId) {
      await calculateLoadBalance(user.adminId, transaction);
    }

    await transaction.commit();
    const successMessage = isUserRole ? 'User created' : 'Admin created successfully';

    return res.status(statusCode.create).send(apiResponseSuccess(null, true, statusCode.create, successMessage + " " + message));
  } catch (error) {
    console.error("Error during creation:", error.message);
    await transaction.rollback();
    return res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(null, false, statusCode.internalServerError, error.errMessage));
  };
}

// done
export const createSubAdmin = async (req, res) => {
  try {
    const { userName, password, roles } = req.body;
    const user = req.user;

    if (user.isActive === false) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.accountInactive));
    }

    const existingAdmin = await admins.findOne({ where: { userName } });
    if (existingAdmin) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.adminExists));
    }

    const existingTrashAdmin = await trash.findOne({ where: { userName } });
    if (existingTrashAdmin) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, "Admin is exist in trash. Please restore or delete it."));
    }

    let subRole = '';
    for (let i = 0; i < user.roles.length; i++) {
      if (user.roles[i].role.includes(string.superAdmin)) {
        subRole = string.subAdmin;
      } else if (user.roles[i].role.includes(string.whiteLabel)) {
        subRole = string.subWhiteLabel;
      } else if (user.roles[i].role.includes(string.hyperAgent)) {
        subRole = string.subHyperAgent;
      } else if (user.roles[i].role.includes(string.superAgent)) {
        subRole = string.subSuperAgent;
      } else if (user.roles[i].role.includes(string.masterAgent)) {
        subRole = string.subMasterAgent;
      } else {
        return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.invalidRole));
      }
    }

    const adminId = uuid4();
    const createdByUser = user.userName;
    const createdById = user.adminId;

    const permissionsArray = Array.isArray(roles[0].permission) ? roles[0].permission : [roles[0].permission];

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newSubAdmin = await admins.create({
      adminId,
      userName,
      password: hashedPassword,
      roles: [{ role: subRole, permission: permissionsArray }],
      createdById,
      createdByUser,
    });

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
  let loadBalance = 0
  let totalBalance

  const admin = await admins.findOne({ where: { adminId } });
  if (!admin) return 0;

  const adminBalance = await admin_Balance(admin.adminId)
  const hierarchyBalance = await balance_hierarchy(admin.adminId)

  let exposure
  if (admin.roles[0].role === string.user) {
    const baseUrl = process.env.COLOR_GAME_URL;
    const user_Exposure = await axios.get(`${baseUrl}/api/external/get-exposure/${admin.adminId}`)
    const { data } = user_Exposure
    exposure = data.exposure
  }
  
    totalBalance = adminBalance + (exposure ?? 0);

    const children = await admins.findAll({
      where: { createdById: adminId },
    });

    for (const child of children) {
      const childBalance = await calculateLoadBalance(child.adminId);
      totalBalance += childBalance;
    }

    if (loadBalance !== totalBalance) {
      loadBalance = totalBalance
    }
  return totalBalance;
  
};

export const calculateExposure = async (adminId) => {
  let loadExposure = 0;
  let totalExposure = 0;

  const admin = await admins.findOne({ where: { adminId } });
  if (!admin) return 0;

  let exposure = 0;

  if (admin.roles[0].role === string.user) {
    const baseUrl = process.env.COLOR_GAME_URL;
    try {
      const user_Exposure = await axios.get(`${baseUrl}/api/external/get-exposure/${admin.adminId}`);
      const { data } = user_Exposure;
      exposure = parseFloat(data.exposure) || 0;
    } catch (error) {
      console.error("Error fetching exposure:", error.message);
      exposure = 0;
    }
  }

  totalExposure = exposure;

  const children = await admins.findAll({
    where: { createdById: adminId },
  });

  for (const child of children) {
    let childExposure = await calculateExposure(child.adminId);

    childExposure = parseFloat(childExposure) || 0;
    totalExposure += childExposure;

  }

  if (loadExposure !== totalExposure) {
    loadExposure = totalExposure;
  }

  return totalExposure;
};

// done
export const viewAllCreates = async (req, res) => {
  try {
    const createdById = req.params.createdById;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 5;

    const searchQuery = req.query.userName ? { userName: { [Op.like]: `%${req.query.userName}%` } } : {};
    const allowedRoles = [
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent,
      string.user,
    ];

    const totalRecords = await admins.count({
      where: {
        createdById,
        ...searchQuery,
        [Op.or]: allowedRoles.map((role) =>
          fn('JSON_CONTAINS', col('roles'), JSON.stringify({ role }))
        ),
      },
    });

    if (totalRecords === 0) {
      return res
        .status(statusCode.success)
        .json(apiResponseSuccess(null, true, statusCode.success, messages.noRecordsFound));
    }

    const offset = (page - 1) * pageSize;
    const adminsData = await admins.findAll({
      where: {
        createdById,
        ...searchQuery,
        [Op.or]: allowedRoles.map((role) =>
          fn('JSON_CONTAINS', col('roles'), JSON.stringify({ role }))
        ),
      },
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
    });

    // Map through adminsData and calculate load balance
    const users = await Promise.all(
      adminsData.map(async (admin) => {
        let creditRefs = [];
        let partnerships = [];

        if (admin.creditRefs) {
          try {
            creditRefs = JSON.parse(admin.creditRefs);
          } catch {
            creditRefs = [];
          }
        }

        if (admin.partnerships) {
          try {
            partnerships = JSON.parse(admin.partnerships);
          } catch {
            partnerships = [];
          }
        }

        const adminBalance = await admin_Balance(admin.adminId);
        const loadBalance = await calculateLoadBalance(admin.adminId);
        const loadTotalExposure = await calculateExposure(admin.adminId);

        return {
          adminId: admin.adminId,
          userName: admin.userName,
          roles: admin.roles,
          balance: adminBalance,
          loadBalance, // Add loadBalance to response
          creditRefs,
          createdById: admin.createdById,
          createdByUser: admin.createdByUser,
          partnerships,
          status: admin.isActive
            ? 'Active'
            : !admin.locked
              ? 'Locked'
              : !admin.isActive
                ? 'Suspended'
                : '',
          exposure: loadTotalExposure,
        };
      })
    );

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

    const { page = 1, pageSize = 10, searchQuery = ""  } = req.query;
    const offset = (page - 1) * pageSize;

    const allowedRoles = [
      string.subAdmin,
      string.subHyperAgent,
      string.subMasterAgent,
      string.subWhiteLabel,
      string.subSuperAgent
    ];

    const whereCondition = { createdById, [Op.or]: allowedRoles.map(role => fn('JSON_CONTAINS', col('roles'), JSON.stringify({ role }))) }

    if(searchQuery)
    {
      whereCondition.userName = { [Op.like]: `%${searchQuery}%` }
    }

    const totalRecords = await admins.count({
      where: whereCondition,
      limit: parseInt(pageSize),
      offset,
      order: [['createdAt', 'DESC']],
    });

    if (totalRecords === 0) {
      return res.status(statusCode.success).json(apiResponseSuccess([], true, statusCode.success, messages.noRecordsFound));
    }

    const adminsData = await admins.findAll({
      where: whereCondition,
      limit: parseInt(pageSize),
      offset,
      order: [['createdAt', 'DESC']],
    });

    const users = adminsData.map(admin => {
      let creditRefs = [];
      let partnerships = [];

      if (admin.creditRefs) {
        try {
          creditRefs = JSON.parse(admin.creditRefs);
        } catch {
          creditRefs = [];
        }
      }

      if (admin.partnerships) {
        try {
          partnerships = JSON.parse(admin.partnerships);
        } catch {
          partnerships = [];
        }
      }

      return {
        adminId: admin.adminId,
        userName: admin.userName,
        roles: admin.roles,
        balance: admin.balance,
        loadBalance: admin.loadBalance,
        creditRefs,
        createdById: admin.createdById,
        createdByUser: admin.createdByUser,
        partnerships,
        status: admin.isActive ? "Active" : !admin.locked ? "Locked" : !admin.isActive ? "Suspended" : "",
        exposure: admin.exposure
      };
    });

    const totalPages = Math.ceil(totalRecords / pageSize);

    return res.status(statusCode.success).json(
      apiResponseSuccess(
        users,
        true,
        statusCode.success,
        messages.success,
        {
          totalRecords,
          totalPages,
          currentPage: parseInt(page),
          pageSize,
        }
      ),
    );
  } catch (error) {
    return res.status(statusCode.internalServerError).json(
      apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message),
    );
  }
};
// done
export const editCreditRef = async (req, res) => {
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

    const newCreditRefEntry = {
      value: creditRef,
      date: new Date(),
    };

    let creditRefList = [];
    if (typeof admin.creditRefs === 'string') {
      try {
        creditRefList = JSON.parse(admin.creditRefs);
      } catch (error) {
        return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.invalidCreditRes));
      }
    } else if (Array.isArray(admin.creditRefs)) {
      creditRefList = admin.creditRefs;
    }

    creditRefList.push(newCreditRefEntry);

    if (creditRefList.length > 10) {
      creditRefList.shift();
    }

    admin.creditRefs = JSON.stringify(creditRefList);
    await admin.save();

    const adminDetails = {
      adminId: admin.adminId,
      userName: admin.userName,
    };

    return res.status(statusCode.success).json(apiResponseSuccess({ adminDetails, creditRef: creditRefList }, true, statusCode.success, 'CreditRef Edited successfully'));
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};
// done
export const editPartnership = async (req, res) => {
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

    const newPartnershipEntry = {
      value: partnership,
      date: new Date(),
    };

    let partnershipsList;
    try {
      if (typeof admin.partnerships === 'string' && admin.partnerships.trim() !== '') {
        partnershipsList = JSON.parse(admin.partnerships);
      } else {
        partnershipsList = [];
      }
    } catch (error) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.invalidPartnership));
    }

    partnershipsList.push(newPartnershipEntry);
    if (partnershipsList.length > 10) {
      partnershipsList = partnershipsList.slice(-10);
    }

    admin.partnerships = JSON.stringify(partnershipsList);
    await admin.save();

    const adminDetails = {
      adminId: admin.adminId,
      userName: admin.userName,
    };

    return res.status(statusCode.success).json(apiResponseSuccess({ adminDetails, partnerships: partnershipsList }, true, statusCode.success, 'Partnership edited successfully'));
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

    let partnershipsList;
    if (typeof admin.partnerships === 'string') {
      try {
        partnershipsList = JSON.parse(admin.partnerships);
      } catch (error) {
        return res.status(statusCode.internalServerError).json(apiResponseErr(null, false, statusCode.internalServerError, messages.invalidPartnership));
      }
    } else if (Array.isArray(admin.partnerships)) {
      partnershipsList = admin.partnerships;
    } else {
      partnershipsList = [];
    }

    if (!Array.isArray(partnershipsList)) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'partnerships not found or not an array'));
    }

    const last10partnerships = partnershipsList.slice(-10);

    const transferData = {
      partnerships: last10partnerships,
      userName: admin.userName,
    };

    return res.status(statusCode.success).json(apiResponseSuccess(transferData, true, statusCode.success, messages.success));
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

    let creditRefList;
    if (typeof admin.creditRefs === 'string') {
      try {
        creditRefList = JSON.parse(admin.creditRefs);
      } catch (error) {
        return res.status(statusCode.internalServerError).json(apiResponseErr(null, false, statusCode.internalServerError, messages.invalidCreditRes));
      }
    } else if (Array.isArray(admin.creditRefs)) {
      creditRefList = admin.creditRefs;
    } else {
      creditRefList = [];
    }

    if (!Array.isArray(creditRefList)) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'creditRefs not found or not an array'));
    }

    const last10creditRefs = creditRefList.slice(-10);

    const transferData = {
      creditRefs: last10creditRefs,
      userName: admin.userName,
    };
    return res.status(statusCode.success).json(apiResponseSuccess(transferData, true, statusCode.success, messages.success));
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
      return res.status(statusCode.badRequest).json(apiResponseErr(null, statusCode.badRequest, false, messages.adminNotFound));
    }
    const transferData = {
      adminId: admin.adminId,
      roles: admin.roles,
      userName: admin.userName,
      createdById: admin.createdById
    };
    return res.status(statusCode.success).json(apiResponseSuccess(transferData, null, statusCode.success, true, 'successfully'));
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};
// done
export const buildRootPath = async (req, res) => {
  try {
    const { userName, action } = req.params;
    const searchName = req.query.searchName;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    const allowedRoles = [
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent,
      string.user
    ];
    if (!globalUsernames) {
      globalUsernames = [];
    }

    if (!userName) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'userName parameter is required'));
    }

    const user = await admins.findOne({ where: { userName } });

    if (!user) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.userNotFound));
    }

    if (action === 'store') {
      const newPath = user.userName;
      const indexToRemove = globalUsernames.indexOf(newPath);

      if (indexToRemove !== -1) {
        globalUsernames.splice(indexToRemove + 1);
      } else {
        globalUsernames.push(newPath);
      }

      const likeCondition = searchName ? { userName: { [Op.like]: `%${searchName}%` } } : {};
      const totalRecords = await admins.count({
        where: {
          createdByUser: user.userName,
          ...likeCondition,
          [Op.or]: allowedRoles.map(role => fn('JSON_CONTAINS', col('roles'), JSON.stringify({ role }))),
        },
      });

      const totalPages = Math.ceil(totalRecords / pageSize);

      const createdUsers = await admins.findAll({
        where: {
          createdByUser: user.userName,
          ...likeCondition,
          [Op.or]: allowedRoles.map(role => fn('JSON_CONTAINS', col('roles'), JSON.stringify({ role }))),
        },
        offset: (page - 1) * pageSize,
        limit: pageSize,
      });

      const createdUsersDetails = await Promise.all(
        createdUsers.map(async (createdUser) => {
          let creditRef = [];
          let refProfitLoss = [];
          let partnership = [];

          try {
            creditRef = createdUser.creditRefs ? JSON.parse(createdUser.creditRefs) : [];
            refProfitLoss = createdUser.refProfitLoss ? JSON.parse(createdUser.refProfitLoss) : [];
            partnership = createdUser.partnerships ? JSON.parse(createdUser.partnerships) : [];
          } catch (e) {
            console.error("JSON parsing error:", e);
          }

          const adminBalance = await admin_Balance(createdUser.adminId);
          const loadBalance = await calculateLoadBalance(createdUser.adminId);
          const loadTotalExposure = await calculateExposure(createdUser.adminId);

          return {
            id: createdUser.adminId,
            userName: createdUser.userName,
            roles: createdUser.roles,
            balance: adminBalance,
            loadBalance: loadBalance,
            creditRef: creditRef,
            refProfitLoss: refProfitLoss,
            partnership: partnership,
            status: createdUser.isActive
            ? 'Active'
            : !createdUser.locked
              ? 'Locked'
              : !createdUser.isActive
                ? 'Suspended'
                : '',
            exposure: loadTotalExposure,
          };
        })
      );

      const userDetails = { createdUsers: createdUsersDetails };
      const message = 'Path stored successfully';
      return res.status(statusCode.create).json(
        apiResponseSuccess(
          {
            path: globalUsernames,
            userDetails,
            page,
            pageSize,
            totalPages,
            totalRecords
          },
          true,
          statusCode.create,
          message
        )
      );
    } else if (action === 'clear') {
      const lastUsername = globalUsernames.pop();

      if (lastUsername) {
        const indexToRemove = globalUsernames.indexOf(lastUsername);

        if (indexToRemove !== -1) {
          globalUsernames.splice(indexToRemove, 1);
        }
      }
    } else if (action === 'clearAll') {
      globalUsernames.length = 0;
    } else {
      throw { code: statusCode.badRequest, message: 'Invalid action provided' };
    }

    await user.update({ path: JSON.stringify(globalUsernames) });

    const successMessage = action === 'store' ? 'Path stored successfully' : 'Path cleared successfully';
    return res.status(statusCode.success).json(
      apiResponseSuccess({ path: globalUsernames, page, pageSize, totalPages: 1 }, true, statusCode.success, successMessage)
    );
  } catch (error) {
    return res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};
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
      attributes: ['adminId', 'userName', 'roles', 'isActive', 'locked'],
      where: {
        createdById: id,
        [Op.or]: allowedRoles.map(role => {
          return sequelize.where(
            sequelize.fn('JSON_CONTAINS', sequelize.col('roles'), JSON.stringify({ role })),
            true
          );
        }),
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
      roles: user.roles,
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
      attributes: ['userName', 'roles'],
      where: {
        adminId: adminId
      }
    });

    if (!subAdmin) {
      return res.status(statusCode.notFound).json(apiResponseErr(null, false, statusCode.notFound, 'Sub Admin not found with the given Id'));
    }

    const data = {
      userName: subAdmin.userName,
      roles: subAdmin.roles,
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

    let roles = subAdmin.roles;

    if (!roles || roles.length === 0) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'Roles not found for Sub Admin'));
    }

    const permissionsArray = Array.isArray(permission) ? permission : [permission];

    if (!roles[0]) {
      roles[0] = { permission: [] };
    }

    roles[0].permission = permissionsArray;

    await admins.update(
      { roles: roles },
      {
        where: {
          adminId: subAdminId
        }
      }
    );

    return res.status(statusCode.success).json(apiResponseSuccess(null, true, statusCode.success, `${subAdmin.userName} permissions edited successfully`));
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
    console.error('Error:', error);
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
        attributes: ["adminId", "userName", "createdByUser", "roles"],
      });

      let allowedUserNames = [];
      for (const user of users) {
        const nestedUsers = await getAllowedUserNames(user.userName);
        allowedUserNames.push({
          userId: user.adminId, 
          userName: user.userName,
          roles: user.roles,
        });
        allowedUserNames = allowedUserNames.concat(nestedUsers);
      }
      return allowedUserNames;
    };

    const hierarchyWiseUsers = await getAllowedUserNames(userName);

    const filteredUsers = hierarchyWiseUsers.filter((user) => {
      return (
        user.roles &&
        Array.isArray(user.roles) &&
        user.roles.some((roleObj) => roleObj.role === "user") 
      );
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

