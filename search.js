/* * search.js - Search Functionality Module
 * Handles search, live filtering, suggestions dropdown, and highlighting
 */

// ============ SEARCH CONFIGURATION ============
const MAX_SUGGESTIONS = 8; // max suggestions to show in dropdown

/**
 * Search videos by title (case-insensitive)
 * Returns matching videos array
 */
function searchVideos(query) {
    if (!query || query.trim() === '') return VIDEOS;
    
    const searchTerm = query.toLowerCase().trim();
    
    return VIDEOS.filter(video => {
        // Search in title, channel name, tags, and description
        const titleMatch = video.title.toLowerCase().includes(searchTerm);
        const channelMatch = video.channel.toLowerCase().includes(searchTerm);
        const tagMatch = video.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        const descMatch = video.description.toLowerCase().includes(searchTerm);
        
        return titleMatch || channelMatch || tagMatch || descMatch;
    });
}

/**
 * Get search suggestions based on current input
 * Returns array of suggestion strings
 */
function getSearchSuggestions(query) {
    if (!query || query.trim().length < 2) return [];
    
    const searchTerm = query.toLowerCase().trim();
    const suggestions = new Set(); // use Set to avoid duplicates
    
    VIDEOS.forEach(video => {
        // Match video titles
        if (video.title.toLowerCase().includes(searchTerm)) {
            suggestions.add(video.title);
        }
        
        // Match channel names
        if (video.channel.toLowerCase().includes(searchTerm)) {
            suggestions.add(video.channel);
        }
        
        // Match tags
        video.tags.forEach(tag => {
            if (tag.toLowerCase().includes(searchTerm)) {
                suggestions.add(tag);
            }
        });
    });
    
    // Convert to array and limit
    return Array.from(suggestions).slice(0, MAX_SUGGESTIONS);
}

/**
 * Highlight matching text in a string
 * Wraps matched text in <mark> tags
 */
function highlightMatch(text, query) {
    if (!query || query.trim() === '') return text;
    
    const regex = new RegExp('(' + escapeRegex(query.trim()) + ')', 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Render search suggestions dropdown
 */
function renderSuggestions(query) {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (!suggestionsContainer) return;
    
    const suggestions = getSearchSuggestions(query);
    
    if (suggestions.length === 0 || query.trim().length < 2) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.remove('show');
        return;
    }
    
    let html = '';
    suggestions.forEach(suggestion => {
        const highlighted = highlightMatch(suggestion, query);
        html += `
            <div class="suggestion-item" data-suggestion="${suggestion}">
                <i class="bi bi-search me-2"></i>
                <span>${highlighted}</span>
            </div>
        `;
    });
    
    suggestionsContainer.innerHTML = html;
    suggestionsContainer.classList.add('show');
}

/**
 * Initialize search functionality
 * Sets up event listeners for the search bar
 */
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    if (!searchInput) return;
    
    // Live search suggestions as user types
    searchInput.addEventListener('input', function() {
        const query = this.value;
        renderSuggestions(query);
    });
    
    // Search on Enter key
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(this.value);
            if (suggestionsContainer) suggestionsContainer.classList.remove('show');
        }
    });
    
    // Search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            performSearch(searchInput.value);
            if (suggestionsContainer) suggestionsContainer.classList.remove('show');
        });
    }
    
    // Click on suggestion
    $(document).on('click', '.suggestion-item', function() {
        const suggestion = $(this).data('suggestion');
        searchInput.value = suggestion;
        performSearch(suggestion);
        if (suggestionsContainer) suggestionsContainer.classList.remove('show');
    });
    
    // Hide suggestions when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.search-wrapper').length) {
            if (suggestionsContainer) suggestionsContainer.classList.remove('show');
        }
    });
    
    // Focus shows suggestions if there's text
    searchInput.addEventListener('focus', function() {
        if (this.value.trim().length >= 2) {
            renderSuggestions(this.value);
        }
    });
}

/**
 * Perform search and update the video grid
 * Called from index.html context
 */
function performSearch(query) {
    if (typeof renderVideoGrid === 'function') {
        const results = searchVideos(query);
        currentSearchQuery = query;
        renderVideoGrid(results, query);
        
        // Update page title or show search info
        const gridTitle = document.getElementById('gridTitle');
        if (gridTitle) {
            if (query.trim()) {
                gridTitle.textContent = `Search results for "${query}" (${results.length} videos)`;
            } else {
                gridTitle.textContent = '';
            }
        }
    }
}

// Variable to track current search query
let currentSearchQuery = '';
