import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import FilterPanel from "./Admin_Filter";
import { applyCombinedFilter } from "../utils/filterUtils";

const Employee = () => {
  const [employee, setEmployee] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]); // Full unfiltered list
  const [showSelected, setShowSelected] = useState(false);

  const [columns, setColumns] = useState([]);

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [flaggedEmployees, setFlaggedEmployees] = useState([]);
  const navigate = useNavigate();
  const actionColumn = {
    field: "actions",
    headerName: "Actions",
    width: 180,
    renderCell: (params) => {
      const isSelected = selectedEmployees.some(
        (emp) => emp["Id no."] === params.row["Id no."]
      );

      const isFlagged = flaggedEmployees.some(
        (emp) => emp["Id no."] === params.row["Id no."]
      );

      return (
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${isFlagged ? "btn-danger" : "btn-warning"}`}
            onClick={() => handleFlag(params.row)}
          >
            {isFlagged ? "Flagged" : "Flag"}
          </button>
          <button
            className={`btn btn-sm ${isSelected ? "btn-success" : "btn-info"}`}
            onClick={() => handleSelect(params.row)}
            disabled={isSelected}
          >
            {isSelected ? "Selected" : "Select"}
          </button>
        </div>
      );
    },
  };
  useEffect(() => {
    const endpoint = "employee";
    axios
      .get(`http://localhost:3000/auth/${endpoint}`)
      .then((result) => {
        if (result.data.Status) {
          const data = result.data.Result;
          console.log("result");
          setEmployee(data);
          setAllEmployees(data);
          console.log(result.data.Result);
          const baseColumns = Object.keys(data[0] || {}).map((key) => ({
            field: key,
            headerName: key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            width: 200,
          }));

          setColumns((prev) => [actionColumn, ...baseColumns]);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);
  const handlePendingRowClick = (id) => {
    console.log("Clicked Pending Employee with ID:", id);
    navigate(`/dashboard/admin/employee/review/${id}`);
  };
  const handleClearFilters = () => {
    setEmployee(allEmployees);
  };
  const handleFlag = (row) => {
    console.log("Flagged:", row);
    setFlaggedEmployees((prev) => {
      const exists = prev.some((emp) => emp["Id no."] === row["Id no."]);
      return exists ? prev : [...prev, row];
    });
    console.log(flaggedEmployees);
  };

  const handleSelect = (row) => {
    setSelectedEmployees((prev) => {
      const exists = prev.some((emp) => emp["Id no."] === row["Id no."]);
      return exists ? prev : [...prev, row];
    });
  };

  const referenceValues = ["Ref1", "Ref2", "Ref3"]; // replace dynamically if needed

  const handleSearch = (filters) => {
    console.log("Applied Filters: ", filters);
    const filteredResults = applyCombinedFilter(allEmployees, filters);
    setEmployee(filteredResults);
    console.log("Filtered Results:", filteredResults);
  };
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
      <FilterPanel referenceValues={referenceValues} onSearch={handleSearch} />
      <div className="my-2 d-flex gap-2">
        <button className="btn btn-secondary" onClick={handleClearFilters}>
          Clear All Filters
        </button>
        <button
          className={`btn ${
            showSelected ? "btn-outline-primary" : "btn-primary"
          }`}
          onClick={() => setShowSelected((prev) => !prev)}
        >
          {showSelected ? "Hide Selected Employees" : "Show Selected Employees"}
        </button>
      </div>

      <div className="mt-3">
        {!showSelected ? (
          <DataGrid
            rows={employee}
            columns={columns}
            getRowId={(row) => row["Id no."]}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20, 100]}
            rowHeight={35}
            disableSelectionOnClick
          />
        ) : (
          <div>
            <h5>Selected Employees</h5>
            <DataGrid
              rows={selectedEmployees}
              columns={columns}
              getRowId={(row) => row["Id no."]}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20, 100]}
              rowHeight={35}
              disableSelectionOnClick
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Employee;
