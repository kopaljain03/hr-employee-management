import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = express.Router();
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Utility to format date to YYYY-MM-DD
const formatDate = (isoString) => {
  const date = new Date(isoString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * from users Where email = ? and password = ?";
  con.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length > 0) {
      const email = result[0].email;
      const token = jwt.sign(
        { role: "admin", email: email, id: result[0].id },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      res.cookie("token", token);
      return res.json({ loginStatus: true, role: "admin" });
    } else {
      return res.json({ loginStatus: false, Error: "wrong email or password" });
    }
  });
});

// image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
});
// end imag eupload
router.post("/check_employee_exists", (req, res) => {
  const { name, fathers_name } = req.body;

  const sql = `SELECT * FROM applicant WHERE name = ? AND fathers_name = ?`;
  con.query(sql, [name, fathers_name], (err, results) => {
    if (err) {
      return res.json({ Status: false, Error: "Query Error" });
    }

    if (results.length > 0) {
      return res.json({ exists: true, Results: results[0] });
    }

    return res.json({ exists: false });
  });
});

router.post("/add_employee", upload.single("image"), (req, res) => {
  const sql = `INSERT INTO applicant 
    (name, fathers_name, dob, gender, age, ssc, hsc, ug, pg, reference, received_date, remarks, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'candidate')`;
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  // ✅ Calculate age from DOB
  const calculateAge = (birthdate) => {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  const age = calculateAge(req.body.dob);
  const values = [
    req.body.name,
    req.body.fathers_name,
    req.body.dob,
    req.body.gender,
    age,
    req.body.ssc,
    req.body.hsc,
    req.body.ug,
    req.body.pg,
    req.body.reference,
    today,
    req.body.remarks,
  ];

  con.query(sql, values, (err, result) => {
    if (err) {
      return res.json({ Status: false, Error: "Query Error" });
    }
    return res.json({ Status: true });
  });
});

router.post("/add_selected_employee", upload.single("image"), (req, res) => {
  const sql = `INSERT INTO selected (applicant_id, select_date) VALUES (?, ?)`;
  const select_date = new Date();
  con.query(sql, [req.body.applicant_id, select_date], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    const updateStatus = `UPDATE applicant SET status = 'selected' WHERE applicant_id = ?`;
    con.query(updateStatus, [req.body.applicant_id], (err) => {
      if (err) return res.json({ Status: false, Error: "Query Error" });
      return res.json({
        Status: true,
        Result: result,
        InsertedId: req.body.applicant_id,
      });
    });
  });

  // return res.json({ Status: true, Result: result, InsertedId: insertedId });
});

router.post("/add_final_employee", upload.single("image"), (req, res) => {
  const sql = `INSERT INTO closed (applicant_id, remarks, priority) VALUES (?, ?, ?)`;
  con.query(
    sql,
    [req.body.applicant_id, req.body.remarks, req.body.priority],
    (err, result) => {
      if (err) return res.json({ Status: false, Error: "Query Error" });
      const updateStatus = `UPDATE applicant SET status = 'closed' WHERE applicant_id = ?`;
      con.query(updateStatus, [req.body.applicant_id], (err) => {
        if (err) return res.json({ Status: false, Error: "Query Error" });
        return res.json({ Status: true });
      });
    }
  );

  // return res.json({ Status: true, Result: result, InsertedId: insertedId });
});

router.get("/employee", (req, res) => {
  const status = "candidate";
  const sql = "SELECT * FROM applicant WHERE status = ?";
  con.query(sql, [status], (err, results) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    const formattedResults = results.map((emp) => ({
      ...emp,
      dob: emp.dob ? formatDate(emp.dob) : "",
      received_date: emp.received_date ? formatDate(emp.received_date) : "",
      age: emp.dob ? calculateAge(emp.dob) : "",
    }));

    return res.json({ Status: true, Result: formattedResults });
  });
});

router.get("/selected_employee", (req, res) => {
  const sql = "SELECT * FROM applicant where status='selected'";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    const formattedResults = result.map((emp) => ({
      ...emp,
      dob: emp.dob ? formatDate(emp.dob) : "",
      received_date: emp.received_date ? formatDate(emp.received_date) : "",
      age: emp.dob ? calculateAge(emp.dob) : "",
    }));

    return res.json({ Status: true, Result: formattedResults });
  });
});
router.get("/final_employee", (req, res) => {
  const sql = `
    SELECT 
      a.*, 
      c.priority, 
      c.remarks AS final_remarks 
    FROM 
      applicant a
    JOIN 
      closed c ON a.applicant_id = c.applicant_id
    WHERE 
      a.status = 'closed'
  `;
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    const formattedResults = result.map((emp) => ({
      ...emp,
      dob: emp.dob ? formatDate(emp.dob) : "",
      received_date: emp.received_date ? formatDate(emp.received_date) : "",
      age: emp.dob ? calculateAge(emp.dob) : "",
    }));

    return res.json({ Status: true, Result: formattedResults });
  });
});
router.get("/pending_employee", (req, res) => {
  const status = "pending";
  const sql = "SELECT * FROM applicant WHERE status = ?";
  con.query(sql, [status], (err, results) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    const formattedResults = results.map((emp) => ({
      ...emp,
      dob: emp.dob ? formatDate(emp.dob) : "",
      received_date: emp.received_date ? formatDate(emp.received_date) : "",
      age: emp.dob ? calculateAge(emp.dob) : "",
    }));

    return res.json({ Status: true, Result: formattedResults });
  });
});

// router.get("/employee/:id", (req, res) => {
//   const id = req.params.id;
//   const sql = "SELECT * FROM employee WHERE id = ?";
//   con.query(sql, [id], (err, result) => {
//     if (err) return res.json({ Status: false, Error: "Query Error" });
//     return res.json({ Status: true, Result: result });
//   });
// });

router.get("/pending_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM applicant WHERE `applicant_id` = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    const formattedResults = result.map((emp) => ({
      ...emp,
      dob: emp.dob ? formatDate(emp.dob) : "",
      received_date: emp.received_date ? formatDate(emp.received_date) : "",
      age: emp.dob ? calculateAge(emp.dob) : "",
    }));

    return res.json({ Status: true, Result: formattedResults });
  });
});

router.post("/update_employee/:id", (req, res) => {
  const id = req.params.id;
  console.log("from update : ");
  console.log(req.body);
  const sql = `UPDATE applicant SET 
    name = ?, 
    fathers_name = ?, 
    dob = ?, 
    gender = ?, 
    age = ?, 
    ssc = ?, 
    hsc = ?, 
    ug = ?, 
    pg = ?, 
    reference = ?, 
    received_date = ?, 
    remarks = ?, 
    status = 'candidate'
    WHERE applicant_id = ?`; // ✅ update instead of insert

  const values = [
    req.body.name || null,
    req.body.fathers_name || null,
    req.body.dob || null,
    req.body.gender || null,
    req.body.age || null,
    req.body.ssc || null,
    req.body.hsc || null,
    req.body.ug || null,
    req.body.pg || null,
    req.body.reference || null,
    req.body.received_date || null,
    req.body.remarks || null,
    id, // ✅ include ID at the end for the WHERE clause
  ];

  con.query(sql, values, (err, result) => {
    if (err) {
      return res.json({ Status: false, Error: "Query Error" });
    }
    return res.json({ Status: true, Result: result, InsertedId: id });
  });
  // return res.json({ Status: true, Result: result, InsertedId: insertedId });
});

router.post("/check_employee_exists_for_update", (req, res) => {
  const { name, fathers_name, currentId } = req.body;

  const sql = `SELECT * FROM applicant WHERE name = ? AND fathers_name = ? AND applicant_id != ?`;
  con.query(sql, [name, fathers_name, currentId], (err, results) => {
    if (err) {
      return res.json({ Status: false, Error: "Query Error" });
    }

    if (results.length > 0) {
      return res.json({ exists: true });
    }

    return res.json({ exists: false });
  });
});

router.delete("/delete_employee/:id", verifyToken, (req, res) => {
  const id = req.params.id;

  // Step 1: Get the employee details before deletion
  const fetchSql = `SELECT name, fathers_name, dob FROM applicant WHERE applicant_id = ?`;
  con.query(fetchSql, [id], (err, results) => {
    if (err) return res.json({ Status: false, Error: "Fetch Query Error" });
    if (results.length === 0)
      return res.json({ Status: false, Error: "No employee found" });

    const { name, fathers_name, dob } = results[0];

    // Step 2: Delete the employee
    const deleteSql = `DELETE FROM applicant WHERE applicant_id = ?`;
    con.query(deleteSql, [id], (err) => {
      if (err) return res.json({ Status: false, Error: "Delete Query Error" });

      // Step 3: Log the deletion in deleted_candidates
      const insertDeletedSql = `
        INSERT INTO deleted_candidates (applicant_id, name, fathers_name, dob, deleted_by, deleted_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      con.query(
        insertDeletedSql,
        [id, name, fathers_name, dob, req.user.email], // ✅ Use logged-in admin's email
        (err) => {
          if (err)
            return res.json({
              Status: false,
              Error: "Insert Deleted Log Error",
            });

          return res.json({
            Status: true,
            Message: "Employee deleted and logged",
          });
        }
      );
    });
  });
});

// router.get("/admin_count", (req, res) => {
//   const sql = "select count(id) as admin from admin";
//   con.query(sql, (err, result) => {
//     if (err) return res.json({ Status: false, Error: "Query Error" + err });
//     return res.json({ Status: true, Result: result });
//   });
// });

// router.get("/employee_count", (req, res) => {
//   const sql = "select count(id) as employee from employee";
//   con.query(sql, (err, result) => {
//     if (err) return res.json({ Status: false, Error: "Query Error" + err });
//     return res.json({ Status: true, Result: result });
//   });
// });

// router.get("/salary_count", (req, res) => {
//   const sql = "select sum(salary) as salaryOFEmp from employee";
//   con.query(sql, (err, result) => {
//     if (err) return res.json({ Status: false, Error: "Query Error" + err });
//     return res.json({ Status: true, Result: result });
//   });
// });

// router.get("/admin_records", (req, res) => {
//   const sql = "select * from admin";
//   con.query(sql, (err, result) => {
//     if (err) return res.json({ Status: false, Error: "Query Error" + err });
//     return res.json({ Status: true, Result: result });
//   });
// });

router.get("/logout", verifyToken, verifyRole("admin"), (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

export { router as adminRouter };
