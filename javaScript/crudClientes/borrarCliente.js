document.getElementById("btnEliminarCliente").addEventListener("click", async () => {
    if (!clienteSeleccionado) return;

    try {
        const result = await Swal.fire({
            title: "¿Eliminar cliente?",
            html: `
                <b>${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}</b><br>
                DNI: ${clienteSeleccionado.nroDoc}
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar"
        });

        if (!result.isConfirmed) return;

        const resp = await fetch(`https://localhost:7061/pasajeros/${clienteSeleccionado.idPasajero}`, {
            method: "DELETE"
        });

        let data;
        try {
            data = await resp.json();
        } catch {
            data = {};
        }

        if (!resp.ok) {
            Swal.fire("Error", data.message || "No se pudo eliminar", "error");
            return;
        }

        await Swal.fire("Eliminado", data.message || "Cliente eliminado", "success");

        limpiarBusqueda();

    } catch (err) {
        console.error("Error al eliminar:", err);
        Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    }
});
