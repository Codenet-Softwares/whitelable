import React from 'react';

const EventProfitLoss = () => {
  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0 text-white">Event Profit/Loss Report</h4>
            </div>
            <div className="card-body text-center py-5">
              <div className="display-4 text-muted mb-4">
                <i className="fas fa-cogs"></i>
              </div>
              <h3 className="text-info">This Page is Under Development</h3>
              <p className="lead">
                We're working hard to bring you this feature soon.
              </p>
              <p>
                The Event Profit/Loss report will provide detailed insights into your event-based performance metrics.
              </p>
            </div>
            <div className="card-footer text-muted text-center">
              Check back later for updates
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventProfitLoss;