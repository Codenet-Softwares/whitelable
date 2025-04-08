import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { getAuthForm } from "../../Utils/service/initiateState";
import { LoginSchema } from "../../Utils/schema";
import { useAppContext } from "../../contextApi/context";
import strings from "../../Utils/constant/stringConstant";

const Authform = ({ purpose, authFormApi }) => {
  const [authForm] = useState(getAuthForm);
  const { dispatch, store, showLoader, hideLoader } = useAppContext();
  // const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const roleOptions = {
    superAdmin: ["whiteLabel", "hyperAgent", "superAgent", "masterAgent"],
    SubAdmin: ["whiteLabel", "hyperAgent", "superAgent", "masterAgent"],
    whiteLabel: ["hyperAgent", "superAgent", "masterAgent", "user"],
    hyperAgent: ["superAgent", "masterAgent", "user"],
    superAgent: ["masterAgent", "user"],
    masterAgent: ["user"],
  };
  const renderRoleOptions = () => {
    if (purpose === "create") {
      const availableRoles = roleOptions[store?.admin?.roles[0]?.role] || [];
      // const availableRoles = [];

      return (
        <>
          <option hidden value="" style={{ textTransform: "uppercase" }}>
            Open This Select Role
          </option>

          {availableRoles.map((option) => (
            <option
              key={option}
              value={option}
              style={{ textTransform: "uppercase" }}
            >
              {option.toUpperCase()}
            </option>
          ))}
        </>
      );
    }
    return null;
  };
  //need not delete this part this is the old portion for formik down is the new portion changed by me tamoghna sanyal
  // const {
  //   values,
  //   errors,
  //   touched,
  //   handleBlur,
  //   handleChange,
  //   handleSubmit,
  //   resetForm,
  //   setFieldValue,
  // } = useFormik({
  //   initialValues: {
  //     ...authForm,
  //     roles: authForm.roles || [], // Ensure role is an array
  //   },
  //   validationSchema: LoginSchema,
  //   onSubmit: (values, action) => {
  //     authFormHandler(values);
  //     resetForm();
  //   },
  //   enableReinitialize: true,
  // });
  // async function authFormHandler(values) {
  //   dispatch({
  //     type: strings.isLoading,
  //     payload: true,
  //   });
  //   setIsLoading(true);
  //   const response = await authFormApi(values, true);
  //   if (purpose === "login" && response) {
  //     dispatch({
  //       type: strings.LOG_IN,
  //       payload: { isLogin: true, ...response.data },
  //     });
  //     navigate("/welcome");

  //     // setShowLogin(!showLogin);
  //   }
  //   dispatch({
  //     type: strings.isLoading,
  //     payload: false,
  //   });
  //   setIsLoading(false);
  // }

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
      roles: authForm.roles || [], // Ensure role is an array
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, action) => {
      showLoader(); // Show loader before starting the async operation

      try {
        await authFormHandler(values); // Assuming authFormHandler is an async function

        resetForm(); // Reset the form after successful submission
      } catch (error) {
        alert("There was an error during authentication"); // Handle error, if any
      } finally {
        hideLoader(); // Hide loader after the async operation is complete
      }
    },
    enableReinitialize: true,
  });

  async function authFormHandler(values) {
    dispatch({
      type: strings.isLoading,
      payload: true,
    });
    // setIsLoading(true);

    // API call to authenticate
    const response =
      values?.roles[0]?.length == 0 ? "" : await authFormApi(values, true);

    if (response && response.data) {
      if (purpose === "login") {
        // Check if password reset is required
        if (response.data.isReset) {
          dispatch({
            type: strings.LOG_IN,
            payload: { ...response.data },
          });
          navigate("/reset-password", { state: values });
        } else {
          // Otherwise, proceed to the welcome page
          dispatch({
            type: strings.LOG_IN,
            payload: { isLogin: true, ...response.data },
          });
          navigate("/welcome");
        }
      }
    }

    // Reset loading state
    dispatch({
      type: strings.isLoading,
      payload: false,
    });
    // setIsLoading(false);
  }

  const handleRoleChange = (event) => {
    const selectedRole = event.target.value;
    setFieldValue("roles", [selectedRole]);
  };

  return (
    <div className="main_content_iner ">
      <div className="container-fluid" style={{ marginTop: "15rem" }}>
        <div className="col-lg-12">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="modal-content cs_modal">
                <div className="modal-header justify-content-center theme_bg_1">
                  <h5 className="modal-title text_white ">
                    {purpose === "create" && "Create"}
                    {purpose === "login" && (
                      <div>
                        <div className="text-uppercase text-center">
                          Whitelabel
                        </div>
                        <div className="text-center h6 mt-2">
                          Hi! Please Enter Your Login Credentials!
                        </div>
                      </div>
                    )}
                  </h5>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="">
                      <input
                        type="text"
                        className={`form-control ${
                          errors.userName && touched.userName
                            ? "border-danger"
                            : ""
                        }`}
                        placeholder="Enter Username"
                        name="userName"
                        value={values.userName}
                        onChange={handleChange}
                      />
                      <p
                        className="text-danger text-center fw-bold mb-0"
                        style={{ minHeight: "20px" }}
                      >
                        {errors.userName && touched.userName
                          ? errors.userName
                          : "\u00A0"}
                      </p>
                    </div>
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
                        style={{ paddingRight: "2.5rem" }}
                      />
                      <i
                        className={`bi ${
                          showPassword ? "bi-eye-slash" : "bi-eye"
                        } position-absolute`}
                        style={{
                          right: "10px",
                          top: "25px",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          fontSize: "1.2rem",
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                      ></i>
                      <p
                        className="text-danger text-center fw-bold mb-0"
                        style={{ minHeight: "20px" }}
                      >
                        {errors.password && touched.password
                          ? errors.password
                          : "\u00A0"}
                      </p>
                    </div>
                    {purpose === "create" && (
                      <div className="">
                        <select
                          className="form-select"
                          name="role"
                          value={values.roles || ""}
                          onChange={handleRoleChange}
                          onBlur={handleBlur}
                        >
                          {renderRoleOptions()}
                        </select>
                      </div>
                    )}

                    {purpose === "create" && values.roles.length > 0 && (
                      <button
                        className={`btn_1 full_width text-center`}
                        disabled={["suspended"].includes(store?.admin?.status)}
                        style={{
                          cursor: values.roles ? "pointer" : "not-allowed",
                        }}
                        onClick={values.roles ? handleSubmit : undefined}
                      >
                        {purpose === "create" && "Create"}
                        {purpose === "login" && "Log In"}
                      </button>
                    )}
                    {purpose === "login" && (
                      <a
                        className="btn_1 full_width text-center"
                        style={{
                          cursor: values.roles ? "pointer" : "not-allowed",
                        }}
                        onClick={values.roles ? handleSubmit : undefined}
                      >
                        {purpose === "create" && "Create"}
                        {purpose === "login" && "Log In"}
                      </a>
                    )}
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
