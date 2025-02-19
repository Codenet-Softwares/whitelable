import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { getAuthForm } from "../../Utils/service/initiateState";
import { LoginSchema } from "../../Utils/schema";
import { useAppContext } from "../../contextApi/context";
import strings from "../../Utils/constant/stringConstant";
import "bootstrap-icons/font/bootstrap-icons.css"; // Ensure Bootstrap Icons are available

const Authform = ({ purpose, authFormApi }) => {
  const [authForm] = useState(getAuthForm);
  const { dispatch, store, showLoader, hideLoader } = useAppContext();
  const navigate = useNavigate();
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
      ...authForm,
      roles: authForm.roles || [],
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      showLoader();
      try {
        await authFormHandler(values);
        resetForm();
      } catch (error) {
        alert("There was an error during authentication");
      } finally {
        hideLoader();
      }
    },
    enableReinitialize: true,
  });

  async function authFormHandler(values) {
    dispatch({ type: strings.isLoading, payload: true });

    const response =
      values?.roles[0]?.length === 0 ? "" : await authFormApi(values, true);

    if (response && response.data) {
      if (purpose === "login") {
        if (response.data.isReset) {
          dispatch({ type: strings.LOG_IN, payload: { ...response.data } });
          navigate("/reset-password", { state: values });
        } else {
          dispatch({
            type: strings.LOG_IN,
            payload: { isLogin: true, ...response.data },
          });
          navigate("/welcome");
        }
      }
    }

    dispatch({ type: strings.isLoading, payload: false });
  }

  return (
    <div className="main_content_iner">
      <div className="container-fluid" style={{ marginTop: "15rem" }}>
        <div className="col-lg-12">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="modal-content cs_modal">
                <div className="modal-header justify-content-center theme_bg_1">
                  <h5 className="modal-title text_white">
                    {purpose === "create" ? "Create" : "Whitelabel"}
                  </h5>
                </div>
                <div className="modal-body">
                  <form>
                    {/* Username Input */}
                    <div>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Username"
                        name="userName"
                        value={values.userName}
                        onChange={handleChange}
                      />
                      {errors.userName && touched.userName && (
                        <p className="text-center fw-bold text-danger">
                          {errors.userName}
                        </p>
                      )}
                    </div>

                    {/* Password Input with Eye Icon */}
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${
                          errors.password && touched.password
                            ? "border-danger"
                            : ""
                        }`}
                        placeholder="Enter Password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        style={{ paddingRight: "2.5rem" }} // Space for the eye icon
                      />

                      {/* Hide the eye icon when there's a validation error */}
                      {!errors.password || !touched.password ? (
                        <i
                          className={`bi ${
                            showPassword ? "bi-eye-slash" : "bi-eye"
                          } position-absolute top-50 end-0 translate-middle-y me-3`}
                          style={{ cursor: "pointer" }}
                          onClick={() => setShowPassword(!showPassword)}
                        ></i>
                      ) : null}

                      <div className="mt-1">
                        {errors.password && touched.password && (
                          <p className="text-center fw-bold text-danger">
                            {errors.password}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Role Selection for Creating Users */}
                    {purpose === "create" && (
                      <div>
                        <select
                          className="form-select"
                          name="role"
                          value={values.roles || ""}
                          onChange={(e) =>
                            setFieldValue("roles", [e.target.value])
                          }
                          onBlur={handleBlur}
                        >
                          <option hidden value="">
                            Open This Select Role
                          </option>
                          {["whiteLabel", "hyperAgent", "superAgent"].map(
                            (option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    )}

                    {/* Submit Button */}
                    <a
                      className="btn_1 full_width text-center mt-3"
                      style={{ cursor: "pointer" }}
                      onClick={handleSubmit}
                    >
                      {purpose === "create" ? "Create" : "Log In"}
                    </a>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authform;
