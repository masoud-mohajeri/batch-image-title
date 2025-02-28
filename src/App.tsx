import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [names, setNames] = useState([]);
  const [selection, setSelection] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [processedImages, setProcessedImages] = useState([]);
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Vazir');
  
  const canvasRef = useRef<any>(null);
  const imageRef = useRef<any>(null);
  
  // Handle image upload
  const handleImageUpload = (e:any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          drawImageAndSelection();
        };
        // @ts-ignore
        img.src = event.target.result;
        // @ts-ignore
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle names input
  const handleNamesInput = (e:any) => {
    const namesList = e.target.value.split('\n').filter((name:any) => name.trim() !== '');
    setNames(namesList);
  };
  
  // Canvas mouse events for selection
  const handleMouseDown = (e:any) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPos({ x, y });
    setSelection({ x, y, width: 0, height: 0 });
    setIsSelecting(true);
  };
  
  const handleMouseMove = (e:any) => {
    if (!isSelecting) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const width = x - startPos.x;
    const height = y - startPos.y;
    
    setSelection({
      x: width > 0 ? startPos.x : x,
      y: height > 0 ? startPos.y : y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
    
    drawImageAndSelection();
  };
  
  const handleMouseUp = () => {
    setIsSelecting(false);
  };
  
  // Draw function for canvas
  const drawImageAndSelection = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match image
    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;
    
    // Draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);
    
    // Draw selection rectangle
    if (selection.width > 0 && selection.height > 0) {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
    }
  };
  
  // Process images with names
  const processImages = () => {
    if (!image || names.length === 0 || selection.width === 0 || selection.height === 0) {
      alert('Please upload an image, enter names, and select an area in the image.');
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = imageRef.current?.width;
    canvas.height = imageRef.current?.height;
    const ctx = canvas.getContext('2d')!;
    
    const processed = names.map(name => {
      // Draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0);
      
      // Add name text
      ctx.fillStyle = textColor;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const textX = selection.x + selection.width / 2;
      const textY = selection.y + selection.height / 2;
      
      ctx.fillText(name, textX, textY);
      
      return {
        name,
        dataUrl: canvas.toDataURL('image/png')
      };
    });
    
    //@ts-ignore
    setProcessedImages(processed);
  };
  
  // Download a processed image
  //@ts-ignore
  const downloadImage = (dataUrl, fileName) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Download all processed images
  const downloadAllImages = () => {
    processedImages.forEach((img:any) => {
      downloadImage(img.dataUrl, img.name);
    });
  };
  
  // Update canvas when image or selection changes
  useEffect(() => {
    drawImageAndSelection();
  }, [image, selection]);
  
  return (
    <div className="app">
      <h1>Image Name Batch Processor</h1>
      <h1>تست فونت</h1>
      
      <div className="control-panel">
        <div className="section">
          <h2>1. Upload Image</h2>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
        
        <div className="section">
          <h2>2. Enter Names (one per line)</h2>
          <textarea 
            rows={10} 
            placeholder="Enter names here, one per line" 
            onChange={handleNamesInput}
          ></textarea>
        </div>
        
        <div className="section">
          <h2>3. Text Settings</h2>
          <div className="settings">
            <label>
              Color:
              <input type="color" value={textColor} onChange={(e:any) => setTextColor(e.target.value)} />
            </label>
            <label>
              Font Size:
              <input 
                type="number" 
                value={fontSize} 
                min="8" 
                max="72" 
                onChange={(e:any) => setFontSize(parseInt(e.target.value))} 
              />
            </label>
            <label>
              Font:
              <select value={fontFamily} onChange={(e:any) => setFontFamily(e.target.value)}>
                <option value="Vazir">وزیر</option>
                <option value="Samim">صمیم</option>
                <option value="Shabnam">شبنم</option>
                <option value="Sahel">ساحل</option>
                <option value="Parastoo">پرستو</option> 
                <option value="Gandom">گندم</option>
                <option value="Tanha">تنها</option>
                <option value="Behdad">بهداد</option>
                <option value="Nika">نیکا</option>
                <option value="GanjNamehSans">گنجنامه</option>
                <option value="Shahab">شهاب</option>
                <option value="AzarMehr">آذرمهر</option>
                <option value="Mikhak">میخک</option>
                <option value="Estedad">استعداد</option>
              </select>
            </label>
          </div>
        </div>
        
        <div className="section">
          <h2>4. Draw rectangle where names should appear</h2>
          <button onClick={processImages} className="process-btn">Process Images</button>
        </div>
      </div>
      
      <div className="canvas-container">
        {image ? (
          <canvas 
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        ) : (
          <div className="placeholder">Upload an image to get started</div>
        )}
      </div>
      
      {processedImages.length > 0 && (
        <div className="results-panel">
          <h2>Processed Images</h2>
          <button onClick={downloadAllImages} className="download-all-btn">
            Download All Images
          </button>
          
          <div className="image-grid">
            {processedImages.map((img:any, index) => (
              <div key={index} className="processed-image">
                <img src={img.dataUrl} alt={img.name} />
                <div className="image-name">{img.name}</div>
                <button onClick={() => downloadImage(img.dataUrl, img.name)}>
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;