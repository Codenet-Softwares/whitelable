import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useAppContext } from "../contextApi/context";
import {
  getCreditRefLog,
  getPartnershipLog,
} from "../Utils/service/apiService";
import { getCreditRefAndPartnership } from "../Utils/service/initiateState";

const ViewPartnershipAndCreditRefModal = (props) => {
  console.log("from modal=>>>>", props?.differentiate);
  console.log("from modal adminId=>>>>", props?.adminId);
  console.log("from modal adminName=>>>>", props?.adminName);
  const [viewPartnershipData, SetViewPartnershipData] = useState(
    getCreditRefAndPartnership()
  );
  const [viewCreditRefData, SetViewCreditRefData] = useState(
    getCreditRefAndPartnership()
  );
  const { store } = useAppContext();
  let modalTitle = "";
  if (props.differentiate === "creditRefViewer") {
    modalTitle = "CreditRef Balance Log";
  } else {
    modalTitle = "PartnerShip Log";
  }
  async function getCreditRefData() {
    const response = await getCreditRefLog({
      id: props?.adminId,
    });

    if (response) {
      console.log(response);
      SetViewCreditRefData(response.data.creditRefs);
    }
  }

  async function getPartnershipData() {
    const response = await getPartnershipLog({
      id: props?.adminId,
    });

    if (response) {
      console.log(response);
      SetViewPartnershipData(response.data.partnerships);
    }
  }

  useEffect(() => {
    getCreditRefData();
    getPartnershipData();
  }, [props.differentiate]);

  // Commented for developer purpose
  // const handelHi = () => {
  //   console.log('viewCreditRefData', getCreditRefData());
  // };

  return (
    <Modal {...props} aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter" className="fs-6">
          {modalTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6>UserName: {props?.adminName}</h6>
        {props?.differentiate === "creditRefViewer" ? (
          <React.Fragment>
            {viewCreditRefData.length > 0 ? (
              <table className="table lms_table_active3 table-bordered table-sm">
                <thead>
                  <tr>
                    <th>Sl. No.</th>
                    <th>Date</th>
                    <th>Credit Ref. Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {viewCreditRefData.map((data, i) => {
                    const originalDate = new Date(data?.date);
                    const options = {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    };

                    const formattedDate = originalDate.toLocaleDateString(
                      "en-US",
                      options
                    );
                    return (
                      <tr key={data._id}>
                        <td>{i + 1}</td>

                        <td>{formattedDate}</td>
                        <td>{data.value}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <h3 className="text-center">No Data Found</h3>
            )}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {viewPartnershipData.length > 0 ? (
              <table className="table lms_table_active3 table-bordered table-sm">
                <thead>
                  <tr>
                    <th>Sl. No.</th>
                    <th>Date</th>
                    <th>Credit Ref. Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {viewPartnershipData.map((data, i) => {
                    const originalDate = new Date(data?.date);
                    const options = {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    };

                    const formattedDate = originalDate.toLocaleDateString(
                      "en-US",
                      options
                    );
                    return (
                      <tr key={data._id}>
                        <td>{i + 1}</td>

                        <td>{formattedDate}</td>
                        <td>{data.value}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <h3 className="text-center">No Data Found</h3>
            )}
          </React.Fragment>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewPartnershipAndCreditRefModal;
