"use strict";

const unidad = {
  hongos: {
    titulo: "Hongos", color: "ocre", icono: "🍄",
    descripcion: "Levaduras, mohos y hongos que forman setas.",
    resumen: [
      ["Cómo son", "Son eucariotas y su pared celular contiene quitina. Las levaduras son unicelulares. En muchos hongos pluricelulares, las hifas forman una red llamada micelio."],
      ["Cómo se nutren", "Son heterótrofos. Liberan enzimas al medio y absorben los nutrientes tras la digestión externa."],
      ["Reproducción y ejemplos", "Muchos se reproducen mediante esporas. Los mohos y los hongos que forman setas son ejemplos de este reino. Muchos hongos descomponen materia orgánica."],
    ],
    huecos: [
      ["La pared celular de los hongos contiene ___.", "quitina"],
      ["Los filamentos de muchos hongos pluricelulares se llaman ___.", "hifas"],
      ["El conjunto de hifas forma el ___.", "micelio"],
      ["Muchos hongos se dispersan mediante ___.", "esporas"],
      ["Las levaduras son hongos ___.", "unicelulares"],
    ],
    cortas: [
      ["¿Qué tipo de célula tienen los hongos?", "eucariota", "eucariotas", "eucariótica"],
      ["¿Cómo incorporan los nutrientes tras la digestión externa?", "absorción", "por absorción"],
      ["¿Cómo se llama la red de filamentos de un hongo?", "micelio"],
      ["¿Qué hongos unicelulares se usan para hacer pan?", "levaduras", "la levadura", "levadura"],
    ],
  },
  plantas: {
    titulo: "Plantas", color: "verde", icono: "🌿",
    descripcion: "Musgos, helechos y plantas con semillas.",
    resumen: [
      ["Cómo son", "Son eucariotas pluricelulares. Sus células tienen pared celular de celulosa. En las partes verdes, los cloroplastos contienen clorofila."],
      ["Cómo se nutren", "La mayoría realiza la fotosíntesis. Con energía luminosa transforma agua y dióxido de carbono en materia orgánica y libera oxígeno."],
      ["Grupos y ejemplos", "Musgos y helechos se dispersan por esporas. Las gimnospermas, como los pinos, producen semillas sin fruto. En las angiospermas, como el manzano, las semillas quedan dentro del fruto."],
    ],
    huecos: [
      ["La pared celular de las plantas contiene ___.", "celulosa"],
      ["Las plantas obtienen materia orgánica a partir de agua y dióxido de carbono mediante la ___.", "fotosíntesis"],
      ["El pigmento verde de los cloroplastos es la ___.", "clorofila"],
      ["Los pinos pertenecen al grupo de las ___.", "gimnospermas"],
      ["En las angiospermas, las semillas quedan dentro del ___.", "fruto"],
    ],
    cortas: [
      ["¿En qué orgánulos se realiza la fotosíntesis?", "cloroplastos", "cloroplasto", "los cloroplastos"],
      ["¿Qué gas liberan las plantas durante la fotosíntesis?", "oxígeno", "o2"],
      ["¿Cómo se llaman las plantas que producen flores y frutos?", "angiospermas"],
      ["¿Qué estructuras permiten la dispersión de los helechos?", "esporas", "las esporas"],
    ],
  },
  animales: {
    titulo: "Animales", color: "terracota", icono: "🦊",
    descripcion: "Desde las esponjas hasta los vertebrados.",
    resumen: [
      ["Cómo son", "Son eucariotas pluricelulares y sus células carecen de pared celular. La mayoría tiene tejidos especializados y puede desplazarse en alguna fase de su vida."],
      ["Cómo se nutren", "Son heterótrofos. Generalmente incorporan el alimento por ingestión y lo digieren para obtener nutrientes."],
      ["Grupos y ejemplos", "Los vertebrados, como peces y aves, tienen columna vertebral. Los invertebrados incluyen grupos como los moluscos, los artrópodos y los cnidarios."],
    ],
    huecos: [
      ["Los animales tienen muchas células, por lo que son ___.", "pluricelulares", "multicelulares"],
      ["Como obtienen materia orgánica de otros seres vivos, los animales son ___.", "heterótrofos"],
      ["Los animales con columna vertebral son ___.", "vertebrados"],
      ["La incorporación de alimento en la mayoría de los animales se llama ___.", "ingestión"],
      ["Los insectos y los crustáceos pertenecen al grupo de los ___.", "artrópodos"],
    ],
    cortas: [
      ["¿Qué tipo de célula tienen los animales?", "eucariota", "eucariotas", "eucariótica"],
      ["¿Qué estructura del esqueleto distingue a los vertebrados?", "columna vertebral", "la columna vertebral"],
      ["¿A qué grupo de invertebrados pertenecen los pulpos?", "moluscos", "los moluscos"],
      ["¿Cómo se llama el tipo de nutrición de los animales?", "heterótrofa", "nutrición heterótrofa"],
    ],
  },
};

for (const [id, reino] of Object.entries(unidad)) {
  window.bancoPreguntas[id] = {};
  for (const tipo of ["huecos", "cortas"]) {
    window.bancoPreguntas[id][tipo] = reino[tipo].map(([texto, ...opciones], indice) => ({
      id: (tipo === "huecos" ? "h" : "c") + (indice + 1),
      area: reino.titulo,
      nivel: "Introducción",
      texto,
      respuestas: [opciones],
    }));
  }
}
