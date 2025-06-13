import React, { useState, useEffect } from "react";
// import Pagination from "../Pagination";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Pagination from "../components/common/Pagination";

const AccountStatement = ({
  props,
  handlePageChange,
  currentPage,
  totalPages,
  handleGetStatement,
  startDate,
  endDate,
  setEndDate,
  setStartDate,
  startIndex,
  endIndex,
  totalData,
  setState,
  handleDateStatement,
  dataSource,
}) => {
  const [currentDate] = useState(new Date()); // Store current date for live data

  function convertToISTFormat(utcDateString) {
    const date = new Date(utcDateString);
    const options = {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    };
    const formatter = new Intl.DateTimeFormat("en-IN", options);
    return formatter.format(date);
  }

  const isGetStatementDisabled = () => {
    if (dataSource === "live") {
      return true; // Always disabled for live data
    }
    return !startDate || !endDate; // Disabled if either date is missing for backup/olddata
  };
  return (
    <div className="col-sm-8 mt-3">
      <div className="card mb-3 w-100 rounded">
        <div
          className="card-header text-white p-2 text-uppercase text-center"
          style={{ backgroundColor: "#1E2761" }}
        >
          <b>&nbsp;&nbsp;Get Account Statement</b>
        </div>
        <div className="card-body d-flex flex-column flex-md-row align-items-md-center justify-content-md-between">
          <div className="form-group mb-3 mb-md-0 px-2">
            <div class="container">
              <div class="row">
                <div class="col-sm">Data Source</div>
                <div class="col-sm">From</div>
                <div class="col-sm">To</div>
                <div class="col-sm"></div>
              </div>
            </div>
            <div class="container">
              <div class="row">
                <div class="col-sm">
                  {" "}
                  <select
                    class="form-select"
                    aria-label="Default select example"
                    onChange={(e) => {
                      setState((prevState) => ({
                        ...prevState,
                        dataSource: e.target.value,
                        // Reset dates when changing data source
                        backupStartDate: null,
                        backupEndDate: null,
                      }));
                    }}
                    value={dataSource}
                  >
                    <option value="live" selected>
                      LIVE DATA
                    </option>
                    <option value="backup">BACKUP DATA</option>
                    <option value="olddata">OLD DATA</option>
                  </select>
                </div>
                <div class="col-sm">
                  {dataSource === "live" ? (
                    <DatePicker
                      type="date"
                      className="form-control"
                      value={currentDate.toLocaleDateString()}
                      readOnly
                    />
                  ) : (
                    <DatePicker
                      type="date"
                      className="form-control"
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      placeholderText={"Select Start Date"}
                      disabled={dataSource === "live"}
                      readonly // Prevent manual typing
                      maxDate={new Date()}
                      onKeyDown={(e) => e.preventDefault()} // Block manual input from keyboard
                    />
                  )}
                </div>
                <div class="col-sm">
                  {dataSource === "live" ? (
                    <DatePicker
                      type="date"
                      className="form-control"
                      value={currentDate.toLocaleDateString()}
                      readOnly
                    />
                  ) : (
                    <DatePicker
                      type="date"
                      className="form-control"
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      placeholderText={"Select End Date"}
                      disabled={dataSource === "live"}
                      readonly // Prevent manual typing
                      maxDate={new Date()}
                      onKeyDown={(e) => e.preventDefault()} // Block manual input from keyboard
                    />
                  )}
                </div>
                <div class="col-sm">
                  <button
                    className="btn btn-primary mb-2"
                    disabled={isGetStatementDisabled()}
                    onClick={handleDateStatement}
                  >
                    Get Statement
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* card */}
      <div class="card w-100 rounded">
        <div
          class="card-heade text-white p-2 rounded text-uppercase text-center"
          style={{ backgroundColor: "#1E2761" }}
        >
          <b>&nbsp;&nbsp;Account Statement</b>
        </div>
        <select
          className="form-select form-select-sm w-25 m-1"
          aria-label=".form-select-sm example"
          onChange={(e) =>
            setState((prevState) => ({
              ...prevState,
              totalEntries: e.target.value,
              // currentPage: 1,
            }))
          }
        >
          <option selected value="10">
            Show 10 Entries
          </option>
          <option value="25">25 Entries</option>
          <option value="50">50 Entries</option>
          <option value="100">100 Entries</option>
        </select>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            <div class="white_card_body">
              {/* Table */}
              <div class="QA_section">
                <div class="QA_table mb_30">
                  <table class="table lms_table_active3 ">
                    <thead>
                      <tr
                        style={{
                          backgroundColor: "#e6e9ed",
                          color: "#5562a3",
                        }}
                      >
                        <th scope="col">
                          <b>Date/Time</b>
                        </th>
                        <th scope="col">
                          <b>Deposit</b>
                        </th>
                        <th scope="col">
                          <b>Withdraw</b>
                        </th>
                        <th scope="col">
                          <b>Balance</b>
                        </th>
                        <th scope="col">
                          <b>Remark</b>
                        </th>
                        <th scope="col">
                          <b>From//To</b>
                        </th>
                      </tr>
                    </thead>
                    {props.map((transaction) => (
                      <tr key={transaction.id}>
                        <th scope="row">
                          <a href="#" className="question_content">
                            {convertToISTFormat(transaction.date)}
                          </a>
                        </th>
                        <td>
                          {transaction.transactionType === "credit" && (
                            <span className="fw-bold">
                              {transaction.amount}
                            </span>
                          )}
                        </td>
                        <td>
                          {transaction.transactionType === "withdrawal" && (
                            <span className="text-danger fw-bold">
                              {transaction.amount}
                            </span>
                          )}
                        </td>

                        <td className="fw-bold">
                          {transaction.transactionType === "debit"
                            ? transaction.debitBalance
                            : transaction.balance}
                        </td>
                        <td>{transaction.remarks}</td>
                        <td>{`${transaction.transferFromUserAccount} / ${transaction.transferToUserAccount}`}</td>
                      </tr>
                    ))}
                  </table>
                </div>
                {/* Table */}
              </div>

              {/* No Data Found */}
              {props.length === 0 && (
                <div className="alert text-dark mt-3" role="alert">
                  <div className="alert-text d-flex justify-content-center">
                    <b> &#128680; No Data Found !! </b>
                  </div>
                </div>
              )}
              {/* End of No Data Found */}
            </div>
          </li>
          <li class="list-group-item">
            {/* Pagiantion */}
            {/* <div class="col-lg-12">
              <nav aria-label="Page navigation example">
                <ul class="pagination justify-content-end">
                  <li class="page-item disabled">
                    <a
                      class="page-link"
                      href="#"
                      tabindex="-1"
                      aria-disabled="true"
                    >
                      Previous
                    </a>
                  </li>
                  <li class="page-item">
                    <a class="page-link" href="#">
                      1
                    </a>
                  </li>
                  <li class="page-item">
                    <a class="page-link" href="#">
                      2
                    </a>
                  </li>
                  <li class="page-item">
                    <a class="page-link" href="#">
                      3
                    </a>
                  </li>
                  <li class="page-item">
                    <a class="page-link" href="#">
                      Next
                    </a>
                  </li>
                </ul>
              </nav>
            </div> */}
            {props.length > 0 && (
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
      </div>
      {/* card */}
    </div>
  );
};

export default AccountStatement;
