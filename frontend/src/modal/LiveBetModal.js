import React, { useState } from "react";
import { Modal, Button, Table, Form } from "react-bootstrap";

const LiveBetModal = ({ show, handleClose, user_LiveBet }) => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(user_LiveBet.length / entriesPerPage);

  const paginatedData = user_LiveBet.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );
  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-uppercase fw-bold text-primary">
          View All Live Data
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-between mb-3">
          <Form.Group>
            <Form.Label className="fw-bold">Show Entries:</Form.Label>
            <Form.Select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Control type="text" placeholder="Search..." />
          </Form.Group>
        </div>
        <Table bordered hover responsive>
          <thead className="table-dark text-center">
            <tr>
              <th>Market Name</th>
              <th>Odds</th>
              <th>Stake</th>
              <th>Username</th>
              <th>Type</th>
              <th>Match Odds</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {paginatedData.map((data, index) => (
              <tr key={index}>
                <td>{data.runnerName}</td>
                <td className="fw-bold">{data.rate}</td>
                <td className="fw-bold">{data.value}</td>
                <td
                  className={
                    data.type === "back" ? "text-primary" : "text-danger"
                  }
                >
                  {data.userName}
                </td>
                <td>
                  <span
                    className="badge px-3 py-2"
                    style={{
                      backgroundColor:
                        data.type === "back" ? "#7DBCE8" : "#FFB6C1",
                    }}
                  >
                    {data.type.toUpperCase()}
                  </span>
                </td>
                <td>Match Odds</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="fw-bold">
            Page {currentPage} of {totalPages}
          </span>
          <div>
            <Button
              variant="secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              className="ms-2"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LiveBetModal;
