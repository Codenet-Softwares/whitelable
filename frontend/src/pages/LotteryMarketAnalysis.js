import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getLotteryMarketAnalysis } from "../Utils/service/apiService";
import Pagination from "../components/common/Pagination";
import "./LotteryMarketAnalysis.css";
import TicketModal from "../modal/TicketModal";

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
  // modal usestate
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const openModal = (details, userName) => {
    setSelectedTickets(details);
    setSelectedUser(userName);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTickets([]);
    setSelectedUser("");
  };
  const fetchLotteryData = async (page) => {
    setLoading(true);
    const response = await getLotteryMarketAnalysis({
      marketId,
      totalEntries: paginationData.totalEntries,
      pageNumber: page,
      search: debouncedSearchTerm,
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
  }, [
    marketId,
    paginationData.currentPage,
    paginationData.totalEntries,
    debouncedSearchTerm,
  ]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
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
        LOTTERY MARKET ANALYSIS
        <span className="ms-3 text-warning">
          {lotteryData[0]?.marketName || "Unknown Market"}
        </span>
        <span className="live-bet-text text-truncate ">Live Bets</span> 
      </div>
      <div className="card-body">
        {/* Search bar container */}
        <div className="search-bar-container mb-4">
          <input
            type="text"
            className="search-bar form-control"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        {/* Conditional rendering of lottery data */}
        <div className="lottery-data-container">
          {lotteryData.length === 0 ? (
            <div className="text-center mt-5">No data available</div>
          ) : (
            lotteryData.map((user, index) => (
              <div
                key={index}
                className="user-section mb-4p-3 rounded shadow-sm"
                style={{ backgroundColor: "#f9f9fc" }}
              >
                <h3 className="text-info text-center mb-4">
                  <span className="badge bg-info text-white p-2">
                    Username: {user.userName}
                  </span>
                </h3>
                <div className="row justify-content-center text-center mb-4 align-items-center ">
                  <span className="live-bet-text ">Live Bets</span>
  
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3" style={{ backgroundColor: "#e6f7ff" }}>
                      <h4 className="text-secondary">
                        <i className="fas fa-wallet me-2"></i> Total Amount
                      </h4>
                      <h2 className="text-success fw-bold">
                        ₹{user.amount?.toLocaleString() || 0}
                      </h2>
                    </div>
                  </div>
  
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3" style={{ backgroundColor: "#fff7e6" }}>
                      <h4 className="text-secondary mb-2">
                        <i className="fas fa-chart-line me-2"></i>Total SEM Value
                      </h4>
                      <h2 className="text-warning fw-bold">
                        {user.details.reduce(
                          (sum, detail) => sum + (detail.sem || 0),
                          0
                        )}
                      </h2>
                    </div>
                  </div>
  
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3" style={{ backgroundColor: "#f0f9ff" }}>
                      <h4 className="text-secondary mb-2">
                        <i className="fas fa-ticket-alt me-2"></i>Total Tickets
                      </h4>
                      <h2 className="text-primary fw-bold">
                        {user.details.reduce(
                          (count, detail) => count + (detail.tickets?.length || 0),
                          0
                        )}
                      </h2>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm" style={{ backgroundColor: "#f0f9ff" }}>
                      <button
                        className="btn btn-primary mt-2 text-white me-2"
                        onClick={() =>
                          openModal(
                            user.details.flatMap((detail) => detail || []),
                            user.userName
                          )
                        }
                      >
                        Show Purchased Tickets
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
  
        {/* Pagination */}
        <Pagination
          currentPage={paginationData.currentPage}
          totalPages={paginationData.totalPages}
          handlePageChange={handlePageChange}
          startIndex={startIndex}
          endIndex={endIndex}
          totalData={paginationData.totalData}
        />
  
        {/* Ticket Modal */}
        <TicketModal
          isOpen={modalOpen}
          onClose={closeModal}
          tickets={selectedTickets}
          userName={selectedUser}
        />
      </div>
    </div>
  </div>
  
  );
};

export default LotteryMarketAnalysis;
