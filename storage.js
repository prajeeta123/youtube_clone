/*
 * storage.js - LocalStorage Management Module
 * Handles all persistent data: history, watch later, liked videos, playlists, theme
 * Uses localStorage to keep data between page reloads
 */

// ============ STORAGE KEYS ============
const STORAGE_KEYS = {
    HISTORY: 'streamvibe_history',
    WATCH_LATER: 'streamvibe_watchlater',
    LIKED_VIDEOS: 'streamvibe_liked',
    PLAYLISTS: 'streamvibe_playlists',
    THEME: 'streamvibe_theme',
    COMMENTS: 'streamvibe_comments',
    VIEW_COUNTS: 'streamvibe_view_counts'
};

// ============ HELPER FUNCTIONS ============

/**
 * Get data from localStorage by key
 * Returns parsed JSON or default value if key doesn't exist
 */
function getFromStorage(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return defaultValue;
    }
}

/**
 * Save data to localStorage
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        return false;
    }
}

// ============ HISTORY MANAGEMENT ============

/**
 * Add a video to watch history
 * Adds timestamp and prevents duplicates (moves to top if already exists)
 */
function addToHistory(videoId) {
    let history = getFromStorage(STORAGE_KEYS.HISTORY);
    
    // Remove if already exists (we'll add it to the top)
    history = history.filter(item => item.videoId !== videoId);
    
    // Add to beginning with timestamp
    history.unshift({
        videoId: videoId,
        watchedAt: new Date().toISOString()
    });
    
    // Keep only last 100 items
    if (history.length > 100) {
        history = history.slice(0, 100);
    }
    
    saveToStorage(STORAGE_KEYS.HISTORY, history);
}

/**
 * Get all history items
 */
function getHistory() {
    return getFromStorage(STORAGE_KEYS.HISTORY);
}

/**
 * Remove a single video from history
 */
function removeFromHistory(videoId) {
    let history = getFromStorage(STORAGE_KEYS.HISTORY);
    history = history.filter(item => item.videoId !== videoId);
    saveToStorage(STORAGE_KEYS.HISTORY, history);
}

/**
 * Clear entire watch history
 */
function clearHistory() {
    saveToStorage(STORAGE_KEYS.HISTORY, []);
}

// ============ WATCH LATER MANAGEMENT ============

/**
 * Add video to Watch Later list
 */
function addToWatchLater(videoId) {
    let watchLater = getFromStorage(STORAGE_KEYS.WATCH_LATER);
    
    // Don't add duplicates
    if (!watchLater.includes(videoId)) {
        watchLater.unshift(videoId);
        saveToStorage(STORAGE_KEYS.WATCH_LATER, watchLater);
        return true; // added
    }
    return false; // already exists
}

/**
 * Remove video from Watch Later
 */
function removeFromWatchLater(videoId) {
    let watchLater = getFromStorage(STORAGE_KEYS.WATCH_LATER);
    watchLater = watchLater.filter(id => id !== videoId);
    saveToStorage(STORAGE_KEYS.WATCH_LATER, watchLater);
}

/**
 * Check if video is in Watch Later
 */
function isInWatchLater(videoId) {
    const watchLater = getFromStorage(STORAGE_KEYS.WATCH_LATER);
    return watchLater.includes(videoId);
}

/**
 * Get all Watch Later video IDs
 */
function getWatchLater() {
    return getFromStorage(STORAGE_KEYS.WATCH_LATER);
}

// ============ LIKED VIDEOS MANAGEMENT ============

/**
 * Toggle like on a video
 * Returns true if liked, false if unliked
 */
function toggleLikeVideo(videoId) {
    let liked = getFromStorage(STORAGE_KEYS.LIKED_VIDEOS);
    
    if (liked.includes(videoId)) {
        // Unlike
        liked = liked.filter(id => id !== videoId);
        saveToStorage(STORAGE_KEYS.LIKED_VIDEOS, liked);
        return false;
    } else {
        // Like
        liked.unshift(videoId);
        saveToStorage(STORAGE_KEYS.LIKED_VIDEOS, liked);
        return true;
    }
}

/**
 * Check if video is liked
 */
function isVideoLiked(videoId) {
    const liked = getFromStorage(STORAGE_KEYS.LIKED_VIDEOS);
    return liked.includes(videoId);
}

/**
 * Get all liked video IDs
 */
function getLikedVideos() {
    return getFromStorage(STORAGE_KEYS.LIKED_VIDEOS);
}

// ============ PLAYLIST MANAGEMENT ============

/**
 * Create a new playlist
 */
function createPlaylist(name) {
    let playlists = getFromStorage(STORAGE_KEYS.PLAYLISTS);
    
    const newPlaylist = {
        id: Date.now(), // use timestamp as unique id
        name: name,
        videos: [],
        createdAt: new Date().toISOString()
    };
    
    playlists.push(newPlaylist);
    saveToStorage(STORAGE_KEYS.PLAYLISTS, playlists);
    return newPlaylist;
}

/**
 * Delete a playlist by ID
 */
function deletePlaylist(playlistId) {
    let playlists = getFromStorage(STORAGE_KEYS.PLAYLISTS);
    playlists = playlists.filter(p => p.id !== playlistId);
    saveToStorage(STORAGE_KEYS.PLAYLISTS, playlists);
}

/**
 * Add video to a playlist
 */
function addToPlaylist(playlistId, videoId) {
    let playlists = getFromStorage(STORAGE_KEYS.PLAYLISTS);
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (playlist && !playlist.videos.includes(videoId)) {
        playlist.videos.unshift(videoId);
        saveToStorage(STORAGE_KEYS.PLAYLISTS, playlists);
        return true;
    }
    return false;
}

/**
 * Remove video from a playlist
 */
function removeFromPlaylist(playlistId, videoId) {
    let playlists = getFromStorage(STORAGE_KEYS.PLAYLISTS);
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (playlist) {
        playlist.videos = playlist.videos.filter(id => id !== videoId);
        saveToStorage(STORAGE_KEYS.PLAYLISTS, playlists);
    }
}

/**
 * Get all playlists
 */
function getPlaylists() {
    return getFromStorage(STORAGE_KEYS.PLAYLISTS);
}

/**
 * Get a single playlist by ID
 */
function getPlaylistById(playlistId) {
    const playlists = getFromStorage(STORAGE_KEYS.PLAYLISTS);
    return playlists.find(p => p.id === playlistId) || null;
}

// ============ THEME MANAGEMENT ============

/**
 * Get current theme (default: 'dark')
 */
function getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
}

/**
 * Set theme and apply it
 */
function setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    applyTheme(theme);
}

/**
 * Toggle between dark and light theme
 */
function toggleTheme() {
    const current = getTheme();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    return newTheme;
}

/**
 * Apply theme to the document
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme toggle button icon if it exists
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    }
}

// ============ COMMENTS MANAGEMENT ============

/**
 * Get comments for a video from the streamvibe_comments object.
 * Stored shape: { [videoId]: [comment, comment, ...] }
 */
function getComments(videoId) {
    const allComments = getFromStorage(STORAGE_KEYS.COMMENTS, {});
    const videoComments = allComments[String(videoId)];
    return Array.isArray(videoComments) ? videoComments : [];
}

/**
 * Normalize a new comment while preserving the existing watch-page comment fields.
 */
function normalizeComment(commentInput, parentId = null) {
    const base = typeof commentInput === 'object' && commentInput !== null
        ? commentInput
        : { text: commentInput };
    const author = base.author || base.user || 'You';
    const resolvedParentId = base.parentId !== undefined ? base.parentId : parentId;

    return {
        id: base.id || Date.now(),
        author: author,
        user: author,
        userImg: base.userImg || 'https://picsum.photos/seed/myavatar/100/100',
        text: base.text || '',
        timestamp: base.timestamp || new Date().toISOString(),
        likes: typeof base.likes === 'number' ? base.likes : 0,
        liked: Boolean(base.liked),
        parentId: resolvedParentId || null,
        replies: Array.isArray(base.replies) ? base.replies : []
    };
}

/**
 * Add a comment to a single video's comment list.
 * Supports addComment(videoId, commentObj) and the older addComment(videoId, text, parentId).
 */
function addComment(videoId, commentObj, parentId = null) {
    const allComments = getFromStorage(STORAGE_KEYS.COMMENTS, {});
    const videoKey = String(videoId);

    if (!Array.isArray(allComments[videoKey])) {
        allComments[videoKey] = [];
    }

    const newComment = normalizeComment(commentObj, parentId);

    if (newComment.parentId) {
        const parent = findComment(allComments[videoKey], newComment.parentId);
        if (parent) {
            if (!Array.isArray(parent.replies)) {
                parent.replies = [];
            }
            parent.replies.push(newComment);
        }
    } else {
        allComments[videoKey].unshift(newComment);
    }

    saveToStorage(STORAGE_KEYS.COMMENTS, allComments);
    return newComment;
}

/**
 * Find a comment by ID (recursive for nested replies)
 */
function findComment(comments, commentId) {
    for (let comment of comments) {
        if (String(comment.id) === String(commentId)) return comment;
        if (comment.replies && comment.replies.length > 0) {
            const found = findComment(comment.replies, commentId);
            if (found) return found;
        }
    }
    return null;
}

function removeCommentFromList(comments, commentId) {
    const filtered = comments.filter(comment => String(comment.id) !== String(commentId));

    filtered.forEach(comment => {
        if (Array.isArray(comment.replies)) {
            comment.replies = removeCommentFromList(comment.replies, commentId);
        }
    });

    return filtered;
}

/**
 * Delete a comment from a specific video's comments.
 */
function deleteComment(videoId, commentId) {
    const allComments = getFromStorage(STORAGE_KEYS.COMMENTS, {});
    const videoKey = String(videoId);
    if (!Array.isArray(allComments[videoKey])) return;

    allComments[videoKey] = removeCommentFromList(allComments[videoKey], commentId);
    saveToStorage(STORAGE_KEYS.COMMENTS, allComments);
}

/**
 * Toggle like on a comment
 */
function toggleCommentLike(videoId, commentId) {
    const allComments = getFromStorage(STORAGE_KEYS.COMMENTS, {});
    const videoKey = String(videoId);
    if (!Array.isArray(allComments[videoKey])) return;

    const comment = findComment(allComments[videoKey], commentId);
    if (comment) {
        comment.liked = !comment.liked;
        comment.likes = (comment.likes || 0) + (comment.liked ? 1 : -1);
        saveToStorage(STORAGE_KEYS.COMMENTS, allComments);
    }
}

// ============ VIEW COUNT MANAGEMENT ============

/**
 * Parse numeric and compact view count values, e.g. 1200, "1.2K", or "1.5M views".
 */
function parseViewCount(value) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;

    const normalized = value.trim().toLowerCase().replace(/,/g, '').replace(/views?/g, '').trim();
    const match = normalized.match(/^([0-9]+(?:\.[0-9]+)?)\s*([kmb])?$/);
    if (!match) return parseInt(normalized, 10) || 0;

    const amount = parseFloat(match[1]);
    const suffix = match[2];
    const multiplier = suffix === 'b' ? 1000000000 : suffix === 'm' ? 1000000 : suffix === 'k' ? 1000 : 1;

    return Math.round(amount * multiplier);
}

/**
 * Get the static view count from data/videos.js for a video.
 */
function getBaseViewCount(videoId) {
    const video = typeof getVideoById === 'function'
        ? getVideoById(videoId)
        : (typeof VIDEOS !== 'undefined' ? VIDEOS.find(v => v.id === parseInt(videoId)) : null);

    return video ? parseViewCount(video.views) : 0;
}

/**
 * Get base views plus local increments for a video.
 */
function getViewCount(videoId) {
    const viewCounts = getFromStorage(STORAGE_KEYS.VIEW_COUNTS, {});
    const incrementedCount = parseInt(viewCounts[String(videoId)], 10) || 0;

    return getBaseViewCount(videoId) + incrementedCount;
}

/**
 * Increment the locally persisted view count for a video by one.
 */
function incrementViewCount(videoId) {
    const viewCounts = getFromStorage(STORAGE_KEYS.VIEW_COUNTS, {});
    const videoKey = String(videoId);
    viewCounts[videoKey] = (parseInt(viewCounts[videoKey], 10) || 0) + 1;
    saveToStorage(STORAGE_KEYS.VIEW_COUNTS, viewCounts);

    return getViewCount(videoId);
}
// ============ UTILITY ============

/**
 * Format a count in compact YouTube-style notation (e.g. 1200 -> "1.2K").
 */
function formatViewCount(count) {
    const numericCount = parseViewCount(count);

    if (numericCount >= 1000000000) {
        return (numericCount / 1000000000).toFixed(1).replace('.0', '') + 'B';
    }
    if (numericCount >= 1000000) {
        return (numericCount / 1000000).toFixed(1).replace('.0', '') + 'M';
    }
    if (numericCount >= 1000) {
        return (numericCount / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return String(numericCount);
}

/**
 * Format view count for existing video metadata UI.
 */
function formatViews(count) {
    return formatViewCount(count) + ' views';
}

/**
 * Get video object by ID from the VIDEOS array
 */
function getVideoById(id) {
    return VIDEOS.find(v => v.id === parseInt(id)) || null;
}

/**
 * Format date from ISO string to relative time
 */
function formatRelativeTime(isoString) {
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return diffMins + ' min ago';
    if (diffHours < 24) return diffHours + ' hours ago';
    if (diffDays < 7) return diffDays + ' days ago';
    if (diffDays < 30) return Math.floor(diffDays / 7) + ' weeks ago';
    return Math.floor(diffDays / 30) + ' months ago';
}

// Apply saved theme on page load
document.addEventListener('DOMContentLoaded', function() {
    applyTheme(getTheme());
});

// ============ HOVER VIDEO PREVIEWS ============
$(document).ready(function () {
    let previewTimeout = null;
    let activeVideo = null;

    // Event delegation for hover play previews on thumbnails
    $(document).on('mouseenter', '.thumbnail-wrapper, .history-thumb, .related-thumb', function () {
        const $wrapper = $(this);
        const $video = $wrapper.find('.video-preview');
        if ($video.length === 0) return;

        if (previewTimeout) clearTimeout(previewTimeout);

        // 400ms delay to mimic YouTube preview logic
        previewTimeout = setTimeout(function () {
            if (activeVideo && activeVideo[0] !== $video[0]) {
                try {
                    activeVideo[0].pause();
                    activeVideo[0].currentTime = 0;
                    activeVideo.removeClass('playing');
                } catch (e) {}
            }

            activeVideo = $video;
            $video.addClass('playing');
            
            const playPromise = $video[0].play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Hover video play prevented:", error);
                });
            }
        }, 400);
    });

    $(document).on('mouseleave', '.thumbnail-wrapper, .history-thumb, .related-thumb', function () {
        const $wrapper = $(this);
        const $video = $wrapper.find('.video-preview');

        if (previewTimeout) {
            clearTimeout(previewTimeout);
            previewTimeout = null;
        }

        if ($video.length > 0) {
            try {
                $video[0].pause();
                $video[0].currentTime = 0;
            } catch (e) {}
            $video.removeClass('playing');
        }
        
        if (activeVideo && activeVideo[0] === $video[0]) {
            activeVideo = null;
        }
    });
});


