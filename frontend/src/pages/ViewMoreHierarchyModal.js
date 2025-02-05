import React, { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import { getUserHirerchy } from '../Utils/service/apiService';
const modalStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    content: {
      padding: "20px",
      borderRadius: "8px",
      maxWidth: "800px",
      margin: "auto",
    },
  };

const ViewMoreHierarchyModal = ({ selectedUser, isOpen, onRequestClose }) => {
     const [userHierarchyData, setUserHierarchyData] = useState([]);
        const [loading, setLoading] = useState(false);
      
        useEffect(() => {
          if (selectedUser) {
            setLoading(true);
           getUserHirerchy({userName:selectedUser})
              .then(response => setUserHierarchyData(response?.data || []))
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
                    <td>{user.createdByUser || "N/A"}</td>
                    <td>{user.roles?.map((role) => role.role).join(", ")}</td>
                    <td>{user.roles?.flatMap((role) => role.permission).join(", ")}</td>
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
       <h4 className="text-center">Hierarchy of {selectedUser}</h4>
       <button
         onClick={onRequestClose}
         className="btn btn-secondary mb-3"
       >
         ← Back
       </button>
 
       <div className="table-responsive">
         <table className="table table-bordered">
           <thead className="table-dark">
             <tr>
               <th>User Name</th>
               <th>Created By</th>
               <th>Role</th>
               <th>Permissions</th>
             </tr>
           </thead>
           <tbody>
             {loading ? (
               <tr>
                 <td colSpan="4" className="text-center">Loading...</td>
               </tr>
             ) : userHierarchyData.length > 0 ? (
               // Display the user hierarchy
               userHierarchyData
                 .filter((user) => !user.createdByUser) // Find root users
                 .map((rootUser) => renderHierarchyTree(rootUser))
             ) : (
               <tr>
                 <td colSpan="4" className="text-center">No data found</td>
               </tr>
             )}
           </tbody>
         </table>
       </div>
     </ReactModal>
   )
}

export default ViewMoreHierarchyModal
