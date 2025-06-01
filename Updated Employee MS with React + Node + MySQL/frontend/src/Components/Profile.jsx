// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { DataGrid } from "@mui/x-data-grid";
// import { downloadExcel } from "../utils/downloadUtil";

// const Employee = () => {
//   const [allEmployees, setAllEmployees] = useState([]); // Full unfiltered list
//   const [finalEmployees, setFinalEmployees] = useState([]);
//   const [columns, setColumns] = useState([]);
//   const [finalcolumns, setfinalColumns] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [priority, setPriority] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);

//   const [viewFinal, setViewFinal] = useState(false); // Toggle between all/final employees

//   const navigate = useNavigate();
//   const actionColumn = {
//     field: "actions",
//     headerName: "Actions",
//     width: 180,
//     renderCell: (params) => {
//       return (
//         <div className="d-flex gap-2">
//           <button
//             className={`btn btn-sm btn-info`}
//             onClick={() => openModal(params.row)}
//           >
//             Finalize
//           </button>
//         </div>
//       );
//     },
//   };
//   const fetchSelectedEmployees = async () => {
//     try {
//       const res = await axios.get(
//         "http://localhost:3000/auth/selected_employee"
//       );
//       if (res.data.Status) {
//         const selectedData = res.data.Result;
//         setAllEmployees(selectedData);
//         const baseColumns = Object.keys(selectedData[0] || {}).map((key) => ({
//           field: key,
//           headerName: key
//             .replace(/_/g, " ")
//             .replace(/\b\w/g, (l) => l.toUpperCase()),
//           width: 200,
//         }));
//         setColumns([actionColumn, ...baseColumns]);
//       } else {
//         alert(res.data.Error);
//       }
//     } catch (err) {
//       console.error("Failed to fetch selected employees:", err);
//     }
//   };
//   const fetchFinalEmployees = async () => {
//     try {
//       const res = await axios.get("http://localhost:3000/auth/final_employee");
//       if (res.data.Status) {
//         const finalData = res.data.Result;
//         setFinalEmployees(finalData);
//         const baseColumns_final = Object.keys(finalData[0] || {}).map(
//           (key) => ({
//             field: key,
//             headerName: key
//               .replace(/_/g, " ")
//               .replace(/\b\w/g, (l) => l.toUpperCase()),
//             width: 200,
//             editable: ["remarks"].includes(key),
//           })
//         );
//         setfinalColumns([...baseColumns_final]);
//       } else {
//         alert(res.data.Error);
//       }
//     } catch (err) {
//       console.error("Failed to fetch final employees:", err);
//     }
//   };

//   useEffect(() => {
//     fetchSelectedEmployees();
//     fetchFinalEmployees();
//   }, []);
//   const openModal = (employee) => {
//     setSelectedEmployee(employee);
//     setPriority(employee.priority || "");
//     setRemarks(employee.remarks || "");
//     setShowModal(true);
//   };
//   const closeModal = () => {
//     setShowModal(false);
//     setSelectedEmployee(null);
//     setPriority("");
//     setRemarks("");
//   };
//   const handleFinalize = () => {
//     const updatedEmployee = {
//       ...selectedEmployee,
//       priority,
//       remarks,
//     };

//     axios
//       .post("http://localhost:3000/auth/add_final_employee", updatedEmployee)
//       .then((result) => {
//         if (result.data.Status) {
//           alert("Employee finalized");
//           closeModal();
//           fetchSelectedEmployees();
//           fetchFinalEmployees();
//         } else {
//           alert(result.data.Error);
//         }
//       })
//       .catch((err) => console.error(err));
//   };
//   const processRowUpdate = async (newRow, oldRow) => {
//     console.log("new row ::");
//     console.log(newRow);
//     // try {
//     //   // Only send updates if values actually changed
//     //   if (
//     //     newRow.Priority !== oldRow.Priority ||
//     //     newRow.Remarks !== oldRow.Remarks ||
//     //     newRow.Status !== oldRow.Status
//     //   ) {
//     //     const response = await axios.put(
//     //       `http://localhost:3000/auth/update_employee`,
//     //       newRow
//     //     );
//     //     if (!response.data.Status) {
//     //       alert(response.data.Error);
//     //       return oldRow;
//     //     }
//     //   }
//     //   return newRow;
//     // } catch (error) {
//     //   console.error("Failed to update employee:", error);
//     //   return oldRow;
//     // }
//   };

//   const handleSelect = (row) => {
//     console.log(row);
//     axios
//       .post(`http://localhost:3000/auth/add_final_employee`, row)
//       .then((result) => {
//         if (result.data.Status) {
//           alert(`Employee selected`);
//           fetchSelectedEmployees(); // ✅ Re-fetch only the selected list
//           fetchFinalEmployees();
//         } else {
//           alert(result.data.Error);
//         }
//       })
//       .catch((err) => console.log(err));
//   };

//   return (
//     <div
//       className="px-5 mt-3"
//       style={{
//         maxWidth: "1000px",
//         maxHeight: "500px",
//         margin: "auto",
//         padding: "1rem",
//       }}
//     >
//       <div className="my-2 d-flex gap-2">
//         <button
//           className={`btn ${
//             !viewFinal ? "btn-primary" : "btn-outline-primary"
//           }`}
//           onClick={() => setViewFinal(false)}
//         >
//           Show Selected Employees
//         </button>
//         <button
//           className={`btn ${viewFinal ? "btn-primary" : "btn-outline-primary"}`}
//           onClick={() => setViewFinal(true)}
//         >
//           Show Final Employees
//         </button>
//         <button
//           className="btn btn-success"
//           onClick={() => downloadExcel(allEmployees, "Selected_Employees")}
//         >
//           Download Selected Employees
//         </button>

//         <button
//           className="btn btn-success"
//           onClick={() => downloadExcel(finalEmployees, "Final_Employees")}
//         >
//           Download Final Employees
//         </button>
//       </div>

//       <div className="mt-3">
//         {viewFinal ? (
//           <div style={{ height: 500, width: "100%" }}>
//             <DataGrid
//               key="final"
//               rows={finalEmployees}
//               columns={finalcolumns}
//               getRowId={(row) => row["applicant_id"]}
//               pageSize={10}
//               rowsPerPageOptions={[5, 10, 20, 100]}
//               rowHeight={35}
//               disableSelectionOnClick
//             />
//           </div>
//         ) : (
//           <div style={{ height: 500, width: "100%" }}>
//             <DataGrid
//               key="selected"
//               rows={allEmployees}
//               columns={columns}
//               getRowId={(row) => row["applicant_id"]}
//               pageSize={10}
//               rowsPerPageOptions={[5, 10, 20, 100]}
//               rowHeight={35}
//               disableSelectionOnClick
//             />
//           </div>
//         )}
//       </div>
//       {/* Modal Overlay */}
//       {showModal && (
//         <div
//           className="modal fade show"
//           tabIndex="-1"
//           role="dialog"
//           style={{
//             display: "block",
//             backgroundColor: "rgba(0, 0, 0, 0.5)",
//           }}
//         >
//           <div className="modal-dialog" role="document">
//             <div className="modal-content p-3">
//               <div className="modal-header">
//                 <h5 className="modal-title">Finalize Employee</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={closeModal}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <div className="form-group mb-2">
//                   <label>Priority</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     value={priority}
//                     onChange={(e) => setPriority(e.target.value)}
//                   />
//                 </div>
//                 <div className="form-group mb-2">
//                   <label>Remarks</label>
//                   <textarea
//                     className="form-control"
//                     value={remarks}
//                     onChange={(e) => setRemarks(e.target.value)}
//                   ></textarea>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button className="btn btn-secondary" onClick={closeModal}>
//                   Cancel
//                 </button>
//                 <button className="btn btn-primary" onClick={handleFinalize}>
//                   Finalize
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Employee;

import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import { downloadExcel } from "../utils/downloadUtil";
import { getColumnWidths } from "../utils/widthUtil";

const Employee = () => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [finalEmployees, setFinalEmployees] = useState([]);
  const [columns, setColumns] = useState([]);
  const [finalcolumns, setfinalColumns] = useState([]);
  const [viewFinal, setViewFinal] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [formData, setFormData] = useState({ priority: "", remarks: "" });

  const handleShowModal = (row) => {
    setCurrentRow(row);
    setFormData({ priority: row.priority || "", remarks: row.remarks || "" });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentRow(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFinalize = async () => {
    try {
      const payload = { ...currentRow, ...formData };
      const result = await axios.post(
        `http://localhost:3000/auth/add_final_employee`,
        payload
      );
      if (result.data.Status) {
        alert("Employee finalized!");
        fetchSelectedEmployees();
        fetchFinalEmployees();
        handleCloseModal();
      } else {
        alert(result.data.Error);
      }
    } catch (err) {
      console.error("Error finalizing employee:", err);
    }
  };

  const actionColumn = {
    field: "actions",
    headerName: "Actions",
    width: 180,
    renderCell: (params) => {
      return (
        <Button
          size="sm"
          variant="info"
          onClick={() => handleShowModal(params.row)}
        >
          Finalize
        </Button>
      );
    },
  };

  const fetchSelectedEmployees = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/auth/selected_employee"
      );
      if (res.data.Status) {
        const selectedData = res.data.Result;
        setAllEmployees(selectedData);
        const widths = getColumnWidths(selectedData);

        const baseColumns = Object.keys(selectedData[0] || {}).map((key) => ({
          field: key,
          headerName: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          width: widths[key] || 130,
        }));
        setColumns([actionColumn, ...baseColumns]);
      } else {
        alert(res.data.Error);
      }
    } catch (err) {
      console.error("Failed to fetch selected employees:", err);
    }
  };

  const fetchFinalEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:3000/auth/final_employee");
      if (res.data.Status) {
        const finalData = res.data.Result;
        setFinalEmployees(finalData);
        const widths = getColumnWidths(finalData);

        const baseColumns_final = Object.keys(finalData[0] || {}).map(
          (key) => ({
            field: key,
            headerName: key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            width: widths[key] || 80,
          })
        );
        setfinalColumns([...baseColumns_final]);
      } else {
        alert(res.data.Error);
      }
    } catch (err) {
      console.error("Failed to fetch final employees:", err);
    }
  };

  useEffect(() => {
    fetchSelectedEmployees();
    fetchFinalEmployees();
  }, []);

  return (
    <div className="px-5 mt-3" style={{ maxWidth: "1000px", margin: "auto" }}>
      <div className="my-2 d-flex gap-2">
        <Button
          variant={!viewFinal ? "primary" : "outline-primary"}
          onClick={() => setViewFinal(false)}
        >
          Show Selected Employees
        </Button>
        <Button
          variant={viewFinal ? "primary" : "outline-primary"}
          onClick={() => setViewFinal(true)}
        >
          Show Final Employees
        </Button>
        <Button
          variant="success"
          onClick={() => downloadExcel(allEmployees, "Selected_Employees")}
        >
          Download Selected Employees
        </Button>
        <Button
          variant="success"
          onClick={() => downloadExcel(finalEmployees, "Final_Employees")}
        >
          Download Final Employees
        </Button>
      </div>

      <div className="mt-3" style={{ height: 500, width: "100%" }}>
        {viewFinal ? (
          <DataGrid
            key="final"
            rows={finalEmployees}
            columns={finalcolumns}
            getRowId={(row) => row["applicant_id"]}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20, 100]}
            rowHeight={35}
            disableSelectionOnClick
          />
        ) : (
          <DataGrid
            key="selected"
            rows={allEmployees}
            columns={columns}
            getRowId={(row) => row["applicant_id"]}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20, 100]}
            rowHeight={35}
            disableSelectionOnClick
          />
        )}
      </div>

      {/* Bootstrap Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Finalize Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formPriority" className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Control
                type="text"
                name="priority"
                value={formData.priority}
                onChange={handleFormChange}
                placeholder="Enter priority"
              />
            </Form.Group>
            <Form.Group controlId="formRemarks">
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                as="textarea"
                name="remarks"
                rows={3}
                value={formData.remarks}
                onChange={handleFormChange}
                placeholder="Add any remarks"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleFinalize}>
            Finalize
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Employee;
