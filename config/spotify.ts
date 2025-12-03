// Spotify API Configuration
// Get your credentials at: https://developer.spotify.com/dashboard

export const SPOTIFY_CONFIG = {
  // Your Spotify App Client ID
  CLIENT_ID: 'ca92b8c14102476688d8c01d6cf16722',
  
  // Redirect URI (must match exactly what's in Spotify Dashboard)
  // For local development: MUST be http://localhost:3000/
  // For production: change to your actual HTTPS domain
  REDIRECT_URI: typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000/'
    : typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}/`
    : '',
  
  // Required scopes for Web Playback SDK
  SCOPES: [
    'streaming',                    // Required for Web Playback SDK
    'user-read-email',              // Read user email
    'user-read-private',            // Read user profile
    'user-read-playback-state',     // Read playback state
    'user-modify-playback-state'    // Control playback
  ]
};

// Instructions:
// 1. Go to https://developer.spotify.com/dashboard
// 2. Create or open your app
// 3. Add Redirect URI: http://localhost:3000/
// 4. Copy your Client ID and paste it above
// 5. Make sure "Web Playback SDK" is checked in app settings

