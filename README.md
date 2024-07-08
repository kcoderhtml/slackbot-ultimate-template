# slackbot-ultimate-template

For the ultimate slackbot experience, use this template to get started with your own slackbot!

## Getting Started

1. Clone this repository
2. Install the required packages
3. Create a new slack app
4. Add the slack app to your workspace
5. Add the tokens to the environment variables
6. Run the slackbot

### Prerequisites

-   Bun
-   some knowledge of typescript
-   a slack workspace
-   an enterprising mind!
-   a computer

### Installing

```bash
bun install
```

### Creating a Slack App

1. Use the slack manifest file in the root of this repository to create a new slack app in your workspace
2. Customize the name of the app to your liking
3. Change the event url and the request url to the url of your server plus /slack
4. Install the app to your workspace
5. Copy the bot token and the signing secret to your environment variables under the names `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET` also add `NODE_ENV=development` to your environment variables and `ADMINS=your_slack_id` where `your_slack_id` is your slack id

### Running the Slackbot

First migrate the db so you have a local copy of the database then you can run the dev script to start the server!

```bash
bunx prisma migrate dev --name db
bun run dev
```

You probably also want to run the ngrok tunnel so that your slackbot can get events from slack (double check the package.json to make sure that you changed the url to your ngrok url)

```bash
bun run ngrok
```

## Development

### Database

If you change the schema.prisma file you will need to run the following command to update the database schema

```bash
bunx prisma migrate dev
```

alternatively you can use the db push command which is a more prod friendly command

```bash
bunx prisma db push
```

### Templates

This project uses the template system developed by @jaspermayone. To add a new template, edit the `lib/templates.yaml` file and add a new template. The key of the template is the name of the template and the value is an array of strings that are the messages that the template will send. The messages can be any string and can include variables that will be replaced with the values of the passed variables from the `data` interface in `lib/template.ts`. The variables are surrounded by `${}` and the name of the variable is inside the curly braces.


Example:
```yaml
app:
    startup:
        - "What'da know? I AM ALIVE! :heart-eng: :robot_face: and running in the env *${environment}*! :tada:"
        - whoa! hey there! im functional ig... check me out in the env *${environment}*!
```

To add a new variable simply add it to the `data` interface in `lib/template.ts` and then use it in the template file!

Example:
```typescript
interface data {
    environment?: string
}
```

The types for the template are sadly not automatically generated so you will have to manually add the new keys and names to the `template` type in `lib/template.ts`

Example:
```typescript
type template = 'app.startup'
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
