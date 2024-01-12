const { SlashCommandBuilder } = require('discord.js');
const { queue } = require('../queueMap.js');

// "BETTER" WAY OF ACCESSING PLAYER THAT DOESN'T WORK. REPLACE 'player' WITH 'getPlayer()' ETC.
/*
const DJS = require('@discordjs/voice');
function getConnection() { return DJS.getVoiceConnection(750782341370347631); }
function getPlayer() { getConnection.state.subscription?.player; }
*/


module.exports = {
	data: new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('Unpauses the music player.'),
	async execute(interaction) {
        function serverQueue() { return queue.get(interaction.guildId); }
        const memberVoiceChannel = interaction.member.voice.channel;

        if (!serverQueue()){
            await interaction.reply({content:':x: I must be in a voice channel to use this command.', ephemeral:false});
        }else if((memberVoiceChannel && (serverQueue().voiceChannel.id != memberVoiceChannel.id)) || !memberVoiceChannel){
            await interaction.reply({content:':x: You must be in my voice channel to use this command.', ephemeral:false});
        } else{
            serverQueue().lastCommand = Date.now();

            //const { player } = require('./play.js');
            
            serverQueue().playing = true;
            serverQueue().player.unpause();
            await interaction.reply({content:':arrow_forward: Player unpaused.', ephemeral:false});

            console.log(serverQueue().songs[0].resource.playbackDuration);
            
        }
		
	},
};