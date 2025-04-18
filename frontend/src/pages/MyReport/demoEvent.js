import React from "react";
import ReusableTable from "../../Reusables/ReusableTable";
import useProfitLossData from "../../components/Hooks/useProfitLossData";
import useProfitLossTableConfig from "../../components/Hooks/useProfitLossTableConfig";
import useProfitLossNavigation from "../../components/Hooks/useProfitLossNavigation ";

const DemoEvent = () => {
  const {
    state,
    handleDataTypeChange,
    handleDateChange,
    handleGetPL,
    getTableData,
    handleLevelNavigation,
    handleBackToLevelOne,
  } = useProfitLossData();

  const { levelConfig } = useProfitLossTableConfig(handleLevelNavigation);
  const Navigation = useProfitLossNavigation({
    parentData: state.parentData,
    handleBackToLevelOne,
  });

  // This function to prevent manual date input
  const handleKeyDown = (e) => {
    e.preventDefault();
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0 text-white">
                {state.currentLevel === 2
                  ? `Event P&L - ${state.parentData?.sportName}`
                  : "Event P&L - Level 1"}
              </h4>
            </div>

            {state.currentLevel === 1 && (
              <div className="card-body border-bottom ">
                <div className="row align-items-center">
                  <div className="col-md-3 mb-2">
                    <select
                      className="form-control text-uppercase"
                      value={state.dataType}
                      onChange={handleDataTypeChange}
                    >
                      <option value="live" className="text-uppercase">
                        Live Data
                      </option>
                      <option value="backup" className="text-uppercase">
                        Backup Data
                      </option>
                      <option value="olddata" className="text-uppercase">
                        Old Data
                      </option>
                    </select>
                  </div>
                  <div className="col-md-4 mb-2">
                    <div className="input-group">
                      <input
                        type="date"
                        className="form-control"
                        value={state.dateRange.from || ""}
                        onChange={(e) =>
                          handleDateChange("from", e.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        disabled={state.dataType === "live"}
                      />
                      <span className="input-group-text">to</span>
                      <input
                        type="date"
                        className="form-control"
                        value={state.dateRange.to || ""}
                        onChange={(e) => handleDateChange("to", e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={state.dataType === "live"}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mb-2">
                    <button
                      className="btn btn-primary w-100"
                      onClick={handleGetPL}
                      disabled={
                        state.loading ||
                        state.shouldDisableButton ||
                        (state.dataType !== "live" &&
                          (!state.dateRange.from || !state.dateRange.to))
                      }
                    >
                      {state.loading ? "Loading..." : "Get P&L"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="card-body">
              {Navigation}
              {state.loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <ReusableTable
                  columns={levelConfig[state.currentLevel].columns}
                  itemsPerPage={10}
                  showSearch={true}
                  paginationVisible={true}
                  fetchData={getTableData}
                  key={`level-${state.currentLevel}-${state.levelRefreshKey}-${
                    state.parentData?.sportName || state.dataType
                  }-${state.dateRange.from}-${state.dateRange.to}-${
                    state.tableRefreshKey
                  }`}
                />
              )}
            </div>

            <div className="card-footer text-muted">
              {state.currentLevel === 2
                ? `Showing events for ${state.parentData?.sportName}`
                : `Showing ${state.dataType} data ${
                    state.dateRange.from &&
                    state.dateRange.to &&
                    `from ${state.dateRange.from} to ${state.dateRange.to}`
                  }`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoEvent;
