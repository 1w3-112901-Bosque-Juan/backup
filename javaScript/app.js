//
// ====================================================================
//   TEMA GLOBAL + ESTRELLAS SOLO EN HOME
// ====================================================================
//
document.addEventListener("DOMContentLoaded", () => {
  const btnTema = document.getElementById("btnTema");
  const homeSection = document.getElementById("homeSection");

  function aplicarTema(tema) {
    if (tema === "dark") {
      document.body.classList.add("dark");
      if (btnTema) btnTema.textContent = "☀️";
      controlarEstrellas();
    } else {
      document.body.classList.remove("dark");
      if (btnTema) btnTema.textContent = "🌙";
      eliminarEstrellas();
    }
  }

  if (btnTema) {
    btnTema.addEventListener("click", () => {
      const actual = document.body.classList.contains("dark") ? "dark" : "light";
      const nuevo = actual === "dark" ? "light" : "dark";
      localStorage.setItem("tema", nuevo);
      aplicarTema(nuevo);
    });
  }

  aplicarTema(localStorage.getItem("tema") || "light");

  function controlarEstrellas() {
    if (!document.body.classList.contains("dark")) { eliminarEstrellas(); return; }
    const visible = homeSection && homeSection.style.display !== "none";
    if (visible) generarEstrellas(); else eliminarEstrellas();
  }

  function generarEstrellas() {
    if (!homeSection) return;
    if (homeSection.querySelector(".estrella")) return;

    for (let i = 0; i < 60; i++) {
      const star = document.createElement("div");
      star.className = "estrella";
      star.style.top = Math.random() * 100 + "%";
      star.style.left = Math.random() * 100 + "%";
      star.style.animationDelay = Math.random() * 2 + "s";
      homeSection.appendChild(star);
    }
  }

  function eliminarEstrellas() {
    if (!homeSection) return;
    homeSection.querySelectorAll(".estrella").forEach(e => e.remove());
  }

  const links = document.querySelectorAll(
    "#btnHome, #navConsultas, #navDescripcion, #navIntegrantes, #navVuelosReservados, #navVuelos"
  );
  links.forEach(link => link.addEventListener("click", () => setTimeout(controlarEstrellas, 0)));

  setTimeout(controlarEstrellas, 0);
});

//
// ====================================================================
//   NAVEGACIÓN ENTRE SECCIONES
// ====================================================================
//

document.addEventListener("DOMContentLoaded", () => {
  const homeSection = document.getElementById("homeSection");
  const consultasSection = document.getElementById("consultasSection");
  const descripcionSection = document.getElementById("descripcionSection");
  const integrantesSection = document.getElementById("integrantesSection");
  const vuelosReservadosSection = document.getElementById("vuelosReservadosSection");
  const vuelosSection = document.getElementById("vuelosSection");

  const btnHome = document.getElementById("btnHome");
  const navConsultas = document.getElementById("navConsultas");
  const navDescripcion = document.getElementById("navDescripcion");
  const navIntegrantes = document.getElementById("navIntegrantes");
  const navVuelosReservados = document.getElementById("navVuelosReservados");
  const navVuelos = document.getElementById("navVuelos");

  function hideAll() {
    homeSection.style.display = "none";
    consultasSection.style.display = "none";
    descripcionSection.style.display = "none";
    integrantesSection.style.display = "none";
    vuelosReservadosSection.style.display = "none";
    vuelosSection.style.display = "none";
  }

  function showSection(section) {
    hideAll();

    switch (section) {
      case "home":
        homeSection.style.display = "block";
        break;

      case "consultas":
        consultasSection.style.display = "block";

        const hoy = new Date();
        const anioActual = hoy.getFullYear();
        const mesActual = hoy.getMonth() + 1;

        setTimeout(() => {
          document
            .querySelector('#mainTabs button[data-bs-target="#tab-panorama"]')
            ?.click();

          cargarPanorama(anioActual, mesActual);
        }, 300);

        break;

      case "descripcion":
        descripcionSection.style.display = "block";
        break;

      case "integrantes":
        integrantesSection.style.display = "block";
        break;

      case "vuelosReservados":
        vuelosReservadosSection.style.display = "block";
        break;

      case "vuelos":
        vuelosSection.style.display = "block";
        break;
    }
  }

  btnHome?.addEventListener("click", () => showSection("home"));
  navConsultas?.addEventListener("click", () => showSection("consultas"));
  navDescripcion?.addEventListener("click", () => showSection("descripcion"));
  navIntegrantes?.addEventListener("click", () => showSection("integrantes"));
  navVuelosReservados?.addEventListener("click", () => showSection("vuelosReservados"));
  navVuelos?.addEventListener("click", () => showSection("vuelos"));

  showSection("home");
});

//
// ====================================================================
//   PANORAMA COMPLETO
// ====================================================================
//

async function cargarPanorama(anio = null, mes = null) {
  try {
      const token = localStorage.getItem("jwt");

    if (!token) {
      alert("No hay sesión activa. Debe iniciar sesión.");
      return;
    }

    const url = new URL("https://localhost:7061/api/Panorama");
    if (anio) url.searchParams.append("anio", anio);
    if (mes) url.searchParams.append("mes", mes);

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    });

    // 4️⃣ Manejar errores HTTP
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("Error del servidor:", errorText);
      alert("Error al obtener rentabilidad. Ver consola.");
      return;
    }

    const data = await resp.json();

    // ============================
    // KPIs
    // ============================
    const kpiIngresos = document.getElementById("kpiIngresos");
    const kpiIngresosAnterior = document.getElementById("kpiIngresosAnterior");
    const kpiIngresosDelta = document.getElementById("kpiIngresosDelta");
    const kpiOcupacion = document.getElementById("kpiOcupacion");
    const kpiTicket = document.getElementById("kpiTicket");
    const kpiCancel = document.getElementById("kpiCancel");

    if (kpiIngresos)
      kpiIngresos.textContent = "$" + data.ingresosMensuales.toLocaleString("es-AR", { minimumFractionDigits: 2 });

    if (kpiIngresosAnterior)
      kpiIngresosAnterior.textContent = "$" + data.ingresosMesAnterior.toLocaleString("es-AR", { minimumFractionDigits: 2 });

    if (kpiIngresosDelta)
      kpiIngresosDelta.textContent = data.variacionIngresos.toFixed(2) + "%";

    if (kpiOcupacion)
      kpiOcupacion.textContent = data.ocupacionPromedio.toFixed(2) + "%";

    if (kpiTicket)
      kpiTicket.textContent = "$" + data.ticketPromedio.toLocaleString("es-AR", { minimumFractionDigits: 2 });

    if (kpiCancel)
      kpiCancel.textContent = data.tasaCancelacion.toFixed(2) + "%";

    // ============================
    // Mejor mes
    // ============================
    const bestMonth = document.getElementById("bestMonth");
    const bestMonthDetail = document.getElementById("bestMonthDetail");

    if (data.mejorMes && data.mejorMes.nombre_mes !== "Octubre") {
      if (bestMonth) bestMonth.textContent = data.mejorMes.nombre_mes;

      if (bestMonthDetail) {
        bestMonthDetail.innerHTML = `
          <small class="text-muted">
            Total facturado:<br>
            <strong>$${data.mejorMes.total_facturado.toLocaleString("es-AR", {
              minimumFractionDigits: 2
            })}</strong>
          </small>`;
      }
    } else {
      if (bestMonth) bestMonth.textContent = "Octubre";
      if (bestMonthDetail) bestMonthDetail.innerHTML = "";
    }

    // ============================
    // Gráfico rutas populares
    // ============================
    const canvas = document.getElementById("chartRutasPopulares");

    const rutas = Array.isArray(data.rutasPopulares) ? data.rutasPopulares : [];

    if (canvas && typeof Chart !== "undefined") {
      const labels = rutas.map(r => `${r.origen} → ${r.destino}`);
      const valores = rutas.map(r => r.cantidad_vendidos);

      if (window.chartRutas) window.chartRutas.destroy();

      window.chartRutas = new Chart(canvas, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Boletos vendidos",
            data: valores,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                footer: (items) => {
                  const idx = items[0].dataIndex;
                  const r = rutas[idx];
                  return r ? `Mejor mes: ${r.nombre_mes} (#${r.mejor_mes})` : "Agosto";
                }
              }
            }
          }
        }
      });
    }

  } catch (err) {
    console.error("❌ Error cargando Panorama:", err);
  }
}

document.getElementById("btnAplicarFiltrosPanorama")
  ?.addEventListener("click", () => {

    const selA = document.getElementById("filtroAnioPanorama").value;
    const selM = document.getElementById("filtroMesPanorama").value;

    const hoy = new Date();
    const anio = selA === "actual" ? hoy.getFullYear() : parseInt(selA);
    const mes = selM === "actual" ? hoy.getMonth() + 1 : parseInt(selM);

    cargarPanorama(anio, mes);
  });



let chartMargenes = null;

async function cargarRentabilidad(anio = null, mes = null) {
  try {
    const token = localStorage.getItem("jwt");

    if (!token) {
      alert("No hay sesión activa. Debe iniciar sesión.");
      return;
    }

    const url = new URL("https://localhost:7061/api/Rentabilidad/rutas-rentables");
    if (anio) url.searchParams.append("anio", anio);
    if (mes) url.searchParams.append("mes", mes);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      alert("Error al obtener rentabilidad. Ver consola.");
      return;
    }

    const data = await res.json();

    const labels = data.map(r => `${r.origen} → ${r.destino}`);
    const valores = data.map(r => r.margen_total);

    const ctx = document.getElementById("chartMargenes");

    if (ctx && typeof Chart !== "undefined") {
      if (chartMargenes) chartMargenes.destroy();

      chartMargenes = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Margen total ($)",
            data: valores,
            backgroundColor: valores.map(v => v >= 0 ? "rgba(0, 123, 255, 0.7)" : "rgba(220, 53, 69, 0.7)"),
            borderColor: valores.map(v => v >= 0 ? "rgba(0, 123, 255, 1)" : "rgba(220, 53, 69, 1)"),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    const ulAlertas = document.getElementById("alertasMargen");
    if (ulAlertas) {
      ulAlertas.innerHTML = "";

      const perdidas = data.filter(r => r.margen_total < 0);

      if (perdidas.length === 0) {
        ulAlertas.innerHTML =
          `<li class="list-group-item text-success">✔ No hay rutas con pérdida</li>`;
      } else {
        perdidas.forEach(p => {
          const li = document.createElement("li");
          li.className = "list-group-item list-group-item-danger";
          li.textContent = `${p.origen} → ${p.destino}: $${p.margen_total.toLocaleString("es-AR")}`;
          ulAlertas.appendChild(li);
        });
      }
    }

    const tbody = document.getElementById("tblRutasRentables");
    if (tbody) {
      tbody.innerHTML = "";

      data.forEach(r => {
        const fila = `
          <tr>
            <td>${r.origen}</td>
            <td>${r.destino}</td>
            <td>${r.anio}</td>
            <td>${r.mes}</td>
            <td class="${r.margen_total < 0 ? 'text-danger fw-bold' : ''}">
              $${r.margen_total.toLocaleString("es-AR")}
            </td>
          </tr>`;
        tbody.insertAdjacentHTML("beforeend", fila);
      });
    }

  } catch (err) {
    console.error("❌ Error cargando rentabilidad:", err);
  }
}



document.getElementById("btnAplicarFiltrosRent")
  ?.addEventListener("click", () => {

    const anioSel = document.getElementById("filtroAnioRent").value;
    const mesSel = document.getElementById("filtroMesRent").value;

    const hoy = new Date();
    const anio = anioSel === "actual" ? hoy.getFullYear() : parseInt(anioSel);
    const mes = mesSel === "actual" ? hoy.getMonth() + 1 : parseInt(mesSel);

    cargarRentabilidad(anio, mes);
  });

document
  .querySelector('button[data-bs-target="#tab-rentabilidad"]')
  ?.addEventListener("shown.bs.tab", () => {
    const hoy = new Date();
    cargarRentabilidad(hoy.getFullYear(), hoy.getMonth() + 1);
  });

