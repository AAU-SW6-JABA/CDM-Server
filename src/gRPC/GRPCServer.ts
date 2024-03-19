import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { LocationDatabase } from "../queries.ts";
import { ProtoGrpcType } from "../../build/protobuf/cdm_protobuf.ts"; 
import { RoutesHandlers } from "../../build/protobuf/cdm_protobuf/Routes.ts"; 
import { Empty__Output, Empty } from "../../build/protobuf/cdm_protobuf/Empty.ts";
import { GetAntennasResponse } from "../../build/protobuf/cdm_protobuf/GetAntennasResponse.ts";
import { GetLocationsRequest__Output } from "../../build/protobuf/cdm_protobuf/GetLocationsRequest.ts";
import { GetLocationsResponse } from "../../build/protobuf/cdm_protobuf/GetLocationsResponse.ts";
import { LocationMeasurementsRequest__Output } from "../../build/protobuf/cdm_protobuf/LocationMeasurementsRequest.ts";
import { LocationMeasurementsResponse } from "../../build/protobuf/cdm_protobuf/LocationMeasurementsResponse.ts";
import { LogMeasurementRequest__Output } from "../../build/protobuf/cdm_protobuf/LogMeasurementRequest.ts";
import { RegisterAntennaRequest__Output } from "../../build/protobuf/cdm_protobuf/RegisterAntennaRequest.ts";
import { RegisterAntennaResponse } from "../../build/protobuf/cdm_protobuf/RegisterAntennaResponse.ts";

export class GRPCServer {
    cdm_protobuffer: ProtoGrpcType;
    protoPath: string;
    db: LocationDatabase;

    constructor(protoPath: string) {
        this.protoPath = protoPath;
        this.cdm_protobuffer = this.setupProto();
        this.db = new LocationDatabase();
    }

    //Load the protocol buffer
    setupProto(): ProtoGrpcType {
        const packageDefinition = protoLoader.loadSync(this.protoPath);
        let cdm_protobuffer = grpc.loadPackageDefinition(
            packageDefinition
        ) as unknown as ProtoGrpcType;
        return cdm_protobuffer;
    }

    routeHandlers: RoutesHandlers = {
        GetAntennasRoute: function (
            call: grpc.ServerUnaryCall<Empty__Output, GetAntennasResponse>,
            callback: grpc.sendUnaryData<GetAntennasResponse>
        ): void {
            throw new Error("Function not implemented.");
        },
        GetLocationMeasurementsRoute: function (
            call: grpc.ServerUnaryCall<
                LocationMeasurementsRequest__Output,
                LocationMeasurementsResponse
            >,
            callback: grpc.sendUnaryData<LocationMeasurementsResponse>
        ): void {
            throw new Error("Function not implemented.");
        },
        GetLocationsRoute: function (
            call: grpc.ServerUnaryCall<
                GetLocationsRequest__Output,
                GetLocationsResponse
            >,
            callback: grpc.sendUnaryData<GetLocationsResponse>
        ): void {
            throw new Error("Function not implemented.");
        },
        LogMeasurementRoute: (
            call: grpc.ServerReadableStream<
                LogMeasurementRequest__Output,
                Empty
            >,
            callback: grpc.sendUnaryData<Empty>
        ) => this.logMeasurementRoute(call, callback),

        //Registers a new antenna
        RegisterAntennaRoute: (
            call: grpc.ServerUnaryCall<
                RegisterAntennaRequest__Output,
                RegisterAntennaResponse
            >,
            callback: grpc.sendUnaryData<RegisterAntennaResponse>
        ) => this.registerAntennaRoute(call, callback),
    };

    //TODO: USES TOSTRING
    logMeasurementRoute(call: grpc.ServerReadableStream<LogMeasurementRequest__Output, Empty>, callback: grpc.sendUnaryData<Empty>): void {
        call.on("data", (measurement : LogMeasurementRequest__Output) => {
            //Validate inputs
            if (measurement.identifier === undefined || measurement.aid === undefined || measurement.timestamp === undefined || measurement.signalStrength === undefined) {
                callback({
                    code: grpc.status.INVALID_ARGUMENT,
                    details: "Expected imsi, aid, timestamp, and signalStrength. Got Undefined",
                });
                return;
            }
            this.db.insertMeasurement(measurement.identifier, measurement.aid, measurement.timestamp, measurement.signalStrength)
            .catch((err) => {
                callback({
                    code: grpc.status.CANCELLED,
                    details: `Error inserting measurement: ${err}`,
                });
            });
        });
        call.on("end", () => {
            callback(null, {});
        });
    }

    registerAntennaRoute(
        call: grpc.ServerUnaryCall<
            RegisterAntennaRequest__Output,
            RegisterAntennaResponse
        >,
        callback: grpc.sendUnaryData<RegisterAntennaResponse>
    ): void {
        let inputx: number | undefined = call.request.x;
        let inputy: number | undefined = call.request.y;

        if (inputx === undefined || inputy === undefined) {
            callback({
                code: grpc.status.INVALID_ARGUMENT,
                details: "Expected x and y coordinates",
            });
        } else {
            this.db
                .insertAntenna(inputx, inputy)
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
    }

    //Set up gRPC server with all services
    getServer(): grpc.Server {
        const server = new grpc.Server();

        server.addService(
            this.cdm_protobuffer.cdm_protobuf.Routes.service,
            this.routeHandlers
        );
        return server;
    }
}
