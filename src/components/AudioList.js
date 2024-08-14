import React from 'react';

const AudioList = ({ files, viewMode, onThumbnailClick }) => {
  try {
    if (!Array.isArray(files) || files.length === 0) {
      return <div>No audio files found.</div>;  // Show a message if no files are found
    }

    const listStyle = {
      display: 'flex',
      flexDirection: 'column',
      padding: '10px',
    };

    const tileStyle = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      gap: '10px',
      padding: '10px',
    };

    const itemStyle = {
      textAlign: 'center',
      padding: '10px',
      cursor: 'pointer',
    };

    const thumbnailStyle = {
      width: '100px',
      height: '100px',
      objectFit: 'cover',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '5px',
    };

    const filenameStyle = {
      fontSize: '0.8em',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      width: '100px',
    };

    return (
      <div style={viewMode === 'list' ? listStyle : tileStyle}>
        {files.map((file, index) => (
          <div
            key={index}
            style={itemStyle}
            onClick={() => onThumbnailClick(file)}
          >
            <img
              src={file.thumbnail}
              alt="Thumbnail"
              style={thumbnailStyle}
              onError={(e) => e.target.src = '/default-thumbnail.png'}
            />
            <div style={filenameStyle} title={file.name}>{file.name}</div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error rendering AudioList:', error);
    return <div style={{ color: 'red' }}>Error: {error.message}</div>;
  }
};

export default AudioList;
