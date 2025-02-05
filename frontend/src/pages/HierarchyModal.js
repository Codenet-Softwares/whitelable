import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import { getUserHirerchy } from "../Utils/service/apiService";
const modalStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  content: {
    width: "600px",
    height: "500px",
    margin: "auto",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    padding: "20px",
  },
};

const HierarchyModal = ({ selectedUser, isOpen, onRequestClose }) => {
  const [userHierarchyData, setUserHierarchyData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      setLoading(true);
      getUserHirerchy({ userName: selectedUser })
        .then((response) => setUserHierarchyData(response?.data || []))
        .finally(() => setLoading(false));
    }
  }, [selectedUser]);

  const renderHierarchyTree = (user, level = 0) => {
    return (
      <React.Fragment key={user.userName}>
        <tr>
          <td style={{ paddingLeft: `${level * 20}px` }}>
            {level > 0 && "↳ "}
            <strong>{user.userName}</strong>
          </td>

          <td>{user.roles?.map((role) => role.role).join(", ")}</td>
        </tr>
        {/* Recursively render children */}
        {userHierarchyData
          .filter((child) => child.createdByUser === user.userName)
          .map((child) => renderHierarchyTree(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={modalStyles}
      contentLabel="User Hierarchy Details"
    >
      {/* Modal Header */}
      <div className="text-center mb-3" style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: "bold", color: "#3b6e91" }}>
        Hierarchy of {selectedUser}
      </div>
      {/* Modal Body */}
      <div style={{ maxHeight: "350px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "8px", padding: "10px" }}>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>User Name</th>

              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="2" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : userHierarchyData.length > 0 ? (
              // Display the user hierarchy
              userHierarchyData
                .filter((user) => !user.createdByUser) // Find root users
                .map((rootUser) => renderHierarchyTree(rootUser))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

         {/* Modal Footer */}
         <div className="text-center mt-3">
        <button onClick={onRequestClose} className="btn btn-secondary">
          Close
        </button>
      </div>
    </ReactModal>
  );
};

export default HierarchyModal;
