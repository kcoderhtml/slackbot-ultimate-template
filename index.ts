import { SlackApp } from "slack-edge";

import * as features from "./features/index";

const { version, name } = require('./package.json')


const slackApp = new SlackApp({
    env: {
        SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
        SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET!,
        SLACK_LOGGING_LEVEL: "INFO",
    },
    startLazyListenerAfterAck: true
});
const slackClient = slackApp.client;

for (const [feature, handler] of Object.entries(features)) {
    if (typeof handler === "function") {
        handler();
    }
}

export default {
    port: 3000,
    async fetch(request: Request) {
        const url = new URL(request.url);
        const path = url.pathname;

        switch (path) {
            case "/":
                return new Response(`Hello World from ${name}@${version}`);
            case "/health":
                return new Response("OK");
            case "/slack":
                return slackApp.run(request);
            default:
                return new Response("404 Not Found", { status: 404 });
        }
    },
};

export { slackApp, slackClient, version, name };