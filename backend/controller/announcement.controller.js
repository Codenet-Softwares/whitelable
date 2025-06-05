import { apiResponseErr, apiResponseSuccess } from "../helper/errorHandler.js";
import { statusCode } from "../helper/statusCodes.js";
import announcementSchema from "../models/announcement.model.js";
import innerAnnouncementSchema from "../models/innerAnnouncement.model.js";
import { v4 as uuidv4 } from 'uuid';

/*
  Announcement Apis Starts's.....
*/

export const createAnnouncements = async (req, res) => {
  const { announcement } = req.body;
  try {
    const id = req.user.adminId
    const active_announcement_count = await announcementSchema.count();

    if (active_announcement_count >= 1) {
        return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Cannot add more than 1 announcement. Please delete existing announcement.'));
    }
    const announceId = uuidv4();
    const create_announcement = await announcementSchema.create({
      announceId: announceId,
      announcement
    }) 
    return res.status(statusCode.create).send(apiResponseSuccess(create_announcement, true, statusCode.create, 'Announcement created successfully'));
  } catch (error) {
    return res.status(statusCode.internalServerError).send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};


export const getAnnouncement = async (req, res) => {
  try {
    const announcement = await announcementSchema.findAll();
   

    if (!announcement.length) {
        return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Announcement not found'));
    }
    return res.status(statusCode.create).send(apiResponseSuccess(announcement, true, statusCode.create, 'Success'));
  } catch (error) {
    return res.status(statusCode.internalServerError).send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const deleteAnnouncementData = async (req, res) => {
  const { announceId } = req.params;

  try {
    const announcement_Data = await announcementSchema.findOne({
      where: {
        announceId: announceId,
      },
    });

    if (!announcement_Data) {
      return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'Announcement not found'));
    }

    await announcementSchema.destroy({
      where: {
        announceId: announceId,
      },
    });

    return res
      .status(statusCode.success)
      .send(apiResponseSuccess(announcement_Data, true, statusCode.success, 'Announcement Deleted Successfully'));
  } catch (error) {
    return res.status(statusCode.internalServerError).send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

/*
  Announcement Apis Ends's.....
*/


/*
  Inner Announcement Apis Starts's.....
*/

export const createInnerAnnouncements = async (req, res) => {
  const { announcement } = req.body;
  try {
    const id = req.user.adminId
    const active_announcement_count = await innerAnnouncementSchema.count();

    if (active_announcement_count >= 1) {
        return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Cannot add more than 1 announcement. Please delete existing announcement.'));
    }
    const announceId = uuidv4();
    const create_announcement = await innerAnnouncementSchema.create({
      announceId: announceId,
      announcement
    }) 
    return res.status(statusCode.create).send(apiResponseSuccess(create_announcement, true, statusCode.create, 'Announcement created successfully'));
  } catch (error) {
    return res.status(statusCode.internalServerError).send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const getInnerAnnouncement = async (req, res) => {
  try {
    const announcement = await innerAnnouncementSchema.findAll();

   if (!announcement.length) {
        return res.status(statusCode.success).send(apiResponseErr([], false, statusCode.success, 'Inner announcement not found'));
    }
    return res.status(statusCode.create).send(apiResponseSuccess(announcement, true, statusCode.create, 'Success'));
    
  } catch (error) {
    return res.status(statusCode.internalServerError).send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const deleteInnerAnnouncementData = async (req, res) => {
  const { announceId } = req.params;

  try {
    const announcement_Data = await innerAnnouncementSchema.findOne({
      where: {
        announceId: announceId,
      },
    });

    if (!announcement_Data) {
      return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'Announcement not found'));
    }

    await innerAnnouncementSchema.destroy({
      where: {
        announceId: announceId,
      },
    });

    return res
      .status(statusCode.success)
      .send(apiResponseSuccess(announcement_Data, true, statusCode.success, 'Announcement Deleted Successfully'));
  } catch (error) {
    return res.status(statusCode.internalServerError).send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

 /*
  Inner Announcement Apis Ends's.....
*/