require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const winston = require('winston');
const memeRoutes = require('./routes/meme.routes');
const path = require('path');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();

// Configure logger
const loggerWinston = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  loggerWinston.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Redis client setup
let redisClient = null;
if (process.env.USE_REDIS === 'true') {
  const Redis = require('redis');
  try {
    redisClient = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retry_strategy: function(options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          loggerWinston.warn('Redis connection refused - continuing without Redis');
          return null; // Stop retrying
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          loggerWinston.warn('Redis retry time exhausted - continuing without Redis');
          return null; // Stop retrying after 1 hour
        }
        if (options.attempt > 3) {
          loggerWinston.warn('Redis max retries reached - continuing without Redis');
          return null; // Stop retrying after 3 attempts
        }
        return Math.min(options.attempt * 100, 3000); // Retry with exponential backoff
      }
    });

    redisClient.on('error', (err) => {
      loggerWinston.warn('Redis error:', err.message);
      redisClient = null;
    });

    redisClient.connect().catch(err => {
      loggerWinston.warn('Redis connection failed:', err.message);
      redisClient = null;
    });
  } catch (error) {
    loggerWinston.warn('Redis initialization failed:', error.message);
    redisClient = null;
  }
} else {
  loggerWinston.info('Redis is disabled - running without caching');
}

// Make redisClient available globally
global.redisClient = redisClient;

// MongoDB connection
if (process.env.USE_MONGODB === 'true') {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => loggerWinston.info('Connected to MongoDB'))
    .catch((err) => {
      loggerWinston.warn('MongoDB connection failed:', err.message);
      loggerWinston.info('Running without database - results will not be persisted');
    });
} else {
  loggerWinston.info('MongoDB is disabled - running without database');
}

// Routes
app.use('/api/memes', memeRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  loggerWinston.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  loggerWinston.info(`Server is running on port ${PORT}`);
}); 