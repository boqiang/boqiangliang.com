import * as THREE from 'three';
import './style.css';

const categories = [
  { title: '技术', subtitle: 'SYSTEMS & CRAFT', color: '#244653', blurb: '软件系统、AI 工作流，以及把复杂事情做成可靠产品的记录。', entries: ['AI 工作流与 Agent 系统', 'Kubernetes 与可靠部署', '软件工程的长期主义'] },
  { title: '产品', subtitle: 'IDEAS & PRACTICE', color: '#ad6634', blurb: '从用户问题出发，把模糊想法变成可验证、可持续的产品。', entries: ['从问题到产品', '个人工具与效率系统', '创业中的取舍'] },
  { title: '写作', subtitle: 'STORIES & WORLDS', color: '#705978', blurb: '小说、叙事结构，以及用故事理解世界的尝试。', entries: ['叙事与世界观', '长篇小说计划', '阅读札记'] },
  { title: '生活', subtitle: 'NOTES & WALKS', color: '#48705b', blurb: '工作之外，关于城市、旅行、阅读和日常观察的片段。', entries: ['城市漫游', '最近在读', '一些小小的发现'] }
];

const app = document.querySelector('#app');
app.innerHTML = `<div class="visual-backdrop" aria-hidden="true"></div><div class="moon-orb" aria-hidden="true"></div><canvas id="scene"></canvas><div class="weather-hud" aria-hidden="true"><span class="weather-state"></span><span></span></div><button class="sound-toggle" type="button" aria-label="ambient sound" aria-pressed="false"></button>`;
const visualBackdrop = document.querySelector('.visual-backdrop');
const moonOrb = document.querySelector('.moon-orb');
const dayRoomImage = "url('/images/white-sea-study-open-window.png?v=0.0.20')";
const nightRoomImage = "url('/images/white-sea-study-night-open-window.png?v=0.0.20')";
function setRoomTime(night){
  visualBackdrop.style.backgroundImage = `linear-gradient(90deg,rgba(247,247,243,.18),rgba(247,247,243,.02) 48%,rgba(247,247,243,.16)),${night ? nightRoomImage : dayRoomImage}`;
}
setRoomTime(false);

const scene = new THREE.Scene();
scene.background = null;
scene.fog = new THREE.Fog('#f7f7f3', 9, 25);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, .1, 100);
camera.position.set(0, 3.05, 10.8); camera.lookAt(0, 2.7, 0);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#scene'), antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

scene.add(new THREE.HemisphereLight('#ffffff', '#bfc0ba', 2.1));
const sun = new THREE.DirectionalLight('#fff5df', 3.8); sun.position.set(-5, 9, 5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
const lamp = new THREE.PointLight('#ffe3b2', 1.8, 7); lamp.position.set(2.8, 4.5, 1.2); scene.add(lamp);
const weatherLight = new THREE.DirectionalLight('#dcecff', 1.2); weatherLight.position.set(5, 7, -2); scene.add(weatherLight);
const room = new THREE.Group(); scene.add(room);
const mat = (color, roughness=.8) => new THREE.MeshStandardMaterial({ color, roughness });
const wall = mat('#f4f3ee'), plaster = mat('#ebeae4'), oak = mat('#bca989'), darkOak = mat('#765b42'), paper = mat('#f5ead6', 1), brass = mat('#bd9662', .35);
function cube(w,h,d,x,y,z,material,cast=false){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material); m.position.set(x,y,z); m.castShadow=cast; m.receiveShadow=true; room.add(m); return m; }
// Architecture: the bookshelf owns the back wall; the window lives on the side wall.
cube(18,.16,15,0,0,-1,plaster); cube(14,9,.18,0,4,-4.8,wall); cube(.18,9,10,-7,4,-1,wall); cube(.18,9,10,7,4,-1,wall);
const sideWindow = new THREE.Mesh(new THREE.BoxGeometry(.12,3.2,4.2),mat('#d8e3e2',.3)); sideWindow.position.set(6.88,5.45,-1.1); sideWindow.castShadow=true; room.add(sideWindow);
cube(.18,3.35,4.45,6.76,5.45,-1.1,oak); cube(.18,.12,4.1,6.68,3.78,-1.1,oak); cube(.18,.12,4.1,6.68,7.1,-1.1,oak); cube(.18,3.1,.12,6.68,5.45,-3.12,oak); cube(.18,3.1,.12,6.68,5.45,.92,oak);
// Reading desk, placed in front of the window rather than in front of the books.
cube(4.6,.26,1.55,2.3,2.15,1.05,darkOak,true); cube(.16,2.15,.16,.45,1.1,1.05,darkOak,true); cube(.16,2.15,.16,4.15,1.1,1.05,darkOak,true);
const shade = new THREE.Mesh(new THREE.ConeGeometry(.55,.65,32,true), mat('#d9c19a')); shade.position.set(2.2,3.35,1.1); shade.rotation.x=Math.PI; room.add(shade); cube(.06,.65,.06,2.2,3.0,1.1,brass);
// Realistic shelving: books sit upright on different shelves, with breathing room and bookends.
const books=[];
function titleTexture(title, color){ const c=document.createElement('canvas'); c.width=256; c.height=512; const x=c.getContext('2d'); x.fillStyle=color; x.fillRect(0,0,256,512); x.fillStyle='#f7ead5'; x.font='bold 30px sans-serif'; x.textAlign='center'; x.save(); x.translate(128,256); x.rotate(-Math.PI/2); x.fillText(title,0,0); x.restore(); const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace; return tex; }
const shelfYs=[2.18,3.53,4.88,6.23];
const shelfBookColors=['#63757b','#9a6b4c','#8c7a57','#596d59','#765b68','#9b8668','#536b76','#80614d'];
// A proper reading corner: sofa, lounge chair and low table.
cube(3.6,.55,1.25,-3.6,1.15,.9,mat('#c7b39a'),true); cube(3.6,1.35,.22,-3.6,1.75,1.42,mat('#c7b39a'),true); cube(.18,.75,1.3,-5.25,.62,.9,darkOak,true); cube(.18,.75,1.3,-1.95,.62,.9,darkOak,true);
cube(1.35,.18,1.35,-.15,.72,2.25,oak,true); cube(.12,.7,.12,-.65,.35,1.75,darkOak); cube(.12,.7,.12,.35,.35,1.75,darkOak); cube(.12,.7,.12,-.65,.35,2.75,darkOak); cube(.12,.7,.12,.35,.35,2.75,darkOak);
// The work chair faces the desk from the circulation side; it is not stranded by the wall.
const chair = new THREE.Mesh(new THREE.BoxGeometry(1.5,.3,1.45),mat('#9d8064')); chair.position.set(2.3,1.05,2.55); chair.castShadow=true; room.add(chair); const chairBack=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.65,.25),mat('#9d8064')); chairBack.position.set(2.3,1.8,3.18); chairBack.castShadow=true; room.add(chairBack);
// A quiet reading rug gives the sofa and table their own, legible zone.
cube(4.8,.035,3.5,-2.2,.045,1.7,mat('#ddd8cb',1));

function resize(){ renderer.setSize(innerWidth,innerHeight); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); } addEventListener('resize',resize); resize();
let selected=-1, mode='room', targetCam=new THREE.Vector3(0,3.05,10.8), targetLook=new THREE.Vector3(0,2.7,0), orbit=0, downX=0;
const keys=new Set(); const walk={x:0,y:3.05,z:10.8}; let yaw=0;
addEventListener('keydown', e=>{ if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD'].includes(e.code)){ keys.add(e.code); e.preventDefault(); }});
addEventListener('keyup', e=>keys.delete(e.code));
document.querySelector('#scene').addEventListener('click',()=>{ if(mode==='room'&&document.pointerLockElement!==document.querySelector('#scene')) document.querySelector('#scene').requestPointerLock?.(); });
document.addEventListener('mousemove',e=>{ if(document.pointerLockElement===document.querySelector('#scene')&&mode==='room') yaw-=e.movementX*.002; });
const panel=document.querySelector('.book-panel'), chapter=document.querySelector('.chapter');
function showChapter(index){ const cat=categories[index]; chapter.innerHTML=`<p class="kicker">CHAPTER 0${index+1} / ${cat.subtitle}</p><h2>${cat.title}</h2><p class="blurb">${cat.blurb}</p><div class="objects">${cat.entries.map((e,n)=>`<div class="object"><span>0${n+1}</span><b>${e}</b><i></i></div>`).join('')}</div>`; panel.classList.add('visible'); panel.setAttribute('aria-hidden','false'); }
function enterBook(index){ selected=index; mode='book'; showChapter(index); books.forEach((b,i)=>b.scale.setScalar(i===index?1.12:.92)); const p=books[index].position; targetCam.set(p.x*.18,2.85,1.0); targetLook.set(p.x*.2,2.4,-3.5); document.querySelector('.room-state').textContent=`CHAPTER 0${index+1} · ${categories[index].subtitle}`; }
function leaveBook(){ mode='room'; panel.classList.remove('visible'); panel.setAttribute('aria-hidden','true'); targetCam.set(0,3.05,10.8); targetLook.set(0,2.7,0); books.forEach(b=>b.scale.setScalar(1)); document.querySelector('.room-state').textContent='THE STUDY · 01'; }
let audioContext, ambience, rainGain;
function toggleAmbience(){
  if(!audioContext){
    audioContext=new (window.AudioContext||window.webkitAudioContext)();
    const master=audioContext.createGain(); master.gain.value=.045; master.connect(audioContext.destination);
    const low=audioContext.createOscillator(); low.type='sine'; low.frequency.value=92;
    const high=audioContext.createOscillator(); high.type='sine'; high.frequency.value=138;
    const toneGain=audioContext.createGain(); toneGain.gain.value=.18; low.connect(toneGain); high.connect(toneGain); toneGain.connect(master);
    const buffer=audioContext.createBuffer(1,audioContext.sampleRate*2,audioContext.sampleRate); const data=buffer.getChannelData(0); for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*.25;
    const hush=audioContext.createBufferSource(); hush.buffer=buffer; hush.loop=true; const filter=audioContext.createBiquadFilter(); filter.type='lowpass'; filter.frequency.value=850; const hushGain=audioContext.createGain(); hushGain.gain.value=.12;
    hush.connect(filter); filter.connect(hushGain); hushGain.connect(master);
    const rain=audioContext.createBufferSource(); rain.buffer=buffer; rain.loop=true; const rainFilter=audioContext.createBiquadFilter(); rainFilter.type='bandpass'; rainFilter.frequency.value=3200; rainFilter.Q.value=.5; rainGain=audioContext.createGain(); rainGain.gain.value=0; rain.connect(rainFilter); rainFilter.connect(rainGain); rainGain.connect(master);
    low.start(); high.start(); hush.start(); rain.start(); ambience={master};
  }
  if(audioContext.state==='suspended') audioContext.resume();
    const button=document.querySelector('.sound-toggle'); const on=button.getAttribute('aria-pressed')!=='true'; ambience.master.gain.setTargetAtTime(on?.045:0,audioContext.currentTime,.25); button.setAttribute('aria-pressed',String(on)); button.textContent=on?'♫ 静谧环境音已开启':'♫ 开启静谧环境音';
}
document.querySelector('.sound-toggle').addEventListener('click',toggleAmbience);
addEventListener('pointerdown',()=>{ if(document.body.classList.contains('rain') && !audioContext) toggleAmbience(); },{once:true});
const weatherModes=[
  {test:c=>c===0, name:'晴朗', sky:'#e9f3f7', sea:'#a8c9d2', light:'#fff3d2', intensity:1.15, lamp:1.15, filter:'saturate(.92) brightness(1.04)'},
  {test:c=>c<=3, name:'多云', sky:'#dfe7e8', sea:'#91afb8', light:'#e4e9e4', intensity:.72, lamp:1.55, filter:'saturate(.7) brightness(.98)'},
  {test:c=>c<=67||c<=77, name:'细雨', sky:'#c7d3d8', sea:'#78949e', light:'#d5e0e8', intensity:.48, lamp:2.1, filter:'saturate(.55) brightness(.86)'},
  {test:c=>c<=99, name:'风雨', sky:'#aebdc5', sea:'#637f89', light:'#c8d7e4', intensity:.3, lamp:2.45, filter:'saturate(.48) brightness(.76)'}
];
let currentMode=weatherModes[0], lastNight=false;
function updateSolarClock(now=new Date()){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',hour:'numeric',minute:'numeric',second:'numeric',hour12:false}).formatToParts(now);
  const get=k=>Number(parts.find(p=>p.type===k)?.value||0); const solarHour=get('hour')+get('minute')/60+get('second')/3600;
  const daylight=Math.max(0,Math.sin((solarHour-6)/12*Math.PI)), night=daylight<.08;
  const phase=solarHour<5.5?'night':solarHour<6.8?'dawn':solarHour<8.2?'sunrise':solarHour<16.8?'day':solarHour<18.5?'golden-hour':solarHour<20?'sunset':solarHour<21.2?'blue-hour':'night';
  const azimuth=(solarHour-12)/6*Math.PI; sun.position.set(Math.sin(azimuth)*8,2+daylight*9,-Math.cos(azimuth)*8); weatherLight.position.copy(sun.position).multiplyScalar(.8);
  const evening=night?.025:Math.max(.3,daylight);
  sun.intensity+=(currentMode.intensity*evening-sun.intensity)*.035; weatherLight.intensity+=(currentMode.intensity*.7*evening-weatherLight.intensity)*.035;
  const targetLamp=night?.72:currentMode.lamp; lamp.intensity+=(targetLamp-lamp.intensity)*.035;
  const phaseLooks={
    night:{tint:'rgba(12,30,45,.18)',filter:'saturate(.72) brightness(.68)'},
    dawn:{tint:'rgba(238,152,126,.18)',filter:'saturate(1.06) brightness(.94)'},
    sunrise:{tint:'rgba(247,185,123,.16)',filter:'saturate(1.12) brightness(1.02)'},
    day:{tint:'rgba(255,255,255,0)',filter:'saturate(.96) brightness(1.04)'},
    'golden-hour':{tint:'rgba(231,142,76,.18)',filter:'saturate(1.12) brightness(.98)'},
    sunset:{tint:'rgba(177,74,55,.22)',filter:'saturate(1.16) brightness(.82)'},
    'blue-hour':{tint:'rgba(44,76,104,.2)',filter:'saturate(.8) brightness(.74)'}
  }[phase];
  visualBackdrop.style.backgroundImage=`linear-gradient(90deg,${phaseLooks.tint},rgba(247,247,243,.02) 48%,${phaseLooks.tint}),${night ? nightRoomImage : dayRoomImage}`;
  visualBackdrop.style.filter=currentMode.filter+' '+phaseLooks.filter;
  if(night!==lastNight){setRoomTime(night);lastNight=night;}
  moonOrb.style.opacity=String(Math.max(0,1-daylight*8)*.82);
  moonOrb.style.transform=`translate(${Math.cos((solarHour-12)/24*Math.PI*2)*22}vw,${Math.sin((solarHour-12)/24*Math.PI*2)*8}vh)`;
}
async function syncSanFranciscoWeather(){
  const label=document.querySelector('.weather-state');
  try{
    const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.7749&longitude=-122.4194&current=temperature_2m,weather_code,wind_speed_10m&timezone=America%2FLos_Angeles');
    const data=await r.json(); const current=data.current; const mode=weatherModes.find(x=>x.test(current.weather_code))||weatherModes[1]; currentMode=mode;
    document.documentElement.style.setProperty('--weather-sky',mode.sky); document.documentElement.style.setProperty('--weather-sea',mode.sea); document.documentElement.style.setProperty('--weather-filter',mode.filter); document.body.classList.toggle('rain',current.weather_code>=51);
    sun.color.set(mode.light); weatherLight.color.set(mode.light); updateSolarClock();
    if(rainGain&&audioContext.state==='running') rainGain.gain.setTargetAtTime(current.weather_code>=51?.22:0,audioContext.currentTime,.8);
    label.textContent=`旧金山 · ${mode.name} · ${Math.round(current.temperature_2m)}°C`;
  }catch{ label.textContent='旧金山 · 天气暂不可用，保持宁静光线'; }
}
syncSanFranciscoWeather(); setInterval(syncSanFranciscoWeather,10*60*1000); setInterval(updateSolarClock,1000);
document.querySelector('#scene').addEventListener('pointerdown',e=>{downX=e.clientX;});
document.querySelector('#scene').addEventListener('pointermove',e=>{ if(mode==='room'&&e.buttons) orbit=THREE.MathUtils.clamp((e.clientX-innerWidth/2)/innerWidth,-.12,.12); });
function animate(t){ requestAnimationFrame(animate); if(mode==='room'){ const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)); const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)); const speed=.075; if(keys.has('KeyW')||keys.has('ArrowUp')) walk.x+=forward.x*speed,walk.z+=forward.z*speed; if(keys.has('KeyS')||keys.has('ArrowDown')) walk.x-=forward.x*speed,walk.z-=forward.z*speed; if(keys.has('KeyA')||keys.has('ArrowLeft')) walk.x-=right.x*speed,walk.z-=right.z*speed; if(keys.has('KeyD')||keys.has('ArrowRight')) walk.x+=right.x*speed,walk.z+=right.z*speed; walk.x=THREE.MathUtils.clamp(walk.x,-5.6,5.6); walk.z=THREE.MathUtils.clamp(walk.z,-.1,9.2); targetCam.set(walk.x,walk.y,walk.z); targetLook.set(walk.x+forward.x*3,2.7,walk.z+forward.z*3); } camera.position.lerp(targetCam, .045); const look=targetLook.clone(); look.x += orbit*3; camera.lookAt(look); room.rotation.y += (orbit-room.rotation.y)*.035; renderer.render(scene,camera); } animate();
