import React, { useCallback, useEffect, useState } from "react";
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
  const [userId, setUserId] = useState(store?.admin?.id);
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [tempDate, setTempDate] = useState({ from: "", to: "" });

  const handleUserNavigateToProfitLoss = (userName) => {
    navigate(`/account-landing/${userName}/profit_loss`);
  };

  const handleAdminNavigateToChild = (adminId, adminName) => {
    setUserId(adminId);
    setNavigationBar((prev) => [...prev, { adminId, adminName }]);
  };

  console.log("userid", userId)

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

  // Handle data type change
  const handleDataTypeChange = (value) => {
    setDataType(value);

    if (value === "live") {
      const today = new Date().toISOString().split("T")[0];
      setDateRange({ from: today, to: today });
      setTempDate({ from: "", to: "" });
    }
    else {
      setDateRange({ from: "", to: "" });
      setTempDate({ from: "", to: "" });
    }
  };

  // Handle Calculate P/L
  const handleCalculatePL = () => {
    if (dataType !== "live" && tempDate.from && tempDate.to) {
      if (tempDate.to < tempDate.from) {
        toast.error("To date cannot be earlier than From date.");
        return;
      }
      setDateRange({ ...tempDate });
    }
  };

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
              item?.role === "user"
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
          <strong className={`${item.profitLoss < 0
            ? 'text-danger'
            : item.profitLoss > 0
              ? 'text-success'
              : ''
            }`}>{item.profitLoss?.toLocaleString()}</strong>
        ) : (
          <div className={`${item.profitLoss < 0
            ? 'text-danger'
            : item.profitLoss >= 0
              ? 'text-success'
              : ''
            }`}>{item.profitLoss?.toLocaleString()}
          </div>
        ),
    },
    {
      key: "downlineProfitLoss",
      label: "Downline P/L",
      render: (item) =>
        item.isTotalRow ? (
          <strong
            className={`${item.downLineProfitLoss < 0
              ? 'text-danger'
              : item.downLineProfitLoss >= 0
                ? 'text-success'
                : ''
              }`}
          >
            {item.downLineProfitLoss?.toLocaleString()}
          </strong>

        ) : (
          <div className={`${item.downLineProfitLoss < 0
            ? 'text-danger'
            : item.downLineProfitLoss >= 0
              ? 'text-success'
              : ''
            }`}>{item.downLineProfitLoss?.toLocaleString()}
          </div>
        ),
    },
    {
      key: "commission",
      label: "Commission",
      render: (item) =>
        item.isTotalRow ? (
          <strong className={`${item.commission < 0
            ? 'text-danger'
            : item.commission >= 0
              ? 'text-success'
              : ''
            }`}>{item.commission?.toLocaleString()}</strong>
        ) : (
          <div className={`${item.commission < 0
            ? 'text-danger'
            : item.commission >= 0
              ? 'text-success'
              : ''
            }`}>{item.commission?.toLocaleString()}</div>
        ),
    },
  ];

  // Function to fetch data (mock implementation)
  const fetchData = useCallback(
    async (page, pageSize, search) => {
      try {
        const response = await getAdminDownline({
          userId,
          pageNumber: page,
          totalEntries: pageSize,
          fromDate: dateRange.from,
          toDate: dateRange.to,
          pageSize,
          search: search ?? "",
          dataSource: dataType,
        });

        const data = response?.data || [];

        if (data.length === 0) {
          return [];
        }
        // Calculate totals
        const totals = data.reduce(
          (acc, item) => {
            acc.profitLoss += parseFloat(item.profitLoss) || 0;
            acc.downLineProfitLoss += parseFloat(item.downLineProfitLoss) || 0;
            acc.commission += parseFloat(item.commission) || 0;
            return acc;
          },
          { profitLoss: 0, downLineProfitLoss: 0, commission: 0 }
        );


        // Add total row to end of the list
        const modifiedData = [
          ...data,
          {
            id: "total-row",
            userName: "Total",
            profitLoss: totals.profitLoss,
            downLineProfitLoss: totals.downLineProfitLoss,
            commission: totals.commission,
            isTotalRow: true,
          },
        ];

        return {
          ...response,
          data: modifiedData,
        };
      } catch (error) {
        toast.error(customErrorHandler(error));
        return { data: [], pagination: { totalPages: 1, totalItems: 0 } };
      }
    },
    [userId, dateRange.from, dateRange.to, dataType]
  );


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
            {navigationBar.length == 1 && <div className="card-body border-bottom">
              <div className="row align-items-center">
                <div className="col-md-3 mb-2">
                  <select
                    className="form-control"
                    value={dataType}
                    onChange={(e) => handleDataTypeChange(e.target.value)}
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
                      value={
                        dataType === "live" ? dateRange.from : tempDate.from || ""
                      }
                      disabled={dataType === "live"}
                      onChange={(e) =>
                        setTempDate({ ...tempDate, from: e.target.value })
                      }
                    />
                    <span className="input-group-text">to</span>
                    <input
                      type="date"
                      className="form-control"
                      value={
                        dataType === "live" ? dateRange.to : tempDate.to || ""
                      }
                      disabled={dataType === "live"}
                      onChange={(e) =>
                        setTempDate({ ...tempDate, to: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="col-md-3 mb-2">
                  <button
                    className="btn btn-primary w-100"
                    disabled={
                      dataType === "live" ||
                      tempDate.from === "" ||
                      tempDate.to === ""
                    }
                    onClick={handleCalculatePL}
                  >
                    <i className="fas fa-calculator mr-2"></i> Calculate P/L
                  </button>
                </div>
              </div>
            </div>}


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
              {dateRange.from && dateRange.to ? (
                <>Showing {dataType} data from {dateRange.from} to {dateRange.to}</>
              ) : (
                <>Please select date range and calculate P/L</>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DownlineProfitLoss;
