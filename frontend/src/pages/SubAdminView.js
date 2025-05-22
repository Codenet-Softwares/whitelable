import React, { useState, useEffect, useCallback } from "react";
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
import ResetPasswordModal from "../Reusables/ResetPasswordModal";
import ReusableTable2 from "../Reusables/ReusableTable2";
import { debounce } from "../Utils/debounce";

const SubAdminView = () => {
  const [subAdminData, setSubAdminData] = useState(getAllSubAdminCreateState());
  const [refresh, setRefresh] = useState({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [adminIdForStatus, setAdminIdForStatus] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [userName, setUserName] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

  const { store } = useAppContext();

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((searchValue) => fetchSubAdmins(searchValue), 500),
    []
  );

  const handleSearch = (value) => {
    setSubAdminData((prev) => ({
      ...prev,
      name: value,
      currentPage: 1,
    }));
    debouncedSearch(value);
  };

  // Fetch data on mount, page change, or refresh
  useEffect(() => {
    if (store?.admin && permissionObj.allAdmin.includes(store.admin.role)) {
      fetchSubAdmins(subAdminData.name);
    }
  }, [
    store?.admin,
    subAdminData.currentPage,
    subAdminData.totalEntries,
    refresh,
  ]);

  const fetchSubAdmins = async (name = "") => {
    const response = await getAllSubAdminCreate({
      _id: store?.admin?.id,
      pageNumber: subAdminData.currentPage,
      dataLimit: subAdminData.totalEntries,
      name,
    });

    if (response) {
      setSubAdminData((prev) => ({
        ...prev,
        userList: response.data,
        totalPages: response.pagination?.totalPages,
        totalData: response.pagination?.totalRecords,
      }));
    }
  };

  const openStatusModal = (adminId, status, userName, role) => {
    setAdminIdForStatus(adminId);
    setStatus(status);
    setUserName(userName);
    setRole(role);
    setShowStatusModal(true);
  };

  const closeStatusModal = () => setShowStatusModal(false);

  const handleDelete = async (row) => {
    if (!window.confirm("Are you sure you want to delete this sub-admin?"))
      return;

    try {
      const response = await deleteSubAdmin({ requestId: row.adminId }, true);
      if (response.success === 200) {
        setRefresh(response);
      }
    } catch (error) {
      toast.error("Failed to delete sub-admin");
      console.error("Error deleting sub-admin:", error);
    }
  };

  const handleResetPassword = async ({ adminPassword, password }) => {
    const payload = { userName, adminPassword, password };

    try {
      const response = await resetPasswordSubAdmin(payload);
      if (response.successCode === 200) {
        toast.success("Password reset successfully!");
        setShowResetModal(false);
      }
    } catch (error) {
      toast.error("Failed to reset password");
      console.error("Error resetting password:", error);
    }
  };

  // Table column definitions
  const columns = [
    {
      header: "Serial Number",
      accessor: "",
      cellRenderer: (row, index) => index + 1,
    },
    {
      header: "Name",
      accessor: "userName",
    },
    {
      header: "Detail",
      accessor: "",
      cellRenderer: (row) => (
        <Link to={`/ViewSubAdminPermission/${row.adminId}`}>
          <button className="btn btn-sm btn-outline-primary fw-bold">
            View
          </button>
        </Link>
      ),
    },
    {
      header: "Status",
      accessor: "",
      cellRenderer: (row) => (
        <span
          className={`badge rounded-pill ${
            row.status === "Active"
              ? "bg-success"
              : row.status === "Suspended"
              ? "bg-danger"
              : "bg-secondary"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  // Action buttons
  const actions = [
    {
      title: "Settings",
      icon: "bi-gear fw-bold fs-5",
      className: "btn-secondary",
      handler: (row) =>
        openStatusModal(row.adminId, row.status, row.userName, row.role),
      disabledCondition: (row) =>
        ["Suspended"].includes(store?.admin?.Status) ||
        (![store?.admin?.permission].some((perm) => perm === strings.status) &&
          !permissionObj.allAdmin.includes(store?.admin?.role)),
    },
    {
      title: "Reset Password",
      icon: "bi bi-pencil-square fw-bold fs-5 text-white",
      className: "btn-warning",
      handler: (row) => {
        setUserName(row.userName);
        setShowResetModal(true);
      },
      disabledCondition: (row) => ["Suspended", "Locked"].includes(row.status),
    },
    {
      title: "Delete",
      icon: "bi-trash fw-bold fs-5 ",
      className: "btn-danger",
      handler: handleDelete,
      disabledCondition: (row) => ["Suspended", "Locked"].includes(row.status),
    },
  ];

  const startIndex =
    subAdminData.userList.length > 0
      ? (subAdminData.currentPage - 1) * subAdminData.totalEntries + 1
      : 0;

  const endIndex = Math.min(
    subAdminData.currentPage * subAdminData.totalEntries,
    subAdminData.totalData
  );

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0 text-white">List of User Roles</h3>
            </div>
            <div className="card-body">
              <ReusableTable2
                columns={columns}
                data={subAdminData.userList}
                currentPage={subAdminData.currentPage}
                totalPages={subAdminData.totalPages}
                totalData={subAdminData.totalData}
                totalEntries={subAdminData.totalEntries}
                onPageChange={(page) =>
                  setSubAdminData((prev) => ({ ...prev, currentPage: page }))
                }
                onEntriesChange={(value) =>
                  setSubAdminData((prev) => ({
                    ...prev,
                    totalEntries: value,
                    currentPage: 1,
                  }))
                }
                onSearch={handleSearch}
                searchValue={subAdminData.name}
                noDataMessage="No sub-admins found"
                actions={actions}
                startIndex={startIndex}
                endIndex={endIndex}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StatusModal
        show={showStatusModal}
        handleClose={closeStatusModal}
        name={role}
        userRole={userName}
        Status={status}
        adminIdForStatus={adminIdForStatus}
        setRefresh={setRefresh}
      />

      <ResetPasswordModal
        show={showResetModal}
        handleClose={() => setShowResetModal(false)}
        onSubmit={handleResetPassword}
        userName={userName}
      />
    </div>
  );
};

export default SubAdminView;
