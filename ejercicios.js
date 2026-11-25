"use strict";

function normalizarRespuesta(valor) {
  return valor.normalize("NFKD").toLowerCase().replace(/\p{M}/gu, "").replace(/\s+/g, " ").trim();
}

function bancoDelEjercicio(id, tipo) {
  const propias = window.bancoPreguntas[id]?.[tipo] ?? [];
  if (tipo !== "huecos" || !archivo(id, tipo)) return propias;
  const material = new DOMParser().parseFromString(window.materialesBiologia[archivo(id, tipo)], "text/html");
  const anteriores = [...material.querySelectorAll("#huecos li")].map((fila, indice) => {
    const area = fila.querySelector(".topic").textContent;
    const respuestas = [...fila.querySelectorAll("input")].map(campo => campo.dataset.answers.split("~"));
    fila.querySelector(".topic").remove();
    fila.querySelectorAll(".slot").forEach(hueco => hueco.replaceWith("___"));
    return {
      id: "h-original-" + (indice + 1),
      area,
      nivel: respuestas.length === 1 ? "Fácil" : "Media",
      texto: fila.textContent.trim(),
      respuestas
    };
  });
  return [...anteriores, ...propias];
}

function barajar(items) {
  const orden = [...items];
  for (let i = orden.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  return orden;
}

function elegirPreguntas(id, tipo, banco) {
  const datos = registro(id);
  const rotacion = datos.rotacion ??= {};
  const indice = new Map(banco.map(pregunta => [pregunta.id, pregunta]));
  const ids = [...indice.keys()];
  const ciclo = rotacion[tipo];
  let cola = ciclo?.ids.length === ids.length && ids.every(clave => ciclo.ids.includes(clave))
    ? ciclo.pendientes.filter(clave => indice.has(clave))
    : barajar(ids);
  const cantidad = Math.min(tipo === "huecos" ? 10 : 8, ids.length);
  const tanda = cola.splice(0, cantidad);
  if (tanda.length < cantidad) {
    const usadosEnTanda = new Set(tanda);
    const nuevoCiclo = barajar(ids);
    cola = nuevoCiclo.filter(clave => !usadosEnTanda.has(clave))
      .concat(nuevoCiclo.filter(clave => usadosEnTanda.has(clave)));
    tanda.push(...cola.splice(0, cantidad - tanda.length));
  }
  rotacion[tipo] = { ids, pendientes: cola };
  guardar();
  return tanda.map(clave => indice.get(clave));
}

function cargarEjercicio(frame, panel, id, tipo) {
  const banco = bancoDelEjercicio(id, tipo);
  if (!banco.length) return false;
  const ficha = archivo(id, tipo) ?? archivo("moneras", tipo);
  const original = new DOMParser().parseFromString(window.materialesBiologia[ficha], "text/html");
  const estilo = original.querySelector("style").textContent;
  const esHuecos = tipo === "huecos";
  const titulo = apartados[tipo];
  const instrucciones = esHuecos
    ? "Completa cada frase con los términos de los apuntes."
    : "Responde con una expresión breve. Después, comprueba tus respuestas.";
  const color = temas[id].color === "verde" ? "green" : "";
  frame.srcdoc = `<!doctype html><html lang="es"><meta charset="utf-8">
<title>${titulo}</title><style>${estilo} .short-field{display:block;margin-top:5px}.actions{align-items:center}</style>
<body class="${color}"><main><article class="sheet"><header><strong>Biología · 1.º de Bachillerato</strong>
<h1>${titulo}</h1></header><p class="intro">${instrucciones}</p><form>
<div class="actions"><button type="submit">Comprobar respuestas</button><button type="button" id="soluciones">Mostrar soluciones</button>
<button type="reset">Reiniciar</button><button type="button" id="nuevo">Nuevo ejercicio</button></div>
<p class="status" role="status"></p><ol></ol><div class="actions"><button type="submit">Comprobar respuestas</button></div>
<p class="status" role="status"></p></form></article></main></body></html>`;
  frame.addEventListener("load", () => {
    const doc = frame.contentDocument;
    const form = doc.querySelector("form");
    const nodoLista = form.querySelector("ol");
    let campos = [];
    let reveladas = false;
    let ultimaRevision = null;

    function estado(texto) {
      panel.estado = texto;
      form.querySelectorAll(".status").forEach(nodo => { nodo.textContent = texto; });
      mostrarPuntuacion();
    }

    function limpiar(campo) {
      delete campo.dataset.state;
      campo.removeAttribute("aria-invalid");
      campo.nextElementSibling.textContent = "";
    }

    function marcar(campo, valor, mensaje) {
      campo.dataset.state = valor;
      campo.nextElementSibling.textContent = mensaje;
      if (valor === "error") campo.setAttribute("aria-invalid", "true");
    }

    function prepararCampo(pregunta, opciones, numero, hueco) {
      const envoltura = doc.createElement("span");
      envoltura.className = esHuecos ? "slot" : "short-field";
      const campo = doc.createElement("input");
      campo.type = "text";
      campo.className = "blank";
      campo.autocomplete = "off";
      campo.spellcheck = false;
      campo.setAttribute("aria-label", "Pregunta " + numero + (esHuecos ? ", hueco " + hueco : ""));
      const marca = doc.createElement("span");
      marca.className = "mark";
      envoltura.append(campo, marca);
      campos.push({ campo, opciones, aceptadas: opciones.map(normalizarRespuesta), pregunta });
      campo.addEventListener("input", () => { limpiar(campo); estado(""); });
      return envoltura;
    }

    function nuevaTanda(enfocar) {
      reveladas = false;
      ultimaRevision = null;
      campos = [];
      nodoLista.replaceChildren();
      elegirPreguntas(id, tipo, banco).forEach((pregunta, indice) => {
        const li = doc.createElement("li");
        const etiqueta = doc.createElement("span");
        etiqueta.className = "topic";
        etiqueta.textContent = pregunta.area + " · " + pregunta.nivel;
        li.append(etiqueta);
        if (esHuecos) {
          pregunta.texto.split("___").forEach((parte, i) => {
            if (i) li.append(prepararCampo(pregunta, pregunta.respuestas[i - 1], indice + 1, i));
            li.append(parte);
          });
        } else {
          li.append(pregunta.texto, prepararCampo(pregunta, pregunta.respuestas[0], indice + 1));
        }
        nodoLista.append(li);
      });
      estado("");
      if (enfocar) campos[0].campo.focus();
    }

    form.addEventListener("submit", event => {
      event.preventDefault();
      const respuestas = campos.map(({ campo }) => normalizarRespuesta(campo.value));
      let correctas = 0;
      let enBlanco = 0;
      campos.forEach(({ campo, aceptadas }, i) => {
        limpiar(campo);
        if (!respuestas[i]) {
          enBlanco++;
          marcar(campo, "empty", "Sin responder");
        } else if (aceptadas.includes(respuestas[i])) {
          correctas++;
          marcar(campo, "ok", "Correcta");
        } else {
          marcar(campo, "error", "Revisa la respuesta");
        }
      });
      const total = campos.length;
      if (enBlanco === total) {
        estado("Escribe al menos una respuesta para registrar el intento.");
        return;
      }
      estado(correctas + " de " + total + (esHuecos ? " huecos correctos" : " respuestas correctas") +
        " (" + porcentaje(correctas, total) + ") · " + enBlanco + " sin responder" +
        (reveladas ? " · Práctica con soluciones" : ""));
      const revision = JSON.stringify(respuestas);
      if (reveladas || revision === ultimaRevision) return;
      ultimaRevision = revision;
      const datos = registro(id);
      const resumen = { correctas, total };
      if (esHuecos) {
        datos.intentos++;
        datos.correctas += correctas;
        datos.total += total;
        datos.ultima = resumen;
      } else {
        const cortas = datos.resultadoCortas ??= { intentos: 0, correctas: 0, total: 0 };
        cortas.intentos++;
        cortas.correctas += correctas;
        cortas.total += total;
        cortas.ultima = resumen;
        const revisadas = new Set(datos.cortas);
        campos.forEach(({ pregunta }, i) => {
          if (respuestas[i]) revisadas.add(Number(pregunta.id.slice(1)));
        });
        datos.cortas = [...revisadas];
      }
      guardar();
    });

    form.addEventListener("reset", () => {
      reveladas = false;
      ultimaRevision = null;
      campos.forEach(({ campo }) => limpiar(campo));
      estado("");
    });

    doc.querySelector("#soluciones").addEventListener("click", () => {
      reveladas = true;
      campos.forEach(({ campo, opciones }) => {
        limpiar(campo);
        campo.value = opciones[0];
        marcar(campo, "shown", "Solución");
      });
      estado("Soluciones mostradas. Reinicia o inicia otro ejercicio para registrar un intento.");
    });

    doc.querySelector("#nuevo").addEventListener("click", () => nuevaTanda(true));
    nuevaTanda(false);
  }, { once: true });
  return true;
}
