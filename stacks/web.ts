import { Config, StackContext } from "sst/constructs"
import { NuxtSite } from "./NuxtSite"

export function Web({ stack }: StackContext) {
	const site = new NuxtSite(stack, "NuxtSite", {
		path: "web",
		buildCommand: "pnpm build",
		runtime: "nodejs18.x",
		environment: {
			BASE_DOMAIN: "d151rbni6h406l.cloudfront.net",
		},
	})

	stack.addOutputs({
		Url: site.url,
	})
}
