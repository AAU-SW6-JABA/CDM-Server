import * as grpc from "@grpc/grpc-js";
import { GRPCServer } from "./gRPC/GRPCServer.ts";
import cdm_db from "./queries.ts";
import dotenv from "dotenv";
import setupCronSchedule from "./CronSetup.ts";
import { Command } from "commander";

const program = new Command();

program
	.name("CDM-Server")
	.description(
		"Server that handles gRPC communication with nodes and clients as well as handling communication with a postgres DB.",
	)
	.option(
		"-r, --reset-database",
		"delete all the entries in the database on launch",
	)
	.option("--identifier <type>", "identifier to use for the server");

program.parse();
const options = program.opts();

dotenv.config();

/**
 * Perform actions based on parsed options
 */
if (options.resetDatabase) {
	cdm_db.resetDB().then(() => {
		console.log("Successfully reset the database");
	});
}

let identifier: string | undefined;

if (options.identifier) {
	identifier = options.identifier;
}

//Start the gRPC server
const server = new GRPCServer(
	"CDM-ProtocolBuffer/cdm_protobuf.proto",
	identifier,
).getServer();
server.bindAsync(
	`${process.env.HOST}:${process.env.PORT}`,
	grpc.ServerCredentials.createInsecure(),
	() => {
		server;
		console.log(
			`Server running at http://${process.env.HOST}:${process.env.PORT}`,
		);
	},
);
// Setup Cron jobs
setupCronSchedule();
