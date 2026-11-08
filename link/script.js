/* ==== 核心逻辑 ==== */
var LEVELS=[
  {c:6,r:4,f:6,t:150,h:5,s:3},
  {c:8,r:4,f:8,t:180,h:5,s:3},
  {c:6,r:6,f:6,t:200,h:4,s:3},
  {c:8,r:6,f:8,t:260,h:4,s:3},
  {c:8,r:6,f:12,t:280,h:4,s:2},
  {c:10,r:6,f:10,t:300,h:3,s:2},
  {c:8,r:8,f:8,t:300,h:3,s:2},
  {c:10,r:8,f:10,t:360,h:3,s:2},
  {c:10,r:8,f:16,t:380,h:2,s:2},
  {c:10,r:8,f:20,t:400,h:2,s:2},
  {c:12,r:8,f:12,t:340,h:2,s:1},
  {c:10,r:10,f:10,t:350,h:2,s:1},
  {c:10,r:10,f:20,t:370,h:2,s:1},
  {c:12,r:10,f:12,t:400,h:1,s:1},
  {c:12,r:10,f:20,t:440,h:1,s:1,grav:'left'},
  {c:12,r:10,f:24,t:420,h:1,s:1},
  {c:14,r:10,f:14,t:460,h:1,s:1},
  {c:12,r:12,f:24,t:500,h:1,s:0,grav:'center'},
  {c:14,r:12,f:28,t:560,h:1,s:0},
  {c:15,r:12,f:30,t:640,h:1,s:2,grav:'random'}
];
var GRAV_TXT={left:'聚拢·左',center:'聚拢·中',random:'聚拢·随机'};
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
function compactG(g,mode){
  var R=g.length,C=g[0].length,r,c,i;
  var dir=mode==='random'?['left','right','up','down'][Math.floor(Math.random()*4)]:mode;
  if(dir==='left'||dir==='right'){
    for(r=1;r<R-1;r++){
      var vals=[]; for(c=1;c<C-1;c++) if(g[r][c]) vals.push(g[r][c]);
      for(c=1;c<C-1;c++) g[r][c]=0;
      var st=dir==='left'?1:C-1-vals.length;
      for(i=0;i<vals.length;i++) g[r][st+i]=vals[i];
    }
  } else if(dir==='up'||dir==='down'){
    for(c=1;c<C-1;c++){
      var vals2=[]; for(r=1;r<R-1;r++) if(g[r][c]) vals2.push(g[r][c]);
      for(r=1;r<R-1;r++) g[r][c]=0;
      var st2=dir==='up'?1:R-1-vals2.length;
      for(i=0;i<vals2.length;i++) g[st2+i][c]=vals2[i];
    }
  } else if(dir==='center'){
    for(r=1;r<R-1;r++){
      var vals3=[]; for(c=1;c<C-1;c++) if(g[r][c]) vals3.push(g[r][c]);
      for(c=1;c<C-1;c++) g[r][c]=0;
      var st3=1+Math.floor((C-2-vals3.length)/2);
      for(i=0;i<vals3.length;i++) g[r][st3+i]=vals3[i];
    }
  }
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
  $('goals').hidden=true; $('ov').innerHTML='';
  setBrand('小游戏');
  $('home').hidden=false; $('game').hidden=true;
  $('hud').hidden=true; $('tools').hidden=false; toolset(false);
  stopTimer(); stopMemReveal(); stopMemPair();
  $('tiles').classList.remove('m3'); $('tiles').classList.remove('mem');
  var mode=save.game;
  $('sMaxAll').textContent=mode==='m3'?M3_LEVELS.length:mode==='mem'?MEM_LEVELS.length:LEVELS.length;
  $('tabLink').classList.toggle('on',mode==='link');
  $('tabM3').classList.toggle('on',mode==='m3');
  $('tabMem').classList.toggle('on',mode==='mem');
  $('lead').textContent=mode==='m3'
    ?'点相邻两张图交换位置（手机上也可以直接朝相邻方向滑动），凑齐 3 张以上相同的图即可消除；步数用完前完成本关全部目标即过关。半透明冰块要消掉它下面的图案，木箱要消掉相邻的图案；掉落物从顶部沿标出的出口列落下，消掉它所在列的图案才会逐格下沉，落到最底行（金色边）才收集。'
    :mode==='mem'
    ?'每关先亮牌若干秒记住位置，然后全部翻面；每次翻两张，同图即配对消掉得分，配齐全部对子即过关。第 5 关起有配对限时和允许犯错次数，超时或犯错超限即失败。'
    :'点两张相同的图，连线拐弯不超过两次即可消除。每关消完全部图块就算过。';
  var box=$('levels'); box.innerHTML='';
  if(mode==='m3'){
    M3_LEVELS.forEach(function(lv,i){
      var n=i+1, unlocked=n<=Math.min(save.m3.max+1,M3_LEVELS.length), b=document.createElement('button');
      b.className='lv'; b.disabled=!unlocked;
      var best=save.m3.best[n];
      b.innerHTML='<div class="t">第 '+n+' 关 · '+lv.type+'</div><div class="d">'+lv.c+'×'+lv.r+' · '+lv.f+' 种图 · '+lv.gt+' · '+lv.m+' 步'+
        (lv.sp?' · '+lv.sp:'')+(best?' · 最高 '+best:'')+(unlocked?'':' · 未解锁')+'</div>';
      b.onclick=function(){ startM3(n); };
      box.appendChild(b);
    });
    var t3=0; for(var k3 in save.m3.best) t3+=save.m3.best[k3];
    $('sMax').textContent=Math.min(save.m3.max,M3_LEVELS.length); $('sTotal').textContent=t3;
  } else if(mode==='mem'){
    MEM_LEVELS.forEach(function(lv,i){
      var n=i+1, unlocked=n<=Math.min(save.mem.max+1,MEM_LEVELS.length), b=document.createElement('button');
      b.className='lv'; b.disabled=!unlocked;
      var best=save.mem.best[n];
      b.innerHTML='<div class="t">第 '+n+' 关</div><div class="d">'+lv.c+'×'+lv.r+' · '+lv.p+' 张 · '+lv.f+' 对 · 亮牌 '+lv.rev+'s · 配对 '+memLimText(lv)+' · 犯错 '+memErrText(lv)+
        (best?' · 最高 '+best:'')+(unlocked?'':' · 未解锁')+'</div>';
      b.onclick=function(){ startMem(n); };
      box.appendChild(b);
    });
    var tm=0; for(var km in save.mem.best) tm+=save.mem.best[km];
    $('sMax').textContent=Math.min(save.mem.max,MEM_LEVELS.length); $('sTotal').textContent=tm;
  } else {
    LEVELS.forEach(function(lv,i){
      var n=i+1, unlocked=n<=save.max+1, b=document.createElement('button');
      b.className='lv'; b.disabled=!unlocked;
      var best=save.best[n];
      b.innerHTML='<div class="t">第 '+n+' 关</div><div class="d">'+lv.r+'×'+lv.c+' · '+lv.f+' 种图 · '+fmt(lv.t)+(lv.grav?' · '+GRAV_TXT[lv.grav]:'')+
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
  $('goals').hidden=true; $('ov').innerHTML=''; $('hLvMax').textContent=LEVELS.length; stopMemPair();
  var box=stageBox();
  var d=deal(lv,box.w,box.h,rngOf(Date.now()&0x7fffffff));
  S={lv:lv,no:level,g:d.g,rows:d.rows,cols:d.cols,cell:d.cell,total:d.total,
     left:d.total,time:lv.t,hint:lv.h,shuf:lv.s,score:0,sel:null,locked:false,grav:lv.grav||null};
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
  if(S.grav) toast('特殊规则：每次消除后'+GRAV_TXT[S.grav]+(level===LEVELS.length?'，洗牌限 '+lv.s+' 次':''));
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
    if(S.grav){ compactG(S.g,S.grav); repaint(); }
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
/* 关卡表字段：c/r 棋盘，f 同屏元素数，m 步数，type/gt 表格里的目标类型与目标量，
   g 目标逻辑（elem 消除指定元素、drop 收集掉落物、ice/crate/obs 消除障碍），
   sp 特殊机制，h 提示次数，s 手动洗牌次数（第 30 关限 2 次）。
   掉落物每轮同列消除只下沉一格、落到最底行才算收集，
   所以含 drop 的关卡目标数压到 2~5 个、步数相应放宽，避免够不着出口。 */
var M3_LEVELS=[
  {c:7,r:7,f:5,m:20,h:3,s:3,type:'消除指定元素',gt:'15',sp:'',g:[{k:'elem',n:15,t:0}]},
  {c:7,r:7,f:5,m:20,h:3,s:3,type:'消除指定元素',gt:'20',sp:'',g:[{k:'elem',n:20,t:0}]},
  {c:7,r:7,f:5,m:22,h:3,s:3,type:'消除两种元素',gt:'各10',sp:'',g:[{k:'elem',n:10,t:0},{k:'elem',n:10,t:1}]},
  {c:8,r:8,f:5,m:22,h:3,s:3,type:'消除两种元素',gt:'各12',sp:'',g:[{k:'elem',n:12,t:0},{k:'elem',n:12,t:1}]},
  {c:8,r:8,f:5,m:26,h:3,s:3,type:'收集掉落物',gt:'2',sp:'',g:[{k:'drop',n:2}]},
  {c:8,r:8,f:6,m:28,h:3,s:3,type:'收集掉落物',gt:'2',sp:'',g:[{k:'drop',n:2}]},
  {c:8,r:8,f:6,m:20,h:3,s:3,type:'消除指定元素',gt:'30',sp:'',g:[{k:'elem',n:30,t:0}]},
  {c:8,r:8,f:6,m:22,h:3,s:3,type:'消除两种元素',gt:'各15',sp:'',g:[{k:'elem',n:15,t:0},{k:'elem',n:15,t:1}]},
  {c:8,r:8,f:6,m:30,h:3,s:3,type:'收集掉落物',gt:'3',sp:'',g:[{k:'drop',n:3}]},
  {c:8,r:8,f:6,m:30,h:3,s:3,type:'混合目标',gt:'元素20+掉落2',sp:'',g:[{k:'elem',n:20,t:0},{k:'drop',n:2}]},
  {c:8,r:8,f:6,m:22,h:3,s:3,type:'消除障碍',gt:'冰块10',sp:'冰块',g:[{k:'ice',n:10}]},
  {c:8,r:8,f:7,m:22,h:3,s:3,type:'消除障碍',gt:'冰块12',sp:'冰块',g:[{k:'ice',n:12}]},
  {c:9,r:9,f:7,m:32,h:3,s:3,type:'收集掉落物',gt:'3',sp:'',g:[{k:'drop',n:3}]},
  {c:9,r:9,f:7,m:32,h:3,s:3,type:'混合目标',gt:'元素25+掉落2',sp:'',g:[{k:'elem',n:25,t:0},{k:'drop',n:2}]},
  {c:9,r:9,f:7,m:24,h:3,s:3,type:'消除障碍',gt:'冰块15',sp:'冰块',g:[{k:'ice',n:15}]},
  {c:9,r:9,f:7,m:24,h:3,s:3,type:'消除障碍',gt:'木箱8',sp:'木箱',g:[{k:'crate',n:8}]},
  {c:9,r:9,f:8,m:26,h:3,s:3,type:'混合目标',gt:'元素30+冰块10',sp:'冰块',g:[{k:'elem',n:30,t:0},{k:'ice',n:10}]},
  {c:9,r:9,f:8,m:36,h:3,s:3,type:'收集掉落物',gt:'4',sp:'木箱阻挡',g:[{k:'drop',n:4}]},
  {c:9,r:9,f:8,m:26,h:3,s:3,type:'混合目标',gt:'元素30+木箱8',sp:'木箱',g:[{k:'elem',n:30,t:0},{k:'crate',n:8}]},
  {c:9,r:9,f:8,m:38,h:3,s:3,type:'综合挑战',gt:'元素40+掉落2+障碍10',sp:'冰块+木箱',g:[{k:'elem',n:40,t:0},{k:'drop',n:2},{k:'obs',n:10}]},
  {c:9,r:9,f:8,m:26,h:3,s:3,type:'消除指定元素',gt:'45',sp:'',g:[{k:'elem',n:45,t:0}]},
  {c:9,r:9,f:8,m:28,h:3,s:3,type:'消除两种元素',gt:'各25',sp:'',g:[{k:'elem',n:25,t:0},{k:'elem',n:25,t:1}]},
  {c:9,r:9,f:8,m:38,h:3,s:3,type:'收集掉落物',gt:'4',sp:'冰块',g:[{k:'drop',n:4}]},
  {c:9,r:9,f:8,m:28,h:3,s:3,type:'消除障碍',gt:'木箱12',sp:'木箱',g:[{k:'crate',n:12}]},
  {c:9,r:9,f:8,m:28,h:3,s:3,type:'混合目标',gt:'元素35+冰块12',sp:'冰块',g:[{k:'elem',n:35,t:0},{k:'ice',n:12}]},
  {c:9,r:9,f:8,m:28,h:3,s:3,type:'混合目标',gt:'元素35+木箱10',sp:'木箱',g:[{k:'elem',n:35,t:0},{k:'crate',n:10}]},
  {c:9,r:9,f:8,m:42,h:3,s:3,type:'收集掉落物',gt:'5',sp:'木箱阻挡',g:[{k:'drop',n:5}]},
  {c:9,r:9,f:8,m:38,h:3,s:3,type:'混合目标',gt:'元素40+掉落2',sp:'',g:[{k:'elem',n:40,t:0},{k:'drop',n:2}]},
  {c:9,r:9,f:8,m:32,h:3,s:3,type:'综合目标',gt:'元素40+冰块12+木箱8',sp:'冰块+木箱',g:[{k:'elem',n:40,t:0},{k:'ice',n:12},{k:'crate',n:8}]},
  {c:9,r:9,f:8,m:46,h:2,s:2,type:'终极综合',gt:'元素50+掉落3+障碍15',sp:'冰块+木箱+限洗牌2次',g:[{k:'elem',n:50,t:0},{k:'drop',n:3},{k:'obs',n:15}]}
];
var M3_DROP=-1;                /* 掉落物：重物，不参与匹配，只有落到最底行才被收集 */
var M3_ICE=1, M3_CRATE=2;     /* 障碍层：冰块（半透明、可匹配）、木箱（不透明、阻挡） */
var M3_GOAL_NAME={elem:'消除元素',drop:'收集掉落物',ice:'消除冰块',crate:'消除木箱',obs:'消除障碍'};
var M3_ICE_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1"/></svg>';
var M3_CRATE_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 3.5h17v17h-17zM3.5 9h17M3.5 14.5h17M9 3.5v17M15 3.5v17"/></svg>';
var M3_DROP_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.8l3 6.5 7.1.9-5.2 4.9 1.4 7L12 17.6 5.7 21.1l1.4-7L1.9 9.2l7.1-.9z"/></svg>';

function fitM3(cols,rows,W,H){
  var cell=Math.min(W/cols,H/rows,84);
  if(cell<MIN_CELL) cell=Math.min(MIN_CELL,W/cols);
  return cell;
}
/* 指定元素：每关固定，HUD 会显示对应图案 */
function m3Targets(lv,no){
  var a=1+((no*3-2)%lv.f), b=1+((no*3+1)%lv.f);
  if(b===a) b=1+(a%lv.f);
  return [a,b];
}
function m3DropNeed(lv){
  var n=0; for(var i=0;i<lv.g.length;i++) if(lv.g[i].k==='drop') n+=lv.g[i].n;
  return n;
}
/* 指定元素在发牌池里多占几份：元素种类仍是 f 种，但目标图案更常见，目标量才可达 */
function m3FacePool(lv,targets){
  var pool=[],used=[],i,j,q;
  for(j=0;j<targets.length;j++){
    var on=false;
    for(i=0;i<lv.g.length;i++){ q=lv.g[i]; if(q.k==='elem'&&(q.t||0)===j){ on=true; break; } }
    used.push(on);
  }
  for(i=1;i<=lv.f;i++) pool.push(i);
  for(j=0;j<targets.length;j++) if(used[j]){ pool.push(targets[j]); pool.push(targets[j]); pool.push(targets[j]); }
  return pool;
}
function m3Face(pool,rnd){ return pool[Math.floor(rnd()*pool.length)]; }
/* 依据目标量 + 特殊机制算出本关要摆多少冰块/木箱，保证场上障碍足够完成目标 */
function m3ObstacleCounts(lv){
  var area=lv.r*lv.c, ice=0, crate=0, iceGoal=0, crateGoal=0, obsGoal=0, i, q;
  for(i=0;i<lv.g.length;i++){
    q=lv.g[i];
    if(q.k==='ice'){ ice=Math.max(ice,q.n+3); iceGoal=Math.max(iceGoal,q.n); }
    if(q.k==='crate'){ crate=Math.max(crate,q.n+2); crateGoal=Math.max(crateGoal,q.n); }
    if(q.k==='obs'){
      ice=Math.max(ice,Math.ceil(q.n/2)+3); crate=Math.max(crate,Math.floor(q.n/2)+3);
      obsGoal=Math.max(obsGoal,q.n);
    }
  }
  if(lv.sp.indexOf('冰块')>=0&&!ice) ice=Math.min(8,Math.floor(area*0.12));
  if(lv.sp.indexOf('木箱')>=0&&!crate) crate=Math.min(6,Math.floor(area*0.1));
  ice=Math.max(Math.min(ice,Math.floor(area*0.3)),iceGoal);
  crate=Math.max(Math.min(crate,Math.floor(area*0.16)),crateGoal);
  if(obsGoal&&ice+crate<obsGoal) crate=Math.min(Math.floor(area*0.22),crate+obsGoal-ice-crate);
  return {ice:ice,crate:crate};
}
function m3PlaceObstacles(ov,counts,rnd,exitCols){
  var R=ov.length,C=ov[0].length,rowCrate={},r,c,i,p,nc=0,ni=0;
  var crateCells=[],iceCells=[];
  exitCols=exitCols||[];
  /* 棋盘底部几行的图案很少被消到，障碍只布在上部，保证目标可完成；最底行留给掉落物出口。
     掉落物关额外留几列「出口通道」：整列不放冰块/木箱，掉落物才一定能落到最底行 */
  for(r=0;r<R;r++) for(c=0;c<C;c++){
    if(exitCols.indexOf(c)>=0) continue;
    if(r>=1&&r<R-2) crateCells.push([r,c]);
    if(r<R-3) iceCells.push([r,c]);
  }
  crateCells=shuffled(crateCells,rnd);
  iceCells=shuffled(iceCells,rnd);
  var maxRow=Math.max(1,Math.ceil(C/3));
  for(i=0;i<crateCells.length&&nc<counts.crate;i++){
    p=crateCells[i];
    if(ov[p[0]][p[1]]||(rowCrate[p[0]]||0)>=maxRow) continue;
    ov[p[0]][p[1]]=M3_CRATE; rowCrate[p[0]]=(rowCrate[p[0]]||0)+1; nc++;
  }
  for(i=0;i<iceCells.length&&ni<counts.ice;i++){
    p=iceCells[i];
    if(ov[p[0]][p[1]]) continue;
    ov[p[0]][p[1]]=M3_ICE; ni++;
  }
}
/* 匹配视图：木箱格视为空洞，掉落物不参与匹配 */
function m3F(g,ov,r,c){
  if(ov[r][c]===M3_CRATE) return 0;
  var v=g[r][c];
  return v>0?v:0;
}
function m3Swappable(g,ov,r,c){ return g[r][c]>0&&ov[r][c]!==M3_CRATE; }
function m3SwapG(g,a,b){ var t=g[a.r][a.c]; g[a.r][a.c]=g[b.r][b.c]; g[b.r][b.c]=t; }
function m3RunAt(g,ov,r,c){
  var v=m3F(g,ov,r,c), n=1, k;
  if(!v) return 0;
  k=c-1; while(k>=0&&m3F(g,ov,r,k)===v){ n++; k--; }
  k=c+1; while(k<g[r].length&&m3F(g,ov,r,k)===v){ n++; k++; }
  if(n>=3) return n;
  n=1;
  k=r-1; while(k>=0&&m3F(g,ov,k,c)===v){ n++; k--; }
  k=r+1; while(k<g.length&&m3F(g,ov,k,c)===v){ n++; k++; }
  return n>=3?n:0;
}
function m3FindGroups(g,ov){
  var groups=[], R=g.length, C=g[0].length, r, c, k;
  for(r=0;r<R;r++){
    for(c=0;c<C;){
      var v=m3F(g,ov,r,c);
      if(!v){ c++; continue; }
      var len=1;
      while(c+len<C&&m3F(g,ov,r,c+len)===v) len++;
      if(len>=3){ var cs=[]; for(k=0;k<len;k++) cs.push({r:r,c:c+k}); groups.push({cells:cs,len:len}); }
      c+=len;
    }
  }
  for(c=0;c<C;c++){
    for(r=0;r<R;){
      var v2=m3F(g,ov,r,c);
      if(!v2){ r++; continue; }
      var len2=1;
      while(r+len2<R&&m3F(g,ov,r+len2,c)===v2) len2++;
      if(len2>=3){ var cs2=[]; for(k=0;k<len2;k++) cs2.push({r:r+k,c:c}); groups.push({cells:cs2,len:len2}); }
      r+=len2;
    }
  }
  return groups;
}
function m3HasMove(g,ov){
  var R=g.length, C=g[0].length, r, c;
  for(r=0;r<R;r++) for(c=0;c<C;c++){
    if(c+1<C&&m3Swappable(g,ov,r,c)&&m3Swappable(g,ov,r,c+1)){
      m3SwapG(g,{r:r,c:c},{r:r,c:c+1});
      var ok=m3RunAt(g,ov,r,c)>0||m3RunAt(g,ov,r,c+1)>0;
      m3SwapG(g,{r:r,c:c},{r:r,c:c+1});
      if(ok) return {a:{r:r,c:c},b:{r:r,c:c+1}};
    }
    if(r+1<R&&m3Swappable(g,ov,r,c)&&m3Swappable(g,ov,r+1,c)){
      m3SwapG(g,{r:r,c:c},{r:r+1,c:c});
      var ok2=m3RunAt(g,ov,r,c)>0||m3RunAt(g,ov,r+1,c)>0;
      m3SwapG(g,{r:r,c:c},{r:r+1,c:c});
      if(ok2) return {a:{r:r,c:c},b:{r:r+1,c:c}};
    }
  }
  return null;
}
function m3Clean(g,ov,pool,rnd){
  var guard=0, runs=m3FindGroups(g,ov);
  while(runs.length&&guard++<400){
    for(var i=0;i<runs.length;i++) for(var j=0;j<runs[i].cells.length;j++){
      var p=runs[i].cells[j];
      if(g[p.r][p.c]>0&&ov[p.r][p.c]!==M3_CRATE) g[p.r][p.c]=m3Face(pool,rnd);
    }
    runs=m3FindGroups(g,ov);
  }
}
function m3Deal(lv,no,rnd){
  var R=lv.r,C=lv.c,r,c,k,counts=m3ObstacleCounts(lv),g=[],ov=[],tries=0;
  var targets=m3Targets(lv,no), pool=m3FacePool(lv,targets);
  /* 有掉落物目标时固定三条无障碍出口列，避免木箱铺满所有列导致目标永远完不成 */
  var exitCols=[], all=[];
  if(m3DropNeed(lv)){
    for(c=0;c<C;c++) all.push(c);
    exitCols=shuffled(all,rnd).slice(0,Math.min(3,C));
  }
  while(true){
    g=[]; ov=[];
    for(r=0;r<R;r++){
      var gr=[], orow=[];
      for(c=0;c<C;c++){ gr.push(m3Face(pool,rnd)); orow.push(0); }
      g.push(gr); ov.push(orow);
    }
    m3PlaceObstacles(ov,counts,rnd,exitCols);
    m3Clean(g,ov,pool,rnd);
    if(m3HasMove(g,ov)||tries++>60) break;
  }
  if(!m3HasMove(g,ov)){
    for(k=0;k<300&&!m3HasMove(g,ov);k++){
      for(r=0;r<R;r++) for(c=0;c<C;c++)
        if(g[r][c]>0&&ov[r][c]!==M3_CRATE) g[r][c]=m3Face(pool,rnd);
      m3Clean(g,ov,pool,rnd);
    }
  }
  return {g:g,ov:ov,targets:targets,pool:pool,exitCols:exitCols};
}
/* 图块与障碍层的 DOM */
function m3TileEl(r,c,v,cell){
  if(v===M3_DROP){
    var el=document.createElement('div');
    el.className='tile drop'; el.dataset.r=r; el.dataset.c=c;
    el.style.left=(c*cell)+'px'; el.style.top=(r*cell)+'px';
    el.style.width=cell+'px'; el.style.height=cell+'px';
    el.innerHTML='<span>'+M3_DROP_SVG+'</span>';
    return el;
  }
  return v>0?tileEl(r,c,v,cell):null;
}
function m3OvEl(r,c,type){
  var el=document.createElement('div');
  el.className='ovcell '+(type===M3_ICE?'ice':'crate');
  el.dataset.r=r; el.dataset.c=c;
  el.style.left=(c*G.cell)+'px'; el.style.top=(r*G.cell)+'px';
  el.style.width=G.cell+'px'; el.style.height=G.cell+'px';
  el.innerHTML=type===M3_ICE?M3_ICE_SVG:M3_CRATE_SVG;
  return el;
}
function m3OvAt(r,c){
  var list=$('ov').children;
  for(var i=0;i<list.length;i++)
    if(list[i].dataset.r==r&&list[i].dataset.c==c&&!list[i].classList.contains('broken')) return list[i];
  return null;
}
function m3DropOnBoard(){
  var n=0;
  for(var r=0;r<G.rows;r++) for(var c=0;c<G.cols;c++) if(G.g[r][c]===M3_DROP) n++;
  return n;
}
/* 掉落物不再随机撒：一律从棋盘顶行（r=0）沿出口列依次落入，
   列按 nextDropCol 轮流，位置完全确定；开局发生器决定出口列，整局可复现。
   一条出口列同时只放一个掉落物，最底行（金色边）是唯一出口 */
function m3EnsureDrops(mode){
  if(!G.dropNeed) return;
  var cols=G.exitCols||[],r,c,cand=[];
  if(!cols.length) return;
  var want=Math.min(3,cols.length,G.dropNeed-G.dropGot)-m3DropOnBoard();
  if(want<=0) return;
  for(var ci=0;ci<cols.length&&cand.length<want;ci++){
    c=cols[(G.nextDropCol+ci)%cols.length];
    var used=false;
    for(r=0;r<G.rows;r++) if(G.g[r][c]===M3_DROP){ used=true; break; }
    if(used) continue;
    /* 顶行被障碍占住时退到第 1 行，出口列本身不放障碍，正常都落在第 0 行 */
    for(r=0;r<=Math.min(1,G.rows-2);r++)
      if(G.g[r][c]>0&&G.ov[r][c]===0){ cand.push({r:r,c:c}); break; }
  }
  for(var i=0;i<cand.length;i++){
    var p=cand[i];
    G.g[p.r][p.c]=M3_DROP;
    G.nextDropCol=(cols.indexOf(p.c)+1)%cols.length;
    if(mode==='dom'){
      var old=tileAt(p.r,p.c);
      var de=m3TileEl(p.r,p.c,M3_DROP,G.cell);
      de.style.top=(-G.cell)+'px';
      $('tiles').appendChild(de);
      if(old) old.remove();
      (function(e,rr){ requestAnimationFrame(function(){ requestAnimationFrame(function(){ e.style.top=(rr*G.cell)+'px'; }); }); })(de,p.r);
    }
  }
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
  $('goals').hidden=false; stopMemPair();
  var box=stageBox();
  var cell=fitM3(lv.c,lv.r,box.w,box.h);
  var d=m3Deal(lv,level,rngOf(Date.now()&0x7fffffff));
  G={lv:lv,no:level,g:d.g,ov:d.ov,targets:d.targets,pool:d.pool,exitCols:d.exitCols,
     rows:lv.r,cols:lv.c,cell:cell,
     moves:lv.m,hint:lv.h,shuf:lv.s,shufUsed:0,score:0,sel:null,locked:false,over:false,
     prog:lv.g.map(function(){return 0;}),dropNeed:m3DropNeed(lv),dropGot:0,
     nextDropCol:0,clearedCols:{},sinkUsed:{}};
  combo=0; lastMatch=0;
  var board=$('board'), w=lv.c*cell, h=lv.r*cell;
  board.style.width=w+'px'; board.style.height=h+'px';
  board.classList.toggle('exit',G.dropNeed>0);
  var line=$('line');
  line.setAttribute('viewBox','0 0 '+w+' '+h);
  line.setAttribute('width',w); line.setAttribute('height',h);
  line.innerHTML='';
  m3EnsureDrops('grid');
  if(!m3HasMove(G.g,G.ov)) m3Reshuffle();
  m3Repaint();
  $('hLv').textContent=level; $('hLvMax').textContent=M3_LEVELS.length;
  syncM3Tools(); syncM3Hud(); stopTimer(); ensureMusic();
  if(level===30) toast('终极关：手动洗牌限 2 次，冰块和木箱都要清');
}
function m3Repaint(){
  var tiles=$('tiles'); tiles.innerHTML='';
  for(var r=0;r<G.rows;r++) for(var c=0;c<G.cols;c++){
    var v=G.g[r][c];
    if(v>0||v===M3_DROP) tiles.appendChild(m3TileEl(r,c,v,G.cell));
  }
  var ov=$('ov'); ov.innerHTML='';
  for(r=0;r<G.rows;r++) for(c=0;c<G.cols;c++)
    if(G.ov[r][c]) ov.appendChild(m3OvEl(r,c,G.ov[r][c]));
}
function m3SetPos(el,r,c){
  el.dataset.r=r; el.dataset.c=c;
  el.style.left=(c*G.cell)+'px'; el.style.top=(r*G.cell)+'px';
}
/* 目标进度：一个事件只累加对应目标，obs 同时接收冰块和木箱 */
function m3Add(kind,amount,face){
  for(var i=0;i<G.lv.g.length;i++){
    var q=G.lv.g[i], hit=false;
    if(q.k===kind) hit=true;
    else if(q.k==='obs'&&(kind==='ice'||kind==='crate')) hit=true;
    if(!hit) continue;
    if(q.k==='elem'&&face!==G.targets[q.t||0]) continue;
    G.prog[i]=Math.min(q.n,G.prog[i]+amount);
  }
}
function m3GoalsDone(){
  for(var i=0;i<G.lv.g.length;i++) if(G.prog[i]<G.lv.g[i].n) return false;
  return true;
}
function m3Progress(){
  var sum=0;
  for(var i=0;i<G.lv.g.length;i++) sum+=Math.min(1,G.prog[i]/G.lv.g[i].n);
  return Math.max(0,Math.min(100,sum/G.lv.g.length*100));
}
function m3RenderGoals(){
  var box=$('goals'); if(!box) return;
  var html='<div class="gh">第 '+G.no+' 关 · '+G.lv.type+(G.lv.sp?' · '+G.lv.sp:'')+
    (G.dropNeed?' · 出口列 '+G.exitCols.slice().sort(function(a,b){return a-b;}).map(function(c){return c+1;}).join('/'):'')+'</div>';
  for(var i=0;i<G.lv.g.length;i++){
    var q=G.lv.g[i], cur=G.prog[i], done=cur>=q.n, icon='', name=M3_GOAL_NAME[q.k];
    if(q.k==='elem'){
      icon='<i class="gi face" style="background-image:url(img/image'+(G.targets[q.t||0]-1)+'.jpg)"></i>';
      if(G.lv.type==='消除两种元素') name=q.t===0?'元素①':'元素②';
    } else if(q.k==='drop') icon='<i class="gi drop">'+M3_DROP_SVG+'</i>';
    else if(q.k==='ice') icon='<i class="gi ice">'+M3_ICE_SVG+'</i>';
    else if(q.k==='crate') icon='<i class="gi crate">'+M3_CRATE_SVG+'</i>';
    else icon='<i class="gi obs"></i>';
    html+='<div class="goal'+(done?' done':'')+'">'+icon+'<span class="gn">'+name+'</span><b>'+cur+'/'+q.n+'</b>'+(done?'<em>✓</em>':'')+'</div>';
  }
  html+='<div class="gs">手动重排 '+G.shuf+'/'+G.lv.s+' 次 · 提示 '+G.hint+' 次'+
    (G.dropNeed?' · 消掉落物所在列的图案让它下沉，到最底行（金色边）才收集':'')+'</div>';
  box.innerHTML=html;
}
function syncM3Hud(){
  $('hLeft').textContent=G.moves; $('hScore').textContent=G.score;
  var pct=m3Progress();
  $('hTime').textContent=Math.round(pct)+'%';
  var bar=$('bar'); bar.style.width=pct+'%';
  bar.classList.toggle('low',G.moves<=3);
  m3RenderGoals();
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
  if(G.ov[r][c]===M3_CRATE){ toast('木箱不能交换，消除它旁边的图案即可打碎'); return; }
  if(G.g[r][c]===M3_DROP){ toast('掉落物不能交换，消掉它所在列的图案让它逐格下沉，落到最底行才收集'); return; }
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
  var groups=m3FindGroups(G.g,G.ov);
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
  G.moves--;
  /* 一次有效交换（含后续连锁）统一结算：记下哪些列真的消过图案，每列最多推进掉落物 2 格 */
  G.clearedCols={}; G.sinkUsed={};
  syncM3Hud();
  m3Resolve(groups,1);
}
function m3Resolve(groups,depth){
  var gain=0, cleared=[], broken={}, i, j, p, v, nr, nc, key;
  for(i=0;i<groups.length;i++){
    var len=groups[i].len;
    gain+=len*10*depth+(len===4?30:len>=5?60:0);
  }
  G.score+=gain;
  for(i=0;i<groups.length;i++) for(j=0;j<groups[i].cells.length;j++){
    p=groups[i].cells[j];
    v=G.g[p.r][p.c];
    if(v<=0||G.ov[p.r][p.c]===M3_CRATE) continue;
    G.g[p.r][p.c]=0;
    cleared.push({r:p.r,c:p.c,v:v});
    G.clearedCols[p.c]=(G.clearedCols[p.c]||0)+1;
    var e=tileAt(p.r,p.c);
    if(e){ e.classList.add('gone'); (function(el){ setTimeout(function(){ el.remove(); },200); })(e); }
    m3Add('elem',1,v);
  }
  /* 冰块是半透明覆盖层：它下面的图案被消除即打碎 */
  for(i=0;i<cleared.length;i++){
    p=cleared[i];
    if(G.ov[p.r][p.c]===M3_ICE){
      G.ov[p.r][p.c]=0;
      var oe=m3OvAt(p.r,p.c);
      if(oe){ oe.classList.add('broken'); (function(el){ setTimeout(function(){ el.remove(); },220); })(oe); }
      m3Add('ice',1);
    }
  }
  /* 木箱是阻挡块：相邻格被消除即打碎 */
  for(i=0;i<cleared.length;i++){
    p=cleared[i];
    for(var d=0;d<4;d++){
      nr=p.r+DIRS[d][0]; nc=p.c+DIRS[d][1];
      if(nr<0||nr>=G.rows||nc<0||nc>=G.cols) continue;
      key=nr+','+nc;
      if(G.ov[nr][nc]===M3_CRATE&&!broken[key]){
        broken[key]=1;
        G.ov[nr][nc]=0;
        var ce=m3OvAt(nr,nc);
        if(ce){ ce.classList.add('broken'); (function(el){ setTimeout(function(){ el.remove(); },220); })(ce); }
        m3Add('crate',1);
      }
    }
  }
  syncM3Hud();
  setTimeout(function(){ m3AfterClear(depth); },240);
}
function m3AfterClear(depth){
  if(G.over) return;
  if(m3GoalsDone()){ m3Win(); return; }
  m3Fall(function(){
    if(G.over) return;
    if(m3GoalsDone()){ m3Win(); return; }
    var groups=m3FindGroups(G.g,G.ov);
    if(groups.length){ m3Resolve(groups,depth+1); return; }
    if(!m3HasMove(G.g,G.ov)){
      m3Reshuffle(); m3Repaint();
      toast('没有能换的了，已自动重排（不消耗洗牌次数）');
    }
    if(m3GoalsDone()){ m3Win(); return; }
    if(G.moves<=0){ m3Fail(); return; }
    G.locked=false;
  });
}
/* 掉落物是"重物"：只有它所在的出口列本轮真的消掉了图案，才往下占一格，
   下方图案依次上浮一格（等价于重者下沉、空位上浮）。
   一次有效交换（含连锁）里每列最多推进 2 格，下沉原因和节奏都可预期 */
function m3SinkDrops(c,top,bottom,step){
  if(step<=0) return;
  for(var r=bottom-1;r>=top;r--){
    if(G.g[r][c]!==M3_DROP) continue;
    var s=Math.min(step,bottom-r), q, els=[], target;
    if(s<=0) continue;
    target=r+s;
    for(q=r;q<=target;q++) els.push(tileAt(q,c));
    for(q=r;q<target;q++) G.g[q][c]=G.g[q+1][c];
    G.g[target][c]=M3_DROP;
    for(q=0;q<s;q++) if(els[q+1]) m3SetPos(els[q+1],r+q,c);
    if(els[0]) m3SetPos(els[0],target,c);
  }
}
/* 列内按木箱分段做重力压实；只有真正落在最底行（R-1）的掉落物才被收集，
   空位由上方新图案补齐 */
function m3Fall(done){
  var tiles=$('tiles'), fresh=[], R=G.rows, C=G.cols, r, c, si, k, spawned=false;
  for(c=0;c<C;c++){
    var segs=[], bot=R-1;
    for(r=R-1;r>=0;r--) if(G.ov[r][c]===M3_CRATE){
      if(bot>=r+1) segs.push([r+1,bot]);
      bot=r-1;
    }
    if(bot>=0) segs.push([0,bot]);
    for(si=0;si<segs.length;si++){
      var top=segs[si][0], bottom=segs[si][1], write, guard=0;
      while(true){
        write=bottom;
        for(r=bottom;r>=top;r--){
          if(G.g[r][c]){
            if(write!==r){
              G.g[write][c]=G.g[r][c]; G.g[r][c]=0;
              var el=tileAt(r,c);
              if(el) m3SetPos(el,write,c);
            }
            write--;
          }
        }
        /* 本列本次交换确有消除、有空位、且本轮推进没超过 2 格，才让掉落物沉 1 格 */
        if(!guard&&(G.sinkUsed[c]||0)<2&&(G.clearedCols[c]||0)>0&&write-top+1>0){
          G.sinkUsed[c]=(G.sinkUsed[c]||0)+1;
          m3SinkDrops(c,top,bottom,1);
        }
        /* 出口只在最底行：压实后检查一次，收集后再压实，让同列上方的图案继续补位 */
        if(bottom===R-1&&G.g[R-1][c]===M3_DROP){
          G.g[R-1][c]=0;
          var de=tileAt(R-1,c);
          /* 数据已到出口却找不到图块时补一个，保证"在最后一行淡出"这一步一定看得见 */
          if(!de){ de=m3TileEl(R-1,c,M3_DROP,G.cell); $('tiles').appendChild(de); }
          /* gone 立即打上（后续压实不再碰它），淡出由 CSS 延迟，先看清它落到最后一行 */
          de.classList.add('gone');
          (function(e){ setTimeout(function(){ e.remove(); },420); })(de);
          if(G.dropGot<G.dropNeed){ G.dropGot++; m3Add('drop',1); }
          if(guard++<R) continue;
        }
        break;
      }
      var n=write-top+1;
      for(k=0;k<n;k++){
        var rr=write-k, f=m3Face(G.pool,Math.random);
        G.g[rr][c]=f;
        var el2=m3TileEl(rr,c,f,G.cell);
        el2.style.top=((rr-n)*G.cell)+'px';
        tiles.appendChild(el2);
        fresh.push({el:el2,r:rr});
        spawned=true;
      }
    }
  }
  m3EnsureDrops('dom');
  syncM3Hud();
  if(!spawned){ setTimeout(done,240); return; }
  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    for(var i=0;i<fresh.length;i++) fresh[i].el.style.top=(fresh[i].r*G.cell)+'px';
    setTimeout(done,240);
  });});
}
/* 重排只打乱普通图案，保留掉落物、冰块、木箱与已破坏的障碍，不计入手动洗牌次数 */
function m3Reshuffle(){
  var cells=[], vals=[], r, c, i, k;
  for(r=0;r<G.rows;r++) for(c=0;c<G.cols;c++)
    if(G.g[r][c]>0&&G.ov[r][c]!==M3_CRATE){ cells.push([r,c]); vals.push(G.g[r][c]); }
  if(cells.length<4) return;
  var rnd=rngOf(Date.now()&0x7fffffff);
  for(k=0;k<300;k++){
    var v;
    if(k<120) v=shuffled(vals,rnd);
    else { v=[]; for(i=0;i<vals.length;i++) v.push(m3Face(G.pool,rnd)); }
    for(i=0;i<cells.length;i++) G.g[cells[i][0]][cells[i][1]]=v[i];
    if(!m3FindGroups(G.g,G.ov).length&&m3HasMove(G.g,G.ov)) return;
  }
  m3Clean(G.g,G.ov,G.pool,rnd);
}
function m3Hint(){
  if(!G||G.hint<=0||G.locked||G.over) return;
  var mv=m3HasMove(G.g,G.ov);
  if(!mv){ toast('没有能换的，试试重排'); return; }
  G.hint--; syncM3Tools(); syncM3Hud();
  [tileAt(mv.a.r,mv.a.c),tileAt(mv.b.r,mv.b.c)].forEach(function(e){
    if(!e) return; e.classList.add('hint');
    setTimeout(function(){e.classList.remove('hint');},2600);
  });
}
function m3ShufBtn(){
  if(!G||G.over||G.locked) return;
  if(G.shuf<=0){ toast('本关洗牌次数已用完'); return; }
  G.shuf--; G.shufUsed++;
  m3ClearSel();
  m3Reshuffle(); m3Repaint(); syncM3Tools(); syncM3Hud();
  if(G.lv.s<=2) toast('洗牌只剩 '+G.shuf+' 次');
}
function m3Win(){
  if(G.over) return;
  G.over=true; G.locked=true;
  var bonus=G.moves*15, no=G.no;
  G.score+=bonus;
  if(!save.m3.best[no]||G.score>save.m3.best[no]) save.m3.best[no]=G.score;
  if(no>save.m3.max) save.m3.max=Math.min(no,M3_LEVELS.length);
  storeSave();
  var last=no>=M3_LEVELS.length;
  dialog(last?'全部通关':'第 '+no+' 关完成',
    '目标全部达成，剩 '+G.moves+' 步奖励 '+bonus+' 分，本关 '+G.score+' 分。',
    last?'首页':'下一关',
    last?null:'首页',
    last?renderHome:function(){ startM3(no+1); },
    last?null:renderHome);
}
function m3Fail(){
  if(G.over) return;
  G.over=true; G.locked=true;
  var no=G.no, left=[];
  for(var i=0;i<G.lv.g.length;i++){
    var q=G.lv.g[i], cur=G.prog[i];
    if(cur<q.n) left.push(M3_GOAL_NAME[q.k]+' 还差 '+(q.n-cur));
  }
  dialog('步数用完', left.length?left.join('，')+'。':'目标未完成。','再来一次','首页',
    function(){ startM3(no); }, renderHome);
}

/* ==== 记忆翻牌 ==== */
/* 关卡表：c/r 棋盘（列×行），f 图种=对数，p 总牌数，rev 展示秒数，
   t 配对限时秒数（0 = 不限时），e 允许犯错次数（0 = 不限），h 提示次数，s 重排次数 */
var MEM_LEVELS=[
  {c:3,r:4,f:6,p:12,rev:10,t:0,e:0,h:4,s:2},
  {c:3,r:4,f:6,p:12,rev:9,t:0,e:0,h:4,s:2},
  {c:4,r:4,f:8,p:16,rev:11,t:0,e:0,h:3,s:2},
  {c:4,r:4,f:8,p:16,rev:10,t:0,e:0,h:3,s:2},
  {c:4,r:5,f:10,p:20,rev:12,t:420,e:8,h:3,s:1},
  {c:4,r:5,f:10,p:20,rev:11,t:410,e:8,h:3,s:1},
  {c:4,r:6,f:12,p:24,rev:13,t:430,e:7,h:3,s:1},
  {c:4,r:6,f:12,p:24,rev:12,t:420,e:7,h:2,s:1},
  {c:5,r:6,f:15,p:30,rev:14,t:450,e:6,h:2,s:1},
  {c:5,r:6,f:15,p:30,rev:13,t:440,e:6,h:2,s:1},
  {c:5,r:6,f:15,p:30,rev:13,t:440,e:6,h:2,s:1},
  {c:5,r:6,f:15,p:30,rev:12,t:430,e:5,h:1,s:1},
  {c:6,r:6,f:18,p:36,rev:15,t:460,e:5,h:2,s:1},
  {c:6,r:6,f:18,p:36,rev:14,t:450,e:5,h:1,s:1},
  {c:6,r:6,f:18,p:36,rev:14,t:450,e:4,h:1,s:1},
  {c:6,r:6,f:18,p:36,rev:13,t:440,e:4,h:1,s:1},
  {c:6,r:8,f:24,p:48,rev:17,t:480,e:4,h:1,s:1},
  {c:6,r:8,f:24,p:48,rev:16,t:470,e:3,h:1,s:0},
  {c:6,r:8,f:24,p:48,rev:16,t:470,e:3,h:1,s:0},
  {c:6,r:8,f:24,p:48,rev:15,t:460,e:2,h:1,s:0}
];
var MEM_CLOCK_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>';
var MEM_MISS_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
function memLimText(lv){ return lv.t>0?lv.t+'s':'不限时'; }
function memErrText(lv){ return lv.e>0?lv.e+'次':'不限'; }

var revT=0, pairT=0;
function stopMemReveal(){ if(revT){ clearInterval(revT); revT=0; } }
function stopMemPair(){ if(pairT){ clearInterval(pairT); pairT=0; } }
function startMem(level){
  MODE='mem'; S=null; G=null;
  setBrand('记忆翻牌');
  save.game='mem'; storeSave();
  var lv=MEM_LEVELS[level-1];
  $('home').hidden=true; $('game').hidden=false;
  $('hud').hidden=false; $('tools').hidden=false; toolset(true);
  $('tiles').classList.remove('m3'); $('tiles').classList.add('mem');
  $('hL2').textContent='剩余'; $('hU2').hidden=false; $('hL4').textContent='明牌';
  $('goals').hidden=false; $('ov').innerHTML=''; $('hLvMax').textContent=MEM_LEVELS.length;
  $('tiles').style.touchAction='';
  stopTimer(); stopMemReveal(); stopMemPair();
  var box=stageBox();
  var cell=fitM3(lv.c,lv.r,box.w,box.h);
  var rnd=rngOf(Date.now()&0x7fffffff);
  var pairs=lv.c*lv.r/2, deck=[];
  for(var i=0;i<pairs;i++){ deck.push(1+i%lv.f); deck.push(1+i%lv.f); }
  deck=shuffled(deck,rnd);
  var g=[], k=0;
  for(var r=0;r<lv.r;r++){ var row=[]; for(var c=0;c<lv.c;c++) row.push(deck[k++]); g.push(row); }
  M={lv:lv,no:level,g:g,rows:lv.r,cols:lv.c,cell:cell,pairs:pairs,left:pairs,
     hint:lv.h,shuf:lv.s,score:0,streak:0,first:null,busy:false,over:false,
     reveal:lv.rev,time:lv.t,errLim:lv.e,err:0,flips:0};
  combo=0; lastMatch=0;
  var board=$('board'), w=lv.c*cell, h=lv.r*cell;
  board.style.width=w+'px'; board.style.height=h+'px';
  var line=$('line'); line.innerHTML='';
  memRepaint();
  $('hLv').textContent=level;
  syncMemTools(); syncMemHud();
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
  if(M.first){
    var fe=tileAt(M.first.r,M.first.c);
    if(fe){ fe.classList.remove('down'); fe.classList.add('sel'); }
  }
}
function startMemReveal(){
  stopMemReveal(); stopMemPair();
  M.busy=true;
  $('hL4').textContent='明牌';
  toast('所有牌亮 '+M.lv.rev+' 秒，快记住位置！');
  syncMemHud();
  revT=setInterval(function(){
    if(!M||M.over){ stopMemReveal(); return; }
    if(document.hidden||!$('mask').hidden) return;
    M.reveal--;
    if(M.reveal<=0){
      M.reveal=0;
      stopMemReveal();
      var ts=$('tiles').children;
      for(var i=0;i<ts.length;i++) if(!ts[i].classList.contains('gone')) ts[i].classList.add('down');
      $('hL4').textContent=M.lv.t>0?'限时':'配对';
      M.busy=false;
      startMemPair();
      toast('翻面！开始配对吧'+(M.lv.t>0?'，限时 '+fmt(M.lv.t):''));
    }
    syncMemHud();
  },1000);
}
/* 配对倒计时只在亮牌结束后启动；关卡设为不限时则不启动 */
function startMemPair(){
  stopMemPair();
  if(!M||M.over||M.lv.t<=0) return;
  pairT=setInterval(function(){
    if(!M||M.over||M.left<=0){ stopMemPair(); return; }
    if(document.hidden||!$('mask').hidden) return;
    M.time--;
    if(M.time<=0){
      M.time=0; stopMemPair(); syncMemHud(); memFail('时间到'); return;
    }
    syncMemHud();
  },1000);
}
function memRenderInfo(){
  var box=$('goals'); if(!box||!M) return;
  var lv=M.lv;
  var html='<div class="gh">第 '+M.no+' 关 · '+lv.c+'×'+lv.r+' · '+lv.p+' 张 · 亮牌 '+lv.rev+'s</div>';
  html+='<div class="goal"><i class="gi time">'+MEM_CLOCK_SVG+'</i><span class="gn">配对'+memLimText(lv)+'</span><b>'+(lv.t>0?fmt(M.time):'∞')+'</b></div>';
  html+='<div class="goal'+(lv.e>0&&M.err>=lv.e?' warn':'')+'"><i class="gi miss">'+MEM_MISS_SVG+'</i><span class="gn">已犯错</span><b>'+M.err+'/'+(lv.e>0?lv.e:'不限')+'</b></div>';
  html+='<div class="gs">剩余 '+M.left+' 对 · 翻牌 '+M.flips+' 次 · 提示 '+M.hint+' 次 · 重排 '+M.shuf+' 次</div>';
  box.innerHTML=html;
}
function syncMemHud(){
  $('hLeft').textContent=M.left; $('hScore').textContent=M.score;
  var pct;
  if(M.reveal>0){
    $('hTime').textContent=M.reveal+'s';
    pct=M.reveal/M.lv.rev*100;
  } else if(M.lv.t>0){
    $('hTime').textContent=fmt(M.time);
    pct=M.time/M.lv.t*100;
  } else {
    $('hTime').textContent='不限时';
    pct=M.pairs?(M.pairs-M.left)/M.pairs*100:0;
  }
  var bar=$('bar'); bar.style.width=Math.max(0,Math.min(100,pct))+'%';
  bar.classList.toggle('low',M.reveal>0?false:(M.lv.t>0?M.time<=30:(M.errLim>0&&M.err>=M.errLim-1)));
  memRenderInfo();
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
  M.flips++;
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
      if(M.left<=0){ stopMemPair(); setTimeout(memWin,260); }
    },380);
  } else {
    M.streak=0; M.err++; M.busy=true; syncMemHud();
    [ea,el].forEach(function(e){ if(e) e.classList.add('bad'); });
    setTimeout(function(){
      [ea,el].forEach(function(e){ if(!e) return; e.classList.remove('bad'); e.classList.add('down'); });
      M.busy=false; syncMemHud();
      if(M.errLim>0&&M.err>M.errLim) memFail('犯错次数用完');
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
  M.hint--; syncMemTools(); syncMemHud();
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
  M.shuf--; syncMemTools(); syncMemHud();
  var cells=[], vals=[];
  for(var r=0;r<M.rows;r++) for(var c=0;c<M.cols;c++) if(M.g[r][c]){ cells.push([r,c]); vals.push(M.g[r][c]); }
  if(!cells.length) return;
  var v=shuffled(vals,rngOf(Date.now()&0x7fffffff));
  for(var i=0;i<cells.length;i++) M.g[cells[i][0]][cells[i][1]]=v[i];
  M.first=null; M.streak=0; M.busy=false;
  memRepaint();
}
function memWin(){
  if(M.over) return;
  M.over=true; M.busy=true;
  stopMemReveal(); stopMemPair();
  var no=M.no;
  var bonus=(M.lv.t>0?Math.round(M.time)*2:0)+(M.errLim>0?Math.max(0,M.errLim-M.err)*20:0);
  M.score+=bonus;
  if(!save.mem.best[no]||M.score>save.mem.best[no]) save.mem.best[no]=M.score;
  if(no>save.mem.max) save.mem.max=Math.min(no,MEM_LEVELS.length);
  storeSave();
  var parts=[];
  if(M.lv.t>0) parts.push('剩余 '+fmt(M.time));
  parts.push('犯错 '+M.err+(M.errLim>0?'/'+M.errLim+' 次':' 次（不限）'));
  parts.push('奖励 '+bonus+' 分，本关 '+M.score+' 分');
  var last=no>=MEM_LEVELS.length;
  dialog(last?'全部通关':'第 '+no+' 关完成',
    parts.join('，')+'。',
    last?'首页':'下一关',
    last?null:'首页',
    last?renderHome:function(){ startMem(no+1); },
    last?null:renderHome);
}
function memFail(reason){
  if(M.over) return;
  M.over=true; M.busy=true;
  stopMemReveal(); stopMemPair();
  var no=M.no;
  dialog(reason||'配对失败','还剩 '+M.left+' 对没配上。','再来一次','首页',
    function(){ startMem(no); }, renderHome);
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
  if(!m3Swappable(G.g,G.ov,tr,tc)) return;
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

var m3GoalsBox=document.createElement('div'); m3GoalsBox.id='goals'; m3GoalsBox.hidden=true; $('stat').appendChild(m3GoalsBox);
var m3OvLayer=document.createElement('div'); m3OvLayer.id='ov'; $('board').appendChild(m3OvLayer);
$('hLvMax').textContent=LEVELS.length; $('sMaxAll').textContent=LEVELS.length;
syncMusic();
renderHome();
