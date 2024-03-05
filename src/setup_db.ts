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
        AID SERIAL PRIMARY KEY,
        X BIGINT,
        Y BIGINT
    );`

    await db`
    CREATE TABLE IF NOT EXISTS Measurement(
        MID SERIAL PRIMARY KEY,
        IMSI BIGINT NOT NULL,
        AID INT REFERENCES Antennas(AID),
        timestamp double precision NOT NULL,
        Strength_DBM SMALLINT NOT NULL
    );`

    await db`
    CREATE TABLE IF NOT EXISTS Calculation(
        IMSI BIGINT,
        calctime DOUBLE PRECISION,
        MID INT REFERENCES Measurement(MID),
        PRIMARY KEY(IMSI, Calctime, MID)
    ); `

    await db`
    CREATE TABLE IF NOT EXISTS Location(
        IMSI BIGINT REFERENCES Calculation(IMSI),
        Calctime DOUBLE PRECISION,
        X BIGINT,
        Y BIGINT,
        PRIMARY KEY(IMSI, Calctime)
    );`

    // Run db setup then start webserver
    app.listen(process.env.PORT);
}


