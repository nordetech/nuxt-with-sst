import fs from "fs"
import path from "path"
import { EdgeFunction } from "sst/constructs/EdgeFunction.js"
import { SsrFunction } from "sst/constructs/SsrFunction.js"
import { SsrSite } from "sst/constructs/SsrSite.js"
import {
	LayerVersion,
	Code,
	Architecture,
	Runtime,
} from "aws-cdk-lib/aws-lambda"

export class NuxtSite extends SsrSite {
	protected initBuildConfig() {
		return {
			typesPath: ".",
			serverBuildOutputFile: ".output/server/index.mjs",
			clientBuildOutputDir: ".output/public",
			clientBuildVersionedSubDir: "_nuxt",
		}
	}

	protected validateBuildOutput() {
		const serverDir = path.join(this.props.path, ".output/server")
		const clientDir = path.join(this.props.path, ".output/public")
		if (!fs.existsSync(serverDir) || !fs.existsSync(clientDir)) {
			throw new Error(
				`Build output inside ".output/" does not contain the "server" and "public" folders. Make sure your Nuxt app is deployed with preset aws-lambda. If you are looking to deploy the Nuxt app as a static site, please use the StaticSite construct — https://docs.sst.dev/constructs/StaticSite`
			)
		}

		super.validateBuildOutput()
	}

	protected createFunctionForRegional() {
		const {
			runtime,
			timeout,
			memorySize,
			permissions,
			environment,
			nodejs,
			bind,
			cdk,
		} = this.props

		return new SsrFunction(this, `ServerFunction`, {
			description: "Server handler for Nuxt",
			handler: path.join(this.props.path, ".output", "server", "index.handler"),
			runtime,
			architecture: Architecture.X86_64,
			memorySize,
			timeout,
			nodejs: {
				format: "esm",
				esbuild: { external: ["sharp"] },
				...nodejs,
			},
			bind,
			environment,
			permissions,
			layers: [
				new LayerVersion(this, "SharpLayer", {
					code: Code.fromAsset("stacks/layers/sharp.zip"),
					compatibleArchitectures: [Architecture.ARM_64, Architecture.X86_64],
					compatibleRuntimes: [Runtime.NODEJS_18_X],
					description: "Sharp layer",
				}),
			],
			...cdk?.server,
		})
	}

	protected createFunctionForEdge() {
		const {
			runtime,
			timeout,
			memorySize,
			bind,
			permissions,
			environment,
			nodejs,
		} = this.props

		return new EdgeFunction(this, `Server`, {
			scopeOverride: this,
			handler: path.join(this.props.path, ".output", "server", "index.handler"),
			runtime,
			timeout,
			memorySize,
			bind,
			environment,
			permissions,
			nodejs: {
				format: "esm",
				...nodejs,
			},
		})
	}

	public getConstructMetadata() {
		return {
			type: "NuxtSite" as const,
			...this.getConstructMetadataBase(),
		}
	}

	protected supportsStreaming(): boolean {
		return false
	}
}
