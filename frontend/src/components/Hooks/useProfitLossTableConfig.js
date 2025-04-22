import React from 'react';

const useProfitLossTableConfig = (currentLevel, navigateToLevel, parentData) => {
  const handleItemClick = (item) => {
    const nextLevel = currentLevel + 1;
    navigateToLevel(nextLevel, item);
  };

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
                onClick={() => handleItemClick(item)}
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
          render: (item) => item.gameName || item.sportName,
        },
        {
          key: "eventName",
          label: "Event Name",
          render: (item) => (
            <button
              className="btn btn-link p-0"
              onClick={() => handleItemClick(item)}
            >
              {item.marketName || item.eventName}
            </button>
          ),
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
    },
    3: {
      columns: [
        {
          key: "serial",
          label: "Serial number",
          render: (_, index) => index + 1,
        },
        {
          key: "username",
          label: "Username",
          render: (item) => (
            <button
              className="btn btn-link p-0"
              onClick={() => handleItemClick(item)}
            >
              {item.username}
            </button>
          ),
        },
        {
          key: "eventName",
          label: "Event Name",
          render: (item) => item.marketName || item.eventName,
        },
        {
          key: "sportName",
          label: "Sport Name",
          render: (item) => item.gameName || item.sportName,
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
    },
    4: {
      columns: (() => {
        const sportType = parentData?.sportName || parentData?.gameName;
        
        if (sportType === "Lottery") {
          return [
            {
              key: "serial",
              label: "Serial number",
              render: (_, index) => index + 1,
            },
            {
              key: "username",
              label: "userName",
              render: (item) => item.userName,
            },
            {
              key: "event",
              label: "Event",
              render: (item) => item.eventName || "-",
            },
            {
              key: "Sportname",
              label: "Sportname",
              render: (item) => item.gameName,
            },
            {
              key: "Amount",
              label: "Amount",
              render: (item) => item.amount,
            },
            {
              key: "Ticket Price",
              label: "Ticket Price",
              render: (item) => item.ticketPrice,
            },
            {
              key: "sem",
              label: "sem",
              render: (item) => item.sem,
            },
            {
              key: "details",
              label: "Details",
              render: (item) => (
                <div>
                  {item.tickets?.length > 0 && (
                    <details>
                      <summary>Tickets ({item.tickets.length})</summary>
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {item.tickets.map((ticket, i) => (
                          <div className="text-truncate" key={i}>
                            {ticket}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ),
            },
            {
              key: "placeTime",
              label: "Place Time",
              render: (item) =>
                new Date(item.placeTime || item.placeDate).toLocaleString(),
            },
            {
              key: "settleTime",
              label: "Settle Time",
              render: (item) =>
                item.settleTime
                  ? new Date(item.settleTime).toLocaleString()
                  : "Not settled",
            },
          ];
        } else if (sportType === "COLORGAME") {
          return [
            {
              key: "serial",
              label: "Serial number",
              render: (_, index) => index + 1,
            },
            {
              key: "username",
              label: "Username",
              render: (item) => item.userName,
            },
            {
              key: "Event Name",
              label: "Event Name",
              render: (item) => item.marketName || "",
            },
            {
              key: "Sport Type",
              label: "Sport Type",
              render: (item) => item.gameName || "",
            },
            {
              key: "Runner Name",
              label: "Runner Name",
              render: (item) => item.runnerName || "",
            },
            {
              key: "Rate",
              label: "Rate",
              render: (item) => item.rate || "",
            },
            {
              key: "betType",
              label: "Bet Type",
              render: (item) => item.type,
            },
            {
              key: "amount",
              label: "Amount",
              render: (item) => item.value,
            },
            {
              key: "P/L",
              label: "P/L",
              render: (item) => (
                <span>
                  {item.bidAmount} (
                  <span style={{ color: "red" }}>-{item.value}</span>)
                </span>
              ),
            },
            {
              key: "placeTime",
              label: "Place Time",
              render: (item) => new Date(item.placeDate).toLocaleString(),
            },
            {
              key: "Match Date",
              label: "Match Date",
              render: (item) => new Date(item.matchDate).toLocaleString(),
            },
          ];
        } else {
          return [
            {
              key: "serial",
              label: "Serial number",
              render: (_, index) => index + 1,
            },
            {
              key: "username",
              label: "Username",
              render: (item) => item.userName,
            },
            {
              key: "event",
              label: "Event",
              render: (item) => item.eventName || "-",
            },
            {
              key: "market",
              label: "Market",
              render: (item) => item.marketName || "-",
            },
            {
              key: "amount",
              label: "Amount",
              render: (item) => item.amount,
            },
            {
              key: "placeTime",
              label: "Place Time",
              render: (item) => new Date(item.placeTime).toLocaleString(),
            },
          ];
        }
      })(),
    }
  };

  return { levelConfig };
};

export default useProfitLossTableConfig;