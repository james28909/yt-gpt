const express = require('express');
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
const { exec } = require('child_process');

const app = express();

const musicDir = '/storage/emulated/0/Music/yt-dlp/audio';
const cacheDir = path.join(__dirname, 'cache');  // Directory to store cached thumbnails
const dbPath = path.join(__dirname, 'media.db'); // SQLite database path
const sqlite3Path = '/data/data/com.termux/files/usr/bin/sqlite3'; // Path to the sqlite3 binary
const audioExtensions = ['.mp3', '.m4a', '.ogg', '.opus', '.wav'];

// Ensure the cache directory exists
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

// Initialize SQLite database
const initializeDatabase = () => {
  exec(`${sqlite3Path} ${dbPath} "CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT UNIQUE, thumbnail TEXT, title TEXT);"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error initializing database:', stderr);
    } else {
      console.log('Database initialized:', stdout);
    }
  });
};

initializeDatabase();

// Function to escape single quotes in strings for SQL queries
const escapeString = (str) => {
  return str.replace(/'/g, "''");
};

// Function to add a new media file to the database
const addMediaToDatabase = (filePath, thumbnailPath, title) => {
  const escapedFilePath = escapeString(filePath);
  const escapedTitle = escapeString(title);

  const relativeFilePath = `/media/${path.basename(filePath)}`; // Ensure correct path for frontend
  const sql = `
    INSERT OR IGNORE INTO media (path, thumbnail, title) 
    VALUES ('${escapedFilePath}', '${thumbnailPath}', '${escapedTitle}')
  `;

  exec(`${sqlite3Path} ${dbPath} "${sql}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error adding media to database:', stderr);
    } else {
      console.log('Media added to database:', title);
    }
  });
};

// Function to get all media from the database
const getAllMediaFromDatabase = (callback) => {
  const sql = `SELECT * FROM media;`;

  exec(`${sqlite3Path} ${dbPath} "${sql}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error fetching media from database:', stderr);
      callback([]);
    } else {
      const mediaList = stdout.trim().split('\n').map(row => {
        const [id, path, thumbnail, title] = row.split('|');
        return { id, path, thumbnail, title };
      });
      callback(mediaList);
    }
  });
};

// Function to get a single media file from the database by path
const getMediaFromDatabase = (filePath, callback) => {
  const escapedFilePath = escapeString(filePath);
  const sql = `SELECT * FROM media WHERE path = '${escapedFilePath}';`;

  exec(`${sqlite3Path} ${dbPath} "${sql}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error fetching media from database:', stderr);
      callback(null);
    } else {
      const result = stdout.trim().split('|');
      if (result.length >= 3) {
        const [id, path, thumbnail, title] = result;
        callback({ id, path, thumbnail, title });
      } else {
        callback(null);
      }
    }
  });
};

// Function to process and cache thumbnails
const processAndCacheThumbnail = async (file, metadata) => {
  const hash = createHash('sha256').update(file).digest('hex');
  const thumbnailPath = path.join(cacheDir, `${hash}.jpg`);

  if (!fs.existsSync(thumbnailPath)) {
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const picture = metadata.common.picture[0];
      fs.writeFileSync(thumbnailPath, picture.data);
      console.log(`Thumbnail cached at ${thumbnailPath}`);
    } else {
      return '/default-thumbnail.png';
    }
  }

  return `/cache/${hash}.jpg`;
};

// Function to scan the directory and update the database with new files
const scanDirectoryAndUpdateDatabase = async () => {
  try {
    const { parseFile } = await import('music-metadata');

    console.log('Scanning directory for new files:', musicDir);
    const files = await fs.promises.readdir(musicDir);

    await Promise.all(
      files
        .filter(file => audioExtensions.includes(path.extname(file).toLowerCase()))
        .map(async file => {
          const filePath = path.join(musicDir, file);

          return new Promise((resolve, reject) => {
            getMediaFromDatabase(filePath, async (media) => {
              if (!media) {
                // Process metadata and cache thumbnail if not in database
                try {
                  const metadata = await parseFile(filePath);
                  const thumbnailUrl = await processAndCacheThumbnail(file, metadata);
                  const title = metadata.common.title || file;

                  // Add new media to the database
                  addMediaToDatabase(filePath, thumbnailUrl, title);
                  resolve();
                } catch (error) {
                  console.error(`Error processing file ${file}:`, error);
                  reject(error);
                }
              } else {
                resolve();
              }
            });
          });
        })
    );

    console.log('Directory scan completed.');
  } catch (err) {
    console.error('Error scanning directory:', err);
  }
};

// Endpoint to get the media list
app.get('/api/local-audio', async (req, res) => {
  try {
    // First, get the data from the database
    getAllMediaFromDatabase((mediaList) => {
      res.json(mediaList);

      // Then, continue scanning the directory for new files in the background
      scanDirectoryAndUpdateDatabase();
    });
  } catch (err) {
    console.error('Error fetching local audio files:', err);
    res.status(500).json({ error: 'Failed to load audio files' });
  }
});

// Serve media files from the music directory
app.use('/media', express.static(musicDir));

// Serve static files from the cache directory
app.use('/cache', express.static(cacheDir));

// Serve other static files (e.g., default-thumbnail.png)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(5000, () => console.log('Server running on port 5000'));
