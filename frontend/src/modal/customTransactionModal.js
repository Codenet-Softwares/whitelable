import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";
import {
  addCash,
  transferAmount,
  updateCreditRef,
  updatePartnership,
} from "../Utils/service/apiService";
import { useAppContext } from "../contextApi/context";
import { toast } from "react-toastify";
const CustomTransactionModal = (props) => {
  const { setIsLoading } = props;
  const [formData, setFormData] = useState({
    amount: null,
    password: "",
    remarks: "",
  });
  const { store, showLoader, hideLoader } = useAppContext();
  console.log("=====>>> line 21", store);

  // Setting Modal Title
  let modalTitle = "";
  if (props.differentiate === "creditRefProvider") {
    modalTitle = "Provide Edit Credit ref. Amount";
  } else if (props.differentiate === "partnershipProvider") {
    modalTitle = "Provide Edit PartnerShip Amount";
  } else if (props.differentiate === "walletAmountProvider") {
    modalTitle = (
      <>
        Provide Transfer Amount
        <span className="text-info fw-bold ms-2">
          | Balance {store.admin.adminName}:{" "}
          <span className="bg-success text-dark px-2 py-0.5 rounded">
            {store.admin.AdminWallet}
          </span>
        </span>
      </>
    );
  } else if (props.differentiate === "addCashProvider") {
    modalTitle = "Add Cash";
  }

  const resetForm = () => {
    setFormData({
      amount: 0,
      password: "",
      remarks: "",
    });
  };
  // API Hitting for creditRef and Partnership provider
  async function handelSave() {
    switch (props.differentiate) {
      case "creditRefProvider":
        if (
          formData.amount >= 0 &&
          formData.password !== "" &&
          formData.amount !== null
        ) {
          const creditRefData = {
            creditRef: formData.amount,
            password: formData.password,
          };
          showLoader(); // Show loader before starting the async operation
          setIsLoading(true);
          const creditRefResponse = await updateCreditRef(
            {
              id: props?.adminId,
              data: creditRefData,
            },
            true
          );
          if (creditRefResponse) {
            props.onHide();
            resetForm();
            props.setRefresh(creditRefResponse);
          }
          hideLoader(); // Hide loader once the async operation is complete
          setIsLoading(false);
          break;
        } else {
          toast.info(
            "Fields cannot be empty or Negative. Please fill in all required fields."
          );
          break;
        }

      case "partnershipProvider":
        if (
          formData.amount >= 0 &&
          formData.password !== "" &&
          formData.amount !== null
        ) {
          const partnershipData = {
            partnership: formData.amount,
            password: formData.password,
          };
          showLoader(); // Show loader before starting the async operation
          setIsLoading(true);
          const partnershipResponse = await updatePartnership(
            {
              id: props?.adminId,
              data: partnershipData,
            },
            true
          );
          if (partnershipResponse) {
            props.onHide();
            resetForm();
            props.setRefresh(partnershipResponse);
          }
          hideLoader(); // Hide loader once the async operation is complete
          setIsLoading(false);
          break;
        } else {
          toast.info(
            "Fields cannot be empty or Negative. Please fill in all required fields."
          );
          break;
        }
      case "addCashProvider":
        if (formData.amount > 0) {
          const addCashData = {
            amount: formData.amount,
          };

          const addCashResponse = await addCash(
            {
              adminId: store.admin.id,
              data: addCashData,
            },
            true
          );
          if (addCashResponse) {
            props.onHide();
            resetForm();
            props.setRefresh(addCashResponse);
          }

          break;
        } else {
          toast.info(
            "Fields cannot be empty or Negative. Please fill in all required fields."
          );
          break;
        }

      default:
    }
  }
  // API Hitting for Wallet provider
  async function handelDepositAndWithdraw(modeOfTransaction) {
    if (modeOfTransaction === "Withdraw") {
      const WithdrawData = {
        withdrawalAmt: formData.amount,
        password: formData.password,
        remarks: formData.remarks,
        receiveUserId: props?.adminId,
      };

      setIsLoading(true);
      showLoader(); // Show loader before starting the async operation
      const creditRefResponse = await transferAmount(
        {
          adminId: store.admin.id,
          data: WithdrawData,
        },
        true
      );
      if (creditRefResponse) {
        props.onHide();
        resetForm();
        props.setRefresh(creditRefResponse);
      }
      hideLoader(); // Hide loader once the async operation is complete
      setIsLoading(false);
    } else {
      const DepositData = {
        transferAmount: formData.amount,
        password: formData.password,
        remarks: formData.remarks,
        receiveUserId: props?.adminId,
      };
      setIsLoading(true);
      showLoader(); // Show loader before starting the async operation
      const creditRefResponse = await transferAmount(
        {
          adminId: store.admin.id,
          data: DepositData,
        },
        true
      );
      if (creditRefResponse) {
        props.onHide();
        resetForm();
        props.setRefresh(creditRefResponse);
      }
      hideLoader(); // Hide loader once the async operation is complete
      setIsLoading(false);
    }
  }

  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header
        closeButton
        style={{
          height: "5px",
          backgroundColor: "#006699",
          color: "white",
        }}
      >
        <Modal.Title className="fs-6">{modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="my-2">
          {props?.differentiate !== "addCashProvider" ? (
            <React.Fragment>
              <span
                style={{
                  background: "#F5C93A",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "50px",
                  fontWeight: "bold",
                  fontSize: "14px",
                  display: "inline-block",
                  minWidth: "100px",
                  textAlign: "center",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                {props?.role}
              </span>
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "16px",
                  fontWeight: "600",
                  marginLeft: "10px",
                  color: "#333",
                  letterSpacing: "0.5px",
                  display: "inline-block",
                }}
              >
                {props?.adminName}
              </span>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Alert variant="primary">
                Transaction By — {store.admin.adminName}
              </Alert>
            </React.Fragment>
          )}
        </div>
        <form>
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text">Enter Amount</span>
            </div>
            <input
              type="number"
              className="form-control"
              placeholder="Amount *"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: Number(e.target.value),
                })
              }
            />
          </div>
          {props.differentiate === "walletAmountProvider" ? (
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Remarks"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  remarks: e.target.value,
                })
              }
            />
          ) : null}
          {props?.differentiate !== "addCashProvider" ? (
            <input
              type="password"
              className="form-control"
              placeholder="Password *"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }
            />
          ) : null}
        </form>
      </Modal.Body>
      <Modal.Footer>
        {props.differentiate !== "walletAmountProvider" ? (
          <>
            <Button onClick={props?.onHide} variant="secondary">
              Close
            </Button>
            <Button onClick={handelSave}>Save</Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => handelDepositAndWithdraw("Deposit")}
              variant="success"
            >
              Deposit
            </Button>
            <Button
              onClick={() => handelDepositAndWithdraw("Withdraw")}
              variant="danger"
            >
              Withdraw
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CustomTransactionModal;
