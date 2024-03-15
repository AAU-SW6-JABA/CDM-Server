import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { LocationDatabase } from '../queries.ts';
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

export class GRPCServer {
    cdm_protobuffer: ProtoGrpcType;
    protoPath: string;
    db: LocationDatabase;

    constructor(protoPath: string){
        this.protoPath = protoPath;
        this.cdm_protobuffer = this.setupProto();
        this.db = new LocationDatabase();
    }
    
    //Load the protocol buffer
    setupProto() : ProtoGrpcType {
        const packageDefinition = protoLoader.loadSync(this.protoPath);
        let cdm_protobuffer = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;
        return cdm_protobuffer;
    }
    

    routeHandlers : RoutesHandlers = {
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
        RegisterAntennaRoute: this.registerAntennaRoute
    };

    registerAntennaRoute(call: grpc.ServerUnaryCall<RegisterAntennaRequest__Output, RegisterAntennaResponse>, callback: grpc.sendUnaryData<RegisterAntennaResponse>): void {
        let inputx : protoLoader.Long | undefined = call.request.x;
        let inputy : protoLoader.Long | undefined =  call.request.y;

        if(inputx === undefined || inputy === undefined){
            callback(new Error('Expected x and y coordinates'));
            return;
        } else {
            this.db.insertAntenna(inputx as unknown as number, inputy as unknown as number);
        }
    };

    //Set up gRPC server with all services
    getServer() : grpc.Server {
        const server = new grpc.Server();

        server.addService(this.cdm_protobuffer.Routes.service, this.routeHandlers);
        return server;
    };
}