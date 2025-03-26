// components/ppt/PPT.js
import React, { useState, useRef } from 'react';
import './PPT.css';

const PPT = () => {
  const [slides, setSlides] = useState([
    { id: 1, content: '<h2>Slide 1</h2><p>Content of slide 1</p>' }
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slideEditorRef = useRef(null);

  // Execute rich text command in the slide editor
  const handleCommand = (command) => {
    document.execCommand(command, false, null);
  };

  // Update content for the active slide
  const handleSlideContentChange = () => {
    const updatedSlides = slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return { ...slide, content: slideEditorRef.current.innerHTML };
      }
      return slide;
    });
    setSlides(updatedSlides);
  };

  // Add a new slide with default content
  const addSlide = () => {
    const newSlide = {
      id: Date.now(),
      content: '<h2>New Slide</h2><p>Slide content here...</p>'
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  // Delete a slide (minimum one slide remains)
  const deleteSlide = (index) => {
    if (slides.length <= 1) return;
    const updatedSlides = slides.filter((_, idx) => idx !== index);
    setSlides(updatedSlides);
    setCurrentSlideIndex(0);
  };

  // Change active slide
  const selectSlide = (index) => {
    setCurrentSlideIndex(index);
  };

  // Simulate saving presentation (integrate your file system logic here)
  const handleSavePresentation = () => {
    const presentationData = JSON.stringify(slides, null, 2);
    alert('Presentation saved!\n' + presentationData);
  };

  return (
    <div className="ppt-container">
      <div className="ppt-sidebar">
        <button onClick={addSlide} className="add-slide-btn">+ Add Slide</button>
        <ul className="slides-list">
          {slides.map((slide, index) => (
            <li 
              key={slide.id} 
              className={`slide-thumbnail ${index === currentSlideIndex ? 'active' : ''}`}
              onClick={() => selectSlide(index)}
            >
              <div className="slide-preview" dangerouslySetInnerHTML={{ __html: slide.content }}></div>
              <button 
                className="delete-slide-btn" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  deleteSlide(index); 
                }}
                title="Delete Slide"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="ppt-main">
        <div className="ppt-toolbar">
          <button onClick={() => handleCommand('bold')} title="Bold"><b>B</b></button>
          <button onClick={() => handleCommand('italic')} title="Italic"><i>I</i></button>
          <button onClick={() => handleCommand('underline')} title="Underline"><u>U</u></button>
          <button onClick={() => handleCommand('justifyLeft')} title="Align Left">L</button>
          <button onClick={() => handleCommand('justifyCenter')} title="Center">C</button>
          <button onClick={() => handleCommand('justifyRight')} title="Align Right">R</button>
          <button onClick={handleSavePresentation} title="Save Presentation">Save</button>
        </div>
        <div
          className="ppt-editor"
          contentEditable={true}
          ref={slideEditorRef}
          onInput={handleSlideContentChange}
          dangerouslySetInnerHTML={{ __html: slides[currentSlideIndex].content }}
        ></div>
      </div>
    </div>
  );
};

export default PPT;
