import { string } from "../constructor/string.js";
import {
  getLiveBetGames,
  getLiveUserBet,
  getLiveUserBetMarket,
  getUserBetMarket,
  getUserMasterBook,
  userLiveBet,
} from "../controller/liveMarketBet.controller.js";
import customErrorHandler from "../helper/customErrorHandler.js";
import { Authorize } from "../middleware/auth.js";
import { validateGetLiveUserBetMarket } from "../schema/commonSchema.js";

export const liveMarketBetRoute = (app) => {
  app.get(
    "/api/get-userBetMarket/:userName/:marketId",
    getUserBetMarket
  );

  app.get(
    "/api/get-live-betGames",
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
      string.subSuperAgent,
      string.marketAnalysis,
    ]),
    getLiveBetGames
  );

  app.get(
    "/api/get-live-users/:marketId",
    validateGetLiveUserBetMarket,
    customErrorHandler,
    Authorize([
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
      string.marketAnalysis
    ]),
    getLiveUserBet
  );

  app.get(
    "/api/get-live-users-marketUser/:marketId",
    validateGetLiveUserBetMarket,
    customErrorHandler,
    Authorize([
      string.superAdmin,
      string.whiteLabel,
      string.hyperAgent,
      string.superAgent,
      string.masterAgent,
    ]),
    getLiveUserBetMarket
  );

  app.post(
    "/api/get-user-master-book",
    Authorize([
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
      string.marketAnalysis
    ]),
    getUserMasterBook
  );

  app.post(
    "/api/get-user-live-bet",
    Authorize([
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
      string.marketAnalysis
    ]),
    userLiveBet
  );

};
