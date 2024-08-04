import io from 'socket.io-client';

const socket = io('http://localhost:3000'); 

export function websocketClient(message, callback=null) {
    // Ensure the connection is established before sending a message
    socket.on('connect', () => {
      // Send a message to the server
      socket.emit('sendMessage', message);
      
      // Listen for a reply from the server
      socket.once('message', (data) => {
        console.log('Message from server:', data);
  
        // Call the provided callback with the server response
        if (callback) {
          callback(data);
        }
      });
    });
  
    // Optionally, handle disconnection
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }
