import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Pagination from "../components/common/Pagination";
import "./BetHistory.css";
import { isFormValidForApiCall } from "../Utils/helper";

const BetHistory = ({
  setEndDate,
  setStartDate,
  startDate,
  endDate,
  data,
  setData,
  startIndex,
  endIndex,
  totalData,
  currentPage,
  totalPages,
  handlePageChange,
  formatDateForUi,
  dataType,
  dropdownOpen,
  handleDateForBetHistory,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handelGameId = (event) => {
    setData((prev) => ({
      ...prev,
      SelectedGameId: event.target.value,
      currentPage: 1,
      dataHistory: [], // Clear previous data when game changes
    }));
  };

  const toggleDropdown = (id) => {
    setData((prev) => ({
      ...prev,
      dropdownOpen: dropdownOpen === id ? null : id,
    }));
  };

  const handelItemPerPage = (event) => {
    setData((prev) => ({
      ...prev,
      itemPerPage: Number(event.target.value),
      currentPage: 1, // Reset to first page when items per page changes
    }));
  };

  const handleDataSourceChange = (e) => {
    const newDataSource = e.target.value;
    const isLive = newDataSource === "live";

    setData((prev) => ({
      ...prev,
      dataSource: newDataSource,
      startDate: isLive ? new Date() : null, // Set today's date for LIVE
      endDate: isLive ? new Date() : null, // Set today's date for LIVE
      currentPage: 1,
      dataHistory: [], // Clear previous data
    }));
  };

  const handleDataTypeChange = (e) => {
    setData((prev) => ({
      ...prev,
      dataType: e.target.value,
      currentPage: 1,
      dataHistory: [], // Clear previous data when type changes
    }));
  };

  const handleDateChange = (date, isStartDate) => {
    if (isStartDate) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  const handleSubmit = async () => {
    if (isFormValidForApiCall(data)) {
      setIsLoading(true);
      try {
        await handleDateForBetHistory();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isSubmitDisabled = !isFormValidForApiCall(data) || isLoading;

  return (
    <div className="col-sm-8 mt-3">
      <div className="card mb-3 w-100 rounded">
        <div
          className="card-body d-flex flex-column flex-md-row align-items-md-center justify-content-md-between"
          style={{ backgroundColor: "#e6e9ed" }}
        >
          <div className="form-group mb-3 mb-md-0 px-2">
            <div class="container">
              <div className="row">
                <div className="col-sm">Choose Sport</div>
                {data.SelectedGameId && (
                  <div className="col-sm">Data Source</div>
                )}
                {data.SelectedGameId && (
                  <div className="col-sm">Choose Type</div>
                )}
                <div className="col-sm">From</div>
                <div className="col-sm">To</div>
              </div>
            </div>

            <div class="row">
              <div class="col-sm">
                {" "}
                <select
                  className={`form-select ${
                    !data.SelectedGameId ? "bounce" : ""
                  }`}
                  aria-label="Select sport"
                  onChange={handelGameId}
                  value={data.SelectedGameId || ""}
                >
                  <option>Select Sport</option>
                  {data.gameList.map((game) => (
                    <option key={game.gameId} value={game.gameId}>
                      {game.gameName}
                    </option>
                  ))}

                  <option value="lottery" className="text-uppercase">
                    {" "}
                    Lottery
                  </option>
                </select>
              </div>
              {data.SelectedGameId && (
                <div className="col-sm">
                  <select
                    className="form-select"
                    aria-label="Select data source"
                    onChange={handleDataSourceChange}
                    value={data.dataSource}
                  >
                    <option value="">Select Source</option>
                    <option value="live">LIVE DATA</option>
                    <option value="backup">BACKUP DATA</option>
                    <option value="olddata">OLD DATA</option>
                  </select>
                </div>
              )}

              {data.SelectedGameId && (
                <div className="col-sm">
                  <select
                    className="form-select"
                    aria-label="Select bet type"
                    onChange={handleDataTypeChange}
                    value={data.dataType}
                  >
                    <option value="">Select Type</option>
                    <option value="settle">Settled</option>
                    <option value="unsettle">Unsettled</option>
                    <option value="void">Void</option>
                  </select>
                </div>
              )}

              <div class="col-sm">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => handleDateChange(date, true)}
                  readOnly={data.dataSource === "live"}
                  placeholderText={
                    data.dataSource === "live"
                      ? "Auto-set for LIVE"
                      : "Select start date"
                  }
                  className="form-control"
                  disabled={data.dataSource === "live"} // Disable for LIVE data
                  maxDate={new Date()}
                />
              </div>
              <div class="col-sm">
                {" "}
                <DatePicker
                  selected={endDate}
                  onChange={(date) => handleDateChange(date, false)}
                  readOnly={data.dataSource === "live"}
                  placeholderText={
                    data.dataSource === "live"
                      ? "Auto-set for LIVE"
                      : "Select end date"
                  }
                  className="form-control"
                  disabled={data.dataSource === "live"} // Disable for LIVE data
                  maxDate={new Date()}
                />
              </div>
              <div class="col-sm">
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={
                    data.dataSource === "live" ||
                    !isFormValidForApiCall(data) ||
                    isLoading
                  }
                >
                  {isLoading ? "Loading..." : "Get Statement"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* card */}
      <div class="card w-100 rounded">
        <div
          class="card-heade text-white p-2 text-center text-uppercase"
          style={{ backgroundColor: "#1E2761" }}
        >
          <b>
            {!data.SelectedGameId
              ? "Please Select A Sport"
              : !data.dataType
              ? "Please Select Bet Type"
              : dataType === "void"
              ? "Void Game"
              : dataType === "settle"
              ? "Settled Bets"
              : dataType === "unsettle"
              ? "Unsettled Bets"
              : "Bet History"}
          </b>
        </div>
        {data.SelectedGameId && (
          <select
            className="w-25 m-1"
            onChange={handelItemPerPage}
            value={data.itemPerPage}
          >
            <option value="10">10 Entries</option>
            <option value="25">25 Entries</option>
            <option value="50">50 Entries</option>
            <option value="100">100 Entries</option>
          </select>
        )}
        {data.SelectedGameId === null ? (
          <div className="alert alert-info fw-bold m-3" role="alert">
            Please Select A Sport Name From Menubar
          </div>
        ) : !data.dataType ? (
          <div className="alert alert-info fw-bold m-3" role="alert">
            Please Select The Type Of Bet From Menubar
          </div>
        ) : data.dataHistory.length === 0 ? (
          <div className="alert alert-info fw-bold m-3" role="alert">
            No Data Found For Selected Criteria
          </div>
        ) : data.SelectedGameId === "lottery" ? (
          <ul class="list-group list-group-flush">
            <li class="list-group-item  p-0 m-1">
              <div class="white_card_body ">
                {/* Table */}
                <div class="QA_section">
                  <div class="QA_table mb_30">
                    <table
                      class="table lms_table_active3 table-bordered p-0 m-0"
                      style={{ tableLayout: "fixed", width: "100%" }}
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor: "#e6e9ed",
                            color: "#5562a3",
                            textAlign: "center",
                          }}
                        >
                          <th scope="col" style={{ width: "10%" }}>
                            <b>
                              User <br /> Name
                            </b>
                          </th>
                          <th scope="col" style={{ width: "10%" }}>
                            <b>
                              Sport
                              <br /> Name
                            </b>
                          </th>
                          <th scope="col" style={{ width: "15%" }}>
                            <b>Event</b>
                          </th>
                          <th scope="col" style={{ width: "13%" }}>
                            <b>Market</b>
                          </th>
                          <th scope="col" style={{ width: "18%" }}>
                            <b>Ticket</b>
                          </th>
                          <th scope="col" style={{ width: "10%" }}>
                            <b>Sem</b>
                          </th>
                          <th scope="col" style={{ width: "10%" }}>
                            <b>
                              Ticket <br /> Price
                            </b>
                          </th>
                          <th scope="col" style={{ width: "10%" }}>
                            <b>Amount</b>
                          </th>
                          <th scope="col" style={{ width: "10%" }}>
                            <b>
                              Place <br /> Time
                            </b>
                          </th>
                          <th scope="col" style={{ width: "15%" }}>
                            <b>
                              Settle <br /> Time
                            </b>
                          </th>
                        </tr>
                        {/* Show a message if no Sport is selected */}
                        {data.SelectedGameId === null && (
                          <tr align="center">
                            <td colspan="10">
                              <div
                                class="alert alert-info fw-bold"
                                role="alert"
                              >
                                Please Select A Sport Name From Menubar
                              </div>
                            </td>
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {/* Render the data history if available and a sport is selected */}
                        {data.SelectedGameId !== null &&
                        data?.dataHistory?.length > 0
                          ? data?.dataHistory?.map((history, index) => (
                              <tr key={index} align="center">
                                <td>{history?.userName}</td>
                                <td>{history?.gameName}</td>
                                <td>{history?.marketName}</td>
                                <td>{"WINNER"}</td>
                                <td>
                                  <div
                                    className="dropdown"
                                    style={{
                                      position: "relative",
                                      display: "inline-block",
                                    }}
                                  >
                                    <button
                                      className="btn btn-link dropdown-toggle"
                                      type="button"
                                      onClick={() => toggleDropdown(index)}
                                    >
                                      View Tickets
                                    </button>
                                    <div
                                      className="custom-dropdown-content"
                                      style={{
                                        height:
                                          dropdownOpen === index
                                            ? "200px"
                                            : "0",
                                        overflow:
                                          dropdownOpen === index
                                            ? "auto"
                                            : "hidden",
                                        transition: "height 0.3s ease",
                                        background: "white",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                        boxShadow:
                                          "0 0 10px rgba(0, 0, 0, 0.1)",
                                      }}
                                    >
                                      {dropdownOpen === index && (
                                        <div
                                          style={{
                                            maxHeight: "200px", // Sets the maximum height
                                            // overflowY: "auto", // Enables scrolling if necessary
                                            padding: "10px", // Optional: Space inside the dropdown
                                          }}
                                        >
                                          <span
                                            style={{
                                              fontWeight: "bold",
                                              display: "block",
                                              marginBottom: "5px",
                                            }}
                                          >
                                            Ticket Numbers:
                                          </span>
                                          <hr
                                            style={{
                                              margin: "5px 0",
                                              borderColor: "#ddd",
                                            }}
                                          />
                                          {history?.tickets?.length > 0 ? (
                                            history?.tickets?.map(
                                              (number, i) => (
                                                <span
                                                  key={i}
                                                  style={{
                                                    display: "block",
                                                    padding: "5px 10px",
                                                    borderBottom:
                                                      "1px solid #eee",
                                                    color: "#333",
                                                  }}
                                                >
                                                  {number}
                                                </span>
                                              )
                                            )
                                          ) : (
                                            <span
                                              style={{
                                                color: "#999",
                                                fontStyle: "italic",
                                              }}
                                            >
                                              No ticket numbers available
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td>{history?.sem}</td>
                                <td>{history?.ticketPrice}</td>
                                <td className="fw-bold">{history?.amount}</td>
                                <td>{formatDateForUi(history?.placeDate)}</td>
                                <td>{formatDateForUi(history?.date)}</td>
                              </tr>
                            ))
                          : // Render No Data Found message only if a sport is selected and there's no data
                            data.SelectedGameId !== null && (
                              <tr align="center">
                                <td colspan="10">
                                  <div
                                    class="alert alert-info fw-bold"
                                    role="alert"
                                  >
                                    No Data Found !!
                                  </div>
                                </td>
                              </tr>
                            )}
                      </tbody>
                    </table>
                  </div>
                  {/* Table */}
                </div>

                {/* No Data Found */}
                {/* {props.length === 0 && (
                <div className="alert text-dark bg-light mt-3" role="alert">
                  <div className="alert-text d-flex justify-content-center">
                    <b> &#128680; No Data Found !! </b>
                  </div>
                </div>
              )} */}
                {/* End of No Data Found */}
              </div>
            </li>
            <li class="list-group-item">
              {/* Pagiantion */}
              {data?.dataHistory?.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  totalData={totalData}
                />
              )}
              {/* Pagiantion */}
            </li>
          </ul>
        ) : (
          <ul class="list-group list-group-flush">
            <li class="list-group-item  p-0 m-1">
              <div class="white_card_body ">
                {/* Table */}
                <div class="QA_section">
                  <div class="QA_table mb_30">
                    <table class="table lms_table_active3 table-bordered p-0 m-0">
                      <thead>
                        <tr
                          style={{
                            backgroundColor: "#e6e9ed",
                            color: "#5562a3",
                          }}
                        >
                          <th scope="col">
                            <b>User Name</b>
                          </th>
                          <th scope="col">
                            <b>Sport Name</b>
                          </th>
                          <th scope="col">
                            <b>Event</b>
                          </th>
                          <th scope="col">
                            <b>Market</b>
                          </th>
                          <th scope="col">
                            <b>Selection</b>
                          </th>
                          <th scope="col">
                            <b>Type</b>
                          </th>
                          <th scope="col">
                            <b>Odds Req.</b>
                          </th>
                          <th scope="col">
                            <b>Stack</b>
                          </th>
                          <th scope="col">
                            <b>Place Time</b>
                          </th>
                          <th scope="col">
                            <b>Settle Time</b>
                          </th>
                        </tr>
                        {/* Show a message if no Sport is selected */}
                        {data.SelectedGameId === null && (
                          <tr align="center">
                            <td colspan="10">
                              <div
                                class="alert alert-info fw-bold"
                                role="alert"
                              >
                                Please Select A Sport Name From Menubar
                              </div>
                            </td>
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {/* Render the data history if available and a sport is selected */}
                        {data.SelectedGameId !== null &&
                        data?.dataHistory?.length > 0
                          ? data?.dataHistory?.map((history, index) => (
                              <tr key={index} align="center">
                                <td>{history?.userName}</td>
                                <td>{history?.gameName}</td>
                                <td>{history?.marketName}</td>
                                <td>{"WINNER"}</td>
                                <td>{history?.runnerName}</td>
                                <td>{history?.type}</td>
                                <td>{history?.rate}</td>
                                <td className="fw-bold">{history?.value}</td>
                                <td>{formatDateForUi(history?.placeDate)}</td>
                                <td>{formatDateForUi(history?.date)}</td>
                              </tr>
                            ))
                          : // Render No Data Found message only if a sport is selected and there's no data
                            data.SelectedGameId !== null && (
                              <tr align="center">
                                <td colspan="10">
                                  <div
                                    class="alert alert-info fw-bold"
                                    role="alert"
                                  >
                                    No Data Found !!
                                  </div>
                                </td>
                              </tr>
                            )}
                      </tbody>
                    </table>
                  </div>
                  {/* Table */}
                </div>

                {/* No Data Found */}
                {/* {props.length === 0 && (
                <div className="alert text-dark bg-light mt-3" role="alert">
                  <div className="alert-text d-flex justify-content-center">
                    <b> &#128680; No Data Found !! </b>
                  </div>
                </div>
              )} */}
                {/* End of No Data Found */}
              </div>
            </li>
            <li class="list-group-item">
              {/* Pagiantion */}
              {data?.dataHistory?.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  totalData={totalData}
                />
              )}
              {/* Pagiantion */}
            </li>
          </ul>
        )}
      </div>
      {/* card */}
    </div>
  );
};

export default BetHistory;
