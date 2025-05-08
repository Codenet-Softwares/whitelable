import { apiResponseErr, apiResponseSuccess, apiResponsePagination } from '../helper/errorHandler.js';
import admins from '../models/admin.model.js';
import { v4 as uuidv4 } from 'uuid';
import trash from '../models/trash.model.js';
import { statusCode } from '../helper/statusCodes.js';
import axios from 'axios';
import { string } from '../constructor/string.js';
import { Op } from 'sequelize';
import { admin_Balance } from './transaction.controller.js';
import CreditRef from '../models/creditRefs.model.js';
import Partnership from '../models/partnerships.model.js';

async function checkHierarchyBalance(adminId) {
  const subAdmins = await admins.findAll({ where: { createdById: adminId } });

  for (const subAdmin of subAdmins) {
    if (subAdmin.balance !== 0) {
      return true;
    }

    const result = await checkHierarchyBalance(subAdmin.adminId);
    if (result) {
      return true;
    }
  }

  return false;
}

export const moveAdminToTrash = async (req, res) => {
  try {
    const { requestId } = req.body;

    const admin = await admins.findOne({ where: { adminId: requestId } });

    if (!admin) {
      return res.status(statusCode.badRequest).json(
        apiResponseErr(null, false, statusCode.badRequest, `Admin User not found with id: ${requestId}`)
      );
    }

    const adminBalance = await admin_Balance(admin.adminId)

    if (adminBalance !== 0) {
      return res.status(statusCode.badRequest).json(
        apiResponseErr(null, false, statusCode.badRequest, `Balance should be 0 to move to Trash`)
      );
    }

    // Recursively check the hierarchy
    const hasSubAdmins = await checkHierarchyBalance(admin.adminId);

    if (hasSubAdmins) {
      return res.status(statusCode.badRequest).json(
        apiResponseErr(null, false, statusCode.badRequest, `Hierarchy Balance should be 0 to move to Trash`)
      );
    }


    if (!admin.isActive) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, false, statusCode.badRequest, `Admin is inactive or locked`));
    }

    let creditRefs = 0;
    let partnerships = 0;

    const creditRefsData = await CreditRef.findAll({
      attributes : ["CreditRef"],
      where: { UserId: admin.adminId },
      order: [['id', 'DESC']],
      limit: 1,
    });

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


    const updatedTransactionData = {
      adminId: admin.adminId,
      role: admin.role || '',
      userName: admin.userName,
      password: admin.password,
      balance: admin.balance || 0,
      loadBalance: admin.loadBalance || 0,
      creditRefs: creditRefs || 0,
      partnerships: partnerships || 0,
      createdById: admin.createdById || '',
      createdByUser: admin.createdByUser || '',
    };

    const trashEntry = await trash.create({
      trashId: uuidv4(),
      role: updatedTransactionData.role,
      userName: updatedTransactionData.userName,
      password: updatedTransactionData.password,
      balance: updatedTransactionData.balance,
      loadBalance: updatedTransactionData.loadBalance,
      creditRefs: updatedTransactionData.creditRefs,
      partnerships: updatedTransactionData.partnerships,
      createdById: updatedTransactionData.createdById,
      adminId: updatedTransactionData.adminId,
      createdByUser: updatedTransactionData.createdByUser,
    });

    if (!trashEntry) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, statusCode.badRequest, false, `Failed to backup Admin User`));
    }

    const deleteResult = await admin.destroy();

    if (!deleteResult) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, statusCode.badRequest, false, `Failed to delete Admin User with id: ${requestId}`));
    }

    // sync with colorgame user
    let message = '';
    if (admin.role === string.user) {
      const dataToSend = {
        userId: requestId,
      };
      const baseUrl = process.env.COLOR_GAME_URL
      const { data: response } = await axios.post(`${baseUrl}/api/extrernal/trash-user`, dataToSend);
      if (!response.success) {
        message = 'Failed to move user data to trash';
      } else {
        message = "successfully";
      }
    }

    return res.status(statusCode.success).json(apiResponseSuccess(null, statusCode.success, true, 'Admin User moved to Trash' + " " + message));
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const viewTrash = async (req, res) => {
  try {
    const adminId = req.params.createdById;
    let { page = 1, limit = 10, search = "" } = req.query;

    page = Math.max(parseInt(page, 10), 1);
    limit = Math.max(parseInt(limit, 10), 1);

    let offset = (page - 1) * limit;

    const searched = {
      createdById: adminId,
      ...(search && { userName: { [Op.like]: `%${search}%` } }), 
    };

    const { count, rows: trashEntries } = await trash.findAndCountAll({
      where: searched,
      offset,
      limit,
    });

    const totalPages = Math.ceil(count / limit);

    if (page > totalPages && totalPages > 0) {
      page = totalPages;
      offset = (page - 1) * limit;

      const { rows: adjustedEntries } = await trash.findAndCountAll({
        where: searched,
        offset,
        limit,
      });
      return res.status(statusCode.success).json(apiResponseSuccess(adjustedEntries, true, statusCode.success, 'Successfully retrieved', {
        page,
        limit,
        totalPages,
        totalItems: count,
      }));
    }

    return res.status(statusCode.success).json(apiResponseSuccess(trashEntries, true, statusCode.success, 'Successfully retrieved', {
      page,
      limit,
      totalPages,
      totalItems: count,
    }));

  } catch (error) {
    return res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};




export const deleteTrashData = async (req, res) => {
  try {
    const trashId = req.params.trashId;

    const record = await trash.findOne({ where: { trashId } });

    if (!record) {
      return res
        .status(statusCode.notFound)
        .json(apiResponseErr('Data not found', false, statusCode.notFound, 'Data not found'));
    }

    const adminId = record.adminId;

    const deleteHierarchy = async (adminId) => {
      const subAdmins = await admins.findAll({ where: { createdById: adminId } });

      for (const subAdmin of subAdmins) {
        await deleteHierarchy(subAdmin.adminId);
        await subAdmin.destroy();
      }
    };

    // Delete the hierarchy
    await deleteHierarchy(adminId);

    // Delete the trash record
    await record.destroy();

    return res
      .status(statusCode.success)
      .json(apiResponseSuccess(null, true, statusCode.success, 'Data deleted successfully'));
  } catch (error) {
    res
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


export const restoreAdminUser = async (req, res) => {
  try {
    const { adminId } = req.body;
    const existingAdminUser = await trash.findOne({ where: { adminId } });
 
    const  createdId = existingAdminUser.createdById;

    const createdByAdmin = await admins.findOne({
        where: { adminId: createdId },
        attributes: ["isActive", "locked"], 
    })

    if (createdByAdmin.isActive === false) {
      throw apiResponseErr(null, false, statusCode.badRequest, "Account is inactive");
    }

    if (createdByAdmin.locked === false) {
      throw apiResponseErr(null, false, statusCode.unauthorize, "Account is locked");
    }
    if (!existingAdminUser) {
      return res.status(statusCode.notFound).json(apiResponseErr(null, false, statusCode.notFound, 'Admin not found in trash'));
    }

    const restoreRemoveData = {
      roles: existingAdminUser.roles,
      userName: existingAdminUser.userName,
      password: existingAdminUser.password,
      balance: existingAdminUser.balance,
      loadBalance: existingAdminUser.loadBalance,
      creditRefs: existingAdminUser.creditRefs,
      partnerships: existingAdminUser.partnerships,
      createdById: existingAdminUser.createdById,
      adminId: existingAdminUser.adminId,
      createdByUser: existingAdminUser.createdByUser,
    };

    const restoreResult = await admins.create(restoreRemoveData);

    if (!restoreResult) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, statusCode.badRequest, false, 'Failed to restore Admin User'));
    }

    const deleteResult = await existingAdminUser.destroy();

    if (!deleteResult) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, statusCode.badRequest, false, `Failed to delete Admin User from Trash with adminId: ${adminId}`));
    }
    
    // sync with colorgame user
    let message = '';
    if (existingAdminUser.roles[0].role === string.user) {
    const dataToSend = {
      userId : adminId,
    };
   
    const baseUrl = process.env.COLOR_GAME_URL;

    const { data: response }  = await axios.post(`${baseUrl}/api/extrernal/restore-trash-user`, dataToSend);

    if(!response.success) {
      message = 'Failed restored user';
    } else {
      message = "successfully";
    }
  }
    return res.status(statusCode.success).json(apiResponseSuccess(null, statusCode.success, true, 'Admin restored from trash' + " " + message));
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};
