import { SubscribeRequest__Output } from "../../gen/protobuf/cdm_protobuf/SubscribeRequest.ts";

class Client {
	constructor() {
		this.clientid = "";
	}
	clientid: string;
}

class Subscribe {
	constructor() {
		this.clientidMap = new Map();
	}
	clientidMap: Map<SubscribeRequest__Output, Client>;

	addClient(clientid: SubscribeRequest__Output) {
		this.clientidMap.set(clientid, new Client());
	}
}
export const subscribers = new Subscribe();
