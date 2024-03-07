import "reflect-metadata"
import { DataSource } from "typeorm"

const port = parseInt(process.env.DB_PORT || "5000");

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST, // Postgres ip adress[s] or domain name[s]
    port: port, // Postgres server port[s]
    username: process.env.DB_USER, // Username of database user
    password: process.env.DB_PASS, // Password of database user
    database: process.env.DB_NAME, // Name of database to connect to
    synchronize: true,
    logging: false,
    migrations: [],
    subscribers: [],
})
