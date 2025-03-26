import React, { useState, useRef, useEffect } from 'react';
import './Word.css';

const Word = () => {
  // ==================== Document State Management ====================
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Document1.docx',
      content: '',
      cursor: { line: 1, column: 1 }
    }
  ]);
  const [activeDocumentId, setActiveDocumentId] = useState(1);

  // ==================== Formatting & Styling State ====================
  const [formatting, setFormatting] = useState({
    fontFamily: 'Calibri',
    fontSize: 11,
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textColor: '#000000',
    backgroundColor: '#FFFFFF',
    alignment: 'left',
    lineSpacing: 1.15,
    paragraphSpacing: 0,
    subscript: false,
    superscript: false,
    highlight: false
  });

  // ==================== Page Layout State ====================
  const [pageLayout, setPageLayout] = useState({
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 1, bottom: 1, left: 1, right: 1 },
    pageBorder: false,
    watermark: ''
  });

  // ==================== Advanced Features & Extra Operations ====================
  const [advancedFeatures, setAdvancedFeatures] = useState({
    spellCheck: true,
    autoSave: true,
    autoCorrect: true,
    trackChanges: false,
    versionHistory: [],
    zoom: 100,
    undoStack: [],
    redoStack: [],
    comments: [],
    findReplaceModalOpen: false,
    findText: '',
    replaceText: '',
    insertedTables: [],
    insertedImages: [],
    insertedHyperlinks: [],
    insertedEquations: [],
    insertedShapes: [],
    insertedCharts: [],
    clipboardHistory: [],
    darkMode: false,
    fullScreen: false,
    macroRecording: false,
    customStyles: [],
    cloudSync: false,
    responsive: true,
    gridLines: false,
    tableOfContents: false,
    revisionHistory: [],
    footnotes: [],
    endnotes: []
  });

  // ==================== Theming & Ribbons ====================
  const themes = ['light', 'dark-blue', 'dark'];
  const [currentTheme, setCurrentTheme] = useState('light');
  // Current Ribbon Tab: home, insert, pageLayout, references, review, view, tools
  const [activeRibbonTab, setActiveRibbonTab] = useState('home');

  // ==================== Refs ====================
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const loadDocInputRef = useRef(null);

  // ==================== Lifecycle Effects ====================
  useEffect(() => {
    const activeDoc = documents.find(doc => doc.id === activeDocumentId);
    if (editorRef.current && activeDoc) {
      editorRef.current.innerHTML = activeDoc.content;
    }
  }, [activeDocumentId, documents]);

  useEffect(() => {
    if (advancedFeatures.autoSave) {
      const interval = setInterval(() => {
        console.log('Auto-saving document...');
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [advancedFeatures.autoSave, documents, activeDocumentId]);

  // ==================== Document Handling ====================
  const createNewDocument = () => {
    const newId = documents.length + 1;
    const newDoc = {
      id: newId,
      name: `Document${newId}.docx`,
      content: '',
      cursor: { line: 1, column: 1 }
    };
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocumentId(newId);
  };

  const selectDocument = (docId) => setActiveDocumentId(docId);

  // ==================== Editor Content Change ====================
  const handleContentChange = (e) => {
    const content = e.target.innerHTML;
    setAdvancedFeatures(prev => ({
      ...prev,
      undoStack: [...prev.undoStack, documents.find(doc => doc.id === activeDocumentId)?.content || ''],
      redoStack: []
    }));
    setDocuments(prev =>
      prev.map(doc => (doc.id === activeDocumentId ? { ...doc, content } : doc))
    );
  };

  // ==================== Formatting Methods ====================
  const applyFormatting = (type, value) => {
    switch (type) {
      case 'fontFamily':
        document.execCommand('fontName', false, value);
        setFormatting(prev => ({ ...prev, fontFamily: value }));
        break;
      case 'fontSize':
        document.execCommand('fontSize', false, value);
        setFormatting(prev => ({ ...prev, fontSize: value }));
        break;
      case 'bold':
        document.execCommand('bold', false, null);
        setFormatting(prev => ({ ...prev, bold: !prev.bold }));
        break;
      case 'italic':
        document.execCommand('italic', false, null);
        setFormatting(prev => ({ ...prev, italic: !prev.italic }));
        break;
      case 'underline':
        document.execCommand('underline', false, null);
        setFormatting(prev => ({ ...prev, underline: !prev.underline }));
        break;
      case 'strikethrough':
        document.execCommand('strikethrough', false, null);
        setFormatting(prev => ({ ...prev, strikethrough: !prev.strikethrough }));
        break;
      case 'textColor':
        document.execCommand('foreColor', false, value);
        setFormatting(prev => ({ ...prev, textColor: value }));
        break;
      case 'backgroundColor':
        document.execCommand('hiliteColor', false, value);
        setFormatting(prev => ({ ...prev, backgroundColor: value }));
        break;
      case 'alignment':
        document.execCommand(`justify${value.charAt(0).toUpperCase() + value.slice(1)}`, false, null);
        setFormatting(prev => ({ ...prev, alignment: value }));
        break;
      case 'subscript':
        document.execCommand('subscript', false, null);
        setFormatting(prev => ({ ...prev, subscript: !prev.subscript }));
        break;
      case 'superscript':
        document.execCommand('superscript', false, null);
        setFormatting(prev => ({ ...prev, superscript: !prev.superscript }));
        break;
      case 'highlight':
        document.execCommand('backColor', false, '#FFFF00');
        setFormatting(prev => ({ ...prev, highlight: !prev.highlight }));
        break;
      default:
        console.log('Unknown formatting command');
    }
  };

  // ==================== Page Layout ====================
  const updatePageLayout = (type, value) => {
    switch (type) {
      case 'pageSize':
        setPageLayout(prev => ({ ...prev, pageSize: value }));
        break;
      case 'orientation':
        setPageLayout(prev => ({ ...prev, orientation: value }));
        break;
      case 'margins':
        setPageLayout(prev => ({ ...prev, margins: { ...prev.margins, ...value } }));
        break;
      case 'pageBorder':
        setPageLayout(prev => ({ ...prev, pageBorder: value }));
        break;
      case 'watermark':
        setPageLayout(prev => ({ ...prev, watermark: value }));
        break;
      default:
        console.log('Unknown page layout command');
    }
  };

  // ==================== Export / Print / Sync ====================
  const exportDocument = (format = 'docx') => {
    const activeDoc = documents.find(doc => doc.id === activeDocumentId);
    let blob;
    if (format === 'html') {
      blob = new Blob([activeDoc.content], { type: 'text/html' });
    } else if (format === 'pdf') {
      blob = new Blob([activeDoc.content], { type: 'application/pdf' });
    } else {
      blob = new Blob([activeDoc.content], { type: 'application/msword' });
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = activeDoc.name;
    link.click();
  };

  const printDocument = () => {
    window.print();
  };

  const syncToCloud = () => {
    console.log('Syncing document to cloud...');
    setAdvancedFeatures(prev => ({ ...prev, cloudSync: true }));
  };

  // ==================== Undo / Redo ====================
  const undo = () => {
    setAdvancedFeatures(prev => {
      if (prev.undoStack.length) {
        const lastState = prev.undoStack[prev.undoStack.length - 1];
        const newUndo = prev.undoStack.slice(0, -1);
        setDocuments(docs =>
          docs.map(doc => (doc.id === activeDocumentId ? { ...doc, content: lastState } : doc))
        );
        if (editorRef.current) editorRef.current.innerHTML = lastState;
        return {
          ...prev,
          undoStack: newUndo,
          redoStack: [...prev.redoStack, documents.find(doc => doc.id === activeDocumentId)?.content || '']
        };
      }
      return prev;
    });
  };
  const redo = () => {
    setAdvancedFeatures(prev => {
      if (prev.redoStack.length) {
        const lastRedo = prev.redoStack[prev.redoStack.length - 1];
        const newRedo = prev.redoStack.slice(0, -1);
        setDocuments(docs =>
          docs.map(doc => (doc.id === activeDocumentId ? { ...doc, content: lastRedo } : doc))
        );
        if (editorRef.current) editorRef.current.innerHTML = lastRedo;
        return {
          ...prev,
          redoStack: newRedo,
          undoStack: [...prev.undoStack, documents.find(doc => doc.id === activeDocumentId)?.content || '']
        };
      }
      return prev;
    });
  };

  // ==================== Find & Replace ====================
  const openFindReplaceModal = () => setAdvancedFeatures(prev => ({ ...prev, findReplaceModalOpen: true }));
  const closeFindReplaceModal = () => setAdvancedFeatures(prev => ({ ...prev, findReplaceModalOpen: false, findText: '', replaceText: '' }));
  const handleFindReplace = () => {
    const activeDoc = documents.find(doc => doc.id === activeDocumentId);
    const regex = new RegExp(advancedFeatures.findText, 'g');
    const newContent = activeDoc.content.replace(regex, advancedFeatures.replaceText);
    setDocuments(prev => prev.map(doc => (doc.id === activeDocumentId ? { ...doc, content: newContent } : doc)));
    if (editorRef.current) editorRef.current.innerHTML = newContent;
    closeFindReplaceModal();
  };

  // ==================== Zoom ====================
  const zoomIn = () => setAdvancedFeatures(prev => ({ ...prev, zoom: prev.zoom + 10 }));
  const zoomOut = () => setAdvancedFeatures(prev => ({ ...prev, zoom: Math.max(prev.zoom - 10, 50) }));
  const zoomToFit = () => setAdvancedFeatures(prev => ({ ...prev, zoom: 100 }));

  // ==================== Insert Operations ====================
  // Insert Table
  const insertTable = () => {
    const rows = prompt('Enter number of rows:');
    const cols = prompt('Enter number of columns:');
    if (rows && cols) {
      let tableHTML = '<table border="1" style="border-collapse:collapse;">';
      for (let r = 0; r < rows; r++) {
        tableHTML += '<tr>';
        for (let c = 0; c < cols; c++) {
          tableHTML += '<td style="padding:5px;">Cell</td>';
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</table>';
      document.execCommand('insertHTML', false, tableHTML);
      setAdvancedFeatures(prev => ({ ...prev, insertedTables: [...prev.insertedTables, tableHTML] }));
    }
  };

  // Insert Image from URL
  const insertImage = () => {
    const imageUrl = prompt('Enter Image URL:');
    if (imageUrl) {
      const imgHTML = `<img src="${imageUrl}" alt="Inserted Image" style="max-width:100%;">`;
      document.execCommand('insertHTML', false, imgHTML);
      setAdvancedFeatures(prev => ({ ...prev, insertedImages: [...prev.insertedImages, imageUrl] }));
    }
  };

  // Insert Image from PC
  const insertImageFromPC = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const imgHTML = `<img src="${ev.target.result}" alt="Local Image" style="max-width:100%;">`;
        document.execCommand('insertHTML', false, imgHTML);
        setAdvancedFeatures(prev => ({ ...prev, insertedImages: [...prev.insertedImages, ev.target.result] }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Insert Hyperlink
  const insertHyperlink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const linkText = prompt('Enter display text:') || url;
      const linkHTML = `<a href="${url}" target="_blank">${linkText}</a>`;
      document.execCommand('insertHTML', false, linkHTML);
      setAdvancedFeatures(prev => ({ ...prev, insertedHyperlinks: [...prev.insertedHyperlinks, { url, text: linkText }] }));
    }
  };

  // Insert Equation
  const insertEquation = () => {
    const equation = prompt('Enter LaTeX equation:');
    if (equation) {
      const eqHTML = `<span class="equation">${equation}</span>`;
      document.execCommand('insertHTML', false, eqHTML);
      setAdvancedFeatures(prev => ({ ...prev, insertedEquations: [...prev, equation] }));
    }
  };

  // Insert Special Character
  const insertSpecialCharacter = (char) => {
    document.execCommand('insertText', false, char);
  };

  // Insert Chart
  const insertChart = () => {
    const chartHTML = `<canvas class="chart-canvas" width="300" height="200"></canvas>`;
    document.execCommand('insertHTML', false, chartHTML);
    setAdvancedFeatures(prev => ({ ...prev, insertedCharts: [...prev.insertedCharts, 'chart'] }));
    setTimeout(() => {
      const canvases = editorRef.current.querySelectorAll('.chart-canvas');
      const canvas = canvases[canvases.length - 1];
      if (canvas) {
        const ctx = canvas.getContext('2d');
        // Some random multi-chart
        ctx.fillStyle = '#0d47a1';
        ctx.fillRect(30, 50, 40, 100);
        ctx.strokeStyle = '#1565c0';
        ctx.beginPath();
        ctx.moveTo(90, 150);
        ctx.lineTo(120, 100);
        ctx.lineTo(150, 120);
        ctx.stroke();
        ctx.fillStyle = '#1976d2';
        ctx.beginPath();
        ctx.moveTo(210, 100);
        ctx.arc(210, 100, 30, 0, Math.PI / 2);
        ctx.closePath();
        ctx.fill();
      }
    }, 100);
  };

  // Insert Code Block
  const insertCodeBlock = () => {
    const code = prompt('Enter your code:');
    if (code) {
      const codeHTML = `<pre class="code-block">${code}</pre>`;
      document.execCommand('insertHTML', false, codeHTML);
    }
  };

  // Insert Video
  const insertVideo = () => {
    const videoUrl = prompt('Enter video URL (mp4):');
    if (videoUrl) {
      const videoHTML = `<video controls style="max-width:100%;"><source src="${videoUrl}" type="video/mp4">Your browser does not support the video tag.</video>`;
      document.execCommand('insertHTML', false, videoHTML);
    }
  };

  // Insert Audio
  const insertAudio = () => {
    const audioUrl = prompt('Enter audio URL (mp3):');
    if (audioUrl) {
      const audioHTML = `<audio controls style="max-width:100%;"><source src="${audioUrl}" type="audio/mpeg">Your browser does not support the audio element.</audio>`;
      document.execCommand('insertHTML', false, audioHTML);
    }
  };

  // Insert Ordered/Unordered List, HR, Blockquote
  const insertOrderedList = () => document.execCommand('insertOrderedList', false, null);
  const insertUnorderedList = () => document.execCommand('insertUnorderedList', false, null);
  const insertHorizontalRule = () => document.execCommand('insertHorizontalRule', false, null);
  const insertBlockquote = () => document.execCommand('formatBlock', false, 'blockquote');

  // Clear Formatting
  const clearFormatting = () => document.execCommand('removeFormat', false, null);

  // Copy/Paste
  const copyToClipboard = () => {
    const text = editorRef.current.innerText;
    navigator.clipboard.writeText(text).then(() => alert('Copied!'));
  };
  const pasteContent = async () => {
    const text = await navigator.clipboard.readText();
    document.execCommand('insertText', false, text);
  };

  // Insert Date/Time, Page Break
  const insertDateTime = () => {
    const now = new Date().toLocaleString();
    document.execCommand('insertText', false, now);
  };
  const insertPageBreak = () => {
    document.execCommand('insertHTML', false, `<div style="page-break-after: always;"></div>`);
  };

  // Load Document from PC (text file)
  const loadDocument = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target.result;
        setDocuments(prev =>
          prev.map(doc => (doc.id === activeDocumentId ? { ...doc, content } : doc))
        );
        if (editorRef.current) editorRef.current.innerText = content;
      };
      reader.readAsText(file);
    }
  };

  // BG Image & Theme
  const setEditorBackgroundImage = () => {
    const bgUrl = prompt('Enter background image URL:');
    if (bgUrl && editorRef.current) {
      editorRef.current.style.backgroundImage = `url(${bgUrl})`;
      editorRef.current.style.backgroundSize = 'cover';
    }
  };
  const switchTheme = () => {
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setCurrentTheme(nextTheme);
  };

  // Export as Markdown
  const exportMarkdown = () => {
    const markdown = editorRef.current.innerText;
    const blob = new Blob([markdown], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'document.md';
    link.click();
  };

  // Reset Editor
  const resetEditor = () => {
    setDocuments(prev =>
      prev.map(doc => (doc.id === activeDocumentId ? { ...doc, content: '' } : doc))
    );
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      editorRef.current.style.backgroundImage = '';
    }
    setFormatting({
      fontFamily: 'Calibri',
      fontSize: 11,
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      textColor: '#000000',
      backgroundColor: '#FFFFFF',
      alignment: 'left',
      lineSpacing: 1.15,
      paragraphSpacing: 0,
      subscript: false,
      superscript: false,
      highlight: false
    });
  };

  // Highlight All Occurrences
  const highlightAll = () => {
    const word = prompt('Enter word to highlight:');
    if (word && editorRef.current) {
      const regex = new RegExp(`(${word})`, 'gi');
      const newHTML = editorRef.current.innerHTML.replace(regex, `<span class="highlight">$1</span>`);
      editorRef.current.innerHTML = newHTML;
    }
  };

  // Insert Emoji
  const insertEmoji = () => {
    const emojis = ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊'];
    const choice = prompt(`Choose an emoji:\n${emojis.join(' ')}`);
    if (choice && emojis.includes(choice)) {
      document.execCommand('insertText', false, choice);
    }
  };

  // ==================== New Extra Features (Footnotes, Endnotes, Index, etc.) ====================
  // Insert Footnote (dummy)
  const insertFootnote = () => {
    const footnoteText = prompt('Enter footnote text:');
    if (footnoteText && editorRef.current) {
      const footnoteHTML = `<sup class="footnote">[F]</sup><span class="footnote-content" style="display:none;">${footnoteText}</span>`;
      document.execCommand('insertHTML', false, footnoteHTML);
      setAdvancedFeatures(prev => ({
        ...prev,
        footnotes: [...prev.footnotes, footnoteText]
      }));
    }
  };

  // Insert Endnote (dummy)
  const insertEndnote = () => {
    const endnoteText = prompt('Enter endnote text:');
    if (endnoteText && editorRef.current) {
      const endnoteHTML = `<sup class="endnote">[E]</sup><span class="endnote-content" style="display:none;">${endnoteText}</span>`;
      document.execCommand('insertHTML', false, endnoteHTML);
      setAdvancedFeatures(prev => ({
        ...prev,
        endnotes: [...prev.endnotes, endnoteText]
      }));
    }
  };

  // Insert Shape (dummy)
  const insertShape = () => {
    const shapeHTML = `<div class="shape" style="width:100px; height:100px; background-color:#f66; display:inline-block; margin:5px;"></div>`;
    document.execCommand('insertHTML', false, shapeHTML);
    setAdvancedFeatures(prev => ({ ...prev, insertedShapes: [...prev.insertedShapes, shapeHTML] }));
  };

  // Insert Signature Line (dummy)
  const insertSignatureLine = () => {
    const name = prompt('Enter name for signature line:');
    if (name) {
      const sigHTML = `<div class="signature-line" style="margin:10px 0; border-top:1px solid #000; width:200px;">${name}</div>`;
      document.execCommand('insertHTML', false, sigHTML);
    }
  };

  // Insert Index (dummy)
  const insertIndex = () => {
    const indexHTML = `<div class="index" contenteditable="false"><strong>Index</strong><br/><em>Auto-generated Index</em></div>`;
    document.execCommand('insertHTML', false, indexHTML);
  };

  // Spell Check (dummy)
  const runSpellCheck = () => {
    alert('Spell check complete (dummy). No errors found!');
  };

  // Grammar Check (dummy)
  const runGrammarCheck = () => {
    alert('Grammar check complete (dummy). No issues found!');
  };

  // Thesaurus (dummy)
  const openThesaurus = () => {
    alert('Thesaurus (dummy): synonyms feature coming soon!');
  };

  // Merge Documents (dummy)
  const mergeDocuments = () => {
    alert('Merging documents (dummy) – feature in progress!');
  };

  // Show Undo/Redo History
  const showUndoRedoHistory = () => {
    console.log('Undo Stack:', advancedFeatures.undoStack);
    console.log('Redo Stack:', advancedFeatures.redoStack);
  };

  // ==================== Custom Style Save/Apply ====================
  const saveCustomStyle = () => {
    const styleName = prompt('Enter a name for the custom style:');
    if (styleName) {
      const newStyle = { name: styleName, formatting: { ...formatting } };
      setAdvancedFeatures(prev => ({ ...prev, customStyles: [...prev.customStyles, newStyle] }));
    }
  };
  const applyCustomStyle = (style) => {
    setFormatting(style.formatting);
  };

  // ==================== Render UI ====================
  return (
    <div className={`word-processor theme-${currentTheme} ${advancedFeatures.darkMode ? 'dark-mode' : ''} ${advancedFeatures.fullScreen ? 'full-screen' : ''}`}>
      {/* ============== Top Menu Bar ============== */}
      <div className="menu-bar">
        <button onClick={createNewDocument}>New</button>
        <button onClick={() => exportDocument('docx')}>Save</button>
        <button onClick={() => exportDocument('pdf')}>Export PDF</button>
        <button onClick={exportMarkdown}>Export MD</button>
        <button onClick={printDocument}>Print</button>
        <button onClick={syncToCloud}>Cloud Sync</button>
        <button onClick={() => setAdvancedFeatures(prev => ({ ...prev, darkMode: !prev.darkMode }))}>
          {advancedFeatures.darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={() => setAdvancedFeatures(prev => ({ ...prev, fullScreen: !prev.fullScreen }))}>
          {advancedFeatures.fullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        <button onClick={switchTheme}>Switch Theme</button>
      </div>

      {/* ============== Document Tabs ============== */}
      <div className="document-tabs">
        {documents.map(doc => (
          <button 
            key={doc.id} 
            onClick={() => selectDocument(doc.id)} 
            className={activeDocumentId === doc.id ? 'active' : ''}
          >
            {doc.name}
          </button>
        ))}
        <button onClick={createNewDocument}>+</button>
      </div>

      {/* ============== Ribbon Tabs (Home, Insert, Page Layout, References, Review, View, Tools) ============== */}
      <div className="ribbon-tabs">
        {[
          { label: 'Home', key: 'home' },
          { label: 'Insert', key: 'insert' },
          { label: 'Page Layout', key: 'pageLayout' },
          { label: 'References', key: 'references' },
          { label: 'Review', key: 'review' },
          { label: 'View', key: 'view' },
          { label: 'Tools', key: 'tools' }
        ].map(tab => (
          <button
            key={tab.key}
            className={activeRibbonTab === tab.key ? 'active' : ''}
            onClick={() => setActiveRibbonTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============== Ribbon Content ============== */}
      <div className="ribbon-content">
        {/* ---------- HOME TAB ---------- */}
        {activeRibbonTab === 'home' && (
          <div className="toolbar">
            {/* Basic Edit */}
            <button onClick={undo}>↩ Undo</button>
            <button onClick={redo}>↪ Redo</button>
            <button onClick={openFindReplaceModal}>🔎 Find/Replace</button>
            <button onClick={() => setAdvancedFeatures(prev => ({ ...prev, macroRecording: !prev.macroRecording }))}>
              {advancedFeatures.macroRecording ? 'Stop Macro' : 'Record Macro'}
            </button>
            <button onClick={showUndoRedoHistory}>History</button>

            {/* Formatting Options */}
            <select value={formatting.fontFamily} onChange={(e) => applyFormatting('fontFamily', e.target.value)}>
              {['Calibri','Arial','Times New Roman','Courier New','Verdana','Tahoma','Georgia','Palatino','Garamond','Comic Sans MS','Impact','Lucida Sans','Roboto','Open Sans','Lato'].map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
            <select value={formatting.fontSize} onChange={(e) => applyFormatting('fontSize', e.target.value)}>
              {[8,9,10,11,12,14,16,18,20,22,24,26,28,36,48,72].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <button onClick={() => applyFormatting('bold')}>B</button>
            <button onClick={() => applyFormatting('italic')}>I</button>
            <button onClick={() => applyFormatting('underline')}>U</button>
            <button onClick={() => applyFormatting('strikethrough')}>S</button>
            <button onClick={() => applyFormatting('subscript')}>X<sub>2</sub></button>
            <button onClick={() => applyFormatting('superscript')}>X<sup>2</sup></button>
            <button onClick={() => applyFormatting('highlight')}>Highlight</button>
            <input 
              type="color" 
              value={formatting.textColor} 
              onChange={(e) => applyFormatting('textColor', e.target.value)} 
            />
            <input 
              type="color" 
              value={formatting.backgroundColor} 
              onChange={(e) => applyFormatting('backgroundColor', e.target.value)} 
            />
            <button onClick={() => applyFormatting('alignment', 'left')}>←</button>
            <button onClick={() => applyFormatting('alignment', 'center')}>↔</button>
            <button onClick={() => applyFormatting('alignment', 'right')}>→</button>
            <button onClick={() => applyFormatting('alignment', 'justify')}>=</button>
            <button onClick={clearFormatting}>Clear Format</button>
            <button onClick={saveCustomStyle}>Save Style</button>
          </div>
        )}

        {/* ---------- INSERT TAB ---------- */}
        {activeRibbonTab === 'insert' && (
          <div className="toolbar">
            <button onClick={insertTable}>📋 Table</button>
            <button onClick={insertImage}>🖼 Image (URL)</button>
            <button onClick={() => fileInputRef.current && fileInputRef.current.click()}>🖼 Image (PC)</button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={insertImageFromPC} 
            />
            <button onClick={insertHyperlink}>🔗 Link</button>
            <button onClick={insertEquation}>∑ Equation</button>
            <button onClick={() => insertSpecialCharacter('®')}>® Char</button>
            <button onClick={insertChart}>📊 Chart</button>
            <button onClick={insertCodeBlock}>👨‍💻 Code</button>
            <button onClick={insertVideo}>📹 Video</button>
            <button onClick={insertAudio}>🔊 Audio</button>
            <button onClick={insertOrderedList}>1. List</button>
            <button onClick={insertUnorderedList}>• List</button>
            <button onClick={insertHorizontalRule}>— HR</button>
            <button onClick={insertBlockquote}>❝ Quote</button>
            <button onClick={insertDateTime}>📅 Date/Time</button>
            <button onClick={insertPageBreak}>↲ Page Break</button>
            <button onClick={() => loadDocInputRef.current && loadDocInputRef.current.click()}>📂 Load Doc</button>
            <input 
              type="file" 
              ref={loadDocInputRef} 
              style={{ display: 'none' }} 
              accept="text/plain" 
              onChange={loadDocument} 
            />
            <button onClick={insertShape}>⬜ Shape</button>
            <button onClick={insertSignatureLine}>✒ Signature</button>
          </div>
        )}

        {/* ---------- PAGE LAYOUT TAB ---------- */}
        {activeRibbonTab === 'pageLayout' && (
          <div className="toolbar">
            <select 
              value={pageLayout.pageSize} 
              onChange={(e) => updatePageLayout('pageSize', e.target.value)}
            >
              <option>A4</option>
              <option>Letter</option>
              <option>Legal</option>
            </select>
            <select 
              value={pageLayout.orientation} 
              onChange={(e) => updatePageLayout('orientation', e.target.value)}
            >
              <option>Portrait</option>
              <option>Landscape</option>
            </select>
            <button onClick={() => updatePageLayout('pageBorder', !pageLayout.pageBorder)}>
              {pageLayout.pageBorder ? 'Remove Border' : 'Add Border'}
            </button>
            <button onClick={setEditorBackgroundImage}>🌄 BG Image</button>
            <button onClick={() => {
              const watermarkText = prompt('Enter watermark text:');
              if (watermarkText) updatePageLayout('watermark', watermarkText);
            }}>💧 Watermark</button>
          </div>
        )}

        {/* ---------- REFERENCES TAB ---------- */}
        {activeRibbonTab === 'references' && (
          <div className="toolbar">
            <button onClick={() => {
              const tocHTML = `<div class="toc" contenteditable="false"><strong>Table of Contents</strong><br><em>Auto-generated TOC</em></div>`;
              document.execCommand('insertHTML', false, tocHTML);
              setAdvancedFeatures(prev => ({ ...prev, tableOfContents: true }));
            }}>📑 TOC</button>
            <button onClick={insertIndex}>📚 Index</button>
            <button onClick={insertFootnote}>Footnote</button>
            <button onClick={insertEndnote}>Endnote</button>
            {/* Additional references features could go here */}
          </div>
        )}

        {/* ---------- REVIEW TAB ---------- */}
        {activeRibbonTab === 'review' && (
          <div className="toolbar">
            <button onClick={openFindReplaceModal}>🔎 Find/Replace</button>
            <button onClick={() => setAdvancedFeatures(prev => ({ ...prev, trackChanges: !prev.trackChanges }))}>
              {advancedFeatures.trackChanges ? 'Stop Tracking' : 'Track Changes'}
            </button>
            <button onClick={() => alert('Comments feature coming soon!')}>💬 Comments</button>
            <button onClick={runSpellCheck}>📝 Spell Check</button>
            <button onClick={runGrammarCheck}>🔤 Grammar Check</button>
            <button onClick={openThesaurus}>📖 Thesaurus</button>
          </div>
        )}

        {/* ---------- VIEW TAB ---------- */}
        {activeRibbonTab === 'view' && (
          <div className="toolbar">
            <button onClick={zoomIn}>🔍+</button>
            <button onClick={zoomOut}>🔍-</button>
            <button onClick={zoomToFit}>Zoom 100%</button>
            <button onClick={() => setAdvancedFeatures(prev => ({ ...prev, gridLines: !prev.gridLines }))}>
              {advancedFeatures.gridLines ? 'Hide Grid' : 'Show Grid'}
            </button>
            <button onClick={() => setAdvancedFeatures(prev => ({ ...prev, responsive: !prev.responsive }))}>
              {advancedFeatures.responsive ? 'Disable Responsive' : 'Enable Responsive'}
            </button>
          </div>
        )}

        {/* ---------- TOOLS TAB ---------- */}
        {activeRibbonTab === 'tools' && (
          <div className="toolbar">
            <button onClick={() => alert('Revision History feature coming soon!')}>⏳ Revision History</button>
            <button onClick={() => setAdvancedFeatures(prev => ({ ...prev, macroRecording: !prev.macroRecording }))}>
              {advancedFeatures.macroRecording ? 'Stop Macro' : 'Record Macro'}
            </button>
            <button onClick={() => alert('Track changes must be enabled first!')}>Compare Docs</button>
            <button onClick={mergeDocuments}>Merge Docs</button>
            <button onClick={resetEditor}>🗑 Reset Editor</button>
            <button onClick={highlightAll}>🖍 Highlight All</button>
            <button onClick={insertEmoji}>😃 Emoji</button>
            <button onClick={copyToClipboard}>📋 Copy</button>
            <button onClick={pasteContent}>📥 Paste</button>
          </div>
        )}
      </div>

      {/* ============== Document Editor ============== */}
      <div
        ref={editorRef}
        contentEditable={true}
        className={`document-editor ${advancedFeatures.gridLines ? 'grid-lines' : ''}`}
        onInput={handleContentChange}
        style={{
          fontFamily: formatting.fontFamily,
          fontSize: `${formatting.fontSize}pt`,
          lineHeight: formatting.lineSpacing,
          textAlign: formatting.alignment,
          zoom: `${advancedFeatures.zoom}%`,
          direction: 'ltr'
        }}
      />

      {/* ============== Status Bar ============== */}
      <div className="status-bar">
        {/* Example: Word Count, Char Count, and Line Count */}
        <span>Words: {
          documents.find(doc => doc.id === activeDocumentId)?.content
            .replace(/<[^>]+>/g, '')
            .trim()
            .split(/\s+/)
            .filter(word => word).length || 0
        }</span>
        <span>Chars: {
          documents.find(doc => doc.id === activeDocumentId)?.content
            .replace(/<[^>]+>/g, '')
            .length || 0
        }</span>
        <span>Lines: {
          (documents.find(doc => doc.id === activeDocumentId)?.content
            .replace(/<[^>]+>/g, '')
            .split(/\n/).length) || 1
        }</span>
        <span>Zoom: {advancedFeatures.zoom}%</span>
      </div>

      {/* ============== Find and Replace Modal ============== */}
      {advancedFeatures.findReplaceModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Find and Replace</h3>
            <input
              type="text"
              placeholder="Find..."
              value={advancedFeatures.findText}
              onChange={(e) => setAdvancedFeatures(prev => ({ ...prev, findText: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Replace with..."
              value={advancedFeatures.replaceText}
              onChange={(e) => setAdvancedFeatures(prev => ({ ...prev, replaceText: e.target.value }))}
            />
            <button onClick={handleFindReplace}>Replace</button>
            <button onClick={closeFindReplaceModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Word;
