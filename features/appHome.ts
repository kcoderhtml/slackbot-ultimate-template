import { name, slackApp } from "../index";

import { blog, clog } from "../lib/Logger";
import type { AnyHomeTabBlock } from "slack-edge";

const appHome = async (
) => {
    // listen for shortcut
    slackApp.event("app_home_opened", async ({ payload, context }) => {
        // check if its opening the home tab
        if (payload.tab !== "home") {
            return;
        }

        // get info about the user
        const user = await context.client.users.info({
            user: payload.user,
        });

        // check if the user is authorized
        if (
            user.user?.is_owner ||
            user.user?.is_admin ||
            process.env.ADMINS?.split(",").includes(user.user?.id!)
        ) {
            clog(`User <@${user.user!.id}> is authorized to access the analytics page.`, "info");
            // update the home tab
            await context.client.views.publish({
                user_id: payload.user,
                view: {
                    type: "home",
                    blocks: await getSettingsMenuBlocks(true, payload.user),
                },
            });
            return;
        } else {
            blog(`User <@${user.user!.id}> is not authorized to access the analytics page.`, "error");
            // update the home tab
            await context.client.views.publish({
                user_id: payload.user,
                view: {
                    type: "home",
                    blocks: await getSettingsMenuBlocks(false, payload.user),
                },
            });
            return;
        }
    }
    );
}

export default appHome;

export async function getSettingsMenuBlocks(
    allowed: boolean,
    user: string,
): Promise<AnyHomeTabBlock[]> {
    if (!allowed) {
        return [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `:gear: ${name}'s Dashboard :gear:`,
                },
            },
            {
                type: "divider",
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `:siren-real: You are not authorized to use this app. Please contact the owners of this app ( ${process.env.ADMINS?.split(
                        ",",
                    )
                        .map((admin) => `<@${admin}>`)
                        .join(" ")} ) to get access.`,
                },
            },
        ];
    }

    // update the home tab
    return [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `:gear: ${name}'s Dashboard :gear:`,
            },
        },
        {
            type: "divider",
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `:blobby-admission_tickets: Admins: \n\n${process.env.ADMINS?.split(
                    ",",
                )
                    .map((admin) => `<@${admin}>`)
                    .join(" ")}`,
            },
        },
        {
            type: "divider",
        },
        {
            type: "actions",
            elements: [
                {
                    type: "button",
                    text: {
                        type: "plain_text",
                        text: "Reload Dashboard",
                        emoji: true,
                    },
                    action_id: "reloadDashboard",
                },
            ],
        }
    ];
}
