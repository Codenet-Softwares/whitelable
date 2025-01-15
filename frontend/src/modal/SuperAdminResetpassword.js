import React, { useState } from "react";
import axios from "axios"; // Assuming you're using Axios for API calls

const SuperAdminResetpassword = ({ closeModal }) => {
    const [formValues, setFormValues] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [id]: value,
        }));
    };

    const handleResetPassword = async () => {
        const { oldPassword, newPassword, confirmPassword } = formValues;

        // Check if newPassword and confirmPassword match
        if (newPassword !== confirmPassword) {
            alert("New Password and Confirm Password do not match!");
            return;
        }

        // Prepare payload for API
        const payload = {
            userName: "demoadmin", // Replace with dynamic username if needed
            oldPassword,
            newPassword,
        };

        try {
            // Make API call
            const response = await axios.post("API_ENDPOINT", payload); // Replace 'API_ENDPOINT' with your endpoint
            if (response.status === 200) {
                alert("Password reset successfully!");
                closeModal(); // Close the modal after successful reset
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            alert("Failed to reset password. Please try again.");
        }
    };

    return (
        <div className="modal" style={{ display: "block" }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Reset Password</h5>
                        <button type="button" className="close" onClick={closeModal}>
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="oldPassword">Old Password</label>
                            <input
                                type="password"
                                id="oldPassword"
                                className="form-control"
                                value={formValues.oldPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                className="form-control"
                                value={formValues.newPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                className="form-control"
                                value={formValues.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                            Close
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleResetPassword}>
                            Reset Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminResetpassword;
