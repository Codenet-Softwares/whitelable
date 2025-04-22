import React from 'react';

const useProfitLossNavigation = ({ parentData, grandParentData, handleBackNavigation }) => {
  console.log('====>>> line 4',grandParentData)
  if (!parentData) return null;

  return (
    <div className="d-flex align-items-center mb-3">
      <button 
        className="btn btn-sm btn-outline-primary me-2"
        onClick={handleBackNavigation}
      >
        &larr; Back
      </button>
      {grandParentData && (
        <span className="me-2">
          {grandParentData.sportName || grandParentData.gameName} &gt;
        </span>
      )}
      <span className="me-2">
        {parentData.sportName || parentData.gameName || parentData.marketName}
      </span>
    </div>
  );
};

export default useProfitLossNavigation;