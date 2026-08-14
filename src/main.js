import * as THREE from 'three';
import './style.css';

const categories = [
  { title: '技术', subtitle: 'SYSTEMS & CRAFT', color: '#244653', blurb: '软件系统、AI 工作流，以及把复杂事情做成可靠产品的记录。', entries: ['AI 工作流与 Agent 系统', 'Kubernetes 与可靠部署', '软件工程的长期主义'] },
  { title: '产品', subtitle: 'IDEAS & PRACTICE', color: '#ad6634', blurb: '从用户问题出发，把模糊想法变成可验证、可持续的产品。', entries: ['从问题到产品', '个人工具与效率系统', '创业中的取舍'] },
  { title: '写作', subtitle: 'STORIES & WORLDS', color: '#705978', blurb: '小说、叙事结构，以及用故事理解世界的尝试。', entries: ['叙事与世界观', '长篇小说计划', '阅读札记'] },
  { title: '生活', subtitle: 'NOTES & WALKS', color: '#48705b', blurb: '工作之外，关于城市、旅行、阅读和日常观察的片段。', entries: ['城市漫游', '最近在读', '一些小小的发现'] }
];

const app = document.querySelector('#app');
app.innerHTML = `<div class="visual-backdrop" aria-hidden="true"><img class="room-photo" alt="" /><canvas id="window-renderer" aria-hidden="true"></canvas><div class="cloud-layer" aria-hidden="true"></div><div class="sun-glow" aria-hidden="true"></div></div><div class="moon-orb" aria-hidden="true"></div><canvas id="scene"></canvas><div class="weather-hud" aria-hidden="true"><span class="weather-state"></span><span></span></div><button class="sound-toggle" type="button" aria-label="ambient sound" aria-pressed="false"></button>`;
const visualBackdrop = document.querySelector('.visual-backdrop');
const roomPhoto = document.querySelector('.room-photo');
const moonOrb = document.querySelector('.moon-orb');
const cloudLayer = document.querySelector('.cloud-layer');
const sunGlow = document.querySelector('.sun-glow');
const windowCanvas = document.querySelector('#window-renderer');
const windowContext = windowCanvas.getContext('2d', { alpha: true });
const roomImages = {
  // Neutral master: same room geometry for every later lighting/weather pass.
  day: "url('/images/white-sea-study-master.png?v=0.0.33')",
  dawn: "url('/images/white-sea-study-blue-hour-v2.png?v=0.0.34')",
  sunset: "url('/images/white-sea-study-golden-hour.png?v=0.0.33')",
  overcast: "url('/images/white-sea-study-overcast.png?v=0.0.33')",
  fog: "url('/images/white-sea-study-fog.png?v=0.0.33')",
  rain: "url('/images/white-sea-study-rain.png?v=0.0.33')",
  storm: "url('/images/white-sea-study-storm.png?v=0.0.33')",
  night: "url('/images/white-sea-study-night.png?v=0.0.33')",
  moonFog: "url('/images/white-sea-study-moon-fog-no-moon.png?v=0.0.33')"
};
const dayRoomImage = roomImages.day;
const nightRoomImage = roomImages.night;
let activeSceneSource = '';
function setBackdropImage(cssImage){
  visualBackdrop.style.backgroundImage = cssImage;
  const source = cssImage.match(/url\(['\"]?([^'\")]+)['\"]?\)/)?.[1];
  if (source && source !== activeSceneSource) {
    activeSceneSource = source;
    roomPhoto.src = source;
  }
}
function setRoomTime(night){
  setBackdropImage(`linear-gradient(90deg,rgba(247,247,243,.18),rgba(247,247,243,.02) 48%,rgba(247,247,243,.16)),${night ? nightRoomImage : dayRoomImage}`);
}

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
let audioContext, ambience, rainGain, oceanGain;
function toggleAmbience(){
  if(!audioContext){
    audioContext=new (window.AudioContext||window.webkitAudioContext)();
    const master=audioContext.createGain(); master.gain.value=.16; master.connect(audioContext.destination);
    const low=audioContext.createOscillator(); low.type='sine'; low.frequency.value=92;
    const high=audioContext.createOscillator(); high.type='sine'; high.frequency.value=138;
    // Keep the room tone barely audible; the ocean should be the foreground sound.
    const toneGain=audioContext.createGain(); toneGain.gain.value=.006; low.connect(toneGain); high.connect(toneGain); toneGain.connect(master);
    const buffer=audioContext.createBuffer(1,audioContext.sampleRate*2,audioContext.sampleRate); const data=buffer.getChannelData(0); for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*.25;
    const hush=audioContext.createBufferSource(); hush.buffer=buffer; hush.loop=true; const filter=audioContext.createBiquadFilter(); filter.type='lowpass'; filter.frequency.value=420; const hushGain=audioContext.createGain(); hushGain.gain.value=.035;
    hush.connect(filter); filter.connect(hushGain); hushGain.connect(master);
    // A low, slowly breathing noise bed gives the sea a natural wash. The
    // LFO makes each swell arrive and recede instead of sounding like a flat hiss.
    const ocean=audioContext.createBufferSource(); ocean.buffer=buffer; ocean.loop=true;
    const oceanFilter=audioContext.createBiquadFilter(); oceanFilter.type='lowpass'; oceanFilter.frequency.value=480; oceanFilter.Q.value=.2;
    oceanGain=audioContext.createGain(); oceanGain.gain.value=.42;
    ocean.connect(oceanFilter); oceanFilter.connect(oceanGain); oceanGain.connect(master);
    const swell=audioContext.createOscillator(); swell.type='sine'; swell.frequency.value=.075;
    const swellDepth=audioContext.createGain(); swellDepth.gain.value=.18; swell.connect(swellDepth); swellDepth.connect(oceanGain.gain);
    const foam=audioContext.createBufferSource(); foam.buffer=buffer; foam.loop=true;
    const foamFilter=audioContext.createBiquadFilter(); foamFilter.type='bandpass'; foamFilter.frequency.value=820; foamFilter.Q.value=.28;
    const foamGain=audioContext.createGain(); foamGain.gain.value=.055; foam.connect(foamFilter); foamFilter.connect(foamGain); foamGain.connect(master);
    const rain=audioContext.createBufferSource(); rain.buffer=buffer; rain.loop=true; const rainFilter=audioContext.createBiquadFilter(); rainFilter.type='bandpass'; rainFilter.frequency.value=3200; rainFilter.Q.value=.5; rainGain=audioContext.createGain(); rainGain.gain.value=0; rain.connect(rainFilter); rainFilter.connect(rainGain); rainGain.connect(master);
    low.start(); high.start(); hush.start(); ocean.start(); swell.start(); foam.start(); rain.start(); ambience={master};
  }
  if(audioContext.state==='suspended') audioContext.resume();
    const button=document.querySelector('.sound-toggle'); const on=button.getAttribute('aria-pressed')!=='true'; ambience.master.gain.setTargetAtTime(on?.16:0,audioContext.currentTime,.25); button.setAttribute('aria-pressed',String(on)); button.textContent=on?'♫ 静谧环境音已开启':'♫ 开启静谧环境音';
}
document.querySelector('.sound-toggle').addEventListener('click',toggleAmbience);
const weatherModes=[
  {test:c=>c===0, kind:'clear', name:'晴朗', sky:'#e9f3f7', sea:'#a8c9d2', light:'#fff3d2', intensity:1.15, lamp:1.15, filter:'saturate(.92) brightness(1.04)'},
  {test:c=>c===45||c===48, kind:'fog', name:'雾天', sky:'#d9e0e2', sea:'#9eb8bf', light:'#dce6ea', intensity:.58, lamp:1.8, filter:'saturate(.62) brightness(.93)'},
  {test:c=>c<=3, kind:'cloudy', name:'多云', sky:'#dfe7e8', sea:'#91afb8', light:'#e4e9e4', intensity:.72, lamp:1.55, filter:'saturate(.7) brightness(.98)'},
  {test:c=>c<=67||c<=77, kind:'rain', name:'细雨', sky:'#c7d3d8', sea:'#78949e', light:'#d5e0e8', intensity:.48, lamp:2.1, filter:'saturate(.55) brightness(.86)'},
  {test:c=>c<=99, kind:'storm', name:'风雨', sky:'#aebdc5', sea:'#637f89', light:'#c8d7e4', intensity:.3, lamp:2.45, filter:'saturate(.48) brightness(.76)'}
];
let currentMode=weatherModes[0], lastNight=false, weatherReady=false;
let sunriseMs=0, sunsetMs=0;
let currentWeather={ code:0, cloudCover:0, wind:0, precipitation:0 };
const SF_LATITUDE=37.7749*Math.PI/180, SF_LONGITUDE=-122.4194;
const brightStars=[
  ["Sirius",6.7525,-16.7161,-1.46],["Canopus",6.3992,-52.6957,-0.74],["Arcturus",14.261,19.182,-0.05],["Vega",18.6156,38.783,0.03],["Capella",5.2782,45.998,0.08],["Rigel",5.2423,-8.202,0.13],["Procyon",7.655,5.225,0.38],["Betelgeuse",5.9195,7.407,0.50],["Altair",19.8464,8.868,0.77],["Aldebaran",4.5987,16.509,0.85],["Spica",13.4199,-11.161,0.98],["Antares",16.4901,-26.432,1.06],["Pollux",7.7553,28.026,1.14],["Fomalhaut",22.9608,-29.622,1.16],["Deneb",20.6905,45.280,1.25],["Regulus",10.1395,11.967,1.35],["Castor",7.5767,31.888,1.58],["Bellatrix",5.4189,6.350,1.64],["Alnilam",5.6036,-1.202,1.69],["Alnitak",5.6793,-1.943,1.74],["Mirfak",3.4054,49.861,1.79],["Saiph",5.7959,-9.670,2.06],["Polaris",2.5303,89.264,1.98],["Hamal",2.1195,23.462,2.00],["Alphard",9.4598,-8.658,1.98],["Adhara",6.9771,-28.972,1.50],["Mimosa",12.7953,-59.689,1.25],["Shaula",17.5601,-37.104,1.62]
];
function visibleStarMap(date){
  const jd=date.getTime()/86400000+2440587.5, d=jd-2451545;
  const gmst=((280.46061837+360.98564736629*d)%360+360)%360, lst=((gmst+SF_LONGITUDE)%360+360)%360;
  return brightStars.map(([name,ra,dec,mag])=>{ const decRad=dec*Math.PI/180, hourAngle=((lst-ra*15+540)%360-180)*Math.PI/180; const altitude=Math.asin(Math.sin(SF_LATITUDE)*Math.sin(decRad)+Math.cos(SF_LATITUDE)*Math.cos(decRad)*Math.cos(hourAngle)); const azimuth=Math.atan2(Math.sin(hourAngle),Math.cos(hourAngle)*Math.sin(SF_LATITUDE)-Math.tan(decRad)*Math.cos(SF_LATITUDE)); return {name,mag,altitude,azimuth,brightness:Math.max(.12,Math.min(1,1-(mag+1.1)/5.8))}; }).filter(star=>star.altitude>8*Math.PI/180);
}
let liveSky={ solarAltitude:0, solarAzimuth:0, lunarAltitude:0, lunarAzimuth:0, lunarPhase:0, lunarIllumination:0, night:false, weatherVisibility:1, phase:'day', visibleStars:[] };

function resizeWindowRenderer(){
  const ratio=innerWidth<700?Math.min(devicePixelRatio||1,1.25):Math.min(devicePixelRatio||1,2);
  windowCanvas.width=Math.max(1,Math.round(innerWidth*ratio));
  windowCanvas.height=Math.max(1,Math.round(innerHeight*ratio));
  windowCanvas.style.width=`${innerWidth}px`; windowCanvas.style.height=`${innerHeight}px`;
  windowContext.setTransform(ratio,0,0,ratio,0,0);
}
addEventListener('resize',resizeWindowRenderer); resizeWindowRenderer();

function renderWindowScene(time){
  const w=innerWidth, h=innerHeight, c=windowContext;
  c.clearRect(0,0,w,h);
  const weather=currentMode, mobile=w<700;
  // Keep the high-resolution room photograph visible; this canvas is a
  // transparent, physically-timed atmosphere layer over the open window.
  const cloudAmount=Math.max(0,Math.min(1,(currentWeather.cloudCover||0)/100));
  // Show only catalogued stars currently above the San Francisco horizon.
  if(liveSky.night){
    const visibility=liveSky.weatherVisibility*(1-cloudAmount*.72);
    c.save(); c.fillStyle='#f4f0d5';
    for(const star of liveSky.visibleStars){
      const sx=w*.5+Math.sin(star.azimuth)*w*.42, sy=h*.47-Math.sin(star.altitude)*h*.38;
      if(sx<w*.28||sx>w*.76||sy<0||sy>h*.46) continue;
      c.globalAlpha=visibility*(.28+.65*star.brightness); c.beginPath(); c.arc(sx,sy,mobile?.45+star.brightness*.65:.55+star.brightness*1.05,0,Math.PI*2); c.fill();
    }
    c.restore();
  }
  c.save(); c.globalAlpha=.06+.20*cloudAmount; c.filter=`blur(${8+cloudAmount*15}px)`; c.fillStyle=liveSky.night?'#091522':'#ffffff';
  for(let i=0;i<(mobile?3:5);i++){ const x=((i*.31*w + time*(.004+(currentWeather.wind||0)*.00008))%(w+260))-130; const y=h*(.16+(i%3)*.12); c.beginPath(); c.ellipse(x,y,130+i*18,28+i*8,0,0,Math.PI*2); c.fill(); } c.restore();
  if(currentWeather.precipitation>0 || currentMode.kind==='rain' || currentMode.kind==='storm'){
    c.save(); c.globalAlpha=.20+.35*Math.min(1,currentWeather.precipitation||.4); c.strokeStyle='#d8edf2'; c.lineWidth=1;
    for(let i=0;i<(mobile?40:80);i++){ const x=(i*47+time*.18*(1+(currentWeather.wind||0)/30))%w; const y=(i*31+time*.42)%h; c.beginPath(); c.moveTo(x,y); c.lineTo(x-7,y+22); c.stroke(); } c.restore();
  }
  const drawBody=(x,y,r,color,glow)=>{ if(y<0||y>h*.75)return; c.save(); c.globalAlpha=liveSky.night?.92:.82; c.shadowBlur=glow; c.shadowColor=color; c.fillStyle=color; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); c.restore(); };
  const sunX=w*.5+Math.sin(liveSky.solarAzimuth)*w*.42, sunY=h*.48-Math.max(0,Math.sin(liveSky.solarAltitude))*h*.38;
  if(!liveSky.night) drawBody(sunX,sunY,Math.max(14,w*.012),'#fff1ba',28);
  const moonX=w*.5+Math.sin(liveSky.lunarAzimuth)*w*.42, moonY=h*.48-Math.max(0,Math.sin(liveSky.lunarAltitude))*h*.38;
  if(liveSky.night && liveSky.lunarIllumination>.02) drawBody(moonX,moonY,Math.max(11,w*.009),'#e9e5ca',24*liveSky.weatherVisibility);
}
function updateSolarClock(now=new Date()){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',hour:'numeric',minute:'numeric',second:'numeric',hour12:false}).formatToParts(now);
  const get=k=>Number(parts.find(p=>p.type===k)?.value||0); const solarHour=get('hour')+get('minute')/60+get('second')/3600;
  const sunriseHour=sunriseMs ? new Date(sunriseMs).getHours()+new Date(sunriseMs).getMinutes()/60 : 6;
  const sunsetHour=sunsetMs ? new Date(sunsetMs).getHours()+new Date(sunsetMs).getMinutes()/60 : 18;
  const daylight=Math.max(0,Math.min(1,(solarHour-sunriseHour)/Math.max(.1,sunsetHour-sunriseHour)));
  // Synodic-month approximation anchored to a known new moon. This keeps the
  // moon phase tied to the actual calendar date without adding another API.
  const knownNewMoon=Date.UTC(2000,0,6,18,14);
  const synodicMonth=29.530588853;
  const lunarPhase=((now.getTime()-knownNewMoon)/86400000/synodicMonth%1+1)%1;
  const lunarIllumination=(1-Math.cos(lunarPhase*Math.PI*2))/2;
  const latitude=SF_LATITUDE;
  const seasonalPhase=((now.getTime()-Date.UTC(now.getUTCFullYear(),0,1))/86400000/365.2422)*Math.PI*2;
  const clockPhase=solarHour<5.5?'night':solarHour<6.8?'dawn':solarHour<8.2?'sunrise':solarHour<16.8?'day':solarHour<18.5?'golden-hour':solarHour<20?'sunset':solarHour<21.2?'blue-hour':'night';
  // Use the actual SF sunset as the boundary. Blue hour lasts about 35
  // minutes after sunset, then the room settles into night.
  const minutesAfterSunset=sunsetMs?(now.getTime()-sunsetMs)/60000:0;
  const phase=sunsetMs&&minutesAfterSunset>=0
    ? (minutesAfterSunset<35?'blue-hour':'night')
    : clockPhase;
  const beforeSunrise=sunriseMs ? now.getTime()<sunriseMs : solarHour<5.5;
  const night=phase==='night'||beforeSunrise;
  const twilightProgress=phase==='blue-hour'?Math.max(0,Math.min(1,minutesAfterSunset/35)):0;
  const solarDeclination=23.4*Math.PI/180*Math.sin(seasonalPhase-.4);
  const solarHourAngle=(solarHour-12)/24*Math.PI*2;
  const solarAltitude=Math.asin(Math.sin(latitude)*Math.sin(solarDeclination)+Math.cos(latitude)*Math.cos(solarDeclination)*Math.cos(solarHourAngle));
  const solarAzimuth=Math.atan2(Math.sin(solarHourAngle),Math.cos(solarHourAngle)*Math.sin(latitude)-Math.tan(solarDeclination)*Math.cos(latitude));
  sun.position.set(Math.sin(solarAzimuth)*8,Math.max(-2,Math.sin(solarAltitude)*11+2),-Math.cos(solarAzimuth)*8); weatherLight.position.copy(sun.position).multiplyScalar(.8);
  const twilightExposure=phase==='sunset'?Math.max(.72,Math.min(1,(sunsetMs-now.getTime())/3600000+.42)):phase==='blue-hour'?.22-(.18*twilightProgress):phase==='night'?.025:1;
  const evening=phase==='night'?.025:phase==='blue-hour'?.3-(.275*twilightProgress):Math.max(.3,daylight)*twilightExposure;
  sun.intensity+=(currentMode.intensity*evening-sun.intensity)*.035; weatherLight.intensity+=(currentMode.intensity*.7*evening-weatherLight.intensity)*.035;
  const targetLamp=phase==='night'?.72:phase==='blue-hour'?currentMode.lamp+((.72-currentMode.lamp)*twilightProgress):currentMode.lamp; lamp.intensity+=(targetLamp-lamp.intensity)*.035;
  const phaseLooks={
    night:{tint:'rgba(12,30,45,.18)',filter:'saturate(.72) brightness(.68)'},
    dawn:{tint:'rgba(238,152,126,.18)',filter:'saturate(1.06) brightness(.94)'},
    sunrise:{tint:'rgba(247,185,123,.16)',filter:'saturate(1.12) brightness(1.02)'},
    day:{tint:'rgba(255,255,255,0)',filter:'saturate(.96) brightness(1.04)'},
    'golden-hour':{tint:'rgba(231,142,76,.18)',filter:'saturate(1.12) brightness(.98)'},
    sunset:{tint:'rgba(177,74,55,.22)',filter:'saturate(1.16) brightness(.82)'},
    'blue-hour':{tint:'rgba(44,76,104,.2)',filter:'saturate(.8) brightness(.74)'}
  }[phase];
  // Use the real local solar phase immediately. The weather request may refine
  // the weather mode later, but it must not make a near-sunset visitor see a
  // daytime placeholder first.
  const initialPhase = phase;
  const sceneImage = night
    ? roomImages.night
    : currentMode.kind === 'storm'
      ? roomImages.storm
      : currentMode.kind === 'rain'
        ? roomImages.rain
        : currentMode.kind === 'fog'
          ? roomImages.fog
          : initialPhase === 'dawn' || initialPhase === 'sunrise' || initialPhase === 'blue-hour'
            ? roomImages.dawn
            : currentMode.kind === 'cloudy'
              ? roomImages.overcast
              : initialPhase === 'golden-hour' || initialPhase === 'sunset'
                ? roomImages.sunset
                : roomImages.day;
  setBackdropImage(`linear-gradient(90deg,${phaseLooks.tint},rgba(247,247,243,.02) 48%,${phaseLooks.tint}),${sceneImage}`);
  visualBackdrop.style.filter=currentMode.filter+' '+phaseLooks.filter;
  lastNight=night;
  // Approximate the Moon's local sky position for San Francisco. The phase
  // determines its hour angle (new moon near noon, full moon near midnight),
  // while date-dependent declination keeps its altitude from being constant.
  const lunarDeclination=23.4*Math.PI/180*Math.sin(lunarPhase*Math.PI*2+seasonalPhase);
  const moonTransit=(12+lunarPhase*24)%24;
  const hourAngle=(solarHour-moonTransit)/24*Math.PI*2;
  const moonAltitude=Math.asin(Math.sin(latitude)*Math.sin(lunarDeclination)+Math.cos(latitude)*Math.cos(lunarDeclination)*Math.cos(hourAngle));
  const moonAzimuth=Math.atan2(Math.sin(hourAngle),Math.cos(hourAngle)*Math.sin(latitude)-Math.tan(lunarDeclination)*Math.cos(latitude));
  const weatherVisibility=currentMode.kind==='storm'?.18:currentMode.kind==='rain'?.34:currentMode.kind==='fog'?.42:currentMode.kind==='cloudy'?.66:1;
  liveSky={solarAltitude,solarAzimuth,lunarAltitude:moonAltitude,lunarAzimuth:moonAzimuth,lunarPhase,lunarIllumination,night,weatherVisibility,phase,visibleStars:visibleStarMap(now)};
  const aboveHorizon=Math.max(0,Math.sin(moonAltitude)*3);
  const moonVisibility=Math.max(0,1-daylight*8)*weatherVisibility*aboveHorizon;
  moonOrb.style.opacity=String(moonVisibility*.82);
  moonOrb.style.setProperty('--moon-illumination',String(lunarIllumination));
  moonOrb.style.setProperty('--moon-phase',String(lunarPhase));
  moonOrb.dataset.phase=lunarPhase<.03||lunarPhase>.97?'new':lunarPhase<.22?'waxing-crescent':lunarPhase<.28?'first-quarter':lunarPhase<.47?'waxing-gibbous':lunarPhase<.53?'full':lunarPhase<.72?'waning-gibbous':lunarPhase<.78?'last-quarter':lunarPhase<.97?'waning-crescent':'new';
  moonOrb.dataset.weather=currentMode.kind;
  const moonX=Math.max(-22,Math.min(22,Math.sin(moonAzimuth)*22));
  const moonY=Math.max(-18,Math.min(18,(moonAltitude*180/Math.PI-35)*-.32));
  moonOrb.style.transform=`translate(${moonX}vw,${moonY}vh)`;
  const sunVisibility=Math.max(0,Math.sin(solarAltitude))*weatherVisibility;
  sunGlow.style.opacity=String(sunVisibility*.24);
  sunGlow.style.transform=`translate(${Math.max(-18,Math.min(18,Math.sin(solarAzimuth)*22))}vw,${Math.max(-20,Math.min(18,(solarAltitude*180/Math.PI-32)*-.34))}vh)`;
}
async function syncSanFranciscoWeather(){
  const label=document.querySelector('.weather-state');
  try{
    const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=37.7749&longitude=-122.4194&current=temperature_2m,weather_code,wind_speed_10m,cloud_cover,precipitation&daily=sunrise,sunset&forecast_days=1&timezone=America%2FLos_Angeles&_=${Date.now()}`,{cache:'no-store'});
    const data=await r.json(); const current=data.current; const mode=weatherModes.find(x=>x.test(current.weather_code))||weatherModes[1]; currentMode=mode; weatherReady=true;
    currentWeather={code:Number(current.weather_code)||0,cloudCover:Number(current.cloud_cover)||0,wind:Number(current.wind_speed_10m)||0,precipitation:Number(current.precipitation)||0};
    sunriseMs=Date.parse(data.daily?.sunrise?.[0]||''); sunsetMs=Date.parse(data.daily?.sunset?.[0]||'');
    document.documentElement.style.setProperty('--weather-sky',mode.sky); document.documentElement.style.setProperty('--weather-sea',mode.sea); document.documentElement.style.setProperty('--weather-filter',mode.filter); document.body.classList.toggle('rain',current.weather_code>=51);
    const cover=Number.isFinite(current.cloud_cover)?current.cloud_cover:0;
    const cloudState=mode.kind==='storm'?'storm':mode.kind==='fog'?'fog':cover>=75?'overcast':cover>=35?'scattered':'clear';
    document.body.dataset.cloud=cloudState;
    document.documentElement.style.setProperty('--cloud-speed',`${Math.max(18,90-(current.wind_speed_10m||0)*2)}s`);
    sun.color.set(mode.light); weatherLight.color.set(mode.light); updateSolarClock();
    if(rainGain&&audioContext.state==='running') rainGain.gain.setTargetAtTime(current.weather_code>=51?.22:0,audioContext.currentTime,.8);
    label.textContent=`旧金山 · ${mode.name} · ${Math.round(current.temperature_2m)}°C`;
  }catch{ label.textContent='旧金山 · 天气暂不可用，保持宁静光线'; }
}
// Paint the current San Francisco time immediately. Weather is fetched in
// parallel and will refine the scene once it arrives; no daytime placeholder.
updateSolarClock(new Date());
syncSanFranciscoWeather();
setInterval(syncSanFranciscoWeather,10*60*1000);
setInterval(updateSolarClock,1000);
addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible'){ syncSanFranciscoWeather(); updateSolarClock(); } });
document.querySelector('#scene').addEventListener('pointerdown',e=>{downX=e.clientX;});
document.querySelector('#scene').addEventListener('pointermove',e=>{ if(mode==='room'&&e.buttons) orbit=THREE.MathUtils.clamp((e.clientX-innerWidth/2)/innerWidth,-.12,.12); });
function animate(t){ requestAnimationFrame(animate); renderWindowScene(t); if(mode==='room'){ const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)); const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)); const speed=.075; if(keys.has('KeyW')||keys.has('ArrowUp')) walk.x+=forward.x*speed,walk.z+=forward.z*speed; if(keys.has('KeyS')||keys.has('ArrowDown')) walk.x-=forward.x*speed,walk.z-=forward.z*speed; if(keys.has('KeyA')||keys.has('ArrowLeft')) walk.x-=right.x*speed,walk.z+=right.z*speed; if(keys.has('KeyD')||keys.has('ArrowRight')) walk.x+=right.x*speed,walk.z-=right.z*speed; walk.x=THREE.MathUtils.clamp(walk.x,-5.6,5.6); walk.z=THREE.MathUtils.clamp(walk.z,-.1,9.2); targetCam.set(walk.x,walk.y,walk.z); targetLook.set(walk.x+forward.x*3,2.7,walk.z+forward.z*3); } camera.position.lerp(targetCam, .045); const look=targetLook.clone(); look.x += orbit*3; camera.lookAt(look); room.rotation.y += (orbit-room.rotation.y)*.035; renderer.render(scene,camera); } animate();
