import React, { useEffect, useState } from "react";
import SingleCard from "../components/common/singleCard";
import {
  get_betBook,
  getMarketWithRunnerDataInitialState,
} from "../Utils/service/initiateState";
import {
  GetBetBook,
  GetLiveUsers,
  getMarket_LiveBet,
  getUserGetMarket,
  GetUsersBook,
} from "../Utils/service/apiService";
import { toast } from "react-toastify";
import { customErrorHandler } from "../Utils/helper";
import { useAppContext } from "../contextApi/context";
import { permissionObj } from "../Utils/constant/permission";
import { useParams } from "react-router-dom";
import Picture from "../Assets/Picture.webp";
import "./DemoMarket_Analysis.css";
import ReusableModal from "../components/common/ReusableModal";
import HierarchyModal from "./HierarchyModal";
import Pagination from "../components/common/Pagination";
import { useNavigate } from "react-router-dom";

const User_BetMarket = () => {
  const navigate = useNavigate();

  const { dispatch, store } = useAppContext();
  const [user_marketWithRunnerData, setUser_marketWithRunnerData] = useState(
    getMarketWithRunnerDataInitialState()
  );

  const [user_LiveBet, setUser_LiveBet] = useState({
    data: [],
    currentPage: 1,
    totalEntries: 10,
    totalPages: 0,
    totalData: 0,
    search: "",
  });
  const { marketId, userName } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);
  const [nestedModalOpen, setNestedModalOpen] = useState(false);
  const [hierarchyData, setHierarchyData] = useState([]);
  const [userBookModalOpen, setUserBookModalOpen] = useState(false);
  const [viewMoreModalOpen, setViewMoreModalOpen] = useState(false);
  const [betBookData, setBetBookData] = useState([]);
  const [bodyData, setBodyData] = useState(get_betBook());
  const [liveToggle, setLiveToggle] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isHirerchyModalOpen, setHirerchyModalOpen] = useState(false);
  const [isInsideViewMoreModal, setIsInsideViewMoreModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // useEffect(()=>{fetch_BetBookData()},[bodyData])
  const handleUsernameClick = (userName , fromViewMore = false) => {
    console.log("onclick", userName);
    setSelectedUser(userName);
    setHirerchyModalOpen(true); // Open the modal when a username is clicked
    handleCloseViewMoreModal();// #####
    setIsInsideViewMoreModal(fromViewMore); // Track if the click was from View More modal
  };
  const handleHirerchyCloseModal = () => {
    setHirerchyModalOpen(false);
    setSelectedUser(null); // Reset user selection
     // Only reopen "View More" modal if it was opened from inside it
     if (isInsideViewMoreModal) {
      setViewMoreModalOpen(true);
  }
};

  const handleLiveToggle = () => {
    setLiveToggle(!liveToggle);
  };

  // Function to open the modal
  const handleOpenModal = () => {
    setModalOpen(true);
    setBodyData({
      marketId: marketId,
      adminId: store?.admin?.id,
      role: store?.admin?.roles[0]?.role,
      type: "master-book",
    });
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  // Function to close the modal
  const handleCloseModal = () => setModalOpen(false);

  // Function to open the nested modal
  const handleOpenNestedModal = () => {
    setNestedModalOpen(true);
    fetch_BetBookData();
  };

  // Function to close the nested modal
  const handleCloseNestedModal = () => {
    setNestedModalOpen(false);
    setBodyData({
      marketId: marketId,
      adminId: store?.admin?.id,
      role: store?.admin?.roles[0]?.role,
      type: "master-book",
    });
  };

  const handleOpenUserBookModal = () => {
    setUserBookModalOpen(true);
    setBodyData({
      marketId: marketId,
      adminId: store?.admin?.id,
      role: store?.admin?.roles[0]?.role,
      type: "user-book",
    });
  };
  const handleCloseUserBookModal = () => setUserBookModalOpen(false);

  const handleOpenViewMoreModal = () => {
    setViewMoreModalOpen(true);
    setBodyData({});
  };
  const handleCloseViewMoreModal = () => setViewMoreModalOpen(false);
  useEffect(() => {
    const fetchLiveUsers = async () => {
      try {
        const response = await GetLiveUsers({ marketId: marketId });
        if (response?.success) {
          setHierarchyData(response.data);
        }
      } catch (error) {
        toast.error("Failed to fetch live users.");
      }
    };
    fetchLiveUsers();
  }, [marketId]);

  useEffect(() => {
    console.log("API Called");
    getView_LiveBet(
      user_LiveBet.currentPage,
      user_LiveBet.totalEntries,
      searchTerm
    );
  }, [searchTerm, liveToggle]);

  async function getView_LiveBet(
    page = 1,
    entries = user_LiveBet.totalEntries,
    search = ""
  ) {
    try {
      const response = await getMarket_LiveBet({
        marketId: marketId,
        adminId: store?.admin?.id,
        role: store?.admin?.roles[0]?.role,
        pageNumber: page,
        totalEntries: entries,
        search,
      });

      setUser_LiveBet((prevState) => ({
        ...prevState,
        data: response?.data || [],
        currentPage: response?.pagination?.page || page,
        totalEntries: response?.pagination?.pageSize || entries,
        totalPages: response?.pagination?.totalPages || 0,
        totalData: response?.pagination?.totalItems || 0,
      }));
    } catch (error) {
      console.error("API Error:", error);
      toast.error(customErrorHandler(error));
    }
  }

  const currentPage = user_LiveBet.currentPage || 1;
  const totalEntries = user_LiveBet.totalEntries || 10;
  const startIndex = (currentPage - 1) * totalEntries + 1;
  const endIndex = Math.min(
    startIndex + totalEntries - 1,
    user_LiveBet.totalData
  );

  async function getView_User_BetMarket() {
    try {
      const response = await getUserGetMarket({
        marketId: marketId,
      });
      setUser_marketWithRunnerData(response.data);
    } catch (error) {
      toast.error(customErrorHandler(error));
    }
  }

  async function fetch_BetBookData() {
    try {
      const response = await GetBetBook(bodyData);
      if (response?.success) {
        setBetBookData(response.data);
      } else {
        toast.error("Failed to fetch user book data.");
      }
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
        getView_User_BetMarket();
      }
    }
  }, []);

  // Find the next username based on the adminId match
  const getNextUserName = (adminId) => {
    let nextUser = null;

    // Iterate over the createdByHierarchy data
    hierarchyData?.[0]?.createdByHierarchy.forEach((user, index) => {
      if (
        store?.admin?.id === adminId &&
        hierarchyData?.[0]?.createdByHierarchy[index + 1]
      ) {
        nextUser = hierarchyData?.[0]?.createdByHierarchy[index + 1].userName;
      }
    });

    return nextUser;
  };

  const nextUserName = getNextUserName(store?.admin?.id);

  const handlePageChange = (newPage) => {
    setUser_LiveBet((prevState) => ({
      ...prevState,
      currentPage: newPage,
      data: [], // Clear previous data before fetching new
    }));

    getView_LiveBet(newPage, user_LiveBet.totalEntries);
  };

  const handleEntriesChange = (e) => {
    const newEntries = parseInt(e.target.value, 10);
    setUser_LiveBet((prevState) => ({
      ...prevState,
      totalEntries: newEntries,
      currentPage: 1, // Reset to first page
    }));
    getView_LiveBet(1, newEntries);
  };

  const handleClick_To_InnerHierarcy = async (id, role) => {
    setBodyData((prevData) => ({
      ...prevData,
      adminId: id,
      role: role,
    }));
  };

  useEffect(() => {
    if (bodyData?.adminId && bodyData?.role) {
      const fetchData = async () => {
        await fetch_BetBookData();
      };

      fetchData();
    }
  }, [bodyData]);

  return (
    <div className="container-fluid my-5">
      <div className="card shadow-sm">
        <div
          className="card-header d-flex align-items-center"
          style={{
            backgroundColor: "#1E2761",
            color: "#FFFFFF",
          }}
        >
          <i
            className="fa fa-arrow-left text-white px-2"
            aria-hidden="true"
            style={{ cursor: "pointer", fontSize: "1.3rem" }}
            onClick={() => navigate("/Market_analysis")}
          ></i>
          <h3 className="mb-0 fw-bold fs-5 text-center flex-grow-1 text-white p-2 text-uppercase">
            User Bet Market
          </h3>
        </div>

        <div className="card-body">
          <SingleCard className="mb-5">
            <div className="card-group">
              {/* Main Market Analysis Card */}
              <div className="card bg-white border-0 rounded-top">
                <div
                  className="card-header d-flex justify-content-between"
                  style={{
                    padding: "0",
                    border: "1px solid #E5E4E2",
                  }}
                >
                  <div
                    className="d-flex"
                    style={{
                      borderTopRightRadius: "28px",
                      padding: "10px",
                      background: "#1E2761",
                    }}
                  >
                    <h4 className="m-0 text-white px-3 p-2 text-uppercase">
                      Featured
                    </h4>
                    <i
                      className="fa fa-info-circle text-white px-4 mt-3 info_icon"
                      aria-hidden="true"
                    ></i>
                  </div>
                  <div className="mt-2 px-4">
                    <h4 className="mt-3 fw-bolder">
                      Matched $ {user_marketWithRunnerData.matchedAmount || 0}
                    </h4>
                  </div>
                </div>
                <table className="table table-bordered table-striped border">
                  <thead>
                    <tr>
                      <th className="team-name-column"></th>
                      <th
                        className="back-column text-center text-uppercase"
                        style={{
                          background: "#50A0E2",
                          fontSize: "20px",
                        }}
                      >
                        Back
                      </th>
                      <th
                        className="lay-column text-center text-uppercase"
                        style={{
                          background: "#E5798B",
                          fontSize: "20px",
                        }}
                      >
                        Lay
                      </th>
                      <th className="min-max-column text-center">
                        <h6 className="min-max-value mt-2 px-5 p-1">
                          <span className="fw-bold text-primary">Min/Max</span>{" "}
                          100-2500
                        </h6>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Dynamically Populate Runner Data */}

                    {user_marketWithRunnerData?.runners?.map(
                      (runnerData, index) => (
                        <tr key={index}>
                          <td className="team-name px-3">
                            <h4 className="fw-bolder">
                              {runnerData.runnerName.name || "Team Name"}
                            </h4>
                            <span className="number">
                              <i
                                className={`fa fa-arrow-right fw-bold ${
                                  runnerData?.runnerName?.bal <= 0
                                    ? "green_icon"
                                    : "red_icon"
                                }`}
                                aria-hidden="true"
                              ></i>
                              <span
                                className={`px-2 fw-bold ${
                                  runnerData?.runnerName?.bal <= 0
                                    ? "green_icon"
                                    : "red_icon"
                                }`}
                              >
                                {runnerData?.runnerName?.bal <= 0
                                  ? `+${Math.abs(
                                      runnerData?.runnerName?.bal || 0
                                    )}`
                                  : `-${runnerData?.runnerName?.bal}`}
                              </span>
                            </span>
                          </td>
                          <td className="back-cell text-center fw-bold">
                            <h6>{runnerData.rate?.[0].back || "--"}</h6>
                            <span>{runnerData.backSize || "--"}</span>
                          </td>
                          <td className="lay-cell text-center fw-bold">
                            <h6>{runnerData.rate?.[0].lay || "--"}</h6>
                            <span>{runnerData.laySize || "--"}</span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Side Content */}
              <div className="card">
                <div className="rounded-top" style={{ background: "#1E2761" }}>
                  <h4 className="card-header text-white fw-bold text-uppercase">
                    Live Streaming
                  </h4>
                </div>
                {/* Additional Cards */}
                <div className="card mt-3">
                  <h4
                    className="card-header text-white fw-bold rounded-top text-uppercase"
                    style={{ background: "#1E2761" }}
                  >
                    Score Card
                  </h4>
                  <div className="card-body p-0">
                    <img
                      src={Picture}
                      alt="Market-analysis"
                      style={{ width: "100%", height: "235px" }}
                    />
                  </div>
                </div>
                {/* Additional Content */}
                {/* Add more components as needed */}
                <div className="card mt-3">
                  <div
                    className="rounded-top"
                    style={{ background: "#1E2761" }}
                  >
                    <h4 className="card-header text-white fw-bold text-uppercase">
                      Book
                    </h4>
                  </div>
                  <div className="card-body d-flex justify-content-center align-items-center">
                    <button
                      className="btn me-3 text-white fw-bolder px-5 text-uppercase"
                      style={{ background: "#1E2761" }}
                      onClick={handleOpenModal}
                    >
                      Master Book
                    </button>
                    <button
                      className="btn text-white fw-bolder px-5 text-uppercase"
                      style={{ background: "#1E2761" }}
                      disabled={store?.admin?.roles[0]?.role === "superAdmin"}
                      onClick={handleOpenUserBookModal}
                    >
                      User Book
                    </button>
                  </div>
                </div>
                <div className="card mt-4">
                  <div
                    className="d-flex align-items-center rounded-top"
                    style={{ background: "#1E2761" }}
                  >
                    {/* Live Bet Section */}
                    <h4 className="card-header text-white fw-bold py-3 mb-0 bg-transparent me-3 text-uppercase">
                      Live Bet
                    </h4>
                    <div className="form-check form-switch mt-1 me-3">
                      <input
                        className="form-check-input"
                        value={liveToggle}
                        type="checkbox"
                        id="liveBetToggle1"
                        style={{ transform: "scale(1.5)" }}
                        onClick={handleLiveToggle}
                      />
                    </div>

                    {/* Partnership Book Section */}
                    <h4 className="card-header text-white fw-bold py-3 mb-0 bg-transparent me-3 text-uppercase">
                      Partnership Book
                    </h4>
                    <div className="form-check form-switch mt-1 me-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="liveBetToggle2"
                        style={{ transform: "scale(1.5)" }}
                      />
                    </div>
                    {/* View More Section */}
                    <h4
                      className="card-header text-white fw-bold py-3 mb-0 bg-transparent ms-auto text-uppercase"
                      style={{
                        cursor: !liveToggle ? "not-allowed" : "pointer", // Disable when liveToggle is OFF
                        opacity: !liveToggle ? 0.5 : 1, // Dim when disabled
                      }}
                      onClick={() => {
                        if (liveToggle) {
                          handleOpenViewMoreModal(); // Enable only when liveToggle is ON
                        }
                      }}
                    >
                      View More Live Bet.....
                    </h4>
                  </div>
                  <ReusableModal
                    isOpen={viewMoreModalOpen}
                    onClose={handleCloseViewMoreModal}
                    title={<span className="h2 fw-bold">All Live Data</span>}
                    bodyContent={
                      <div style={{}}>
                        <div className="white_box_tittle list_header">
                          <div className="col-2 text-center">
                            <select
                              className="form-select form-select-sm"
                              onChange={handleEntriesChange}
                            >
                              <option value="10">Show 10 Entries</option>
                              <option value="25">25 Entries</option>
                              <option value="50">50 Entries</option>
                              <option value="100">100 Entries</option>
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
                                    type="text"
                                    placeholder="Search content here..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                  />
                                </div>
                                <button type="submit">
                                  {" "}
                                  <i className="ti-search"></i>{" "}
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                        {liveToggle ? (
                          <>
                            {/* Table Headers */}
                            <div className="col-12">
                              <div className="row text-center">
                                <div className="col-2">
                                  <p className="fw-bold text-dark">
                                    Market Name
                                  </p>
                                </div>
                                <div className="col-2">
                                  <p className="fw-bold text-dark">
                                    Runner Name
                                  </p>
                                </div>
                                <div className="col-2">
                                  <p className="fw-bold text-dark">Odds</p>
                                </div>
                                <div className="col-2">
                                  <p className="fw-bold text-dark">Stake</p>
                                </div>
                                <div className="col-2">
                                  <p className="fw-bold text-dark">Type</p>
                                </div>
                                <div className="col-2">
                                  <p className="fw-bold text-dark">Username</p>
                                </div>
                              </div>
                            </div>

                            {/* Table Data */}
                            <div
                              style={{
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                // padding: "7px",
                                backgroundColor: "#BEDCF4",
                              }}
                            >
                              {user_LiveBet.data.length > 0 ? (
                                <div>
                                  {user_LiveBet.data.map((data) => (
                                    <div
                                      className="row text-center align-items-center"
                                      style={{
                                        borderBottom: "1px solid #ddd",
                                        padding: "8px 0",
                                      }}
                                      key={data.id}
                                    >
                                      {/* Market Name & Type */}
                                      <div className="col-2 d-flex align-items-center justify-content-center">
                                        <button
                                          style={{
                                            backgroundColor:
                                              data.type === "back"
                                                ? "#7DBCE8"
                                                : "#FFB6C1",
                                            border: "none",
                                            borderRadius: "3px",
                                            marginRight: "10px",
                                            fontSize: "12px",
                                            textTransform: "uppercase",
                                            width: "40px",
                                          }}
                                        >
                                          {data.type}
                                        </button>
                                        <div>
                                          <div style={{ fontSize: "12px" }}>
                                            {data.runnerName}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: "12px",
                                              color: "#555",
                                            }}
                                          >
                                            Match Odds
                                          </div>
                                        </div>
                                      </div>

                                      {/* Odds */}
                                      <div
                                        className="col-2 fw-bold"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data.runnerName}
                                      </div>
                                      <div
                                        className="col-2 fw-bold"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data.rate}
                                      </div>

                                      {/* Stake */}
                                      <div
                                        className="col-2 fw-bold"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data.value}
                                      </div>
                                      <div
                                        className="col-2 fw-bold"
                                        style={{
                                          fontSize: "14px",
                                          textTransform: "uppercase",
                                          color:
                                            data.type === "back"
                                              ? "#50A0E2"
                                              : "#E5798B",
                                        }}
                                      >
                                        {data.type}
                                      </div>

                                      {/* Username */}
                                      <div
                                        className="col-2 fw-bold"
                                        style={{
                                          fontSize: "15px",
                                          color:
                                            data.type === "back"
                                              ? "#007bff"
                                              : "#FFB6C1",
                                        }}
                                        onClick={() =>
                                          handleUsernameClick(data.userName,  true)
                                        }
                                      >
                                        {data.userName}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center p-3">
                                  <h5
                                    style={{
                                      fontSize: "18px",
                                      fontWeight: "bold",
                                      color: "gray",
                                    }}
                                  >
                                    There are no any bet.
                                  </h5>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="card-body text-center">
                            <h5
                              style={{
                                fontSize: "20px",
                                fontWeight: "bold",
                                color: "gray",
                              }}
                            >
                              There are no any bet.
                            </h5>
                          </div>
                        )}
                        {user_LiveBet?.data?.length > 0 && (
                          <Pagination
                            currentPage={user_LiveBet.currentPage}
                            totalPages={user_LiveBet.totalPages}
                            handlePageChange={handlePageChange}
                            startIndex={startIndex}
                            endIndex={endIndex}
                            totalData={user_LiveBet.totalData}
                          />
                        )}
                      </div>
                    }
                  />
               
                  <div className="card-body">
                    <h5
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "gray",
                      }}
                    >
                      <div>
                        {liveToggle ? (
                          <>
                            {/* Table Headers */}
                            <div className="col-12">
                              <div className="row text-center">
                                <div className="col-4">
                                  <p className="fw-bold text-dark">
                                    Market Name
                                  </p>
                                </div>
                                <div className="col-2">
                                  <p className="fw-bold text-dark">Odds</p>
                                </div>
                                <div className="col-3">
                                  <p className="fw-bold text-dark">Stake</p>
                                </div>
                                <div className="col-3">
                                  <p className="fw-bold text-dark">Username</p>
                                </div>
                              </div>
                            </div>

                            {/* Table Data */}
                            <div
                              style={{
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                padding: "7px",
                                backgroundColor: "#BEDCF4",
                              }}
                            >
                              {user_LiveBet.data.length > 0 ? (
                                <div>
                                  {user_LiveBet.data.slice(0, 5).map((data) => (
                                    <div
                                      className="row text-center align-items-center"
                                      style={{
                                        borderBottom: "1px solid #ddd",
                                        padding: "8px 0",
                                      }}
                                      key={data.id}
                                    >
                                      {/* Market Name & Type */}
                                      <div className="col-4 d-flex align-items-center justify-content-center">
                                        <button
                                          style={{
                                            backgroundColor:
                                              data.type === "back"
                                                ? "#7DBCE8"
                                                : "#FFB6C1",
                                            border: "none",
                                            borderRadius: "3px",
                                            marginRight: "10px",
                                            fontSize: "12px",
                                            textTransform: "uppercase",
                                            width: "40px",
                                          }}
                                        >
                                          {data.type}
                                        </button>
                                        <div>
                                          <div style={{ fontSize: "12px" }}>
                                            {data.runnerName}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: "12px",
                                              color: "#555",
                                            }}
                                          >
                                            Match Odds
                                          </div>
                                        </div>
                                      </div>

                                      {/* Odds */}
                                      <div
                                        className="col-2 fw-bold"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data.rate}
                                      </div>

                                      {/* Stake */}
                                      <div
                                        className="col-3 fw-bold"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {data.value}
                                      </div>

                                      {/* Username */}
                                      <div
                                        className="col-3 fw-bold"
                                        style={{
                                          fontSize: "15px",
                                          color:
                                            data.type === "back"
                                              ? "#007bff"
                                              : "#FFB6C1",
                                        }}
                                        onClick={() =>
                                          handleUsernameClick(data.userName,  false)
                                        }
                                      >
                                        {data.userName}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center p-3">
                                  <h5
                                    style={{
                                      fontSize: "18px",
                                      fontWeight: "bold",
                                      color: "gray",
                                    }}
                                  >
                                    There are no any bet.
                                  </h5>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="card-body text-center">
                            <h5
                              style={{
                                fontSize: "20px",
                                fontWeight: "bold",
                                color: "gray",
                              }}
                            >
                              There are no any bet.
                            </h5>
                          </div>
                        )}
                      </div>
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </SingleCard>
        </div>
        <ReusableModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Market List"
          bodyContent={
            <div className="table-responsive">
              <table className="table table-bordered text-center">
                <tbody>
                  <tr
                    onClick={handleOpenNestedModal}
                    style={{ cursor: "pointer" }}
                  >
                    <td>Match Odds</td>
                  </tr>
                  <tr>
                    <td>Bookmaker</td>
                  </tr>
                </tbody>
              </table>
            </div>
          }
        />

        <ReusableModal
          isOpen={nestedModalOpen}
          onClose={handleCloseNestedModal}
          title="Live Users Data"
          bodyContent={
            <div className="table-responsive">
              <table
                className="table"
                style={{ border: "1px solid #ddd", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                      Username
                    </th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                      Role
                    </th>
                    {betBookData[0]?.runnerBalance?.map((balance) => (
                      <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {balance?.runnerName}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {betBookData?.length > 0 ? (
                    betBookData.map((master, index) => {
                      return (
                        <tr key={index}>
                          {permissionObj.allAdmin.includes(master?.roles) ? (
                            <td
                              style={{
                                border: "1px solid #ddd",
                                padding: "8px",
                              }}
                              onClick={() =>
                                handleClick_To_InnerHierarcy(
                                  master?.adminId,
                                  master?.roles
                                )
                              }
                              className="text-primary"
                            >
                              {master?.userName}
                            </td>
                          ) : (
                            <td
                              style={{
                                border: "1px solid #ddd",
                                padding: "8px",
                              }}
                            >
                              {master?.userName}
                            </td>
                          )}

                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {master?.roles}
                          </td>
                          {master?.runnerBalance?.map((data) => {
                            return (
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {data?.bal >= 0 ? (
                                  <span className="text-success">
                                    {data?.bal}
                                  </span>
                                ) : (
                                  <span className="text-danger">
                                    {data?.bal}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center"
                        style={{ border: "1px solid #ddd", padding: "8px" }}
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          }
        />

        <ReusableModal
          isOpen={userBookModalOpen}
          onClose={handleCloseUserBookModal}
          title="User Book Data"
          bodyContent={
            <div className="table-responsive">
              <table
                className="table"
                style={{ border: "1px solid #ddd", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                      Username
                    </th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                      Role
                    </th>
                    {betBookData[0]?.runnerBalance?.map((balance) => (
                      <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {balance?.runnerName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {betBookData?.length > 0 ? (
                    betBookData.map((master, index) => {
                      return (
                        <tr key={index}>
                          {permissionObj.allAdmin.includes(master?.roles) ? (
                            <td
                              style={{
                                border: "1px solid #ddd",
                                padding: "8px",
                              }}
                              onClick={() =>
                                handleClick_To_InnerHierarcy(
                                  master?.adminId,
                                  master?.roles
                                )
                              }
                              className="text-primary"
                            >
                              {master?.userName}
                            </td>
                          ) : (
                            <td
                              style={{
                                border: "1px solid #ddd",
                                padding: "8px",
                              }}
                            >
                              {master?.userName}
                            </td>
                          )}

                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {master?.roles}
                          </td>
                          {master?.runnerBalance?.map((data) => {
                            return (
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {data?.bal >= 0 ? (
                                  <span className="text-success">
                                    {data?.bal}
                                  </span>
                                ) : (
                                  <span className="text-danger">
                                    {data?.bal}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center"
                        style={{ border: "1px solid #ddd", padding: "8px" }}
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          }
        />
      </div>
      <HierarchyModal
        selectedUser={selectedUser}
        isOpen={isHirerchyModalOpen}
        onRequestClose={handleHirerchyCloseModal}
      />
    </div>
  );
};

export default User_BetMarket;
