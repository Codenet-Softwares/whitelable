import React, { useEffect, useState } from "react";
import { useAppContext } from "../contextApi/context";
import { view_AddCashHistory_InitialState } from "../Utils/service/initiateState";
import { permissionObj } from "../Utils/constant/permission";
import { getView_AddCash_history_api } from "../Utils/service/apiService";
import Pagination from "../components/common/Pagination";
import { toast } from "react-toastify";
import { customErrorHandler } from "../Utils/helper";
import { useNavigate } from "react-router-dom";

const View_AddCash_history = () => {
  const navigate = useNavigate();
  const { dispatch, store } = useAppContext();
  const [state, setState] = useState(view_AddCashHistory_InitialState());
  async function getView_AddCash_history() {
    try {
      const response = await getView_AddCash_history_api({
        _id: store?.admin?.id,
        pageNumber: state.currentPage,
        dataLimit: state.totalEntries,
      });
      setState((prevState) => ({
        ...prevState,
        history: response?.data?.transactions,
        totalPages: response?.pagination?.totalPages,
        totalData: response?.pagination?.totalItems,
      }));
    } catch (error) {
      toast.error(customErrorHandler(error));
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
        permissionObj.allAdmin.includes(store?.admin?.roles[0].role) ||
        permissionObj.allSubAdmin.includes(store?.admin?.roles[0].role)
      ) {
        getView_AddCash_history();
      }
    }
  }, [store?.admin, state.currentPage, state.totalEntries]);

  function formatDate(dateString) {
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
  return (
    <div className="d-flex justify-content-center m-5">
      <div className="card w-100 rounded">
        <div
          className="card-heade text-white p-2 d-flex align-items-center justify-content-between"
          style={{ backgroundColor: "#1E2761" }}
        >
          <i
            className="fa fa-arrow-left text-white px-2 position-absolute start-0 arrow-button"
            aria-hidden="true"
            style={{ cursor: "pointer", fontSize: "1.3rem" }}
            onClick={() => navigate("/wallet")}
          ></i>
          <b className="mx-auto text-uppercase">Account Statement</b>

          <div style={{ width: "90px" }}></div>
        </div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <div className="white_card_body">
              {/* Table */}
              <div className="QA_section">
                <div className="QA_table mb_30">
                  <table className="table lms_table_active3">
                    <thead>
                      <tr
                        style={{ backgroundColor: "#e6e9ed", color: "#5562a3" }}
                      >
                        <th scope="col">
                          <b>Date/Time</b>
                        </th>
                        <th scope="col">
                          <b>Amount</b>
                        </th>
                      </tr>
                    </thead>
                    {state.history.length > 0 && (
                      <>
                        {state.history.map((transaction) => (
                          <tr key={transaction._id}>
                            <th>
                              <a href="#" className="question_content">
                                {formatDate(transaction.date)}
                              </a>
                            </th>

                            <td>{transaction.amount}</td>
                          </tr>
                        ))}
                      </>
                    )}
                  </table>
                  {state.history.length === 0 && (
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
          {state.history.length != 0 && (
            <li className="list-group-item">
              {/* <select
                                className="form-select form-select-sm w-25"
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
                                    Show 10 entries
                                </option>
                                <option value="15">15 entries</option>
                                <option value="25">25 entries</option>
                                <option value="50">50 entries</option>
                                <option value="75">75 entries</option>
                            </select> */}
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

export default View_AddCash_history;
