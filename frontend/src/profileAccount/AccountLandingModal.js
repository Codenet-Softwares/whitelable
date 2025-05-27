import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";
import ActivityLog from "./ActivityLog";

import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import AccountStatement from "./AccountStatement";
import AccountProfile from "./AccountProfile";

import {
  getActivityLog_api,
  getAllTransactionView,
  getBetHistory,
  getGameNames,
  getLotteryBetHistory,
  getProfitLossGame,
  getUserProfileView,
} from "../Utils/service/apiService";
import { accountStatementInitialState } from "../Utils/service/initiateState";
import BetHistory from "./BetHistory";
import ProfitAndLoss from "./ProfitAndLoss";
import strings from "../Utils/constant/stringConstant";
import { initialBetHistoryState, isFormValidForApiCall } from "../Utils/helper";

const AccountLandingModal = () => {
  const { userName, toggle } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(accountStatementInitialState());

  const [betHistoryData, SetBetHistoryData] = useState(initialBetHistoryState);

  const [profitLossData, SetProfitLossData] = useState({
    dataGameWise: [],
    dataMarketWise: [],
    dataHistory: [],
    totalPages: 0,
    totalData: 0,
    currentPage: 1,
    itemPerPage: 10,
    endDate: "",
    startDate: "",
    searchItem: "",
    dataSource: "live",
    backupStartDate: null,
    backupEndDate: null,
  });

  const formatDate = (dateString) => {
    // Parse the date string to create a Date object
    const date = new Date(dateString);

    // Extract the year, month, and day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, "0");

    // Format the date as "YYYY-MM-DD"
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    getAll_userProfileStatement();
    if (toggle === "betHistory") {
      getGameForBetHistory();
    }
  }, [userName, toggle]);

useEffect(() => {
  if (toggle === "statement") {
    getAll_transactionView();
  }

  if (toggle === "activity") {
    getActivityLog();
  }

  if (toggle === "betHistory" && betHistoryData.initialized) {
    const {
      SelectedGameId,
      dataSource,
      dataType,
      startDate,
      endDate,
    } = betHistoryData;

    const isLive = dataSource === "live";
    const isBackup = dataSource === "backup" || dataSource === "olddata";
    const noDatesSelected = !startDate && !endDate;

    if (SelectedGameId && dataSource && dataType) {
      if (isLive) {
        if (SelectedGameId === "lottery") {
          getHistoryForLotteryBetHistory();
        } else {
          getHistoryForBetHistory();
        }
      } else if (isBackup && noDatesSelected) {
        console.log("Fetching backup/olddata with empty dates");
        if (SelectedGameId === "lottery") {
          getHistoryForLotteryBetHistory();
        } else {
          getHistoryForBetHistory();
        }
      }
    }
  }
}, [
  userName,
  state.dataSource,
  state.currentPage,
  state.startDate,
  state.endDate,
  state.totalEntries,
  betHistoryData.SelectedGameId,
  betHistoryData.currentPage,
  betHistoryData.itemPerPage,
  betHistoryData.endDate,
  betHistoryData.startDate,
  betHistoryData.dataSource,
  betHistoryData.dataType,
  toggle,
  betHistoryData.initialized,
]);


  useEffect(() => {
    if (toggle === "profit_loss") {
      getProfitLossGameWise();
    }
  }, [
    profitLossData.startDate,
    profitLossData.endDate,
    profitLossData.currentPage,
    profitLossData.itemPerPage,
    // profitLossData.searchItem,
    profitLossData.dataSource,
    toggle,
  ]);

  // Debounce for search
  useEffect(() => {
    if (toggle === "profit_loss") {
      let timer = setTimeout(() => {
        getProfitLossGameWise();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [profitLossData.searchItem]);

  async function getAll_userProfileStatement() {
    const response = await getUserProfileView({ userName });
    setState((prevState) => ({
      ...prevState,
      profileView: response.data,
    }));
  }

  async function getAll_transactionView() {
    const response = await getAllTransactionView({
      userName,
      pageNumber: state.currentPage,
      fromDate: state.startDate,
      toDate: state.endDate,
      limit: state.totalEntries,
      dataSource: state.dataSource,
    });
    setState((prevState) => ({
      ...prevState,
      statementView: response.data,
      totalPages: response?.pagination?.totalPages,
      totalData: response?.pagination?.totalItems,
    }));
  }

  async function getActivityLog() {
    const response = await getActivityLog_api({ userName });
    setState((prevState) => ({
      ...prevState,
      activityView: response.data,
    }));
  }

  // FOR BETHISTORY GAMENAMES  ONLY FOR COLORGAMES in slect dropdown
  async function getGameForBetHistory() {
    const response = await getGameNames();
    const gameList = response?.data || [];

    SetBetHistoryData((prev) => ({
      ...prev,
      gameList,
      initialized: true,
    }));
  }
 // FOR BETHISTORY OF COLORGAME
async function getHistoryForBetHistory() {
  const { dataSource, startDate, endDate, SelectedGameId, currentPage, itemPerPage, dataType } = betHistoryData;

  const isBackup = dataSource === "backup" || dataSource === "olddata";
  const noDatesSelected = !startDate && !endDate;

  // Only block API call if LIVE or if BACKUP but dates are partially selected
  const shouldValidate = dataSource === "live" || (isBackup && (startDate || endDate));
  if (shouldValidate && !isFormValidForApiCall(betHistoryData)) return;

  const response = await getBetHistory({
    userName,
    gameId: SelectedGameId,
    fromDate: startDate ? formatDate(startDate) : "",
    toDate: endDate ? formatDate(endDate) : "",
    page: currentPage,
    limit: itemPerPage,
    dataSource,
    dataType,
  });

  SetBetHistoryData((prev) => ({
    ...prev,
    dataHistory: response?.data || [],
    totalPages: response?.pagination?.totalPages || 0,
    totalData: response?.pagination?.totalItems || 0,
  }));
}

// FOR BETHISTORY OF LOTTERY
async function getHistoryForLotteryBetHistory() {
  const { dataSource, startDate, endDate, SelectedGameId, currentPage, itemPerPage, dataType } = betHistoryData;

  const isBackup = dataSource === "backup" || dataSource === "olddata";
  const noDatesSelected = !startDate && !endDate;

  const shouldValidate = dataSource === "live" || (isBackup && (startDate || endDate));
  if (shouldValidate && !isFormValidForApiCall(betHistoryData)) return;

  const response = await getLotteryBetHistory({
    userName,
    gameId: SelectedGameId,
    fromDate: startDate ? formatDate(startDate) : "",
    toDate: endDate ? formatDate(endDate) : "",
    page: currentPage,
    limit: itemPerPage,
    dataSource,
    dataType,
  });

  SetBetHistoryData((prev) => ({
    ...prev,
    dataHistory: response?.data || [],
    totalPages: response?.pagination?.totalPages || 0,
    totalData: response?.pagination?.totalItems || 0,
  }));
}


  // For Game wise Profit Loss Data to show
async function getProfitLossGameWise() {
  const response = await getProfitLossGame({
    userName,
    fromDate: profitLossData.startDate,
    toDate: profitLossData.endDate,
    limit: profitLossData.itemPerPage,
    searchName: profitLossData.searchItem,
    dataSource: profitLossData.dataSource,
  });

  if (response && response.data && response.pagination) {
    SetProfitLossData((prevState) => ({
      ...prevState,
      dataGameWise: response.data,
      totalPages: response.pagination.totalPages,
      totalData: response.pagination.totalItems,
    }));
  } else {
    console.error("Invalid response from getProfitLossGame:", response);
    // Optionally set fallback or show error state here
  }
}

  const startIndex = Math.min((state.currentPage - 1) * state.totalEntries + 1);
  const endIndex = Math.min(
    state.currentPage * state.totalEntries,
    state.totalData
  );

  const startIndexBetHistory = Math.min(
    (betHistoryData.currentPage - 1) * betHistoryData.itemPerPage + 1
  );
  const endIndexBetHistory = Math.min(
    betHistoryData.currentPage * betHistoryData.itemPerPage,
    betHistoryData.totalData
  );

  const handlePageChange = (page) => {
    setState((prevState) => ({
      ...prevState,
      currentPage: page,
    }));
  };

  const handleBetHistoryPageChange = (page) => {
    SetBetHistoryData((prevState) => ({
      ...prevState,
      currentPage: page,
    }));
  };

  const handleProfitLossPageChange = (page) => {
    SetProfitLossData((prevState) => ({
      ...prevState,
      currentPage: page,
    }));
  };

  const handleGetStatement = (startDate, endDate) => {
    setState((prevState) => ({
      ...prevState,
      startDate,
      endDate,
    }));
  };

  const handelStatement = () => {
    navigate(`/account-landing/${userName}/statement`);
  };

  const handelActivity = () => {
    navigate(`/account-landing/${userName}/activity`);
  };

  const handelProfile = () => {
    navigate(`/account-landing/${userName}/profile`);
  };

  const handelBetHistory = () => {
    navigate(`/account-landing/${userName}/betHistory`);
  };

  const handelProfitLoss = () => {
    navigate(`/account-landing/${userName}/profit_loss`);
  };

  const handleDateStatement = () => {
    setState((prevState) => ({
      ...prevState,
      startDate: formatDate(state.backupStartDate),
      endDate: formatDate(state.backupEndDate),
    }));
  };

  const handleDateForProfitLoss = () => {
    SetProfitLossData((prevState) => ({
      ...prevState,
      startDate: formatDate(profitLossData.backupStartDate),
      endDate: formatDate(profitLossData.backupEndDate),
    }));
  };
 const handleDateForBetHistory = () => {
  if (betHistoryData.SelectedGameId === "lottery") {
    getHistoryForLotteryBetHistory();
  } else {
    getHistoryForBetHistory();
  }
};
  function formatDateForUi(dateString) {
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  }

  let componentToRender;
  if (toggle === "statement") {
    componentToRender = (
      <AccountStatement
        props={state.statementView}
        handleGetStatement={handleGetStatement}
        handlePageChange={handlePageChange}
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        startDate={state.backupStartDate}
        endDate={state.backupEndDate}
        setStartDate={(date) =>
          setState((prevState) => ({ ...prevState, backupStartDate: date }))
        }
        setEndDate={(date) =>
          setState((prevState) => ({ ...prevState, backupEndDate: date }))
        }
        startIndex={startIndex}
        endIndex={endIndex}
        totalData={state.totalData}
        setState={setState}
        dataSource={state.dataSource}
        handleDateStatement={handleDateStatement}
      />
    );
  } else if (toggle === "activity") {
    componentToRender = <ActivityLog props={state.activityView} />;
  } else if (toggle === "profile") {
    componentToRender = (
      <AccountProfile
        props={state.profileView}
        UserName={userName}
        createdByUser={state.profileView.createdById}
      />
    );
  } else if (toggle === "betHistory") {
    componentToRender = (
      <BetHistory
        props={state.profileView}
        UserName={userName}
        data={betHistoryData}
        setData={SetBetHistoryData}
        startDate={betHistoryData.startDate}
        endDate={betHistoryData.endDate}
        setStartDate={(date) =>
          SetBetHistoryData((prevState) => ({ ...prevState, startDate: date }))
        }
        setEndDate={(date) =>
          SetBetHistoryData((prevState) => ({ ...prevState, endDate: date }))
        }
        startIndex={startIndexBetHistory}
        endIndex={endIndexBetHistory}
        totalData={betHistoryData.totalData}
        currentPage={betHistoryData.currentPage}
        totalPages={betHistoryData.totalPages}
        handlePageChange={handleBetHistoryPageChange}
        SetBetHistoryData={SetBetHistoryData}
        formatDateForUi={formatDateForUi}
        dataType={betHistoryData.dataType}
        dropdownOpen={betHistoryData.dropdownOpen}
        handleDateForBetHistory={handleDateForBetHistory}
      />
    );
  } else if (toggle === "profit_loss") {
    componentToRender = (
      <ProfitAndLoss
        props={state.profileView}
        UserName={userName}
        dataGameWise={profitLossData.dataGameWise}
        startDate={profitLossData.backupStartDate}
        endDate={profitLossData.backupEndDate}
        setStartDate={(date) =>
          SetProfitLossData((prevState) => ({
            ...prevState,
            backupStartDate: date,
          }))
        }
        setEndDate={(date) =>
          SetProfitLossData((prevState) => ({
            ...prevState,
            backupEndDate: date,
          }))
        }
        currentPage={profitLossData.currentPage}
        totalData={profitLossData.totalData}
        totalPages={profitLossData.totalPages}
        handlePageChange={handleProfitLossPageChange}
        SetProfitLossData={SetProfitLossData}
        handleDateForProfitLoss={handleDateForProfitLoss}
        dataSource={profitLossData.dataSource} 
      />
    );
  }
  return (
    <div className="container">
      <div className="row row-no-gutters">
        {/* First Section */}
        <div className="col-sm-4">
           <span className="me-3" onClick={() => navigate('/wallet')}>
            <button className="btn btn-secondary">&#8592;</button>
          </span>
          <div className="card mt-3" style={{ width: "18rem" }}>
            <ul className="list-group list-group-flush">
              <li
                className="list-group-item text-white h6 text-uppercase text-center"
                style={{ backgroundColor: "#1E2761" }}
              >
                My Account
              </li>
              <li
                className="list-group-item"
                style={{
                  cursor: "pointer",
                  backgroundColor: toggle === "statement" ? "#d1d9f0" : "",
                }}
                onClick={handelStatement}
              >
                Account Statement
              </li>
              <li
                className="list-group-item"
                style={{
                  cursor: "pointer",
                  backgroundColor: toggle === "activity" ? "#d1d9f0" : "",
                }}
                onClick={handelActivity}
              >
                Activity Log
              </li>
              <li
                className="list-group-item"
                style={{
                  cursor: "pointer",
                  backgroundColor: toggle === "profile" ? "#d1d9f0" : "",
                }}
                onClick={handelProfile}
              >
                Profile
              </li>
              {state?.profileView?.role === strings.user && (
                <>
                  {" "}
                  <li
                    className="list-group-item"
                    style={{
                      cursor: "pointer",
                      backgroundColor: toggle === "betHistory" ? "#d1d9f0" : "",
                    }}
                    onClick={handelBetHistory}
                  >
                    Bet History
                  </li>
                  <li
                    className="list-group-item"
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        toggle === "profit_loss" ? "#d1d9f0" : "",
                    }}
                    onClick={handelProfitLoss}
                  >
                    Profit & Loss
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Second Section */}

        {componentToRender}
      </div>
    </div>
  );
};

export default AccountLandingModal;
