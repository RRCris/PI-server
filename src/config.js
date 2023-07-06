require("dotenv").config();

const PORT = process.env.PORT || 3000;

const CONDB = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME,
  port: process.env.DB_PORT,
};

module.exports = {
  PORT,
  CONDB,
};
