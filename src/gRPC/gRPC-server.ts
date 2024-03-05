import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { get } from 'http';

const PROTO_PATH = './proto/cdm_protobuffer.proto';

//Load the protocol buffer 
const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
const cdm_protobuffer: any = grpc.loadPackageDefinition(packageDefinition).cdm_protobuffer;

//Set up gRPC server with all services
export function getServer() : grpc.Server {
    const server = new grpc.Server();

    server.addService(cdm_protobuffer.Routes.service, {
        LogMeasurementRoute: logMeasurementRoute,
        RegisterAntennaRoute: registerAntennaRoute,
        GetAntennasRoute: getAntennasRoute,
        GetLocationsRoute : getLocationsRoute,
        GetLocationMeasurementsRoute : getLocationMeasurementsRoute
    });
    
    return server;
};
//Start the server TODO

/**
 * The implementations of the services from the protocol buffer
 * @param call, the call from the client
 * @param callback, the callback to the client
 * @returns void
 */
//TODO find types for call and callback
function logMeasurementRoute(call: grpc.ServerReadableStream<any, any>, callback: grpc.sendUnaryData<object>) : void {
    //Everytime log-data comes in, it will be logged in the database
    let logcounter : number = 0;
    call.on('data', (data) => {

    });

    //Sends "empty" response to the client
    call.on('end', () => {
        callback(null, { message: 'Measurements logged' });
    });
}

function registerAntennaRoute(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<object>) : void {
    let antenna = call.request;
    callback(antenna, /*registerAntenna(antenna)*/);
}

function getAntennasRoute(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) : void {
    //Implementation needed
    getAntennas(call.request);
    callback(null, /*getAntennas(call.request)*/);
}

function getLocationsRoute(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) : void {
    //Implementation needed
}

function getLocationMeasurementsRoute(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) : void {
    //Implementation needed
}
