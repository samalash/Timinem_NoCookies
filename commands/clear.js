const { SlashCommandBuilder } = require('discord.js');
const { queue } = require('../queueMap.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clears the queue.'),
	async execute(interaction) {
        function serverQueue() { return queue.get(interaction.guildId); }
        const memberVoiceChannel = interaction.member.voice.channel;


        // IF NOT IN VOICE CHANNEL
        if (!serverQueue()){
            await interaction.reply({content:':x: I must be in a voice channel to use this command.', ephemeral:false});

        // IF NOT IN SAME VOICE CHANNEL AS USER
        }else if((memberVoiceChannel && (serverQueue().voiceChannel.id != memberVoiceChannel.id)) || !memberVoiceChannel){
            await interaction.reply({content:':x: You must be in my voice channel to use this command.', ephemeral:false});

        // IF QUEUE EMPTY
        }else if(serverQueue().songs.length < 2){
            await interaction.reply({content:":x: There's nothing in queue to clear.", ephemeral:false});


        // REMOVE ALL SONGS AFTER INDEX 0
        } else{
            serverQueue().lastCommand = Date.now();
            serverQueue().songs.splice(1, serverQueue().songs.length);
            await interaction.reply({content:":fire: Queue cleared.", ephemeral:false});
        }
		
	},
};