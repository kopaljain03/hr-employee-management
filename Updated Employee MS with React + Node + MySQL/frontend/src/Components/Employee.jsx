import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";

const Employee = () => {
  const [employee, setEmployee] = useState([]);
  const [pending_employee, setPendingEmployee] = useState([]);
  const [viewPending, setViewPending] = useState(false); // toggle state

  const [columns, setColumns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const endpoint = viewPending ? "pending_employee" : "employee";
    axios
      .get(`http://localhost:3000/auth/${endpoint}`)
      .then((result) => {
        if (result.data.Status) {
          const data = result.data.Result;
          console.log("result");
          viewPending ? setPendingEmployee(data) : setEmployee(data);
          console.log(result.data.Result);
          const hiddenFields = [
            "Priority",
            "Joining Date",
            "Status",
            "Remarks",
          ];
          const baseColumns = Object.keys(data[0] || {})
            .filter((key) => !hiddenFields.includes(key))
            .map((key) => ({
              field: key,
              headerName: key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()),
              width: 200,
            }));

          setColumns(baseColumns);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, [viewPending]);

  const handleDelete = (id) => {
    axios
      .delete("http://localhost:3000/auth/delete_employee/" + id)
      .then((result) => {
        if (result.data.Status) {
          window.location.reload();
        } else {
          alert(result.data.Error);
        }
      });
  };
  return (
    <div className="px-5 mt-3">
      <div className="d-flex justify-content-center">
        <h3>{viewPending ? "Pending Employees" : "All Employees"}</h3>
      </div>
      <Link to="/dashboard/add_employee" className="btn btn-success">
        Add Employee
      </Link>

      <button
        className={`btn  mx-2 ${
          !viewPending ? "btn-primary" : "btn-outline-primary"
        }`}
        onClick={() => setViewPending(false)}
      >
        Show All Employees
      </button>
      <button
        className={`btn ${viewPending ? "btn-primary" : "btn-outline-primary"}`}
        onClick={() => setViewPending(true)}
      >
        Show Pending Employees
      </button>

      <div className="mt-3">
        <DataGrid
          rows={viewPending ? pending_employee : employee}
          columns={columns}
          getRowId={(row) => row["Id no."]}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20, 100]}
          rowHeight={40}
          disableSelectionOnClick
        />
      </div>
    </div>
  );
};

export default Employee;
