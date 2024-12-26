import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { getAuthForm } from "../../Utils/service/initiateState";
import { LoginSchema } from "../../Utils/schema";
import { useAppContext } from "../../contextApi/context";
import strings from "../../Utils/constant/stringConstant";
import FullScreenLoader from "../FullScreenLoader";

const Authform = ({ purpose, authFormApi }) => {
  const [authForm] = useState(getAuthForm);
  const { dispatch, store } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

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
          <option hidden value="" style={{textTransform:"uppercase"}}>Open This Select Role</option>

          {availableRoles.map((option) => (
            <option key={option} value={option} style={{textTransform:"uppercase"}}>
              {option}
            </option>
          ))}
        </>
      );
    }
    return null;
  };

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
    onSubmit: (values, action) => {
      console.log("values++===============>", values);
      authFormHandler(values);
      resetForm();
    },
    enableReinitialize: true,
  });
  // async function authFormHandler(values) {
  //   console.log(values);
  //   dispatch({
  //     type: strings.isLoading,
  //     payload: true,
  //   });
  //   setIsLoading(true);
  //   const response = await authFormApi(values, true);
  //   console.log("res from login", response);

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
  async function authFormHandler(values) {
    console.log(values);
    dispatch({
      type: strings.isLoading,
      payload: true,
    });
    setIsLoading(true);

    // API call to authenticate
    const response = values?.roles[0]?.length == 0 ? "" : await authFormApi(values, true);
    console.log("res from login", response);

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
    setIsLoading(false);
  }

  const handleRoleChange = (event) => {
    const selectedRole = event.target.value;
    setFieldValue("roles", [selectedRole]);
  };

  return (
    <div className="main_content_iner ">
      <FullScreenLoader show={isLoading} />
      <div className="container-fluid" style={{ marginTop: "15rem" }}>
        <div className="col-lg-12">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="modal-content cs_modal">
                <div className="modal-header justify-content-center theme_bg_1">
                  <h5 className="modal-title text_white text-uppercase">
                    {purpose === "create" && "Create"}
                    {purpose === "login" && "Log In"}
                  </h5>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="">
                      <input
                        type="text"
                        className="form-control "
                        placeholder="Enter UserName"
                        name="userName"
                        // style={{ border: '1px solid black' }}
                        value={values.userName}
                        onChange={handleChange}
                      />
                      <p>
                        {errors.userName && touched.userName ? (
                          <span className="text-center fw-bold text-danger">
                            {errors.userName}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <div className="">
                      <input
                        type="password"
                        className="form-control "
                        placeholder="Enter Password"
                        name="password"
                        // style={{ border: '1px solid black' }}
                        value={values.password}
                        onChange={handleChange}
                      />
                      <span>
                        {errors.password && touched.password ? (
                          <p className="text-center fw-bold text-danger">
                            {errors.password}
                          </p>
                        ) : null}
                      </span>
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

                    {console.log("===>> roles ", values.roles)}
                    {purpose === "create" && values.roles.length > 0 && (
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

                    {console.log("===>> roles ", values.roles)}

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
