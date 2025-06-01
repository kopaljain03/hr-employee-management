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
      name: "fathers_name", // ✅ changed to match backend
      label: "Father's Name",
      type: "text",
      placeholder: "Enter father's name",
    },
    { name: "dob", label: "Date of Birth", type: "date" },
    { name: "ssc", label: "SSC Marks", type: "text" }, // ✅ renamed
    { name: "hsc", label: "HSC Marks", type: "text" },
    { name: "ug", label: "Undergrad Marks", type: "text" },
    { name: "pg", label: "Post Grad Marks", type: "text" },
    { name: "reference", label: "Reference", type: "text" }, // ✅ renamed

    { name: "remarks", label: "Remarks", type: "text" },
  ];

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
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
    const requiredFields = ["name", "fathers_name", "dob", "ssc", "gender"];
    for (const field of requiredFields) {
      if (!employee[field]) {
        alert("Please fill in all required fields.");
        return;
      }
    }
    axios
      .post("http://localhost:3000/auth/check_employee_exists", {
        name: employee.name,
        fathers_name: employee.fathers_name,
      })
      .then((res) => {
        if (res.data.exists) {
          const proceed = window.confirm(
            `id ${res.data.Results.applicant_id} has the same name and fathers name please do confirm humanly by DOB if you want an entry or not , we do not like to have a duplicate entry !`
          );
          if (!proceed) return;
        }

        // Now proceed to actual insert
        const endpoint = role === "employee" ? "employee" : "auth";
        axios
          .post(`http://localhost:3000/${endpoint}/add_employee`, employee)
          .then((result) => {
            if (result.data.Status) {
              if (role === "employee") navigate("/dashboard/employee");
              else navigate("/dashboard/admin/employee");
            } else {
              alert(result.data.Error);
            }
          })
          .catch((err) => console.log(err));
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
        <h3 className="text-center">Add Applicant</h3>
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
                required={["name", "fathers_name", "dob", "ssc"].includes(
                  field.name
                )}
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
              required
            >
              <option value="">-- Select Gender --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary w-100">
              Add Applicant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
