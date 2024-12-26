import React, { useState, useEffect } from "react";
// import { useAuth } from "../../Utils/Auth";
// import MyAccountServices from "../../Services/AccountServices";

const ActivityLog = ({ props }) => {
  // console.log('====>>> props data ',props)
  const lastLoginTimeUTC = props.lastLoginTime;
  const lastLoginTimeLocal = new Date(lastLoginTimeUTC).toLocaleString();
  console.log("Props  Activity Log =>>>", props);
  const [activityLog, setActivityLog] = useState({
    iP: "Loading..",
    region: "Loading..",
    country: "Loading..",
  }); // Set initial state to null

  useEffect(() => {
    // Fetch props after 3 seconds (simulating asynchronous data fetching)
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setActivityLog(props.ip);
    };

    fetchData();
  }, [props]);
  console.log("====>>> IP ", activityLog.iP);
  // Render null if activityLog is still null
  if (activityLog === null) {
    return null;
  }

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
            <table className="table table-bordered table-responsive-sm table-responsive-md table-responsive-lg table-responsive-xl">
              <thead style={{background:"#E6E9ED"}}>
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
                  <td scope="row">{lastLoginTimeLocal}</td>
                  <td>No Data From Serverside</td>

                  <td>{activityLog.iP}</td>
                  <td>No Data From Serverside</td>
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
