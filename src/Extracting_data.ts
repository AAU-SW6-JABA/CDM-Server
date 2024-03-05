import sql from './db.js'
export class LocationDatabase {
    async GetLocations(): Promise<{ imsi: number, x: number, y: number, calctime: number }> {
        const Locations = await sql`
        select
            imsi,
            x,
            y,
            calctime
        from
            Location`;

        return Locations as any
    }

    async GetMeasurements(): Promise<{ mid: number, imsi: number, aid: number, timestamp: number, strengthDBM: number }> {
        const Measurements = await sql`
            select 
                mid,
                imsi,
                aid,
                timestamp,
                strengthDBM
            from
                Measurement`;

        return Measurements as any
    }

    async InsertCalculations(imsi: number, calctime: number, mid: number) {
        await sql`
        insert into Calculation (
            imsi,
            calctime,
            mid
        )values(
            ${imsi},
            ${calctime},
            ${mid}
        )
        `
    }

    async InsertLocations(imsi: number, calctime: number, x: number, y: number) {
        await sql`
        insert into InsertLocations(
            imsi,
            calctime,
            x,
            y
        )values(
            ${imsi},
            ${calctime},
            ${x},
            ${y}
        )`
    }
}