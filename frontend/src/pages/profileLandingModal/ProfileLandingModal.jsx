import React from "react";
import strings from "../../Utils/constant/stringConstant";
import { useParams, useNavigate } from "react-router-dom";
import useProfileLandingModalData from "../../hook/useProfileLandingModalData";

const ProfileLandingModal = () => {
  const { userName, toggle = "Statement" } = useParams();
  const navigate = useNavigate();
  const { data } = useProfileLandingModalData(userName, toggle);

  // Determine the component to render based on the toggle value
  let componentToRender;
  switch (toggle) {
    case "Statement":
      componentToRender = (
        <div>
          {/* Render content for Statement */}
          {/* <h3>Statement Data</h3> */}
          {/* <pre>{JSON.stringify(data.statementView, null, 2)}</pre> */}
        </div>
      );
      break;
    case "Activity":
      componentToRender = (
        <div>
          {/* Render content for Activity */}
          {/* <h3>Activity Log</h3> */}
          {/* <pre>{JSON.stringify(data.activityLogView, null, 2)}</pre> */}
        </div>
      );
      break;
    default:
      componentToRender = <div>Choose a valid tab.</div>;
  }

  return (
    <div className="container">
      <div className="row row-no-gutters">
        <div className="col-sm-4">
          <span className="me-3" onClick={() => navigate(-1)}>
            <button className="btn btn-secondary">&#8592;</button>
          </span>
          <div className="card mt-3" style={{ width: "18rem" }}>
            <ul className="list-group list-group-flush">
              {strings.selectionTab.map((tab) => {
                return (
                  <li
                    className="list-group-item"
                    key={tab.toggletab}
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        toggle === tab.toggletab ? "#d1d9f0" : "",
                    }}
                    onClick={() =>
                      navigate(`/account-landing/${userName}/${tab.toggletab}`)
                    }
                  >
                    {tab.name}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        {/* Render the selected component */}
        {componentToRender}
      </div>
    </div>
  );
};

export default ProfileLandingModal;
