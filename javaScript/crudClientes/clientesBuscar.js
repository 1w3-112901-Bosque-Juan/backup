const clientesUrl = 'https://localhost:7061/abmcVuelo/Clientes_nrodoc';
async function buscarCliente(dni){
    let result =   await fetch(`${clientesUrl}?nroDoc=${dni}`);
    return result;

}
document.getElementById('buscarClienteBtn').addEventListener('click', async () => {
    const dni = document.getElementById('dniInput').value.trim();
    if (!dni || isNaN(dni)) return;

    try {
        const response = await buscarCliente(dni);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const clientes = await response.json();
        const tbody = document.getElementById('clientesBody');
        tbody.innerHTML = '';

        if (!Array.isArray(clientes) || clientes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">No se encontraron resultados</td>
                </tr>`;
            return;
        }

        clientes.forEach(c => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
    <td>${c.nombre}</td>
    <td>${c.apellido}</td>
    <td>${c.nroDoc}</td>
    <td>${c.email}</td>
    <td>
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

    } catch (error) {
        console.error('Error al buscar cliente:', error);
    }
});

// Seleccionar cliente
var clientesSeleccionados = null;

document.getElementById('clientesBody').addEventListener('click', e => {
    if (e.target.matches('button[data-json]')) {
        try {
            clientesSeleccionados = JSON.parse(e.target.getAttribute('data-json'));
            mostrarclientesSeleccionados(clientesSeleccionados);
        } catch (err) {
            console.error('Error al parsear cliente:', err);
        }
    }
});

function mostrarclientesSeleccionados(cliente) {
    clientesSeleccionados = cliente;

    document.getElementById("btnCrearClienteContainer")?.classList.add("d-none");

    document.getElementById("accionesCliente")?.classList.remove("d-none");

    actualizarBotonesModal();
}

document.getElementById('clientesBody').addEventListener('click', e => {
    if (e.target.matches('button[data-json]')) {
        try {
            clientesSeleccionados = JSON.parse(e.target.getAttribute('data-json'));
            mostrarclientesSeleccionados(clientesSeleccionados);
        } catch (err) {
            console.error('Error al parsear cliente:', err);
        }
    } else if (e.target.matches('button.limpiar-btn')) {
        limpiarBusqueda();
    }
});

function limpiarBusqueda() {
    // Limpiar input de búsqueda
    document.getElementById('dniInput').value = '';

    // Vaciar tabla de resultados
    document.getElementById('clientesBody').innerHTML = '';

    // Ocultar botones Editar / Eliminar en la interfaz principal
    document.getElementById('accionesCliente')?.classList.add('d-none');

    // Mostrar botón Crear cliente en la interfaz principal
    document.getElementById('btnCrearClienteContainer')?.classList.remove('d-none');

    // Resetear cliente seleccionado
    clientesSeleccionados = null;

    // Actualizar botones dentro del modal
    actualizarBotonesModal();
}

function actualizarBotonesModal() {
    const btnGuardar = document.getElementById("btnGuardarCliente");
    const btnActualizar = document.getElementById("btnActualizarCliente");

    if (clientesSeleccionados) {
        // Cliente seleccionado → mostrar actualizar, ocultar crear
        btnGuardar.style.display = "none";
        btnActualizar.style.display = "inline-block";
    } else {
        // No hay cliente seleccionado → mostrar crear, ocultar actualizar
        btnGuardar.style.display = "inline-block";
        btnActualizar.style.display = "none";
    }
}
