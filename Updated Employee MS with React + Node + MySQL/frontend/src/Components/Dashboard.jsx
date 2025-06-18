import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  const [role, setRole] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 🔄 Sidebar toggle

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);
  const handleLogout = () => {
    axios
      .get("http://localhost:3000/auth/logout", { withCredentials: true })
      .then((result) => {
        if (result.data.Status) {
          localStorage.removeItem("valid");
          localStorage.removeItem("role");
          navigate("/");
        }
      })
      .catch((err) => console.error("Logout error:", err));
  };

  return (
    <div className="container-fluid h-100" style={{zoom: 0.9}}>
      <div className="row flex-nowrap h-100">
        {/* Sidebar */}
        <motion.div
          animate={{ width: isSidebarOpen ? 270 : 60 }}
          transition={{ duration: 0.3 }}
          className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark overflow-hidden"
        >
          <div className="d-flex flex-column align-items-center align-items-sm-start px-2 pt-2 text-white min-vh-100">
            <div className="w-100 d-flex justify-content-between align-items-center mb-2">
              <Link
                to="/dashboard"
                className={`d-flex align-items-center text-white text-decoration-none`}
              >
                {isSidebarOpen && (
                  <div className="d-flex align-items-center">
                    <img
                      src="/delta_logo.jpeg"
                      alt="Logo"
                      style={{
                        width: "50px",
                        height: "50px",
                        marginRight: "10px",
                        objectFit: "contain",
                      }}
                    />
                    <span className="fs-5 fw-bold">Delta Pharma Ltd.</span>
                  </div>
                )}
              </Link>
              <button
                className="btn btn-sm text-white"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <motion.i
                  className="bi bi-chevron-left"
                  animate={{ rotate: isSidebarOpen ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                />
              </button>
            </div>

            <ul className="nav nav-pills flex-column mb-auto w-100">
              <li>
                <Link
                  to="/dashboard"
                  className="nav-link text-white px-2"
                  title="Dashboard"
                >
                  <i className="fs-5 bi-speedometer2 me-2"></i>
                  {isSidebarOpen && <span>Dashboard</span>}
                </Link>
              </li>
              <li>
                <Link
                  to={
                    role === "admin"
                      ? "/dashboard/admin/employee"
                      : "/dashboard/employee"
                  }
                  className="nav-link text-white px-2"
                  title="Manage Employees"
                >
                  <i className="fs-5 bi-people me-2"></i>
                  {isSidebarOpen && <span>Manage Candidates</span>}
                </Link>
              </li>
              {role === "admin" && (
                <>
                  <li>
                    <Link
                      to="/dashboard/category"
                      className="nav-link text-white px-2"
                      title="Filter Employee"
                    >
                      <i className="fs-5 bi-columns me-2"></i>
                      {isSidebarOpen && <span>Filter Candidates</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard/profile"
                      className="nav-link text-white px-2"
                      title="Selected Employees"
                    >
                      <i className="fs-5 bi-person me-2"></i>
                      {isSidebarOpen && <span>Deleted Candidates</span>}
                    </Link>
                  </li>
                </>
              )}
              <li>
                <button
                  className="nav-link text-white px-2 w-100 text-start bg-transparent border-0"
                  onClick={handleLogout}
                >
                  <i className="fs-5 bi-power me-2"></i>
                  {isSidebarOpen && <span>Logout</span>}
                </button>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="col p-0 m-0">
          <div
  className="p-2 d-flex justify-content-center shadow bg-white"
  style={{
    position: "sticky",
    top: 0,
    right: 0,
    zIndex: 1000,
  }}
>
  <h4 className="m-0">Casual CV Management System</h4>
</div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
