import { TrilaterationData } from "./TrilaterationData.ts";
import { Coordinates } from "./Coordinates.ts";

export function GetXAndY(antennas: TrilaterationData[]): Coordinates {
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
	let determinant = 0;
	for (let i = 1; i < antennas.length - 1; i++) {
		const antenna1 = antennas[i - 1];
		const antenna2 = antennas[i];
		const antenna3 = antennas[i + 1];
		determinant +=
			2 *
			((antenna2.x - antenna1.x) * (antenna3.y - antenna2.y) -
				(antenna3.x - antenna2.x) * (antenna2.y - antenna1.y));
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
