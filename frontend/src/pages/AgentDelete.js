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
  const { store, showLoader, hideLoader } = useAppContext();
  const [viewAgentDelete, setViewAgentDelete] = useState([]);
  const [reload, setReload] = useState(false); 
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [search, setSearch] = useState("");
  const id = store?.admin?.id;
  const pageLimit = 10;

  async function viewApprovedDelete() {
    const response = await viewTrash_api({
      adminId: id,
      page,
      pageLimit,
      search,
    });
    setViewAgentDelete(response?.data);
    setTotalData(response?.pagination?.totalItems);
    setTotalPage(response?.pagination?.totalPages);
  }

  const selectPageHandler = (selectedPage) => {
    setPage(selectedPage);
  };

  useEffect(() => {
    viewApprovedDelete();
  }, [reload, page, pageLimit, search]); 

  const startIndex = Math.min((page - 1) * pageLimit + 1);
  const endIndex = Math.min(page * pageLimit, totalData);

  // async function handleDeleteAgent(id) {

  //   const response = await deleteTrash_api({ trashId: id });
  //   if (response) {
  //     toast.info(response.message);
  //     setReload(!reload);
  //   }
  // }

  // async function handleRestore(adminId) {
  //   const data = { adminId: adminId };
  //   const response = await restoreTrash_api(data);
  //   if (response) {
  //     toast.info(response.message);
  //     setReload(!reload);
  //   }
  // }
  async function handleDeleteAgent(id) {
    showLoader(); // Show loader before starting the async operation
    try {
      const response = await deleteTrash_api({ trashId: id });
      if (response) {
        toast.info(response.message);
        setReload(!reload);
      }
    } catch (error) {
      toast.error("An error occurred while deleting. Please try again.");
    } finally {
      hideLoader(); // Hide loader in the finally block
    }
  }

  async function handleRestore(adminId) {
    const data = { adminId: adminId };
    showLoader(); // Show loader before starting the async operation
    try {
      const response = await restoreTrash_api(data);
      if (response) {
        toast.info(response.message);
        setReload(!reload);
      }
    } catch (error) {
      toast.error("An error occurred while restoring. Please try again.");
    } finally {
      hideLoader(); // Hide loader in the finally block
    }
  }

  return (
    <>
      <div className="container d-flex justify-content-center mt-5">
        <div className="p-2">
          <div>
            <h3
              className="text-center text-uppercase fw-bold"
              style={{ color: "#1E2761", textDecoration: "underline" }}
            >
              Deleted Agents
            </h3>
            <div className="white_box_tittle list_header">
              <div className="col-2 text-center">
                <select
                  className="form-select form-select-sm"
                  aria-label=".form-select-sm example"
                  onChange={(e) => selectPageHandler("totalEntries", e.target.value)}
                >
                  <option value="10">Show 10 Entries</option>
                  <option value="25">25 Entries</option>
                  <option value="50">50 Entries</option>
                  <option value="100">100 Entries</option>
                </select>
              </div>
  
              <div className="serach_field_2 ms-auto" style={{ marginLeft: "-10px" }}>
                <div className="search_inner">
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="search_field">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        type="text"
                        placeholder="Search content here..."
                      />
                    </div>
                    <button type="submit">
                      <i className="ti-search"></i>
                    </button>
                  </form>
                </div>
              </div>
            </div>
  
            <div className="main_data">
              <table className="table m-2 mt-4">
                <thead
                  style={{
                    height: "10px",
                    backgroundColor: "#1E2761",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  <tr align="center">
                    <th scope="col">SL. NO.</th>
                    <th scope="col" style={{ fontWeight: "bold", color: "white" }}>
                      AGENT NAME
                    </th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {viewAgentDelete?.length > 0 ? (
                    viewAgentDelete?.map((data, index) => (
                      <tr key={data.id} className="bg-light text-dark" align="center">
                        <th scope="row">{index + 1}</th>
                        <td className="h6 fw-bold">{data.userName}</td>
                        <td>
                          <button
                            className="btn text-dark fw-bold mx-2"
                            style={{ background: "#ED5E68" }}
                            onClick={() => handleDeleteAgent(data.trashId)}
                          >
                            Delete <i className="fa-solid fa-trash text-dark"></i>
                          </button>
                          <button
                            className="btn text-dark rounded fw-bold"
                            style={{ background: "#F5C93A" }}
                            onClick={() => handleRestore(data.adminId)}
                          >
                            Restore <i className="fa-solid fa-arrow-rotate-left"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" align="center">
                        <div
                          className="alert mt-3 p-3 text-center"
                          style={{
                            background: "#1E2761",
                            color: "white",
                            borderRadius: "10px",
                            fontSize: "18px",
                          }}
                          role="alert"
                        >
                          No Delete Request Found
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
  
            {viewAgentDelete?.length > 0 && (
              <Pagination
                currentPage={page}
                totalPages={totalPage}
                handlePageChange={selectPageHandler}
                startIndex={startIndex}
                endIndex={endIndex}
                totalData={totalData}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
  
};

export default AgentDelete;
