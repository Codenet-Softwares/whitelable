import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLotteryBetList } from "../Utils/service/apiService";
import { formatDateForUi } from "../Utils/helper";

const BetHistoryLotteryForPl = () => {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [betList, SetBetList] = useState([]);
  const { userName, id } = useParams();
  console.log("userName", userName, id);
  
  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };
  const fetchBetList = async () => {

    const response = await getLotteryBetList({
      userName: userName,
      marketId: id
    });
    SetBetList(response?.data);
  };

  useEffect(() => {
    fetchBetList();
  }, []);



  console.log("betList", betList);

  return (
    <div className="m-4">
      <div className="d-flex justify-content-end gap-1">
        {/* <button style={{ background: "#51c1e0", border: "1px solid black" }}>
          Back
        </button>
        <button style={{ background: "#f5b8eb", border: "1px solid black" }}>
          Lay
        </button>
        <button style={{ border: "1px solid black" }}>Void</button> */}
      </div>
      <div className="card w-100 mt-3">
        <div
          className="card-heade text-white p-1 d-flex justify-content-between"
          style={{ backgroundColor: "#26416e" }}
        >
          <b>&nbsp;&nbsp;Bet History</b>
        </div>
        <div className="m-1 d-flex justify-content-between align-items-center"></div>

        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <div className="white_card_body">
              <div className="QA_section">
                <div className="QA_table mb_30">
                  <table className="table lms_table_active3 table-bordered">
                    <thead>
                      <tr
                        style={{
                          backgroundColor: "#e6e9ed",
                          color: "#5562a3",
                        }}
                        align="center"
                        className="fw-bold"
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
                          <b>Ticket</b>
                        </th>
                        <th scope="col">
                          <b>Sem</b>
                        </th>
                        <th scope="col">
                          <b>Ticket Price</b>
                        </th>
                        <th scope="col">
                          <b>Amount</b>
                        </th>
                        <th scope="col">
                          <b>Place Time</b>
                        </th>
                        <th scope="col">
                          <b>Settle Time</b>
                        </th>
                      </tr>
                      {betList?.length > 0 ? (
                        betList?.map((data, index) => (
                          <tr
                            key={index}
                            align="center"
                            style={{ backgroundColor: "#accafa" }}
                          >
                            <td>{data?.userName}</td>
                            <td>{data?.gameName}</td>
                            <td>{data?.marketName}</td>
                            <td>{"WINNER"}</td>
                            <td>
                              <div className="dropdown" style={{ position: "relative" }}>
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
                                    height: dropdownOpen === index ? "200px" : "0",
                                    overflow: dropdownOpen === index ? "auto" : "hidden",
                                    transition: "height 0.3s ease",
                                    background: "white",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
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
                                      <span style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
                                        Ticket Numbers:
                                      </span>
                                      <hr style={{ margin: "5px 0", borderColor: "#ddd" }} />
                                      {data?.tickets?.length > 0 ? (
                                        data?.tickets?.map((number, i) => (
                                          <span
                                            key={i}
                                            style={{
                                              display: "block",
                                              padding: "5px 10px",
                                              borderBottom: "1px solid #eee",
                                              color: "#333",
                                            }}
                                          >
                                            {number}
                                          </span>
                                        ))
                                      ) : (
                                        <span style={{ color: "#999", fontStyle: "italic" }}>
                                          No ticket numbers available
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                              </div>
                            </td>
                            <td>{data?.sem}</td>
                            <td>{data?.ticketPrice}</td>
                            <td className="fw-bold">{data?.amount}</td>
                            <td>{formatDateForUi(data?.placeTime)}</td>
                            <td>{formatDateForUi(data?.settleTime)}</td>
                            {/* <Link>Info</Link> */}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={11}>
                            <div
                              className="alert alert-info d-flex justify-content-center"
                              role="alert"
                            >
                              No Data Found
                            </div>
                          </td>
                        </tr>
                      )}
                    </thead>
                  </table>
                </div>
              </div>
            </div>
          </li>
          {/* <li className="list-group-item">
      
          {data?.data?.length > 0 && (
            <Pagination
              currentPage={data.currentPage}
              totalPages={data.totalPages}
              handlePageChange={data.handlePageChange}
              startIndex={startIndex}
              endIndex={endIndex}
              totalData={data.totalData}
            />
          )}
         
        </li> */}
        </ul>
      </div>
    </div>
  );
};

export default BetHistoryLotteryForPl;
