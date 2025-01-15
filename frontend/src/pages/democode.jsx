<div className="card-body">
  <div className="lottery-data-container">
    {lotteryData.map((user, index) => (
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
        <div className="row justify-content-center text-center mb-4 align-items-center">
          <span className="live-bet-text">Live Bet</span>

          <div className="col-md-3">
            <div
              className="card border-0 shadow-sm p-3"
              style={{ backgroundColor: "#e6f7ff" }}
            >
              <h4 className="text-secondary">
                <i className="fas fa-wallet me-2"></i> Total Amount
              </h4>
              <h2 className="text-success fw-bold">
                ₹{user.amount?.toLocaleString() || 0}
              </h2>
            </div>
          </div>

          <div className="col-md-3">
            <div
              className="card border-0 shadow-sm p-3"
              style={{ backgroundColor: "#fff7e6" }}
            >
              <h4 className="text-secondary mb-2">
                <i className="fas fa-chart-line me-2"></i>Total SEM Value
              </h4>
              <h2 className="text-warning fw-bold">
                {user.details.reduce((sum, detail) => sum + (detail.sem || 0), 0)}
              </h2>
            </div>
          </div>

          <div className="col-md-3">
            <div
              className="card border-0 shadow-sm p-3"
              style={{ backgroundColor: "#f0f9ff" }}
            >
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
            <div
              className="card border-0 shadow-sm"
              style={{ backgroundColor: "#f0f9ff" }}
            >
              <button
                className="btn btn-primary mt-2 text-white me-2"
                onClick={() =>
                  openModal(
                    user.details.flatMap((detail) => detail.tickets || []),
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
    ))}
  </div>

  <Pagination
    currentPage={paginationData.currentPage}
    totalPages={paginationData.totalPages}
    handlePageChange={handlePageChange}
    startIndex={startIndex}
    endIndex={endIndex}
    totalData={paginationData.totalData}
  />
  <TicketModal
    isOpen={modalOpen}
    onClose={closeModal}
    tickets={selectedTickets}
    userName={selectedUser}
  />
</div>
