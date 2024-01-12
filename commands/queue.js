const { SlashCommandBuilder } = require('discord.js');
const { queue } = require('../queueMap.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Displays the song queue.'),
	async execute(interaction) {
        function serverQueue() { return queue.get(interaction.guildId); }
        const memberVoiceChannel = interaction.member.voice.channel;
        var pages;
        
        
        if (!serverQueue()){
            await interaction.reply({content:':x: I must be in a voice channel to use this command.', ephemeral:false});
        }else if((memberVoiceChannel && (serverQueue().voiceChannel.id != memberVoiceChannel.id)) || !memberVoiceChannel){
            await interaction.reply({content:':x: You must be in my voice channel to use this command.', ephemeral:false});
        }else if(serverQueue().songs.length < 1){
                await interaction.reply({content:":x: There's nothing in queue.", ephemeral:false});
    
    
        }else{
            serverQueue().lastCommand = Date.now();
            // ACCESS QUEUE SONGS
            const songs = serverQueue().songs;


            // FUNCTION TO SET THE CURRENT TOTAL NUMBER OF PAGES IN QUEUE, TO ACTIVATE EVERY TIME BUTTON PRESSED
            function setNumPages() {
                if (serverQueue().songs.length <= 11){
                    pages = 1;
                }else if (serverQueue().songs.length % 10 <= 1){
                    pages = Math.floor(serverQueue().songs.length/10);
                }else{
                    pages = Math.floor(serverQueue().songs.length/10) + 1;
                }
            }
            setNumPages();

            // CREATING SOME VARIABLES
            var curPage = 1;
            const user = interaction.user;
            const userIcon = user.avatarURL();
            const serverIcon = interaction.guild.iconURL();
            const serverName = interaction.guild.name;

            // CREATE EMBED WITH QUEUE IN IT
            function makeEmbed(){
                // CREATE PREPARE RAW DURATION, TURNS NUMBER OF SECONDS INTO A STRING OF DURATION, EX: 70 SECONDS -> "1:10"
                function prepareDuration(totalSec){
                    raw = "";
                    if (totalSec >= 3600){
                        if (Math.floor(totalSec / 3600) > 9){
                            raw += Math.floor(totalSec / 3600) + ":";
                        }else{
                            raw += "0" + Math.floor(totalSec / 3600) + ":";
                        }
                        
                        totalSec = totalSec % 3600;
                    }
                    if (totalSec >= 60){
                        if (Math.floor(totalSec / 60) > 9){
                            raw += Math.floor(totalSec / 60) + ":";
                        }else{
                            raw += "0" + Math.floor(totalSec / 60) + ":";
                        }

                        totalSec = totalSec % 60;

                    }else{
                        raw += "00:";
                    }
                    if (totalSec > 9){
                        raw += totalSec;
                    }else{
                        raw += "0" + totalSec;
                    }
                    return raw;
                }

                // PREPARES VALUE OF TOTAL DURATION REMAINING OF SONGS IN QUEUE
                queueDurationSeconds = 0;

                    // ADD TIME REMAINING IN CURRENT SONG
                currentSongRemainingSeconds = serverQueue().songs[0].durationSec - Math.floor((serverQueue().songs[0].resource.playbackDuration / 1000));
                queueDurationSeconds += currentSongRemainingSeconds;

                    // ADD DURATION OF QUEUED SONGS
                for (let song of serverQueue().songs.slice(1)){
                    queueDurationSeconds += song.durationSec;
                }
                queueDurationRaw = prepareDuration(queueDurationSeconds);


                // PREPARE CURRENT SONG DURATION
                currentSongRemainingRaw = prepareDuration(currentSongRemainingSeconds);

                // TOP OF EMBED, INCLUDING CURRENTLY PLAYING SONG
                var firstSong = serverQueue().songs[0];
                const queueEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Song Queue')
                .setAuthor({ name: serverName, iconURL: serverIcon })
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Now playing:', value: "[" + firstSong.title + "](" + firstSong.url + ") • `" + firstSong.durationRaw + " (" + currentSongRemainingRaw + " remaining)`\nRequested by " + firstSong.member.displayName + " (" + firstSong.member.user.username + ")" },
                    { name: '——————', value: "\u200B"},
                );
                
                
                // ADDS A FIELD FOR EACH SONG IN QUEUE FOLLOWING THE CURRENT SONG
                var song;
                for (i = 1+(10*(curPage-1)); i <= 10*curPage; i++){
                    if(serverQueue().songs[i]){
                        song = serverQueue().songs[i];
                        queueEmbed.addFields({ name: '\u200B', value: i + ": [" + song.title + "](" + song.url + ") • `" + song.durationRaw + "`\nRequested by " + song.member.displayName + " (" + song.member.user.username + ")"});
                    }else{
                        break;
                    }
                }
                
                // MORE BLANK SPACE
                queueEmbed.addFields({name: '\u200B', value:'\u200B'});
                

                // SHOWS AMOUNT OF SONGS IN QUEUE AND TOTAL DURATION
                if (serverQueue().songs.length - 1 == 1){
                    queueEmbed.addFields({name: '\u200B', value: "**" + (serverQueue().songs.length - 1) + " song in queue • " + queueDurationRaw + " total remaining**"});
                } else {
                    queueEmbed.addFields({name: '\u200B', value: "**" + (serverQueue().songs.length - 1) + " songs in queue • " + queueDurationRaw + " total remaining**"});
                }
                
                // BOTTOM OF EMBED
                queueEmbed.setTimestamp();
                queueEmbed.setFooter({ text: 'Page ' + curPage + '/' + pages + ' • Loop Mode: ' + serverQueue().loop, iconURL: userIcon});
                return queueEmbed;
            }

            // CREATE ROW WITH FIRST, NEXT, PREVIOUS, AND LAST PAGE BUTTONS IN IT
            var row;
            function makeButtons(firstDis, prevDis, nextDis, lastDis) {
                let newRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('first')
                        .setLabel('<<<')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(firstDis),
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('<')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(prevDis),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('>')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(nextDis),
                    new ButtonBuilder()
                        .setCustomId('last')
                        .setLabel('>>>')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(lastDis),
    
                );
                return newRow;
            }

            // IF MULTIPLE PAGES, CREATE BUTTONS AND CHECK FOR CLICKS
            if (pages > 1){
                await interaction.reply({ embeds: [makeEmbed()], components: [makeButtons(true, true, false, false)], });
                var iReply;
                interaction.fetchReply()
                    .then(reply => iReply=reply)
                    .catch(console.error);

                // ON BUTTON PRESS, CHANGE PAGES. STOP DETECTING CLICKS AFTER "time" MILLISECONDS
                const filter = i => (i.customId === 'next' || i.customId === 'prev' || i.customId === 'first' || i.customId === 'last') && i.user.id === user.id;
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 600000 });
                
                
                collector.on('collect', async i => {
                    if (!i.isButton()) return;
                    if (i.user.id != user.id) {
                        await interaction.reply({content:":x: You can't use the page buttons on a queue someone else requested.", ephemeral:true});
                        return;
                    }
                    if (i.message.id != iReply.id) return;
                    
                    i.deferUpdate();

                    setNumPages();
                    if (i.customId === 'next'){
                        curPage++;
                        if (curPage>pages){
                            curPage = pages;
                        }

                        var nextDisabled = false;
                        var lastDisabled = false;
                        if (curPage == pages){
                            nextDisabled = true;
                            lastDisabled = true;
                        }

                        var lowEnd = 10 * (curPage - 1) + 1;
                        var highEnd = 10 * curPage;
                        
                        

                        await interaction.editReply({ embeds: [makeEmbed()], components: [makeButtons(false, false, nextDisabled, lastDisabled)], });
                    }else if (i.customId === 'prev'){
                        curPage--;
                        var prevDisabled = false;
                        var firstDisabled = false;
                        if (curPage == 1){
                            prevDisabled = true;
                            firstDisabled = true;
                        }

                        var lowEnd = 10 * (curPage - 1) + 1;
                        var highEnd = 10 * curPage;
                        
                        

                        interaction.editReply({ embeds: [makeEmbed()], components: [makeButtons(firstDisabled, prevDisabled, false, false)], });
                    }else if (i.customId === 'first'){
                        curPage = 1;
                        var prevDisabled = true;
                        var firstDisabled = true;

                        var lowEnd = 10 * (curPage - 1) + 1;
                        var highEnd = 10 * curPage;
                        
                        

                        interaction.editReply({ embeds: [makeEmbed()], components: [makeButtons(firstDisabled, prevDisabled, false, false)], });
                    }else if (i.customId === 'last'){
                        curPage = pages;
                        var nextDisabled = true;
                        var lastDisabled = true;

                        var lowEnd = 10 * (curPage - 1) + 1;
                        var highEnd = 10 * curPage;
                        
                        

                        interaction.editReply({ embeds: [makeEmbed()], components: [makeButtons(false, false, nextDisabled, lastDisabled)], });
                    }

                });
                
                // AFTER "time" ENDS, DISABLE BUTTONS
                collector.on('end', collected => {
                    if (serverQueue() && serverQueue().songs.length > 0){
                        interaction.editReply({ embeds: [makeEmbed()], components: [makeButtons(true, true, true, true)], });
                    }
                });




            }else{ 
                // IF ONE QUEUE PAGE, DON'T MAKE BUTTONS
                await interaction.reply({ embeds: [makeEmbed()] });
            }
            
            
            
        }
            
        
        
		
	},
};