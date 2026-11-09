const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const config = require('./config/config');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler.middleware');

// Route imports
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const conversationRoutes = require('./routes/conversation.routes');
const billingRoutes = require('./routes/billing.routes');
const tenantRoutes = require('./routes/tenant.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const webhookRoutes = require('./routes/webhook.routes');

// Initialize database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [config.CLIENT_URL, 'http://localhost:3000', 'https://dental-a.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.set('socketio', io);

// Socket.io real-time connection handler
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('join:practice', (practiceId) => {
    if (practiceId) {
      socket.join(`practice_${practiceId}`);
      console.log(`[Socket.io] Socket ${socket.id} joined room practice_${practiceId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Middleware configuration
app.use(helmet({
  crossOriginResourcePolicy: false
}));

const allowedOrigins = [
  config.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://dentagent-ai.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for API consumers & webhooks
    }
  },
  credentials: true
}));

app.use(cookieParser());

// Webhooks need urlencoded parser before generic json
app.use('/api/webhooks', webhookRoutes);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'DentAgent AI Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/analytics', analyticsRoutes);

// Central error handler
app.use(errorHandler);

// Start server
const PORT = config.PORT;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` DentAgent AI Server running in ${config.NODE_ENV} mode on port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

module.exports = { app, server };
