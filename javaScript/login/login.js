// ==========================
// LOGIN FORM - MODAL
// ==========================

document.getElementById('loginFormModal').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = document.getElementById('usuarioModal').value.trim();
    const pass = document.getElementById('passwordModal').value.trim();

    const loginData = {
        nombre: user,
        contrasenia: pass
    };

    console.log("login data", loginData);

    try {
        const response = await fetch("https://localhost:7061/jwt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        console.log("Response:", response);

        if (!response.ok) {
            alert("Credenciales incorrectas");
            return;
        }

        const data = await response.json();

        const token = data.token || data.jwt;

        if (!token) {
            alert("No se recibió token desde el servidor");
            return;
        }

        localStorage.setItem("jwt", token);


        actualizarBotonesAuth();

        const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
        modal.hide();

    } catch (error) {
        alert("Error de conexión con el servidor");
    }
});



function actualizarBotonesAuth() {
    const token = localStorage.getItem("jwt");

    if (token) {
        document.getElementById("btnLogin").style.display = "none";
        document.getElementById("btnLogout").style.display = "inline-block";
    } else {
        document.getElementById("btnLogin").style.display = "inline-block";
        document.getElementById("btnLogout").style.display = "none";
    }
}

// Ejecutar al cargar la página
actualizarBotonesAuth();




document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.removeItem("jwt");  
    actualizarBotonesAuth();         
    // document.getElementById('navConsultas').style.display = 'none';
    alert("Sesión cerrada.");

});
