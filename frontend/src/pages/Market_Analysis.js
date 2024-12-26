import React, { useEffect, useState } from 'react';
import { get_liveGames } from '../Utils/service/initiateState';
import { getLiveGames } from '../Utils/service/apiService';
import { toast } from 'react-toastify';
import { customErrorHandler } from '../Utils/helper';
import { useAppContext } from '../contextApi/context';
import { permissionObj } from '../Utils/constant/permission';
import SingleCard from '../components/common/singleCard';
import { Link , useNavigate } from 'react-router-dom';

const Market_Analysis = () => {
    const { dispatch, store } = useAppContext();
    const [liveGmes, setLiveGmes] = useState(get_liveGames());
    const navigate = useNavigate();

    const handleClearSearch = () => {
        // Placeholder for clearing search functionality
    };

    async function getView_LiveGames() {
        try {
            const response = await getLiveGames({
                // Uncomment and modify these lines if pagination is implemented
                // pageNumber: state.currentPage,
                // dataLimit: state.totalEntries,
            });
            console.log("======>>>>>> response", response.data);

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

    console.log("======>>>>>> liveGmes", liveGmes);

    useEffect(() => {
        if (store?.admin) {
            if (
                permissionObj.allAdmin.includes(store?.admin?.roles[0].role) ||
                permissionObj.allSubAdmin.includes(store?.admin?.roles[0].role)
            ) {
                getView_LiveGames();
            }
        }
    }, []);

    const handleRedirect = (data) => {
        if (data.gameName === "Lottery") {
            navigate(`/Lottery_Market_Analysis/${data.marketId}`);
        } else {
            navigate(`/User_BetMarket/${data.marketId}`);
        }
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
                                        background:"#84B9DF"
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
                                    {liveGmes.data.length > 0 ? (
                                        liveGmes.data.map((data, i) => (
                                            <tr className='fw-bold' key={data.marketId}>
                                                <td>{i + 1}</td>
                                                <td>{data.gameName}</td>
                                                <td>{data.marketName}</td>
                                                <td>
                                                    {/* <Link to={`/User_BetMarket/${data.marketId}`}> */}
                                                        <button type="button" className="text-white p-2 border-0 rounded-3 betMarket_btn " style={{background:"#1E2761"}} onClick={() => handleRedirect(data)}>
                                                        {data.gameName === "Lottery" ? "Go To Lottery Analysis" : "Go To Bet Market"}
                                                        </button>
                                                    {/* </Link> */}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center">
                                                No Live bet games found.
                                            </td>
                                        </tr>
                                    )}
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
