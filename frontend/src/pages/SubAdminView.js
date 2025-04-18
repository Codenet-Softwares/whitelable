import React, { useState, useEffect, useRef } from "react";
import Pagination from "../components/common/Pagination";
import { Link } from "react-router-dom";
import { useAppContext } from "../contextApi/context";
import {
  deleteSubAdmin,
  getAllSubAdminCreate,
  resetPasswordSubAdmin,
} from "../Utils/service/apiService";
import { permissionObj } from "../Utils/constant/permission";
import { getAllSubAdminCreateState } from "../Utils/service/initiateState";
import strings from "../Utils/constant/stringConstant";
import StatusModal from "../modal/StatusModal";
import { toast } from "react-toastify";
import { customErrorHandler } from "../Utils/helper";

const SubAdminView = () => {
  const searchTimeout = useRef(null); // Reference to store the timeout ID
  const [subAdminData, setSubAdminData] = useState(getAllSubAdminCreateState());
  const [refresh, setRefresh] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [adminIdForStatus, setAdminIdForStatus] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [userName, setUserName] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    adminPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    adminPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false); // for reset modal
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // for reset modal
  const [showAdminPassword, setShowAdminPassword] = useState(false); // for reset modal
  const handleResetPasswordChange = (e) => {
    const { id, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));
  };

  const { store, dispatch } = useAppContext();
  const handleChange = (name, value) => {
    setSubAdminData((prevData) => ({
      ...prevData,
      [name]: value,  // Updating the search term
    }));
  
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
  
    // Set a new timeout to delay the API call
    searchTimeout.current = setTimeout(() => {
      getAll_SubAdmin_Create(value); // Pass the updated value
    }, 500); // 500ms debounce time
  };
  
  const handleStatusModalShow = (adminId, status, userName, role) => {
    setShowModal(true);
    setAdminIdForStatus(adminId);
    setStatus(status);
    setUserName(userName);
    setRole(role);
  };

  const handleClose = (adminId) => setShowModal(false);

  useEffect(() => {
    if (store?.admin && permissionObj.allAdmin.includes(store?.admin?.roles[0].role)) {
      getAll_SubAdmin_Create(subAdminData.name);
    }
  }, [store?.admin, subAdminData.currentPage, subAdminData.totalEntries, subAdminData.name, refresh]);

  async function getAll_SubAdmin_Create(name = subAdminData.name) {
    const response = await getAllSubAdminCreate({
      _id: store?.admin?.id,
      pageNumber: subAdminData.currentPage,
      dataLimit: subAdminData.totalEntries,
      name: name,
    });

    if (response) {
      setSubAdminData({
        ...subAdminData,
        userList: response?.data,
        totalPages: response?.pagination?.totalPages,
        totalData: response?.pagination?.totalRecords,
      });
    }
  }

  const handlePageChange = (page) => {
    setSubAdminData((prevState) => ({
      ...prevState,
      currentPage: page,
    }));
  };
  let startIndex = Math.min(
    (Number(subAdminData.currentPage) - 1) * Number(subAdminData.totalEntries) +
      1
  );
  let endIndex = Math.min(
    Number(subAdminData.currentPage) * Number(subAdminData.totalEntries),
    Number(subAdminData.totalData)
  );
  const openModal = (userName) => {
    setUserName(userName);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormValues({
      adminPassword: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({
      password: "",
      confirmPassword: "",
      adminPassword: "",
    });
  };
  // needs to be cross checked
  // const handleResetPassword = async () => {
  //   const { adminPassword, password, confirmPassword } = formValues;

  //   if (password !== confirmPassword) {
  //     alert("New Password and Confirm Password do not match!");
  //     return;
  //   }

  //   const payload = {
  //     userName: userName,
  //     adminPassword,
  //     password,
  //   };

  //   try {
  //     const response = await resetPasswordSubAdmin(payload);
  //     if (response.successCode === 200) {
  //       // toast.success("Password reset successfully!");
  //       closeModal();
  //     }
  //   } catch (error) {
  //     console.error("Error resetting password:", error);
  //     // alert(error.errMessage);
  //   }
  // };

  const handleResetPassword = async () => {
    const { adminPassword, password, confirmPassword } = formValues;
    let formErrors = {
      password: "",
      confirmPassword: "",
      adminPassword: "",
    };

    if (!adminPassword) {
      formErrors.adminPassword = "Admin Password Is Required!";
    }
    if (!password) {
      formErrors.password = "New Password Is Required!";
    }
    if (!confirmPassword) {
      formErrors.confirmPassword = "Confirm Password Is Required!";
    }
    if (password && confirmPassword && password !== confirmPassword) {
      formErrors.confirmPassword =
        "New Password and Confirm Password do not match!";
    }

    if (
      formErrors.password ||
      formErrors.confirmPassword ||
      formErrors.adminPassword
    ) {
      setErrors(formErrors);
      return;
    }

    const payload = {
      userName: userName,
      adminPassword,
      password,
    };

    try {
      const response = await resetPasswordSubAdmin(payload);
      if (response.successCode === 200) {
        toast.success("Password reset successfully!");
        closeModal();
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error?.errMessage || "Failed to reset password!");
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this sub-admin?"
    );

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await deleteSubAdmin({ requestId: id }, true);
      if (response.success === 200) {
        setRefresh(response);
      }
    } catch (error) {
      toast.error(customErrorHandler(error));
    }
  };

  return (
    <div className="main_content_iner mt-5 p-5 rounded-3">
      <div className="container-fluid p-0">
        <div className="card">

        <div className="row justify-content-center">
          <div className="col-lg-12">
            <div className="white_card card_height_100 mb_30">
              <div className="white_card_header  rounded-3">
                <h3
                  className="m-0 text-center text-uppercase fw-bolder text-white"
             
                >
                  List of User Roles
                </h3>
                <div className="box_header m-0"></div>
              </div>
              <div className="white_card_body mt-4">
                <div className="QA_section">
                  <div className="white_box_tittle list_header">
                    <div className="col-2 text-center">
                      <select
                        className="form-select form-select-sm"
                        aria-label=".form-select-sm example"
                        onChange={(e) =>
                          handleChange("totalEntries", e.target.value)
                        }
                      >
                        <option value="10">Show 10 Entries</option>
                        <option value="25">25 Entries</option>
                        <option value="50">50 Entries</option>
                        <option value="100">100 Entries</option>
                      </select>
                    </div>

                    <div
                      className="serach_field_2 ms-auto"
                      style={{ marginLeft: "-10px" }}
                    >
                      <div className="search_inner">
                        <form Active="#">
                          <div className="search_field">
                            <input
                              value={subAdminData.name}
                              onChange={(e) => {
                                handleChange("name", e.target.value);
                              }}
                              type="text"
                              placeholder="Search content here..."
                            />
                          </div>
                          <button type="submit">
                            {" "}
                            <i className="ti-search"></i>{" "}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div className="QA_table mb_30" style={{ overflow: "auto" }}>
                    {/* table-responsive */}
                    {subAdminData?.userList.length > 0 ? (
                      <React.Fragment>
                        <table className="table lms_table_active3 ">
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
                                style={{ fontWeight: "bold", color: "white" }}
                              >
                                Serial Number
                              </th>
                              <th
                                scope="col"
                                style={{ fontWeight: "bold", color: "white" }}
                              >
                                Name
                              </th>
                              <th
                                scope="col"
                                style={{ fontWeight: "bold", color: "white" }}
                              >
                                Detail
                              </th>
                              <th
                                scope="col"
                                style={{ fontWeight: "bold", color: "white" }}
                              >
                                Status
                              </th>
                              <th
                                scope="col"
                                style={{ fontWeight: "bold", color: "white" }}
                              >
                                Change Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {subAdminData?.userList?.map((user, index) => (
                              <tr key={user._id}>
                                <th scope="row">{index + 1}</th>
                                <td>{user.userName}</td>

                                <td>
                                  <Link
                                    to={`/ViewSubAdminPermission/${user.adminId}`}
                                  >
                                    <button className="btn btn-sm btn-success">
                                      Go To
                                    </button>
                                  </Link>
                                </td>
                                <td>
                                  <button
                                    className="border border-1 w-75 text-center bg-success rounded-pill "
                                    style={{ cursor: "auto" }}
                                  >
                                    {user.status}
                                  </button>
                                </td>
                                <td>
                                  <span className="mx-1">
                                    <button
                                      className={`btn border border-2 rounded ${
                                        ["Suspended"].includes(
                                          store?.admin?.Status
                                        )
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
                                      onClick={() =>
                                        handleStatusModalShow(
                                          user?.adminId,
                                          user?.status,
                                          user?.userName,
                                          user?.roles[0]?.role
                                        )
                                      }
                                    >
                                      <i className="fa-thin fas fa-gear"></i>
                                    </button>
                                  </span>
                                  <span className="mx-1">
                                    <button
                                       className={`btn border border-2 rounded  ${["Suspended", "Locked"].includes(user.status)
                                        && "disabled"}`}
                                      style={{ background: "lightgreen" }}
                                      title="Reset Password"
                                      onClick={() => openModal(user.userName)}
                                    >
                                      <i className="bi bi-shield-lock"></i>
                                    </button>
                                  </span>
                                  {}{" "}
                                  <span className="mx-1">
                                    <button
                                   className={`btn border border-2 rounded  ${["Suspended", "Locked"].includes(user.status)
                                    && "disabled"}`}
                                      style={{ background: "#ED5E68" }}
                                      title="Delete"
                                      onClick={(e) => {
                                        handleDelete(user.adminId);
                                      }}
                                    >
                                      <i class="fa-light fas fa-trash"></i>
                                    </button>
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </React.Fragment>
                    ) : (
                      <div
                        className="alert text-dark p-4"
                        role="alert"
                        style={{
                          background: "#1E2761",
                          border: "2px solid #84B9DF",
                        }}
                      >
                        <div
                          className="alert-text d-flex justify-content-center text-light"
                          style={{}}
                        >
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
        </div>
        {subAdminData?.userList.length > 0 && (
          <Pagination
            currentPage={subAdminData.currentPage}
            totalPages={subAdminData.totalPages}
            handlePageChange={handlePageChange}
            startIndex={startIndex}
            endIndex={endIndex}
            totalData={subAdminData.totalData}
          />
        )}
        <StatusModal
          show={showModal}
          handleClose={handleClose}
          name={role}
          userRole={userName}
          Status={status}
          adminIdForStatus={adminIdForStatus}
          setRefresh={setRefresh}
        />
        {/* Modal */}
        {isModalOpen && (
          <div className="modal" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold text-uppercase text-dark">Reset Password</h5>
                  <button type="button" className="close" onClick={closeModal}>
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group position-relative">
                    <label htmlFor="password">New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="form-control"
                      value={formValues.password}
                      onChange={handleResetPasswordChange}
                      required
                      style={{ paddingRight: "2.5rem" }}
                    />

                    <i
                      className={`bi ${
                        showPassword ? "bi-eye-slash" : "bi-eye"
                      } position-absolute top-50 end-0 translate-middle-y me-3`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    ></i>

                    {errors.password && (
                      <small className="text-danger fw-bold">
                        {errors.password}
                      </small>
                    )}
                  </div>
                  <div className="form-group position-relative mt-3">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      className="form-control"
                      value={formValues.confirmPassword}
                      onChange={handleResetPasswordChange}
                      required
                    />

                    <i
                      className={`bi ${
                        showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                      } position-absolute top-50 end-0 translate-middle-y me-3`}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    ></i>

                    {errors.confirmPassword && (
                      <small className="text-danger fw-bold">
                        {errors.confirmPassword}
                      </small>
                    )}
                  </div>
                  <div className="form-group position-relative mt-3">
                    <label htmlFor="adminPassword">Admin Password</label>
                    <input
                      type={showAdminPassword ? "text" : "password"}
                      id="adminPassword"
                      className="form-control"
                      value={formValues.adminPassword}
                      onChange={handleResetPasswordChange}
                      required
                      style={{ paddingRight: "2.5rem" }}
                    />

                    <i
                      className={`bi ${
                        showAdminPassword ? "bi-eye-slash" : "bi-eye"
                      } position-absolute top-50 end-0 translate-middle-y me-3`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                    ></i>

                    {errors.adminPassword && (
                      <small className="text-danger fw-bold">
                        {errors.adminPassword}
                      </small>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleResetPassword}
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubAdminView;
