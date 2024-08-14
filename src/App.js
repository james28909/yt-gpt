import React, { useState, useRef, useEffect } from 'react';
import AudioList from './components/AudioList';
import Footer from './components/Footer';
import { IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

function App() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [currentFile, setCurrentFile] = useState(null); // Track the currently playing file
  const [isPlaying, setIsPlaying] = useState(false); // Track the play/pause state
  const playerRef = useRef(null); // Reference to the audio player

  useEffect(() => {
    if (currentFile) {
      try {
        const notification = new Notification('Now Playing', {
          body: currentFile.title || currentFile.path,
          icon: currentFile.thumbnail,
          actions: [
            { action: 'prev', title: 'Previous' },
            { action: 'pause', title: isPlaying ? 'Pause' : 'Play' },
            { action: 'stop', title: 'Stop' },
            { action: 'next', title: 'Next' }
          ]
        });

        notification.onclick = (event) => {
          if (event.action === 'prev') {
            handlePrevious();
          } else if (event.action === 'pause') {
            handlePlayPause();
          } else if (event.action === 'stop') {
            handleStop();
          } else if (event.action === 'next') {
            handleNext();
          }
        };

        return () => notification.close();
      } catch (err) {
        console.error('Notification error:', err);
      }
    }
  }, [currentFile, isPlaying]);

  const handleTabClick = (tab) => {
    if (tab === 'local') {
      console.log('Fetching local audio files...');

      fetch('/api/local-audio')
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
          }
          return response.json(); 
        })
        .then(data => {
          console.log('Received JSON data:', data);
          setFiles(data); 
          setError(null);
        })
        .catch(error => {
          console.error('Error fetching local audio files:', error);
          setError(error.message);
        });
    }
  };

const handleThumbnailClick = (file) => {
    try {
      if (playerRef.current) {
        // Pause the current audio and reset playback position
        playerRef.current.pause();
        playerRef.current.currentTime = 0;

        // Update the audio element's source to the new file
        playerRef.current.src = file.path;
        playerRef.current.load();

        // Start playing the new audio file
        playerRef.current.play();
      }
      
      // Update the current file state to reflect the new file
      setCurrentFile(file);
      setIsPlaying(true);
    } catch (err) {
      console.error('Error handling thumbnail click:', err);
      setError('Failed to load the selected file.');
    }
  };

  const handlePlayPause = () => {
    try {
      if (playerRef.current) {
        if (isPlaying) {
          playerRef.current.pause();
        } else {
          playerRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    } catch (err) {
      console.error('Error handling play/pause:', err);
      setError('Failed to play or pause the audio.');
    }
  };

  const handleStop = () => {
    try {
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Error handling stop:', err);
      setError('Failed to stop the audio.');
    }
  };

const handlePrevious = () => {
    try {
      if (files && currentFile) {
        handleStop();
        
        const currentIndex = files.findIndex(file => file.path === currentFile.path);
        const previousIndex = (currentIndex > 0) ? currentIndex - 1 : files.length - 1;
        const previousFile = files[previousIndex];

        // Update the audio element's source to the previous file
        if (playerRef.current) {
          playerRef.current.src = previousFile.path;
          playerRef.current.load();
          playerRef.current.play(); // Start playing the previous file
        }

        // Update the current file state to reflect the previous file
        setCurrentFile(previousFile);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error handling previous track:', err);
      setError('Failed to play the previous track.');
    }
};

const handleNext = () => {
    try {
      if (files && currentFile) {
        handleStop();
        
        const currentIndex = files.findIndex(file => file.path === currentFile.path);
        const nextIndex = (currentIndex < files.length - 1) ? currentIndex + 1 : 0;
        const nextFile = files[nextIndex];

        // Update the audio element's source to the next file
        if (playerRef.current) {
          playerRef.current.src = nextFile.path;
          playerRef.current.load();
          playerRef.current.play(); // Start playing the next file
        }

        // Update the current file state to reflect the next file
        setCurrentFile(nextFile);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error handling next track:', err);
      setError('Failed to play the next track.');
    }
};

  // Handle the seek bar update and position tracking
  useEffect(() => {
    const updateSeekBar = () => {
      if (playerRef.current && isPlaying) {
        const seekValue = (playerRef.current.currentTime / playerRef.current.duration) * 100;
        if (Notification.permission === 'granted' && currentFile) {
          const notification = new Notification('Now Playing', {
            body: `${currentFile.title || currentFile.path} - ${Math.round(seekValue)}%`,
            icon: currentFile.thumbnail
          });

          notification.onclose = () => {
            notification.close();
          };
        }
      }
    };

    const intervalId = setInterval(updateSeekBar, 1000);
    return () => clearInterval(intervalId);
  }, [isPlaying, currentFile]);

  return (
    <div>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: '#333', zIndex: 1000, padding: '10px', textAlign: 'center' }}>
        {currentFile ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <img
              src={currentFile.thumbnail}
              alt={currentFile.name}
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                marginBottom: '10px'
              }}
            />
            <audio ref={playerRef} autoPlay controls={false} onEnded={handleNext}>
              <source src={currentFile.path} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <IconButton onClick={handlePrevious} style={{ marginRight: '5px', color: 'white' }}>
                <SkipPreviousIcon />
              </IconButton>
              <IconButton onClick={handlePlayPause} style={{ marginRight: '5px', color: 'white' }}>
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <IconButton onClick={handleStop} style={{ marginRight: '5px', color: 'white' }}>
                <StopIcon />
              </IconButton>
              <IconButton onClick={handleNext} style={{ color: 'white' }}>
                <SkipNextIcon />
              </IconButton>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#fff' }}>Select a file to play</div>
        )}
      </div>

      <div style={{ marginTop: '200px', marginBottom: '60px' }}>  {/* Adjusted margin to account for player size */}
        {error ? (
          <div style={{ color: 'red', textAlign: 'center' }}>
            <p>{error}</p>
          </div>
        ) : (
          <AudioList files={files} onThumbnailClick={handleThumbnailClick} />
        )}
      </div>
      <Footer onTabClick={handleTabClick} />
    </div>
  );
}

export default App;
