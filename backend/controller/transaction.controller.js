import { apiResponseErr, apiResponseSuccess, apiResponsePagination } from '../helper/errorHandler.js';
import transaction from '../models/transactions.model.js';
import admins from '../models/admin.model.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { statusCode } from '../helper/statusCodes.js';
import { Sequelize } from 'sequelize';
import { messages, string } from '../constructor/string.js';
import axios from 'axios';
import { calculateLoadBalance } from './admin.controller.js';
import { Op } from 'sequelize'
import { sql } from '../db.js';

export const depositTransaction = async (req, res) => {
  try {
    const { amount } = req.body;
    const adminId = req.params.adminId;
    const admin = await admins.findOne({ where: { adminId } });

    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'Invalid amount'));
    }

    if (!admin) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.adminNotFound));
    }

    const depositAmount = Math.round(parseFloat(amount));
    const depositTransactionData = {
      amount: depositAmount,
      userName: admin.userName,
      date: new Date(),
      transactionType: 'self_credit',
    };

    await transaction.create({
      transactionId: uuidv4(),
      adminId: adminId,
      amount: depositTransactionData.amount,
      userName: depositTransactionData.userName,
      date: depositTransactionData.date,
      transactionType: depositTransactionData.transactionType,
    });

    return res.status(statusCode.create).json(apiResponseSuccess(null, true, statusCode.create, 'Balance Deposit Successfully'));
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const transferAmount = async (req, res) => {
  try {
    const { receiveUserId, transferAmount, withdrawalAmt, remarks, password } = req.body;
    const adminId = req.params.adminId;

    const senderAdmin = await admins.findOne({ where: { adminId } });
    if (!senderAdmin) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, messages.adminNotFound));
    }

    const isPasswordValid = await bcrypt.compare(password, senderAdmin.password);
    if (!isPasswordValid) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'Invalid password for the transaction'));
    }

    const receiverAdmin = await admins.findOne({ where: { adminId: receiveUserId } });
    if (!receiverAdmin) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'Receiver Admin not found'));
    }

    if (senderAdmin.isActive === false) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'Sender Admin is inactive'));
    }

    if (receiverAdmin.isActive === false) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'Receiver Admin is inactive'));
    }

    if (senderAdmin.locked === false) {
      return res.status(statusCode.unauthorize).json(apiResponseErr(null, false, statusCode.unauthorize, "Sender Account is locked"));
    }

    if (receiverAdmin.locked === false) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, "Receiver Account is locked"));
    }

    if (transferAmount !== undefined && typeof transferAmount !== 'number') {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'Transfer amount must be a number'));
    }

    if (withdrawalAmt !== undefined && typeof withdrawalAmt !== 'number') {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'Withdrawal amount must be a number'));
    }

    const parsedTransferAmount = parseFloat(transferAmount);
    const parsedWithdrawalAmt = parseFloat(withdrawalAmt);

    let balance = 0

    if (parsedWithdrawalAmt) {

      const receiver_admin_balance = await admin_Balance(receiveUserId)

      if (receiver_admin_balance[0]?.[0].adminBalance < parsedWithdrawalAmt) {
        return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'Insufficient Balance For Withdrawal'));
      }

      const deductionBalance = receiver_admin_balance[0]?.[0].adminBalance - parsedWithdrawalAmt;

      const withdrawalRecord = {
        transactionId: uuidv4(),
        transactionType: 'withdrawal',
        receiver_adminId: receiverAdmin.adminId,
        amount: Math.round(parsedWithdrawalAmt),
        transferFromUserAccount: receiverAdmin.userName,
        transferToUserAccount: senderAdmin.userName,
        userName: receiverAdmin.userName,
        date: new Date(),
        remarks,
        currentBalance: deductionBalance
      };

      await transaction.create({
        adminId,
        ...withdrawalRecord,
      });

      const dataToSend = {
        ...withdrawalRecord,
        userId: receiveUserId,
        type: 'withdrawal',
      };

      let message = '';
      try {

        const baseUrl = process.env.COLOR_GAME_URL;

        const { data: response } = await axios.post(`${baseUrl}/api/extrnal/balance-update`, dataToSend);

        if (!response.success) {
          if (response.responseCode === 400 && response.errMessage === 'User Not Found') {
            message = 'Failed to update user balance.';
          }
        }
      } catch (error) {
        message = 'Please register in the portal.';
      }

      await calculateLoadBalance(adminId);

      return res.status(statusCode.create).json(apiResponseSuccess(null, true, statusCode.create, 'Balance Deducted Successfully' + ' ' + message));
    } else {

      const sender_admin_balance = await admin_Balance(adminId)
      const receiver_admin_balance = await admin_Balance(receiveUserId)
      if (sender_admin_balance[0]?.[0].adminBalance < parsedTransferAmount) {
        return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, 'Insufficient Balance For Transfer'));
      }

      const receiverBalance = receiver_admin_balance[0]?.[0]?.adminBalance + parsedTransferAmount;

      const transactionId = uuidv4();

      const transferRecordCredit = {
        transactionId,
        transactionType: 'credit',
        receiver_adminId: receiverAdmin.adminId,
        amount: Math.round(parsedTransferAmount),
        transferFromUserAccount: senderAdmin.userName,
        transferToUserAccount: receiverAdmin.userName,
        userName: receiverAdmin.userName,
        date: new Date(),
        remarks,
        currentBalance: receiverBalance
      }

      await transaction.create({
        adminId,
        ...transferRecordCredit,
      });

      const dataToSend = {
        ...transferRecordCredit,
        userId: receiveUserId,
        type: 'credit',
      };

      let message = '';
      try {
        const baseUrl = process.env.COLOR_GAME_URL;

        const { data: response } = await axios.post(`${baseUrl}/api/extrnal/balance-update`, dataToSend);

        if (!response.success) {
          if (response.responseCode === 400 && response.errMessage === 'User Not Found') {
            message = 'Failed to update user balance.';
          }
        }
      } catch (error) {
        message = 'Please register in the portal.';
      }

      await calculateLoadBalance(adminId);

      return res.status(statusCode.create).json(apiResponseSuccess(null, true, statusCode.create, 'Balance credit Successfully' + ' ' + message));
    }
  } catch (error) {
    res.status(statusCode.internalServerError).send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const transactionView = async (req, res) => {
  try {
    const userName = req.params.userName;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const dataType = req.query.dataType;

    let balances = 0;

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

    const adminId = admin.adminId

    if (!admin) {
      return res.status(statusCode.badRequest).send(apiResponseErr([], false, statusCode.badRequest, messages.adminNotFound));
    }

    const adminUserName = admin.userName;

    let transactionQuery = {
      where: {
        [Sequelize.Op.or]: [
          { adminId },
          { transferFromUserAccount: adminUserName },
          { transferToUserAccount: adminUserName },
        ],
      },
      order: [['date', 'DESC']],
    };

    if (startDate && endDate) {
      transactionQuery.where.date = {
        [Sequelize.Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      transactionQuery.where.date = {
        [Sequelize.Op.gte]: startDate,
      };
    } else if (endDate) {
      transactionQuery.where.date = {
        [Sequelize.Op.lte]: endDate,
      };
    }

    const transactionData = await transaction.findAll(transactionQuery);
    
    if (transactionData.length === 0) {
      return res.status(statusCode.success).send(apiResponseSuccess([], true, statusCode.success, "No Data Found"));
    }
    const totalItems = transactionData.length;
    let allData = JSON.parse(JSON.stringify(transactionData));

    // const reversedData = [...allData].reverse();

    // let runningBalance = 0;

    // reversedData.forEach((data) => {
    //   if (data.transferFromUserAccount === adminUserName) {
    //     runningBalance = data.currentBalance;
    //   } else if (data.transferToUserAccount === adminUserName) {
    //     runningBalance = data.currentBalance;
    //   }
    //   data.balance = runningBalance;
    // });

    allData.slice().reverse().map((data) => {
        if (data.receiver_adminId === adminId) {
          if (data.transactionType === "credit") {
            balances += parseFloat(data.amount);
            data.balance = balances;
          }
          if (data.transactionType === "withdrawal") {
            balances -= parseFloat(data.amount);
            data.balance = balances;
          }
        } else {
          if (data.transactionType === "credit") {
            balances -= parseFloat(data.amount);
            data.balance = balances;
          }
          if (data.transactionType === "withdrawal") {
            balances += parseFloat(data.amount);
            data.balance = balances;
          }
          if (data.transactionType === "self_credit") {
            balances += parseFloat(data.amount);
            data.balance = balances;
          }
        }
      });

    // allData = reversedData.reverse();

    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (page - 1) * pageSize;
    const paginatedData = allData.slice(skip, skip + pageSize);

    const paginationData = apiResponsePagination(page, totalPages, totalItems, pageSize);

    return res
      .status(statusCode.success)
      .send(apiResponseSuccess(paginatedData, true, statusCode.success, messages.success, paginationData));
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

export const accountStatement = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;

    const offset = (page - 1) * pageSize;

    const dataType = req.query.dataType;
    let startDate, endDate;
    let balances = 0;
    if (dataType === "live") {
      const today = new Date();
      startDate = new Date(today).setHours(0, 0, 0, 0);
      endDate = new Date(today).setHours(23, 59, 59, 999);
    } else if (dataType === "olddata") {
      if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate).setHours(0, 0, 0, 0);
        endDate = new Date(req.query.endDate).setHours(23, 59, 59, 999);
      } else {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        startDate = new Date(oneYearAgo).setHours(0, 0, 0, 0);
        endDate = new Date().setHours(23, 59, 59, 999);
      }
    } else if (dataType === "backup") {
      if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate).setHours(0, 0, 0, 0);
        endDate = new Date(req.query.endDate).setHours(23, 59, 59, 999);
        const maxAllowedDate = new Date(startDate);
        maxAllowedDate.setMonth(maxAllowedDate.getMonth() + 3);
        if (endDate > maxAllowedDate) {
          return res
            .status(statusCode.badRequest)
            .send(
              apiResponseErr(
                [],
                false,
                statusCode.badRequest,
                "The date range for backup data should not exceed 3 months."
              )
            );
        }
      } else {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 2);
        startDate = new Date(threeMonthsAgo.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
      }
    } else {
      return res
        .status(statusCode.success)
        .send(
          apiResponseSuccess([], true, statusCode.success, "Data not found.")
        );
    }

    const admin = await admins.findOne({ where: { adminId } });
    // console.log("admin", admin);
    if (!admin) {
      return res
        .status(statusCode.badRequest)
        .send(
          apiResponseErr(
            [],
            false,
            statusCode.badRequest,
            messages.adminNotFound
          )
        );
    }
    const adminUserName = admin.userName;
    const transactionQuery = {
      where: {
        [Sequelize.Op.or]: [
          { adminId },
          { transferToUserAccount: adminUserName },
          { transferFromUserAccount: adminUserName },
        ],
      },
      order: [["date", "DESC"]],
    };

    const transferAmount = await transaction.findAll(transactionQuery);

    let allData = JSON.parse(JSON.stringify(transferAmount));

    allData
      .slice()
      .reverse()
      .map((data) => {
        if (data.receiver_adminId === adminId) {
          if (data.transactionType === "credit") {
            balances += parseFloat(data.amount);
            data.balance = balances;
          }
          if (data.transactionType === "withdrawal") {
            balances -= parseFloat(data.amount);
            data.balance = balances;
          }
        } else {
          if (data.transactionType === "credit") {
            balances -= parseFloat(data.amount);
            data.balance = balances;
          }
          if (data.transactionType === "withdrawal") {
            balances += parseFloat(data.amount);
            data.balance = balances;
          }
          if (data.transactionType === "self_credit") {
            balances += parseFloat(data.amount);
            data.balance = balances;
          }
        }
      });

      allData = allData.filter((data) => {
        const dataDate = new Date(data.date).getTime();
        return dataDate >= startDate && dataDate <= endDate;
      });

    const totalItems = allData.length;
    const totalPages = Math.ceil(totalItems / parseInt(pageSize));
    const paginatedData = allData.slice(offset, offset + parseInt(pageSize));

    const pagination = {
      page: parseInt(page),
      limit: parseInt(pageSize),
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
          "Balance fetch successfully.",
          pagination,
        )
      );
  } catch (error) {
   return res
      .status(statusCode.internalServerError)
      .send(
        apiResponseErr(
          error.data ?? null,
          false,
          error.responseCode ?? statusCode.internalServerError,
          error.errMessage ?? error.message
        )
      );
  }
};

// Admin Main balance 
export const viewAdminBalance = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const adminBalance = await admin_Balance(adminId);
    const balance = adminBalance[0]?.[0].adminBalance;
    return res.status(statusCode.success).json(apiResponseSuccess({ balance }, true, statusCode.success, "Balance calculated successfully."));
  } catch (error) {
    return res
      .status(statusCode.internalServerError)
      .json(
        apiResponseErr(
          null,
          false,
          statusCode.internalServerError,
          error.message || "An error occurred while fetching the admin balance."
        )
      );
  }
};

// Generic admin Balance function
export const admin_Balance = async (adminId) => {
  try {
    const [results] = await sql.query(
      `CALL adminBalance(?)`,
      [adminId]
    );
    return results;
  } catch (error) {
    throw new Error(`Error calculating balance: ${error.message}`);
  }
};

export const viewAddBalance = async (req, res) => {
  try {
    const { adminId } = req.params;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page)
    limit = parseInt(limit)
    const offset = (page - 1) * limit;

    const { count, rows: paginatedTransactions } = await transaction.findAndCountAll({
      where: { adminId, transactionType: 'self_credit' },
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });
    if (paginatedTransactions.length === 0) {
      return res
        .status(statusCode.success)
        .send(apiResponseSuccess({ transactions: [] }, true, statusCode.success, 'Data Not Found'));
    }

    const balanceInfo = {
      transactions: paginatedTransactions.map((transaction) => ({
        amount: transaction.amount,
        date: transaction.date
      })),
    };
    const paginatedData = {
      page: parseInt(page),
      limit,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
    };
    return res
      .status(statusCode.success)
      .send(apiResponseSuccess(balanceInfo, true, statusCode.success, 'Balance Retrieved Successfully!', paginatedData));
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(null, false, statusCode.internalServerError, error.message));
  }
};

export const balance_hierarchy = async (adminId) => {
  try {

    let balance = 0;
    const admin_transactions = await transaction.findAll({
      where: {
        [Op.or]: [
          { adminId },
          { receiver_adminId: adminId },
        ],
      },
    });

    for (const transaction of admin_transactions) {
      if (transaction.receiver_adminId === adminId) {
        if (transaction.transactionType === 'credit') {
          balance += parseFloat(transaction.amount);
        }
        if (transaction.transactionType === 'withdrawal') {
          balance -= parseFloat(transaction.amount);
        }

      } else {
        if (transaction.transactionType === 'credit') {
          balance -= parseFloat(transaction.amount);
        }
        if (transaction.transactionType === 'withdrawal') {
          balance += parseFloat(transaction.amount);
        }
        if (transaction.transactionType === 'self_credit') {
          balance += parseFloat(transaction.amount);
        }
      }
    }
     // console.log("balance.............................",balance)

    return balance;
  } catch (error) {
    throw new Error(`Error calculating balance: ${error.message}`);
  }
};