class SpotSongPlayer {
    constructor() {
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.audio = new Audio();
        this.audio.preload = 'metadata';
        
        this.songs = [
            { name: "On & On", artist: "Cartoon, Daniel Levi", file: "songs/1.mp3", cover: "covers/1.jpg" },
            { name: "Invincible", artist: "DEAF KEV", file: "songs/2.mp3", cover: "covers/2.jpg" },
            { name: "Mortals", artist: "Warriyo, Laura Brehm", file: "songs/3.mp3", cover: "covers/3.jpg" },
            { name: "Shine", artist: "Cartoon", file: "songs/4.mp3", cover: "covers/4.jpg" },
            { name: "Why We Lose", artist: "Cartoon feat. Coleman Trapp", file: "songs/5.mp3", cover: "covers/5.jpg" },
            { name: "Sky High", artist: "Electro-Light", file: "songs/6.mp3", cover: "covers/6.jpg" },
            { name: "Symbolism", artist: "Tobu", file: "songs/7.mp3", cover: "covers/7.jpg" },
            { name: "Heroes Tonight", artist: "Janji", file: "songs/8.mp3", cover: "covers/8.jpg" },
            { name: "Feel Good", artist: "Jingle Punks", file: "songs/9.mp3", cover: "covers/9.jpg" },
            { name: "My Heart", artist: "Different Heaven", file: "songs/10.mp3", cover: "covers/10.jpg" }
        ];
        
        this.init();
    }

    init() {
        this.removeBlueOutline();
        this.bindEvents();
        this.renderSongs();
        this.loadSong(0);
    }

    // ✅ FIX BUG 7: Clean CSS-only blue outline removal
    removeBlueOutline() {
        const style = document.createElement('style');
        style.textContent = `
            button:focus, input:focus, .song-card:focus, .play-btn:focus {
                outline: none !important;
                box-shadow: none !important;
            }
            * {
                -webkit-tap-highlight-color: transparent;
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        // 🎮 Play/Pause - FIX BUG 1 (autoplay)
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.togglePlay();
        });
        
        // ⏭️ Next/Prev - FIX BUG 5 (no delay)
        document.getElementById('nextBtn').onclick = () => this.nextSong();
        document.getElementById('prevBtn').onclick = () => this.prevSong();
        
        // 🎚️ Progress - FIX BUG 4 (smooth drag)
        const progressBar = document.getElementById('progressBar');
        progressBar.oninput = (e) => {
            if (this.audio.duration) {
                this.audio.currentTime = (e.target.value / 100) * this.audio.duration;
            }
        };
        
        // 🔊 Volume
        document.getElementById('volumeSlider').oninput = (e) => {
            this.audio.volume = e.target.value / 100;
        };
        
        // 🎵 Audio Events
        this.audio.ontimeupdate = () => this.updateProgress();
        this.audio.onended = () => this.nextSong(); // ✅ FIX BUG 2 (instant next)
        this.audio.onloadedmetadata = () => this.updateDuration();
        this.audio.onplay = () => {
            this.isPlaying = true;
            this.updatePlayButton();
        };
        this.audio.onpause = () => {
            this.isPlaying = false;
            this.updatePlayButton();
        };
        
        // ⌨️ Keyboard
        document.onkeydown = (e) => {
            if (e.target.tagName === 'INPUT') return;
            switch(e.code) {
                case 'Space': e.preventDefault(); this.togglePlay(); break;
                case 'ArrowRight': e.preventDefault(); this.nextSong(); break;
                case 'ArrowLeft': e.preventDefault(); this.prevSong(); break;
            }
        };

        // 🎯 SONG CLICK - FIX BUG 3 (CRITICAL - BENAR INDEX!)
        document.getElementById('songList').onclick = (e) => {
            const songCard = e.target.closest('.song-card');
            if (songCard) {
                const index = parseInt(songCard.dataset.index); // ✅ DIRECT dari song-card
                this.playSong(index);
            }
        };
    }

    renderSongs() {
        document.getElementById('songList').innerHTML = 
            this.songs.map((song, index) => `
                <div class="song-card" data-index="${index}">
                    <img src="${song.cover}" alt="${song.name}" class="song-cover">
                    <div class="song-info">
                        <h3>${song.name}</h3>
                        <p>${song.artist}</p>
                    </div>
                    <button class="play-btn" title="Play ${song.name}">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            `).join('');
    }

    // 🔄 Load Song - FIX BUG 5 (instant)
    loadSong(index) {
        this.currentSongIndex = index;
        const song = this.songs[index];
        
        // Update UI instant
        document.getElementById('currentSongName').textContent = song.name;
        document.getElementById('currentArtist').textContent = song.artist;
        document.getElementById('nowPlayingCover').src = song.cover;
        document.getElementById('navSongName').textContent = `${song.name} - ${song.artist}`;
        
        // Highlight active song
        document.querySelectorAll('.song-card').forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });
        
        // Load audio
        this.audio.src = song.file;
        this.audio.load();
        
        // Reset progress
        document.getElementById('progressBar').value = 0;
        document.getElementById('currentTime').textContent = '0:00';
        document.getElementById('duration').textContent = '0:00';
    }

    // ▶️ Play/Pause - FIX BUG 1 (mobile autoplay)
    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            // User gesture detected - browser allow play
            this.audio.play().catch(() => {
                // Fallback: show message
                console.log('Tap play button to start music');
            });
        }
    }

    updatePlayButton() {
        const icon = document.querySelector('#playPauseBtn i');
        icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    // ⏭️ Next Song - FIX BUG 2 & 5 (INSTANT)
    nextSong() {
        const nextIndex = (this.currentSongIndex + 1) % this.songs.length;
        this.loadSong(nextIndex);
        if (this.isPlaying) {
            this.audio.play();
        }
    }

    // ⏮️ Prev Song
    prevSong() {
        const prevIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        this.loadSong(prevIndex);
        if (this.isPlaying) {
            this.audio.play();
        }
    }

    // 🎵 Play Specific Song - FIX BUG 3
    playSong(index) {
        this.loadSong(index);
        this.audio.play();
    }

    updateProgress() {
        if (this.audio.duration && !isNaN(this.audio.duration)) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            document.getElementById('progressBar').value = progress;
            document.getElementById('currentTime').textContent = 
                this.formatTime(this.audio.currentTime);
        }
    }

    updateDuration() {
        if (this.audio.duration && !isNaN(this.audio.duration)) {
            document.getElementById('duration').textContent = 
                this.formatTime(this.audio.duration);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// 🚀 START APP
document.addEventListener('DOMContentLoaded', () => {
    window.player = new SpotSongPlayer();
});
