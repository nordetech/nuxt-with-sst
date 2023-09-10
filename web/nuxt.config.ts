const env = (name: string, required?: "!") => {
	if (process.env[name]) return process.env[name]
	if (required === "!") {
		throw new Error(`Environment variable ${name} is required!`)
	} else {
		console.warn(`Environment variable ${name} is not set but is not required.`)
	}
}

const isDev = env("NODE_ENV") === "development"
const baseDomain = env("BASE_DOMAIN")

export default defineNuxtConfig({
	modules: ["@nuxt/image"],

	image: {
		domains: baseDomain ? [baseDomain!] : undefined,
		alias: {
			local: isDev ? "" : `https://${baseDomain}`,
		},
		ipx: {
			// has no effect apparently
			maxAge: 1000 * 60 * 60 * 24 * 365,
		},
	},

	runtimeConfig: {
		public: {
			stage: env("SST_STAGE", "!"),
		},
	},

	nitro: {
		preset: "aws-lambda",
		esbuild: {
			options: {
				target: "esnext",
			},
		},
	},
	devtools: { enabled: true },
})
