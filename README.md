# Meme Origin Explorer

A web application that helps users discover the origins and evolution of internet memes. Built with Next.js, Express, and the Perplexity API.

## Features

- 🔍 Search for memes by name or description
- 📸 Upload and analyze meme images
- 📊 View detailed meme information including:
  - Meme description and context
  - First appearance and origin
  - Characteristics and common themes
  - Variations and adaptations
  - Evolution timeline
  - Cultural impact
  - Related memes
- 🎨 Modern, responsive UI
- 🔄 Real-time search results
- 📱 Mobile-friendly design

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Express.js, Node.js
- **API**: Perplexity AI API (sonar-pro model)
- **Containerization**: Docker
- **Environment**: Node.js 20.x

## Prerequisites

- Node.js 20.x or higher
- Docker and Docker Compose (for containerized deployment)
- Perplexity API key

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
PORT=3001
SONAR_API_KEY=your_perplexity_api_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/meme-origin.git
cd meme-origin
```

2. Install dependencies:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:
```bash
# In the server directory
cp .env.example .env
# Edit .env with your Perplexity API key
```

## Running the Application

### Development Mode

1. Start the client:
```bash
cd client
npm run dev
```

2. Start the server:
```bash
cd server
npm run dev
```

### Using Docker

```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Image Analysis

The application supports analyzing meme images using the Perplexity API's image analysis feature:

- Supported image formats: PNG, JPEG, WEBP, GIF
- Maximum image size: 5MB
- Images are converted to base64 format for API processing
- Results include the same detailed analysis as text searches

## API Endpoints

### Meme Search
- `GET /api/memes/search?q={query}`
  - Search for memes by text query
  - Returns detailed meme information

### Image Analysis
- `POST /api/memes/analyze-image`
  - Upload and analyze a meme image
  - Accepts multipart/form-data with image file
  - Returns detailed meme analysis

## Response Format

The API returns meme information in the following structure:

```json
{
  "description": "Meme description and context",
  "firstAppearance": "Origin and first appearance details",
  "characteristics": "Visual elements and common themes",
  "variations": "Alternative names and adaptations",
  "timeline": {
    "rawContent": "Evolution timeline"
  },
  "culturalImpact": {
    "rawContent": "Cultural impact analysis"
  },
  "relatedMemes": {
    "rawContent": "Related memes and connections"
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Perplexity AI for providing the API
- Next.js team for the amazing framework
- All contributors and users of the application
