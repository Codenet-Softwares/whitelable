import { apiResponseErr, apiResponsePagination, apiResponseSuccess } from '../helper/errorHandler.js';
import { statusCode } from '../helper/statusCodes.js';
import axios from 'axios';
import admins from '../models/admin.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Op } from 'sequelize';
import transaction from '../models/transactions.model.js';
import { messages } from '../constructor/string.js';
dotenv.config();

export const userGame = async (req, res) => {
  try {
    const baseUrl = process.env.COLOR_GAME_URL
    const response = await axios.get(`${baseUrl}/api/user-games`);

    if (!response.data.success) {
      return res
        .status(statusCode.success).json(response.data)
    }

    const { data, success, message, pagination } = response.data;

    const paginationData = pagination || {};
    const gameData = data || [];

    return res
      .status(statusCode.success)
      .json(apiResponseSuccess(gameData, success, statusCode.success, message, paginationData));
  } catch (error) {
    console.error('Error fetching games:', error.message || error);
    res.status(statusCode.internalServerError).json(apiResponseErr(null, false, statusCode.internalServerError, error.message));
  }
};

// authorization is pending
export const getUserBetHistory = async (req, res) => {
  try {
    const { gameId, userName } = req.params;
    const { startDate, endDate, page = 1, limit = 10, dataType, type } = req.query;
    const token = jwt.sign({ roles: req.user.roles }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    const params = {
      gameId,
      userName,
      startDate,
      endDate,
      page,
      limit,
      dataType,
      type
    };
    const baseUrl = process.env.COLOR_GAME_URL;
    const response = await axios.get(`${baseUrl}/api/external-user-betHistory/${userName}/${gameId}`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      return res
        .status(statusCode.badRequest)
        .send(apiResponseErr(null, false, statusCode.badRequest, 'Failed to fetch bet history'));
    }

    const { data, pagination } = response.data;
    const paginationData = {
      page: pagination?.page || page,
      totalPages: pagination?.totalPages || 1,
      totalItems: pagination?.totalItems || data.length,
      limit: pagination?.limit || limit
    };

    return res
      .status(statusCode.success)
      .send(apiResponseSuccess(
        data,
        true,
        statusCode.success,
        'Success',
        paginationData
      ));
  } catch (error) {
    console.error("Error from API:", error.response ? error.response.data : error.message);
    res.status(statusCode.internalServerError).send(apiResponseErr(null, false, statusCode.internalServerError, error.message));
  }
};

export const getColorGameProfitLoss = async (req, res) => {
  try {
    const userName = req.params.userName;
    const { page = 1, pageSize = 10, search = '', startDate, endDate } = req.query;
    const limit = parseInt(pageSize);
    const dataType = req.query.dataType;
    const token = jwt.sign({ roles: req.user.roles }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    const params = {
      userName,
      search,
      startDate,
      endDate,
      page,
      limit,
      dataType
    };

    const baseUrl = process.env.COLOR_GAME_URL
    const response = await axios.get(`${baseUrl}/api/external-profit_loss/${userName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    if (!response.data.success) {
      return res
        .status(statusCode.badRequest)
        .send(apiResponseErr(null, false, statusCode.badRequest, 'Failed to fetch data'));
    }

    const { data, pagination } = response.data;

    const paginationData = {
      page: pagination?.page || page,
      totalPages: pagination?.totalPages || 1,
      totalItems: pagination?.totalItems || data.length,
      limit: pagination?.limit || limit
    };

    return res
      .status(statusCode.success)
      .send(
        apiResponseSuccess(
          data,
          true,
          statusCode.success,
          'Success',
          paginationData,
        ),
      );
  } catch (error) {
    console.error("Error from API:", error.response ? error.response.data : error.message);
    res.status(statusCode.internalServerError).send(apiResponseErr(null, false, statusCode.internalServerError, error.message));
  }
};

export const marketProfitLoss = async (req, res) => {
  try {
    const { gameId, userName, } = req.params;
    const { page = 1, pageSize = 10, search = '' } = req.query;
    const limit = parseInt(pageSize);
    const token = jwt.sign({ roles: req.user.roles }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    const params = {
      userName,
      gameId,
      search,
      page,
      limit
    };

    const baseUrl = process.env.COLOR_GAME_URL;

    const response = await axios.get(`${baseUrl}/api/external-profit_loss_market/${userName}/${gameId}`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      return res
        .status(statusCode.badRequest)
        .send(apiResponseErr(null, false, statusCode.badRequest, 'Failed to fetch data'));
    }

    const { data, pagination } = response.data;

    const paginationData = {
      page: pagination?.page || page,
      totalPages: pagination?.totalPages || 1,
      totalItems: pagination?.totalItems || data.length,
      limit: pagination?.limit || limit
    };


    return res
      .status(statusCode.success)
      .send(
        apiResponseSuccess(
          data,
          true,
          statusCode.success,
          'Success',
          paginationData,
        ),
      );
  } catch (error) {
    console.error("Error from API:", error.response ? error.response.data : error.message);
    res.status(statusCode.internalServerError).json(apiResponseErr(null, false, statusCode.internalServerError, error.message));
  }
};

export const runnerProfitLoss = async (req, res) => {
  try {
    const { marketId, userName } = req.params;
    const { page = 1, pageSize = 10, search = '' } = req.query;
    const limit = parseInt(pageSize);
    const token = jwt.sign({ roles: req.user.roles }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    const params = {
      userName,
      marketId,
      search,
      page,
      limit
    };

    const baseUrl = process.env.COLOR_GAME_URL;

    const response = await axios.get(`${baseUrl}/api/external-profit_loss_runner/${userName}/${marketId}`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      return res
        .status(statusCode.badRequest)
        .send(apiResponseErr(null, false, statusCode.badRequest, 'Failed to fetch data'));
    }

    const { data, pagination } = response.data;

    const paginationData = {
      page: pagination?.page || page,
      totalPages: pagination?.totalPages || 1,
      totalItems: pagination?.totalItems || data.length,
      limit: pagination?.limit || limit
    };


    return res
      .status(statusCode.success)
      .send(
        apiResponseSuccess(
          data,
          true,
          statusCode.success,
          'Success',
          paginationData,
        ),
      );
  } catch (error) {
    console.error("Error from API:", error.response ? error.response.data : error.message);
    res.status(statusCode.internalServerError).send(apiResponseErr(null, false, statusCode.internalServerError, error.message));
  }
};

export const userAccountStatement = async (req, res) => {
  try {
    const userName = req.params.userName;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    const dataType = req.query.dataType;

    let startDate, endDate;
    if (dataType === 'live') {
      const today = new Date();
      startDate = new Date(today).setHours(0, 0, 0, 0);
      endDate = new Date(today).setHours(23, 59, 59, 999);
    } else if (dataType === 'olddata') {
      if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate).setHours(0, 0, 0, 0);
        endDate = new Date(req.query.endDate).setHours(23, 59, 59, 999);
      } else {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        startDate = new Date(oneYearAgo).setHours(0, 0, 0, 0);
        endDate = new Date().setHours(23, 59, 59, 999);
      }
    } else if (dataType === 'backup') {
      if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate).setHours(0, 0, 0, 0);
        endDate = new Date(req.query.endDate).setHours(23, 59, 59, 999);
        const maxAllowedDate = new Date(startDate);
        maxAllowedDate.setMonth(maxAllowedDate.getMonth() + 3);
        if (endDate > maxAllowedDate) {
          return res.status(statusCode.badRequest)
            .send(apiResponseErr([], false, statusCode.badRequest, 'The date range for backup data should not exceed 3 months.'));
        }
      } else {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 2);
        startDate = new Date(threeMonthsAgo.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
      }
    } else {
      return res.status(statusCode.success)
        .send(apiResponseSuccess([], true, statusCode.success, 'Data not found.'));
    }

    const admin = await admins.findOne({ where: { userName } });

    if (!admin) {
      return res.status(statusCode.badRequest).send(apiResponseErr([], false, statusCode.badRequest, messages.adminNotFound));
    }

    const adminUserName = admin.userName;
    const adminMainBalance = admin.balance;

    const transactionQuery = {
      where: {
        [Op.or]: [
          { userName },
          { transferToUserAccount: adminUserName },
        ],
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [['date', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };

    const transferAmount = await transaction.findAndCountAll(transactionQuery);
    if (transferAmount.rows.length === 0) {
      return res.status(statusCode.success).send(apiResponseSuccess([], true, statusCode.success, "No Data Found"));
    }

    const totalCount = transferAmount.count;
    const totalPages = Math.ceil(totalCount / pageSize);

    let runningBalance = adminMainBalance;

    const dataWithBalance = transferAmount.rows.map((transaction) => {
      if (transaction.transactionType === 'credit' || transaction.transactionType === 'withdrawal') {
        runningBalance = transaction.currentBalance;
      }

      let adminBalanceForTransaction = null;
      if (transaction.transferFromUserAccount === adminUserName) {
        adminBalanceForTransaction = adminMainBalance;
      }
      else if (transaction.transferToUserAccount === adminUserName) {
        adminBalanceForTransaction = adminMainBalance;
      }

      return {
        ...transaction.toJSON(),
        balance: runningBalance,
        adminMainBalance: adminBalanceForTransaction
      };
    });

    const paginationData = apiResponsePagination(page, totalPages, totalCount, pageSize);

    return res.status(statusCode.success)
      .send(apiResponseSuccess(dataWithBalance, true, statusCode.success, messages.success, paginationData));

  } catch (error) {
    res.status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};


export const getUserBetList = async (req, res) => {
  try {
    const { userName, marketId } = req.params;
    const { page = 1, pageSize = 10 } = req.query;
    const params = { userName, marketId };

    const baseUrl = process.env.COLOR_GAME_URL;

    const response = await axios.get(
      `${baseUrl}/api/user-external-betList/${userName}/${marketId}`,
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

    let { data } = response.data;

    const offset = (page - 1) * pageSize;
    const totalItems = data.length;
    const getallData = data.slice(offset, offset + pageSize);
    const totalPages = Math.ceil(totalItems / pageSize);

    const paginationData = {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages,
      totalItems,
    };

    res
      .status(statusCode.success)
      .send(
        apiResponseSuccess(
          getallData,
          true,
          statusCode.success,
          "Success",
          paginationData
        )
      );
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

export const userLastLogin = async (req, res) => {
  try {
    const { userName, loginTime, loginStatus } = req.body
    const users = await admins.findOne({ where: { userName } })
    await users.update({ lastLoginTime: loginTime, loginStatus: loginStatus });
    res
      .status(statusCode.success)
      .send(
        apiResponseSuccess(
          null,
          true,
          statusCode.success,
          'success',
        ),
      );
  } catch (error) {
    console.error("Error from API:", error.response ? error.response.data : error.message);

    res
      .status(statusCode.internalServerError)
      .send(
        apiResponseErr(
          null,
          false,
          statusCode.internalServerError,
          error.message,
        ),
      );
  }
}



export const getActiveLockedAdmins = async (req, res) => {
  try {
    const activeOrLockedAdmins = await admins.findAll({
      where: {
        [Op.or]: [
          { isActive: false },
          { locked: false },
        ],
      },
      attributes: ['adminId', 'userName','isActive','locked',], 
    });

    res
    .status(statusCode.success)
    .send(
      apiResponseSuccess(
        activeOrLockedAdmins,
        true,
        statusCode.success,
        'success',
      ),
    );
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .send(
        apiResponseErr(
          null,
          false,
          statusCode.internalServerError,
          error.message,
        ),
      );
  }
};