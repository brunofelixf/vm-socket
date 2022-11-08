import "dotenv/config";
import http from 'http';
import https from 'https';
import { Server } from 'socket.io';
import fs from 'fs';

const {
    ENVIRONMENT,
    APP_PORT,
    SSL_CERT_FILE,
    SSL_KEY_FILE,
} = process.env;

const httpServer = () => ENVIRONMENT === 'dev'
? http.createServer()
: https.createServer({
    cert: fs.readFileSync(SSL_CERT_FILE as string),
    key: fs.readFileSync(SSL_KEY_FILE as string),
});

const server = new Server(httpServer(), {
    serveClient: false,
    cors: {
        origin: '*',
        credentials: true,
    }
})

server.on('connection', (socket) => {
    console.log('A Socket client has been connected with socket ID', socket.id);
    
    // socket.on('chat_id', (chatId) => {
    //     socket.join(`${chatId}`);
    //     console.log('Join Chat: ' + chatId);
    // })
    // when enters in a chat room needs to call socket.join(chatId);
    // socket.join(`${32131}`);

    // when leaves the chat needs to call socket.leave(chatId);
    // socket.leave(`${456456456}`);

    // send connection event to client
    socket.emit('connection', {
        id: socket.id
    });

    // on client sends a message to the server
    socket.on('message', (userId, chatId, message, hour) => {
        
        // send here a request to the backend to save the message on database

        // broadcast to all clients in the chat room
        // socket.broadcast.to(chatId).emit(`received-${chatId}`, { message, hour });

        socket.broadcast.emit(`received-${chatId}`,{ message, hour} )
    });

    // when socket disconnects
    socket.on('disconnect', () => {
        console.log('Socket', socket.id, 'has been disconnected');
    });

});

server.listen(Number(APP_PORT));