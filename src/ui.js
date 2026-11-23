// ===== UI =====
const $=s=>document.querySelector(s);
const ui={tab:"home",board:{st:"targets",pos:"ALL",stars:0,reg:"all",sort:"rank",q:"",n:40,cls:0},news:"mine",poll:"ap",conf:"SEC",scoreWk:null,team:"roster",cls:"mine",office:"dir"};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function lum(hex){const h=hex.replace("#","");const r=parseInt(h.substr(0,2),16)/255,g=parseInt(h.substr(2,2),16)/255,b=parseInt(h.substr(4,2),16)/255;return 0.299*r+0.587*g+0.114*b;}
function badge(id,big){if(id==="FCS")return `<span class="bdg fcs${big?" big":""}">FCS</span>`;const t=T(id);if(!t)return "";const fg=lum(t.c1)>0.6?"#111":"#fff";
  return `<span class="bdg${big?" big":""}" style="background:${t.c1};color:${fg};border-color:${t.c2}" data-team="${id}">${t.abbr}</span>`;}
function tname(id,withRank){if(id==="FCS")return "FCS";const t=T(id);return `<a class="tl" data-team="${id}">${withRank?rankStr(id,true):""}${esc(t.school)}</a>`;}
function stars(n){return `<span class="stars s${n}">${"★".repeat(n)}<span class="dim">${"★".repeat(5-n)}</span></span>`;}
function yrLabel(y){return ["","FR","SO","JR","SR","5th"][Math.min(5,y)]||"SR";}
function htStr(i){return Math.floor(i/12)+"'"+(i%12)+'"';}
function toast(msg,bad){const t=document.createElement("div");t.className="toast"+(bad?" bad":"");t.innerHTML=msg;document.body.appendChild(t);setTimeout(()=>t.classList.add("show"),10);setTimeout(()=>{t.classList.remove("show");setTimeout(()=>t.remove(),300);},3200);}
function recById(id){return findRec(id);}
function rec(r){return r;}
function pct(x){return Math.round(x*100)+"%";}
function rec1(n){return Math.round(n*10)/10;}
function trChips(p,showHidden){const tr=p.tr||[];const rv=tr.filter(x=>x.rev);const hid=tr.length-rv.length;
  return rv.map(x=>{const t=TRAITS[x.k];return `<span class="tch ${t.good>0?"good":t.good<0?"bad":"neu"}" title="${esc(t.d)}">${t.i} ${t.n}</span>`;}).join("")+(showHidden&&hid?`<span class="tch hid">❔ ${hid} unknown</span>`:"");}
function gpaVis(r){return !r.portal&&(r.sc>=20||r.gpaK||hasPerk("e2")||pipeHS(r)>=20);}
function isPipe(r){return !r.portal&&(pipeHS(r)>=20||pipeSt(r)>=40);}
function fitTag(b){return b===null||b===undefined?"":`<span class="fit f${b>=2?"g":b<=-2?"b":"n"}">${b>0?"+":""}${b}</span>`;}
function trIcons(p){return (p.tr||[]).filter(x=>x.rev).map(x=>TRAITS[x.k].i).join("");}
function momLabel(m){m=m||0;return m>=6?"🔥 Red hot":m>=3?"📈 Rising":m<=-6?"🧊 Ice cold":m<=-3?"📉 Sliding":"➖ Steady";}
function trend(cur,prev,fmt){if(prev===undefined)return "";const d=Math.round((cur-prev)*10)/10;return d?` <span class="${d>0?"up":"down"}">${d>0?"▲":"▼"}${fmt?fmt(Math.abs(d)):Math.abs(d)}</span>`:"";}

// ---------- SHELL ----------
function hex2rgb(h){h=h.replace("#","");return [0,2,4].map(i=>parseInt(h.substr(i,2),16));}
function rgb2hex(a){return "#"+a.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,"0")).join("");}
function mixc(a,b,t){const x=hex2rgb(a),y=hex2rgb(b);return rgb2hex(x.map((v,i)=>v+(y[i]-v)*t));}
function applyTheme(id){const root=document.documentElement.style;
  if(!id){["--acc","--acc2","--accInk","--bg","--bg2","--card","--line","--tint"].forEach(k=>root.removeProperty(k));document.querySelector('meta[name=theme-color]').content="#0b1220";return;}
  const t=T(id);const L1=lum(t.c1),L2=lum(t.c2);
  // button color: the school's main color unless it's nearly black/white, then its secondary
  let acc=(L1>=0.17&&L1<=0.9)?t.c1:(L2>=0.2&&L2<=0.9)?t.c2:t.c1;
  if(lum(acc)<0.17){let k2=0;while(lum(acc)<0.3&&k2<10){acc=mixc(acc,"#ffffff",0.12);k2++;}}
  let hi=acc;let k=0;while(lum(hi)<0.55&&k<14){hi=mixc(hi,"#ffffff",0.12);k++;}
  const dark=lum(t.c1)<0.5?t.c1:mixc(t.c1,"#000000",0.55);
  root.setProperty("--acc",acc);root.setProperty("--acc2",hi);root.setProperty("--accInk",lum(acc)>0.55?"#111111":"#ffffff");
  root.setProperty("--bg",mixc("#0a0f1c",dark,0.16));root.setProperty("--bg2",mixc("#101828",dark,0.16));root.setProperty("--card",mixc("#141d33",dark,0.14));root.setProperty("--line",mixc("#24304d",dark,0.22));root.setProperty("--tint",dark);
  document.querySelector('meta[name=theme-color]').content=mixc("#0a0f1c",dark,0.16);}
function render(){
  if(!S){applyTheme(null);renderNewGame();return;}
  applyTheme(U().teamId);
  document.body.classList.remove("ng");
  renderTop();renderTabs();
  const v=$("#view");
  const fn={home:vHome,board:vBoard,cls:vClass,team:vTeam,polls:vPolls,office:vOffice}[ui.tab];
  v.innerHTML=fn();bindCommon(v);
  if(ui.tab==="board")bindBoard();
}
function renderTop(){
  const t=UT();const p=phase();
  $("#top").innerHTML=`<div class="tb1">${badge(t.id)}<div class="ph"><b>${esc(p.label)}</b><span>${esc(p.date)}${["game","pre"].includes(p.type)?", "+S.year:""} · ${t.w}-${t.l}${t.apRank?" · #"+t.apRank:""}</span></div>
   <button id="adv" class="adv">Advance ▶</button></div>
   <div class="tb2"><span class="chip" title="Recruiting hours">⏱ ${U().hours}h</span><span class="chip" title="Head coach visits">🧢 HC ×${U().hc}</span><span class="chip ${budgetLeft()<0?"neg":""}" title="Player-comp budget left">💰 ${money(budgetLeft())}</span><span class="chip">★ ${targetCount()}/${targetCap()}</span><span class="chip lvl" id="lvlchip">⭐ Lv ${U().lvl}${U().pp?` · ${U().pp} perk${U().pp>1?"s":""}!`:""}</span><span class="chip">🏛️ ${Math.round(U().ad.pc)} PC</span></div>`;
  $("#adv").onclick=doAdvance;$("#lvlchip").onclick=()=>{ui.tab="office";ui.office="career";render();window.scrollTo(0,0);};
}
function renderTabs(){
  const tabs=[["home","🏠","Home"],["board",S.portalOpen?"🌀":"📋",S.portalOpen?"Portal":"Board"],["cls","✍️","Class"],["team","🏈","Team"],["polls","📊","Polls"],["office","🧑‍💼","Office"]];
  $("#tabs").innerHTML=tabs.map(([k,i,l])=>`<button class="${ui.tab===k?"on":""}" data-tab="${k}"><i>${i}</i>${l}</button>`).join("");
  $("#tabs").querySelectorAll("button").forEach(b=>b.onclick=()=>{ui.tab=b.dataset.tab;render();window.scrollTo(0,0);});
}
function bindCommon(root){
  root.querySelectorAll("[data-team]").forEach(e=>e.onclick=ev=>{ev.stopPropagation();openTeam(e.dataset.team);});
  root.querySelectorAll("[data-rid]").forEach(e=>e.onclick=ev=>{if(ev.target.closest(".star"))return;openRecruit(e.dataset.rid);});
  root.querySelectorAll(".star[data-tg]").forEach(e=>e.onclick=ev=>{ev.stopPropagation();const r=recById(e.dataset.tg);if(r.portal){toast("Portal players don't use the priority board — just work them fast.");return;}const res=toggleTarget(r);if(!res.ok)toast(res.msg,true);save();render();});
  root.querySelectorAll("[data-go]").forEach(e=>e.onclick=()=>{const [tab,sub]=e.dataset.go.split(":");ui.tab=tab;if(sub&&tab==="board")ui.board.st=sub;if(sub&&tab==="team")ui.team=sub;if(sub&&tab==="polls")ui.poll=sub;render();window.scrollTo(0,0);});
}

// ---------- ADVANCE FLOW ----------
function doAdvance(){
  const btn=$("#adv");btn.disabled=true;btn.textContent="Simulating…";
  setTimeout(()=>{
    let sum;try{sum=advance();}catch(e){console.error(e);toast("Sim error: "+e.message,true);btn.disabled=false;btn.textContent="Advance ▶";return;}
    render();showSummary(sum);
  },30);
}
function showSummary(sum){
  const ev=S.events[0];
  let h=`<h2>${esc(sum.title)}</h2>`;
  if(sum.my)h+=`<div class="big-res">${esc(sum.my)}</div>`;
  if(sum.lines.length)h+=`<ul class="sum">${sum.lines.map(l=>`<li>${esc(l)}</li>`).join("")}</ul>`;else h+=`<p class="muted">A quiet stretch. Your staff kept working the board.</p>`;
  const top=S.polls.ap.slice(0,5);
  if(["game","esp","ccg","sel","cfp"].includes(S.cal[Math.max(0,S.phaseIdx-1)]?.type)||phase().type==="game")h+=`<div class="mini-poll"><b>AP Top 5:</b> ${top.map((id,i)=>`${i+1}. ${esc(T(id).school)}`).join(" · ")}</div>`;
  h+=`<button class="btn pri wide" id="sumok">Continue</button>`;
  openSheet(h,"sum");
  $("#sumok").onclick=()=>{closeSheet();afterSummary(sum);};
}
function afterSummary(sum){
  if(S.ceremonies.length){showCeremony(()=>afterSummary(sum));return;}
  if(S.pendingJob){showPendingJob(()=>afterSummary(sum));return;}
  if(sum.fired){showFired(sum);return;}
  if(sum.offers&&sum.offers.length){const o=sum.offers;sum.offers=null;showOffers(o,()=>afterSummary(sum));return;}
  if(S.events.length){showEvent();return;}
}
function showCeremony(next){
  const c=S.ceremonies.shift();save();const r=S.recruits.find(x=>x.id===c.rid);if(!r){next();return;}
  const h=`<div class="cer"><div class="cer-k">📢 DECISION DAY</div><h2>${stars(r.stars)} ${r.pos} ${esc(rName(r))}</h2><div class="muted">#${r.rank} nationally · ${esc(r.city)}, ${r.st}</div>
   <div class="hats">${c.hats.map(id=>`<div class="hat" data-h="${id}">${badge(id,true)}<span>${esc(T(id).school)}</span></div>`).join("")}</div>
   <div id="cermsg" class="cer-msg">He reaches under the table…</div><button class="btn pri wide" id="cerok" disabled>…</button></div>`;
  openSheet(h,"cer");
  const hats=[...document.querySelectorAll(".hat")];let k=0;
  const iv=setInterval(()=>{hats.forEach(x=>x.classList.remove("lit"));hats[k%hats.length].classList.add("lit");k++;},220);
  setTimeout(()=>{clearInterval(iv);hats.forEach(x=>{x.classList.remove("lit");if(x.dataset.h===c.pick)x.classList.add("win");else x.classList.add("lose");});
    const mine=c.pick===U().teamId;$("#cermsg").innerHTML=mine?`🎉 He puts on the ${esc(UT().school)} hat! 🎉`:`He picks ${esc(T(c.pick).school)}. ${["Tough one.","On to the next.","The tape doesn't lie… but neither does NIL."][rint(0,2)]}`;
    $("#cerok").disabled=false;$("#cerok").textContent="Continue";},2300);
  $("#cerok").onclick=()=>{closeSheet();next();};
}
function showPendingJob(next){
  const j=S.pendingJob;const t=UT();let h="";
  const done=()=>{S.pendingJob=null;save();closeSheet();render();next();};
  if(j.type==="follow"){const to=T(j.to);
    h=`<h2>🧳 ${esc(j.coach)} is leaving</h2><p><b>${esc(to.school)}</b> just hired ${j.role?"your "+esc(j.role):"your head coach"}${j.role?" as its head coach":""}. He wants you to come with him and run recruiting there.</p>
     <div class="card in"><div class="grid4"><div class="stat"><b>${Math.round(to.prestige)}</b><span>Prestige</span></div><div class="stat"><b>${to.nil.toFixed(1)}</b><span>NIL power</span></div><div class="stat"><b>${Math.round(to.fac)}</b><span>Facilities</span></div><div class="stat"><b>${to.w}-${to.l}</b><span>Record</span></div></div>
     <p class="small muted">${j.role?`Stay and keep working for ${esc(j.newCoach)}.`:`Stay and ${esc(t.school)} promotes ${esc(j.newCoach)}.`} Follow and some of your commits who signed up for Coach may follow too — the rest stay behind.</p></div>
     <div class="col"><button class="btn pri" id="pjA">Follow ${esc(j.coach)} to ${esc(to.school)}</button><button class="btn" id="pjB">Stay at ${esc(t.school)} with ${esc(j.newCoach)}</button></div>`;
    openSheet(h,"job");
    $("#pjA").onclick=()=>{const n=followCoach(j.to);setGoals();toast(`Welcome to ${esc(to.school)}!${n?` ${n} recruit${n>1?"s":""} reopened to follow you.`:""}`);done();};
    $("#pjB").onclick=()=>{U().sec=clamp(U().sec+6,0,100);U().rep=clamp(U().rep+1,0,100);addNews(`🤝 You stay at ${t.school}. The AD appreciates the loyalty (+security).`,"user");done();};
    return;}
  if(j.type==="fired"){
    if(j.kept){h=`<h2>🎠 ${esc(j.old)} was fired</h2><p>New head coach <b>${esc(j.coach)}</b> has met with you — and wants you to stay on as Director of Recruiting.</p><div class="col"><button class="btn pri" id="pjA">Stay and work for ${esc(j.coach)}</button><button class="btn" id="pjB">Test the job market</button></div>`;
      openSheet(h,"job");$("#pjA").onclick=()=>{U().sec=clamp(U().sec+4,0,100);done();};
      $("#pjB").onclick=()=>{const o=marketOffers(3,UT().prestige+8);S.pendingJob=null;closeSheet();showOffers(o,next,true);};return;}
    const o=marketOffers(3,UT().prestige);
    h=`<h2>📉 Clean sweep</h2><p>${esc(j.old)} was fired, and new coach <b>${esc(j.coach)}</b> is bringing in his own recruiting director. You're out at ${esc(t.school)}.</p><p class="small muted">Your reputation (${Math.round(U().rep)}) decides who calls.</p>
     <div class="col">${o.map(id=>`<button class="btn" data-job="${id}">${badge(id)} ${esc(T(id).school)} — HC ${esc(T(id).coach.name)} · Prestige ${Math.round(T(id).prestige)}</button>`).join("")}<button class="btn" id="pjN">Start a new career</button></div>`;
    openSheet(h,"job");
    document.querySelectorAll("[data-job]").forEach(b=>b.onclick=()=>{takeJob(b.dataset.job);setGoals();toast(`You're the new recruiting director at ${T(b.dataset.job).school}.`);done();});
    $("#pjN").onclick=()=>{deleteSlot(S.slot);S=null;closeSheet();render();};return;}
  if(j.type==="nfl"){h=`<h2>🏈 ${esc(j.old)} heads to the NFL</h2><p>${esc(t.school)} hired <b>${esc(j.coach)}</b>, and he's keeping you on.</p><button class="btn pri wide" id="pjA">Back to work</button>`;openSheet(h,"job");$("#pjA").onclick=done;return;}
  done();
}
function showEvent(){
  const e=S.events[0];if(!e)return;
  openSheet(`<h2>${esc(e.title)}</h2><p>${esc(e.text)}</p><div class="col">${e.opts.map(o=>`<button class="btn" data-ch="${o[1]}">${esc(o[0])}</button>`).join("")}</div>`,"ev");
  document.querySelectorAll("[data-ch]").forEach(b=>b.onclick=()=>{const m=resolveEvent(b.dataset.ch);save();closeSheet();render();if(m)toast(m);});
}
function showOffers(ids,next,kept){
  openSheet(`<h2>📞 Job offers</h2><p>Your work hasn't gone unnoticed. These programs want you as their Director of Recruiting. Taking a job means a new roster, new budget, and a new board.</p>
   <div class="col">${ids.map(id=>`<button class="btn" data-job="${id}">${badge(id)} ${esc(T(id).school)} — HC ${esc(T(id).coach.name)} · Prestige ${T(id).prestige}</button>`).join("")}<button class="btn pri" id="stay">${kept?"Never mind — stay with the new staff":"Stay at "+esc(UT().school)}</button></div>`,"job");
  document.querySelectorAll("[data-job]").forEach(b=>b.onclick=()=>{takeJob(b.dataset.job);setGoals();save();closeSheet();render();toast(`Welcome to ${T(b.dataset.job).school}!`);next();});
  $("#stay").onclick=()=>{closeSheet();U().rep=clamp(U().rep+1,0,100);next();};
}
function showFired(sum){
  const t=UT();const alt=S.teamIds.filter(id=>T(id).prestige<t.prestige-5).sort(()=>Math.random()-0.5).slice(0,3);
  openSheet(`<h2>📉 You've been let go</h2><p>The AD at ${esc(t.school)} has decided to go in a different direction. A few lower-profile programs are interested.</p>
   <div class="col">${alt.map(id=>`<button class="btn" data-job="${id}">${badge(id)} ${esc(T(id).school)}</button>`).join("")}<button class="btn" id="ngf">Start a new career</button></div>`,"fired");
  document.querySelectorAll("[data-job]").forEach(b=>b.onclick=()=>{takeJob(b.dataset.job);U().rep=clamp(U().rep-5,0,100);setGoals();save();closeSheet();render();});
  $("#ngf").onclick=()=>{deleteSlot(S.slot);S=null;closeSheet();render();};
}

// ---------- SHEET ----------
function openSheet(html,cls){const s=$("#sheet");s.className="sheet open "+(cls||"");$("#sheetBody").innerHTML=html;bindCommon($("#sheetBody"));document.body.classList.add("noscroll");s.scrollTop=0;$("#sheetBody").scrollTop=0;}
function closeSheet(){$("#sheet").className="sheet";document.body.classList.remove("noscroll");}

// ---------- HOME ----------
function vHome(){
  const t=UT();const p=phase();let h="";
  // this week card
  h+=`<div class="card hero" style="--c1:${t.c1}">`;
  if(p.type==="game"||p.type==="pre"){
    const wk=p.type==="pre"?0:p.week;const g=userGame(wk);
    if(p.type==="pre")h+=`<div class="k">Preseason</div><div class="hl">${t.apRank?"AP #"+t.apRank:"Unranked"} · Team OVR ${teamOVR(S.roster)}</div><p>Prestige ${Math.round(t.prestige)}${trend(t.prestige,t.prev&&t.prev.prestige)} · NIL power ${t.nil.toFixed(1)}${trend(t.nil,t.prev&&t.prev.nil)} · Facilities ${Math.round(t.fac)}${trend(t.fac,t.prev&&t.prev.fac)}</p><p>Fall camp is open. Get official visits locked in for home games — wins on visit weekends supercharge them.</p>`;
    if(g&&p.type==="game"){const L=gameLine(g,t.id);const rv=L.opp!=="FCS"&&isRival(t.id,L.opp);h+=`<div class="k">${rv?"⚔️ RIVALRY GAME · ":""}${esc(p.label)} · ${esc(p.date)}</div><div class="hl">${L.home?"vs":"at"} ${L.opp==="FCS"?esc(L.oname):badge(L.opp)+" "+tname(L.opp,true)} ${L.opp!=="FCS"?`<span class="muted">(${T(L.opp).w}-${T(L.opp).l})</span>`:""}</div>`;
      if(L.home){const vis=S.recruits.filter(r=>r.ov.includes(p.key));h+=`<p>🏟️ Official visitors this weekend: ${vis.length?vis.map(r=>`<a data-rid="${r.id}">${esc(rName(r))}</a>`).join(", "):"none booked"}.</p>`;}}
    else if(p.type==="game")h+=`<div class="k">${esc(p.label)}</div><div class="hl">Bye week</div><p>No game — a good week for living-room visits.</p>`;
  }else{
    const tips={camp:"Camp season. Work the regional camps and the national showcase to scout dozens of prospects at once, or host your own camp. Testing numbers move the rankings when camp season ends.",allstar:"All-American Bowl week. Uncommitted stars announce on national TV — and practices are a scouting goldmine.",esp:"Early Signing Period: committed recruits sign their papers. Lock up wobblers now — most commits will sign this week.",ccg:"Championship weekend. Conference title games decide automatic bids.",sel:"Selection Sunday and the coaching carousel. Watch for openings that shake loose commits.",cfp:"Playoff time. Recruiting is in a quieter stretch, but CFP wins boost every target's interest.",portal:"The transfer portal is open. Veterans commit FAST — offer, call, and put NIL on the table immediately.",nsd:"National Signing Day. Every unsigned recruit makes his decision this week.",off:"Offseason recruiting for next year's class. Junior Days and spring visits build the foundation; June official visits are the main event.",ov:"Official visit weekend. Booked visitors take their trips at the end of this week."};
    h+=`<div class="k">${esc(p.date)}</div><div class="hl">${esc(p.label)}</div><p>${tips[p.type]||""}</p>`;
    if(p.dead)h+=`<p>🔕 <b>Dead period:</b> no in-person contact (visits, evals, HC visits). Calls, pitches and NIL only.</p>`;
    if(p.type==="ov"){const vis=S.recruits.filter(r=>r.ov.includes(p.key));h+=`<p>🏟️ Visitors booked: ${vis.length?vis.map(r=>`<a data-rid="${r.id}">${esc(rName(r))}</a>`).join(", "):"none yet"} (${vis.length}/${ovCap(p.key)}).</p>`;}
  }
  h+=`<div class="momline">${momLabel(t.mom)} · Prestige ${Math.round(t.prestige)} · NIL ${t.nil.toFixed(1)}/10</div></div>`;
  if(p.type==="camp"&&S.camps){h+=`<div class="card"><div class="ch">🏕️ Camp circuit <span class="muted small">⏱ ${U().hours}h left</span></div>${S.camps.map(c=>`<div class="upg"><div><b>${esc(c.n)}</b><div class="small muted">${c.att.length} prospects${c.nat?" · top seniors & elite juniors":" · "+c.sts.slice(0,5).join(", ")+(c.sts.length>5?"…":"")}</div></div><button class="btn sm ${c.done?"":"pri"}" data-camp="${c.id}" ${c.done||U().hours<6?"disabled":""}>${c.done?"Worked":"Attend (6h)"}</button></div>`).join("")}
    <div class="upg"><div><b>Host the ${esc(t.school)} camp</b><div class="small muted">Nearby & pipeline prospects come to you: scouting + interest + pipelines</div></div><button class="btn sm ${S.campHost?"":"pri"}" id="hostcamp" ${S.campHost||U().hours<8?"disabled":""}>${S.campHost?"Hosted":"Host (8h)"}</button></div></div>`;}
  if(p.key==="allstar")h+=`<div class="card"><div class="ch">🎙️ All-American Bowl</div><p class="small">The nation's top 100 seniors are in town. Uncommitted stars may announce on TV this week.</p><button class="btn wide ${S.allstar&&S.allstar.done?"":"pri"}" id="asscout" ${U().hours<5||(S.allstar&&S.allstar.done)?"disabled":""}>Scout practices (5h)</button></div>`;
  if(S.retention&&S.retention.length)h+=`<div class="card warn" data-go="team:roster">⚠️ <b>${S.retention.length} players</b> are weighing the transfer portal. Coach wants your recommendations.</div>`;
  if(U().pp>0)h+=`<div class="card warn" id="ppbtn">⭐ <b>${U().pp} perk point${U().pp>1?"s":""}</b> to spend — you're a Lv ${U().lvl} ${esc(dirTitle(U().lvl))}. Tap to open your career tree.</div>`;
  if(S.events.length)h+=`<div class="card warn" id="evbtn">📬 <b>${esc(S.events[0].title)}</b> — decision needed.</div>`;
  // class snapshot
  const cr=classRankings();const rk=cr.findIndex(x=>x.id===t.id)+1;const mine=S.recruits.filter(r=>r.com===t.id&&r.cls===S.classYear);
  h+=`<div class="grid3"><div class="stat" data-go="cls"><b>#${rk}</b><span>Class rank</span></div><div class="stat" data-go="cls"><b>${mine.length}</b><span>Commits</span></div><div class="stat" data-go="board:targets"><b>${targetCount()}</b><span>Priority targets</span></div></div>`;
  // hottest battles
  const battles=S.recruits.filter(r=>S.user.targets[r.id]&&!r.com).map(r=>({r,s:userStanding(r)})).sort((a,b)=>a.r.rank-b.r.rank).slice(0,5);
  if(battles.length)h+=`<div class="card"><div class="ch">🎯 Top battles</div>${battles.map(({r,s})=>recRow(r,true)).join("")}<button class="btn wide" data-go="board:targets">Open priority board</button></div>`;
  // heisman watch
  if(S.heisman&&S.heisman.length&&p.type==="game")h+=`<div class="card" data-go="polls:heis"><div class="ch">🏆 Heisman watch</div>${S.heisman.slice(0,3).map((x,i)=>`<div class="lg ${x.id===t.id?"me":""}">${i+1}. ${x.pos} ${esc(x.n)} · ${badge(x.id)} <span class="muted">${esc(x.line)}</span></div>`).join("")}</div>`;
  // goals
  h+=`<div class="card"><div class="ch">🧑‍💼 AD goals — Class of ${S.classYear}</div>${goalStatus().map(g=>`<div class="goal ${g.ok?"ok":""}"><span>${g.ok?"✅":"⬜"} ${esc(g.label)}</span><b>${esc(String(g.cur))}</b></div>`).join("")}</div>`;
  // news
  const f=ui.news;const items=S.news.filter(n=>f==="all"||(f==="mine"?n.type==="user":f==="rec"?["commit","flip","rank"].includes(n.type):f==="games"?n.type==="game":n.type==="coach"||n.type==="portal")).slice(0,60);
  h+=`<div class="card"><div class="ch">📰 Newswire</div><div class="chips">${[["mine","My program"],["feed","📱 Feed"],["rec","Recruiting"],["games","Games"],["coach","Carousel/Portal"],["all","All"]].map(([k,l])=>`<button class="cp ${f===k?"on":""}" data-news="${k}">${l}</button>`).join("")}</div>
   <div class="news">${f==="feed"?((S.feed||[]).slice(0,60).map(x=>`<div class="ni fd" data-rid="${x.rid}"><span class="nph">${esc(x.ph)} · ${x.st}★ ${esc(x.n)}</span>${esc(x.t)}</div>`).join("")||"<p class='muted'>Quiet on social media.</p>"):items.length?items.map(n=>`<div class="ni"><span class="nph">${esc(n.ph)}</span>${esc(n.t)}</div>`).join(""):"<p class='muted'>Nothing yet.</p>"}</div></div>`;
  setTimeout(()=>{document.querySelectorAll("[data-news]").forEach(b=>b.onclick=()=>{ui.news=b.dataset.news;render();});const eb=$("#evbtn");if(eb)eb.onclick=showEvent;const pb=$("#ppbtn");if(pb)pb.onclick=()=>{ui.tab="office";ui.office="career";render();window.scrollTo(0,0);};
    document.querySelectorAll("[data-camp]").forEach(b=>b.onclick=()=>{const res=attendCamp(+b.dataset.camp);save();render();toast(res.msg,!res.ok);});
    const hc=$("#hostcamp");if(hc)hc.onclick=()=>{const res=hostCamp();save();render();toast(res.msg,!res.ok);};
    const as=$("#asscout");if(as)as.onclick=()=>{const res=scoutAllStar();save();render();toast(res.msg,!res.ok);};
    document.querySelectorAll(".fd[data-rid]").forEach(e=>e.onclick=()=>openRecruit(e.dataset.rid));},0);
  return h;
}

// ---------- BOARD ----------
function recRow(r,compact){
  const uid=U().teamId;const s=r.portal?null:userStanding(r);const tg=!!S.user.targets[r.id];
  const ts=topSchools(r,3);
  let status;
  if(r.com){status=`<span class="st ${r.com===uid?"me":"oth"}">${r.signed?"✍️":"🔒"} ${T(r.com).abbr}</span>`;}
  else{const us=r.portal?portalStanding(r):s;status=`<span class="st ${us.i===0?"lead":us.i>0&&us.i<3?"top3":""}">${us.label}${us.p?" "+pct(us.p):""}</span>`;}
  const sc=r.sc>0?`<i class="scb" style="width:${r.sc}%"></i>`:"";
  const sv=r.sc>=50?scoutView(r):null;const gem=sv&&sv.gem?"💎":sv&&sv.bust?"⚠️":"";
  const left=r.portal?`<div class="rk">${r.tOvr>=0&&r.sc>=40?r.tOvr:"~"+(Math.round(r.tOvr/3)*3)}<small>OVR</small></div>`:`<div class="rk">${r.rank}<small>${r.stars}★</small></div>`;
  const sub=r.portal?`${r.pos} · ex-${esc(T(r.from)?T(r.from).abbr:"?")} · ${r.yrs}yr · ask ${money(r.nil)}`:`${r.cls!==S.classYear?"<b>"+clsLabel(r)+"</b> · ":""}${r.pos} · ${esc(r.city)}, ${r.st}${r.tag==="lb"&&r.sc>=90?" · 📈":""}`;
  return `<div class="rrow" data-rid="${r.id}">${r.portal?"":`<span class="star ${tg?"on":""}" data-tg="${r.id}">${tg?"★":"☆"}</span>`}${left}
   <div class="rmid"><div class="rn">${gem}${esc(rName(r))} ${r.portal?stars(r.stars):""}<span class="tic">${(()=>{const fv=fitView(r);return fv.fit!==null&&fv.fit!==undefined&&Math.abs(fv.fit)>=3?(fv.fit>0?"🧩":"🧩❌"):"";})()}${isPipe(r)?"🔗":""}${gpaVis(r)&&admitIssue(r,U().teamId)?"🎓⚠️":""}${trIcons(r)}</span>${r.flag==="up"?' <span class="up">▲</span>':r.flag==="down"?' <span class="down">▼</span>':""}${r.stale&&r.sc<75?' <span class="muted" title="Eval out of date">🔄</span>':""}</div><div class="rs">${sub}</div><div class="scw">${sc}</div></div>
   <div class="rright"><div class="tops">${ts.map(x=>badge(x.id)).join("")}</div>${status}</div></div>`;
}
function portalStanding(r){const uid=U().teamId;const ts=topSchools(r,10);const i=ts.findIndex(x=>x.id===uid);if(i<0)return {i:-1,label:r.off.includes(uid)?"—":"Not offered",p:0};return {i,p:ts[i].p,label:i===0?"Leader":i<3?"Top 3":"In it"};}
function boardList(){
  const b=ui.board;const uid=U().teamId;const t=UT();
  let list=S.portalOpen?S.portal.slice():S.recruits.filter(r=>b.cls==="all"||r.cls===S.classYear+b.cls);
  const q=b.q.trim().toLowerCase();
  list=list.filter(r=>{
    if(q&&!(rName(r).toLowerCase().includes(q)||r.city.toLowerCase().includes(q)||r.st.toLowerCase()===q||(r.hs&&hsById(r.hs)&&hsById(r.hs).name.toLowerCase().includes(q))))return false;
    if(b.pos!=="ALL"&&r.pos!==b.pos)return false;
    if(b.stars&&r.stars!==b.stars)return false;
    if(b.reg==="state"&&r.st!==t.st)return false;
    if(b.reg==="near"&&miles(t.lat,t.lon,r.lat,r.lon)>500)return false;
    switch(b.st){
      case "targets":return S.portalOpen?r.off.includes(uid):!!S.user.targets[r.id];
      case "offered":return r.off.includes(uid);
      case "open":return !r.com;
      case "mine":return r.com===uid;
      case "gems":{if(r.sc<50)return false;const sv=scoutView(r);return sv.gem;}
      case "pipe":return isPipe(r);
      case "fits":{const fv=fitView(r);return fv.fit!==null&&fv.fit>=2;}
      case "fit":return !r.com&&recruitLevel(r)<=teamLevel(t)+4&&recruitLevel(r)>=teamLevel(t)-14;
    }
    return true;});
  const key={rank:r=>r.portal?-r.tOvr:r.rank,int:r=>-(r.int[uid]||0),sc:r=>-r.sc,near:r=>miles(t.lat,t.lon,r.lat,r.lon)}[b.sort]||(r=>r.rank);
  list.sort((a,c)=>key(a)-key(c));
  return list;
}
function vBoard(){
  const b=ui.board;const P=S.portalOpen;
  if(P&&!b.wasP){b.st="open";b.sort="rank";}if(!P&&b.wasP){b.st="targets";}b.wasP=P;
  if(P&&!["open","targets","all","mine"].includes(b.st))b.st="open";
  const list=boardList();
  const sts=P?[["open","Available"],["targets","My offers"],["all","All"],["mine","Signed"]]:[["targets","★ Priority"],["fit","Best fits"],["fits","🧩 Scheme fits"],["pipe","🔗 Pipelines"],["offered","Offered"],["open","Uncommitted"],["gems","💎 Gems"],["mine","Committed"],["all","All"]];
  let h=`<div class="card filt">${P?`<div class="ptl">🌀 <b>Transfer Portal</b> — ${S.portal.filter(r=>!r.com).length} available. They commit within days; NIL talks loudest here.</div>`:""}
   ${P?"":`<div class="chips seg">${[[0,"Class of "+S.classYear+" (Sr)"],[1,(S.classYear+1)+" (Jr)"],[2,(S.classYear+2)+" (So)"],["all","All"]].map(([k,l])=>`<button class="cp ${b.cls===k?"on":""}" data-bcls="${k}">${l}</button>`).join("")}</div>`}
   <input id="bq" placeholder="Search name, city, state (TX) or high school…" value="${esc(b.q)}">
   <div class="chips">${sts.map(([k,l])=>`<button class="cp ${b.st===k?"on":""}" data-bst="${k}">${l}</button>`).join("")}</div>
   <div class="sels"><select id="bpos"><option value="ALL">All pos</option>${POSITIONS.map(p=>`<option ${b.pos===p?"selected":""}>${p}</option>`).join("")}</select>
   <select id="bstar"><option value="0">All ★</option>${[5,4,3,2].map(n=>`<option value="${n}" ${b.stars===n?"selected":""}>${n}★</option>`).join("")}</select>
   <select id="breg"><option value="all">Nationwide</option><option value="near" ${b.reg==="near"?"selected":""}>≤500 mi</option><option value="state" ${b.reg==="state"?"selected":""}>In-state</option></select>
   <select id="bsort"><option value="rank">Sort: ${P?"OVR":"Rank"}</option><option value="int" ${b.sort==="int"?"selected":""}>My interest</option><option value="sc" ${b.sort==="sc"?"selected":""}>Scouted</option><option value="near" ${b.sort==="near"?"selected":""}>Distance</option></select></div></div>`;
  h+=`<div class="muted small pad">${list.length} players${!P&&b.st==="targets"?` · Priority targets get full-time staff attention every week`:""}${!P&&b.cls!==0&&b.cls!=="all"?` · Underclassmen decide as seniors, but early offers build relationships that carry over`:""}</div>`;
  h+=`<div class="list">${list.slice(0,b.n).map(r=>recRow(r)).join("")||(P?"<p class='muted pad'>Nobody here. Try “Available”.</p>":"<p class='muted pad'>Nobody here yet. Try “Best fits” and tap ☆ to add priority targets.</p>")}</div>`;
  if(list.length>b.n)h+=`<button class="btn wide" id="bmore">Show more (${list.length-b.n})</button>`;
  return h;
}
function bindBoard(){
  const b=ui.board;
  document.querySelectorAll("[data-bst]").forEach(e=>e.onclick=()=>{b.st=e.dataset.bst;b.n=40;render();});
  document.querySelectorAll("[data-bcls]").forEach(e=>e.onclick=()=>{const v=e.dataset.bcls;b.cls=v==="all"?"all":+v;b.n=40;render();});
  $("#bpos").onchange=e=>{b.pos=e.target.value;b.n=40;render();};
  $("#bstar").onchange=e=>{b.stars=+e.target.value;b.n=40;render();};
  $("#breg").onchange=e=>{b.reg=e.target.value;render();};
  $("#bsort").onchange=e=>{b.sort=e.target.value;render();};
  let to;$("#bq").oninput=e=>{clearTimeout(to);to=setTimeout(()=>{b.q=e.target.value;b.n=40;render();const i=$("#bq");i.focus();i.setSelectionRange(i.value.length,i.value.length);},350);};
  const m=$("#bmore");if(m)m.onclick=()=>{b.n+=40;render();};
}

// ---------- RECRUIT SHEET ----------
function openRecruit(id){const r=recById(id);if(!r)return;openSheet(recruitHTML(r),"rec");bindRecruit(r);}
function gradeL(v){return letter(clamp(v,0,100));}
function recruitHTML(r){
  const uid=U().teamId;const t=UT();const sv=scoutView(r);const P=!!r.portal;
  let h=`<div class="rh"><div><h2>${esc(rName(r))}</h2><div class="rsub">${r.pos} · ${stars(r.stars)} ${P?`· Transfer from ${tname(r.from)} · ${r.yrs} yr${r.yrs>1?"s":""} left`:`· Composite #${r.rank} · #${r.pr} ${r.pos} · ${r.comp.toFixed(4)}`}</div>
    ${P?"":`<div class="svc"><span><b>${SERVICES.A}</b> ${stars(r.stA||r.stars)} #${r.rkA||"—"}</span><span><b>${SERVICES.B}</b> ${stars(r.stB||r.stars)} #${r.rkB||"—"}</span></div>`}
    <div class="rsub">${P?"":esc(r.city)+", "+r.st+" · Class of "+r.cls+" ("+clsLabel(r)+") · "}${htStr(r.ht)}, ${r.wt} lbs · ${r.forty}s 40${r.fortyV?" ✅ verified":""}</div></div>
    ${P?"":`<span class="star big ${S.user.targets[r.id]?"on":""}" data-tg="${r.id}">${S.user.targets[r.id]?"★":"☆"}</span>`}</div>`;
  // status
  let st="";
  if(r.com){st=`${r.signed?"✍️ Signed with":"🔒 Committed to"} ${badge(r.com)} ${tname(r.com)}${!r.signed&&r.com?(r.hard?" (solid — took an OV)":" (soft — flippable)"):""}`;}
  else{const cb=crystalBall(r);const dl=P?"Portal players decide within days":decLabel(r);st=`⏳ Decision: <b>${esc(dl||"")}</b>${cb?` · 🔮 Crystal Ball: ${badge(cb.id)} ${cb.conf}%`:""}`;}
  h+=`<div class="rstatus">${st}</div>`;
  if(!P){const hs=hsById(r.hs);const ph=pipeHS(r),ps=pipeSt(r);const ai=admitIssue(r,U().teamId);
    h+=`<div class="rinfo">${hs?`🏫 <b>${esc(hs.name)}</b> · Coach ${esc(hs.coach)}<br>🔗 School pipeline: <b>${pipeLabel(ph)}</b>${ph?" ("+Math.round(ph)+")":""} · ${esc(STATE_NAMES[r.st]||r.st)}: <b>${pipeLabel(ps)}</b>${ps?" ("+Math.round(ps)+")":""}${ph>=20||ps>=40?` · <span class="up">+${Math.round((pipeMult(r)-1)*100)}% recruiting pull</span>`:""}<br>`:""}
     ${r.han?(r.hanK?`🕴️ Handler: <b>${esc(r.han.n)}</b> (his ${esc(r.han.k)}) — expect NIL demands<br>`:""):""}${r.par&&r.parK?`👪 ${esc(PARENT_KINDS[r.par])}<br>`:""}
     🎓 ${gpaVis(r)?`GPA <b>${r.gpa.toFixed(2)}</b> · ${ai?`<span class="down">⚠️ ${esc(ai)} — needs a waiver (${waiversLeft()} left)</span>`:`<span class="up">Meets your ${U().ad.tier} standard</span>`}`:`Transcript unknown — scout him or call to find out`}</div>`;}
  // scouting
  h+=`<div class="card in"><div class="ch">🔎 Scouting report <span class="muted small">${r.sc}% complete</span></div><div class="scbar"><i style="width:${r.sc}%"></i></div>
   <div class="grid4"><div class="stat"><b>${sv.ovr}</b><span>Current</span></div><div class="stat"><b>${sv.pot}</b><span>Ceiling</span></div><div class="stat"><b>${sv.we}</b><span>Work ethic</span></div><div class="stat"><b>${sv.chr}</b><span>Character</span></div></div>
   ${hsDevHTML(r)}
   ${sv.gem?`<div class="flag gem">💎 Your staff believes he's badly underrated by the services.</div>`:""}${sv.bust?`<div class="flag bust">⚠️ Staff thinks the services are overrating him.</div>`:""}${sv.chrFlag?`<div class="flag bust">🚩 Character concerns in background checks.</div>`:""}
   ${(()=>{if(r.pos==="K")return "";const fv=fitView(r);const sch=OFF_POS.includes(r.pos)?t.off:t.def;
     let s=`<div class="fitbox"><div>🧩 Play style: <b>${esc(fv.arch)}</b>${fv.arch!=="?"&&!fv.archSure?" <span class='muted small'>(staff unsure)</span>":""}${fv.listed&&!P?` <span class="muted small">· services list: ${esc(fv.listed)}</span>`:""}</div>`;
     s+=fv.fit!==null&&fv.fit!==undefined?`<div>Fit in your ${esc(sch)}: <b class="mg g${fitLetter(fv.fit)[0]}" style="padding:1px 6px">${fitLetter(fv.fit)}</b> ${fitTag(fv.fit)} <span class="muted small">effective ${r.portal?"OVR":"ceiling"} ${fv.fit>0?"boost":fv.fit<0?"penalty":"neutral"}</span></div>`:`<div class="muted small">Fit in your ${esc(sch)}: scout to 70% to know</div>`;
     if(fv.table)s+=`<div class="fittab">${fv.table.map(x=>`<span class="${x.s===sch?"cur":""}">${esc(x.s)} ${fitTag(x.b)}</span>`).join("")}</div>`;else s+=`<div class="muted small">Full scheme profile at 90% scouting.</div>`;
     return s+`</div>`;})()}
   ${P?"":`<div class="small muted">🏈 Senior year: ${esc(statLine(r))}</div>`}</div>`;
  // traits
  if((r.tr||[]).length)h+=`<div class="card in"><div class="ch">🧬 Traits <span class="muted small">revealed by film, evals, visits & conversations</span></div><div class="tchs">${trChips(r,true)}</div>${(r.tr||[]).filter(x=>x.rev).map(x=>`<div class="small muted">${TRAITS[x.k].i} ${esc(TRAITS[x.k].d)}</div>`).join("")}</div>`;
  // motivations + your grades
  h+=`<div class="card in"><div class="ch">💭 What matters to him <span class="muted small">· your program's grade</span></div><div class="mots">${MOTIVES.map((m,i)=>{const k=r.known&(1<<i);const w=r.mot[i];const g=grade(t,r,m[0]);
    const extra=k?(m[0]==="legacy"&&r.leg?` <span class="small muted">(${esc(T(r.leg).school)})</span>`:m[0]==="life"?` <span class="small muted">(${r.lifeP==="warm"?"wants warm weather":r.lifeP==="cold"?"doesn't mind the cold":"anywhere's fine"})</span>`:m[0]==="scheme"&&r.fitP?` <span class="small muted">(${esc(r.fitP)} · you run ${esc(["QB","RB","WR","TE","OL"].includes(r.pos)?t.off:t.def)})</span>`:""):"";
    return `<div class="mot"><span class="mn">${m[1]}${extra}</span><span class="mw">${k?`<i style="width:${Math.min(100,w*300)}%"></i>`:"<em>???</em>"}</span><span class="mg g${gradeL(g)[0]}">${m[0]==="nil"&&!r.nilO?"—":gradeL(g)}</span></div>`;}).join("")}</div>
   <div class="small muted">Calls and visits reveal priorities. Pitch the ones he cares about AND where your grade is strong.</div></div>`;
  // recruitment
  const ts=topSchools(r,6);const offN=r.off.length;
  h+=`<div class="card in"><div class="ch">📈 Recruitment <span class="muted small">${offN} offers</span></div>${ts.map(x=>`<div class="ib ${x.id===uid?"me":""}">${badge(x.id)}<span class="ibn">${esc(T(x.id).school)}</span><span class="ibb"><i style="width:${Math.round(x.p*100)}%;background:${T(x.id).c1}"></i></span><b>${pct(x.p)}</b></div>`).join("")}
   ${!r.off.includes(uid)?`<div class="small muted">You haven't offered. Without an offer you can't climb past "interested".</div>`:""}${r.nilO?`<div class="small">💰 Your NIL offer: <b>${money(r.nilO)}/yr</b> (market ~${money(r.nil)})</div>`:`<div class="small muted">Market NIL value ~${money(r.nil)}/yr</div>`}</div>`;
  // actions
  const canAct=!(r.signed&&r.com!==uid)&&!(r.com===uid&&r.signed);
  if(canAct){
    const H=U().hours;const dis=x=>H<x?"disabled":"";const dead=isDead()?"disabled":"";const sr=!P&&r.cls===S.classYear;
    h+=`<div class="card in"><div class="ch">🎬 Actions <span class="muted small">⏱ ${H}h left · 🧢 ${U().hc} HC</span></div><div class="acts">
     ${r.off.includes(uid)?"":`<button class="btn pri" data-a="offer">📨 Offer<small>free</small></button>`}
     <button class="btn" data-a="film" ${dis(actCost("film"))}>🎞️ Film<small>${actCost("film")}h · scout</small></button>
     <button class="btn" data-a="eval" ${dis(5)}>👀 Eval<small>5h · scout++</small></button>
     <button class="btn" data-a="call" ${dis(1)}>📞 Call<small>1h</small></button>
     <button class="btn" data-a="pitch" ${dis(2)}>🎤 Pitch<small>2h</small></button>
     <button class="btn" data-a="visit" ${dis(5)||dead}>🚗 Visit<small>5h · ${(()=>{const b=bestAsst(r);return b?esc(b.s.name.split(" ").pop())+(b.s.terr.includes(r.st)?" 🗺️":""):"staff busy";})()}</small></button>
     <button class="btn" data-a="hc" ${U().hc&&!dead?"":"disabled"}>🧢 HC visit<small>${esc(t.coach.name.split(" ").pop())}</small></button>
     ${P?"":sr?`<button class="btn" data-a="ov" ${dis(3)||dead}>🏟️ Official visit<small>3h · ${r.ovDone.length}/5 used</small></button>`:`<button class="btn" data-a="uv" ${dis(2)||dead}>🏫 Unofficial visit<small>2h · campus trip</small></button>`}
     ${P||sr?`<button class="btn" data-a="nil">💰 NIL offer<small>${money(budgetLeft())} free</small></button>`:""}</div>
     ${dead?`<div class="small muted" style="margin-top:6px">🔕 Dead period — in-person contact is off limits this week.</div>`:""}${!P&&!sr?`<div class="small muted" style="margin-top:6px">Underclassman: OVs and NIL talks open his senior year. Early relationships carry over.</div>`:""}
     <div id="subact"></div></div>`;
  }
  if(r.ov.length)h+=`<div class="small pad">🏟️ Official visit booked: ${r.ov.map(k=>k.startsWith("w")?"Week "+k.slice(1):S.cal.find(c=>c.key===k).label).join(", ")}</div>`;
  const posts=(S.feed||[]).filter(x=>x.rid===r.id).slice(0,5);
  if(posts.length)h+=`<div class="card in"><div class="ch">📱 His feed</div>${posts.map(x=>`<div class="lg">${esc(x.t)} <span class="muted small">· ${esc(x.ph)}</span></div>`).join("")}</div>`;
  if(r.log.length)h+=`<div class="card in"><div class="ch">🗒️ Contact log</div>${r.log.map(l=>`<div class="lg">${esc(l)}</div>`).join("")}</div>`;
  return h;
}
function bindRecruit(r){
  const body=$("#sheetBody");
  const refresh=(msg,bad)=>{save();const top=body.scrollTop;body.innerHTML=recruitHTML(r);bindCommon(body);bindRecruit(r);body.scrollTop=top;renderTop();if(msg)toast(msg,bad);};
  body.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{
    const a=b.dataset.a;const sub=$("#subact");
    if(a==="pitch"){sub.innerHTML=`<div class="ch small">Choose your pitch</div><div class="acts">${MOTIVES.map((m,i)=>{const g=grade(UT(),r,m[0]);const k=r.known&(1<<i);return `<button class="btn" data-p="${m[0]}">${m[1]}<small>Your grade ${m[0]==="nil"&&!r.nilO?"—":gradeL(g)}${k?" · "+motLevel(r.mot[i]):""}</small></button>`;}).join("")}</div>`;
      sub.querySelectorAll("[data-p]").forEach(x=>x.onclick=()=>{const res=act(r,"pitch",x.dataset.p);refresh(res.msg,!res.ok);});return;}
    if(a==="ov"){const sl=ovSlots();sub.innerHTML=sl.length?`<div class="ch small">Pick a weekend</div><div class="col">${sl.map(s=>`<button class="btn" data-ov="${s.key}">${esc(s.label)}<small>${ovBooked(s.key)}/${ovCap(s.key)} booked</small></button>`).join("")}</div>`:`<p class="muted small">No official-visit weekends available right now. Home games during the season and June OV weekends are your windows.</p>`;
      sub.querySelectorAll("[data-ov]").forEach(x=>x.onclick=()=>{const res=scheduleOV(r,x.dataset.ov);refresh(res.msg,!res.ok);});return;}
    if(a==="nil"){const mk=r.nil;const opts=[0.5,0.8,1,1.25,1.5,2].map(m=>Math.round(mk*m/5)*5);
      sub.innerHTML=`<div class="ch small">NIL / rev-share offer per year · market ~${money(mk)} · ${money(budgetLeft()+(r.com===U().teamId?r.nilO||0:0))} available</div><div class="acts">${opts.map(v=>`<button class="btn" data-nil="${v}">${money(v)}<small>${Math.round(v/mk*100)}% of market</small></button>`).join("")}<button class="btn" data-nil="0">Withdraw<small>$0</small></button></div>
       <div class="row"><input id="nilv" type="number" inputmode="numeric" placeholder="Custom $K" style="flex:1"><button class="btn pri" id="nilgo">Offer</button></div><div class="small muted">Deals far above market can get flagged by NIL Go.</div>`;
      sub.querySelectorAll("[data-nil]").forEach(x=>x.onclick=()=>{const res=act(r,"nil",+x.dataset.nil);refresh(res.msg,!res.ok);});
      $("#nilgo").onclick=()=>{const v=+$("#nilv").value;if(v>=0){const res=act(r,"nil",v);refresh(res.msg,!res.ok);}};return;}
    const res=act(r,a);refresh(res.msg,!res.ok);
  });
  body.querySelectorAll(".star[data-tg]").forEach(e=>e.onclick=ev=>{ev.stopPropagation();const res=toggleTarget(r);if(!res.ok)toast(res.msg,true);refresh();if(ui.tab==="board"||ui.tab==="home")render();});
}

// ---------- CLASS ----------
function vClass(){
  const uid=U().teamId;const t=UT();const cr=classRankings();const rk=cr.findIndex(x=>x.id===uid)+1;const me=cr[rk-1];
  const mine=S.recruits.filter(r=>r.com===uid&&r.cls===S.classYear).sort((a,b)=>b.comp-a.comp);
  const fut=S.recruits.filter(r=>r.com===uid&&r.cls>S.classYear).sort((a,b)=>a.cls-b.cls||b.comp-a.comp);
  let h=`<div class="chips pad">${[["mine","My class"],["nat","Team rankings"],["top","Top 300"],["needs","Needs"],["hist","History"]].map(([k,l])=>`<button class="cp ${ui.cls===k?"on":""}" data-cls="${k}">${l}</button>`).join("")}</div>`;
  if(ui.cls==="mine"){
    h+=`<div class="card hero" style="--c1:${t.c1}"><div class="k">Class of ${S.classYear}</div><div class="hl">#${rk} nationally · ${me.pts} pts</div><p>${me.n} commits · ${me.s5}× 5★ · ${me.s4}× 4★ · ${me.s3}× 3★ · avg ${me.avg?me.avg.toFixed(4):"—"} · NIL committed ${money(pendingNIL())}</p></div>`;
    h+=`<div class="list">${mine.map(r=>recRow(r)).join("")||"<p class='muted pad'>No commits yet.</p>"}</div>`;
    if(fut.length)h+=`<div class="card"><div class="ch">🔮 Future commits (early pledges)</div><div class="list">${fut.map(r=>recRow(r)).join("")}</div><div class="small muted">Underclassmen who've committed early. Keep recruiting them — they can still flip before they sign as seniors.</div></div>`;
    if(S.portalHist&&S.portalHist.length)h+=`<div class="card"><div class="ch">🌀 Last portal haul</div>${S.portalHist.map(p=>`<div class="lg">${p.pos} ${esc(p.n)} · ${p.ovr} OVR · from ${esc(T(p.from)?T(p.from).school:"")}</div>`).join("")}</div>`;
  }
  if(ui.cls==="nat"){
    h+=`<div class="card"><table class="tbl"><tr><th>#</th><th>School</th><th>Pts</th><th>#</th><th>5★</th><th>4★</th></tr>${cr.slice(0,40).map((c,i)=>`<tr class="${c.id===uid?"me":""}"><td>${i+1}</td><td>${badge(c.id)} ${tname(c.id)}</td><td>${c.pts}</td><td>${c.n}</td><td>${c.s5}</td><td>${c.s4}</td></tr>`).join("")}</table></div>`;
  }
  if(ui.cls==="top"){
    const sv=ui.svc||"C";const key=sv==="A"?"rkA":sv==="B"?"rkB":"rank";const sk=sv==="A"?"stA":sv==="B"?"stB":"stars";
    const tc=ui.tcls||0;const list=S.recruits.filter(r=>r.cls===S.classYear+tc).sort((a,b)=>a[key]-b[key]).slice(0,300);
    h+=`<div class="chips">${[0,1,2].map(k=>`<button class="cp ${tc===k?"on":""}" data-tcls="${k}">${S.classYear+k} ${["Sr","Jr","So"][k]}</button>`).join("")}</div><div class="chips">${[["C","Composite"],["A",SERVICES.A],["B",SERVICES.B]].map(([k,l])=>`<button class="cp ${sv===k?"on":""}" data-svc="${k}">${l}</button>`).join("")}</div>
     <div class="card small muted">Two independent services rank every prospect. They see the same camps and highlight tape, so they share blind spots — and both miss late bloomers. The composite averages them. Roughly half of five-stars become elite players; plenty of future stars are hiding at 4★ and 3★.</div>
     <div class="card"><table class="tbl t300"><tr><th>#</th><th>Player</th><th>★</th><th>Other</th><th></th></tr>${list.map(r=>{const other=sv==="A"?"BCI "+r.rkB:sv==="B"?"PG "+r.rkA:"PG "+r.rkA+"·BCI "+r.rkB;return `<tr data-rid="${r.id}" class="${r.com===uid?"me":""}"><td>${r[key]}</td><td><b>${esc(rName(r))}</b><div class="small muted">${r.pos} · ${esc(r.city)}, ${r.st}</div></td><td>${r[sk]}</td><td class="small muted">${other}</td><td>${r.com?badge(r.com):""}</td></tr>`;}).join("")}</table></div>`;
  }
  if(ui.cls==="needs"){
    const proj=S.roster.filter(p=>p.yr<4);
    h+=`<div class="card"><div class="ch">Projected depth next season (returning + commits)</div><table class="tbl"><tr><th>Pos</th><th>Returning</th><th>Starter OVR</th><th>Commits</th><th>Need</th></tr>${POSITIONS.map(pos=>{const ret=proj.filter(p=>p.pos===pos);const top=ret.sort((a,b)=>b.ovr-a.ovr)[0];const c=mine.filter(r=>r.pos===pos).length;const gap=POS_ROSTER_TARGET[pos]-ret.length-c;const need=gap>=3?"🔴 High":gap>=1?"🟡 Med":"🟢 Low";return `<tr><td>${pos}</td><td>${ret.length}/${POS_ROSTER_TARGET[pos]}</td><td>${top?top.ovr:"—"}</td><td>${c}</td><td>${need}</td></tr>`;}).join("")}</table>
     <div class="small muted">Roster ${S.roster.length}/105. Seniors leave after the season; underclassmen with 84+ OVR often declare for the draft.</div></div>`;
  }
  if(ui.cls==="hist"){
    const c=U().career;h+=`<div class="card"><div class="ch">Your classes</div>${c.length?`<table class="tbl"><tr><th>Class</th><th>School</th><th>Rk</th><th>Signees</th><th>5★/4★</th><th>Goals</th></tr>${c.map(x=>`<tr><td>${x.y}</td><td>${badge(x.team)}</td><td>#${x.rank}</td><td>${x.n}</td><td>${x.s5}/${x.s4}</td><td>${x.met}/4</td></tr>`).join("")}</table>`:"<p class='muted'>Your first class signs in February.</p>"}</div>`;
    Object.keys(S.classHist).sort().reverse().forEach(y=>{h+=`<div class="card"><div class="ch">Class of ${y} — final top 10</div>${S.classHist[y].slice(0,10).map((c,i)=>`<div class="lg">${i+1}. ${badge(c.id)} ${esc(T(c.id).school)} — ${c.pts} pts (${c.s5}× 5★, ${c.s4}× 4★)</div>`).join("")}</div>`;});
  }
  setTimeout(()=>{document.querySelectorAll("[data-cls]").forEach(b=>b.onclick=()=>{ui.cls=b.dataset.cls;render();});document.querySelectorAll("[data-svc]").forEach(b=>b.onclick=()=>{ui.svc=b.dataset.svc;render();});document.querySelectorAll("[data-tcls]").forEach(b=>b.onclick=()=>{ui.tcls=+b.dataset.tcls;render();});},0);
  return h;
}

// ---------- TEAM ----------
function vTeam(){
  const t=UT();let h=`<div class="chips pad">${[["roster","Roster"],["prog","Progression"],["program","Program"],["sched","Schedule"],["staff","Coach & Staff"]].map(([k,l])=>`<button class="cp ${ui.team===k?"on":""}" data-tm="${k}">${l}</button>`).join("")}</div>`;
  if(ui.team==="roster"){
    h+=`<div class="card hero" style="--c1:${t.c1}"><div class="k">${esc(t.school)} ${esc(t.mascot)}</div><div class="hl">Team OVR ${teamOVR(S.roster)}</div><p>Roster ${S.roster.length}/105 · Payroll ${money(payroll())} of ${money(budgetTotal())} · Recruit/portal NIL committed ${money(pendingNIL())}</p></div>`;
    if(S.retention&&S.retention.length){h+=`<div class="card warn"><div class="ch">⚠️ Portal risk — retention decisions</div>${S.retention.map(x=>{const p=S.roster.find(q=>q.id===x.pid);if(!p)return "";return `<div class="ret"><span><b>${p.pos} ${esc(p.fn+" "+p.ln)}</b> · ${p.ovr} OVR · ${yrLabel(p.yr)} · now ${money(p.nil)}</span><span>${x.rc?`<span class="small muted">Recommendation sent</span>`:`<button class="btn sm pri" data-keep="${p.id}">Recommend keeping (${money(x.ask)})</button><button class="btn sm" data-let="${p.id}">Recommend letting go</button>`}</span></div>`;}).join("")}<div class="small muted">The head coach and AD make the call — your recommendation carries more weight as they trust you (AD ${Math.round(trust().ad)}). Anyone left when the window closes is decided by Coach ${esc(hcLast())}: starters stay if the money's there, backups go.</div></div>`;}
    h+=`<div class="card small muted">Depth chart is ordered by effective rating in your schemes (${esc(t.off)} / ${esc(t.def)}). Colored tags show known scheme-fit bonuses; practice reveals the rest.</div>`;
    POSITIONS.forEach(pos=>{const d=depth(pos,S.roster,false,t.id);const n=POS_STARTERS[pos];
      h+=`<div class="card"><div class="ch">${pos} <span class="muted small">${d.length} players · starters ${n}</span></div>${d.map((p,i)=>`<div class="pl ${i<n?"stt":""}" data-pid="${p.id}"><span class="po">${i<n?"●":""}</span><span class="pn">${esc(p.fn+" "+p.ln)} ${p.from==="Portal"?"🌀":p.from==="Walk-on"?"🚶":""}${p.susp?"⛔":""}${p.inj>0?`<span class="down"> 🩹${p.inj>=12?"OUT":p.inj+"w"}</span>`:""}<span class="tic">${trIcons(p)}</span>${p.s&&p.s.g&&i<n?`<span class="pst">${esc(pStatLine(p))}</span>`:""}</span><span class="py">${yrLabel(p.yr)}</span><span class="pov">${p.ovr}${p.fk&&p.pos!=="K"?fitTag(fitBonus(p,t.id)):""}</span><span class="pp">${letter(p.pot)}</span><span class="pnil">${p.nil?money(p.nil):"—"}</span></div>`).join("")}</div>`;});
  }
  if(ui.team==="prog"){
    const ps=S.roster.filter(p=>p.ovr0).map(p=>({p,g:p.ovr-p.ovr0})).sort((a,b)=>b.g-a.g);
    h+=`<div class="card"><div class="ch">📈 Biggest risers since arriving</div>${ps.slice(0,12).map(({p,g})=>`<div class="pl2" data-pid="${p.id}"><span>${p.pos} <b>${esc(p.fn+" "+p.ln)}</b> <span class="tic">${trIcons(p)}</span><br><span class="small muted">${p.stars?p.stars+"★ ":""}${p.hsRank?"#"+p.hsRank+" HS · ":""}${yrLabel(p.yr)} · ${p.from}</span></span><span class="gain">${p.ovr0} → <b>${p.ovr}</b> <span class="up">+${g}</span></span></div>`).join("")}</div>`;
    const busts=ps.filter(x=>x.p.stars>=4&&x.g<=4&&x.p.yr>=2).slice(-5);
    if(busts.length)h+=`<div class="card"><div class="ch">😬 Not developing</div>${busts.map(({p,g})=>`<div class="pl2" data-pid="${p.id}"><span>${p.pos} <b>${esc(p.fn+" "+p.ln)}</b> <span class="tic">${trIcons(p)}</span><br><span class="small muted">${p.stars}★ · ${yrLabel(p.yr)}</span></span><span class="gain">${p.ovr0} → <b>${p.ovr}</b></span></div>`).join("")}</div>`;
    const proj=S.roster.filter(p=>p.yr>=3&&draftRound(p.ovr)).sort((a,b)=>b.ovr-a.ovr);
    h+=`<div class="card"><div class="ch">🏈 NFL draft board (eligible juniors & seniors)</div>${proj.length?proj.slice(0,10).map(p=>`<div class="lg" data-pid="${p.id}">${p.pos} ${esc(p.fn+" "+p.ln)} · ${p.ovr} OVR · projected <b>Round ${draftRound(p.ovr)}</b></div>`).join(""):"<p class='muted small'>No draftable players yet. 77+ OVR gets a look; 91+ is a first-rounder.</p>"}</div>`;
    if(S.lastDraft&&S.lastDraft.picks.length)h+=`<div class="card"><div class="ch">${S.lastDraft.y} NFL Draft</div>${S.lastDraft.picks.map(p=>`<div class="lg">Rd ${p.rd}: ${p.pos} ${esc(p.n)}${p.mine?` · <b>your signee</b> (${p.stars}★${p.hsRank?", #"+p.hsRank:""})`:""}</div>`).join("")}</div>`;
    const al=(S.alumni||[]).filter(a=>a.team===t.id).slice(-10).reverse();
    if(al.length)h+=`<div class="card"><div class="ch">🎓 Your signees who finished their careers</div>${al.map(a=>`<div class="lg">${a.pos} ${esc(a.n)} · ${a.stars}★ → ${a.ovr0} to ${a.ovr} OVR</div>`).join("")}</div>`;
  }
  if(ui.team==="program"){
    const pv=t.prev||{};const pr=proScore(t);
    h+=`<div class="card hero" style="--c1:${t.c1}"><div class="k">How recruits see ${esc(t.school)}</div><div class="hl">${momLabel(t.mom)}</div><p>Momentum moves week to week with results. Prestige, NIL power and facilities update after each season based on how you performed against expectations.</p></div>
     <div class="card"><div class="grid3"><div class="stat"><b>${Math.round(t.prestige)}${trend(t.prestige,pv.prestige)}</b><span>Prestige</span></div><div class="stat"><b>${t.nil.toFixed(1)}${trend(t.nil,pv.nil,v=>v.toFixed(1))}</b><span>NIL power</span></div><div class="stat"><b>${Math.round(t.fac)}${trend(t.fac,pv.fac)}</b><span>Facilities</span></div></div>
     <div class="grid3"><div class="stat"><b>${pr.toFixed(1)}</b><span>Draft picks / yr</span></div><div class="stat"><b>${t.off.split(" ")[0]}</b><span>${esc(t.off)}</span></div><div class="stat"><b>${t.def}</b><span>Defense</span></div></div>
     <div class="ch">Your grades in each recruiting category (avg. recruit)</div>${(()=>{const fake={pos:"WR",lat:t.lat,lon:t.lon,st:t.st,tOvr:70,perc:70,nilO:0,nil:100,lifeP:"any",fitP:null,leg:null,mot:MOTIVES.map(()=>1/MOTIVES.length)};return MOTIVES.filter(m=>!["pt","nil","prox","legacy","life","scheme"].includes(m[0])).map(m=>{const g=grade(t,fake,m[0]);return `<div class="goal"><span>${m[1]}</span><b class="mg g${gradeL(g)[0]}" style="padding:1px 8px">${gradeL(g)}</b></div>`;}).join("");})()}
     <div class="small muted" style="margin-top:8px">Playing time, proximity, NIL, scheme, lifestyle and family ties depend on the individual recruit — check his card.</div></div>
     <div class="card"><div class="ch">🧩 Scheme fit</div>${[["off",t.off,"Offense"],["def",t.def,"Defense"]].map(([sd,sch,l])=>{const cur=rosterFit(sd,sch);const alt=(sd==="off"?OFF_STYLES:DEF_STYLES).map(s=>({s,v:rosterFit(sd,s)})).sort((a,b)=>b.v-a.v)[0];return `<div class="goal"><span>${l}: ${esc(sch)}</span><b>${cur>0?"+":""}${cur.toFixed(1)}/starter</b></div>${alt.s!==sch&&alt.v>cur+0.5?`<div class="small muted">Your starters would fit a ${esc(alt.s)} better (${alt.v>0?"+":""}${alt.v.toFixed(1)}). Coach ${esc(hcLast())} decides — he may ask your opinion in the offseason.</div>`:""}`;}).join("")}
     <div class="small muted" style="margin-top:6px">Every player has a hidden play style that fits some schemes better than others (up to ±4 effective OVR). Scouting uncovers it before signing; practice reveals it after. Recruiting to your scheme — or convincing the head coach to hire a coordinator whose scheme fits your roster — is free talent.</div></div>
     <div class="card"><div class="ch">⚔️ Rivalries</div>${rivalsOf(t.id).map(rid=>{const k=[t.id,rid].sort().join("|");const sr=(S.series||{})[k]||{};return `<div class="goal"><span>${badge(rid)} ${tname(rid)}</span><b>${sr[t.id]||0}–${sr[rid]||0}</b></div>`;}).join("")}
     <div class="small muted" style="margin-top:6px">Rivalry games are more unpredictable and swing momentum, prestige, AD support and job security. Recruits both schools want lean toward the winner. Rival staffs fight harder on your leads — and stealing a kid from a rival is worth extra.</div></div>
     <div class="card"><div class="ch">💥 Recruiting buzz: ${(t.buzz||0).toFixed(1)}</div><p class="small muted">Landing blue-chips (especially 5★) creates buzz that lifts your brand with every other recruit. It fades week to week.</p></div>
     <div class="card"><div class="ch">💰 Collective</div><p class="small">Player-comp budget ${money(budgetTotal())} · Booster pledges this year ${money(U().bonusNIL)}</p><p class="small muted">Big wins and winning streaks shake loose booster money. Losing streaks make donors close their wallets. Pledges fade 50% each offseason.</p></div>`;
  }
  if(ui.team==="sched"){
    const gs=S.games.filter(g=>g.h===t.id||g.a===t.id).sort((a,b)=>a.wk-b.wk);
    const cf=S.cfpField?S.cfpField.games.filter(g=>g.h===t.id||g.a===t.id):[];
    h+=`<div class="card"><div class="ch">${S.year} schedule · ${t.w}-${t.l} (${t.cw}-${t.cl})</div>${gs.concat(cf).map(g=>{const L=gameLine(g,t.id);const lbl=g.kind==="reg"?"Wk "+g.wk:esc(g.label||g.kind);
      return `<div class="gm"><span class="gw">${lbl}</span><span class="go">${L.opp!=="FCS"&&isRival(t.id,L.opp)?"⚔️ ":""}${L.home?"vs":"at"} ${L.opp==="FCS"?esc(L.oname):badge(L.opp)+" "+tname(L.opp,true)}</span><span class="gr ${L.done?(L.w?"w":"l"):""}">${L.done?(L.w?"W ":"L ")+L.ms+"-"+L.os:(L.home&&S.recruits.some(r=>r.ov.includes("w"+g.wk))?"🏟️ OVs":"")}</span></div>`;}).join("")}</div>`;
    if(t.hist.length)h+=`<div class="card"><div class="ch">🏆 Program trophies (your tenure)</div>${t.hist.map(x=>`<div class="lg">${x.y}: ${x.natl?"National Champions":x.conf?x.conf+" Champions":"CFP #"+x.cfp+" seed"}</div>`).join("")}</div>`;
  }
  if(ui.team==="staff"){
    const c=t.coach;const hot=c.hot>3?"🔥 Hot seat":c.hot>1.5?"🌡️ Warm":"🧊 Secure";
    h+=`<div class="card"><div class="ch">Head Coach</div><div class="coach"><b>${esc(c.name)}</b><span class="muted small">${c.real?"":"(new hire)"} · ${hot}</span>
      <div class="grid3"><div class="stat"><b>${c.rec}</b><span>Recruiting</span></div><div class="stat"><b>${c.dev}</b><span>Development</span></div><div class="stat"><b>${c.game}</b><span>Game day</span></div></div></div>
      <div class="small muted">Recruiting powers HC visits and "Head Coach" pitches. Development grows your signees and sells "NFL Development". Game day wins games — and wins sell everything.</div></div>`;
    const st=U().staff||[];
    h+=`<div class="card"><div class="ch">👥 Assistant coaches <span class="muted small">payroll ${money(staffPayroll())} of ${money(staffBudget())}</span></div>
     <p class="small muted">Assistants do your assistant visits (2 each per week) — best when the kid is in their 🗺️ territory or plays the position they coach. Their territories boost your pipelines; position coaches drive development; coordinators set your scheme and call the games. Hiring and firing are Coach ${esc(hcLast())}’s decisions — when a job opens he interviews for a week and asks for your recommendation. In the offseason you can raise a concern about an assistant.</p><div class="goal"><span>🤝 Head-coach trust: <b>${Math.round(trust().hc)}</b></span><span class="small muted">${trustLabel(trust().hc)}</span></div>
     ${STAFF_ROLES.map((r,i)=>{const a=st[i];if(!a){const cs=hireCandidates(i);return `<div class="asst empty"><div class="ch">${r.n} <span class="down small">OPEN</span></div><div class="small muted" style="margin-bottom:4px">Coach ${esc(hcLast())} is interviewing — he decides after this week. Your recommendation?</div>${cs.map(c=>`<div class="cand"><div><b>${esc(c.name)}</b>${c.style?` <span class="small muted">${esc(c.style)} · roster fit ${(()=>{const v=rosterFit(c.role==="oc"?"off":"def",c.style);return (v>0?"+":"")+v.toFixed(1);})()}</span>`:""}<div class="small muted">REC ${c.rec} · DEV ${c.dev} · SCH ${c.sch} · 🗺️ ${c.terr.join("/")}${c.pos&&c.pos.length?" · coaches "+c.pos.join("/"):""}</div></div>${S.search[i]&&S.search[i].rec===c.id?`<button class="btn sm pri" data-hire="${i}:${c.id}">⭐ Your pick</button>`:`<button class="btn sm" data-hire="${i}:${c.id}">Recommend · ${money(c.sal)}</button>`}</div>`).join("")}</div>`;}
       return `<div class="asst"><div class="ch">${r.n}</div><div class="cand"><div><b>${esc(a.name)}</b>${a.style?` <span class="small muted">${esc(a.style)} · roster fit ${(()=>{const v=rosterFit(a.role==="oc"?"off":"def",a.style);return (v>0?"+":"")+v.toFixed(1);})()}</span>`:""} <span class="small muted">· yr ${a.yrs+1}</span><div class="small muted">REC ${a.rec} · DEV ${a.dev} · SCH ${a.sch} · 🗺️ ${a.terr.map(s=>STATE_NAMES[s]||s).join(", ")}${a.pos&&a.pos.length?" · coaches "+a.pos.join("/"):""} · ${money(a.sal)}/yr</div></div>${canConcern(i)?`<button class="btn sm" data-fire="${i}">Raise concern</button>`:""}</div></div>`;}).join("")}</div>`;
    h+=upgradesHTML();
  }
  setTimeout(()=>{document.querySelectorAll("[data-tm]").forEach(b=>b.onclick=()=>{ui.team=b.dataset.tm;render();});
    document.querySelectorAll("[data-pid]").forEach(e=>e.onclick=()=>openPlayer(+e.dataset.pid));
    document.querySelectorAll("[data-hire]").forEach(b=>b.onclick=()=>{const [i,c]=b.dataset.hire.split(":").map(Number);const res=recommendAssistant(i,c);save();render();toast(res.msg,!res.ok);});
    document.querySelectorAll("[data-fire]").forEach(b=>b.onclick=()=>{if(!b.dataset.arm){b.dataset.arm=1;b.textContent="Tell Coach?";return;}const res=raiseConcern(+b.dataset.fire);save();render();if(res.msg)toast(res.msg,!res.ok);});
    document.querySelectorAll("[data-keep]").forEach(b=>b.onclick=()=>{const res=resolveRetention(+b.dataset.keep,true);save();render();if(res)toast(res.msg,!res.ok);});
    document.querySelectorAll("[data-let]").forEach(b=>b.onclick=()=>{const res=resolveRetention(+b.dataset.let,false);save();render();if(res)toast(res.msg,!res.ok);});
    bindUpgrades();},0);
  return h;
}
function upgradesHTML(){
  const u=U().up;const rows=[["scout","🔎 Scouting Department","Faster scouting, fewer misreads (Lv3+ removes grade errors)"],["staff","📋 Recruiting Staff","+6 hours/week per level, bigger priority board, more OV slots, extra HC visit at Lv4"],["collective","💰 Collective Relations","+$700K/yr player-comp budget per level, bigger booster nights"]];
  return `<div class="card"><div class="ch">🛠️ Department upgrades <span class="muted small">${U().upPts} point${U().upPts===1?"":"s"} available</span></div>${rows.map(([k,l,d])=>`<div class="upg"><div><b>${l}</b> <span class="lv">Lv ${u[k]}/5</span><div class="small muted">${d}</div></div><button class="btn sm ${U().upPts&&u[k]<5?"pri":""}" data-up="${k}" ${U().upPts&&u[k]<5?"":"disabled"}>Upgrade</button></div>`).join("")}
   <div class="small muted">Earn points by hitting AD goals on Signing Day.</div>
   <button class="btn wide" id="booster" ${U().boosterUsed||U().hours<6?"disabled":""}>🥩 Host a booster dinner (6h) — raise collective money</button></div>`;
}
function bindUpgrades(){document.querySelectorAll("[data-up]").forEach(b=>b.onclick=()=>{if(upgrade(b.dataset.up)){save();render();toast("Upgraded!");}});const bo=$("#booster");if(bo)bo.onclick=()=>{const res=boosterEvent();save();render();toast(res.msg,!res.ok);};}

// ---------- POLLS ----------
function vPolls(){
  const tabs=[["ap","AP Top 25"],["cfp","CFP Rankings"],["stand","Standings"],["scores","Scores"],["bracket","Playoff"],["heis","Heisman"],["aa","All-Americans"]];
  let h=`<div class="chips pad">${tabs.map(([k,l])=>`<button class="cp ${ui.poll===k?"on":""}" data-pl="${k}">${l}</button>`).join("")}</div>`;
  const uid=U().teamId;
  if(ui.poll==="ap"||ui.poll==="cfp"){
    const isC=ui.poll==="cfp";
    if(isC&&!S.polls.cfpLive){h+=`<div class="card"><p>The CFP selection committee releases its first rankings after Week 9 (early November). Until then, here's how the committee's résumé model would see things:</p></div>`;}
    const list=isC?S.polls.cfp:S.polls.ap;const prev=isC?S.polls.prevCfp||[]:S.polls.prevAp||[];
    h+=`<div class="card"><table class="tbl poll"><tr><th>#</th><th>Team</th><th>Rec</th><th>Δ</th><th>Conf</th></tr>${list.map((id,i)=>{const t=T(id);const pi=prev.indexOf(id);const d=pi<0?"NEW":pi-i;
      return `<tr class="${id===uid?"me":""}"><td>${i+1}</td><td>${badge(id)} ${tname(id)}${t.champ?" 🏆":""}</td><td>${t.w}-${t.l}</td><td class="${d==="NEW"||d>0?"up":d<0?"down":""}">${d==="NEW"?"NEW":d>0?"▲"+d:d<0?"▼"+(-d):"—"}</td><td class="small">${t.conf}</td></tr>`;}).join("")}</table>
     ${!list.includes(uid)?`<div class="small pad">${esc(UT().school)}: ${UT().w}-${UT().l}, unranked</div>`:""}</div>`;
  }
  if(ui.poll==="heis"){
    const won=(S.awards||[]).filter(a=>a.k==="heisman");const cur=won.find(a=>a.y===S.year);
    if(cur)h+=`<div class="card hero" style="--c1:${T(cur.id).c1}"><div class="k">${cur.y} Heisman Trophy</div><div class="hl">${cur.pos} ${esc(cur.n)} · ${esc(T(cur.id).school)}</div><p>${esc(cur.line)}</p></div>`;
    h+=`<div class="card"><div class="ch">🏆 Heisman watch</div>${(S.heisman||[]).length?S.heisman.map((x,i)=>`<div class="pl2 ${x.id===uid?"me":""}"><span>${i+1}. <b>${esc(x.n)}</b> ${x.pos} · ${badge(x.id)}<br><span class="small muted">${esc(x.line)}</span></span><b>${x.v}</b></div>`).join(""):"<p class='muted small'>The race starts once games are played.</p>"}</div>`;
    if(won.length)h+=`<div class="card"><div class="ch">Past winners</div>${won.slice().reverse().map(a=>`<div class="lg">${a.y}: ${a.pos} ${esc(a.n)} · ${esc(T(a.id).school)}${a.mine?" · <b>signed by you</b>":""}</div>`).join("")}</div>`;
  }
  if(ui.poll==="aa"){
    if(!S.aa)h+=`<div class="card"><p class="muted">The All-America team is announced after the regular season.</p></div>`;
    else h+=`<div class="card"><div class="ch">🎖️ ${S.aa.y} All-America first team</div>${S.aa.team.map(x=>`<div class="pl2 ${x.id===uid?"me":""}"><span><b>${x.pos}</b> ${esc(x.n)} · ${badge(x.id)}${x.mine?" ⭐":""}<br><span class="small muted">${esc(x.line)}</span></span></div>`).join("")}<div class="small muted">⭐ = a player you signed.</div></div>`;
  }
  if(ui.poll==="stand"){
    h+=`<div class="sels pad"><select id="confsel">${Object.keys(CONF_GAMES).concat(["Independent"]).map(c=>`<option ${ui.conf===c?"selected":""}>${c}</option>`).join("")}</select></div>`;
    const st=ui.conf==="Independent"?S.teamIds.filter(id=>T(id).conf==="Independent"):standings(ui.conf);
    h+=`<div class="card"><table class="tbl"><tr><th>#</th><th>Team</th><th>Conf</th><th>All</th><th>PF</th><th>PA</th></tr>${st.map((id,i)=>{const t=T(id);return `<tr class="${id===uid?"me":""}"><td>${i+1}</td><td>${badge(id)} ${tname(id,true)}${t.champ?" 🏆":""}</td><td>${t.cw}-${t.cl}</td><td>${t.w}-${t.l}</td><td>${t.pf}</td><td>${t.pa}</td></tr>`;}).join("")}</table><div class="small muted">Top two meet in the conference championship. Five highest-ranked conference champions get automatic CFP bids.</div></div>`;
  }
  if(ui.poll==="scores"){
    const p=phase();const done=[...new Set(S.games.filter(g=>g.done&&g.kind==="reg").map(g=>g.wk))];const def=done.length?Math.max(...done):0;
    const wk=ui.scoreWk!==null&&ui.scoreWk<=13?ui.scoreWk:def;
    h+=`<div class="sels pad"><select id="wksel">${[...Array(14).keys()].map(w=>`<option value="${w}" ${w===wk?"selected":""}>Week ${w}</option>`).join("")}</select></div>`;
    const gs=S.games.filter(g=>g.wk===wk&&g.kind==="reg").sort((a,b)=>{const ra=Math.min(T(a.h).apRank||99,a.a==="FCS"?99:T(a.a).apRank||99),rb=Math.min(T(b.h).apRank||99,b.a==="FCS"?99:T(b.a).apRank||99);return ra-rb;});
    h+=`<div class="card">${gs.map(g=>scoreRow(g)).join("")||"<p class='muted'>No games.</p>"}</div>`;
    const ccg=S.games.filter(g=>g.kind==="ccg");if(ccg.length)h+=`<div class="card"><div class="ch">Conference Championships</div>${ccg.map(g=>scoreRow(g)).join("")}</div>`;
  }
  if(ui.poll==="bracket"){
    const F=S.cfpField;
    if(!F)h+=`<div class="card"><p>The 12-team field is set on Selection Day (Dec 6). The five highest-ranked conference champions get automatic bids; the top four seeds get byes.</p>${S.polls.cfpLive?`<div class="ch">If the season ended today</div>${S.polls.cfp.slice(0,12).map((id,i)=>`<div class="lg">${i+1}. ${badge(id)} ${esc(T(id).school)} (${T(id).w}-${T(id).l})</div>`).join("")}`:""}</div>`;
    else{
      h+=`<div class="card"><div class="ch">Seeds</div>${F.seeds.map((id,i)=>`<div class="lg ${id===uid?"me":""}">${i+1}. ${badge(id)} ${esc(T(id).school)} ${T(id).champ?"🏆 "+T(id).champ:""}</div>`).join("")}</div>`;
      [1,2,3,4].forEach(rd=>{const gs=F.games.filter(g=>g.round===rd);if(!gs.length)return;h+=`<div class="card"><div class="ch">${["","First Round","Quarterfinals","Semifinals","National Championship"][rd]}</div>${gs.map(g=>scoreRow(g,true)).join("")}</div>`;});
      if(F.champ)h+=`<div class="card hero" style="--c1:${T(F.champ).c1}"><div class="hl">🏆 ${S.year} National Champions: ${esc(T(F.champ).school)}</div></div>`;
    }
    if(S.champs.length)h+=`<div class="card"><div class="ch">Champions</div>${S.champs.slice().reverse().map(c=>`<div class="lg">${c.y}: ${badge(c.id)} ${esc(T(c.id).school)}</div>`).join("")}</div>`;
  }
  setTimeout(()=>{document.querySelectorAll("[data-pl]").forEach(b=>b.onclick=()=>{ui.poll=b.dataset.pl;render();});const cs=$("#confsel");if(cs)cs.onchange=e=>{ui.conf=e.target.value;render();};const ws=$("#wksel");if(ws)ws.onchange=e=>{ui.scoreWk=+e.target.value;render();};},0);
  return h;
}
function scoreRow(g,lbl){
  const side=(id,s,won)=>`<div class="sr ${won?"won":""} ${id===U().teamId?"me":""}">${id==="FCS"?`<span class="bdg fcs">FCS</span> ${esc(g.fcs)}`:badge(id)+" "+tname(id,true)}<b>${g.done?s:""}</b></div>`;
  return `<div class="score">${lbl&&g.label?`<div class="small muted">${esc(g.label)}</div>`:g.label?`<div class="small muted">${esc(g.label)}</div>`:""}${side(g.a,g.as,g.done&&g.as>g.hs)}${side(g.h,g.hs,g.done&&g.hs>g.as)}${g.ot?'<div class="small muted">OT</div>':""}</div>`;
}

// ---------- OFFICE ----------
function vOffice(){
  const u=U();const t=UT();
  let h=`<div class="chips pad">${[["dir","Director"],["career","Career & Perks"],["legacy","Legacy"],["admin","Administration"],["pipe","Pipelines"],["coach","Coach editor"],["save","Saves"],["help","How to play"]].map(([k,l])=>`<button class="cp ${ui.office===k?"on":""}" data-of="${k}">${l}</button>`).join("")}</div>`;
  if(ui.office==="dir"){
    h+=`<div class="card hero" style="--c1:${t.c1}"><div class="k">Director of Recruiting</div><div class="hl">${esc(u.name)} · ${esc(t.school)}</div><p>Year ${u.yearsAt+1} at ${esc(t.school)} · Difficulty: ${u.diff}</p></div>
     <div class="card"><div class="meter"><span>Reputation</span><b>${Math.round(u.rep)}</b><i><em style="width:${u.rep}%"></em></i></div><div class="meter"><span>Job security</span><b>${Math.round(u.sec)}</b><i><em style="width:${u.sec}%;background:${u.sec<30?"#e5484d":"#3fb950"}"></em></i></div>
     <div class="meter"><span>Head coach trust</span><b>${Math.round(trust().hc)}</b><i><em style="width:${trust().hc}%"></em></i></div><div class="meter"><span>AD trust</span><b>${Math.round(trust().ad)}</b><i><em style="width:${trust().ad}%"></em></i></div>
     <div class="small muted">Reputation drives job offers from bigger programs. Security drops when you miss AD goals — hit zero and you're out. You don't make team decisions — Coach ${esc(hcLast())} and the AD do. Trust (${trustLabel(trust().hc).toLowerCase()} with the head coach) decides how often they take your advice; it grows with big commits and good calls.</div></div>`;
    h+=`<div class="card"><div class="ch">🎓 Director skills <span class="muted small">earn XP by doing the work</span></div>${SKILLS.map(([k,n,d])=>{const l=u.sk[k],x=u.xp[k],need=xpNeed(l);return `<div class="skl"><div><b>${n}</b> <span class="lv">Lv ${l}/10</span><div class="small muted">${d}</div></div><div class="xpb"><i style="width:${l>=10?100:Math.round(x/need*100)}%"></i></div></div>`;}).join("")}</div>`;
    h+=upgradesHTML();
  }
  if(ui.office==="career"){
    const need=dxpNeed(u.lvl);
    h+=`<div class="card hero" style="--c1:${t.c1}"><div class="k">${esc(u.name)}</div><div class="hl">Lv ${u.lvl} · ${esc(dirTitle(u.lvl))}</div><div class="xpb big"><i style="width:${Math.round(u.dxp/need*100)}%"></i></div><p class="small">${Math.round(u.dxp)}/${need} XP to next level · ${u.pp} perk point${u.pp===1?"":"s"} available</p>
     <p class="small">Career XP comes from success: commits (more for blue-chips and flips), hitting AD goals, top-25 classes, wins, playoff runs, finding gems, and your signees getting drafted.</p></div>`;
    PERK_BRANCHES.forEach(b=>{h+=`<div class="card"><div class="ch">${{Evaluator:"🔎",Closer:"🤝",Connector:"🔗",Executive:"🏛️"}[b]} ${b}</div>${PERKS.filter(p=>p.b===b).map(p=>{const own=hasPerk(p.k),av=perkAvail(p.k);
      return `<div class="perk ${own?"own":av?"av":"lock"}"><div><b>${own?"✅ ":av?"":"🔒 "}${esc(p.n)}</b><div class="small muted">${esc(p.d)}</div></div>${own?"":`<button class="btn sm ${av&&u.pp?"pri":""}" data-perk="${p.k}" ${av&&u.pp?"":"disabled"}>Unlock</button>`}</div>`;}).join("")}</div>`;});
    h+=`<div class="card"><div class="ch">🎓 Hands-on skills <span class="muted small">level up by doing</span></div>${SKILLS.map(([k,n,d])=>{const l=u.sk[k],x=u.xp[k],nd=xpNeed(l);return `<div class="skl"><div><b>${n}</b> <span class="lv">Lv ${l}/10</span><div class="small muted">${d}</div></div><div class="xpb"><i style="width:${l>=10?100:Math.round(x/nd*100)}%"></i></div></div>`;}).join("")}</div>`;
  }
  if(ui.office==="admin"){
    const a=u.ad;
    h+=`<div class="card hero" style="--c1:${t.c1}"><div class="k">${esc(t.school)} Athletic Department</div><div class="hl">Commitment to football: ${a.commit}/100</div><p class="small">Winning raises the AD's commitment; good years bring automatic funding increases, bad ones bring cuts. Political capital (PC) is what you spend to ask for more.</p></div>
     <div class="card"><div class="meter"><span>Commitment</span><b>${a.commit}</b><i><em style="width:${a.commit}%"></em></i></div><div class="meter"><span>Political capital</span><b>${Math.round(a.pc)}</b><i><em style="width:${a.pc}%;background:var(--blue)"></em></i></div>
     <div class="ch" style="margin-top:8px">📜 School guidelines</div>
     <div class="goal"><span>Academic standard</span><b>${a.tier[0].toUpperCase()+a.tier.slice(1)} · min GPA ${TIER_GPA[a.tier].toFixed(1)}</b></div>
     <div class="goal"><span>Honor code / character review</span><b>${a.honor?"Yes":"No"}</b></div>
     <div class="goal"><span>Admissions waivers this class</span><b>${waiversLeft()} left</b></div>
     <div class="goal"><span>Extra funding won</span><b>${money(a.nil)}/yr</b></div>
     <div class="goal"><span>Extra staff</span><b>+${a.staff}h/wk · +${a.ov} OV slots</b></div>
     <div class="small muted" style="margin-top:6px">Recruits below your standard can still commit, but they need a waiver at signing. Without one, strict schools deny them outright; others coin-flip.</div></div>
     <div class="card"><div class="ch">🗣️ Requests to the AD <span class="muted small">one meeting per week</span></div>${AD_REQS.map(q=>`<div class="upg"><div><b>${esc(q.n)}</b> <span class="lv">${q.pc} PC</span><div class="small muted">${esc(q.d)}</div></div><button class="btn sm ${a.pc>=q.pc?"pri":""}" data-adr="${q.k}" ${a.pc>=q.pc&&a.lastReq!==S.tick?"":"disabled"}>Ask</button></div>`).join("")}
     <div class="small muted">Odds improve with AD commitment, momentum and your reputation. A "no" still costs half the PC. Earn PC by winning, making the playoff, hitting goals and landing blue-chips.</div></div>
     ${a.log.length?`<div class="card"><div class="ch">Meeting log</div>${a.log.slice(0,10).map(l=>`<div class="lg">${esc(l)}</div>`).join("")}</div>`:""}`;
  }
  if(ui.office==="pipe"){
    const P=u.pipe;const sts=Object.keys(P.st).sort((a,b)=>P.st[b]-P.st[a]);const hss=Object.keys(P.hs).map(Number).sort((a,b)=>P.hs[b]-P.hs[a]);
    const cnt={};S.recruits.forEach(r=>{if(r.hs)cnt[r.hs]=(cnt[r.hs]||0)+1;});
    h+=`<div class="card"><p class="small">Pipelines are <b>your</b> relationships — they follow you if you change jobs. Signing a kid builds a strong tie to his high school and state; visits and evaluations add a little. Recruits from pipeline schools come with film and inside info, are easier to scout, and respond more to your staff. Unused ties fade ~10% a year.</p></div>
     <div class="card"><div class="ch">🗺️ State pipelines</div>${sts.length?sts.map(k=>`<div class="pipe"><span>${esc(STATE_NAMES[k]||k)} <span class="small muted">${pipeLabel(P.st[k])}</span></span><span class="xpb"><i style="width:${P.st[k]}%"></i></span><b>${Math.round(P.st[k])}</b></div>`).join(""):"<p class='muted small'>None yet.</p>"}</div>
     <div class="card"><div class="ch">🏫 High school pipelines</div>${hss.length?hss.slice(0,40).map(k=>{const hs=hsById(k);if(!hs)return "";return `<div class="pipe" data-hsq="${esc(hs.name)}"><span>${esc(hs.name)}, ${hs.st}<br><span class="small muted">Coach ${esc(hs.coach)} · ${cnt[k]||0} prospect${cnt[k]===1?"":"s"} this cycle</span></span><span class="xpb"><i style="width:${P.hs[k]}%"></i></span><b>${Math.round(P.hs[k])}</b></div>`;}).join(""):"<p class='muted small'>Sign a recruit to start your first high-school pipeline.</p>"}</div>`;
  }
  if(ui.office==="coach"){
    h+=`<div class="card"><div class="ch">Edit head coaches</div><p class="small muted">Coaches are loaded as of opening day 2026. If a real-world hire happens, update it here — ratings are 40–99.</p>
     <select id="cet">${S.teamIds.map(id=>`<option value="${id}" ${id===(ui.ce||U().teamId)?"selected":""}>${esc(T(id).school)} — ${esc(T(id).coach.name)}</option>`).join("")}</select>
     ${(()=>{const c=T(ui.ce||U().teamId).coach;return `<div class="col"><label>Name<input id="cen" value="${esc(c.name)}"></label><div class="row"><label>REC<input id="cer" type="number" value="${c.rec}"></label><label>DEV<input id="ced" type="number" value="${c.dev}"></label><label>GAME<input id="ceg" type="number" value="${c.game}"></label></div><button class="btn pri" id="cesave">Save coach</button></div>`;})()}</div>`;
  }
  if(ui.office==="legacy"){
    const L=leg();const rc=records();const sc=hofScore();
    h+=`<div class="card hero" style="--c1:${t.c1}"><div class="k">Career legacy</div><div class="hl">${esc(u.name)} · ${esc(dirTitle(u.lvl))}</div><p>${rc.seasons} class${rc.seasons===1?"":"es"} signed · Stops: ${L.teams.map(id=>esc(T(id).abbr)).join(" → ")} · Hall of Fame score <b>${sc}</b> (120 to get in)</p></div>
     <div class="card"><div class="ch">🏆 Trophy case</div><div class="grid4"><div class="stat"><b>${L.nat}</b><span>Natl titles</span></div><div class="stat"><b>${L.conf}</b><span>Conf titles</span></div><div class="stat"><b>${L.cfp}</b><span>CFP trips</span></div><div class="stat"><b>${L.roty}</b><span>Recruiter of Yr</span></div></div>
     <div class="grid4"><div class="stat"><b>${L.top1}</b><span>#1 classes</span></div><div class="stat"><b>${L.top10}</b><span>Top-10 classes</span></div><div class="stat"><b>${L.drafted.length}</b><span>Signees drafted</span></div><div class="stat"><b>${L.heis.length}</b><span>Heisman signees</span></div></div>
     ${L.tro.length?L.tro.slice().reverse().map(x=>`<div class="lg">🏆 ${x.y} · ${esc(x.t)} · ${esc(T(x.team).school)}</div>`).join(""):"<p class='muted small'>No hardware yet.</p>"}</div>
     <div class="card"><div class="ch">📖 Record book</div>
      <div class="goal"><span>Best class</span><b>${rc.best?`#${rc.best.rank} · ${rc.best.y} ${esc(T(rc.best.team).abbr)}`:"—"}</b></div>
      <div class="goal"><span>Most 5★ in a class</span><b>${rc.most5&&rc.most5.s5?`${rc.most5.s5} · ${rc.most5.y} ${esc(T(rc.most5.team).abbr)}`:"—"}</b></div>
      <div class="goal"><span>Biggest gem (lowest-rated signee drafted)</span><b>${rc.gem?`${esc(rc.gem.n)} · ${rc.gem.stars}★ → Rd ${rc.gem.rd}`:"—"}</b></div>
      <div class="goal"><span>Biggest miss (5★ who never developed)</span><b>${rc.bust?`${esc(rc.bust.n)} · peaked at ${rc.bust.ovr}`:"—"}</b></div>
      <div class="goal"><span>First-round picks you signed</span><b>${L.drafted.filter(d=>d.rd===1).length}</b></div>
      <div class="goal"><span>All-Americans you signed</span><b>${L.aa}</b></div></div>
     ${L.drafted.length?`<div class="card"><div class="ch">🏈 Your signees in the NFL</div>${L.drafted.slice().reverse().slice(0,30).map(d=>`<div class="lg">${d.y} · Rd ${d.rd} · ${d.pos} ${esc(d.n)} (${d.stars}★, ${esc(T(d.team).abbr)})</div>`).join("")}</div>`:""}
     ${L.heis.length?`<div class="card"><div class="ch">🏆 Heisman winners you signed</div>${L.heis.map(d=>`<div class="lg">${d.y} · ${d.pos} ${esc(d.n)} (${esc(T(d.team).school)})</div>`).join("")}</div>`:""}
     <div class="card"><div class="ch">🎬 Retirement</div><p class="small muted">Hang it up and see if you make the Hall of Fame. This ends the career in this save slot.</p><button class="btn danger wide" id="retire">Retire</button></div>`;
  }
  if(ui.office==="save"){
    const m=getMeta();
    h+=`<div class="card"><div class="ch">💾 Save slots</div><p class="small muted">The game autosaves (compressed) to this browser after every week.${S._saveErr?` <span class="down">Last save failed: ${esc(S._saveErr)}</span>`:""}</p>
     ${[1,2,3].map(n=>{const s=m.slots[n];const cur=S.slot===n;return `<div class="upg"><div><b>Slot ${n}${cur?" · playing":""}</b><div class="small muted">${s?`${esc(s.name)} · ${esc(s.school)} · ${s.year} ${esc(s.ph)} · Lv ${s.lvl} · ${s.kb||"?"} KB`:"Empty"}</div></div><span class="row" style="margin:0">${s&&!cur?`<button class="btn sm" data-slotload="${n}">Load</button>`:""}${!s?`<button class="btn sm pri" data-slotnew="${n}">New</button>`:""}${s&&!cur?`<button class="btn sm danger" data-slotdel="${n}">Delete</button>`:""}</span></div>`;}).join("")}</div>
     <div class="card"><div class="ch">Move a career between devices</div><div class="col"><button class="btn" id="exp">⬇️ Download save file</button><button class="btn" id="cpy">📋 Copy save to clipboard</button><label class="btn">⬆️ Import save file<input id="imp" type="file" accept=".json" hidden></label><textarea id="pst" rows="3" placeholder="…or paste a save here" style="background:#0e1628;color:var(--tx);border:1px solid var(--line);border-radius:10px;padding:10px;font-size:13px"></textarea><button class="btn" id="pstgo">Load pasted save</button><button class="btn danger" id="ngb">🗑️ Delete this career & start over</button></div></div>`;
  }
  if(ui.office==="help"){
    h+=`<div class="card help"><div class="ch">How to play</div>
     <p><b>Your job:</b> build classes for your program. The head coach, prestige, and NIL money are your tools; your hours each week are the limit. You run recruiting — the head coach and AD run the team. On staff hires, scheme changes, redshirts, retention deals and counter-offers they ask for your input and make the call; the more they trust you, the more often your advice wins.</p>
     <p><b>1. Build a priority board (★).</b> Starred recruits get full-time staff attention every week — that's your baseline. Everyone else only hears from you when you act.</p>
     <p><b>2. Scout.</b> Star ratings come from the services and they miss. Film and in-person evals reveal true current ability, ceiling, work ethic and character. 💎 means your staff thinks he's underrated. Late bloomers climb during their senior season.</p>
     <p><b>3. Learn what he wants.</b> There are 12 priorities — playing time, NIL, winning, distance from home, the head coach, NFL development, academics, brand & facilities, scheme fit, coaching stability, lifestyle & climate, and family ties to a program. Calls and visits reveal them. Pitch where he cares AND where your program grades well. Pitching the same thing week after week wears off; so does hammering one kid with five contacts in a week.</p>
     <p><b>4. Close.</b> Head-coach visits are your heavy artillery. Official visits on home-game weekends are huge — a win (especially over a ranked team or rival) supercharges them; a blowout loss kills the vibe. A kid who took your OV is a solid commit and much harder to flip.</p>
     <p><b>5. NIL.</b> Put money on the table for the kids who care about it. Your budget covers the whole roster, so overspending on a class means less for the portal and retention. Deals far above market can get flagged by NIL Go.</p>
     <p><b>6. The calendar.</b> Every recruit has a decision window — summer, during the season, Early Signing Period (Dec), or Signing Day (Feb). Be leading when it hits. Early Signing locks most commits. In January the transfer portal opens for two quick turns. Spring and June official visits build next year's class.</p>
     <p><b>7. The world.</b> Games are simulated weekly with AP and CFP rankings, conference title games, and a 12-team playoff. Coaches get fired and hired after the season — a coaching change can shake your commits loose (or the rival's).</p>
     <p><b>8. Programs move.</b> Wins build momentum (recruits notice immediately) and boosters pledge NIL money after big wins. After each season prestige, NIL power and facilities rise or fall based on results versus expectations. Coaches improve with success too.</p>
     <p><b>9. Traits & progression.</b> Every player has hidden traits — Gym Rat, Raw Athlete, Homesick, Diva and more. Scouting, visits and conversations reveal them before signing; practice and games reveal them after. Traits drive development speed, portal risk and big-game play. Track growth in Team → Progression and watch your signees get drafted.</p>
     <p><b>10. Your skills.</b> Evaluation, Persuasion, Relationships, Negotiation and Networking level up as you work. If your head coach takes another job you can follow him or stay; if he's fired, the new coach may keep you — or not.</p>
     <p><b>11. Climb the ladder.</b> Success earns career XP and director levels (Recruiting Assistant → Recruiting Legend). Each level gives a perk point for four branches: Evaluator, Closer, Connector and Executive.</p>
     <p><b>12. Work the administration.</b> Every school has guidelines: academic standards (min GPA), honor codes, and waivers. Spend political capital on requests: more NIL funding, more staff, facility projects, admissions exceptions, or even relaxed standards. The AD's commitment rises and falls with winning.</p>
     <p><b>13. Build pipelines.</b> Sign a kid and you build a relationship with his high school coach and state. Pipeline schools send film and the inside scoop on future prospects, and their kids lean your way. Your pipelines follow you from job to job.</p>
     <p><b>14. Rivalries & bowls.</b> Rivalry games are wilder and matter more — for momentum, prestige, AD support, your job security, and head-to-head recruits. Bowl wins give a small offseason bump; every playoff win gives a bigger one.</p>
     <p><b>15. Rankings.</b> ${SERVICES.A} and ${SERVICES.B} rank every prospect independently; Class → Top 300 shows both. They're about as accurate as the real services: good, not gospel.</p>
     <p><b>16b. Kids change.</b> Juniors and sophomores aren't finished products. Every spring some hit a growth spurt or dominate their season, others stall, get hurt or slip academically. Work ethic, character and traits tilt the odds. The services catch some of it late; your old evaluations go stale (🔄) until you re-scout. Committing a sophomore early is a bet.</p>
     <p><b>16. Three classes at once.</b> The board holds seniors, juniors and sophomores. Only seniors sign, take official visits or talk NIL — but early offers, unofficial visits and calls build relationships that carry over, and a few elite juniors commit early.</p>
     <p><b>17. Your staff.</b> Five assistants each have recruiting, development and scheme ratings, a home territory and position groups. They make the assistant visits, power your pipelines, develop their positions, and set your schemes. The head coach hires and fires them — you recommend. Good ones get poached — sometimes they become head coaches and ask you to come along.</p>
     <p><b>18. Real rosters everywhere.</b> Every program has a full roster: real transfers in the portal, real draft picks, stats, injuries, a Heisman race and an All-America team. After all signings, every roster is filled out with walk-ons.</p>
     <p><b>19. Camps, all-stars & drama.</b> Camp season lets you scout dozens of prospects at once; testing moves rankings. All-American Bowl week brings live announcements. Watch for handlers, parents with demands, and dead periods when in-person contact is off.</p>
     <p><b>20. Scheme fit.</b> Every player has a hidden play style (Dual-Threat QB, Power Back, Press Man corner…) and his own quirks, so he fits some schemes better than others — worth up to ±4 effective OVR, plus faster development in the right system. The services list a style, but they're wrong about a quarter of the time. Scout to 35% for his style, 70% for his fit in your scheme, 90% for his full profile.</p>
     <p><b>21. Your career.</b> Hit AD goals for upgrade points and reputation. Win big and bigger programs call. Miss too often and you're fired.</p></div>`;
  }
  setTimeout(()=>{
    document.querySelectorAll("[data-of]").forEach(b=>b.onclick=()=>{ui.office=b.dataset.of;render();});bindUpgrades();
    document.querySelectorAll("[data-perk]").forEach(b=>b.onclick=()=>{if(buyPerk(b.dataset.perk)){save();render();toast("Perk unlocked: "+PERKS.find(p=>p.k===b.dataset.perk).n);}});
    document.querySelectorAll("[data-adr]").forEach(b=>b.onclick=()=>{const res=adRequest(b.dataset.adr);save();render();toast(res.msg,!res.ok);});
    document.querySelectorAll("[data-hsq]").forEach(b=>b.onclick=()=>{const nm=b.dataset.hsq;ui.tab="board";ui.board.st="all";ui.board.q=nm.split(" ")[0];ui.board.n=40;render();window.scrollTo(0,0);});
    const cet=$("#cet");if(cet){cet.onchange=e=>{ui.ce=e.target.value;render();};$("#cesave").onclick=()=>{const c=T(ui.ce||U().teamId).coach;c.name=$("#cen").value.trim()||c.name;c.rec=clamp(+$("#cer").value||c.rec,40,99);c.dev=clamp(+$("#ced").value||c.dev,40,99);c.game=clamp(+$("#ceg").value||c.game,40,99);save();toast("Coach saved.");render();};}
    const ex=$("#exp");if(ex)ex.onclick=()=>{const blob=new Blob([serialize()],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`signing-day-${UT().abbr}-${S.year}.json`;a.click();};
    const im=$("#imp");if(im)im.onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const o=JSON.parse(rd.result);if(o.v!==SAVE_VER)throw 0;const n=S.slot;S=o;S.slot=n;save();render();toast("Save loaded.");}catch(err){toast("Bad or outdated save file.",true);}};rd.readAsText(f);};
    const ng=$("#ngb");if(ng)ng.onclick=()=>{if(!ng.dataset.arm){ng.dataset.arm=1;ng.textContent="Tap again to delete this career";return;}const n=S.slot;deleteSlot(n);S=null;ngSlot=n;render();};
    document.querySelectorAll("[data-slotload]").forEach(b=>b.onclick=async()=>{b.textContent="Loading…";const ok=await loadSlot(+b.dataset.slotload);if(ok){ui.tab="home";render();toast("Career loaded.");}else toast("Couldn't load that slot.",true);});
    document.querySelectorAll("[data-slotnew]").forEach(b=>b.onclick=()=>{save();S=null;ngSlot=+b.dataset.slotnew;render();});
    document.querySelectorAll("[data-slotdel]").forEach(b=>b.onclick=()=>{if(!b.dataset.arm){b.dataset.arm=1;b.textContent="Sure?";return;}deleteSlot(+b.dataset.slotdel);render();});
    const rt=$("#retire");if(rt)rt.onclick=()=>{if(!rt.dataset.arm){rt.dataset.arm=1;rt.textContent="Tap again to retire for good";return;}showRetire();};
    const cp=$("#cpy");if(cp)cp.onclick=()=>{try{navigator.clipboard.writeText(serialize()).then(()=>toast("Save copied."),()=>toast("Clipboard blocked here — use Download.",true));}catch(e){toast("Clipboard unavailable.",true);}};
    const pg=$("#pstgo");if(pg)pg.onclick=()=>{try{const o=JSON.parse($("#pst").value);if(!o.teams||o.v!==SAVE_VER)throw 0;const n=S.slot;S=o;S.slot=n;save();render();toast("Save loaded.");}catch(e){toast("That doesn't look like a current save.",true);}};
  },0);
  return h;
}

// ---------- PLAYER SHEET ----------
function openPlayer(id){const p=S.roster.find(x=>x.id===id);if(!p)return;
  const hs=(p.hist||[]);const pts=[{y:"Signed",o:p.ovr0||p.ovr}].concat(hs.map(x=>({y:x.y,o:x.o})));if(!hs.length||hs[hs.length-1].o!==p.ovr)pts.push({y:"Now",o:p.ovr});
  const mx=99,mn=40;
  const bars=pts.map(x=>`<div class="hb"><i style="height:${Math.round((x.o-mn)/(mx-mn)*100)}%"></i><b>${x.o}</b><span>${x.y}</span></div>`).join("");
  const dr=draftRound(p.ovr);
  openSheet(`<div class="rh"><div><h2>${esc(p.fn+" "+p.ln)}</h2><div class="rsub">${p.pos} · ${yrLabel(p.yr)} · ${p.from}${p.pfrom?" from "+esc(T(p.pfrom).school):""}${p.stars?" · signed as "+p.stars+"★":""}${p.hsRank?" (#"+p.hsRank+")":""}</div></div></div>
   <div class="grid4"><div class="stat"><b>${p.ovr}</b><span>OVR</span></div><div class="stat"><b>${letter(p.pot)}</b><span>Ceiling</span></div><div class="stat"><b>${Math.round(p.mor)}</b><span>Morale</span></div><div class="stat"><b>${p.nil?money(p.nil):"—"}</b><span>NIL/yr</span></div></div>
   ${p.inj>0?`<div class="flag bust">🩹 Injured — ${p.inj>=12?"out for the season":"out "+p.inj+" more week"+(p.inj>1?"s":"")}</div>`:""}
   ${p.pos!=="K"?`<div class="card in"><div class="ch">🧩 Play style</div>${p.fk?`<div>${esc(archName(p))} · fit in your ${esc(OFF_POS.includes(p.pos)?UT().off:UT().def)}: <b>${fitLetter(fitBonus(p,U().teamId))}</b> ${fitTag(fitBonus(p,U().teamId))} → effective <b>${effOvr(p,U().teamId)}</b></div><div class="fittab">${styleList(p.pos).map(s=>`<span>${esc(s)} ${fitTag(Math.round(fitVal(p,s)*4))}</span>`).join("")}</div>`:`<div class="muted small">Your staff hasn't figured out his best fit yet — practice and game snaps will tell.</div>`}</div>`:""}
   <div class="card in"><div class="ch">📊 Stats</div><div class="small">This season: ${esc(pStatLine(p))}</div>${p.ls?`<div class="small muted">Last season: ${esc(pStatLine({pos:p.pos,s:p.ls}))}</div>`:""}${p.cs&&p.cs.g?`<div class="small muted">Career: ${esc(pStatLine({pos:p.pos,s:p.cs}))}</div>`:""}</div>
   <div class="card in"><div class="ch">📈 Development</div><div class="hbars">${bars}</div>${p.yr>=3&&dr?`<div class="small">NFL projection: <b>Round ${dr}</b></div>`:p.yr>=3?`<div class="small muted">Not yet on NFL radars (77+ OVR).</div>`:""}</div>
   <div class="card in"><div class="ch">🧬 Traits</div><div class="tchs">${trChips(p,true)||"<span class='muted small'>None known.</span>"}</div>${(p.tr||[]).filter(x=>x.rev).map(x=>`<div class="small muted">${TRAITS[x.k].i} ${esc(TRAITS[x.k].d)}</div>`).join("")}<div class="small muted" style="margin-top:6px">Hidden traits surface through practice reps, game snaps and spring ball.</div></div>`,"rec");}

// ---------- TEAM SHEET ----------
function openTeam(id){
  if(id==="FCS")return;const t=T(id);const uid=U().teamId;
  const gs=S.games.filter(g=>(g.h===id||g.a===id)).sort((a,b)=>a.wk-b.wk);
  const commits=S.recruits.filter(r=>r.com===id).sort((a,b)=>a.cls-b.cls||a.rank-b.rank);
  const cr=classRankings();const rk=cr.findIndex(x=>x.id===id)+1;
  const c=t.coach;
  let h=`<div class="rh"><div><h2>${badge(id,true)} ${esc(t.school)} ${esc(t.mascot)}</h2><div class="rsub">${t.conf} · ${t.w}-${t.l} (${t.cw}-${t.cl})${t.apRank?" · AP #"+t.apRank:""}${S.polls.cfpLive&&t.cfpRank?" · CFP #"+t.cfpRank:""}</div></div></div>
   <div class="card in"><div class="ch">Head coach: ${esc(c.name)}</div><div class="grid3"><div class="stat"><b>${c.rec}</b><span>Recruiting</span></div><div class="stat"><b>${c.dev}</b><span>Development</span></div><div class="stat"><b>${c.game}</b><span>Game day</span></div></div>
   <div class="grid4"><div class="stat"><b>${Math.round(t.prestige)}${trend(t.prestige,t.prev&&t.prev.prestige)}</b><span>Prestige</span></div><div class="stat"><b>${Math.round(t.talent)}</b><span>Talent</span></div><div class="stat"><b>${t.nil.toFixed(1)}</b><span>NIL</span></div><div class="stat"><b>${Math.round(t.fac)}</b><span>Facilities</span></div></div>
   <div class="small muted">${t.bowl?`🏈 ${esc(t.bowl.name)} ${t.bowl.w?"W":"L"} · `:""}${momLabel(t.mom)} · ${esc(t.off)} / ${esc(t.def)} · Coach year ${(c.yrs||0)+1} · ${proScore(t).toFixed(1)} draft picks/yr</div></div>
   <div class="card in"><div class="ch">⭐ Key players <span class="muted small">roster OVR ${teamOVR(rosterOf(id))}</span></div>${rosterOf(id).slice().sort((a,b)=>b.ovr-a.ovr).slice(0,8).map(p=>`<div class="lg">${p.pos} ${esc(p.fn+" "+p.ln)} · ${p.ovr} OVR · ${yrLabel(p.yr)}${p.inj>0?" 🩹":""}${p.s&&p.s.g?` <span class="muted">· ${esc(pStatLine(p))}</span>`:""}</div>`).join("")}</div>
   <div class="card in"><div class="ch">Schedule</div>${gs.map(g=>{const L=gameLine(g,id);return `<div class="gm"><span class="gw">${g.kind==="reg"?"Wk "+g.wk:esc(g.label||"")}</span><span class="go">${L.home?"vs":"at"} ${L.opp==="FCS"?esc(L.oname):tname(L.opp,true)}</span><span class="gr ${L.done?(L.w?"w":"l"):""}">${L.done?(L.w?"W ":"L ")+L.ms+"-"+L.os:""}</span></div>`;}).join("")}</div>
   <div class="card in"><div class="ch">Class of ${S.classYear}: #${rk} · ${commits.filter(r=>r.cls===S.classYear).length} commits</div>${commits.slice(0,25).map(r=>`<div class="lg" data-rid="${r.id}">${stars(r.stars)} #${r.rank} ${r.pos} ${esc(rName(r))}${r.signed?" ✍️":""}</div>`).join("")||"<p class='muted small'>None yet.</p>"}</div>`;
  openSheet(h,"team");
}

// ---------- NEW GAME ----------
let ngSel=null;let ngSlot=null;
function renderNewGame(){
  document.body.classList.add("ng");$("#top").innerHTML="";$("#tabs").innerHTML="";
  const q=(window._ngq||"").toLowerCase();
  const rows=TEAM_ROWS.filter(r=>!q||r[1].toLowerCase().includes(q)||r[4].toLowerCase().includes(q)||r[15].toLowerCase().includes(q));
  const byConf={};rows.forEach(r=>{(byConf[r[4]]=byConf[r[4]]||[]).push(r);});
  const lvl=r=>r[10]>=90?"Blue blood":r[10]>=75?"Power":r[10]>=58?"Solid P4":r[10]>=48?"Rebuild":"Hard mode";
  $("#view").innerHTML=`<div class="ngw"><div class="logo">SIGNING<br><span>DAY</span></div><div class="muted ctr">College Football · NIL & Portal Era · ${TEAM_ROWS.length} real programs</div>
   ${(()=>{const m=getMeta();const sl=[1,2,3].filter(n=>m.slots[n]);return sl.length?`<div class="card"><div class="ch">Continue a career</div>${sl.map(n=>{const s=m.slots[n];return `<button class="btn wide" data-cont="${n}">Slot ${n}: ${esc(s.name)} · ${esc(s.school)} · ${s.year} · Lv ${s.lvl}</button>`;}).join("")}${ngSlot?`<p class="small muted">New career will go in slot ${ngSlot}.</p>`:sl.length>=3?`<p class="small muted">All slots full — a new career will replace slot ${m.active||1}.</p>`:""}</div>`:"";})()}
   <div class="card"><label>Your name<input id="ngname" value="${esc(window._ngn||"")}" placeholder="Director name"></label>
   <label>Difficulty<select id="ngdiff"><option value="easy">Easy — rivals recruit softer</option><option value="normal" selected>Normal</option><option value="hard">Hard — rival staffs are relentless</option></select></label></div>
   <input id="ngq" placeholder="Search school, conference, or coach…" value="${esc(window._ngq||"")}">
   ${CONFS.filter(c=>byConf[c]).map(c=>`<div class="card"><div class="ch">${c}</div>${byConf[c].map(r=>`<div class="ngt ${ngSel===r[0]?"sel":""}" data-ng="${r[0]}"><span class="bdg" style="background:${r[8]};color:${lum(r[8])>0.6?"#111":"#fff"};border-color:${r[9]}">${r[2]}</span><div class="ngi"><b>${esc(r[1])}</b><span class="small muted">HC ${esc(r[15])} · REC ${r[16]} · ${lvl(r)}</span></div><span class="ngp">${"●".repeat(Math.max(1,Math.round(r[10]/20)))}</span></div>`).join("")}</div>`).join("")}
   <div class="ngbar"><button class="btn pri wide" id="ngstart" ${ngSel?"":"disabled"}>${ngSel?"Take the job at "+esc(TEAM_ROWS.find(r=>r[0]===ngSel)[1])+" ▶":"Pick a program"}</button></div></div>`;
  document.querySelectorAll("[data-ng]").forEach(e=>e.onclick=()=>{ngSel=e.dataset.ng;window._ngn=$("#ngname").value;renderNewGame();});
  document.querySelectorAll("[data-cont]").forEach(b=>b.onclick=async()=>{b.textContent="Loading…";if(await loadSlot(+b.dataset.cont)){ui.tab="home";render();}else toast("That save is from an older version and can't be loaded.",true);});
  let to;$("#ngq").oninput=e=>{clearTimeout(to);to=setTimeout(()=>{window._ngq=e.target.value;window._ngn=$("#ngname").value;renderNewGame();const i=$("#ngq");i.focus();i.setSelectionRange(i.value.length,i.value.length);},300);};
  $("#ngstart").onclick=()=>{const name=$("#ngname").value.trim()||"Director";const diff=$("#ngdiff").value;$("#ngstart").textContent="Building the 2026 world…";$("#ngstart").disabled=true;
    setTimeout(()=>{const m=getMeta();let slot=ngSlot||[1,2,3].find(n=>!m.slots[n])||m.active||1;ngSlot=null;newGame(ngSel,name,diff,slot);save();ui.tab="home";render();window.scrollTo(0,0);
      openSheet(`<h2>Welcome to ${esc(UT().school)}, ${esc(name)}.</h2><p>It's August ${S.year}. Head coach <b>${esc(UT().coach.name)}</b> hands you the board: the Class of ${S.classYear} already has <b>${S.recruits.filter(r=>r.com===U().teamId&&r.cls===S.classYear).length} commits</b>, and ${targetCount()} uncommitted targets are on your priority list.</p>
       <ul class="sum"><li>⭐ Star recruits to put them on your priority board.</li><li>🔎 Scout before you trust the stars.</li><li>🏟️ Book official visits for home games now.</li><li>▶ Advance when your hours are spent.</li></ul><p class="small muted">Full guide: Office → How to play.</p><button class="btn pri wide" id="wok">Let's go</button>`,"sum");
      $("#wok").onclick=closeSheet;},40);};
}

function showRetire(){const r=retire();const L=r.L;
  openSheet(`<div class="cer"><div class="cer-k">FINAL CAREER REPORT</div><h2>${esc(U().name)}</h2><div class="muted">${esc(r.title)} · ${r.seasons} classes · ${L.teams.map(id=>esc(T(id).school)).join(" → ")}</div>
   <div class="big-res">${r.hof?"🏛️ HALL OF FAME — first ballot.":"Hall of Fame score "+r.score+" (needed 120). A fine career."}</div>
   <ul class="sum"><li>🏆 ${L.nat} national titles · ${L.conf} conference titles · ${L.cfp} playoff trips</li><li>📜 ${L.top1} #1 classes · ${L.top10} top-10 classes · ${L.roty}× Recruiter of the Year</li><li>🏈 ${L.drafted.length} signees drafted (${L.drafted.filter(d=>d.rd===1).length} first-rounders) · ${L.heis.length} Heisman winners</li></ul>
   <button class="btn pri wide" id="retok">Start a new career</button></div>`,"cer");
  $("#retok").onclick=()=>{const n=S.slot;deleteSlot(n);S=null;ngSlot=n;closeSheet();render();};}

// ---------- BOOT ----------
window.addEventListener("load",()=>{
  $("#sheetClose").onclick=closeSheet;
  $("#sheet").addEventListener("click",e=>{if(e.target.id==="sheet"&&!$("#sheet").classList.contains("cer")&&!$("#sheet").classList.contains("sum"))closeSheet();});
  const m=getMeta();
  (m.slots[m.active]?loadSlot(m.active):Promise.resolve(false)).then(ok=>{if(!ok)S=null;render();}).catch(()=>{S=null;render();});
  try{if(location.protocol.startsWith("http")&&"serviceWorker" in navigator&&window.self===window.top)navigator.serviceWorker.register("sw.js").catch(()=>{});}catch(e){}
});

function hsDevHTML(r){if(r.portal)return "";let h="";
  if(r.stale&&r.sc<75)h+=`<div class="flag bust">🔄 He's changed since your last eval — your old grades may be off. Scout him to ${75}% for an updated read.</div>`;
  const d=r.dvl;if(d&&d.y>=S.classYear-1&&d.why){const yr=d.y===S.classYear?"This past year":"Last year";
    if(r.sc>=55&&!(r.stale&&r.sc<75))h+=`<div class="flag ${d.k==="up"?"gem":"bust"}">${d.k==="up"?"📈":"📉"} ${yr} he ${esc(d.why)}. ${d.k==="up"?"Ceiling is up.":d.k==="flat"?"Development has stalled.":"Ceiling is down."}</div>`;
    else h+=`<div class="small muted" style="margin:4px 0">📰 Word on the circuit: he ${esc(d.why)}. Scout him to see what it means.</div>`;}
  return h;}
