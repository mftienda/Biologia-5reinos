"use strict";

const temas = {
  moneras: { titulo: "Las moneras", descripcion: "Bacterias, arqueas y sus funciones vitales.", esquema: "01_esquema_moneras", imagen: "moneras.png", alt: "Dibujo esquemático de una bacteria", icono: "✦" },
  protoctistas: { titulo: "Los protoctistas", descripcion: "Algas, protozoos e importancia ecológica y médica.", esquema: "02_esquema_protoctistas", imagen: "protoctistas.png", alt: "Tres dibujos de algas macroscópicas", icono: "≈", color: "verde" }
};
const apartados = {
  estudiar: "Estudiar",
  huecos: "Rellenar huecos",
  cortas: "Preguntas cortas",
  videos: "Vídeos",
  solucionario: "Solucionario"
};
const clave = "biologia-1bach-progreso-v1";
const aviso = document.querySelector("#aviso-datos");
const paneles = new Map();
let progreso = {};
let activo;

function informar(texto) {
  aviso.textContent = texto;
  aviso.hidden = !texto;
}
try {
  const guardado = JSON.parse(localStorage.getItem(clave) ?? "{}");
  if (guardado && typeof guardado === "object" && !Array.isArray(guardado)) progreso = guardado;
  localStorage.setItem(clave, JSON.stringify(progreso));
} catch {
  informar("El almacenamiento local no está disponible. El progreso se conserva mientras esta página esté abierta.");
}

function guardar() {
  try {
    localStorage.setItem(clave, JSON.stringify(progreso));
  } catch {
    informar("No se ha podido guardar en el navegador. El progreso actual sigue disponible mientras esta página esté abierta.");
  }
  mostrarProgreso();
}

function registro(id) {
  return progreso[id] ??= { intentos: 0, correctas: 0, total: 0, ultima: null, cortas: [] };
}

function elemento(etiqueta, texto, clase) {
  const item = document.createElement(etiqueta);
  if (texto) item.textContent = texto;
  if (clase) item.className = clase;
  return item;
}

function enlace(texto, url, clase) {
  const item = elemento("a", texto, clase);
  item.href = url;
  return item;
}

function mostrarProgreso() {
  const contenedor = document.querySelector("#resultados");
  contenedor.replaceChildren();
  let hayResultados = false;
  for (const [id, tema] of Object.entries(temas)) {
    const { intentos, correctas, total, ultima, cortas, resultadoCortas } = registro(id);
    hayResultados ||= Boolean(intentos || cortas.length);
    const tarjeta = elemento("article", "", "resultado " + (tema.color ?? ""));
    tarjeta.append(elemento("h3", tema.titulo));
    const datos = document.createElement("dl");
    const filas = [
      ["Intentos de rellenar huecos", intentos],
      ["Huecos correctos acumulados", correctas],
      ["Acierto acumulado", total ? porcentaje(correctas, total) : "—"],
      ["Última puntuación", ultima ? ultima.correctas + " / " + ultima.total + " (" + porcentaje(ultima.correctas, ultima.total) + ")" : "—"],
      ["Preguntas cortas revisadas", cortas.length],
      ["Intentos de respuesta corta", resultadoCortas?.intentos ?? 0],
      ["Acierto en respuestas cortas", resultadoCortas?.total ? porcentaje(resultadoCortas.correctas, resultadoCortas.total) : "—"],
      ["Última puntuación en respuestas cortas", resultadoCortas?.ultima ? resultadoCortas.ultima.correctas + " / " + resultadoCortas.ultima.total : "—"]
    ];
    for (const [titulo, valor] of filas) datos.append(elemento("dt", titulo), elemento("dd", String(valor)));
    tarjeta.append(datos);
    contenedor.append(tarjeta);
  }
  document.querySelector("#borrar").disabled = !hayResultados;
}

function porcentaje(correctas, total) {
  return Math.round(100 * correctas / total) + " %";
}

function archivo(id, apartado) {
  const bases = {
    estudiar: temas[id].esquema,
    huecos: "01_rellenar_huecos_" + id,
    cortas: "02_preguntas_cortas_" + id,
    solucionario: "03_solucionario_" + id
  };
  return bases[apartado];
}

function mostrarPuntuacion() {
  const destino = document.querySelector("#puntuacion");
  if (destino) destino.textContent = activo?.estado || "Comprueba las respuestas para ver la puntuación.";
}

function obtenerPanel(id, apartado) {
  const ruta = id + "/" + apartado;
  if (paneles.has(ruta)) return paneles.get(ruta);
  const contenedor = elemento("div", "", "panel");
  const panel = { contenedor, estado: "" };
  paneles.set(ruta, panel);
  if (apartado === "videos") {
    const mensaje = elemento("div", "", "videos");
    mensaje.append(elemento("h2", "Vídeos explicativos"), elemento("p", "Próximamente"));
    contenedor.append(mensaje);
  } else {
    const base = archivo(id, apartado);
    const html = window.materialesBiologia?.[base];
    if (!html) {
      contenedor.append(elemento("p", "No se pudo cargar el material. Comprueba que la carpeta de la aplicación está completa.", "videos"));
    } else {
      const frame = document.createElement("iframe");
      frame.title = apartados[apartado] + " · " + temas[id].titulo;
      const ejercicio = apartado === "huecos" || apartado === "cortas";
      if (!ejercicio || !cargarEjercicio(frame, panel, id, apartado)) frame.srcdoc = html;
      contenedor.append(frame);
    }
  }
  document.querySelector("#paneles").append(contenedor);
  return panel;
}

function navegar() {
  const [id, vista] = location.hash.slice(1).split("/");
  const tema = Object.hasOwn(temas, id) ? temas[id] : null;
  const apartado = Object.hasOwn(apartados, vista) ? vista : "estudiar";
  document.querySelector("#inicio").hidden = Boolean(tema);
  const area = document.querySelector("#tema");
  area.hidden = !tema;
  area.className = tema?.color ?? "";
  document.querySelectorAll("#temas a").forEach(item => {
    if ((item.dataset.tema ?? "") === (tema ? id : "")) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
  if (!tema) return;
  document.querySelector("#titulo-tema").textContent = tema.titulo;
  const nav = document.querySelector("#apartados");
  nav.replaceChildren();
  for (const [key, nombre] of Object.entries(apartados)) {
    const item = enlace(nombre, "#" + id + "/" + key);
    if (key === apartado) item.setAttribute("aria-current", "page");
    nav.append(item);
  }
  const barra = document.querySelector("#barra-material");
  barra.replaceChildren();
  const base = archivo(id, apartado);
  if (base) {
    const esEjercicio = apartado === "huecos" || apartado === "cortas";
    const pdf = enlace(esEjercicio ? "Abrir ficha original en PDF" : "Abrir PDF para imprimir", "materiales/" + encodeURIComponent(base) + ".pdf", "boton");
    pdf.target = "_blank";
    pdf.rel = "noopener";
    barra.append(pdf);
  }
  if (apartado === "huecos" || apartado === "cortas") {
    const estado = elemento("p", "", "puntaje");
    estado.id = "puntuacion";
    estado.setAttribute("role", "status");
    barra.append(estado);
  }
  activo = obtenerPanel(id, apartado);
  for (const panel of paneles.values()) panel.contenedor.hidden = panel !== activo;
  mostrarPuntuacion();
}

for (const [id, tema] of Object.entries(temas)) {
  const url = "#" + id + "/estudiar";
  const nav = enlace(tema.titulo, url);
  nav.dataset.tema = id;
  document.querySelector("#temas").append(nav);

  const tarjeta = elemento("article", "", "tarjeta " + (tema.color ?? ""));
  const contenido = document.createElement("div");
  const titulo = elemento("h2");
  const icono = elemento("span", tema.icono, "icono");
  icono.setAttribute("aria-hidden", "true");
  titulo.append(icono, document.createTextNode(" " + tema.titulo));
  const entrada = enlace("Entrar", url, "boton principal");
  entrada.setAttribute("aria-label", "Entrar en " + tema.titulo.toLowerCase());
  contenido.append(titulo, elemento("p", tema.descripcion), entrada);
  const imagen = document.createElement("img");
  imagen.src = "ilustraciones/" + tema.imagen;
  imagen.alt = tema.alt;
  tarjeta.append(contenido, imagen);
  document.querySelector("#tarjetas").append(tarjeta);
}

document.querySelector("#borrar").addEventListener("click", () => {
  if (!confirm("¿Borrar los resultados guardados de todos los temas?")) return;
  try {
    localStorage.removeItem(clave);
    informar("Resultados borrados.");
  } catch {
    informar("Se han borrado los resultados de esta sesión. El navegador no permite acceder al almacenamiento local.");
  }
  progreso = {};
  mostrarProgreso();
});

window.addEventListener("hashchange", () => {
  navegar();
  window.scrollTo(0, 0);
});
mostrarProgreso();
navegar();
