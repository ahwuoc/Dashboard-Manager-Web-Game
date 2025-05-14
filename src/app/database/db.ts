import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "ngocrong",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const query = async (sql: string, values?: any[]) => {
  const [rows] = await pool.query(sql, values);
  return rows;
};

export const getConnection = async () => {
  const connection = await pool.getConnection();
  return connection;
};
