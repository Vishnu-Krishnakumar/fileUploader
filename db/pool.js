require("dotenv").config();
const { Pool } = require("pg");
module.exports = new Pool({
    host: process.env.host, // or wherever the db is hosted
    user: process.env.role_name,
    database: process.env.database,
    password: process.env.role_password,
    port: 5432 // The default port
});