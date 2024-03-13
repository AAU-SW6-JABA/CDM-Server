import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from '../../build/protobuf/route_guide';
import { RoutesHandlers } from '../../build/protobuf/Routes';
import { Empty__Output, Empty } from '../../build/protobuf/Empty';
import { GetAntennasResponse } from '../../build/protobuf/GetAntennasResponse';
import { GetLocationsRequest__Output } from '../../build/protobuf/GetLocationsRequest';
import { GetLocationsResponse } from '../../build/protobuf/GetLocationsResponse';
import { LocationMeasurementsRequest__Output } from '../../build/protobuf/LocationMeasurementsRequest';
import { LocationMeasurementsResponse } from '../../build/protobuf/LocationMeasurementsResponse';
import { LogMeasurementRequest__Output } from '../../build/protobuf/LogMeasurementRequest';
import { RegisterAntennaRequest__Output } from '../../build/protobuf/RegisterAntennaRequest';
import { RegisterAntennaResponse } from '../../build/protobuf/RegisterAntennaResponse';

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