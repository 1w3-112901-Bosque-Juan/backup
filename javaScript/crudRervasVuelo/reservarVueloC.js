// ====================================================================== 
//  RESERVAR PASAJE — MÓDULO COMPLETO (CORREGIDO al 100%)
// ======================================================================

// ======================================================================
// VARIABLES GLOBALES
// ======================================================================
let vueloSeleccionado = null;
let clienteSeleccionado = null;
let asientoSeleccionado = null;
let equipajeSeleccionado = null;

// ======================================================================
// ELEMENTOS DEL DOM
// ======================================================================
const originSelects = document.getElementById("originSelect");
const destinoSelect = document.getElementById("destinoSelect");
const fechaInput = document.getElementById("fechaInput");
const buscarBtn = document.getElementById("buscarBtn");
const vuelosBody = document.getElementById("vuelosBody");
const errorMsg = document.getElementById("errorMsg");

const dniInput = document.getElementById("dniInput");
const buscarClienteBtn = document.getElementById("buscarClienteBtn");
const clientesBody = document.getElementById("clientesBody");

const asientoSelect = document.getElementById("asientoSelect");
const venderPasajeBtn = document.getElementById("venderPasajeBtn");

const obsInput = document.getElementById("obsInput");

// ======================================================================
// ENDPOINTS
// ======================================================================
const AEROPUERTOS_URL = "https://localhost:7061/abmc/reservaVuelo/aeropuertos";
const VUELOS_URL = "https://localhost:7061/abmc/reservaVuelo/vuelos";
const CLIENTES_URL = "https://localhost:7061/abmcVuelo/Clientes_nrodoc";
const RESERVA_URL = "https://localhost:7061/abmc/reservaVuelo";

// ======================================================================
// 1) CARGAR AEROPUERTOS
// ======================================================================
async function cargarAeropuertosReserva() {
    try {
        const resp = await fetch(AEROPUERTOS_URL);
        if (!resp.ok) throw new Error("Error HTTP");

        const aeropuertos = await resp.json();

        originSelects.innerHTML = `<option value="">Seleccione un origen</option>`;
        destinoSelect.innerHTML = `<option value="">Seleccione un destino</option>`;

        aeropuertos.forEach(a => {
            originSelects.add(new Option(a.nombre, a.idAeropuerto));
            destinoSelect.add(new Option(a.nombre, a.idAeropuerto));
        });
    }
    catch (err) {
        console.error("Error al cargar aeropuertos:", err);
    }
}

cargarAeropuertosReserva();

// ======================================================================
// 2) BUSCAR VUELOS
// ======================================================================
async function buscarVuelos() {

    vuelosBody.innerHTML = "";
    errorMsg.style.display = "none";

    const idOrigen = originSelects.value;
    const idDestino = destinoSelect.value;
    const fecha = fechaInput.value;

    if (!idOrigen || !idDestino || !fecha) {
        vuelosBody.innerHTML = `<tr><td colspan="7">Debe completar todos los campos</td></tr>`;
        return;
    }

    if (idOrigen === idDestino) {
        errorMsg.style.display = "block";
        return;
    }

    try {
        const resp = await fetch(`${VUELOS_URL}/${idOrigen}/${idDestino}/${fecha}`);
console.log(resp, "linea 89")
        if (resp.status === 404) {
            vuelosBody.innerHTML = `<tr><td colspan="7">No se encontraron vuelos</td></tr>`;
            return;
        }

        if (!resp.ok) {
            vuelosBody.innerHTML = `<tr><td colspan="7">Error en la búsqueda</td></tr>`;
            return;
        }
console.log(resp, "linea 99")

        const vuelos = await resp.json();
console.log(vuelos, "linea 102")

        renderizarVuelos(vuelos);
    }
    catch (err) {
        console.error("Error al buscar vuelos:", err);
        vuelosBody.innerHTML = `<tr><td colspan="7">Error al consultar API</td></tr>`;
    }
}

buscarBtn.addEventListener("click", buscarVuelos);

// ======================================================================
// 3) MOSTRAR VUELOS
// ======================================================================
function renderizarVuelos(lista) {
    vuelosBody.innerHTML = "";

    if (!lista || lista.length === 0) {
        vuelosBody.innerHTML = `<tr><td colspan="7">No se encontraron vuelos</td></tr>`;
        return;
    }

    lista.forEach(v => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${v.codigoVuelo}</td>
            <td>${v.aeropuertoOrigen}</td>
            <td>${v.aeropuertoDestino}</td>
            <td>${formatearFecha(v.fechaSalida)}</td>
            <td>${formatearFecha(v.fechaLlegada)}</td>
            <td>${v.nombreAvion}</td>
            <td class="text-center">
                <input type="checkbox"
                    class="form-check-input selector-vuelo"
                    data-json='${JSON.stringify(v)}'>
        `;

        vuelosBody.appendChild(tr);
    });
}

// ======================================================================
// 4) FORMATEAR FECHA
// ======================================================================
function formatearFecha(iso) {
    const d = new Date(iso);
    const fecha = d.toLocaleDateString("es-AR");
    const hora = d.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit"
    });
    return `${fecha} ${hora}`;
}

// ======================================================================
// 5) SELECCIÓN ÚNICA DE VUELO
// ======================================================================
document.addEventListener("change", e => {

    if (!e.target.classList.contains("selector-vuelo")) return;

    document.querySelectorAll(".selector-vuelo").forEach(chk => {
        if (chk !== e.target) chk.checked = false;
    });

    if (!e.target.checked) {
        vueloSeleccionado = null;
        asientoSelect.innerHTML = `<option value="">Seleccione un asiento</option>`;
        return;
    }

    vueloSeleccionado = JSON.parse(e.target.dataset.json);

    asientoSelect.innerHTML = `<option value="">Seleccione un asiento</option>`;
    vueloSeleccionado.asientosLibres.forEach(a => {
        asientoSelect.innerHTML += `
            <option value="${a.idAsiento}">
                ${a.numero} (Extra: $${a.precioExtra})
            </option>
        `;
    });
});

// ======================================================================
// 6) SELECCIÓN DE ASIENTO
// ======================================================================
asientoSelect.addEventListener("change", () => {
    if (!asientoSelect.value) {
        asientoSeleccionado = null;
        return;
    }

    const idA = asientoSelect.value;
    asientoSeleccionado =
        vueloSeleccionado.asientosLibres.find(a => a.idAsiento == idA);
});

// ======================================================================
// 7) BUSCAR CLIENTE
// ======================================================================
buscarClienteBtn.addEventListener("click", async () => {

    const dni = dniInput.value.trim();
    if (!dni || isNaN(dni)) return;

    try {
        const resp = await fetch(`${CLIENTES_URL}?nroDoc=${dni}`);
        if (!resp.ok) throw new Error();

        const clientes = await resp.json();
        clientesBody.innerHTML = "";

        if (!clientes.length) {
            clientesBody.innerHTML =
                `<tr><td colspan="5" class="text-center text-muted">No se encontraron resultados</td></tr>`;
            return;
        }

        clientes.forEach(c => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${c.nombre}</td>
                <td>${c.apellido}</td>
                <td>${c.nroDoc}</td>
                <td>${c.email}</td>
                <td class="text-center">
                    <input type="checkbox" class="chk-cliente" data-json='${JSON.stringify(c)}'>
                </td>
            `;

            clientesBody.appendChild(tr);
        });
    }
    catch (err) {
        console.error("Error al buscar cliente:", err);
    }
});

// ======================================================================
// 8) SELECCIÓN ÚNICA DE CLIENTE (CORREGIDA)
// ======================================================================
clientesBody.addEventListener("change", e => {

    if (!e.target.classList.contains("chk-cliente")) return;

    clientesBody.querySelectorAll(".chk-cliente").forEach(chk => {
        if (chk !== e.target) chk.checked = false;
    });

    clientesBody.querySelectorAll("tr").forEach(r => r.classList.remove("table-active"));

    if (e.target.checked) {
        e.target.closest("tr").classList.add("table-active");
        clienteSeleccionado = JSON.parse(e.target.dataset.json);
    } else {
        clienteSeleccionado = null;
    }
});

// ======================================================================
// 9) SELECCIÓN DE EQUIPAJE (CORREGIDO DEFINITIVO)
// ======================================================================
document.addEventListener("change", e => {

    if (!e.target.classList.contains("equipaje-radio")) return;

    // Solo permite 1 seleccionado
    document.querySelectorAll(".equipaje-radio").forEach(r => {
        if (r !== e.target) r.checked = false;
    });

    equipajeSeleccionado = Number(e.target.value);

    console.log("Equipaje seleccionado:", equipajeSeleccionado);
});



// ======================================================================
// 10) ARMAR JSON
// ======================================================================
function armarReservaJson() {
// return {
//   idPasajero: 3,
//   idVuelo: 4,
//   idAsiento: 20,
//   idTipoEquipaje: 1,
//   observaciones: "texto"
// }
    if (!vueloSeleccionado) return alert("Debe seleccionar un vuelo.");
    if (!asientoSeleccionado) return alert("Debe seleccionar un asiento.");
    if (!clienteSeleccionado) return alert("Debe seleccionar un cliente.");
    if (!equipajeSeleccionado) return alert("Debe seleccionar equipaje.");

    return {
        idPasajero: clienteSeleccionado.idPasajero,
        idVuelo: vueloSeleccionado.idVuelo,
        idAsiento: asientoSeleccionado.idAsiento,
        idTipoEquipaje: Number(equipajeSeleccionado), // 1 = mano / 2 = bodega
        observaciones: obsInput?.value || "ninguna"
    };
}


// ======================================================================
// 11) ENVIAR RESERVA
// ======================================================================
venderPasajeBtn.addEventListener("click", async () => {

    const reserva = armarReservaJson();
    if (!reserva) return;

    console.log("JSON enviado:", JSON.stringify(reserva, null, 2));


    try {
        const resp = await fetch(RESERVA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reserva)
        });
console.log(resp, "320")
        if (!resp.ok) {
            alert("❌ Error al realizar la reserva");
            return;
        }

        alert("✅ Reserva enviada correctamente");

        // Reset de UI
        document.querySelectorAll(".selector-vuelo").forEach(c => c.checked = false);
        vueloSeleccionado = null;

        asientoSelect.innerHTML = `<option value="">Seleccione un asiento</option>`;
        asientoSeleccionado = null;

        document.querySelectorAll(".chk-cliente").forEach(c => c.checked = false);
        clienteSeleccionado = null;

        equipajeChecks.forEach(r => r.checked = false);
        equipajeSeleccionado = null;

        if (obsInput) obsInput.value = "";
    }
    catch (err) {
        console.error(err);
        alert("❌ Error de conexión con el servidor");
    }
});


