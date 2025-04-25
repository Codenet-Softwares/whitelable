import React from "react";

export const getHeaderTitle = (state) => {
  switch (state.currentLevel) {
    case 1:
      return "Profit Loss";
    case 2:
      return `Profit & Loss Events - ${state?.parentData?.sportName}`;
    case 3:
      return `Profit Loss User - ${state?.parentData?.gameName}`;
    case 4:
      return `Bet History - ${state?.parentData?.username}`;
    default:
      return "Profit Loss";
  }
};

export const getFooterText = (state) => {
  const { currentLevel, dataType, dateRange, parentData } = state;
  const showDateRange = dateRange.from && dateRange.to;

  const baseText = (
    <>
      Showing <strong>{dataType}</strong> data{" "}
      {showDateRange && (
        <>
          from <strong>{dateRange.from}</strong> to{" "}
          <strong>{dateRange.to}</strong>
        </>
      )}
    </>
  );

  switch (currentLevel) {
    case 2:
      return parentData?.sportName ? (
        <>
          {baseText} for <strong>{parentData.sportName}</strong>
        </>
      ) : (
        baseText
      );
    case 3:
      return parentData?.gameName ? (
        <>
          {baseText} for <strong>{parentData.gameName}</strong>
        </>
      ) : (
        baseText
      );
    case 4:
      return parentData?.username ? (
        <>
          {baseText} for <strong>{parentData.username}</strong>
        </>
      ) : (
        baseText
      );
    default:
      return baseText;
  }
};
