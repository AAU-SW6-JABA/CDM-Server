import * as grpc from "@grpc/grpc-js";
import { GRPCServer } from "./src/gRPC/GRPCServer.ts";
import setupCronSchedule from "./src/CronSetup.ts";
import dotenv from "dotenv";

dotenv.config();

// Start the gRPC server
const server = new GRPCServer(
	"CDM-ProtocolBuffer/cdm_protobuf.proto",
).getServer();
server.bindAsync(
	`localhost:${process.env.PORT}`,
	grpc.ServerCredentials.createInsecure(),
	(err, port) => {
		if (err) {
			console.log(`Failed to start server with error: ${err.message}`);
			return;
		}

		// Start gRPC server
		server;
		console.log(`Server running at http://localhost:${port}`);

		// Setup Cron jobs
		setupCronSchedule();
	},
);
