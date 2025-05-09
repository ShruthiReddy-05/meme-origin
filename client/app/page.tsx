'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Upload, Image as ImageIcon, Clock, Globe, Link2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const MemeInfo = ({ memeInfo }: { memeInfo: any }) => {
  if (!memeInfo) return null;

  const formatText = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const renderBulletPoints = (content: string) => {
    if (!content) return <p className="text-gray-500">Information not available</p>;
    return content.split('\n').map((point, index) => (
      <p key={index} className="mb-2 text-black" dangerouslySetInnerHTML={{ __html: `• ${formatText(point)}` }} />
    ));
  };

  const renderTimeline = (timeline: any) => {
    if (!timeline?.rawContent) return <p className="text-gray-500">Timeline information not available</p>;
    return (
      <div className="space-y-4">
        {timeline.rawContent.split('\n').map((line: string, index: number) => (
          <p key={index} className="mb-2 text-black" dangerouslySetInnerHTML={{ __html: formatText(line) }} />
        ))}
      </div>
    );
  };

  const renderCulturalImpact = (impact: any) => {
    if (!impact?.rawContent) return <p className="text-gray-500">Cultural impact information not available</p>;
    return (
      <div className="space-y-4">
        {impact.rawContent.split('\n').map((line: string, index: number) => (
          <p key={index} className="mb-2 text-black" dangerouslySetInnerHTML={{ __html: formatText(line) }} />
        ))}
      </div>
    );
  };

  const renderRelatedMemes = (memes: any) => {
    if (!memes?.rawContent) return <p className="text-gray-500">Related memes information not available</p>;
    return (
      <div className="space-y-4">
        {memes.rawContent.split('\n').map((line: string, index: number) => (
          <p key={index} className="mb-2 text-black" dangerouslySetInnerHTML={{ __html: formatText(line) }} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">Meme Description</h2>
        {renderBulletPoints(memeInfo.description)}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">First Appearance</h2>
        {renderBulletPoints(memeInfo.firstAppearance)}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">Characteristics</h2>
        {renderBulletPoints(memeInfo.characteristics)}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">Variations</h2>
        {renderBulletPoints(memeInfo.variations)}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">Evolution Timeline</h2>
        {renderTimeline(memeInfo.timeline)}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">Cultural Impact</h2>
        {renderCulturalImpact(memeInfo.culturalImpact)}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">Related Memes</h2>
        {renderRelatedMemes(memeInfo.relatedMemes)}
      </div>
    </div>
  );
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      if (selectedImage) {
        formData.append('meme', selectedImage);
      }
      if (query) {
        formData.append('query', query);
      }

      if (!selectedImage && !query) {
        setError('Please provide either a meme name or upload an image');
        setLoading(false);
        return;
      }

      console.log('Sending request to:', `${API_URL}/api/memes/upload`);
      const response = await fetch(`${API_URL}/api/memes/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze meme');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Meme Origin Explorer</h1>
          <p className="text-gray-400">Discover the origins and cultural impact of internet memes</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter meme name..."
                className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-3 text-gray-400" />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer bg-gray-800 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                <Upload className="text-gray-400" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="relative w-16 h-16">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (!query && !selectedImage)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Explore Meme'}
          </button>
        </motion.form>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500"
          >
            {error}
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-8"
          >
            {result.imageUrl && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4 text-black">Uploaded Image</h2>
                <img
                  src={`${API_URL}${result.imageUrl}`}
                  alt="Uploaded meme"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
            <MemeInfo memeInfo={result} />
          </motion.div>
        )}
      </div>
    </main>
  );
}
