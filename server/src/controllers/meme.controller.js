const path = require('path');
const fs = require('fs');
const sonarService = require('../services/sonar.service');
const logger = require('../utils/logger');

const memeController = {
  async searchMeme(req, res) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const memeInfo = await sonarService.searchMeme(query);
      res.json(memeInfo);
    } catch (error) {
      logger.error('Error in searchMeme:', error);
      res.status(500).json({ error: error.message || 'Failed to search meme' });
    }
  },

  async uploadMeme(req, res) {
    try {
      const { query } = req.body;
      const memeFile = req.file;

      if (!query && !memeFile) {
        return res.status(400).json({ error: 'Either an image file or a search query is required' });
      }

      let searchQuery = query;
      let imageUrl = null;
      let imageBase64 = null;

      if (memeFile) {
        imageUrl = `/uploads/${memeFile.filename}`;
        // Read the image file and convert to base64
        const imageBuffer = fs.readFileSync(memeFile.path);
        imageBase64 = imageBuffer.toString('base64');
        
        // If no query provided, use the filename as a descriptive query
        if (!searchQuery) {
          searchQuery = `Analyze this meme image: ${memeFile.originalname}`;
        }
      }

      logger.info('Processing meme request:', { hasImage: !!memeFile, query: searchQuery });

      // Get meme information from Sonar service
      const memeInfo = await sonarService.searchMeme(searchQuery, imageBase64);
      logger.info('Received meme info from Sonar service:', memeInfo);

      // Add the image URL to the result if an image was uploaded
      if (imageUrl) {
        memeInfo.imageUrl = imageUrl;
      }

      // Send the complete response
      res.json({
        name: searchQuery,
        description: memeInfo.description,
        firstAppearance: memeInfo.firstAppearance,
        characteristics: memeInfo.characteristics,
        variations: memeInfo.variations,
        timeline: memeInfo.timeline,
        culturalImpact: memeInfo.culturalImpact,
        relatedMemes: memeInfo.relatedMemes,
        imageUrl: memeInfo.imageUrl
      });

    } catch (error) {
      logger.error('Error in uploadMeme:', error);
      res.status(500).json({ error: error.message || 'Failed to process meme' });
    }
  },

  async getMemeDetails(req, res) {
    try {
      const { id } = req.params;
      // Implement meme details retrieval logic
      res.json({ message: 'Meme details endpoint' });
    } catch (error) {
      logger.error('Error in getMemeDetails:', error);
      res.status(500).json({ error: error.message || 'Failed to get meme details' });
    }
  }
};

module.exports = memeController; 