const { queue } = require('../queueMap.js');
const wait = require('util').promisify(setTimeout);

const { joinVoiceChannel } = require('@discordjs/voice');

const DJS = require('@discordjs/voice');
// function getConnection() { return DJS.getVoiceConnection(750782341370347631); }
// function getPlayer() { getConnection.state.subscription?.player; }

const { SlashCommandBuilder } = require('discord.js');
const { createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const playdl = require('play-dl');
const { join } = require('node:path');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a song.')
        .addStringOption(option => option.setName('song').setDescription('Enter the song name.').setRequired(true)),
	async execute(interaction) {
        const arg1 = interaction.options.getString("song");
        const voiceChannel = interaction.member.voice.channel;
        var newQueue = false;
        

        function serverQueue() { return queue.get(interaction.guildId); }

        
        // WAIT FUNCTION
        // WAIT FUNCTION
        // WAIT FUNCTION
        // WAIT FUNCTION
        // WAIT FUNCTION
        // WAIT FUNCTION
        // WAIT FUNCTION \/
        // await wait(5000); milliseconds

        
        
        
        // IF USER IS NOT IN VOICE CHANNEL
        if(!voiceChannel){
            await interaction.reply({content:":x: Please join a voice channel before playing.", ephemeral:false});
            return;
        }

        // IF BOT DOES NOT HAVE PERMISSION TO JOIN VOICE CHANNEL
        if(!voiceChannel.joinable){
            await interaction.reply({content:":x: I do not have permission to join this voice channel.", ephemeral:false});
            return;
        }

        // IF NO SONG ARGUMENT AND BOT NOT IN CHANNEL (only activates if arg1 not required, since arg1 can only be empty if not required)
        if (!arg1 && !serverQueue()){
            await interaction.reply({content:":x: You need to specify a song for the bot to join.", ephemeral:false});
            return;
        }
        await interaction.deferReply({ ephemeral: false });

        console.log("Play command used: " + arg1);


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

        
        // CREATE QUEUE
        if (!serverQueue()){
            newQueue = true;
            const queueDetails = {
                guildId: interaction.guildId,
                textChannel: interaction.channel,
                voiceChannel: interaction.member.voice.channel,
                connection: null,
                songs: [],
                player: null,
                volume: 5,
                playing: false,
                loop: "OFF",
                lastCommand: Date.now(),
            }
            queue.set(interaction.guildId, queueDetails);
            
            
            
            // JOIN VOICE CHANNEL
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
            serverQueue().connection = connection;

        }
        serverQueue().lastCommand = Date.now();


        // ALLOWS BOT TO BE PULLED TO DIFFERENT CHANNEL
        if (voiceChannel.id != serverQueue().connection.channelId){
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
            serverQueue().connection = connection;
            serverQueue().voiceChannel = interaction.member.voice.channel;
        }
        

        
        //async function initial(){
            // IF VIDEO LINK
            if((arg1.startsWith('https') || arg1.startsWith('http') || arg1.startsWith('www') || arg1.startsWith('youtube') || arg1.startsWith('youtu.be')) && playdl.yt_validate(arg1) === 'video'){
                //var videoInfo = await playdl.video_info(arg1);
                //videoInfo.video_details.


                var videoInfo = await playdl.search(arg1, { limit : 1 });
                //if (videoInfo.video_details.discretionAdvised){
                    //await interaction.reply({content:":x: This video appears to be age-restricted. Please find a different video.", ephemeral:false});
                    //return;
                //}
                songInfo = {
                    title: videoInfo[0].title,
                    url: videoInfo[0].url,
                    resource: false,
                    durationSec: videoInfo[0].durationInSec,
                    durationRaw: prepareDuration(videoInfo[0].durationInSec),
                    member: interaction.member,
                    amount: 1,
                    tim: false,
                }
                
                if (songInfo.durationSec == 0){
                    songInfo.durationRaw = "LIVE";
                }
                
                serverQueue().songs.push(songInfo);


            // IF PLAYLIST LINK
            }else if((arg1.startsWith('https') || arg1.startsWith('http') || arg1.startsWith('www') || arg1.startsWith('youtube') || arg1.startsWith('youtu.be')) && playdl.yt_validate(arg1) === 'playlist') {
                const playlist = await playdl.playlist_info(arg1, { incomplete : true });

                

                const playlistSongs = await playlist.all_videos();
                totalSec = 0;
                

                // ADD EACH SONG TO PLAYLIST
                for (i = 0; i < playlistSongs.length; i++){
                    //if (!playlistSongs[i].discretionAdvised){
                        song = {
                            title: playlistSongs[i].title,
                            url: playlistSongs[i].url,
                            resource: false,
                            durationSec: playlistSongs[i].durationInSec,
                            durationRaw: prepareDuration(playlistSongs[i].durationInSec),
                            member: interaction.member,
                            amount: playlistSongs.length,
                            tim: false,
                        }
                        if (song.durationSec == 0){
                            song.durationRaw = "LIVE";
                        }
                        serverQueue().songs.push(song);
                        totalSec += song.durationSec;
                    //}
                    
                    
                }
                
                

                songInfo = {
                    title: playlist.title,
                    url: playlist.url,
                    resource: false,
                    durationSec: totalSec,
                    durationRaw: prepareDuration(totalSec),
                    member: interaction.member,
                    amount: playlistSongs.length,
                    tim: false,
                }

                

            // IF TIM SONG
            } else if (arg1.toLowerCase().startsWith("tim ")){
                if (arg1.toLowerCase() == "tim apple"){
                    
                    songInfo = {
                        title: "Applebottom Jeans - Timothy Armstrong",
                        url: "https://cdn.discordapp.com/attachments/560543954781732864/991115977381126244/Tim_Apple.mp3",
                        resource: false,
                        durationSec: 60,
                        durationRaw: prepareDuration(60),
                        member: interaction.member,
                        amount: 1,
                        tim: true,
                    }
                    if (songInfo.durationSec == 0){
                        songInfo.durationRaw = "LIVE";
                    }
                    serverQueue().songs.push(songInfo);
                }


            // ELSE (SEARCH TERM)
            } else{
                const searchResults = await playdl.search(arg1, { limit : 1 });
                var searchResultIndex = 0;

                // IF NO RESULTS FOUND
                if (searchResults.length < 1){
                    await interaction.editReply({content:":x: No results found. Try a different search term.", ephemeral:false});
                    return;
                }
                //while (searchResults[searchResultIndex].discretionAdvised){
                    //searchResultIndex++;
                //}
                songInfo = {
                    title: searchResults[searchResultIndex].title,
                    url: searchResults[searchResultIndex].url,
                    resource: false,
                    durationSec: searchResults[searchResultIndex].durationInSec,
                    durationRaw: prepareDuration(searchResults[searchResultIndex].durationInSec),
                    member: interaction.member,
                    amount: 1,
                    tim: false,
                }
                if (songInfo.durationSec == 0){
                    songInfo.durationRaw = "LIVE";
                }
                serverQueue().songs.push(songInfo);
            }
        
        
            currentSong = {
                title: songInfo.title,
                url: songInfo.url,
                resource: false,
                durationSec: songInfo.durationSec,
                durationRaw: songInfo.durationRaw,
                member: songInfo.member,
                amount: songInfo.amount,
                tim: songInfo.tim,
            }
            
            connection = serverQueue().connection;

        //}
        

        // PLAYS SONG
        async function playSequence(){
            player = createAudioPlayer();
            module.exports = {
                player,
            }
            serverQueue().player = player;
            currentSong = serverQueue().songs[0];
            var resource;
            if (currentSong.tim){
                resource = createAudioResource(join(__dirname, '../Tim_Apple.mp3'), { inlineVolume: true });
                console.log("tim apple");
            }else{
                let stream = await playdl.stream(currentSong.url);
                console.log(currentSong.url);
                resource = createAudioResource(stream.stream, {inputType: stream.type, inlineVolume: true});
                
            }
            resource.volume.setVolume(1);

            serverQueue().songs[0].resource = resource;

            connection.subscribe(player);
            player.play(resource);

            player.on('error', error => {
                console.error(error);
            });
            
            serverQueue().playing = true;
            console.log("Playing " + currentSong.title);
        };
        
        


        function check() {
            // WHEN SONG STOPS PLAYING
            serverQueue().player.on(AudioPlayerStatus.Idle, () => {
                console.log('song over!');
                // IF LOOP IS ON 'QUEUE' MODE, BRING CURRENT SONG TO END OF QUEUE AND PLAY NEXT SONG
                if(serverQueue().loop == "QUEUE"){
                    serverQueue().songs.push(serverQueue().songs.shift());
                    console.log("qloop???");
                    playSequence();
                    check();
                // IF LOOP IS ON 'SONG' MODE, REPLAY CURRENT SONG
                }else if(serverQueue().loop == "SONG"){
                    console.log("sloop???");
                    playSequence();
                    check();
                
                // IF LOOP IS OFF, PLAY NEXT SONG
                }else{
                    serverQueue().songs.shift();
                    if (serverQueue().songs.length > 0){
                        playSequence();
                        check();
                    // IF QUEUE EMPTY, SET PLAYING TO FALSE AND END SCRIPT
                    }else{
                        serverQueue().playing = false;
                        serverQueue().songs = [];
                        serverQueue().lastCommand = Date.now();
                    }
                }
            });
            serverQueue().player.on(AudioPlayerStatus.AutoPaused, () => {
                console.log("AutoPaused??");
            });
            serverQueue().player.on('error', error => {
                console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
                playSequence();
            });
        }


        // IF NOT IN VOICE CHANNEL
        if(newQueue){
            
            
            await interaction.editReply({content:"Searched: `" + arg1 + "`\n\nPlaying:\n`" + currentSong.title + "` (" +  currentSong.url + ")\nDuration: `" + currentSong.durationRaw + "`", ephemeral:false});
            
            


            playSequence();
            check();
            

                
                
        
        // IF IN VOICE CHANNEL WITH SONGS IN QUEUE
        }else if(serverQueue().songs.length > currentSong.amount){
            
            await interaction.editReply({content: "Searched: `" + arg1 + "`\n\nAdded to queue:\n`" + currentSong.title + "` (" + currentSong.url + ")\nDuration: `" + currentSong.durationRaw + "`\n\nPosition **" + (serverQueue().songs.length - 1) + "** in queue.", ephemeral:false});
            return;

        // IF IN VOICE CHANNEL WITH EMPTY QUEUE
        }else{
            
            await interaction.editReply({content:"Searched: `" + arg1 + "`\n\nPlaying:\n`" + currentSong.title + "` (" +  currentSong.url + ")\nDuration: `" + currentSong.durationRaw + "`", ephemeral:false});
            
            playSequence();
            check();
        }
            

        
        
	},
};
