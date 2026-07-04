# StreamVibe

StreamVibe is a YouTube-style video streaming frontend built as a static web project. It uses HTML, CSS, Bootstrap 5, and jQuery to provide a home feed, video watch experience, search, category browsing, dark mode, and browser-based persistence with `localStorage`.

Video playback is handled with real YouTube iframe embeds. Each video record in `data/videos.js` includes a `youtubeId`, and the watch page loads the selected video with `https://www.youtube.com/embed/{youtubeId}`. No backend, API keys, authentication, or YouTube Data API calls are required.

## Features

- Home feed with video cards and thumbnails
- Watch page with responsive YouTube iframe playback
- Search by video metadata
- Category filters for browsing videos
- Dark/light theme toggle
- Watch history stored in `localStorage`
- Liked videos stored in `localStorage`
- Watch Later list stored in `localStorage`
- Playlist creation and saving stored in `localStorage`
- Comments and replies stored in `localStorage`
- Additional pages for channels, explore, shorts, subscriptions, and history

## Tech Stack

- HTML5
- CSS3
- Bootstrap 5
- Bootstrap Icons
- jQuery
- JavaScript
- Browser `localStorage`
- YouTube iframe embeds

## Folder Structure

```text
.
├── index.html              # Home feed
├── watch.html              # Video watch page with YouTube iframe player
├── channel.html            # Channel page
├── explore.html            # Explore/category browsing page
├── shorts.html             # Shorts page
├── subscriptions.html      # Subscriptions page
├── history.html            # Watch history page
├── css/
│   ├── style.css           # Main styles and theme variables
│   └── responsive.css      # Responsive layout styles
├── data/
│   └── videos.js           # Video dataset, including YouTube IDs and thumbnails
└── js/
    ├── app.js              # Home feed, categories, theme, and card interactions
    ├── watch.js            # Watch page rendering, embeds, actions, and comments
    ├── search.js           # Search and suggestions
    └── storage.js          # localStorage-backed persistence helpers
```

## Setup

This is a static site with no build step.

1. Clone or download the project.
2. Open the project folder.
3. Open `index.html` directly in a browser, or serve the folder with any static file server.

Example using a simple local server:

```bash
npx serve .
```

Then open the local URL shown in the terminal.

## Video Playback

StreamVibe does not host video files and does not use the YouTube Data API. The app plays videos through standard YouTube iframe embeds using each video's `youtubeId` from `data/videos.js`.

Thumbnails can be loaded from YouTube with:

```text
https://img.youtube.com/vi/{youtubeId}/hqdefault.jpg
```

The watch page embed URL format is:

```text
https://www.youtube.com/embed/{youtubeId}
```

## Persistence

User activity is stored locally in the browser through `localStorage`. This includes watch history, liked videos, Watch Later, playlists, theme preference, and comments. Data stays on the user's device and can be cleared through the browser's site data settings.
