import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/employee_login", (req, res) => {
  console.log(req.body.email);
  const sql = "SELECT * from users Where email = ?";
  con.query(sql, [req.body.email], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length > 0) {
      console.log(result[0].password);

      if (req.body.password == result[0].password) {
        const email = result[0].email;
        const token = jwt.sign(
          { role: "employee", email: email, id: result[0].id },
          "jwt_secret_key",
          { expiresIn: "1d" }
        );
        res.cookie("token", token);
        console.log("id :" + result[0].id);
        return res.json({
          loginStatus: true,
          id: result[0].id,
          role: "employee",
        });
      }
    } else {
      return res.json({
        loginStatus: false,
        Error: "wrong email or password",
      });
    }
  });
});

router.post("/add_employee", (req, res) => {
  console.log(req.body.name); // apllicants
  const sql = `INSERT INTO applicant 
    (name, fathers_name, dob, gender, age, ssc, hsc, ug, pg, reference, received_date, remarks, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`;

  const values = [
    req.body.name,
    req.body.fathers_name,
    req.body.dob,
    req.body.gender,
    req.body.age,
    req.body.ssc,
    req.body.hsc,
    req.body.ug,
    req.body.pg,
    req.body.reference,
    req.body.received_date,
    req.body.remarks,
  ];

  con.query(sql, values, (err, result) => {
    if (err) {
      return res.json({ Status: false, Error: "Query Error" });
    }
    return res.json({ Status: true });
  });
});

router.get("/detail/:id", verifyToken, verifyRole("employee"), (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employee where id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false });
    return res.json(result);
  });
});

router.get("/logout", verifyToken, verifyRole("employee"), (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

export { router as EmployeeRouter };
