const fs = require('fs');
const path = require('path');

const musicDir = '/storage/emulated/0/Music/yt-dlp/audio';

try {
  console.log('Attempting to read directory:', musicDir);
  const files = fs.readdirSync(musicDir);  // Synchronous reading for debugging

  console.log('Files found:', files);
} catch (err) {
  console.error('Error reading directory:', err);
}
