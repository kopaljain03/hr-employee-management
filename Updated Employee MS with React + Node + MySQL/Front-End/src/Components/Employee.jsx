import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";

const Employee = () => {
  const [employee, setEmployee] = useState([]);
  const [columns, setColumns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/employee")
      .then((result) => {
        if (result.data.Status) {
          const employeeData = result.data.Result;

          setEmployee(result.data.Result);
          console.log(result.data.Result);
          // const columns_new = Object.keys(employeeData[0] || {}).map((key) => ({
          //   field: key,
          //   headerName: key
          //     .replace(/_/g, " ")
          //     .replace(/\b\w/g, (l) => l.toUpperCase()),
          //   width: 150,
          //   flex: 1,
          // }));
          // setColumns(columns_new);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);

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
        <h3>Employee List</h3>
      </div>
      <Link to="/dashboard/add_employee" className="btn btn-success">
        Add Employee
      </Link>
      <div className="mt-3">
        {/* <table className="table">
          <thead>
            <tr>
              {employee.length > 0 &&
                Object.keys(employee[0]).map((key) => <th key={key}>{key}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employee.map((e) => (
              <tr key={e.id}>
                {Object.keys(e).map((key) => (
                  <td key={key}>{e[key]}</td>
                ))}
                <td>
                  <Link
                    to={`/dashboard/edit_employee/${e.id}`}
                    className="btn btn-info btn-sm me-2"
                  >
                    Edit
                  </Link>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleDelete(e.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          
        </table> */}
        {/* {employee.length > 0 ? (
          <DataGrid
            rows={employee}
            columns={columns}
            getRowId={(row) => row.id}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20, 100]}
            disableSelectionOnClick
          />
        ) : (
          <p>No data found</p>
        )} */}
      </div>
    </div>
  );
};

export default Employee;
