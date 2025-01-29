import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBetList } from "../Utils/service/apiService";
import { formatDateForUi } from "../Utils/helper";

const BetHistoryForPl = () => {
  const [betList, SetBetList] = useState([]);
  const { userName, runnerId } = useParams();

  const fetchBetList = async () => {
    const response = await getBetList({
      userName: userName,
      runnerId: runnerId,
    });
    SetBetList(response?.data);
  };

  useEffect(() => {
    fetchBetList();
  }, []);

  return (
    <div className="m-4">
      <div className="d-flex justify-content-end gap-1">
        <button style={{ background: "#51c1e0", border: "1px solid black" }}>
          Back
        </button>
        <button style={{ background: "#f5b8eb", border: "1px solid black" }}>
          Lay
        </button>
        <button style={{ border: "1px solid black" }}>Void</button>
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
                          <b>Sport Name</b>
                        </th>
                        <th scope="col">
                          <b>Event Name</b>
                        </th>
                        <th scope="col">
                          <b>Market Name</b>
                        </th>
                        <th scope="col">
                          <b>Runner Name</b>
                        </th>
                        <th scope="col">
                          <b>Bet Type</b>
                        </th>
                        <th scope="col">
                          <b>User Price</b>
                        </th>
                        <th scope="col">
                          <b>Amount</b>
                        </th>
                        <th scope="col">
                          <b>PL</b>
                        </th>
                        <th scope="col">
                          <b>Place Date</b>
                        </th>
                        <th scope="col">
                          <b>Match Date</b>
                        </th>
                        <th scope="col">
                          <b>Details</b>
                        </th>
                      </tr>
                      {betList?.length > 0 ? (
                        betList?.map((data, index) => (
                          <tr
                            key={index}
                            align="center"
                            style={{ backgroundColor: "#accafa" }}
                          >
                            <td>{data.gameName}</td>
                            <td>{data.marketName}</td>
                            <td>{"WINNER"}</td>
                            <td>{data.runnerName}</td>
                            <td>{data.type}</td>
                            <td className="fw-bold">{data.rate}</td>
                            <td className="fw-bold">{data.value}</td>
                            <td>
                              <span className="text-success fw-bold">
                                {Math.round(data.bidAmount)}
                              </span>
                              <span className="text-danger fw-bold">
                                (-{Math.round(data.value)})
                              </span>
                            </td>
                            <td>{formatDateForUi(data?.placeDate)}</td>
                            <td>{formatDateForUi(data?.matchDate)}</td>
                            <td>
                              <Link>Info</Link>
                            </td>
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

export default BetHistoryForPl;
