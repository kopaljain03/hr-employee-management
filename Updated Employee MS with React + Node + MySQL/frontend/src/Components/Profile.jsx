import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";

const DeletedEmployeeTable = () => {
  const [deletedEmployees, setDeletedEmployees] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    fetchDeletedEmployees();
  }, []);

  const fetchDeletedEmployees = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/auth/deleted_employees"
      );
      if (response.data.Status) {
        const data = response.data.Result || [];

        setDeletedEmployees(data);

        if (data.length > 0) {
          const baseColumns = Object.keys(data[0]).map((key) => ({
            field: key,
            headerName: key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            width: 150,
          }));
          setColumns(baseColumns);
        }
      } else {
        alert(response.data.Error || "Failed to load deleted employees");
      }
    } catch (err) {
      console.error("Error fetching deleted employees:", err);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "1100px" }}>
      <h4 className="mb-3">Deleted Candidates</h4>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={deletedEmployees}
          columns={columns}
          getRowId={(row) => row.applicant_id || row.id}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25, 100]}
          rowHeight={35}
        />
      </div>
    </div>
  );
};

export default DeletedEmployeeTable;
