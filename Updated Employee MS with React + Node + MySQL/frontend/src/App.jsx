import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./Components/Login";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "./Components/Dashboard";
import Home from "./Components/Home";
import Employee from "./Components/Employee";
import Category from "./Components/Category";
import Profile from "./Components/Profile";

import AddEmployee from "./Components/AddEmployee";
import EmployeeLogin from "./Components/EmployeeLogin";
import EmployeeDetail from "./Components/EmployeeDetail";
import Admin_Employee from "./Components/Admin_Employee";
import ReviewAdd from "./Components/ReviewAdd";
import ReviewSelect from "./Components/ReviewSelect";
import AdminRoute from "./Components/AdminRoute";
import Unauthorized from "./Components/Unauthorized";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/adminlogin" element={<Login />}></Route>
        <Route path="/employee_login" element={<EmployeeLogin />}></Route>
        <Route path="/employee_detail/:id" element={<EmployeeDetail />}></Route>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="" element={<Home />}></Route>
          <Route path="/dashboard/employee" element={<Employee />}></Route>
          <Route
            path="admin/employee"
            element={
              <AdminRoute>
                <Admin_Employee />
              </AdminRoute>
            }
          />
          <Route
            path="admin/employee/review/:id"
            element={
              <AdminRoute>
                <ReviewAdd />
              </AdminRoute>
            }
          />
          <Route
            path="admin/employee/reviewselect/:id"
            element={
              <AdminRoute>
                <ReviewSelect />
              </AdminRoute>
            }
          />
          <Route
            path="category"
            element={
              <AdminRoute>
                <Category />
              </AdminRoute>
            }
          />
          <Route
            path="profile"
            element={
              <AdminRoute>
                <Profile />
              </AdminRoute>
            }
          />

          <Route
            path="/dashboard/add_employee"
            element={<AddEmployee />}
          ></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
