import { string } from "../constructor/string.js";
import { createAnnouncements, createInnerAnnouncements, deleteAnnouncementData, deleteInnerAnnouncementData, getAnnouncement, getInnerAnnouncement } from "../controller/announcement.controller.js";
import customErrorHandler from "../helper/customErrorHandler.js";
import { Authorize } from "../middleware/auth.js";


export const AnnouncementRoute = (app) => {
  /*
    Announcement Apis Start's.....
  */

  app.post('/api/admin/announcements-create', customErrorHandler, Authorize([string.superAdmin]), createAnnouncements);
  
  app.get('/api/admin/get-announcements', customErrorHandler, getAnnouncement);
 
  app.get('/api/admin/get-admin-announcements', customErrorHandler,Authorize([string.superAdmin]), getAnnouncement);
  
  app.delete('/api/admin/delete-announcements/:announceId', Authorize([string.superAdmin]), customErrorHandler, deleteAnnouncementData);

  /*
    Announcement Apis Ends's.....
  */

  /*
    Inner Announcement Apis Start's.....
  */

  app.post('/api/admin/inner-announcements-create', customErrorHandler, Authorize([string.superAdmin]), createInnerAnnouncements);
     
  app.get('/api/admin/get-inner-announcements', customErrorHandler, getInnerAnnouncement);
    
  app.get('/api/admin/get-admin-inner-announcements', customErrorHandler,Authorize([string.superAdmin]), getInnerAnnouncement);
     
  app.delete('/api/admin/delete-inner-announcements/:announceId', Authorize([string.superAdmin]), customErrorHandler, deleteInnerAnnouncementData);

  /*
    Inner Announcement Apis Ends's.....
  */
};
