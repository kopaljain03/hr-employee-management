// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { Button, Modal, Form } from "react-bootstrap";
// import { DataGrid } from "@mui/x-data-grid";
// import { downloadExcel } from "../utils/downloadUtil";
// import { getColumnWidths } from "../utils/widthUtil";

// const Employee = () => {
//   const [allEmployees, setAllEmployees] = useState([]);
//   const [finalEmployees, setFinalEmployees] = useState([]);
//   const [columns, setColumns] = useState([]);
//   const [finalcolumns, setfinalColumns] = useState([]);
//   const [viewFinal, setViewFinal] = useState(false);

//   const [showModal, setShowModal] = useState(false);
//   const [currentRow, setCurrentRow] = useState(null);
//   const [formData, setFormData] = useState({ priority: "", remarks: "" });

//   const handleShowModal = (row) => {
//     setCurrentRow(row);
//     setFormData({ priority: row.priority || "", remarks: "" });
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setCurrentRow(null);
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFinalize = async () => {
//     try {
//       const payload = { ...currentRow, ...formData };
//       const result = await axios.post(
//         `http://localhost:3000/auth/add_final_employee`,
//         payload
//       );
//       if (result.data.Status) {
//         alert("Employee finalized!");
//         fetchSelectedEmployees();
//         fetchFinalEmployees();
//         handleCloseModal();
//       } else {
//         alert(result.data.Error);
//       }
//     } catch (err) {
//       console.error("Error finalizing employee:", err);
//     }
//   };

//   const actionColumn = {
//     field: "actions",
//     headerName: "Actions",
//     width: 180,
//     renderCell: (params) => {
//       return (
//         <Button
//           size="sm"
//           variant="info"
//           onClick={() => handleShowModal(params.row)}
//         >
//           Finalize
//         </Button>
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
//         const widths = getColumnWidths(selectedData);

//         const baseColumns = Object.keys(selectedData[0] || {}).map((key) => ({
//           field: key,
//           headerName: key
//             .replace(/_/g, " ")
//             .replace(/\b\w/g, (l) => l.toUpperCase()),
//           width: widths[key] || 130,
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
//         const widths = getColumnWidths(finalData);

//         const baseColumns_final = Object.keys(finalData[0] || {}).map(
//           (key) => ({
//             field: key,
//             headerName: key
//               .replace(/_/g, " ")
//               .replace(/\b\w/g, (l) => l.toUpperCase()),
//             width: widths[key] || 80,
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

//   return (
//     <div className="px-5 mt-3" style={{ maxWidth: "1000px", margin: "auto" }}>
//       <div className="my-2 d-flex gap-2">
//         <Button
//           variant={!viewFinal ? "primary" : "outline-primary"}
//           onClick={() => setViewFinal(false)}
//         >
//           Show Selected Employees
//         </Button>
//         <Button
//           variant={viewFinal ? "primary" : "outline-primary"}
//           onClick={() => setViewFinal(true)}
//         >
//           Show Final Employees
//         </Button>
//         <Button
//           variant="success"
//           onClick={() => downloadExcel(allEmployees, "Selected_Employees")}
//         >
//           Download Selected Employees
//         </Button>
//         <Button
//           variant="success"
//           onClick={() => downloadExcel(finalEmployees, "Final_Employees")}
//         >
//           Download Final Employees
//         </Button>
//       </div>

//       <div className="mt-3" style={{ height: 500, width: "100%" }}>
//         {viewFinal ? (
//           <DataGrid
//             key="final"
//             rows={finalEmployees}
//             columns={finalcolumns}
//             getRowId={(row) => row["applicant_id"]}
//             pageSize={10}
//             rowsPerPageOptions={[5, 10, 20, 100]}
//             rowHeight={35}
//             disableSelectionOnClick
//           />
//         ) : (
//           <DataGrid
//             key="selected"
//             rows={allEmployees}
//             columns={columns}
//             getRowId={(row) => row["applicant_id"]}
//             pageSize={10}
//             rowsPerPageOptions={[5, 10, 20, 100]}
//             rowHeight={35}
//             disableSelectionOnClick
//           />
//         )}
//       </div>

//       {/* Bootstrap Modal */}
//       <Modal show={showModal} onHide={handleCloseModal} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Finalize Employee</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group controlId="formPriority" className="mb-3">
//               <Form.Label>Priority</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="priority"
//                 value={formData.priority}
//                 onChange={handleFormChange}
//                 placeholder="Enter priority"
//               />
//             </Form.Group>
//             <Form.Group controlId="formRemarks">
//               <Form.Label>Remarks</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 name="remarks"
//                 rows={3}
//                 value={formData.remarks}
//                 onChange={handleFormChange}
//                 placeholder="Add any remarks"
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={handleFinalize}>
//             Finalize
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default Employee;

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
