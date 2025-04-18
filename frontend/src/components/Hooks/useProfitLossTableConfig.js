import React from 'react';

const useProfitLossTableConfig = (handleLevelNavigation) => {
  console.log('line 4 of table render',handleLevelNavigation)
  const levelConfig = {
    1: {
      columns: [
        { 
          key: "Serial number", 
          label: "Serial number",  
          render: (item, index) => (item.isTotalRow ? "" : index + 1), 
        },
        {
          key: "sportName",
          label: "Sport Name",
          render: (item) =>
            item.isTotalRow ? (
              item.sportName
            ) : (
              <button
                className="btn btn-link p-0"
                onClick={() => handleLevelNavigation(item)}
              >
                {item.sportName}
              </button>
            ),
        },
        {
          key: "uplinePL",
          label: "Upline P/L",
          render: (item) => {
            const value = item.uplinePL || 0;
            return (
              <span style={{ color: value >= 0 ? "green" : "red" }}>
                {value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2)}
              </span>
            );
          },
        },
        {
          key: "downlinePL",
          label: "Downline P/L",
          render: (item) => {
            const value = item.downlinePL || 0;
            return (
              <span style={{ color: value >= 0 ? "green" : "red" }}>
                {value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2)}
              </span>
            );
          },
        },
        {
          key: "commission",
          label: "Commission",
        },
      ],
    },
    2: {
      columns: [
        {
          key: "serial",
          label: "Serial number",
          render: (_, index) => index + 1,
        },
        {
          key: "sportName",
          label: "Sport Name",
          render: (item) => item.sportName,
        },
        {
          key: "eventName",
          label: "Event Name",
          render: (item) => item.eventName,
        },
        {
          key: "totalPL",
          label: "Total P/L",
          render: (item) => (
            <span style={{ color: item.totalPL >= 0 ? "green" : "red" }}>
              {item.totalPL >= 0
                ? `+${item.totalPL.toFixed(2)}`
                : item.totalPL.toFixed(2)}
            </span>
          ),
        },
        {
          key: "date",
          label: "Date",
          render: (item) => new Date(item.date).toLocaleString(),
        },
      ],
    }
  };

  return { levelConfig };
};

export default useProfitLossTableConfig;