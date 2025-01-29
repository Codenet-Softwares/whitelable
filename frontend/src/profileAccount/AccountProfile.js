import React, { useState } from "react";
import EditIcon from "../Assets/EditIcon.png";

import { Modal, Button } from "react-bootstrap";
import ResetModal from "./ResetModal";
import { useAppContext } from "../contextApi/context";


const AccountProfile = ({ props, UserName, createdByUser }) => {
  const { store } = useAppContext();
  const [passtoggle, setPassToggle] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");

  const [isHovered, setIsHovered] = useState(false);
  const [showPasChange, setShowPasChange] = useState(false);

  const handleShowPasChange = () => setShowPasChange(true);
  const handleClosePasChange = () => setShowPasChange(false);


  const handleshowPasChange = () => setShowPasChange(true);
  // const auth = useAuth();

  //   const funChangePassword = () => {
  //     if (newPassword && confirmPassword && oldPassword === "") {
  //       alert("Fields Cann't be Empty");
  //       return;
  //     }
  //     if (newPassword === confirmPassword) {
  //       const data = {
  //         userName: UserName,
  //         oldPassword: oldPassword,
  //         password: newPassword,
  //       };
  //       MyAccountServices.changePassword(data, auth.user)
  //         .then((res) => {
  //           alert("Password Changed Successfully");
  //           window.location.reload();
  //           // setPassToggle(false);
  //         })

  //         .catch((err) => {
  //           alert(err.response.data.message);
  //         });
  //     } else {
  //       alert("Password and confirm Password should be Same");
  //     }
  //   };

  const funShowPasswordChangeOption = () => {
    setPassToggle(false);
  };

  return (
    <div className="col-sm-8 mt-3">
      {/* card */}
      <div class="card w-100 rounded">
        <div
          class="card-heade text-white p-2 text-center text-uppercase rounded"
          style={{ backgroundColor: "#1E2761" }}
        >
          <b>&nbsp;&nbsp;Account Details</b>
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item p-3">
            <b style={{ color: "#1c3763"}} className="h6 fw-bold">Name : </b> <b>{props.userName}</b>
          </li>
          <li class="list-group-item p-3">
            <b style={{ color: "#1c3763" }} className="h6 fw-bold">Currency : </b>{" "}
            <b>No Data From Serverside</b>
          </li>
          <li class="list-group-item p-3"> 
            <b style={{ color: "#1c3763" }} className="h6 fw-bold">Exposure Limit : </b>{" "}
            <b>No Data From Serverside</b>
          </li>
          <li class="list-group-item p-3">
            <b style={{ color: "#1c3763" }} className="h6 fw-bold">Mobile Number : </b>
            <b>No Data From Serverside</b>
          </li>
          {createdByUser && store?.admin?.id === createdByUser &&
            <li class="list-group-item p-3">
              <b style={{ color: "#1c3763" }} className="h6 fw-bold">Password : </b>
              <b>********</b>{" "}
              <img
                src={EditIcon}
                style={{ width: isHovered ? "25px" : "20px" }}
                onMouseOver={() => setIsHovered(true)}
                onMouseOut={() => setIsHovered(false)}
                alt="Edit Icon"
                title="Change Password"
                onClick={handleShowPasChange}
              />
            </li>}
        </ul>
      </div>
      <ResetModal show={showPasChange} handleClose={handleClosePasChange} userName={UserName} />
    
      {/* card end */}
      {/* Modal Change Password */}

    </div>
  );
};

export default AccountProfile;
