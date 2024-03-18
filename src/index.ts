import { LocationDatabase } from "./queries.ts";
import * as grpc from "@grpc/grpc-js";
import { GRPCServer } from "./gRPC/GRPCServer.ts";
import dotenv from 'dotenv';

dotenv.config();
//Start the gRPC server
const server = new GRPCServer('CDM-ProtocolBuffer/route_guide.proto').getServer();
server.bindAsync(`localhost:${process.env.PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    server;
});