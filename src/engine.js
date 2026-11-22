// ===== ENGINE =====
let S = null; // game state
const R = Math.random;
const rnd=(a,b)=>a+R()*(b-a);
const rint=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(R()*a.length)];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function gauss(m=0,s=1){let u=0,v=0;while(!u)u=R();while(!v)v=R();return m+s*Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function wpick(items,wf){let tot=0;const ws=items.map(i=>{const w=Math.max(0,wf(i));tot+=w;return w;});let x=R()*tot;for(let i=0;i<items.length;i++){x-=ws[i];if(x<=0)return items[i];}return items[items.length-1];}
function miles(a1,o1,a2,o2){const r=Math.PI/180,d=Math.sin((a2-a1)*r/2)**2+Math.cos(a1*r)*Math.cos(a2*r)*Math.sin((o2-o1)*r/2)**2;return 3959*2*Math.asin(Math.sqrt(d));}
const T=id=>S.teams[id];
const U=()=>S.user;
const UT=()=>S.teams[S.user.teamId];
function money(k){if(k>=1000)return "$"+(k/1000).toFixed(k>=10000?1:2).replace(/\.?0+$/,"")+"M";return "$"+Math.round(k)+"K";}
function phase(){return S.cal[S.phaseIdx];}
function inSeason(){const p=phase();return p.type==="game";}
function teamLevel(t){return t.talent*0.55+t.prestige*0.45;}

// ---------- NEW GAME ----------
function eloFromTalent(t){return 1500+(t.talent-70)*16+(t.coach.game-75)*3;}
function resetNeeds(t){POSITIONS.forEach(p=>t.need[p]=rnd(0.5,1.5));}

// ---------- USER ROSTER ----------
function genPlayer(pos,yr,baseOvr){
  const ovr=clamp(Math.round(gauss(baseOvr+(yr-2)*3.5,6)),40,97);
  const we=rint(30,95),chr=rint(25,95);
  const p={id:S.nextId++,fn:pick(FIRST),ln:pick(LAST),pos,yr,ovr,pot:clamp(ovr+rint(0,Math.max(1,16-yr*3)),ovr,99),
    we,chr,nil:0,mor:rint(55,90),from:"HS",stars:0,rs:R()<0.3,tr:genTraits(we,chr),hist:[],st:null};
  p.tr.forEach(x=>{if(R()<0.25+yr*0.15)x.rev=true;});p.ovr0=ovr;return p;
}
function budgetTotal(){const t=UT();return Math.round(1500+t.nil*1900+(U().up.collective-1)*700+U().bonusNIL+(U().ad?U().ad.nil:0));}
function distributePayroll(){
  const pool=budgetTotal()*0.68;const ps=S.roster.slice().sort((a,b)=>b.ovr-a.ovr);
  const ws=ps.map(p=>Math.pow(Math.max(1,p.ovr-55),2.2)*(p.pos==="QB"?2.2:1));const tot=ws.reduce((a,b)=>a+b,0);
  ps.forEach((p,i)=>p.nil=Math.round(pool*ws[i]/tot));
}
function payroll(){return S.roster.reduce((a,p)=>a+p.nil,0);}
function budgetLeft(){return budgetTotal()-payroll()-pendingNIL();}

// ---------- RECRUIT CLASS ----------
function genRecruit(cls){
  const g=wpick(RECRUIT_GEO,x=>x[1]);
  const pos=wpick(POSITIONS,p=>POS_SHARE[p]);
  let tPot=clamp(gauss(70,9.5)+(R()<0.04?rnd(5,12):0),45,99);
  const tOvr=clamp(tPot-rnd(8,22),38,84);
  const truth0=tPot*0.66+(tOvr+12)*0.34;const shared=gauss(0,7.2);const pA=truth0+shared+gauss(0,3.8),pB=truth0+shared+gauss(0,3.8);let perc=(pA+pB)/2;
  let tag=null;const x=R();
  if(x<0.06){tPot=clamp(tPot+rnd(5,11),45,99);tag="lb";}else if(x<0.11){tPot=clamp(tPot-rnd(5,10),40,99);tag="pk";}
  const sz=POS_SIZE[pos];const ath=gauss(0,1);
  const mot=MOTIVES.map(()=>rnd(0.12,0.9));const maj=shuffle(MOTIVES.map((m,i)=>i).filter(i=>MOTIVES[i][0]!=="legacy"));mot[maj[0]]+=1.6;mot[maj[1]]+=0.9;
  const LI=MOTIVE_IDX.legacy;let leg=null;
  if(R()<0.12){const near=S.teamIds.filter(id=>miles(T(id).lat,T(id).lon,g[2],g[3])<700&&T(id).prestige>=55);if(near.length){leg=wpick(near,id=>T(id).prestige);mot[LI]=rnd(0.8,1.8);}}
  if(!leg)mot[LI]=0.01;
  const lifeP=wpick(["warm","any","cold"],x=>({warm:55,any:32,cold:13})[x]);
  const offPos=["QB","RB","WR","TE","OL"].includes(pos);
  const fitP=pos==="K"?null:offPos?wpick(OFF_STYLES,x=>({QB:{"Air Raid":3,"Spread RPO":4,"Pro Style":3,"Power Run":1,"Option":0.3},WR:{"Air Raid":5,"Spread RPO":4,"Pro Style":2,"Power Run":0.5,"Option":0.1},RB:{"Air Raid":0.5,"Spread RPO":3,"Pro Style":3,"Power Run":4,"Option":0.6},TE:{"Air Raid":0.3,"Spread RPO":2,"Pro Style":5,"Power Run":4,"Option":0.3},OL:{"Air Raid":1,"Spread RPO":3,"Pro Style":4,"Power Run":5,"Option":0.5}}[pos][x])):pick(DEF_STYLES);
  const we0=rint(20,99),chr0=rint(20,99);
  const ms=mot.reduce((a,b)=>a+b,0);
  const hsL=(S.hs||[]).filter(h=>h.st===g[0]);const hs=hsL.length?wpick(hsL,h=>h.lvl*Math.pow(h.lvl/50,clamp((perc-66)/12,-1,3))):null;
  const gpa=+clamp(gauss(2.95+0.22*(mot[6]-0.5),0.42),1.9,4.0).toFixed(2);
  const r={id:S.nextId++,cls,fn:pick(FIRST),ln:pick(LAST),pos,st:g[0],city:hs?hs.city:pick(g[4]),lat:hs?hs.lat:g[2]+rnd(-1.2,1.2),lon:hs?hs.lon:g[3]+rnd(-1.4,1.4),hs:hs?hs.id:null,gpa,
    ht:Math.round(sz[0]+gauss(0,1.6)),wt:Math.round(sz[1]+gauss(0,sz[1]*0.06)),forty:+(POS_FORTY[pos]-ath*0.06+gauss(0,0.03)).toFixed(2),
    tPot:Math.round(tPot),tOvr:Math.round(tOvr),perc,perc0:perc,pA,pB,tag,we:we0,chr:chr0,mis:pick([-1,0,0,0,1]),leg,lifeP,fitP,tr:genTraits(we0,chr0,tag),
    mot:mot.map(m=>+(m/ms).toFixed(3)),known:0,dec:0,sc:0,int:{},off:[],com:null,hard:false,signed:false,ov:[],ovDone:[],log:[],nilO:0,ss:{g:0},stars:3,rank:0,comp:0.85,pr:0,lastPitch:{},lastTouch:-9,flag:null};
  return r;
}
function decTick(st){
  const d={5:[0.25,0.35,0.3],4:[0.45,0.3,0.2],3:[0.5,0.25,0.2],2:[0.3,0.3,0.25]}[st]||[0.4,0.3,0.2];const x=R();
  if(x<d[0])return R()<0.25?rint(1,3):rint(4,6);
  if(x<d[0]+d[1])return rint(8,21);
  if(x<d[0]+d[1]+d[2])return 22;
  return rint(25,31);
}
function decLabel(r){const d=r.dec,c=S.classTick||0;if(r.com)return null;if(r.cls>S.classYear)return `Class of ${r.cls} — decides as a senior (early commits happen)`;if(d<=6)return d<=c?"Any day now":"Summer (Jun–Jul)";if(d<=21)return d<=c?"Any day now":"During the season (~Week "+(d-8)+")";if(d===22)return "Early Signing Period (Dec)";return "Late — Signing Day (Feb)";}
function nilMarket(r){
  const base={5:900,4:260,3:60,2:15}[r.stars]||15;const posm={QB:2.4,EDGE:1.4,OL:1.2,WR:1.15,CB:1.1,DL:1.1}[r.pos]||1;
  return Math.round(base*posm*rnd(0.7,1.4)/5)*5;
}
function svcTruth(r){return r.tPot*0.66+(r.tOvr+15)*0.34;}
function rName(r){return r.fn+" "+r.ln;}

// ---------- ATTRACTIVENESS ----------
function grade(t,r,m){
  switch(m){
    case "pt":{ if(t.id===U().teamId) return ptGradeUser(r); return clamp(50+(82-t.talent)*1.3+(t.need[r.pos]-1)*40,10,100);}
    case "nil":{ if(t.id===U().teamId){const ratio=(r.nilO||0)/Math.max(5,r.nil)*(hasPerk("x1")?1.1:1);return clamp(15+ratio*70,10,140);} return clamp(t.nil*10+gauss(0,4),10,100);}
    case "win": return clamp((t.elo-1250)/6+(t.mom||0)*1.5,10,100)*0.8+t.prestige*0.2;
    case "prox":{const d=miles(t.lat,t.lon,r.lat,r.lon);let g=d<90?100:d<220?88:d<450?68:d<800?48:d<1400?32:18;if(t.st===r.st)g=Math.min(100,g+10);return g;}
    case "coach": return t.coach.rec;
    case "dev": return t.coach.dev*0.5+t.prestige*0.25+clamp(20+proScore(t)*7,0,100)*0.25;
    case "acad": return t.acad;
    case "brand": return clamp(t.prestige*0.6+t.fac*0.4+(t.mom||0)*1.2+(t.buzz||0)*1.3,10,100);
    case "scheme":{if(!r.fitP)return 70;const offPos=["QB","RB","WR","TE","OL"].includes(r.pos);const ts=offPos?t.off:t.def;if(ts===r.fitP)return 100;
      if(!offPos)return 55;const fam={"Air Raid":"Spread RPO","Spread RPO":"Air Raid","Pro Style":"Power Run","Power Run":"Pro Style"};if(r.fitP==="Option"||ts==="Option")return 25;return fam[r.fitP]===ts?66:38;}
    case "stab": return clamp(45+Math.min(t.coach.yrs||0,10)*5-Math.max(0,t.coach.hot||0)*10,15,100);
    case "life":{const c=climate(t);return r.lifeP==="warm"?c:r.lifeP==="cold"?clamp(125-c,30,100):75;}
    case "legacy": return r.leg===t.id?100:25;
  }
  return 50;
}
function climate(t){if(t.st==="HI")return 100;return clamp(Math.round(100-(t.lat-28)*4.2),30,100);}
function proScore(t){return (t.pro||[]).reduce((a,b)=>a+b,0)/Math.max(1,(t.pro||[]).length);}
function genTraits(we,chr,tag){
  const pool=[];const add=(k,w)=>pool.push([k,w]);
  add("gym",we>75?4:we>50?1.2:0.2);add("lazy",we<35?4:we<50?1:0.1);add("film",1.4);add("quick",1.2);add("clutch",1.1);add("iron",1.1);add("inj",0.9);
  add("lead",chr>78?3:chr>55?1:0.2);add("party",chr<35?4:chr<50?1:0.1);add("diva",chr<55?1.4:0.5);add("loyal",chr>70?2:0.7);add("home",1);add("brand",0.8);add("raw",tag==="lb"?5:0.8);
  const n=R()<0.35?1:R()<0.75?2:3;const out=[];
  for(let i=0;i<n;i++){const left=pool.filter(p=>!out.some(o=>o.k===p[0])&&!(p[0]==="gym"&&out.some(o=>o.k==="lazy"))&&!(p[0]==="lazy"&&out.some(o=>o.k==="gym"))&&!(p[0]==="iron"&&out.some(o=>o.k==="inj"))&&!(p[0]==="inj"&&out.some(o=>o.k==="iron")));
    const k=wpick(left,p=>p[1])[0];out.push({k,rev:false});}
  return out;
}
function hasT(p,k){return p.tr&&p.tr.some(x=>x.k===k);}
function revealTrait(p,how,chance,who){
  // how: film | eval | talk | any
  const hid=(p.tr||[]).filter(x=>!x.rev&&(how==="any"||TRAITS[x.k].vis===how));
  if(hasPerk("e3"))chance*=1.5;
  if(!hid.length||R()>chance)return null;const x=pick(hid);x.rev=true;
  if(who)addNews(`🔍 Trait revealed: ${who} — ${TRAITS[x.k].i} ${TRAITS[x.k].n}.`,"user");
  return x;
}
function traitMult(p,stage){let m=1;(p.tr||[]).forEach(x=>{const t=TRAITS[x.k];if(t.dev)m*=t.dev;if(stage==="early"&&t.early)m*=t.early;if(stage==="late"&&t.late)m*=t.late;});return m;}
function attract(t,r){let s=0;MOTIVES.forEach((m,i)=>s+=r.mot[i]*grade(t,r,m[0]));const v=s/100;return v*v*1.5;}
function ptGradeUser(r){
  const proj=projRoster().filter(p=>p.pos===r.pos).map(p=>p.ovr);
  const myProj=r.portal?r.tOvr:r.tOvr+8;
  const n=POS_STARTERS[r.pos];let better=proj.filter(o=>o>myProj).length;
  if(!r.portal){const uc=userComByPos();better+=(uc[r.pos]||[]).filter(pp=>pp>r.perc).length;}
  if(better<n) return 98; if(better<n+1) return 85; if(better<n+3) return 62; if(better<n+5) return 42; return 22;
}
let _projCache=null,_projKey=-1;
function projRoster(){const key=S.phaseIdx*1000+S.roster.length;if(_projKey===key&&_projCache)return _projCache;_projKey=key;
  _projCache=S.roster.filter(p=>p.yr<4).map(p=>({pos:p.pos,ovr:p.ovr+3}));return _projCache;}
function invalidateProj(){_projKey=-1;}
let _ucKey=null,_uc=null;
function userComByPos(){const uid=U().teamId;const k=S.tick+"|"+S.recruits.length;if(_ucKey===k&&_uc)return _uc;_ucKey=k;_uc={};S.recruits.forEach(x=>{if(x.com===uid&&x.cls===S.classYear)(_uc[x.pos]=_uc[x.pos]||[]).push(x.perc);});return _uc;}

// ---------- OFFERS ----------
function recruitLevel(r){return 100-r.rank/1400*58;}

// ---------- RECRUITING TICK ----------
function commitThreshold(r){return 55+r.stars*24;}
function buildPrio(){
  // each AI staff concentrates effort on its best realistic targets
  const counts=commitCounts();const by={};
  S.recruits.forEach(r=>{if(r.signed||r.com)return;r.off.forEach(id=>{(by[id]=by[id]||[]).push(r);});});
  S._prio={};S._prioTick=S.tick;
  Object.keys(by).forEach(id=>{const t=T(id);if(!t)return;const open=Math.max(0,t.target-(counts[id]||0));
    const list=by[id].map(r=>({r,v:recruitLevel(r)*t.need[r.pos]*(1+(r.int[id]||0)/200)*(r.cls===S.classYear?1:0.55)})).sort((a,b)=>b.v-a.v);
    S._prio[id]=new Set(list.slice(0,Math.ceil(open*2.6)+2).map(x=>x.r.id));});
}
function doCommit(r,tid,ranked,evts,oldTid){
  const uid=U().teamId;r.com=tid;r.comWk=S.tick;r.hard=r.ovDone.includes(tid);
  r.int[tid]=(r.int[tid]||0)+15;
  const t=T(tid);
  if(!oldTid||true){const bz=r.stars>=5?1.2:r.stars===4?(r.rank<=100?0.5:0.3):0.05;t.buzz=Math.min(10,(t.buzz||0)+bz);
    if(tid===uid&&!S._presim&&r.stars>=4&&S.summary)S.summary.lines.push(`💥 Landing ${rName(r)} (#${r.rank}) has other recruits taking notice — program buzz ${t.buzz.toFixed(1)}.`);}
  if(oldTid&&!S._presim){if(tid===uid&&isRival(oldTid,uid)){gainPC(3);gainDXP(15);addNews(`⚔️ You flipped ${rName(r)} away from RIVAL ${T(oldTid).school}!`,"user");}
    if(oldTid===uid&&isRival(tid,uid)){U().sec=clamp(U().sec-2,0,100);addNews(`⚔️ Rival ${t.school} flipped ${rName(r)} away from you. Boosters are not happy.`,"user");}}
  if(oldTid){
    addNews(`🔄 FLIP! ${r.stars}★ ${r.pos} ${rName(r)} (#${r.rank}) flips from ${T(oldTid).school} to ${t.school}.`,oldTid===uid||tid===uid?"user":"flip",tid);feed(r,`Change of plans… 🔄 Committed to ${t.school}.`);
    if(oldTid===uid)evts.push({k:"lost",r,t:tid});if(tid===uid)evts.push({k:"flip",r,t:oldTid});
  }else{
    if(r.rank<=150||tid===uid||r.off.includes(uid))addNews(`🔒 ${r.stars}★ ${r.pos} ${rName(r)} (#${r.rank}${r.cls>S.classYear?", Class of "+r.cls:""}, ${r.city}, ${r.st}) commits to ${t.school}.`,tid===uid?"user":"commit",tid);
    if(r.rank<=200||tid===uid)feed(r,r.cls>S.classYear?`🔒 Committed early to ${t.school}! Shut it down 🛑`:`🔒 1000% COMMITTED. ${t.school} 🧢 Thank you to everyone who recruited me.`);
    if(tid===uid)evts.push({k:"commit",r});
  }
  const top3=ranked.slice(0,3).map(x=>x[0]);
  if(!S._presim&&top3.includes(uid)&&r.off.includes(uid)&&!oldTid){
    S.ceremonies.push({rid:r.id,hats:shuffle(top3.slice()),pick:tid});
    if(tid!==uid)evts.push({k:"miss",r,t:tid});
  }
}
function decommit(r,why){const old=r.com;r.com=null;r.hard=false;if(r.int[old])r.int[old]*=0.55;feed(r,`After a lot of prayer I'm decommitting from ${T(old).school}. Recruitment 100% open.`);
  addNews(`💔 ${r.stars}★ ${r.pos} ${rName(r)} decommits from ${T(old).school}${why?" — "+why:""}.`,old===U().teamId?"user":"flip",old);
}

// ---------- PRESIM ----------

// ---------- SCHEDULE ----------
function genSchedule(){
  for(let attempt=0;attempt<60;attempt++){const g=tryGenSchedule();if(g){S.games=g;return;}}
  S.games=tryGenSchedule(true);
}
function tryGenSchedule(force){
  const games=[];const busy={};S.teamIds.forEach(id=>busy[id]=new Set());
  const cnt={};S.teamIds.forEach(id=>cnt[id]=0);const met=new Set();
  const key=(a,b)=>a<b?a+"|"+b:b+"|"+a;
  const add=(a,b,wk,conf)=>{const h=R()<0.5?a:b;games.push({id:S.nextId++,wk,h,a:h===a?b:a,hs:0,as:0,done:false,kind:"reg",conf});busy[a].add(wk);busy[b].add(wk);cnt[a]++;cnt[b]++;met.add(key(a,b));};
  RIVALS.forEach(([a,b])=>{if(T(a)&&T(b)&&!busy[a].has(13)&&!busy[b].has(13))add(a,b,13,T(a).conf===T(b).conf&&T(a).conf!=="Independent");});
  RIVAL_EXTRA.forEach(([a,b])=>{if(!T(a)||!T(b)||met.has(key(a,b)))return;const sameC=T(a).conf===T(b).conf&&T(a).conf!=="Independent";
    if(sameC&&games.filter(g=>g.conf&&(g.h===a||g.a===a)).length>=CONF_GAMES[T(a).conf]-1)return;
    const w=shuffle([3,4,5,6,7,8,9,10,11,12]).find(w=>!busy[a].has(w)&&!busy[b].has(w));if(w!==undefined)add(a,b,w,sameC);});
  const confPairs=[];
  Object.keys(CONF_GAMES).forEach(conf=>{
    const ids=shuffle(S.teamIds.filter(id=>T(id).conf===conf));const k=CONF_GAMES[conf];
    const arr=ids.slice();if(arr.length%2)arr.push(null);const n=arr.length;
    const rounds=[];const rot=arr.slice(1);
    for(let r=0;r<n-1;r++){const cur=[arr[0]].concat(rot);const pr=[];for(let i=0;i<n/2;i++){const a=cur[i],b=cur[n-1-i];if(a&&b)pr.push([a,b]);}rounds.push(pr);rot.unshift(rot.pop());}
    shuffle(rounds);
    const need={};ids.forEach(id=>need[id]=k);
    ids.forEach(id=>{games.forEach(g=>{if(g.conf&&(g.h===id||g.a===id))need[id]--;});});
    for(const pr of rounds){for(const [a,b] of pr){if(need[a]>0&&need[b]>0&&!met.has(key(a,b))){confPairs.push([a,b]);need[a]--;need[b]--;met.add(key(a,b));}}}
  });
  const confCount={};S.teamIds.forEach(id=>confCount[id]=0);
  confPairs.forEach(([a,b])=>{confCount[a]++;confCount[b]++;});
  const left={};S.teamIds.forEach(id=>left[id]=12-cnt[id]-confCount[id]);
  const ncPairs=[];
  const order=shuffle(S.teamIds.slice());
  for(const a of order){
    let guard=0;
    while(left[a]>0&&guard++<30){
      const ta=T(a);
      const opts=S.teamIds.filter(b=>b!==a&&left[b]>0&&(T(b).conf!==ta.conf||ta.conf==="Independent")&&!met.has(key(a,b)));
      if(!opts.length||R()<(P4.includes(ta.conf)?0.26:0.1)){ncPairs.push([a,"FCS"]);left[a]--;continue;}
      const b=wpick(opts,x=>{const tb=T(x);const dl=Math.abs(teamLevel(tb)-teamLevel(ta));return 1/(1+dl/15)+(P4.includes(ta.conf)&&!P4.includes(tb.conf)?0.8:0);});
      ncPairs.push([a,b]);left[a]--;left[b]--;met.add(key(a,b));
    }
  }
  const assign=(a,b,pref,conf)=>{
    const wks=shuffle([0,1,2,3,4,5,6,7,8,9,10,11,12]).sort((x,y)=>pref(x)-pref(y));
    for(const w of wks){if(!busy[a].has(w)&&(b==="FCS"||!busy[b].has(w))){
      if(b==="FCS"){games.push({id:S.nextId++,wk:w,h:a,a:"FCS",fcs:pick(FCS_OPPS),hs:0,as:0,done:false,kind:"reg"});busy[a].add(w);}
      else{const h=R()<0.5?a:b;games.push({id:S.nextId++,wk:w,h,a:h===a?b:a,hs:0,as:0,done:false,kind:"reg",conf});busy[a].add(w);busy[b].add(w);}
      return true;}}
    return false;
  };
  shuffle(ncPairs);shuffle(confPairs);
  // conference games first (harder to place), then non-conference
  for(const [a,b] of confPairs){if(!assign(a,b,w=>(w>=4?0:1)+R()*0.5,true)&&!force)return null;}
  for(const [a,b] of ncPairs){if(!assign(a,b,w=>(w<=3?0:1)+R()*0.5,false)&&!force)return null;}
  games.sort((x,y)=>x.wk-y.wk);
  return games;
}

// ---------- GAME SIM ----------
function starterTraitBonus(){let b=0;POSITIONS.forEach(pos=>{depth(pos).slice(0,POS_STARTERS[pos]).forEach(p=>{(p.tr||[]).forEach(x=>{if(TRAITS[x.k].game)b+=TRAITS[x.k].game*(pos==="QB"?2:0.4);});if(p.susp)b-=pos==="QB"?3:0.5;});});return clamp(b,-4,4);}
function fixScore(x){x=Math.round(x);if(x<0)x=0;const m={1:0,2:3,4:3,5:6,8:7,11:10,12:13,15:14,18:17,19:20,22:21,25:24,26:27,29:28,32:31,33:34,36:35,39:38,40:41,43:42,46:45,47:48,50:49,53:52,54:55,57:56,60:59};return m[x]!==undefined?m[x]:x;}
function momentum(t,o,won){
  const ranked=o.apRank&&o.apRank<=25;const iR=t.apRank&&t.apRank<=25;
  let d=won?(ranked?2.4:o.elo>t.elo?1.4:0.6):(iR&&!ranked?-2.4:ranked?-0.6:-1.5);
  t.mom=clamp((t.mom||0)*0.85+d,-10,10);
}
function teamGames(id){return S.games.filter(g=>g.h===id||g.a===id);}
function gameLine(g,id){
  const home=g.h===id;const opp=home?g.a:g.h;const os=home?g.as:g.hs;const ms=home?g.hs:g.as;
  const oname=opp==="FCS"?g.fcs:T(opp).school;return {opp,oname,home,ms,os,w:ms>os,done:g.done};
}

// ---------- POLLS ----------
function updatePolls(){
  const ids=S.teamIds;const g5pen=t=>(t.conf==="Independent"||P4.includes(t.conf))?0:-55;
  ids.forEach(id=>{const t=T(id);const raw=t.elo+7*t.w-36*t.l+g5pen(t);t.ap=(S.weekNo<=0||!t.ap)?raw:0.72*raw+0.28*t.ap;});
  const ap=ids.slice().sort((a,b)=>T(b).ap-T(a).ap);ap.forEach((id,i)=>T(id).apRank=i<25?i+1:0);
  S.polls.prevAp=S.polls.ap.slice();S.polls.ap=ap.slice(0,25);
  ids.forEach(id=>{const t=T(id);let sos=0,n=0,qw=0;teamGames(id).forEach(g=>{if(!g.done||g.a==="FCS"||g.kind==="bowl")return;const o=T(g.h===id?g.a:g.h);sos+=o.elo;n++;const L=gameLine(g,id);if(L.w&&o.apRank)qw+=1+(25-o.apRank)/25;});
    sos=n?sos/n:1500;t.sos=sos;
    t.cfp=t.elo*0.62+11*t.w-44*t.l+(sos-1500)*0.35+14*qw+g5pen(t)*1.1;});
  const cfp=ids.slice().sort((a,b)=>T(b).cfp-T(a).cfp);cfp.forEach((id,i)=>T(id).cfpRank=i<25?i+1:0);
  S.polls.prevCfp=S.polls.cfp.slice();S.polls.cfp=cfp.slice(0,25);
}
function rankStr(id,useCfp){const t=T(id);const r=(useCfp&&S.polls.cfpLive)?t.cfpRank:t.apRank;return r?"#"+r+" ":"";}
function standings(conf){
  return S.teamIds.filter(id=>T(id).conf===conf).sort((a,b)=>{const A=T(a),B=T(b);const pa=A.cw/Math.max(1,A.cw+A.cl),pb=B.cw/Math.max(1,B.cw+B.cl);if(pb!==pa)return pb-pa;const oa=A.w/Math.max(1,A.w+A.l),ob=B.w/Math.max(1,B.w+B.l);if(ob!==oa)return ob-oa;return B.cfp-A.cfp;});
}

// ---------- SEASON FLOW ----------
function setGoals(){
  const t=UT();
  const order=S.teamIds.slice().sort((a,b)=>teamLevel(T(b))-teamLevel(T(a)));const exp=order.indexOf(t.id)+1;
  const tgt=exp<=3?5:exp<=8?10:exp<=15?15:exp<=25?25:exp<=40?40:exp<=60?55:70;
  const fours=t.prestige>=85?8:t.prestige>=70?4:t.prestige>=55?2:1;
  const loc=t.prestige>=70?2:1;
  S.user.goals=[
    {k:"rank",label:`Finish with a Top ${tgt} recruiting class`,v:tgt},
    {k:"blue",label:`Sign ${fours}+ blue-chip (4★/5★) recruits`,v:fours},
    {k:"budget",label:`Stay within the player-comp budget`,v:0},
    {k:"local",label:`Sign ${loc} in-state prospect${loc>1?"s":""} (${STATE_NAMES[t.st]||t.st}, 3★+)`,v:loc},
  ];
}
function weekGames(wk){return S.games.filter(g=>g.wk===wk&&g.kind==="reg");}
function userGame(wk){return S.games.find(g=>g.wk===wk&&(g.h===U().teamId||g.a===U().teamId)&&g.kind==="reg");}

// ---------- ADVANCE ----------
function moraleAfterGame(w){S.roster.forEach(p=>p.mor=clamp(p.mor+(w?1.5:-2)+rnd(-1,1),0,100));}
function upsetNews(gs){
  gs.forEach(g=>{if(g.a==="FCS"){if(g.as>g.hs)addNews(`😱 FCS STUNNER: ${g.fcs} upsets ${T(g.h).school} ${g.as}-${g.hs}!`,"game");return;}
    const h=T(g.h),a=T(g.a);const wn=g.hs>g.as?h:a,ls=g.hs>g.as?a:h;
    if(ls.apRank&&ls.apRank<=10&&(!wn.apRank||wn.apRank>ls.apRank+8))addNews(`🚨 UPSET: ${wn.apRank?"#"+wn.apRank+" ":""}${wn.school} knocks off #${ls.apRank} ${ls.school}, ${Math.max(g.hs,g.as)}-${Math.min(g.hs,g.as)}.`,"game");
    else if(h.apRank&&a.apRank&&h.apRank<=15&&a.apRank<=15)addNews(`🏟️ Top-15 clash: #${wn.apRank} ${wn.school} beats #${ls.apRank} ${ls.school} ${Math.max(g.hs,g.as)}-${Math.min(g.hs,g.as)}.`,"game");
  });
}
function statLine(r){const s=r.ss;if(!s||!s.g)return "Senior season hasn't started";
  switch(r.pos){case "QB":return `${s.yd} pass yds, ${s.td} TD, ${s.int||0} INT (${s.g} gms)`;case "RB":return `${s.yd} rush yds, ${s.td} TD (${s.g} gms)`;
  case "WR":case "TE":return `${s.rec} rec, ${s.yd} yds, ${s.td} TD (${s.g} gms)`;case "OL":return `${s.pan} pancakes in ${s.g} starts`;
  case "DL":case "EDGE":case "LB":return `${s.tk} tackles, ${s.sk||0} sacks (${s.g} gms)`;case "CB":case "S":return `${s.tk} tackles, ${s.int||0} INT, ${s.pbu||0} PBU (${s.g} gms)`;case "K":return `${s.fg} FG made (${s.g} gms)`;}}

// ---------- CHAMPIONSHIPS & CFP ----------
function playCCGs(sum){
  Object.keys(CONF_GAMES).forEach(conf=>{
    const st=standings(conf);const a=st[0],b=st[1];if(!a||!b)return;
    const g={id:S.nextId++,wk:14,h:a,a:b,hs:0,as:0,done:false,kind:"ccg",neutral:true,label:conf+" Championship"};
    S.games.push(g);simGame(g);const w=winner(g);T(w).champ=conf;
    addNews(`🏆 ${T(w).school} wins the ${conf} Championship, ${Math.max(g.hs,g.as)}-${Math.min(g.hs,g.as)} over ${T(w===a?b:a).school}.`,"game");
    if(a===U().teamId||b===U().teamId){const L=gameLine(g,U().teamId);sum.my=`${L.w?"🏆 "+conf+" CHAMPIONS!":"❌ Lost the "+conf+" title game"} ${L.ms}-${L.os} vs ${L.oname}`;if(L.w){UT().hist.push({y:S.year,conf});gainDXP(40);gainPC(6);leg().conf++;leg().tro.push({y:S.year,t:conf+" Champions",team:U().teamId});}}
  });
}
function selectCFP(sum){
  const ranked=S.teamIds.slice().sort((a,b)=>T(b).cfp-T(a).cfp);
  const champs=ranked.filter(id=>T(id).champ);const auto=champs.slice(0,5);
  const field=auto.slice();for(const id of ranked){if(field.length>=12)break;if(!field.includes(id))field.push(id);}
  field.sort((a,b)=>ranked.indexOf(a)-ranked.indexOf(b));
  S.cfpField={seeds:field,games:[],champ:null,auto};
  [[4,11],[5,10],[6,9],[7,8]].forEach(([x,y],i)=>S.cfpField.games.push({id:S.nextId++,h:field[x],a:field[y],hs:0,as:0,done:false,kind:"cfp",round:1,slot:i,label:`CFP First Round (#${x+1} vs #${y+1})`}));
  addNews(`🎟️ CFP field set! First-round byes: ${field.slice(0,4).map((id,i)=>(i+1)+". "+T(id).school).join(", ")}.`,"rank");
  const uid=U().teamId;const seed=field.indexOf(uid);
  if(seed>=0){gainDXP(40);gainPC(10);leg().cfp++;sum.lines.push(`🎟️ ${UT().school} is IN the College Football Playoff as the #${seed+1} seed!`);addNews(`🎟️ ${UT().school} makes the CFP as the #${seed+1} seed. Recruits are watching.`,"user");U().rep=clamp(U().rep+3,0,100);
    S.recruits.forEach(r=>{if(r.off.includes(uid))r.int[uid]=(r.int[uid]||0)+6;});UT().hist.push({y:S.year,cfp:seed+1});}
  else sum.lines.push(`📺 ${UT().school} missed the playoff.`);
}
function cfpBowl(round,slot){if(round===2)return CFP_BOWLS.qf[slot];if(round===3)return CFP_BOWLS.sf[slot];if(round===4)return "National Championship";return "First Round";}
function playCFPRound(round,sum){
  const F=S.cfpField;if(!F)return;const uid=U().teamId;
  if(round===2){const r1=F.games.filter(g=>g.round===1);[[0,3],[1,2],[2,1],[3,0]].forEach(([s,slot],i)=>{const w=winner(r1[slot]);F.games.push({id:S.nextId++,h:F.seeds[s],a:w,hs:0,as:0,done:false,kind:"cfp",round:2,slot:i,neutral:true,label:cfpBowl(2,i)+" (CFP Quarterfinal)"});});}
  if(round===3){const q=F.games.filter(g=>g.round===2);[[0,3],[1,2]].forEach(([a,b],i)=>F.games.push({id:S.nextId++,h:winner(q[a]),a:winner(q[b]),hs:0,as:0,done:false,kind:"cfp",round:3,slot:i,neutral:true,label:cfpBowl(3,i)+" (CFP Semifinal)"}));}
  if(round===4){const s=F.games.filter(g=>g.round===3);F.games.push({id:S.nextId++,h:winner(s[0]),a:winner(s[1]),hs:0,as:0,done:false,kind:"cfp",round:4,slot:0,neutral:true,label:"CFP National Championship"});}
  F.games.filter(g=>g.round===round&&!g.done).forEach(g=>{simGame(g);
    const w=winner(g),l=w===g.h?g.a:g.h;T(w).cfpW=(T(w).cfpW||0)+1;T(w).mom=clamp((T(w).mom||0)+1.5,-10,10);
    S.recruits.forEach(r=>{if(!r.signed&&r.off.includes(w))r.int[w]=(r.int[w]||0)+4;});
    if(w===uid){gainPC(3);gainDXP(20);}
    addNews(`🏟️ ${g.label}: ${T(w).school} ${Math.max(g.hs,g.as)}, ${T(l).school} ${Math.min(g.hs,g.as)}.`,"game");
    if(g.h===uid||g.a===uid){const L=gameLine(g,uid);sum.my=`${L.w?"✅":"❌"} ${g.label}: ${L.ms}-${L.os} vs ${L.oname}`;}
  });
  if(round===4){const g=F.games.find(x=>x.round===4);const w=winner(g);F.champ=w;S.champs.push({y:S.year,id:w});
    addNews(`🏆🏆 ${T(w).school} are the ${S.year} NATIONAL CHAMPIONS!`,"game");T(w).hist.push({y:S.year,natl:true});
    if(w===uid){gainDXP(100);gainPC(20);leg().nat++;leg().tro.push({y:S.year,t:"National Champions",team:uid});sum.lines.push("🏆 NATIONAL CHAMPIONS! The phones are ringing off the hook.");U().rep=clamp(U().rep+8,0,100);S.recruits.forEach(r=>{if(r.off.includes(uid))r.int[uid]=(r.int[uid]||0)+15;});}
    T(w).elo+=60;updatePolls();
  }
}
function winner(g){return g.hs>g.as?g.h:g.a;}

// ---------- COACHING CAROUSEL ----------
const COACH_FN=["Mike","Tim","Chris","Jason","Brian","Matt","Kevin","Steve","Dan","Josh","Ryan","Jeff","Mark","Shane","Will","Kane","Derek","Travis","Marcus","Andre"];
const COACH_LN=["Holloway","Brennan","Castillo","Pryor","Whitfield","Grady","Okoye","Lindqvist","Barrett","Delaney","Mercer","Sutton","Vance","Rourke","Callahan","Teague","Dorsett","Ashby","Kincaid","Merritt"];
function fakeCoach(lo,hi){return {name:pick(COACH_FN)+" "+pick(COACH_LN),rec:rint(lo,hi),dev:rint(lo+4,hi+4),game:rint(lo+2,hi+2),hot:0,yrs:0,real:false};}
function coachChangeUser(sum,oldName,nc){sum.lines.push(`🎠 Coaching change: ${oldName} is out. New head coach ${nc.name} (REC ${nc.rec} / DEV ${nc.dev} / GAME ${nc.game}). Your commits are wobbling.`);U().sec=clamp(U().sec-8,0,100);}

// ---------- OFFICIAL VISITS ----------
function ovSlots(){
  const p=phase();const out=[];const uid=U().teamId;
  if(p.type==="game"||p.type==="pre"){S.games.filter(g=>g.kind==="reg"&&g.h===uid&&!g.done&&g.wk>=(p.week||0)).forEach(g=>out.push({key:"w"+g.wk,label:`Week ${g.wk} vs ${g.a==="FCS"?g.fcs:T(g.a).school}`,game:g}));}
  const nsdIdx=S.cal.findIndex(c=>c.key==="nsd");
  if(S.phaseIdx>nsdIdx){["ov1","ov2"].forEach(k=>{const idx=S.cal.findIndex(c=>c.key===k);if(idx>=S.phaseIdx)out.push({key:k,label:S.cal[idx].label+" ("+S.cal[idx].date+")"});});}
  return out;
}
function ovBooked(key){return S.recruits.filter(r=>r.ov.includes(key)).length;}
function resolveOVs(p){
  const uid=U().teamId;const key=p.key;
  const vis=S.recruits.filter(r=>r.ov.includes(key));if(!vis.length)return;
  const g=p.type==="game"?userGame(p.week):null;
  let gameF=1,desc="";
  if(g){simGame(g);const L=gameLine(g,uid);const oppT=L.opp!=="FCS"?T(L.opp):null;
    gameF=L.w?(oppT&&oppT.apRank?1.5:1.15):(L.os-L.ms>17?0.45:0.75);
    if(oppT&&isRival(uid,oppT.id))gameF*=L.w?1.3:0.85;
    desc=L.w?`a ${L.ms}-${L.os} win`:`a ${L.ms}-${L.os} loss`;}
  vis.forEach(r=>{
    r.ov=r.ov.filter(v=>v!==key);r.ovDone.push(uid);
    const vibe=gauss(1,0.18);const gain=26*(0.5+attract(UT(),r))*gameF*vibe*skM("rel")*(hasPerk("x2")?1.2:1)*pipeMult(r);gainXP("rel",3);growPipe(r,3,1);
    const ox=revealTrait(r,"any",0.6);if(ox)r.log.unshift(`${p.label}: 🔍 Over the weekend you learned he's ${TRAITS[ox.k].i} ${TRAITS[ox.k].n}.`);
    r.int[uid]=(r.int[uid]||0)+gain;r.lastTouch=S.tick;if(r.com===uid)r.hard=true;
    const mood=gain>40?"🔥 He LOVED it":gain>25?"👍 Strong visit":gain>14?"😐 Fine visit":"🥶 Flat visit";
    r.log.unshift(`${p.label}: Official visit${g?" ("+desc+")":""} — ${mood} (+${Math.round(gain)})`);
    S.summary.lines.push(`🏟️ OV: ${rName(r)} — ${mood}${g?" after "+desc:""}.`);if(gain>25)feed(r,`Had an amazing official visit at ${UT().school} 🔥🔥`);
  });
}
function aiOVs(){
  S.recruits.forEach(r=>{if(r.signed||r.stars<3)return;const top=r.off.filter(id=>id!==U().teamId).sort((a,b)=>(r.int[b]||0)-(r.int[a]||0)).slice(0,2);
    top.forEach(id=>{if(R()<0.5&&r.ovDone.length<5&&!r.ovDone.includes(id)){r.int[id]+=18*(0.5+attract(T(id),r));r.ovDone.push(id);}});});
}

// ---------- USER ACTIONS ----------
const ACT={
  uv:{h:2,label:"Unofficial Visit",desc:"Campus visit"},
  film:{h:2,label:"Watch Film",desc:"Scouting +18"},
  eval:{h:5,label:"In-Person Eval",desc:"Scouting +40"},
  call:{h:1,label:"Phone Call",desc:"Interest +, learn motives"},
  pitch:{h:2,label:"Pitch",desc:"Sell one motivation"},
  visit:{h:5,label:"Assistant Visit",desc:"Interest ++"},
  hc:{h:0,label:"Head Coach Visit",desc:"Uses HC slot"},
};
function hoursPerWeek(){return U().hoursMax+(U().up.staff-1)*6+(U().sk.net-1)+(U().ad?U().ad.staff:0)+(hasPerk("n1")?4:0);}
function sk(k){return (U().sk&&U().sk[k])||1;}
function skM(k,per){return 1+(sk(k)-1)*(per||0.05);}
function gainXP(k,n,sum){const u=U();u.xp[k]=(u.xp[k]||0)+n;let need=xpNeed(u.sk[k]);
  while(u.sk[k]<10&&u.xp[k]>=need){u.xp[k]-=need;u.sk[k]++;need=xpNeed(u.sk[k]);const nm=SKILLS.find(s=>s[0]===k)[1];
    const msg=`🆙 Director skill up: ${nm} is now Lv ${u.sk[k]}.`;addNews(msg,"user");(S._lvl=S._lvl||[]).push(msg);}}
function xpNeed(l){return Math.round(25+l*l*9);}
function canSpend(h){return U().hours>=h;}
function spend(h){U().hours-=h;}
function scoutMult(){return (1+0.18*(U().up.scout-1))*skM("eval",0.06);}
function act(r,type,arg){
  const uid=U().teamId;const t=UT();const a=ACT[type];
  const cost=actCost(type);
  if(a&&!canSpend(cost))return {ok:false,msg:"Not enough hours this week."};
  if(r.signed&&r.com!==uid)return {ok:false,msg:"He has already signed elsewhere."};
  if(isDead()&&["visit","eval","hc","uv"].includes(type))return {ok:false,msg:"Dead period — no in-person contact this week. Calls, pitches and NIL only."};
  if(type==="nil"&&!r.portal&&r.cls!==S.classYear)return {ok:false,msg:"NIL talks start his senior year."};
  if(type==="uv"){if(r.portal)return {ok:false,msg:"Portal players take campus visits — use Assistant Visit."};if(r.uvT===S.phaseIdx+"|"+S.year)return {ok:false,msg:"He already made an unofficial visit this week."};}
  const atr=attract(t,r);let msg="";
  if(r.tkT!==S.tick){r.tkT=S.tick;r.tkN=0;}
  const fat=["call","pitch","visit","hc","eval","uv"].includes(type)?[1,0.75,0.5,0.35,0.25][Math.min(4,r.tkN)]:1;
  const isPortal=!!r.portal;
  const pre=(r.off.includes(uid)?1:0.6)*fat*(isPortal?(hasPerk("n3")?1.3:1):pipeMult(r))*(r.com&&r.com!==uid&&hasPerk("c3")?1.35:1)*(["call","pitch"].includes(type)&&hasPerk("c1")?1.15:1);
  const hsB=isPortal?1:1+pipeHS(r)/200;
  const reveal=(p)=>{if(R()<p){const unknown=MOTIVES.map((m,i)=>i).filter(i=>!(r.known&(1<<i)));if(unknown.length){const i=wpick(unknown,x=>r.mot[x]+0.05);r.known|=(1<<i);return ` Learned: "${MOTIVES[i][1]}" is ${motLevel(r.mot[i])} to him.`;}}return "";};
  switch(type){
    case "film":{spend(cost);const g=Math.round(18*scoutMult()*hsB);r.sc=Math.min(100,r.sc+g);msg=`Film study complete (+${g} scouting).`;gainXP("eval",2);
      const x=revealTrait(r,"film",0.18+r.sc/250);if(x)msg+=` 🔍 The tape shows a trait: ${TRAITS[x.k].i} ${TRAITS[x.k].n}.`;break;}
    case "eval":{spend(a.h);growPipe(r,1.5,0.3);const g=Math.round(40*scoutMult()*hsB);r.sc=Math.min(100,r.sc+g);r.int[uid]=(r.int[uid]||0)+3*pre;msg=`In-person evaluation done (+${g} scouting). He noticed you in the stands.`;gainXP("eval",5);
      const x=revealTrait(r,R()<0.6?"eval":"film",0.55);if(x)msg+=` 🔍 Seen in person: ${TRAITS[x.k].i} ${TRAITS[x.k].n}.`;break;}
    case "call":{spend(a.h);r.gpaK=true;if(r.han&&R()<0.3)r.hanK=true;if(r.par&&R()<0.4)r.parK=true;const g=(4.5+rnd(0,2.5))*(0.6+atr)*pre*skM("pers");r.int[uid]=(r.int[uid]||0)+g;msg=`Good call (+${g.toFixed(1)}).`+reveal(0.42+sk("pers")*0.03);gainXP("pers",1);
      const x=revealTrait(r,"talk",0.12);if(x)msg+=` 🔍 You get a read on him: ${TRAITS[x.k].i} ${TRAITS[x.k].n}.`;break;}
    case "pitch":{spend(a.h);const i=MOTIVE_IDX[arg];const w=r.mot[i];const g0=grade(t,r,arg);
      const recent=r.lastPitch[arg]!==undefined&&S.tick-r.lastPitch[arg]<3?0.45:1;
      const g=46*w*Math.pow(Math.min(g0,120)/100,1.5)*recent*pre*rnd(0.85,1.15)*skM("pers");gainXP("pers",2);r.int[uid]=(r.int[uid]||0)+g;r.lastPitch[arg]=S.tick;
      r.known|=(1<<i);
      const react=w>=0.2&&g0>=70?"🔥 That landed. He lit up.":w>=0.2&&g0<55?"😬 He cares about it, but isn't buying your case.":w<0.1?"🥱 He doesn't care much about that.":g0>=70?"👍 Solid pitch.":"😐 Lukewarm.";
      msg=`${MOTIVES[i][1]} pitch: ${react} (+${g.toFixed(1)})`+(recent<1?" — you just pitched this; diminishing returns.":"");break;}
    case "visit":{const ba=bestAsst(r);if(!ba)return {ok:false,msg:"All of your assistants are already out on the road this week (2 visits each)."};
      spend(a.h);r.gpaK=true;if(r.han&&R()<0.7)r.hanK=true;if(r.par&&R()<0.7)r.parK=true;growPipe(r,1,0.3);const as=ba.s;if(as.vt!==S.tick){as.vt=S.tick;as.vn=0;}as.vn++;
      const g=13*(0.6+atr)*pre*rnd(0.8,1.2)*skM("rel")*(ba.v/75);r.int[uid]=(r.int[uid]||0)+g;msg=`${as.name} (${STAFF_ROLES.find(x=>x.k===as.role).n}) visited${as.terr.includes(r.st)?" — his home turf":""} (+${g.toFixed(1)}).`+reveal(0.62+sk("pers")*0.03);gainXP("rel",3);
      const x=revealTrait(r,R()<0.7?"talk":"eval",0.4);if(x)msg+=` 🔍 Time with the family reveals: ${TRAITS[x.k].i} ${TRAITS[x.k].n}.`;break;}
    case "hc":{if(U().hc<=0)return {ok:false,msg:"No head-coach visits left this week."};U().hc--;
      const cw=r.mot[MOTIVE_IDX.coach];const g=(12+cw*45)*(t.coach.rec/75)*pre*rnd(0.85,1.2)*skM("rel");r.int[uid]=(r.int[uid]||0)+g;gainXP("rel",2);
      const hx=revealTrait(r,"talk",0.3);
      msg=(hx?`🔍 Coach came away knowing he's ${TRAITS[hx.k].i} ${TRAITS[hx.k].n}. `:"")+`${t.coach.name} sat in the living room (+${g.toFixed(1)}).`+(cw>0.2?" The coach relationship matters a ton to this kid.":"");break;}
    case "uv":{spend(a.h);r.uvT=S.phaseIdx+"|"+S.year;const g=9*(0.6+atr)*pre*rnd(0.85,1.2)*skM("rel");r.int[uid]=(r.int[uid]||0)+g;growPipe(r,1,0.3);gainXP("rel",2);r.parK=r.parK||(r.par&&R()<0.6);
      msg=`Unofficial visit to campus (+${g.toFixed(1)}).`+reveal(0.5);feed(r,`Great day at ${t.school} 🔥 Thanks for having me!`);break;}
    case "offer":{if(r.off.includes(uid))return {ok:false,msg:"Already offered."};
      const lim=isPortal?40:offerLimit();const used=isPortal?S.portal.filter(x=>x.off.includes(uid)).length:S.recruits.filter(x=>x.off.includes(uid)&&!x.signed&&(!x.com||x.com===uid)).length;
      if(used>=lim)return {ok:false,msg:`Offer limit reached (${lim}).`};
      r.off.push(uid);const g=6*(0.6+atr);r.int[uid]=(r.int[uid]||0)+g;
      const ai=!isPortal?admitIssue(r,uid):null;if(ai&&(r.sc>=20||hasPerk("e2")))msg+=`⚠️ Admissions flag: ${ai}. `;
      msg+=r.stars>=4&&R()<0.5?`"Blessed to receive an offer from ${t.school}!" 🙏 (+${g.toFixed(1)})`:`Offer extended (+${g.toFixed(1)}).`;
      if(!isPortal&&r.rank<=300){addNews(`📨 ${t.school} offers ${r.stars}★ ${r.pos} ${rName(r)} (#${r.rank}${r.cls!==S.classYear?", Class of "+r.cls:""}).`,"user");feed(r,`Blessed to receive an offer from ${t.school}! 🙏 #AGTG`);}break;}
    case "nil":{const amt=Math.max(0,Math.round(arg));const old=r.nilO||0;
      const avail=budgetLeft()+(r.com===uid?old:0);
      if(amt>old&&amt>avail)return {ok:false,msg:`Not enough budget. ${money(Math.max(0,avail))} available.`};
      if(amt<old&&r.com===uid){r.int[uid]*=0.85;}
      r.nilO=amt;const mk=Math.max(5,r.nil)/(hasPerk("x1")?1.1:1);const ratio=Math.min(amt/mk,1.6),oratio=Math.min(old/mk,1.6);const w=r.mot[MOTIVE_IDX.nil];
      let g=amt>old?(ratio-oratio)*40*(0.3+w*2.5)*skM("neg",0.06):0;if(amt>old)gainXP("neg",2);
      if(amt/mk>1.75+sk("neg")*0.05&&R()<0.4-sk("neg")*0.02){g*=0.4;r.int[uid]=(r.int[uid]||0)+g;msg=`🚩 NIL Go flagged the deal (${money(amt)}) as above market value — his camp is spooked. Interest gain cut (+${g.toFixed(1)}).`;break;}
      r.int[uid]=(r.int[uid]||0)+g;
      msg=amt===0?"NIL offer withdrawn.":`NIL package ${money(amt)}/yr on the table (+${g.toFixed(1)}). His market value is ~${money(r.nil)}.`;break;}
  }
  if(r.int[uid]&&!r.off.includes(uid))r.int[uid]=Math.min(r.int[uid],40);
  if(type!=="film"&&type!=="eval")r.lastTouch=S.tick;
  if(fat<1)msg+=` (He's heard from you a lot this week — diminishing returns.)`;
  if(["call","pitch","visit","hc","eval","uv"].includes(type))r.tkN++;
  if(msg)r.log.unshift(`${phase().label}: ${msg}`);if(r.log.length>14)r.log.length=14;
  if(!isPortal&&!S.user.targets[r.id]&&type!=="film"&&targetCount()<targetCap())S.user.targets[r.id]=1;
  return {ok:true,msg};
}
function targetCap(){return 25+U().up.staff*5;}
function targetCount(){let n=0;const ids=S.user.targets;S.recruits.forEach(r=>{if(ids[r.id]&&!r.signed)n++;});return n;}
function toggleTarget(r){if(S.user.targets[r.id]){delete S.user.targets[r.id];return {ok:true,on:false};}if(targetCount()>=targetCap())return {ok:false,msg:`Priority board full (${targetCap()}). Remove someone first.`};S.user.targets[r.id]=1;return {ok:true,on:true};}
function offerLimit(){return 110+U().up.staff*10;}
function motLevel(w){return w>=0.24?"a top priority":w>=0.13?"important":w>=0.08?"somewhat important":"not a big deal";}
function ovCap(key){const x=(U().ad?U().ad.ov:0)+(hasPerk("x2")?4:0);return (key.startsWith("ov")?12+U().up.staff*2:6+U().up.staff)+x;}
function boosterEvent(){
  if(U().boosterUsed)return {ok:false,msg:"Already held a booster event this week."};
  if(!canSpend(6))return {ok:false,msg:"Need 6 hours."};
  spend(6);U().boosterUsed=true;const t=UT();
  const raised=Math.round((80+t.prestige*3+Math.max(0,t.streak)*40+Math.max(0,t.mom)*25+(t.apRank?(26-t.apRank)*12:0))*rnd(0.6,1.4)*(1+0.2*(U().up.collective-1))*skM("net",0.08)*(hasPerk("n4")?1.5:1)/5)*5;gainXP("net",4);
  U().bonusNIL+=raised;addNews(`💰 Booster dinner raises ${money(raised)} for the ${t.school} collective.`,"user");
  return {ok:true,msg:`Booster event raised ${money(raised)} for the collective!`};
}

// ---------- CREW CRYSTAL BALL ----------
function topSchools(r,n){const tot=r.off.reduce((a,id)=>a+(r.int[id]||0),0)||1;return r.off.map(id=>({id,p:(r.int[id]||0)/tot,pts:r.int[id]||0})).sort((a,b)=>b.pts-a.pts).slice(0,n||5);}
function crystalBall(r){if(r.com)return null;const ts=topSchools(r,3);if(!ts.length||ts[0].pts<commitThreshold(r)*0.45)return null;
  const conf=clamp(Math.round(ts[0].p*100*1.25+(ts[0].pts/commitThreshold(r))*12),30,95);return {id:ts[0].id,conf};}
function userStanding(r){const uid=U().teamId;const ts=topSchools(r,20);const i=ts.findIndex(x=>x.id===uid);if(i<0)return {i:-1,label:r.off.includes(uid)?"—":"No offer",p:0};
  const p=ts[i].p;return {i,p,label:i===0?"Leader":i<3?"Top 3":i<5?"In the mix":"Long shot"};}

// ---------- SCOUTING DISPLAY ----------
const LETTERS=[[93,"A+"],[89,"A"],[85,"A-"],[81,"B+"],[77,"B"],[73,"B-"],[69,"C+"],[65,"C"],[61,"C-"],[0,"D"]];
function letter(v){for(const [t,l] of LETTERS)if(v>=t)return l;return "D";}
function letterShift(l,d){const i=LETTERS.findIndex(x=>x[1]===l);return LETTERS[clamp(i-d,0,LETTERS.length-1)][1];}
function scoutView(r){
  const sc=r.sc;const lvl=U().up.scout;const out={};
  if(r.portal){out.ovr=sc>=40||hasPerk("n3")?String(r.tOvr):`${r.tOvr-3}–${r.tOvr+3}`;}
  else if(sc<15)out.ovr="?";else{const w=Math.round(Math.max(0,13-sc/8));out.ovr=w<=0?String(r.tOvr):`${r.tOvr-w+Math.round(r.mis*w/3)}–${r.tOvr+w+Math.round(r.mis*w/3)}`;}
  const L=letter(r.tPot);const err=(lvl<3&&sk("eval")<6&&sc<90&&!hasPerk("e4"))?r.mis:0;
  if(sc<30&&!r.portal)out.pot="?";else if(sc<(hasPerk("e4")?40:65)){const c=letterShift(L,err);out.pot=letterShift(c,1)+" to "+letterShift(c,-1);}else out.pot=letterShift(L,err);
  const tl=v=>v>=75?"High":v>=45?"Average":"Low";
  out.we=sc>=55?(sc>=90?r.we:tl(r.we)):"?";out.chr=sc>=55?(sc>=90?r.chr:tl(r.chr)):"?";
  const gap=r.tPot-(r.perc+1);
  const gt=hasPerk("e2")?30:50;out.gem=sc>=gt&&gap>=6&&!r.portal; out.bust=sc>=gt&&gap<=-5&&!r.portal;
  if(err&&out.gem&&r.mis<0)out.gem=false;
  out.chrFlag=sc>=55&&r.chr<35;
  return out;
}

// ---------- CLASS RANKINGS ----------

// ---------- TRANSFER PORTAL ----------

// ---------- SIGNING DAY / CLASS CLOSE ----------
function jobOffers(){
  const uid=U().teamId;const rep=U().rep;const cur=UT().prestige;if(rep<50)return [];
  const c=S.teamIds.filter(id=>id!==uid&&T(id).prestige>cur&&T(id).prestige<=rep+25).sort(()=>R()-0.5).slice(0,rep>75?3:rep>62?2:1);
  return R()<0.75?c:[];
}

// ---------- RANDOM EVENTS ----------

// ---------- UPGRADES ----------
function upgrade(k){if(U().upPts<=0||U().up[k]>=5)return false;U().upPts--;U().up[k]++;if(k==="staff")U().hoursMax=40;return true;}

// ---------- NEWS ----------
function addNews(txt,type,team){S.news.unshift({t:txt,type,team,ph:phase()?phase().label:"",y:S.year});if(S.news.length>400)S.news.length=400;}

// ---------- SAVE ----------

// ---------- v2: PROGRAM PERCEPTION, PROGRESSION, DRAFT, COACH GROWTH ----------
function programPerception(sum){
  const uid=U().teamId;const notes=[];
  S.teamIds.forEach(id=>{const t=T(id);t.prev={prestige:t.prestige,nil:t.nil,fac:t.fac};
    const exp=3.5+(t.prestige-38)/60*6.5+(t.bowl?0.5:0)+0.6*(t.cfpW||0)*0;let d=(t.w-(t.cfpW||0)-(t.bowl&&t.bowl.w?1:0)-exp)*0.32;
    const inCFP=S.cfpField&&S.cfpField.seeds.includes(id);
    if(inCFP)d+=1.2+(t.cfpW||0)*0.8+(S.cfpField.champ===id?1.5:0);
    else if(t.bowl)d+=t.bowl.w?0.6:-0.3;else if(t.w<6)d-=0.4;
    if(t.champ)d+=0.7;if(t.apRank&&t.apRank<=10)d+=0.5;
    d+=0.45*(t.rivW||0)-0.55*(t.rivL||0);
    const c5=S.recruits.filter(r=>r.com===id&&r.stars===5&&r.cls===S.classYear).length;d+=Math.min(1,c5*0.2);
    d+=(t.heis?0.6:0)+Math.min(0.8,(t.aaN||0)*0.12);
    d+=(t.base-t.prestige)*0.06; // gravity toward historical brand
    d=clamp(d,-3,3.5);t.prestige=clamp(Math.round((t.prestige+d)*10)/10,20,99);
    // collectives follow winning
    let nd=d*0.15+(t.mom||0)*0.02;t.nil=clamp(Math.round((t.nil+clamp(nd,-0.5,0.6))*10)/10,1,10);
    // facilities: winners build, losers fall behind slowly
    if(d>1.2&&t.nil>=4&&R()<0.3){const g=rint(3,7);t.fac=clamp(t.fac+g,40,100);t.facNews=g;if(id===uid||t.prestige>=70)addNews(`🏗️ ${t.school} announces a new football facility project (+${g} facilities).`,id===uid?"user":"coach",id);}
    else if(R()<0.25)t.fac=clamp(t.fac-1,40,100);
  });
  adYearly(sum);
  const t=UT();const p0=t.prev;
  const ch=(k,lbl,fmt)=>{const dv=Math.round((t[k]-p0[k])*10)/10;return dv?`${lbl} ${fmt?fmt(p0[k]):Math.round(p0[k])} → ${fmt?fmt(t[k]):Math.round(t[k])} (${dv>0?"+":""}${dv})`:null;};
  const parts=[ch("prestige","Prestige",v=>v.toFixed(1)),ch("nil","NIL power",v=>v.toFixed(1)),ch("fac","Facilities")].filter(Boolean);
  if(parts.length){const up=t.prestige>=p0.prestige;sum.lines.push(`${up?"📈":"📉"} Program perception: ${parts.join(" · ")}.`);addNews(`${up?"📈":"📉"} ${t.school} perception after the season: ${parts.join(" · ")}.`,"user");}
  // biggest national movers
  const movers=S.teamIds.map(id=>({id,d:T(id).prestige-T(id).prev.prestige})).sort((a,b)=>b.d-a.d);
  if(movers[0].d>=2)addNews(`📈 Rising programs: ${movers.slice(0,3).map(m=>T(m.id).school+" (+"+m.d.toFixed(1)+")").join(", ")}.`,"rank");
  if(movers[movers.length-1].d<=-2)addNews(`📉 Slipping: ${movers.slice(-3).reverse().map(m=>T(m.id).school+" ("+m.d.toFixed(1)+")").join(", ")}.`,"rank");
}
function coachGrowth(sum){
  const uid=U().teamId;
  S.teamIds.forEach(id=>{const t=T(id);const c=t.coach;const exp=3.5+(t.prestige-38)/60*6.5;const perf=t.w-exp;
    const before=[c.rec,c.dev,c.game];
    const young=(c.yrs||0)<4;
    c.rec=clamp(Math.round(c.rec+clamp(perf*0.25,-1.2,1.2)+(young?rnd(0,1.4):0)+(t.mom>4?0.6:0)-(c.rec-74)*0.05),40,99);
    c.game=clamp(Math.round(c.game+clamp(perf*0.25,-1,1.5)+(young?rnd(0,1.2):rnd(-0.6,0.4))-(c.game-76)*0.04),40,99);
    c.dev=clamp(Math.round(c.dev+(young?rnd(0,1.2):rnd(-0.4,0.6))+(proScore(t)>6?0.4:0)),40,99);
    if(id===uid){const d=[c.rec-before[0],c.dev-before[1],c.game-before[2]];if(d.some(x=>x))sum.lines.push(`🧢 Coach ${c.name} evolves: REC ${c.rec} (${d[0]>=0?"+":""}${d[0]}) · DEV ${c.dev} (${d[1]>=0?"+":""}${d[1]}) · GAME ${c.game} (${d[2]>=0?"+":""}${d[2]}).`);}
  });
}
function draftRound(o){return o>=91?1:o>=88?2:o>=85?3:o>=83?4:o>=81?5:o>=79?6:o>=77?7:0;}
function marketOffers(n,maxP){const uid=U().teamId;const cap=maxP||UT().prestige+5;return S.teamIds.filter(id=>id!==uid&&T(id).prestige<=cap&&T(id).prestige>=Math.min(cap-35,U().rep-30)).sort(()=>R()-0.5).slice(0,n);}

// ---------- v3: DIRECTOR CAREER ----------
function hasPerk(k){return !!(S&&S.user&&S.user.perks&&S.user.perks[k]);}
function dxpNeed(l){return 100+l*60;}
function dirTitle(l){let t=DIR_TITLES[0][1];DIR_TITLES.forEach(([lv,n])=>{if(l>=lv)t=n;});return t;}
function gainDXP(n){const u=U();if(!u||u.lvl===undefined)return;u.dxp+=n;let need=dxpNeed(u.lvl);
  while(u.lvl<30&&u.dxp>=need){u.dxp-=need;u.lvl++;u.pp++;need=dxpNeed(u.lvl);const m=`⭐ Director level ${u.lvl} — ${dirTitle(u.lvl)}. +1 perk point.`;addNews(m,"user");(S._lvl=S._lvl||[]).push(m);u.rep=clamp(u.rep+1,0,100);}}
function perkAvail(k){const p=PERKS.find(x=>x.k===k);const br=PERKS.filter(x=>x.b===p.b);const i=br.indexOf(p);return !hasPerk(k)&&(i===0||hasPerk(br[i-1].k));}
function buyPerk(k){if(U().pp<=0||!perkAvail(k))return false;U().pp--;U().perks[k]=1;if(k==="n1"||k==="c2"){U().hours+=k==="n1"?4:0;if(k==="c2")U().hc++;}return true;}
function actCost(type){if(type==="film"&&hasPerk("e1"))return 1;return ACT[type]?ACT[type].h:0;}
// ---------- v3: ADMINISTRATION ----------
function initAD(){const t=UT();const base=(SCHOOL_RULES[t.id]&&SCHOOL_RULES[t.id].acad)||(t.acad>=95?"strict":t.acad>=85?"moderate":"flexible");
  S.user.ad={commit:Math.round(40+t.prestige*0.4),pc:20,nil:0,staff:0,ov:0,waiv:0,waivUsed:0,tier:base,honor:!!(SCHOOL_RULES[t.id]&&SCHOOL_RULES[t.id].honor),lastReq:-1,log:[]};}
function tierOf(t){if(t.id===U().teamId&&U().ad)return U().ad.tier;return (SCHOOL_RULES[t.id]&&SCHOOL_RULES[t.id].acad)||(t.acad>=95?"strict":t.acad>=85?"moderate":"flexible");}
function minGPA(t){return TIER_GPA[tierOf(t)];}
function admitIssue(r,tid){const t=T(tid);if(!t||r.portal)return null;const mg=minGPA(t);if(r.gpa<mg)return `GPA ${r.gpa.toFixed(2)} below the ${mg.toFixed(1)} standard`;
  const honor=tid===U().teamId?U().ad.honor:!!(SCHOOL_RULES[tid]&&SCHOOL_RULES[tid].honor);if(honor&&r.chr<38)return "honor-code / character review";return null;}
function waiversLeft(){const a=U().ad;return Math.max(0,TIER_WAIV[a.tier]+a.waiv-a.waivUsed);}
function userSignCheck(r){const ai=admitIssue(r,U().teamId);if(!ai)return true;const a=U().ad;
  if(waiversLeft()>0){a.waivUsed++;addNews(`📝 Admissions waiver used to sign ${rName(r)} (${ai}).`,"user");return true;}
  const deny=a.tier==="strict"?1:0.55;
  if(R()<deny){const t=UT();r.com=null;r.int[U().teamId]=0;r.off=r.off.filter(x=>x!==U().teamId);addNews(`🚫 Admissions denied ${r.stars}★ ${r.pos} ${rName(r)} (${ai}). He's back on the market.`,"user");
    if(S.summary)S.summary.lines.push(`🚫 Admissions turned down ${rName(r)} (${ai}). He reopens his recruitment.`);return false;}
  addNews(`😅 ${rName(r)} squeaks through admissions despite ${ai}.`,"user");return true;}
function gainPC(n){const a=U().ad;if(!a)return;a.pc=clamp(a.pc+n*(hasPerk("x3")?1.5:1),0,100);}
function adRequest(k){
  const a=U().ad;const t=UT();const q=AD_REQS.find(x=>x.k===k);
  if(a.lastReq===S.tick)return {ok:false,msg:"The AD already took a meeting with you this week."};
  if(a.pc<q.pc)return {ok:false,msg:`You need ${q.pc} political capital (have ${Math.round(a.pc)}).`};
  if(k==="relax"&&a.tier==="flexible")return {ok:false,msg:"Your standards are already as flexible as they get."};
  a.lastReq=S.tick;
  let p=0.3+a.commit/200+(t.mom||0)/40+(hasPerk("x3")?0.15:0)+(U().rep-50)/250;
  if(k==="waiv")p+=a.tier==="strict"?-0.1:0.35;
  if(k==="relax")p=(t.acad>=95?0.06:a.tier==="strict"?0.18:0.32)+a.commit/400+(hasPerk("x3")?0.1:0);
  if(k==="fac")p-=0.05;
  p=clamp(p,0.03,0.95);
  if(R()<p){a.pc-=q.pc;
    if(k==="nil")a.nil+=800;if(k==="staff"){a.staff+=4;a.ov+=2;U().hours+=4;a.staffPool=(a.staffPool||0)+500;}if(k==="fac"){t.fac=clamp(t.fac+5,40,100);t.prestige=clamp(t.prestige+0.5,20,99);}
    if(k==="waiv")a.waiv++;if(k==="relax")a.tier=TIER_ORDER[Math.min(2,TIER_ORDER.indexOf(a.tier)+1)];
    a.commit=clamp(a.commit-2,0,100);const m=`✅ AD approved: ${q.n}.`;a.log.unshift(`${S.year} ${phase().label}: ${m}`);addNews(m,"user");gainDXP(10);return {ok:true,msg:m};}
  a.pc-=Math.round(q.pc/2);a.commit=clamp(a.commit-1,0,100);const m=`❌ AD declined: ${q.n}. ("Come back when we're winning more.")`;a.log.unshift(`${S.year} ${phase().label}: ${m}`);return {ok:false,msg:m};
}
function adYearly(sum){
  const a=U().ad;if(!a)return;const t=UT();const exp=3.5+(t.prestige-38)/60*6.5;const perf=t.w-exp;
  const cfp=S.cfpField&&S.cfpField.seeds.includes(t.id);
  const post=cfp?3+(t.cfpW||0)*2+(S.cfpField.champ===t.id?5:0):t.bowl?(t.bowl.w?2:0):-1;
  const before=a.commit;a.commit=clamp(Math.round(a.commit+(perf-(t.cfpW||0))*1.5+post+(t.champ?2:0)+(t.rivW||0)*1.5-(t.rivL||0)*2+(50-a.commit)*0.05),0,100);
  sum.lines.push(`🏛️ AD commitment to football: ${before} → ${a.commit}.`);
  if(a.commit>=75&&perf>1){const amt=Math.round((200+perf*80+(cfp?250:0))/50)*50;a.nil+=amt;sum.lines.push(`🏛️ The university doubles down: +${money(amt)}/yr in player-comp funding.`);addNews(`🏛️ ${t.school} increases its football investment by ${money(amt)}/yr.`,"user");}
  if(a.commit<30&&perf<-1){const cut=Math.min(a.nil,400);a.nil-=cut;if(a.staff>0)a.staff-=2;sum.lines.push(`🏛️ Budget cuts: the AD trimmed ${money(cut)} and recruiting staff support.`);}
}
// ---------- v3: PIPELINES ----------
function genHS(){
  S.hs=[];let id=1;
  RECRUIT_GEO.forEach(g=>{const n=Math.max(3,Math.round(g[1]*6));const used=new Set();
    for(let i=0;i<n;i++){const city=pick(g[4]);let nm;let k=0;do{nm=city+" "+pick(HS_SUFFIX);k++;}while(used.has(nm)&&k<20);used.add(nm);
      S.hs.push({id:id++,name:nm,city,st:g[0],lat:g[2]+rnd(-1.1,1.1),lon:g[3]+rnd(-1.3,1.3),coach:pick(FIRST)+" "+pick(LAST),lvl:Math.round(clamp(Math.exp(gauss(3.6,0.55)),10,100))});}});
}
function hsById(id){return S.hs?S.hs.find(h=>h.id===id):null;}
function pipeHS(r){return (r.hs&&U().pipe.hs[r.hs])||0;}
function pipeSt(r){return U().pipe.st[r.st]||0;}
function pipeMult(r){if(!r||r.portal)return 1;return 1+pipeSt(r)/250+pipeHS(r)/150;}
function pipeLabel(v){return v>=70?"Elite":v>=45?"Strong":v>=20?"Established":v>0?"Budding":"None";}
function decayPipes(){const P=U().pipe;Object.keys(P.hs).forEach(k=>{P.hs[k]=Math.round(P.hs[k]*0.88*10)/10;if(P.hs[k]<2)delete P.hs[k];});Object.keys(P.st).forEach(k=>{P.st[k]=Math.round(P.st[k]*0.9*10)/10;if(P.st[k]<2)delete P.st[k];});}
function seedPipelines(list){
  if(!U().pipe)return;const uid=U().teamId;let n=0;
  list.forEach(r=>{const h=pipeHS(r),st=pipeSt(r);if(h<20&&st<40)return;
    if(h>=20){r.sc=Math.min(100,r.sc+Math.round(h/3));const unk=MOTIVES.map((m,i)=>i).filter(i=>!(r.known&(1<<i)));if(unk.length){r.known|=(1<<wpick(unk,x=>r.mot[x]));}if(h>=55)revealTrait(r,"any",1,null);n++;}
    r.int[uid]=(r.int[uid]||0)+h/8+(st>=40?st/15:0);r.pipe=true;});
  if(n&&!S._presim&&S.summary)S.summary.lines.push(`🔗 Your high-school pipelines already sent film and the inside scoop on ${n} new prospects.`);
}

// ---------- v4: RIVALS & BOWLS ----------
let _rivSet=null;
function isRival(a,b){if(!_rivSet){_rivSet=new Set();RIVALS.concat(RIVAL_EXTRA).forEach(([x,y])=>{_rivSet.add(x+"|"+y);_rivSet.add(y+"|"+x);});}return _rivSet.has(a+"|"+b);}
function rivalsOf(id){return RIVALS.concat(RIVAL_EXTRA).filter(p=>p.includes(id)).map(p=>p[0]===id?p[1]:p[0]).filter(x=>T(x));}
function seriesStr(a,b){const k=[a,b].sort().join("|");const s=(S.series||{})[k]||{};return `Series since 2026: ${T(a).abbr} ${s[a]||0}–${s[b]||0} ${T(b).abbr}.`;}
function playBowls(sum){
  const uid=U().teamId;const seeds=S.cfpField?S.cfpField.seeds:[];
  const elig=S.teamIds.filter(id=>T(id).w>=6&&!seeds.includes(id)).sort((a,b)=>T(b).elo-T(a).elo);
  const names=shuffle(BOWLS.slice());let bi=0;const used=new Set();
  for(let i=0;i<elig.length;i++){const a=elig[i];if(used.has(a))continue;
    let b=null;for(let j=i+1;j<Math.min(elig.length,i+5);j++){if(!used.has(elig[j])&&T(elig[j]).conf!==T(a).conf){b=elig[j];break;}}
    if(!b)for(let j=i+1;j<elig.length;j++){if(!used.has(elig[j])){b=elig[j];break;}}
    if(!b)break;used.add(a);used.add(b);
    const name=names[bi++%names.length];const g={id:S.nextId++,wk:16,h:a,a:b,hs:0,as:0,done:false,kind:"bowl",neutral:true,label:name};
    S.games.push(g);simGame(g);const w=winner(g),l=w===a?b:a;T(w).bowl={name,w:true};T(l).bowl={name,w:false};T(w).mom=clamp((T(w).mom||0)+1.2,-10,10);
    if(a===uid||b===uid){const L=gameLine(g,uid);sum.lines.push(`🏈 ${name}: ${L.w?"WIN":"LOSS"} ${L.ms}-${L.os} vs ${L.oname}.${L.w?" A bowl win carries into the offseason.":""}`);addNews(`🏈 ${name}: ${UT().school} ${L.w?"beats":"loses to"} ${L.oname} ${L.ms}-${L.os}.`,"user");if(L.w){gainPC(2);gainDXP(12);}}
  }
  if(!seeds.includes(uid)&&UT().w<6)sum.lines.push("🛑 No bowl this year. Rival staffs will make sure recruits hear about it.");
  addNews(`🏈 Bowl season: ${Math.floor(used.size/2)} bowl games played.`,"game");
}

// =====================================================================
// v5: LEAGUE-WIDE ROSTERS, MULTI-YEAR BOARD, STAFF, CAMPS, LEGACY, SAVES
// =====================================================================
function findRec(id){id=+id;return S.recruits.find(r=>r.id===id)||S.portal.find(r=>r.id===id);}
function rosterOf(id){return id===U().teamId?S.roster:(T(id).roster||[]);}
function depth(pos,roster,healthy){let l=(roster||S.roster).filter(p=>p.pos===pos);if(healthy)l=l.filter(p=>!(p.inj>0)&&!(p.susp>0));return l.sort((a,b)=>b.ovr-a.ovr);}
function teamOVR(roster,healthy){let s=0;POSITIONS.forEach(pos=>{const d=depth(pos,roster,healthy);const n=POS_STARTERS[pos];let a=0;for(let i=0;i<n;i++)a+=(d[i]?d[i].ovr:45);s+=POS_WEIGHT[pos]*a/n;});return Math.round(s*10)/10;}
function genRosterFor(id){const t=T(id);const ro=[];
  POSITIONS.forEach(pos=>{for(let i=0;i<POS_ROSTER_TARGET[pos];i++)ro.push(genPlayer(pos,rint(1,4),t.talent-6));});
  for(let k=0;k<4;k++){const d=t.talent-teamOVR(ro);ro.forEach(p=>{p.ovr=clamp(Math.round(p.ovr+d),40,99);p.pot=Math.max(p.pot,p.ovr);});}
  ro.forEach(p=>{p.ovr0=p.ovr;p.stars=p.ovr>=t.talent+6?(R()<0.5?5:4):p.ovr>=t.talent?4:3;if(t.prestige<55)p.stars=Math.max(2,p.stars-1);});
  return ro;}
function genRoster(){S.roster=genRosterFor(U().teamId);distributePayroll();}
function refreshTalent(){S.teamIds.forEach(id=>{T(id).talent=teamOVR(rosterOf(id));});}
function pendingNIL(){let s=0;const sy=S.classYear;S.recruits.forEach(r=>{if(r.com===U().teamId&&r.nilO&&r.cls===sy)s+=r.nilO;});S.portal.forEach(r=>{if(r.com===U().teamId&&r.nilO)s+=r.nilO;});return s;}
function clsLvl(r){return r.portal?0:(r.cls-S.classYear);}
function clsLabel(r){const l=clsLvl(r);return l===0?"Sr":l===1?"Jr":"So";}

// ---------- NEW GAME ----------
function newGame(teamId,dirName,diff,slot){
  S={v:SAVE_VER,slot:slot||1,year:2026,phaseIdx:0,teams:{},teamIds:[],nextId:1,news:[],games:[],recruits:[],portal:[],roster:[],ceremonies:[],events:[],feed:[],
     polls:{ap:[],cfp:[],cfpLive:false},cfpField:null,champs:[],classHist:{},awards:[],heisman:[],summary:null,camps:null};
  S.cal=buildCalendar(S.year);
  TEAM_ROWS.forEach(r=>{
    const [id,school,abbr,mascot,conf,st,lat,lon,c1,c2,prestige,nil,fac,acad,talent,coach,rec,dev,game]=r;
    S.teams[id]={id,school,abbr,mascot,conf,st,lat,lon,c1,c2,prestige,nil,fac,acad,talent,
      coach:{name:coach,rec,dev,game,hot:0,yrs:COACH_YRS[id]!==undefined?COACH_YRS[id]:0,real:true},w:0,mom:0,base:prestige,pro:[],
      off:(TEAM_STYLE[id]||[])[0]||wpick(OFF_STYLES.slice(0,4),x=>({"Spread RPO":55,"Pro Style":22,"Power Run":15,"Air Raid":8})[x]),def:(TEAM_STYLE[id]||[])[1]||pick(DEF_STYLES),l:0,cw:0,cl:0,pf:0,pa:0,elo:0,ap:0,cfp:0,apRank:0,cfpRank:0,
      need:{},target:rint(20,25),hist:[],streak:0};
    S.teamIds.push(id);
  });
  S.user={teamId,name:dirName||"Director",diff:diff||"normal",rep:45,sec:70,hoursMax:40,hours:40,hc:2,
    up:{scout:1,staff:1,collective:1},upPts:2,sk:{eval:1,pers:1,rel:1,neg:1,net:1},xp:{eval:0,pers:0,rel:0,neg:0,net:0},
    lvl:1,dxp:0,pp:1,perks:{},pipe:{st:{},hs:{}},ad:null,goals:[],targets:{},bonusNIL:0,yearsAt:0,boosterUsed:false,career:[],staff:null,
    leg:{tro:[],drafted:[],heis:[],aa:0,roty:0,top1:0,top10:0,nat:0,conf:0,cfp:0,teams:[teamId]}};
  S.teamIds.forEach(id=>resetNeeds(T(id)));
  S.teamIds.forEach(id=>{const t=T(id);t.elo=eloFromTalent(t);t.prev={prestige:t.prestige,nil:t.nil,fac:t.fac};const pp=Math.max(0,Math.round((t.talent-62)/3.2));t.pro=[pp,pp,pp];});
  genHS();
  S.user.pipe.st[S.teams[teamId].st]=15;
  initAD();
  S.teamIds.forEach(id=>{if(id!==teamId)T(id).roster=genRosterFor(id);});
  genRoster();
  S.talentMean0=S.teamIds.reduce((a,id)=>a+T(id).talent,0)/S.teamIds.length;
  initStaff();
  S.classYear=S.year+1;
  genClass(S.year+1,0);genClass(S.year+2,1);genClass(S.year+3,2);
  presim();
  newSeason(true);
  return S;
}

// ---------- CLASSES (seniors, juniors, sophomores) ----------
function genClass(cls,lvl,n){
  lvl=lvl||0;const N=n||[1400,1100,800][lvl];const list=[];
  for(let i=0;i<N;i++){const r=genRecruit(cls);youngify(r,lvl);list.push(r);}
  S.recruits=(S.recruits||[]).concat(list);
  rerank(true);
  list.forEach(r=>{r.nil=nilMarket(r);if(hasT(r,"brand"))r.nil=Math.round(r.nil*1.5/5)*5;r.dec=lvl===0?decTick(r.stars):999;drama(r);});
  initOffers(list,lvl);
  if(U()&&U().pipe)seedPipelines(list);
  if(lvl===0)S.classTick=S.classTick||0;
  return list;
}
function youngify(r,lvl){if(!lvl)return;r.tOvr=Math.max(32,r.tOvr-lvl*rint(5,8));const sh=gauss(0,3.2*lvl);r.pA+=sh+gauss(0,lvl*1.5);r.pB+=sh+gauss(0,lvl*1.5);r.perc=(r.pA+r.pB)/2;}
function drama(r){if(r.stars>=4&&R()<0.25){r.han={n:pick(FIRST)+" "+pick(LAST),k:pick(HANDLER_KINDS)};r.nil=Math.round(r.nil*1.25/5)*5;}if(R()<0.35)r.par=pick(Object.keys(PARENT_KINDS));}
function rerank(initial){
  const by={};S.recruits.forEach(r=>{(by[r.cls]=by[r.cls]||[]).push(r);});
  const bands=[[32,5,0.98,1.0],[360,4,0.895,0.9799],[1110,3,0.8,0.8949],[99999,2,0.7,0.7999]];
  Object.values(by).forEach(arr=>{
    const list=arr.slice().sort((a,b)=>b.perc-a.perc);const posC={};
    list.forEach((r,i)=>{const rank=i+1;const oldStars=r.stars;let lo=0;
      for(const b of bands){if(rank<=b[0]){const span=b[0]===99999?400:b[0]-lo;const f=Math.min(1,(rank-lo-1)/span);r.stars=b[1];r.comp=+(b[3]-f*(b[3]-b[2])).toFixed(4);break;}lo=b[0];}
      r.prevRank=r.rank;r.rank=rank;posC[r.pos]=(posC[r.pos]||0)+1;r.pr=posC[r.pos];
      if(!initial&&oldStars&&oldStars!==r.stars&&rank<=500)r.flag=r.stars>oldStars?"up":"down";});
    ["A","B"].forEach(k=>{const l=arr.slice().sort((a,b)=>b["p"+k]-a["p"+k]);l.forEach((r,i)=>{r["rk"+k]=i+1;r["st"+k]=i<32?5:i<360?4:i<1110?3:2;});});
  });
}
function rerankUpdate(label,only){
  const before={};S.recruits.forEach(r=>before[r.id]=r.stars);
  S.recruits.forEach(r=>{if(only&&!only.has(r.id))return;const tr=svcTruth(r);const k=(only?0.32:0.12)/(1+Math.max(0,clsLvl(r))*0.5);
    r.pA+=(tr-r.pA)*k+gauss(0,1.5);r.pB+=(tr-r.pB)*k+gauss(0,1.5);r.perc=(r.pA+r.pB)/2;});
  rerank(false);
  const sr=S.recruits.filter(r=>r.cls===S.classYear);
  const ups=sr.filter(r=>r.stars>before[r.id]).sort((a,b)=>a.rank-b.rank);const dn=sr.filter(r=>r.stars<before[r.id]);
  addNews(`📈 ${label} rankings update: ${ups.length} seniors moved up a star tier, ${dn.length} moved down.`+(ups[0]?` Biggest riser: ${rName(ups[0])} (${ups[0].pos}) now ${ups[0].stars}★ #${ups[0].rank}.`:""),"rank");
  ups.slice(0,2).forEach(r=>feed(r,`Blessed to be a ${r.stars}★ now 🙏 #${r.rank} in the country. Hard work pays off.`));
  ups.filter(r=>r.com===U().teamId||r.int[U().teamId]>0).slice(0,3).forEach(r=>addNews(`⭐ ${rName(r)} — one of your guys — climbs to ${r.stars}★ (#${r.rank} overall).`,"user"));
}
function initOffers(list,lvl,topup){
  const ids=S.teamIds;const wm=[1,0.5,0.2][lvl||0];
  list.forEach(r=>{
    if(lvl===2&&r.stars<4&&r.rank>250)return;
    const R0=recruitLevel(r);
    const cands=ids.filter(id=>{const t=T(id);if(minGPA(t)-r.gpa>0.15)return false;const L=teamLevel(t);if(L<=R0+9&&L>=R0-13)return true;const d=miles(t.lat,t.lon,r.lat,r.lon);if(d<260&&L>=R0-22&&L<=R0+16)return true;return L>R0+9&&R()<0.03;});
    const want=Math.max(lvl?0:1,Math.round(({5:rint(16,26),4:rint(9,18),3:rint(4,10),2:rint(1,4)}[r.stars])*wm));
    const scored=cands.filter(id=>!r.off.includes(id)).map(id=>{const t=T(id);const d=miles(t.lat,t.lon,r.lat,r.lon);return {id,s:(1/(1+d/450))*(0.5+R())*(t.need[r.pos])*(1+Math.max(0,teamLevel(t)-R0)/40)};}).sort((a,b)=>b.s-a.s);
    const add=scored.slice(0,Math.max(0,want-(topup?r.off.length:0))).map(x=>x.id);
    add.forEach(id=>{if(id===U().teamId&&!S._presim&&!topup)return;r.off.push(id);r.int[id]=(r.int[id]||0)+Math.round(rnd(3,12)*attract(T(id),r)*2*(lvl?0.6:1));});
  });
}
function aiAddOffers(){
  const counts=commitCounts();const sy=S.classYear;
  S.teamIds.forEach(id=>{
    if(id===U().teamId&&!S._presim)return;const t=T(id);const open=t.target-(counts[id]||0);if(open<=2)return;
    const L=teamLevel(t);const mg=minGPA(t);
    const pool=S.recruits.filter(r=>r.cls<=sy+1&&!r.com&&!r.off.includes(id)&&recruitLevel(r)>=L-11&&recruitLevel(r)<=L+9&&r.gpa>=mg-0.15);
    for(let k=0;k<Math.min(3,open/3);k++){if(!pool.length)break;const r=wpick(pool,x=>t.need[x.pos]/(1+miles(t.lat,t.lon,x.lat,x.lon)/500)*(recruitLevel(x))*(x.cls===sy?1:0.35));
      if(!r.off.includes(id)){r.off.push(id);r.int[id]=(r.int[id]||0)+Math.round(5*attract(t,r));}}
  });
}
function commitCounts(){const c={};const sy=S.classYear;S.recruits.forEach(r=>{if(r.com&&r.cls===sy)c[r.com]=(c[r.com]||0)+1;});return c;}
function classRankings(cls){
  cls=cls||S.classYear;const by={};S.recruits.forEach(r=>{if(r.com&&r.cls===cls){(by[r.com]=by[r.com]||[]).push(r);}});
  return S.teamIds.map(id=>{const list=(by[id]||[]).sort((a,b)=>b.comp-a.comp);let pts=0;list.forEach((r,i)=>pts+=Math.max(0,(r.comp-0.70))*100*Math.pow(0.9,i)*(r.comp>0.98?1.25:1));
    return {id,pts:Math.round(pts*10)/10,n:list.length,s5:list.filter(r=>r.stars===5).length,s4:list.filter(r=>r.stars===4).length,s3:list.filter(r=>r.stars===3).length,avg:list.length?list.reduce((a,r)=>a+r.comp,0)/list.length:0};}).sort((a,b)=>b.pts-a.pts);
}
function goalStatus(){
  const uid=U().teamId;const sy=S.classYear;const mine=S.recruits.filter(r=>r.com===uid&&r.cls===sy);const cr=classRankings();const rk=cr.findIndex(x=>x.id===uid)+1;
  const blue=mine.filter(r=>r.stars>=4).length;const st=UT().st;const loc=mine.filter(r=>r.st===st&&r.stars>=3).length;
  return S.user.goals.map(g=>{let cur,ok;
    if(g.k==="rank"){cur="#"+(rk||"—");ok=rk>0&&rk<=g.v;}
    else if(g.k==="blue"){cur=blue;ok=blue>=g.v;}
    else if(g.k==="budget"){cur=money(budgetLeft())+" left";ok=budgetLeft()>=0;}
    else {cur=loc;ok=loc>=g.v;}
    return {...g,cur,ok};});
}

// ---------- RECRUITING TICK ----------
function recruitTick(intensity,ctx){
  const uid=U().teamId;const counts=commitCounts();const dm=DIFF_MULT[U().diff]||1;
  if(!S._prio||S.tick-S._prioTick>=2)buildPrio();
  const evts=[];const ct=S.classTick||0;const sy=S.classYear;
  S.recruits.forEach(r=>{
    if(r.signed)return;const lv=r.cls-sy;const lm=lv<=0?1:lv===1?0.32:0.12;
    let uLead=false;if(!S._presim&&r.int[uid]){uLead=r.off.every(id=>id===uid||(r.int[id]||0)<=r.int[uid]);}
    for(const id of r.off){
      const t=T(id);if(!t)continue;
      if(id===uid&&!S._presim){
        const tg=!!S.user.targets[r.id]||r.com===uid;
        r.int[id]=(r.int[id]||0)+intensity*lm*pipeMult(r)*staffMult(r)*(tg?7.2*(1+Math.max(0,r.stars-3)*0.45):2.4)*attract(t,r)*(r.com===uid?1.4:1)*rnd(0.8,1.2);
        if(S.tick-r.lastTouch>3)r.int[id]*=0.985;
        continue;
      }
      const full=lv===0&&(counts[id]||0)>=t.target;
      let eff=full?0.1:(S._prio[id]&&S._prio[id].has(r.id)?1.6*(1+Math.max(0,r.stars-3)*0.6):0.3);
      if(uLead&&r.stars>=4)eff*=1.35;
      if(uLead&&isRival(id,uid))eff*=1.2;
      if(r.com&&r.com!==id)eff*=(r.com===uid?0.55:0.4);
      if(r.com===id)eff=1.1;
      r.int[id]=(r.int[id]||0)+intensity*lm*6*attract(t,r)*eff*rnd(0.55,1.45)*dm;
    }
    if(r.int[uid]&&!r.off.includes(uid))r.int[uid]=Math.min(r.int[uid],40);
    const ranked=r.off.map(id=>[id,r.int[id]||0]).sort((a,b)=>b[1]-a[1]);
    if(!ranked.length)return;
    if(!r.com){
      const [top,tp]=ranked[0];const sp=ranked[1]?ranked[1][1]:0;
      if(lv>0){
        if(tp>=commitThreshold(r)*(lv===1?0.6:0.8)&&tp>=sp*1.5&&R()<(lv===1?0.05:0.012)*(ctx.early||1)){doCommit(r,top,ranked,evts);}
        return;
      }
      const due=ct>=r.dec;
      const early=!due&&tp>=commitThreshold(r)&&tp>=sp*1.7&&R()<0.1;
      if(due||early){
        let pickT=ranked.find(([id])=>id===uid||(counts[id]||0)<T(id).target+2);
        if(!S._presim&&hasPerk("c4")&&r.off.includes(uid)&&(r.int[uid]||0)>=tp*0.9&&pickT&&pickT[0]!==uid)pickT=[uid,r.int[uid]];
        if(!pickT||pickT[1]<20){r.dec=ct+1;return;}
        if(due&&!early&&ranked[1]&&pickT[0]===top&&tp<sp*1.06&&R()<0.45){r.dec=ct+1;return;}
        doCommit(r,pickT[0],ranked,evts);counts[pickT[0]]=(counts[pickT[0]]||0)+1;
      }
    }else{
      const cur=r.int[r.com]||0;const best=ranked.find(x=>x[0]!==r.com);
      if(best&&best[1]>cur*1.22&&best[1]-cur>25&&R()<(r.hard?0.04:0.11)*(ctx.flipMult||1)*(hasT(r,"loyal")?0.35:1)*(lv>0?0.5:1)){
        if(best[0]===uid||lv>0||(counts[best[0]]||0)<T(best[0]).target+2){const old=r.com;doCommit(r,best[0],ranked,evts,old);}
      }
    }
  });
  return evts;
}
function signCommits(prob){let n=0;const sy=S.classYear;S.recruits.forEach(r=>{if(r.cls===sy&&r.com&&!r.signed&&R()<prob){if(r.com===U().teamId&&!userSignCheck(r))return;r.signed=true;n++;}});return n;}
function forceSignAll(){
  const sy=S.classYear;
  S.recruits.forEach(r=>{
    if(r.signed||r.cls!==sy)return;
    if(!r.com){const ranked=r.off.map(id=>[id,r.int[id]||0]).sort((a,b)=>b[1]-a[1]);if(ranked.length&&ranked[0][1]>10)doCommit(r,ranked[0][0],ranked,[]);}
    if(r.com===U().teamId&&!userSignCheck(r)){const ranked=r.off.filter(id=>id!==U().teamId).map(id=>[id,r.int[id]||0]).sort((a,b)=>b[1]-a[1]);if(ranked.length)doCommit(r,ranked[0][0],ranked,[]);}
    if(r.com)r.signed=true;
  });
}
function presim(){
  S._presim=true;S.weekNo=0;S.tick=0;
  for(let i=1;i<=6;i++){S.classTick=i;S.tick=i;recruitTick(i>=4?1.6:1.15,{early:2});if(i===4||i===5)aiOVs();if(i%2===0)aiAddOffers();}
  const uid=U().teamId;const sy=S.classYear;
  const mine=S.recruits.filter(r=>r.off.includes(uid)&&!r.com).sort((a,b)=>(b.int[uid]||0)-(a.int[uid]||0));
  const keep=new Set(mine.filter(r=>r.cls===sy).slice(0,45).concat(mine.filter(r=>r.cls===sy+1).slice(0,15),mine.filter(r=>r.cls===sy+2).slice(0,5)).map(r=>r.id));
  mine.forEach(r=>{if(!keep.has(r.id)){r.off=r.off.filter(x=>x!==uid);delete r.int[uid];}});
  S.recruits.forEach(r=>{if(r.int[uid])r.int[uid]*=0.8;});
  const t=UT();const want=Math.round(P4.includes(t.conf)||t.conf==="Independent"?rnd(8,12):rnd(4,7));
  let have=S.recruits.filter(r=>r.com===uid&&r.cls===sy).length;
  const pool=S.recruits.filter(r=>!r.com&&r.cls===sy&&r.off.includes(uid)).sort((a,b)=>(b.int[uid]||0)-(a.int[uid]||0));
  for(const r of pool){if(have>=want)break;r.int[uid]=Math.max(r.int[uid],...r.off.map(id=>r.int[id]||0))+10;r.com=uid;r.comWk=0;have++;}
  pool.filter(r=>!r.com).slice(0,20).forEach(r=>S.user.targets[r.id]=1);
  S.recruits.filter(r=>r.cls===sy+1&&r.off.includes(uid)&&!r.com).slice(0,5).forEach(r=>S.user.targets[r.id]=1);
  S._presim=false;S.ceremonies=[];S.news=[];S.feed=[];
}

// ---------- GAME SIM, STATS, INJURIES ----------
function teamPower(t){const ro=rosterOf(t.id);const tal=ro&&ro.length?teamOVR(ro,true):t.talent;let b=0;if(t.id===U().teamId){b=starterTraitBonus()+schemeBonus();}return tal+(t.coach.game-78)*0.22+b+(t.mom||0)*0.08;}
function simGame(g){
  if(g.done)return g;
  const h=T(g.h);let hp=teamPower(h),ap;
  let aT=null;if(g.a==="FCS"){ap=rnd(42,58);}else{aT=T(g.a);ap=teamPower(aT);}
  const hfa=g.neutral?0:2.8;
  const riv=aT&&isRival(g.h,g.a);if(riv)g.riv=true;
  const margin=(hp-ap)*(riv?0.85:1.05)+hfa+gauss(0,riv?15.5:13.5);
  const total=clamp(gauss(52,12),13,99);
  let hs=fixScore((total+margin)/2),as=fixScore((total-margin)/2);
  if(hs===as){if(R()<0.5+margin/40)hs+=pick([3,7,6]);else as+=pick([3,7,6]);g.ot=true;}
  g.hs=hs;g.as=as;g.done=true;
  boxScore(g);
  const hw=hs>as;
  h.pf+=hs;h.pa+=as;if(hw)h.w++;else h.l++;
  if(aT){aT.pf+=as;aT.pa+=hs;if(hw)aT.l++;else aT.w++;
    if(g.kind==="reg"&&g.conf){if(hw){h.cw++;aT.cl++;}else{h.cl++;aT.cw++;}}
    momentum(h,aT,hw);momentum(aT,h,!hw);
    if(riv&&g.kind==="reg"){const W=hw?h:aT,L=hw?aT:h;W.mom=clamp(W.mom+1.6,-10,10);L.mom=clamp(L.mom-1.6,-10,10);W.rivW=(W.rivW||0)+1;L.rivL=(L.rivL||0)+1;
      const k=[h.id,aT.id].sort().join("|");S.series=S.series||{};S.series[k]=S.series[k]||{};S.series[k][W.id]=(S.series[k][W.id]||0)+1;
      S.recruits.forEach(r=>{if(r.signed||!r.off.includes(W.id)||!r.off.includes(L.id))return;r.int[W.id]=(r.int[W.id]||0)*1.06;r.int[L.id]=(r.int[L.id]||0)*0.95;});
      if(W.apRank||L.apRank||W.id===U().teamId||L.id===U().teamId)addNews(`⚔️ Rivalry: ${W.school} beats ${L.school} ${Math.max(hs,as)}-${Math.min(hs,as)}. Head-to-head recruits lean ${W.school}.`,W.id===U().teamId||L.id===U().teamId?"user":"game");}
    const ea=1/(1+Math.pow(10,(aT.elo-h.elo-hfa*8)/400));const res=hw?1:0;const mov=Math.abs(hs-as);
    const k=34*Math.log(mov+1)*(2.2/(((hw?h.elo-aT.elo:aT.elo-h.elo))*0.001+2.2));
    h.elo+=k*(res-ea);aT.elo-=k*(res-ea);
  }else{ if(!hw){h.elo-=45;} else h.elo+=Math.min(4,(hs-as)/10); }
  return g;
}
function boxScore(g){
  const uid=U().teamId;
  [[g.h,g.hs,g.as],[g.a,g.as,g.hs]].forEach(([id,pts,opp])=>{
    if(id==="FCS")return;const ro=rosterOf(id);if(!ro||!ro.length)return;
    const st=pos=>depth(pos,ro,true);const S1=p=>{if(!p.s)p.s={g:0};return p.s;};
    const qb=st("QB")[0],rb=st("RB")[0],wrs=st("WR").slice(0,3),te=st("TE")[0],k=st("K")[0];
    const tds=Math.max(0,Math.round(pts/7.4));const fg=Math.max(0,Math.round((pts-tds*7)/3));
    let passTD=0,rushTD=0;for(let i=0;i<tds;i++){if(R()<0.58)passTD++;else rushTD++;}
    const py=Math.max(40,Math.round(gauss(205+((qb?qb.ovr:65)-75)*5+pts*1.8,55)));const ints=R()<0.45?(R()<0.25?2:1):0;
    if(qb){const s=S1(qb);s.g++;s.py=(s.py||0)+py;s.ptd=(s.ptd||0)+passTD;s.pi=(s.pi||0)+ints;s.ry=(s.ry||0)+Math.round(gauss(14,20));if(rushTD&&R()<0.25){s.rtd=(s.rtd||0)+1;rushTD--;}}
    const ry=Math.max(10,Math.round(gauss(135+pts*1.3,45)));
    if(rb){const s=S1(rb);s.g++;s.ry=(s.ry||0)+Math.round(ry*rnd(0.5,0.72));s.rtd=(s.rtd||0)+rushTD;s.rec=(s.rec||0)+rint(0,3);s.recy=(s.recy||0)+rint(0,28);}
    const tgt=wrs.concat(te?[te]:[]);const w=tgt.map((p,i)=>[0.36,0.26,0.18,0.2][i]*(0.6+p.ovr/150));const wt=w.reduce((a,b)=>a+b,0)||1;
    tgt.forEach((p,i)=>{const s=S1(p);s.g++;const sh=w[i]/wt;s.recy=(s.recy||0)+Math.round(py*sh*rnd(0.7,1.3));s.rec=(s.rec||0)+Math.max(0,Math.round(py*sh/12.5*rnd(0.6,1.3)));});
    for(let i=0;i<passTD;i++){const p=tgt.length?wpick(tgt,x=>x.ovr*x.ovr):rb;if(p){const s=S1(p);s.rectd=(s.rectd||0)+1;}}
    if(k){const s=S1(k);s.g++;s.fg=(s.fg||0)+fg;}
    const dl=st("DL").slice(0,2),ed=st("EDGE").slice(0,2),lb=st("LB").slice(0,2),cb=st("CB").slice(0,3),sf=st("S").slice(0,2);
    const defs=dl.concat(ed,lb,cb,sf);defs.forEach(p=>S1(p).g++);
    if(defs.length){
      const sacks=Math.max(0,Math.round(gauss(2.3+(opp<pts?0.6:0),1.3)));for(let i=0;i<sacks;i++){const p=wpick(ed.concat(dl,lb),x=>(x.pos==="EDGE"?3:x.pos==="DL"?1.5:0.6)*x.ovr);if(p){const s=S1(p);s.sk=(s.sk||0)+1;}}
      const tk=rint(55,72);for(let i=0;i<tk;i++){const p=wpick(defs,x=>(x.pos==="LB"?3:x.pos==="S"?2:1.2));const s=S1(p);s.tk=(s.tk||0)+1;}
      const dInt=R()<0.5?(R()<0.3?2:1):0;for(let i=0;i<dInt;i++){const p=wpick(cb.concat(sf,lb),x=>x.pos==="LB"?0.5:1.5);if(p){const s=S1(p);s.int=(s.int||0)+1;}}
    }
    [qb,rb,te].concat(wrs,defs,st("OL").slice(0,5)).filter(Boolean).forEach(p=>{let ch=0.011;if(hasT(p,"inj"))ch*=2.6;if(hasT(p,"iron"))ch*=0.15;
      if(R()<ch){p.inj=R()<0.1?12:rint(1,5);const x=(p.tr||[]).find(t=>t.k==="inj");if(x)x.rev=true;if(id===uid)(S._inj=S._inj||[]).push(p);}});
  });
}
function hScore(p,t){const s=p.s||{};let v=0;if(p.pos==="QB")v=(s.py||0)/22+(s.ptd||0)*4.5-(s.pi||0)*4+(s.ry||0)/12+(s.rtd||0)*6;else v=(s.ry||0)/11+(s.rtd||0)*6+(s.recy||0)/11+(s.rectd||0)*6;return v+t.w*9-t.l*6+(t.apRank?(26-t.apRank)*2:0);}
function heismanList(n){const out=[];S.teamIds.forEach(id=>{const t=T(id);rosterOf(id).forEach(p=>{if(!p.s||!p.s.g||!["QB","RB","WR","TE"].includes(p.pos))return;out.push({p,id,v:hScore(p,t)});});});return out.sort((a,b)=>b.v-a.v).slice(0,n||10);}
function updateHeisman(){S.heisman=heismanList(10).map(x=>({pid:x.p.id,n:x.p.fn+" "+x.p.ln,pos:x.p.pos,id:x.id,v:Math.round(x.v),line:pStatLine(x.p)}));}
function pStatLine(p){const s=p.s;if(!s||!s.g)return "No stats yet";
  switch(p.pos){case "QB":return `${s.py||0} pass yds, ${s.ptd||0} TD, ${s.pi||0} INT · ${s.ry||0} rush yds`;case "RB":return `${s.ry||0} rush yds, ${s.rtd||0} TD · ${s.rec||0} rec`;
  case "WR":case "TE":return `${s.rec||0} rec, ${s.recy||0} yds, ${s.rectd||0} TD`;case "K":return `${s.fg||0} FG`;case "OL":return `${s.g} starts`;
  case "DL":case "EDGE":case "LB":return `${s.tk||0} tackles, ${s.sk||0} sacks${s.int?", "+s.int+" INT":""}`;case "CB":case "S":return `${s.tk||0} tackles, ${s.int||0} INT`;}return "";}
function aaScore(p){const s=p.s||{};let b=0;switch(p.pos){case "QB":b=(s.py||0)/400+(s.ptd||0)*0.3;break;case "RB":b=(s.ry||0)/150+(s.rtd||0)*0.3;break;case "WR":case "TE":b=(s.recy||0)/130+(s.rectd||0)*0.3;break;case "DL":case "EDGE":b=(s.sk||0)*0.5;break;case "LB":b=(s.tk||0)/12;break;case "CB":case "S":b=(s.int||0)*0.8;break;}return p.ovr+b;}
function seasonAwards(sum){
  const uid=U().teamId;
  const hl=heismanList(5);if(hl.length){const w=hl[0];const t=T(w.id);
    S.awards.push({y:S.year,k:"heisman",n:w.p.fn+" "+w.p.ln,pos:w.p.pos,id:w.id,line:pStatLine(w.p),mine:!!w.p.byMe});t.heis=1;t.buzz=Math.min(10,(t.buzz||0)+2.5);
    addNews(`🏆 HEISMAN TROPHY: ${w.p.pos} ${w.p.fn} ${w.p.ln} of ${t.school} (${pStatLine(w.p)}). Finalists: ${hl.slice(1,4).map(x=>x.p.fn+" "+x.p.ln+" ("+T(x.id).abbr+")").join(", ")}.`,w.id===uid?"user":"game");
    if(w.id===uid)sum.lines.push(`🏆 YOUR ${w.p.pos} ${w.p.fn} ${w.p.ln} WINS THE HEISMAN! Every recruit in America saw that.`);
    if(w.p.byMe){gainDXP(40);leg().heis.push({y:S.year,n:w.p.fn+" "+w.p.ln,pos:w.p.pos,team:w.id});}}
  const team=[];POSITIONS.forEach(pos=>{const all=[];S.teamIds.forEach(id=>rosterOf(id).forEach(p=>{if(p.pos===pos&&p.s&&p.s.g>=8)all.push({p,id});}));all.sort((a,b)=>aaScore(b.p)-aaScore(a.p));all.slice(0,POS_STARTERS[pos]).forEach(x=>team.push({pos,n:x.p.fn+" "+x.p.ln,id:x.id,pid:x.p.id,mine:!!x.p.byMe,line:pStatLine(x.p)}));});
  S.aa={y:S.year,team};S.teamIds.forEach(id=>T(id).aaN=team.filter(x=>x.id===id).length);
  const mineAA=team.filter(x=>x.id===uid);if(mineAA.length){sum.lines.push(`🎖️ ${mineAA.length} All-American${mineAA.length>1?"s":""}: ${mineAA.map(x=>x.pos+" "+x.n).join(", ")}.`);}
  team.filter(x=>x.mine).forEach(()=>{gainDXP(8);leg().aa++;});
  addNews(`🎖️ All-America team announced: ${team.filter(x=>T(x.id).aaN>=3).map(x=>T(x.id).school).filter((v,i,a)=>a.indexOf(v)===i).join(", ")||"talent spread across the country"} led the way.`,"rank");
}

// ---------- SEASON ----------
function newSeason(first){
  S.teamIds.forEach(id=>{const t=T(id);t.mom=(t.mom||0)*0.4;t.rivW=0;t.rivL=0;t.bowl=null;t.cfpW=0;t.heis=0;t.aaN=0;
    t.w=t.l=t.cw=t.cl=t.pf=t.pa=0;t.apRank=0;t.cfpRank=0;t.ap=0;t.champ=null;t.streak=0;
    rosterOf(id).forEach(p=>{if(id===U().teamId&&p.s&&p.s.g){p.ls=p.s;p.cs=p.cs||{};Object.keys(p.s).forEach(k=>p.cs[k]=(p.cs[k]||0)+p.s[k]);}p.s=null;p.inj=0;p.susp=0;});
    t.talent=teamOVR(rosterOf(id));t.elo=first?eloFromTalent(t):(t.elo*0.4+eloFromTalent(t)*0.6);});
  S.polls={ap:[],cfp:[],cfpLive:false};S.cfpField=null;S.weekNo=0;S.heisman=[];
  genSchedule();
  updatePolls();
  S.preAp=S.polls.ap.slice();
  setGoals();
  const t=UT();
  addNews(`🏈 ${S.year} season preview: ${t.school} opens ${t.apRank?"ranked #"+t.apRank+" in the AP preseason poll":"unranked in the AP preseason poll"}. Head coach ${t.coach.name}: REC ${t.coach.rec} · DEV ${t.coach.dev} · GAME ${t.coach.game}.`,"user");
  addNews(`🗳️ AP Preseason Top 5: ${S.polls.ap.slice(0,5).map((id,i)=>(i+1)+". "+T(id).school).join(", ")}.`,"rank");
}
function seniorStats(){
  const sy=S.classYear;
  S.recruits.forEach(r=>{if(r.cls!==sy||R()<0.12)return;const q=(r.tOvr+(r.tag==="lb"?6:0)-55)/25;const s=r.ss;s.g++;
    const f=()=>Math.max(0,q+gauss(0,0.35));
    switch(r.pos){
      case "QB":s.yd=(s.yd||0)+Math.round(170+f()*130);s.td=(s.td||0)+Math.round(1+f()*2.2);s.int=(s.int||0)+(R()<0.45?1:0);break;
      case "RB":s.yd=(s.yd||0)+Math.round(70+f()*110);s.td=(s.td||0)+Math.round(f()*2.2);break;
      case "WR":case "TE":s.rec=(s.rec||0)+Math.round(3+f()*4);s.yd=(s.yd||0)+Math.round(40+f()*75);s.td=(s.td||0)+(R()<0.35+q*0.3?1:0);break;
      case "OL":s.pan=(s.pan||0)+Math.round(2+f()*5);break;
      case "DL":case "EDGE":s.tk=(s.tk||0)+Math.round(3+f()*3);s.sk=(s.sk||0)+(R()<0.25+q*0.5?1:0)+(R()<q*0.3?1:0);break;
      case "LB":s.tk=(s.tk||0)+Math.round(5+f()*5);s.sk=(s.sk||0)+(R()<0.2?1:0);break;
      case "CB":case "S":s.tk=(s.tk||0)+Math.round(2+f()*4);s.int=(s.int||0)+(R()<0.15+q*0.2?1:0);s.pbu=(s.pbu||0)+Math.round(f()*2);break;
      case "K":s.fg=(s.fg||0)+Math.round(1+f()*1.5);break;
    }});
}
function weeklyProgram(sum,ug){
  const t=UT();const uid=t.id;
  let ups=0;const ris=[];
  POSITIONS.forEach(pos=>{depth(pos).forEach((p,i)=>{if(p.susp){p.susp--;return;}if(p.inj>0)return;
    const starter=i<POS_STARTERS[pos];const room=Math.max(0,p.pot-p.ovr);
    const ch=(starter?0.16:0.06)*(room>8?1.3:room>3?1:0.4)*traitMult(p,p.yr<=2?"early":"late")*(0.7+t.coach.dev/250)*devMult(pos);
    if(R()<ch){p.ovr=Math.min(99,p.ovr+1);ups++;if(R()<0.15)ris.push(p);}
    revealTrait(p,"any",starter?0.05:0.025,null);
    if(hasT(p,"party")&&R()<0.015){p.susp=rint(1,2);p.tr.find(x=>x.k==="party").rev=true;sum.lines.push(`🚨 ${p.pos} ${p.fn} ${p.ln} suspended ${p.susp} game${p.susp>1?"s":""} for a team-rules violation.`);addNews(`🚨 ${t.school} suspends ${p.pos} ${p.fn} ${p.ln}.`,"user");}
    if(hasT(p,"lead"))p.mor=Math.min(100,p.mor+0.3);
  });});
  if(ups)sum.lines.push(`💪 Practice report: ${ups} player${ups>1?"s":""} improved this week${ris.length?" — "+ris.slice(0,2).map(p=>p.pos+" "+p.ln+" ("+p.ovr+")").join(", "):""}.`);
  (S._inj||[]).forEach(p=>sum.lines.push(`🩹 Injury: ${p.pos} ${p.fn} ${p.ln} ${p.inj>=12?"is out for the season":"will miss "+p.inj+" week"+(p.inj>1?"s":"")}.`));S._inj=[];
  if(ug){const L=gameLine(ug,uid);const opp=L.opp!=="FCS"?T(L.opp):null;
    const big=L.w&&opp&&opp.apRank;const streak=t.streak;
    if(L.w){gainDXP(4);gainPC(1);}
    if(opp&&isRival(uid,opp.id)){const a=U().ad;if(L.w){a.commit=clamp(a.commit+2,0,100);U().sec=clamp(U().sec+2,0,100);gainPC(3);gainDXP(10);sum.lines.push(`⚔️ RIVALRY WIN over ${opp.school}! Boosters are buying rounds, and head-to-head recruits are leaning your way. ${seriesStr(uid,opp.id)}`);}
      else{a.commit=clamp(a.commit-2,0,100);U().sec=clamp(U().sec-3,0,100);sum.lines.push(`⚔️ Lost to rival ${opp.school}. That one stings on the trail — and in the AD's office. ${seriesStr(uid,opp.id)}`);}}
    if(L.w&&(big||streak>=3)&&R()<(0.3+Math.max(0,t.mom)/25)*(hasPerk("n4")?1.5:1)){const amt=Math.round((60+t.prestige*2+Math.max(0,t.mom)*30+(big?(30-opp.apRank)*10:0))*rnd(0.7,1.4)/5)*5;U().bonusNIL+=amt;
      const m=`💰 ${big?"After the win over #"+opp.apRank+" "+opp.school:"Riding a "+streak+"-game win streak"}, a booster pledges ${money(amt)} to the collective.`;sum.lines.push(m);addNews(m,"user");}
    if(!L.w&&streak<=-3&&R()<0.25){const amt=Math.round(rnd(80,250)/5)*5;U().bonusNIL=Math.max(0,U().bonusNIL-amt);const m=`📉 Donors are frustrated by the losing streak — ${money(amt)} in pledges pulled.`;sum.lines.push(m);addNews(m,"user");}
    if(t.mom>=6&&R()<0.25)sum.lines.push(`🔥 ${t.school} is the hottest program in the country right now. Recruits notice.`);
    // a star performance gets noticed
    const qb=depth("QB",S.roster,true)[0];if(qb&&qb.s&&L.w&&R()<0.15&&qb.s.ptd>=3)sum.lines.push(`📺 ${qb.fn} ${qb.ln} is turning heads — ${pStatLine(qb)} so far.`);
  }
}
function healWeek(){S.teamIds.forEach(id=>rosterOf(id).forEach(p=>{if(p.inj>0)p.inj--;}));}

// ---------- ADVANCE ----------
function advance(){
  const p=phase();const sum={title:p.label+" — "+p.date+(p.type==="game"||p.type==="pre"?", "+S.year:""),lines:[],my:null};S.summary=sum;
  S.weekNo=(S.weekNo||0)+1;S.tick=(S.tick||0)+1;S.classTick=(S.classTick||0)+1;
  S.teamIds.forEach(id=>{const t=T(id);if(t.buzz)t.buzz=Math.round(t.buzz*0.88*100)/100;});
  let evts=[];
  if(p.type==="pre"){evts=recruitTick(1.0,{});S.weekNo=0;}
  if(p.type==="game"){
    healWeek();
    resolveOVs(p);
    const gs=weekGames(p.week);gs.filter(g=>!g.done).forEach(simGame);
    const ug=userGame(p.week);
    if(ug){const L=gameLine(ug,U().teamId);sum.my=`${L.w?"✅ WIN":"❌ LOSS"} ${L.ms}-${L.os} ${L.home?"vs":"at"} ${L.opp==="FCS"?L.oname:rankStr(L.opp)+L.oname}`;
      addNews(`${L.w?"✅":"❌"} ${UT().school} ${L.w?"beats":"falls to"} ${L.oname} ${L.ms}-${L.os}.`,"user");
      UT().streak=L.w?Math.max(1,UT().streak+1):Math.min(-1,UT().streak-1);moraleAfterGame(L.w);}
    else sum.my="😴 Bye week — extra time on the road recruiting.";
    upsetNews(gs);
    weeklyProgram(sum,ug);
    S.weekNo=p.week+1;
    updatePolls();updateHeisman();
    if(p.week>=9){S.polls.cfpLive=true;}
    if(p.week===9)addNews(`📋 The first College Football Playoff rankings are out. Top 4: ${S.polls.cfp.slice(0,4).map(id=>T(id).school).join(", ")}.`,"rank");
    evts=recruitTick(1.0,{});
    seniorStats();weeklyFeed();
    if(p.week===5)rerankUpdate("Midseason");
    if(p.week===11)rerankUpdate("Late-season");
    if(p.week%3===1)aiAddOffers();
  }
  if(p.type==="esp"){
    evts=recruitTick(1.4,{});
    const n=signCommits(0.86);
    const uid=U().teamId;const mineS=S.recruits.filter(r=>r.signed&&r.com===uid).length;
    addNews(`✍️ Early Signing Period: ${n} prospects signed nationally. ${UT().school} inked ${mineS}.`,"user");
    sum.lines.push(`✍️ You signed ${mineS} recruits in the Early Signing Period.`);
  }
  if(p.type==="ccg"){playCCGs(sum);updatePolls();evts=recruitTick(0.5,{});}
  if(p.type==="sel"){selectCFP(sum);seasonAwards(sum);playBowls(sum);coachingCarousel(sum);rerankUpdate("Final regular-season");}
  if(p.type==="cfp"){playCFPRound(p.round,sum);if(p.round===4)programPerception(sum);evts=p.round<=2?recruitTick(0.4,{}):[];}
  if(p.type==="portal"){
    if(!S.portalOpen)openPortal(sum);
    portalTick(p.key==="portal2",sum);
  }
  if(p.type==="allstar"){evts=[];allStarWeek(sum,evts);evts=evts.concat(recruitTick(0.6,{}));}
  if(p.type==="nsd"){evts=recruitTick(1.0,{});forceSignAll();closeClass(sum);}
  if(p.type==="off"||p.type==="ov"||p.type==="camp"){
    if(p.key==="spring1")springProgression(sum);
    if(p.type==="ov"){resolveOVs(p);aiOVs();}
    if(p.type==="camp")campResults(sum);
    const it=p.type==="ov"?1.6:1.15;
    evts=recruitTick(it,{early:p.type==="ov"||p.key==="jul"?1.5:1});
    if(p.key==="spring2")aiAddOffers();
    if(p.key==="spring3"){rerankUpdate("Spring");aiAddOffers();}
    weeklyFeed();
  }
  evts.forEach(e=>{const cl=e.r.cls>S.classYear?` (Class of ${e.r.cls} — early commit!)`:"";
    if(e.k==="commit")sum.lines.push(`🔒 COMMIT: ${e.r.stars}★ ${e.r.pos} ${rName(e.r)} (#${e.r.rank}) is coming to ${UT().school}!${cl}`);
    if(e.k==="flip")sum.lines.push(`🔄 You flipped ${rName(e.r)} from ${T(e.t).school}!`);
    if(e.k==="lost")sum.lines.push(`💔 ${rName(e.r)} flipped away to ${T(e.t).school}.`);
    if(e.k==="miss")sum.lines.push(`😞 ${rName(e.r)} chose ${T(e.t).school} over you.`);
  });
  if(evts.some(e=>e.k==="commit"||e.k==="flip")){U().rep=clamp(U().rep+0.4,0,100);}
  evts.forEach(e=>{if(e.k==="commit"||e.k==="flip"){gainXP("pers",3+e.r.stars);gainXP("rel",2+e.r.stars);gainDXP(e.r.stars*6+(e.k==="flip"?10:0));if(e.r.stars>=4)gainPC(1.5);growPipe(e.r,4,1.5);
    const ai=admitIssue(e.r,U().teamId);if(ai)sum.lines.push(`⚠️ ${rName(e.r)} has an admissions issue (${ai}). He'll need a waiver at signing — ${waiversLeft()} left.`);}});
  if(p.key==="spring2")nflDraft(sum);
  maybeEvent();
  S.phaseIdx++;
  if(S.phaseIdx>=S.cal.length){rollYear(sum);}
  if(phase().key==="portal1"&&!S.portalOpen)openPortal(sum);
  if(phase().key==="camp")genCamps();
  U().hours=hoursPerWeek();U().hc=(phase().type==="game"?1:2)+(U().up.staff>=4?1:0)+(hasPerk("c2")?1:0);U().boosterUsed=false;
  if(S._lvl&&S._lvl.length){sum.lines.push(...S._lvl);S._lvl=[];}
  if(S.ceremonies.length)sum.ceremony=true;
  const ut=UT();if(["game","esp","ccg","sel"].includes(p.type))sum.lines.unshift(`${UT().school} ${ut.w}-${ut.l} (${ut.cw}-${ut.cl} ${ut.conf})${ut.apRank?" · AP #"+ut.apRank:""}${S.polls.cfpLive&&ut.cfpRank?" · CFP #"+ut.cfpRank:""}`);
  save();
  return sum;
}

// ---------- PORTAL (real players from real rosters) ----------
function toPortal(p,from){
  const t=T(from);const q=genRecruit(S.year);
  Object.assign(q,{portal:true,pl:p,from,fn:p.fn,ln:p.ln,pos:p.pos,tOvr:p.ovr,tPot:p.pot,yrs:Math.max(1,5-p.yr),we:p.we,chr:p.chr||50,tr:p.tr||[],st:t.st,lat:t.lat,lon:t.lon,city:t.school,sc:from===U().teamId?100:0,int:{},off:[],hs:null,cls:null,han:null,par:null});
  q.stars=p.ovr>=84?5:p.ovr>=77?4:p.ovr>=68?3:2;
  q.nil=Math.round((p.ovr>=86?rnd(900,2200):p.ovr>=80?rnd(350,900):p.ovr>=74?rnd(120,380):p.ovr>=67?rnd(40,140):rnd(10,45))*(p.pos==="QB"?2.1:1)/5)*5;
  S.portal.push(q);return q;
}
function draftEntry(p,id){return {n:p.fn+" "+p.ln,pos:p.pos,ovr:p.ovr,stars:p.stars,ovr0:p.ovr0,hsRank:p.hsRank,mine:!!p.byMe,team:id,yr:p.yr,pid:p.id};}
function aiDepartures(id){
  const t=T(id);const ro=t.roster||[];const keep=[];const starters=new Set();
  POSITIONS.forEach(pos=>depth(pos,ro).slice(0,POS_STARTERS[pos]).forEach(p=>starters.add(p.id)));
  ro.forEach(p=>{p.inj=0;p.susp=0;
    if(p.yr>=5||(p.yr===4&&(!p.rs||R()<0.55))){if(p.ovr>=74)S.draftPool.push(draftEntry(p,id));return;}
    if(p.yr===3&&p.ovr>=84&&R()<0.7){S.draftPool.push(draftEntry(p,id));return;}
    if(p.from==="Walk-on"&&p.ovr<52&&R()<0.3)return;
    const st=starters.has(p.id);let risk=st?0.015:(p.ovr>=t.talent-4?0.2:0.05);(p.tr||[]).forEach(x=>{if(TRAITS[x.k].port)risk+=TRAITS[x.k].port*0.6;});
    if(R()<risk){toPortal(p,id);return;}
    keep.push(p);});
  keep.forEach(p=>{if(p.yr===4)p.rs=false;p.yr++;});t.roster=keep;
}
function openPortal(sum){
  S.portalOpen=true;const uid=U().teamId;S.portal=[];S.draftPool=[];
  S.teamIds.forEach(id=>{if(id===uid)rosterDepartures(sum);else aiDepartures(id);});
  S.portal.sort((a,b)=>b.tOvr-a.tOvr);S.portal.forEach((p,i)=>{p.rank=i+1;});
  S.portal.forEach(p=>{const L=p.tOvr+10;const cands=S.teamIds.filter(id=>id!==uid&&id!==p.from&&Math.abs(T(id).talent-L+8)<14);
    shuffle(cands).slice(0,rint(3,7)).forEach(id=>{p.off.push(id);p.int[id]=rnd(5,20)*attract(T(id),p);});});
  addNews(`🌀 The transfer portal is OPEN. ${S.portal.length} players entered — real players from real rosters.`,"portal");
  sum.lines.push(`🌀 Transfer portal open: ${S.portal.length} players. Use the Portal tab — they commit fast.`);
}
function portalSign(q,dest){
  const p=q.pl||{};const pl=Object.assign(p,{from:"Portal",pfrom:q.from,mor:75,inj:0,susp:0,portalIn:true});
  if(dest===U().teamId){pl.byMe=true;pl.nil=q.nilO||0;pl.cls=S.year+1;pl.hist=pl.hist||[];S.roster.push(pl);}
  else{(T(dest).roster=T(dest).roster||[]).push(pl);}
}
function portalTick(final,sum){
  const uid=U().teamId;const dm=DIFF_MULT[U().diff]||1;
  S.portal.forEach(p=>{if(p.com)return;
    p.off.forEach(id=>{if(id===uid)return;const t=T(id);p.int[id]=(p.int[id]||0)+12*attract(t,p)*rnd(0.5,1.5)*dm*(t.nil/6);});
    const ranked=p.off.map(id=>[id,p.int[id]||0]).sort((a,b)=>b[1]-a[1]);if(!ranked.length)return;
    const [top,tp]=ranked[0];const sp=ranked[1]?ranked[1][1]:0;
    if((final&&tp>8)||(tp>=45&&tp>=sp*1.1&&R()<0.45)){p.com=top;p.signed=true;portalSign(p,top);
      if(top===uid){gainDXP(8);addNews(`🌀 PORTAL COMMIT: ${p.tOvr} OVR ${p.pos} ${rName(p)} (from ${T(p.from).school}) picks ${UT().school}!`,"user");sum.lines.push(`🌀 Portal pickup: ${p.pos} ${rName(p)} (${p.tOvr} OVR) from ${T(p.from).school}.`);}
      else if(p.rank<=40)addNews(`🌀 Top portal ${p.pos} ${rName(p)} (${p.tOvr} OVR, ex-${T(p.from).school}) commits to ${T(top).school}.`,"portal",top);
    }});
  if(final){
    (S.retention||[]).slice().forEach(x=>resolveRetention(x.pid,false));
    S.portalHist=S.portal.filter(p=>p.com===uid).map(p=>({n:rName(p),pos:p.pos,ovr:p.tOvr,from:p.from}));
    const unsigned=S.portal.filter(p=>!p.com).length;
    S.portal=[];S.portalOpen=false;invalidateProj();refreshTalent();
    sum.lines.push(`🌀 Portal window closed. Roster: ${S.roster.length}/105. ${unsigned} players went unsigned and left FBS.`);
  }
}
function rosterDepartures(sum){
  const uid=U().teamId;const out=[];const draft=[];const port=[];
  S.roster.forEach(p=>{p.inj=0;p.susp=0;
    if(p.yr>=5||(p.yr===4&&(!p.rs||R()<0.55))){out.push(p);if(p.ovr>=74)draft.push(p);return;}
    if(p.yr===3&&p.ovr>=84&&R()<0.7){out.push(p);draft.push(p);return;}
    if(p.yr===4)p.rs=false;
    const d=depth(p.pos);const slot=d.indexOf(p);const starter=slot<POS_STARTERS[p.pos];
    let risk=(starter?0.02:0.1)+(p.mor<45?0.25:0)+(p.ovr>=72&&!starter?0.12:0);
    (p.tr||[]).forEach(x=>{const tt=TRAITS[x.k];if(tt.port)risk+=x.k==="home"?(p.hlat&&miles(p.hlat,p.hlon,UT().lat,UT().lon)>600?tt.port:0):tt.port;if(x.k==="diva"&&starter)risk-=0.1;});
    if(p.promPT&&p.yr>=2&&!starter)risk+=0.35;
    risk=Math.max(0.01,risk)*(hasPerk("x4")?0.7:1);
    if(R()<risk)port.push(p);
  });
  S.roster=S.roster.filter(p=>!out.includes(p));
  draft.forEach(p=>S.draftPool.push(draftEntry(p,uid)));
  S.alumni=(S.alumni||[]).concat(out.filter(p=>p.byMe).map(p=>({n:p.fn+" "+p.ln,pos:p.pos,stars:p.stars,ovr0:p.ovr0,ovr:p.ovr,cls:p.cls,team:uid}))).slice(-120);
  S.retention=port.map(p=>({pid:p.id,ask:Math.round(Math.max(40,p.nil*1.4+(p.ovr-60)*12)*(1-0.03*(sk("neg")-1))*(hasPerk("x4")?0.75:1)/5)*5}));
  S.roster.forEach(p=>p.yr++);
  const pr=draft.filter(p=>p.ovr>=85).length;
  sum.lines.push(`🎓 ${out.length} players exhausted eligibility or declared for the NFL Draft (${draft.length} draft prospects${pr?", "+pr+" projected Day 1-2":""}).`);
  if(draft.length)addNews(`🏈 ${draft.length} ${UT().school} players head to the NFL Draft — a pitch for your "NFL Development" sell.`,"user");
  if(port.length)sum.lines.push(`⚠️ ${port.length} players are considering the portal. Handle it on the Team tab before the window closes.`);
  invalidateProj();
}
function resolveRetention(pid,keep){
  const i=S.retention.findIndex(x=>x.pid===pid);if(i<0)return;const rr=S.retention[i];const p=S.roster.find(x=>x.id===pid);if(!p){S.retention.splice(i,1);return;}
  if(keep){if(budgetLeft()<rr.ask-p.nil)return {ok:false,msg:"Not enough budget."};S.retention.splice(i,1);p.nil=rr.ask;p.mor=80;addNews(`🤝 ${p.pos} ${p.fn} ${p.ln} signs a retention deal and stays.`,"user");}
  else{S.retention.splice(i,1);S.roster=S.roster.filter(x=>x!==p);
    if(S.portalOpen){const q=toPortal(p,U().teamId);const cands=S.teamIds.filter(id=>id!==U().teamId&&Math.abs(T(id).talent-p.ovr-2)<14);shuffle(cands).slice(0,4).forEach(id=>{q.off.push(id);q.int[id]=rnd(10,25);});}
    addNews(`🚪 ${p.pos} ${p.fn} ${p.ln} enters the transfer portal.`,"user");}
  invalidateProj();return {ok:true};
}

// ---------- SIGNING DAY: rosters, walk-ons, class promotion ----------
function hsToPlayer(r,uid){const o=r.tOvr+rint(3,8);const mine=r.com===uid;
  const p={id:S.nextId++,fn:r.fn,ln:r.ln,pos:r.pos,yr:1,ovr:o,ovr0:o,pot:r.tPot,we:r.we,chr:r.chr,nil:mine?(r.nilO||0):0,mor:85,from:"HS",stars:r.stars,rs:true,cls:S.classYear,hsRank:r.rank,tr:(r.tr||[]).map(x=>({...x})),hist:[]};
  if(mine){Object.assign(p,{byMe:true,gem:r.tag,st:r.st,hlat:r.lat,hlon:r.lon,promPT:r.promPT||false});}
  return p;}
function walkOnFill(id){const ro=rosterOf(id);let added=0;
  POSITIONS.forEach(pos=>{const have=ro.filter(p=>p.pos===pos).length;for(let i=have;i<POS_ROSTER_TARGET[pos];i++){const p=genPlayer(pos,1,50);p.ovr=rint(44,56);p.ovr0=p.ovr;p.pot=p.ovr+rint(4,16);p.stars=2;p.from="Walk-on";p.nil=0;ro.push(p);added++;}});
  while(ro.length>105){let w=null;ro.forEach(p=>{if(!w||(p.from==="Walk-on"?p.ovr-10:p.ovr)<(w.from==="Walk-on"?w.ovr-10:w.ovr))w=p;});ro.splice(ro.indexOf(w),1);}
  return added;}
function closeClass(sum){
  const uid=U().teamId;const sy=S.classYear;const cr=classRankings();const rk=cr.findIndex(x=>x.id===uid)+1;const mine=S.recruits.filter(r=>r.com===uid&&r.cls===sy);
  S.classHist[sy]=cr.slice(0,25).map(x=>({id:x.id,pts:x.pts,n:x.n,s5:x.s5,s4:x.s4}));
  addNews(`📜 National Signing Day: the Class of ${sy} is complete. #1 class: ${T(cr[0].id).school} (${cr[0].pts} pts).`,"rank");
  sum.lines.push(`📜 Class of ${sy} final: ${UT().school} ranks #${rk} (${mine.length} signees, ${mine.filter(r=>r.stars===5).length}× 5★, ${mine.filter(r=>r.stars===4).length}× 4★).`);
  // every signee joins his school's roster
  S.recruits.forEach(r=>{if(r.cls!==sy||!r.signed||!r.com)return;rosterOf(r.com).push(hsToPlayer(r,uid));});
  // walk-ons fill every program's needs once all signings are complete
  let woU=0;S.teamIds.forEach(id=>{const n=walkOnFill(id);if(id===uid)woU=n;});
  if(woU)sum.lines.push(`🚶 ${woU} preferred walk-on${woU>1?"s":""} joined to fill out the depth chart.`);
  refreshTalent();
  gainXP("eval",4+mine.filter(r=>r.stars>=4).length);gainXP("pers",4);gainXP("rel",4);
  decayPipes();mine.forEach(r=>growPipe(r,14,4));
  const gemN=mine.filter(r=>r.tag==="lb"&&r.stars<=3).length;if(gemN){gainDXP(gemN*15);sum.lines.push(`💎 You signed ${gemN} under-the-radar gem${gemN>1?"s":""} the services missed.`);}
  if(U().ad){U().ad.waiv=0;U().ad.waivUsed=0;}
  const gs=goalStatus();const met=gs.filter(g=>g.ok).length;
  gainDXP(met*20+(rk<=10?60:rk<=25?35:rk<=50?15:0));gainPC(met*6);
  const dRep=(met-2)*3+(rk<=10?3:0);U().rep=clamp(U().rep+dRep,0,100);U().sec=clamp(U().sec+(met-2)*12,0,100);U().upPts+=met>=3?2:met>=2?1:0;
  U().career.push({y:sy,team:uid,rank:rk,n:mine.length,s5:mine.filter(r=>r.stars===5).length,s4:mine.filter(r=>r.stars===4).length,met,rec:UT().w+"-"+UT().l,pts:cr[rk-1]?cr[rk-1].pts:0});
  const L=leg();if(rk===1){L.top1++;L.tro.push({y:sy,t:"#1 recruiting class",team:uid});}if(rk<=10)L.top10++;
  // Recruiter of the Year: biggest over-performance vs. program expectation
  const order=S.teamIds.slice().sort((a,b)=>teamLevel(T(b))-teamLevel(T(a)));const over=cr.map((c,i)=>({id:c.id,o:order.indexOf(c.id)-i}));over.sort((a,b)=>b.o-a.o);
  if(over[0].id===uid||rk===1){L.roty++;L.tro.push({y:sy,t:"Recruiter of the Year",team:uid});sum.lines.push(`🏅 You're named National Recruiter of the Year!`);gainDXP(50);U().rep=clamp(U().rep+4,0,100);}
  else addNews(`🏅 Recruiter of the Year: ${T(over[0].id).school}'s staff, after finishing #${cr.findIndex(c=>c.id===over[0].id)+1} nationally.`,"rank");
  sum.lines.push(`🧑‍💼 AD review: ${met}/4 goals met. Reputation ${dRep>=0?"+":""}${dRep} → ${Math.round(U().rep)}. Job security ${Math.round(U().sec)}.`);
  sum.review={met,gs,rk};
  if(U().sec<=10){sum.fired=true;}
  sum.offers=jobOffers();
  const gems=S.recruits.filter(r=>r.cls===sy&&r.tag==="lb"&&r.stars<=3&&r.sc>=50&&r.com!==uid).slice(0,2);
  gems.forEach(g=>addNews(`📼 The tape was there: your staff graded ${rName(g)} highly, but he signed with ${g.com?T(g.com).school:"nobody"} as a ${g.stars}★.`,"user"));
  S.prevClass=mine.map(r=>({id:r.id,n:rName(r),pos:r.pos,stars:r.stars,rank:r.rank}));
  promoteClasses(sum);
}
function promoteClasses(sum){
  const sy=S.classYear;
  S.recruits=S.recruits.filter(r=>r.cls>sy);
  S.classYear=sy+1;S.classTick=0;
  // everyone grows a year; ceilings shift a little (more for late bloomers)
  S.recruits.forEach(r=>{r.tOvr=Math.min(90,r.tOvr+rint(4,8));r.tPot=clamp(Math.round(r.tPot+gauss(r.tag==="lb"?2.5:0,2)),40,99);if(r.cls===S.classYear){r.dec=decTick(r.stars);r.ss={g:0};}});
  // late discoveries join each class
  const newSr=[],newJr=[];
  for(let i=0;i<300;i++){const r=genRecruit(S.classYear);r.pA-=4;r.pB-=4;r.perc-=4;if(R()<0.15){r.tPot=clamp(r.tPot+rint(4,9),40,99);r.tag="lb";}newSr.push(r);}
  for(let i=0;i<300;i++){const r=genRecruit(S.classYear+1);youngify(r,1);newJr.push(r);}
  S.recruits=S.recruits.concat(newSr,newJr);
  rerank(false);
  newSr.concat(newJr).forEach(r=>{r.nil=nilMarket(r);if(hasT(r,"brand"))r.nil=Math.round(r.nil*1.5/5)*5;r.dec=r.cls===S.classYear?decTick(r.stars):999;drama(r);});
  S.recruits.forEach(r=>{if(r.cls===S.classYear&&!newSr.includes(r)){r.nil=Math.max(r.nil,nilMarket(r));}});
  initOffers(S.recruits.filter(r=>r.cls===S.classYear),0,true);
  initOffers(newJr,1);seedPipelines(newSr.concat(newJr));
  genClass(S.classYear+2,2);
  Object.keys(S.user.targets).forEach(id=>{if(!S.recruits.some(r=>r.id==id))delete S.user.targets[id];});
  sum.lines.push(`🆕 The Class of ${S.classYear} are seniors now (${S.recruits.filter(r=>r.cls===S.classYear).length} prospects). The Class of ${S.classYear+2} sophomores just hit the board.`);
}
function jobOffers(){
  const uid=U().teamId;const rep=U().rep;const cur=UT().prestige;if(rep<50)return [];
  const c=S.teamIds.filter(id=>id!==uid&&T(id).prestige>cur&&T(id).prestige<=rep+25).sort(()=>R()-0.5).slice(0,rep>75?3:rep>62?2:1);
  return R()<0.75?c:[];
}
function takeJob(id){
  const old=U().teamId;
  T(old).roster=S.roster;S.roster=T(id).roster||genRosterFor(id);delete T(id).roster;
  U().teamId=id;U().sec=70;U().yearsAt=0;U().bonusNIL=0;U().targets={};S.pendingJob=null;initAD();initStaff();
  S.recruits.forEach(r=>{r.nilO=0;r.ov=[];});S.portal.forEach(r=>{r.nilO=0;});S.retention=[];
  S.roster.forEach(p=>{if(!p.hist)p.hist=[];if(p.mor===undefined)p.mor=70;});distributePayroll();invalidateProj();
  const L=leg();if(!L.teams.includes(id))L.teams.push(id);
  addNews(`🧳 You've been hired as Director of Recruiting at ${T(id).school}!`,"user");
}
function followCoach(to){
  const oldId=U().teamId;const c=T(to).coach.name;
  let moved=0;S.recruits.forEach(r=>{if(r.com===oldId&&!r.signed&&r.mot[MOTIVE_IDX.coach]>0.12&&R()<0.6){decommit(r,"following "+c);if(!r.off.includes(to))r.off.push(to);r.int[to]=(r.int[to]||0)+(r.int[oldId]||0)*0.8;moved++;}});
  takeJob(to);U().rep=clamp(U().rep+2,0,100);
  return moved;
}
function springProgression(sum){
  const uid=U().teamId;let gains=0,big=[];
  S.teamIds.forEach(id=>{const t=T(id);const dev=t.coach.dev;const ro=rosterOf(id);const me=id===uid;
    ro.forEach(p=>{const stage=p.yr<=2?"early":"late";let g=Math.max(0,(p.pot-p.ovr))*(0.17+dev/450+p.we/500)*rnd(0.6,1.3)*traitMult(p,stage)*(me?devMult(p.pos):1)+rnd(0,1.5);
      if(hasT(p,"raw")&&p.yr>=3&&R()<0.4){p.pot=Math.min(99,p.pot+rint(2,5));}
      if(hasT(p,"inj")&&R()<0.3)g*=0.4;
      const before=p.ovr;p.ovr=clamp(Math.round(p.ovr+g),40,99);p.pot=Math.max(p.pot,p.ovr);
      if(me){gains+=p.ovr-before;if(p.ovr-before>=7)big.push(p);(p.hist=p.hist||[]).push({y:S.year,o:p.ovr});revealTrait(p,"any",0.45,null);
        if(p.promPT&&p.yr>=2){const d=depth(p.pos);if(d.indexOf(p)>=POS_STARTERS[p.pos]){p.mor=clamp(p.mor-25,0,100);sum.lines.push(`😤 ${p.pos} ${p.fn} ${p.ln} was promised early playing time and isn't starting. His family is not happy.`);p.promPT=false;}}}
    });});
  // league-wide calibration keeps the talent level realistic across decades
  const mean=S.teamIds.reduce((a,id)=>a+teamOVR(rosterOf(id)),0)/S.teamIds.length;const shift=Math.round(clamp((S.talentMean0-mean)*0.6,-2,2));
  if(shift)S.teamIds.forEach(id=>rosterOf(id).forEach(p=>{p.ovr=clamp(p.ovr+shift,40,99);p.pot=Math.max(p.pot,p.ovr);}));
  refreshTalent();
  sum.lines.push(`💪 Spring development: roster gained ${Math.round(gains)} total OVR. Team OVR now ${UT().talent}.`);
  big.sort((a,b)=>(b.ovr-(b.hist.length>1?b.hist[b.hist.length-2].o:b.ovr0||b.ovr))-(a.ovr-(a.hist.length>1?a.hist[a.hist.length-2].o:a.ovr0||a.ovr)));
  big.slice(0,4).forEach(p=>sum.lines.push(`📈 Breakout: ${p.pos} ${p.fn} ${p.ln} jumped to ${p.ovr} OVR${p.stars&&p.stars<=3&&p.ovr>=80?` — not bad for a ${p.stars}★`:""}${p.gem==="lb"?" (the hidden gem is real)":""}.`));
  const rev=S.roster.reduce((a,p)=>a+(p.tr||[]).filter(x=>x.rev).length,0);sum.lines.push(`🔍 Spring practice exposed more of your roster's traits (${rev} known).`);
  invalidateProj();
}
function rollYear(sum){
  S.year++;S.cal=buildCalendar(S.year);S.phaseIdx=0;U().yearsAt++;
  coachGrowth(sum);U().bonusNIL=Math.round(U().bonusNIL*0.5);
  (U().staff||[]).forEach(s=>{if(!s)return;s.yrs++;if(R()<0.5)s.rec=clamp(s.rec+rint(0,2),40,95);if(R()<0.5)s.dev=clamp(s.dev+rint(0,2),40,95);});
  S.teamIds.forEach(id=>{resetNeeds(T(id));T(id).target=rint(20,25);});
  newSeason(false);
  sum.lines.push(`🗓️ The ${S.year} season is here. AP preseason: ${UT().apRank?"#"+UT().apRank:"unranked"}.`);
}
function nflDraft(sum){
  const uid=U().teamId;const PV={QB:1.5,EDGE:1.2,OL:0.6,CB:0.8,WR:0.6,DL:0.4,S:-0.5,LB:-0.8,TE:-1,RB:-1.5,K:-12};const pool=(S.draftPool||[]).map(p=>({...p,sc:p.ovr+(PV[p.pos]||0)+gauss(0,6)})).sort((a,b)=>b.sc-a.sc);
  // the rest of the country (FCS, other FBS programs, small schools) takes ~30% of picks
  const base=pool.slice();for(let i=0;i<110;i++){const ref=base[Math.min(base.length-1,rint(5,330))];if(ref)pool.push({n:"",pos:pick(POSITIONS),ovr:ref.ovr,sc:ref.sc+gauss(0,2),team:"other",phantom:true});}
  pool.sort((a,b)=>b.sc-a.sc);
  const cut=[32,64,100,138,176,216,257];const picks=[];
  pool.forEach((p,i)=>{if(i>=257)return;p.rd=cut.findIndex(c=>i<c)+1;picks.push(p);});
  const cnt={};picks.forEach(p=>cnt[p.team]=(cnt[p.team]||0)+1);
  S.teamIds.forEach(id=>{const t=T(id);const n=cnt[id]||0;t.pro=(t.pro||[]).concat([n]).slice(-3);t.lastDraft=n;});
  const mineT=picks.filter(p=>p.team===uid);S.lastDraft={y:S.year,picks:mineT};
  const r1=mineT.filter(p=>p.rd===1).length;
  if(mineT.length){sum.lines.push(`🏈 NFL Draft: ${mineT.length} ${UT().school} player${mineT.length>1?"s":""} drafted${r1?` (${r1} first-rounder${r1>1?"s":""})`:""}. "NFL Development" pitch just got stronger.`);
    mineT.slice(0,4).forEach(p=>sum.lines.push(`   • Round ${p.rd}: ${p.pos} ${p.n}${p.mine?` — signed by you as a ${p.stars}★`:""}`));
    addNews(`🏈 NFL Draft: ${UT().school} produces ${mineT.length} draft picks.`,"user");}
  else sum.lines.push(`🏈 NFL Draft: no ${UT().school} players selected this year.`);
  const myS=picks.filter(p=>p.mine);myS.forEach(p=>{gainDXP(p.rd===1?50:25);leg().drafted.push({y:S.year,n:p.n,pos:p.pos,rd:p.rd,stars:p.stars,team:p.team,hsRank:p.hsRank});});
  if(myS.length){gainXP("eval",myS.length*4);U().rep=clamp(U().rep+myS.length*0.8,0,100);if(myS.some(p=>p.team!==uid))sum.lines.push(`🎓 Former signees from your other stops also heard their names called.`);}
  const first=picks.find(p=>!p.phantom);if(first)addNews(`🏈 Top pick from our tracked programs: ${first.pos} ${first.n} (${T(first.team).school}), No. ${picks.indexOf(first)+1} overall.`,"rank");
  const top=S.teamIds.slice().sort((a,b)=>T(b).lastDraft-T(a).lastDraft).slice(0,3);
  addNews(`🏈 Most NFL draft picks: ${top.map(id=>T(id).school+" ("+T(id).lastDraft+")").join(", ")}.`,"rank");
  S.draftPool=[];
}

// ---------- COACHING CAROUSEL (with your assistants) ----------
function coachingCarousel(sum){
  const uid=U().teamId;const openings=[];
  S.teamIds.forEach(id=>{const t=T(id);const exp=3.5+(t.prestige-38)/60*6.5;const perf=t.w-exp;
    t.coach.hot=clamp(t.coach.hot*0.6-perf*0.7,-5,8);t.coach.yrs++;
    const fireP=t.coach.hot>3.2?0.35+(t.coach.hot-3.2)*0.15:0;
    if(fireP&&R()<fireP)openings.push({id,why:"fired",old:t.coach.name});
    else if(t.w>=12&&t.coach.game>=88&&R()<0.05)openings.push({id,why:"left for the NFL",old:t.coach.name});
  });
  openings.sort((a,b)=>T(b.id).prestige-T(a.id).prestige);
  const taken=new Set(openings.map(o=>o.id));
  // your assistants can be poached
  const staff=U().staff||[];
  staff.forEach((a,si)=>{if(!a)return;const p=0.03+Math.max(0,(a.rec+a.sch)/2-74)/110+(UT().w>=10?0.06:0)+a.amb*0.05;if(R()>p)return;
    const op=openings.find(o=>o.id!==uid&&!o.filled&&T(o.id).prestige<=UT().prestige+5);
    if(op&&(a.role==="oc"||a.role==="dc"||R()<0.3)){op.filled={name:a.name,rec:a.rec,dev:a.dev,game:a.sch,hot:0,yrs:0,real:false,from:uid};staff[si]=null;
      addNews(`🎓 Your ${STAFF_ROLES[si].n}, ${a.name}, is hired as head coach at ${T(op.id).school}.`,"user");sum.lines.push(`🎓 ${a.name} (your ${STAFF_ROLES[si].n}) lands the head job at ${T(op.id).school}. Hire a replacement in Team → Coach & Staff.`);
      if(!S.pendingJob&&R()<0.45&&T(op.id).prestige>=UT().prestige-15)S.pendingJob={type:"follow",to:op.id,coach:a.name,newCoach:UT().coach.name,role:STAFF_ROLES[si].n};}
    else S.events.push({id:"poach",aid:a.id,si,title:"📞 Your assistant is being poached",text:`${a.name}, your ${STAFF_ROLES[si].n}, has a coordinator offer from another Power program. Counter with a raise (+${money(Math.round(a.sal*0.35))}/yr) or let him go?`,opts:[["Counter-offer","poachKeep"],["Wish him well","poachLet"]]});
  });
  if(!openings.length){addNews("🎠 Quiet coaching carousel this year — no major openings.","coach");return;}
  openings.forEach(o=>{
    const t=T(o.id);
    addNews(`🎠 ${t.school} ${o.why==="fired"?"fires":"loses"} head coach ${o.old}${o.why!=="fired"?" ("+o.why+")":""}.`,"coach",o.id);
    let nc;
    if(o.filled){nc=o.filled;addNews(`✍️ ${t.school} hires ${nc.name}, an assistant from ${T(uid).school}.`,"coach",o.id);}
    else{const cands=S.teamIds.filter(id=>!taken.has(id)&&T(id).prestige<t.prestige-8&&T(id).w>=9&&T(id).coach.rec+T(id).coach.game>=140).sort((a,b)=>(T(b).w*3+T(b).coach.game)-(T(a).w*3+T(a).coach.game));
      if(cands.length&&R()<0.75){const from=T(cands[0]);nc={...from.coach,hot:0,yrs:0};taken.add(from.id);
        addNews(`✍️ ${t.school} hires ${nc.name} away from ${from.school}.`,"coach",o.id);
        const old=from.coach.name;from.coach=fakeCoach(56,68);
        addNews(`✍️ ${from.school} promotes ${from.coach.name} to replace ${old}.`,"coach",from.id);
        if(from.id===uid){coachChangeUser(sum,old,from.coach);newHCStaff(sum);if(!S.pendingJob||S.pendingJob.role)S.pendingJob={type:"follow",to:o.id,coach:nc.name,newCoach:from.coach.name};}
        S.recruits.forEach(r=>{if(r.com===from.id&&!r.signed&&R()<0.3)decommit(r,"his head coach left");});
      }else{nc=fakeCoach(64,80);addNews(`✍️ ${t.school} hires coordinator ${nc.name} as head coach.`,"coach",o.id);}}
    const oldName=t.coach.name;t.coach=nc;
    if(o.id===uid){coachChangeUser(sum,oldName,nc);newHCStaff(sum);
      if(o.why==="fired"){const keepP=clamp(0.3+U().rep/200+(U().sec-50)/120,0.1,0.9);S.pendingJob={type:"fired",old:oldName,coach:nc.name,kept:R()<keepP};}
      else S.pendingJob={type:"nfl",old:oldName,coach:nc.name};}
    S.recruits.forEach(r=>{if(r.com===o.id&&!r.signed&&R()<0.3)decommit(r,"coaching change");});
  });
}

// ---------- ASSISTANT COACHES ----------
function genAssistant(role,lvl){
  const r=STAFF_ROLES.find(x=>x.k===role);const base=lvl||rint(58,78);
  const terr=[];const st1=wpick(RECRUIT_GEO,g=>g[1])[0];terr.push(st1);if(R()<0.6){const st2=wpick(RECRUIT_GEO,g=>g[1])[0];if(st2!==st1)terr.push(st2);}
  const a={id:S.nextId++,role,name:pick(COACH_FN)+" "+pick(COACH_LN),rec:clamp(Math.round(base+gauss(0,7)+(role==="rc"?8:0)),40,95),dev:clamp(Math.round(base+gauss(0,7)-(role==="rc"?6:0)),40,95),
    sch:clamp(Math.round(base+gauss(0,7)+(role==="oc"||role==="dc"?3:-4)),40,95),terr,pos:r.pos===null?pick(POS_GROUPS[r.side]):r.pos,amb:+rnd(0,1).toFixed(2),yrs:0};
  if(role==="oc")a.style=wpick(OFF_STYLES.slice(0,4),x=>({"Spread RPO":5,"Pro Style":3,"Power Run":2,"Air Raid":2})[x]);if(role==="dc")a.style=pick(DEF_STYLES);
  a.sal=Math.round((150+Math.max(0,(a.rec+a.dev+a.sch)/3-55)*45*(role==="oc"||role==="dc"?1.8:1))/25)*25;return a;}
function initStaff(){const t=UT();const lvl=clamp(Math.round(t.prestige*0.35+48),55,82);
  U().staff=STAFF_ROLES.map(r=>{const a=genAssistant(r.k,lvl+rint(-5,5));if(r.k==="oc")a.style=t.off;if(r.k==="dc")a.style=t.def;return a;});
  const rc=U().staff[4];rc.terr=[t.st].concat(rc.terr).filter((v,i,a)=>a.indexOf(v)===i).slice(0,2);
  while(staffPayroll()>staffBudget()){U().staff.forEach(a=>{a.sal=Math.round(a.sal*0.9/25)*25;});}}
function staffBudget(){const t=UT();return Math.round(1800+t.prestige*45+(U().ad?U().ad.commit*12:0)+(U().ad&&U().ad.staffPool||0));}
function staffPayroll(){return (U().staff||[]).reduce((a,s)=>a+(s?s.sal:0),0);}
function staffFor(pos){return (U().staff||[]).find(s=>s&&s.pos&&s.pos.includes(pos));}
function devMult(pos){const s=staffFor(pos);return s?1+(s.dev-70)/220:0.95;}
function staffMult(r){if(!r||r.portal)return 1;let m=1;(U().staff||[]).forEach(s=>{if(s&&s.terr.includes(r.st))m=Math.max(m,1.08+(s.rec-60)/250);});return m;}
function inTerritory(st){return (U().staff||[]).some(s=>s&&s.terr.includes(st));}
function bestAsst(r){let best=null,bv=0;(U().staff||[]).forEach(s=>{if(!s)return;if(s.vt===S.tick&&s.vn>=2)return;let v=s.rec*(s.terr.includes(r.st)?1.35:1)*(s.pos&&s.pos.includes(r.pos)?1.15:1);if(v>bv){bv=v;best=s;}});return best?{s:best,v:bv}:null;}
function schemeBonus(){const st=U().staff||[];const oc=st[0],dc=st[1];return ((oc?oc.sch:62)+(dc?dc.sch:62)-144)*0.05;}
function canFire(){const p=phase();return !["game","pre"].includes(p.type);}
function hireCandidates(si){const key=S.year+"|"+S.phaseIdx;if(S.candsKey!==key){S.cands={};S.candsKey=key;}
  if(!S.cands[si]){const t=UT();const lvl=clamp(Math.round(t.prestige*0.33+48+U().rep*0.1),55,88);S.cands[si]=[0,1,2,3].map(()=>genAssistant(STAFF_ROLES[si].k,lvl+rint(-9,6)));}return S.cands[si];}
function hireAssistant(si,cid){const st=U().staff;if(st[si])return {ok:false,msg:"That job is filled. Fire the current coach first (offseason only)."};
  const c=(S.cands&&S.cands[si]||[]).find(x=>x.id===cid);if(!c)return {ok:false,msg:"Candidate unavailable."};
  if(staffPayroll()+c.sal>staffBudget())return {ok:false,msg:`Over the staff budget (${money(staffBudget())}). Fire someone or ask the AD for more.`};
  st[si]=c;S.cands[si]=S.cands[si].filter(x=>x!==c);const t=UT();
  if(c.role==="oc"&&c.style&&c.style!==t.off){t.off=c.style;addNews(`🧠 New OC ${c.name} installs the ${c.style} offense.`,"user");}
  if(c.role==="dc"&&c.style&&c.style!==t.def){t.def=c.style;addNews(`🧠 New DC ${c.name} brings a ${c.style} defense.`,"user");}
  addNews(`✍️ ${t.school} hires ${c.name} as ${STAFF_ROLES[si].n}.`,"user");gainDXP(5);return {ok:true,msg:`Hired ${c.name}.`};}
function fireAssistant(si){if(!canFire())return {ok:false,msg:"You can only make staff changes in the offseason."};const a=U().staff[si];if(!a)return {ok:false};U().staff[si]=null;if(U().ad)U().ad.commit=clamp(U().ad.commit-1,0,100);addNews(`🚪 ${UT().school} parts ways with ${STAFF_ROLES[si].n} ${a.name}.`,"user");return {ok:true,msg:`${a.name} is out.`};}
function newHCStaff(sum){const st=U().staff;const t=UT();const lvl=clamp(Math.round(t.prestige*0.35+48),55,82);let n=0;
  st.forEach((a,i)=>{if(a&&R()<0.5){st[i]=genAssistant(STAFF_ROLES[i].k,lvl+rint(-4,6));n++;}});
  if(st[0]&&st[0].style)t.off=st[0].style;if(st[1]&&st[1].style)t.def=st[1].style;
  if(n)sum.lines.push(`🧢 The new head coach brought in ${n} of his own assistants. Check Team → Coach & Staff for new territories.`);}

// ---------- CAMPS & ALL-STAR WEEK ----------
function genCamps(){const sy=S.classYear;const pool=S.recruits.filter(r=>r.cls<=sy+1&&!r.signed);
  S.camps=CAMP_REGIONS.map(([n,sts],i)=>({id:i,n,sts,att:shuffle(pool.filter(r=>sts.includes(r.st))).slice(0,55).map(r=>r.id),done:false}));
  const top=pool.filter(r=>r.cls===sy||r.rank<=60).sort((a,b)=>a.rank-b.rank).slice(0,130);
  S.camps.push({id:9,n:"Gridiron Elite Showcase (national, invite-only)",sts:[],att:top.map(r=>r.id),done:false,nat:true});S.campHost=false;}
function attendCamp(id){const c=(S.camps||[]).find(x=>x.id===id);if(!c||c.done)return {ok:false,msg:"Already worked that camp."};if(!canSpend(6))return {ok:false,msg:"Need 6 hours."};
  spend(6);c.done=true;const uid=U().teamId;let n=0,rev=0;
  c.att.forEach(rid=>{const r=findRec(rid);if(!r)return;r.sc=Math.min(100,r.sc+Math.round(28*scoutMult()));r.fortyV=true;if(r.off.includes(uid))r.int[uid]=(r.int[uid]||0)+3;if(revealTrait(r,R()<0.5?"eval":"film",0.25))rev++;growPipe(r,0.5,0.2);n++;});
  gainXP("eval",8);return {ok:true,msg:`Your staff worked the ${c.n}: ${n} prospects evaluated, ${rev} traits spotted.`};}
function hostCamp(){if(S.campHost)return {ok:false,msg:"You already hosted your camp this summer."};if(!canSpend(8))return {ok:false,msg:"Need 8 hours."};
  spend(8);S.campHost=true;const t=UT();const uid=t.id;
  const att=S.recruits.filter(r=>!r.signed&&(miles(t.lat,t.lon,r.lat,r.lon)<450||pipeHS(r)>=20||(r.off.includes(uid)&&R()<0.3))).sort(()=>R()-0.5).slice(0,90);
  att.forEach(r=>{r.sc=Math.min(100,r.sc+Math.round(25*scoutMult()));r.fortyV=true;r.int[uid]=(r.int[uid]||0)+(r.off.includes(uid)?6:4);revealTrait(r,"any",0.3);growPipe(r,1,0.3);r.lastTouch=S.tick;});
  gainXP("rel",6);gainXP("eval",6);S.campAtt=att.map(r=>r.id);return {ok:true,msg:`${att.length} prospects came to your camp. Scouting and relationships up across the board.`};}
function campResults(sum){
  if(!S.camps)return;const ids=new Set();S.camps.forEach(c=>c.att.forEach(id=>ids.add(id)));
  const before={};S.recruits.forEach(r=>{if(ids.has(r.id))before[r.id]=r.rank;});
  rerankUpdate("Camp-circuit",ids);
  const movers=S.recruits.filter(r=>ids.has(r.id)&&r.cls===S.classYear).map(r=>({r,d:(before[r.id]||r.rank)-r.rank})).sort((a,b)=>b.d-a.d);
  const mvp=movers[0];if(mvp&&mvp.d>0){addNews(`🏕️ Camp season MVP: ${mvp.r.pos} ${rName(mvp.r)} shot up ${mvp.d} spots to #${mvp.r.rank} after testing.`,"rank");feed(mvp.r,`Showcase MVP 🏆 Numbers don't lie. #${mvp.r.rank} now.`);}
  sum.lines.push(`🏕️ Camp season wrapped: ${ids.size} prospects tested. The services re-ranked everyone who showed up.`);S.camps=null;
}
function allStarWeek(sum,evts){const sy=S.classYear;const inv=S.recruits.filter(r=>r.cls===sy&&!r.signed).sort((a,b)=>a.rank-b.rank).slice(0,100);
  S.allstar={y:S.year,inv:inv.map(r=>r.id)};let ann=0;
  inv.forEach(r=>{if(r.com||R()>0.55)return;const ranked=r.off.map(id=>[id,r.int[id]||0]).sort((a,b)=>b[1]-a[1]);if(!ranked.length||ranked[0][1]<20)return;doCommit(r,ranked[0][0],ranked,evts);ann++;
    feed(r,`🧢 Picked up the ${T(ranked[0][0]).school} hat live at the All-American Bowl!`);});
  addNews(`🎙️ All-American Bowl: ${ann} uncommitted stars announced their decisions on national TV.`,"rank");sum.lines.push(`🎙️ All-American Bowl week: ${ann} top recruits announced live.`);}
function scoutAllStar(){if(!S.allstar||S.allstar.y!==S.year||phase().key!=="allstar")return {ok:false,msg:"Nothing to scout right now."};if(S.allstar.done)return {ok:false,msg:"Already scouted practices."};if(!canSpend(5))return {ok:false,msg:"Need 5 hours."};
  spend(5);S.allstar.done=true;S.allstar.inv.forEach(id=>{const r=findRec(id);if(r){r.sc=Math.min(100,r.sc+20);revealTrait(r,"any",0.25);}});gainXP("eval",5);return {ok:true,msg:"All-star practice evals filed on 100 seniors."};}
function isDead(){return !!(phase()&&phase().dead);}

// ---------- FEED & DRAMA ----------
function feed(r,txt){if(S._presim)return;S.feed=S.feed||[];S.feed.unshift({rid:r.id,n:rName(r),st:r.stars,t:txt,ph:phase()?phase().label:"",y:S.year});if(S.feed.length>200)S.feed.length=200;}
function weeklyFeed(){const sy=S.classYear;const cands=S.recruits.filter(r=>r.cls===sy&&!r.com&&r.rank<=150&&r.off.length>=5);
  for(let i=0;i<3&&cands.length;i++){const r=pick(cands);const ts=topSchools(r,5);if(ts.length<3)continue;feed(r,`📋 My Top ${ts.length} 👀 ${ts.map(x=>T(x.id).abbr).join(" · ")} — decision: ${decLabel(r)||"soon"}`);}
  const c2=S.recruits.filter(r=>r.cls===sy&&!r.com&&r.off.includes(U().teamId)&&r.rank<=400);if(c2.length&&R()<0.5){const r=pick(c2);const ts=topSchools(r,1)[0];if(ts)feed(r,`📸 Posted a photo-edit in ${T(ts.id).school} gear. Just having fun… or is he? 👀`);}}
function maybeEvent(){
  if(R()>0.36||S.events.length)return;
  const uid=U().teamId;const t=UT();
  const targets=S.recruits.filter(r=>r.off.includes(uid)&&!r.signed&&r.stars>=3);
  const pool=[];
  if(targets.length){
    const r=pick(targets);
    pool.push({id:"mom",rid:r.id,title:"📞 A call from home",text:`${rName(r)}'s mother wants to hear directly from Coach ${t.coach.name.split(" ").pop()} this week. It'll cost a head-coach visit slot.`,opts:[["Set it up (uses HC slot)","momYes"],["Have an assistant call instead","momNo"]]});
    pool.push({id:"rival",rid:r.id,title:"🗣️ Negative recruiting",text:`A rival staff is telling ${rName(r)} that your depth chart is "a parking lot" at ${r.pos}. Respond?`,opts:[["Send him the depth chart & a plan (2h)","rivalYes"],["Ignore it","rivalNo"]]});
    if(r.stars>=4)pool.push({id:"tweet",rid:r.id,title:"📱 Cryptic post",text:`${rName(r)} just posted a graphic: "Top 3 👀 — decision soon." You're in it. Push now?`,opts:[["Flood the zone (3h, +interest)","tweetYes"],["Stay patient","tweetNo"]]});
    const hr=targets.filter(x=>x.han);if(hr.length){const h=pick(hr);h.hanK=true;
      pool.push({id:"han",rid:h.id,title:"🕴️ The handler wants a meeting",text:`${h.han.n}, ${rName(h)}'s ${h.han.k}, says he "controls the recruitment" and wants to talk numbers.`,opts:[["Meet and talk NIL straight (2h)","hanMeet"],["Promise him a \"consulting\" role","hanShady"],["Refuse to deal with him","hanNo"]]});}
    const pt=targets.filter(x=>x.par==="pt"||x.par==="dad");if(pt.length){const d=pick(pt);d.parK=true;
      pool.push({id:"dad",rid:d.id,title:"👨 Dad wants a promise",text:`${rName(d)}'s father wants your word he'll start by his second year.`,opts:[["Promise it","dadYes"],["Be honest: he'll earn it","dadNo"]]});}
  }
  pool.push({id:"booster",title:"💼 Booster with strings",text:`A major donor offers ${money(500)} to the collective — if you offer his nephew, a 2★ long snapper. Compliance won't love it.`,opts:[["Take the money","boosterYes"],["Politely decline","boosterNo"]]});
  pool.push({id:"camp",title:"🏕️ Satellite camp invite",text:`A high school in ${pick(RECRUIT_GEO)[0]} invites your staff to work a camp this weekend. Free scouting on a few prospects, costs 4 hours.`,opts:[["Go (4h)","campYes"],["Pass","campNo"]]});
  S.events.push(pick(pool));
}
function resolveEvent(choice){
  const e=S.events.shift();if(!e)return "";const r=e.rid?findRec(e.rid):null;const uid=U().teamId;let msg="";
  if(e.rid&&!r)return "That recruit is gone.";
  switch(choice){
    case "momYes":if(U().hc>0){U().hc--;r.int[uid]+=22;msg=`Mom loved Coach. ${rName(r)} +22 interest.`;}else{r.int[uid]+=6;msg="No HC slot left — an assistant called. +6.";}break;
    case "momNo":r.int[uid]+=3;msg="She was polite, but you could tell. +3.";break;
    case "rivalYes":if(canSpend(2)){spend(2);r.int[uid]+=10;msg="Message received. +10.";}else msg="No hours left. The rumor sticks.";break;
    case "rivalNo":r.int[uid]*=0.93;msg="The narrative stuck a little. Interest −7%.";break;
    case "tweetYes":if(canSpend(3)){spend(3);r.int[uid]+=16;msg="Your whole staff is in his DMs. +16.";}else msg="Not enough hours.";break;
    case "tweetNo":msg="You stayed patient.";break;
    case "boosterYes":U().bonusNIL+=500;U().sec=clamp(U().sec-4,0,100);msg="+$500K to the collective. The AD raised an eyebrow (−4 security).";break;
    case "boosterNo":U().rep=clamp(U().rep+1,0,100);msg="Integrity noted. +1 reputation.";break;
    case "campYes":if(canSpend(4)){spend(4);const near=S.recruits.filter(x=>!x.signed).sort(()=>R()-0.5).slice(0,4);near.forEach(x=>x.sc=Math.min(100,x.sc+35));msg="Camp evals filed on: "+near.map(rName).join(", ")+".";}else msg="Not enough hours.";break;
    case "campNo":msg="You passed on the camp.";break;
    case "hanMeet":if(!canSpend(2)){msg="No hours left — he took it personally. −5%.";r.int[uid]*=0.95;break;}spend(2);{const g=(r.nilO||0)>=r.nil*0.9?14:4;r.int[uid]+=g;msg=g>10?`Your NIL number spoke for itself. +${g}.`:`He wanted more money on the table. +${g}. (Make an NIL offer near ${money(r.nil)}.)`;}break;
    case "hanShady":r.int[uid]+=22;if(R()<0.35){U().sec=clamp(U().sec-10,0,100);if(U().ad){U().ad.commit=clamp(U().ad.commit-6,0,100);U().ad.pc=Math.max(0,U().ad.pc-15);}addNews(`🚨 NCAA inquiry: questions about a "consulting" arrangement tied to ${rName(r)}'s recruitment.`,"user");msg="+22 interest… and then compliance got a call. −10 security, AD furious.";}else msg="+22 interest. Nobody noticed — this time.";break;
    case "hanNo":r.int[uid]*=0.88;U().rep=clamp(U().rep+1,0,100);msg="You cut out the middleman. −12% interest, +1 reputation.";break;
    case "dadYes":r.int[uid]+=15;r.promPT=true;msg="Dad is all in. +15. You'd better keep that promise.";break;
    case "dadNo":{const w=r.mot[MOTIVE_IDX.pt];r.int[uid]+=w>0.2?-6:4;msg=w>0.2?"Not what he wanted to hear. −6.":"He respected the honesty. +4.";}break;
    case "poachKeep":{const a=(U().staff||[]).find(x=>x&&x.id===e.aid);if(!a){msg="He already left.";break;}if(R()<0.7){a.sal=Math.round(a.sal*1.35/25)*25;a.amb=Math.max(0,a.amb-0.3);msg=`${a.name} stays. New salary ${money(a.sal)}.`;}else{U().staff[e.si]=null;msg=`${a.name} took the job anyway. Hire a replacement.`;}}break;
    case "poachLet":{const i=e.si;const a=U().staff[i];if(a&&a.id===e.aid){U().staff[i]=null;msg=`${a.name} is off to a new job. Hire a replacement in Team → Coach & Staff.`;}else msg="";}break;
  }
  return msg;
}

// ---------- LEGACY ----------
function leg(){const u=U();u.leg=u.leg||{tro:[],drafted:[],heis:[],aa:0,roty:0,top1:0,top10:0,nat:0,conf:0,cfp:0,teams:[u.teamId]};return u.leg;}
function hofScore(){const L=leg();const c=U().career;return Math.round(L.nat*25+L.conf*6+L.cfp*4+L.top1*15+L.top10*5+L.roty*10+L.drafted.length*2+L.drafted.filter(d=>d.rd===1).length*4+L.heis.length*8+L.aa*1.5+U().lvl*1.5+c.length*1);}
function records(){const c=U().career;const L=leg();
  const best=c.slice().sort((a,b)=>a.rank-b.rank)[0];const most5=c.slice().sort((a,b)=>b.s5-a.s5)[0];
  const gem=L.drafted.filter(d=>d.stars<=3).sort((a,b)=>a.rd-b.rd||(b.hsRank||0)-(a.hsRank||0))[0];
  const al=(S.alumni||[]).filter(a=>a.stars>=5).sort((a,b)=>a.ovr-b.ovr)[0];
  return {best,most5,gem,bust:al,seasons:c.length};}
function retire(){const L=leg();const score=hofScore();const hof=score>=120;
  return {score,hof,title:dirTitle(U().lvl),seasons:U().career.length,L};}

// ---------- SAVES (compressed, 3 slots) ----------
const META_KEY="signingday_meta";
function slotKey(n){return "signingday_slot_"+n;}
async function gz(str){if(typeof CompressionStream==="undefined")return "J"+str;const cs=new CompressionStream("gzip");const w=cs.writable.getWriter();w.write(new TextEncoder().encode(str));w.close();
  const buf=new Uint8Array(await new Response(cs.readable).arrayBuffer());let s="";for(let i=0;i<buf.length;i+=0x8000)s+=String.fromCharCode.apply(null,buf.subarray(i,i+0x8000));return "G"+btoa(s);}
async function gunz(s){if(s[0]==="J")return s.slice(1);if(s[0]!=="G")return s;const bin=atob(s.slice(1));const buf=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)buf[i]=bin.charCodeAt(i);
  const ds=new DecompressionStream("gzip");const w=ds.writable.getWriter();w.write(buf);w.close();return await new Response(ds.readable).text();}
function getMeta(){try{return JSON.parse(localStorage.getItem(META_KEY))||{active:1,slots:{}};}catch(e){return {active:1,slots:{}};}}
function setMeta(m){try{localStorage.setItem(META_KEY,JSON.stringify(m));}catch(e){}}
function serialize(){return JSON.stringify(S,(k,v)=>{if(k[0]==="_"||k==="perc0")return undefined;if(v===null&&k&&isNaN(+k))return undefined;if(typeof v==="number"&&!Number.isInteger(v))return Math.round(v*100)/100;return v;});}
let _db=null;
function idb(){if(_db)return Promise.resolve(_db);return new Promise((res,rej)=>{try{if(typeof indexedDB==="undefined")return rej("noidb");const q=indexedDB.open("signingday",1);q.onupgradeneeded=()=>q.result.createObjectStore("slots");q.onsuccess=()=>{_db=q.result;res(_db);};q.onerror=()=>rej(q.error);}catch(e){rej(e);}});}
function idbPut(k,v){return idb().then(db=>new Promise((res,rej)=>{const tx=db.transaction("slots","readwrite");tx.objectStore("slots").put(v,k);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);}));}
function idbGet(k){return idb().then(db=>new Promise((res,rej)=>{const tx=db.transaction("slots","readonly");const q=tx.objectStore("slots").get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);}));}
function idbDel(k){return idb().then(db=>new Promise(res=>{const tx=db.transaction("slots","readwrite");tx.objectStore("slots").delete(k);tx.oncomplete=()=>res();tx.onerror=()=>res();})).catch(()=>{});}
let _saveSeq=0;
function save(){if(!S)return;const seq=++_saveSeq;const n=S.slot||1;let js;try{js=serialize();}catch(e){return;}
  const meta={school:UT().school,team:U().teamId,year:S.year,ph:phase().label,lvl:U().lvl,name:U().name,ts:Date.now()};
  gz(js).then(z=>{if(seq!==_saveSeq)return;meta.kb=Math.round(z.length/1024);
    return idbPut(slotKey(n),z).then(()=>{try{localStorage.removeItem(slotKey(n));}catch(e){}},()=>{localStorage.setItem(slotKey(n),z);});})
  .then(()=>{if(seq!==_saveSeq)return;const m=getMeta();m.active=n;m.slots[n]=meta;setMeta(m);S._saveErr=null;})
  .catch(e=>{S._saveErr=String(e);console.warn("save failed",e);});}
async function loadSlot(n){try{let z=null;try{z=await idbGet(slotKey(n));}catch(e){}if(!z)z=localStorage.getItem(slotKey(n));if(!z)return false;const js=await gunz(z);const o=JSON.parse(js);if(!o||o.v!==SAVE_VER)return false;S=o;S.slot=n;const m=getMeta();m.active=n;setMeta(m);return true;}catch(e){console.warn(e);return false;}}
function deleteSlot(n){idbDel(slotKey(n));try{localStorage.removeItem(slotKey(n));}catch(e){}const m=getMeta();delete m.slots[n];setMeta(m);}
function load(){return false;}

function scheduleOV(r,key){
  const uid=U().teamId;
  if(isDead())return {ok:false,msg:"Dead period — no visits can be booked this week."};
  if(r.cls!==S.classYear)return {ok:false,msg:"Official visits are for seniors. Try an unofficial visit."};
  if(!r.off.includes(uid))return {ok:false,msg:"Offer him first."};
  if(r.ovDone.includes(uid)||r.ov.length)return {ok:false,msg:"Already visited or scheduled."};
  if(r.ovDone.length>=5)return {ok:false,msg:"He has used all 5 official visits."};
  if(ovBooked(key)>=ovCap(key))return {ok:false,msg:"That weekend is full."};
  if(!canSpend(3))return {ok:false,msg:"Need 3 hours to plan the visit."};
  spend(3);r.ov.push(key);r.lastTouch=S.tick;
  r.log.unshift(`${phase().label}: Official visit scheduled (${key.startsWith("w")?"Week "+key.slice(1):S.cal.find(c=>c.key===key).label}).`);
  return {ok:true,msg:"Official visit booked!"};
}
function growPipe(r,hsAmt,stAmt){if(!r||r.portal)return;const m=hasPerk("n2")?2:1;const P=U().pipe;const terr=inTerritory(r.st)?1.5:1;
  if(r.hs){const b=P.hs[r.hs]||0;P.hs[r.hs]=clamp(b+hsAmt*m,0,100);if(b<45&&P.hs[r.hs]>=45){const h=hsById(r.hs);if(h)addNews(`🔗 Pipeline: your relationship with ${h.name} (Coach ${h.coach}) is now Strong.`,"user");}}
  const sb=P.st[r.st]||0;P.st[r.st]=clamp(sb+stAmt*m*terr,0,100);if(sb<45&&P.st[r.st]>=45)addNews(`🔗 State pipeline: you're now a Strong presence in ${STATE_NAMES[r.st]||r.st}.`,"user");}
