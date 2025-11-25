// ======================================================================
//  BUSCAR VUELOS - TAB NUEVO VUELO
// ======================================================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ buscarVuelosNuevo.js cargado");

    // ================================
    // ENDPOINTS
    // ================================
    const AEROPUERTOS_URL = "https://localhost:7061/abmc/reservaVuelo/aeropuertos";

    // ================================
    // DOM ELEMENTS
    // ================================
    const origenNuevo = document.getElementById("origenNuevo");
    const destinoNuevo = document.getElementById("destinoNuevo");
    const fechaNuevo = document.getElementById("fechaNuevo");
    const buscarNuevo = document.getElementById("buscarNuevo");
    const vuelosBodyNuevo = document.getElementById("vuelosBodyNuevo");

    // ======================================================================
    // CARGAR AEROPUERTOS EN LOS SELECTS
    // ======================================================================
    async function cargarAeropuertosNuevo() {
        try {
            const resp = await fetch(AEROPUERTOS_URL);
            if (!resp.ok) throw new Error("Error al cargar aeropuertos");

            const aeropuertos = await resp.json();
            console.log(`✅ ${aeropuertos.length} aeropuertos cargados en Nuevo Vuelo`);

            // Limpiar selects
            origenNuevo.innerHTML = '<option value="">Seleccione un origen</option>';
            destinoNuevo.innerHTML = '<option value="">Seleccione un destino</option>';

            // Llenar selects
            aeropuertos.forEach(a => {
                origenNuevo.add(new Option(a.nombre, a.idAeropuerto));
                destinoNuevo.add(new Option(a.nombre, a.idAeropuerto));
            });

        } catch (err) {
            console.error("❌ Error cargando aeropuertos:", err);
        }
    }

    // ======================================================================
    // BUSCAR VUELOS
    // ======================================================================
    async function buscarVuelosNuevo() {
        vuelosBodyNuevo.innerHTML = "";

        const idOrigen = origenNuevo.value;
        const idDestino = destinoNuevo.value;
        const fecha = fechaNuevo.value;

 


        try {
            const resp = await fetch(`https://localhost:7061/abmcVuelo/buscar?origen=${idOrigen}&destino=${idDestino}&fecha=${fecha}`)

            console.log("Response status:", resp);

            if (resp.status === 404) {
                vuelosBodyNuevo.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-muted">
                            No se encontraron vuelos para esta ruta y fecha
                        </td>
                    </tr>
                `;
                return;
            }

            if (!resp.ok) {
                vuelosBodyNuevo.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-danger">
                            Error en la búsqueda (${resp.status})
                        </td>
                    </tr>
                `;
                return;
            }

            const vuelos = await resp.json();

            renderizarVuelosNuevo(vuelos);

        } catch (err) {
            console.error("❌ Error al buscar vuelos:", err);
            vuelosBodyNuevo.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-danger">
                        Error al consultar la API: ${err.message}
                    </td>
                </tr>
            `;
        }
    }

function renderizarVuelosNuevo(lista) {
    if (!lista || lista.length === 0) {
        vuelosBodyNuevo.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted">
                    No hay vuelos disponibles
                </td>
            </tr>
        `;
        return;
    }

    vuelosBodyNuevo.innerHTML = lista.map(v => `
        <tr data-id="${v.idVuelo}">
            <td>${v.codigoVuelo}</td>
            <td>${v.aeropuertoOrigen}</td>
            <td>${v.aeropuertoDestino}</td>
            <td>${formatearFecha(v.fechaSalida)}</td>
            <td>${formatearFecha(v.fechaLlegada)}</td>
            <td>${v.nombreAvion}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-primary" 
                        onclick="verDetalleVueloNuevo(${v.idVuelo}, '${v.codigoVuelo}')">
                    Ver
                </button>
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-warning"
                        onclick="editarVuelo(${v.idVuelo})">
                    ✏️
                </button>
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-danger" 
                        onclick="eliminarVuelo(${v.idVuelo}, this)">
                    🗑️
                </button>
            </td>
        </tr>
    `).join("");
}

    function formatearFecha(fechaISO) {
        if (!fechaISO) return "N/A";
        
        const fecha = new Date(fechaISO);
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const anio = fecha.getFullYear();
        const horas = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
        
        return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
    }

    if (buscarNuevo) {
        buscarNuevo.addEventListener("click", (e) => {
            e.preventDefault(); 
            buscarVuelosNuevo();
        });
    }

    cargarAeropuertosNuevo();

});

function verDetalleVueloNuevo(idVuelo, codigoVuelo) {
    console.log(`Ver detalle del vuelo: ${codigoVuelo} (ID: ${idVuelo})`);
    alert(`Detalles del vuelo:\nCódigo: ${codigoVuelo}\nID: ${idVuelo}`);
}
async function eliminarVuelo(idVuelo, boton) {
    if (!confirm("¿Desea eliminar este vuelo?")) return;

    try {
        const response = await fetch(`https://localhost:7061/abmcVuelo/eliminar/${idVuelo}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error("No se pudo eliminar el vuelo");

        const mensaje = await response.text(); // recibimos el string del backend
        alert(mensaje);

        // Opcional: eliminar la fila del DOM
        const fila = boton.closest("tr");
        fila.remove();
    } catch (error) {
        console.error(error);
        alert("Error al eliminar el vuelo");
    }
}
async function editarVuelo(idVuelo) {
    try {
        // Traer los datos del vuelo desde el backend
        const resp = await fetch(`https://localhost:7061/abmcVuelo/${idVuelo}`);
        if (!resp.ok) throw new Error("No se pudo obtener el vuelo");

       const vuelo = await resp.json();



        document.getElementById("mdlAvion").value    = vuelo.idAvion;    
         document.getElementById("mdlOrigen").value = vuelo.idAeropuertoOrigen;
        document.getElementById("mdlDestino").value = vuelo.idAeropuertoDestino;
        document.getElementById("mdlFechaSalida").value = vuelo.fechaSalida.split("T")[0];
        document.getElementById("mdlHoraSalida").value = vuelo.fechaSalida.split("T")[1].substring(0,5);
        document.getElementById("mdlFechaLlegada").value = vuelo.fechaLlegada.split("T")[0];
        document.getElementById("mdlHoraLlegada").value = vuelo.fechaLlegada.split("T")[1].substring(0,5);
        document.getElementById("mdlPrecioBase").value = vuelo.precioBaseVuelo;

        // Cambiar botones: ocultar Crear y mostrar Editar
        const btnCrear = document.getElementById("mdlBtnCrearVuelo");
        btnCrear.classList.add("d-none");

        let btnEditar = document.getElementById("mdlBtnEditarVuelo");
        if (!btnEditar) {
            btnEditar = document.createElement("button");
            btnEditar.type = "button";
            btnEditar.id = "mdlBtnEditarVuelo";
            btnEditar.className = "btn btn-success px-4";
            btnEditar.textContent = "Actualizar Vuelo";
            document.querySelector("#mdlFormCrearVuelo .modal-footer").prepend(btnEditar);
        }
        btnEditar.classList.remove("d-none");

        // Evento para actualizar vuelo
        btnEditar.onclick = async () => {
            const payload = {
                idVuelo: vuelo.idVuelo,
                codigoVuelo: vuelo.codigoVuelo,
                fechaSalida: `${document.getElementById("mdlFechaSalida").value}T${document.getElementById("mdlHoraSalida").value}:00`,
                fechaLlegada: `${document.getElementById("mdlFechaLlegada").value}T${document.getElementById("mdlHoraLlegada").value}:00`,
                precioBaseVuelo: parseFloat(document.getElementById("mdlPrecioBase").value),
                idAvion: parseInt(document.getElementById("mdlAvion").value),
                idAeropuertoOrigen: parseInt(document.getElementById("mdlOrigen").value),
                idAeropuertoDestino: parseInt(document.getElementById("mdlDestino").value)
            };

            try {
                const resActualizar = await fetch("https://localhost:7061/abmcVuelo/actualizar_vuelo", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!resActualizar.ok) throw new Error("Error al actualizar el vuelos");

                const mensaje = await resActualizar.text();

                alert(mensaje);

                const modal = bootstrap.Modal.getInstance(document.getElementById("modalNuevoVuelo"));
                modal.hide();

       
            } catch (err) {
                console.error(err);
                alert("No se pudo actualizar el vuelo");
            }
        };

        const modal = new bootstrap.Modal(document.getElementById("modalNuevoVuelo"));
        modal.show();

    } catch (err) {
        console.error(err);
        alert("No se pudo cargar el vuelo para editar");
    }
}