import postgres from "postgres";
import "dotenv/config";

const port = process.env.DB_PORT as number | undefined;

const db = postgres({
    host: process.env.DB_HOST, // Postgres ip address[s] or domain name[s]
    port: port, // Postgres server port[s]
    database: process.env.DB_NAME, // Name of database to connect to
    username: process.env.DB_USER, // Username of database user
    password: process.env.DB_PASS, // Password of database user
});

export default db;
