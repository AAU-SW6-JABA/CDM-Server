import { LocationDatabase } from "./queries.ts";
import * as grpc from "@grpc/grpc-js";
import { GRPCServer } from "./gRPC/GRPCServer.ts";


//Start the gRPC server
const server = new GRPCServer('../CDM-ProtocolBuffer/route_guide.proto').getServer();
server.bindAsync('localhost:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
    server.start();
});

const db = new LocationDatabase();