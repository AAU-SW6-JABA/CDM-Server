import * as grpc from "@grpc/grpc-js";
import { GRPCServer } from "./gRPC/GRPCServer.ts";
import dotenv from "dotenv";
import { GetXAndY } from "../Triangulation/LSM.ts";
import { Antenna } from "../Triangulation/Antenna.ts";

let Antenna1: Antenna = { x: 0, y: 0, distance: 3.16 };
let Antenna2: Antenna = { x: 3, y: 2, distance: 1 };
let Antenna3: Antenna = { x: 5, y: 0, distance: 2.24 };
let Antenna4: Antenna = { x: 1, y: 2, distance: 2.24 };
let Antenna5: Antenna = { x: 5, y: 2, distance: 2.24 };
let Antenna6: Antenna = { x: 4.03, y: 1.33, distance: 1.09 };
let Antenna7: Antenna = { x: 3, y: 0.3, distance: 0.7 };
let Antenna8: Antenna = { x: 1.84, y: 1.14, distance: 1.16 };

let AllAntennas: Antenna[] = [Antenna4, Antenna5, Antenna6, Antenna7, Antenna8];

let Antennas: Antenna[] = [Antenna1, Antenna2, Antenna3];

for (const antenna of AllAntennas) {
	let { x: test1x, y: test1y } = GetXAndY(Antennas);
	console.log(GetXAndY(Antennas));
	console.log((test1x / 3) * 100 + "%", (test1y / 1) * 100 + "%");
	Antennas.push(antenna);
}
