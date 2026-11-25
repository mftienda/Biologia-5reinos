
(async () => {
const out=document.createElement('pre');out.id='verificacion';document.body.append(out);
const key='biologia-1bach-progreso-v1';
const assert=(condition,msg)=>{if(!condition)throw Error(msg);};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const datos=()=>JSON.parse(localStorage.getItem(key));
async function ruta(hash){
 if(location.hash!==hash){
  const cambiar=new Promise(r=>window.addEventListener('hashchange',r,{once:true}));
  location.hash=hash;await cambiar;
 }
 for(let i=0;i<40;i++){
  const doc=document.querySelector('.panel:not([hidden]) iframe')?.contentDocument;
  if(doc?.querySelector('li, .sheet'))return doc;
  await delay(25);
 }
 throw Error('Ruta '+hash);
}
try {
 if(location.search==='?recuperar'){
  for(const id of ['moneras','protoctistas']){
   const prev=datos()[id];
   assert(prev.resultadoCortas.intentos===1 && prev.ultima.correctas>0,'progreso persistente '+id);
   const pendientes=prev.rotacion.cortas.pendientes.length;
   await ruta('#'+id+'/cortas');
   const actuales=datos()[id].rotacion.cortas.pendientes.length;
   assert(actuales===(pendientes>=8?pendientes-8:bancoDelEjercicio(id,'cortas').length+pendientes-8),'rotación persistente '+id);
  }
  assert(datos().moneras.intentos===4 && datos().moneras.cortas.includes(12),'conservación de puntuación y cortas previas');
  window.confirm=()=>true;document.querySelector('#borrar').click();
  assert(!localStorage.getItem(key) && document.querySelector('#borrar').disabled,'borrado');
  out.textContent='PERSISTENCIA_OK';
  return;
 }
 const originales={intentos:3,correctas:11,total:20,ultima:{correctas:5,total:10},cortas:[12]};
 progreso.moneras=originales;guardar();
 for(const id of ['moneras','protoctistas']){
  const esquema=await ruta('#'+id+'/estudiar');assert(esquema.querySelectorAll('.sheet').length===(id==='protoctistas'?5:3),'esquema');
  const solucionario=await ruta('#'+id+'/solucionario');assert(solucionario.querySelectorAll('li').length===32,'solucionario');
  for(const tipo of ['huecos','cortas']){
   const banco=bancoDelEjercicio(id,tipo);
   assert(banco.length===(tipo==='huecos'?31:21)+(id==='protoctistas'?9:0),'banco '+tipo);
   assert(new Set(banco.map(q=>q.texto)).size===banco.length,'preguntas duplicadas');
   assert(banco.every(q=>q.respuestas.length===(tipo==='huecos'?q.texto.split('___').length-1:1)&&q.respuestas.length<=2),'forma de pregunta');
   if(tipo==='cortas')assert(banco.every(q=>q.respuestas.flat().every(a=>a.trim().split(/\s+/).length<=2)),'máximo de palabras');
   const doc=await ruta('#'+id+'/'+tipo), form=doc.querySelector('form');
   const filas=()=>[...form.querySelectorAll('li')];
   const lectura=()=>filas().map(li=>[...li.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('___'));
   const inicio=lectura();
   const anterior=datos()[id];
   const conteo=d=>tipo==='huecos'?d.intentos:d.resultadoCortas?.intentos??0;
   form.querySelector('[type=submit]').click();
   assert(conteo(datos()[id])===conteo(anterior),'intento vacío');
   doc.querySelector('#soluciones').click();
   const campos=[...form.querySelectorAll('input')];
   const esperadas=campos.map(c=>c.value);
   assert(esperadas.every(Boolean),'soluciones');
   form.querySelector('[type=submit]').click();
   assert(conteo(datos()[id])===conteo(anterior),'intento con soluciones');
   form.querySelector('[type=reset]').click();
   assert(JSON.stringify(inicio)===JSON.stringify(lectura())&&campos.every(c=>!c.value),'reiniciar misma tanda');
   campos.forEach((c,i)=>c.value=i===0?'error deliberado':i===1?'':'  '+normalizarRespuesta(esperadas[i]).toUpperCase().replaceAll(' ','   ')+'  ');
   const pregunta=banco.find(q=>q.texto===inicio[2]);
   if(pregunta?.respuestas[0].length>1)filas()[2].querySelector('input').value=pregunta.respuestas[0].at(-1);
   form.querySelector('[type=submit]').click();
   assert(campos[0].dataset.state==='error'&&campos[1].dataset.state==='empty'&&campos.slice(2).every(c=>c.dataset.state==='ok'),'corrección '+id+' '+tipo);
   form.querySelector('[type=submit]').click();
   assert(conteo(datos()[id])===conteo(anterior)+1,'progreso duplicado');
   let vistas=[...inicio];
   while(vistas.length<banco.length){
    doc.querySelector('#nuevo').click();
    const ronda=lectura();
    assert(new Set(ronda).size===ronda.length,'repetición dentro de una tanda');
    vistas.push(...ronda);
   }
   assert(new Set(vistas.slice(0,banco.length)).size===banco.length,'repetición prematura '+id+' '+tipo);
   assert(document.querySelector('#barra-material a').href.endsWith('.pdf'),'enlace PDF');
  }
 }
 assert(performance.getEntriesByType('resource').every(r=>r.name.startsWith('file:')||r.name.startsWith('about:')),'conexión externa');
 out.textContent='PRUEBA_OK';
} catch(error){out.textContent='PRUEBA_ERROR '+error.stack;}
})();

