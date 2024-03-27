import { Antenna } from "./Antenna.ts";

export function GetXAndY(antennas: Antenna[]): {
	x: number;
	y: number;
} {
	if (antennas.length < 3) {
		throw new Error("Invalid input: At least 3 antennas are required.");
	}

	// Calculate squared distances to each antenna
	const AntennasSquared = antennas.map(
		(antenna) => antenna.x * antenna.x + antenna.y * antenna.y,
	);

	// Calculate squared distance differences
	const squaredDistanceDifferences = [];
	for (let i = 1; i < antennas.length; i++) {
		const squaredDifference =
			antennas[i].distance * antennas[i].distance -
			antennas[i - 1].distance * antennas[i - 1].distance -
			AntennasSquared[i] +
			AntennasSquared[i - 1];
		squaredDistanceDifferences.push(squaredDifference);
	}

	// Calculate the denominator for x and y
	let denominator = 0;
	for (let i = 1; i < antennas.length - 1; i++) {
		const antenna1 = antennas[i - 1];
		const antenna2 = antennas[i];
		const antenna3 = antennas[i + 1];
		denominator +=
			2 * (antenna2.x - antenna1.x) * (antenna3.y - antenna2.y) -
			2 * (antenna3.x - antenna2.x) * (antenna2.y - antenna1.y);
	}

	// Calculate x and y coordinates
	let x = 0;
	let y = 0;
	for (let i = 1; i < antennas.length - 1; i++) {
		const antenna1 = antennas[i - 1];
		const antenna2 = antennas[i];
		const antenna3 = antennas[i + 1];
		x +=
			(squaredDistanceDifferences[i - 1] * (antenna3.y - antenna2.y) -
				squaredDistanceDifferences[i] * (antenna2.y - antenna1.y)) /
			denominator;
		y +=
			(squaredDistanceDifferences[i - 1] * (antenna2.x - antenna3.x) -
				squaredDistanceDifferences[i] * (antenna1.x - antenna2.x)) /
			denominator;
	}

	// Return the calculated coordinates
	return { x, y };
}
// 	let Antenna1Squared = Antenna1.x * Antenna1.x + Antenna1.y * Antenna1.y;
// 	let Antenna2Squared = Antenna2.x * Antenna2.x + Antenna2.y * Antenna2.y;
// 	let Antenna3Squared = Antenna3.x * Antenna3.x + Antenna3.y * Antenna3.y;

// 	//this uses squared distances to the antennas and thier know postions.
// 	const a =
// 		distanceToAntenna1 * distanceToAntenna1 -
// 		distanceToAntenna2 * distanceToAntenna2 -
// 		Antenna1Squared +
// 		Antenna2Squared;
// 	const b =
// 		distanceToAntenna2 * distanceToAntenna2 -
// 		distanceToAntenna3 * distanceToAntenna3 -
// 		Antenna2Squared +
// 		Antenna3Squared;

// 	// Calculate the denominator
// 	const c =
// 		2 * (Antenna2.x - Antenna1.x) * (Antenna3.y - Antenna2.y) -
// 		2 * (Antenna3.x - Antenna2.x) * (Antenna2.y - Antenna1.y);

// 	// Calculate the x and y coordinates
// 	const x =
// 		(a * (Antenna3.y - Antenna2.y) - b * (Antenna2.y - Antenna1.y)) / c;
// 	const y =
// 		(a * (Antenna2.x - Antenna3.x) - b * (Antenna1.x - Antenna2.x)) / c;

// 	return { x, y };
//
