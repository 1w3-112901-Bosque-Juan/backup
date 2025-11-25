const urlClientes = 'https://localhost:7061/abmcVuelo/Clientes_nrodoc';

document.getElementById("btnEditarCliente").addEventListener("click", () => {
if (!clienteSeleccionado) {
    Swal.fire({
        icon: 'warning',
        title: 'No hay cliente seleccionado',
        text: 'Por favor seleccioná un cliente antes de continuar.'
    });
    return;
}


    // Cargar los datos al modal
    document.getElementById("inputNombre").value = clienteSeleccionado.nombre;
    document.getElementById("inputApellido").value = clienteSeleccionado.apellido;
    document.getElementById("selectTipoDoc").value = clienteSeleccionado.idTipoDoc;
    document.getElementById("inputNroDoc").value = clienteSeleccionado.nroDoc;
    document.getElementById("selectTipoCliente").value = clienteSeleccionado.idTipoCliente;
    document.getElementById("inputCalle").value = clienteSeleccionado.calle;
    document.getElementById("selectProvincia").value = clienteSeleccionado.idProvincia;
    document.getElementById("inputEmail").value = clienteSeleccionado.email;
    document.getElementById("inputTelefono").value = clienteSeleccionado.telefono;


    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById("modalNuevoCliente"));
    modal.show();
});
document.getElementById("btnActualizarCliente").addEventListener("click", async () => {

    const modo = document.getElementById("btnActualizarCliente").dataset.mode || "create";

    const cliente = {
        idPasajero: clienteSeleccionado?.idPasajero || 0,
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



    try {
        const response = await fetch('https://localhost:7061/pasajeros/update', {
            method:"PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cliente)
        });

        const data = await response.json();

        if (!response.ok) {
            Swal.fire("Error", data.message || "Error al guardar cliente", "error");
            return;
        }

        Swal.fire("Éxito", data.message || "Datos guardados correctamente", "success");
        
        // Cerrar modal
bootstrap.Modal
    .getOrCreateInstance(document.getElementById("modalNuevoCliente"))
    .hide();

limpiarFormulario();

await refrescarClienteActualizado(cliente.nroDoc);
    } catch (e) {
    console.error("Error en actualización:", e);

    if (typeof Swal !== "undefined") {
        Swal.fire("Error", "No se pudo conectar al servidor", "error");
    } else {
        alert("No se pudo conectar al servidor");
    }
}

});


async function refrescarClienteActualizado(nroDoc) {
    try {
        const response = await fetch(`${urlClientes}?nroDoc=${nroDoc}`);
        if (!response.ok) throw new Error("Error al buscar cliente");

        const clientes = await response.json();
        const tbody = document.getElementById("clientesBody");
        tbody.innerHTML = "";

        if (!Array.isArray(clientes) || clientes.length === 0) {
            tbody.innerHTML =
              `<tr><td colspan="5" class="text-center text-muted">No se encontraron resultados</td></tr>`;
            return;
        }

        clientes.forEach(c => {
            const fila = document.createElement("tr");
            // CORRECCIÓN: Los botones ahora están DENTRO del <td>
            fila.innerHTML = `
                <td>${c.nombre}</td>
                <td>${c.apellido}</td>
                <td>${c.nroDoc}</td>
                <td>${c.email}</td>
                <td class="text-center">
                    <button class="btn btn-success btn-sm" data-json='${JSON.stringify(c)}'>
                        Seleccionar
                    </button>
                    <button class="btn btn-secondary btn-sm limpiar-btn">
                        Limpiar
                    </button>
                </td>
            `;
            tbody.appendChild(fila);
        });

        // Mantener seleccionado el cliente actualizado
        clienteSeleccionado = clientes[0];

    } catch (error) {
        console.error("Error al refrescar cliente:", error);
    }
}

function limpiarFormulario() {
    document.getElementById("inputNombre").value = "";
    document.getElementById("inputApellido").value = "";
    document.getElementById("inputNroDoc").value = "";
    document.getElementById("inputCalle").value = "";
    document.getElementById("inputEmail").value = "";
    document.getElementById("inputTelefono").value = "";

    document.getElementById("selectTipoDoc").selectedIndex = 0;
    document.getElementById("selectTipoCliente").selectedIndex = 0;
    document.getElementById("selectProvincia").selectedIndex = 0;
}
