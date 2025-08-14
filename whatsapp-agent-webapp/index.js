const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const qrcode = require('qrcode');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	}
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
        if (err) {
            console.error('Error generating QR code', err);
            return;
        }
        io.emit('qr', url);
    });
});

client.on('ready', () => {
    console.log('Client is ready!');
    io.emit('ready');
});

client.on('message', msg => {
    console.log('MESSAGE RECEIVED', msg.body);
    io.emit('message', msg.body);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    io.emit('disconnected');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('send-message', ({ number, message }) => {
        console.log(`Sending message to ${number}: ${message}`);
        const chatId = `${number}@c.us`;
        client.sendMessage(chatId, message).then(response => {
            console.log('Message sent', response.body);
            // Optionally, emit back to the client that the message was sent
            socket.emit('message', `You: ${message}`);
        }).catch(err => {
            console.error('Error sending message', err);
        });
    });
});

client.initialize();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
