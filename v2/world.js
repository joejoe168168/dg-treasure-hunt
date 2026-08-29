import * as THREE from 'three';

const mat = (color, roughness=.75, metalness=0) => new THREE.MeshStandardMaterial({color,roughness,metalness});
const box = (w,h,d,m,x,y,z,parent) => { const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); o.castShadow=o.receiveShadow=true; parent.add(o); return o; };

function textSprite(text, sub='') {
  const c=document.createElement('canvas'); c.width=768;c.height=192; const x=c.getContext('2d');
  x.fillStyle='rgba(4,24,41,.92)';x.roundRect(4,4,760,184,20);x.fill();x.strokeStyle='#d6b65b';x.lineWidth=3;x.stroke();
  x.fillStyle='#fff';x.font='700 44px sans-serif';x.textAlign='center';x.fillText(text,384,82);
  x.fillStyle='#8fdde2';x.font='500 24px sans-serif';x.fillText(sub,384,130);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true}));s.scale.set(13,3.25,1);return s;
}

function createAtrium(scene, colliders) {
  const g=new THREE.Group();
  const stone=mat(0xe7e0d2), dark=mat(0x0a2942,.5,.12), brass=mat(0xcaa44a,.35,.65), glass=new THREE.MeshPhysicalMaterial({color:0x78cbd5,transparent:true,opacity:.2,roughness:.1,metalness:.1});
  box(54,1,43,stone,0,-.5,-15,g);
  box(2,13,43,dark,-27,6,-15,g);box(2,13,43,dark,27,6,-15,g);box(54,13,2,dark,0,6,-36,g);
  for(let x=-21;x<=21;x+=7){box(.28,13,.35,brass,x,6.5,-34.8,g);box(4.7,8,.25,glass,x,7,-34.55,g)}
  for(const x of [-23,-15,-7,7,15,23]){box(.5,12,.5,brass,x,6,-31,g)}
  const dome=new THREE.Mesh(new THREE.SphereGeometry(18,32,12,0,Math.PI*2,0,Math.PI/2),new THREE.MeshPhysicalMaterial({color:0x8bd9e1,transparent:true,opacity:.18,wireframe:true}));dome.scale.z=.75;dome.position.set(0,12,-15);g.add(dome);
  const star=new THREE.Mesh(new THREE.RingGeometry(3.5,3.7,64),new THREE.MeshBasicMaterial({color:0xf3c96b,side:THREE.DoubleSide}));star.rotation.x=-Math.PI/2;star.position.set(0,.04,-15);g.add(star);
  for(let r=6;r<15;r+=3){const ring=new THREE.Mesh(new THREE.RingGeometry(r,r+.06,80),new THREE.MeshBasicMaterial({color:0xa58d57,side:THREE.DoubleSide,transparent:true,opacity:.55}));ring.rotation.x=-Math.PI/2;ring.position.set(0,.03,-15);g.add(ring)}
  const title=textSprite('DG DISCOVERY MUSEUM','拔萃女書院 · 香港探索館');title.position.set(0,10,-35);g.add(title);
  scene.add(g);colliders.push({x:0,z:-36,w:56,d:2},{x:-27,z:-15,w:2,d:43},{x:27,z:-15,w:2,d:43});
}

function createSpaceMuseum(scene, colliders) {
  const g=new THREE.Group(), white=mat(0xe8e7df,.55), seam=mat(0xc3c5c3,.7), glass=mat(0x123c57,.25,.35);
  const half=new THREE.Mesh(new THREE.SphereGeometry(8,32,18,0,Math.PI,0,Math.PI),white);half.rotation.z=Math.PI/2;half.position.y=8;half.castShadow=true;g.add(half);
  box(13,7,12,white,4,3.5,0,g);box(12,4,.4,glass,4,3.4,6.05,g);
  for(let y=2;y<15;y+=2.1){const r=new THREE.Mesh(new THREE.TorusGeometry(Math.sqrt(Math.max(4,64-(y-8)*(y-8))),.045,6,48,Math.PI),seam);r.rotation.y=Math.PI/2;r.position.set(0,y,0);g.add(r)}
  g.position.set(25,0,60);scene.add(g);colliders.push({x:27,z:60,w:20,d:14});
  const sign=textSprite('香港太空館','HONG KONG SPACE MUSEUM');sign.position.set(25,12,68);scene.add(sign);
}

function createClockTower(scene, colliders) {
  const g=new THREE.Group(), brick=mat(0xb46b4d,.85), stone=mat(0xe2d7c0), roof=mat(0x5e4639,.7), clock=mat(0xfff6d6,.4);
  box(7,24,7,brick,0,12,0,g);box(8,1.2,8,stone,0,22,0,g);box(7.6,6,7.6,brick,0,25,0,g);
  const cap=new THREE.Mesh(new THREE.ConeGeometry(5.2,8,4),roof);cap.rotation.y=Math.PI/4;cap.position.y=32;cap.castShadow=true;g.add(cap);
  for(const [x,z,ry] of [[0,3.82,0],[3.82,0,Math.PI/2],[-3.82,0,Math.PI/2],[0,-3.82,0]]){const c=new THREE.Mesh(new THREE.CircleGeometry(1.7,32),clock);c.position.set(x,26,z);c.rotation.y=ry;g.add(c)}
  g.position.set(-38,0,22);scene.add(g);colliders.push({x:-38,z:22,w:9,d:9});
  const sign=textSprite('前九廣鐵路鐘樓','CLOCK TOWER · 1915');sign.position.set(-38,10,29);scene.add(sign);
}

function createPier(scene, colliders) {
  const g=new THREE.Group(), cream=mat(0xe3dbc9), green=mat(0x2d6259), dark=mat(0x173744);
  box(22,5,14,cream,0,2.5,0,g);box(23,1,15,green,0,5.5,0,g);box(20,3,.25,dark,0,3,7.1,g);
  for(let x=-8;x<=8;x+=4)box(.25,3,.25,cream,x,7,0,g);
  g.position.set(-65,0,60);scene.add(g);colliders.push({x:-65,z:60,w:23,d:15});
  const sign=textSprite('天星小輪碼頭','STAR FERRY PIER');sign.position.set(-65,8,68);scene.add(sign);
}

function windows(group,w,h,d,color=0x183b55){
  const c=document.createElement('canvas');c.width=256;c.height=512;const x=c.getContext('2d');x.fillStyle='#173042';x.fillRect(0,0,c.width,c.height);x.fillStyle=`#${color.toString(16).padStart(6,'0')}`;
  for(let py=18;py<c.height-12;py+=42)for(let px=14;px<c.width-10;px+=38){x.globalAlpha=((px+py)/10)%3===0?.25:.82;x.fillRect(px,py,19,20)}x.globalAlpha=1;
  const p=new THREE.Mesh(new THREE.PlaneGeometry(w*.88,h*.9),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}));p.position.set(0,h/2,d/2+.03);group.add(p)
}

function createPeninsula(scene,colliders){
  const g=new THREE.Group(),cream=mat(0xd7c5a2,.8),roof=mat(0x577a67,.65),gold=mat(0xc9a84e,.35,.55);
  box(30,16,16,cream,0,8,0,g);box(18,11,13,cream,0,21.5,-1,g);box(10,9,10,cream,0,31,-1,g);box(11,1,11,roof,0,35.8,-1,g);
  for(const x of [-12,-8,-4,0,4,8,12])for(const y of [4,8,12])box(1.3,1.8,.18,mat(0x34576a,.35),x,y,8.08,g);
  for(const x of [-9,-6,-3,0,3,6,9])box(.3,6,.3,gold,x,3,8.6,g);
  g.position.set(-23,0,16);scene.add(g);colliders.push({x:-23,z:16,w:31,d:17});const s=textSprite('半島酒店','THE PENINSULA HONG KONG');s.position.set(-23,20,25);scene.add(s)
}

function createK11(scene,colliders){
  const g=new THREE.Group(),bronze=mat(0x9a7650,.35,.5),glass=mat(0x21475d,.18,.55),gold=mat(0xd4a95c,.25,.65);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(12,15,24,12),bronze);body.position.y=12;body.castShadow=true;g.add(body);const crown=new THREE.Mesh(new THREE.CylinderGeometry(8,11,12,12),glass);crown.position.y=30;g.add(crown);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;box(.35,25,.35,gold,Math.cos(a)*13.6,12.5,Math.sin(a)*13.6,g)}
  const garden=new THREE.Mesh(new THREE.TorusGeometry(17,.6,8,48),mat(0x3f8063));garden.rotation.x=Math.PI/2;garden.position.y=.6;g.add(garden);
  g.position.set(62,0,60);scene.add(g);colliders.push({x:62,z:60,w:29,d:29});const s=textSprite('K11 MUSEA','A MUSE BY THE SEA');s.position.set(62,23,76);scene.add(s)
}

function createISquare(scene,colliders){
  const g=new THREE.Group(),glass=new THREE.MeshPhysicalMaterial({color:0x1c4c69,roughness:.18,metalness:.45}),steel=mat(0x6d8794,.3,.65),cyan=mat(0x52e5e8,.3,.2);
  box(19,54,19,glass,0,27,0,g);box(23,10,23,steel,0,5,0,g);for(let y=4;y<52;y+=4)box(19.2,.15,19.2,cyan,0,y,0,g);for(const x of [-7,-3.5,0,3.5,7])box(.12,50,.12,cyan,x,28,9.58,g);
  g.position.set(61,0,-10);scene.add(g);colliders.push({x:61,z:-10,w:23,d:23});const s=textSprite('iSQUARE 國際廣場','NATHAN ROAD');s.position.set(48.5,22,-10);s.material.rotation=Math.PI/2;scene.add(s)
}

function createCulturalCentre(scene,colliders){
  const g=new THREE.Group(),tile=mat(0xcab79a,.9),dark=mat(0x263d47,.5,.2);box(39,11,17,tile,0,5.5,0,g);box(30,2,20,dark,2,10.5,0,g);
  for(let x=-17;x<18;x+=3)box(.7,8,.7,tile,x,4,9,g);for(let x=-15;x<16;x+=5)box(2,5,.18,dark,x,4,8.65,g);
  g.position.set(-6,0,55);scene.add(g);colliders.push({x:-6,z:55,w:40,d:19});const s=textSprite('香港文化中心','CULTURAL CENTRE');s.position.set(-6,10,65);scene.add(s)
}

function create1881(scene,colliders){
  const g=new THREE.Group(),white=mat(0xeee7d8,.8),red=mat(0x7f4538,.7),green=mat(0x426c5b,.6);box(24,11,16,white,0,5.5,0,g);box(25,2,17,red,0,12,0,g);
  for(let x=-10;x<=10;x+=4){box(.7,9,.7,white,x,4.5,8.4,g);const arch=new THREE.Mesh(new THREE.TorusGeometry(1.15,.25,8,20,Math.PI),white);arch.position.set(x,7,8.35);g.add(arch)}
  const tower=box(7,18,7,white,-8,17,-2,g);const cap=new THREE.Mesh(new THREE.ConeGeometry(5,6,4),green);cap.rotation.y=Math.PI/4;cap.position.set(-8,29,-2);g.add(cap);
  g.position.set(-43,0,4);scene.add(g);colliders.push({x:-43,z:4,w:25,d:18});const s=textSprite('1881 Heritage','FORMER MARINE POLICE HQ');s.position.set(-43,15,14);scene.add(s)
}

function createNathanRoad(scene,colliders){
  const road=box(26,.2,190,mat(0x26323e),28,.01,-42,scene);road.receiveShadow=true;for(let z=-130;z<52;z+=10)box(.35,.04,5,mat(0xe4d16d),28,.13,z,scene);
  for(const side of [-1,1])for(let i=0;i<7;i++){const z=-122+i*14,w=15+((i*7)%8),h=16+((i*13)%30),x=28+side*(23+w/2);const g=new THREE.Group();box(w,h,11,mat(i%3===0?0x75655a:i%3===1?0x405467:0x766e62),0,h/2,0,g);windows(g,w,h,11,i%2?0xffcf62:0x70dce6);g.position.set(x,0,z);scene.add(g);colliders.push({x,z,w,d:12});if(i%2===0){const sign=textSprite(['彌敦道','佐敦','尖沙咀'][i%3],['NATHAN ROAD','JORDAN','TSIM SHA TSUI'][i%3]);sign.scale.set(6,1.5,1);sign.position.set(x-side*(w/2+.2),5,z);scene.add(sign)}}
}

function createPark(scene,colliders){
  box(55,.45,55,mat(0x55785e),-45,.02,-62,scene);for(let i=0;i<28;i++){const x=-69+(i*17%50),z=-86+(i*29%50);const trunk=box(.5,3,.5,mat(0x72513b),x,1.5,z,scene);const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(2.4,1),mat(i%2?0x3d7651:0x56885e));crown.position.set(x,4,z);crown.castShadow=true;scene.add(crown)}colliders.push({x:-45,z:-90,w:57,d:2})
}

function createRoadNetwork(scene){
  const roads=[
    {name:'彌敦道 Nathan Road',x:28,z:-36,w:18,d:205,vertical:true},
    {name:'廣東道 Canton Road',x:-58,z:-30,w:14,d:190,vertical:true},
    {name:'漆咸道南 Chatham Road',x:79,z:-28,w:14,d:188,vertical:true},
    {name:'梳士巴利道 Salisbury Road',x:2,z:36,w:164,d:16,vertical:false},
    {name:'海防道 Haiphong Road',x:0,z:-28,w:150,d:12,vertical:false},
    {name:'柯士甸道 Austin Road',x:2,z:-96,w:162,d:12,vertical:false},
    {name:'佐敦道 Jordan Road',x:2,z:-121,w:162,d:12,vertical:false},
  ];
  const asphalt=mat(0x26313d,.96),line=mat(0xf0d966,.8),walk=mat(0xaeb5b3,.95);
  for(const r of roads){box(r.w,.16,r.d,asphalt,r.x,.02,r.z,scene);if(r.vertical){box(3,.2,r.d,walk,r.x-r.w/2-1.5,.05,r.z,scene);box(3,.2,r.d,walk,r.x+r.w/2+1.5,.05,r.z,scene);for(let z=r.z-r.d/2+6;z<r.z+r.d/2;z+=10)box(.28,.03,5,line,r.x,.13,z,scene)}else{box(r.w,.2,3,walk,r.x,.05,r.z-r.d/2-1.5,scene);box(r.w,.2,3,walk,r.x,.05,r.z+r.d/2+1.5,scene);for(let x=r.x-r.w/2+6;x<r.x+r.w/2;x+=10)box(5,.03,.28,line,x,.13,r.z,scene)}}
  for(const r of roads.filter(r=>!r.vertical)){for(const vx of [28,-58,79]){for(let i=-4;i<=4;i++)box(1.1,.035,8,mat(0xf3f1df),vx+i*1.55,.15,r.z,scene)}}
  return roads;
}

function createTraffic(scene){
  const vehicles=[];const colors=[0xd92935,0xe5e5dc,0x2d8369,0xd9a62e,0x315b91];
  const car=(x,z,axis,speed,min,max,i)=>{const g=new THREE.Group();box(3,1.1,5,mat(colors[i%colors.length],.45,.2),0,.7,0,g);box(2.4,.9,2.5,mat(0xb9d8df,.2,.25),0,1.55,-.2,g);const lightM=mat(0xffdc8d);box(.45,.3,.1,lightM,-.8,.75,-2.55,g);box(.45,.3,.1,lightM,.8,.75,-2.55,g);g.position.set(x,0,z);if(axis==='x')g.rotation.y=Math.PI/2;scene.add(g);vehicles.push({group:g,axis,speed,min,max});};
  for(let i=0;i<6;i++)car(i%2?24:32,-112+i*30,'z',i%2?8:-7,-132,55,i);
  for(let i=0;i<4;i++)car(-62+i*38,i%2?32:40,'x',i%2?7:-8,-80,83,i+6);
  return vehicles;
}

function createMoreLandmarks(scene,colliders){
  const white=mat(0xeeeae0),green=mat(0x30765b,.55),brick=mat(0x994d3e,.8),glass=mat(0x294d66,.3,.35);
  // Kowloon Mosque beside Kowloon Park
  {const g=new THREE.Group();box(12,7,12,white,0,3.5,0,g);const dome=new THREE.Mesh(new THREE.SphereGeometry(4,20,12,0,Math.PI*2,0,Math.PI/2),green);dome.position.y=7;g.add(dome);for(const [x,z] of [[-5,-5],[5,-5],[-5,5],[5,5]]){box(1.1,13,1.1,white,x,6.5,z,g);const cap=new THREE.Mesh(new THREE.ConeGeometry(.9,2,10),green);cap.position.set(x,14,z);g.add(cap)}g.position.set(-10,0,-47);scene.add(g);colliders.push({x:-10,z:-47,w:14,d:14});const s=textSprite('九龍清真寺','KOWLOON MOSQUE');s.position.set(-10,10,-39);scene.add(s)}
  // St Andrew's Church
  {const g=new THREE.Group();box(10,7,18,brick,0,3.5,0,g);box(5,15,6,brick,0,7.5,-8,g);const roof=new THREE.Mesh(new THREE.ConeGeometry(4.3,7,4),mat(0x51443e));roof.rotation.y=Math.PI/4;roof.position.set(0,18,-8);g.add(roof);g.position.set(58,0,-107);scene.add(g);colliders.push({x:58,z:-107,w:12,d:20});const s=textSprite("聖安德烈堂","ST ANDREW'S CHURCH");s.position.set(58,10,-96);scene.add(s)}
  // Temple Street night market
  {for(let z=-125;z<-91;z+=6){for(const x of [-43,-35]){const stall=new THREE.Group();box(5,2.4,4,mat(z%12?0xd84949:0x267f69),0,1.2,0,stall);const awning=new THREE.Mesh(new THREE.ConeGeometry(3.6,1.5,4),mat(0xf1c45b));awning.rotation.y=Math.PI/4;awning.position.y=3.1;stall.add(awning);stall.position.set(x,0,z);scene.add(stall)}}const s=textSprite('廟街夜市','TEMPLE STREET NIGHT MARKET');s.position.set(-39,8,-91);scene.add(s)}
  // Harbour City long waterfront mall
  {const g=new THREE.Group();box(18,17,52,glass,0,8.5,0,g);for(let z=-22;z<23;z+=7)box(18.3,.3,2,mat(0x7bbad0,.25,.5),0,5,z,g);g.position.set(-78,0,10);scene.add(g);colliders.push({x:-78,z:10,w:20,d:54});const s=textSprite('海港城','HARBOUR CITY');s.position.set(-67,14,10);scene.add(s)}
  // Chungking Mansions
  {const g=new THREE.Group();for(let x=-8;x<=8;x+=8)box(7,31,15,mat(0x776858),x,15.5,0,g);box(25,7,17,mat(0x876f58),0,3.5,0,g);windows(g,24,28,15,0xffd370);g.position.set(50,0,10);scene.add(g);colliders.push({x:50,z:10,w:26,d:18});const s=textSprite('重慶大廈','CHUNGKING MANSIONS');s.position.set(50,12,20);scene.add(s)}
  // Jordan MTR entrance
  {const g=new THREE.Group();box(7,3.5,5,mat(0xb63248),0,1.75,0,g);box(8,1,6,mat(0x7b2132),0,3.7,0,g);g.position.set(14,0,-118);scene.add(g);colliders.push({x:14,z:-118,w:8,d:6});const s=textSprite('佐敦站','JORDAN MTR');s.scale.set(7,1.8,1);s.position.set(14,6,-114);scene.add(s)}
  // Avenue of Stars plaques
  {for(let x=8;x<57;x+=7){const plaque=new THREE.Mesh(new THREE.CircleGeometry(1,5),new THREE.MeshStandardMaterial({color:0xd1a64b,metalness:.8,roughness:.25}));plaque.rotation.x=-Math.PI/2;plaque.position.set(x,.18,67);scene.add(plaque)}const s=textSprite('星光大道','AVENUE OF STARS');s.position.set(34,7,71);scene.add(s)}
  // Park discovery pavilion
  {const g=new THREE.Group();for(let i=0;i<8;i++){const a=i/8*Math.PI*2;box(.35,6,.35,mat(0xe5d6b3),Math.cos(a)*4,3,Math.sin(a)*4,g)}const roof=new THREE.Mesh(new THREE.ConeGeometry(6,3,8),mat(0x47705d));roof.position.y=7;g.add(roof);g.position.set(-45,0,-62);scene.add(g)}
}

function createStreetLife(scene){
  const collectibles=[];for(let i=0;i<42;i++){const coin=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.08,18),new THREE.MeshStandardMaterial({color:0xf2c95f,metalness:.75,roughness:.25,emissive:0x5d4100,emissiveIntensity:.35}));coin.rotation.x=Math.PI/2;coin.position.set(-68+(i*31%135),1,-125+(i*47%175));scene.add(coin);collectibles.push({mesh:coin,taken:false,type:'coin',value:10});}
  for(let i=0;i<14;i++){const shape=new THREE.Shape();for(let p=0;p<10;p++){const a=p/10*Math.PI*2-Math.PI/2,r=p%2?0.38:.82;p?shape.lineTo(Math.cos(a)*r,Math.sin(a)*r):shape.moveTo(Math.cos(a)*r,Math.sin(a)*r)}const star=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshStandardMaterial({color:0x79e8ef,metalness:.55,roughness:.3,emissive:0x125c66,emissiveIntensity:.7,side:THREE.DoubleSide}));star.position.set(-62+(i*43%125),1.4,-116+(i*37%170));scene.add(star);collectibles.push({mesh:star,taken:false,type:'star',value:25});}
  for(let i=0;i<6;i++){const gift=new THREE.Group();box(1.3,1.1,1.3,mat(0xe95b83),0,.55,0,gift);box(.25,1.2,1.35,mat(0xf4cf6a),0,.6,0,gift);box(1.35,1.2,.25,mat(0xf4cf6a),0,.6,0,gift);gift.position.set(-55+(i*29%110),0,-102+(i*41%145));scene.add(gift);collectibles.push({mesh:gift,taken:false,type:'gift',value:50});}
  for(let i=0;i<18;i++){const lamp=new THREE.Group();box(.18,5,.18,mat(0x172833),0,2.5,0,lamp);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.35,10,8),new THREE.MeshBasicMaterial({color:0xffd785}));bulb.position.y=5;lamp.add(bulb);lamp.position.set(i%2?-14:72,0,-120+i*10);scene.add(lamp)}
  return collectibles;
}

function createHarbour(scene) {
  const water=new THREE.Mesh(new THREE.PlaneGeometry(240,110,30,16),new THREE.MeshPhysicalMaterial({color:0x0a5a78,roughness:.2,metalness:.2,transparent:true,opacity:.92}));water.rotation.x=-Math.PI/2;water.position.set(0,-.35,92);scene.add(water);
  const promenade=box(150,.6,25,mat(0xbfc3bd),0,-.1,43,scene);promenade.receiveShadow=true;
  for(let x=-70;x<=70;x+=6){box(.15,.25,3,mat(0xd6bd73,.4,.3),x,.23,43,scene)}
  const skyline=new THREE.Group();for(let i=0;i<22;i++){const h=8+Math.random()*25,w=3+Math.random()*6;const b=box(w,h,5,mat(i%3===0?0x163d54:0x244f62,.55,.2),-72+i*7,h/2,0,skyline);for(let y=2;y<h-2;y+=3)box(w*.65,.08,.04,mat(0xf1d270,1),b.position.x,y,2.52,skyline)}skyline.position.z=112;scene.add(skyline);
}

function createRoute(scene, points) {
  const group=new THREE.Group(), m=new THREE.MeshBasicMaterial({color:0xf3c96b,transparent:true,opacity:.7});
  for(let i=0;i<points.length-1;i++){const a=new THREE.Vector3(...points[i]),b=new THREE.Vector3(...points[i+1]);const d=a.distanceTo(b),mid=a.clone().add(b).multiplyScalar(.5);const seg=new THREE.Mesh(new THREE.PlaneGeometry(.22,d),m);seg.rotation.x=-Math.PI/2;seg.rotation.z=-Math.atan2(b.z-a.z,b.x-a.x)+Math.PI/2;seg.position.set(mid.x,.17,mid.z);group.add(seg)}scene.add(group);return group;
}

export function buildWorld(scene){
  const colliders=[];createAtrium(scene,colliders);createHarbour(scene);createSpaceMuseum(scene,colliders);createClockTower(scene,colliders);createPier(scene,colliders);createPeninsula(scene,colliders);createK11(scene,colliders);createISquare(scene,colliders);createCulturalCentre(scene,colliders);create1881(scene,colliders);createNathanRoad(scene,colliders);createPark(scene,colliders);createMoreLandmarks(scene,colliders);
  const floor=box(180,.5,220,mat(0x87928f),0,-.28,-35,scene);floor.receiveShadow=true;const roads=createRoadNetwork(scene);const vehicles=createTraffic(scene);
  for(let z=-30;z<=38;z+=8)for(let x=-70;x<=70;x+=8){const dot=new THREE.Mesh(new THREE.CircleGeometry(.055,10),new THREE.MeshBasicMaterial({color:0xd9d7ca}));dot.rotation.x=-Math.PI/2;dot.position.set(x,.01,z);scene.add(dot)}
  const missions=[
    {id:'star',name:'佐敦探索地圖',x:28,z:-112,r:4,prompt:'啟動佐敦探索地圖',question:{q:'維多利亞港位於香港島和哪一個地方之間？',a:['九龍半島','大嶼山','南丫島','長洲'],c:0}},
    {id:'space',name:'香港太空館',x:25,z:49,r:5,prompt:'掃描太空館展品',question:{q:'香港太空館最著名的建築外形像甚麼？',a:['半個雞蛋','一艘船','一本書','一顆星'],c:0}},
    {id:'isquare',name:'iSQUARE 國際廣場',x:47,z:-10,r:5,prompt:'探索彌敦道城市展品',question:{q:'iSQUARE 位於尖沙咀哪一條主要道路？',a:['彌敦道','皇后大道','德輔道','花園道'],c:0}},
    {id:'peninsula',name:'半島酒店',x:-23,z:28,r:5,prompt:'發現半島酒店故事',question:{q:'香港半島酒店最初在哪一年開業？',a:['1928年','1841年','1975年','2008年'],c:0}},
    {id:'heritage',name:'1881 Heritage',x:-43,z:16,r:5,prompt:'掃描歷史建築',question:{q:'1881 Heritage 前身與哪一個部門有關？',a:['水警','消防處','郵政署','天文台'],c:0}},
    {id:'culture',name:'香港文化中心',x:-6,z:45,r:5,prompt:'點亮文化中心展品',question:{q:'香港文化中心主要用作甚麼用途？',a:['表演藝術','渡輪碼頭','運動場','街市'],c:0}},
    {id:'tower',name:'鐘樓與天星碼頭',x:-43,z:32,r:6,prompt:'收集鐘樓歷史星光',question:{q:'尖沙咀鐘樓原本屬於哪一項交通設施？',a:['九廣鐵路車站','啟德機場','電車總站','山頂纜車'],c:0}},
    {id:'k11',name:'K11 MUSEA',x:62,z:45,r:6,prompt:'完成海濱藝術任務',question:{q:'K11 MUSEA 鄰近哪一個香港海港？',a:['維多利亞港','吐露港','避風塘','赤門海峽'],c:0}},
    {id:'avenue',name:'星光大道',x:34,z:64,r:5,prompt:'尋找電影星光',question:{q:'星光大道主要表揚哪一個行業的人物？',a:['香港電影業','漁業','航空業','醫療業'],c:0}},
    {id:'chungking',name:'重慶大廈',x:50,z:21,r:5,prompt:'探索多元文化地標',question:{q:'重慶大廈位於尖沙咀哪一條主要道路附近？',a:['彌敦道','干諾道','荷李活道','東涌道'],c:0}},
    {id:'harbourcity',name:'海港城',x:-66,z:10,r:5,prompt:'探索大型海旁商場',question:{q:'海港城座落在哪一條道路旁？',a:['廣東道','彌敦道','窩打老道','皇后大道'],c:0}},
    {id:'mosque',name:'九龍公園與清真寺',x:-10,z:-35,r:5,prompt:'發現公園文化故事',question:{q:'九龍清真寺外牆主要是甚麼顏色？',a:['白色','紅色','黑色','紫色'],c:0}},
    {id:'church',name:'聖安德烈堂',x:46,z:-107,r:5,prompt:'探索百年教堂',question:{q:'聖安德烈堂的建築常見哪種物料？',a:['紅磚','竹子','玻璃幕牆','泥土'],c:0}},
    {id:'temple',name:'廟街夜市',x:-28,z:-108,r:5,prompt:'收集夜市美食故事',question:{q:'廟街夜市最著名的是甚麼體驗？',a:['街頭小食與攤檔','滑雪','沙灘活動','農場採摘'],c:0}},
    {id:'mtr',name:'佐敦港鐵站',x:14,z:-110,r:5,prompt:'啟動城市交通展品',question:{q:'香港港鐵常用哪個英文字母簡稱？',a:['MTR','HKT','BUS','TRAM'],c:0}},
    {id:'park',name:'九龍公園探索亭',x:-45,z:-52,r:5,prompt:'完成自然探索',question:{q:'在城市公園散步時應該怎樣保護環境？',a:['帶走垃圾','採摘花朵','餵野生動物','破壞樹木'],c:0}}
  ];
  const missionOrder=['star','isquare','chungking','peninsula','heritage','harbourcity','culture','tower','space','k11','avenue','mosque','park','church','mtr','temple'];
  missions.sort((a,b)=>missionOrder.indexOf(a.id)-missionOrder.indexOf(b.id));
  for(const m of missions){const ring=new THREE.Mesh(new THREE.RingGeometry(2.4,2.65,48),new THREE.MeshBasicMaterial({color:0xf3c96b,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(m.x,.18,m.z);scene.add(ring);m.ring=ring;const beam=new THREE.Mesh(new THREE.CylinderGeometry(.04,1.1,7,20,1,true),new THREE.MeshBasicMaterial({color:0x7ce3ea,transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false}));beam.position.set(m.x,3.5,m.z);scene.add(beam);m.beam=beam}
  const route=createRoute(scene,[[28,0,-106],[28,0,-112],[28,0,-55],[47,0,-10],[50,0,21],[5,0,28],[-23,0,28],[-43,0,16],[-66,0,10],[-35,0,35],[-6,0,45],[-43,0,32],[0,0,47],[25,0,49],[62,0,45],[34,0,64],[-10,0,-35],[-45,0,-52],[46,0,-107],[14,0,-110],[-28,0,-108]]);
  const collectibles=createStreetLife(scene);
  return {colliders,missions,route,collectibles,roads,vehicles};
}
