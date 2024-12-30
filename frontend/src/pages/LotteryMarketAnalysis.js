import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getLotteryMarketAnalysis } from "../Utils/service/apiService";

const LotteryMarketAnalysis = () => {
  const { marketId } = useParams();
  const [lotteryData, setLotteryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLotteryData = async () => {
      const response = await getLotteryMarketAnalysis({ marketId });
      if (response?.success) {
        const fetchedData = response.data?.[0] || {}; // Access the first item in the data array
        setLotteryData(fetchedData);
      } else {
        toast.error(response?.message || "Failed to fetch data");
      }
      setLoading(false);
    };

    fetchLotteryData();
  }, [marketId]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!lotteryData || !lotteryData.details) {
    return <div className="text-center mt-5">No data available</div>;
  }

  const totalSemValue = lotteryData.details.reduce(
    (sum, detail) => sum + (detail.sem || 0),
    0
  );

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
          <div className="row text-center mb-4">
            <div className="col-md-4">
              <h4 className="text-secondary">Amount</h4>
              <h2 className="text-success">
                ₹{lotteryData.amount?.toLocaleString() || 0}
              </h2>
            </div>
            <div className="col-md-4">
              <h4 className="text-secondary">Total SEM Value</h4>
              <h2 className="text-warning">{totalSemValue}</h2>
            </div>
            <div className="col-md-4">
              <h4 className="text-secondary">Total Tickets</h4>
              <h2 className="text-primary">
                {lotteryData.details.reduce(
                  (count, detail) => count + (detail.tickets?.length || 0),
                  0
                )}
              </h2>
            </div>
          </div>
          <div className="row">
            {lotteryData.details.map((detail, index) => (
              <div key={index} className="col-12 mb-4">
                <div
                  className="card border-0 shadow"
                  style={{
                    background: "linear-gradient(to bottom, #f0f9ff, #cbebff)",
                    maxHeight: "500px",
                    overflowY: "auto",
                  }}
                >
                  <div className="card-header text-white bg-primary">
                    SEM Value: {detail.sem} | Tickets: {detail.tickets.length}
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      {detail.tickets.map((ticket, ticketIndex) => (
                        <div
                          key={ticketIndex}
                          className="col-6 col-md-4 col-lg-2 text-center"
                        >
                          <div
                            className="p-3 rounded shadow-sm"
                            style={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #dee2e6",
                            }}
                          >
                            <span className="text-secondary">{ticket}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotteryMarketAnalysis;
