const axios = require('axios');
const logger = require('../utils/logger');

class SonarService {
  constructor() {
    this.apiKey = process.env.SONAR_API_KEY;
    this.apiUrl = 'https://api.perplexity.ai/chat/completions';
  }

  async searchMeme(query, imageBase64 = null) {
    try {
      logger.info('Sending request to Perplexity API:', { query, hasImage: !!imageBase64 });
      
      let messages = [
        {
          role: 'system',
          content: 'You are a meme expert. Provide detailed information about memes in a structured format.'
        }
      ];

      if (imageBase64) {
        // If we have an image, include it in the message content
        messages.push({
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this meme image and provide information in this exact format:

## Meme Description
- What the meme shows
- Its meaning and context

## First Appearance
- When it first appeared
- Where it originated
- Who created it

## Characteristics
- Visual elements
- Common themes
- Typical usage

## Variations
- Alternative names
- Popular remixes
- Notable adaptations

## Evolution Timeline
1. Origin and First Appearance
2. Key Viral Moments
3. Evolution of Meaning
4. Notable Variations
5. Current Status

## Cultural Impact
- Symbolism and Meaning
- Influence on Internet Culture
- Real-world Impact
- Community Reception
- Media Usage

## Related Memes
1. Similar Style or Format
2. Related Meaning or Context
3. Common Usage Patterns
4. Shared Cultural References
5. Popular Remixes or Variations`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        });
      } else {
        // If we only have text, use the regular format
        messages.push({
          role: 'user',
          content: `Analyze the following meme: ${query}. Provide information in this exact format:

## Meme Description
- What the meme shows
- Its meaning and context

## First Appearance
- When it first appeared
- Where it originated
- Who created it

## Characteristics
- Visual elements
- Common themes
- Typical usage

## Variations
- Alternative names
- Popular remixes
- Notable adaptations

## Evolution Timeline
1. Origin and First Appearance
2. Key Viral Moments
3. Evolution of Meaning
4. Notable Variations
5. Current Status

## Cultural Impact
- Symbolism and Meaning
- Influence on Internet Culture
- Real-world Impact
- Community Reception
- Media Usage

## Related Memes
1. Similar Style or Format
2. Related Meaning or Context
3. Common Usage Patterns
4. Shared Cultural References
5. Popular Remixes or Variations`
        });
      }

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'sonar-pro',
          messages: messages,
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      logger.info('Response data:', response.data);
      const responseContent = response.data.choices[0].message.content;
      logger.info('Raw content from API:', responseContent);

      return this.parseContentIntoSections(responseContent);
    } catch (error) {
      logger.error('Error in searchMeme:', error);
      throw new Error('Failed to analyze meme');
    }
  }

  parseContentIntoSections(content) {
    try {
      logger.info('Starting content parsing');
      
      // Split content into main sections
      const sections = content.split(/##\s+/).filter(Boolean);
      logger.info('Found main sections:', sections.length);

      const result = {
        description: '',
        firstAppearance: '',
        characteristics: '',
        variations: '',
        timeline: { rawContent: '' },
        culturalImpact: { rawContent: '' },
        relatedMemes: { rawContent: '' }
      };

      sections.forEach(section => {
        const [title, ...content] = section.split('\n');
        const sectionContent = content.join('\n').trim();

        switch (title.trim()) {
          case 'Meme Description':
            result.description = this.extractBulletPoints(sectionContent);
            break;
          case 'First Appearance':
            result.firstAppearance = this.extractBulletPoints(sectionContent);
            break;
          case 'Characteristics':
            result.characteristics = this.extractBulletPoints(sectionContent);
            break;
          case 'Variations':
            result.variations = this.extractBulletPoints(sectionContent);
            break;
          case 'Evolution Timeline':
            result.timeline.rawContent = sectionContent;
            break;
          case 'Cultural Impact':
            result.culturalImpact.rawContent = sectionContent;
            break;
          case 'Related Memes':
            result.relatedMemes.rawContent = sectionContent;
            break;
        }
      });

      logger.info('Finished parsing content');
      return result;
    } catch (error) {
      logger.error('Error parsing content:', error);
      throw new Error('Failed to parse meme information');
    }
  }

  extractBulletPoints(content) {
    return content
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.trim().substring(1).trim())
      .join('\n');
  }
}

module.exports = new SonarService(); 