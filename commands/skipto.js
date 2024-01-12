const { SlashCommandBuilder } = require('discord.js');
const { queue } = require('../queueMap.js');

const wait = require('util').promisify(setTimeout);


module.exports = {
	data: new SlashCommandBuilder()
		.setName('skipto')
		.setDescription('Skips to a specified song in queue.')
        .addIntegerOption(option => option.setName('song_position').setDescription('Enter the song position in queue.').setRequired(true)),
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
            
            const arg1 = interaction.options.getInteger("song_position");

            if (serverQueue().songs.length < 2){
                await interaction.reply({content:':x: There are no songs in queue to skip to.', ephemeral:false});
            }else if (arg1 < 1 || arg1 > serverQueue().songs.length - 1){
                await interaction.reply({content:':x: Please use a number between 1 and ' + serverQueue().songs.length - 1 + ".", ephemeral:false});
            }else{
                serverQueue().lastCommand = Date.now();
                
                if (serverQueue().loop == "queue"){
                    for (i = 0; i < arg1 - 1; i++){
                        serverQueue().songs.push(serverQueue().songs[i]);
                    }
                }
                serverQueue().songs.splice(0, arg1 - 1);
                await interaction.reply({content:':fast_forward: Skipping...', ephemeral:false});
                serverQueue().player.stop();
                setTimeout(function(){
                    interaction.editReply({content:':track_next: Skipped to `' + serverQueue().songs[0].title + '`.', ephemeral:false});
                }, 1000);
            }
        
        
        }
		
	},
};