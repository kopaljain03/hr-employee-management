import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/employee_login", (req, res) => {
  console.log(req.body.email);
  const sql = "SELECT * from employee Where email = ?";
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
  console.log(req.body.name);
  const sql = `INSERT INTO pending_users
    (
      Name,
      \`Father Name\`,
      \`Date of\`,
      \`Education SSC\`,
      \`Education HSC\`,
      \`Education Undergrad\`,
      \`Education Post grad.\`,
      Reference,
      Remarks,
      \`Received date\`,
      \`Age Today\`,
      gender

    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months start from 0
  const dd = String(today.getDate()).padStart(2, "0");

  const formattedDate = `${yyyy}-${mm}-${dd}`;
  const values = [
    req.body.name,
    req.body.father_name,
    req.body.DOB,
    req.body.education_SSC,
    req.body.education_HSC,
    req.body.education_UG,
    req.body.education_PG,
    req.body.referance,
    req.body.remarks,
    formattedDate,
    req.body.DOB,
    req.body.gender,
    req.file?.filename || null,
  ];

  con.query(sql, values, (err, result) => {
    if (err) {
      console.error("Insert error:", err);
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
