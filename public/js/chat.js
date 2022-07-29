// Referencias HTML
const txtUid = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const btnSalir = document.querySelector('#btnSalir');

const url = (window.location.hostname.includes('localhost'))
                ? 'http://localhost:8080/api/auth/'
                : 'https://restserver-node-eoc-2022.herokuapp.com/api/auth/'

let usuario = null;
let socket = null;

// Validar el token del localStorage
const validarJWT = async() => {

    const token = localStorage.getItem('token') || '';

    if (token.length <= 10) {
        window.location = 'index.html';
        throw new Error('No hay token en el servidor');
    }

    //hace una petición get al endpoint "Renovar o Validar JWT" (colección Cafe-Node en Postman) la cual devuelve el usuario conectado y el token renovado
    const resp = await fetch(url, {
        headers: { 'x-token': token }
    });

    const { usuario: userDB, token: tokenDB } = await resp.json();
    localStorage.setItem('token', tokenDB);
    usuario = userDB;

    document.title = usuario.nombre;

    //una vez valiado del JWT del usuario logueado, se conecta al servidor de socket
    await conectarSocket();
}


const conectarSocket = async () => {

    //esto se va al método socketController del controlador del socket
    socket = io({
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    });

    // escuchando eventos
    socket.on('connect', () => {
        console.log('Sockets Online');
    });

    socket.on('disconnect', () => {
        console.log('Sockets Offline');
    });

    socket.on('recibir-mensajes', dibujarMensajes);

    // socket.on('usuarios-activos', dibujarUsuarios) // opción más corta
    socket.on('usuarios-activos', (payload) => {
        //console.log(payload);
        dibujarUsuarios(payload);
    });

    socket.on('mensaje-privado', (payload) => {
       console.log('Privado: ', payload);
    });

}


const dibujarUsuarios = (usuarios = []) => {

    let usersHtml = '';
    usuarios.forEach(({ nombre, uid }) => {
        usersHtml += `
            <li>
                <p>
                    <h5 class="text-success">${ nombre }</h5>
                    <span class="fs-6 text-muted">${ uid }</span>
                </p>
            </li>
        `;
    });

    ulUsuarios.innerHTML = usersHtml;
}


const dibujarMensajes = (mensajes = []) => {

    let mensajesHtml = '';
    mensajes.forEach(({ nombre, mensaje }) => {
        mensajesHtml += `
            <li>
                <p>
                    <span class="text-primary">${ nombre }: </span>
                    <span>${ mensaje }</span>
                </p>
            </li>
        `;
    });

    ulMensajes.innerHTML = mensajesHtml;
}


// keyCode viene del event (evento por default)
txtMensaje.addEventListener('keyup', ({ keyCode }) => {

    const mensaje = txtMensaje.value;
    const uid = txtUid.value;

    //13 es la tecla Enter, al presionar la tecla enter se debe enviar el mensaje

    if (keyCode !== 13) { return; }
    if (mensaje.length === 0) { return; }

    socket.emit('enviar-mensaje', { uid, mensaje });

    txtMensaje.value = '';

});


const main = async() => {

    await validarJWT();
}



main();

