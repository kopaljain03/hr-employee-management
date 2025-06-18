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

router.post("/login", (req, res) => {
  const sql = "SELECT * FROM users WHERE email = ?";
  con.query(sql, [req.body.email], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length === 0)
      return res.json({ loginStatus: false, Error: "User not found" });

    const user = result[0];

    // Check password
    if (req.body.password !== user.password) {
      return res.json({ loginStatus: false, Error: "Incorrect password" });
    }

    // Create token if needed
    const token = jwt.sign(
      { role: user.role, email: user.email, id: user.id },
      "jwt_secret_key",
      { expiresIn: "1d" }
    );
    res.cookie("token", token);

    return res.json({
      loginStatus: true,
      role: user.role,
      id: user.id,
    });
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
  const sql = `INSERT INTO selected (applicant_id, select_date, priority) VALUES (?, ?, ?)`;
  const select_date = new Date();
  con.query(
    sql,
    [req.body.applicant_id, select_date, req.body.priority],
    (err, result) => {
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
    }
  );

  // return res.json({ Status: true, Result: result, InsertedId: insertedId });
});

router.post("/add_final_employee", upload.single("image"), (req, res) => {
  const sql = `INSERT INTO closed (applicant_id, remarks) VALUES (?, ?)`;
  con.query(sql, [req.body.applicant_id, req.body.remarks], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    const updateStatus = `UPDATE applicant SET status = 'closed' WHERE applicant_id = ?`;
    con.query(updateStatus, [req.body.applicant_id], (err) => {
      if (err) return res.json({ Status: false, Error: "Query Error" });
      return res.json({ Status: true });
    });
  });

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
router.get("/all_employee", (req, res) => {
  const sql = `
    SELECT 
      a.*, 
      c.remarks AS final_remarks,
      s.select_date AS selected_date,
      s.priority AS priority
    FROM applicant a
    LEFT JOIN closed c ON a.applicant_id = c.applicant_id
    LEFT JOIN selected s ON a.applicant_id = s.applicant_id
  `;

  con.query(sql, (err, results) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });

    const formattedResults = results.map((emp) => ({
      ...emp,
      dob: emp.dob ? formatDate(emp.dob) : "",
      received_date: emp.received_date ? formatDate(emp.received_date) : "",
      selected_date: emp.selected_date ? formatDate(emp.selected_date) : "",
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
    ssc = ?, 
    hsc = ?, 
    ug = ?, 
    pg = ?, 
    reference = ?, 
    remarks = ?,
    status=?
    WHERE applicant_id = ?`; // ✅ update instead of insert

  const values = [
    req.body.name || null,
    req.body.fathers_name || null,
    req.body.dob || null,
    req.body.gender || null,
    req.body.ssc || null,
    req.body.hsc || null,
    req.body.ug || null,
    req.body.pg || null,
    req.body.reference || null,
    req.body.remarks || null,
    req.body.status || "candidate", // ✅ default to 'pending' if not provided
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
router.get("/deleted_employees", (req, res) => {
  const query = `SELECT * FROM deleted_candidates ORDER BY deleted_at DESC`;

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching deleted candidates:", err);
      return res.json({ Status: false, Error: "Database error" });
    }

    return res.json({ Status: true, Result: results });
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
router.get("/admin_count", (req, res) => {
  const sql = "SELECT COUNT(*) AS admin FROM applicant WHERE status = 'pending'";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error: " + err.message });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/employee_count", (req, res) => {
  const sql = "SELECT COUNT(*) AS employee FROM applicant WHERE status = 'candidate'";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error: " + err.message });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/salary_count", (req, res) => {
  const sql = "SELECT COUNT(*) AS salaryOFEmp FROM applicant WHERE status = 'selected'";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error: " + err.message });
    return res.json({ Status: true, Result: result });
  });
});

// Get list of all users
router.get("/user_records", (req, res) => {
  const sql = "SELECT name, email, role FROM users";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error: " + err.message });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/logout", verifyToken, (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

export { router as adminRouter };
