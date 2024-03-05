import sql from './db.js'
export class LocationDatabase {
    async GetLocations(): Promise<{ imsi: number, x: number, y: number, calctime: number }> {
        const Locations = await sql`
        SELECT
            imsi,
            x,
            y,
            calctime
        FROM
            Location`;

        return Locations as any
    }

    async GetMeasurements(): Promise<{ mid: number, imsi: number, aid: number, timestamp: number, strengthDBM: number }> {
        const Measurements = await sql`
            SELECT 
                mid,
                imsi,
                aid,
                timestamp,
                strengthDBM
            FROM
                Measurement`;

        return Measurements as any
    }

    async InsertCalculations(imsi: number, calctime: number, mid: number) {
        await sql`
        INSERT INTO Calculation (
            imsi,
            calctime,
            mid
        )VALUES(
            ${imsi},
            ${calctime},
            ${mid}
        )
        `
    }

    async InsertLocations(imsi: number, calctime: number, x: number, y: number) {
        await sql`
        INSERT INTO Location(
            imsi,
            calctime,
            x,
            y
        )VALUES(
            ${imsi},
            ${calctime},
            ${x},
            ${y}
        )`
    }
}