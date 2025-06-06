import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AddEmployee = () => {
  const [employee, setEmployee] = useState({});
  const navigate = useNavigate();
  const [role, setRole] = useState(""); // 🔹 Role state

  const fields = [
    { name: "name", label: "Name", type: "text", placeholder: "Enter Name" },
    {
      name: "father_name",
      label: "Father Name",
      type: "text",
      placeholder: "Enter father's name",
    },
    {
      name: "DOB",
      label: "Date-of-birth",
      type: "date",
    },
    {
      name: "education_SSC",
      label: "SSC marks",
      type: "text",
    },
    {
      name: "education_HSC",
      label: "HSC marks",
      type: "text",
    },
    {
      name: "education_UG",
      label: "Undergrad marks",
      type: "text",
    },
    {
      name: "education_PG",
      label: "Post Grad Marks",
      type: "text",
    },
    {
      name: "referance",
      label: "Referance",
      type: "text",
    },
    {
      name: "remarks",
      label: "Remarks",
      type: "text",
    },
  ];

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
    axios
      .get("http://localhost:3000/auth/category")
      .then((result) => {
        if (result.data.Status) {
          setCategory(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setEmployee({
      ...employee,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(employee);
    var endpoint = role == "employee" ? "employee" : "auth";
    axios
      .post(`http://localhost:3000/${endpoint}/add_employee`, employee)
      .then((result) => {
        if (result.data.Status) {
          if (role == "employee") navigate("/dashboard/employee");
          else navigate("/dashboard/admin/employee");
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
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
        <h3 className="text-center">Add Employee</h3>
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
              value={employee.gender || ""}
            >
              <option value="">-- Select Gender --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary w-100">
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
