'use strict';
(()=>{
const B=window.B={};
B.KEY='bolsillo:v7'; B.BACKUP='bolsillo:v7:backup'; B.LEGACY=['bolsillo:v6','bolsillo:v5','bolsillo:v3'];
B.$=id=>document.getElementById(id);
B.$$=s=>Array.from(document.querySelectorAll(s));
B.clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
B.money=n=>new Intl.NumberFormat('es-EC',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(Number(n)||0);
B.esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
B.today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
B.parse=s=>{const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d)};
B.fmt=s=>new Intl.DateTimeFormat('es-EC',{day:'2-digit',month:'short'}).format(B.parse(s));
B.add=(s,n)=>{const d=B.parse(s);d.setDate(d.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
B.diff=(a,b)=>Math.round((B.parse(b)-B.parse(a))/86400000);
B.mk=s=>String(s).slice(0,7);
B.ws=(date=B.today())=>{const d=B.parse(date),dow=d.getDay()||7;d.setDate(d.getDate()-dow+1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
B.mm=()=>{const d=new Date(),y=d.getFullYear(),m=d.getMonth();return{key:`${y}-${String(m+1).padStart(2,'0')}`,day:d.getDate(),total:new Date(y,m+1,0).getDate()}};
B.id=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`;
B.blank=()=>({version:7,profile:{alias:'',income:0,budget:500,savingsRate:10,privacy:false,theme:'black'},transactions:[],checkins:[],goals:[],xp:0,awards:[],pet:{name:'Milo',leaves:2,fed:0,look:'none'},createdAt:new Date().toISOString()});
B.normalize=raw=>{
  const s=B.blank(); if(!raw||typeof raw!=='object')return s;
  s.profile={...s.profile,...(raw.profile||{})};
  s.profile.alias=String(s.profile.alias||'').slice(0,24);
  s.profile.income=B.clamp(Number(s.profile.income)||0,0,1e8);
  s.profile.budget=B.clamp(Number(s.profile.budget)||500,1,1e8);
  s.profile.savingsRate=B.clamp(Number(s.profile.savingsRate)||10,0,90);
  s.profile.privacy=!!s.profile.privacy;
  s.profile.theme=['black','ivory'].includes(s.profile.theme)?s.profile.theme:(s.profile.theme==='obsidian'?'black':'black');
  s.transactions=Array.isArray(raw.transactions)?raw.transactions.slice(-5000).filter(t=>t&&['expense','income'].includes(t.k)&&Number(t.a)>0&&/^\d{4}-\d{2}-\d{2}$/.test(t.d)).map(t=>({id:String(t.id||B.id()),k:t.k,a:B.clamp(Number(t.a),.01,1e8),c:String(t.c||'Otros').slice(0,30),n:String(t.n||t.c||'Movimiento').slice(0,60),d:t.d,planned:t.planned!==false})):[];
  s.checkins=[...new Set(Array.isArray(raw.checkins)?raw.checkins.filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)&&x<=B.today()):[])].slice(-3660);
  s.goals=Array.isArray(raw.goals)?raw.goals.slice(0,30).map(g=>({id:String(g.id||B.id()),name:String(g.name||'Meta').slice(0,40),emoji:String(g.emoji||'🌄').slice(0,4),target:B.clamp(Number(g.target)||1,1,1e8),monthly:B.clamp(Number(g.monthly)||0,0,1e8),due:/^\d{4}-\d{2}-\d{2}$/.test(g.due||'')?g.due:'',contribs:Array.isArray(g.contribs)?g.contribs.slice(-2000).filter(c=>Number(c.a)>0&&/^\d{4}-\d{2}-\d{2}$/.test(c.d)).map(c=>({id:String(c.id||B.id()),a:B.clamp(Number(c.a),.01,1e8),d:c.d})):[]})):[];
  s.xp=B.clamp(Number(raw.xp)||0,0,1e9);
  s.awards=[...new Set(Array.isArray(raw.awards)?raw.awards.map(String):[])];
  s.pet={...s.pet,...(raw.pet||{})};
  s.pet.name=String(s.pet.name||'Milo').slice(0,18);
  s.pet.leaves=B.clamp(Number(s.pet.leaves)||0,0,999999);
  s.pet.fed=B.clamp(Number(s.pet.fed)||0,0,999999);
  s.pet.look=['none','natural','hoodie','scarf','glasses','cap','crown'].includes(s.pet.look)?s.pet.look:(s.pet.look==='none'?'natural':'natural');
  s.createdAt=raw.createdAt||s.createdAt;
  return s;
};
B.load=()=>{
  try{const r=localStorage.getItem(B.KEY);if(r)return B.normalize(JSON.parse(r))}catch{}
  try{const r=localStorage.getItem(B.BACKUP);if(r)return B.normalize(JSON.parse(r))}catch{}
  for(const key of B.LEGACY){try{const r=localStorage.getItem(key);if(!r)continue;const o=JSON.parse(r);if(key==='bolsillo:v6'||key==='bolsillo:v5')return B.normalize(o);if(key==='bolsillo:v3'){const s=B.blank();s.profile.income=Math.max(0,+o.i||0);s.profile.budget=Math.max(1,+o.b||500);s.transactions=Array.isArray(o.t)?o.t.map(t=>({id:String(t.id||B.id()),k:t.k==='income'?'income':'expense',a:+t.a||0,c:String(t.c||'Otros'),n:String(t.n||t.c||'Movimiento'),d:t.d||B.today(),planned:true})):[];s.xp=s.transactions.length*10;return B.normalize(s)}}catch{}}
  return B.blank();
};
B.S=B.load(); B.filter='all'; B.kind='expense'; B.toastTimer=null;
B.save=()=>{try{const c=localStorage.getItem(B.KEY);if(c)localStorage.setItem(B.BACKUP,c);localStorage.setItem(B.KEY,JSON.stringify(B.S));return true}catch{return false}};
B.toast=msg=>{const e=B.$('toast');if(!e)return;e.textContent=msg;e.classList.remove('hidden');clearTimeout(B.toastTimer);B.toastTimer=setTimeout(()=>e.classList.add('hidden'),2500)};
B.contribs=()=>B.S.goals.flatMap(g=>g.contribs.map(c=>({...c,goalId:g.id,goalName:g.name})));
B.streak=()=>{const set=new Set(B.S.checkins);let d=B.today();if(!set.has(d)){d=B.add(d,-1);if(!set.has(d))return 0}let n=0;while(set.has(d)&&n<3660){n++;d=B.add(d,-1)}return n};
B.month=()=>{const mm=B.mm(),tx=B.S.transactions.filter(t=>B.mk(t.d)===mm.key),expense=tx.filter(t=>t.k==='expense'),incomeTx=tx.filter(t=>t.k==='income'),spent=expense.reduce((a,t)=>a+t.a,0),extraIncome=incomeTx.reduce((a,t)=>a+t.a,0),contrib=B.contribs().filter(c=>B.mk(c.d)===mm.key).reduce((a,c)=>a+c.a,0),income=B.S.profile.income+extraIncome,available=income-spent-contrib,ratio=spent/B.S.profile.budget,remainingBudget=Math.max(0,B.S.profile.budget-spent),daysLeft=mm.total-mm.day+1,safe=remainingBudget/Math.max(1,daysLeft),planned=expense.length?expense.filter(t=>t.planned).length/expense.length:1,c={};expense.forEach(t=>c[t.c]=(c[t.c]||0)+t.a);return{...mm,tx,expense,spent,extraIncome,income,contrib,available,ratio,remainingBudget,daysLeft,safe,planned,categories:Object.entries(c).sort((a,b)=>b[1]-a[1])}};
B.goalCurrent=g=>g.contribs.reduce((a,c)=>a+c.a,0);
B.goalProgress=g=>B.clamp(B.goalCurrent(g)/g.target*100,0,100);
B.goalEta=g=>{const left=Math.max(0,g.target-B.goalCurrent(g));if(left<=0)return'Completada';if(g.monthly>0){const n=Math.ceil(left/g.monthly);return n===1?'~1 mes':`~${n} meses`}if(g.due)return`Objetivo ${B.fmt(g.due)}`;return'Sin ritmo definido'};
B.goalMonthScore=cm=>{const g=B.S.goals[0];if(!g||g.monthly<=0)return 80;const a=g.contribs.filter(c=>B.mk(c.d)===cm.key).reduce((x,c)=>x+c.a,0),exp=g.monthly*(cm.day/cm.total);return exp>0?B.clamp(a/exp*100,0,100):100};
B.score=()=>{const cm=B.month(),budget=cm.ratio<=1?100:B.clamp(100-(cm.ratio-1)*180,0,100),planned=cm.planned*100,ws=B.ws(),elapsed=B.diff(ws,B.today())+1,checks=B.S.checkins.filter(d=>d>=ws&&d<=B.today()).length,consistency=B.clamp(checks/Math.max(1,elapsed)*100,0,100),goal=B.goalMonthScore(cm);return Math.round(budget*.35+planned*.2+consistency*.25+goal*.2)};
B.discipline=(start=B.ws())=>{const end=B.add(start,6),current=B.today()>=start&&B.today()<=end,den=current?B.diff(start,B.today())+1:7,checks=B.S.checkins.filter(d=>d>=start&&d<=end).length,tx=B.S.transactions.filter(t=>t.d>=start&&t.d<=end&&t.k==='expense'),planned=tx.length?tx.filter(t=>t.planned).length/tx.length:1,goal=B.contribs().some(c=>c.d>=start&&c.d<=end)?1:(B.S.goals.length?0:.5);return Math.round(B.clamp(checks/Math.max(1,den),0,1)*50+planned*30+goal*20)};
B.level=()=>{const x=B.S.xp; if(x<250)return{name:'Explorador',level:1,next:250,base:0};if(x<700)return{name:'Ahorrador',level:2,next:700,base:250};if(x<1500)return{name:'Estratega',level:3,next:1500,base:700};if(x<2800)return{name:'Arquitecto',level:4,next:2800,base:1500};if(x<5000)return{name:'Maestro',level:5,next:5000,base:2800};return{name:'Leyenda',level:6,next:x+1,base:5000}};
B.league=()=>{const x=B.S.xp;return x<500?{name:'Semilla',icon:'🌱'}:x<1500?{name:'Bronce',icon:'🥉'}:x<3000?{name:'Plata',icon:'🥈'}:x<5500?{name:'Oro',icon:'🥇'}:x<9000?{name:'Esmeralda',icon:'💚'}:{name:'Diamante',icon:'💎'}};
B.awardList=()=>{const cm=B.month(),sc=B.score(),st=B.streak(),g=B.S.goals[0],gp=g?B.goalProgress(g):0,prev=B.discipline(B.add(B.ws(),-7)),cur=B.discipline();return[{id:'first',icon:'✦',name:'Primer paso',ok:B.S.transactions.length>0},{id:'streak7',icon:'🔥',name:'7 días',ok:st>=7},{id:'score90',icon:'♛',name:'90 Club',ok:sc>=90},{id:'planned',icon:'◎',name:'Con intención',ok:cm.expense.length>=3&&cm.planned===1},{id:'goal25',icon:'◒',name:'25% meta',ok:gp>=25},{id:'goal50',icon:'◐',name:'50% meta',ok:gp>=50},{id:'goal100',icon:'◆',name:'Meta completa',ok:gp>=100},{id:'comeback',icon:'↗',name:'Remontada',ok:prev>0&&cur>=prev+15}]};
B.syncAwards=()=>{let ch=false;for(const a of B.awardList())if(a.ok&&!B.S.awards.includes(a.id)){B.S.awards.push(a.id);B.S.xp+=100;B.S.pet.leaves+=2;ch=true}if(ch)B.save()};
B.weekSummary=()=>{const ws=B.ws(),we=B.add(ws,6),tx=B.S.transactions.filter(t=>t.d>=ws&&t.d<=we),expense=tx.filter(t=>t.k==='expense'),spent=expense.reduce((a,t)=>a+t.a,0),planned=expense.length?expense.filter(t=>t.planned).length/expense.length:1,c={};expense.forEach(t=>c[t.c]=(c[t.c]||0)+t.a);const cats=Object.entries(c).sort((a,b)=>b[1]-a[1]);return{ws,we,tx,expense,spent,planned,categories:cats,discipline:B.discipline(ws),score:B.score(),streak:B.streak()}};
B.weekDelta=()=>{const now=B.discipline(),prev=B.discipline(B.add(B.ws(),-7));return{now,prev,delta:prev?now-prev:0}};
B.coach=()=>{const cm=B.month(),pace=cm.ratio/(cm.day/cm.total),top=cm.categories[0],pp=Math.round(cm.planned*100),g=B.S.goals[0];if(cm.ratio>1)return{title:'Recupera margen sin castigarte.',text:`Superaste tu presupuesto por ${B.money(cm.spent-B.S.profile.budget)}. Mira primero ${top?.[0]||'los gastos variables'} y decide qué sí puedes mover.`};if(pace>1.2&&cm.day<cm.total*.75)return{title:'Tu ritmo va más rápido que el calendario.',text:`Tu margen orientativo de hoy es ${B.money(cm.safe)}. No es una orden de gasto; es una referencia para no romper el mes.`};if(cm.expense.length>=4&&pp<75)return{title:'Hay demasiadas sorpresas.',text:`Solo ${pp}% de tus gastos fueron planeados. Anticipar uno de los que normalmente aparece de golpe puede cambiar la semana.`};if(g&&B.goalProgress(g)>0)return{title:`${g.name} ya dejó de ser una idea.`,text:`Llevas ${Math.round(B.goalProgress(g))}% de avance. Repetir una decisión pequeña vale más que prometer una enorme.`};if(top)return{title:`${top[0]} domina el mapa.`,text:'No significa que esté mal. Solo merece una pregunta: ¿representa lo que realmente quieres priorizar este mes?'};return{title:'Primero observamos.',text:'Registra algunos movimientos y Bolsillo buscará patrones sin juzgarte por cuánto ganas.'}};
B.story=()=>{const d=B.weekDelta(),g=B.S.goals[0];if(d.now>=90)return'Una semana consciente vale más que una semana perfecta.';if(d.prev&&d.delta>=10)return`Subiste ${d.delta} puntos contra tu semana anterior.`;if(B.streak()>=7)return`${B.streak()} días mirando de frente a tu dinero.`;if(g&&B.goalProgress(g)>=50)return`Ya cruzaste la mitad de ${g.name}.`;return'La primera victoria es dejar de adivinar dónde se fue.'};
B.petMood=()=>{const today=B.S.checkins.includes(B.today()),sc=B.score();if(today&&sc>=85)return{face:'happy',text:'Está celebrando tu día.'};if(today)return{face:'calm',text:'Está tranquilo: hoy ya miraste tus cuentas.'};if(B.streak()>=3)return{face:'sleepy',text:'Está descansando. Cuando revises tu día, vuelve a animarse.'};return{face:'curious',text:'Quiere conocer tu rutina, no tu saldo.'}};
B.looks=[
 {id:'none',name:'Natural',icon:'✦',xp:0},
 {id:'scarf',name:'Bufanda',icon:'〰',xp:100},
 {id:'glasses',name:'Lentes',icon:'◉',xp:350},
 {id:'cap',name:'Gorra',icon:'⌁',xp:700},
 {id:'crown',name:'Corona',icon:'♛',xp:1500},
 {id:'halo',name:'Halo',icon:'◌',xp:3000}
];
B.addCheck=(date=B.today(),reward=true)=>{if(B.S.checkins.includes(date))return false;B.S.checkins.push(date);B.S.checkins=B.S.checkins.slice(-3660);if(reward){B.S.xp+=15;B.S.pet.leaves+=1}return true};
})();
