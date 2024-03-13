import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from '../../build/protobuf/route_guide.ts';
import { RoutesHandlers } from '../../build/protobuf/Routes.ts';
import { Empty__Output, Empty } from '../../build/protobuf/Empty.ts';
import { GetAntennasResponse } from '../../build/protobuf/GetAntennasResponse.ts';
import { GetLocationsRequest__Output } from '../../build/protobuf/GetLocationsRequest.ts';
import { GetLocationsResponse } from '../../build/protobuf/GetLocationsResponse.ts';
import { LocationMeasurementsRequest__Output } from '../../build/protobuf/LocationMeasurementsRequest.ts';
import { LocationMeasurementsResponse } from '../../build/protobuf/LocationMeasurementsResponse.ts';
import { LogMeasurementRequest__Output } from '../../build/protobuf/LogMeasurementRequest.ts';
import { RegisterAntennaRequest__Output } from '../../build/protobuf/RegisterAntennaRequest.ts';
import { RegisterAntennaResponse } from '../../build/protobuf/RegisterAntennaResponse.ts';

const PROTO_PATH = '../../CDM-ProtocolBuffer/route_guide.proto';

//Load the protocol buffer 
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const cdm_protobuffer = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;

const routeHandlers : RoutesHandlers = {
    GetAntennasRoute: function (call: grpc.ServerUnaryCall<Empty__Output, GetAntennasResponse>, callback: grpc.sendUnaryData<GetAntennasResponse>): void {
        throw new Error('Function not implemented.');
    },
    GetLocationMeasurementsRoute: function (call: grpc.ServerUnaryCall<LocationMeasurementsRequest__Output, LocationMeasurementsResponse>, callback: grpc.sendUnaryData<LocationMeasurementsResponse>): void {
        throw new Error('Function not implemented.');
    },
    GetLocationsRoute: function (call: grpc.ServerUnaryCall<GetLocationsRequest__Output, GetLocationsResponse>, callback: grpc.sendUnaryData<GetLocationsResponse>): void {
        throw new Error('Function not implemented.');
    },
    LogMeasurementRoute: function (call: grpc.ServerReadableStream<LogMeasurementRequest__Output, Empty>, callback: grpc.sendUnaryData<Empty>): void {
        throw new Error('Function not implemented.');
    },

    //Registers a new antenna
    RegisterAntennaRoute: function (call: grpc.ServerUnaryCall<RegisterAntennaRequest__Output, RegisterAntennaResponse>, callback: grpc.sendUnaryData<RegisterAntennaResponse>): void {
        throw new Error('Function not implemented.');
    }
}
//Set up gRPC server with all services
export function getServer() : grpc.Server {
    const server = new grpc.Server();

    server.addService(cdm_protobuffer.Routes.service, routeHandlers);
    
    return server;
};