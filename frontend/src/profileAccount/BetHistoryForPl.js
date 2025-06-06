import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getBetList } from "../Utils/service/apiService";
import { formatDateForUi } from "../Utils/helper";
import Pagination from "../components/common/Pagination";

const BetHistoryForPl = () => {
  const [betList, SetBetList] = useState([]);
  const { userName, marketId } = useParams();
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const pageLimit = 10;
  const navigate = useNavigate();
  console.log("marketId through params", marketId);
  const fetchBetList = async () => {
    const response = await getBetList({
      userName: userName,
      marketId: marketId,
      page: page,
      limit: pageLimit,
    });
    SetBetList(response?.data);
    setTotalData(response?.pagination?.totalItems);
    setTotalPage(response?.pagination?.totalPages);
  };

  useEffect(() => {
    fetchBetList();
  }, []);

  const startIndex = Math.min((page - 1) * pageLimit + 1);
  const endIndex = Math.min(page * pageLimit, totalData);

  const selectPageHandler = (selectedPage) => {
    setPage(selectedPage);
  };

  const handleBack = () => {
    navigate(-1);
  };

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
          <b>&nbsp;&nbsp;Bet History11</b>
           <span
            style={{ cursor: "pointer" }}
            title="Back"
            onClick={handleBack} 
          >
            {" "}
            <i className="fas fa-arrow-left"></i>
          </span>
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
          {/* <li className="list-group-item"> */}

          {betList?.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPage}
              handlePageChange={selectPageHandler}
              startIndex={startIndex}
              endIndex={endIndex}
              totalData={totalData}
            />
          )}

          {/* </li> */}
        </ul>
      </div>
    </div>
  );
};

export default BetHistoryForPl;
