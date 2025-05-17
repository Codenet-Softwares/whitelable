import React, { useState, useEffect, useCallback } from "react";
import { getAllCreateState } from "../Utils/service/initiateState";
import { permissionObj } from "../Utils/constant/permission";
import { getAllCreate, viewBalance } from "../Utils/service/apiService";
import { useAppContext } from "../contextApi/context";
import Card from "../components/common/Card";
import Pagination from "../components/common/Pagination";
import CustomTransactionModal from "../modal/customTransactionModal";
import strings from "../Utils/constant/stringConstant";
import { debounce } from "lodash";
import FullScreenLoader from "../components/FullScreenLoader";
import { useNavigate } from "react-router-dom";

const Wallet = () => {
  const { dispatch, store } = useAppContext();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [walletCard, setWalletCard] = useState(getAllCreateState());
  const [modalShow, setModalShow] = useState(false);
  const [differentiate, setDifferentiate] = useState("");
  const [refresh, setRefresh] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [adminDelete, setAdminDelete] = useState("");
  const [navigationBar, setNavigationBar] = useState([
    { adminName: store?.admin?.adminName, adminId: store?.admin?.id },
  ]);
  const [userId, setUserId] = useState(store?.admin?.id);
  //  debounced search handler
  const debouncedGetAllCreate = useCallback(
    debounce((searchName) => {
      getAll_Create(searchName);
    }, 1500),
    []
  );
  console.log("navigationBar", navigationBar)
  const handleAdminNavigateToChild = (adminId, adminName) => {
    setUserId(adminId);
    setNavigationBar((prev) => [...prev, { adminId, adminName }]);
  };


  const handleBreadcrumbClick = (clickedAdminId) => {
    const index = navigationBar.findIndex(
      (entry) => entry.adminId === clickedAdminId
    );
    if (index !== -1) {
      const trimmed = navigationBar.slice(0, index + 1);
      setNavigationBar(trimmed);
      setUserId(clickedAdminId);
    }
  };


  const handleChange = (name, value) => {
    setWalletCard((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "name") {
      debouncedGetAllCreate(value);
    }
  };

  const handelOpenTransactionModal = (boolParam, differentiateParam) => {
    setModalShow(boolParam);
    setDifferentiate(differentiateParam);
  };
  const navigateToAddCash = () => {
    navigate("/View_AddCash_history");
  };

  useEffect(() => {
    if (store?.admin) {
      if (
        permissionObj.allAdmin.includes(store?.admin?.role) ||
        permissionObj.allSubAdmin.includes(store?.admin?.role)
      ) {
        getAll_Create();
      }
    }
  }, [
    store?.admin,
    walletCard.currentPage,
    walletCard.totalEntries,
    refresh,
    adminDelete,
    userId
  ]);

  useEffect(() => {
    if (store?.admin) {
      if (
        permissionObj.allAdmin.includes(store?.admin?.role) ||
        permissionObj.allSubAdmin.includes(store?.admin?.role)
      ) {
        view_Balance();
      }
    }
  }, [refresh]);

  async function getAll_Create(searchName = walletCard.name) {
    const response = await getAllCreate({
      _id: userId,
      pageNumber: walletCard.currentPage,
      dataLimit: walletCard.totalEntries,
      name: searchName,
    });

    if (response) {
      setWalletCard((prevData) => ({
        ...prevData,
        userList: response?.data,
        totalPages: response?.pagination?.totalPages,
        totalData: response?.pagination?.totalRecords,
      }));
      setIsLoading(false);
    }
  }

  async function view_Balance() {
    const response = await viewBalance({
      _id: store?.admin?.id,
    });

    if (response) {
      setBalance(response.data.balance);
    }
  }

  let startIndex = Math.min(
    (Number(walletCard.currentPage) - 1) * Number(walletCard.totalEntries) + 1
  );
  let endIndex = Math.min(
    Number(walletCard.currentPage) * Number(walletCard.totalEntries),
    Number(walletCard.totalData)
  );

  const handlePageChange = (page) => {
    handleChange("currentPage", page);
  };

  return (
    <div>
      <div className="row mt-5">
        <h2
          className="text-center font-weight-bold mb-4"
          style={{
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: "4px",
            color: "#1E2761",
            textDecoration: "underline",
          }}
        >
          USER LIST
        </h2>
      </div>
      <div className="text-center mt-10">
        <h5 className="fw-bold text-white" style={{ fontWeight: "bold" }}>
          Total Balance
        </h5>
        <h4
          className="mb-1 fw-bold btn"
          style={{ color: "#1E2761", background: "white" }}
        >
          ₹{balance}
        </h4>
        {store?.admin?.role &&
          store?.admin?.role.length > 0 &&
          store?.admin?.role === strings.superAdmin && (
            <div className="row">
              <div className="col-4"></div>
              <div className="col-4 ">
                <button
                  className="btn btn-danger "
                  aria-label="Close"
                  onClick={() =>
                    handelOpenTransactionModal(true, "addCashProvider")
                  }
                >
                  ADD CASH
                </button>
                <button
                  className="btn btn-success ms-2"
                  onClick={() => navigateToAddCash()}
                >
                  CASH HISTORY
                </button>
              </div>
              <div className="col-4"></div>
            </div>
          )}
      </div>
      <div class="row my-4 mx-2">
        <div class="col-lg-12">
          <div class="white_card card_height_100 mb_30 pt-4">
            <div class="white_card_body">
              <div className="d-flex align-items-center flex-wrap gap-2 my-2">
                {navigationBar.map((item, index) => {
                  const isLast = index === navigationBar.length - 1;
                  return (
                    <React.Fragment key={item.adminId}>
                      <span
                        role="button"
                        className={`text-decoration-none ${isLast ? 'text-primary' : 'text-black'}`}
                        style={{
                          fontSize: "20px",
                          cursor: "pointer",
                          fontWeight: isLast ? "bold" : "normal"
                        }}
                        onClick={() => handleBreadcrumbClick(item.adminId)}
                      >
                        {item.adminName}
                      </span>
                      {!isLast && (
                        <span className="text-muted mx-1">/</span>
                      )}
                    </React.Fragment>
                  );
                })}

              </div>
              <div class="QA_section">
                <div class="white_box_tittle list_header">
                  <div className="d-flex align-items-center">
                    {/* <span className="me-3" >
                      {store?.admin?.
                        adminName === navigationBar[navigationBar.length - 1]?.adminName &&
                      <button className="btn btn-secondary">&#8592;</button>
                      }
                    </span> */}
                    {/* <h4
                      className="fw-bolder text-uppercase"
                      style={{ color: "#1E2761" }}
                    >
                      User List
                    </h4> */}
                  </div>
                  <div class="box_right d-flex lms_block gap-5">
                    <select
                      class="form-select form-select-sm w-25"
                      aria-label=".form-select-sm example"
                      onChange={(e) => handleChange("totalEntries", e.target.value)}
                      value={walletCard.totalEntries}
                    >
                      <option selected value="5">
                        Show 5 entries
                      </option>
                      <option value="10">10 entries</option>
                      <option value="15">15 entries</option>
                      <option value="25">25 entries</option>
                      <option value="50">50 entries</option>
                      <option value="75">75 entries</option>
                    </select>
                    <div class="serach_field_2">
                      <div class="search_inner">
                        <form Active="#">
                          <div class="search_field">
                            <input
                              type="text"
                              placeholder="Search content here..."
                              value={walletCard.name}
                              onChange={(e) => {
                                handleChange("name", e.target.value);
                              }}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault(); // Prevent default behavior
                                  debouncedGetAllCreate(walletCard.name); // Call the search function
                                }
                              }}
                            />
                          </div>
                          <button type="submit">
                            {' '}
                            <i class="ti-search"></i>{' '}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="QA_table mb_30">
                  {isLoading ? (<div className='text-center'>Loading...</div>) : walletCard?.userList?.length > 0 ? (
                    <>
                      {' '}
                      <table class="table lms_table_active table-bordered table-striped">
                        <thead
                          style={{
                            height: "10px",
                            backgroundColor: "#1E2761",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          <tr>
                            <th
                              scope="col"
                              className="text-bolder fs-6 text-uppercase"
                              style={{ fontWeight: "bold", color: "white" }}
                            >
                              Username
                            </th>
                            <th
                              scope="col"
                              className="text-bolder fs-6 text-center text-uppercase"
                              style={{ fontWeight: "bold", color: "white" }}
                            >
                              Credit Ref.
                            </th>
                            <th
                              scope="col"
                              className="text-bolder fs-6 text-center text-uppercase"
                              style={{ fontWeight: "bold", color: "white" }}
                            >
                              Partnership
                            </th>
                            <th
                              scope="col"
                              className="text-bolder fs-6 text-center text-uppercase"
                              style={{ fontWeight: "bold", color: "white" }}
                            >
                              Balance
                            </th>
                            <th
                              scope="col"
                              className="text-bolder fs-6 text-center text-uppercase"
                              style={{ fontWeight: "bold", color: "white" }}
                            >
                              Exposure
                            </th>
                            <th
                              scope="col"
                              className="text-bolder fs-6 text-center text-uppercase"
                              style={{ fontWeight: "bold", color: "white" }}
                            >
                              Avail. Bal.
                            </th>
                            <th
                              scope="col"
                              className="text-bolder fs-6 text-center text-uppercase"
                              style={{ fontWeight: "bold", color: "white" }}
                            >
                              Ref. P/L
                            </th>
                            <th
                              scope="col"
                              className="text-bolder fs-6 text-center text-uppercase"
                              style={{ fontWeight: "bold", color: "white" }}
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="text-bolder fs-6 text-center text-uppercase"
                              style={{ fontWeight: "bold", color: "white" }}
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        {walletCard?.userList?.map((data, i) => {
                          // const creditRefLength = data.creditRef.length;
                          // const partnershipLength = data.partnership.length;
                          return (
                            <Card
                              key={data.id}
                              userName={data.userName}
                              role={data.role}
                              creditRef={data?.creditRefs}
                              balance={data.balance}
                              loadBalance={data.loadBalance}
                              refProfitLoss={data.refProfitLoss}
                              adminId={data.adminId}
                              userId={data.adminId} // pending for decision TOM
                              exposure={data.exposure}
                              partnership={
                                data?.partnerships
                              }
                              Status={data.status}
                              setRefresh={setRefresh}
                              adminDelete={setAdminDelete}
                              setIsLoading={setIsLoading}
                              adminBalance={balance}
                              handleAdminNavigateToChild={handleAdminNavigateToChild}
                              navigationBar={navigationBar}
                            />
                          );
                        })}
                      </table>
                      <Pagination
                        currentPage={walletCard.currentPage}
                        totalPages={walletCard.totalPages}
                        handlePageChange={handlePageChange}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        totalData={walletCard.totalData}
                      />
                    </>
                  ) : (
                    <div className="alert text-dark bg-light" role="alert">
                      <div className="alert-text d-flex justify-content-center">
                        <b> &#128680; No Data Found !! </b>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CustomTransactionModal
        balance={balance}
        show={modalShow}
        onHide={() => setModalShow(false)}
        message="Hi this is msg"
        differentiate={differentiate}
        setRefresh={setRefresh}
      />
    </div>
  );
};

export default Wallet;
