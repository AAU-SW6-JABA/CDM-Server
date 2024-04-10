import { Locations__Output } from "../gen/protobuf/cdm_protobuf/Locations.ts";
class Locations {
	newdata: boolean;
	locations: Locations__Output;
	constructor() {
		this.newdata = false;
		this.locations = {};
	}
	deleteLocations() {
		this.locations = {};
		this.newdata = false;
	}
}

export const newLocations = new Locations();
