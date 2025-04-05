import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReusableTable from '../../Reusables/ReusableTable';
import { getEventPlLevelOne } from '../../Utils/service/apiService';


const EventProfitLoss = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [parentData, setParentData] = useState(null);
  const [navigationStack, setNavigationStack] = useState([]);
  const [dataType, setDataType] = useState('live');
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [levelOneData, setLevelOneData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Table headings for each level
  const levelHeadings = {
    1: 'Profit Loss',
    2: 'Profit & Loss Events',
    3: 'Profit Loss User',
    4: 'Bet History'
  };

  // Fetch data when dependencies change
  useEffect(() => {
    if (currentLevel === 1) {
      fetchLevelOneData();
    }
  }, []);

  // Format API data for level 1
  const formatLevelOneData = (apiData) => {
    console.log("line 44",apiData)
    return apiData.map(item => ({
      id: item.gameName,
      sportName: item.gameName,
      uplinePL: -parseFloat(item.totalProfitLoss),
      downlinePL: parseFloat(item.totalProfitLoss),
      commission: 0 // Static as per requirement
    }));
  };

  // Calculate totals for level 1
  const calculateTotals = (data) => {
    const totals = data.reduce((acc, item) => {
      acc.uplinePL += item.uplinePL || 0;
      acc.downlinePL += item.downlinePL || 0;
      acc.commission += item.commission || 0;
      return acc;
    }, { uplinePL: 0, downlinePL: 0, commission: 0 });

    return {
      id: 'total',
      sportName: 'Total',
      uplinePL: totals.uplinePL,
      downlinePL: totals.downlinePL,
      commission: totals.commission,
      isTotalRow: true
    };
  };

  // Fetch API data for level 1
  const fetchLevelOneData = async () => {
    setLoading(true);
    try {
      const response = await getEventPlLevelOne({
        page: pagination?.page,
        pageSize: pagination?.pageSize,
        search: searchTerm,
        dataType,
        startDate: dateRange?.from,
        endDate: dateRange?.to
      });

      const formattedData = formatLevelOneData(response.data);
      const dataWithTotals = [...formattedData, calculateTotals(formattedData)];

      setLevelOneData(dataWithTotals);
      setPagination(prev => ({
        ...prev,
        totalItems: response?.pagination?.totalItems || 1,
        totalPages: response?.pagination?.totalPages || 1
      }));
    } catch (error) {
      console.error('Error fetching level one data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configuration for each level
  const levelConfig = {
    1: {
      columns: [
        { key: 'serial', label: 'Serial number', render: (_, index) => index + 1 },
        { 
          key: 'sportName', 
          label: 'Sport Name',
          render: (item) => (
            <button 
              className="btn btn-link p-0" 
              onClick={() => handleLevelNavigation(item)}
            >
              {item.sportName}
            </button>
          )
        },
        { 
          key: 'uplinePL', 
          label: 'Upline P/L',
          render: (item) => (
            <span style={{ color: item.uplinePL >= 0 ? 'green' : 'red' }}>
              {item.uplinePL >= 0 ? `+${item.uplinePL.toFixed(2)}` : item.uplinePL.toFixed(2)}
            </span>
          )
        },
        { 
          key: 'downlinePL', 
          label: 'Downline P/L',
          render: (item) => (
            <span style={{ color: item.downlinePL >= 0 ? 'green' : 'red' }}>
              {item.downlinePL >= 0 ? `+${item.downlinePL.toFixed(2)}` : item.downlinePL.toFixed(2)}
            </span>
          )
        },
        { key: 'commission', label: 'Commission' }
      ],
      getData: () => levelOneData
    },
    2: {
      columns: [
        { key: 'serial', label: 'Serial number', render: (_, index) => index + 1 },
        { 
          key: 'eventName', 
          label: 'Event Name',
          render: (item) => (
            <button 
              className="btn btn-link p-0" 
              onClick={() => handleLevelNavigation(item)}
            >
              {item.eventName}
            </button>
          )
        },
        { key: 'sportName', label: 'Sport Name' },
        { key: 'profitLoss', label: 'Profit & Loss' },
        { key: 'downlinePL', label: 'Downline P/L' },
        { key: 'commission', label: 'Commission' }
      ],
      data: [
        { id: 4, eventName: 'IND vs AUS', sportName: 'Cricket', profitLoss: 500, downlinePL: 200, commission: 100, parentId: 1 },
        { id: 5, eventName: 'ENG vs NZ', sportName: 'Cricket', profitLoss: 800, downlinePL: 300, commission: 150, parentId: 1 },
        { id: 6, eventName: 'MCI vs LIV', sportName: 'Football', profitLoss: 1200, downlinePL: 400, commission: 200, parentId: 2 },
      ]
    },
    3: {
      columns: [
        { key: 'serial', label: 'Serial number', render: (_, index) => index + 1 },
        { 
          key: 'username', 
          label: 'Username',
          render: (item) => (
            <button 
              className="btn btn-link p-0" 
              onClick={() => handleLevelNavigation(item)}
            >
              {item.username}
            </button>
          )
        },
        { key: 'sportName', label: 'Sport Name' },
        { key: 'eventName', label: 'Event Name' },
        { key: 'marketName', label: 'Market Name' },
        { key: 'result', label: 'Result' },
        { key: 'profitLoss', label: 'Profit & Loss' },
        { key: 'commission', label: 'Commission' },
        { key: 'settleTime', label: 'Settle Time' }
      ],
      data: [
        { id: 10, username: 'user101', sportName: 'Cricket', eventName: 'IND vs AUS', marketName: 'Match Odds', result: 'IND', profitLoss: 50, commission: 5, settleTime: '2023-05-15 18:30', parentId: 4 },
        { id: 11, username: 'user102', sportName: 'Cricket', eventName: 'IND vs AUS', marketName: 'Match Odds', result: 'IND', profitLoss: 70, commission: 10, settleTime: '2023-05-15 18:30', parentId: 4 },
        { id: 12, username: 'user201', sportName: 'Football', eventName: 'MCI vs LIV', marketName: 'Match Odds', result: 'Draw', profitLoss: 150, commission: 20, settleTime: '2023-05-16 21:45', parentId: 6 },
      ]
    },
    4: {
      columns: [
        { key: 'serial', label: 'Serial number', render: (_, index) => index + 1 },
        { key: 'sportName', label: 'Sport Name' },
        { key: 'eventName', label: 'Event Name' },
        { key: 'marketName', label: 'Market Name' },
        { key: 'runnerName', label: 'Runner Name' },
        { key: 'betType', label: 'Bet Type' },
        { key: 'userPrice', label: 'User Price' },
        { key: 'amount', label: 'Amount' },
        { key: 'profitLoss', label: 'Profit & Loss' },
        { key: 'placeDate', label: 'Place Date' },
        { key: 'matchDate', label: 'Match Date' },
      ],
      data: [
        { id: 13, sportName: 'Cricket', eventName: 'IND vs AUS', marketName: 'Match Odds', runnerName: 'India', betType: 'Back', userPrice: 1.85, amount: 1000, profitLoss: 50, placeDate: '2023-05-15 14:30', matchDate: '2023-05-15 15:00', parentId: 10 },
        { id: 14, sportName: 'Cricket', eventName: 'IND vs AUS', marketName: 'Match Odds', runnerName: 'Australia', betType: 'Lay', userPrice: 2.10, amount: 500, profitLoss: -70, placeDate: '2023-05-15 14:45', matchDate: '2023-05-15 15:00', parentId: 11 },
      ]
    }
  };

  // Handle navigation between levels
  const handleLevelNavigation = (item) => {
    setNavigationStack(prev => [...prev, { level: currentLevel, parent: parentData }]);
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

  // Get data function for all levels
 const getTableData = async (page, pageSize) => {
  if (currentLevel === 1) {
    setPagination(prev => ({ ...prev, page, pageSize }));
    return {
      data: levelConfig[1].getData(),
      pagination: {
        page,
        pageSize,
        totalItems: pagination?.totalItems,
        totalPages: pagination?.totalPages
      }
    };
  }
  
  const config = levelConfig[currentLevel];
  let data = config.data.filter(item => 
    currentLevel === 1 || item.parentId === parentData?.id
  );

  return {
    data,
    pagination: {
      page,
      pageSize,
      totalItems: data.length,
      totalPages: Math.ceil(data.length / pageSize)
    }
  };
};

  // Handle search for level 1
  const handleSearch = (term) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on new search
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
                  <small className="ml-2">({parentData.sportName || parentData.eventName || parentData.username})</small>
                )}
              </h4>
              {currentLevel > 1 && (
                <button 
                  className="btn btn-light btn-sm" 
                  onClick={handleBack}
                >
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
                        onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                      />
                      <span className="input-group-text">to</span>
                      <input
                        type="date"
                        className="form-control"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mb-2">
                    <button className="btn btn-primary w-100" onClick={fetchLevelOneData}>
                      <i className="fas fa-calculator mr-2"></i> Calculate P/L
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
                  columns={levelConfig[currentLevel].columns}
                  itemsPerPage={pagination.pageSize}
                  showSearch={currentLevel === 1}
                  paginationVisible={true}
                  fetchData={getTableData}
                  onSearch={currentLevel === 1 ? handleSearch : undefined}
                  currentPage={pagination.page}
                />
              )}
            </div>

            <div className="card-footer text-muted">
              Showing {dataType} data {currentLevel === 1 && `from ${dateRange.from} to ${dateRange.to}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventProfitLoss;