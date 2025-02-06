import React, { useState, useEffect } from "react";

const ActivityLog = ({ props }) => {
  const isLocalhost = window.location.hostname === "localhost";
  const lastLoginTimeUTC = props.lastLoginTime;
  const lastLoginTimeLocal = new Date(lastLoginTimeUTC).toLocaleString();

  const [activityLog, setActivityLog] = useState({
    iP: "Loading..",
    region: "Loading..",
    country: "Loading..",
    loginStatus: "Loading..",
    isp: "Loading..",
  });

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setActivityLog({
        iP: props.ip?.iP || "N/A",
        region: props.ip?.region || "N/A",
        country: props.ip?.country || "N/A",
        loginStatus: props.loginStatus || "N/A",
        isp: props.ip?.isp || "N/A",
      });
    };

    fetchData();
  }, [props]);

  return (
    <div className="col-sm-8 mt-3">
      <div className="card w-100 rounded">
        <div
          className="card-header text-white p-2 text-center text-uppercase"
          style={{ backgroundColor: "#1E2761" }}
        >
          <b>&nbsp;&nbsp;Activity Log</b>
        </div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item p-3">
            <table className="table table-bordered table-responsive-sm">
              <thead style={{ background: "#E6E9ED" }}>
                <tr className="table-active">
                  <th scope="col"> Date & Time</th>
                  <th scope="col">Login Status</th>
                  <th scope="col">IP Address</th>
                  <th scope="col">ISP</th>
                  <th scope="col">City/State/Country</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{lastLoginTimeLocal}</td>
                  <td>{activityLog.loginStatus}</td>
                  <td>{activityLog.iP}</td>
                  <td>
                    {isLocalhost ? "NDA" : activityLog.isp}
                  </td>
                  <td>
                    {activityLog.region} / {activityLog.country}
                  </td>
                </tr>
              </tbody>
            </table>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ActivityLog;
