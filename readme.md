# Discord Chat Sync

Discord Chat Sync is a Discord bot that syncs up channels between different servers and allows for secure communication between them.
 * Cross server communication
 * Block servers
 * Anti phishing included

## Dependencies

* MongoDB (https://www.mongodb.com/atlas)
  * 2 Documents ( Repositories )
    1. chat-bot
    2. chat-bot-dev

##  Installation

1. Download this repository
2. Install dependencies with `npm install`
3. Copy `.env_empty` and name it to `.env` (or for development purposes `.env-dev`)
    * Example:
        ```
        BOT_TOKEN="YOUR BOT TOKEN"
        DB_ADDRESS="ADDRESS OF DB"
        DISCORDS_API="DISCORD API"
        ```
4. Run it with `npm run start` (or for development purposes `npm run dev`)

##  Public Bot

You can invite the public instance of the bot by clicking [here](https://discord.com/api/oauth2/authorize?client_id=1046756800260735058&permissions=533113203777&scope=bot%20applications.commands).

#### Permissions For The Public Bot
<details><summary><b>Embed Links</b></summary>
This is required to sync links between servers
</details>
<details><summary><b>External Emojis / Sticker</b></summary>
This is required to sync emojis and stickers from other servers
</details>

<details><summary><b>Attach Files</b></summary>
In the future, this will allow the users to share files through the bot
</details>
<details><summary><b>Add Reaction</b></summary>
In the future, this will allow the bot to share reactions to messages and react to your message as a confirmation
</details>
<details><summary><b>Read / Send Messages</b></summary>
This is required for the core functions
</details>
<details><summary><b>Send Messages in Threads</b></summary>
In the future, this will allow to access/handle threads and their content
</details>
<details><summary><b>Read message history</b></summary>
In the future, this will allow the bot to sync messages when setting up in a new server
</details>

## Links To The Bot:

 [![Bots for Discord](https://discords.com/bots/api/bot/1046756800260735058/widget)](https://discords.com/bots/bots/1046756800260735058)
 [![Discord Bots](https://top.gg/api/widget/1046756800260735058.svg)](https://top.gg/bot/1046756800260735058)
