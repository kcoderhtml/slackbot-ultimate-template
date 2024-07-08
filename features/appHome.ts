import { name, slackApp, prisma } from '../index'

import { blog, clog } from '../lib/Logger'
import barChartGenerator from "../lib/barChart"

import type { AnyHomeTabBlock } from 'slack-edge'

const appHome = async () => {
    // listen for shortcut
    slackApp.event('app_home_opened', async ({ payload, context }) => {
        // check if its opening the home tab
        if (payload.tab !== 'home') {
            return
        }

        // get info about the user
        const user = await context.client.users.info({
            user: payload.user,
        })

        const day = new Date().toISOString().split("T")[0] + "T00:00:00.000Z";

        // check if the user is authorized
        if (
            user.user?.is_owner ||
            user.user?.is_admin ||
            process.env.ADMINS?.split(',').includes(user.user?.id!)
        ) {
            clog(
                `User <@${user.user!.id}> is authorized to access the analytics page.`,
                'info'
            )

            // update the analytics table
            await prisma.analytics.upsert({
                where: {
                    date: day,
                },
                create: {
                    date: day,
                    dashboardOpensAuthorized: 1,
                },
                update: {
                    dashboardOpensAuthorized: {
                        increment: 1,
                    },
                },
            })

            // update the home tab
            await context.client.views.publish({
                user_id: payload.user,
                view: {
                    type: 'home',
                    blocks: await getSettingsMenuBlocks(true, payload.user),
                },
            })
            return
        } else {
            blog(
                `User <@${user.user!.id}> is not authorized to access the analytics page.`,
                'error'
            )

            // update the analytics table
            await prisma.analytics.upsert({
                where: {
                    date: day,
                },
                create: {
                    date: day,
                    dashboardOpensUnauthorized: 1,
                },
                update: {
                    dashboardOpensUnauthorized: {
                        increment: 1,
                    },
                },
            })

            // update the home tab
            await context.client.views.publish({
                user_id: payload.user,
                view: {
                    type: 'home',
                    blocks: await getSettingsMenuBlocks(false, payload.user),
                },
            })
            return
        }
    })
}

export default appHome

export async function getSettingsMenuBlocks(
    allowed: boolean,
    user: string
): Promise<AnyHomeTabBlock[]> {
    if (!allowed) {
        return [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `:gear: ${name}'s Dashboard :gear:`,
                },
            },
            {
                type: 'divider',
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `:siren-real: You are not authorized to use this app. Please contact the owners of this app ( ${process.env.ADMINS?.split(
                        ','
                    )
                        .map((admin) => `<@${admin}>`)
                        .join(' ')} ) to get access.`,
                },
            },
        ]
    }

    const analytics = (await prisma.analytics.findMany()).sort((a, b) => b.date.toString().localeCompare(a.date.toString()))

    // update the home tab
    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `:gear: ${name}'s Dashboard :gear:`,
            },
        },
        {
            type: 'divider',
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `Authorized App Home Opens over the last 5 days: ${await barChartGenerator(
                    analytics.slice(0, 5).map((analytics) => analytics.dashboardOpensAuthorized!), 5,
                    analytics.slice(0, 5).map((analytics) => new Date(analytics.date).toLocaleDateString("en-US", {
                        weekday: "short",
                    })),
                )}`
            },
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `Unauthorized App Home Opens over the last 5 days: ${await barChartGenerator(
                    analytics.slice(0, 5).map((analytics) => analytics.dashboardOpensUnauthorized!), 5,
                    analytics.slice(0, 5).map((analytics) => new Date(analytics.date).toLocaleDateString("en-US", {
                        weekday: "short",
                    })),
                )}`
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `:blobby-admission_tickets: Admins: \n\n${process.env.ADMINS?.split(
                    ','
                )
                    .map((admin) => `<@${admin}>`)
                    .join(' ')}`,
            },
        },
        {
            type: 'divider',
        },
        {
            type: 'actions',
            elements: [
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'Reload Dashboard',
                        emoji: true,
                    },
                    action_id: 'reloadDashboard',
                },
            ],
        },
    ]
}
