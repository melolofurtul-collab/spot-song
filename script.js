class SpotSongPlayer {
    constructor() {
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.audio = new Audio();
        this.audio.crossOrigin = "anonymous"; // For visualizer
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
        this.removeBlueTap(); // Hilangkan blue tap
        this.bindEvents();
        this.renderSongs();
        this.loadSong(0);
        this.initVisualizer();
    }

    // ❌ HAPUS BLUE TAP SEMUA BUTTON & ELEMENTS
    removeBlueTap() {
        // Hilangkan blue outline semua interactive elements
        document.querySelectorAll('button, input[type="range"], .song-card, .play-btn').forEach(el => {
            el.style.outline = 'none';
            el.style.webkitAppearance = 'none';
            el.style.appearance = 'none';
            el.addEventListener('focus', () => el.blur());
        });

        // Global CSS override untuk blue tap
        const style = document.createElement('style');
        style.textContent = `
            * {
                outline: none !important;
                -webkit-tap-highlight-color: transparent !important;
                tap-highlight-color: transparent !important;
            }
            button:focus, input:focus {
                outline: none !important;
                box-shadow: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        // Play/Pause - NO BLUE TAP
        document.getElementById('playPauseBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.togglePlay();
        });
        
        // Next/Prev - NO BLUE TAP
        document.getElementById('nextBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.nextSong();
        });
        document.getElementById('prevBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.prevSong();
        });
        
        // Progress Bar - SMOOTH & NO BLUE TAP
        document.getElementById('progressBar').addEventListener('input', (e) => {
            e.preventDefault();
            if (this.audio.duration) {
                this.audio.currentTime = (e.target.value / 100) * this.audio.duration;
            }
        });
        document.getElementById('progressBar').addEventListener('mousedown', () => {
            this.audio.pause(); // Pause saat drag
        });
        document.getElementById('progressBar').addEventListener('mouseup', () => {
            if (this.isPlaying) this.audio.play(); // Resume jika playing
        });
        
        // Volume - SMOOTH & NO BLUE TAP
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            e.preventDefault();
            this.audio.volume = e.target.value / 100;
        });
        
        // Audio events - FULL FUNCTIONALITY
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.nextSong());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayButton();
            this.animateVisualizer();
        });
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayButton();
        });
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.nextSong(); // Skip error song
        });
        
        // Keyboard shortcuts - PERFECT
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return; // Jangan interfere input
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            }
            if (e.code === 'ArrowRight') {
                e.preventDefault();
                this.nextSong();
            }
            if (e.code === 'ArrowLeft') {
                e.preventDefault();
                this.prevSong();
            }
        });

        // Song cards - DELEGATED EVENT, NO BLUE TAP
        document.getElementById('songList').addEventListener('click', (e) => {
            e.preventDefault();
            const playBtn = e.target.closest('.play-btn');
            const songCard = e.target.closest('.song-card');
            if (playBtn || songCard) {
                const index = parseInt((playBtn || songCard).parentElement.dataset.index);
                this.playSong(index);
            }
        });
    }

    renderSongs() {
        const songList = document.getElementById('songList');
        songList.innerHTML = this.songs.map((song, index) => `
            <div class="song-card" data-index="${index}">
                <img src="${song.cover}" alt="${song.name}" class="song-cover" loading="lazy">
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

    loadSong(index) {
        this.currentSongIndex = index;
        const song = this.songs[index];
        
        // Update UI
        document.getElementById('currentSongName').textContent = song.name;
        document.getElementById('currentArtist').textContent = song.artist;
        document.getElementById('nowPlayingCover').src = song.cover;
        document.getElementById('nowPlayingCover').alt = song.name;
        document.getElementById('navSongName').textContent = `${song.name} - ${song.artist}`;
        
        // Active highlight
        document.querySelectorAll('.song-card').forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });
        
        // Load audio
        this.audio.src = song.file;
        this.audio.load();
        
        // Reset UI
        document.getElementById('progressBar').value = 0;
        document.getElementById('currentTime').textContent = '0:00';
        document.getElementById('duration').textContent = '0:00';
        
        this.isPlaying = false;
        this.updatePlayButton();
    }

    togglePlay() {
        if (this.audio.src && this.audio.readyState >= 2) {
            if (this.isPlaying) {
                this.audio.pause();
            } else {
                this.audio.play().catch(e => {
                    console.error('Play failed:', e);
                });
            }
        }
    }

    updatePlayButton() {
        const playBtn = document.getElementById('playPauseBtn');
        const icon = playBtn.querySelector('i');
        icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    nextSong() {
        const nextIndex = (this.currentSongIndex + 1) % this.songs.length;
        this.loadSong(nextIndex);
        if (this.isPlaying) {
            setTimeout(() => this.audio.play().catch(e => console.error('Next failed:', e)), 100);
        }
    }

    prevSong() {
        const prevIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        this.loadSong(prevIndex);
        if (this.isPlaying) {
            setTimeout(() => this.audio.play().catch(e => console.error('Prev failed:', e)), 100);
        }
    }

    playSong(index) {
        this.loadSong(index);
        setTimeout(() => {
            this.audio.play().catch(e => console.error('Song play failed:', e));
        }, 200);
    }

    updateProgress() {
        if (this.audio.duration && !isNaN(this.audio.duration)) {
            const progress = Math.min((this.audio.currentTime / this.audio.duration) * 100, 100);
            document.getElementById('progressBar').value = progress;
            this.updateCurrentTime();
        }
    }

    updateCurrentTime() {
        const currentTimeEl = document.getElementById('currentTime');
        const durationEl = document.getElementById('duration');
        
        if (this.audio.duration && !isNaN(this.audio.duration)) {
            currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
            durationEl.textContent = this.formatTime(this.audio.duration);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    initVisualizer() {
        const visualizer = document.getElementById('visualizer');
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        visualizer.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        window.addEventListener('resize', () => this.resizeVisualizer());
        this.resizeVisualizer();
    }

    resizeVisualizer() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    animateVisualizer() {
        if (!this.isPlaying) return;
        
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        ctx.clearRect(0, 0, width, height);
        
        const time = Date.now() * 0.001 + this.audio.currentTime;
        const bars = 64;
        const radius = Math.min(width, height) / 4;
        
        for (let i = 0; i < bars; i++) {
            const angle = (i / bars) * Math.PI * 2;
            const barHeight = (Math.sin(time * 2 + angle) * 0.5 + 0.5) * radius * 0.7;
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);
            
            const gradient = ctx.createLinearGradient(0, -radius, 0, 0);
            gradient.addColorStop(0, `hsl(${(i/bars)*360}, 70%, 60%)`);
            gradient.addColorStop(1, `hsl(${(i/bars)*360}, 70%, 30%)`);
            
            ctx.shadowColor = gradient;
            ctx.shadowBlur = 20;
            ctx.fillStyle = gradient;
            ctx.fillRect(-2, -barHeight / 2, 4, barHeight);
            
            ctx.restore();
        }
        
        requestAnimationFrame(() => this.animateVisualizer());
    }
}

// 🚀 INIT PLAYER - PERFECT WORKING
document.addEventListener('DOMContentLoaded', () => {
    window.player = new SpotSongPlayer();
    
    // Preload semua lagu untuk smooth playback
    player.songs.forEach(song => {
        const preloadAudio = new Audio(song.file);
        preloadAudio.preload = 'auto';
        preloadAudio.load();
    });
});
