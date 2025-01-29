import React, { useState } from "react";
import Modal from "react-modal";
import { getTicketStyle } from "../Utils/helper";

const TicketModal = ({ isOpen, onClose, tickets, userName }) => {
  const [expandedSems, setExpandedSems] = useState({});

  const toggleSem = (purchaseId) => {
    setExpandedSems((prev) => ({
      ...prev,
      [purchaseId]: !prev[purchaseId],
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
        content: {
          position: "relative",
          margin: "auto",
          maxWidth: "500px",
          maxHeight: "80vh",
          borderRadius: "10px",
          padding: "20px",
          overflowY: "auto",
          backgroundColor: "#fff",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <div className="modal-header">
        <h4 className="modal-title">Tickets for {userName}</h4>
        <button className="btn-close" onClick={onClose}></button>
      </div>
      <div className="modal-body">
        {tickets && tickets.length > 0 ? (
          tickets.map((ticket, index) => {
            const { backgroundColor, borderColor, icon } = getTicketStyle(ticket.sem);
            const isExpanded = expandedSems[ticket.purchaseId];
            return (
              <div
                key={index}
                className="p-2 rounded mb-3"
                style={{
                  backgroundColor,
                  border: `1px solid ${borderColor}`,
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div
                  className="d-flex justify-content-between align-items-center"
                  onClick={() => toggleSem(ticket.purchaseId)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="text-secondary">
                    {icon} Tickets bought  {ticket.sem} - Price Bought ₹{ticket.lotteryPrice}
                  </span>
                  <button className="btn btn-sm btn-outline-secondary">
                    {isExpanded ? "Hide Tickets" : "View Tickets"}
                  </button>
                </div>
                {isExpanded && (
                  <div
                    className="mt-2 p-2 rounded"
                    style={{
                      backgroundColor: "#f9f9f9",
                      maxHeight: "150px",
                      overflowY: "auto",
                      border: "1px dashed #ccc",
                    }}
                  >
                    {ticket.tickets.map((ticketNumber, idx) => (
                      <span
                        key={idx}
                        className="badge bg-primary text-light me-2 mb-2"
                        style={{ fontSize: "0.9em" }}
                      >
                        {ticketNumber}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-muted">No tickets available</p>
        )}
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
};

export default TicketModal;
