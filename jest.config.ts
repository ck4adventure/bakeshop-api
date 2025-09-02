import type { Config } from 'jest';

const config: Config = {
	"moduleFileExtensions": [
		"js",
		"json",
		"ts"
	],
	"rootDir": "src",
	"testRegex": ".*\\.spec\\.ts$",
	"transform": {
		"^.+\\.(t|j)s$": "ts-jest"
	},
	"collectCoverageFrom": [
		"**/*.(t|j)s"
	],
	"coverageDirectory": "../coverage",
	"testEnvironment": "node",
	"verbose": true,
};

export default config;