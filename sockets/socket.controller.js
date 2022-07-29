const { Socket } = require('socket.io');
const { comprobarJWT } = require('../helpers');
const { ChatMensajes } = require('../models');


const chatMensajes = new ChatMensajes();


// io es todo el servidor de socket, estan todos incluyendo la persona que se acaba de conectar
const socketController = async(socket = new Socket(), io) => {

    //console.log(socket);
    //Este es el token del usuario conectado que viene desde el frontend, desde la función conectarSocket en el archivo chat.js
    //console.log(socket.handshake.headers['x-token']);

    const usuario = await comprobarJWT(socket.handshake.headers['x-token']);
    
    if (!usuario) {
        return socket.disconnect();
    }

    // console.log('Se conecto ', usuario.nombre);

    // Agregar el usuario conectado
    /* Generalmente para emitir eventos ocupamos:
        - socket.emit           (para emitir al usuario que se conecta)
        - socket.broadcast.emit (para emitir a todos los demas)
       Utilizando io.emit emitimos a todo el mundo */
    chatMensajes.conectarUsuario(usuario);
    io.emit('usuarios-activos', chatMensajes.usuariosArr);
    socket.emit('recibir-mensajes', chatMensajes.ultimos10);

    // Conectarlo a una sala especial
    socket.join(usuario.id);    //salas activas: global, socket.id, usuario.id

    // Limpiar cuando alguien se desconecta    
    socket.on('disconnect', () => {
        chatMensajes.desconectarUsuario(usuario.id);
        io.emit('usuarios-activos', chatMensajes.usuariosArr);
    });

    socket.on('enviar-mensaje', ({ uid, mensaje }) => {

        if (uid) {
            // Mensaje privado                        
            socket.to(uid).emit('mensaje-privado', { de: usuario.nombre, mensaje });
        } else {
            chatMensajes.enviarMensaje(usuario.id, usuario.nombre, mensaje);
            io.emit('recibir-mensajes', chatMensajes.ultimos10);
        }
    });

};


module.exports = {
    socketController
}