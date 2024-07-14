<!-- omit in toc -->
# The Ultimate _(hopefully?)_ Slackbot template

For the ultimate slackbot experience, use this template to get started with your own slackbot!

- [Development](#development)
  - [Database](#database)
  - [Templates](#templates)
  - [Logging System](#logging-system)
    - [Slog](#slog)
    - [Clog](#clog)
    - [Blog](#blog)
  - [Feature system](#feature-system)
- [Contributing](#contributing)


<!-- omit in toc -->
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

This project uses the template system developed by [@jaspermayone](https://github.com/jaspermayone). To add a new template, edit the `lib/templates.yaml` file and add a new template. The key of the template is the name of the template and the value is an array of strings that are the messages that the template will send. The messages can be any string and can include variables that will be replaced with the values of the passed variables from the `data` interface in `lib/template.ts`. The variables are surrounded by `${}` and the name of the variable is inside the curly braces.

<!-- omit in toc -->
#### Template Example:
```yaml
app:
    startup:
        - "What'da know? I AM ALIVE! :heart-eng: :robot_face: and running in the env *${environment}*! :tada:"
        - whoa! hey there! im functional ig... check me out in the env *${environment}*!
```

To add a new variable simply add it to the `data` interface in `lib/template.ts` and then use it in the template file!

<!-- omit in toc -->
#### Date Interface Example:
```typescript
interface data {
    environment?: string
}
```

The types for the template are sadly not automatically generated so you will have to manually add the new keys and names to the `template` type in `lib/template.ts`

<!-- omit in toc -->
#### Template Type Example:
```typescript
type template = 'app.startup'
```

### Logging System

This project uses the logging system developed by [@jaspermayone](https://github.com/jaspermayone) (with some modifications of my own) to work in conjunction with the template system (I love it so much i've used in in basicaly every slackbot i've made since he told me about it lol; thats mostly why this project exists, so i can more easily spin up a slackbot with everything i need).

The system is stored in `lib/Logger.ts` and its queuing system is stored in `lib/queue.ts`. The logger exports 3 functions: `slog`, `clog`, and `blog`.

#### Slog
`slog` is for sending messages to slack and takes a `logMessage` string and an optional `location` object that provides the `channel` and `thread_ts` of the message that the logger is responding to. 
```typescript
async function slog(
    logMessage: string,
    location?: {
        thread_ts?: string
        channel: string
    }
): Promise<void>
```

#### Clog
`clog` is for sending messages to the console and takes a `logMessage` string and a manditory `type` string that is the type of the message (info, warn, error, etc) and logs the message to the console with a color based on the type.
```typescript
async function clog(
    logMessage: string,
    type: LogType
): Promise<void>

type LogType = 'info' | 'start' | 'cron' | 'error'
```

#### Blog
`blog` is for sending messages to both slack and the console and takes a `logMessage` string, a manditory `type` string that is the type of the message (info, warn, error, etc), and an optional `location` object that provides the `channel` and `thread_ts` of the message that the logger is responding to.
```typescript
async function blog(
    logMessage: string,
    type: LogType,
    location?: {
        thread_ts?: string
        channel: string
    }
): Promise<void>

type LogType = 'info' | 'start' | 'cron' | 'error'
```

### Feature system

The feature system is based on writing your features as seperate independent files in the `features/` directory each exporting a single default async inline function with a void promise. These functions are exported in the `features/index.ts` file and are then imported and ran at startup in `index.ts`. The features are run in the order that they are imported in the `features/index.ts` file and will log their name as exported in the `features/index.ts` file.

<!-- omit in toc -->
#### Example:  
`features/feature.ts`
```typescript
const feature = async (): Promise<void> => {
    // do something
}

export default feature
```
`features/index.ts`
```typescript
export { default as feature } from './feature'
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
