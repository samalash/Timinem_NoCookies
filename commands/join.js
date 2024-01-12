const { SlashCommandBuilder } = require('discord.js');
const { queue } = require('../queueMap.js');
const { joinVoiceChannel } = require('@discordjs/voice');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Joins the voice channel.'),
	async execute(interaction) {
        function serverQueue() { return queue.get(interaction.guildId); }
        const memberVoiceChannel = interaction.member.voice.channel;

        if(!memberVoiceChannel){
            await interaction.reply({content:":x: Please join a voice channel before using this command.", ephemeral:false});
            return;
        }

        if(!memberVoiceChannel.joinable){
            await interaction.reply({content:":x: I do not have permission to join this voice channel.", ephemeral:false});
            return;
        }

        
        if (!serverQueue()){
            const queueDetails = {
                guildId: interaction.guildId,
                textChannel: interaction.channel,
                voiceChannel: interaction.member.voice.channel,
                connection: null,
                songs: [],
                player: null,
                volume: 5,
                playing: false,
                loop: "off",
                lastCommand: Date.now(),
            }
            queue.set(interaction.guildId, queueDetails);
            await interaction.reply({content:':door: Joining **' + memberVoiceChannel.name + "**.", ephemeral:false});
        }else{
            await interaction.reply({content:'Switching to **' + memberVoiceChannel.name + "**.", ephemeral:false});
            serverQueue().voiceChannel = memberVoiceChannel;
        }
            
        const connection = joinVoiceChannel({
            channelId: memberVoiceChannel.id,
            guildId: memberVoiceChannel.guild.id,
            adapterCreator: memberVoiceChannel.guild.voiceAdapterCreator,
        });
        serverQueue().connection = connection;
        serverQueue().lastCommand = Date.now();
        
		
	},
};