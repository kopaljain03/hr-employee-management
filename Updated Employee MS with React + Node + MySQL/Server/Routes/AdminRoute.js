import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * from admin Where email = ? and password = ?";
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

router.get("/category", verifyToken, verifyRole("admin"), (req, res) => {
  const sql = "SELECT * FROM category";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.post("/add_category", verifyToken, verifyRole("admin"), (req, res) => {
  const sql = "INSERT INTO category (`name`) VALUES (?)";
  con.query(sql, [req.body.category], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true });
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

router.post("/add_employee", upload.single("image"), (req, res) => {
  const sql = `INSERT INTO users
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
      \`Age Today\`

    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
    req.body.DOB,
    req.file?.filename || null,
  ];

  con.query(sql, values, (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.json({ Status: false, Error: "Query Error" });
    }
    const insertedId = result.insertId; // ✅ Get the inserted ID

    return res.json({ Status: true, Result: result, InsertedId: insertedId });
  });
});

router.post("/add_selected_employee", upload.single("image"), (req, res) => {
  const sql = `INSERT INTO selected_users
    (
      \`Id no.\`,
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
      \`Age Today\`

    )
    VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    req.body["Id no."],
    req.body.Name,
    req.body["Father Name"],
    req.body["Date of"],
    req.body["Education SSC"],
    req.body["Education HSC"],
    req.body["Education Undergrad"],
    req.body["Education Post grad."],
    req.body.Reference,
    req.body.Remarks,
    req.body["Received date"],
    req.file?.filename || null,
  ];

  con.query(sql, values, (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.json({ Status: false, Error: "Query Error" });
    }
    const insertedId = result.insertId; // ✅ Get the inserted ID

    // return res.json({ Status: true, Result: result, InsertedId: insertedId });
    const sql2 = "delete from users where `Id no.` = ?";
    con.query(sql2, [req.body["Id no."]], (err, result) => {
      if (err) return res.json({ Status: false, Error: "Query Error" + err });
      return res.json({ Status: true, Result: result, InsertedId: insertedId });
    });
  });
});

router.post("/add_final_employee", upload.single("image"), (req, res) => {
  const sql = `INSERT INTO final_users
    (
      \`Id no.\`,
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
      \`Age Today\`

    )
    VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    req.body["Id no."],
    req.body.Name,
    req.body["Father Name"],
    req.body["Date of"],
    req.body["Education SSC"],
    req.body["Education HSC"],
    req.body["Education Undergrad"],
    req.body["Education Post grad."],
    req.body.Reference,
    req.body.Remarks,
    req.body["Received date"],
    req.file?.filename || null,
  ];

  con.query(sql, values, (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.json({ Status: false, Error: "Query Error" });
    }
    const insertedId = result.insertId; // ✅ Get the inserted ID

    // return res.json({ Status: true, Result: result, InsertedId: insertedId });
    const sql2 = "delete from selected_users where `Id no.` = ?";
    con.query(sql2, [req.body["Id no."]], (err, result) => {
      if (err) return res.json({ Status: false, Error: "Query Error" + err });
      return res.json({ Status: true, Result: result, InsertedId: insertedId });
    });
  });
});

router.get("/employee", (req, res) => {
  const sql = "SELECT * FROM users";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/selected_employee", (req, res) => {
  const sql = "SELECT * FROM selected_users";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});
router.get("/final_employee", (req, res) => {
  const sql = "SELECT * FROM final_users";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});
router.get("/pending_employee", (req, res) => {
  const sql = "SELECT * FROM pending_users";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employee WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/pending_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM pending_users WHERE `Id no.` = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.post("/update_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = `INSERT INTO users
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
      \`Age Today\`

    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
    req.body.DOB,
    req.file?.filename || null,
  ];

  con.query(sql, values, (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.json({ Status: false, Error: "Query Error" });
    }
    const insertedId = result.insertId; // ✅ Get the inserted ID
    const sql2 = "delete from pending_users where `Id no.` = ?";
    con.query(sql2, [id], (err, result) => {
      if (err) return res.json({ Status: false, Error: "Query Error" + err });
      return res.json({ Status: true, Result: result, InsertedId: insertedId });
    });
  });
});

router.delete("/delete_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql2 = "delete from pending_users where `Id no.` = ?";
  con.query(sql2, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/admin_count", (req, res) => {
  const sql = "select count(id) as admin from admin";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/employee_count", (req, res) => {
  const sql = "select count(id) as employee from employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/salary_count", (req, res) => {
  const sql = "select sum(salary) as salaryOFEmp from employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/admin_records", (req, res) => {
  const sql = "select * from admin";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/logout", verifyToken, verifyRole("admin"), (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

export { router as adminRouter };
