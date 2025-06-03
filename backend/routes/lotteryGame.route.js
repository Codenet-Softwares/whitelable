import { string } from "../constructor/string.js";
import { getBetHistoryP_L, getLotteryBetHistory, getLotteryP_L, lotteryMarketAnalysis } from "../controller/lotteryGame.controller.js";
import customErrorHandler from "../helper/customErrorHandler.js";
import { Authorize } from "../middleware/auth.js";
import { validateGetExternalLotteryP_L } from "../schema/commonSchema.js";

export const lotteryGameModule = (app) => {
    app.post('/api/get-lottery-bet-history/:userName', getLotteryBetHistory);

    app.get('/api/get-lottery-marketAnalysis/:marketId', Authorize([
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
          string.marketAnalysis
        ]), lotteryMarketAnalysis);

    app.get('/api/lottery-profit-loss/:userName', validateGetExternalLotteryP_L, customErrorHandler, getLotteryP_L);

    app.get('/api/lottery-betHistory-profitLoss/:userName/:marketId', getBetHistoryP_L);


}