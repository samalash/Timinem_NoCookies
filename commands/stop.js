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
		.setName('stop')
		.setDescription('Stops the current song and clears queue.'),
	async execute(interaction) {
        function serverQueue() { return queue.get(interaction.guildId); }
        const memberVoiceChannel = interaction.member.voice.channel;

        if (!serverQueue()){
            await interaction.reply({content:':x: I must be in a voice channel to use this command.', ephemeral:false});
        }else if((memberVoiceChannel && (serverQueue().voiceChannel.id != memberVoiceChannel.id)) || !memberVoiceChannel){
            await interaction.reply({content:':x: You must be in my voice channel to use this command.', ephemeral:false});
        }else if(serverQueue().songs.length < 1){
                await interaction.reply({content:":x: There's nothing to stop.", ephemeral:false});
    
    
        }else{
            serverQueue().lastCommand = Date.now();

            //const { player } = require('./play.js');

            serverQueue().playing = false;
            serverQueue().songs = [];
            serverQueue().player.stop();
            await interaction.reply({content:':stop_button: Player stopped.', ephemeral:false});
        }
            
        
        
		
	},
};