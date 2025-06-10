import React, { useState } from "react";
import strings from "../Utils/constant/stringConstant";
import { useAppContext } from "../contextApi/context";
import { getCreateSubAdmin } from "../Utils/service/initiateState";
import { CreateSubAdminSchema } from "../Utils/schema";
import { useFormik } from "formik";
import { createSubAdmin } from "../Utils/service/apiService";
import FullScreenLoader from "../components/FullScreenLoader";

const CreateSubAdmin = () => {
  const { store, showLoader, hideLoader } = useAppContext();
  const [createSubAdminState] = useState(getCreateSubAdmin);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
  } = useFormik({
    initialValues: {
      ...createSubAdminState,
    },
    validationSchema: CreateSubAdminSchema,
    onSubmit: async (values, action) => {
      showLoader();
      setIsLoading(true);
      try {
        await createSubAdmin(values, true);
        resetForm();
      } catch (error) {
        console.error("Error in creating sub-admin:", error);
      } finally {
        setIsLoading(false);
        hideLoader();
        action.setSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    const updatedPermissions = checked
      ? [...values.permission, value]
      : values.permission.filter((item) => item !== value);

    setFieldValue("permission", updatedPermissions);
  };

  return (
    <div className="container py-5">
      <FullScreenLoader show={isLoading} />
      <div className="row justify-content-center">
        <div className="col-xl-8 col-lg-9">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="modal-header justify-content-center theme_bg_1">
              <h4 className="mb-0 text-uppercase fw-bold text-white">Create User Role</h4>
            </div>

            <div className="card-body bg-light-subtle px-4 py-5">
              <form onSubmit={handleSubmit} className="needs-validation">
                <div className="mb-4">
                  <label htmlFor="userName" className="form-label text-uppercase fw-bold">
                    Username
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.userName && touched.userName ? "is-invalid" : ""
                      }`}
                    placeholder="Enter Username"
                    name="userName"
                    value={values.userName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.userName && touched.userName && (
                    <div className="invalid-feedback d-block fw-bold">
                      {errors.userName}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label text-uppercase fw-bold">
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${errors.password && touched.password ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      <i className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`}></i>
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <div className="invalid-feedback d-block fw-bold">
                      {errors.password}
                    </div>
                  )}
                </div>

                <div className="mb-5 text-uppercase">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-dark text-white text-center fw-bold">
                      Permissions
                    </div>
                    <div className="card-body d-flex flex-wrap gap-3 ">
                      {strings.roles.map((permission) => (
                        <div className="form-check form-switch " key={permission.role}>
                          <input
                            className="form-check-input "
                            type="checkbox"
                            name="permission"
                            value={permission.role}
                            id={`permission-${permission.role}`}
                            checked={values.permission.includes(permission.role)}
                            onChange={handleCheckboxChange}
                          />
                          <label
                            className="form-check-label text-capitalize"
                            htmlFor={`permission-${permission.role}`}
                          >
                            {permission.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.permission && touched.permission && (
                      <div className="px-3 pb-3 text-danger fw-semibold">
                        {errors.permission}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-lg px-5 fw-bold text-white"
                    style={{ backgroundColor: "#4682B4" }}
                    disabled={isLoading || store?.admin?.status === "suspended"}
                  >
                    Add User Role
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSubAdmin;
