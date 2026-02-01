module.exports = {
	webpack: {
		configure: (config) => {
			if (config && config.module && Array.isArray(config.module.rules)) {
				config.module.rules = config.module.rules.map((rule) => {
					const uses = Array.isArray(rule.use) ? rule.use : rule.use ? [rule.use] : [];
					const hasSourceMapLoader = uses.some((u) => {
						const loader = typeof u === "string" ? u : u && u.loader;
						return loader && loader.includes("source-map-loader");
					});
					if (hasSourceMapLoader) {
						return {
							...rule,
							// Exclude problematic libs; excluding node_modules is the safest
							exclude: [/node_modules/],
						};
					}
					return rule;
				});
			}
			// Silence "Failed to parse source map" warnings
			config.ignoreWarnings = [
				(warning) =>
					warning.message && warning.message.includes("Failed to parse source map"),
			];
			return config;
		},
	},
};

