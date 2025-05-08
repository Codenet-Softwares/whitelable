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
import { getAllConnectedUsers, getHierarchyUsers } from '../controller/lotteryGame.controller.js'
import Permission from '../models/permissions.model.js';
import CreditRef  from '../models/creditRefs.model.js';
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

    console.log("newAdmin", newAdmin);
    
    await Permission.create({
      UserId: newAdmin.adminId,
      permission: 'all-access',
    }, { transaction })

    const token = jwt.sign({ role: req.user.role }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    console.log("token", token);
    

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

        console.log(response, "response");
        
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
    if (user.adminId) {
      await calculateLoadBalance(user.adminId, transaction);
    }

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

    const existingTrashAdmin = await trash.findOne({ where: { userName } });
    if (existingTrashAdmin) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, "Admin is exist in trash. Please restore or delete it."));
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
  let loadBalance = 0
  let totalBalance

  const admin = await admins.findOne({ where: { adminId } });
  if (!admin) return 0;

  const adminBalance = await admin_Balance(admin.adminId)
  const hierarchyBalance = await balance_hierarchy(admin.adminId)

  let exposure
  if (admin.role === string.user) {
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

  if (admin.role === string.user) {
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
        role: {
          [Op.or]: allowedRoles,
        },
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
        role: {
          [Op.or]: allowedRoles,
        },
      },
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
    });

    // Map through adminsData and calculate load balance
    const users = await Promise.all(
      adminsData.map(async (admin) => {
        let creditRefs = 0;
        let partnerships = 0;

        const creditRefsData = await CreditRef.findAll({
          attributes : ["CreditRef"],
          where: { UserId: admin.adminId },
          order: [['id', 'DESC']],
          limit: 1,
        })


        if (creditRefsData && creditRefsData.length > 0) {
          try {
            creditRefs = parseFloat(creditRefsData[0].CreditRef);
          } catch (err) {
            creditRefs = 0;
          }
        }

        const partnershipsData = await Partnership.findAll({
          attributes: ["partnership"],
          where: { UserId: admin.adminId },
          order: [['id', 'DESC']],
          limit: 1,
        })

        if (partnershipsData && partnershipsData.length > 0) {
          try {
            partnerships = parseFloat(partnershipsData[0].partnership);
          } catch {
            partnerships = 0;
          }
        }

        const adminBalance = await admin_Balance(admin.adminId);
        const loadBalance = await calculateLoadBalance(admin.adminId);
        const loadTotalExposure = await calculateExposure(admin.adminId);

        return {
          adminId: admin.adminId,
          userName: admin.userName,
          role: admin.role,
          balance: adminBalance,
          loadBalance, // Add loadBalance to response
          creditRefs : creditRefs,
          createdById: admin.createdById,
          createdByUser: admin.createdByUser,
          partnerships : partnerships,
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
      UserId : admin.adminId,
      CreditRef : creditRef,
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
      UserId : admin.adminId,
      partnership : partnership,
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
      attributes: ['adminId', 'userName', 'role', 'isActive', 'locked'],
      where: {
        createdById: id,
        role :{
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

    const data = {
      userName: subAdmin.userName,
      role: subAdmin.role,
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
      return roles[0].role; 
    };

    const calculateDownlineProfitLoss = (adminId, role) => {
      let total = 0;
      const queue = [...(downlineMap[adminId] || [])];
      
      while (queue.length > 0) {
        const current = queue.shift();
        if (current.adminId !== adminId) {
          total += profitLossMap[current.adminId] || 0;
        }
        
        const currentRole = getPrimaryRole(current.roles);
        
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
        [Op.or]: allowedRoles
      },
    };

    if (searchTerm) {
      baseWhere.userName = {
        [Op.like]: `%${searchTerm}%`
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
        roles: admin.roles,
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
    console.error("Error in downLineUsers:", error);
    return res.status(statusCode.internalServerError).json({
      data: null,
      success: false,
      successCode: statusCode.internalServerError,
      message: error.message
    });
  }
};


export const getTotalProfitLoss = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = "", dataType, startDate, endDate} = req.query;
    const offset = (page - 1) * pageSize;
    const adminId = req.user?.adminId;
    const userId = await getHierarchyUsers(adminId);
    const token = jwt.sign(
      { roles: req.user.roles },
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

export const getMarketWiseProfitLoss = async(req,res) => {
  try {
    const { page = 1, pageSize = 10, search = "", type , dataType, startDate, endDate} = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const adminId = req.user?.adminId;
    const userId = await getHierarchyUsers(adminId);

    const token = jwt.sign(
      { roles: req.user.roles },
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

export const getAllUserProfitLoss = async(req,res) => {
  try {
    const { page = 1, pageSize = 10, search = "",dataType, startDate, endDate } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const adminId = req.user?.adminId;
    const userId = await getHierarchyUsers(adminId);

    const token = jwt.sign(
      { roles: req.user.roles },
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


