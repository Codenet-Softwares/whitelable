import React from 'react';

const useProfitLossNavigation = ({ parentData, handleBackNavigation }) => {

  if (!parentData) return null;

  return (
    <div className="d-flex align-items-center">
      <button 
        className="btn btn-light btn-sm  me-2"
        onClick={handleBackNavigation}
      >
        <i className="fas fa-arrow-left mr-2"></i> Back
      </button>

    </div>
  );
};

export default useProfitLossNavigation;