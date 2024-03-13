import { LocationDatabase } from "./queries.ts";
import * as grpc from "@grpc/grpc-js";
import { getServer } from "./gRPC/gRPC-server.ts";


//Start the gRPC server
const server = getServer(); 
server.bindAsync('localhost:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
    server.start();
});
