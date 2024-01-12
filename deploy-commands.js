const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}


// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();




/*
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const { REST, Routes } = require('discord.js');
//const { REST } = require('@discordjs/rest');
//const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
    new SlashCommandBuilder().setName('play').setDescription('Plays a song.').addStringOption(option => option.setName('song').setDescription('Enter the song name').setRequired(true)),
	new SlashCommandBuilder().setName('pause').setDescription('Pauses/unpauses the music player.'),
	new SlashCommandBuilder().setName('unpause').setDescription('Unpauses the music player.'),
	new SlashCommandBuilder().setName('skip').setDescription('Skips the current song.'),
	new SlashCommandBuilder().setName('join').setDescription('Joins the voice channel.'),
	new SlashCommandBuilder().setName('leave').setDescription('Leaves the voice channel.'),
	new SlashCommandBuilder().setName('clear').setDescription('Clears the queue.'),
	new SlashCommandBuilder().setName('stop').setDescription('Stops the current song and clears queue.'),
	new SlashCommandBuilder().setName('queue').setDescription('Displays the song queue.'),
	new SlashCommandBuilder().setName('loop').setDescription('Sets loop mode (song | queue | off).').addStringOption(option => option.setName('mode').setDescription('Choose loop mode.').setRequired(true).addChoice('Song', 'song').addChoice('Queue', 'queue').addChoice('Off', 'off')),
	new SlashCommandBuilder().setName('skipto').setDescription('Skips to a specified song in queue.').addIntegerOption(option => option.setName('song_position').setDescription('Enter the song position in queue.').setRequired(true)),
]
	.map(command => command.toJSON());
 
/*
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}
*/
/*
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();

*/