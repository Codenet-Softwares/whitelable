import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../contextApi/context";
import CustomTransactionModal from "../../modal/customTransactionModal";
import ViewPartnershipAndCreditRefModal from "../../modal/viewPartnershipAndCreditRefModal";
import StatusModal from "../../modal/StatusModal";
import { moveToTrash_api } from "../../Utils/service/apiService";
import strings from "../../Utils/constant/stringConstant";
import { permissionObj } from "../../Utils/constant/permission";
import { toast } from "react-toastify";
import { hasPermission } from "../../Utils/helper";

const Card = ({
  role,
  adminId,
  userName,
  creditRef,
  balance,
  loadBalance,
  partnership,
  Status,
  setRefresh,
  adminDelete,
  setIsLoading,
  exposure,
  adminBalance,
  handleAdminNavigateToChild,
  navigationBar
}) => {
  const navigate = useNavigate();
  const { store } = useAppContext();
  const [transactionModalShow, setTransactionModalShow] = useState(false);
  const [viewModalShow, setViewModalShow] = useState(false);
  const [differentiate, setDifferentiate] = useState("");
  const [adminIdForStatus, setAdminIdForStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [clientBalance, setClientBalance] = useState(null);

  const handelOpenTransactionModal = (
    boolParam,
    differentiateParam,
    balance
  ) => {
    setTransactionModalShow(boolParam);
    setDifferentiate(differentiateParam);
    setClientBalance(balance);
  };

  const handleClose = (adminId) => setShowModal(false);

  const handleStatusModalShow = (adminId) => {
    setShowModal(true);
    setAdminIdForStatus(adminId);
  };

  async function handleDelete() {
    const userConfirmed = window.confirm(
      "Balance should be 0 to move the Admin User to trash"
    );

    if (userConfirmed) {
      const response = await moveToTrash_api({ requestId: adminId });
      if (response) {
        adminDelete(response);
        toast.info(response.message);
      }
    }
  }

  const handelOpenViewModal = (boolParam, differentiateParam) => {
    setViewModalShow(boolParam);

    setDifferentiate(differentiateParam);
  };

  const takeMeToAccount = (userName) => {
    navigate(`/account-landing/${userName}/statement`);
  };
  return (
    <React.Fragment>
      <tbody>
        <tr>
          <th scope="row" className="">
            <button
              className="border border-1 text-center rounded-pill fw-bold p-1 text-uppercase"
              style={{ cursor: "auto", background: "#F5C93A", width: "90px" }}
            >
              {role}
            </button>

            <p
              className="fw-bold text-dark text-uppercase"
              onClick={() =>
                role === "user"
                  ? ""
                  : handleAdminNavigateToChild(adminId, userName)
              }
              style={{ cursor: "pointer" }}
            >
              <b>{userName}</b>
            </p>
          </th>

          <td scope="row" className="fs-6 text-center">
            <span>{creditRef}</span>

            {navigationBar.length === 1 ? (
              <span className="">
                <button
                  className={`border border-0  btn ${hasPermission(strings.creditRefEdit, store)}`}
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
                className={`border border-0 btn ${hasPermission(strings.creditRefView, store)}`}
                onClick={() => handelOpenViewModal(true, "creditRefViewer")}
              >
                <i className="fa-regular fa-eye" aria-label="Close"></i>
              </button>
            </span>
          </td>

          <td scope="row" className="fs-6 text-center">
            <span>{partnership}</span>

            {navigationBar.length === 1 ? (
              <span className="">
                <button
                  className={`border border-0  btn ${hasPermission(strings.partnershipEdit, store)}`}
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
                className={`border border-0 btn ${hasPermission(strings.partnershipEdit, store)}`}
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
            (
            {Number(exposure) % 1 === 0
              ? Number(exposure)
              : Number(exposure).toFixed(2)}
            )
          </td>
          <td scope="row" className="fs-6 text-center">
            {balance}
          </td>
          <td
            scope="row"
            className={`fs-6 text-center ${loadBalance - creditRef < 0 ? "text-danger" : "text-dark"
              }`}
          >
            {isNaN(creditRef - loadBalance)
              ? loadBalance
              : loadBalance - creditRef}
          </td>
          <td scope="row" className="fs-6 text-center">
            <p
              className={`border border-1 w-75 text-center rounded-pill ${Status === "Active"
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
            {navigationBar.length === 1 ? (
              <>
                {" "}
                <span className="mx-1">
                  <button
                    className={`btn border border-1 rounded ${hasPermission(strings.transferBalance, store)}`}
                    onClick={() =>
                      handelOpenTransactionModal(
                        true,
                        "walletAmountProvider",
                        balance
                      )
                    }
                    style={{ background: "#84B9DF" }}
                    title="Addmoney"
                  >
                    <i className="fa-solid fa-circle-dollar-to-slot"></i>
                  </button>
                </span>
                <span className="mx-1">
                  <button
                    className={`btn border border-2 rounded ${hasPermission(strings.status, store)}`}
                    style={{ background: "#25F1F7" }}
                    title="Setting"
                    type="button"
                    onClick={() => handleStatusModalShow(adminId)}
                  >
                    <i className="fa-thin fas fa-gear"></i>
                  </button>
                </span>
              </>
            ) : null}

            <span className="mx-1">
              <button
                className={`btn border border-2 rounded ${hasPermission(strings.profileView, store)}`}
                style={{ background: "#F5C93A" }}
                title="Profile"
                onClick={() => takeMeToAccount(userName)}
              >
                <i className="fa-solid fa-user"></i>
              </button>
            </span>
            {navigationBar.length === 1 ? (
              <span className="mx-1">
                <button
                  className={`btn border border-2 rounded  ${hasPermission(strings.deleteAdmin, store)}`}
                  style={{ background: "#ED5E68" }}
                  title="Delete"
                  onClick={(e) => handleDelete()}
                >
                  <i className="fa-light fas fa-trash"></i>
                </button>
              </span>
            ) : null}

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
        clientBalance={clientBalance}
        adminBalance={adminBalance}
      />
      {adminId != undefined && viewModalShow && (
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
