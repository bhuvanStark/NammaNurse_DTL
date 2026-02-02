// Vercel serverless function entry point
// This file is required for Vercel to properly handle the Express app

const app = require('../server/server');

// Export the Express app as a serverless function
module.exports = app;
