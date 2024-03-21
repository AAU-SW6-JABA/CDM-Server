import * as grpc from "@grpc/grpc-js";
import { GRPCServer } from "./gRPC/GRPCServer.ts";
import dotenv from "dotenv";

dotenv.config();
//Start the gRPC server
const server = new GRPCServer(
	"CDM-ProtocolBuffer/cdm_protobuf.proto",
).getServer();
server.bindAsync(
	`localhost:${process.env.PORT}`,
	grpc.ServerCredentials.createInsecure(),
	() => {
		server;
		console.log(`Server running at http://localhost:${process.env.PORT}`);
	},
);
