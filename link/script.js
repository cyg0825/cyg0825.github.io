/* ==== 核心逻辑 ==== */
var LEVELS=[
  {c:6,r:4,f:6,t:150,h:5,s:3},
  {c:8,r:4,f:8,t:170,h:5,s:3},
  {c:8,r:5,f:10,t:195,h:4,s:3},
  {c:10,r:5,f:12,t:225,h:4,s:3},
  {c:10,r:6,f:14,t:255,h:4,s:2},
  {c:12,r:6,f:16,t:290,h:3,s:2},
  {c:12,r:7,f:18,t:325,h:3,s:2},
  {c:12,r:8,f:20,t:360,h:3,s:2},
  {c:14,r:7,f:22,t:395,h:2,s:2},
  {c:14,r:8,f:24,t:435,h:2,s:2},
  {c:16,r:7,f:24,t:470,h:2,s:1},
  {c:16,r:8,f:26,t:510,h:2,s:1},
  {c:14,r:8,f:26,t:435,h:2,s:1},
  {c:16,r:8,f:28,t:485,h:1,s:1},
  {c:14,r:8,f:28,t:415,h:1,s:1},
  {c:16,r:8,f:30,t:460,h:1,s:1},
  {c:16,r:8,f:30,t:450,h:1,s:1},
  {c:16,r:8,f:30,t:435,h:1,s:0},
  {c:16,r:8,f:30,t:420,h:1,s:0},
  {c:16,r:8,f:30,t:410,h:1,s:0}
];
var NFACE=30;
var DIRS=[[-1,0],[1,0],[0,-1],[0,1]];

function rngOf(seed){
  var x=(seed>>>0)||1;
  return function(){ x^=x<<13; x>>>=0; x^=x>>17; x^=x<<5; x>>>=0; return x/4294967296; };
}
function shuffled(a,rnd){
  var b=a.slice();
  for(var i=b.length-1;i>0;i--){ var j=Math.floor(rnd()*(i+1)); var t=b[i]; b[i]=b[j]; b[j]=t; }
  return b;
}
// 在可用宽高里挑一个因数分解，让格子尽量大；列数接近设计值
var MIN_CELL=24;
function fitGrid(n,specC,W,H){
  var fits=[],tight=[];
  for(var c=1;c*c<=n;c++){
    if(n%c) continue;
    var opts=[c,n/c];
    for(var k=0;k<2;k++){
      var cc=Math.round(opts[k]), rr=Math.round(n/opts[k]);
      if(cc<4||rr<4||cc>24||rr>24) continue;
      var cell=Math.min(W/(cc+2),H/(rr+2),84);
      if(cell>=MIN_CELL) fits.push({c:cc,r:rr,cell:cell,score:cell-Math.abs(cc-specC)*0.12});
      // 夹不住 24 时，格子只按宽度收，横向绝不越界；多出来的高度由页面滚动解决
      else { var t=Math.min(MIN_CELL,W/(cc+2)); tight.push({c:cc,r:rr,cell:t,over:(rr+2)*t-H,small:t<MIN_CELL?1:0}); }
    }
  }
  if(fits.length){
    fits.sort(function(a,b){return b.score-a.score;});
    return fits[0];
  }
  if(tight.length){
    tight.sort(function(a,b){return a.small-b.small||a.over-b.over;});
    return tight[0];
  }
  var c2=Math.max(4,Math.min(24,specC)); var r2=Math.ceil(n/c2);
  return {c:c2,r:r2,cell:Math.min(W/(c2+2),Math.max(MIN_CELL,Math.min(H/(r2+2),84)))};
}
function deal(level,W,H,rnd){
  var n=level.c*level.r;
  var g0=fitGrid(n,level.c,W,H);
  var rows=g0.r, cols=g0.c, pairs=n/2, faces=level.f;
  var deck=[];
  for(var i=0;i<pairs;i++){ deck.push(1+i%faces); deck.push(1+i%faces); }
  deck=shuffled(deck,rnd);
  var C=cols+2, R=rows+2;
  var g=[];
  for(var r=0;r<R;r++){ var row=[]; for(var c=0;c<C;c++) row.push(0); g.push(row); }
  var k=0;
  for(var r1=1;r1<=rows;r1++) for(var c1=1;c1<=cols;c1++) g[r1][c1]=deck[k++];
  var tries=0;
  while(!findMove(g)&&tries++<80) reshuffle(g,rnd);
  return {g:g,rows:rows,cols:cols,cell:g0.cell,total:n};
}
function linkPath(g,a,b){
  var R=g.length,C=g[0].length;
  if(a.r===b.r&&a.c===b.c) return null;
  if(g[a.r][a.c]!==g[b.r][b.c]||!g[a.r][a.c]) return null;
  var best=[],keyOf=function(r,c,d){return (r*C+c)*4+d;};
  for(var r=0;r<R;r++){ var rr=[]; for(var c=0;c<C;c++) rr.push([9,9,9,9]); best.push(rr); }
  var prev={},dq=[];
  for(var d=0;d<4;d++){
    var nr=a.r+DIRS[d][0], nc=a.c+DIRS[d][1];
    if(nr<0||nc<0||nr>=R||nc>=C) continue;
    var hit=(nr===b.r&&nc===b.c);
    if(!hit&&g[nr][nc]!==0) continue;
    if(hit) return [a,b];
    if(best[nr][nc][d]>0){ best[nr][nc][d]=0; prev[keyOf(nr,nc,d)]={r:a.r,c:a.c,d:-1}; dq.push({r:nr,c:nc,d:d,t:0}); }
  }
  for(var head=0;head<dq.length;head++){
    var cur=dq[head];
    for(var d2=0;d2<4;d2++){
      var t=cur.t+(d2===cur.d?0:1);
      if(t>2) continue;
      var r2=cur.r+DIRS[d2][0], c2=cur.c+DIRS[d2][1];
      if(r2<0||c2<0||r2>=R||c2>=C) continue;
      var hit2=(r2===b.r&&c2===b.c);
      if(!hit2&&g[r2][c2]!==0) continue;
      if(hit2){
        var pts=[b],node=cur;
        while(node&&!(node.d<0)){ pts.push({r:node.r,c:node.c}); node=prev[keyOf(node.r,node.c,node.d)]; }
        pts.push(a);
        return simplify(pts.reverse());
      }
      if(best[r2][c2][d2]>t){
        best[r2][c2][d2]=t; prev[keyOf(r2,c2,d2)]={r:cur.r,c:cur.c,d:cur.d};
        var st={r:r2,c:c2,d:d2,t:t};
        if(d2===cur.d) dq.splice(head+1,0,st); else dq.push(st);
      }
    }
  }
  return null;
}
function simplify(pts){
  var out=[pts[0]];
  for(var i=1;i<pts.length-1;i++){
    var p=out[out.length-1],q=pts[i],r=pts[i+1];
    if((p.r===q.r&&q.r===r.r)||(p.c===q.c&&q.c===r.c)) continue;
    out.push(q);
  }
  out.push(pts[pts.length-1]);
  return out;
}
function tilesOf(g){
  var map={};
  for(var r=1;r<g.length-1;r++) for(var c=1;c<g[0].length-1;c++){
    var f=g[r][c]; if(!f) continue;
    (map[f]=map[f]||[]).push({r:r,c:c});
  }
  return map;
}
function findMove(g){
  var map=tilesOf(g);
  for(var f in map){
    var list=map[f];
    for(var i=0;i<list.length;i++) for(var j=i+1;j<list.length;j++){
      var p=linkPath(g,list[i],list[j]);
      if(p) return {a:list[i],b:list[j],path:p};
    }
  }
  return null;
}
function countTiles(g){
  var n=0;
  for(var r=1;r<g.length-1;r++) for(var c=1;c<g[0].length-1;c++) if(g[r][c]) n++;
  return n;
}
function reshuffle(g,rnd){
  var cells=[],vals=[];
  for(var r=1;r<g.length-1;r++) for(var c=1;c<g[0].length-1;c++) if(g[r][c]){ cells.push([r,c]); vals.push(g[r][c]); }
  if(cells.length<4) return !!findMove(g);
  for(var k=0;k<80;k++){
    var v=shuffled(vals,rnd);
    for(var i=0;i<cells.length;i++) g[cells[i][0]][cells[i][1]]=v[i];
    if(findMove(g)) return true;
  }
  return !!findMove(g);
}
/* ==== 界面 ==== */
var $=function(id){return document.getElementById(id);};
var SAVE_KEY='link-save';
var save=loadSave();
var S=null, timer=0, lastMatch=0, combo=0, runBase=0;
var MODE=null, G=null, M=null;

function loadSave(){
  try{ var s=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}'); }catch(e){ var s={}; }
  return {max:s.max||0, best:s.best||{}, muted:s.muted===true,
    game:(s.game==='m3'||s.game==='mem')?s.game:'link',
    m3:(s.m3&&typeof s.m3==='object')?{max:s.m3.max||0,best:s.m3.best||{}}:{max:0,best:{}},
    mem:(s.mem&&typeof s.mem==='object')?{max:s.mem.max||0,best:s.mem.best||{}}:{max:0,best:{}}};
}
function storeSave(){ try{ localStorage.setItem(SAVE_KEY,JSON.stringify(save)); }catch(e){} }

function fmt(sec){
  var m=Math.floor(sec/60), s=Math.floor(sec%60);
  return (m<10?'0':'')+m+':'+(s<10?'0':'')+s;
}
var toastT=0;
function toast(msg){
  var t=$('toast'); t.textContent=msg; t.classList.add('on');
  clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove('on');},1800);
}

function toolset(on){
  $('act').hidden=!on; $('bHome').hidden=!on;
}
function setBrand(name){
  $('brand').textContent=name;
  document.title=name;
}
function renderHome(){
  MODE=null; S=null; G=null; M=null;
  setBrand('小游戏');
  $('home').hidden=false; $('game').hidden=true;
  $('hud').hidden=true; $('tools').hidden=false; toolset(false);
  stopTimer(); stopMemReveal();
  $('tiles').classList.remove('m3'); $('tiles').classList.remove('mem');
  var mode=save.game;
  $('tabLink').classList.toggle('on',mode==='link');
  $('tabM3').classList.toggle('on',mode==='m3');
  $('tabMem').classList.toggle('on',mode==='mem');
  $('lead').textContent=mode==='m3'
    ?'点相邻两张图交换位置（手机上也可以直接朝相邻方向滑动），凑齐 3 张以上相同的图即可消除得分；步数用完前达到目标分数就算过关。'
    :mode==='mem'
    ?'每关先亮牌 30 秒让你记住位置，然后全部翻面；每次翻开两张：同图即配对消掉得分，不同则翻回去；步数用完前配齐全部对子就算过关。'
    :'点两张相同的图，连线拐弯不超过两次即可消除。每关消完全部图块就算过。';
  var box=$('levels'); box.innerHTML='';
  if(mode==='m3'){
    M3_LEVELS.forEach(function(lv,i){
      var n=i+1, unlocked=n<=save.m3.max+1, b=document.createElement('button');
      b.className='lv'; b.disabled=!unlocked;
      var best=save.m3.best[n];
      b.innerHTML='<div class="t">第 '+n+' 关</div><div class="d">'+lv.c+'×'+lv.r+' · '+lv.f+' 种图 · 目标 '+lv.t+' 分 · '+lv.m+' 步'+
        (best?' · 最高 '+best:'')+(unlocked?'':' · 未解锁')+'</div>';
      b.onclick=function(){ startM3(n); };
      box.appendChild(b);
    });
    var t3=0; for(var k3 in save.m3.best) t3+=save.m3.best[k3];
    $('sMax').textContent=save.m3.max; $('sTotal').textContent=t3;
  } else if(mode==='mem'){
    MEM_LEVELS.forEach(function(lv,i){
      var n=i+1, unlocked=n<=save.mem.max+1, b=document.createElement('button');
      b.className='lv'; b.disabled=!unlocked;
      var best=save.mem.best[n];
      b.innerHTML='<div class="t">第 '+n+' 关</div><div class="d">'+lv.c+'×'+lv.r+' · '+(lv.c*lv.r/2)+' 对 · '+lv.m+' 步'+
        (best?' · 最高 '+best:'')+(unlocked?'':' · 未解锁')+'</div>';
      b.onclick=function(){ startMem(n); };
      box.appendChild(b);
    });
    var tm=0; for(var km in save.mem.best) tm+=save.mem.best[km];
    $('sMax').textContent=save.mem.max; $('sTotal').textContent=tm;
  } else {
    LEVELS.forEach(function(lv,i){
      var n=i+1, unlocked=n<=save.max+1, b=document.createElement('button');
      b.className='lv'; b.disabled=!unlocked;
      var best=save.best[n];
      b.innerHTML='<div class="t">第 '+n+' 关</div><div class="d">'+lv.c+'×'+lv.r+' · '+lv.f+' 种图 · '+fmt(lv.t)+
        (best?' · 最高 '+best:'')+(unlocked?'':' · 未解锁')+'</div>';
      b.onclick=function(){ start(n); };
      box.appendChild(b);
    });
    var total=0; for(var k in save.best) total+=save.best[k];
    $('sMax').textContent=save.max; $('sTotal').textContent=total;
  }
}

var SIDE=matchMedia('(min-width:880px)');
function keepBottom(){
  var a=$('act');
  if(SIDE.matches||a.hidden) return 12;
  return a.offsetHeight+26;
}
function stageBox(){
  var w=$('stage').clientWidth;
  var h=document.documentElement.clientHeight-$('board').getBoundingClientRect().top-keepBottom()-28;
  return {w:Math.max(w,240), h:Math.max(h,240)};
}

function start(level){
  MODE='link'; G=null; M=null;
  setBrand('连连看');
  save.game='link'; storeSave();
  var lv=LEVELS[level-1];
  $('home').hidden=true; $('game').hidden=false;
  $('hud').hidden=false; $('tools').hidden=false; toolset(true);
  $('tiles').classList.remove('m3');
  $('tiles').style.touchAction='';
  $('hL2').textContent='剩余'; $('hU2').hidden=false; $('hL4').textContent='限时';
  var box=stageBox();
  var d=deal(lv,box.w,box.h,rngOf(Date.now()&0x7fffffff));
  S={lv:lv,no:level,g:d.g,rows:d.rows,cols:d.cols,cell:d.cell,total:d.total,
     left:d.total,time:lv.t,hint:lv.h,shuf:lv.s,score:0,sel:null,locked:false};
  runBase=S.score;
  combo=0; lastMatch=0;
  var board=$('board'), size=(d.cols+2)*d.cell, height=(d.rows+2)*d.cell;
  board.style.width=size+'px'; board.style.height=height+'px';
  var line=$('line');
  line.setAttribute('viewBox','0 0 '+size+' '+height);
  line.setAttribute('width',size); line.setAttribute('height',height);
  line.innerHTML='';
  var tiles=$('tiles'); tiles.innerHTML='';
  for(var r=1;r<=d.rows;r++) for(var c=1;c<=d.cols;c++){
    var f=d.g[r][c]; if(!f) continue;
    tiles.appendChild(tileEl(r,c,f,d.cell));
  }
  $('hLv').textContent=level;
  $('bHint').disabled=false; $('bShuf').disabled=false;
  syncTools(); syncHud(); startTimer();
  ensureMusic();
}

function tileEl(r,c,f,cell){
  var el=document.createElement('div');
  el.className='tile'; el.dataset.r=r; el.dataset.c=c;
  el.style.left=(c*cell)+'px'; el.style.top=(r*cell)+'px';
  el.style.width=cell+'px'; el.style.height=cell+'px';
  var sp=document.createElement('span');
  if($('tiles').classList.contains('mem')){
    var bk=document.createElement('i'); bk.className='bk'; sp.appendChild(bk);
  }
  var img=document.createElement('img');
  img.src='img/image'+(f-1)+'.jpg'; img.alt=''; img.decoding='async';
  img.onerror=function(){ sp.classList.add('ph'); sp.textContent=f; img.remove(); };
  sp.appendChild(img); el.appendChild(sp);
  return el;
}
function tileAt(r,c){
  var list=$('tiles').children;
  for(var i=0;i<list.length;i++) if(list[i].dataset.r==r&&list[i].dataset.c==c&&!list[i].classList.contains('gone')) return list[i];
  return null;
}
function syncHud(){
  $('hLeft').textContent=S.left/2; $('hScore').textContent=S.score;
  $('hTime').textContent=fmt(S.time);
  var pct=Math.max(0,Math.min(100,S.time/S.lv.t*100));
  var bar=$('bar'); bar.style.width=pct+'%';
  bar.classList.toggle('low',S.time<=10);
}
function syncTools(){
  $('nHint').textContent=S.hint; $('nShuf').textContent=S.shuf;
  $('bHint').disabled=S.hint<=0; $('bShuf').disabled=S.shuf<=0;
}

function startTimer(){
  stopTimer();
  timer=setInterval(function(){
    if(document.hidden||!$('mask').hidden) return;
    S.time-=0.1;
    if(S.time<=0){ S.time=0; syncHud(); fail(); return; }
    syncHud();
  },100);
}
function stopTimer(){ if(timer){ clearInterval(timer); timer=0; } }

function clearSel(){ if(S&&S.sel){ var e=tileAt(S.sel.r,S.sel.c); if(e) e.classList.remove('sel'); S.sel=null; } }

function tap(r,c){
  if(!S||S.locked) return;
  var f=S.g[r][c]; if(!f) return;
  if(S.sel&&S.sel.r===r&&S.sel.c===c){ clearSel(); return; }
  if(!S.sel){ S.sel={r:r,c:c}; tileAt(r,c).classList.add('sel'); return; }
  var a=S.sel;
  if(S.g[a.r][a.c]!==f){ clearSel(); S.sel={r:r,c:c}; tileAt(r,c).classList.add('sel'); return; }
  var path=linkPath(S.g,a,{r:r,c:c});
  if(!path){
    var e1=tileAt(a.r,a.c), e2=tileAt(r,c);
    [e1,e2].forEach(function(e){ if(!e)return; e.classList.add('bad'); setTimeout(function(){e.classList.remove('bad');},240); });
    clearSel(); S.sel={r:r,c:c}; e2.classList.add('sel');
    toast('连不上，拐弯不能超过两次');
    return;
  }
  S.locked=true;
  clearSel();
  drawPath(path);
  var now=Date.now();
  combo=(now-lastMatch<4000)?combo+1:1; lastMatch=now;
  S.score+=10+Math.min(30,(combo-1)*5);
  removeTile(a.r,a.c); removeTile(r,c);
  S.g[a.r][a.c]=0; S.g[r][c]=0;
  S.left-=2;
  syncHud();
  setTimeout(function(){
    $('line').innerHTML='';
    S.locked=false;
    if(S.left<=0){ win(); return; }
    if(!findMove(S.g)){
      if(reshuffle(S.g,rngOf(Date.now()&0x7fffffff))){ repaint(); toast('没有可连的了，已自动重排'); }
    }
  },220);
}
function removeTile(r,c){ var e=tileAt(r,c); if(e){ e.classList.add('gone'); setTimeout(function(){ e.remove(); },220); } }
function repaint(){
  var tiles=$('tiles'); tiles.innerHTML='';
  for(var r=1;r<=S.rows;r++) for(var c=1;c<=S.cols;c++){
    var f=S.g[r][c]; if(!f) continue;
    tiles.appendChild(tileEl(r,c,f,S.cell));
  }
}
function drawPath(pts){
  var cell=S.cell, line=$('line');
  var ns='http://www.w3.org/2000/svg';
  var pl=document.createElementNS(ns,'polyline');
  pl.setAttribute('points',pts.map(function(p){return ((p.c+0.5)*cell)+','+((p.r+0.5)*cell);}).join(' '));
  line.appendChild(pl);
  setTimeout(function(){ pl.classList.add('out'); },120);
}

function win(){
  stopTimer();
  var bonus=Math.round(S.time)*2;
  S.score+=bonus;
  if(!save.best[S.no]||S.score>save.best[S.no]) save.best[S.no]=S.score;
  if(S.no>save.max) save.max=S.no;
  storeSave();
  var last=S.no>=LEVELS.length;
  dialog(last?'全部通关':'第 '+S.no+' 关完成',
    '用时 '+fmt(S.lv.t-S.time)+'，限时奖励 '+bonus+' 分，本关 '+S.score+' 分。',
    last?'首页':'下一关',
    last?null:'首页',
    last?renderHome:function(){ start(S.no+1); },
    last?null:renderHome);
}
function fail(){
  stopTimer();
  dialog('时间到','还剩 '+S.left/2+' 对没消完。','再来一次','首页',
    function(){ start(S.no); }, renderHome);
}
function dialog(title,text,aTxt,bTxt,aFn,bFn){
  var close=function(fn){ return function(){ $('mask').hidden=true; fn(); }; };
  $('dTitle').textContent=title; $('dText').textContent=text;
  var a=$('dA'), b=$('dB');
  a.textContent=aTxt; a.hidden=!aTxt; a.onclick=aFn?close(aFn):null;
  b.textContent=bTxt||''; b.hidden=!bTxt; b.onclick=bFn?close(bFn):null;
  $('mask').hidden=false;
}

/* ==== 美图消消乐 ==== */
var M3_LEVELS=[
  {c:6,r:5,f:5,t:900,m:28,h:5,s:3},
  {c:6,r:5,f:5,t:1000,m:28,h:5,s:3},
  {c:7,r:5,f:6,t:1150,m:31,h:4,s:3},
  {c:7,r:5,f:6,t:1250,m:31,h:4,s:3},
  {c:7,r:6,f:6,t:1350,m:33,h:4,s:2},
  {c:8,r:6,f:7,t:1500,m:36,h:3,s:2},
  {c:8,r:6,f:7,t:1600,m:36,h:3,s:2},
  {c:8,r:7,f:7,t:1700,m:38,h:3,s:2},
  {c:8,r:7,f:8,t:1800,m:38,h:2,s:2},
  {c:9,r:7,f:8,t:1950,m:41,h:2,s:2},
  {c:9,r:7,f:8,t:2050,m:41,h:2,s:1},
  {c:9,r:8,f:8,t:2150,m:43,h:2,s:1},
  {c:9,r:8,f:9,t:2250,m:43,h:2,s:1},
  {c:10,r:8,f:9,t:2400,m:46,h:1,s:1},
  {c:10,r:8,f:9,t:2500,m:46,h:1,s:1},
  {c:10,r:8,f:9,t:2600,m:46,h:1,s:1},
  {c:10,r:8,f:10,t:2700,m:46,h:1,s:1},
  {c:11,r:8,f:10,t:2900,m:49,h:1,s:0},
  {c:11,r:8,f:10,t:3050,m:49,h:1,s:0},
  {c:12,r:8,f:10,t:3200,m:52,h:1,s:0}
];
function fitM3(cols,rows,W,H){
  var cell=Math.min(W/cols,H/rows,84);
  if(cell<MIN_CELL) cell=Math.min(MIN_CELL,W/cols);
  return cell;
}
function m3SwapG(g,a,b){ var t=g[a.r][a.c]; g[a.r][a.c]=g[b.r][b.c]; g[b.r][b.c]=t; }
function m3RunAt(g,r,c){
  var v=g[r][c], n=1, k;
  if(!v) return 0;
  k=c-1; while(k>=0&&g[r][k]===v){ n++; k--; }
  k=c+1; while(k<g[r].length&&g[r][k]===v){ n++; k++; }
  if(n>=3) return n;
  n=1;
  k=r-1; while(k>=0&&g[k][c]===v){ n++; k--; }
  k=r+1; while(k<g.length&&g[k][c]===v){ n++; k++; }
  return n>=3?n:0;
}
function m3FindGroups(g){
  var groups=[], R=g.length, C=g[0].length, r, c, k;
  for(r=0;r<R;r++){
    for(c=0;c<C;){
      var v=g[r][c];
      if(!v){ c++; continue; }
      var len=1;
      while(c+len<C&&g[r][c+len]===v) len++;
      if(len>=3){ var cs=[]; for(k=0;k<len;k++) cs.push({r:r,c:c+k}); groups.push({cells:cs,len:len}); }
      c+=len;
    }
  }
  for(c=0;c<C;c++){
    for(r=0;r<R;){
      var v2=g[r][c];
      if(!v2){ r++; continue; }
      var len2=1;
      while(r+len2<R&&g[r+len2][c]===v2) len2++;
      if(len2>=3){ var cs2=[]; for(k=0;k<len2;k++) cs2.push({r:r+k,c:c}); groups.push({cells:cs2,len:len2}); }
      r+=len2;
    }
  }
  return groups;
}
function m3HasMove(g){
  var R=g.length, C=g[0].length;
  for(var r=0;r<R;r++) for(var c=0;c<C;c++){
    if(c+1<C){
      m3SwapG(g,{r:r,c:c},{r:r,c:c+1});
      var ok=m3RunAt(g,r,c)>0||m3RunAt(g,r,c+1)>0;
      m3SwapG(g,{r:r,c:c},{r:r,c:c+1});
      if(ok) return {a:{r:r,c:c},b:{r:r,c:c+1}};
    }
    if(r+1<R){
      m3SwapG(g,{r:r,c:c},{r:r+1,c:c});
      var ok2=m3RunAt(g,r,c)>0||m3RunAt(g,r+1,c)>0;
      m3SwapG(g,{r:r,c:c},{r:r+1,c:c});
      if(ok2) return {a:{r:r,c:c},b:{r:r+1,c:c}};
    }
  }
  return null;
}
function m3Clean(g,f,rnd){
  var guard=0, runs=m3FindGroups(g);
  while(runs.length&&guard++<300){
    for(var i=0;i<runs.length;i++) for(var j=0;j<runs[i].cells.length;j++){
      var p=runs[i].cells[j];
      g[p.r][p.c]=1+Math.floor(rnd()*f);
    }
    runs=m3FindGroups(g);
  }
}
function m3Deal(lv,rnd){
  var g=[], r, c;
  for(r=0;r<lv.r;r++){ var row=[]; for(c=0;c<lv.c;c++) row.push(1+Math.floor(rnd()*lv.f)); g.push(row); }
  m3Clean(g,lv.f,rnd);
  var tries=0;
  while(!m3HasMove(g)&&tries++<60){
    for(r=0;r<lv.r;r++) for(c=0;c<lv.c;c++) g[r][c]=1+Math.floor(rnd()*lv.f);
    m3Clean(g,lv.f,rnd);
  }
  return g;
}
function startM3(level){
  MODE='m3'; S=null; M=null;
  setBrand('美图消消乐');
  save.game='m3'; storeSave();
  var lv=M3_LEVELS[level-1];
  $('home').hidden=true; $('game').hidden=false;
  $('hud').hidden=false; $('tools').hidden=false; toolset(true);
  $('tiles').classList.add('m3');
  $('hL2').textContent='步数'; $('hU2').hidden=true; $('hL4').textContent='目标';
  $('tiles').style.touchAction='none';
  var box=stageBox();
  var cell=fitM3(lv.c,lv.r,box.w,box.h);
  G={lv:lv,no:level,g:m3Deal(lv,rngOf(Date.now()&0x7fffffff)),rows:lv.r,cols:lv.c,cell:cell,
     moves:lv.m,hint:lv.h,shuf:lv.s,score:0,sel:null,locked:false,over:false};
  combo=0; lastMatch=0;
  var board=$('board'), w=lv.c*cell, h=lv.r*cell;
  board.style.width=w+'px'; board.style.height=h+'px';
  var line=$('line');
  line.setAttribute('viewBox','0 0 '+w+' '+h);
  line.setAttribute('width',w); line.setAttribute('height',h);
  line.innerHTML='';
  m3Repaint();
  $('hLv').textContent=level;
  syncM3Tools(); syncM3Hud(); stopTimer();
  ensureMusic();
}
function m3Repaint(){
  var tiles=$('tiles'); tiles.innerHTML='';
  for(var r=0;r<G.rows;r++) for(var c=0;c<G.cols;c++){
    var f=G.g[r][c]; if(!f) continue;
    tiles.appendChild(tileEl(r,c,f,G.cell));
  }
}
function m3SetPos(el,r,c){
  el.dataset.r=r; el.dataset.c=c;
  el.style.left=(c*G.cell)+'px'; el.style.top=(r*G.cell)+'px';
}
function syncM3Hud(){
  $('hLeft').textContent=G.moves; $('hScore').textContent=G.score;
  $('hTime').textContent=G.lv.t;
  var pct=Math.max(0,Math.min(100,G.score/G.lv.t*100));
  var bar=$('bar'); bar.style.width=pct+'%';
  bar.classList.toggle('low',G.moves<=3);
}
function syncM3Tools(){
  $('nHint').textContent=G.hint; $('nShuf').textContent=G.shuf;
  $('bHint').disabled=G.hint<=0; $('bShuf').disabled=G.shuf<=0;
}
function m3ClearSel(){
  if(G&&G.sel){ var e=tileAt(G.sel.r,G.sel.c); if(e) e.classList.remove('sel'); G.sel=null; }
}
function m3Tap(r,c){
  if(!G||G.locked||G.over) return;
  if(!G.g[r][c]) return;
  if(G.sel&&G.sel.r===r&&G.sel.c===c){ m3ClearSel(); return; }
  if(!G.sel){ G.sel={r:r,c:c}; var e0=tileAt(r,c); if(e0) e0.classList.add('sel'); return; }
  var a=G.sel;
  if(Math.abs(a.r-r)+Math.abs(a.c-c)!==1){
    m3ClearSel(); G.sel={r:r,c:c};
    var e1=tileAt(r,c); if(e1) e1.classList.add('sel');
    return;
  }
  G.locked=true;
  m3ClearSel();
  m3SwapG(G.g,a,{r:r,c:c});
  var ea=tileAt(a.r,a.c), eb=tileAt(r,c);
  if(ea) m3SetPos(ea,r,c);
  if(eb) m3SetPos(eb,a.r,a.c);
  setTimeout(function(){ m3AfterSwap(a,{r:r,c:c}); },200);
}
function m3AfterSwap(a,b){
  var groups=m3FindGroups(G.g);
  if(!groups.length){
    m3SwapG(G.g,a,b);
    var ex=tileAt(b.r,b.c), ey=tileAt(a.r,a.c);
    if(ex) m3SetPos(ex,a.r,a.c);
    if(ey) m3SetPos(ey,b.r,b.c);
    [ex,ey].forEach(function(e){ if(!e)return; e.classList.add('bad'); setTimeout(function(){e.classList.remove('bad');},240); });
    toast('这样换没有能消的');
    setTimeout(function(){ G.locked=false; },200);
    return;
  }
  G.moves--; syncM3Hud();
  m3Resolve(groups,1);
}
function m3Resolve(groups,depth){
  var gain=0;
  for(var i=0;i<groups.length;i++){
    var len=groups[i].len;
    gain+=len*10*depth+(len===4?30:len>=5?60:0);
  }
  G.score+=gain;
  for(var i2=0;i2<groups.length;i2++) for(var j=0;j<groups[i2].cells.length;j++){
    var p=groups[i2].cells[j];
    if(!G.g[p.r][p.c]) continue;
    G.g[p.r][p.c]=0;
    var e=tileAt(p.r,p.c);
    if(e){ e.classList.add('gone'); (function(el){ setTimeout(function(){ el.remove(); },200); })(e); }
  }
  syncM3Hud();
  setTimeout(function(){ m3AfterClear(depth); },240);
}
function m3AfterClear(depth){
  if(G.score>=G.lv.t){ m3Win(); return; }
  m3Fall(function(){
    var groups=m3FindGroups(G.g);
    if(groups.length){ m3Resolve(groups,depth+1); return; }
    if(!m3HasMove(G.g)){
      m3Reshuffle(); m3Repaint();
      toast('没有能换的了，已自动重排');
    }
    if(G.moves<=0){ m3Fail(); return; }
    G.locked=false;
  });
}
function m3Fall(done){
  var tiles=$('tiles'), fresh=[], spawned=false;
  for(var c=0;c<G.cols;c++){
    var write=G.rows-1;
    for(var r=G.rows-1;r>=0;r--){
      if(G.g[r][c]){
        if(write!==r){
          G.g[write][c]=G.g[r][c]; G.g[r][c]=0;
          var el=tileAt(r,c);
          if(el) m3SetPos(el,write,c);
        }
        write--;
      }
    }
    var need=write+1;
    for(var r2=need-1;r2>=0;r2--){
      var f=1+Math.floor(Math.random()*G.lv.f);
      G.g[r2][c]=f;
      var el2=tileEl(r2,c,f,G.cell);
      el2.style.top=((r2-need)*G.cell)+'px';
      tiles.appendChild(el2);
      fresh.push({el:el2,r:r2});
      spawned=true;
    }
  }
  if(!spawned){ done(); return; }
  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    for(var i=0;i<fresh.length;i++) fresh[i].el.style.top=(fresh[i].r*G.cell)+'px';
    setTimeout(done,240);
  });});
}
function m3Reshuffle(){
  var cells=[], vals=[], r, c;
  for(r=0;r<G.rows;r++) for(c=0;c<G.cols;c++) if(G.g[r][c]){ cells.push([r,c]); vals.push(G.g[r][c]); }
  if(cells.length<4) return;
  var rnd=rngOf(Date.now()&0x7fffffff);
  for(var k=0;k<120;k++){
    var v=shuffled(vals,rnd);
    for(var i=0;i<cells.length;i++) G.g[cells[i][0]][cells[i][1]]=v[i];
    if(!m3FindGroups(G.g).length&&m3HasMove(G.g)) return;
  }
  G.g=m3Deal(G.lv,rngOf(Date.now()&0x7fffffff));
}
function m3Hint(){
  if(!G||G.hint<=0||G.locked) return;
  var mv=m3HasMove(G.g);
  if(!mv){ toast('没有能换的，试试重排'); return; }
  G.hint--; syncM3Tools();
  [tileAt(mv.a.r,mv.a.c),tileAt(mv.b.r,mv.b.c)].forEach(function(e){
    if(!e) return; e.classList.add('hint');
    setTimeout(function(){e.classList.remove('hint');},2600);
  });
}
function m3ShufBtn(){
  if(!G||G.shuf<=0||G.locked) return;
  G.shuf--; m3ClearSel();
  m3Reshuffle(); m3Repaint(); syncM3Tools();
}
function m3Win(){
  G.over=true;
  var bonus=G.moves*15;
  G.score+=bonus;
  if(!save.m3.best[G.no]||G.score>save.m3.best[G.no]) save.m3.best[G.no]=G.score;
  if(G.no>save.m3.max) save.m3.max=G.no;
  storeSave();
  var last=G.no>=M3_LEVELS.length;
  dialog(last?'全部通关':'第 '+G.no+' 关完成',
    '剩 '+G.moves+' 步，奖励 '+bonus+' 分，本关 '+G.score+' 分。',
    last?'首页':'下一关',
    last?null:'首页',
    last?renderHome:function(){ startM3(G.no+1); },
    last?null:renderHome);
}
function m3Fail(){
  dialog('步数用完','离目标还差 '+(G.lv.t-G.score)+' 分。','再来一次','首页',
    function(){ startM3(G.no); }, renderHome);
}

/* ==== 记忆翻牌 ==== */
var MEM_LEVELS=[
  {c:4,r:3,f:6,m:14,h:4,s:2},
  {c:4,r:4,f:8,m:18,h:4,s:2},
  {c:5,r:4,f:10,m:22,h:3,s:2},
  {c:6,r:4,f:12,m:26,h:3,s:2},
  {c:6,r:4,f:12,m:24,h:3,s:1},
  {c:7,r:4,f:14,m:28,h:3,s:1},
  {c:6,r:5,f:15,m:30,h:3,s:1},
  {c:8,r:4,f:16,m:33,h:2,s:1},
  {c:8,r:4,f:16,m:30,h:2,s:1},
  {c:9,r:4,f:18,m:34,h:2,s:1},
  {c:8,r:5,f:20,m:38,h:2,s:1},
  {c:10,r:4,f:20,m:36,h:2,s:1},
  {c:8,r:6,f:24,m:44,h:2,s:1},
  {c:10,r:5,f:25,m:46,h:1,s:1},
  {c:12,r:4,f:24,m:43,h:1,s:1},
  {c:10,r:6,f:30,m:54,h:1,s:1},
  {c:12,r:5,f:30,m:53,h:1,s:1},
  {c:12,r:5,f:30,m:50,h:1,s:0},
  {c:12,r:5,f:30,m:48,h:1,s:0},
  {c:12,r:5,f:30,m:46,h:1,s:0}
];
var MEM_REVEAL=30;
function startMem(level){
  MODE='mem'; S=null; G=null;
  setBrand('记忆翻牌');
  save.game='mem'; storeSave();
  var lv=MEM_LEVELS[level-1];
  $('home').hidden=true; $('game').hidden=false;
  $('hud').hidden=false; $('tools').hidden=false; toolset(true);
  $('tiles').classList.remove('m3'); $('tiles').classList.add('mem');
  $('hL2').textContent='剩余'; $('hU2').hidden=false; $('hL4').textContent='步数';
  $('tiles').style.touchAction='';
  var box=stageBox();
  var cell=fitM3(lv.c,lv.r,box.w,box.h);
  var rnd=rngOf(Date.now()&0x7fffffff);
  var pairs=lv.c*lv.r/2, deck=[];
  for(var i=0;i<pairs;i++){ deck.push(1+i%lv.f); deck.push(1+i%lv.f); }
  deck=shuffled(deck,rnd);
  var g=[], k=0;
  for(var r=0;r<lv.r;r++){ var row=[]; for(var c=0;c<lv.c;c++) row.push(deck[k++]); g.push(row); }
  M={lv:lv,no:level,g:g,rows:lv.r,cols:lv.c,cell:cell,pairs:pairs,left:pairs,
     moves:lv.m,hint:lv.h,shuf:lv.s,score:0,streak:0,first:null,busy:false,over:false,reveal:MEM_REVEAL};
  combo=0; lastMatch=0;
  var board=$('board'), w=lv.c*cell, h=lv.r*cell;
  board.style.width=w+'px'; board.style.height=h+'px';
  var line=$('line'); line.innerHTML='';
  memRepaint();
  $('hLv').textContent=level;
  syncMemTools(); syncMemHud(); stopTimer();
  startMemReveal();
  ensureMusic();
}
function memRepaint(){
  var tiles=$('tiles'); tiles.innerHTML='';
  for(var r=0;r<M.rows;r++) for(var c=0;c<M.cols;c++){
    var f=M.g[r][c]; if(!f) continue;
    var el=tileEl(r,c,f,M.cell);
    if(!M.reveal) el.classList.add('down');
    tiles.appendChild(el);
  }
}
var revT=0;
function stopMemReveal(){ if(revT){ clearInterval(revT); revT=0; } }
function startMemReveal(){
  stopMemReveal();
  M.busy=true;
  $('hL4').textContent='明牌';
  toast('所有牌亮 '+MEM_REVEAL+' 秒，快记住位置！');
  syncMemHud();
  revT=setInterval(function(){
    if(!M){ stopMemReveal(); return; }
    if(document.hidden||!$('mask').hidden) return;
    M.reveal--;
    if(M.reveal<=0){
      M.reveal=0;
      stopMemReveal();
      var ts=$('tiles').children;
      for(var i=0;i<ts.length;i++) if(!ts[i].classList.contains('gone')) ts[i].classList.add('down');
      $('hL4').textContent='步数';
      M.busy=false;
      toast('翻面！开始配对吧');
    }
    syncMemHud();
  },1000);
}
function syncMemHud(){
  $('hLeft').textContent=M.left; $('hScore').textContent=M.score;
  $('hTime').textContent=M.reveal>0?M.reveal:M.moves;
  var pct=M.reveal>0?M.reveal/MEM_REVEAL*100:(M.pairs?Math.max(0,Math.min(100,(M.pairs-M.left)/M.pairs*100)):0);
  var bar=$('bar'); bar.style.width=pct+'%';
  bar.classList.toggle('low',M.reveal>0?M.reveal<=10:M.moves<=3);
}
function syncMemTools(){
  $('nHint').textContent=M.hint; $('nShuf').textContent=M.shuf;
  $('bHint').disabled=M.hint<=0; $('bShuf').disabled=M.shuf<=0;
}
function memTap(r,c){
  if(!M||M.busy||M.over) return;
  if(!M.g[r][c]) return;
  var el=tileAt(r,c); if(!el) return;
  if(M.first&&M.first.r===r&&M.first.c===c){
    el.classList.add('down'); el.classList.remove('sel');
    M.first=null; return;
  }
  if(!el.classList.contains('down')) return;
  el.classList.remove('down');
  if(!M.first){ M.first={r:r,c:c}; el.classList.add('sel'); return; }
  var a=M.first; M.first=null;
  var ea=tileAt(a.r,a.c);
  if(ea) ea.classList.remove('sel');
  M.moves--;
  if(M.g[a.r][a.c]===M.g[r][c]){
    M.streak++; M.left--;
    M.score+=20+Math.min(50,(M.streak-1)*10);
    M.busy=true; syncMemHud();
    setTimeout(function(){
      [ea,el].forEach(function(e){
        if(!e) return;
        e.classList.add('gone');
        (function(el2){ setTimeout(function(){ el2.remove(); },240); })(e);
      });
      M.g[a.r][a.c]=0; M.g[r][c]=0;
      M.busy=false;
      syncMemHud();
      if(M.left<=0) setTimeout(memWin,260);
    },380);
  } else {
    M.streak=0; M.busy=true; syncMemHud();
    [ea,el].forEach(function(e){ if(e) e.classList.add('bad'); });
    setTimeout(function(){
      [ea,el].forEach(function(e){ if(!e) return; e.classList.remove('bad'); e.classList.add('down'); });
      M.busy=false; syncMemHud();
      if(M.moves<=0) memFail();
    },780);
  }
}
function memHint(){
  if(!M||M.hint<=0||M.busy||M.over) return;
  if(M.first){
    var fe=tileAt(M.first.r,M.first.c);
    if(fe){ fe.classList.add('down'); fe.classList.remove('sel'); }
    M.first=null;
  }
  var map={};
  for(var r=0;r<M.rows;r++) for(var c=0;c<M.cols;c++){
    var f=M.g[r][c]; if(!f) continue;
    (map[f]=map[f]||[]).push({r:r,c:c});
  }
  var pair=null;
  for(var k in map){ if(map[k].length>=2){ pair=map[k].slice(0,2); break; } }
  if(!pair){ toast('没有可配的了'); return; }
  M.hint--; syncMemTools();
  M.busy=true;
  var els=pair.map(function(p){ var e=tileAt(p.r,p.c); if(e){ e.classList.remove('down'); e.classList.add('hint'); } return e; });
  setTimeout(function(){
    els.forEach(function(e){
      if(!e) return;
      e.classList.remove('hint');
      if(!e.classList.contains('gone')) e.classList.add('down');
    });
    M.busy=false;
  },1500);
}
function memShufBtn(){
  if(!M||M.shuf<=0||M.busy||M.over) return;
  M.shuf--; syncMemTools();
  var cells=[], vals=[];
  for(var r=0;r<M.rows;r++) for(var c=0;c<M.cols;c++) if(M.g[r][c]){ cells.push([r,c]); vals.push(M.g[r][c]); }
  if(!cells.length) return;
  var v=shuffled(vals,rngOf(Date.now()&0x7fffffff));
  for(var i=0;i<cells.length;i++) M.g[cells[i][0]][cells[i][1]]=v[i];
  M.first=null; M.streak=0; M.busy=false;
  memRepaint();
}
function memWin(){
  M.over=true;
  var bonus=M.moves*15;
  M.score+=bonus;
  if(!save.mem.best[M.no]||M.score>save.mem.best[M.no]) save.mem.best[M.no]=M.score;
  if(M.no>save.mem.max) save.mem.max=M.no;
  storeSave();
  var last=M.no>=MEM_LEVELS.length;
  dialog(last?'全部通关':'第 '+M.no+' 关完成',
    '剩 '+M.moves+' 步，奖励 '+bonus+' 分，本关 '+M.score+' 分。',
    last?'首页':'下一关',
    last?null:'首页',
    last?renderHome:function(){ startMem(M.no+1); },
    last?null:renderHome);
}
function memFail(){
  dialog('步数用完','还剩 '+M.left+' 对没配上。','再来一次','首页',
    function(){ startMem(M.no); }, renderHome);
}

var bgm=$('bgm');
var METING_API='https://api.injahow.cn/meting/?server=netease&type=playlist&id=9086662585';
var SILENT_WAV='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
var playlistUrls=null, playlistP=null, musN=-1, unlocked=false, pendingPlay=false, trackRetries=0;
function loadPlaylist(){
  if(playlistP) return playlistP;
  playlistP=fetch(METING_API).then(function(r){ return r.json(); }).then(function(list){
    playlistUrls=(list||[]).filter(function(t){ return t&&t.url; }).map(function(t){ return t.url; });
    return playlistUrls;
  }).catch(function(){ playlistP=null; return []; });
  return playlistP;
}
loadPlaylist();
function unlockBgm(){
  if(unlocked) return; unlocked=true;
  bgm.src=SILENT_WAV;
  var p=bgm.play(); if(p&&p.catch) p.catch(function(){});
}
function nextMusic(auto){
  loadPlaylist().then(function(list){
    if(!list||!list.length) return;
    var i=Math.floor(Math.random()*list.length);
    if(list.length>1) while(i===musN) i=Math.floor(Math.random()*list.length);
    musN=i; bgm.src=list[i];
    if(auto&&!save.muted){ var p=bgm.play(); if(p&&p.catch) p.catch(function(){}); }
  });
}
bgm.addEventListener('ended',function(){ nextMusic(true); });
bgm.addEventListener('error',function(){
  if(save.muted||trackRetries>=5) return;
  trackRetries++; nextMusic(true);
});
function syncMusic(){
  var b=$('bMusic'), lab=save.muted?'音乐关':'音乐开';
  b.classList.toggle('off',!!save.muted);
  b.title=lab; b.setAttribute('aria-label',lab);
}
function ensureMusic(){
  syncMusic();
  if(save.muted){ bgm.pause(); return; }
  unlockBgm();
  if(playlistUrls&&playlistUrls.length){
    if(!bgm.src||bgm.src.indexOf('data:')===0){ nextMusic(true); }
    else { var p=bgm.play(); if(p&&p.catch) p.catch(function(){ toast('点一下屏幕才能出声'); }); }
  } else {
    pendingPlay=true;
    loadPlaylist().then(function(list){
      if(pendingPlay&&list&&list.length){ pendingPlay=false; nextMusic(true); }
    });
  }
}

$('tiles').addEventListener('click',function(e){
  var t=e.target.closest('.tile'); if(!t) return;
  if(MODE==='mem') memTap(+t.dataset.r,+t.dataset.c);
  else if(MODE==='m3') m3Tap(+t.dataset.r,+t.dataset.c);
  else tap(+t.dataset.r,+t.dataset.c);
});
var swipe=null;
$('tiles').addEventListener('touchstart',function(e){
  if(MODE!=='m3'||!G||G.locked||G.over||swipe) return;
  var t=e.target.closest('.tile'); if(!t) return;
  var p=e.touches[0];
  swipe={x:p.clientX,y:p.clientY,r:+t.dataset.r,c:+t.dataset.c,done:false};
},{passive:true});
$('tiles').addEventListener('touchmove',function(e){
  if(!swipe||swipe.done) return;
  var p=e.touches[0];
  var dx=p.clientX-swipe.x, dy=p.clientY-swipe.y;
  var th=Math.max(18,G.cell*0.35);
  if(Math.abs(dx)<th&&Math.abs(dy)<th) return;
  swipe.done=true;
  var tr=swipe.r, tc=swipe.c;
  if(Math.abs(dx)>=Math.abs(dy)) tc+=dx>0?1:-1;
  else tr+=dy>0?1:-1;
  if(tr<0||tr>=G.rows||tc<0||tc>=G.cols) return;
  if(!G.g[tr][tc]) return;
  m3ClearSel();
  m3Tap(swipe.r,swipe.c);
  m3Tap(tr,tc);
},{passive:true});
$('tiles').addEventListener('touchend',function(){ setTimeout(function(){ swipe=null; },0); },{passive:true});
$('tiles').addEventListener('touchcancel',function(){ swipe=null; },{passive:true});
$('bHint').onclick=function(){
  if(MODE==='mem'){ memHint(); return; }
  if(MODE==='m3'){ m3Hint(); return; }
  if(!S||S.hint<=0) return;
  var mv=findMove(S.g);
  if(!mv){ toast('没有可连的'); return; }
  S.hint--; syncTools();
  [tileAt(mv.a.r,mv.a.c),tileAt(mv.b.r,mv.b.c)].forEach(function(e){
    if(!e) return; e.classList.add('hint');
    e.scrollIntoView({block:'nearest',inline:'nearest'});
    setTimeout(function(){e.classList.remove('hint');},2600);
  });
};
$('bShuf').onclick=function(){
  if(MODE==='mem'){ memShufBtn(); return; }
  if(MODE==='m3'){ m3ShufBtn(); return; }
  if(!S||S.shuf<=0) return;
  S.shuf--; clearSel();
  reshuffle(S.g,rngOf(Date.now()&0x7fffffff)); repaint(); syncTools();
};
$('bRetry').onclick=function(){ if(M) startMem(M.no); else if(G) startM3(G.no); else if(S) start(S.no); };
$('bHome').onclick=renderHome;
$('bMusic').onclick=function(){
  save.muted=!save.muted; storeSave();
  if(save.muted) bgm.pause(); else ensureMusic();
  syncMusic();
};
$('tabLink').onclick=function(){ save.game='link'; storeSave(); renderHome(); };
$('tabM3').onclick=function(){ save.game='m3'; storeSave(); renderHome(); };
$('tabMem').onclick=function(){ save.game='mem'; storeSave(); renderHome(); };
var rsT=0;
addEventListener('resize',function(){
  if($('game').hidden) return;
  clearTimeout(rsT);
  rsT=setTimeout(function(){
    if(MODE==='mem'&&M){
      var boxm=stageBox();
      var cellm=fitM3(M.cols,M.rows,boxm.w,boxm.h);
      if(Math.abs(cellm-M.cell)<1) return;
      M.cell=cellm; M.first=null; M.busy=false;
      var boardm=$('board');
      boardm.style.width=(M.cols*cellm)+'px'; boardm.style.height=(M.rows*cellm)+'px';
      memRepaint();
      return;
    }
    if(MODE==='m3'&&G){
      var box3=stageBox();
      var cell3=fitM3(G.cols,G.rows,box3.w,box3.h);
      if(Math.abs(cell3-G.cell)<1) return;
      G.cell=cell3;
      var board3=$('board');
      board3.style.width=(G.cols*cell3)+'px'; board3.style.height=(G.rows*cell3)+'px';
      var line3=$('line');
      line3.setAttribute('viewBox','0 0 '+(G.cols*cell3)+' '+(G.rows*cell3));
      line3.setAttribute('width',G.cols*cell3); line3.setAttribute('height',G.rows*cell3);
      m3Repaint();
      return;
    }
    if(!S) return;
    var box=stageBox();
    var cell=Math.min(box.w/(S.cols+2),84,Math.max(MIN_CELL,box.h/(S.rows+2)));
    if(Math.abs(cell-S.cell)<1) return;
    S.cell=cell;
    var size=(S.cols+2)*cell, height=(S.rows+2)*cell, board=$('board');
    board.style.width=size+'px'; board.style.height=height+'px';
    var line=$('line'); line.setAttribute('viewBox','0 0 '+size+' '+height);
    line.setAttribute('width',size); line.setAttribute('height',height);
    repaint();
  },200);
});

$('hLvMax').textContent=LEVELS.length; $('sMaxAll').textContent=LEVELS.length;
syncMusic();
renderHome();
