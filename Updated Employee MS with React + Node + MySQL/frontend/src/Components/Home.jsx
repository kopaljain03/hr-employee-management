import axios from "axios";
import React, { useEffect, useState } from "react";

const Home = () => {
  const [pendingApplicants, setPendingApplicants] = useState(0);
  const [waitingCandidates, setWaitingCandidates] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [adminList, setAdminList] = useState([]);

  useEffect(() => {
    fetchPendingApplicants();
    fetchWaitingCandidates();
    fetchSelectedCount();
    fetchAdminList();
  }, []);

  const fetchPendingApplicants = () => {
    axios.get("http://localhost:3000/auth/admin_count").then((res) => {
      if (res.data.Status) {
        setPendingApplicants(res.data.Result[0].admin);
      }
    });
  };

  const fetchWaitingCandidates = () => {
    axios.get("http://localhost:3000/auth/employee_count").then((res) => {
      if (res.data.Status) {
        setWaitingCandidates(res.data.Result[0].employee);
      }
    });
  };

  const fetchSelectedCount = () => {
    axios.get("http://localhost:3000/auth/salary_count").then((res) => {
      if (res.data.Status) {
        setSelectedCount(res.data.Result[0].salaryOFEmp);
      }
    });
  };

  const fetchAdminList = () => {
    axios.get("http://localhost:3000/auth/user_records").then((res) => {
      if (res.data.Status) {
        setAdminList(res.data.Result);
      }
    });
  };

  return (
    <div>
      <div className="p-3 d-flex justify-content-around mt-3">
        <div className="px-3 pt-2 pb-3 border shadow-sm w-25">
          <div className="text-center pb-1">
            <h4>Pending Applicants</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total:</h5>
            <h5>{pendingApplicants}</h5>
          </div>
        </div>

        <div className="px-3 pt-2 pb-3 border shadow-sm w-25">
          <div className="text-center pb-1">
            <h4>Waiting Candidates</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total:</h5>
            <h5>{waitingCandidates}</h5>
          </div>
        </div>

        <div className="px-3 pt-2 pb-3 border shadow-sm w-25">
          <div className="text-center pb-1">
            <h4>Selected</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total:</h5>
            <h5>{selectedCount}</h5>
          </div>
        </div>
      </div>

      <div className="mt-4 px-5 pt-3">
  <h3>List of Admins</h3>
  <table className="table table-striped table-bordered">
    <thead className="table-dark">
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
      </tr>
    </thead>
    <tbody>
      {adminList.map((admin) => (
        <tr key={admin.id || admin.email}>
          <td>{admin.name}</td>
          <td>{admin.email}</td>
          <td>{admin.role}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
};

export default Home;
