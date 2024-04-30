import { TrilaterationData } from "./TrilaterationData.ts";
import { Coordinates } from "./Coordinates.ts";

export function GetXAndY(antennas: TrilaterationData[]): Coordinates {
	let determinant = 0;
	const maxRounds = 30;
	let rounds = 0;
	calc: while(determinant === 0){
		rounds++;
		if(rounds > maxRounds){
			throw new Error("Cannot calculate a nonzero determinant");
		}
		if (antennas.length < 3) {
			throw new Error("Not enough antennas to calculate location");
		}
		// Calculate squared distances to each antenna
		const AntennasSquared = antennas.map(
			(antenna) => antenna.x ** 2 + antenna.y ** 2,
		);

		// Calculate squared distance differences
		const squaredDistanceDifferences = [];
		for (let i = 1; i < antennas.length; i++) {
			const squaredDifference =
				antennas[i].distance ** 2 -
				antennas[i - 1].distance ** 2 -
				AntennasSquared[i] +
				AntennasSquared[i - 1];
			squaredDistanceDifferences.push(squaredDifference);
		}

		// Calculating the determinant of a Square Matrix and scaling the vector by 2
		determinant = 0;
		for (let i = 1; i < antennas.length - 1; i++) {
			const antenna1 = antennas[i - 1];
			const antenna2 = antennas[i];
			const antenna3 = antennas[i + 1];
			determinant +=
				2 *
				((antenna2.x - antenna1.x) * (antenna3.y - antenna2.y) -
					(antenna3.x - antenna2.x) * (antenna2.y - antenna1.y));
		}
		if(determinant === 0){
			shuffleArray(antennas);
			continue calc;
		}

		// Calculate x and y coordinates
		let x = 0;
		let y = 0;
		for (let i = 1; i < antennas.length - 1; i++) {
			const antenna1 = antennas[i - 1];
			const antenna2 = antennas[i];
			const antenna3 = antennas[i + 1];

			x +=
				((squaredDistanceDifferences[i - 1] * (antenna3.y - antenna2.y) -
					squaredDistanceDifferences[i] * (antenna2.y - antenna1.y)) /
					determinant) *
				-1;
			y +=
				((squaredDistanceDifferences[i - 1] * (antenna2.x - antenna3.x) -
					squaredDistanceDifferences[i] * (antenna1.x - antenna2.x)) /
					determinant) *
				-1;
		}

		// Return the calculated coordinates
		return { x, y };
	}
	throw new Error("Should have returned x and y in the calc loop");
}

function shuffleArray(array: unknown[]) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
