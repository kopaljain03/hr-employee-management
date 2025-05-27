import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
      sqlname: "Name",
    },
    {
      name: "father_name",
      label: "Father Name",
      type: "text",
      placeholder: "Enter father's name",
      sqlname: "Father Name",
    },
    {
      name: "DOB",
      label: "Date-of-birth",
      type: "date",
      sqlname: "Date of",
    },
    {
      name: "education_SSC",
      label: "SSC marks",
      type: "text",
      sqlname: "Education SSC",
    },
    {
      name: "education_HSC",
      label: "HSC marks",
      type: "text",
      sqlname: "Education HSC",
    },
    {
      name: "education_UG",
      label: "Undergrad marks",
      type: "text",
      sqlname: "Education Undergrad",
    },
    {
      name: "education_PG",
      label: "Post Grad Marks",
      type: "text",
      sqlname: "Education Post grad.",
    },
    {
      name: "referance",
      label: "Referance",
      type: "text",
      sqlname: "Reference",
    },
    {
      name: "remarks",
      label: "Remarks",
      type: "text",
      sqlname: "Remarks",
    },
  ];

  useEffect(() => {
    console.log(`http://localhost:3000/auth/pending_employee/${id}`);
    axios
      .get(`http://localhost:3000/auth/pending_employee/${id}`)
      .then((res) => {
        if (res.data.Status) {
          const raw = res.data.Result[0];
          const mapped = {};

          fields.forEach((field) => {
            mapped[field.name] = raw[field.sqlname] || "";
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

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(employeeData);
    axios
      .post(`http://localhost:3000/auth/update_employee/${id}`, employeeData)
      .then((result) => {
        if (result.data.Status) {
          const insertedId = result.data.InsertedId;
          alert(`Employee added with ID: ${insertedId}`);
          navigate("/dashboard/admin/employee");
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };
  const handleDelete = () => {
    axios
      .delete(`http://localhost:3000/auth/delete_employee/${id}`)
      .then((res) => {
        if (res.data.Status) {
          alert("Employee deleted successfully.");
          navigate("/dashboard/admin/employee"); // Redirect after delete
        } else {
          alert("Error: " + res.data.Error);
        }
      })
      .catch((err) => {
        console.error("Delete failed:", err);
        alert("Something went wrong while deleting.");
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
