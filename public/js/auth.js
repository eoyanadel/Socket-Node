const miFormulario = document.querySelector('form');

const url = (window.location.hostname.includes('localhost'))
                ? 'http://localhost:8080/api/auth/'
                : 'https://restserver-node-eoc-2022.herokuapp.com/api/auth/'


// Login con correo y contraseña tradicional
miFormulario.addEventListener('submit', ev => {
    ev.preventDefault();
    const formData = { }

    for (let el of miFormulario.elements) {
        if (el.name.length > 0) {            
            formData[el.name] = el.value
        }
    }

    //hace una peticion post al endpoint "Login " (colección Cafe-Node Postman)
    fetch(url + 'login', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(resp => resp.json())
    .then(({ msg, token }) => {
        if (msg) {
            return console.error(msg);
        }

        console.log(token);
        localStorage.setItem('token', token);   //aqui saca el token ya desestructurado desde la resp
        window.location = 'chat.html';
    })
    .catch(err => {
        console.log(err);
    });
});


// Login con Google SignIn
function handleCredentialResponse(response) {
    
    // Google Token: ID_TOKEN
    // console.log('id_token', response.credential);

    const body = { id_token: response.credential };

    //hace una peticion post al endpoint "Google Login " (colección Cafe-Node Postman)
    fetch(url + 'google', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(resp => resp.json())
        .then(resp => {
            console.log('Nuestro Server ', resp);
            //localStorage.setItem('email', resp.usuario.correo);

            console.log(resp.token);
            localStorage.setItem('token', resp.token);  //aqui saca el token desde la resp
            window.location = 'chat.html';
        })
        .catch(console.warn);

}

const button = document.getElementById('google_signout');
button.onclick = () => {
    console.log(google.accounts.id);
    google.accounts.id.disableAutoSelect();

    google.accounts.id.revoke(localStorage.getItem('email'), done => {
        localStorage.clear();
        location.reload();
    });
}