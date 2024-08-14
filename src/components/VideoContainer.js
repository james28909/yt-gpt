import React, { useState } from 'react';

function VideoContainer() {
    const [videos, setVideos] = useState([
        { id: 1, src: "video1.mp4" },
        { id: 2, src: "video2.mp4" }
    ]);

    const addVideo = (src) => {
        const newVideo = { id: videos.length + 1, src };
        setVideos([...videos, newVideo]);
    };

    return (
        <div id="video-container">
            {videos.map(video => (
                <div key={video.id} className="video-player">
                    <video controls>
                        <source src={video.src} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            ))}
        </div>
    );
}

export default VideoContainer;
