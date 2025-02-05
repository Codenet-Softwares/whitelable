import React from "react";
import { useFormik } from "formik";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ResetAdminPassword } from "../../Utils/service/apiService"; 
import { getAdminResetPasswordInitialState } from "../../Utils/service/initiateState"; 
import { ReusableInput } from "../common/Resuableinput"; 
import { resetPasswordSchema } from "../../Utils/schema"; 
import { useAppContext } from "../../contextApi/context";
import { customErrorHandler } from "../../Utils/helper";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state || {}; 
  const { showLoader, hideLoader } = useAppContext();

  const handleResetPassword = async (values) => {
    const { confirmPassword, ...resetValues } = values; 
    showLoader(); // Show loader before starting the async operation 
    try {
      const response = await ResetAdminPassword(resetValues, true);
      if (response?.success) {
        navigate("/login");
        toast.success("Password changed successfully!");
      } 
    } catch (error) {
      toast.error(customErrorHandler(error));
    }finally {
      hideLoader(); // Hide loader in the finally block to ensure it always runs
    }
  };

  const inputFields = [
    {
      id: "newPassword",
      name: "newPassword",
      type: "password",
      placeholder: "Enter new password",
      showEyeIcon: true,
    },
    {
      id: "confirmPassword",
      name: "confirmPassword",
      type: "password",
      placeholder: "Confirm new password",
      showEyeIcon: true,
    },
  ];

  const formik = useFormik({
    initialValues: getAdminResetPasswordInitialState({
      userName: state?.userName, 
      oldPassword: state?.password, 
    }),
    validationSchema: resetPasswordSchema, 
    onSubmit: handleResetPassword, 
  });

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
    <div className="card shadow-lg p-4 rounded-4" style={{ maxWidth: "500px", width: "100%" }}>
      <div className="text-center mb-4">
        <i className="bi bi-person-circle text-primary" style={{ fontSize: "4rem" }}></i>
        <h2 className="mt-3 text-primary">Reset Password</h2>
        <p
          className="text-uppercase fw-bold text-glow mt-3"
          style={{
            color: "#4682B4",
            fontSize: "1.5rem",
            letterSpacing: "2px",
            // animation: "glow 2s infinite alternate",
          }}
        >
          {formik.values.userName}
        </p>
      </div>
      <form onSubmit={formik.handleSubmit}>
        {inputFields.map((field, index) => (
          <ReusableInput
            key={index}
            placeholder={field.placeholder}
            name={field.name}
            type={field.type}
            value={formik.values[field.name]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched[field.name] && formik.errors[field.name]}
            showEyeIcon={field.showEyeIcon}
          />
        ))}
        <div className="d-grid mt-3">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </form>
    </div>
  </div>
  
  );
};

export default ResetPassword;
