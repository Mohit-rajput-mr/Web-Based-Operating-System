import React from 'react';

const Gallery = ({ fileSystem }) => {
  // Find pictures folder
  const picturesFolder = fileSystem[0]?.children?.find((item) => item.id === 'pictures');
  if (!picturesFolder) {
    return <div style={{ padding: 10 }}>No Pictures folder found.</div>;
  }
  // Filter images
  const images = picturesFolder.children?.filter((item) => item.type === 'image') || [];

  return (
    <div style={{ padding: 10, maxHeight: 400, overflowY: 'auto' }}>
      <h2>Gallery</h2>
      {images.length === 0 && <p>No images yet.</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {images.map((img) => (
          <div key={img.id}>
            <img
              src={img.content}
              alt={img.name}
              style={{ width: 100, height: 100, objectFit: 'cover' }}
            />
            <p style={{ fontSize: '12px', textAlign: 'center' }}>{img.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
