import { apiResponseErr, apiResponseSuccess } from "../helper/errorHandler.js";
import { statusCode } from "../helper/statusCodes.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import admins from "../models/admin.model.js";
import { string } from "../constructor/string.js";
import { Op, Sequelize } from "sequelize";
import { sql } from "../db.js";
dotenv.config();

export const getUserBetMarket = async (req, res) => {
  try {
    const { marketId ,userName} = req.params;

    const existingAdmin = await admins.findOne({ where: { userName } });

    if (!existingAdmin) {
      return res
        .status(statusCode.success) 
        .send(
          apiResponseErr(
            [],
            statusCode.success,
            false,
            "User not found"
          )
        );
    };

    let vUserName;

    if(existingAdmin.role === string.subAdmin || existingAdmin.role === string.subWhiteLabel || existingAdmin.role === string.subHyperAgent || existingAdmin.role === string.subMasterAgent || existingAdmin.role === string.subSuperAgent) {
      const user = await admins.findOne({
        where: { userName: existingAdmin.createdByUser },
      });
     vUserName = user.dataValues.userName;
    }else{
      vUserName = userName;
    }

    if (!marketId) {
      return res
        .status(statusCode.badRequest)
        .send(
          apiResponseErr(
            null,
            statusCode.badRequest,
            false,
            "Market ID is required"
          )
        );
    }
    
    const params = {
      marketId,
    };
    const baseUrl = process.env.COLOR_GAME_URL;
    const response = await axios.get(
      `${baseUrl}/api/user-external-liveBet/${vUserName}/${marketId}`,
      {
        params,
       
      }
    );
    if (!response.data.success) {
      return res
        .status(statusCode.badRequest)
        .send(
          apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            "Failed to fetch data"
          )
        );
    }

    const { data } = response.data;

    return res
      .status(statusCode.success)
      .send(apiResponseSuccess(data, true, statusCode.success, "Success"));
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

export const getLiveBetGames = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type } = req.query;

    const role = req.user.role;
    const userName = req.user.userName;

    const existingAdmin = await admins.findOne({ where: { userName } });

    if (!existingAdmin) {
      return res
        .status(statusCode.success)
        .send(apiResponseErr([], statusCode.success, true, "Data Not Found"));
    }

    let vUsername;
    let vRole;
    if (role == string.subAdmin || role == string.subWhiteLabel || role == string.subHyperAgent || role == string.subMasterAgent || role == string.subSuperAgent) {
      const user = await admins.findOne({
        where: { userName: existingAdmin.createdByUser },
      });
      vRole = user.role;
      vUsername = existingAdmin.createdByUser;
    } else {
      vUsername = userName;
      vRole = role;
    }

    const [results] = await sql.query(
      `CALL sp_getLiveBetGames(?, ?, ?, ?, ?, ?)`,
      [
        parseInt(page),       
        parseInt(limit),      
        search || null,      
        type || null,        
        vRole,                 
        vUsername             
      ]
    );

    const data = results[0];
    const paginationInfo = results[1][0];

    if (!data || data.length === 0) {
      return res.status(statusCode.success).send(
        apiResponseErr([], statusCode.success, false, "Data Not Found")
      );
    }

    return res.status(statusCode.success).send(
      apiResponseSuccess(data, true, statusCode.success, "Success", {
        Page: parseInt(page),
        limit: parseInt(limit),
        totalItems: paginationInfo.totalItems,
        totalPages: paginationInfo.totalPages,
      })
    );
  } catch (error) {
    res.status(statusCode.internalServerError).send(
      apiResponseErr(null, false, statusCode.internalServerError, error.message)
    );
  }
};

export const getLiveUserBet = async (req, res) => {
  try {
    const { marketId } = req.params;
    const loggedInAdminId = req.user.adminId;
    const role = req.user.role;
    const baseUrl = process.env.COLOR_GAME_URL;

    const response = await axios.get(
      `${baseUrl}/api/users-liveBet/${marketId}`
    );

    if (!response.data.success) {
      return res
        .status(statusCode.badRequest)
        .send(
          apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            "Failed to fetch data"
          )
        );
    }

    const { data } = response.data;

    if (!data || !Array.isArray(data.runners) || data.runners.length === 0) {
      return res
        .status(statusCode.notFound)
        .send(
          apiResponseErr(null, false, statusCode.notFound, "No data found")
        );
    }

    if (data && Array.isArray(data.usersDetails)) {
      // Recursive function to build hierarchy with users under their respective createdById
      const buildHierarchy = async (adminId) => {
        const subAdmins = await admins.findAll({
          where: { createdById: adminId },
          attributes: ["adminId", "createdById", "createdByUser"],
        });

        // If no subAdmins exist, return an empty object
        if (subAdmins.length === 0) return [];

        const hierarchy = [];

        // Iterate over each subAdmin to create the nested structure
        for (let subAdmin of subAdmins) {
          const relevantUsers = data.usersDetails.filter(
            (user) => user.userId === subAdmin.adminId
          );

          // Get the subAdmin's own users or their subAdmins
          const subHierarchy = await buildHierarchy(subAdmin.adminId);

          // Include subAdmin in hierarchy if there are relevant users or subAdmins
          if (relevantUsers.length > 0 || subHierarchy.length > 0) {
            // Prepare the subAdmin information
            const adminInfo = {
              // adminId: subAdmin.adminId,
              createdById: subAdmin.createdById,
              createdByUser:
                subAdmin.createdById === loggedInAdminId
                  ? undefined
                  : subAdmin.createdByUser,
              users: relevantUsers.length > 0 ? relevantUsers : undefined,
              subAdmins: subHierarchy.length > 0 ? subHierarchy : undefined, // Include subAdmins if any
            };

            // Add subAdmin to the hierarchy
            hierarchy.push(adminInfo);
          }
        }

        return hierarchy;
      };
      
      let hierarchy;
      // Build the hierarchy starting from the logged-in admin
      if(role == string.subAdmin || role == string.subWhiteLabel || role == string.subHyperAgent || role == string.subMasterAgent || role == string.subSuperAgent) {
        const existingAdmin = await admins.findOne({ where: { adminId: loggedInAdminId } });
        const adminId = existingAdmin?.dataValues?.createdById || loggedInAdminId;
         hierarchy = await buildHierarchy(adminId);
      }else{
         hierarchy = await buildHierarchy(loggedInAdminId);
      }


      // Filter the relevant users for the logged-in admin
      const relevantUsers = data.usersDetails.filter(
        (user) => user.userId === loggedInAdminId
      );

      // Combine the hierarchy and relevant users under the main admin
      const result = {
        admin: {
          adminId: loggedInAdminId,
          createdById: null, // Root admin has no parent
          createdByUser: req.user.userName, // Assuming req.user contains username
        },
        users: relevantUsers.length > 0 ? relevantUsers : undefined,
        subAdminsAndUsers: [...hierarchy, ...relevantUsers], // Include both sub-admins and users directly under the main admin
      };

      return res
        .status(statusCode.success)
        .send(apiResponseSuccess(result, true, statusCode.success, "Success"));
    } else {
      return res
        .status(statusCode.internalServerError)
        .send(
          apiResponseErr(
            null,
            false,
            statusCode.internalServerError,
            "Invalid data structure received from API"
          )
        );
    }
  } catch (error) {
    console.error(
      "Error from API:",
      error.response ? error.response.data : error.message
    );
    res
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

export const getLiveUserBetMarket = async (req, res) => {
  try {
    const { marketId } = req.params;
    const loggedInAdminId = req.user.adminId;
    const token = jwt.sign(
      { role: req.user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    const baseUrl = process.env.COLOR_GAME_URL;
    const response = await axios.get(
      `${baseUrl}/api/users-liveBet/${marketId}`,
      {
        params: { marketId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.data.success) {
      return res
        .status(statusCode.badRequest)
        .send(
          apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            "Failed to fetch data"
          )
        );
    }

    const { data } = response.data;

    const userDetails = await admins.findAll({
      where: {
        userName: data.usersDetails.map((user) => user.userName),
        createdById: loggedInAdminId,
      },
      attributes: ["userName", "createdById", "createdByUser"],
    });

    const users = data.usersDetails
      .filter((user) =>
        userDetails.some((detail) => detail.userName === user.userName)
      )
      .map((user) => ({
        userName: user.userName,
        userId: user.userId,
        marketId: user.marketId,
        runnerBalance: user.runnerBalance,
      }));

    res
      .status(statusCode.success)
      .send(apiResponseSuccess(users, true, statusCode.success, "Success"));
  } catch (error) {
    console.error("Error from API:", error.response?.data || error.message);
    res
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

export const getUserMasterBook = async (req, res) => {
  try {
    const { marketId, adminId, role, type } = req.body;
    const roles = req.user.role;

    const token = jwt.sign(
      { role: req.user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    const baseUrl = process.env.COLOR_GAME_URL;
    const response = await axios.get(
      `${baseUrl}/api/users-liveBet/${marketId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.data.success) {
      return res
        .status(statusCode.badRequest)
        .send(
          apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            "Failed to fetch data"
          )
        );
    }

    const { data } = response.data;

    if (!data || !Array.isArray(data.runners) || data.runners.length === 0) {
      return res
        .status(statusCode.success)
        .send(
          apiResponseSuccess([], true, statusCode.success, "No data found")
        );
    }

    let users = [];

    if (type === "user-book") {
      if (role === "superAdmin") {
        return res
          .status(statusCode.forbidden)
          .send(
            apiResponseErr(
              null,
              false,
              statusCode.forbidden,
              "Don't have users"
            )
          );
      }

      const userDetails = await admins.findAll({
        where: {
          createdById: adminId,
        },
        attributes: ["userName", "createdById", "createdByUser","role"],
      });

      users = data.usersDetails
        .filter((user) =>
          userDetails.some((detail) => detail.userName === user.userName)
        )
        .map((user) => ({
          userName: user.userName,
          userId: user.userId,
          role: string.user,
          marketId: user.marketId,
          runnerBalance: user.runnerBalance,
        }));
    } else if (type === "master-book") {
      const subAdmins = await admins.findAll({
        where: {
          createdById: adminId,
        },
        attributes: [
          "userName",
          "adminId",
          "createdById",
          "createdByUser",
          "role",
        ],
      });

      const allUsers = data.usersDetails
        .filter(
          (user) =>
            user.createdById === adminId ||
            subAdmins.some((subAdmin) => subAdmin.userName === user.userName)
        )
        .map((user) => ({
          userName: user.userName,
          roles: string.user,
          userId: user.userId,
          marketId: user.marketId,
          runnerBalance: user.runnerBalance,
        }));

      const filteredSubAdmins = subAdmins.filter((subAdmin) => {
        if (Array.isArray(subAdmin.role)) {
          return !subAdmin.role.includes("user");
        }
        return subAdmin.role !== "user";
      });

      const formattedSubAdmins = await Promise.all(
        filteredSubAdmins.map(async (subAdmin) => {
          const matchingUsersInSubAdmin = await checkSubAdminForUsers(subAdmin.adminId, data.usersDetails);
          
          if (matchingUsersInSubAdmin.length > 0) {
            return {
              adminId: subAdmin.adminId,
              userName: subAdmin.userName,
              role: subAdmin.role || null,
            };
          }

          return null;
        })
      );

      users = [
        ...allUsers,
        ...formattedSubAdmins.filter((subAdmin) => subAdmin !== null),
      ];
    }

    return res
      .status(statusCode.success)
      .send(apiResponseSuccess(users, true, statusCode.success, "Success"));
  } catch (error) {
    console.error("Error from API:", error.response ? error.response.data : error.message);
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

const checkSubAdminForUsers = async (subAdminId, userDetails) => {
  const children = await admins.findAll({
    where: { createdById: subAdminId },
  });

  let usersUnderSubAdmin = userDetails.filter((user) =>
    children.some((child) => child.userName === user.userName)
  );

  for (const child of children) {
    const childUsers = await checkSubAdminForUsers(child.adminId, userDetails);
    usersUnderSubAdmin = [...usersUnderSubAdmin, ...childUsers];
  }

  return usersUnderSubAdmin;
};

export const userLiveBet = async (req, res) => {
  try {
    const { marketId } = req.body;
    const { page = 1, pageSize = 10, search = '' } = req.query;

    const admin = req.user;
    const role = admin.role;
    const adminId = admin.adminId;

    const token = jwt.sign(
      { role: req.user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    const baseUrl = process.env.COLOR_GAME_URL;
    const response = await axios.get(
      `${baseUrl}/api/external/user-live-bet/${marketId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );

    if (!response.data.success) {
      return res
        .status(statusCode.badRequest)
        .send(apiResponseErr(null, false, statusCode.badRequest, "Failed to fetch data"));
    }

    const { data } = response.data;

    if (!Array.isArray(data) || data.length === 0) {
      return res
        .status(statusCode.success)
        .send(apiResponseSuccess([], true, statusCode.success, "No data found"));
    }

    let connectedUsers;
    if(role == 'subAdmin' || role == 'subWhiteLabel' || role == 'subHyperAgent' || role == 'subSuperAgent' || role == 'subMasterAgent') {
      const existingAdmin = await admins.findOne({ where: { adminId } });
      const id = existingAdmin?.dataValues?.createdById;
      connectedUsers = await getAllConnectedUsers(id);
    }else{
      connectedUsers = await getAllConnectedUsers(adminId);
    }

    if (!Array.isArray(connectedUsers)) {
      return res.status(statusCode.internalServerError).send(
        apiResponseErr(null, false, statusCode.internalServerError, "Connected users data is invalid")
      );
    }

    let users = data
      .filter((bet) => connectedUsers.includes(bet.userName))
      .map((bet) => ({
        userName: bet.userName,
        userId: bet.userId,
        marketName: bet.marketName,
        marketId: bet.marketId,
        runnerId: bet.runnerId,
        runnerName: bet.runnerName,
        rate: bet.rate,
        value: bet.value,
        type: bet.type,
      }));

    if (search) {
      users = users.filter((user) =>
        user.userName.toLowerCase().includes(search.toLowerCase())
      );
    }

    const totalItems = users.length;
    const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

    const currentPage = Math.min(Math.max(parseInt(page), 1), totalPages);
    const offset = (currentPage - 1) * pageSize;

    const getData = users.slice(offset, offset + parseInt(pageSize));

    const paginationData = {
      page: currentPage,
      pageSize: parseInt(pageSize),
      totalPages,
      totalItems,
    };

    return res.status(statusCode.success).send(apiResponseSuccess(getData, true, statusCode.success, "Success", paginationData));

  } catch (error) {
    console.error("Error:", error);
    return res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(null, false, statusCode.internalServerError, error.message));
  }
};




const getAllConnectedUsers = async (adminId) => {
  let allUsers = [adminId];
  let queue = [adminId];

  while (queue.length) {
    let currentId = queue.shift();

    const users = await admins.findAll({
      where: { createdById: currentId },
      attributes: ["userName", "adminId"],
    });

    users.forEach((user) => {
      allUsers.push(user.userName);
      queue.push(user.adminId);
    });
  }

  return allUsers;
};
