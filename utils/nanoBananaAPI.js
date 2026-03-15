import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDRuyRAs2JOJJYOp-oo5nZKRfKCXOZ5gbk';

/**
 * Generate coloring book line art images using Nano Banana Pro with Gemini.
 * 
 * Images are generated as 16:9 aspect ratio.
 * Returns array of image URIs.
 * 
 * @param {string} prompt - Description of what to generate
 * @param {number} count - Number of images to generate (default 10)
 * @param {function} onProgress - Callback for progress updates: (currentIndex, totalCount, imageData)
 * @returns {Promise<string[]>} Array of image URIs (base64 data URLs)
 */
export async function generateImage(prompt, count = 10, onProgress = null) {
  const images = [];

  for (let i = 0; i < count; i++) {
    let imageData = null;
    
    try {

      // Use Gemini 2.0 Flash with image generation
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Generate a black and white line art coloring page for children. 
Subject: ${prompt}. 
Page ${i + 1} of ${count}.
Aspect ratio: 16:9 (landscape).
Style: Clean line art suitable for coloring books, high contrast, detailed but not overly complex, no colors, just black lines on white background.
Format: The image should be a single cohesive coloring page design, not divided into sections.`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000, // Longer timeout for image generation
        }
      );

      const candidate = response.data?.candidates?.[0];
      if (candidate?.content?.parts) {
        let imageFound = false;
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const { mimeType, data } = part.inlineData;
            imageData = `data:${mimeType};base64,${data}`;
            images.push(imageData);
            imageFound = true;
            break;
          }
        }
        
        // If no inline image, use placeholder
        if (!imageFound) {
          imageData = generatePlaceholderSVG(i + 1, prompt, '16:9');
          images.push(imageData);
        }
      } else {
        imageData = generatePlaceholderSVG(i + 1, prompt, '16:9');
        images.push(imageData);
      }
    } catch (error) {
      console.warn(`Image generation failed for page ${i + 1}:`, error.message);
      imageData = generatePlaceholderSVG(i + 1, prompt, '16:9');
      images.push(imageData);
    }

    // Notify progress with actual image data
    if (onProgress) {
      onProgress(i, count, imageData);
    }

    // Small delay between requests to avoid rate limiting
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return images;
}

/**
 * Generate color variant overlays for a base image.
 * Returns an array of palette objects: { name, colors, baseImage }
 */
export async function generateColorVariants(baseImageUri, pageIndex) {
  const palettes = [
    { name: 'Default', colors: ['#FF6B9D', '#FFD700', '#00CED1', '#32CD32', '#FF8C00', '#8B00FF'] },
    { name: 'Pastel', colors: ['#FFB3BA', '#FFCCCB', '#FFFFBA', '#BAE1FF', '#BAC2FF', '#E0BBE4'] },
    { name: 'Vibrant', colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#FF1493'] },
    { name: 'Ocean', colors: ['#001F3F', '#0074D9', '#007EFF', '#B6E3FF', '#004E89', '#4DA6D6'] },
    { name: 'Sunset', colors: ['#FF6B35', '#F7931E', '#FDB833', '#F37335', '#FF4500', '#EE964B'] },
    { name: 'Forest', colors: ['#134E5E', '#1B998B', '#2ECC71', '#27AE60', '#117A65', '#52B788'] },
  ];

  return palettes.map((palette) => ({
    ...palette,
    baseImage: baseImageUri,
  }));
}

/**
 * Generate a pixelated version of an image for loading animation.
 * This creates a placeholder SVG with the text overlaid on a gradient.
 */
export function generatePixelatedPlaceholder(imageIndex, totalImages) {
  // Create a simple gradient placeholder with pixel effect
  const pixelSize = 16;
  const colors = ['#e74c3c', '#e67e22', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
  const bgColor = colors[imageIndex % colors.length];
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='576' height='324' viewBox='0 0 576 324'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23${bgColor.slice(1)};stop-opacity:0.3' /%3E%3Cstop offset='100%25' style='stop-color:%23${bgColor.slice(1)};stop-opacity:0.8' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='576' height='324' fill='%23f5f5f5'/%3E%3Crect width='576' height='324' fill='url(%23grad)' opacity='0.5'/%3E%3Ctext x='288' y='140' font-size='32' font-weight='bold' text-anchor='middle' fill='%23333'%3EGenerating Page ${imageIndex}...%3C/text%3E%3Ctext x='288' y='180' font-size='16' text-anchor='middle' fill='%23666'%3E${imageIndex} of ${totalImages}%3C/text%3E%3C/svg%3E`;
}

/**
 * Generate a placeholder SVG for when API fails.
 * @param {number} pageNum - Page number
 * @param {string} prompt - Original prompt
 * @param {string} aspectRatio - Aspect ratio (e.g., '16:9')
 */
function generatePlaceholderSVG(pageNum, prompt, aspectRatio = '16:9') {
  const label = encodeURIComponent(prompt ? prompt.substring(0, 30) : 'Coloring Page');
  
  // 16:9 dimensions
  const width = 576;
  const height = 324;
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect fill='%23fff' width='${width}' height='${height}'/%3E%3Crect x='20' y='20' width='${width - 40}' height='${height - 40}' rx='10' fill='none' stroke='%23ccc' stroke-width='2' stroke-dasharray='8,4'/%3E%3Ccircle cx='${width / 2}' cy='${height / 2 - 40}' r='50' fill='none' stroke='%23ddd' stroke-width='2'/%3E%3Cpath d='M${width / 2 - 40} ${height / 2 + 20} Q${width / 2} ${height / 2 + 60} ${width / 2 + 40} ${height / 2 + 20}' fill='none' stroke='%23ddd' stroke-width='2'/%3E%3Ctext x='${width / 2}' y='${height - 60}' font-size='20' text-anchor='middle' font-family='sans-serif' fill='%23999'%3EColoring Page ${pageNum}%3C/text%3E%3Ctext x='${width / 2}' y='${height - 30}' font-size='12' text-anchor='middle' font-family='sans-serif' fill='%23ccc'%3E${label}%3C/text%3E%3C/svg%3E`;
}

export async function regenerateImage(prompt, modifications) {
  const modifiedPrompt = `${prompt}. Additional modifications: ${modifications}`;
  const results = await generateImage(modifiedPrompt, 1);
  return results[0];
}
