// =======================
//  VARIABLE GLOBAL
// =======================
let vuelos = []; // <- importante: global y usado por todos los handlers


// ======================================================
//    CARGA DE DATOS DESDE EL ENDPOINT
// ======================================================
async function cargarVuelosReservados() {
  try {
    const resp = await fetch("https://localhost:7061/abmc/reservaVuelo/vuelos_reservados");
    if (!resp.ok) throw new Error("Error HTTP: " + resp.status);

    const data = await resp.json();

    console.log("Vuelos reservados recibidos:", data);

    // Guardar en la variable global para que los handlers (editar/eliminar) la usen
    vuelos = Array.isArray(data) ? data : [data];

    renderCards(vuelos, "admin", "vuelosReservados");
  } catch (error) {
    console.error("Error cargando vuelos reservados:", error);
  }
}

cargarVuelosReservados();


// ======================================================
//    RENDER GENERAL DE CARDS
// ======================================================
function renderCards(lista, modo, idContenedor) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;

  contenedor.innerHTML = lista.map(v => createCard(v, modo)).join("");
}


// ======================================================
//    FORMATEAR FECHA D/M/Y
// ======================================================
function formatearFecha(fechaIso) {
  if (!fechaIso) return "-";
  const f = new Date(fechaIso);
  return `${f.getDate()}/${f.getMonth() + 1}/${f.getFullYear()}`;
}


// ======================================================
//    CREACIÓN DE UNA CARD
// ======================================================
function createCard(vuelo, modo) {
  // Aseguramos tener un identificador consistente: preferimos idDetalleVuelo, si no existe usamos id
  const idDetalle = vuelo.idDetalleVuelo ?? vuelo.id;

  // Iconos con clase btn-eliminar / btn-editar y data-id consistente
  const iconoEliminar = `
    <i class="bi bi-trash text-danger fs-4 me-3 cursor-pointer btn-eliminar"
       data-id="${idDetalle}"></i>`;

  const iconoEditar = `
    <i class="bi bi-pencil-square text-primary fs-4 cursor-pointer btn-editar"
       data-id="${idDetalle}"></i>`;

  // Datos formateados (con safe navigation)
  const pasajeroNombre = `${vuelo.pasajero?.nombre ?? ""} ${vuelo.pasajero?.apellido ?? ""}`.trim();
  const asientoNumero  = vuelo.asiento?.numero ?? "-";
  const codigoVuelo    = vuelo.vuelo?.codigoVuelo ?? "-";
  const fechaSalida    = formatearFecha(vuelo.vuelo?.fechaSalida);
  const origen         = vuelo.vuelo?.aeropuertoOrigen ?? "-";
  const destino        = vuelo.vuelo?.aeropuertoDestino ?? "-";
  const precioFinal    = (vuelo.precioFinal ?? 0).toLocaleString("es-AR");

  return `
    <div class="col-12">
      <div class="card-soft p-3">

        <div class="row align-items-start gx-4">

          <!-- IZQUIERDA -->
          <div class="col-12 col-md-6">
            <h5 class="fw-bold">${origen} → ${destino}</h5>

            <p class="m-0"><strong>Código vuelo:</strong> ${codigoVuelo}</p>
            <p class="m-0"><strong>Fecha salida:</strong> ${fechaSalida}</p>
            <p class="m-0"><strong>Asiento Nº:</strong> ${asientoNumero}</p>
          </div>

          <!-- DERECHA -->
          <div class="col-12 col-md-6">
            <p class="m-0"><strong>Pasajero:</strong> ${pasajeroNombre}</p>
            <p class="m-0"><strong>Precio final:</strong> $${precioFinal}</p>

            <div class="d-flex justify-content-end mt-2">
              ${iconoEliminar} 
              ${iconoEditar}
            </div>
          </div>

        </div>

      </div>
    </div>
  `;
}


// ======================================================
//   CLICK EN EDITAR → ABRIR MODAL (delegación mejorada)
// ======================================================
document.addEventListener("click", function (e) {
  // usamos closest para que funcione aunque el click venga de un nodo interno del <i>
  const editarBtn = e.target.closest(".btn-editar");
  if (!editarBtn) return;

  const idVuelo = parseInt(editarBtn.getAttribute("data-id"), 10);

  // buscar en la variable global 'vuelos'
  const vuelo = vuelos.find(v => (v.idDetalleVuelo ?? v.id) == idVuelo);
  if (!vuelo) {
    console.warn("Vuelo no encontrado para editar. id:", idVuelo);
    return;
  }

  // cargar valores en el modal (adaptá los campos reales)
  document.getElementById("editId").value = idVuelo;
  document.getElementById("editOrigen").value = vuelo.vuelo?.aeropuertoOrigen ?? "";
  document.getElementById("editDestino").value = vuelo.vuelo?.aeropuertoDestino ?? "";
  document.getElementById("editPrecio").value = vuelo.precioFinal ?? "";
  document.getElementById("editAsiento").value = vuelo.asiento?.numero ?? "";
  document.getElementById("editPasajero").value = `${vuelo.pasajero?.nombre ?? ""} ${vuelo.pasajero?.apellido ?? ""}`.trim();
  document.getElementById("editDni").value = vuelo.pasajero?.nroDoc ?? "";

  // abrir modal (Bootstrap)
  const modal = new bootstrap.Modal(document.getElementById("editVueloModal"));
  modal.show();
});


// ======================================================
//   GUARDAR CAMBIOS DEL FORMULARIO (UPDATE local + opcional fetch PATCH/PUT)
// ======================================================
document.getElementById("editVueloForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const id = parseInt(document.getElementById("editId").value, 10);
  const idx = vuelos.findIndex(v => (v.idDetalleVuelo ?? v.id) == id);
  if (idx === -1) {
    alert("Vuelo no encontrado para actualizar.");
    return;
  }

  // Actualizar localmente (adaptá según campos reales)
  vuelos[idx].vuelo = vuelos[idx].vuelo || {};
  vuelos[idx].vuelo.aeropuertoOrigen = document.getElementById("editOrigen").value;
  vuelos[idx].vuelo.aeropuertoDestino = document.getElementById("editDestino").value;
  vuelos[idx].precioFinal = Number(document.getElementById("editPrecio").value) || vuelos[idx].precioFinal;
  vuelos[idx].asiento = vuelos[idx].asiento || {};
  vuelos[idx].asiento.numero = document.getElementById("editAsiento").value;
  // Si querés separar nombre y apellido, parsealo; aquí lo dejo simple:
  const pasajeroStr = document.getElementById("editPasajero").value;
  const [nombre, ...apellido] = pasajeroStr.split(" ");
  vuelos[idx].pasajero = vuelos[idx].pasajero || {};
  vuelos[idx].pasajero.nombre = nombre ?? vuelos[idx].pasajero.nombre;
  vuelos[idx].pasajero.apellido = apellido.join(" ") ?? vuelos[idx].pasajero.apellido;
  vuelos[idx].pasajero.nroDoc = document.getElementById("editDni").value || vuelos[idx].pasajero.nroDoc;

  try {
 

    // Re-renderizar UI
    renderCards(vuelos, "admin", "vuelosReservados");

    const modal = bootstrap.Modal.getInstance(document.getElementById("editVueloModal"));
    modal.hide();
  } catch (err) {
    console.error("Error actualizando en backend:", err);
    alert("Error al guardar cambios en el servidor (si se intentó).");
  }
});


// ======================================================
//   CLICK EN ELIMINAR → ABRIR MODAL DE CONFIRMACIÓN (delegación)
// ======================================================
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("btn-eliminar")) {

    const idDetalle = e.target.getAttribute("data-id");

    // GUARDAR ID EN EL MODAL
    document.getElementById("deleteId").value = idDetalle;

    // BUSCAR EL VUELO
    const vuelo = vuelos.find(v => v.idDetalleVuelo == idDetalle);

    if (vuelo) {
      // DATOS
      const pasajero = `${vuelo.pasajero.nombre} ${vuelo.pasajero.apellido}`;
      const codigoVuelo = vuelo.vuelo.codigoVuelo;

      // MENSAJE BONITO
      const mensaje = `
        ¿Desea eliminar la reserva del vuelo <strong>${codigoVuelo}</strong>
        correspondiente al pasajero <strong>${pasajero}</strong>?
      `;

      // INSERTAR EN EL MODAL
      document.getElementById("deleteMessage").innerHTML = mensaje;
    }

    // MOSTRAR MODAL
    const modal = new bootstrap.Modal(document.getElementById("deleteVueloModal"));
    modal.show();
  }
});

document.getElementById("btnDeleteConfirm").addEventListener("click", async function () {
  const idDetalle = document.getElementById("deleteId").value;

  try {
    const response = await fetch(`https://localhost:7061/abmc/reservaVuelo/${idDetalle}`, {
      method: "DELETE",
      headers: { "Accept": "application/json" }
    });

    const result = await response.json();

    if (!result) {
      alert("❌ No se pudo eliminar la reserva.");
      return;
    }

    alert("✔ Reserva eliminada.");

    // BORRAR DEL ARRAY LOCAL
    const index = vuelos.findIndex(v => v.idDetalleVuelo == idDetalle);
    if (index !== -1) vuelos.splice(index, 1);

    renderCards(vuelos, "admin", "vuelosReservados");

  } catch (error) {
    console.error("Error eliminando:", error);
    alert("⚠ Error de servidor.");
  }

  const modal = bootstrap.Modal.getInstance(document.getElementById("deleteVueloModal"));
  modal.hide();
});



// // ======================================================
// //   CONFIRMAR ELIMINACIÓN (DELETE al backend y actualizar UI)
// // ======================================================
// document.getElementById("btnDeleteConfirm").addEventListener("click", async function () {
//   const id = parseInt(document.getElementById("deleteId").value, 10);

//   try {
//     // Asegurate que la ruta coincida con la de tu backend (ej: /abmc/{idDetalleVuelo})
//     const response = await fetch(`https://localhost:7061/abmc/${id}`, {
//       method: "DELETE",
//       headers: { "Accept": "application/json" }
//     });

//     // Si tu backend devuelve un booleano: true/false
//     const result = await response.json();

//     if (!response.ok) {
//       console.error("Error HTTP al eliminar:", response.status);
//       alert("No se pudo eliminar en el servidor. Revisa la consola.");
//       return;
//     }

//     if (!result) {
//       alert("❌ No se pudo eliminar la reserva (respuesta del backend false).");
//       return;
//     }

//     // Si todo ok: eliminar del array global por id
//     const index = vuelos.findIndex(v => (v.idDetalleVuelo ?? v.id) == id);
//     if (index !== -1) vuelos.splice(index, 1);

//     // Re-renderizar
//     renderCards(vuelos, "admin", "vuelosReservados");

//     alert("✔ Reserva eliminada correctamente.");
//   } catch (error) {
//     console.error("Error eliminando reserva:", error);
//     alert("⚠ Error de conexión con el servidor.");
//   } finally {
//     // cerrar modal
//     const modal = bootstrap.Modal.getInstance(document.getElementById("deleteVueloModal"));
//     if (modal) modal.hide();
//   }
// });
// ======================================================
//   BUSCAR RESERVA POR NOMBRE Y APELLIDO (coincidencias parciales)
// ======================================================
document.getElementById("buscarreservaClienteBtn").addEventListener("click", function () {
  const input = document.getElementById("clienteinput").value.trim().toLowerCase();

  // Si el campo está vacío → restaurar todas
  if (!input) {
    renderCards(vuelos, "admin", "vuelosReservados");
    document.getElementById("vuelosReservadosSection").style.display = "block";
    return;
  }

  // Filtrar en el array global 'vuelos' por coincidencia parcial en nombre o apellido
  const filtrados = vuelos.filter(v => {
    const nombre = v.pasajero?.nombre?.toLowerCase() ?? "";
    const apellido = v.pasajero?.apellido?.toLowerCase() ?? "";
    const nombreCompleto = `${nombre} ${apellido}`;
    return nombre.includes(input) || apellido.includes(input) || nombreCompleto.includes(input);
  });

  // Renderizar resultados
  renderCards(filtrados, "admin", "vuelosReservados");
  document.getElementById("vuelosReservadosSection").style.display = "block";

  // Mensaje si no hay resultados
  if (filtrados.length === 0) {
    document.getElementById("vuelosReservados").innerHTML =
      `<div class="alert alert-warning">No se encontraron reservas para "${input}".</div>`;
  }
});
