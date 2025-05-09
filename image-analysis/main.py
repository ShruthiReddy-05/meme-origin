from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import numpy as np
import cv2
from typing import Dict, Any

app = FastAPI(title="Meme Image Analysis Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check() -> Dict[str, str]:
    return {"status": "healthy"}

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Analyze an uploaded meme image for similarity and features
    """
    try:
        # Read and validate image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to numpy array for OpenCV processing
        img_array = np.array(image)
        
        # Basic image analysis (placeholder for actual analysis)
        analysis_result = {
            "width": image.width,
            "height": image.height,
            "format": image.format,
            "mode": image.mode,
            "features": {
                "edges": detect_edges(img_array),
                "colors": analyze_colors(img_array),
            }
        }
        
        return analysis_result
    except Exception as e:
        return {"error": str(e)}

def detect_edges(img_array: np.ndarray) -> Dict[str, Any]:
    """Detect edges in the image using Canny edge detection"""
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    return {
        "edge_count": np.count_nonzero(edges),
        "edge_density": np.count_nonzero(edges) / (edges.shape[0] * edges.shape[1])
    }

def analyze_colors(img_array: np.ndarray) -> Dict[str, Any]:
    """Analyze the color distribution in the image"""
    # Convert to HSV for better color analysis
    hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
    
    # Calculate average color
    avg_color = np.mean(hsv, axis=(0, 1))
    
    return {
        "average_hue": float(avg_color[0]),
        "average_saturation": float(avg_color[1]),
        "average_value": float(avg_color[2])
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 