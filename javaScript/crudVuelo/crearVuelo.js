// ======================================================================
//  CREAR NUEVO VUELO — JS LIMPIO Y FINAL (SIN PRECIO FINAL)
// ======================================================================

// ================================
// ENDPOINTS
// ================================
const URL_AVIONES_OPERATIVOS = "https://localhost:7061/abmcVuelo/aviones";
const URL_AEROPUERTOS = "https://localhost:7061/abmc/reservaVuelo/aeropuertos";
const URL_CREAR_VUELO = "https://localhost:7061/abmcVuelo/crear_vuelo";

// ================================
// DOM ELEMENTS
// ================================
const mdlAvion = document.getElementById("mdlAvion");
const mdlOrigen = document.getElementById("mdlOrigen");
const mdlDestino = document.getElementById("mdlDestino");

const mdlFechaSalida = document.getElementById("mdlFechaSalida");
const mdlHoraSalida = document.getElementById("mdlHoraSalida");
const mdlFechaLlegada = document.getElementById("mdlFechaLlegada");
const mdlHoraLlegada = document.getElementById("mdlHoraLlegada");

const mdlPrecioBase = document.getElementById("mdlPrecioBase");

const mdlMensajeFormulario = document.getElementById("mdlMensajeFormulario");
const mdlForm = document.getElementById("mdlFormCrearVuelo");
const mdlBtnCrearVuelo = document.getElementById("mdlBtnCrearVuelo");

const mdlAvionError = document.getElementById("mdlAvionError");
const mdlOrigenError = document.getElementById("mdlOrigenError");
const mdlDestinoError = document.getElementById("mdlDestinoError");

const vuelosBodyNuevo = document.getElementById("vuelosBodyNuevo");

// ======================================================================
// UTILIDADES
// ======================================================================
function showError(element, msg) {
    element.textContent = msg;
    element.classList.remove("d-none");
}

function hideError(element) {
    element.textContent = "";
    element.classList.add("d-none");
}

function combinarFechaHora(fecha, hora) {
    if (!fecha || !hora) return null;
    return `${fecha}T${hora}:00`;
}

// ======================================================================
// CARGAR AVIONES OPERATIVOS
// ======================================================================
async function cargarAvionesOperativos() {
    mdlAvion.innerHTML = `<option value="">Seleccione un avión operativo...</option>`;

    try {
        const resp = await fetch(URL_AVIONES_OPERATIVOS);
        if (!resp.ok) throw new Error();

        const aviones = await resp.json();

        aviones.forEach(a => {
            const op = new Option(a.nombreAvion, a.idAvion);
            mdlAvion.appendChild(op);
        });

    } catch (err) {
        showError(mdlAvionError, "Error al cargar aviones operativos.");
    }
}

// ======================================================================
// CARGAR AEROPUERTOS
// ======================================================================
async function cargarAeropuertos() {
    mdlOrigen.innerHTML = `<option value="">Seleccione aeropuerto de origen...</option>`;
    mdlDestino.innerHTML = `<option value="">Seleccione aeropuerto de destino...</option>`;

    try {
        const resp = await fetch(URL_AEROPUERTOS);
        if (!resp.ok) throw new Error();

        const aeropuertos = await resp.json();

        aeropuertos.forEach(a => {
            mdlOrigen.appendChild(new Option(a.nombre, a.idAeropuerto));
            mdlDestino.appendChild(new Option(a.nombre, a.idAeropuerto));
        });

    } catch (err) {
        showError(mdlOrigenError, "Error al cargar aeropuertos.");
        showError(mdlDestinoError, "Error al cargar aeropuertos.");
    }
}

// ======================================================================
// VALIDAR FORMULARIO
// ======================================================================
function validarFormulario() {
    let ok = true;

    hideError(mdlAvionError);
    hideError(mdlOrigenError);
    hideError(mdlDestinoError);
    hideError(mdlMensajeFormulario);

    if (!mdlAvion.value) { showError(mdlAvionError, "Seleccione un avión."); ok = false; }
    if (!mdlOrigen.value) { showError(mdlOrigenError, "Seleccione origen."); ok = false; }
    if (!mdlDestino.value) { showError(mdlDestinoError, "Seleccione destino."); ok = false; }

    if (!mdlFechaSalida.value || !mdlHoraSalida.value ||
        !mdlFechaLlegada.value || !mdlHoraLlegada.value) {
        showError(mdlMensajeFormulario, "Debe completar fechas y horas.");
        ok = false;
    }

    if (parseFloat(mdlPrecioBase.value) < 0) {
        showError(mdlMensajeFormulario, "Precio base inválido.");
        ok = false;
    }

    return ok;
}

// ======================================================================
// SUBMIT — CREAR VUELO
// ======================================================================
mdlForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    const fechaSalidaISO = combinarFechaHora(mdlFechaSalida.value, mdlHoraSalida.value);
    const fechaLlegadaISO = combinarFechaHora(mdlFechaLlegada.value, mdlHoraLlegada.value);

    const payload = {
        fechaSalida: fechaSalidaISO,
        fechaLlegada: fechaLlegadaISO,
        precioBaseVuelo: parseFloat(mdlPrecioBase.value),
        idAvion: parseInt(mdlAvion.value),
        idAeropuertoOrigen: parseInt(mdlOrigen.value),
        idAeropuertoDestino: parseInt(mdlDestino.value)
    };

    try {
        mdlBtnCrearVuelo.disabled = true;

        const resp = await fetch(URL_CREAR_VUELO, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            showError(mdlMensajeFormulario, "Error al crear vuelo.");
            return;
        }

        const data = await resp.json();

        limpiarFormularioVuelo();
        alert(`✔ Vuelo creado correctamente: Código ${data.codigoVuelo ?? "(generado)"}`);
const modal = bootstrap.Modal.getInstance(document.getElementById("modalNuevoVuelo"));

modal.hide();


    } catch (err) {
        showError(mdlMensajeFormulario, "Error de conexión con el servidor.");
    } finally {
        mdlBtnCrearVuelo.disabled = false;
    }
});

// ======================================================================
// CUANDO SE ABRE EL MODAL
// ======================================================================
document.getElementById("modalNuevoVuelo").addEventListener("shown.bs.modal", () => {
    cargarAvionesOperativos();
    cargarAeropuertos();
});
function limpiarFormularioVuelo() {
    // Limpiar campos
    mdlFechaSalida.value = "";
    mdlHoraSalida.value = "";
    mdlFechaLlegada.value = "";
    mdlHoraLlegada.value = "";
    mdlPrecioBase.value = 0;       // si querés que vuelva a 0

    mdlAvion.value = "";
    mdlOrigen.value = "";
    mdlDestino.value = "";

    // Ocultar mensajes de error
    hideError(mdlAvionError);
    hideError(mdlOrigenError);
    hideError(mdlDestinoError);
    hideError(mdlMensajeFormulario);

    // Resetear el formulario (por seguridad)
    mdlForm.reset();
}
