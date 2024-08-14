import React, { useState } from 'react';
import ReactPlayer from 'react-player';

function Header() {
    const [playing, setPlaying] = useState(false);

    return (
        <header className="header">
            <h1>Your Project Title</h1>
            <div className="video-container">
                <ReactPlayer 
                    url={null} // Set to null or use a state to dynamically load the video URL
                    playing={playing}
                    controls
                    width="100%"
                    height="360px"
                    style={{ backgroundColor: 'black' }}
                />
            </div>
            <div className="controls">
                <button onClick={() => setPlaying(!playing)}>
                    {playing ? 'Pause' : 'Play'}
                </button>
            </div>
        </header>
    );
}

export default Header;
