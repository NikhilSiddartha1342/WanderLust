// Local development server
const app = require('./api/index.js');

const PORT = process.env.PORT || 8080;

// For local development, we need to handle the serverless function differently
const server = require('http').createServer(async (req, res) => {
  try {
    await app(req, res);
  } catch (error) {
    console.error('Server error:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT}`);
});

module.exports = server;