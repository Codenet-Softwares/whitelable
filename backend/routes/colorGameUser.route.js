import { Authorize } from '../middleware/auth.js';
import customErrorHandler from '../helper/customErrorHandler.js';
import { betHistorySchema, calculateProfitLossSchema, marketProfitLossSchema, runnerProfitLossSchema } from '../schema/commonSchema.js';
import { userGame, getUserBetHistory, getColorGameProfitLoss, marketProfitLoss, runnerProfitLoss, userAccountStatement, getUserBetList, userLastLogin, getActiveLockedAdmins } from '../controller/colorGameUser.controller.js';
import { string } from '../constructor/string.js';

export const colorGameUserRoute = (app) => {
  app.get('/api/user-colorGame-games', userGame);

  app.get('/api/user-colorGame-betHistory/:userName/:gameId', betHistorySchema, customErrorHandler,
    Authorize([
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
    ]),
    getUserBetHistory
  );

  app.get('/api/user-colorGame-profitLoss/:userName', calculateProfitLossSchema, customErrorHandler,
    Authorize([
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
    ]),
    getColorGameProfitLoss);

  app.get('/api/user-colorGame-market_profitLoss/:userName/:gameId', marketProfitLossSchema, customErrorHandler,
    Authorize([
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
    ]),
    marketProfitLoss);

  app.get('/api/user-colorGame-runner_profitLoss/:userName/:marketId', runnerProfitLossSchema, customErrorHandler,
    Authorize([
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
    ]),
    runnerProfitLoss);

  app.get(
    '/api/user-colorGame-account-statement/:userName',
    userAccountStatement,
  );

  app.get('/api/get-colorGame-user-betList/:userName/:marketId', getUserBetList)

  app.post('/api/colorGame-user-lastLoginTime', userLastLogin)

  app.get('/api/admin-user/Active-Locked', getActiveLockedAdmins);

}