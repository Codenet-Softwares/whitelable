import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReusableTable from "../../Reusables/ReusableTable";
const EventProfitLoss = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [parentData, setParentData] = useState(null);
  const [navigationStack, setNavigationStack] = useState([]);
  const [dataType, setDataType] = useState("live");
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const navigate = useNavigate();
  console.log("currentLevel", currentLevel, parentData, navigationStack);
  // Configuration for each level
  const levelConfig = {
    1: {
      columns: [
        {
          key: "serial",
          label: "Serial number",
          render: (_, index) => index + 1,
        },
        {
          key: "sportName",
          label: "Sport Name",
          render: (item) => (
            <button
              className="btn btn-link p-0"
              onClick={() => handleLevelNavigation(item)}
            >
              {item.sportName}
            </button>
          ),
        },
        { key: "uplinePL", label: "Upline P/L" },
        { key: "downlinePL", label: "Downline P/L" },
        { key: "commission", label: "Commission" },
      ],
      data: [
        {
          id: 1,
          sportName: "Cricket",
          uplinePL: 1500,
          downlinePL: 800,
          commission: 300,
        },
        {
          id: 2,
          sportName: "Football",
          uplinePL: 2500,
          downlinePL: 1200,
          commission: 500,
        },
        {
          id: 3,
          sportName: "Tennis",
          uplinePL: 1800,
          downlinePL: 900,
          commission: 400,
        },
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
        { key: "sportName", label: "Sport Name" },
        { key: "profitLoss", label: "Profit & Loss" },
        { key: "downlinePL", label: "Downline P/L" },
        { key: "commission", label: "Commission" },
      ],
      data: [
        {
          id: 4,
          eventName: "IND vs AUS",
          sportName: "Cricket",
          profitLoss: 500,
          downlinePL: 200,
          commission: 100,
          parentId: 1,
        },
        {
          id: 5,
          eventName: "ENG vs NZ",
          sportName: "Cricket",
          profitLoss: 800,
          downlinePL: 300,
          commission: 150,
          parentId: 1,
        },
        {
          id: 6,
          eventName: "MCI vs LIV",
          sportName: "Football",
          profitLoss: 1200,
          downlinePL: 400,
          commission: 200,
          parentId: 2,
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
        { key: "sportName", label: "Sport Name" },
        { key: "eventName", label: "Event Name" },
        {
          key: "marketName",
          label: "Market Name",
          render: (item) => (
            <button
              className="btn btn-link p-0"
              onClick={() => handleLevelNavigation(item)}
            >
              {item.marketName}
            </button>
          ),
        },
        { key: "result", label: "Result" },
        { key: "profitLoss", label: "Profit & Loss" },
        { key: "commission", label: "Commission" },
        { key: "settleTime", label: "Settle Time" },
      ],
      data: [
        {
          id: 7,
          sportName: "Cricket",
          eventName: "IND vs AUS",
          marketName: "Match Odds",
          result: "IND",
          profitLoss: 200,
          commission: 30,
          settleTime: "2023-05-15 18:30",
          parentId: 4,
        },
        {
          id: 8,
          sportName: "Cricket",
          eventName: "IND vs AUS",
          marketName: "Top Batsman",
          result: "Kohli",
          profitLoss: 150,
          commission: 20,
          settleTime: "2023-05-15 22:15",
          parentId: 4,
        },
        {
          id: 9,
          sportName: "Football",
          eventName: "MCI vs LIV",
          marketName: "Match Odds",
          result: "Draw",
          profitLoss: 400,
          commission: 50,
          settleTime: "2023-05-16 21:45",
          parentId: 6,
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
        { key: "sportName", label: "Sport Name" },
        { key: "eventName", label: "Event Name" },
        { key: "marketName", label: "Market Name" },
        { key: "result", label: "Result" },
        { key: "profitLoss", label: "Profit & Loss" },
        { key: "commission", label: "Commission" },
        { key: "settleTime", label: "Settle Time" },
      ],
      data: [
        {
          id: 10,
          username: "user101",
          sportName: "Cricket",
          eventName: "IND vs AUS",
          marketName: "Match Odds",
          result: "IND",
          profitLoss: 50,
          commission: 5,
          settleTime: "2023-05-15 18:30",
          parentId: 7,
        },
        {
          id: 11,
          username: "user102",
          sportName: "Cricket",
          eventName: "IND vs AUS",
          marketName: "Match Odds",
          result: "IND",
          profitLoss: 70,
          commission: 10,
          settleTime: "2023-05-15 18:30",
          parentId: 7,
        },
        {
          id: 12,
          username: "user201",
          sportName: "Football",
          eventName: "MCI vs LIV",
          marketName: "Match Odds",
          result: "Draw",
          profitLoss: 150,
          commission: 20,
          settleTime: "2023-05-16 21:45",
          parentId: 9,
        },
      ],
    },
    5: {
      columns: [
        {
          key: "serial",
          label: "Serial number",
          render: (_, index) => index + 1,
        },
        { key: "sportName", label: "Sport Name" },
        { key: "eventName", label: "Event Name" },
        { key: "marketName", label: "Market Name" },
        { key: "runnerName", label: "Runner Name" },
        { key: "betType", label: "Bet Type" },
        { key: "userPrice", label: "User Price" },
        { key: "amount", label: "Amount" },
        { key: "profitLoss", label: "Profit & Loss" },
        { key: "placeDate", label: "Place Date" },
        { key: "matchDate", label: "Match Date" },
        {
          key: "details",
          label: "Details",
          render: () => (
            <button className="btn btn-link p-0">View Details</button>
          ),
        },
      ],
      data: [
        {
          id: 13,
          sportName: "Cricket",
          eventName: "IND vs AUS",
          marketName: "Match Odds",
          runnerName: "India",
          betType: "Back",
          userPrice: 1.85,
          amount: 1000,
          profitLoss: 50,
          placeDate: "2023-05-15 14:30",
          matchDate: "2023-05-15 15:00",
          parentId: 10,
        },
        {
          id: 14,
          sportName: "Cricket",
          eventName: "IND vs AUS",
          marketName: "Match Odds",
          runnerName: "Australia",
          betType: "Lay",
          userPrice: 2.1,
          amount: 500,
          profitLoss: -70,
          placeDate: "2023-05-15 14:45",
          matchDate: "2023-05-15 15:00",
          parentId: 11,
        },
      ],
    },
  };
  // Handle navigation between levels
  const handleLevelNavigation = (item) => {
    setNavigationStack((prev) => [
      ...prev,
      { level: currentLevel, parent: parentData },
    ]);
    setParentData(item);
    setCurrentLevel(currentLevel + 1);
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
  // Get data for current level with totals
  const getTableData = () => {
    const config = levelConfig[currentLevel];
    let data = config.data.filter(
      (item) => currentLevel === 1 || item.parentId === parentData?.id
    );
    // Add totals row for level 1
    if (currentLevel === 1) {
      const totals = data.reduce(
        (acc, item) => {
          acc.uplinePL += item.uplinePL || 0;
          acc.downlinePL += item.downlinePL || 0;
          acc.commission += item.commission || 0;
          return acc;
        },
        { uplinePL: 0, downlinePL: 0, commission: 0 }
      );
      data = [
        ...data,
        {
          id: "total",
          sportName: "Total",
          uplinePL: totals.uplinePL,
          downlinePL: totals.downlinePL,
          commission: totals.commission,
          isTotalRow: true,
        },
      ];
    }
    return data;
  };
  // Function to fetch data for the current level
  const fetchData = async (page, pageSize) => {
    const data = getTableData();
    return {
      data: data,
      pagination: {
        totalItems: data.length,
        totalPages: Math.ceil(data.length / pageSize),
      },
    };
  };
  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0 text-white">
                Event Profit/Loss Report - Level {currentLevel}
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
                      <option value="old">Old Data</option>
                    </select>
                  </div>
                  <div className="col-md-4 mb-2">
                    <div className="input-group">
                      <input
                        type="date"
                        className="form-control"
                        value={dateRange.from}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, from: e.target.value })
                        }
                      />
                      <span className="input-group-text">to</span>
                      <input
                        type="date"
                        className="form-control"
                        value={dateRange.to}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, to: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mb-2">
                    <button className="btn btn-primary w-100">
                      <i className="fas fa-calculator mr-2"></i> Calculate P/L
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Main Table */}
            <div className="card-body">
              <ReusableTable
                columns={levelConfig[currentLevel].columns}
                itemsPerPage={10}
                showSearch={true}
                paginationVisible={true}
                fetchData={fetchData}
              />
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
