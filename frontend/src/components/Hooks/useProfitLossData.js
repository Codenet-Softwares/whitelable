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
  const [state, setState] = useState(getUseProfitLossState());
  const lastFetchedData = useRef([]); // Stores last fetched data to avoid re-fetching
  const lastDateRange = useRef(state.dateRange); // Tracks last used date range
  const stateRef = useRef(state); // Ref to access current state in callbacks
  stateRef.current = state; // Keep ref in sync with state

  // Navigation stack to keep track of user navigation history for "back" functionality
  const navigationStack = useRef([]);

  // Calculate totals for Profit and Loss (PL) data
  const calculateTotals = (data) => {
    const totals = data.reduce(
      (acc, item) => {
        // Sum up the PL, commission, etc. for each item
        acc.uplinePL += item.uplinePL || 0;
        acc.downlinePL += item.downlinePL || 0;
        acc.commission += item.commission || 0;
        return acc;
      },
      { uplinePL: 0, downlinePL: 0, commission: 0 } // Initial values
    );

    return {
      id: "total", // The total row identifier
      sportName: "Total", // Label for the total row
      uplinePL: totals.uplinePL, // Total uplinePL
      downlinePL: totals.downlinePL, // Total downlinePL
      commission: totals.commission, // Total commission
      isTotalRow: true, // A flag to identify this as a total row
    };
  };

  // Format the level 1 data fetched from the API
  const formatLevelOneData = (apiData) => {
    const formattedData = apiData.map((item) => ({
      id: item.gameName,
      sportName: item.gameName,
      uplinePL: -parseFloat(item.totalProfitLoss), // Convert profit/loss to numeric and handle signs
      downlinePL: parseFloat(item.totalProfitLoss), // Convert profit/loss to numeric and handle signs
      commission: 0, // Commission is 0 at this level
      isTotalRow: false, // Not a total row
    }));

    if (formattedData.length > 0) {
      const totals = calculateTotals(formattedData); // Get the totals for this data
      return [...formattedData, totals]; // Add totals as the last item in the array
    }

    return formattedData;
  };
  // Format the level 2 data fetched from the API
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
  // Format the level 3 data fetched from the API
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
  // Format level 4 data based on the type of sport (Lottery, COLORGAME, etc.)
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
  // Get table data for the current state, fetching from the API and formatting the results
  const getTableData = useCallback(
    async (page = 1, pageSize = 10, search = "") => {
      const currentState = stateRef.current;

      // If API call is prevented (due to the same date range and level 1), return the cached data
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

      // Base parameters with live/data handling for the API call
      const baseParams = {
        dataType: currentState.dataType,
        fromDate:
          currentState.dataType === "live" ? "" : currentState.dateRange.from,
        toDate:
          currentState.dataType === "live" ? "" : currentState.dateRange.to,
        pageNumber: page,
        totalEntries: pageSize,
        search: currentState.currentLevel === 4 ? "" : search,
      };

      // API call mapping and handling for each level
      const levelHandlers = {
        1: async () => {
          const response = await getEventPlLevelOne(baseParams);
          const formattedData = formatLevelOneData(response.data);
          lastFetchedData.current = formattedData;
          return { response, formattedData };
        },
        2: async () => {
          const response = await getMarketWisePlLevelTwo({
            ...baseParams,
            Type: currentState.parentData.sportName,
          });
          return {
            response,
            formattedData: formatLevelTwoData(response.data),
          };
        },
        3: async () => {
          const response = await getMarketWiseAllUserPlLevelThree({
            ...baseParams,
            marketId: currentState.parentData.marketId,
          });
          return {
            response,
            formattedData: formatLevelThreeData(response.data),
          };
        },
        4: async () => {
          const level4Params = {
            userName: currentState.parentData.username,
            marketId: currentState.grandParentData.marketId,
          };

          const gameType = currentState.grandParentData?.gameName;
          const apiCall =
            gameType === "Lottery"
              ? getUserWiseBetHistoryLotteryLevelFour
              : gameType === "COLORGAME"
              ? getUserWiseBetHistoryColorGameLevelFour
              : null;

          const response = apiCall ? await apiCall(level4Params) : { data: [] };
          return {
            response,
            formattedData: formatLevelFourData(response?.data || [], gameType),
          };
        },
      };

      // Execute the appropriate handler based on the current level
      const { response, formattedData } = await levelHandlers[
        currentState.currentLevel
      ]();

      setState((prev) => ({ ...prev, loading: false }));

      return {
        data: formattedData || [],
        pagination: {
          totalRecords:
            response?.pagination?.totalItems || formattedData?.length || 0,
          totalPages: response?.pagination?.totalPages || 1,
        },
      };
    },
    []
  );
  // Handle navigation to different levels of the data (e.g., level 1, level 2, etc.)
  const navigateToLevel = useCallback(
    async (level, item = null) => {
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
  // Handle back navigation, going up in the hierarchy
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

  // Handle changes to the data type (e.g., "live" or a specific date range)
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
  // Handle date range changes (From and To dates)
  const handleDateChange = (field, value) => {
    setState((prev) => ({
      ...prev,
      preventAPICall: true,
      dateRange: { ...prev.dateRange, [field]: value },
    }));
  };
  // Trigger API call to get Profit and Loss data based on selected criteria
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
