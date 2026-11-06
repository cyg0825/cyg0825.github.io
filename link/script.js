/* ==== 核心逻辑 ==== */
var LEVELS=[
  {c:6,r:4,f:6,t:90,h:5,s:3},
  {c:8,r:4,f:8,t:100,h:5,s:3},
  {c:8,r:5,f:10,t:115,h:4,s:3},
  {c:10,r:5,f:12,t:130,h:4,s:3},
  {c:10,r:6,f:14,t:145,h:4,s:2},
  {c:12,r:6,f:16,t:165,h:3,s:2},
  {c:12,r:7,f:18,t:185,h:3,s:2},
  {c:12,r:8,f:20,t:210,h:3,s:2},
  {c:14,r:8,f:22,t:240,h:2,s:2},
  {c:16,r:8,f:24,t:270,h:2,s:2},
  {c:14,r:10,f:24,t:285,h:2,s:1},
  {c:16,r:9,f:26,t:300,h:2,s:1},
  {c:18,r:8,f:26,t:310,h:2,s:1},
  {c:16,r:10,f:28,t:325,h:1,s:1},
  {c:18,r:9,f:28,t:335,h:1,s:1},
  {c:20,r:8,f:30,t:350,h:1,s:1},
  {c:18,r:10,f:30,t:365,h:1,s:1},
  {c:20,r:9,f:30,t:380,h:1,s:0},
  {c:22,r:8,f:30,t:395,h:1,s:0},
  {c:20,r:10,f:30,t:410,h:1,s:0}
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
      else tight.push({c:cc,r:rr,cell:MIN_CELL,over:(cc+2)*MIN_CELL-W+(rr+2)*MIN_CELL-H});
    }
  }
  if(fits.length){
    fits.sort(function(a,b){return b.score-a.score;});
    return fits[0];
  }
  if(tight.length){
    tight.sort(function(a,b){return a.over-b.over;});
    return tight[0];
  }
  var c2=Math.max(4,Math.min(24,specC)); var r2=Math.ceil(n/c2);
  return {c:c2,r:r2,cell:Math.max(MIN_CELL,Math.min(W/(c2+2),H/(r2+2),84))};
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

function loadSave(){
  try{ var s=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}'); }catch(e){ var s={}; }
  return {max:s.max||0, best:s.best||{}, muted:s.muted===true};
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
  ['bHint','bShuf','bRetry','bHome'].forEach(function(id){ $(id).hidden=!on; });
}
function renderHome(){
  $('home').hidden=false; $('game').hidden=true;
  $('hud').hidden=true; $('tools').hidden=false; toolset(false);
  stopTimer();
  var box=$('levels'); box.innerHTML='';
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

function fitStage(){
  var top=$('stage').getBoundingClientRect().top;
  $('stage').style.maxHeight=Math.max(240, document.documentElement.clientHeight-top-12)+'px';
}
function stageBox(){
  var w=Math.min(document.documentElement.clientWidth,1240)-32;
  var h=document.documentElement.clientHeight-$('board').getBoundingClientRect().top-40;
  return {w:Math.max(w,240), h:Math.max(h,240)};
}

function start(level){
  var lv=LEVELS[level-1];
  $('home').hidden=true; $('game').hidden=false;
  $('hud').hidden=false; $('tools').hidden=false; toolset(true);
  fitStage();
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

var bgm=$('bgm');
var MUSIC=['/vo/1.mp3','/vo/2.mp3','/vo/3.mp3','/vo/4.mp3'], musN=-1;
function nextMusic(){
  var i=Math.floor(Math.random()*MUSIC.length);
  if(MUSIC.length>1) while(i===musN) i=Math.floor(Math.random()*MUSIC.length);
  musN=i; bgm.src=MUSIC[i];
}
bgm.addEventListener('ended',function(){
  nextMusic();
  if(!save.muted) bgm.play().catch(function(){});
});
function ensureMusic(){
  $('bMusic').textContent=save.muted?'音乐关':'音乐开';
  if(save.muted){ bgm.pause(); return; }
  if(!bgm.src) nextMusic();
  var p=bgm.play();
  if(p&&p.catch) p.catch(function(){ $('bMusic').textContent='音乐未播'; });
}

$('tiles').addEventListener('click',function(e){
  var t=e.target.closest('.tile'); if(!t) return;
  tap(+t.dataset.r,+t.dataset.c);
});
$('bHint').onclick=function(){
  if(!S||S.hint<=0) return;
  var mv=findMove(S.g);
  if(!mv){ toast('没有可连的'); return; }
  S.hint--; syncTools();
  var b=$('board');
  [tileAt(mv.a.r,mv.a.c),tileAt(mv.b.r,mv.b.c)].forEach(function(e){
    if(!e) return; e.classList.add('hint');
    var st=$('stage'); if(b.offsetWidth>st.clientWidth||b.offsetHeight>st.clientHeight) e.scrollIntoView({block:'nearest',inline:'nearest'});
    setTimeout(function(){e.classList.remove('hint');},1800);
  });
};
$('bShuf').onclick=function(){
  if(!S||S.shuf<=0) return;
  S.shuf--; clearSel();
  reshuffle(S.g,rngOf(Date.now()&0x7fffffff)); repaint(); syncTools();
};
$('bRetry').onclick=function(){ if(S) start(S.no); };
$('bHome').onclick=renderHome;
$('bMusic').onclick=function(){
  save.muted=!save.muted; storeSave();
  if(save.muted) bgm.pause(); else ensureMusic();
  $('bMusic').textContent=save.muted?'音乐关':'音乐开';
};
var rsT=0;
addEventListener('resize',function(){
  if(!S||$('game').hidden) return;
  clearTimeout(rsT);
  rsT=setTimeout(function(){
    var box=stageBox();
    var cell=Math.min(box.w/(S.cols+2),box.h/(S.rows+2),84);
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
$('bMusic').textContent=save.muted?'音乐关':'音乐开';
renderHome();
