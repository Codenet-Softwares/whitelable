import React, { useState } from "react";
import strings from "../Utils/constant/stringConstant";
import { useAppContext } from "../contextApi/context";
import { getCreateSubAdmin } from "../Utils/service/initiateState";
import { CreateSubAdminSchema } from "../Utils/schema";
import { useFormik } from "formik";
import { createSubAdmin } from "../Utils/service/apiService";
import FullScreenLoader from "../components/FullScreenLoader";

const CreateSubAdmin = () => {
  const { store, dispatch } = useAppContext();
  const [createSubAdminState] = useState(getCreateSubAdmin);
  const [isLoading, setIsLoading] = useState(false)

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
      roles: createSubAdminState.roles || [{ permission: [] }],
    },
    validationSchema: CreateSubAdminSchema,
    onSubmit: async (values, action) => {
      console.log("values++===============>", values);
      await create_SubAdmin(values);
      resetForm();
    },
    enableReinitialize: true,
  });

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    const updatedPermissions = checked
      ? [...values.roles[0].permission, name]
      : values.roles[0].permission.filter((item) => item !== name);

    setFieldValue("roles[0].permission", updatedPermissions);
  };
  async function create_SubAdmin(values) {
    setIsLoading(true)
    const response = await createSubAdmin(values, true);
    setIsLoading(false)
  }

  return (
    <div className="container mt-5">
      <FullScreenLoader show={isLoading} />
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div
              className="card-header text-white p-1"
              style={{ backgroundColor: "#26416e", textAlign: "center" }}
            >
              <b className="mb-0">CREATE USER ROLE</b>
            </div>

            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label
                    htmlFor="userName"
                    className="form-label"
                    style={{ fontWeight: "bold" }}
                  >
                    UserName
                  </label>
                  <input
                    type="text"
                    className="form-control "
                    placeholder="Enter UserName"
                    name="userName"
                    // style={{ border: '1px solid black' }}
                    value={values.userName}
                    onChange={handleChange}
                  />
                  <span>
                    {errors.userName && touched.userName ? (
                      <p className="text-danger fw-bold">{errors.userName}</p>
                    ) : null}
                  </span>
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="password"
                    className="form-label"
                    style={{ fontWeight: "bold" }}
                  >
                    Password
                  </label>
                  <input
                    type="text"
                    className="form-control "
                    placeholder="Enter Password"
                    name="password"
                    // style={{ border: '1px solid black' }}
                    value={values.password}
                    onChange={handleChange}
                  />
                  <span>
                    {errors.password && touched.password ? (
                      <p className="text-danger fw-bold">{errors.password}</p>
                    ) : null}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="card bg-dark text-white">
                    <h5
                      className="card bg-dark text-white"
                      style={{ textAlign: "center" }}
                    >
                      PERMISSIONS :
                    </h5>

                    <div className="card-body">
                      {strings.roles.map((permission) => (
                        <div
                          key={permission}
                          className="form-check form-check-inline"
                        >
                          <input
                            type="checkbox"
                            className="form-check-input"
                            name={permission.role}
                            checked={values.roles[0].permission.includes(
                              permission.role
                            )}
                            onChange={handleCheckboxChange}
                          />
                          <label
                            htmlFor={permission.name}
                            className="form-check-label"
                          >
                            {permission.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleSubmit}
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
