// ViewSubAdminPermission.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppContext } from "../contextApi/context";
import {
  getviewSubAdminPermission,
  getEditSubAdminPermission,
} from "../Utils/service/apiService";
import { getSubAdminPermissionData } from "../Utils/service/initiateState";
import { permissionObj } from "../Utils/constant/permission";
import strings from "../Utils/constant/stringConstant";
import {
  ContainerWrapper,
  BootstrapCard,
  InfoRow,
  ToggleSwitch,
  IconButton,
} from "../Reusables/UIComponents";

const ViewSubAdminPermission = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { store } = useAppContext();
  const [data, setData] = useState(getSubAdminPermissionData());
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (store?.admin && permissionObj.allAdmin.includes(store.admin.role)) {
      fetchPermissions();
    }
  }, [store?.admin]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await getviewSubAdminPermission({ _id: id });
      if (res?.data) {
        setData({
          userName: res.data.userName,
          role: res.data.role,
          permission: res.data.permission || [],
        });
      }
    } catch {
      toast.error("Unable to fetch permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setData((prev) => ({
      ...prev,
      permission: checked
        ? [...prev.permission, name]
        : prev.permission.filter((p) => p !== name),
    }));
  };

  const handleSave = async () => {
    if (!data.permission.length) {
      toast.error("Please select at least one permission.");
      return;
    }
    setLoading(true);
    try {
      const res = await getEditSubAdminPermission(
        { _id: id, permission: data.permission },
        true
      );
      if (res) {
        toast.success("Permissions updated successfully");
        setEditMode(false);
      }
    } catch {
      toast.error("Failed to update permissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContainerWrapper>
      <BootstrapCard
        title={
          editMode ? "Edit Sub-Admin Permissions" : "View Sub-Admin Permissions"
        }
        onBack={
          editMode
            ? () => {
                setEditMode(false);
                fetchPermissions();
              }
            : () => navigate("/ViewAllSubAdmin")
        }
        headerVariant={editMode ? "info" : "primary"}
      >
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : (
          <>
            {/* User Info */}
            <div
              className="mb-4 pb-3 px-3 py-3 rounded shadow-sm text-center "
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <h5 className="text-uppercase text-primary mb-3 border-bottom pb-2 fw-bold fs-5 ">
                Sub-Admin Profile
              </h5>
              <InfoRow icon="user-tie" label="Username" value={data.userName} />
              <InfoRow icon="user-shield" label="Role" value={data.role} />
            </div>

            {/* Permissions */}
            <div className="mb-4">
              <h5 className="text-secondary mb-3">
                <i className="fas fa-key me-2 text-primary" />
                Assigned Permissions
              </h5>

              {editMode ? (
                <div className="row g-3 text-dark">
                  {strings.roles.map((roleObj) => (
                    <div
                      key={roleObj.role}
                      className="col-sm-6 col-md-4 col-lg-3"
                    >
                      <ToggleSwitch
                        id={`perm-${roleObj.role}`}
                        name={roleObj.role}
                        label={roleObj.name}
                        icon={roleObj.icon || "check"}
                        checked={data.permission.includes(roleObj.role)}
                        onChange={handleCheckboxChange}
                      />
                    </div>
                  ))}
                </div>
              ) : data.permission.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {data.permission.map((perm, i) => (
                    <span
                      key={i}
                      className="badge bg-secondary-subtle border text-dark fw-semibold px-3 py-2"
                    >
                      <i className="fas fa-check-circle text-success me-1"></i>
                      {perm.charAt(0).toUpperCase() + perm.slice(1).toLowerCase()}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="alert alert-warning small">
                  No permissions have been assigned yet.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="text-end pt-3 border-top ">
              {editMode ? (
                <>
                  <>
                    <IconButton
                      label="Cancel"
                      icon="times"
                      onClick={() => {
                        setEditMode(false);
                        fetchPermissions();
                      }}
                      variant="secondary"
                      outline
                    />
                  </>

                  <>
                    <IconButton
                      label="Save"
                      icon="save"
                      onClick={handleSave}
                      variant="success"
                    />
                  </>
                </>
              ) : (
                <IconButton
                  label="Edit Permissions"
                  icon="edit"
                  onClick={() => setEditMode(true)}
                  variant="primary"
                />
              )}
            </div>
          </>
        )}
      </BootstrapCard>
    </ContainerWrapper>
  );
};

export default ViewSubAdminPermission;
