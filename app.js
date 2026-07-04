/*
 * app.js - Main Application Logic for StreamVibe
 * Handles: video grid rendering, category filtering, sidebar toggle,
 * infinite scroll, theme toggle, and homepage interactions
 */

// ============ GLOBAL STATE ============
let currentCategory = 'All';       // Current active category filter
let displayedCount = 12;           // Number of videos currently shown
const LOAD_MORE_COUNT = 8;         // How many to load on scroll
let isLoading = false;             // Prevent multiple loads at once
let filteredVideos = [...VIDEOS];  // Current filtered video list

// ============ INITIALIZATION ============
$(document).ready(function () {
    // Render category chips
    renderCategories();

    // Render initial video grid
    renderVideoGrid(filteredVideos);

    // Initialize search
    initSearch();

    // Setup sidebar toggle
    setupSidebar();

    // Setup infinite scroll
    setupInfiniteScroll();

    // Setup theme toggle
    setupThemeToggle();

    // Setup event delegation for video cards
    setupVideoCardClicks();

    // Setup context menu (Watch Later / Save)
    setupContextMenu();

    // Mark active sidebar item
    markActiveSidebarItem();
});

// ============ CATEGORY CHIPS ============

/**
 * Render category filter chips in the category bar
 */
function renderCategories() {
    const bar = document.getElementById('categoryBar');
    if (!bar) return;

    let html = '';
    CATEGORIES.forEach(cat => {
        const activeClass = cat === currentCategory ? 'active' : '';
        html += `<button class="category-chip ripple ${activeClass}" data-category="${cat}">${cat}</button>`;
    });

    bar.innerHTML = html;

    // Category click handler
    $(bar).on('click', '.category-chip', function () {
        currentCategory = $(this).data('category');

        // Update active state
        $('.category-chip').removeClass('active');
        $(this).addClass('active');

        // Filter videos
        filterByCategory(currentCategory);
    });
}

/**
 * Filter videos by category and re-render grid
 */
function filterByCategory(category) {
    displayedCount = 12; // Reset count

    if (category === 'All') {
        filteredVideos = [...VIDEOS];
    } else {
        filteredVideos = VIDEOS.filter(v => v.category === category);
    }

    renderVideoGrid(filteredVideos);
}

// ============ VIDEO GRID RENDERING ============

/**
 * Render video cards into the grid
 * @param {Array} videos - Array of video objects to display
 * @param {string} searchQuery - Optional search query for highlighting
 */
function renderVideoGrid(videos, searchQuery = '') {
    const grid = document.getElementById('videoGrid');
    if (!grid) return;

    // Show skeleton loading first
    showSkeletonLoading(grid);

    // Simulate network delay for realistic feel
    setTimeout(() => {
        const videosToShow = videos.slice(0, displayedCount);

        if (videosToShow.length === 0) {
            grid.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1;">
                    <i class="bi bi-search"></i>
                    <h4>No videos found</h4>
                    <p>Try different keywords or browse categories</p>
                </div>
            `;
            return;
        }

        let html = '';
        videosToShow.forEach(video => {
            const title = searchQuery ? highlightMatch(video.title, searchQuery) : video.title;
            const isLive = video.duration === 'LIVE';

            html += `
                <div class="video-card" data-video-id="${video.id}">
                    <div class="thumbnail-wrapper">
                        <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                        <video class="video-preview" src="${video.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}" muted loop playsinline></video>
                        <span class="duration-badge ${isLive ? 'live' : ''}">${video.duration}</span>
                    </div>
                    <div class="video-info">
                        <a href="channel.html?channel=${encodeURIComponent(video.channel)}">
                            <img class="channel-avatar" src="${video.channelImg}" alt="${video.channel}">
                        </a>
                        <div class="video-details">
                            <div class="video-title">${title}</div>
                            <a href="channel.html?channel=${encodeURIComponent(video.channel)}" class="video-channel">${video.channel}</a>
                            <div class="video-meta">
                                <span>${formatViews(getViewCount(video.id))}</span>
                                <span>${video.uploadTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;

        // Animate cards in
        $(grid).find('.video-card').each(function (i) {
            $(this).css({ 'opacity': 0, 'transform': 'translateY(20px)' });
            $(this).delay(i * 50).animate(
                { opacity: 1 },
                300,
                function () {
                    $(this).css('transform', 'translateY(0)');
                }
            );
        });

    }, 400); // simulate loading time
}

/**
 * Show skeleton loading placeholders
 */
function showSkeletonLoading(container) {
    let html = '';
    for (let i = 0; i < 8; i++) {
        html += `
            <div class="skeleton">
                <div class="skeleton-thumbnail"></div>
                <div style="display:flex; gap:12px; padding:12px;">
                    <div class="skeleton-avatar"></div>
                    <div style="flex:1;">
                        <div class="skeleton-text"></div>
                        <div class="skeleton-text short"></div>
                    </div>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

// ============ INFINITE SCROLL ============

/**
 * Setup infinite scroll - loads more videos when user scrolls near bottom
 */
function setupInfiniteScroll() {
    $(window).on('scroll', function () {
        if (isLoading) return;

        const scrollTop = $(window).scrollTop();
        const windowHeight = $(window).height();
        const docHeight = $(document).height();

        // Load more when user is within 300px of bottom
        if (scrollTop + windowHeight >= docHeight - 300) {
            loadMoreVideos();
        }
    });
}

/**
 * Load more videos (infinite scroll simulation)
 */
function loadMoreVideos() {
    if (displayedCount >= filteredVideos.length) return; // No more to load
    if (isLoading) return;

    isLoading = true;

    // Show loading spinner
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'flex';

    // Simulate loading delay
    setTimeout(() => {
        displayedCount += LOAD_MORE_COUNT;

        const grid = document.getElementById('videoGrid');
        const newVideos = filteredVideos.slice(displayedCount - LOAD_MORE_COUNT, displayedCount);

        newVideos.forEach(video => {
            const isLive = video.duration === 'LIVE';
            const cardHtml = `
                <div class="video-card" data-video-id="${video.id}" style="opacity:0; transform:translateY(20px);">
                    <div class="thumbnail-wrapper">
                        <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                        <video class="video-preview" src="${video.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}" muted loop playsinline></video>
                        <span class="duration-badge ${isLive ? 'live' : ''}">${video.duration}</span>
                    </div>
                    <div class="video-info">
                        <a href="channel.html?channel=${encodeURIComponent(video.channel)}">
                            <img class="channel-avatar" src="${video.channelImg}" alt="${video.channel}">
                        </a>
                        <div class="video-details">
                            <div class="video-title">${video.title}</div>
                            <a href="channel.html?channel=${encodeURIComponent(video.channel)}" class="video-channel">${video.channel}</a>
                            <div class="video-meta">
                                <span>${formatViews(getViewCount(video.id))}</span>
                                <span>${video.uploadTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $(grid).append(cardHtml);
        });

        // Animate new cards
        $(grid).find('.video-card').filter(function () {
            return $(this).css('opacity') === '0';
        }).each(function (i) {
            $(this).delay(i * 80).animate({ opacity: 1 }, 300, function () {
                $(this).css('transform', 'translateY(0)');
            });
        });

        isLoading = false;
        if (spinner) spinner.style.display = 'none';

    }, 800);
}

// ============ SIDEBAR ============

/**
 * Setup sidebar toggle functionality
 */
function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const overlay = document.getElementById('sidebarOverlay');

    // Hamburger toggle button
    $('#sidebarToggle').on('click', function () {
        if (window.innerWidth <= 992) {
            // Mobile: slide in overlay sidebar
            $(sidebar).toggleClass('mobile-open');
            $(overlay).toggleClass('show');
        } else {
            // Desktop: collapse/expand sidebar
            $(sidebar).toggleClass('collapsed');
            $(mainContent).toggleClass('expanded');
        }
    });

    // Close sidebar on overlay click (mobile)
    $(overlay).on('click', function () {
        $(sidebar).removeClass('mobile-open');
        $(overlay).removeClass('show');
    });

    // Close sidebar on window resize to desktop
    $(window).on('resize', function () {
        if (window.innerWidth > 992) {
            $(sidebar).removeClass('mobile-open');
            $(overlay).removeClass('show');
        }
    });
}

/**
 * Mark the active sidebar item based on current page
 */
function markActiveSidebarItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    $('.sidebar-item').each(function () {
        const href = $(this).attr('href');
        if (href && href.includes(currentPage)) {
            $(this).addClass('active');
        }
    });
}

// ============ THEME TOGGLE ============

/**
 * Setup dark/light theme toggle
 */
function setupThemeToggle() {
    $('#themeToggle').on('click', function () {
        const newTheme = toggleTheme();
        showToast(newTheme === 'dark' ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
    });
}

// ============ VIDEO CARD CLICKS ============

/**
 * Setup click handlers for video cards (event delegation)
 */
function setupVideoCardClicks() {
    // Click on video card (but not on channel avatar/name links)
    $(document).on('click', '.video-card', function (e) {
        // Don't navigate if clicking on a link inside the card
        if ($(e.target).closest('a').length > 0) return;

        const videoId = $(this).data('video-id');
        if (videoId) {
            window.location.href = `watch.html?v=${videoId}`;
        }
    });
}

// ============ CONTEXT MENU / SAVE TO PLAYLIST ============

/**
 * Setup right-click context menu for saving videos
 */
function setupContextMenu() {
    // Watch Later button on video card (via 3-dot menu or right-click)
    // We'll add a simple approach: three-dot menu appears on hover
    // This is handled via the Save modal

    // Open save modal
    $(document).on('click', '.save-to-playlist-btn', function (e) {
        e.stopPropagation();
        const videoId = $(this).closest('[data-video-id]').data('video-id');
        openSaveModal(videoId);
    });
}

/**
 * Open the save-to-playlist modal
 */
function openSaveModal(videoId) {
    const playlists = getPlaylists();
    const watchLaterStatus = isInWatchLater(videoId);

    let listHtml = `
        <li data-action="watchlater" data-video-id="${videoId}">
            <input type="checkbox" ${watchLaterStatus ? 'checked' : ''}>
            <span><i class="bi bi-clock"></i> Watch Later</span>
        </li>
    `;

    playlists.forEach(pl => {
        const isInPl = pl.videos.includes(videoId);
        listHtml += `
            <li data-action="playlist" data-playlist-id="${pl.id}" data-video-id="${videoId}">
                <input type="checkbox" ${isInPl ? 'checked' : ''}>
                <span><i class="bi bi-music-note-list"></i> ${pl.name}</span>
            </li>
        `;
    });

    $('#saveModalList').html(listHtml);
    $('#saveModal').modal('show');

    // Handle checkbox clicks
    $('#saveModalList').off('click', 'li').on('click', 'li', function () {
        const checkbox = $(this).find('input[type="checkbox"]');
        const action = $(this).data('action');
        const vid = $(this).data('video-id');

        if (action === 'watchlater') {
            if (checkbox.prop('checked')) {
                removeFromWatchLater(vid);
                checkbox.prop('checked', false);
                showToast('Removed from Watch Later');
            } else {
                addToWatchLater(vid);
                checkbox.prop('checked', true);
                showToast('Added to Watch Later');
            }
        } else if (action === 'playlist') {
            const plId = $(this).data('playlist-id');
            if (checkbox.prop('checked')) {
                removeFromPlaylist(plId, vid);
                checkbox.prop('checked', false);
                showToast('Removed from playlist');
            } else {
                addToPlaylist(plId, vid);
                checkbox.prop('checked', true);
                showToast('Added to playlist');
            }
        }
    });
}

// ============ TOAST NOTIFICATIONS ============

/**
 * Show a toast notification at the bottom of the screen
 */
function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.innerHTML = `<i class="bi bi-check-circle-fill" style="color: var(--green-sub);"></i> ${message}`;
    container.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        $(toast).fadeOut(300, function () {
            $(this).remove();
        });
    }, 3000);
}

// ============ CREATE PLAYLIST (from modal) ============

/**
 * Handle creating a new playlist from the modal
 */
function handleCreatePlaylist() {
    const nameInput = document.getElementById('newPlaylistName');
    const name = nameInput ? nameInput.value.trim() : '';

    if (!name) {
        showToast('Please enter a playlist name');
        return;
    }

    createPlaylist(name);
    nameInput.value = '';
    showToast(`Playlist "${name}" created!`);

    // Close create modal, reopen save modal if there's a pending video
    $('#createPlaylistModal').modal('hide');
}

