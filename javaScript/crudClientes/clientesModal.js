
const crearClienteBtn = document.getElementById("btnGuardarCliente");

crearClienteBtn.addEventListener('click', async () => {

    const nuevoCliente = {
        nombre: document.getElementById("inputNombre").value.trim(),
        apellido: document.getElementById("inputApellido").value.trim(),
        idTipoDoc: parseInt(document.getElementById("selectTipoDoc").value),
        nroDoc: parseInt(document.getElementById("inputNroDoc").value),
        idTipoCliente: parseInt(document.getElementById("selectTipoCliente").value),
        calle: document.getElementById("inputCalle").value.trim(),
        idProvincia: parseInt(document.getElementById("selectProvincia").value),
        email: document.getElementById("inputEmail").value.trim(),
        telefono: document.getElementById("inputTelefono").value.trim()
    };

    if (!nuevoCliente.nombre || !nuevoCliente.apellido || isNaN(nuevoCliente.nroDoc)) {
        Swal.fire("Advertencia", "Complete los campos obligatorios.", "warning");
        return;
    }

    try {
        const response = await fetch('https://localhost:7061/pasajeros/crear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoCliente)
        });

        const data = await response.json();

        if (!response.ok) {
            Swal.fire("Error", data.message || "No se pudo crear el cliente.", "error");
            return;
        }

        // CORRECCIÓN: Cerrar modal ANTES de refrescar
        const modalEl = document.getElementById('modalNuevoCliente');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
            modalInstance.hide();
        }

        // Limpiar formulario
        limpiarFormularioCliente();

        // Refrescar tabla
        await refrescarClienteActualizado(nuevoCliente.nroDoc);

        // Mostrar éxito DESPUÉS de cerrar modal
        Swal.fire("Éxito", data.message || "Cliente creado correctamente.", "success");

    } catch (error) {
        console.error("Error al crear cliente:", error);
        Swal.fire("Error", "Hubo un problema con la solicitud.", "error");
    }
});

// ============================
// LIMPIAR CAMPOS
// ============================
function limpiarFormularioCliente() {
    document.querySelectorAll("#modalNuevoCliente input").forEach(i => i.value = "");
    document.getElementById("selectTipoDoc").selectedIndex = 0;
    document.getElementById("selectTipoCliente").selectedIndex = 0;
    document.getElementById("selectProvincia").selectedIndex = 0;
}

async function cargarSelects() {
    await cargarTipoDoc();
    await cargarTipoCliente();
}

async function cargarTipoDoc() {
    try {
        const resp = await fetch('https://localhost:7061/pasajeros/tipo-doc');
        if (!resp.ok) throw new Error(`Error HTTP ${resp.status}`);

        const tipos = await resp.json();
        const select = document.getElementById("selectTipoDoc");

        select.innerHTML = ""; // limpiar

        tipos.forEach(t => {
            const option = document.createElement("option");
            option.value = t.idTipoDoc;   // se envía al backend
            option.textContent = t.tipoDoc;   // se muestra al usuario
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando tipo documento", error);
        Swal.fire("Error", "No se pudieron cargar los tipos de documento", "error");
    }
}

async function cargarTipoCliente() {
    try {
        const resp = await fetch('https://localhost:7061/pasajeros/tipo-pasajero');
        if (!resp.ok) throw new Error(`Error HTTP ${resp.status}`);

        const tipos = await resp.json();
        const select = document.getElementById("selectTipoCliente");

        select.innerHTML = "";

        tipos.forEach(t => {
            const option = document.createElement("option");
            option.value = t.idTipoCliente;  // valor enviado al backend
            option.textContent = t.tipoCliente; // texto visible
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando tipo cliente", error);
        Swal.fire("Error", "No se pudieron cargar los tipos de cliente", "error");
    }
}

// Cargar al iniciar
cargarSelects();
async function cargarProvincias() {
    try {
        const resp = await fetch("https://localhost:7061/abmc/reservaVuelo/provincias");

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const provincias = await resp.json();
        const select = document.getElementById("selectProvincia");

        select.innerHTML = ""; // limpiar options previos

        provincias.forEach(p => {
            const option = document.createElement("option");
            option.value = p.idProvincia;     // se envía al backend
            option.textContent = p.nombre;    // se muestra en el select
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando provincias:", error);

        Swal.fire(
            "Error",
            "No se pudieron cargar las provincias. Intente más tarde.",
            "error"
        );
    }
}

cargarProvincias();
