import { body, param, query } from 'express-validator';
import { string } from '../constructor/string.js';


export const createAdminSchema = [
  body('userName').trim().notEmpty().withMessage('User Name is required'),
  body('password').trim().notEmpty().withMessage('Password is required'),
  // body('roles')
  //   .isArray({ min: 1 })
  //   .withMessage('At least one role is required')
  //   .custom((value) => {
  //     if (value.some(role => !role.role || role.role.trim() === '')) {
  //       throw new Error('Role cannot be blank or empty');
  //     }
  //     return true;
  //   })
];

export const createSubAdminSchema = [
  body('userName').trim().notEmpty().withMessage('User Name is required'),
  body('password').trim().notEmpty().withMessage('Password is required'),
];

export const adminLoginSchema = [
  body('userName').trim().notEmpty().withMessage('User Name is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const resetPasswordSchema = [
  body('userName').trim().notEmpty().withMessage('User Name is required'),
  body('oldPassword').notEmpty().withMessage('Old Password is required'),
];

export const adminPasswordResetSchema = [
  body('userName').trim().notEmpty().withMessage('User Name is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('adminPassword').notEmpty().withMessage('Admin Password is required'),
];

export const depositAmountSchema = [
  param('adminId').exists().withMessage('Admin ID is required.'),
  body('amount').exists().withMessage('Amount is required'),
];

export const transferAmountSchema = [
  param('adminId').exists().withMessage('Admin ID is required.'),
  body('receiveUserId').exists().withMessage('Receiver ID is required.'),
  body('transferAmount').optional().custom(value => {
    if (isNaN(value)) {
      throw new Error('Transfer Amount must be a number');
    }
    if (parseFloat(value) <= 0) {
      throw new Error('Transfer Amount must be a positive number');
    }
    return true;
  }),
  body('withdrawalAmt').optional().custom(value => {
    if (isNaN(value)) {
      throw new Error('Withdrawal Amount must be a number');
    }
    if (parseFloat(value) <= 0) {
      throw new Error('Withdrawal Amount must be a positive number');
    }
    return true;
  }),
  body('remarks').exists().withMessage('Remark is required'),
  body('password').trim().notEmpty().withMessage('Password is required'),
  body().custom((value, { req }) => {
    if ((req.body.transferAmount && req.body.withdrawalAmt) || (!req.body.transferAmount && !req.body.withdrawalAmt)) {
      throw new Error('Transfer amount is required.');
    }
    return true;
  })
];

export const transactionViewSchema = [
  param('userName').exists().withMessage('User Name is required.'),
  query("dataType")
  .exists()
  .withMessage("dataType is required.")
  .isIn(["live", "olddata", "backup"])
  .withMessage("Valid values are 'live', 'olddata', or 'backup'."),
  query('page').optional().toInt().isInt({ min: 1 }).withMessage('Page number must be a positive integer.'),
  query('limit').optional().toInt().isInt({ min: 1 }).withMessage('Limit must be a positive integer.'),
  query(['startDate', 'endDate']).custom((value, { req }) => {
    const { startDate, endDate } = req.query;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error('startDate must be less than or equal to endDate.');
    }
    return true;
  })
];
export const viewAllCreatesSchema = [
  param('createdById').exists().withMessage('Id is required.'),
  query('page').optional().toInt().isInt({ min: 1 }).withMessage('Page number must be a positive integer.'),
  query('limit').optional().toInt().isInt({ min: 1 }).withMessage('Limit must be a positive integer.'),
];

export const viewAllSubAdminCreatesSchema = [
  param('createdById').exists().withMessage('Id is required.'),
  query('page').optional().toInt().isInt({ min: 1 }).withMessage('Page number must be a positive integer.'),
  query('limit').optional().toInt().isInt({ min: 1 }).withMessage('Limit must be a positive integer.'),
];

export const viewBalanceSchema = [param('adminId').exists().withMessage('Admin Id is required.')];

export const creditRefSchema = [
  param('adminId').exists().withMessage('Admin Id is required.'),
  body('creditRef').isNumeric().withMessage('CreditRef must be a number'),
  body('password').notEmpty().withMessage('Password is required')
];

export const moveToTrashSchema = [body('requestId').exists().withMessage('Request Id is required')];

export const deleteFromTrashSchema = [param('adminId').exists().withMessage('adminId Id is required')];

export const activeStatusSchema = [param('adminId').exists().withMessage('Admin Id is required')];

export const restoreAdminUserSchema = [body('adminId').exists().withMessage('Admin Id is required.')];

export const profileViewSchema = [param('userName').exists().withMessage('User Name is required.')];

export const partnershipEditSchema = [
  param('adminId').exists().withMessage('Admin Id is required.'),
  body('partnership').isNumeric().withMessage('Partnership must be a number'),
  body('password').notEmpty().withMessage('Password is required')
];

export const partnershipViewSchema = [param('adminId').exists().withMessage('Admin Id is required.')];

export const creditRefViewSchema = [param('adminId').exists().withMessage('Admin Id is required.')];

export const rootPathSchema = [
  param('userName').exists().withMessage('User Name is required.'),
  param('action').exists().withMessage('Action is required.'),
];

export const viewSubAdminSchema = [
  param('adminId').exists().withMessage('Id is required.'),
  query('page').optional().toInt().isInt({ min: 1 }).withMessage('Page number must be a positive integer.'),
  query('limit').optional().toInt().isInt({ min: 1 }).withMessage('Limit must be a positive integer.'),
];

export const singleSubAdminSchema = [param('adminId').exists().withMessage('Admin Id is required.')];

export const subAdminPermissionSchema = [
  param('adminId').exists().withMessage('Admin Id is required'),
  body('permission').isArray({ min: 1 }).withMessage('Permission is required and must be an array').custom((value) => {
    const allowedPermissions = [
      'create-Admin', 'create-subAdmin', 'transferBalance', 'status',
      'creditRef-Edit', 'partnership-Edit', 'creditRef-View', 'partnership-view',
      'user-profile-view', 'profile-view', 'view-admin-data', 'create-user',
      'accountStatement', 'activityLog', 'delete-admin', 'restore-admin',
      'move-to-trash', 'trash-view', 'view-subAdmin', 'view-balance','market-analysis','my-report'
    ];
    for (let i = 0; i < value.length; i++) {
      if (!allowedPermissions.includes(value[i])) {
        throw new Error(`Invalid permission: ${value[i]}`);
      }
    }
    return true;
  })
];

export const accountStatementSchema = [
  param('adminId').exists().withMessage('Id is required.'),
  query("dataType")
  .exists()
  .withMessage("dataType is required.")
  .isIn(["live", "olddata", "backup"])
  .withMessage("Valid values are 'live', 'olddata', or 'backup'."),
  query('page').optional().toInt().isInt({ min: 1 }).withMessage('Page number must be a positive integer.'),
  query('limit').optional().toInt().isInt({ min: 1 }).withMessage('Limit must be a positive integer.'),
    query(['startDate', 'endDate']).custom((value, { req }) => {
    const { startDate, endDate } = req.query;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error('startDate must be less than or equal to endDate.');
    }
    return true;
  })
];

export const userStatusSchema = [param('userName').exists().withMessage('User Name is required.')];

export const exUpdateBalanceSchema = [body('userId').notEmpty().withMessage('user ID is required'),
  body('amount').notEmpty().withMessage('amount is required'),
  // body('type').notEmpty().withMessage('type is required').isIn(['credit', 'debit'])
  // .withMessage('type must be either "credit" or "debit".'),
];

export const createdUserSchema = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('userName').trim().notEmpty().withMessage('Username is required'),
  body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export const sendBalanceSchema = [
  body('balance')
    .notEmpty()
    .withMessage('Balance is required')
    .isNumeric()
    .withMessage('Balance must be a numeric value')
    .custom((value) => parseFloat(value) > 0)
    .withMessage('Balance must be greater than 0'),
  body('adminId').notEmpty().withMessage('Admin ID is required'),
  body('userId').notEmpty().withMessage('User ID is required'),
];
export const calculateProfitLossSchema = [
  param("userName").notEmpty().withMessage("Username is required"),

];

export const marketProfitLossSchema = [
  param("userName").notEmpty().withMessage("Username is required"),
  param("gameId").notEmpty().withMessage("Game ID is required"),
];

export const runnerProfitLossSchema = [
  param("userName").notEmpty().withMessage("Username is required"),
  param("marketId").notEmpty().withMessage("Market ID is required"),
];

export const betHistorySchema = [
  param("userName")
    .notEmpty()
    .withMessage("Username is required."),
  param("gameId")
    .notEmpty()
    .withMessage("Game Id is required."),
      query(['startDate', 'endDate']).custom((value, { req }) => {
    const { startDate, endDate } = req.query;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error('startDate must be less than or equal to endDate.');
    }
    return true;
  })
];

export const activeInactive = [
  param('adminId').trim().notEmpty().withMessage('admin id is required'),
  body('isActive')
    .notEmpty()
    .withMessage('isActive is required')
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('locked')
    .notEmpty()
    .withMessage('locked is required')
    .isBoolean()
    .withMessage('locked must be a boolean'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];


export const validateGetLiveUserBetMarket = [
    param("marketId")
    .trim() 
    .notEmpty()
    .withMessage("Market ID is required.")
    .isUUID()
    .withMessage("Market ID must be a valid UUID."),
];

export const validateGetExternalLotteryP_L = [
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("pageSize must be a positive integer."),
  
    query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer."),
  
]

export const loginResetPasswordSchema = [
  body("userName")
    .trim()
    .notEmpty()
    .withMessage("Username is required"),
  body("oldPassword")
    .trim()
    .notEmpty()
    .withMessage("Old Password is required"),
  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New Password is required")
    .isLength({ min: 8 })
    .withMessage("New Password must be at least 8 characters long")
    .isAlphanumeric()
    .withMessage("New Password must be alphanumeric"),
];

export const logOutValidate = [
  body("adminId").notEmpty().withMessage("Admin ID is required.").isUUID(4).withMessage("Admin Id is not a valid."),
];

export const validateResetPassword = [
  body("userName")
    .trim()
    .notEmpty()
    .withMessage("Username is required"),
  body("oldPassword")
    .trim()
    .notEmpty()
    .withMessage("Old Password is required"),
  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New Password is required")
];


export const validateDownLineProfitLoss= [
  query("dataType")
    .exists()
    .withMessage("dataType is required.")
    .isIn(["live", "olddata", "backup"])
    .withMessage("Valid values are 'live', 'olddata', or 'backup'."),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer."),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer."),
];

export const validateProfitLossInput = [

  query("dataType")
    .exists()
    .withMessage("dataType is required.")
    .isIn(["live", "olddata", "backup"])
    .withMessage("Valid values are 'live', 'olddata', or 'backup'."),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer."),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer."),


];

export const validateProfitLossMarket = [
  query("dataType")
  .exists()
  .withMessage("dataType is required.")
  .isIn(["live", "olddata", "backup"])
  .withMessage("Valid values are 'live', 'olddata', or 'backup'."),
    query("type")
    .exists()
    .withMessage("type is required."),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer."),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer."),
];


export const validateAllUserProfitLossMarket = [
  param("marketId")
  .trim() 
  .notEmpty()
  .withMessage("Market ID is required.")
  .isUUID()
  .withMessage("Market ID must be a valid UUID."),
  query("dataType")
  .exists()
  .withMessage("dataType is required.")
  .isIn(["live", "olddata", "backup"])
  .withMessage("Valid values are 'live', 'olddata', or 'backup'."),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer."),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer."),
];