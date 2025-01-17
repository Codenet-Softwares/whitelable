import React, { useEffect, useState } from "react";
import {
  deleteTrash_api,
  restoreTrash_api,
  viewTrash_api,
} from "../Utils/service/apiService";
import { toast } from "react-toastify";
import { useAppContext } from "../contextApi/context";
import Pagination from "../components/common/Pagination";


const AgentDelete = () => {
  const { store } = useAppContext();
  console.log("======>>> id from store", store);
  const [viewAgentDelete, setViewAgentDelete] = useState([]);
  const [reload, setReload] = useState(false); // state to trigger reload
  const [page, setPage] = useState(1)
  const [totalData, setTotalData] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [search, setSearch] = useState("")
  const id = store?.admin?.id;
  const pageLimit = 10;

  async function viewApprovedDelete() {
    const response = await viewTrash_api({ adminId: id, page, pageLimit, search });
    console.log("======>>> response", response);
    setViewAgentDelete(response.data);
    setTotalData(response?.pagination?.totalItems)
    setTotalPage(response?.pagination?.totalPages)
  }

  const selectPageHandler = (selectedPage) => {
    console.log(selectedPage);
    setPage(selectedPage);
  };

  useEffect(() => {
    viewApprovedDelete();
  }, [reload, page]);

  const startIndex = Math.min((page - 1) * pageLimit + 1);
  const endIndex = Math.min(page * pageLimit, totalData);

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
        <div className="container d-flex justify-content-center mt-5">
          <div className="p-2">
            <div>
              <h3 className="text-center text-uppercase fw-bold" style={{ color: "#1E2761", textDecoration: "underline" }}>Deleted Agents</h3>
              <table className="table m-2 mt-4">
                <thead
                  style={{
                    height: "10px",
                    backgroundColor: "#1E2761",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  <tr align='center'>
                    <th scope="col">SL. NO.</th>
                    <th
                      scope="col"
                      style={{ fontWeight: "bold", color: "white" }}
                    >
                      AGENT NAME
                    </th>
                    <th >Action</th>

                  </tr>
                </thead>
                {viewAgentDelete.map((data, index) => (
                  <tr key={data.id} className="bg-light text-dark" align='center'>
                    <th scope="row">{index + 1}</th>
                    <td className="h6 fw-bold">{data.userName}</td>
                    <td>
                      <button
                        className="btn text-dark fw-bold mx-2" style={{ background: "#ED5E68" }}
                        onClick={() => handleDeleteAgent(data.trashId)}
                      >
                        Delete <i class="fa-solid fa-trash text-dark"></i>
                      </button>
                      <button
                        className="btn text-dark rounded fw-bold" style={{ background: "#F5C93A" }}
                        onClick={() => handleRestore(data.adminId)}
                      >
                        Restore  <i class="fa-solid fa-arrow-rotate-left"></i>
                      </button>
                    </td>

                  </tr>
                ))}
              </table>
              <Pagination
                currentPage={page}
                totalPages={totalPage}
                handlePageChange={selectPageHandler}
                startIndex={startIndex}
                endIndex={endIndex}
                totalData={totalData}
              />

            </div>
          </div>
        </div>
      ) : (
        <div
          className="container alert mt-5 p-5 w-25 text-center"
          style={{
            background: "#1E2761",
            position: "absolute",
            top: "45%",
            left: "55%",
            transform: "translate(-50%, -50%)",
            border: "2px solid #fff"
          }}
          role="alert"
        >
          <p className="h4 text-white p-4">No Delete Request Found</p>
        </div>
      )}
    </>
  );
};

export default AgentDelete;
