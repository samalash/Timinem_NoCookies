# Timinem
### Discord Music Bot (No YouTube Cookies Authorized)

Timinem is a Discord music bot first developed in Fall of 2022 which can play the audio of any YouTube video in a server voice chat. Songs/videos can also be requested while a different song is playing to create a queue which will automatically play each song in order. The `play` command accepts YouTube search queries, video links or playlist links. An explanation of each slash command is displayed in the command list found by typing `/` in the text chat of a server the bot is in.

**NOTE** - These files alone are not enough to run a functional bot. Running the bot requires:
- NodeJS installed
- all dependencies listed in package.json installed
- a [Discord Application/Bot user](https://discord.com/developers/applications)
- a file called `.env` which contains `TOKEN=[Discord bot's secret Token]`
- running the `deploy-commands.js` file to register commands with Discord by entering `node deploy-commands.js` in the command line
- entering `node .` in the command line to run the bot

**Additionally**, this version of Timinem does not have YouTube cookies authorized, meaning it **can not play age-restricted videos.** YouTube cookies contain login info that can be used to login to accounts, so it is not published in this repository. play-dl provides [instructions on how to authorize cookies](https://github.com/play-dl/play-dl/tree/main/instructions).