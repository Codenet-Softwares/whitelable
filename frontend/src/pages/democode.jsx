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
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
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
  const [levelTwoData, setLevelTwoData] = useState([]);
  const [tableData, setTableData] = useState([]); // Added to store current level data
  const navigate = useNavigate();

  // Table headings for each level
  const levelHeadings = {
    1: "Profit Loss",
    2: "Profit & Loss Events",
    3: "Profit Loss User",
    4: "Bet History",
  };

  // Format API data for level 1
  const formatLevelOneData = (apiData) => {
    return apiData.map((item) => ({
      id: item.gameName,
      sportName: item.gameName,
      uplinePL: -parseFloat(item.totalProfitLoss),
      downlinePL: parseFloat(item.totalProfitLoss),
      commission: 0,
      isTotalRow: false, // Add flag for regular rows
    }));
  };

  // Calculate totals for level 1
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
  const fetchLevelOneData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEventPlLevelOne({
        dataType,
        pageNumber: pagination.page,
        totalEntries: pagination.pageSize,
        search: searchTerm,
      });

      const formattedData = formatLevelOneData(response.data);
      const dataWithTotals = [...formattedData, calculateTotals(formattedData)];

      setLevelOneData(dataWithTotals);
      setTableData(dataWithTotals); // Set table data
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
  }, [dataType, pagination.page, pagination.pageSize, searchTerm]);

  // Format API data for level 2
  const formatLevelTwoData = (apiData) => {
    return apiData.map((item) => ({
      id: item.marketId,
      sportName: item.gameName,
      eventName: item.marketName,
      marketId: item.marketId,
      totalPL: parseFloat(item.totalProfitLoss),
      date: new Date(item.date).toLocaleString(),
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

  // Format API data for level 4 (Lottery)
  const formatLevelFourLotteryData = (apiData) => {
    return apiData.map((item) => ({
      ...item,
      id: item.marketId,
    }));
  };

  // Format API data for level 4 (ColorGame)
  const formatLevelFourColorGameData = (apiData) => {
    return apiData.map((item) => ({
      ...item,
      id: item.userId,
    }));
  };

  // Fetch data for current level
  const fetchDataForCurrentLevel = useCallback(async () => {
    setLoading(true);
    try {
      let data = [];
      let paginationData = {
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1,
      };

      switch (currentLevel) {
        case 1:
          await fetchLevelOneData();
          return;

        case 2:
          const levelTwoResponse = await getMarketWisePlLevelTwo({
            Type: parentData?.sportName,
            pageNumber: pagination.page,
            totalEntries: pagination.pageSize,
          });
          data = formatLevelTwoData(levelTwoResponse.data);
          paginationData = {
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalItems: levelTwoResponse.pagination?.totalItems || 0,
            totalPages: levelTwoResponse.pagination?.totalPages || 1,
          };
          break;

        case 3:
          const levelThreeResponse = await getMarketWiseAllUserPlLevelThree({
            marketId: parentData?.marketId,
            pageNumber: pagination.page,
            totalEntries: pagination.pageSize,
          });
          data = formatLevelThreeData(levelThreeResponse.data);
          paginationData = {
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalItems: levelThreeResponse.pagination?.totalItems || 0,
            totalPages: levelThreeResponse.pagination?.totalPages || 1,
          };
          break;

        case 4:
          if (!parentData?.userName || !parentData?.marketId) {
            console.error("Missing required params for level 4");
            break;
          }

          const params = {
            userName: parentData.userName,
            marketId: parentData.marketId,
          };

          if (parentData.gameName === "Lottery") {
            const lotteryResponse = await getUserWiseBetHistoryLotteryLevelFour(params);
            data = formatLevelFourLotteryData(lotteryResponse.data || []);
          } else {
            const colorGameResponse = await getUserWiseBetHistoryColorGameLevelFour(params);
            data = formatLevelFourColorGameData(colorGameResponse.data || []);
          }
          // No pagination for level 4
          paginationData = {
            page: 1,
            pageSize: data.length || 10,
            totalItems: data.length || 0,
            totalPages: 1,
          };
          break;

        default:
          break;
      }

      setTableData(data);
      setPagination(paginationData);
    } catch (error) {
      console.error(`Error fetching level ${currentLevel} data:`, error);
    } finally {
      setLoading(false);
    }
  }, [currentLevel, parentData, pagination.page, pagination.pageSize, fetchLevelOneData]);

  // Fetch data when level changes or pagination updates
  useEffect(() => {
    fetchDataForCurrentLevel();
  }, [currentLevel, pagination.page, pagination.pageSize, fetchDataForCurrentLevel]);

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
              item.sportName
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
          render: (item) => item.sportName,
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
    },
    4: {
      columns: [
        {
          key: "serial",
          label: "Serial number",
          render: (_, index) => index + 1,
        },
        {
          key: "marketName",
          label: "Market Name",
          render: (item) => item.marketName || item.runnerName,
        },
        {
          key: "details",
          label: "Details",
          render: (item) => {
            if (parentData?.gameName === "Lottery") {
              return (
                <div>
                  <div>Amount: {item.amount}</div>
                  <div>Ticket Price: {item.ticketPrice}</div>
                  <div>SEM: {item.sem}</div>
                  {item.tickets && item.tickets.length > 0 && (
                    <details>
                      <summary>Tickets ({item.tickets.length})</summary>
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {item.tickets.map((ticket, i) => (
                          <div key={i}>{ticket}</div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              );
            } else {
              return (
                <div>
                  <div>Type: {item.type}</div>
                  <div>Rate: {item.rate}</div>
                  <div>Value: {item.value}</div>
                  <div>Bid Amount: {item.bidAmount}</div>
                </div>
              );
            }
          },
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
      ],
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
      setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page when navigating
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
      setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page when going back
    }
  };

  // Handle search for level 1
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Handle page change
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
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
                        value={dateRange.from}
                        onChange={(e) =>
                          setDateRange((prev) => ({
                            ...prev,
                            from: e.target.value,
                          }))
                        }
                      />
                      <span className="input-group-text">to</span>
                      <input
                        type="date"
                        className="form-control"
                        value={dateRange.to}
                        onChange={(e) =>
                          setDateRange((prev) => ({
                            ...prev,
                            to: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Table */}
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <ReusableTable
                  key={`table-${currentLevel}-${parentData?.id || 'root'}`}
                  columns={levelConfig[currentLevel].columns}
                  data={tableData}
                  itemsPerPage={pagination.pageSize}
                  showSearch={currentLevel === 1}
                  paginationVisible={currentLevel !== 4} // Hide pagination for level 4
                  onSearch={currentLevel === 1 ? handleSearch : undefined}
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
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
  );
};

export default EventProfitLoss;