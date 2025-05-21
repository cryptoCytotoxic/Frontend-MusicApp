document.addEventListener('DOMContentLoaded', () => {
    // Element references
    const audio = document.getElementById('audio-player');
    const songListContainer = document.getElementById('song-list');
    const favoritesListContainer = document.getElementById('favorites-list');
    const searchInput = document.getElementById('search-input');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.querySelector('.control-btn.prev');
    const nextBtn = document.querySelector('.control-btn.next');
    const shuffleBtn = document.querySelector('.control-btn.shuffle');
    const repeatBtn = document.querySelector('.control-btn.repeat');
    const progressBar = document.querySelector('.progress-bar');
    const progressCurrent = document.querySelector('.progress-current');
    const currentTimeEl = document.querySelector('.current-time');
    const totalTimeEl = document.querySelector('.total-time');
    const volumeBtn = document.querySelector('.volume-icon');
    const volumeCurrent = document.querySelector('.volume-current');
    const volumeSlider = document.querySelector('.volume-slider');
    const sortSelect = document.getElementById('sort-by');
    const upload = document.getElementById('music-upload');
    const uploadLibrary = document.getElementById('music-upload-library');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    // Modal elements
    const createPlaylistBtn = document.getElementById('create-playlist-btn');
    const createPlaylistModal = document.getElementById('create-playlist-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const savePlaylistBtn = document.getElementById('save-playlist-btn');
    const playlistNameInput = document.getElementById('playlist-name-input');
    const playlistDescInput = document.getElementById('playlist-description-input');

    // View toggle elements
    const viewButtons = document.querySelectorAll('.view-btn');

    // Load default songs from assets folder
    loadDefaultSongs();

    // State
    let songs = [];
    let favorites = [];
    let playlists = [
        { id: 'favorites', name: 'Liked Songs', icon: 'fa-heart', songs: [] },
        { id: 'workout', name: 'Workout Mix', icon: 'fa-music', songs: [] },
        { id: 'chill', name: 'Chill Vibes', icon: 'fa-music', songs: [] }
    ];
    let currentIndex = 0;
    let isShuffle = false;
    let isRepeat = false;

    // Helpers
    function formatTime(sec) {
        const m = Math.floor(sec / 60) || 0;
        const s = Math.floor(sec % 60) || 0;
        return `${m}:${s < 10 ? '0' + s : s}`;
    }

    function loadSong(index) {
        const song = songs[index];
        if (!song) return;
        audio.src = song.url;
        document.getElementById('current-title').textContent = song.name;
        document.getElementById('current-artist').textContent = song.artist || '';
        document.getElementById('current-thumbnail').src = song.cover || 'assets/images/song_small.jpg';
    }

    function playSong() {
        audio.play();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }

    function pauseSong() {
        audio.pause();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }

    function renderSongs(list, container) {
        container.innerHTML = '';

        // Show/hide no content message
        const noContentMessage = container.id === 'favorites-list'
            ? document.getElementById('no-favorites-message')
            : document.getElementById('no-songs-message');

        if (noContentMessage) {
            if (list.length === 0) {
                noContentMessage.style.display = 'flex';
            } else {
                noContentMessage.style.display = 'none';
            }
        }

        list.forEach((song) => {
            const item = document.createElement('div');
            item.className = 'song-item glass-card';
            item.innerHTML = `
        <div class="info">
          <p class="title" title="${song.name}">${song.name}</p>
          <p class="artist">${song.artist || 'Unknown'}</p>
          ${song.duration ? `<p class="duration">${formatTime(song.duration)}</p>` : ''}
        </div>
        <button class="play-btn"><i class="fa-solid fa-play"></i></button>
        <button class="favorite-btn">
          <i class="${song.favorited ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
        <div class="song-actions">
          <button class="action-btn add-to-playlist" title="Add to playlist">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      `;
            // Play
            item.querySelector('.play-btn').addEventListener('click', () => {
                currentIndex = songs.indexOf(song);
                loadSong(currentIndex);
                playSong();
            });
            // Favorite
            item.querySelector('.favorite-btn').addEventListener('click', () => {
                song.favorited = !song.favorited;
                favorites = songs.filter(s => s.favorited);
                renderSongs(songs, songListContainer);
                renderSongs(favorites, favoritesListContainer);

                // Update favorite button in now playing if this is the current song
                if (songs.indexOf(song) === currentIndex) {
                    const nowPlayingFavBtn = document.querySelector('.now-playing .favorite-btn i');
                    if (nowPlayingFavBtn) {
                        nowPlayingFavBtn.className = song.favorited ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
                    }
                }
            });

            // Add to playlist
            const addToPlaylistBtn = item.querySelector('.add-to-playlist');
            if (addToPlaylistBtn) {
                addToPlaylistBtn.addEventListener('click', () => {
                    // Create a dropdown menu for playlists
                    const dropdown = document.createElement('div');
                    dropdown.className = 'playlist-dropdown glass-card';

                    // Add playlists to dropdown
                    let dropdownContent = '<h4>Add to Playlist</h4>';

                    // Filter out the favorites playlist
                    const userPlaylists = playlists.filter(p => p.id !== 'favorites');

                    if (userPlaylists.length === 0) {
                        dropdownContent += '<p class="no-playlists">No playlists available. Create one first.</p>';
                    } else {
                        dropdownContent += '<ul>';
                        userPlaylists.forEach(playlist => {
                            dropdownContent += `<li data-id="${playlist.id}">${playlist.name}</li>`;
                        });
                        dropdownContent += '</ul>';
                    }

                    dropdown.innerHTML = dropdownContent;

                    // Position the dropdown
                    const rect = addToPlaylistBtn.getBoundingClientRect();
                    dropdown.style.position = 'absolute';
                    dropdown.style.top = `${rect.bottom + 5}px`;
                    dropdown.style.left = `${rect.left}px`;
                    dropdown.style.zIndex = '1000';

                    // Add click handlers to playlist items
                    document.body.appendChild(dropdown);

                    dropdown.querySelectorAll('li').forEach(li => {
                        li.addEventListener('click', () => {
                            const playlistId = li.dataset.id;
                            const playlist = playlists.find(p => p.id === playlistId);

                            if (playlist) {
                                // Check if song is already in playlist
                                if (!playlist.songs.some(s => s.id === song.id)) {
                                    playlist.songs.push(song);
                                    alert(`Added "${song.name}" to "${playlist.name}"`);
                                    renderPlaylists();
                                } else {
                                    alert(`"${song.name}" is already in "${playlist.name}"`);
                                }
                            }

                            document.body.removeChild(dropdown);
                        });
                    });

                    // Close dropdown when clicking outside
                    const closeDropdown = (e) => {
                        if (!dropdown.contains(e.target) && e.target !== addToPlaylistBtn) {
                            document.body.removeChild(dropdown);
                            document.removeEventListener('click', closeDropdown);
                        }
                    };

                    // Delay adding the event listener to prevent immediate closing
                    setTimeout(() => {
                        document.addEventListener('click', closeDropdown);
                    }, 0);
                });
            }
            container.appendChild(item);
        });
    }

    // Upload and metadata extraction
    function handleFiles(fileList) {
        const files = Array.from(fileList);
        const totalFiles = files.length;
        let processedFiles = 0;

        // Show loading indicator
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading-message glass-card';
        loadingMessage.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Processing music files...</p>
        `;
        document.body.appendChild(loadingMessage);

        files.forEach(file => {
            const url = URL.createObjectURL(file);

            // Extract file name and try to parse artist and title
            let name = file.name.replace(/\.[^/.]+$/, '');
            let artist = '';
            let album = 'Unknown Album';
            let genre = 'Unknown Genre';

            // Try to extract artist from filename (Artist - Title format)
            if (name.includes(' - ')) {
                const parts = name.split(' - ');
                artist = parts[0].trim();
                name = parts[1].trim();
            }

            // Create song object
            const song = {
                id: 'song-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                name,
                artist,
                album,
                genre,
                url,
                file,
                favorited: false,
                duration: 0,
                cover: getRandomCover()
            };

            // Try to get duration
            const audio = new Audio();
            audio.src = url;

            audio.addEventListener('loadedmetadata', () => {
                song.duration = audio.duration;
                processedFiles++;

                // Check if all files are processed
                if (processedFiles === totalFiles) {
                    // Remove loading message
                    document.body.removeChild(loadingMessage);

                    // Update UI
                    updateLibraryUI();
                }
            });

            audio.addEventListener('error', () => {
                processedFiles++;

                // Check if all files are processed
                if (processedFiles === totalFiles) {
                    // Remove loading message
                    document.body.removeChild(loadingMessage);

                    // Update UI
                    updateLibraryUI();
                }
            });

            songs.push(song);
        });

        // If no files to process, remove loading message
        if (totalFiles === 0) {
            document.body.removeChild(loadingMessage);
        }

        updateLibraryUI();
    }

    // Get a random cover image from the available ones
    function getRandomCover() {
        const covers = [
            'assets/images/album1.jpg',
            'assets/images/album2.jpg',
            'assets/images/album3.jpg',
            'assets/images/album4.jpg',
            'assets/images/song_small.jpg'
        ];
        return covers[Math.floor(Math.random() * covers.length)];
    }

    // Update all UI elements after adding songs
    function updateLibraryUI() {
        // Update song list
        renderSongs(songs, songListContainer);

        // Update artists
        renderArtists();

        // Update playlists
        renderPlaylists();

        // Hide no content messages if we have songs
        if (songs.length > 0) {
            document.getElementById('no-songs-message').style.display = 'none';
        }
    }

    // Render artists
    function renderArtists() {
        const artistsGrid = document.getElementById('artists-grid');
        const noArtistsMessage = document.getElementById('no-artists-message');

        // Get unique artists
        const artists = [...new Set(songs.map(song => song.artist))].filter(artist => artist);

        if (artists.length === 0) {
            if (noArtistsMessage) noArtistsMessage.style.display = 'flex';
            if (artistsGrid) artistsGrid.innerHTML = '';
            return;
        }

        if (noArtistsMessage) noArtistsMessage.style.display = 'none';
        if (!artistsGrid) return;

        artistsGrid.innerHTML = '';

        artists.forEach(artist => {
            const artistSongs = songs.filter(song => song.artist === artist);
            const artistCard = document.createElement('div');
            artistCard.className = 'artist-card glass-card';
            artistCard.innerHTML = `
                <div class="artist-img-container">
                    <div class="artist-img">
                        <i class="fa-solid fa-user"></i>
                    </div>
                </div>
                <p class="artist-name">${artist}</p>
                <p class="artist-count">${artistSongs.length} songs</p>
            `;

            // Add click event to show artist's songs
            artistCard.addEventListener('click', () => {
                // Filter songs by this artist and show them
                renderSongs(artistSongs, songListContainer);

                // Switch to library section
                const libraryNav = document.querySelector('.nav-item[data-section="library"]');
                if (libraryNav) libraryNav.click();
            });

            artistsGrid.appendChild(artistCard);
        });
    }



    upload.addEventListener('change', e => handleFiles(e.target.files));
    uploadLibrary.addEventListener('change', e => handleFiles(e.target.files));

    // Search
    searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        const filtered = songs.filter(s => s.name.toLowerCase().includes(term) || s.artist.toLowerCase().includes(term));
        renderSongs(filtered, songListContainer);
    });

    // Sort
    sortSelect.addEventListener('change', () => {
        const key = sortSelect.value;
        songs.sort((a, b) => a[key]?.localeCompare(b[key]) || 0);
        renderSongs(songs, songListContainer);
    });

    // Controls
    playPauseBtn.addEventListener('click', () => audio.paused ? playSong() : pauseSong());
    prevBtn.addEventListener('click', () => {
        if (songs.length === 0) return;
        if (isShuffle) {
            // Make sure we don't get the same song again
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * songs.length);
            } while (newIndex === currentIndex && songs.length > 1);
            currentIndex = newIndex;
        } else {
            currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        }
        loadSong(currentIndex);
        playSong();
    });
    nextBtn.addEventListener('click', () => {
        if (songs.length === 0) return;
        if (isShuffle) {
            // Make sure we don't get the same song again
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * songs.length);
            } while (newIndex === currentIndex && songs.length > 1);
            currentIndex = newIndex;
        } else {
            currentIndex = (currentIndex + 1) % songs.length;
        }
        loadSong(currentIndex);
        playSong();
    });
    shuffleBtn.addEventListener('click', () => {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle('active', isShuffle);
        // Visual feedback
        if (isShuffle) {
            shuffleBtn.style.color = 'var(--accent)';
        } else {
            shuffleBtn.style.color = '';
        }
    });
    repeatBtn.addEventListener('click', () => {
        isRepeat = !isRepeat;
        repeatBtn.classList.toggle('active', isRepeat);
        // Visual feedback
        if (isRepeat) {
            repeatBtn.style.color = 'var(--accent)';
            audio.loop = true;
        } else {
            repeatBtn.style.color = '';
            audio.loop = false;
        }
    });

    // Progress
    audio.addEventListener('timeupdate', () => {
        const { currentTime, duration } = audio;
        if (duration) {
            const percent = (currentTime / duration) * 100;
            progressCurrent.style.width = percent + '%';
            currentTimeEl.textContent = formatTime(currentTime);
            totalTimeEl.textContent = formatTime(duration);
        }
    });

    // Progress bar interaction (click and drag)
    let isProgressDragging = false;

    progressBar.addEventListener('mousedown', (e) => {
        isProgressDragging = true;
        updateProgress(e);
    });

    document.addEventListener('mousemove', (e) => {
        if (isProgressDragging) {
            updateProgress(e);
        }
    });

    document.addEventListener('mouseup', () => {
        isProgressDragging = false;
    });

    function updateProgress(e) {
        const rect = progressBar.getBoundingClientRect();
        let pct = (e.clientX - rect.left) / rect.width;
        // Clamp value between 0 and 1
        pct = Math.max(0, Math.min(1, pct));
        audio.currentTime = pct * audio.duration;
    }

    progressBar.addEventListener('click', updateProgress);

    audio.addEventListener('ended', () => {
        // If repeat is enabled, the audio.loop property will handle it
        // Otherwise, go to the next song
        if (!isRepeat) {
            nextBtn.click();
        }
    });

    // Volume
    let isVolumeDragging = false;

    // Initialize volume
    audio.volume = 0.7;
    const volumeProgress = document.querySelector('.volume-progress');
    volumeProgress.style.width = '70%';

    // Position the handle at the end of the progress bar
    // We need to wait for the DOM to update with the new width
    setTimeout(() => {
        const progressWidth = volumeProgress.offsetWidth;
        volumeCurrent.style.left = progressWidth + 'px';
    }, 100);

    volumeSlider.addEventListener('mousedown', (e) => {
        isVolumeDragging = true;
        updateVolume(e);
    });

    document.addEventListener('mousemove', (e) => {
        if (isVolumeDragging) {
            updateVolume(e);
        }
    });

    document.addEventListener('mouseup', () => {
        isVolumeDragging = false;
    });

    function updateVolume(e) {
        const rect = volumeSlider.getBoundingClientRect();
        let pct = (e.clientX - rect.left) / rect.width;
        // Clamp value between 0 and 1
        pct = Math.max(0, Math.min(1, pct));
        audio.volume = pct;

        // Update the progress bar width
        const volumeProgress = document.querySelector('.volume-progress');
        volumeProgress.style.width = (pct * 100) + '%';

        // Position the handle at the end of the progress bar
        // Calculate the exact pixel position based on the progress width
        const progressWidth = volumeProgress.offsetWidth;
        volumeCurrent.style.left = progressWidth + 'px';

        // Update volume icon based on level
        const volumeIcon = volumeBtn.querySelector('i');
        if (pct === 0) {
            volumeIcon.className = 'fa-solid fa-volume-xmark';
        } else if (pct < 0.5) {
            volumeIcon.className = 'fa-solid fa-volume-low';
        } else {
            volumeIcon.className = 'fa-solid fa-volume-high';
        }
    }

    volumeSlider.addEventListener('click', updateVolume);

    // Mute/unmute when clicking the volume icon
    volumeBtn.addEventListener('click', () => {
        const wasMuted = audio.volume === 0;
        if (wasMuted) {
            // Unmute - restore to previous volume or default to 70%
            audio.volume = audio.dataset.previousVolume || 0.7;

            // Update the progress bar width
            const volumeProgress = document.querySelector('.volume-progress');
            volumeProgress.style.width = (audio.volume * 100) + '%';

            // Position the handle at the end of the progress bar
            setTimeout(() => {
                // Use setTimeout to ensure the width has been updated in the DOM
                const progressWidth = volumeProgress.offsetWidth;
                volumeCurrent.style.left = progressWidth + 'px';
            }, 10);

            volumeBtn.querySelector('i').className = audio.volume < 0.5 ?
                'fa-solid fa-volume-low' : 'fa-solid fa-volume-high';
        } else {
            // Mute - save current volume first
            audio.dataset.previousVolume = audio.volume;
            audio.volume = 0;

            // Update the progress bar width
            const volumeProgress = document.querySelector('.volume-progress');
            volumeProgress.style.width = '0%';

            // Position the handle at the beginning
            volumeCurrent.style.left = '0px';

            volumeBtn.querySelector('i').className = 'fa-solid fa-volume-xmark';
        }
    });

    // Section navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const sec = item.dataset.section + '-section';
            sections.forEach(s => s.id === sec ? s.classList.add('active') : s.classList.remove('active'));
        });
    });

    // Playlist functionality
    function renderPlaylists() {
        // Update both playlist grids - the one in the home section and the one in the playlists section
        const playlistGrids = document.querySelectorAll('.playlist-grid');

        playlistGrids.forEach(playlistGrid => {
            if (!playlistGrid) return;

            // Clear all except the "Create New" button
            const createNewBtn = playlistGrid.querySelector('.create-new');
            playlistGrid.innerHTML = '';

            // Add all playlists
            playlists.forEach(playlist => {
                const playlistCard = document.createElement('div');
                playlistCard.className = 'playlist-card glass-card';
                playlistCard.dataset.id = playlist.id;

                const songCount = playlist.id === 'favorites' ? favorites.length : playlist.songs.length;

                playlistCard.innerHTML = `
                    <div class="playlist-icon">
                        <i class="fa-solid ${playlist.icon}"></i>
                    </div>
                    <p class="playlist-name">${playlist.name}</p>
                    <p class="playlist-count">${songCount} songs</p>
                `;

                // Add click event to open playlist
                playlistCard.addEventListener('click', () => {
                    // Show playlist contents
                    if (playlist.id === 'favorites') {
                        renderSongs(favorites, songListContainer);

                        // Update the current playlist name in the library section
                        const libraryHeader = document.querySelector('#library-section .section-header h2');
                        if (libraryHeader) {
                            libraryHeader.textContent = 'Favorites';
                        }
                    } else {
                        renderSongs(playlist.songs, songListContainer);

                        // Update the current playlist name in the library section
                        const libraryHeader = document.querySelector('#library-section .section-header h2');
                        if (libraryHeader) {
                            libraryHeader.textContent = playlist.name;
                        }
                    }

                    // Switch to library section
                    const libraryNav = document.querySelector('.nav-item[data-section="library"]');
                    if (libraryNav) libraryNav.click();
                });

                playlistGrid.appendChild(playlistCard);
            });

            // Add the create new button back
            if (createNewBtn) {
                playlistGrid.appendChild(createNewBtn);
            } else {
                const newBtn = document.createElement('div');
                newBtn.className = 'playlist-card glass-card create-new';
                newBtn.innerHTML = `
                    <div class="playlist-icon">
                        <i class="fa-solid fa-plus"></i>
                    </div>
                    <p class="playlist-name">Create New</p>
                `;
                newBtn.addEventListener('click', () => {
                    openCreatePlaylistModal();
                });
                playlistGrid.appendChild(newBtn);
            }
        });

        // Update the "no playlists" message if needed
        const noPlaylistsMessage = document.getElementById('no-playlists-message');
        if (noPlaylistsMessage) {
            noPlaylistsMessage.style.display = playlists.length > 0 ? 'none' : 'flex';
        }
    }

    // Modal functionality
    function openCreatePlaylistModal() {
        createPlaylistModal.style.display = 'block';
        playlistNameInput.value = '';
        playlistDescInput.value = '';
        playlistNameInput.focus();
    }

    function closeCreatePlaylistModal() {
        createPlaylistModal.style.display = 'none';
    }

    // Create playlist button
    createPlaylistBtn.addEventListener('click', openCreatePlaylistModal);

    // Close modal when clicking X
    closeModalBtn.addEventListener('click', closeCreatePlaylistModal);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === createPlaylistModal) {
            closeCreatePlaylistModal();
        }
    });

    // Save playlist button
    savePlaylistBtn.addEventListener('click', () => {
        const name = playlistNameInput.value.trim();
        if (!name) {
            alert('Please enter a playlist name');
            return;
        }

        const id = 'playlist-' + Date.now();
        playlists.push({
            id,
            name,
            description: playlistDescInput.value.trim(),
            icon: 'fa-music',
            songs: []
        });

        renderPlaylists();
        closeCreatePlaylistModal();
    });

    // View toggle functionality
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;

            // Update active button
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update view classes
            const mainContent = document.querySelector('.main');
            if (mainContent) {
                mainContent.classList.remove('grid-view', 'list-view');
                mainContent.classList.add(view + '-view');
            }

            // Apply specific styles based on view
            if (view === 'list') {
                // List view styles
                document.querySelectorAll('.song-item').forEach(item => {
                    item.classList.add('list-item');
                });
                document.querySelectorAll('.card').forEach(card => {
                    card.classList.add('list-item');
                });
            } else {
                // Grid view styles
                document.querySelectorAll('.song-item').forEach(item => {
                    item.classList.remove('list-item');
                });
                document.querySelectorAll('.card').forEach(card => {
                    card.classList.remove('list-item');
                });
            }
        });
    });

    // Update favorite button in now playing
    document.querySelector('.now-playing .favorite-btn').addEventListener('click', () => {
        if (songs.length === 0 || currentIndex >= songs.length) return;

        const currentSong = songs[currentIndex];
        currentSong.favorited = !currentSong.favorited;

        // Update icon
        const heartIcon = document.querySelector('.now-playing .favorite-btn i');
        heartIcon.className = currentSong.favorited ? 'fa-solid fa-heart' : 'fa-regular fa-heart';

        // Update favorites list
        favorites = songs.filter(s => s.favorited);
        renderSongs(favorites, favoritesListContainer);
    });

    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        if (sidebar.classList.contains('active')) {
            overlay.style.display = 'block';
            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 10);
        } else {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
    }

    sidebarToggle.addEventListener('click', toggleSidebar);

    // Close sidebar when clicking outside
    overlay.addEventListener('click', toggleSidebar);

    // Close sidebar when clicking a nav item on mobile
    if (window.innerWidth <= 768) {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (sidebar.classList.contains('active')) {
                    toggleSidebar();
                }
            });
        });
    }

    // Initial renders
    renderSongs(songs, songListContainer);
    renderPlaylists();

    // Function to load default songs from assets folder
    function loadDefaultSongs() {
        // Add the default song from assets/music
        const defaultSong = {
            id: 'song-default-1',
            name: 'FAVOUR',
            artist: 'Lawrence Oyor',
            album: 'Praise & Worship',
            genre: 'Gospel',
            url: 'assets/music/FAVOUR-Lawrence-Oyor-praise-love-prayer-gospelmusic-itsurroundsmelikeashield-affirmations-(CeeNaija.com).mp3',
            favorited: false,
            duration: 0, // Will be set when audio loads
            cover: getRandomCover()
        };

        // Create audio element to get duration
        const tempAudio = new Audio();
        tempAudio.src = defaultSong.url;

        tempAudio.addEventListener('loadedmetadata', () => {
            defaultSong.duration = tempAudio.duration;
            songs.push(defaultSong);
            updateLibraryUI();
        });

        tempAudio.addEventListener('error', (e) => {
            console.error('Error loading default song:', e);
            // Still add the song even if we can't get duration
            songs.push(defaultSong);
            updateLibraryUI();
        });
    }
});