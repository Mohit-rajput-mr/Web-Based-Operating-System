// enhanced PPT.js
import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Image, Square, Circle, Type, Trash2, Save, Play, Download, Upload,
  PlusCircle, Edit3, Copy, Clipboard, Layers, AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  Underline, List, Grid3x3, ChevronLeft, ChevronRight, RotateCcw, RotateCw, Star, Video, Music,
  BarChart2, PieChart, Sliders, Scissors, CheckCircle, CloudDrizzle, CloudLightning
} from 'lucide-react';
import './PPT.css';

const PPT = () => {
  // Basic slide and presentation state
  const [slides, setSlides] = useState([
    {
      id: 1,
      content: '<h2>Welcome to Enhanced PPT</h2><p>Click to edit this text</p>',
      background: '#ffffff',
      notes: 'Introduction slide notes',
      drawingData: '' // to store free drawing image data
    }
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [slideTransition, setSlideTransition] = useState('fade'); // fade, slide, zoom, flip
  const [theme, setTheme] = useState('default'); // default, dark, professional, creative
  const [presentationTitle, setPresentationTitle] = useState('Untitled Presentation');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [selectedElement, setSelectedElement] = useState(null);
  const [slideNotes, setSlideNotes] = useState('');
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [layoutMenuOpen, setLayoutMenuOpen] = useState(false);
  const [elementContextMenu, setElementContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [viewMode, setViewMode] = useState('edit'); // edit, notes, outline

  // Advanced state for extra operations
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#ff0000');
  const [rotation, setRotation] = useState(0); // rotation (in degrees) for selected element
  const [animation, setAnimation] = useState('none'); // animation effect for slide elements

  const slideEditorRef = useRef(null);
  const notesEditorRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  // Add history snapshot when slides change
  useEffect(() => {
    if (slides !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(slides)));
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [slides]);

  // When current slide changes, update notes and initialize editor content without forcing re-render
  useEffect(() => {
    if (slides[currentSlideIndex] && slides[currentSlideIndex].notes !== undefined) {
      setSlideNotes(slides[currentSlideIndex].notes || '');
    } else {
      setSlideNotes('');
    }
    if (slideEditorRef.current) {
      slideEditorRef.current.innerHTML = slides[currentSlideIndex]?.content || '';
    }
  }, [currentSlideIndex, slides]);

  // Apply selected theme to the document body
  useEffect(() => {
    document.body.className = `theme-${theme}`;
    return () => {
      document.body.className = '';
    };
  }, [theme]);

  // Initialize the drawing canvas when drawing mode is on
  useEffect(() => {
    if (isDrawingMode && canvasRef.current && slideEditorRef.current) {
      const canvas = canvasRef.current;
      const editor = slideEditorRef.current;
      canvas.width = editor.offsetWidth;
      canvas.height = editor.offsetHeight;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [isDrawingMode, currentSlideIndex]);

  // Execute rich text commands (without interrupting caret)
  const handleCommand = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  // Update slide content on blur so typing isn’t interrupted
  const handleSlideContentChange = () => {
    if (!slideEditorRef.current) return;
    const updatedSlides = slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          content: slideEditorRef.current.innerHTML
        };
      }
      return slide;
    });
    setSlides(updatedSlides);
  };

  // Update speaker notes
  const handleNotesChange = () => {
    if (!notesEditorRef.current) return;
    const updatedSlides = slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          notes: notesEditorRef.current.innerHTML
        };
      }
      return slide;
    });
    setSlides(updatedSlides);
    setSlideNotes(notesEditorRef.current.innerHTML);
  };

  // Basic slide operations: add, duplicate, delete, select, navigate
  const addSlide = (layout = 'blank') => {
    let content = '';
    switch (layout) {
      case 'title':
        content = '<h1 class="slide-title">Title Slide</h1><h3 class="slide-subtitle">Subtitle goes here</h3>';
        break;
      case 'content':
        content = '<h2 class="slide-title">Section Title</h2><div class="content-box"><p>Content goes here</p></div>';
        break;
      case 'two-column':
        content = '<h2 class="slide-title">Two Column Layout</h2><div class="two-column"><div class="column"><h3>Column 1</h3><p>Content for column 1</p></div><div class="column"><h3>Column 2</h3><p>Content for column 2</p></div></div>';
        break;
      case 'image-text':
        content = '<h2 class="slide-title">Image with Text</h2><div class="image-text-layout"><div class="image-placeholder">[Image]</div><div class="text-content"><p>Description text here</p></div></div>';
        break;
      default:
        content = '<h2>New Slide</h2><p>Click to add content</p>';
    }
    const newSlide = {
      id: Date.now(),
      content: content,
      background: '#ffffff',
      notes: '',
      drawingData: ''
    };
    const newSlides = [...slides];
    newSlides.splice(currentSlideIndex + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(currentSlideIndex + 1);
    setLayoutMenuOpen(false);
  };

  const duplicateSlide = () => {
    const currentSlide = slides[currentSlideIndex];
    const duplicatedSlide = { ...currentSlide, id: Date.now() };
    const newSlides = [...slides];
    newSlides.splice(currentSlideIndex + 1, 0, duplicatedSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(currentSlideIndex + 1);
  };

  const deleteSlide = (index) => {
    if (slides.length <= 1) return;
    const updatedSlides = slides.filter((_, idx) => idx !== index);
    setSlides(updatedSlides);
    if (index <= currentSlideIndex) {
      setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    }
  };

  const selectSlide = (index) => {
    setCurrentSlideIndex(index);
  };

  const navigateSlide = (direction) => {
    if (direction === 'prev' && currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    } else if (direction === 'next' && currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const startPresentation = () => {
    setIsPresenting(true);
    setCurrentSlideIndex(0);
    document.documentElement.requestFullscreen().catch(err => {
      console.log(`Error attempting to enable fullscreen: ${err.message}`);
    });
  };

  const exitPresentation = () => {
    setIsPresenting(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.log(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPresenting) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          navigateSlide('next');
        } else if (e.key === 'ArrowLeft') {
          navigateSlide('prev');
        } else if (e.key === 'Escape') {
          exitPresentation();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, currentSlideIndex]);

  // Change slide background color (or gradient)
  const changeSlideBackground = (color) => {
    const updatedSlides = slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return { ...slide, background: color };
      }
      return slide;
    });
    setSlides(updatedSlides);
    setColorPickerVisible(false);
  };

  // Handle image uploads
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleCommand('insertHTML', `<img src="${event.target.result}" alt="Uploaded image" class="slide-image" />`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Insert various shapes
  const insertShape = (shape) => {
    let shapeHTML = '';
    switch (shape) {
      case 'rectangle':
        shapeHTML = '<div class="shape rectangle" contenteditable="false"></div>';
        break;
      case 'circle':
        shapeHTML = '<div class="shape circle" contenteditable="false"></div>';
        break;
      case 'triangle':
        shapeHTML = '<div class="shape triangle" contenteditable="false"></div>';
        break;
      case 'arrow':
        shapeHTML = '<div class="shape arrow" contenteditable="false">→</div>';
        break;
      case 'star':
        shapeHTML = '<div class="shape star" contenteditable="false">★</div>';
        break;
      case 'diamond':
        shapeHTML = '<div class="shape diamond" contenteditable="false"></div>';
        break;
      default:
        break;
    }
    handleCommand('insertHTML', shapeHTML);
  };

  // Advanced operations for rotation, flipping, shadow, animation, and layer adjustments
  const handleRotateLeft = () => {
    setRotation(rotation - 15);
    document.execCommand('styleWithCSS', false, true);
    handleCommand('foreColor', 'inherit'); // dummy update
  };

  const handleRotateRight = () => {
    setRotation(rotation + 15);
    document.execCommand('styleWithCSS', false, true);
    handleCommand('foreColor', 'inherit');
  };

  const handleFlipHorizontal = () => {
    handleCommand('insertHTML', '<div style="transform: scaleX(-1); display:inline-block;">Flipped</div>');
  };

  const handleAddShadow = () => {
    handleCommand('insertHTML', '<span style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Shadowed Text</span>');
  };

  const handleAnimation = (effect) => {
    setAnimation(effect);
    handleCommand('insertHTML', `<span class="animated ${effect}">Animated</span>`);
  };

  const bringForward = () => {
    alert('Bring element forward');
  };

  const sendBackward = () => {
    alert('Send element backward');
  };

  const groupElements = () => {
    alert('Group selected elements');
  };

  const ungroupElements = () => {
    alert('Ungroup selected elements');
  };

  // Media insertion: video and audio
  const insertVideo = () => {
    const url = prompt('Enter video URL:');
    if (url) {
      handleCommand('insertHTML', `<video controls class="slide-video"><source src="${url}" type="video/mp4">Your browser does not support the video tag.</video>`);
    }
  };

  const insertAudio = () => {
    const url = prompt('Enter audio URL:');
    if (url) {
      handleCommand('insertHTML', `<audio controls class="slide-audio"><source src="${url}" type="audio/mpeg">Your browser does not support the audio element.</audio>`);
    }
  };

  // Chart insertion
  const insertBarChart = () => {
    handleCommand('insertHTML', '<div class="chart bar-chart">[Bar Chart Placeholder]</div>');
  };

  const insertPieChart = () => {
    handleCommand('insertHTML', '<div class="chart pie-chart">[Pie Chart Placeholder]</div>');
  };

  // Emoji insertion
  const insertEmoji = () => {
    const emoji = prompt('Enter an emoji:');
    if (emoji) {
      handleCommand('insertHTML', emoji);
    }
  };

  // Free drawing mode functions
  const startDrawing = (e) => {
    if (!isDrawingMode) return;
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawingMode || !isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = drawingColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingMode) return;
    isDrawingRef.current = false;
    // Save drawing data as image and attach it to the slide
    const canvas = canvasRef.current;
    const drawingData = canvas.toDataURL();
    const updatedSlides = slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return { ...slide, drawingData };
      }
      return slide;
    });
    setSlides(updatedSlides);
  };

  // Save presentation as JSON
  const savePresentation = () => {
    const presentationData = {
      title: presentationTitle,
      theme: theme,
      transition: slideTransition,
      slides: slides
    };
    const jsonString = JSON.stringify(presentationData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentationTitle.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Load presentation from JSON file
  const loadPresentation = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const loadedData = JSON.parse(event.target.result);
          setPresentationTitle(loadedData.title || 'Untitled Presentation');
          setTheme(loadedData.theme || 'default');
          setSlideTransition(loadedData.transition || 'fade');
          setSlides(loadedData.slides || []);
          setCurrentSlideIndex(0);
          setHistory([loadedData.slides]);
          setHistoryIndex(0);
        } catch (error) {
          alert('Error loading presentation: Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  // Export presentation to HTML
  const exportToHTML = () => {
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en" dir="ltr">
      <head>
        <meta charset="UTF-8">
        <title>${presentationTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .slide { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
          .slide-content { width: 80%; height: 80%; padding: 20px; overflow: hidden; }
          .controls { position: fixed; bottom: 20px; right: 20px; z-index: 100; }
          .controls button { padding: 10px; margin: 5px; cursor: pointer; }
          .hidden { display: none; }
          ${getThemeCSS()}
        </style>
      </head>
      <body class="theme-${theme}">
        <div class="presentation">
    `;
    slides.forEach((slide, index) => {
      htmlContent += `
        <div id="slide-${index}" class="slide ${index === 0 ? '' : 'hidden'}" style="background-color: ${slide.background};">
          <div class="slide-content">
            ${slide.content}
            ${slide.drawingData ? `<img src="${slide.drawingData}" alt="Drawing Overlay" class="drawing-overlay" />` : ''}
          </div>
        </div>
      `;
    });
    htmlContent += `
        </div>
        <div class="controls">
          <button id="prev-btn">Previous</button>
          <button id="next-btn">Next</button>
          <span id="slide-indicator">1/${slides.length}</span>
        </div>
        <script>
          let currentSlide = 0;
          const slides = document.querySelectorAll('.slide');
          const indicator = document.getElementById('slide-indicator');
          function showSlide(index) {
            slides.forEach((slide, i) => {
              slide.classList.toggle('hidden', i !== index);
            });
            indicator.textContent = \`\${index + 1}/\${slides.length}\`;
            currentSlide = index;
          }
          document.getElementById('prev-btn').addEventListener('click', () => {
            if (currentSlide > 0) showSlide(currentSlide - 1);
          });
          document.getElementById('next-btn').addEventListener('click', () => {
            if (currentSlide < slides.length - 1) showSlide(currentSlide + 1);
          });
          document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
              if (currentSlide < slides.length - 1) showSlide(currentSlide + 1);
            } else if (e.key === 'ArrowLeft') {
              if (currentSlide > 0) showSlide(currentSlide - 1);
            }
          });
        </script>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentationTitle.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate theme-specific CSS for export
  const getThemeCSS = () => {
    switch (theme) {
      case 'dark':
        return `
          .theme-dark { background-color: #222; color: #eee; }
          .theme-dark .slide { background-color: #333; }
          .theme-dark .slide-title { color: #6bf; }
        `;
      case 'professional':
        return `
          .theme-professional { background-color: #f5f5f5; color: #333; }
          .theme-professional .slide-title { color: #2c5282; border-bottom: 2px solid #4299e1; }
          .theme-professional .slide-subtitle { color: #4a5568; }
        `;
      case 'creative':
        return `
          .theme-creative { background-color: #fffaf0; color: #702459; }
          .theme-creative .slide-title { color: #805ad5; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
          .theme-creative .slide { background: linear-gradient(135deg, #fff5f7 0%, #fffaeb 100%); }
        `;
      default:
        return `
          .theme-default { background-color: white; color: #333; }
          .theme-default .slide-title { color: #2b6cb0; }
        `;
    }
  };

  // Render presentation mode
  if (isPresenting) {
    return (
      <div className={`presentation-mode theme-${theme}`}>
        <div
          className={`presentation-slide transition-${slideTransition}`}
          style={{ backgroundColor: slides[currentSlideIndex].background }}
        >
          <div
            className="presentation-content"
            dangerouslySetInnerHTML={{ __html: slides[currentSlideIndex].content }}
          ></div>
          {slides[currentSlideIndex].drawingData && (
            <img src={slides[currentSlideIndex].drawingData} alt="Drawing Overlay" className="drawing-overlay" />
          )}
        </div>
        <div className="presentation-controls">
          <button
            onClick={() => navigateSlide('prev')}
            disabled={currentSlideIndex === 0}
            className="presentation-nav-btn"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="presentation-progress">
            {currentSlideIndex + 1} / {slides.length}
          </div>
          <button
            onClick={() => navigateSlide('next')}
            disabled={currentSlideIndex === slides.length - 1}
            className="presentation-nav-btn"
          >
            <ChevronRight size={24} />
          </button>
          <button onClick={exitPresentation} className="presentation-exit-btn">
            Exit
          </button>
        </div>
      </div>
    );
  }

  // Render editor mode
  return (
    <div className={`ppt-container theme-${theme}`}>
      <div className="ppt-header">
        <input
          type="text"
          className="presentation-title-input"
          value={presentationTitle}
          onChange={(e) => setPresentationTitle(e.target.value)}
          placeholder="Untitled Presentation"
        />
        <div className="main-toolbar">
          <button onClick={() => { handleCommand('undo'); }} title="Undo" className="toolbar-btn">
            <ArrowLeft size={16} />
          </button>
          <button onClick={() => { handleCommand('redo'); }} title="Redo" className="toolbar-btn">
            <ArrowRight size={16} />
          </button>
          <div className="toolbar-divider"></div>
          <button onClick={savePresentation} title="Save Presentation" className="toolbar-btn">
            <Save size={16} />
          </button>
          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            title="Load Presentation"
            className="toolbar-btn"
          >
            <Upload size={16} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json"
            onChange={loadPresentation}
          />
          <div className="toolbar-divider"></div>
          <button onClick={startPresentation} title="Start Presentation" className="toolbar-btn highlight">
            <Play size={16} />
          </button>
          <button onClick={exportToHTML} title="Export to HTML" className="toolbar-btn">
            <Download size={16} />
          </button>
          <div className="toolbar-divider"></div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="theme-select"
          >
            <option value="default">Default Theme</option>
            <option value="dark">Dark Theme</option>
            <option value="professional">Professional</option>
            <option value="creative">Creative</option>
          </select>
          <select
            value={slideTransition}
            onChange={(e) => setSlideTransition(e.target.value)}
            className="transition-select"
          >
            <option value="fade">Fade</option>
            <option value="slide">Slide</option>
            <option value="zoom">Zoom</option>
            <option value="flip">Flip</option>
          </select>
        </div>
      </div>
      <div className="ppt-body">
        <div className="ppt-sidebar">
          <div className="sidebar-controls">
            <button onClick={() => setLayoutMenuOpen(!layoutMenuOpen)} className="add-slide-btn">
              <PlusCircle size={16} /> Add Slide
            </button>
            {layoutMenuOpen && (
              <div className="layout-menu">
                <div className="layout-option" onClick={() => addSlide('blank')}>
                  <div className="layout-preview blank"></div>
                  <span>Blank</span>
                </div>
                <div className="layout-option" onClick={() => addSlide('title')}>
                  <div className="layout-preview title"></div>
                  <span>Title</span>
                </div>
                <div className="layout-option" onClick={() => addSlide('content')}>
                  <div className="layout-preview content"></div>
                  <span>Content</span>
                </div>
                <div className="layout-option" onClick={() => addSlide('two-column')}>
                  <div className="layout-preview two-column"></div>
                  <span>Two Column</span>
                </div>
                <div className="layout-option" onClick={() => addSlide('image-text')}>
                  <div className="layout-preview image-text"></div>
                  <span>Image & Text</span>
                </div>
              </div>
            )}
            <div className="view-controls">
              <button
                className={`view-btn ${viewMode === 'edit' ? 'active' : ''}`}
                onClick={() => setViewMode('edit')}
                title="Edit View"
              >
                <Edit3 size={16} />
              </button>
              <button
                className={`view-btn ${viewMode === 'notes' ? 'active' : ''}`}
                onClick={() => setViewMode('notes')}
                title="Notes View"
              >
                <Type size={16} />
              </button>
              <button
                className={`view-btn ${viewMode === 'outline' ? 'active' : ''}`}
                onClick={() => setViewMode('outline')}
                title="Outline View"
              >
                <Layers size={16} />
              </button>
            </div>
          </div>
          <ul className="slides-list">
            {slides.map((slide, index) => (
              <li
                key={slide.id}
                className={`slide-thumbnail ${index === currentSlideIndex ? 'active' : ''}`}
                onClick={() => selectSlide(index)}
              >
                <div className="slide-number" title={`Slide ${index + 1}`}>
                  {index + 1}
                </div>
                <div
                  className="slide-preview"
                  style={{ backgroundColor: slide.background }}
                  dangerouslySetInnerHTML={{ __html: slide.content }}
                ></div>
                <div className="thumbnail-controls">
                  <button
                    className="slide-control-btn duplicate-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectSlide(index);
                      duplicateSlide();
                    }}
                    title="Duplicate Slide"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    className="slide-control-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlide(index);
                    }}
                    title="Delete Slide"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="ppt-main">
          {viewMode === 'edit' && (
            <>
              <div className="ppt-formatting-toolbar">
                <select
                  onChange={(e) => handleCommand('formatBlock', e.target.value)}
                  className="format-select"
                >
                  <option value="">Format</option>
                  <option value="<h1>">Heading 1</option>
                  <option value="<h2>">Heading 2</option>
                  <option value="<h3>">Heading 3</option>
                  <option value="<p>">Paragraph</option>
                </select>
                <select
                  value={fontFamily}
                  onChange={(e) => {
                    setFontFamily(e.target.value);
                    handleCommand('fontName', e.target.value);
                  }}
                  className="font-select"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Tahoma">Tahoma</option>
                </select>
                <select
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(e.target.value);
                    handleCommand('fontSize', e.target.value.replace('px', ''));
                  }}
                  className="font-size-select"
                >
                  <option value="12px">12px</option>
                  <option value="14px">14px</option>
                  <option value="16px">16px</option>
                  <option value="18px">18px</option>
                  <option value="24px">24px</option>
                  <option value="32px">32px</option>
                  <option value="48px">48px</option>
                </select>
                <div className="toolbar-divider"></div>
                <button onClick={() => handleCommand('bold')} title="Bold" className="format-btn">
                  <Bold size={16} />
                </button>
                <button onClick={() => handleCommand('italic')} title="Italic" className="format-btn">
                  <Italic size={16} />
                </button>
                <button onClick={() => handleCommand('underline')} title="Underline" className="format-btn">
                  <Underline size={16} />
                </button>
                <div className="toolbar-divider"></div>
                <button onClick={() => handleCommand('justifyLeft')} title="Align Left" className="format-btn">
                  <AlignLeft size={16} />
                </button>
                <button onClick={() => handleCommand('justifyCenter')} title="Center" className="format-btn">
                  <AlignCenter size={16} />
                </button>
                <button onClick={() => handleCommand('justifyRight')} title="Align Right" className="format-btn">
                  <AlignRight size={16} />
                </button>
                <div className="toolbar-divider"></div>
                <button onClick={() => handleCommand('insertUnorderedList')} title="Bullet List" className="format-btn">
                  <List size={16} />
                </button>
                <div className="color-picker-container">
                  <button
                    onClick={() => setColorPickerVisible(!colorPickerVisible)}
                    title="Text Color"
                    className="format-btn color-btn"
                    style={{ backgroundColor: selectedColor }}
                  ></button>
                  {colorPickerVisible && (
                    <div className="color-picker">
                      <div className="color-palette">
                        {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'].map(color => (
                          <div
                            key={color}
                            className="color-option"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              setSelectedColor(color);
                              handleCommand('foreColor', color);
                              setColorPickerVisible(false);
                            }}
                          ></div>
                        ))}
                      </div>
                      <div className="background-options">
                        <h4>Slide Background</h4>
                        <div className="color-palette">
                          {['#ffffff', '#f0f0f0', '#f5f5dc', '#e6f7ff', '#f0fff0', '#fff0f5'].map(color => (
                            <div
                              key={color}
                              className="color-option"
                              style={{ backgroundColor: color }}
                              onClick={() => changeSlideBackground(color)}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="toolbar-divider"></div>
                <button onClick={() => document.getElementById('image-upload').click()} title="Insert Image" className="format-btn">
                  <Image size={16} />
                </button>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <button onClick={() => insertShape('rectangle')} title="Insert Rectangle" className="format-btn">
                  <Square size={16} />
                </button>
                <button onClick={() => insertShape('circle')} title="Insert Circle" className="format-btn">
                  <Circle size={16} />
                </button>
                <button onClick={() => insertShape('triangle')} title="Insert Triangle" className="format-btn">
                  <Scissors size={16} />
                </button>
                <button onClick={() => insertShape('arrow')} title="Insert Arrow" className="format-btn">
                  <ChevronRight size={16} />
                </button>
                <button onClick={() => insertShape('star')} title="Insert Star" className="format-btn">
                  <Star size={16} />
                </button>
                <button onClick={() => insertShape('diamond')} title="Insert Diamond" className="format-btn">
                  <Square size={16} style={{ transform: 'rotate(45deg)' }} />
                </button>
                <div className="toolbar-divider"></div>
                <button onClick={handleRotateLeft} title="Rotate Left" className="format-btn">
                  <RotateCcw size={16} />
                </button>
                <button onClick={handleRotateRight} title="Rotate Right" className="format-btn">
                  <RotateCw size={16} />
                </button>
                <button onClick={handleFlipHorizontal} title="Flip Horizontal" className="format-btn">
                  <Layers size={16} />
                </button>
                <button onClick={handleAddShadow} title="Add Text Shadow" className="format-btn">
                  <Sliders size={16} />
                </button>
                <button onClick={() => handleAnimation('bounce')} title="Bounce Animation" className="format-btn">
                  <CloudLightning size={16} />
                </button>
                <div className="toolbar-divider"></div>
                <button onClick={bringForward} title="Bring Forward" className="format-btn">
                  <ChevronRight size={16} />
                </button>
                <button onClick={sendBackward} title="Send Backward" className="format-btn">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={groupElements} title="Group Elements" className="format-btn">
                  <Layers size={16} />
                </button>
                <button onClick={ungroupElements} title="Ungroup Elements" className="format-btn">
                  <Layers size={16} />
                </button>
                <div className="toolbar-divider"></div>
                <button onClick={insertVideo} title="Insert Video" className="format-btn">
                  <Video size={16} />
                </button>
                <button onClick={insertAudio} title="Insert Audio" className="format-btn">
                  <Music size={16} />
                </button>
                <button onClick={insertBarChart} title="Insert Bar Chart" className="format-btn">
                  <BarChart2 size={16} />
                </button>
                <button onClick={insertPieChart} title="Insert Pie Chart" className="format-btn">
                  <PieChart size={16} />
                </button>
                <button onClick={insertEmoji} title="Insert Emoji" className="format-btn">
                  <CheckCircle size={16} />
                </button>
                <div className="toolbar-divider"></div>
                <button onClick={() => setIsDrawingMode(!isDrawingMode)} title="Toggle Drawing Mode" className={`format-btn ${isDrawingMode ? 'active' : ''}`}>
                  <CloudDrizzle size={16} />
                </button>
                {isDrawingMode && (
                  <input
                    type="color"
                    value={drawingColor}
                    onChange={(e) => setDrawingColor(e.target.value)}
                    title="Select Drawing Color"
                    className="color-picker-input"
                  />
                )}
              </div>
              <div className="ppt-editor-container">
                <div
                  className={`ppt-editor ${showGrid ? 'show-grid' : ''}`}
                  style={{
                    backgroundColor: slides[currentSlideIndex]?.background || '#ffffff',
                    backgroundSize: `${gridSize}px ${gridSize}px`
                  }}
                >
                  <div
                    className="slide-content-editable"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    dir="ltr"
                    ref={slideEditorRef}
                    onBlur={handleSlideContentChange}
                    onContextMenu={(e) => {
                      const selection = window.getSelection();
                      if (selection && !selection.isCollapsed) {
                        e.preventDefault();
                        setElementContextMenu({
                          visible: true,
                          x: e.pageX,
                          y: e.pageY
                        });
                        setSelectedElement(selection.toString());
                      }
                    }}
                  ></div>
                  {isDrawingMode && (
                    <canvas
                      ref={canvasRef}
                      className="drawing-canvas"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    ></canvas>
                  )}
                </div>
              </div>
            </>
          )}
          {viewMode === 'notes' && (
            <div className="notes-view">
              <div className="notes-slide-preview">
                <div
                  className="slide-mini-preview"
                  style={{ backgroundColor: slides[currentSlideIndex]?.background || '#ffffff' }}
                  dangerouslySetInnerHTML={{ __html: slides[currentSlideIndex]?.content || '' }}
                ></div>
                <div className="slide-number-badge">Slide {currentSlideIndex + 1}</div>
              </div>
              <div className="notes-editor-container">
                <h3>Speaker Notes</h3>
                <div
                  className="notes-editor"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  dir="ltr"
                  ref={notesEditorRef}
                  onBlur={handleNotesChange}
                  dangerouslySetInnerHTML={{ __html: slideNotes }}
                ></div>
              </div>
            </div>
          )}
          {viewMode === 'outline' && (
            <div className="outline-view">
              <h3>Presentation Outline</h3>
              <ul className="outline-list">
                {slides.map((slide, index) => {
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = slide.content;
                  const heading = tempDiv.querySelector('h1, h2, h3, h4, h5, h6');
                  const outlineText = heading
                    ? heading.textContent
                    : tempDiv.textContent.substring(0, 50) + (tempDiv.textContent.length > 50 ? '...' : '');
                  return (
                    <li
                      key={slide.id}
                      className={`outline-item ${index === currentSlideIndex ? 'active' : ''}`}
                      onClick={() => selectSlide(index)}
                    >
                      <span className="outline-number">{index + 1}.</span>
                      <span className="outline-text">{outlineText || 'Untitled Slide'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
      {elementContextMenu.visible && (
        <div
          className="context-menu-backdrop"
          onClick={() => setElementContextMenu({ visible: false, x: 0, y: 0 })}
        ></div>
      )}
    </div>
  );
};

export default PPT;
