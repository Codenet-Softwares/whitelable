import React, { useEffect, useState } from "react";
import {
  deleteTrash_api,
  restoreTrash_api,
  viewTrash_api,
} from "../Utils/service/apiService";
import { toast } from "react-toastify";
import { useAppContext } from "../contextApi/context";

const AgentDelete = () => {
  const { store } = useAppContext();
  console.log("======>>> id from store", store);
  const [viewAgentDelete, setViewAgentDelete] = useState([]);
  const [reload, setReload] = useState(false); // state to trigger reload
  const id = store?.admin?.id;

  async function viewApprovedDelete() {
    const response = await viewTrash_api({adminId:id 
    });
    console.log("======>>> response", response);
    setViewAgentDelete(response.data);
  }

  useEffect(() => {
    viewApprovedDelete();
  }, [reload]);

  async function handleDeleteAgent(id) {
    console.log("onclick user trash id", id);

    const response = await deleteTrash_api({ trashId: id });
    if (response) {
      toast.info(response.message);
      setReload(!reload);
    }
  }

  async function handleRestore(adminId) {
    console.log("onclick adminId ===== >>", adminId);
    const data = { adminId: adminId };
    const response = await restoreTrash_api(data);
    if (response) {
      toast.info(response.message);
      setReload(!reload);
    }
  }

  return (
    <>
      {viewAgentDelete.length > 0 ? (
        <div className="container d-flex justify-content-center">
          <div className="p-2">
            <div>
              <table className="table m-2">
                <thead
                  style={{
                    height: "10px",
                    backgroundColor: "#006699",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  <tr>
                    <th scope="col">SL. NO.</th>
                    <th
                      scope="col"
                      style={{ fontWeight: "bold", color: "white" }}
                    >
                      AGENT NAME
                    </th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                {viewAgentDelete.map((data, index) => (
                  <tr key={data.id}>
                    <th scope="row">{index + 1}</th>
                    <td>{data.userName}</td>
                    <td>
                      <button
                        className="btn btn-danger text-dark rounded"
                        onClick={() => handleDeleteAgent(data.trashId)}
                      >
                        Delete
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-info text-dark rounded"
                        onClick={() => handleRestore(data.adminId)}
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="container alert alert-warning mt-1" role="alert">
          <p className="d-flex justify-content-center">
            No Delete Request Found
          </p>
        </div>
      )}
    </>
  );
};

export default AgentDelete;
