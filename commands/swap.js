const { SlashCommandBuilder } = require('discord.js');
const { queue } = require('../queueMap.js');

const wait = require('util').promisify(setTimeout);


module.exports = {
	data: new SlashCommandBuilder()
		.setName('swap')
		.setDescription('Swaps two songs in queue.')
        .addIntegerOption(option => option.setName('first_song').setDescription("Enter the first song's position in queue.").setRequired(true))
        .addIntegerOption(option => option.setName('second_song').setDescription("Enter the second song's position in queue.").setRequired(true)),
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
            
            const arg1 = interaction.options.getInteger("first_song");
            const arg2 = interaction.options.getInteger("second_song");

            if (serverQueue().songs.length < 3){
                await interaction.reply({content:':x: There are not enough songs in queue to move them.', ephemeral:false});
            }else if (arg1 < 1 || arg1 > serverQueue().songs.length - 1 || arg2 < 1 || arg2 > serverQueue().songs.length - 1){
                await interaction.reply({content:':x: Please use a number between 1 and ' + serverQueue().songs.length - 1 + ".", ephemeral:false});
            }else if (arg1 == arg2){
                await interaction.reply({content:':x: Please use different numbers.', ephemeral:false});
            }else{
                serverQueue().lastCommand = Date.now();
                
                
                firstSong = serverQueue().songs[arg1];
                secondSong = serverQueue().songs[arg2];
                serverQueue().songs.splice(arg1, 1);
                serverQueue().songs.splice(arg2, 1);
                serverQueue().songs.splice(arg1, 0, secondSong);
                serverQueue().songs.splice(arg2, 0, firstSong);
                interaction.reply({content:':arrows_counterclockwise: Swapped `' + firstSong.title + '` and `' + secondSong.title + '`.', ephemeral:false});
                
            }
        
        
        }
		
	},
};