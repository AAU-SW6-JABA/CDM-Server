import sql from './db.js'
export class LocationDatabase {
    async GetLocations(): Promise<{ IMSI: number, x: number, y: number, calctime: number }> {
        const Locations = await sql`
        select
            IMSI,
            x,
            y,
            calctime
        from
            Location`;

        return Locations as any
    }

    async GetMeasurements(): Promise<{ MID: number, IMSI: number, AID: number, timestamp: number, strength_DBM: number }> {
        const Measurements = await sql`
            select 
                MID,
                IMSI,
                AID,
                timestamp,
                Strength_DBM
            from
                Measurement`;

        return Measurements as any
    }

    async InsertCalculations(IMSI: number, calctime: number, mid: number) {
        await sql`
        insert into Calculation (
            IMSI,
            calctime,
            mid
        )values(
            ${IMSI},
            ${calctime},
            ${mid}
        )
        `
    }

    async InsertLocations(IMSI: number, calctime: number, X: number, Y: number) {
        await sql`
        insert into InsertLocations(
            IMSI,
            calctime,
            X,
            y
        )values(
            ${IMSI},
            ${calctime},
            ${X},
            ${Y}
        )`
    }
}