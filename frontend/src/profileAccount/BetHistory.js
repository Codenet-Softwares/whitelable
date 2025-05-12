import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Pagination from "../components/common/Pagination";
import "./BetHistory.css";

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
  SetBetHistoryData,
  formatDateForUi,
  dataType,
  dropdownOpen,
  handleDateForBetHistory,
}) => {
  console.log("", data);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const handelGameId = (event) => {
    setData((prevState) => ({
      ...prevState,
      SelectedGameId: event.target.value,
      currentPage: 1,
    }));
  };

  const toggleDropdown = (id) => {
    setData((prevState) => ({
      ...prevState,
      dropdownOpen: dropdownOpen === id ? null : id,
    }));
  };
  const handelItemPerPage = (event) => {
    setData((prevState) => ({
      ...prevState,
      itemPerPage: Number(event.target.value),
      currentPage: Number(currentPage),
    }));
  };

  const handleDataSourceChange = (e) => {
    const newDataSource = e.target.value;
    SetBetHistoryData((prevState) => ({
      ...prevState,
      dataSource: newDataSource,
      startDate:
        newDataSource === "live"
          ? new Date(new Date().setDate(new Date().getDate() - 1))
          : null,
      endDate: newDataSource === "live" ? new Date() : null,
      currentPage: 1, // Reset to first page when data source changes
    }));

    setIsSubmitDisabled(
      newDataSource === "live" ||
        (newDataSource !== "live" && (!startDate || !endDate))
    );
  };

  const handleDateChange = (date, isStartDate) => {
    if (isStartDate) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }

    setIsSubmitDisabled(
      data.dataSource === "live" ||
        !date ||
        (isStartDate ? !endDate : !startDate)
    );
  };

  const handleSubmit = () => {
    if (data.dataSource === "live") return;
    handleDateForBetHistory();
  };
  useEffect(() => {
    // Auto-fetch for LIVE data when sport or type changes
    if (data.dataSource === "live" && data.SelectedGameId) {
      handleDateForBetHistory();
    }
  }, [data.SelectedGameId, data.dataType, data.dataSource]);

  useEffect(() => {
    setIsSubmitDisabled(data.dataSource === "live" || !startDate || !endDate);
  }, [data.dataSource, startDate, endDate]);

  return (
    <div className="col-sm-8 mt-3">
      <div className="card mb-3 w-100 rounded">
        <div
          className="card-body d-flex flex-column flex-md-row align-items-md-center justify-content-md-between"
          style={{ backgroundColor: "#e6e9ed" }}
        >
          <div className="form-group mb-3 mb-md-0 px-2">
            <div class="container">
              <div class="row">
                <div class="col-sm">Choose Sport</div>
                {data.SelectedGameId !== null ? (
                  <div class="col-sm">Data Source</div>
                ) : null}
                <div class="col-sm">Choose Type</div>
                <div class="col-sm">From</div>
                <div class="col-sm">To</div>
              </div>
            </div>

            <div class="row">
              <div class="col-sm">
                {" "}
                <select
                  className={`form-select ${
                    data.SelectedGameId === null ? "bounce" : ""
                  }`}
                  aria-label="Default select example"
                  onChange={handelGameId}
                >
                  <option selected>Select</option>
                  {data?.gameList.length &&
                    data?.gameList?.map((game) => (
                      <option value={game.gameId}>{game.gameName}</option>
                    ))}
                  <option value="lottery">Lottery</option>
                </select>
              </div>
              {data.SelectedGameId !== null ? (
                <div class="col-sm">
                  {" "}
                  <select
                    class="form-select form-select-sm w-100 m-1"
                    aria-label="Default select example"
                    onChange={handleDataSourceChange}
                  >
                    <option value="live" selected>
                      LIVE DATA
                    </option>
                    <option value="backup">BACKUP DATA</option>
                    <option value="olddata">OLD DATA</option>
                  </select>
                </div>
              ) : null}

              <div class="col-sm">
                {" "}
                <select
                  class="form-select"
                  aria-label="Default select example"
                  onChange={(e) => {
                    SetBetHistoryData((prevState) => ({
                      ...prevState,
                      dataType: e.target.value,
                    }));
                  }}
                >
                  <option selected>Select</option>
                  <option value="settle">Settle</option>
                  <option value="unsettle">UnSettle</option>
                  <option value="void">void</option>
                </select>
              </div>

              <div class="col-sm">
                <DatePicker
                selected={data.dataSource === "live" ? startDate : (startDate || null)}
                  onChange={(date) => handleDateChange(date, true)}
                  readOnly={data.dataSource === "live"}
                  onKeyDown={(e) => e.preventDefault()}
                  placeholderText={
                    data.dataSource === "live" ? "" : "Select date"
                  }
                  className="form-control"
                />
              </div>
              <div class="col-sm">
                {" "}
                <DatePicker
                  selected={data.dataSource === "live" ? endDate : (endDate || null)}
                  onChange={(date) => handleDateChange(date, false)}
                  readOnly={data.dataSource === "live"}
                  onKeyDown={(e) => e.preventDefault()}
                  placeholderText={
                    data.dataSource === "live" ? "" : "Select date"
                  }
                  className="form-control"
                />
              </div>
              <div class="col-sm">
                <button
                  className="btn btn-primary "
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                >
                  Get Statement
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
            &nbsp;&nbsp;
            {dataType === "void"
              ? "Void Game"
              : dataType === "settle"
              ? "Settled Bets"
              : dataType === "unsettle"
              ? "Unsettled Bets"
              : "Bet History"}
          </b>
        </div>
        <select className="w-25 m-1" onChange={handelItemPerPage}>
          <option value="10" selected>
            Showing 10 Entries
          </option>
          <option value="25">25 Entries</option>
          <option value="50">50 Entries</option>
          <option value="100">100 Entries</option>
        </select>
        {data.SelectedGameId === "lottery" ? (
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
