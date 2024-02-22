import express from "express";
import db from "./db";
import "dotenv/config";

// Setup express server
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
    return res.json("Established connection!");
});

// Setup database
async function setupDB() {
    await db`CREATE TABLE IF NOT EXISTS camel_case (a_test INTEGER, b_test TEXT)`;
}

// Run db setup then start webserver
setupDB().then(() => {
    app.listen(process.env.PORT);
});
