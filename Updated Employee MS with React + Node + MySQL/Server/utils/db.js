import mysql from "mysql2";

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "kopal@123",
  database: "employees",
});

con.connect(function (err) {
  if (err) {
    console.log("connection error");
  } else {
    console.log("Connected");
    con.query("SELECT * FROM employee", function (err, results, fields) {
      if (err) {
        console.log("Query error:", err);
      } else {
        console.log("Query results:", results);
      }
    });
  }
});

export default con;
