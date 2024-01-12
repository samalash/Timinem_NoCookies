const { SlashCommandBuilder } = require('discord.js');
const { queue } = require('../queueMap.js');

const wait = require('util').promisify(setTimeout);

// "BETTER" WAY OF ACCESSING PLAYER THAT DOESN'T WORK. REPLACE 'player' WITH 'getPlayer()' ETC.
/*
const DJS = require('@discordjs/voice');
function getConnection() { return DJS.getVoiceConnection(750782341370347631); }
function getPlayer() { getConnection.state.subscription?.player; }
*/

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skips the current song.'),
    
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
            
            const { player } = require('./play.js');
            
            if (serverQueue().songs.length < 1){
                await interaction.reply({content:':x: There are no songs to skip.', ephemeral:false});
            } else{
                serverQueue().lastCommand = Date.now();
                
                if (serverQueue().loop == "QUEUE"){
                    serverQueue().songs.push(serverQueue().songs[0]);
                }
                await interaction.reply({content:':fast_forward: Skipping...', ephemeral:false});
                if (!serverQueue().playing){
                    serverQueue().player.play();
                }
                serverQueue().player.stop();
                setTimeout(function(){
                    if (serverQueue().songs.length > 0){
                        interaction.editReply({content:':track_next: Song skipped. Now playing `' + serverQueue().songs[0].title + '`.', ephemeral:false});
                    }else{
                        serverQueue().playing = false;
                        interaction.editReply({content:':track_next: Song skipped.', ephemeral:false});
                    }
                }, 1250);
            }
            
            
        }
		
	},
};