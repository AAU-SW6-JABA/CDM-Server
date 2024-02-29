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

    await db`
    CREATE TABLE IF NOT EXISTS Measurement(
        MID SERIAL PRIMARY KEY,
        IMSI BIGINT NOT NULL,
        FOREIGN KEY(AID) REFERENCES Anetennas(AID),
        timestamp BIGINT NOT NULL,
        SNR SMALLINT NOT NULL,
        Strength_DBM SMALLINT NOT NULL
    );`

    await db`
    CREATE TABLE IF NOT EXISTS Antennas(
        AID SERIAL PRIMARY KEY,
        X INT,
        Y INT
    );`

    await db`
    CREATE TABLE IF NOT EXISTS Location(
        IMSI BIGINT PRIMARY KEY REFERENCES Measurement(IMSI),
        Calctime BIGINT,
        X INT,
        Y INT
    );`
}

// Run db setup then start webserver
setupDB().then(() => {
    app.listen(process.env.PORT);
});
