import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { permissionObj } from '../Utils/constant/permission';
import { useAppContext } from '../contextApi/context';
import { getEditSubAdminPermission, getviewSubAdminPermission } from '../Utils/service/apiService';
import { getSubAdminPermissionData } from '../Utils/service/initiateState';
import strings from '../Utils/constant/stringConstant';
import { toast } from 'react-toastify';

const ViewSubAdminPermission = () => {
  const { id } = useParams();
  const { store, dispatch } = useAppContext();
  const [subAdminPermissionData, setSubAdminPersionData] = useState(getSubAdminPermissionData());
  const [displayEdit, setDisplayEdit] = useState(true);

  useEffect(() => {
    if (store?.admin) {
      permissionObj.allAdmin.includes(store?.admin?.roles[0].role) && getSubAdminpermisson();
    }
  }, [store?.admin]);



  const getSubAdminpermisson = async () => {
    const response = await getviewSubAdminPermission({
      _id: id,
    });
    if (response) {
      setSubAdminPersionData({
        userName: response.data.userName,
        roles: response.data.roles,
      });
    }
  }
  const handleEditSubAdminPermission = async () => {
    const permissions = subAdminPermissionData?.roles[0]?.permission;

    if (permissions.length === 0) {
      toast.error("Please select at least one permission.");
      return;
    }

    const value = {
      _id: id,
      permission: permissions,
    };

    const response = await getEditSubAdminPermission(value, true);
    if (response) {
      setDisplayEdit(true);
    }
  };
  const handleChange = () => {
    setDisplayEdit(false);
    getSubAdminPermissionData();
  };

  const handleChangeCheckBox = (event) => {
    const { name, checked } = event.target;

    setSubAdminPersionData((prevState) => {
      if (!prevState?.roles[0]) return;

      const updatedPermissions = checked
        ? [...prevState.roles[0].permission, name]
        : prevState.roles[0].permission.filter((item) => item !== name);

      return {
        ...prevState,
        roles: [
          {
            ...prevState.roles[0],
            permission: updatedPermissions,
          },
        ],
      };
    });
  };

  const viewSingleSubAdmin = () => {
    return (
      <div className="main_content_iner ">
        <div className="container-fluid p-0">
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div className="white_card card_height_100 mb_30">
                <div className="white_card_header">
                  <div className="box_header m-0">
                    <div className="main-title">
                      <h3 className="m-0">PERMISSION DETAILS</h3>
                    </div>
                  </div>
                </div>
                <div className="white_card_body">
                  <div className="QA_section">
                    <div className="white_box_tittle list_header">
                      <h4>Username: {subAdminPermissionData?.userName}</h4>
                    </div>
                    <div className="QA_table mb_30">
                      <table className="table lms_table_active3 ">
                        <thead>
                          <tr>
                            <th scope="col">PERMISSIONS ACCESSED</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subAdminPermissionData?.roles[0]?.permission &&
                            subAdminPermissionData?.roles[0]?.permission.map((user, index) => (
                              <tr key={user._id}>
                                <th>{user}</th>
                              </tr>
                            ))}
                        </tbody>
                        <button className="btn btn-info" onClick={() => handleChange()}>
                          Renew permission
                        </button>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const modifySingleSubAdmin = () => {
    return (
      <div>
        <form>
          <div className="card" style={{ backgroundColor: '' }}>
            <div
              className="card-header d-flex justify-content-between align-items-center"
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#26416e',
                width: '100%',
                justifyContent: 'space-between',
              }}
            >
              <h1 className="h4 card-title mb-0" style={{ fontWeight: 'bold', margin: 'auto', color: 'white' }}>
                Renew The Permissions
              </h1>
              <div
                className="white_box_tittle list_header text-end"
                style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold', color: 'white' }}
              >
                <span>Username: {subAdminPermissionData?.userName}</span>
                <br />
                <span>Role:{subAdminPermissionData?.roles[0]?.role}</span>
              </div>
            </div>
            <div className="card-body">
              {strings.roles.map((permission) => (
                <div className="mb-1 input-group-lg">
                  <label>
                    <input
                      type="checkbox"
                      name={permission.role}
                      value={permission.role}
                      checked={subAdminPermissionData.roles[0].permission.includes(permission.role)}
                      onChange={handleChangeCheckBox}
                    />
                    <span className="my-1">{permission.name}</span>
                  </label>
                </div>
              ))}
            </div>
            <div className="card-footer text-center">
              <div className="col-12 text-end">
                <button
                  onClick={() => handleEditSubAdminPermission()}
                  className="btn btn-primary mb-0">
                  Save
                </button>
              </div>
              <div></div>
            </div>
          </div>
        </form>
      </div>
    )
  }


  return (
    <>
      {displayEdit ? (
        viewSingleSubAdmin()
      ) : (
        modifySingleSubAdmin()
      )}
    </>
  );
};

export default ViewSubAdminPermission;
