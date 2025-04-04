import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReusableTable from '../../Reusables/ReusableTable';

const DownlineProfitLoss = () => {
  const navigate = useNavigate();
  const [dataType, setDataType] = useState('live');
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  // Sample data with all required fields
  const sampleData = [
    { 
      id: 1, 
      username: 'user1', 
      profitLoss: 1500, 
      downlineProfitLoss: 800, 
      commission: 300 
    },
    { 
      id: 2, 
      username: 'user2', 
      profitLoss: 2500, 
      downlineProfitLoss: 1200, 
      commission: 500 
    },
    { 
      id: 3, 
      username: 'user3', 
      profitLoss: 1800, 
      downlineProfitLoss: 900, 
      commission: 400 
    },
  ];

  // Calculate totals
  const totals = sampleData.reduce((acc, item) => {
    acc.profitLoss += item.profitLoss;
    acc.downlineProfitLoss += item.downlineProfitLoss;
    acc.commission += item.commission;
    return acc;
  }, { profitLoss: 0, downlineProfitLoss: 0, commission: 0 });

  // Add totals row to the data
  const tableData = [...sampleData, {
    id: 'total',
    username: 'Total',
    profitLoss: totals.profitLoss,
    downlineProfitLoss: totals.downlineProfitLoss,
    commission: totals.commission,
    isTotalRow: true
  }];

  // Columns configuration
  const columns = [
    {
      key: 'username',
      label: 'Username',
      render: (item) => item.isTotalRow ? (
        <strong>{item.username}</strong>
      ) : (
        <button 
          className="btn btn-link p-0" 
          onClick={() => navigate(`/downline-details/${item.id}`)}
        >
          {item.username}
        </button>
      )
    },
    { 
      key: 'profitLoss', 
      label: 'Profit/Loss',
      render: (item) => item.isTotalRow ? (
        <strong>{item.profitLoss.toLocaleString()}</strong>
      ) : (
        item.profitLoss.toLocaleString()
      )
    },
    { 
      key: 'downlineProfitLoss', 
      label: 'Downline P/L',
      render: (item) => item.isTotalRow ? (
        <strong>{item.downlineProfitLoss.toLocaleString()}</strong>
      ) : (
        item.downlineProfitLoss.toLocaleString()
      )
    },
    { 
      key: 'commission', 
      label: 'Commission',
      render: (item) => item.isTotalRow ? (
        <strong>{item.commission.toLocaleString()}</strong>
      ) : (
        item.commission.toLocaleString()
      )
    }
  ];

  // Function to fetch data (mock implementation)
  const fetchData = async (page, pageSize) => {
    // In a real app, you would make an API call here with dataType and dateRange
    return {
      data: tableData,
      pagination: {
        totalItems: tableData.length,
        totalPages: Math.ceil(tableData.length / pageSize)
      }
    };
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0 text-white">Downline Profit/Loss Report</h4>
            </div>
            
            {/* Filter Controls */}
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
                  <button className="btn btn-primary w-100">
                    <i className="fas fa-calculator mr-2"></i> Calculate P/L
                  </button>
                </div>
              </div>
            </div>

            {/* Main Table */}
            <div className="card-body">
              <ReusableTable
                columns={columns}
                itemsPerPage={10}
                showSearch={true}
                paginationVisible={true}
                fetchData={fetchData}
              />
            </div>

            <div className="card-footer text-muted">
              Showing {dataType} data from {dateRange.from} to {dateRange.to}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownlineProfitLoss;