import { apiResponseErr, apiResponseSuccess } from '../helper/errorHandler.js';
import admins from '../models/admin.model.js';
import { v4 as uuidv4 } from 'uuid';
import { statusCode } from '../helper/statusCodes.js';
import axios from 'axios';
import { string } from '../constructor/string.js';
import { Op } from 'sequelize';
import { admin_Balance } from './transaction.controller.js';
import { sequelize } from '../db.js';

async function checkHierarchyBalance(adminId) {
  const subAdmins = await admins.findAll({ where: { createdById: adminId } });

  for (const subAdmin of subAdmins) {
    const balance = await admin_Balance(subAdmin.adminId)
    if (balance[0]?.[0].adminBalance !== 0) {
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

    if (adminBalance[0]?.[0].adminBalance !== 0) {
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


    await admins.update({
      isDeleted: true,
    });

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
   return res
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
    const offset = (page - 1) * limit;

    const whereCondition = {
      createdById: adminId,
      isDeleted: true,
      ...(search && { userName: { [Op.like]: `%${search}%` } }),
    };

    const { count, rows: results } = await admins.findAndCountAll({
      where: whereCondition,
      offset,
      limit,
    });

    const totalPages = Math.ceil(count / limit);

    let finalResults = results;
    if (page > totalPages && totalPages > 0) {
      page = totalPages;
      const adjustedOffset = (page - 1) * limit;

      const { rows: adjustedRows } = await admins.findAndCountAll({
        where: whereCondition,
        offset: adjustedOffset,
        limit,
      });
      finalResults = adjustedRows;
    }

    return res.status(statusCode.success).json(
      apiResponseSuccess(finalResults, true, statusCode.success, 'Successfully retrieved', {
        page,
        limit,
        totalPages,
        totalItems: count,
      })
    );

  } catch (error) {
    return res.status(statusCode.internalServerError).json(
      apiResponseErr(error?.data ?? null, false, error?.responseCode ?? statusCode.internalServerError, error?.errMessage ?? error.message)
    );
  }
};

export const deleteTrashData = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const adminId = req.params.adminId;

    const record = await admins.findOne({ where: { adminId }, transaction: t });

    if (!record) {
      await t.rollback();
      return res
        .status(statusCode.notFound)
        .json(apiResponseErr('Data not found', false, statusCode.notFound, 'Data not found'));
    }

    const deleteHierarchy = async (parentId) => {
      const subAdmins = await admins.findAll({ where: { createdById: parentId }, transaction: t });

      for (const subAdmin of subAdmins) {
        await deleteHierarchy(subAdmin.adminId);
        await subAdmin.destroy({ transaction: t });
      }
    };

    await admins.update(
      { isPermanentDeleted: true },
      { where: { adminId }, transaction: t }
    );

    await deleteHierarchy(adminId);

    await record.destroy({ transaction: t });

    // Commit the transaction
    await t.commit();

    return res.status(statusCode.success).json(apiResponseSuccess(null, true, statusCode.success, 'Data deleted successfully'));
  } catch (error) {
    await t.rollback();
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


export const restoreAdminUser = async (req, res) => {
  try {
    const { adminId } = req.body;
    const existingAdminUser = await admins.findOne({ where: { adminId } });
 
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


    const restoreResult = await admins.update(
      { isDeleted: false },
      { where: { adminId }, returning: true }
    );

    if (!restoreResult) {
      return res.status(statusCode.badRequest).json(apiResponseErr(null, statusCode.badRequest, false, 'Failed to restore Admin User'));
    }

    // sync with colorgame user
    let message = '';
    if (existingAdminUser.role === string.user) {
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
    return res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};
