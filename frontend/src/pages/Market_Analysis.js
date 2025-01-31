import React, { useEffect, useState } from 'react';
import { get_liveGames } from '../Utils/service/initiateState';
import { getLiveGames } from '../Utils/service/apiService';
import { toast } from 'react-toastify';
import { customErrorHandler } from '../Utils/helper';
import { useAppContext } from '../contextApi/context';
import { permissionObj } from '../Utils/constant/permission';
import SingleCard from '../components/common/singleCard';
import { Link, useNavigate } from 'react-router-dom';

const Market_Analysis = () => {
    const { store } = useAppContext();
    const [liveGmes, setLiveGmes] = useState(get_liveGames());
    const navigate = useNavigate();

    async function getView_LiveGames() {
        try {
            const response = await getLiveGames({
                pageNumber: liveGmes.currentPage,
                dataLimit: liveGmes.totalEntries,
                search: liveGmes.search,
                type: liveGmes.type
            });
            setLiveGmes((prevState) => ({
                ...prevState,
                data: response?.data,
                totalPages: response?.pagination?.totalPages,
                totalData: response?.pagination?.totalItems,
            }));
        } catch (error) {
            toast.error(customErrorHandler(error));
        }
    }

    useEffect(() => {
        if (store?.admin) {
            if (
                permissionObj.allAdmin.includes(store?.admin?.roles[0].role) ||
                permissionObj.allSubAdmin.includes(store?.admin?.roles[0].role)
            ) {
                getView_LiveGames();
            }
        }
    }, [liveGmes.search, liveGmes.type]);

    const handleRedirect = (data) => {
        if (data.gameName === "Lottery") {
            navigate(`/Lottery_Market_Analysis/${data.marketId}`);
        } else {
            navigate(`/User_BetMarket/${data.marketId}`);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLiveGmes((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="container my-5">
            <div className="card shadow-sm">
                <div
                    className="card-header"
                    style={{
                        backgroundColor: "#1E2761",
                        color: "#fff"
                    }}
                >
                    <h3 className="mb-0 fw-bold fs-5 text-light text-center text-uppercase p-3">Live Bet Game</h3>
                </div>
                <div className="card-body">

                    <div className="white_box_tittle list_header">
                        <div className="col-2 text-center">
                            <select
                                className="form-select form-select-sm"
                                aria-label=".form-select-sm example"
                                name="type"
                                value={liveGmes.type}
                                onChange={handleChange}
                            >
                                <option value="10">All</option>
                                <option value="colorgame">Colorgame</option>
                                <option value="lottery">Lottery</option>
                            </select>
                        </div>

                        <div
                            className="serach_field_2 ms-auto"
                            style={{ marginLeft: "-10px" }}
                        >
                            <div className="search_inner">
                                <form Active="#">
                                    <div className="search_field">
                                        <input
                                            value={liveGmes.search}
                                            onChange={handleChange}
                                            type="text"
                                            name='search'
                                            placeholder="Search content here..."
                                        />
                                    </div>
                                    {/* <button type="submit">
                                        {" "}
                                        <i className="ti-search"></i>{" "}
                                    </button> */}
                                </form>
                            </div>
                        </div>
                    </div>
                    {/* Table */}
                    <SingleCard
                        className="mb-5"
                        style={{
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 1)",
                        }}
                    >
                        <div>
                            <table
                                className="table table-hover rounded-table"
                                style={{
                                    border: "2px solid #1E2761",
                                    borderRadius: "10px",
                                }}
                            >
                                <thead
                                    className=""
                                    style={{
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 1,
                                        background: "#84B9DF"
                                    }}
                                >
                                    <tr>
                                        <th>Serial Number</th>
                                        <th>Game Name</th>
                                        <th>Market Name</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>

                                </tbody>
                            </table>
                        </div>
                    </SingleCard>

                    {/* Pagination */}
                    {/* Uncomment and use the Pagination component if needed */}
                    {/* <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        handlePageChange={handlePageChange}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        totalData={totalData}
                    /> */}
                </div>
            </div>
        </div>
    );
};

export default Market_Analysis;
