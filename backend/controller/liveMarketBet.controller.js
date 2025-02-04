import { apiResponseErr, apiResponseSuccess } from "../helper/errorHandler.js";
import { statusCode } from "../helper/statusCodes.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import admins from "../models/admin.model.js";
import { string } from "../constructor/string.js";
import { Op } from "sequelize";
dotenv.config();

export const getUserBetMarket = async (req, res) => {
  try {
    const { marketId } = req.params;

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
    const token = jwt.sign(
      { roles: req.user.roles },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    const params = {
      marketId,
    };
    const baseUrl = process.env.COLOR_GAME_URL;
    const response = await axios.get(
      `${baseUrl}/api/user-external-liveBet/${marketId}`,
      {
        params,
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

    res
      .status(statusCode.success)
      .send(apiResponseSuccess(data, true, statusCode.success, "Success"));
  } catch (error) {
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

export const getLiveBetGames = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { search, type } = req.query;
    const offset = (page - 1) * limit;
    const token = jwt.sign(
      { roles: req.user.roles },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );


    const baseUrl = process.env.COLOR_GAME_URL;
    const response = await axios.get(
      `${baseUrl}/api/user-external-liveGamesBet`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.data.success) {
      return res.status(statusCode.badRequest).send(
        apiResponseErr(
          null,
          false,
          statusCode.badRequest,
          "Failed to fetch live games data"
        )
      );
    }
    const baseUrlLottery = process.env.LOTTERY_URL;
    const lotteryResponse = await axios.get(
      `${baseUrlLottery}/api/get-live-markets`
    );

    const lotteryData = lotteryResponse.data?.data || [];
    const liveGames = response.data.data || [];
    const combinedData = [
      ...lotteryData.map((lottery) => ({
        marketId: lottery.marketId,
        marketName: lottery.marketName,
        gameName: lottery.gameName,
        source: "lottery",
      })),
      ...liveGames.map(game => ({
        ...game,
        source: "colorgame",
      })),
    ];

    let filteredData = combinedData;

    if (type) {
      filteredData = filteredData.filter(item => item.source === type);
    }

    if (search) {
      filteredData = filteredData.filter(item =>
        item.marketName?.toLowerCase().includes(search.toLowerCase()) ||
        (item.source === "colorgame" &&
          item.gameName?.toLowerCase().includes(search.toLowerCase()))
      );
    }

    const uniqueData = Array.from(
      new Set(filteredData.map(item => item.marketId))
    ).map(uniqueMarketId =>
      filteredData.find(item => item.marketId === uniqueMarketId)
    );

    const paginatedData = uniqueData.slice(offset, offset + limit);

    const pagination = {
      Page: page,
      limit: limit,
      totalItems: uniqueData.length,
      totalPages: Math.ceil(uniqueData.length / limit),
    };

    return res.status(statusCode.success).send(
      apiResponseSuccess(paginatedData, true, statusCode.success, "Success", pagination)
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

      // Build the hierarchy starting from the logged-in admin
      const hierarchy = await buildHierarchy(loggedInAdminId);

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
      { roles: req.user.roles },
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

    const token = jwt.sign(
      { roles: req.user.roles },
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
        attributes: ["userName", "createdById", "createdByUser"],
      });

      users = data.usersDetails
        .filter((user) =>
          userDetails.some((detail) => detail.userName === user.userName)
        )
        .map((user) => ({
          userName: user.userName,
          userId: user.userId,
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
          "roles",
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

      const userIds = data.usersDetails.map((user) => user.userId);

      const subAdminsDetails = await admins.findAll({
        where: { adminId: { [Op.in]: userIds } },
        attributes: [
          "userName",
          "adminId",
          "createdById",
          "createdByUser",
          "roles",
        ],
      });

      const filteredSubAdmins = subAdmins.filter(
        (subAdmin) => !subAdmin.roles.some((role) => role.role === "user")
      );

      const formattedSubAdmins = await Promise.all(
        filteredSubAdmins.map(async (subAdmin) => {
          const matchingUser = subAdminsDetails.find(
            (userDetail) => userDetail.createdById === subAdmin.adminId
          );

          if (matchingUser) {
            return {
              adminId: subAdmin.adminId,
              userName: subAdmin.userName,
              roles: subAdmin.roles[0]?.role || null,
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

export const userLiveBet = async (req, res) => {
  try {
    const { marketId } = req.body;

    const admin = req.user
    const adminId = admin.adminId

    const token = jwt.sign(
      { roles: req.user.roles },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    const baseUrl = process.env.COLOR_GAME_URL;
    const response = await axios.get(
      `${baseUrl}/api/external/user-live-bet/${marketId}`,
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

    const { data } = response.data;

    if (!data || data.length === 0) {
      return res
        .status(statusCode.success)
        .send(apiResponseSuccess([], true, statusCode.success, "No data found"));
    }

    const connectedUsers = await getAllConnectedUsers(adminId);

    const users = data
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
    return res.status(statusCode.success).send(apiResponseSuccess(users, true, statusCode.success, "Success"));

  } catch (error) {
    console.error("error", error);
    return res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(null, false, statusCode.internalServerError, error.message));
  }
};

const getAllConnectedUsers = async (adminId) => {
  let allUsers = [];
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
}
