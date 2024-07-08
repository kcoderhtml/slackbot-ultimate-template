import { SlackApp } from 'slack-edge'

import { PrismaClient } from "@prisma/client";

import * as features from './features/index'

import { t } from './lib/template'
import { blog } from './lib/Logger'
const { version, name } = require('./package.json')
const environment = process.env.NODE_ENV

console.log(
    `----------------------------------\n${name} Server\n----------------------------------\n`
)
console.log('🏗️  Starting ABOT...')
console.log('📦 Loading Slack App...')
console.log('🔑 Loading environment variables...')

const slackApp = new SlackApp({
    env: {
        SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
        SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET!,
        SLACK_LOGGING_LEVEL: 'INFO',
    },
    startLazyListenerAfterAck: true,
})
const slackClient = slackApp.client

console.log(`⚒️  Loading ${Object.entries(features).length} features...`)
for (const [feature, handler] of Object.entries(features)) {
    console.log(`📦 ${feature} loaded`)
    if (typeof handler === 'function') {
        handler()
    }
}

export default {
    port: 3000,
    async fetch(request: Request) {
        const url = new URL(request.url)
        const path = url.pathname

        switch (path) {
            case '/':
                return new Response(`Hello World from ${name}@${version}`)
            case '/health':
                return new Response('OK')
            case '/slack':
                return slackApp.run(request)
            default:
                return new Response('404 Not Found', { status: 404 })
        }
    },
}

// loading db
console.log(`⛁  Loading DB...`);
const prisma = new PrismaClient();
// list days of analytics
console.log(`📅 Loaded ${await prisma.analytics.count()} days of analytics.`);

console.log(
    `🚀 Server Started in ${Bun.nanoseconds() / 1000000} milliseconds on version: ${version}!\n\n----------------------------------\n`
)

blog(
    t('app.startup', {
        environment,
    }),
    'start'
)
console.log('\n----------------------------------\n')

export { slackApp, slackClient, version, name, environment, prisma }
