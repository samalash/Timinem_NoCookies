const { SlashCommandBuilder } = require('discord.js');
const { queue } = require('../queueMap.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('Sets loop mode (song | queue | off).')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Choose loop mode.')
                .setRequired(true)
                .addChoices(
                    { name: 'SONG', value: 'SONG'},
                    { name: 'QUEUE', value: 'QUEUE'},
                    { name: 'OFF', value: 'OFF'},
                )
        ),
	async execute(interaction) {
        function serverQueue() { return queue.get(interaction.guildId); }
        const memberVoiceChannel = interaction.member.voice.channel;
        const arg1 = interaction.options.getString("mode");

        if (!serverQueue()){
            await interaction.reply({content:':x: I must be in a voice channel to use this command.', ephemeral:false});
        }else if((memberVoiceChannel && (serverQueue().voiceChannel.id != memberVoiceChannel.id)) || !memberVoiceChannel){
            await interaction.reply({content:':x: You must be in my voice channel to use this command.', ephemeral:false});
        } else{
            serverQueue().lastCommand = Date.now();
            
            console.log("LOOP COMMAND USED: " + arg1);
            console.log("Old: " + serverQueue().loop);
            queue.get(interaction.guildId).loop = arg1;
            console.log("New: " + serverQueue().loop);
            if (queue.get(interaction.guildId).loop == "SONG"){
                await interaction.reply({content:':repeat: Loop mode set to **SONG** mode.', ephemeral:false});
            }else if (queue.get(interaction.guildId).loop == "QUEUE"){
                await interaction.reply({content:':arrows_clockwise: Loop mode set to **QUEUE** mode.', ephemeral:false});
            }else{
                await interaction.reply({content:':arrow_right: Loop mode set to **OFF**.', ephemeral:false});
            }
        }
		
	},
};