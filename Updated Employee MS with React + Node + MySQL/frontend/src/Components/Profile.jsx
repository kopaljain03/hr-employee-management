import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { downloadExcel } from "../utils/downloadUtil";

const Employee = () => {
  const [allEmployees, setAllEmployees] = useState([]); // Full unfiltered list
  const [finalEmployees, setFinalEmployees] = useState([]);
  const [columns, setColumns] = useState([]);
  const [finalcolumns, setfinalColumns] = useState([]);

  const [viewFinal, setViewFinal] = useState(false); // Toggle between all/final employees

  const navigate = useNavigate();
  const actionColumn = {
    field: "actions",
    headerName: "Actions",
    width: 180,
    renderCell: (params) => {
      return (
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm btn-info`}
            onClick={() => handleSelect(params.row)}
          >
            Finalize
          </button>
        </div>
      );
    },
  };
  useEffect(() => {
    // Fetch selected employees
    const fetchSelectedEmployees = axios.get(
      `http://localhost:3000/auth/selected_employee`
    );

    // Fetch final employees
    const fetchFinalEmployees = axios.get(
      `http://localhost:3000/auth/final_employee`
    );

    Promise.all([fetchSelectedEmployees, fetchFinalEmployees])
      .then(([selectedRes, finalRes]) => {
        // Handle selected employees
        if (selectedRes.data.Status) {
          const selectedData = selectedRes.data.Result;
          setAllEmployees(selectedData);

          const baseColumns = Object.keys(selectedData[0] || {}).map((key) => ({
            field: key,
            headerName: key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            width: 200,
            editable: ["Priority", "Remarks", "Status"].includes(key), // Only these fields are editable
          }));

          setColumns((prev) => [actionColumn, ...baseColumns]);
          setfinalColumns((prev) => [...baseColumns]);
        } else {
          alert(selectedRes.data.Error);
        }

        // Handle final employees
        if (finalRes.data.Status) {
          const finalData = finalRes.data.Result;
          console.log("Final employees:", finalData);
          setFinalEmployees(finalData);
        } else {
          alert(finalRes.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);
  const processRowUpdate = async (newRow, oldRow) => {
    console.log("new row ::");
    console.log(newRow);
    // try {
    //   // Only send updates if values actually changed
    //   if (
    //     newRow.Priority !== oldRow.Priority ||
    //     newRow.Remarks !== oldRow.Remarks ||
    //     newRow.Status !== oldRow.Status
    //   ) {
    //     const response = await axios.put(
    //       `http://localhost:3000/auth/update_employee`,
    //       newRow
    //     );
    //     if (!response.data.Status) {
    //       alert(response.data.Error);
    //       return oldRow;
    //     }
    //   }
    //   return newRow;
    // } catch (error) {
    //   console.error("Failed to update employee:", error);
    //   return oldRow;
    // }
  };

  const handleSelect = (row) => {
    console.log(row);
    axios
      .post(`http://localhost:3000/auth/add_final_employee`, row)
      .then((result) => {
        if (result.data.Status) {
          alert(`Employee selected`);
          window.location.reload();
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="px-5 mt-3">
      <div className="my-2 d-flex gap-2">
        <button
          className={`btn ${
            !viewFinal ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setViewFinal(false)}
        >
          Show Selected Employees
        </button>
        <button
          className={`btn ${viewFinal ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setViewFinal(true)}
        >
          Show Final Employees
        </button>
        <button
          className="btn btn-success"
          onClick={() => downloadExcel(allEmployees, "Selected_Employees")}
        >
          Download Selected Employees
        </button>

        <button
          className="btn btn-success"
          onClick={() => downloadExcel(finalEmployees, "Final_Employees")}
        >
          Download Final Employees
        </button>
      </div>

      <div className="mt-3">
        {viewFinal ? (
          <DataGrid
            rows={finalEmployees}
            columns={finalcolumns}
            getRowId={(row) => row["Id no."]}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20, 100]}
            rowHeight={35}
            disableSelectionOnClick
            processRowUpdate={processRowUpdate}
            experimentalFeatures={{ newEditingApi: true }}
          />
        ) : (
          <DataGrid
            rows={allEmployees}
            columns={columns}
            getRowId={(row) => row["Id no."]}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20, 100]}
            rowHeight={35}
            disableSelectionOnClick
          />
        )}
      </div>
    </div>
  );
};

export default Employee;
