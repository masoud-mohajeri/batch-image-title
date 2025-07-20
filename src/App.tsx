import { useState, useRef, useEffect } from 'react';
import './assets/fonts/style/_fonts.css'

function App() {
  const [image, setImage] = useState<any>(null);
  const [names, setNames] = useState<any[]>([]);
  const [selection, setSelection] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [processedImages, setProcessedImages] = useState([]);
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Vazir');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [originalImageType, setOriginalImageType] = useState('image/png');
  const [originalImageQuality, setOriginalImageQuality] = useState(0.9);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasContainer = useRef<HTMLDivElement>(null);

  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store original image type and quality settings
      setOriginalImageType(file.type);
      setOriginalImageQuality(file.type === 'image/jpeg' ? 0.9 : 1.0);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          drawImageAndSelection();
        };
        img.src = event.target?.result as string;
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle names input
  const handleNamesInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const namesList = e.target.value
      .split('\n')
      .filter((name: string) => name.trim() !== '')
      .map((n: string) => 
        n.split(' ')
         .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
         .join(' ')
      );
    setNames(namesList);
  };

  // Function to convert viewport coordinates to image coordinates
  function viewportToImageCoordinates(
    viewportX: number, 
    viewportY: number, 
    canvas: HTMLCanvasElement, 
    image: HTMLImageElement
  ) {
    // Get the displayed dimensions of the image in the canvas
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    // Get the actual dimensions of the image
    const imageWidth = image.width;
    const imageHeight = image.height;
    
    // Calculate the scale factors
    const scaleX = imageWidth / displayWidth;
    const scaleY = imageHeight / displayHeight;
    
    // Convert the coordinates
    const imageX = viewportX * scaleX;
    const imageY = viewportY * scaleY;
    
    return { x: imageX, y: imageY };
  }

  // Function to convert image coordinates to viewport coordinates
  // function imageToViewportCoordinates(
  //   imageX: number, 
  //   imageY: number, 
  //   canvas: HTMLCanvasElement, 
  //   image: HTMLImageElement
  // ) {
  //   // Get the displayed dimensions of the image in the canvas
  //   const displayWidth = canvas.clientWidth;
  //   const displayHeight = canvas.clientHeight;
    
  //   // Get the actual dimensions of the image
  //   const imageWidth = image.width;
  //   const imageHeight = image.height;
    
  //   // Calculate the scale factors
  //   const scaleX = displayWidth / imageWidth;
  //   const scaleY = displayHeight / imageHeight;
    
  //   // Convert the coordinates
  //   const viewportX = imageX * scaleX;
  //   const viewportY = imageY * scaleY;
    
  //   return { x: viewportX, y: viewportY };
  // }

  // Updated mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    
    const rect = canvas.getBoundingClientRect();
    
    // Get viewport coordinates
    const viewportX = e.clientX - rect.left;
    const viewportY = e.clientY - rect.top;
    
    // Convert to image coordinates
    const imageCoords = viewportToImageCoordinates(viewportX, viewportY, canvas, imageRef.current);
    
    setStartPos(imageCoords);
    setSelection({ x: imageCoords.x, y: imageCoords.y, width: 0, height: 0 });
    setIsSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get viewport coordinates
    const viewportX = e.clientX - rect.left;
    const viewportY = e.clientY - rect.top;
    
    // Convert to image coordinates
    const imageCoords = viewportToImageCoordinates(viewportX, viewportY, canvas, imageRef.current);
    
    const width = imageCoords.x - startPos.x;
    const height = imageCoords.y - startPos.y;
    
    setSelection({
      x: width > 0 ? startPos.x : imageCoords.x,
      y: height > 0 ? startPos.y : imageCoords.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
    
    drawImageAndSelection();
  };

  // Updated drawImageAndSelection function
  const drawImageAndSelection = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match image
    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;
    
    // Adjust canvas display size if needed, maintaining aspect ratio
    const maxDisplayWidth = canvasContainer.current?.clientWidth || 800;
    const aspectRatio = imageRef.current.width / imageRef.current.height;
    
    if (canvas.width > maxDisplayWidth) {
      canvas.style.width = `${maxDisplayWidth}px`;
      canvas.style.height = `${maxDisplayWidth / aspectRatio}px`;
    } else {
      canvas.style.width = `${canvas.width}px`;
      canvas.style.height = `${canvas.height}px`;
    }
    
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
  
  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  // Touch events for mobile devices
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling while selecting
    if (e.touches.length !== 1 || !canvasRef.current || !imageRef.current) return; // Only handle single touch
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get viewport coordinates from the touch
    const viewportX = e.touches[0].clientX - rect.left;
    const viewportY = e.touches[0].clientY - rect.top;
    
    // Convert to image coordinates
    const imageCoords = viewportToImageCoordinates(viewportX, viewportY, canvas, imageRef.current);
    
    setStartPos(imageCoords);
    setSelection({ x: imageCoords.x, y: imageCoords.y, width: 0, height: 0 });
    setIsSelecting(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling while selecting
    if (!isSelecting || e.touches.length !== 1 || !canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get viewport coordinates from the touch
    const viewportX = e.touches[0].clientX - rect.left;
    const viewportY = e.touches[0].clientY - rect.top;
    
    // Convert to image coordinates
    const imageCoords = viewportToImageCoordinates(viewportX, viewportY, canvas, imageRef.current);
    
    const width = imageCoords.x - startPos.x;
    const height = imageCoords.y - startPos.y;
    
    setSelection({
      x: width > 0 ? startPos.x : imageCoords.x,
      y: height > 0 ? startPos.y : imageCoords.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
    
    drawImageAndSelection();
  };
  
  const handleTouchEnd = () => {
    setIsSelecting(false);
  };

  // Helper function to process a single image
  const processImage = (name: string, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    return new Promise<{name: string, dataUrl: string}>((resolve) => {
      // Draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current!, 0, 0);
      
      // Add name text
      ctx.fillStyle = textColor;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const textX = selection.x + selection.width / 2;
      const textY = selection.y + selection.height / 2;
      
      ctx.fillText(name, textX, textY);
      
      // Use original image format and quality
      const outputType = originalImageType === 'image/jpeg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(outputType, originalImageQuality);
      
      resolve({
        name,
        dataUrl
      });
    });
  };

  // Process images with names - now queued to do one image at a time
  const processImages = async () => {
    if (!image || names.length === 0 || selection.width === 0 || selection.height === 0) {
      alert('Please upload an image, enter names, and select an area in the image.');
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = imageRef.current?.width || 0;
    canvas.height = imageRef.current?.height || 0;
    const ctx = canvas.getContext('2d')!;
    
    const processed = [];
    
    // Process images one at a time to avoid overwhelming the browser
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const processedImage = await processImage(name, canvas, ctx);
      processed.push(processedImage);
      console.log('ProcessedCount',i + 1)
    }
    // @ts-ignore
    setProcessedImages(processed);
  };
  
  // Download a processed image with proper file extension
  const downloadImage = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    
    // Use proper file extension based on original image type
    const extension = originalImageType === 'image/jpeg' ? 'jpg' : 'png';
    link.download = `${fileName}.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Download all processed images
  const downloadAllImages = async () => {
    setIsDownloading(true);
    setDownloadedCount(0);
    
    for (let i = 0; i < processedImages.length; i++) {
      const img = processedImages[i];
      // @ts-ignore
      downloadImage(img.dataUrl, img.name);
      setDownloadedCount(i + 1);
      
      // Add delay between downloads to avoid overwhelming the browser
      if (i < processedImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setIsDownloading(false);
  };
  
  // Update canvas when image or selection changes
  useEffect(() => {
    drawImageAndSelection();
  }, [image, selection]);
  
  return (
    <div className="app">
      <h2 style={{fontFamily:"SweetFlower"}}>SweetFlower</h2>
      <h2 style={{fontFamily:"BerkshireSwash"}}>BerkshireSwash</h2>
      <h2 style={{fontFamily:"Raleway"}}>Raleway</h2>

      
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
              <input 
                type="color" 
                value={textColor} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTextColor(e.target.value)} 
              />
            </label>
            <label>
              Font Size:
              <input 
                type="number" 
                value={fontSize} 
                min="8" 
                max="72" 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFontSize(parseInt(e.target.value))} 
              />
            </label>
            <label>
              Font:
              <select 
                value={fontFamily} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFontFamily(e.target.value)}
              >
                <option value="Vazir">وزیر</option>
                <option value="OpenSans">OpenSans</option>
                <option value="BerkshireSwash">BerkshireSwash</option>
                <option value="Raleway">Raleway</option>
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
          <button 
            onClick={processImages} 
            className="process-btn"
          >
            Process Images
          </button>
        </div>
      </div>
      
      <div className="canvas-container" ref={canvasContainer}>
        {image ? (
          <canvas 
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          />
        ) : (
          <div className="placeholder">Upload an image to get started</div>
        )}
      </div>
      
      {processedImages.length > 0 && (
        <div className="results-panel">
          <h2>Processed Images</h2>
          <button onClick={downloadAllImages} className="download-all-btn" disabled={isDownloading}>
            {isDownloading ? `Downloaded ${downloadedCount}/${processedImages.length}` : 'Download All Images'}
          </button>
          
          <div className="image-grid">
            {processedImages.map((img: {name: string, dataUrl: string}, index) => (
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