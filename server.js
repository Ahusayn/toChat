const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

const connectedUsers = {}; // { username: [ws1, ws2, ...] }

wss.on('connection', (ws) => {
  let username = null;

  ws.on('message', (message) => {
    try {
      const msgData = JSON.parse(message);

      if (msgData.sender && !msgData.message) {
        username = msgData.sender;
        if (!connectedUsers[username]) connectedUsers[username] = [];
        connectedUsers[username].push(ws);
        console.log(`${username} registered`);
        return;
      }

      if (msgData.sender && msgData.receiver && msgData.message) {
        const [sender, receiver] = msgData.receiver.split('__');

        // Send to sender’s tabs
        const senderSockets = connectedUsers[sender] || [];
        senderSockets.forEach(sock => {
          if (sock.readyState === WebSocket.OPEN) {
            sock.send(JSON.stringify(msgData));
          }
        });

        // Bot chat (HSYN, C3DF)
        if (receiver === 'HSYN' || receiver === 'C3DF') return;

        // Send to receiver’s tabs
        const receiverSockets = connectedUsers[receiver] || [];
        receiverSockets.forEach(sock => {
          if (sock.readyState === WebSocket.OPEN) {
            sock.send(JSON.stringify({
              sender: sender,
              receiver: `${receiver}__${sender}`,
              message: msgData.message,
              timestamp: msgData.timestamp,
              tabId: msgData.tabId
            }));
          }
        });

        console.log(`${msgData.sender} -> ${msgData.receiver}: ${msgData.message}`);
      }
    } catch (err) {
      console.error("Error handling message:", err);
    }
  });

  ws.on('close', () => {
    if (username && connectedUsers[username]) {
      connectedUsers[username] = connectedUsers[username].filter(sock => sock !== ws);
      if (connectedUsers[username].length === 0) delete connectedUsers[username];
      console.log(`${username} disconnected`);
    }
  });
});

server.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
