import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

const AddEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // get ID from URL
  const [employeeData, setEmployeeData] = useState(null);

  const fields = [
    {
      name: "name",
      label: "Name",
      type: "text",
      placeholder: "Enter Name",
    },
    {
      name: "fathers_name",
      label: "Father's Name",
      type: "text",
      placeholder: "Enter father's name",
    },
    {
      name: "dob",
      label: "Date of Birth",
      type: "date",
    },
    {
      name: "ssc",
      label: "SSC Marks",
      type: "text",
    },
    {
      name: "hsc",
      label: "HSC Marks",
      type: "text",
    },
    {
      name: "ug",
      label: "Undergraduate Marks",
      type: "text",
    },
    {
      name: "pg",
      label: "Postgraduate Marks",
      type: "text",
    },
    {
      name: "reference",
      label: "Reference",
      type: "text",
    },
    {
      name: "received_date",
      label: "Received Date",
      type: "date",
    },
    {
      name: "remarks",
      label: "Remarks",
      type: "text",
    },
    {
      name: "age",
      label: "Age",
      type: "number",
    },
  ];
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.slice(0, 10); // Cuts "2024-06-01T00:00:00.000Z" to "2024-06-01"
  };

  useEffect(() => {
    console.log(`http://localhost:3000/auth/pending_employee/${id}`);
    axios
      .get(`http://localhost:3000/auth/pending_employee/${id}`)
      .then((res) => {
        if (res.data.Status) {
          const raw = res.data.Result[0];
          const mapped = {};

          fields.forEach((field) => {
            if (["dob", "received_date"].includes(field.name)) {
              mapped[field.name] = formatDate(raw[field.name]);
            } else {
              mapped[field.name] = raw[field.name] || "";
            }
          });
          mapped.gender = raw["gender"] || "";

          console.log("Fetched pending user data:", res.data.Result[0]);
          setEmployeeData(mapped);
        } else {
          alert(res.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setEmployeeData({
      ...employeeData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 🔍 Check if employee exists
      const res = await axios.post(
        "http://localhost:3000/auth/check_employee_exists_for_update",
        {
          name: employeeData.name,
          fathers_name: employeeData.fathers_name,
          currentId: id,
        }
      );

      // ⚠️ Confirm if duplicate found
      if (res.data.exists) {
        const result = await Swal.fire({
          title: "Possible Duplicate",
          text: "An employee with the same name and father's name already exists. Do you still want to update this record?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, update it",
          cancelButtonText: "No, cancel",
        });

        if (!result.isConfirmed) return;
      }

      // ✅ Prepare update data
      const updatedData = {
        ...employeeData,
        status: "candidate",
      };

      // 🔄 Perform update
      const result = await axios.post(
        `http://localhost:3000/auth/update_employee/${id}`,
        updatedData
      );

      if (result.data.Status) {
        const insertedId = result.data.InsertedId;
        Swal.fire({
          icon: "success",
          title: "Employee Updated",
          text: `Employee updated with ID: ${insertedId}`,
        });
        navigate("/dashboard/admin/employee");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.data.Error,
        });
      }
    } catch (err) {
      console.error("Error during update flow:", err);

      // 🔴 Decide which error it was based on context
      const isExistCheckError = err?.config?.url?.includes(
        "check_employee_exists_for_update"
      );
      const errorTitle = isExistCheckError ? "Check Failed" : "Update Failed";
      const errorMessage = isExistCheckError
        ? "Something went wrong while checking employee existence."
        : "Something went wrong while updating.";

      Swal.fire({
        icon: "error",
        title: errorTitle,
        text: errorMessage,
      });
    }
  };

  const handleDelete = () => {
    axios
      .delete(`http://localhost:3000/auth/delete_employee/${id}`)
      .then((res) => {
        if (res.data.Status) {
          Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "Employee deleted successfully.",
          });

          navigate("/dashboard/admin/employee"); // Redirect after delete
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Error: ${res.data.Error}`,
          });
        }
      })
      .catch((err) => {
        console.error("Delete failed:", err);
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: "Something went wrong while deleting.",
        });
      });
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-3">
      <div className="p-3 rounded w-50 border">
        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => navigate(-1)}
          ></button>
        </div>
        <h3 className="text-center">Review Employee</h3>
        {employeeData && (
          <form className="row g-1" onSubmit={handleSubmit}>
            {fields.map((field) => (
              <div className="col-12" key={field.name}>
                <label htmlFor={field.name} className="form-label">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  className="form-control rounded-0"
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  autoComplete="off"
                  value={employeeData[field.name] || ""}
                  onChange={handleChange}
                />
              </div>
            ))}
            <div className="col-12">
              <label htmlFor="gender" className="form-label">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                className="form-select"
                onChange={handleChange}
                value={employeeData.gender || ""}
              >
                <option value="">-- Select Gender --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <span className="d-flex gap-2">
              <button
                type="submit"
                onClick={handleSubmit}
                className="btn btn-primary w-50"
              >
                Update Employee
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-danger w-50"
              >
                Delete
              </button>
            </span>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddEmployee;
