const mysql = require("mysql");

const mysqlConnection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "password",
  database: "competencias",
});

/* Se comprueba que la conexion a la base de datos es exitosa */
mysqlConnection.connect((err) => {
  if (err) throw err;
  console.log(`Conexion funciona`);
});

module.exports = mysqlConnection;
