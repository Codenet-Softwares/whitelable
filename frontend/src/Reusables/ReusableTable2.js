import React from "react";
import PropTypes from "prop-types";
import Pagination from "../components/common/Pagination";

/**
 * ReusableTable2
 * A flexible, reusable table component with support for:
 * - Custom columns
 * - Pagination
 * - Search functionality
 * - Actions for each row
 */
const ReusableTable2 = ({
  columns,        // Array of column config objects (header, accessor, etc.)
  data,           // Current data slice to display in the table
  currentPage,    // Active page number for pagination
  totalPages,     // Total number of pages available
  totalData,      // Total number of rows in dataset
  totalEntries,   // Current "entries per page" value (10, 25, 50, 100)
  onPageChange,   // Callback to update current page
  onEntriesChange,// Callback to update entries shown per page
  onSearch,       // Callback to update search filter
  searchValue,    // Current value of the search input
  noDataMessage,  // Message to show if no data is available
  actions,        // Optional array of action buttons for each row
  startIndex,     // Start index of current visible data (for display only)
  endIndex        // End index of current visible data (for display only)
}) => {
  return (
    <div className="card border-0 shadow-sm">
      {/* Outer card structure for borderless, shadowed appearance */}
      <div className="card-body p-0">
        <div className="table-responsive">
          {/* Top controls: Entries per page & Search input */}
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            {/* Dropdown for selecting how many entries to show */}
            <div className="col-2">
              <select
                className="form-select form-select-sm"
                aria-label="Entries selector"
                onChange={(e) => onEntriesChange(e.target.value)}
                value={totalEntries}
              >
                <option value="10">Show 10 Entries</option>
                <option value="25">25 Entries</option>
                <option value="50">50 Entries</option>
                <option value="100">100 Entries</option>
              </select>
            </div>

            {/* Search input box */}
            <div className="col-4">
              <div className="input-group input-group-sm">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name..."
                  value={searchValue}
                  onChange={(e) => onSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Main content rendering based on data availability */}
          {data.length > 0 ? (
            <>
              {/* Table structure starts */}
              <table className="table table-hover mb-0 text-uppercase fw-bold">
                <thead className="table-light">
                  <tr>
                    {/* Render column headers dynamically from config */}
                    {columns.map((column, index) => (
                      <th key={index} scope="col" style={column.headerStyle}>
                        {column.header}
                      </th>
                    ))}
                    {/* If actions are defined, add one extra column for action buttons */}
                    {actions.length > 0 && <th scope="col">Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {/* Loop through data rows and render each */}
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {/* Loop through each column for the current row */}
                      {columns.map((column, colIndex) => (
                        <td key={colIndex}>
                          {/* If a cellRenderer is defined, use it to customize cell display */}
                          {column.cellRenderer
                            ? column.cellRenderer(
                                row,
                                startIndex + rowIndex - 1
                              )
                            : row[column.accessor] /* Otherwise, use the raw value */}
                        </td>
                      ))}

                      {/* If actions are defined, render each as a button */}
                      {actions.length > 0 && (
                        <td>
                          <div className="d-flex gap-2 text-uppercase">
                            {actions.map((action, actionIndex) => (
                              <button
                                key={actionIndex}
                                className={`btn btn-sm ${action.className} ${
                                  action.disabledCondition &&
                                  action.disabledCondition(row)
                                    ? "disabled"
                                    : ""
                                }`}
                                title={action.title}
                                onClick={() => action.handler(row)}
                                disabled={
                                  action.disabledCondition &&
                                  action.disabledCondition(row)
                                }
                              >
                                <i className={`bi ${action.icon}`}></i>
                              </button>
                            ))}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Render pagination footer only if there are multiple pages */}
              {totalPages > 0 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePageChange={onPageChange}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalData={totalData}
                  />
                </div>
              )}
            </>
          ) : (
            // If no data exists, show a friendly "no data" message
            <div className="p-5 text-center text-muted">
              <i className="bi bi-exclamation-circle fs-1"></i>
              <p className="mt-2 mb-0 fw-bold">{noDataMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Define prop types for component validation and better DX
ReusableTable2.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      accessor: PropTypes.string,
      cellRenderer: PropTypes.func,
      headerStyle: PropTypes.object,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalData: PropTypes.number.isRequired,
  totalEntries: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onEntriesChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  searchValue: PropTypes.string.isRequired,
  noDataMessage: PropTypes.string,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      className: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      handler: PropTypes.func.isRequired,
      disabledCondition: PropTypes.func,
    })
  ),
  startIndex: PropTypes.number.isRequired,
  endIndex: PropTypes.number.isRequired,
};

export default ReusableTable2;
