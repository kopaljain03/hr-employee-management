import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import FilterPanel from "./Admin_Filter";
import { applyCombinedFilter } from "../utils/filterUtils";
import { downloadExcel } from "../utils/downloadUtil";
import { getColumnWidths } from "../utils/widthUtil";
import FinalizeModal from "./FinalizeModal";
import SelectModal from "./SelectModal";
import Swal from "sweetalert2";

const Employee = () => {
  const [employee, setEmployee] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]); // Full unfiltered list
  const [showAll, setShowAll] = useState(false); // 🆕 state for toggling
  const [clearFiltersTrigger, setClearFiltersTrigger] = useState(false); // NEW
  const [referenceValues, setReferenceValues] = useState([]);

  const [columns, setColumns] = useState([]);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [finalizeFormData, setFinalizeFormData] = useState({ remarks: "" });
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [selectFormData, setSelectFormData] = useState({
    priority: "",
  });
  const handleSelectClick = (row) => {
    setCurrentRow(row);
    setSelectFormData({ priority: "" });
    setShowSelectModal(true);
  };

  const handleSelectModalChange = (e) => {
    const { name, value } = e.target;
    setSelectFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectSubmit = () => {
    const payload = { ...currentRow, ...selectFormData };

    axios
      .post(`http://localhost:3000/auth/add_selected_employee`, payload)
      .then((result) => {
        if (result.data.Status) {
          Swal.fire({
            icon: "info",
            title: "Employee Selected",
            text: "Employee selected",
          });

          fetchEmployees();
          setShowSelectModal(false);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: result.data.Error,
          });
        }
      })
      .catch((err) => console.log(err));
  };

  const handleFinalizeClick = (row) => {
    setCurrentRow(row);
    setFinalizeFormData({ remarks: "" });
    setShowFinalizeModal(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setFinalizeFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFinalizeSubmit = async () => {
    try {
      const payload = { ...currentRow, ...finalizeFormData };
      const result = await axios.post(
        `http://localhost:3000/auth/add_final_employee`,
        payload
      );
      if (result.data.Status) {
        Swal.fire({
          icon: "success",
          title: "Finalized",
          text: "Employee finalized!",
        });

        fetchEmployees();
        setShowFinalizeModal(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.data.Error,
        });
      }
    } catch (err) {
      console.error("Error finalizing employee:", err);
    }
  };

  const navigate = useNavigate();
  const actionColumn = {
    field: "actions",
    headerName: "Actions",
    width: 180,
    renderCell: (params) => {
      const status = params.row.status?.toLowerCase();

      const isCandidate = status === "candidate";
      const isSelected = status === "selected";
      const isClosedOrPending = status === "closed" || status === "pending";

      return (
        <div className="d-flex gap-2 align-items-center">
          {isCandidate && (
            <button
              className="btn btn-sm btn-info"
              onClick={() => handleSelectClick(params.row)}
            >
              Select
            </button>
          )}

          {isSelected && (
            <button
              className="btn btn-sm btn-success"
              onClick={() => handleFinalizeClick(params.row)}
            >
              Finalize
            </button>
          )}

          {isClosedOrPending && (
            <button className="btn btn-sm btn-secondary" disabled>
              Select
            </button>
          )}

          <button
            className="btn btn-sm btn-warning"
            style={{
              fontSize: "0.8rem",
              padding: "1px 2px",
              height: "auto",
            }}
            onClick={() => handleEdit(params.row)}
          >
            Edit
          </button>

          <button
            className="btn btn-sm btn-danger py-0 px-0"
            style={{
              fontSize: "0.8rem",
              padding: "1px 3px",
              height: "auto",
            }}
            onClick={() => handleDelete(params.row)}
          >
            Delete
          </button>
        </div>
      );
    },
  };

  const handleEdit = (row) => {
    navigate(`/dashboard/admin/employee/reviewselect/${row.applicant_id}`);
  };

  const handleDelete = async (row) => {
    const confirmResult = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you really want to delete ${row.name}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
    });

    if (!confirmResult.isConfirmed) return;

    axios
      .delete(`http://localhost:3000/auth/delete_employee/${row.applicant_id}`)
      .then((result) => {
        if (result.data.Status) {
          Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "Employee deleted",
          });

          fetchEmployees();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: result.data.Error,
          });
        }
      })
      .catch((err) => {
        console.error("Error deleting employee:", err);
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: "Something went wrong while deleting the employee.",
        });
      });
  };

  const fetchEmployees = async () => {
    try {
      const result = await axios.get(`http://localhost:3000/auth/all_employee`);
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
        const widths = getColumnWidths(data);

        const baseColumns = Object.keys(data[0] || {}).map((key) => ({
          field: key,
          headerName: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          width: widths[key] || 130,
        }));

        const statusColumnIndex = baseColumns.findIndex(
          (col) => col.field === "status"
        );
        let statusColumn = null;

        if (statusColumnIndex !== -1) {
          statusColumn = baseColumns.splice(statusColumnIndex, 1)[0]; // remove and capture
        }

        // Reorder: Actions, Status, then rest
        setColumns(
          [actionColumn, statusColumn, ...baseColumns].filter(Boolean)
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.data.Error,
        });
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

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
          Swal.fire({
            icon: "info",
            title: "Employee Selected",
            text: "Employee selected",
          });

          fetchEmployees();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: result.data.Error,
          });
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
    <div
      className="px-5 mt-3 container-sm"
      style={{ maxHeight: "600px", maxWidth: "1100px" }}
    >
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
          Download All Candidates
        </button>

        <button
          className="btn btn-success"
          onClick={() => downloadExcel(employee, "Filtered_Employees")}
        >
          Download Filtered Candidates
        </button>
      </div>

      <div className="mt-3" style={{ height: 300, width: "100%" }}>
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
      <FinalizeModal
        show={showFinalizeModal}
        onClose={() => setShowFinalizeModal(false)}
        onChange={handleModalChange}
        onSubmit={handleFinalizeSubmit}
        data={finalizeFormData}
      />
      <SelectModal
        show={showSelectModal}
        onClose={() => setShowSelectModal(false)}
        onChange={handleSelectModalChange}
        onSubmit={handleSelectSubmit}
        data={selectFormData}
      />
    </div>
  );
};

export default Employee;
