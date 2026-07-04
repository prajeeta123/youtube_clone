/*
 * watch.js - Watch Page Logic
 * Handles: video player display, like/dislike, subscribe, comments,
 * description toggle, related videos, and save/share functionality
 */

// ============ WATCH PAGE INITIALIZATION ============
$(document).ready(function () {
    // Get video ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = parseInt(urlParams.get('v'));

    if (!videoId) {
        // Redirect to home if no video ID
        window.location.href = 'index.html';
        return;
    }

    // Load the video
    const video = getVideoById(videoId);
    if (!video) {
        window.location.href = 'index.html';
        return;
    }

    // Add to history and count this page load as a view
    addToHistory(videoId);
    incrementViewCount(videoId);

    // Render all sections
    renderVideoPlayer(video);
    renderVideoActions(video);
    renderChannelInfo(video);
    renderDescription(video);
    renderComments(videoId);
    renderRelatedVideos(video);

    // Setup event handlers
    setupWatchPageEvents(video);
    setupSidebar();
    setupThemeToggle();

    // Update page title
    document.title = video.title + ' - StreamVibe';
});

// ============ VIDEO PLAYER ============

/**
 * Render the YouTube embed for the selected video.
 */
function renderVideoPlayer(video) {
    const player = document.getElementById('videoPlayer');
    if (!player) return;

    const youtubeId = video.youtubeId || 'aqz-KE-bpKQ';
    let iframe = document.getElementById('youtubePlayer');

    if (!iframe) {
        player.innerHTML = `
            <iframe
                id="youtubePlayer"
                title="StreamVibe video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen>
            </iframe>
        `;
        iframe = document.getElementById('youtubePlayer');
    }

    iframe.src = `https://www.youtube.com/embed/${youtubeId}`;
    iframe.title = `${video.title} - YouTube video player`;
}

// ============ VIDEO ACTIONS BAR ============

/**
 * Render title, stats, and action buttons (like, share, save, etc.)
 */
function renderVideoActions(video) {
    const container = document.getElementById('videoActionsBar');
    if (!container) return;

    const isLiked = isVideoLiked(video.id);
    const inWatchLater = isInWatchLater(video.id);

    container.innerHTML = `
        <h1>${video.title}</h1>
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div class="video-stats">
                <span>${formatViews(getViewCount(video.id))}</span>
                <span>${video.uploadTime}</span>
            </div>
            <div class="action-buttons">
                <div class="like-dislike-pill">
                    <button class="action-btn ripple ${isLiked ? 'active' : ''}" id="likeBtn" data-video-id="${video.id}">
                        <i class="bi ${isLiked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}"></i>
                        <span id="likeCount">${isLiked ? '1' : '0'}</span>
                    </button>
                    <button class="action-btn ripple" id="dislikeBtn">
                        <i class="bi bi-hand-thumbs-down"></i>
                    </button>
                </div>
                <button class="action-btn ripple" id="shareBtn">
                    <i class="bi bi-share"></i>
                    <span>Share</span>
                </button>
                <button class="action-btn ripple" id="downloadBtn">
                    <i class="bi bi-download"></i>
                    <span>Download</span>
                </button>
                <button class="action-btn ripple ${inWatchLater ? 'active' : ''}" id="saveBtn" data-video-id="${video.id}">
                    <i class="bi ${inWatchLater ? 'bi-bookmark-fill' : 'bi-bookmark'}"></i>
                    <span>Save</span>
                </button>
            </div>
        </div>
    `;
}

// ============ CHANNEL INFO ============

/**
 * Render channel info section with subscribe button
 */
function renderChannelInfo(video) {
    const container = document.getElementById('channelInfoWatch');
    if (!container) return;

    // Random subscriber count for demo
    const subCount = Math.floor(Math.random() * 5000 + 100) + 'K';

    container.innerHTML = `
        <a href="channel.html?channel=${encodeURIComponent(video.channel)}">
            <img src="${video.channelImg}" alt="${video.channel}">
        </a>
        <div class="channel-details">
            <a href="channel.html?channel=${encodeURIComponent(video.channel)}" class="channel-name">${video.channel}</a>
            <div class="sub-count">${subCount} subscribers</div>
        </div>
        <button class="subscribe-btn" id="subscribeBtn">Subscribe</button>
    `;
}

// ============ DESCRIPTION ============

/**
 * Render video description with tags
 */
function renderDescription(video) {
    const container = document.getElementById('descriptionBox');
    if (!container) return;

    let tagsHtml = '';
    video.tags.forEach(tag => {
        tagsHtml += `<span class="tag-badge">#${tag}</span>`;
    });

    container.innerHTML = `
        <div class="desc-stats">${formatViews(getViewCount(video.id))} • ${video.uploadTime}</div>
        <div class="desc-text">${video.description}</div>
        <div class="tags-list">${tagsHtml}</div>
        <div class="show-more-text mt-2" style="color: var(--text-muted); font-size: 0.85rem; font-weight: 500;">
            Show more
        </div>
    `;
}

// ============ COMMENTS ============

/**
 * Render the comments section for one video.
 */
function renderComments(videoId) {
    const container = document.getElementById('commentsList');
    if (!container) return;

    container.innerHTML = '';
    const comments = getComments(videoId);

    const countEl = document.getElementById('commentCount');
    if (countEl) countEl.textContent = comments.length;

    if (comments.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: var(--text-muted);">No comments yet. Be the first to comment!</p>';
        return;
    }

    let html = '';
    comments.forEach(comment => {
        html += renderCommentItem(comment, videoId);
    });

    container.innerHTML = html;
}

/**
 * Format stored comment timestamps while preserving friendly demo strings.
 */
function formatCommentTimestamp(timestamp) {
    if (!timestamp) return 'Just now';

    const parsed = new Date(timestamp);
    if (!Number.isNaN(parsed.getTime())) {
        return formatRelativeTime(timestamp);
    }

    return timestamp;
}
/**
 * Render a single comment item (recursive for replies)
 */
function renderCommentItem(comment, videoId) {
    const author = comment.author || comment.user || 'You';
    const userImg = comment.userImg || 'https://picsum.photos/seed/myavatar/100/100';
    const timeDisplay = formatCommentTimestamp(comment.timestamp);
    const isOwn = author === 'You';

    let html = `
        <div class="comment-item" data-comment-id="${comment.id}">
            <img src="${userImg}" alt="${author}">
            <div class="comment-body">
                <div>
                    <span class="comment-author">${author}</span>
                    <span class="comment-time">${timeDisplay}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
                <div class="comment-actions-row">
                    <button class="comment-action-btn like-comment-btn ${comment.liked ? 'liked' : ''}" 
                            data-comment-id="${comment.id}" data-video-id="${videoId}">
                        <i class="bi ${comment.liked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}"></i>
                        <span>${comment.likes}</span>
                    </button>
                    <button class="comment-action-btn">
                        <i class="bi bi-hand-thumbs-down"></i>
                    </button>
                    <button class="comment-action-btn reply-btn" data-comment-id="${comment.id}">
                        Reply
                    </button>
                    ${isOwn ? `
                        <button class="comment-action-btn delete-comment-btn" 
                                data-comment-id="${comment.id}" data-video-id="${videoId}"
                                style="color: var(--red-like);">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    ` : ''}
                </div>
                <div class="reply-input-area" id="replyArea-${comment.id}" style="display:none; margin-top:12px;">
                    <div class="comment-input-wrapper">
                        <img src="https://picsum.photos/seed/myavatar/100/100" alt="You">
                        <div class="comment-input-box" style="flex:1;">
                            <input type="text" placeholder="Add a reply..." class="reply-input" data-parent-id="${comment.id}" data-video-id="${videoId}">
                            <div class="comment-actions show" style="margin-top:6px;">
                                <button class="comment-cancel-btn cancel-reply-btn" data-comment-id="${comment.id}">Cancel</button>
                                <button class="comment-submit-btn submit-reply-btn" data-parent-id="${comment.id}" data-video-id="${videoId}">Reply</button>
                            </div>
                        </div>
                    </div>
                </div>
    `;

    // Render replies
    if (comment.replies && comment.replies.length > 0) {
        html += '<div class="comment-replies">';
        comment.replies.forEach(reply => {
            html += renderCommentItem(reply, videoId);
        });
        html += '</div>';
    }

    html += `
            </div>
        </div>
    `;

    return html;
}

// ============ RELATED VIDEOS ============

/**
 * Render related videos in the sidebar.
 * Same-category videos are shown first, then the list is filled from the rest of VIDEOS.
 */
function renderRelatedVideos(currentVideo) {
    const container = document.getElementById('related-videos') || document.getElementById('relatedVideosList');
    if (!container) return;

    const relatedLimit = 10;
    const sameCategory = VIDEOS.filter(video =>
        video.id !== currentVideo.id && video.category === currentVideo.category
    );
    const otherVideos = VIDEOS.filter(video =>
        video.id !== currentVideo.id && video.category !== currentVideo.category
    );
    const related = [...sameCategory, ...otherVideos].slice(0, relatedLimit);

    let html = '';
    related.forEach(video => {
        const isLive = video.duration === 'LIVE';
        html += `
            <a href="watch.html?v=${video.id}" class="video-card related-video-card" data-video-id="${video.id}" aria-label="Watch ${video.title}">
                <div class="related-thumb">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                    <video class="video-preview" src="${video.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}" muted loop playsinline></video>
                    <span class="duration-badge ${isLive ? 'live' : ''}">${video.duration}</span>
                </div>
                <div class="related-info">
                    <div class="video-title">${video.title}</div>
                    <div class="video-channel">${video.channel}</div>
                    <div class="video-meta">
                        <span>${formatViews(getViewCount(video.id))}</span>
                        <span>${video.uploadTime}</span>
                    </div>
                </div>
            </a>
        `;
    });

    container.innerHTML = html;
}

// ============ EVENT HANDLERS ============

/**
 * Setup all event handlers for the watch page
 */
function setupWatchPageEvents(video) {

    // --- Related Video Clicks ---
    $(document).on('click', '.related-video-card', function () {
        const relatedVideoId = $(this).data('video-id');
        if (relatedVideoId) {
            addToHistory(relatedVideoId);
        }
    });

    // --- Like Button ---
    $(document).on('click', '#likeBtn', function () {
        const isNowLiked = toggleLikeVideo(video.id);
        if (isNowLiked) {
            $(this).addClass('active');
            $(this).find('i').attr('class', 'bi bi-hand-thumbs-up-fill');
            $('#likeCount').text('1');
            showToast('Added to Liked Videos');
        } else {
            $(this).removeClass('active');
            $(this).find('i').attr('class', 'bi bi-hand-thumbs-up');
            $('#likeCount').text('0');
            showToast('Removed from Liked Videos');
        }
    });

    // --- Dislike Button ---
    $(document).on('click', '#dislikeBtn', function () {
        $(this).toggleClass('active');
        const icon = $(this).find('i');
        if ($(this).hasClass('active')) {
            icon.attr('class', 'bi bi-hand-thumbs-down-fill');
        } else {
            icon.attr('class', 'bi bi-hand-thumbs-down');
        }
    });

    // --- Subscribe Button ---
    $(document).on('click', '#subscribeBtn', function () {
        if ($(this).hasClass('subscribed')) {
            $(this).removeClass('subscribed').text('Subscribe');
            showToast('Unsubscribed');
        } else {
            $(this).addClass('subscribed').text('Subscribed ✓');
            showToast('Subscribed! 🎉');
        }
    });

    // --- Save Button (Watch Later) ---
    $(document).on('click', '#saveBtn', function () {
        const vid = $(this).data('video-id');
        if (isInWatchLater(vid)) {
            removeFromWatchLater(vid);
            $(this).removeClass('active');
            $(this).find('i').attr('class', 'bi bi-bookmark');
            showToast('Removed from Watch Later');
        } else {
            addToWatchLater(vid);
            $(this).addClass('active');
            $(this).find('i').attr('class', 'bi bi-bookmark-fill');
            showToast('Saved to Watch Later');
        }
    });

    // --- Share Button ---
    $(document).on('click', '#shareBtn', function () {
        const url = window.location.href;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            showToast('Link copied to clipboard! 📋');
        } else {
            showToast('Share: ' + url);
        }
    });

    // --- Download Button ---
    $(document).on('click', '#downloadBtn', function () {
        showToast('Download started (simulated) ⬇');
    });

    // --- Description Toggle ---
    $(document).on('click', '#descriptionBox', function () {
        $(this).toggleClass('expanded');
        const showMoreText = $(this).find('.show-more-text');
        if ($(this).hasClass('expanded')) {
            showMoreText.text('Show less');
        } else {
            showMoreText.text('Show more');
        }
    });

    // --- Add Comment ---
    const commentInput = document.getElementById('commentInput');
    const commentActions = document.getElementById('commentActions');

    if (commentInput) {
        // Show actions on focus
        $(commentInput).on('focus', function () {
            $(commentActions).addClass('show');
        });

        // Cancel comment
        $(document).on('click', '#cancelComment', function () {
            commentInput.value = '';
            $(commentActions).removeClass('show');
        });

        // Submit comment
        $(document).on('click', '#submitComment', function () {
            const text = commentInput.value.trim();
            if (!text) return;

            addComment(video.id, {
                text: text,
                author: 'You',
                timestamp: new Date().toISOString(),
                likes: 0
            });
            commentInput.value = '';
            $(commentActions).removeClass('show');
            renderComments(video.id);
            showToast('Comment added! 💬');
        });

        // Submit on Enter
        $(commentInput).on('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                $('#submitComment').click();
            }
        });
    }

    // --- Like Comment ---
    $(document).on('click', '.like-comment-btn', function () {
        const commentId = $(this).data('comment-id');
        const videoId = $(this).data('video-id');

        // Only toggle for user-added comments (numeric IDs)
        if (typeof commentId === 'number') {
            toggleCommentLike(videoId, commentId);
        }

        // Toggle UI
        $(this).toggleClass('liked');
        const icon = $(this).find('i');
        const countSpan = $(this).find('span');
        let count = parseInt(countSpan.text()) || 0;

        if ($(this).hasClass('liked')) {
            icon.attr('class', 'bi bi-hand-thumbs-up-fill');
            countSpan.text(count + 1);
        } else {
            icon.attr('class', 'bi bi-hand-thumbs-up');
            countSpan.text(Math.max(0, count - 1));
        }
    });

    // --- Delete Comment ---
    $(document).on('click', '.delete-comment-btn', function () {
        const commentId = $(this).data('comment-id');
        const videoId = $(this).data('video-id');
        deleteComment(videoId, commentId);
        $(this).closest('.comment-item').slideUp(300, function () {
            $(this).remove();
        });
        showToast('Comment deleted');
    });

    // --- Reply Toggle ---
    $(document).on('click', '.reply-btn', function () {
        const commentId = $(this).data('comment-id');
        $(`#replyArea-${commentId}`).slideToggle(200);
    });

    // --- Cancel Reply ---
    $(document).on('click', '.cancel-reply-btn', function () {
        const commentId = $(this).data('comment-id');
        $(`#replyArea-${commentId}`).slideUp(200);
    });

    // --- Submit Reply ---
    $(document).on('click', '.submit-reply-btn', function () {
        const parentId = $(this).data('parent-id');
        const videoId = $(this).data('video-id');
        const input = $(this).closest('.reply-input-area').find('.reply-input');
        const text = input.val().trim();

        if (!text) return;

        addComment(videoId, {
            text: text,
            author: 'You',
            timestamp: new Date().toISOString(),
            likes: 0,
            parentId: parentId
        });
        input.val('');
        $(`#replyArea-${parentId}`).slideUp(200);
        renderComments(videoId);
        showToast('Reply added! 💬');
    });

    // --- Submit Reply on Enter ---
    $(document).on('keydown', '.reply-input', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            $(this).closest('.reply-input-area').find('.submit-reply-btn').click();
        }
    });
}




