import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import ViewListIcon from '@mui/icons-material/ViewList';
import AlbumIcon from '@mui/icons-material/Album';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';

const Footer = ({ onTabClick }) => {
  const footerWrapperStyle = {
    position: 'fixed',
    bottom: '0',
    left: '0',
    width: '100%',
    backgroundColor: '#333',
    zIndex: '1000',
  };

  const footerContainerStyle = {
    width: '100%',            // Make sure container takes the full width
    display: 'flex',
    justifyContent: 'center', // Center the footer content
  };

  const footerStyle = {
    width: '100%',            // Make sure footer takes the full width
    maxWidth: '600px',        // Optionally limit the width for better appearance
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px',
    backgroundColor: '#333',
    color: '#fff',
    boxSizing: 'border-box',
  };

  const iconStyle = {
    cursor: 'pointer',
    flex: '1',                // Ensure each icon takes equal space
    textAlign: 'center',      // Center icons in each flex box
  };

  return (
    <div style={footerWrapperStyle}>
      <div style={footerContainerStyle}>
        <div style={footerStyle}>
          <HomeIcon style={iconStyle} onClick={() => onTabClick('page1')} />
          <LibraryMusicIcon style={iconStyle} onClick={() => onTabClick('page2')} />
          <ViewListIcon style={iconStyle} onClick={() => onTabClick('page3')} />
          <AlbumIcon style={iconStyle} onClick={() => onTabClick('page4')} />
          <AudiotrackIcon style={iconStyle} onClick={() => onTabClick('local')} />
        </div>
      </div>
    </div>
  );
};

export default Footer;
