const mongoose = require('mongoose');

const memeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  originDate: {
    type: Date,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  features: {
    edges: {
      edgeCount: Number,
      edgeDensity: Number
    },
    colors: {
      averageHue: Number,
      averageSaturation: Number,
      averageValue: Number
    }
  },
  citations: [{
    source: String,
    url: String,
    date: Date
  }],
  tags: [{
    type: String,
    trim: true
  }],
  nsfw: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
memeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better query performance
memeSchema.index({ name: 'text', description: 'text' });
memeSchema.index({ tags: 1 });
memeSchema.index({ originDate: 1 });

const Meme = mongoose.model('Meme', memeSchema);

module.exports = Meme; 