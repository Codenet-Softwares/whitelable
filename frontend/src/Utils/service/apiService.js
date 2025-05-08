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
      `${UrlConstant.allSubAdmin}/${body._id}?page=${body.pageNumber}&pageSize=${body.dataLimit}&searchQuery=${body.name}`,
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
      `${UrlConstant.viewTrash}/${body.adminId}?search=${body.search}&page=${body.page}&limit=${body.pageLimit}`,
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
      `${UrlConstant.getProfitLossEvent}/${body.userName}/${body.gameId}?page=${body.pageNumber}&limit=${body.dataLimit}&searchMarketName=${body.searchName}`, ///((by search sending blank server is not giving data))
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
      `${UrlConstant.getProfitLossRunner}/${body.userName}/${body.marketId}`, ///((by search sending blank server is not giving data))
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
      `${UrlConstant.get_Live_BetGame}?page=${body.pageNumber}&limit=${body.dataLimit}&search=${body.search}&type=${body.type}`, ///&limit=${body.limit}&search=${body.searchName} ((by search sending blank server is not giving data))
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
    const callParams = getNoAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.get_user_BetMarket}/${body.userName}/${body.marketId}`,
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
      `${UrlConstant.betList}/${body.userName}/${body.runnerId}?page=${body.page}&pageSize=${body.limit}`, ///&limit=${body.limit}&search=${body.searchName} ((by search sending blank server is not giving data))
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
      `${UrlConstant.getLotteryBetHistory}/${body.userName}?page=${body.page}&limit=${body.limit}&startDate=${body.fromDate}&endDate=${body.toDate}&dataType=${body.dataSource}&type=${body.dataType}`,
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
      `${UrlConstant.getLotteryProfitLossEvent}/${body.userName}?page=${body.pageNumber}&limit=${body.dataLimit}&searchMarketName=${body.searchName}`,
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
      `${UrlConstant.betLotteryList}/${body.userName}/${body.marketId}`, ///((by search sending blank server is not giving data))
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
      `${UrlConstant.betLotteryMarketAnalysis}/${body.marketId}?pageSize=${body.totalEntries}&page=${body.pageNumber}&search=${body.search}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getMarket_LiveBet(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      `${UrlConstant.liveBet}?page=${body.pageNumber}&pageSize=${body.totalEntries}&search=${body.search}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function resetPasswordSuperAdmin(body = {}, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      `${UrlConstant.resetSuperAdmin}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function resetPasswordSubAdmin(body = {}, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      `${UrlConstant.resetSubAdmin}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function deleteSubAdmin(body = {}, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body);
    const response = await makeCall(
      `${UrlConstant.deleteSubAdmin}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getUserHirerchy(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.userHirerchy}/${body.userName}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}


export async function getAdminDownline(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.adminDownline}/${body.userId}?pageSize=${body.totalEntries}&page=${body.pageNumber}&searchTerm=${body.search}&startDate=${body.fromDate}&endDate=${body.toDate}&dataType=${body.dataSource}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

//Event P/L  level-1 table Api
export async function getEventPlLevelOne(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.PlLevelOne}?dataType=${body.dataType}&pageSize=${body.totalEntries}&page=${body.pageNumber}&search=${body.search}&startDate=${body.fromDate}&endDate=${body.toDate}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

//marketWise P/L  level-2 table Api
export async function getMarketWisePlLevelTwo(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.MarketWiseLevelTwo}?type=${body.Type}&pageSize=${body.totalEntries}&page=${body.pageNumber}&search=${body.search}&dataType=${body.dataType}&startDate=${body.fromDate}&endDate=${body.toDate}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}


//marketWise all user  P/L  level-3 table Api
export async function getMarketWiseAllUserPlLevelThree(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.AllUserMarketwiseLevelThree}/${body.marketId}?pageSize=${body.totalEntries}&page=${body.pageNumber}&search=${body.search}&dataType=${body.dataType}&startDate=${body.fromDate}&endDate=${body.toDate}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}


// userWise BetHistory  level-4 table Api for lottery 
export async function getUserWiseBetHistoryLotteryLevelFour(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.UsertwiseBetHistoryLevelFour}/${body.userName}/${body.marketId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}


// userWise BetHistory  level-4 table Api for colorgame
export async function getUserWiseBetHistoryColorGameLevelFour(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.UsertwisecolorGameLevelFour}/${body.userName}/${body.marketId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function addOuterImage(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      `${UrlConstant.OuterImage}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function updateOuterImage(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.UpdateImage}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function deleteOuterImage(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.DELETE, body, isToast);
    const response = await makeCall(
      `${UrlConstant.DeleteImage}/${body.imageId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
// export async function activeInactiveImage(body = {}, isToast = false) {
//   try {
//     const callParams = await getAuthCallParams(strings.GET, body, isToast);
//     const response = await makeCall(
//       `${UrlConstant.ActiveInactiveOuterImage}/${body.imageId}/`,
//       callParams,
//       isToast
//     );
//     return response;
//   } catch (error) {
//     throw error;
//   }
// }
export async function activeInactiveImage(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams("POST", {
      token: body.token,
      data: { isActive: body.isActive },
    }, isToast);

    const response = await makeCall(
      `${UrlConstant.ActiveInactiveOuterImage}/${body.imageId}/`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function addInnerImage(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      `${UrlConstant.InnerImage}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function updateInnerImage(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.UpdateInImage}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function deleteInnerImage(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.DELETE, body, isToast);
    const response = await makeCall(
      `${UrlConstant.DeleteInImage}/${body.imageId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function activeInactiveInnerImage(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams("POST", {
      token: body.token,
      data: { isActive: body.isActive },
    }, isToast);

    const response = await makeCall(
      `${UrlConstant.ActiveInactiveInImage}/${body.imageId}/`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function gameSliderImage(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      `${UrlConstant.gameMiniImage}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getGameSliderImage(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.UpdateGameImage}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function deleteGameCreatedImage(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.DELETE, body, isToast);
    const response = await makeCall(
      `${UrlConstant.DeleteGameImage}/${body.imageId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function activeInactiveGameImage(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams("POST", {
      token: body.token,
      data: { isActive: body.isActive },
    }, isToast);

    const response = await makeCall(
      `${UrlConstant.ActiveInactiveGmImage}/${body.imageId}/`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function gifSliderImage(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      `${UrlConstant.gifGameSliderImage}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function getGifSlider(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.UpdateGIF}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function deleteCreateGif(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.DELETE, body, isToast);
    const response = await makeCall(
      `${UrlConstant.DeleteGameGIF}/${body.imageId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function activeInactiveGameGif(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams("POST", {
      token: body.token,
      data: { isActive: body.isActive },
    }, isToast);

    const response = await makeCall(
      `${UrlConstant.ActiveInactiveGIF}/${body.imageId}/`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function CreateInnerAnnouncement(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      `${UrlConstant.InnerGameAnnouncement}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function getInnerAnnouncement(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.UpdateInnerAnnouncement}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function deleteInnerAnnouncement(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.DELETE, body, isToast);
    const response = await makeCall(
      `${UrlConstant.InnerDeleteAnnouncement}/${body.announceId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function CreateOuterAnnouncement(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      `${UrlConstant.OuterGameAnnouncement}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function getOuterAnnouncement(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${UrlConstant.UpdateOuterAnnouncement}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function deleteOuterAnnouncement(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.DELETE, body, isToast);
    const response = await makeCall(
      `${UrlConstant.OuterDeleteAnnouncement}/${body.announceId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}