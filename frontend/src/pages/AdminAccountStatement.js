import React, { useEffect, useState } from "react";
import { useAppContext } from "../contextApi/context";
import { getAccountStatement_api } from "../Utils/service/apiService";
import { permissionObj } from "../Utils/constant/permission";
import Pagination from "../components/common/Pagination";
import { adminAccountStatementInitialState } from "../Utils/service/initiateState";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";

const AdminAccountStatement = () => {
  const { dispatch, store } = useAppContext();

  const [state, setState] = useState(adminAccountStatementInitialState());
  const [backupDate, setbackupDate] = useState({
    endDate: null,
    startDate: null,
  });

  const setStartDate = (date) => {
    setbackupDate((prevState) => ({ ...prevState, startDate: date }));
  };

  const setEndDate = (date) => {
    setbackupDate((prevState) => ({ ...prevState, endDate: date }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  async function AccountStatement() {
    const today = new Date();
    const fromDate =
      state.dataSource === "live" ? formatDate(today) : state.startDate;
    const toDate =
      state.dataSource === "live" ? formatDate(today) : state.endDate;

    const response = await getAccountStatement_api({
      _id: store?.admin?.id,
      pageNumber: state.currentPage,
      dataLimit: state.totalEntries,
      fromDate: fromDate,
      toDate: toDate,
      dataSource: state.dataSource,
    });

    if (response && response.data) {
      setState((prevState) => ({
        ...prevState,
        statement: response.data,
        totalPages: response?.pagination?.totalPages || 0,
        totalData: response?.pagination?.totalItems || 0,
      }));
    } else {
      console.error(
        "Account statement API returned null or unexpected data:",
        response
      );
    }
  }

  function handlePageChange(page) {
    setState((prevState) => ({
      ...prevState,
      currentPage: page,
    }));
  }

  useEffect(() => {
    if (store?.admin) {
      if (
        permissionObj.allAdmin.includes(store?.admin?.role) ||
        permissionObj.allSubAdmin.includes(store?.admin?.role)
      ) {
        AccountStatement();
      }
    }
  }, [
    store?.admin,
    state.currentPage,
    state.totalEntries,
    state.dataSource,
    state.endDate,
    state.startDate,
  ]);

  function formatDateForUi(dateString) {
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  }

  const startIndex = Math.min((state.currentPage - 1) * state.totalEntries + 1);
  const endIndex = Math.min(
    state.currentPage * state.totalEntries,
    state.totalData
  );

  const handleGetDate = () => {
    const start = new Date(backupDate.startDate);
    const end = new Date(backupDate.endDate);
    if (end < start) {
      toast.warn("End date cannot be earlier than start date.");
      return;
    }
    setState((prevState) => ({
      ...prevState,
      startDate: formatDate(backupDate.startDate),
      endDate: formatDate(backupDate.endDate),
      currentPage: 1,
    }));
  };

  // Set today's date when dataSource changes to live
  useEffect(() => {
    if (state.dataSource === "live") {
      const today = new Date();
      setStartDate(today);
      setEndDate(today);
      setState((prev) => ({
        ...prev,
        startDate: formatDate(today),
        endDate: formatDate(today),
      }));
    } else {
      // For backup and olddata, reset dates to null and empty strings
      setStartDate(null);
      setEndDate(null);
      setState((prev) => ({
        ...prev,
        startDate: "",
        endDate: "",
      }));
    }
  }, [state.dataSource]);

  return (
    <div className="d-flex justify-content-center m-5 rounded-2">
      {/* card */}
      <div className="card w-100 ">
        <div
          className="card-heade text-white p-3 text-center h5 rounded-2"
          style={{ backgroundColor: "#1E2761" }}
        >
          <b className="text-uppercase">&nbsp;&nbsp;Account Statement</b>
        </div>

        <div className="form-group mb-3 mb-md-0 px-2 mt-3">
          <div class="container">
            <div class="row">
              <div class="col-sm fw-bold">Total Entries</div>
              <div class="col-sm fw-bold">Data Source</div>
              <div class="col-sm fw-bold">From : </div>
              <div class="col-sm fw-bold">To : </div>
              <div class="col-sm fw-bold"></div>
            </div>
          </div>
          <div class="container">
            <div class="row">
              <div class="col-sm">
                <select
                  className="form-select form-select-sm w-50 m-1"
                  aria-label=".form-select-sm example"
                  onChange={(e) =>
                    setState((prevState) => ({
                      ...prevState,
                      totalEntries: e.target.value,
                      currentPage: 1,
                    }))
                  }
                >
                  <option selected value="10">
                    10 Entries
                  </option>
                  <option value="25">25 Entries</option>
                  <option value="50">50 Entries</option>
                  <option value="100">100 Entries</option>
                </select>
              </div>
              <div class="col-sm">
                {" "}
                <select
                  class="form-select form-select-sm w-50 m-1"
                  aria-label="Default select example"
                  onChange={(e) => {
                    setState((prevState) => ({
                      ...prevState,
                      dataSource: e.target.value,
                    }));
                  }}
                  value={state.dataSource}
                >
                  <option value="live">LIVE DATA</option>
                  <option value="backup">BACKUP DATA</option>
                  <option value="olddata">OLD DATA</option>
                </select>
              </div>
              <div class="col-sm ">
                <DatePicker
                  selected={backupDate.startDate}
                  onChange={(date) => setStartDate(date)}
                  disabled={state.dataSource === "live"}
                  placeholderText={"Select Start Date"}
                  onKeyDown={(e) => e.preventDefault()}
                />
              </div>
              <div class="col-sm">
                {" "}
                <DatePicker
                  selected={backupDate.endDate}
                  onChange={(date) => setEndDate(date)}
                  disabled={state.dataSource === "live"}
                  placeholderText={"Select End Date"}
                  onKeyDown={(e) => e.preventDefault()}
                />
              </div>

              <div class="col-sm">
                <button
                  className="btn mb-2"
                  style={{ background: "#84B9DF" }}
                  disabled={
                    (backupDate.endDate === null ||
                      backupDate.startDate === null) &&
                    state.dataSource !== "live"
                  }
                  onClick={handleGetDate}
                >
                  Get Statement
                </button>
              </div>
            </div>
          </div>
        </div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <div className="white_card_body">
              {/* Table */}
              <div className="QA_section">
                <div className="QA_table mb_30">
                  <table className="table lms_table_active3 table-border border">
                    <thead
                      className=" mt-4"
                      style={{ background: "#84B9DF", color: "black" }}
                    >
                      <tr>
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
                          <b>From &rarr; To</b>
                        </th>
                      </tr>
                    </thead>
                    {state?.statement?.map((transaction) => (
                      <tr key={transaction._id} className="border">
                        <th scope="row">
                          <a href="#" className="question_content">
                            {formatDateForUi(transaction.date)}
                          </a>
                        </th>
                        <td>
                          {transaction.transactionType === "credit" ||
                          transaction.transactionType === "deposit" ? (
                            <span className="fw-bold">
                              {transaction.amount}
                            </span>
                          ) : null}
                        </td>
                        <td>
                          {transaction.transactionType === "withdrawal" && (
                            <span className="text-danger fw-bold">
                              {transaction.amount}
                            </span>
                          )}
                        </td>
                        <td className="fw-bold">{transaction.balance}</td>
                        <td>{transaction.remarks}</td>
                        <td>
                          {transaction.hasOwnProperty(
                            "transferFromUserAccount"
                          ) &&
                          transaction.hasOwnProperty(
                            "transferToUserAccount"
                          ) ? (
                            <>
                              {transaction.transferFromUserAccount} &rarr;{" "}
                              {transaction.transferToUserAccount}
                            </>
                          ) : (
                            "Self-Transaction"
                          )}
                        </td>
                      </tr>
                    ))}
                  </table>
                  {state.statement.length === 0 && (
                    <div className="alert text-dark bg-light mt-3" role="alert">
                      <div className="alert-text d-flex justify-content-center">
                        <b> &#128680; No Data Found !! </b>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* End of No Data Found */}
            </div>
          </li>
          {state.statement.length !== 0 && (
            <li className="list-group-item">
              {/* Pagination */}
              <Pagination
                currentPage={state.currentPage}
                totalPages={state.totalPages}
                handlePageChange={handlePageChange}
                startIndex={startIndex}
                endIndex={endIndex}
                totalData={state.totalData}
              />
              {/* Pagination */}
            </li>
          )}
        </ul>
      </div>
      {/* card */}
    </div>
  );
};

export default AdminAccountStatement;
