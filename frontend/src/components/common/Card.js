import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../contextApi/context";
import CustomTransactionModal from "../../modal/customTransactionModal";
import ViewPartnershipAndCreditRefModal from "../../modal/viewPartnershipAndCreditRefModal";
import {
  getHierarchy,
  getPartnershipLog,
} from "../../Utils/service/apiService";
import StatusModal from "../../modal/StatusModal";
import { moveToTrash_api } from "../../Utils/service/apiService";
import Button from "react-bootstrap/Button";
import strings from "../../Utils/constant/stringConstant";
import { permissionObj } from "../../Utils/constant/permission";
import { toast } from "react-toastify";

const Card = ({
  role,
  adminId,
  userName,
  statusId,
  creditRef,
  balance,
  loadBalance,
  refProfitLoss,
  partnership,
  Status,
  creditRefLength,
  partnershipLength,
  callingParent,
  setRefresh,
  adminDelete,
  setIsLoading,
  exposure,
}) => {
  console.log("userrole ======>>>> ", role, userName);

  const navigate = useNavigate();
  const { dispatch, store } = useAppContext();
  const [transactionModalShow, setTransactionModalShow] = useState(false);
  const [viewModalShow, setViewModalShow] = useState(false);
  const [differentiate, setDifferentiate] = useState("");
  const [adminIdForStatus, setAdminIdForStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  console.log("userId", adminId);
  console.log("name&role", userName, role);

  console.log("store", store);

  const handelOpenTransactionModal = (boolParam, differentiateParam) => {
    setTransactionModalShow(boolParam);
    setDifferentiate(differentiateParam);
  };

  const handleClose = (adminId) => setShowModal(false);

  const handleStatusModalShow = (adminId) => {
    setShowModal(true);
    setAdminIdForStatus(adminId);
  };

  const handleStatusChange = (status) => {
    console.log("Status changed to:", status);
  };

  async function handleDelete() {
    console.log("======>>>> onclick the id", adminId);
    const userConfirmed = window.confirm(
      "Balance should be 0 to move the Admin User to trash"
    );

    if (userConfirmed) {
      const response = await moveToTrash_api({ requestId: adminId });
      console.log("Im here in line 94");
      if (response) {
        console.log(response);
        adminDelete(response);
        toast.info(response.message);
      }
    }
  }

  const handelOpenViewModal = (boolParam, differentiateParam) => {
    setViewModalShow(boolParam);

    setDifferentiate(differentiateParam);
  };
  let action = "";
  async function takeMeToHierarchy(userName) {
    if (role !== "user") {
      if (callingParent === "HierarchyPageView") {
        action = "store";
      } else {
        action = "clearAll";
      }

      const response = await getHierarchy({
        adminName: userName,
        action: action,
      });
      if (response.successCode) {
        console.log("response", response);
        navigate(`/hierarchyView/${userName}`);
      }
    }
  }

  const handleStatus = () => {
    // Any additional logic for handling status button click
  };

  const isAdminOrPartnerView =
    store?.admin?.roles[0].permission.some(
      (role) => role === strings.partnershipView
    ) || permissionObj.allAdmin.includes(store?.admin?.roles[0].role);

  const takeMeToAccount = (userName) => {
    navigate(`/account-landing/${userName}`);
  };
  return (
    <React.Fragment>
      <tbody>
        <tr>
          <th scope="row" className="">
            <button
              className="border border-1 w-75 text-center bg-success rounded-pill "
              // data-bs-toggle="modal"
              // data-bs-target={`#hierarchyview-${userId}`}
              style={{ cursor: "auto" }}
            >
              {role}
            </button>

            <p
              onClick={() => {
                takeMeToHierarchy(userName);
              }}
              style={{ cursor: "pointer" }}
            >
              <b>{userName}</b>
            </p>
          </th>

          <td scope="row" className="fs-6 text-center">
            {creditRefLength > 0 ? (
              //Need to hit Txn Modal
              <span
                onClick={() =>
                  handelOpenTransactionModal(true, "creditRefProvider")
                }
              >
                {creditRef}
              </span>
            ) : (
              //Need to hit Txn Modal
              <span
                onClick={() =>
                  handelOpenTransactionModal(true, "creditRefProvider")
                }
              >
                0
              </span>
            )}
            {callingParent === "Wallet" ? (
              <span className="">
                <button
                  className={`border border-0 bg-white btn ${
                    ["suspended"].includes(store?.admin?.status)
                      ? "disabled"
                      : store?.admin?.roles[0].permission.some(
                          (role) => role === strings.creditRefEdit
                        )
                      ? ""
                      : permissionObj.allAdmin.includes(
                          store?.admin?.roles[0].role
                        )
                      ? ""
                      : "disabled"
                  }`}
                  aria-label="Close"
                  onClick={() =>
                    handelOpenTransactionModal(true, "creditRefProvider")
                  }
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
              </span>
            ) : null}

            <span>
              <button
                className={`border border-0 bg-white btn ${
                  ["suspended"].includes(store?.admin?.status)
                    ? "disabled"
                    : store?.admin?.roles[0].permission.some(
                        (role) => role === strings.creditRefView
                      )
                    ? ""
                    : permissionObj.allAdmin.includes(
                        store?.admin?.roles[0].role
                      )
                    ? ""
                    : "disabled"
                }`}
                onClick={() => handelOpenViewModal(true, "creditRefViewer")}
              >
                <i class="fa-regular fa-eye" aria-label="Close"></i>
              </button>
            </span>
          </td>

          <td scope="row" className="fs-6 text-center">
            {partnershipLength > 0 ? (
              <span
              //Need to hit Txn Modal
              >
                {partnership}
              </span>
            ) : (
              <span
              //Need to hit Txn Modal
              >
                0
              </span>
            )}

            {callingParent === "Wallet" ? (
              <span className="">
                <button
                  className={`border border-0 bg-white btn ${
                    ["suspended"].includes(store?.admin?.status)
                      ? "disabled"
                      : store?.admin?.roles[0].permission.some(
                          (role) => role === strings.partnershipEdit
                        )
                      ? ""
                      : permissionObj.allAdmin.includes(
                          store?.admin?.roles[0].role
                        )
                      ? ""
                      : "disabled"
                  }`}
                >
                  <i
                    className="fa-solid fa-pen-to-square"
                    aria-label="Close"
                    onClick={() =>
                      handelOpenTransactionModal(true, "partnershipProvider")
                    }
                  ></i>
                </button>
              </span>
            ) : null}

            <span>
              <button
                className={`border border-0 bg-white btn ${
                  ["suspended"].includes(store?.admin?.status)
                    ? "disabled"
                    : store?.admin?.roles[0].permission.some(
                        (role) => role === strings.partnershipEdit
                      )
                    ? ""
                    : permissionObj.allAdmin.includes(
                        store?.admin?.roles[0].role
                      )
                    ? ""
                    : "disabled"
                }`}
                onClick={() => handelOpenViewModal(true, "partnershipViewer")}
              >
                <i className="fa-regular fa-eye"></i>
              </button>
            </span>
          </td>

          <td scope="row" className="fs-6 text-center">
            {loadBalance}
          </td>
          <td scope="row" className="fs-6 text-center text-danger">
          ({exposure}) 
          </td>
          <td scope="row" className="fs-6 text-center">
            {balance}
          </td>
          <td
            scope="row"
            className={`fs-6 text-center ${
              loadBalance - creditRef < 0 ? "text-danger" : "text-dark"
            }`}
          >
            {isNaN(loadBalance - creditRef) ? balance : loadBalance - creditRef}
          </td>
          <td scope="row" className="fs-6 text-center">
            <p
              className={`border border-1 w-75 text-center rounded-pill ${
                Status === "Active"
                  ? "bg-success"
                  : Status === "Suspended"
                  ? "bg-danger"
                  : "bg-secondary"
              }`}
            >
              {Status}
            </p>
          </td>
          <td scope="row" className="fs-6 text-center">
            {callingParent === "Wallet" ? (
              <>
                {" "}
                <span
                  className="mx-1"
                  onClick={() =>
                    handelOpenTransactionModal(true, "walletAmountProvider")
                  }
                >
                  <button
                    className={`btn border border-2 rounded ${
                      ["suspended"].includes(store?.admin?.status)
                        ? "disabled"
                        : store?.admin?.roles[0].permission.some(
                            (role) => role === strings.transferBalance
                          )
                        ? ""
                        : permissionObj.allAdmin.includes(
                            store?.admin?.roles[0].role
                          )
                        ? ""
                        : "disabled"
                    }`}
                    title="Addmoney"
                  >
                    <i class="fa-solid fa-circle-dollar-to-slot"></i>
                  </button>
                </span>
                <span className="mx-1">
                  <button
                    className={`btn border border-2 rounded ${
                      ["suspended"].includes(store?.admin?.status)
                        ? "disabled"
                        : store?.admin?.roles[0].permission.some(
                            (role) => role === strings.status
                          )
                        ? ""
                        : permissionObj.allAdmin.includes(
                            store?.admin?.roles[0].role
                          )
                        ? ""
                        : "disabled"
                    }`}
                    title="Setting"
                    type="button"
                    onClick={() => handleStatusModalShow(adminId)}
                  >
                    {console.log("====a===s", adminId)}
                    <i className="fa-thin fas fa-gear"></i>
                  </button>
                </span>
              </>
            ) : null}

            <span className="mx-1">
              <button
                className={`btn border border-2 rounded ${
                  store?.admin?.roles[0].permission.some(
                    (role) => role === strings.profileView
                  )
                    ? ""
                    : permissionObj.allAdmin.includes(
                        store?.admin?.roles[0].role
                      )
                    ? ""
                    : "disabled"
                }`}
                title="Profile"
                onClick={() => {
                  takeMeToAccount(userName);
                }}
              >
                <i class="fa-solid fa-user"></i>
              </button>
            </span>
            {callingParent === "Wallet" ? (
              <span className="mx-1">
                <button
                  className={`btn border border-2 rounded ${
                    ["suspended"].includes(store?.admin?.status)
                      ? "disabled"
                      : store?.admin?.roles[0].permission.some(
                          (role) => role === strings.deleteAdmin
                        )
                      ? ""
                      : permissionObj.allAdmin.includes(
                          store?.admin?.roles[0].role
                        )
                      ? ""
                      : "disabled"
                  }`}
                  title="Delete"
                  onClick={(e) => {
                    handleDelete();
                  }}
                >
                  <i class="fa-light fas fa-trash"></i>
                </button>
              </span>
            ) : null}

            {/* <span className="mx-1">
              <button className="btn border border-2 rounded" title="Wallet">
                <i class="fa-regular fas fa-wallet"></i>
              </button>
            </span> */}
          </td>
        </tr>
      </tbody>
      <CustomTransactionModal
        show={transactionModalShow}
        onHide={() => setTransactionModalShow(false)}
        message="Hi this is msg"
        differentiate={differentiate}
        adminId={adminId}
        adminName={userName}
        role={role}
        setRefresh={setRefresh}
        setIsLoading={setIsLoading}
      />
      {adminId != undefined && (
        <ViewPartnershipAndCreditRefModal
          show={viewModalShow}
          onHide={() => setViewModalShow(false)}
          message="Hi this is msg"
          differentiate={differentiate}
          adminId={adminId}
          adminName={userName}
          role={role}
        />
      )}
      <StatusModal
        show={showModal}
        handleClose={handleClose}
        name={role}
        userRole={userName}
        Status={Status}
        adminIdForStatus={adminIdForStatus}
        setRefresh={setRefresh}
      />
    </React.Fragment>
  );
};

export default Card;
