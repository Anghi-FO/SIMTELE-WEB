let listaMantenimiento = [
    { componente: "Cable principal", horas: 250, estado: "normal" },
    { componente: "Cabina 12", horas: 450, estado: "revision" }
];

let listaSensores = [
    { codigo: "SEN-001", tipo: "Velocidad", lectura: 6 }
];

function calcularDetencionEmergencia() {
    let velocidad = parseFloat(document.getElementById("velInput").value);
    let tiempo = parseFloat(document.getElementById("tiempoInput").value);
    let valorTexto = document.getElementById("distanciaValor");
    let estadoTexto = document.getElementById("distanciaEstado");
    let errorTexto = document.getElementById("errorDetencion");

    if (isNaN(velocidad) || isNaN(tiempo) || velocidad < 0 || tiempo < 0) {
        errorTexto.textContent = "Ingrese valores numéricos válidos mayores o iguales a cero.";
        return;
    }

    errorTexto.textContent = "";
    let distancia = (velocidad / 3.6) * tiempo;
    valorTexto.textContent = `${distancia.toFixed(1).replace(/\.0$/, "")} m`;

    if (distancia > 50) {
        estadoTexto.textContent = "🔴 Supera umbral didáctico (50 m)";
        estadoTexto.style.color = "#c9302c";
    } else {
        estadoTexto.textContent = "🟢 Umbral seguro (≤ 50 m)";
        estadoTexto.style.color = "#2e7d32";
    }
}

function renderizarMantenimiento() {
    let tbody = document.getElementById("tablaMantenimiento");
    tbody.innerHTML = "";

    if (listaMantenimiento.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#64748b;">Sin registros activos.</td></tr>`;
        return;
    }

    for (let i = 0; i < listaMantenimiento.length; i++) {
        let item = listaMantenimiento[i];
        let clasePill = item.estado === "normal" ? "pill-normal" : (item.estado === "revision" ? "pill-revision" : "pill-urgente");
        let etiqueta = item.estado === "normal" ? "Normal" : (item.estado === "revision" ? "Revisión" : "Urgente");

        tbody.innerHTML += `
            <tr>
                <td>${item.componente}</td>
                <td>${item.horas}h</td>
                <td><span class="pill ${clasePill}">${etiqueta}</span></td>
                <td><button type="button" class="btn-icon" onclick="eliminarMantenimiento(${i})" title="Eliminar">🗑️</button></td>
            </tr>
        `;
    }
}

function agregarMantenimiento() {
    let componente = document.getElementById("compInput").value.trim();
    let horas = document.getElementById("horasInput").value.trim();
    let estado = document.getElementById("estadoInput").value;
    let errorTexto = document.getElementById("errorMantenimiento");

    if (componente === "" || horas === "" || isNaN(Number(horas)) || Number(horas) < 0) {
        errorTexto.textContent = "Complete el componente y horas válidas.";
        return;
    }

    errorTexto.textContent = "";
    listaMantenimiento.push({
        componente: componente,
        horas: Number(horas),
        estado: estado
    });

    document.getElementById("compInput").value = "";
    document.getElementById("horasInput").value = "";
    renderizarMantenimiento();
}

function eliminarMantenimiento(indice) {
    listaMantenimiento.splice(indice, 1);
    renderizarMantenimiento();
}

function eliminarUltimoMantenimiento() {
    if (listaMantenimiento.length > 0) {
        listaMantenimiento.pop();
        renderizarMantenimiento();
    }
}

function analizarVientoOscilacion() {
    let ids = ["v1", "v2", "v3", "v4", "v5"];
    let mediciones = [];
    let errorTexto = document.getElementById("errorViento");

    for (let i = 0; i < ids.length; i++) {
        let val = parseFloat(document.getElementById(ids[i]).value);
        if (isNaN(val) || val < 0) {
            errorTexto.textContent = "Ingrese las 5 mediciones numéricas válidas.";
            return;
        }
        mediciones.push(val);
    }

    errorTexto.textContent = "";
    let suma = 0;
    let maximo = mediciones[0];

    mediciones.forEach(m => {
        suma += m;
        if (m > maximo) {
            maximo = m;
        }
    });

    let promedio = suma / mediciones.length;
    let clasificacion = "Leve";

    if (maximo > 55) {
        clasificacion = "Crítico";
    } else if (maximo >= 35) {
        clasificacion = "Moderado";
    }

    document.getElementById("vientoPromedio").textContent = `${promedio.toFixed(1).replace(/\.0$/, "")} km/h`;
    document.getElementById("vientoMaximo").textContent = `${maximo} km/h`;
    document.getElementById("vientoClasificacion").textContent = clasificacion;

    actualizarGraficoViento(mediciones, maximo);
}

function actualizarGraficoViento(datos, maxVal) {
    let tope = maxVal > 0 ? maxVal * 1.15 : 60;
    let puntosX = [45, 125, 205, 285, 365];
    let coords = [];

    for (let i = 0; i < datos.length; i++) {
        let y = 90 - ((datos[i] / tope) * 70);
        coords.push(`${puntosX[i]},${y.toFixed(1)}`);

        let circulo = document.getElementById(`pt${i + 1}`);
        if (circulo) {
            circulo.setAttribute("cx", puntosX[i]);
            circulo.setAttribute("cy", y.toFixed(1));
        }
    }

    let linea = document.getElementById("lineaViento");
    let area = document.getElementById("areaViento");
    if (linea) linea.setAttribute("points", coords.join(" "));
    if (area) area.setAttribute("points", `45,90 ${coords.join(" ")} 365,90`);
}

function renderizarSensores() {
    let tbody = document.getElementById("tablaSensores");
    tbody.innerHTML = "";

    if (listaSensores.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b;">Sin sensores registrados.</td></tr>`;
        return;
    }

    for (let i = 0; i < listaSensores.length; i++) {
        let s = listaSensores[i];
        tbody.innerHTML += `
            <tr>
                <td><strong>${s.codigo}</strong></td>
                <td>${s.tipo}</td>
                <td>${s.lectura}</td>
                <td><span class="pill pill-valido">Válido</span></td>
                <td><button type="button" class="btn-icon" onclick="eliminarSensor(${i})" title="Eliminar">🗑️</button></td>
            </tr>
        `;
    }
}

function registrarSensor() {
    let codigo = document.getElementById("sensorCodigo").value.trim();
    let tipo = document.getElementById("sensorTipo").value;
    let lecturaStr = document.getElementById("sensorLectura").value.trim();
    let errorTexto = document.getElementById("errorSensor");
    let patron = /^SEN-\d{3}$/;

    if (codigo === "" || lecturaStr === "" || isNaN(Number(lecturaStr))) {
        errorTexto.textContent = "Error: Código o lectura vacía / no numérica.";
        return;
    }

    if (!patron.test(codigo)) {
        errorTexto.textContent = "Error: Formato inválido. Use SEN-000 (ej. SEN-001).";
        return;
    }

    errorTexto.textContent = "";
    listaSensores.push({
        codigo: codigo,
        tipo: tipo,
        lectura: Number(lecturaStr)
    });

    document.getElementById("sensorCodigo").value = "";
    document.getElementById("sensorLectura").value = "";
    renderizarSensores();
}

function eliminarSensor(indice) {
    listaSensores.splice(indice, 1);
    renderizarSensores();
}

function iniciarTemporizador() {
    let segundosTotales = 7200;
    let display = document.getElementById("relojClase");
    setInterval(() => {
        if (segundosTotales <= 0) return;
        segundosTotales--;
        let h = String(Math.floor(segundosTotales / 3600)).padStart(2, "0");
        let m = String(Math.floor((segundosTotales % 3600) / 60)).padStart(2, "0");
        let s = String(segundosTotales % 60).padStart(2, "0");
        if (display) display.textContent = `${h}:${m}:${s}`;
    }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnDetencion").addEventListener("click", calcularDetencionEmergencia);
    document.getElementById("btnAgregarMant").addEventListener("click", agregarMantenimiento);
    document.getElementById("btnEliminarUltMant").addEventListener("click", eliminarUltimoMantenimiento);
    document.getElementById("btnViento").addEventListener("click", analizarVientoOscilacion);
    document.getElementById("btnAgregarSensor").addEventListener("click", registrarSensor);

    renderizarMantenimiento();
    renderizarSensores();
    analizarVientoOscilacion();
    iniciarTemporizador();
});