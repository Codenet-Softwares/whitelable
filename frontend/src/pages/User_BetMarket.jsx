import React, { useEffect, useState } from "react";
import SingleCard from "../components/common/singleCard";
import {
  get_betBook,
  getMarketWithRunnerDataInitialState,
} from "../Utils/service/initiateState";
import {
  GetBetBook,
  GetLiveUsers,
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

const User_BetMarket = () => {
  const { dispatch, store } = useAppContext();
  const [user_marketWithRunnerData, setUser_marketWithRunnerData] = useState(
    getMarketWithRunnerDataInitialState()
  );
  const { marketId, userName } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);
  const [nestedModalOpen, setNestedModalOpen] = useState(false);
  const [hierarchyData, setHierarchyData] = useState([]);
  const [userBookModalOpen, setUserBookModalOpen] = useState(false);
  const [betBookData, setBetBookData] = useState([]);
  const [bodyData, setBodyData] = useState(get_betBook());

  console.log("====>>> response from line 24", bodyData);

  // useEffect(()=>{fetch_BetBookData()},[bodyData])

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

  const handleClick_To_InnerHierarcy = async (id, role) => {
    console.log("role---id", id, role);

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
          className="card-header"
          style={{
            backgroundColor: "#7D7D7D",
            color: "#FFFFFF",
          }}
        >
          <h3 className="mb-0 fw-bold fs-5">User Bet Market</h3>
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
                      background: "#1D5E6C",
                    }}
                  >
                    <h4 className="m-0 text-white px-3 p-2">Featured</h4>
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
                        className="back-column text-center"
                        style={{
                          background: "#54A9EE",
                          fontSize: "20px",
                        }}
                      >
                        Back
                      </th>
                      <th
                        className="lay-column text-center"
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
                <div className="rounded-top" style={{ background: "#1D5E6C" }}>
                  <h4 className="card-header text-white fw-bold">
                    Live Streaming
                  </h4>
                </div>
                {/* Additional Cards */}
                <div className="card mt-3">
                  <h4
                    className="card-header text-white fw-bold rounded-top"
                    style={{ background: "#1D5E6C" }}
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
                    style={{ background: "#1D5E6C" }}
                  >
                    <h4 className="card-header text-white fw-bold">Book</h4>
                  </div>
                  <div className="card-body d-flex justify-content-center align-items-center">
                    <button
                      className="btn me-3 text-white fw-bolder px-5"
                      style={{ background: "#1D5E6C" }}
                      onClick={handleOpenModal}
                    >
                      Master Book
                    </button>
                    <button
                      className="btn text-white fw-bolder px-5"
                      style={{ background: "#1D5E6C" }}
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
                    style={{ background: "#1D5E6C" }}
                  >
                    {/* Live Bet Section */}
                    <h4 className="card-header text-white fw-bold py-3 mb-0 bg-transparent me-3">
                      Live Bet
                    </h4>
                    <div className="form-check form-switch mt-1 me-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="liveBetToggle1"
                        style={{ transform: "scale(1.5)" }}
                      />
                    </div>

                    {/* Partnership Book Section */}
                    <h4 className="card-header text-white fw-bold py-3 mb-0 bg-transparent me-3">
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
                    <h4 className="card-header text-white fw-bold py-3 mb-0 bg-transparent ms-auto">
                      View More
                    </h4>
                  </div>

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
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {betBookData?.length > 0 &&
                        betBookData[0].runnerBalance?.[0]?.runnerName}
                    </th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {betBookData?.length > 0 &&
                        betBookData[0].runnerBalance?.[1]?.runnerName}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {betBookData?.length > 0 ? (
                    betBookData.map((master, index) => {
                      // console.log("master====", master?.runnerBalance);
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
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {master?.runnerBalance?.[0]?.bal || 0}
                          </td>
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {master?.runnerBalance?.[1]?.bal || 0}
                          </td>
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
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {betBookData?.length > 0 &&
                        betBookData[0].runnerBalance?.[0]?.runnerName}
                    </th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {betBookData?.length > 0 &&
                        betBookData[0].runnerBalance?.[1]?.runnerName}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {betBookData?.length > 0 ? (
                    betBookData.map((master, index) => {
                      return (
                        <tr key={index}>
                          <td
                            style={{
                              border: "1px solid #ddd",
                              padding: "8px",
                            }}
                          >
                            {master?.userName}
                          </td>

                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            User
                          </td>
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {master?.runnerBalance?.[0]?.bal || 0}
                          </td>
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {master?.runnerBalance?.[1]?.bal || 0}
                          </td>
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
    </div>
  );
};

export default User_BetMarket;
