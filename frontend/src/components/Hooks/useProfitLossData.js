// useProfitLossData.js
import { useState, useRef, useCallback } from "react";
import {
  getEventPlLevelOne,
  getMarketWiseAllUserPlLevelThree,
  getMarketWisePlLevelTwo,
  getUserWiseBetHistoryColorGameLevelFour,
  getUserWiseBetHistoryLotteryLevelFour,
} from "../../Utils/service/apiService";
import { getUseProfitLossState } from "../../Utils/service/initiateState";

const useProfitLossData = () => {
  const [state, setState] = useState({
    ...getUseProfitLossState(),
    currentLevel: 1,
    parentData: null,
    grandParentData: null,
    greatGrandParentData: null, // For level 4 navigation
    levelRefreshKey: 0,
  });

  const lastFetchedData = useRef([]);
  const lastDateRange = useRef(state.dateRange);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Navigation history stack
  const navigationStack = useRef([]);

  const calculateTotals = (data) => {
    const totals = data.reduce(
      (acc, item) => {
        acc.uplinePL += item.uplinePL || 0;
        acc.downlinePL += item.downlinePL || 0;
        acc.commission += item.commission || 0;
        return acc;
      },
      { uplinePL: 0, downlinePL: 0, commission: 0 }
    );

    return {
      id: "total",
      sportName: "Total",
      uplinePL: totals.uplinePL,
      downlinePL: totals.downlinePL,
      commission: totals.commission,
      isTotalRow: true,
    };
  };

  const formatLevelOneData = (apiData) => {
    const formattedData = apiData.map((item) => ({
      id: item.gameName,
      sportName: item.gameName,
      uplinePL: -parseFloat(item.totalProfitLoss),
      downlinePL: parseFloat(item.totalProfitLoss),
      commission: 0,
      isTotalRow: false,
    }));

    if (formattedData.length > 0) {
      const totals = calculateTotals(formattedData);
      return [...formattedData, totals];
    }

    return formattedData;
  };

  const formatLevelTwoData = (apiData) => {
    return apiData.map((item) => ({
      id: item.marketId,
      gameName: item.gameName,
      marketName: item.marketName,
      marketId: item.marketId,
      totalPL: parseFloat(item.totalProfitLoss),
      date: new Date(item.date).toLocaleString(),
      uplinePL: -parseFloat(item.totalProfitLoss),
      downlinePL: parseFloat(item.totalProfitLoss),
      commission: 0,
    }));
  };

  const formatLevelThreeData = (apiData) => {
    return apiData.map((item) => ({
      id: item.userId,
      username: item.userName,
      runnerId: item.runnerId,
      marketName: item.marketName,
      gameName: item.gameName,
      marketId: item.marketId,
      totalPL: parseFloat(item.totalProfitLoss),
      date: new Date(item.date).toLocaleString(),
      uplinePL: -parseFloat(item.totalProfitLoss),
      downlinePL: parseFloat(item.totalProfitLoss),
      commission: 0,
    }));
  };

  const formatLevelFourData = (apiData, sportType) => {
    if (sportType === "Lottery") {
      return apiData.map((item) => ({
        ...item,
        id: item.userId || item.id,
        userName: item.userName,
        marketName: item.marketName,
        gameName: item.gameName || "Lottery",
        amount: item.amount,
        ticketPrice: item.ticketPrice,
        sem: item.sem,
        tickets: item.tickets,
        placeTime: item.placeTime || item.placeDate,
        settleTime: item.settleTime,
      }));
    } else if (sportType === "COLORGAME") {
      return apiData.map((item) => ({
        ...item,
        id: item.userId || item.id,
        userName: item.userName,
        marketName: item.marketName,
        gameName: item.gameName || "COLORGAME",
        runnerName: item.runnerName,
        rate: item.rate,
        type: item.type,
        value: item.value,
        bidAmount: item.bidAmount,
        placeDate: item.placeDate,
        matchDate: item.matchDate,
      }));
    } else {
      // Default format for other sports
      return apiData.map((item) => ({
        ...item,
        id: item.userId || item.id,
        userName: item.userName,
        eventName: item.eventName,
        marketName: item.marketName,
        amount: item.amount,
        placeTime: item.placeTime,
      }));
    }
  };

  const getTableData = useCallback(
    async (page = 1, pageSize = 10, search = "") => {
      const currentState = stateRef.current;

      // Skip API call if we're just updating dates
      if (currentState.preventAPICall && currentState.currentLevel === 1) {
        setState((prev) => ({ ...prev, preventAPICall: false }));
        return {
          data: lastFetchedData.current,
          pagination: {
            totalRecords: lastFetchedData.current.length || 0,
            totalPages: 1,
          },
        };
      }
      console.log("====>>> line 153", currentState.grandParentData?.sportName);
      try {
        let response, formattedData;
        const baseParams = {
          dataType: currentState.dataType,
          fromDate:
            currentState.dataType === "live" ? "" : currentState.dateRange.from,
          toDate:
            currentState.dataType === "live" ? "" : currentState.dateRange.to,
          pageNumber: page,
          totalEntries: pageSize,
          search: currentState.currentLevel === 4 ? "" : search, // No search for level 4
        };
        console.log(
          "====>>> line 164",
          currentState.grandParentData?.sportName
        );
        if (currentState.currentLevel === 1) {
          response = await getEventPlLevelOne(baseParams);
          formattedData = formatLevelOneData(response.data);
          lastFetchedData.current = formattedData;
        } else if (currentState.currentLevel === 2) {
          response = await getMarketWisePlLevelTwo({
            ...baseParams,
            Type: currentState.parentData.sportName,
          });
          formattedData = formatLevelTwoData(response.data);
        } else if (currentState.currentLevel === 3) {
          console.log("++++> level==", currentState.currentLevel === 3);
          response = await getMarketWiseAllUserPlLevelThree({
            ...baseParams,
            marketId: currentState.parentData.marketId,
          });
          formattedData = formatLevelThreeData(response.data);
        } else if (currentState.currentLevel === 4) {
          console.log(
            "🔥 currentLevel is:",
            currentState.currentLevel,
            typeof currentState.currentLevel
          );
          console.log("Level 4 params:", {
            username: currentState.parentData?.username,
            marketId: currentState.grandParentData?.marketId,
            sportName: currentState.grandParentData?.gameName,
          });
          const level4Params = {
            userName: currentState.parentData.username,
            marketId: currentState.grandParentData.marketId, // Always include marketId
          };
          console.log(
            "====>>> line 196",
            currentState.grandParentData?.gameName
          );
          // Add sport-specific parameters
          if (currentState.grandParentData?.gameName === "Lottery") {
            response = await getUserWiseBetHistoryLotteryLevelFour(
              level4Params
            );
            console.log("====>> response 218", response);
          } else if (currentState.grandParentData?.gameName === "COLORGAME") {
            // For ColorGame, only pass marketId — runnerId is not needed
            response = await getUserWiseBetHistoryColorGameLevelFour(
              level4Params
            );
          }

          formattedData = formatLevelFourData(
            response?.data || [],
            currentState.grandParentData?.gameName
          );
        }

        setState((prev) => ({ ...prev, loading: false }));

        return {
          data: formattedData || [],
          pagination: {
            totalRecords:
              response?.pagination?.totalItems || formattedData?.length || 0,
            totalPages: response?.pagination?.totalPages || 1,
          },
        };
      } catch (error) {
        console.error("Error fetching data:", error);
        setState((prev) => ({ ...prev, loading: false }));
        throw error;
      }
    },
    []
  );

  const navigateToLevel = useCallback(
    async (level, item = null) => {
      console.log("Navigating to level:", level, "with item:", item);
      setState((prev) => {
        const newState = {
          ...prev,
          loading: true,
          currentLevel: level,
          levelRefreshKey: prev.levelRefreshKey + 1,
        };

        // Update navigation stack and parent data based on level
        if (level === 1) {
          navigationStack.current = [];
          return {
            ...newState,
            parentData: null,
            grandParentData: null,
            greatGrandParentData: null,
          };
        } else if (level === 2) {
          navigationStack.current = [{ level: 1 }];
          return {
            ...newState,
            parentData: item,
            grandParentData: null,
            greatGrandParentData: null,
          };
        } else if (level === 3) {
          navigationStack.current = [
            { level: 1 },
            { level: 2, data: prev.parentData },
          ];
          return {
            ...newState,
            parentData: item,
            grandParentData: prev.parentData,
            greatGrandParentData: null,
          };
        } else if (level === 4) {
          navigationStack.current = [
            { level: 1 },
            { level: 2, data: prev.grandParentData },
            { level: 3, data: prev.parentData },
          ];
          return {
            ...newState,
            parentData: item,
            grandParentData: prev.parentData,
            greatGrandParentData: prev.grandParentData,
          };
        }
        return newState;
      });

      try {
        await getTableData(1, 10, "");
      } catch (error) {
        console.error("Error fetching data:", error);
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [getTableData]
  );

  const handleBackNavigation = useCallback(async () => {
    if (navigationStack.current.length === 0) return;

    const prevLevel = navigationStack.current.pop();

    setState((prev) => {
      const newState = {
        ...prev,
        loading: true,
        currentLevel: prevLevel.level,
        levelRefreshKey: prev.levelRefreshKey + 1,
      };

      if (prevLevel.level === 1) {
        return {
          ...newState,
          parentData: null,
          grandParentData: null,
          greatGrandParentData: null,
        };
      } else if (prevLevel.level === 2) {
        return {
          ...newState,
          parentData: prevLevel.data,
          grandParentData: null,
          greatGrandParentData: null,
        };
      } else if (prevLevel.level === 3) {
        return {
          ...newState,
          parentData: prevLevel.data,
          grandParentData:
            navigationStack.current.find((item) => item.level === 2)?.data ||
            null,
          greatGrandParentData: null,
        };
      } else if (prevLevel.level === 4) {
        return {
          ...newState,
          parentData: prevLevel.data,
          grandParentData:
            navigationStack.current.find((item) => item.level === 3)?.data ||
            null,
          greatGrandParentData:
            navigationStack.current.find((item) => item.level === 2)?.data ||
            null,
        };
      }
      return newState;
    });

    try {
      await getTableData(1, 10, "");
    } catch (error) {
      console.error("Error fetching data:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [getTableData]);

  const handleDataTypeChange = (e) => {
    const newDataType = e.target.value;
    setState((prev) => ({
      ...prev,
      dataType: newDataType,
      dateRange:
        newDataType === "live"
          ? getUseProfitLossState().dateRange
          : { from: "", to: "" },
      shouldDisableButton: newDataType === "live",
    }));
  };

  const handleDateChange = (field, value) => {
    setState((prev) => ({
      ...prev,
      preventAPICall: true,
      dateRange: { ...prev.dateRange, [field]: value },
    }));
  };

  const handleGetPL = async () => {
    const currentState = stateRef.current;
    if (
      state.dataType !== "live" &&
      (!state.dateRange.from || !state.dateRange.to)
    ) {
      alert("Please select both From and To dates");
      return;
    }

    const datesChanged =
      currentState.dateRange.from !== lastDateRange.current.from ||
      currentState.dateRange.to !== lastDateRange.current.to;

    if (!datesChanged && currentState.dataType !== "live") {
      console.log("Dates haven't changed - skipping API call");
      return;
    }

    lastDateRange.current = { ...currentState.dateRange };

    setState((prev) => ({
      ...prev,
      tableRefreshKey: prev.tableRefreshKey + 1,
    }));
  };

  return {
    state,
    setState,
    handleDataTypeChange,
    handleDateChange,
    handleGetPL,
    getTableData,
    navigateToLevel,
    handleBackNavigation,
  };
};

export default useProfitLossData;
