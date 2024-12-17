import React, { useEffect, useState } from "react";
import Pagination from "../components/common/Pagination";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ProfitAndLossLotteryEvent = ({
    data,
    SetComponent,
    SetMarketId,
    SetProfitLossEventData,
    currentPage,
    SetToggle,
    totalItems,
    UserName
}) => {

    const nav = useNavigate()
    const startIndex = Math.min((data.currentPage - 1) * 10 + 1);
    const endIndex = Math.min(data.currentPage * 10, data.totalData);


    const handelItemPerPage = (event) => {
        console.log("event.target.value", event.target.value);
        SetProfitLossEventData((prevState) => ({
            ...prevState,
            itemPerPage: Number(event.target.value),
            currentPage: Number(currentPage),
        }));
        toast.error("Work Pending From ServerSide");
    };

    const handleSearch = (e) => {
        SetProfitLossEventData((prev) => ({
            ...prev,
            searchItem: e.target.value,
        }));
    };

    return (
        <>
            {/* card */}
            <div className="card w-100 rounded">
                <div
                    className="card-heade text-white p-1 d-flex justify-content-between"
                    style={{ backgroundColor: "#26416e" }}
                >
                    <b>&nbsp;&nbsp;Profit & Loss Events</b>
                    <span
                        style={{ cursor: "pointer" }}
                        title="Back"
                        onClick={() => {
                            SetToggle(true);
                        }}
                    >
                        {" "}
                        <i className="fas fa-arrow-left"></i>
                    </span>
                </div>
                <div className="m-1 d-flex justify-content-between align-items-center">
                    <select
                        className="form-select w-auto m-1"
                        onChange={handelItemPerPage}
                    >
                        <option value="10" selected>
                            10 Entries
                        </option>
                        <option value="25">25 Entries</option>
                        <option value="50">50 Entries</option>
                        <option value="100">100 Entries</option>
                    </select>
                    <input
                        type="search"
                        className="form-control w-auto"
                        placeholder="Search..."
                        onChange={handleSearch}
                    />
                </div>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                        <div className="white_card_body">
                            {data?.data?.length === 0 && totalItems !== 0 ? (
                                // Loader
                                <div
                                    className="d-flex justify-content-center align-items-center"
                                    style={{ height: "100px" }}
                                >
                                    <tr align="center">
                                            <td colSpan="10"> {/* Fixed typo from colspan="10" to colSpan="10" */}
                                                <div className="alert alert-info fw-bold" role="alert">
                                                    No Data Found !!
                                                </div>
                                            </td>
                                        </tr>
                                </div>
                            ) : (
                                // Table
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
                                                >
                                                    <th scope="col">
                                                        <b>Sport Name</b>
                                                    </th>
                                                    <th scope="col">
                                                        <b>Event Name</b>
                                                    </th>
                                                    <th scope="col">
                                                        <b>Commission</b>
                                                    </th>
                                                    <th scope="col">
                                                        <b>Profit & Loss</b>
                                                    </th>
                                                    <th scope="col">
                                                        <b>Total P&L</b>
                                                    </th>
                                                </tr>
                                                {data?.data?.length > 0 ? (
                                                    data?.data?.map((data, index) => (
                                                        <tr key={index} align="center">
                                                            <td>{data?.gameName}</td>
                                                            <td
                                                                className="text-primary fw-bold"
                                                                style={{ cursor: "pointer" }}
                                                                onClick={() => {
                                                                    nav(
                                                                        `/betHistLotteryForPL/${UserName}`
                                                                    );
                                                                }}
                                                            >
                                                                {data?.marketName}
                                                            </td>
                                                            <td>{data?.commission || "0"}</td>
                                                            <td
                                                                className={`fw-bold ${data?.profitLoss > 0
                                                                    ? "text-success"
                                                                    : "text-danger"
                                                                    }`}
                                                            >
                                                                {data?.profitLoss || "0"}
                                                            </td>
                                                            <td
                                                                className={`fw-bold ${data?.profitLoss > 0
                                                                    ? "text-success"
                                                                    : "text-danger"
                                                                    }`}
                                                            >
                                                                {data?.profitLoss}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr align="center">
                                                        <td colspan="5">
                                                            <div
                                                                class="alert alert-info fw-bold"
                                                                role="alert"
                                                            >
                                                                No Data Found !!
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </thead>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </li>
                    <li className="list-group-item">
                        {/* Pagination */}
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
                        {/* Pagination */}
                    </li>
                </ul>
            </div>
            {/* card */}
        </>
    );
};

export default ProfitAndLossLotteryEvent;
