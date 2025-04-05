import React, { useState, useEffect, useCallback } from 'react';
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

  // Format API data for level 1
  const formatLevelOneData = (apiData) => {
    return apiData.map(item => ({
      id: item.gameName,
      sportName: item.gameName,
      uplinePL: -parseFloat(item.totalProfitLoss),
      downlinePL: parseFloat(item.totalProfitLoss),
      commission: 0
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
      setPagination(prev => ({
        ...prev,
        totalItems: response.pagination?.totalItems || 0,
        totalPages: response.pagination?.totalPages || 1
      }));
    } catch (error) {
      console.error('Error fetching level one data:', error);
    } finally {
      setLoading(false);
    }
  }, [dataType, pagination.page, pagination.pageSize, searchTerm]);

  // Fetch data when dependencies change
  useEffect(() => {
    if (currentLevel === 1) {
      fetchLevelOneData();
    }
  }, [currentLevel, fetchLevelOneData]);

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
    // ... rest of your level configurations remain the same
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
  const getTableData = useCallback(async (page, pageSize) => {
    if (currentLevel === 1) {
      setPagination(prev => ({ ...prev, page, pageSize }));
      return {
        data: levelOneData,
        pagination: {
          page,
          pageSize,
          totalItems: pagination.totalItems,
          totalPages: pagination.totalPages
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
  }, [currentLevel, levelOneData, pagination.totalItems, pagination.totalPages, parentData]);

  // Handle search for level 1
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

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
                        onChange={(e) => setDateRange(prev => ({...prev, from: e.target.value}))}
                      />
                      <span className="input-group-text">to</span>
                      <input
                        type="date"
                        className="form-control"
                        value={dateRange.to}
                        onChange={(e) => setDateRange(prev => ({...prev, to: e.target.value}))}
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
                  key={`table-${currentLevel}-${dataType}-${pagination.page}`}
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