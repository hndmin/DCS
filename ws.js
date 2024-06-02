const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const { Server } = require('socket.io');
const ss = require('socket.io-stream');
const fs = require('fs');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');

  ss(socket).on('video-request', (stream, data) => {
    const videoPath = join(__dirname, 'vid', `vid${data.videoId}.webm`);
    const videoStream = fs.createReadStream(videoPath);
    videoStream.pipe(stream);
  });

  socket.on('video watched', (data) => {
    const videoId = data.videoId;
    const timestamp = new Date().toISOString();

    const logEntry = `Video ID ${videoId} watched at ${timestamp}\n`;
    fs.appendFile('watch_log.txt', logEntry, (err) => {
      if (err) {
        console.error('Failed to write to log', err);
      }
    });

    console.log(`Video ID ${videoId} watched`);
  });
});

server.listen(9100, () => {
  console.log('server running at http://localhost:9100');
});
