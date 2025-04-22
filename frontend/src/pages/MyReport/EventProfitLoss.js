import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReusableTable from "../../Reusables/ReusableTable";
import {
  getEventPlLevelOne,
  getMarketWiseAllUserPlLevelThree,
  getMarketWisePlLevelTwo,
  getUserWiseBetHistoryColorGameLevelFour,
  getUserWiseBetHistoryLotteryLevelFour,
} from "../../Utils/service/apiService";

const EventProfitLoss = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [parentData, setParentData] = useState(null);
  const [navigationStack, setNavigationStack] = useState([]);
  const [dataType, setDataType] = useState("live");
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [levelOneData, setLevelOneData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dataType === "live") {
      const today = new Date().toISOString().split("T")[0];
      setDateRange({
        from: today,
        to: today,
      });
      // Fetch immediately for live data
      fetchLevelOneData();
    } else {
      // For backup/olddata, reset dates and fetch once automatically
      setDateRange({
        from: "",
        to: "",
      });
      fetchLevelOneData(); // First automatic fetch when switching to backup/olddata
    }
  }, [dataType]); // Only depend on dataType

  console.log("parentData", parentData);
  // Table headings for each level
  const levelHeadings = {
    1: "Profit Loss",
    2: "Profit & Loss Events",
    3: "Profit Loss User",
    4: "Bet History",
  };

 
  // Format API data for level 1
  const formatLevelOneData = (apiData) => {
    const formattedData = apiData.map((item) => ({
      id: item.gameName,
      sportName: item.gameName,
      uplinePL: -parseFloat(item.totalProfitLoss),
      downlinePL: parseFloat(item.totalProfitLoss),
      commission: 0,
      isTotalRow: false,
    }));

    // Only add totals if there's data
    if (formattedData.length > 0) {
      const totals = calculateTotals(formattedData);
      return [...formattedData, totals];
    }

    return formattedData;
  };

  // Calculate totals for level 1 (only called when there's data)
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

  // Fetch API data for level 1 with useCallback to prevent infinite re-renders
  const fetchLevelOneData = useCallback(
    async (overrideSearchTerm = searchTerm) => {
      console.log('fetchLevelOneData called with:', {
        dataType,
        from: dateRange.from,
        to: dateRange.to,
        search: overrideSearchTerm,
        page: pagination.page
      });
      setLoading(true);
      try {
        const response = await getEventPlLevelOne({
          dataType,
          pageNumber: pagination.page,
          totalEntries: pagination.pageSize,
          search: overrideSearchTerm,
          fromDate: dateRange.from,
          toDate: dateRange.to,
        });

        const dataWithTotals = formatLevelOneData(response.data);

        setLevelOneData(dataWithTotals);
        setPagination((prev) => ({
          ...prev,
          totalItems: response.pagination?.totalItems || 0,
          totalPages: response.pagination?.totalPages || 1,
        }));
      } catch (error) {
        console.error("Error fetching level one data:", error);
      } finally {
        setLoading(false);
      }
    },
    [
      dataType,
      pagination.page,
      pagination.pageSize,
      dateRange.from,
      dateRange.to,
    ]
  );

  // Fetch data when dependencies change
  useEffect(() => {
    if (currentLevel === 1) {
      fetchLevelOneData();
    }
  }, [currentLevel]);

  // Format API data for level 2
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

  // Format API data for level 3
  const formatLevelThreeData = (apiData) => {
    return apiData.map((item) => ({
      id: item.userId,
      username: item.userName,
      runnerId: item.runnerId,
      eventName: item.marketName,
      sportName: item.gameName,
      marketId: item.marketId, // Ensure marketId is included
      totalPL: parseFloat(item.totalProfitLoss),
      date: new Date(item.date).toLocaleString(),
      uplinePL: -parseFloat(item.totalProfitLoss),
      downlinePL: parseFloat(item.totalProfitLoss),
      commission: 0,
    }));
  };

  // Configuration for each level
  const levelConfig = {
    1: {
      columns: [
        {
          key: "serial",
          label: "Serial number",
          render: (item, index) => (item.isTotalRow ? "" : index + 1),
        },
        {
          key: "sportName",
          label: "Sport Name",
          render: (item) =>
            item.isTotalRow ? (
              item.sportName // Just show the text for total row
            ) : (
              <button
                className="btn btn-link p-0"
                onClick={() => handleLevelNavigation(item)}
              >
                {item.sportName}
              </button>
            ),
        },
        {
          key: "uplinePL",
          label: "Upline P/L",
          render: (item) => (
            <span style={{ color: item.uplinePL >= 0 ? "green" : "red" }}>
              {item.uplinePL >= 0
                ? `+${item.uplinePL.toFixed(2)}`
                : item.uplinePL.toFixed(2)}
            </span>
          ),
        },
        {
          key: "downlinePL",
          label: "Downline P/L",
          render: (item) => (
            <span style={{ color: item.downlinePL >= 0 ? "green" : "red" }}>
              {item.downlinePL >= 0
                ? `+${item.downlinePL.toFixed(2)}`
                : item.downlinePL.toFixed(2)}
            </span>
          ),
        },
        { key: "commission", label: "Commission" },
      ],
      getData: () => levelOneData,
    },
    2: {
      columns: [
        {
          key: "serial",
          label: "Serial number",
          render: (_, index) => index + 1,
        },
        {
          key: "sportName",
          label: "Sport Name",
          render: (item) => item.sportName, // Display only, no navigation
        },
        {
          key: "eventName",
          label: "Event Name",
          render: (item) => (
            <button
              className="btn btn-link p-0"
              onClick={() => handleLevelNavigation(item)}
            >
              {item.eventName}
            </button>
          ),
        },
        {
          key: "totalPL",
          label: "Total P/L",
          render: (item) => (
            <span style={{ color: item.totalPL >= 0 ? "green" : "red" }}>
              {item.totalPL >= 0
                ? `+${item.totalPL.toFixed(2)}`
                : item.totalPL.toFixed(2)}
            </span>
          ),
        },
        {
          key: "date",
          label: "Date",
          render: (item) => new Date(item.date).toLocaleString(),
        },
      ],
      getData: async (page, pageSize, search = "") => {
        try {
          const response = await getMarketWisePlLevelTwo({
            Type: parentData?.sportName, // Use the sportName as Type
            pageNumber: page,
            totalEntries: pageSize,
            search: search,
          });

          const formattedData = formatLevelTwoData(response.data);
          return {
            data: formattedData,
            pagination: {
              page,
              pageSize,
              totalItems: response.pagination?.totalItems || 0,
              totalPages: response.pagination?.totalPages || 1,
              totalRecords: response.pagination?.totalItems || 0,
            },
          };
        } catch (error) {
          console.error("Error fetching level two data:", error);
          return {
            data: [],
            pagination: { page, pageSize, totalItems: 0, totalPages: 1 },
          };
        }
      },
    },
    3: {
      columns: [
        {
          key: "serial",
          label: "Serial number",
          render: (_, index) => index + 1,
        },
        {
          key: "username",
          label: "Username",
          render: (item) => (
            <button
              className="btn btn-link p-0"
              onClick={() => handleLevelNavigation(item)}
            >
              {item.username}
            </button>
          ),
        },
        {
          key: "eventName",
          label: "Event Name",
          render: (item) => item.eventName,
        },
        {
          key: "sportName",
          label: "Sport Name",
          render: (item) => item.sportName,
        },
        {
          key: "totalPL",
          label: "Total P/L",
          render: (item) => (
            <span style={{ color: item.totalPL >= 0 ? "green" : "red" }}>
              {item.totalPL >= 0
                ? `+${item.totalPL.toFixed(2)}`
                : item.totalPL.toFixed(2)}
            </span>
          ),
        },
        {
          key: "date",
          label: "Date",
          render: (item) => new Date(item.date).toLocaleString(),
        },
      ],
      getData: async (page, pageSize, search = "") => {
        try {
          const response = await getMarketWiseAllUserPlLevelThree({
            marketId: parentData?.marketId, // Pass the selected marketId
            pageNumber: page,
            totalEntries: pageSize,
            search: search,
          });

          const formattedData = formatLevelThreeData(response.data);
          return {
            data: formattedData,
            pagination: {
              page,
              pageSize,
              totalItems: response.pagination?.totalItems || 0,
              totalPages: response.pagination?.totalPages || 1,
              totalRecords: response.pagination?.totalItems || 0, // Add this
            },
          };
        } catch (error) {
          console.error("Error fetching level three data:", error);
          return {
            data: [],
            pagination: { page, pageSize, totalItems: 0, totalPages: 1 },
          };
        }
      },
    },
    // In the level 4 configuration:
    4: {
      columns: (() => {
        // Debug logging
        console.log("Current Sport:", parentData?.sportName);

        if (parentData?.sportName === "Lottery") {
          return [
            {
              key: "serial",
              label: "Serial number",
              render: (_, index) => index + 1,
            },
            {
              key: "username",
              label: "userName",
              render: (item) => item.userName,
            },
            {
              key: "Eventname",
              label: "Event Name",
              render: (item) => item.marketName,
            },
            {
              key: "Sportname",
              label: "Sportname",
              render: (item) => item.gameName,
            },
            {
              key: "Amount",
              label: "Amount",
              render: (item) => item.amount,
            },
            {
              key: "Ticket Price",
              label: "Ticket Price",
              render: (item) => item.ticketPrice,
            },
            {
              key: "sem",
              label: "sem",
              render: (item) => item.sem,
            },
            {
              key: "details",
              label: "Details",
              render: (item) => (
                <div>
                  {item.tickets?.length > 0 && (
                    <details>
                      <summary>Tickets ({item.tickets.length})</summary>
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {item.tickets.map((ticket, i) => (
                          <div className="text-truncate" key={i}>
                            {ticket}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ),
            },
            {
              key: "placeTime",
              label: "Place Time",
              render: (item) =>
                new Date(item.placeTime || item.placeDate).toLocaleString(),
            },
            {
              key: "settleTime",
              label: "Settle Time",
              render: (item) =>
                item.settleTime
                  ? new Date(item.settleTime).toLocaleString()
                  : "Not settled",
            },
          ];
        } else if (parentData?.sportName === "COLORGAME") {
          return [
            {
              key: "serial",
              label: "Serial number",
              render: (_, index) => index + 1,
            },
            {
              key: "username",
              label: "Username",
              render: (item) => item.userName,
            },

            {
              key: "Event Name",
              label: "Event Name",
              render: (item) => item.marketName || "",
            },
            {
              key: " Sport Type",
              label: "Sport Type",
              render: (item) => item.gameName || "",
            },
            {
              key: " Runner Name",
              label: "Runner Name",
              render: (item) => item.runnerName || "",
            },

            {
              key: "Rate",
              label: "Rate",
              render: (item) => item.rate || "",
            },

            {
              key: "betType",
              label: "Bet Type",
              render: (item) => item.type,
            },
            {
              key: "amount",
              label: "Amount",
              render: (item) => item.value,
            },
            {
              key: "P/L",
              label: "P/L",
              render: (item) => (
                <span>
                  {item.bidAmount} (
                  <span style={{ color: "red" }}>-{item.value}</span>)
                </span>
              ),
            },
            {
              key: "placeTime",
              label: "Place Time",
              render: (item) => new Date(item.placeDate).toLocaleString(),
            },
            {
              key: "Match Date",
              label: "Match Date",
              render: (item) => new Date(item.matchDate).toLocaleString(),
            },
          ];
        } else {
          // Default columns for other sports
          return [
            {
              key: "serial",
              label: "Serial number",
              render: (_, index) => index + 1,
            },
            {
              key: "username",
              label: "Username",
              render: (item) => item.userName,
            },
            {
              key: "event",
              label: "Event",
              render: (item) => item.eventName || "-",
            },
            {
              key: "market",
              label: "Market",
              render: (item) => item.marketName || "-",
            },
            {
              key: "amount",
              label: "Amount",
              render: (item) => item.amount,
            },
            {
              key: "placeTime",
              label: "Place Time",
              render: (item) => new Date(item.placeTime).toLocaleString(),
            },
          ];
        }
      })(),

      getData: async (page, pageSize) => {
        try {
          let response;
          const params = {
            userName: parentData?.username,
          };

          if (parentData?.sportName === "Lottery") {
            params.marketId = parentData?.marketId;
            response = await getUserWiseBetHistoryLotteryLevelFour(params);
          } else if (parentData?.sportName === "COLORGAME") {
            params.runnerId = parentData?.runnerId;
            response = await getUserWiseBetHistoryColorGameLevelFour(params);
            console.log("Color Game API Response:", response);
          } else {
            // Add handling for other sports if needed
            console.log("Unsupported sport type:", parentData?.sportName);
            return {
              data: [],
              pagination: {
                page: 1,
                pageSize: 10,
                totalItems: 0,
                totalPages: 1,
              },
            };
          }

          return {
            data: response?.data || [],
            pagination: {
              page: response?.pagination?.page || 1,
              pageSize:
                response?.pagination?.pageSize || response?.data?.length || 10,
              totalItems:
                response?.pagination?.totalItems || response?.data?.length || 0,
              totalPages: response?.pagination?.totalPages || 1,
            },
          };
        } catch (error) {
          console.error("Error fetching level four data:", error);
          return {
            data: [],
            pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 1 },
          };
        }
      },
    },
  };

  // Handle navigation between levels
  const handleLevelNavigation = async (item) => {
    setLoading(true);
    try {
      setNavigationStack((prev) => [
        ...prev,
        { level: currentLevel, parent: parentData },
      ]);
      setParentData(item);
      setCurrentLevel(currentLevel + 1);
    } finally {
      setLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentLevel > 1) {
      const lastState = navigationStack.pop();
      setCurrentLevel(lastState.level);
      setParentData(lastState.parent);
      setNavigationStack([...navigationStack]);
    }
  };

  // Get data function for all levels

  const getTableData = useCallback(
    async (page, pageSize, search) => {
      console.log("responsesearch", search);
      if (currentLevel === 1) {
 
        setPagination((prev) => ({ ...prev, page, pageSize }));
        return {
          data: levelOneData,
          pagination: {
            page,
            pageSize,
            totalItems: pagination.totalItems,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalItems, // Add this line for ReusableTable
          },
        };
      }

      // For level 2, use the getData function from levelConfig
      if (currentLevel === 2 && levelConfig[2].getData) {
        return levelConfig[2].getData(page, pageSize, search);
      }

      // For level 3, use the getData function from levelConfig
      if (currentLevel === 3 && levelConfig[3].getData) {
        return levelConfig[3].getData(page, pageSize, search);
      }

      // For level 4, use the getData function from levelConfig
      if (currentLevel === 4 && levelConfig[4].getData) {
        // For level 4, we'll ignore pagination parameters since it's not needed
        return levelConfig[4].getData(1, 1000); // Using large pageSize since pagination is disabled
      }

      // Fallback for other levels
      const config = levelConfig[currentLevel];
      return {
        data: config.data || [],
        pagination: {
          page,
          pageSize,
          totalItems: 0,
          totalPages: 1,
        },
      };
    },
    [
      currentLevel,
      levelOneData,
      pagination.totalItems,
      pagination.totalPages,
      parentData,
    ]
  );

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="col-md-12">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h4 className="mb-0 text-white">
                  {levelHeadings[currentLevel]} - Level {currentLevel}
                  {parentData && (
                    <small className="ml-2">
                      (
                      {parentData.sportName ||
                        parentData.eventName ||
                        parentData.username}
                      )
                    </small>
                  )}
                </h4>
                {currentLevel > 1 && (
                  <button className="btn btn-light btn-sm" onClick={handleBack}>
                    <i className="fas fa-arrow-left mr-2"></i> Back
                  </button>
                )}
              </div>

              {/* Filter Controls - Only for Level 1 */}
              {currentLevel === 1 && (
                <div className="card-body border-bottom">
                  <div className="row align-items-center">
                    <div className="col-md-3 mb-2">
                      <select
                        className="form-control"
                        value={dataType}
                        onChange={(e) => setDataType(e.target.value)}
                      >
                        <option value="live">Live Data</option>
                        <option value="backup">Backup Data</option>
                        <option value="olddata">Old Data</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-2">
                      <div className="input-group">
                        <input
                          type="date"
                          className="form-control"
                          value={dateRange.from || ""}
                          onChange={(e) =>
                            setDateRange((prev) => ({
                              ...prev,
                              from: e.target.value,
                            }))
                          }
                          disabled={dataType === "live"}
                        />
                        <span className="input-group-text">to</span>
                        <input
                          type="date"
                          className="form-control"
                          value={dateRange.to || ""}
                          onChange={(e) =>
                            setDateRange((prev) => ({
                              ...prev,
                              to: e.target.value,
                            }))
                          }
                          disabled={dataType === "live"}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mb-2">
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => {
                          if (
                            dataType !== "live" &&
                            (!dateRange.from || !dateRange.to)
                          ) {
                            alert("Please select both From and To dates");
                            return;
                          }
                          fetchLevelOneData();
                        }}
                        disabled={dataType === "live"}
                      >
                        Get P&L
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Table */}
              <div className="card-body">
                {loading && currentLevel === 1 ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <ReusableTable
                    key={`table-${currentLevel}-${dataType}-${pagination.page}`}
                    columns={levelConfig[currentLevel].columns}
                    itemsPerPage={pagination.pageSize}
                    showSearch={currentLevel !== 4}
                    paginationVisible={currentLevel !== 4}
                    fetchData={getTableData}
                  />
                )}
              </div>

              <div className="card-footer text-muted">
                Showing {dataType} data{" "}
                {currentLevel === 1 &&
                  `from ${dateRange.from} to ${dateRange.to}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventProfitLoss;
