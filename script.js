class SpotSongPlayer {
    constructor() {
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.audio = new Audio();
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
        this.bindEvents();
        this.renderSongs();
        this.loadSong(0);
        this.initVisualizer();
    }

    bindEvents() {
        // Play/Pause
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlay());
        
        // Next/Prev
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSong());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevSong());
        
        // Progress
        document.getElementById('progressBar').addEventListener('input', (e) => {
            this.audio.currentTime = (e.target.value / 100) * this.audio.duration;
        });
        
        // Volume
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            this.audio.volume = e.target.value / 100;
        });
        
        // Audio events
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
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
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

        // Song cards click events (delegated)
        document.getElementById('songList').addEventListener('click', (e) => {
            const playBtn = e.target.closest('.play-btn');
            if (playBtn) {
                const index = parseInt(playBtn.parentElement.dataset.index);
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
        
        this.audio.src = song.file;
        document.getElementById('currentSongName').textContent = song.name;
        document.getElementById('currentArtist').textContent = song.artist;
        document.getElementById('nowPlayingCover').src = song.cover;
        document.getElementById('nowPlayingCover').alt = song.name;
        document.getElementById('navSongName').textContent = `${song.name} - ${song.artist}`;
        
        // Update active song highlight
        document.querySelectorAll('.song-card').forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });
        
        // Reset progress
        document.getElementById('progressBar').value = 0;
        document.getElementById('currentTime').textContent = '0:00';
        document.getElementById('duration').textContent = '0:00';
        
        this.audio.load();
        this.isPlaying = false;
        this.updatePlayButton();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play().catch(e => {
                console.error('Playback failed:', e);
            });
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
            this.audio.play().catch(e => console.error('Next song play failed:', e));
        }
    }

    prevSong() {
        const prevIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        this.loadSong(prevIndex);
        if (this.isPlaying) {
            this.audio.play().catch(e => console.error('Previous song play failed:', e));
        }
    }

    playSong(index) {
        this.loadSong(index);
        this.audio.play().catch(e => {
            console.error('Song play failed:', e);
        });
    }

    updateProgress() {
        if (this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            document.getElementById('progressBar').value = progress;
            this.updateCurrentTime();
        }
    }

    updateDuration() {
        this.updateCurrentTime();
    }

    updateCurrentTime() {
        const current = document.getElementById('currentTime');
        const duration = document.getElementById('duration');
        
        if (this.audio.duration) {
            current.textContent = this.formatTime(this.audio.currentTime);
            duration.textContent = this.formatTime(this.audio.duration);
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
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        visualizer.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
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
        const radius = Math.min(width, height) / 4;
        
        ctx.clearRect(0, 0, width, height);
        
        const time = Date.now() * 0.001;
        const bars = 64;
        
        for (let i = 0; i < bars; i++) {
            const angle = (i / bars) * Math.PI * 2;
            const barHeight = (Math.sin(time + angle) * 0.5 + 0.5) * radius * 0.8;
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);
            
            const gradient = ctx.createLinearGradient(0, -radius, 0, 0);
            gradient.addColorStop(0, `hsl(${angle * 180 / Math.PI}, 70%, 60%)`);
            gradient.addColorStop(1, `hsl(${angle * 180 / Math.PI}, 70%, 30%)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, -barHeight / 2, 4, barHeight);
            
            ctx.restore();
        }
        
        requestAnimationFrame(() => this.animateVisualizer());
    }
}

// Initialize player globally and resize listener
const player = new SpotSongPlayer();

window.addEventListener('resize', () => {
    if (player.canvas) {
        player.resizeVisualizer();
    }
});

// Preload audio files for better performance
window.addEventListener('load', () => {
    player.songs.forEach((song, index) => {
        const audio = new Audio(song.file);
        audio.preload = 'metadata';
    });
});
