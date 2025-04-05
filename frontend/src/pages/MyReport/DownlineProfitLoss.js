import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReusableTable from "../../Reusables/ReusableTable";
import { getAdminDownline } from "../../Utils/service/apiService";
import { customErrorHandler } from "../../Utils/helper";
import { toast } from "react-toastify";
import { useAppContext } from "../../contextApi/context";

const DownlineProfitLoss = () => {
  const { store } = useAppContext();
  const navigate = useNavigate();

  const [navigationBar, setNavigationBar] = useState([
    { adminName: store?.admin?.adminName, adminId: store?.admin?.id },
  ]);
  const [dataType, setDataType] = useState("live");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(store?.admin?.id);
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  console.log("navigationBar", navigationBar);
  const handleUserNavigateToProfitLoss = (userName) => {
    navigate(`/account-landing/${userName}/profit_loss`);
  };

  const handleAdminNavigateToChild = (adminId, adminName) => {
    setUserId(adminId);
    setNavigationBar((prev) => [...prev, { adminId, adminName }]);
  };

  const handleBreadcrumbClick = (clickedAdminId) => {
    const index = navigationBar.findIndex(
      (entry) => entry.adminId === clickedAdminId
    );
    if (index !== -1) {
      const trimmed = navigationBar.slice(0, index + 1);
      setNavigationBar(trimmed);
      setUserId(clickedAdminId); 
    }
  };

  // Columns configuration
  const columns = [
    {
      key: "userName",
      label: "UserName",
      render: (item) =>
        item.isTotalRow ? (
          <strong>{item.userName}</strong>
        ) : (
          <button
            className="btn btn-link p-0 text-decoration-none"
            style={{ color: "black" }}
            onClick={() =>
              item?.roles[0]?.role === "user"
                ? handleUserNavigateToProfitLoss(item.userName)
                : handleAdminNavigateToChild(item.adminId, item.userName)
            }
          >
            {item.userName}
          </button>
        ),
    },
    {
      key: "profitLoss",
      label: "Profit/Loss",
      render: (item) =>
        item.isTotalRow ? (
          <strong>{item.profitLoss?.toLocaleString()}</strong>
        ) : (
          item.profitLoss?.toLocaleString()
        ),
    },
    {
      key: "downlineProfitLoss",
      label: "Downline P/L",
      render: (item) =>
        item.isTotalRow ? (
          <strong>{item.downlineProfitLoss?.toLocaleString()}</strong>
        ) : (
          item.downlineProfitLoss?.toLocaleString()
        ),
    },
    {
      key: "commission",
      label: "Commission",
      render: (item) =>
        item.isTotalRow ? (
          <strong>{item.commission?.toLocaleString()}</strong>
        ) : (
          item.commission?.toLocaleString()
        ),
    },
  ];

  // Function to fetch data (mock implementation)
  const fetchData = async (page, pageSize) => {
    try {
      const response = await getAdminDownline({
        userId: userId,
        pageNumber: page,
        fromDate: dateRange.startDate,
        toDate: dateRange.endDate,
        pageSize: pageSize,
        dataSource: dataType,
      });
      return response; // Return the API response
    } catch (error) {
      toast.error(customErrorHandler(error));
      return { data: [], pagination: { totalPages: 1, totalItems: 0 } }; // Return empty data on error
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0 text-white">Downline Profit/Loss Report</h4>
              <div className="d-flex align-items-center flex-wrap gap-2 my-2">
                {navigationBar.map((item, index) => (
                  <React.Fragment key={item.adminId}>
                    <span
                      role="button"
                      className="text-black text-decoration-none"
                      onClick={() => handleBreadcrumbClick(item.adminId)}
                    >
                      {item.adminName}
                    </span>
                    {index < navigationBar.length - 1 && (
                      <span className="text-muted">/</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Filter Controls */}
            <div className="card-body border-bottom">
              <div className="row align-items-center">
                <div className="col-md-3 mb-2">
                  <select
                    className="form-control "
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
