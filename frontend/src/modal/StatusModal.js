import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { activeInactiveInitialState } from "../Utils/service/initiateState";
import { StatusChange } from "../Utils/service/apiService";
import { toast } from "react-toastify";
import { customErrorHandler } from "../Utils/helper";

const StatusModal = ({
  show,
  handleClose,
  name,
  userRole,
  Status,
  adminIdForStatus,
  setRefresh,
}) => {
  const [state, setState] = useState(activeInactiveInitialState());

  // Set modal state based on Status when it opens
  useEffect(() => {
    if (show) {
      if (Status === "Active") {
        setState({ ...activeInactiveInitialState(), active: true, lock: true });
      } else if (Status === "Suspended") {
        setState({
          ...activeInactiveInitialState(),
          active: false,
          lock: true,
        });
      } else if (Status === "Locked") {
        setState({
          ...activeInactiveInitialState(),
          active: false,
          lock: false,
        });
      }
    }
  }, [Status, show]);

  const handleActiveChange = () => {
    setState((prevState) => ({
      ...prevState,
      active: true,
      lock: true,
      isClicked: true,
      btncolor1: true,
      btncolor2: false,
      btncolor3: false,
    }));
  };

  const handleInactiveChange = () => {
    setState((prevState) => ({
      ...prevState,
      active: false,
      lock: true,
      isClicked: true,
      btncolor2: true,
      btncolor1: false,
      btncolor3: false,
    }));
  };

  const handleLockChange = () => {
    setState((prevState) => ({
      ...prevState,
      active: false,
      lock: false,
      isClicked: true,
      btncolor3: true,
      btncolor1: false,
      btncolor2: false,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedPassword = state.password.trim(); // Trim password input
    if (!trimmedPassword) {
      toast.error("Password is required");
      return;
    }

    if (state.isClicked) {
      try {
        const response = await StatusChange(
          {
            id: adminIdForStatus,
            isActive: state.active,
            locked: state.lock,
            password: trimmedPassword,
          },
          true
        );

        if (response) {
          setRefresh(response);
          handleClose(); // Close the modal after successful update
          toast.success(response.message);
        }
      } catch (error) {
        toast.error(customErrorHandler(error));
      }
    } else {
      toast.error("Please select a status to continue");
    }
  };

  // Cleanup the state when modal closes
  const handleModalClose = () => {
    setState(activeInactiveInitialState());
    handleClose();
  };

  return (
    <Modal
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      show={show}
      onHide={handleModalClose}
      centered
    >
      <Modal.Header
        style={{
          height: "5px",
          backgroundColor: "#006699",
          color: "white",
        }}
        closeButton
      >
        <Modal.Title className="fs-6">CHANGE STATUS</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex justify-content-between mb-3">
          <div>
            <span style={{ fontWeight: "bold" }}>{userRole}</span>
            <br />
            <span>{name}</span>
          </div>
          <span style={{ fontWeight: "bold" }}>{Status}</span>
        </div>
        <div className="modal-body d-flex justify-content-between">
          <Button
            variant={state.btncolor1 ? "success" : "outline-success"}
            disabled={Status === "Active"}
            onClick={handleActiveChange}
            style={{ width: "33.33%", marginRight: "2%" }}
          >
            <i className="fas fa-check-circle mb-1" /> <br />
            <span>Active</span>
          </Button>
          <Button
            variant={state.btncolor2 ? "danger" : "outline-danger"}
            disabled={Status === "Suspended" || Status === "Locked"}
            onClick={handleInactiveChange}
            style={{ width: "calc(33.33% - 6px)" }}
          >
            <i className="fas fa-ban mb-1" /> <br />
            <span>Suspended</span>
          </Button>
          <Button
            variant={state.btncolor3 ? "secondary" : "outline-secondary"}
            disabled={Status === "Locked"}
            onClick={handleLockChange}
            style={{ width: "calc(33.33% - 8px)" }}
          >
            <i className="fas fa-lock mb-1" /> <br />
            <span>Lock</span>
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <input
          type="password"
          className="form-control mr-2"
          placeholder="Enter Password"
          value={state.password}
          onChange={(e) =>
            setState((prevState) => ({
              ...prevState,
              password: e.target.value,
            }))
          }
          style={{ width: "40%" }}
        />
        <Button
          variant="primary"
          onClick={handleSubmit}
          style={{ width: "50%" }}
        >
          Change
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StatusModal;
