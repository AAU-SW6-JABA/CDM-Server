import * as grpc from "@grpc/grpc-js";
import { SubscribeRequest__Output } from "../../gen/protobuf/cdm_protobuf/SubscribeRequest.ts";
import { Locations } from "../../gen/protobuf/cdm_protobuf/Locations.ts";

export const subscribers: Set<
	grpc.ServerWritableStream<SubscribeRequest__Output, Locations>
> = new Set();
