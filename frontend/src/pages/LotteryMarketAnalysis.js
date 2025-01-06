import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getLotteryMarketAnalysis } from "../Utils/service/apiService";
import Pagination from "../components/common/Pagination";
import "./LotteryMarketAnalysis.css";

const LotteryMarketAnalysis = () => {
  const { marketId } = useParams();
  const [lotteryData, setLotteryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    totalPages: 1,
    totalData: 0,
    totalEntries: 10, // Number of entries per page
  });

  const fetchLotteryData = async (page) => {
    setLoading(true);
    const response = await getLotteryMarketAnalysis({
      marketId,
      totalEntries: paginationData.totalEntries,
      pageNumber: page,
    });

    if (response?.success) {
      const fetchedData = response.data || [];
      setLotteryData(fetchedData);

      const pagination = response.pagination || {};
      if (pagination) {
        setPaginationData({
          ...paginationData,
          currentPage: pagination.page || 1,
          totalPages: pagination.totalPages || 1,
          totalData: pagination.totalItems || 0,
        });
      } else {
        // Default fallback if pagination data is missing
        setPaginationData({
          ...paginationData,
          currentPage: 1,
          totalPages: 1,
          totalData: 0,
        });
      }
    } else {
      toast.error(response?.message || "Failed to fetch data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLotteryData(paginationData.currentPage); // Update when page changes
  }, [marketId, paginationData.currentPage, paginationData.totalEntries]);

  // Calculate startIndex and endIndex based on paginationData
  const startIndex = Math.max(
    (paginationData.currentPage - 1) * paginationData.totalEntries + 1,
    1
  );
  const endIndex = Math.min(
    paginationData.currentPage * paginationData.totalEntries,
    paginationData.totalData
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= paginationData.totalPages) {
      setPaginationData((prev) => ({
        ...prev,
        currentPage: page,
      }));
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (lotteryData.length === 0) {
    return <div className="text-center mt-5">No data available</div>;
  }

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f5f7fa" }}>
      <div className="card shadow-lg border-0">
        <div
          className="card-header text-center text-white"
          style={{
            background: "linear-gradient(to right, #001f3f, #0074d9)",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          Lottery Market Analysis
        </div>
        <div className="card-body">
          {lotteryData.map((user, index) => (
            <div key={index} className="user-section mb-4">
              <h3 className="text-info">Username: {user.userName}</h3>
              <div className="row text-center mb-4">
                <div className="col-md-4">
                  <h4 className="text-secondary">Amount</h4>
                  <h2 className="text-success">
                    ₹{user.amount?.toLocaleString() || 0}
                  </h2>
                </div>
                <div className="col-md-4">
                  <h4 className="text-secondary">Total SEM Value</h4>
                  <h2 className="text-warning">
                    {user.details.reduce(
                      (sum, detail) => sum + (detail.sem || 0),
                      0
                    )}
                  </h2>
                  <p className="text-muted">Username: {user.userName}</p>{" "}
                  {/* Display Username beside Total SEM Value */}
                </div>
                <div className="col-md-4">
                  <h4 className="text-secondary">Total Tickets</h4>
                  <h2 className="text-primary">
                    {user.details.reduce(
                      (count, detail) => count + (detail.tickets?.length || 0),
                      0
                    )}
                  </h2>
                </div>
              </div>

              {user.details.map((detail, detailIndex) => (
                <div
                  key={detailIndex}
                  className="card border-0 shadow mb-3"
                  style={{
                    background: "linear-gradient(to bottom, #f0f9ff, #cbebff)",
                    maxHeight: "500px",
                    overflowY: "auto",
                  }}
                >
                  <div className="card-header text-white bg-primary d-flex justify-content-between align-items-center">
                    <span>SEM Value: {detail.sem}</span>
                    <span>Username: {user.userName}</span>{" "}
                    {/* Username next to SEM Value for each detail */}
                    <span
  className="live-bet-text"
>
  Live Bet
</span>
                    <button
                      className="btn btn-light text-primary"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#ticketsCollapse${detailIndex}`}
                      aria-expanded="false"
                      aria-controls={`ticketsCollapse${detailIndex}`}
                      style={{
                        fontWeight: "bold",
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      Show Tickets
                    </button>
                    {/* <span
            className="live-bet-text ms-3"
            style={{
              fontSize: "1rem",
              fontWeight: "bold",
              color: "#ff4500",
              animation: "blinking 1.5s infinite",
            }}
          >
            Live Bet
          </span> */}
                  </div>
                  <div
                    id={`ticketsCollapse${detailIndex}`}
                    className="collapse"
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderTop: "1px solid #dee2e6",
                      padding: "1rem",
                      maxHeight: "300px",
                      overflowY: "auto",
                    }}
                  >
                    {detail.tickets.map((ticket, ticketIndex) => (
                      <div
                        key={ticketIndex}
                        className="p-2 rounded mb-2"
                        style={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #dee2e6",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <span className="text-secondary">{ticket}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <Pagination
            currentPage={paginationData.currentPage}
            totalPages={paginationData.totalPages}
            handlePageChange={handlePageChange}
            startIndex={startIndex}
            endIndex={endIndex}
            totalData={paginationData.totalData}
          />
        </div>
      </div>
    </div>
  );
};

export default LotteryMarketAnalysis;
