import React, { useState, useEffect } from "react";
import Pagination from "../components/common/Pagination";

const ReusableTable = ({
  columns,
  itemsPerPage,
  showSearch,
  paginationVisible,
  fetchData,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [loading, setLoading] = useState(false);

  // Function to fetch data from backend
  const fetchDataForTable = async () => {
    setLoading(true);
    try {
      const response = await fetchData(currentPage, itemsPerPage, searchTerm);
      setData(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalData(response.pagination?.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.length === 0) {
      // setCurrentPage(1);
      fetchDataForTable();
    } else {
      const timer = setTimeout(() => {
        setCurrentPage(1);
        fetchDataForTable();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchTerm, currentPage, itemsPerPage, fetchData]);

  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const calculateSerialNumber = (index) => {
    return (currentPage - 1) * itemsPerPage + index + 1;
  };

  return (
    <div className="table-container-reusable">
      {/* Search Input (conditionally rendered) */}
      {showSearch && (
        <input
          type="text"
          placeholder="Search..."
          className="form-control mb-3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}

      {/* Table */}
      <table className="table table-bordered table-striped text-center table-hover">
        <thead className="table-dark">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="text-uppercase">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center">
                Loading...
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key} className="text-uppercase">
                    {column.key === "serialNumber"
                      ? calculateSerialNumber(index)
                      : column.render
                      ? column.render(row, index)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {paginationVisible && data.length > 0 && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={onPageChange}
          startIndex={(currentPage - 1) * itemsPerPage + 1}
          endIndex={Math.min(currentPage * itemsPerPage, totalData)}
          totalData={totalData}
        />
      )}
    </div>
  );
};

export default ReusableTable;
