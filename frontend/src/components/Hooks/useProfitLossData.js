// useProfitLossData.js
import { useState, useRef, useCallback } from "react";
import { getEventPlLevelOne, getMarketWisePlLevelTwo } from "../../Utils/service/apiService";
import { getUseProfitLossState } from "../../Utils/service/initiateState";

const useProfitLossData = () => {
  const [state, setState] = useState({
    ...getUseProfitLossState(),
    currentLevel: 1,
    parentData: null,
    levelRefreshKey: 0 // Add this new key
  });
  const lastFetchedData = useRef([]); // Add this line to store last fetched data
  const lastDateRange = useRef(state.dateRange); // Add this line
  const stateRef = useRef(state);

  stateRef.current = state;

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
      id: item.marketId, // Use marketId as the unique identifier
      sportName: item.gameName,
      eventName: item.marketName,
      marketId: item.marketId,
      totalPL: parseFloat(item.totalProfitLoss),
      date: new Date(item.date).toLocaleString(), // Format date properly
      uplinePL: -parseFloat(item.totalProfitLoss),
      downlinePL: parseFloat(item.totalProfitLoss),
      commission: 0,
    }));
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

      try {
        
        if (currentState.currentLevel === 1)
          {
          const params = {
            dataType: currentState.dataType,
            pageNumber: page,
            totalEntries: pageSize,
            search,
            fromDate:
              currentState.dataType === "live" ? "" : currentState.dateRange.from,
            toDate:
              currentState.dataType === "live" ? "" : currentState.dateRange.to,
          };
  
          const response = await getEventPlLevelOne(params);
          const dataWithTotals = formatLevelOneData(response.data);
          lastFetchedData.current = dataWithTotals; // Store the fetched data
  
          setState((prev) => ({ ...prev, loading: false }));
  
          return {
            data: dataWithTotals,
            pagination: {
              totalRecords: response.pagination?.totalItems || 0,
              totalPages: response.pagination?.totalPages || 1,
            },
          };


        }else {
          // Level 2 data fetch
          const response = await getMarketWisePlLevelTwo({
            Type: currentState.parentData.sportName,
            pageNumber: page,
            totalEntries: pageSize,
            search: search,
          });

          const formattedData = formatLevelTwoData(response.data);
          
          return {
            data: formattedData,
            pagination: {
              totalRecords: response.pagination?.totalItems || 0,
              totalPages: response.pagination?.totalPages || 1,
            },
          };
        }
    
      } catch (error) {
        console.error("Error fetching level one data:", error);
        setState((prev) => ({ ...prev, loading: false }));
        throw error;
      }
    },
    []
  );



  const handleLevelNavigation = async (item) => {
    console.log('Navigating to level 2 with item:', item);
  
    if (item.isTotalRow) {
      console.log('Item is a total row, skipping navigation.');
      return; // Skip if it's a total row
    }
  
    // If already at level 2, skip fetching the data
    if (stateRef.current.currentLevel === 2 && stateRef.current.parentData.id === item.id) {
      console.log('Already at level 2 with the same item, skipping API call.');
      return;
    }
  
    // Set loading state and navigate to level 2
    console.log('Fetching data for level 2...');
    setState(prev => ({
      ...prev,
      loading: true,
      currentLevel: 2,
      parentData: item,
      levelRefreshKey: prev.levelRefreshKey + 1, // Increment refresh key
    }));
  
    try {
      const page = 1; // or get the current page from the state if you need pagination
      const pageSize = 10; // or get the page size from the state
      const search = ''; // Add search functionality if needed
  
      // Fetch the second-level data
      const data = await getTableData(page, pageSize, search,2);
      console.log('Fetched level 2 data:', data);
    } catch (error) {
      console.error('Error fetching level 2 data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
      }));
    }
  };
  
  const handleBackToLevelOne = async () => {
    console.log('Going back to level 1...');
  
    // Reset state for level 1 and trigger data fetch again
    setState(prev => ({
      ...prev,
      loading: true,
      currentLevel: 1,
      parentData: null,
      levelRefreshKey: prev.levelRefreshKey + 1, // Increment refresh key
    }));
  
    try {
      const page = 1; // or get the current page from the state if needed
      const pageSize = 10; // or get the page size from the state
      const search = ''; // Add search functionality if needed
  
      // Fetch level 1 data again
      const data = await getTableData(page, pageSize, search);
      console.log('Fetched level 1 data:', data);
    } catch (error) {
      console.error('Error fetching level 1 data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
      }));
    }
  };
  

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

    // Check if dates have changed since last API call
    const datesChanged =
      currentState.dateRange.from !== lastDateRange.current.from ||
      currentState.dateRange.to !== lastDateRange.current.to;

    if (!datesChanged && currentState.dataType !== "live") {
      console.log("Dates haven't changed - skipping API call");
      return;
    }

    // Update lastDateRange with current dates
    lastDateRange.current = { ...currentState.dateRange };

    setState((prev) => ({
      ...prev,
      tableRefreshKey: prev.tableRefreshKey + 1, // Refresh table
    }));
  };

  return {
    state,
    setState,
    handleDataTypeChange,
    handleDateChange,
    handleGetPL,
    getTableData,
    handleLevelNavigation,
    handleBackToLevelOne,
  };
};

export default useProfitLossData;
