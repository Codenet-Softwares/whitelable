  import { Authorize } from '../middleware/auth.js';

import customErrorHandler from '../helper/customErrorHandler.js';
import {
  createAdminSchema,
  createSubAdminSchema,
  viewAllCreatesSchema,
  viewAllSubAdminCreatesSchema,
  creditRefSchema,
  activeStatusSchema,
  profileViewSchema,
  partnershipEditSchema,
  partnershipViewSchema,
  creditRefViewSchema,
  viewSubAdminSchema,
  singleSubAdminSchema,
  subAdminPermissionSchema,
  userStatusSchema,
  exUpdateBalanceSchema,

  validateDownLineProfitLoss,

  validateProfitLossInput,
  validateProfitLossMarket,
  validateAllUserProfitLossMarket,

} from '../schema/commonSchema.js';

import {
  createAdmin,
  createSubAdmin,
  getIpDetail,
  viewAllSubAdminCreates,
  activeStatus,
  profileView,
  viewAllCreates,
  partnershipView,
  creditRefView,
  viewSubAdmins,
  singleSubAdmin,
  subAdminPermission,
  userStatus,
  syncWithUserBackend,
  fetchUserHierarchy,
  getHierarchyWiseUsers,
  downLineUsers,
  getTotalProfitLoss,
  getMarketWiseProfitLoss,
  getAllUserProfitLoss,
  addCreditRef,
  addPartnership

} from '../controller/admin.controller.js';
import { string } from '../constructor/string.js';


export const adminRoute = (app) => {

  // Create Admin API ("DONE")
  app.post('/api/admin-create',
    createAdminSchema,
    customErrorHandler,
    Authorize([
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent,
      string.subWhiteLabel,
      string.subAdmin,
      string.subHyperAgent,
      string.subSuperAgent,
      string.subMasterAgent,
      string.createAdmin,
    ]),
    createAdmin,
  );

  // Create SubAdmin API ("DONE")
  app.post('/api/admin/create-subAdmin',
    createSubAdminSchema,
    customErrorHandler,
    Authorize([
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.subSuperAgent,
      string.masterAgent,
      string.subWhiteLabel,
      string.subAdmin,
      string.subHyperAgent,
      string.subSuperAgent,
      string.subMasterAgent,
      string.createSubAdmin,
      string.marketAnalysis,
      string.myReport
    ]),
    createSubAdmin,
  );
  
  // Ip Detail API ("DONE")
  app.get('/api/get-ip/:userName',
    Authorize([
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent,
      string.activityLog,
    ]),
    customErrorHandler,
    getIpDetail,
  );

  // View All Creates API ("DONE")
  app.get('/api/view-all-creates/:createdById',
    viewAllCreatesSchema,
    customErrorHandler, 
    Authorize([
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent,
      string.transferBalance,
      string.status,
      string.creditRefEdit,
      string.partnershipEdit,
      string.creditRefView,
      string.partnershipView,
      string.userProfileView,
      string.profileView,
      string.viewAdminData,
      string.createAdmin,
      string.createUser,
      string.accountStatement,
      string.activityLog,
      string.deleteAdmin,
      string.restoreAdmin,
      string.moveToTrash,
      string.trashView,
      string.viewBalance
    ]),
    viewAllCreates,
  );

  // View All Sub Admins Creates ("DONE")
  app.get('/api/view-all-subAdmin-creates/:createdById',
    viewAllSubAdminCreatesSchema,
    customErrorHandler,
    Authorize([
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent,
      string.subAdmin,
      string.subHyperAgent,
      string.subMasterAgent,
      string.subWhiteLabel,
      string.subSuperAgent,
      string.transferBalance,
      string.status,
      string.creditRefEdit,
      string.partnershipEdit,
      string.creditRefView,
      string.partnershipView,
      string.userProfileView,
      string.profileView,
      string.viewAdminData,
      string.createAdmin,
      string.createUser,
      string.accountStatement,
      string.activityLog,
      string.deleteAdmin,
      string.restoreAdmin,
      string.moveToTrash,
      string.trashView,
      string.viewBalance
    ]),
    viewAllSubAdminCreates,
  );

  // Credit Ref Edit API ("DONE")
  app.post('/api/admin/add-credit-ref/:adminId',
    creditRefSchema,
    customErrorHandler,
    Authorize([
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent,
      string.creditRefEdit
    ]),
    addCreditRef,
  );

  // PartnerShip Edit API ("DONE")
  app.post('/api/admin/add-partnership/:adminId',
    partnershipEditSchema,
    customErrorHandler,
    Authorize([
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent,
      string.partnershipEdit
    ]),
    addPartnership,
  );

  // PartnerShip View API ("DONE")
  app.get('/api/partnershipView/:adminId',
    partnershipViewSchema,
    customErrorHandler,
    Authorize([
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent,
      string.partnershipView
    ]),
    partnershipView,
  );

  // CreditRef View API ("DONE")
  app.get('/api/creditRefView/:adminId',
    creditRefViewSchema,
    customErrorHandler,
    Authorize([
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent,
      string.creditRefView
    ]),
    creditRefView,
  );

  // View Active Status API ("DONE")
  app.get('/api/admin/active-status/:adminId',
    activeStatusSchema,
    customErrorHandler,
    Authorize([
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent,
      string.status,
    ]),
    activeStatus,
  );

  // Profile View API ("DONE")
  app.get('/api/User-Profile-view/:userName',
    profileViewSchema,
    customErrorHandler,
    Authorize([
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent,
      string.userProfileView,
    ]),
    profileView,
  );

  // Root Path API ("DONE") NOT IN USE
  // app.post('/api/Root-Path/:userName/:action', rootPathSchema, customErrorHandler, buildRootPath);

  // view-sub-admins ("DONE")
  app.get('/api/admin/view-sub-admins/:adminId',
    viewSubAdminSchema,
    customErrorHandler,
    Authorize([
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent,
      string.viewSubAdmin
    ]),
    viewSubAdmins,
  );

  // single-sub-admin ("DONE")
  app.post('/api/admin/single-sub-admin/:adminId',
    singleSubAdminSchema,
    customErrorHandler,
    Authorize([
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent
    ]),
    singleSubAdmin,
  );

  // edit-subAdmin-permissions ("DONE")
  app.put('/api/admin/edit-subAdmin-permissions/:adminId',
    subAdminPermissionSchema,
    customErrorHandler,
    Authorize([
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent,
      string.marketAnalysis,
      string.myReport
    ]),
    subAdminPermission,
  );

  // user-status ("DONE")
  app.get('/api/user-status/:userName', userStatusSchema, customErrorHandler, userStatus);

  app.post('/api/admin/extrnal/balance-update', exUpdateBalanceSchema, customErrorHandler, syncWithUserBackend);
  
  app.get("/api/user-hierarchy/:userName", fetchUserHierarchy);

  app.get("/api/users-hierarchy/:userName", getHierarchyWiseUsers );
  app.get("/api/downLineUsers/:createdById",validateDownLineProfitLoss, customErrorHandler, Authorize([
    string.superAdmin,
    string.subAdmin,
    string.subWhiteLabel,
    string.subHyperAgent,
    string.subSuperAgent,
    string.subMasterAgent,
    string.whiteLabel,
    string.hyperAgent,
    string.superAgent,
    string.masterAgent,
  ]), downLineUsers );

  app.get("/api/total-profitloss-hierarchy", validateProfitLossInput, customErrorHandler, Authorize([
    string.superAdmin,
    string.subAdmin,
    string.whiteLabel,
    string.hyperAgent,
    string.superAgent,
    string.masterAgent,
    string.subWhiteLabel,
    string.subHyperAgent,
    string.subMasterAgent,
    string.subSuperAgent
  ]), getTotalProfitLoss);

  app.get("/api/market-wise-profit-loss",validateProfitLossMarket,customErrorHandler, Authorize([
    string.superAdmin,
    string.subAdmin,
    string.whiteLabel,
    string.hyperAgent,
    string.superAgent,
    string.masterAgent,
     string.subWhiteLabel,
    string.subHyperAgent,
    string.subMasterAgent,
    string.subSuperAgent
  ]), getMarketWiseProfitLoss)


  app.get("/api/market-allUser-profit-loss/:marketId",validateAllUserProfitLossMarket, customErrorHandler, Authorize([
    string.superAdmin,
    string.subAdmin,
    string.whiteLabel,
    string.hyperAgent,
    string.superAgent,
    string.masterAgent,
     string.subWhiteLabel,
    string.subHyperAgent,
    string.subMasterAgent,
    string.subSuperAgent
  ]), getAllUserProfitLoss)

};
