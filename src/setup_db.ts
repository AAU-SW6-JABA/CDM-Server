import express from "express";
import db from "./db.ts";
import "dotenv/config";

export async function setupDB() {
    // Setup express server
    const app = express();
    app.use(express.json());
    app.get("/", (req, res) => {
        return res.json("Established connection!");
    });

    await db`
    CREATE TABLE IF NOT EXISTS Antennas(
        aid SERIAL PRIMARY KEY,
        x BIGINT,
        y BIGINT
    );`

    await db`
    CREATE TABLE IF NOT EXISTS Measurement(
        mid SERIAL PRIMARY KEY,
        imsi BIGINT NOT NULL,
        aid INT REFERENCES Antennas(AID),
        timestamp DOUBLE PRECISION NOT NULL,
        strengthDBM DOUBLE PRECISION NOT NULL
    );`

    await db`
    CREATE TABLE IF NOT EXISTS Calculation(
        imsi BIGINT,
        calctime DOUBLE PRECISION,
        mid INT REFERENCES Measurement(mid),
        PRIMARY KEY(imsi, calctime, mid)
    ); `

    await db`
    CREATE TABLE IF NOT EXISTS Location(
        imsi BIGINT REFERENCES Calculation(imsi),
        calctime DOUBLE PRECISION,
        x BIGINT,
        y BIGINT,
        PRIMARY KEY(imsi, calctime)
    );`

    // Run db setup then start webserver
    app.listen(process.env.PORT);
}


