import axios from "axios";
import { apiResponseErr, apiResponseSuccess } from "../helper/errorHandler.js";
import { statusCode } from "../helper/statusCodes.js";
import admins from "../models/admin.model.js";
import jwt from "jsonwebtoken";

export const getLotteryBetHistory = async (req, res) => {
  try {
    const { userName } = req.params;
    const baseURL = process.env.LOTTERY_URL;
    const { startDate, endDate, page = 1, limit = 10, dataType, type } = req.query;
    const params = {
      dataType,
      startDate,
      endDate,
      page,
      limit,
      type
    };
    const response = await axios.post(
      `${baseURL}/api/lottery-external-bet-history`,
      { userName },
      { params }
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
    const { data, pagination } = response.data;

    return res
      .status(statusCode.success)
      .send(
        apiResponseSuccess(
          data,
          true,
          statusCode.success,
          "Success",
          pagination
        )
      );
  } catch (error) {
    console.error("Error:", error);

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
}

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

export const lotteryMarketAnalysis = async (req, res) => {
  try {
    const { marketId } = req.params;
    const { page = 1, limit = 10, search = '' } = req.query;
    const admin = req.user;
    const adminId = admin.adminId;

    const token = jwt.sign(
      { roles: req.user.roles },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    const baseURL = process.env.LOTTERY_URL;

    const response = await axios.get(`${baseURL}/api/lottery-external-marketAnalysis/${marketId}`, {
      params: {
        page,
        limit,
        search,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      return res.status(statusCode.badRequest).send(
        apiResponseErr(
          null,
          false,
          statusCode.badRequest,
          "Failed to fetch data"
        )
      );
    }

    // Fetch connected users (downline users) for the admin
    const connectedUsers = await getAllConnectedUsers(adminId);

    if (!Array.isArray(connectedUsers)) {
      return res.status(statusCode.internalServerError).send(
        apiResponseErr(
          null,
          false,
          statusCode.internalServerError,
          "Connected users data is invalid"
        )
      );
    }

    const { data, pagination = {} } = response.data;

    // Filter data to include only bets placed by connected users
    let filteredData = data.filter((item) =>
      connectedUsers.includes(item.userName)
    );

    // Apply search filter if provided
    if (search) {
      filteredData = filteredData.filter((item) =>
        item.userName && item.userName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination logic
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / limit);

    const currentPage = Math.min(Math.max(parseInt(page), 1), totalPages);
    const offset = (currentPage - 1) * limit;

    const paginatedData = filteredData.slice(offset, offset + parseInt(limit));

    const paginationResult = {
      page: currentPage,
      limit: parseInt(limit),
      totalPages,
      totalItems,
    };

    return res.status(statusCode.success).send(
      apiResponseSuccess(paginatedData, true, statusCode.success, 'Success', paginationResult)
    );
  } catch (error) {
    console.error('Error:', error);

    return res.status(statusCode.internalServerError).send(
      apiResponseErr(null, false, statusCode.internalServerError, error.message)
    );
  }
};


export const getLotteryP_L = async (req, res) => {
  try {
    const { userName } = req.params
        const { page = 1, limit = 10 } = req.query;
        const params = {
          page,
          limit,
        };
    const baseURL = process.env.COLOR_GAME_URL;

    const response = await axios.get(`${baseURL}/api/external-lottery-profit-loss/${userName}`,
          { params }
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
        const { data, pagination } = response.data;
        
    return res.status(statusCode.success).send(apiResponseSuccess(data, true, statusCode.success, 'Success',pagination));
  } catch (error) {
    return res.status(statusCode.internalServerError).send(apiResponseErr(null, false, statusCode.internalServerError, error.message));
  }
};

export const getBetHistoryP_L = async (req, res) => {
  try {
    const { userName, marketId } = req.params;
    const baseURL = process.env.LOTTERY_URL;

    const response = await axios.post(
      `${baseURL}/api/lottery-external-betHistory-profitLoss`, { userName, marketId }
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

    return res.status(statusCode.success).send(apiResponseSuccess(data, true, statusCode.success, "Success"));

  } catch (error) {
    return res.status(statusCode.internalServerError).send(apiResponseErr(null, false, statusCode.internalServerError, error.message));
  }
}
