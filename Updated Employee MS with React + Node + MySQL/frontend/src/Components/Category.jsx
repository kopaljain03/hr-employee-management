import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import FilterPanel from "./Admin_Filter";
import { applyCombinedFilter } from "../utils/filterUtils";
import { downloadExcel } from "../utils/downloadUtil";

const Employee = () => {
  const [employee, setEmployee] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]); // Full unfiltered list
  const [showAll, setShowAll] = useState(false); // 🆕 state for toggling
  const [clearFiltersTrigger, setClearFiltersTrigger] = useState(false); // NEW
  const [referenceValues, setReferenceValues] = useState([]);

  const [columns, setColumns] = useState([]);
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
            Select
          </button>
        </div>
      );
    },
  };
  const fetchEmployees = async () => {
    const endpoint = "employee";
    try {
      const result = await axios.get(`http://localhost:3000/auth/${endpoint}`);
      if (result.data.Status) {
        const data = result.data.Result;
        setEmployee(data);
        setAllEmployees(data);

        // Set references
        const referenceSet = new Set();
        data.forEach((emp) => {
          const ref = emp.Reference || emp.reference;
          if (ref) referenceSet.add(ref);
        });
        setReferenceValues([...referenceSet]);

        // Set columns only once
        const baseColumns = Object.keys(data[0] || {}).map((key) => ({
          field: key,
          headerName: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          width: 200,
        }));

        setColumns([actionColumn, ...baseColumns]);
      } else {
        alert(result.data.Error);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);
  const handlePendingRowClick = (id) => {
    console.log("Clicked Pending Employee with ID:", id);
    navigate(`/dashboard/admin/employee/review/${id}`);
  };
  const handleClearFilters = () => {
    setEmployee(allEmployees);
    setClearFiltersTrigger((prev) => !prev); // Toggle to trigger reset in child
  };

  const handleSelect = (row) => {
    console.log(row);
    axios
      .post(`http://localhost:3000/auth/add_selected_employee`, row)
      .then((result) => {
        if (result.data.Status) {
          alert(`Employee selected`);
          fetchEmployees();
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleSearch = (filters) => {
    console.log("Applied Filters: ", filters);
    const filteredResults = applyCombinedFilter(allEmployees, filters);
    setEmployee(filteredResults);
    console.log("Filtered Results:", filteredResults);
  };

  return (
    <div className="px-5 mt-3">
      <FilterPanel
        referenceValues={referenceValues}
        onSearch={handleSearch}
        clearTrigger={clearFiltersTrigger}
      />
      <div className="my-2 d-flex gap-2">
        <button className="btn btn-secondary" onClick={handleClearFilters}>
          Clear All Filters
        </button>
        <button
          className={`btn ${
            showAll ? "btn-primary text-white" : "btn-outline-primary"
          }`}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Hide All Employees" : "Show All Employees"}
        </button>
        <button
          className="btn btn-success"
          onClick={() => downloadExcel(allEmployees, "All_Employees")}
        >
          Download All Employees
        </button>

        <button
          className="btn btn-success"
          onClick={() => downloadExcel(employee, "Filtered_Employees")}
        >
          Download Filtered Employees
        </button>
      </div>

      <div className="mt-3">
        <DataGrid
          rows={showAll ? allEmployees : employee}
          columns={columns}
          getRowId={(row) => row["applicant_id"]}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20, 100]}
          rowHeight={35}
          disableSelectionOnClick
        />
      </div>
    </div>
  );
};

export default Employee;
