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
      console.log("values",values)
      try {
        await createSubAdmin(values, true);
        resetForm();
        // Optionally show success toast/message here
      } catch (error) {
        console.error("Error in creating sub-admin:", error);
        // Optionally show error toast/message here
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
    <div className="container" style={{ marginTop: "100px" }}>
      <FullScreenLoader show={isLoading} />
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div
              className="card-header text-white p-3"
              style={{ backgroundColor: "#1E2761", textAlign: "center" }}
            >
              <b className="mb-0 text-uppercase">CREATE USER ROLE</b>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label
                    htmlFor="userName"
                    className="form-label text-uppercase fw-bold"
                  >
                    UserName
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Username"
                    name="userName"
                    value={values.userName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.userName && touched.userName && (
                    <p className="text-danger fw-bold">{errors.userName}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="password"
                    className="form-label text-uppercase fw-bold"
                  >
                    Password
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter Password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <i
                      className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"
                        } position-absolute`}
                      style={{
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    ></i>
                  </div>
                  {errors.password && touched.password && (
                    <p className="text-danger fw-bold">{errors.password}</p>
                  )}
                </div>

                <div className="mb-3 mt-4">
                  <div className="card bg-dark text-white">
                    <h5 className="text-center py-2">PERMISSIONS :</h5>
                    <div className="card-body">
                      {strings.roles.map((permission) => (
                        <div
                          key={permission.role}
                          className="form-check form-check-inline"
                        >
                          <input
                            type="checkbox"
                            className="form-check-input"
                            name="permission"
                            value={permission.role}
                            checked={values.permission.includes(
                              permission.role
                            )}
                            onChange={handleCheckboxChange}
                          />
                          <label className="form-check-label">
                            {permission.name}
                          </label>
                        </div>
                      ))}
                      {errors.permission && touched.permission && (
                        <p className="text-danger fw-bold mt-2">
                          {errors.permission}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="gap-2">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={
                      isLoading || ["suspended"].includes(store?.admin?.status)
                    }
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
