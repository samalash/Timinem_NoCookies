const { SlashCommandBuilder } = require('discord.js');
const { queue } = require('../queueMap.js');



module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('Shuffles the song queue, including the current song.'),
	async execute(interaction) {
        function serverQueue() { return queue.get(interaction.guildId); }
        const memberVoiceChannel = interaction.member.voice.channel;

        if (!serverQueue()){
            await interaction.reply({content:':x: I must be in a voice channel to use this command.', ephemeral:false});
        }else if((memberVoiceChannel && (serverQueue().voiceChannel.id != memberVoiceChannel.id)) || !memberVoiceChannel){
            await interaction.reply({content:':x: You must be in my voice channel to use this command.', ephemeral:false});
        }else if(serverQueue().songs.length < 2){
            await interaction.reply({content:":x: There's not enough songs to shuffle.", ephemeral:false});
                
    
    
        }else{
            serverQueue().lastCommand = Date.now();

            await interaction.reply({content:':twisted_rightwards_arrows: Shuffling...', ephemeral:false});
            
            var queueCopy = serverQueue().songs;
            var newQueue = [{name: "blank song"}];

            while (queueCopy.length > 0){
                let randomSong = queueCopy.splice(Math.floor(Math.random() * queueCopy.length),1)[0];
                newQueue.push(randomSong);
            }

            serverQueue().songs = newQueue;
            serverQueue().player.stop();
            setTimeout(function(){
                interaction.editReply({content:':twisted_rightwards_arrows: Queue shuffled. Now playing `' + serverQueue().songs[0].title + '`.', ephemeral:false});
            }, 1250);
        }
            
        
        
		
	},
};