import React, { useState, useEffect } from 'react';

function Local() {
    const [audioFiles, setAudioFiles] = useState([]);

    useEffect(() => {
        // Fetch the list of audio files from the server directory
        fetch('/api/get-audio-files')
            .then(response => response.json())
            .then(data => setAudioFiles(data))
            .catch(error => console.error('Error fetching local audio files:', error));
    }, []);

    return (
        <div className="local-page">
            <h2>Local Audio Files</h2>
            <ul>
                {audioFiles.map((file, index) => (
                    <li key={index}>
                        <a href={`/storage/music/yt-dlp/audio/${file}`} target="_blank" rel="noopener noreferrer">
                            {file}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Local;
