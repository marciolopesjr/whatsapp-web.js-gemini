const socket = io();

const statusEl = document.getElementById('status');
const qrEl = document.getElementById('qr');
const sendForm = document.getElementById('send-form');
const numberInput = document.getElementById('number');
const messageInput = document.getElementById('message');
const messagesEl = document.getElementById('messages');

socket.on('qr', (url) => {
    console.log('QR received');
    qrEl.src = url;
});

socket.on('ready', () => {
    console.log('Client is ready');
    statusEl.textContent = 'Connected';
    qrEl.style.display = 'none';
});

socket.on('disconnected', () => {
    console.log('Client disconnected');
    statusEl.textContent = 'Disconnected';
    qrEl.style.display = 'block';
});

socket.on('message', (msg) => {
    const item = document.createElement('li');
    item.textContent = msg;
    messagesEl.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

sendForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const number = numberInput.value;
    const message = messageInput.value;
    if (number && message) {
        socket.emit('send-message', { number, message });
        messageInput.value = '';
    }
});
