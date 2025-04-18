// useProfitLossNavigation.js
import React from 'react';

const useProfitLossNavigation = ({ parentData, handleBackToLevelOne }) => {
  console.log('data of parent',parentData)
  if (!parentData) return null;

  return (
    <div className="d-flex align-items-center mb-3">
      <button 
        className="btn btn-sm btn-outline-primary me-2"
        onClick={handleBackToLevelOne}
      >
        &larr; Back
      </button>
      {/* <h5 className="mb-0">Event P&L - {parentData.sportName}</h5> */}
    </div>
  );
};

export default useProfitLossNavigation;