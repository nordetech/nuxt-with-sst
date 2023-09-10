import { SSTConfig } from "sst"
import { Web } from "./stacks/web"

export default {
	config(_input) {
		return {
			name: "sst-nuxt",
			region: "eu-west-1",
		}
	},
	stacks(app) {
		app.stack(Web)
	},
} satisfies SSTConfig
