let socket;
let currentUser = localStorage.getItem('currentUser');
let selectedUser = null;
let messagesByContext = {}; // Store messages by context

// Auto-login as HSSN if no user is already set
if (!currentUser) {
  currentUser = 'HSSN';
  localStorage.setItem('currentUser', currentUser);
  console.log(`Auto-logged in as ${currentUser}`);
}

// Generate a unique tab ID
if (!sessionStorage.tabId) {
  sessionStorage.tabId = crypto.randomUUID();
}
const tabId = sessionStorage.tabId;

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('chatHeader').textContent = 'Select a chat';

  socket = new WebSocket('ws://localhost:3000');

  socket.onopen = () => {
    console.log(`[Connected] Logged in as ${currentUser}`);
    socket.send(JSON.stringify({ sender: currentUser }));
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const context = `${data.sender}__${data.receiver.split('__')[1] || ''}`;

      // Store messages in memory
      if (!messagesByContext[context]) {
        messagesByContext[context] = [];
      }
      const isSender = data.sender === currentUser && data.tabId === tabId;

        messagesByContext[context].push({
        message: data.message,
        isSender
        });

      // If the message is for the current selected chat, display it
      const currentContext = `${currentUser}__${selectedUser}`;
      if (context === currentContext) {
        displayMessages(currentContext);
      }
    } catch (err) {
      console.error("[Message Error]", err);
    }
  };

  socket.onerror = (err) => console.error("[WebSocket Error]", err);
  socket.onclose = () => console.warn("[WebSocket] Disconnected");

  document.getElementById('sendBtn').addEventListener('click', sendMessage);
  document.getElementById('messageInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  setupChatSelection();

  const firstChat = document.querySelector('.chat-item');
  if (firstChat) firstChat.click();
});

function setupChatSelection() {
  const chatItems = document.querySelectorAll('.chat-item');
  chatItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all, add to selected
      chatItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      selectedUser = item.querySelector('.name').textContent.trim();
      document.getElementById('chatHeader').textContent = selectedUser;
      document.querySelector('.chat-header .avatar').src = item.querySelector('img').src;

      const context = `${currentUser}__${selectedUser}`;
      displayMessages(context);
    });
  });
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();

  if (!text || !selectedUser) return;
  if (socket.readyState !== WebSocket.OPEN) {
    console.error("[Error] WebSocket not connected.");
    return;
  }

  const messageData = {
    sender: currentUser,
    receiver: `${currentUser}__${selectedUser}`,
    message: text,
    timestamp: new Date().toISOString(),
    tabId: tabId
  };

  socket.send(JSON.stringify(messageData));
  input.value = '';
}

function displayMessages(context) {
  const messagesContainer = document.getElementById('messages');
  messagesContainer.innerHTML = '';

  if (messagesByContext[context]) {
    messagesByContext[context].forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `message ${msg.isSender ? 'sent' : 'received'}`;
      msgDiv.textContent = msg.message;
      messagesContainer.appendChild(msgDiv);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}
