import * as mathjs from "mathjs";
import { MultilaterationData } from "./MultilaterationData.ts";
import { Coordinate } from "./Coordinate.ts";

const sqrt = Math.sqrt;

class MultilaterationCartesian2D {
	/**
	 * Estimates a device coordinate based on distance measurements from known antenna positions.
	 *
	 * First performs a linear regression to achieve a rough estimate of the coordinates.
	 * Then applies Newton's method to iteratively improve the estimate.
	 * Improvements are measured with the squared errors algorithm.
	 * 
	 * Inspired by: https://github.com/zwigglers/multilateration/
	 *
	 * @param measurements - All measurements to use in the estimation.
	 * @param iterations - The number of estimate improvement iterations.
	 * @returns - The estimated position of the device.
	 */
	estimateDeviceCoordinate(
		measurements: MultilaterationData[],
		iterations = 30,
	): Coordinate {
		const sortedMeasurements = this.sortMeasurements(measurements);

		const initialEstimate =
			this.roughlyEstimateCoordinate(sortedMeasurements);
		if (initialEstimate === undefined) {
			throw new Error("No initial estimate");
		}

		const estimate = this.improveEstimate(
			initialEstimate,
			sortedMeasurements,
			iterations,
		);

		return estimate;
	}

	/**
	 * To make expected results more reliable, we sort the measurements in a consistent manner.
	 *
	 * @param measurements  - All measurements to use in the estimation.
	 * @returns - The measurements, sorted.
	 */
	sortMeasurements(
		measurements: MultilaterationData[],
	): MultilaterationData[] {
		return measurements.sort((a, b) => {
			if (a.x === b.x) {
				return a.y - b.y;
			} else {
				return b.x - a.x;
			}
		});
	}

	/**
	 * Performs linear regression on a subset of measurements to provide
	 * a semi-accurate estimation of the device position.
	 *
	 * Runs linearly through all combinations of measurements and performs linear
	 * regression on all combinations, then returns the calculation that results
	 * in the smallest squared error.
	 *
	 * @param measurements - All measurements to use in the estimation.
	 * @returns - The estimated position of the device.
	 */
	roughlyEstimateCoordinate(measurements: MultilaterationData[]): Coordinate {
		if (measurements.length < 2) {
			throw new Error("Not enough observations");
		}

		/**
		 * This is a machine-friendly version of the linear regression
		 * of the following function:
		 *
		 * (mX - x) ** 2 + (mY - y) ** 2 = mDist ** 2
		 *
		 * (mY, mX = antenna coordinates in measurement)
		 * (mDist = distance according to antenna measurement)
		 *
		 * We calculate the radius of a circle that is centered in the antenna's coordinate
		 * and intersects the device coordinate.
		 * The radius should equate to the distance measured by the antenna.
		 * We solve for x and y, as they are the device coordinates.
		 *
		 * We can rewrite the function as follows:
		 * (mX - x) ** 2 + (mY - y) ** 2 - mDist ** 2 = 0
		 *
		 * We use three measurements to find the two free variables "x" and "y".
		 * We subtract the next measurement (m2) from the current measurement (m1):
		 * (mX1 - x) ** 2 + (mY1 - y​) ** 2 − mDist1 ** 2 ​− (mX2 - x​) ** 2 − (mY2 - y​) ** 2 + mDist2 ** 2 = 0
		 *
		 * And rewrite it =>
		 * 2 * (mX1 ​− mX2​) * x + 2 * (mY1 ​− mY2) * y = (mX1 ** 2 ​+ mY1 ** 2 ​​− mDist1 ** 2​) − (mX2 ** 2 ​+ mY2 ** 2 ​− mDist2 ** 2​)
		 * 
		 * We need to subtract them because the original functions are not linear, but subtracting one with another results in a linear function
		 * that moves through the points where the two circles intersect. This is a very good approximation of the original problem.
		 *
		 * We can put this into a 2x3 matrix and solve for x and y.
		 *
		 * The matrix will contain:
		 * [
		 * m1 - m2,
		 * m2 - m3
		 * ]
		 */

		const solutions: Coordinate[] = [];

		for (let i = 0; i < measurements.length - 1; i++) {
			const leftSideFormula: [number, number][] = [];
			const rightSideFormula: number[] = [];
			if (measurements[i + 2] === undefined) continue;
			for (let j = i; j < i + 2; j++) {
				leftSideFormula.push([
					// First left-side part of above formula: 2 * (mX1 ​− mX2​) * x
					// "x" is omitted and is the first root we solve for
					2 * (measurements[j].x - measurements[j + 1].x),
					// Second left-side part of above formula: 2 * (mY1 ​− mY2) * y
					// "y" is omitted and is the second root we solve for
					2 * (measurements[j].y - measurements[j + 1].y),
				]);
				rightSideFormula.push(
					// Right-side part of above formula: (mX1 ** 2 ​+ mY1 ** 2 ​​− mDist1 ** 2​) − (mX2 ** 2 ​+ mY2 ** 2 ​− mDist2 ** 2​)
					measurements[j].x ** 2 +
						measurements[j].y ** 2 -
						measurements[j].distance ** 2 -
						(measurements[j + 1].x ** 2 +
							measurements[j + 1].y ** 2 -
							measurements[j + 1].distance ** 2),
				);
			}

			if (mathjs.det(leftSideFormula) === 0) continue; // Ignore the case where the determinant is 0

			// Solve the matrix, returns a vector containing [x, y]
			const vector = mathjs.lusolve(leftSideFormula, rightSideFormula);
			solutions.push({ x: vector[0][0], y: vector[1][0] });
		}

		// Find the solution with the smallest squared error
		let leastError = Infinity;
		let leastErrorIndex = 0;
		for (const [index, solution] of solutions.entries()) {
			const error = this.squaredErrors(solution, measurements);
			if (error < leastError) {
				leastError = error;
				leastErrorIndex = index;
			}
		}
		return solutions[leastErrorIndex];
	}

	/**
	 * Applies Newton's method to the squared error of the estimate to iteratively improve the estimate.
	 *
	 * Newton's method differentiates the squared errors function and uses the derivative to estimate
	 * a coordinate that has a smaller error.
	 * The derivative is a bad approximation of the real error function, so this must be done many times,
	 * but as the estimate inches closer to the optimal solution, the derivative becomes more accurate.
	 *
	 * [x,y]_(i+1) = [x,y]_i - J^(-1) * G
	 *		where J is the Jacobian matrix and G is the gradient of the squared error function at the current point.
	 *
	 * Read more: https://en.wikipedia.org/wiki/Newton%27s_method
	 */
	improveEstimate(
		startEstimate: Coordinate,
		measurements: MultilaterationData[],
		iterations: number,
	): Coordinate {
		let estimate = startEstimate;

		let previousEstimates: Coordinate[] = [estimate];

		for (let i = 0; i < iterations; i++) {
			// Calculate the Jacobian matrix and its inverse.
			const jacobian = this.jacobianMatrix(estimate, measurements);
			const jacobianInversed = mathjs.inv(jacobian);

			// Calculate the gradient of the squared error function.
			const gradient: [number, number] = [
				this.firstOrderPartialDerivativesForX(estimate, measurements),
				this.firstOrderPartialDerivativesForY(estimate, measurements),
			];

			// The new estimate is calculated by subtracting the gradient multiplied by the inverse of the jacobian matrix as per Newton's method.
			const newEstimate: [number, number] = mathjs.subtract(
				[estimate.x, estimate.y],
				mathjs.multiply(jacobianInversed, gradient),
			);

			previousEstimates.push({ x: newEstimate[0], y: newEstimate[1] });

			if (this.isConverged(previousEstimates)) {
				estimate = { x: newEstimate[0], y: newEstimate[1] };
				break;
			}

			estimate = { x: newEstimate[0], y: newEstimate[1] };
		}

		return estimate;
	}

	isConverged(estimates: Coordinate[]): boolean {
		const lastN = estimates.slice(-5);

		for (const [index, estimate] of lastN.entries()) {
			if (index === 0) continue;
			if (this.distance(estimate, lastN[index - 1]) > 0.0001) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Calculates the Jacobian matrix for the sum of squared error function.
	 * The resulting matrix looks like the following:
	 * jacobianMatrix = [ d2f/dx2  d2f/dydx ]
	 * 				   [ d2f/dxdy  d2f/dy2 ]
	 */
	jacobianMatrix(
		deviceCoordinate: Coordinate,
		measurements: MultilaterationData[],
	): [[number, number], [number, number]] {
		return [
			[
				this.secondOrderPartialDerivativesForXX(
					deviceCoordinate,
					measurements,
				),
				this.secondOrderPartialDerivativesForYX(
					deviceCoordinate,
					measurements,
				),
			],
			[
				this.secondOrderPartialDerivativesForXY(
					deviceCoordinate,
					measurements,
				),
				this.secondOrderPartialDerivativesForYY(
					deviceCoordinate,
					measurements,
				),
			],
		];
	}

	/**
	 * Calculates the absolute distance between two coordinates.
	 * Also known as the euclidean distance.
	 */
	distance(coordA: Coordinate, coordB: Coordinate): number {
		return sqrt((coordA.x - coordB.x) ** 2 + (coordA.y - coordB.y) ** 2);
	}

	/**
	 * A way to calculate how bad an estimated device coordinate is.
	 *
	 * For each original measurement, it calculates the difference between the distance
	 * reported in the measurement, and the distance to the estimated coordinate.
	 *
	 * Each difference is squared, which means large differences are weighted much higher
	 * than small differences.
	 *
	 * All the differences are summed together.
	 *
	 * Read more (just ignore the "mean" part): https://en.wikipedia.org/wiki/Mean_squared_error
	 * We only compare errors from the same set of measurements, therefore we don't need the "mean" part.
	 *
	 * @param deviceCoordinate - The estimated device coordinate.
	 * @param measurements - The set of measurements used to estimate the coordinate.
	 * @returns - The squared error for the estimated coordinate. 0 = perfect. Larger number = worse.
	 */
	squaredErrors(
		deviceCoordinate: Coordinate,
		measurements: MultilaterationData[],
	): number {
		let squaredError = 0;
		for (const measurement of measurements) {
			const finalDistance = this.distance(measurement, deviceCoordinate);
			// This can also be expanded to:
			// (x - mX) ** 2 + (y - mY) ** 2 - 2 * mDist * sqrt((x - mX) ** 2 + (y - mY) ** 2) + mDist ** 2
			// That is good to know when we need to differentiate it
			squaredError += (finalDistance - measurement.distance) ** 2;
		}
		return squaredError;
	}

	/** ---------------------------------------------------------------- **
	 * First order partial derivatives of the squared error function.
	 *  ---------------------------------------------------------------- */

	/**
	 * Calculates the sum of the first order partial derivatives for device x-coordinate for the given measurements.
	 * SUM(df_i/dx) for i = 0 to measurements.length where f_1 is the squared error function with the i'th measurement.
	 */
	firstOrderPartialDerivativesForX(
		deviceCoordinate: Coordinate,
		measurements: MultilaterationData[],
	): number {
		let derivative = 0;
		for (const measurement of measurements) {
			derivative += this.firstOrderPartialDerivativeForX(
				deviceCoordinate,
				measurement,
			);
		}
		return derivative;
	}
	/**
	 * Calculates the first order partial derivative for x for a single measurement.
	 * df/dx where f is the squared error function and x is the x-coordinate of the device.
	 * This function describes how the squared error changes when the device x-coordinate changes.
	 */
	firstOrderPartialDerivativeForX(
		deviceCoordinate: Coordinate,
		measurement: MultilaterationData,
	): number {
		const x = deviceCoordinate.x;
		const y = deviceCoordinate.y;
		const mX = measurement.x;
		const mY = measurement.y;
		const mDist = measurement.distance;
		return (
			(-2 * mDist * (x - mX)) / sqrt((x - mX) ** 2 + (y - mY) ** 2) +
			2 * x -
			2 * mX
		);
	}

	/**
	 * Calculates the sum of the first order partial derivatives for device y-coordinate for the given measurements.
	 * SUM(df_i/dy) for i = 0 to measurements.length where f_1 is the squared error function with the i'th measurement.
	 */
	firstOrderPartialDerivativesForY(
		deviceCoordinate: Coordinate,
		measurements: MultilaterationData[],
	): number {
		let derivative = 0;
		for (const measurement of measurements) {
			derivative += this.firstOrderPartialDerivativeForY(
				deviceCoordinate,
				measurement,
			);
		}
		return derivative;
	}

	/**
	 * Calculates the first order partial derivative for y for a single measurement.
	 * df/dy where f is the squared error function and y is the y-coordinate of the device.
	 * This function describes how the squared error changes when the device y-coordinate changes.
	 */
	firstOrderPartialDerivativeForY(
		deviceCoordinate: Coordinate,
		measurement: MultilaterationData,
	): number {
		return this.firstOrderPartialDerivativeForX(
			{
				x: deviceCoordinate.y,
				y: deviceCoordinate.x,
			},
			{
				x: measurement.y,
				y: measurement.x,
				distance: measurement.distance,
			},
		);
	}

	/** ---------------------------------------------------------------- **
	 * Second order partial derivatives of the squared error function.
	 * As we use the Newton-Raphson method, we need to calculate the 2nd
	 * order partial derivatives of the following functions for both x and y:
	 * - df/dx = 0 where f is the sum of the squared errors and x is the x-coordinate of the device.
	 * - df/dy = 0 where f is the sum of the squared errors and y is the y-coordinate of the device.
	 *  ---------------------------------------------------------------- */

	/**
	 * Calculates the sum of the second order partial derivatives for  ( SUM(d2f/dx2) for given measurements).
	 */
	secondOrderPartialDerivativesForXX(
		deviceCoordinate: Coordinate,
		measurements: MultilaterationData[],
	): number {
		let derivative = 0;
		for (const measurement of measurements) {
			derivative += this.secondOrderPartialDerivativeForXX(
				deviceCoordinate,
				measurement,
			);
		}
		return derivative;
	}

	/**
	 * Calculates the second order partial derivative for x for a single measurement.
	 * d2f/dx2 where f is the squared error function and x is the x-coordinate of the device.
	 */
	secondOrderPartialDerivativeForXX(
		deviceCoordinate: Coordinate,
		measurement: MultilaterationData,
	): number {
		const x = deviceCoordinate.x;
		const y = deviceCoordinate.y;
		const mX = measurement.x;
		const mY = measurement.y;
		const mDist = measurement.distance;
		return (
			(-2 * mDist * (x - mX) * (mX - x)) /
				((x - mX) ** 2 + (y - mY) ** 2) ** (3 / 2) -
			(2 * mDist) / sqrt((x - mX) ** 2 + (y - mY) ** 2) +
			2
		);
	}

	/**
	 * Calculates the sum of the second order partial derivatives ( SUM(d2f/dydx) for given measurements)
	 */
	secondOrderPartialDerivativesForYX(
		deviceCoordinate: Coordinate,
		measurements: MultilaterationData[],
	): number {
		let derivative = 0;
		for (const measurement of measurements) {
			derivative += this.secondOrderPartialDerivativeForYX(
				deviceCoordinate,
				measurement,
			);
		}
		return derivative;
	}

	/**
	 * Calculates the second order partial derivative for y for a single measurement.
	 * d2f/dydx where f is the squared error function, y is the y-coordinate of the device and x is the x-coordinate of the device.
	 */
	secondOrderPartialDerivativeForYX(
		deviceCoordinate: Coordinate,
		measurement: MultilaterationData,
	): number {
		const x = deviceCoordinate.x;
		const y = deviceCoordinate.y;
		const mX = measurement.x;
		const mY = measurement.y;
		const mDist = measurement.distance;
		return (
			(-2 * mDist * (x - mX) * (mY - y)) /
			((x - mX) ** 2 + (y - mY) ** 2) ** (3 / 2)
		);
	}

	/**
	 * Calculates the sum of the second order partial derivatives ( SUM(d2f/dxdy) for given measurements)
	 */
	secondOrderPartialDerivativesForXY(
		deviceCoordinate: Coordinate,
		measurements: MultilaterationData[],
	): number {
		let derivative = 0;
		for (const measurement of measurements) {
			derivative += this.secondOrderPartialDerivativeForXY(
				deviceCoordinate,
				measurement,
			);
		}
		return derivative;
	}

	/**
	 * Calculates the second order partial derivative for x for a single measurement.
	 * d2f/dxdy where f is the squared error function, y is the y-coordinate of the device and x is the x-coordinate of the device.
	 */
	secondOrderPartialDerivativeForXY(
		deviceCoordinate: Coordinate,
		measurement: MultilaterationData,
	): number {
		return this.secondOrderPartialDerivativeForYX(deviceCoordinate, {
			x: measurement.y,
			y: measurement.x,
			distance: measurement.distance,
		});
	}

	/**
	 * Calculates the sum of the second order partial derivatives  ( SUM(d2f/dy2) for given measurements)
	 */
	secondOrderPartialDerivativesForYY(
		deviceCoordinate: Coordinate,
		measurements: MultilaterationData[],
	): number {
		let derivative = 0;
		for (const measurement of measurements) {
			derivative += this.secondOrderPartialDerivativeForYY(
				deviceCoordinate,
				measurement,
			);
		}
		return derivative;
	}

	/**
	 * Calculates the second order partial derivative for y for a single measurement.
	 * d2f/dy2 where f is the squared error function and y is the y-coordinate of the device.
	 */
	secondOrderPartialDerivativeForYY(
		deviceCoordinate: Coordinate,
		measurement: MultilaterationData,
	): number {
		return this.secondOrderPartialDerivativeForXX(
			{
				x: deviceCoordinate.y,
				y: deviceCoordinate.x,
			},
			{
				x: measurement.y,
				y: measurement.x,
				distance: measurement.distance,
			},
		);
	}
}

const mltcartesian = new MultilaterationCartesian2D();
export default mltcartesian;
