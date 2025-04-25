import React from "react";
import ReusableTable from "../../Reusables/ReusableTable";
import useProfitLossData from "../../components/Hooks/useProfitLossData";
import useProfitLossTableConfig from "../../components/Hooks/useProfitLossTableConfig";
import useProfitLossNavigation from "../../components/Hooks/useProfitLossNavigation ";
import { getFooterText, getHeaderTitle } from "../../Utils/ProfitLossTextUtils";

const EventProfitLoss = () => {
  // Custom hooks for state management and logic
  const {
    state,
    handleDataTypeChange,
    handleDateChange,
    handleGetPL,
    getTableData,
    navigateToLevel,
    handleBackNavigation,
  } = useProfitLossData();

  const { levelConfig } = useProfitLossTableConfig(
    state.currentLevel,
    navigateToLevel,
    state.parentData
  );
  const Navigation = useProfitLossNavigation({
    parentData: state.parentData,
    handleBackNavigation,
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
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0 text-white">{getHeaderTitle(state)}</h4>
              <div>{Navigation}</div>
            </div>
            {/* Filter Section - Visible only when currentLevel is 1 */}
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
            {/* Table Section */}
            <div className="card-body">
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
                  showSearch={state.currentLevel !== 4} // Disable search for level 4
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
            {/* Footer Section */}
            <div className="card-footer text-muted">{getFooterText(state)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventProfitLoss;
