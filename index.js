const fs = require('fs');
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
// const { clientId, guildId, token } = require('./config.json');

//const myIntents = new GatewayIntentBits();
//myIntents.add(GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.Guilds);
const client = new Client({ intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.Guilds] });
const { queue } = require('./queueMap.js');
const wait = require('util').promisify(setTimeout);

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const dotenv = require('dotenv');

dotenv.config();


for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log('-----------------------------------------------------\nReady!');
	//client.user.setActivity("music bot competitions", { type: ActivityType.Competing });
	//client.user.setActivity("music and stuff", { type: ActivityType.Playing });
	client.user.setActivity("you sleep.", { type: ActivityType.Watching });
});

//TIME IN MINUTES OF INACTIVITY BEFORE KICKING BOT FROM VOICE CHANNEL
const InactivityTimeMinutes = 10;
const InactivityTime = 60000*InactivityTimeMinutes - 1000;


 



client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

	//function serverQueue() { return queue.get(interaction.guildId); }

	//if (serverQueue()){
	//	console.log(serverQueue().playing);
	//}


});


client.login(process.env.TOKEN);





inactivityDebounce = false;
setInterval(async function(){
	if (!inactivityDebounce){
		inactivityDebounce = true;
		queue.forEach(element => {
			if (element && element.songs.length == 0 && !element.playing && (Date.now() - element.lastCommand) > InactivityTime){
				element.connection.destroy();
				queue.delete(element.guildId);
				console.log("Left for inactivity.");
			}
		});
		inactivityDebounce = false;
	}
},900);