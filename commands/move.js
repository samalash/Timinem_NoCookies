const { SlashCommandBuilder } = require('discord.js');
const { queue } = require('../queueMap.js');

const wait = require('util').promisify(setTimeout);


module.exports = {
	data: new SlashCommandBuilder()
		.setName('move')
		.setDescription('Moves a specified song in queue to a different position.')
        .addIntegerOption(option => option.setName('current_position').setDescription("Enter the song's current position in queue.").setRequired(true))
        .addIntegerOption(option => option.setName('new_position').setDescription("Enter the song's new position in queue.").setRequired(true)),
	async execute(interaction) {
        function serverQueue() { return queue.get(interaction.guildId); }
        const memberVoiceChannel = interaction.member.voice.channel;

        if (!serverQueue()){
            await interaction.reply({content:':x: I must be in a voice channel to use this command.', ephemeral:false});
        }else if((memberVoiceChannel && (serverQueue().voiceChannel.id != memberVoiceChannel.id)) || !memberVoiceChannel){
            await interaction.reply({content:':x: You must be in my voice channel to use this command.', ephemeral:false});
            //console.log("Member channel id: " + memberVoiceChannel.id);
            //console.log("Bot channel id: " + serverQueue().voiceChannel.id);
        } else{
            //const { player } = require('./play.js');
            
            const arg1 = interaction.options.getInteger("current_position");
            const arg2 = interaction.options.getInteger("new_position");

            if (serverQueue().songs.length < 3){
                await interaction.reply({content:':x: There are not enough songs in queue to move them.', ephemeral:false});
            }else if (arg1 < 1 || arg1 > serverQueue().songs.length - 1 || arg2 < 1 || arg2 > serverQueue().songs.length - 1){
                await interaction.reply({content:':x: Please use a number between 1 and ' + serverQueue().songs.length - 1 + ".", ephemeral:false});
            }else if (arg1 == arg2){
                await interaction.reply({content:':x: Please use different numbers.', ephemeral:false});
            }else{
                serverQueue().lastCommand = Date.now();
                
                
                moveSong = serverQueue().songs[arg1];
                serverQueue().songs.splice(arg1, 1);
                serverQueue().songs.splice(arg2, 0, moveSong);
                interaction.reply({content:':arrow_right: Moved `' + moveSong.title + '` from position **' + arg1 + '** to **' + arg2 + '** in the queue.', ephemeral:false});
                
            }
        
        
        }
		
	},
};