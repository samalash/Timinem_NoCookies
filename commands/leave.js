const { SlashCommandBuilder } = require('discord.js');
const { queue } = require('../queueMap.js');
const { joinVoiceChannel } = require('@discordjs/voice');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Leaves the voice channel.'),
	async execute(interaction) {
        function serverQueue() { return queue.get(interaction.guildId); }
        const memberVoiceChannel = interaction.member.voice.channel;


        
        if (!serverQueue()){
            await interaction.reply({content:":x: I'm not in a voice channel.", ephemeral:false});
            return;
        }

        if(!memberVoiceChannel || (memberVoiceChannel.id != serverQueue().voiceChannel.id)){
            await interaction.reply({content:":x: You must be in my voice channel to use this command.", ephemeral:false});
            return;
        }
        
        
        

        if (serverQueue()){
            serverQueue().songs = [];
            serverQueue().player ? serverQueue().player.stop() : false;
            serverQueue().connection.destroy();
            queue.delete(interaction.guildId);
        }
        
        await interaction.reply({content:':runner: Leaving **' + memberVoiceChannel.name + "**.", ephemeral:false});
            
        
            
        
		
	},
};