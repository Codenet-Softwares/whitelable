import UrlConstant from "../constant/UrlConstant";
import strings from "../constant/stringConstant";
import { getAuthCallParams, getNoAuthCallParams, makeCall } from "./service";

export async function login(body, isToast = false) {
  try {
    const callParams = getNoAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(UrlConstant.login, callParams, isToast);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function allAdminCreate(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(UrlConstant.Create, callParams, isToast);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function viewBalance(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.viewBalance}/${body._id}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getAllCreate(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.allCreate}/${body._id}?page=${body.pageNumber}&pageSize=${body.dataLimit}&userName=${body.name}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function updateCreditRef(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.PUT, body.data, isToast);
    const response = await makeCall(
      `${UrlConstant.updateCreditRef}/${body.id}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function updatePartnership(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.PUT, body.data, isToast);
    const response = await makeCall(
      `${UrlConstant.updatePartnership}/${body.id}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function transferAmount(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(
      strings.POST,
      body.data,
      isToast
    );
    const response = await makeCall(
      `${UrlConstant.transferAmount}/${body.adminId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function addCash(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(
      strings.POST,
      body.data,
      isToast
    );
    const response = await makeCall(
      `${UrlConstant.addCash}/${body.adminId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getPartnershipLog(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.viewPartnership}/${body.id}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getCreditRefLog(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.viewCreditRefLog}/${body.id}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function createSubAdmin(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      `${UrlConstant.createSubAdmin}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getAllSubAdminCreate(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.allSubAdmin}/${body._id}?page=${body.pageNumber}&pageSize=${body.dataLimit}&userName=${body.name}`,
      callParams,
      isToast
    );

    return response;
  } catch (error) {
    throw error;
  }
}

export async function getHierarchy(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      `${UrlConstant.getHierarchy}/${body.adminName}/${body.action}?pageSize=${body.totalEntries}&page=${body.pageNumber}&searchName=${body.searchName}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getviewSubAdminPermission(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      `${UrlConstant.viewSubAdminPermission}/${body._id}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getEditSubAdminPermission(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.PUT, body, isToast);
    const response = await makeCall(
      `${UrlConstant.editSubAdminPermission}/${body._id}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getUserProfileView(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);

    const response = await makeCall(
      `${UrlConstant.UserProfileView}/${body.userName}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getAllTransactionView(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.allTransactionView}/${body.userName}?page=${body.pageNumber}&startDate=${body.fromDate}&endDate=${body.toDate}&limit=${body.limit}&dataType=${body.dataSource}`, //&dataType=${body.dataSource}
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getAccountStatement_api(body = {}, isToast = false) {
  try {
    console.log("dates", body.fromDate, body.toDate);
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.AccountStatement}/${body._id}?page=${body.pageNumber}&pageSize=${body.dataLimit}&startDate=${body.fromDate}&endDate=${body.toDate}&dataType=${body.dataSource}`, //&startDate=${body.fromDate}&endDate=${body.toDate} work pending by serverside
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getView_AddCash_history_api(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.View_AddCash_history}/${body._id}?page=${body.pageNumber}&pageSize=${body.dataLimit}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function moveToTrash_api(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      UrlConstant.moveToTrash,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function viewTrash_api(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.viewTrash}/${body.adminId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function deleteTrash_api(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.DELETE, body, isToast);
    const response = await makeCall(
      `${UrlConstant.deleteTrash}/${body.trashId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function restoreTrash_api(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      UrlConstant.restoreTrash,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getActivityLog_api(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.activityLog}/${body.userName}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function resetAdminPassword_api(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      UrlConstant.resetPasswordAdmin,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getGameNames(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.getGameNames}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getBetHistory(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.getBetHistory}/${body.userName}/${body.gameId}?startDate=${body.fromDate}&endDate=${body.toDate}&page=${body.page}&limit=${body.limit}&dataType=${body.dataSource}&type=${body.dataType}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getProfitLossGame(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.getProfitLossGame}/${body.userName}?startDate=${body.fromDate}&endDate=${body.toDate}&limit=${body.limit}&search=${body.searchName}&dataType=${body.dataSource}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getProfitLossEvent(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.getProfitLossEvent}/${body.userName}/${body.gameId}`, ///&limit=${body.limit}&search=${body.searchName} ((by search sending blank server is not giving data))
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getProfitLossRunner(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.getProfitLossRunner}/${body.userName}/${body.marketId}`, ///&limit=${body.limit}&search=${body.searchName} ((by search sending blank server is not giving data))
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getLiveGames(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.get_Live_BetGame}`, ///&limit=${body.limit}&search=${body.searchName} ((by search sending blank server is not giving data))
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getUserGetMarket(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.get_user_BetMarket}/${body.marketId}`, ///&limit=${body.limit}&search=${body.searchName} ((by search sending blank server is not giving data))
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getBetList(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.betList}/${body.userName}/${body.runnerId}`, ///&limit=${body.limit}&search=${body.searchName} ((by search sending blank server is not giving data))
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function StatusChange(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      `${UrlConstant.activeInactive}/${body.id}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function GetLiveUsers(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.getLiveUsers}/${body.marketId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function GetBetBook(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      `${UrlConstant.getBetBook}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getLotteryBetHistory(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      `${UrlConstant.getLotteryBetHistory}/${body.userName}?page=${body.page}&limit=${body.limit}&startDate=${body.fromDate}&endDate=${body.toDate}&dataType=${body.dataSource}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getlotteryProfitLossEvent(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.getLotteryProfitLossEvent}/${body.userName}?page=${body.pageNumber}&limit=${body.dataLimit}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getLotteryBetList(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.betLotteryList}/${body.userName}/${body.marketId}`, ///&limit=${body.limit}&search=${body.searchName} ((by search sending blank server is not giving data))
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function ResetAdminPassword(body = {}, isToast = false) {
  try {
    const callParams = getNoAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      UrlConstant.resetPassword,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getLotteryMarketAnalysis(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.betLotteryMarketAnalysis}/${body.marketId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
