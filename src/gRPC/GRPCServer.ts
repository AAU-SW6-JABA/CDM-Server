import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import cdm_db from "../queries.ts";
import { ProtoGrpcType } from "../../gen/protobuf/cdm_protobuf.ts";
import { RoutesHandlers } from "../../gen/protobuf/cdm_protobuf/Routes.ts";
import { Empty__Output, Empty } from "../../gen/protobuf/cdm_protobuf/Empty.ts";
import { GetAntennasResponse } from "../../gen/protobuf/cdm_protobuf/GetAntennasResponse.ts";
import { GetLocationsRequest__Output } from "../../gen/protobuf/cdm_protobuf/GetLocationsRequest.ts";
import { GetLocationsResponse } from "../../gen/protobuf/cdm_protobuf/GetLocationsResponse.ts";
import { LocationMeasurementsRequest__Output } from "../../gen/protobuf/cdm_protobuf/LocationMeasurementsRequest.ts";
import { LocationMeasurementsResponse } from "../../gen/protobuf/cdm_protobuf/LocationMeasurementsResponse.ts";
import { LogMeasurementRequest__Output } from "../../gen/protobuf/cdm_protobuf/LogMeasurementRequest.ts";
import { LogMeasurementsRequest__Output } from "../../gen/protobuf/cdm_protobuf/LogMeasurementsRequest.ts";
import { RegisterAntennaRequest__Output } from "../../gen/protobuf/cdm_protobuf/RegisterAntennaRequest.ts";
import { RegisterAntennaResponse } from "../../gen/protobuf/cdm_protobuf/RegisterAntennaResponse.ts";
import type { antennas, location } from "@prisma/client";
import { subscribers } from "./Subscribe.ts";
import { SubscribeRequest__Output } from "../../gen/protobuf/cdm_protobuf/SubscribeRequest.ts";
import { Locations } from "../../gen/protobuf/cdm_protobuf/Locations.ts";
import { newLocations } from "../Locations.ts";

export class GRPCServer {
	cdm_protobuffer: ProtoGrpcType;
	protoPath: string;
	db: typeof cdm_db;

	constructor(protoPath: string) {
		this.protoPath = protoPath;
		this.cdm_protobuffer = this.setupProto();
		this.db = cdm_db;
	}

	//Load the protocol buffer
	setupProto(): ProtoGrpcType {
		const packageDefinition = protoLoader.loadSync(this.protoPath);
		const cdm_protobuffer = grpc.loadPackageDefinition(
			packageDefinition,
		) as unknown as ProtoGrpcType;
		return cdm_protobuffer;
	}

	routeHandlers: RoutesHandlers = {
		GetAntennasRoute: (
			call: grpc.ServerUnaryCall<Empty__Output, GetAntennasResponse>,
			callback: grpc.sendUnaryData<GetAntennasResponse>,
		) => this.getAntennasRoute(call, callback),

		GetLocationMeasurementsRoute: function (
			call: grpc.ServerUnaryCall<
				LocationMeasurementsRequest__Output,
				LocationMeasurementsResponse
			>,
			callback: grpc.sendUnaryData<LocationMeasurementsResponse>,
		): void {
			throw new Error("Function not implemented.");
		},
		GetLocationsRoute: (
			call: grpc.ServerUnaryCall<
				GetLocationsRequest__Output,
				GetLocationsResponse
			>,
			callback: grpc.sendUnaryData<GetLocationsResponse>,
		) => this.getLocationsRoute(call, callback),

		LogMeasurementsRoute: (
			call: grpc.ServerUnaryCall<LogMeasurementsRequest__Output, Empty>,
			callback: grpc.sendUnaryData<Empty>,
		) => this.logMeasurementsRoute(call, callback),

		LogMeasurementRoute: (
			call: grpc.ServerUnaryCall<LogMeasurementRequest__Output, Empty>,
			callback: grpc.sendUnaryData<Empty>,
		) => this.logMeasurementRoute(call, callback),

		//Registers a new antenna
		RegisterAntennaRoute: (
			call: grpc.ServerUnaryCall<
				RegisterAntennaRequest__Output,
				RegisterAntennaResponse
			>,
			callback: grpc.sendUnaryData<RegisterAntennaResponse>,
		) => this.registerAntennaRoute(call, callback),

		//Allows for clients to subscribe to new locations
		SubscribeToLocations: (
			stream: grpc.ServerWritableStream<
				SubscribeRequest__Output,
				Locations
			>,
		) => this.subscribeRequest(stream),
	};
	getAntennasRoute(
		call: grpc.ServerUnaryCall<Empty__Output, GetAntennasResponse>,
		callback: grpc.sendUnaryData<GetAntennasResponse>,
	): void {
		this.db.getAllAntennas().then((antenna) => {
			const response =
				this.convertAntennaObjectToGetAntennasResponse(antenna);

			if (response.status == grpc.status.CANCELLED) {
				callback({
					code: grpc.status.CANCELLED,
					details: `Failed converting the following antenna(s) to gRPC antenna response: ${response.failingAntennas}`,
				});
			} else if (response.status == grpc.status.OK) {
				callback(null, response.antennasArray);
			}
		});
	}

	convertAntennaObjectToGetAntennasResponse(antennas: antennas[]):
		| {
				status: grpc.status.OK;
				antennasArray: GetAntennasResponse;
		  }
		| { status: grpc.status.CANCELLED; failingAntennas: antennas[] } {
		const antennaObject: GetAntennasResponse = {};
		antennaObject.antenna = [];
		const failingAntennas = [];
		let failed = false;

		for (const antenna of antennas) {
			if (
				typeof antenna.aid != "string" ||
				typeof antenna.x != "number" ||
				typeof antenna.y != "number"
			) {
				failingAntennas.push(antenna);
				failed = true;
			} else {
				antennaObject.antenna.push({
					aid: antenna.aid,
					x: antenna.x,
					y: antenna.y,
				});
			}
		}
		if (failed) {
			return {
				status: grpc.status.CANCELLED,
				failingAntennas: antennas,
			};
		}
		return {
			status: grpc.status.OK,
			antennasArray: antennaObject,
		};
	}

	getLocationsRoute(
		call: grpc.ServerUnaryCall<
			GetLocationsRequest__Output,
			GetLocationsResponse
		>,
		callback: grpc.sendUnaryData<GetLocationsResponse>,
	): void {
		const request = call.request;
		this.db
			.getLocation(
				request.nRecent,
				request.timeBegin,
				request.timeEnd,
				request.identifier,
			)
			.then((locations) => {
				const response =
					this.convertLocationObjectToGetLocationsResponse(locations);
				if (response.status == grpc.status.CANCELLED) {
					callback({
						code: grpc.status.CANCELLED,
						details: `Failed converting the following location(s) to gRPC location response: ${response.failingLocations}`,
					});
				} else if (response.status == grpc.status.OK) {
					callback(null, response.locationsArray);
				}
			});
	}
	convertLocationObjectToGetLocationsResponse(
		location: location[],
	):
		| { status: grpc.status.OK; locationsArray: GetLocationsResponse }
		| { status: grpc.status.CANCELLED; failingLocations: location[] } {
		const locationObject: GetLocationsResponse = {};
		locationObject.location = [];
		const failingLocations = [];
		let failed = false;

		for (const loc of location) {
			if (
				typeof loc.identifier != "string" ||
				typeof loc.calctime != "number" ||
				typeof loc.x != "number" ||
				typeof loc.y != "number"
			) {
				failingLocations.push(loc);
				failed = true;
			} else {
				locationObject.location.push({
					identifier: loc.identifier,
					x: loc.x,
					y: loc.y,
					calctime: loc.calctime,
				});
			}
		}
		if (failed) {
			return {
				status: grpc.status.CANCELLED,
				failingLocations: location,
			};
		}
		return {
			status: grpc.status.OK,
			locationsArray: locationObject,
		};
	}

	logMeasurementsRoute(
		call: grpc.ServerUnaryCall<LogMeasurementsRequest__Output, Empty>,
		callback: grpc.sendUnaryData<Empty>,
	) {
		throw new Error("Function not implemented.");
	}

	logMeasurementRoute(
		call: grpc.ServerUnaryCall<LogMeasurementRequest__Output, Empty>,
		callback: grpc.sendUnaryData<Empty>,
	): void {
		const measurement = call.request;
		if (
			typeof measurement.identifier !== "string" ||
			typeof measurement.aid !== "number" ||
			typeof measurement.timestamp !== "number" ||
			typeof measurement.signalStrength !== "number"
		) {
			callback({
				code: grpc.status.INVALID_ARGUMENT,
				details:
					"Expected identifier, aid, timestamp, and signalStrength. Got Undefined",
			});
			return;
		}
		this.db
			.insertMeasurement(
				measurement.identifier,
				measurement.aid,
				measurement.timestamp,
				measurement.signalStrength,
			)
			.catch((err) => {
				callback({
					code: grpc.status.CANCELLED,
					details: `Error inserting measurement: ${err}`,
				});
			});
		callback(null, {});
	}

	registerAntennaRoute(
		call: grpc.ServerUnaryCall<
			RegisterAntennaRequest__Output,
			RegisterAntennaResponse
		>,
		callback: grpc.sendUnaryData<RegisterAntennaResponse>,
	): void {
		const inputx: number | undefined = call.request.x;
		const inputy: number | undefined = call.request.y;

		if (typeof inputx !== "number" || typeof inputy !== "number") {
			callback({
				code: grpc.status.INVALID_ARGUMENT,
				details: "Expected x and y coordinates",
			});
		}
		this.db
			.insertAntenna(inputx as number, inputy as number)
			.then((antenna) => {
				callback(null, { aid: antenna.aid });
			})
			.catch((err) => {
				callback({
					code: grpc.status.CANCELLED,
					details: `Error inserting antenna: ${err}`,
				});
			});
	}

	subscribeRequest(
		stream: grpc.ServerWritableStream<SubscribeRequest__Output, Locations>,
	) {
		subscribers.add(stream);
		this.streamLocations();
	}
	streamLocationsTimeout: NodeJS.Timeout | number | undefined;
	streamLocations() {
		clearTimeout(this.streamLocationsTimeout);
		if (newLocations.length > 0) {
			for (const stream of subscribers) {
				if (stream.cancelled || stream.closed) {
					subscribers.delete(stream);
				} else {
					stream.write({ location: newLocations });
				}
			}
			newLocations.length = 0;
		}
		if (subscribers.size > 0) {
			this.streamLocationsTimeout = setTimeout(() => {
				this.streamLocations();
			}, 100);
		}
	}
	//Set up gRPC server with all services
	getServer(): grpc.Server {
		const server = new grpc.Server();

		server.addService(
			this.cdm_protobuffer.cdm_protobuf.Routes.service,
			this.routeHandlers,
		);
		return server;
	}
}
