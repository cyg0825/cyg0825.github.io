/* 全站加载页逻辑：等首屏资源与页面登记的图片都就绪才淡出，
   并让未加载完的图片显示占位骨架而不是空白框 / 破图图标。
   供页面调用的 API：
     SiteLoading.track(promise)                 登记首屏要额外等待的资源
     SiteLoading.preloadImages(urls, onProgress, timeout)  预加载一组图片
     SiteLoading.busy(label, sub) -> release  复用遮罩显示一次“正在准备…”
     SiteLoading.progress(v) / show() / hide() */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var box = doc.getElementById('site-loading');
  if (!box) return;
  box.style.animation = 'none'; // CSS 里的失效兜底不再需要

  var bar = box.querySelector('.sl-bar');
  var pctEl = box.querySelector('.sl-pct');
  var titleEl = box.querySelector('.sl-title');
  var subEl = box.querySelector('.sl-sub');

  var MAX_WAIT = 12000, MIN_SHOW = 320, FADE = 460;
  var started = Date.now();
  var domReady = doc.readyState !== 'loading';
  var windowLoaded = doc.readyState === 'complete';
  var firstFinished = false, visible = true;
  var taskTotal = 0, taskDone = 0;
  var ticker = null, watchdog = null, hideTimer = null;

  root.classList.add('site-loading-active', 'site-img-guard');

  function setProgress(v, label) {
    v = Math.max(0, Math.min(100, Math.round(v)));
    bar.style.width = v + '%';
    pctEl.textContent = v + '%';
    if (label) titleEl.textContent = label;
  }

  // data-src 是懒加载占位，它加载完不算数，等真实图片到位
  function isPlaceholder(img) {
    var src = img.getAttribute('src') || '';
    return src !== '' && src.indexOf('data:') === 0 && img.hasAttribute('data-src');
  }

  function imageStats() {
    var list = doc.querySelectorAll('img[src]'), total = 0, done = 0;
    for (var i = 0; i < list.length; i++) {
      var img = list[i], src = img.getAttribute('src') || '';
      if (!src || src.indexOf('data:') === 0 || isPlaceholder(img)) continue;
      total++;
      if (img.complete) done++;
    }
    return { total: total, done: done };
  }

  function tick() {
    if (firstFinished || !visible) return;
    var im = imageStats();
    var total = im.total + taskTotal;
    var done = im.done + taskDone;
    var byCount = total > 0 ? done / total * 92 : 0;
    var byTime = Math.min(88, (Date.now() - started) / 120);
    setProgress(Math.max(6, Math.min(95, Math.max(byCount, byTime))));
  }
  function startTicker() { if (!ticker) ticker = setInterval(tick, 120); tick(); }
  function stopTicker() { if (ticker) { clearInterval(ticker); ticker = null; } }

  function markReady(img) {
    if (img.naturalWidth > 0 && !isPlaceholder(img)) img.classList.add('site-img-ready');
  }
  function scanImages() {
    var list = doc.querySelectorAll('img[src]');
    for (var i = 0; i < list.length; i++) {
      if (list[i].complete) markReady(list[i]);
    }
  }

  // 捕获阶段：连 JS 动态插入的关卡图块、祝福卡片图片也一并受保护
  doc.addEventListener('load', function (e) {
    if (e.target && e.target.tagName === 'IMG') {
      e.target.classList.remove('site-img-failed');
      markReady(e.target);
    }
    tick();
  }, true);
  doc.addEventListener('error', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.target.classList.add('site-img-failed');
    tick();
  }, true);

  function hideOverlay() {
    if (!visible) return;
    visible = false;
    root.classList.remove('site-loading-active');
    box.classList.add('is-hidden');
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(function () { box.style.display = 'none'; }, FADE);
    stopTicker();
  }

  function finish() {
    if (firstFinished) return;
    firstFinished = true;
    if (watchdog) clearTimeout(watchdog);
    setProgress(100, '加载完成');
    subEl.textContent = '马上就好…';
    setTimeout(hideOverlay, Math.max(0, MIN_SHOW - (Date.now() - started)) + 120);
  }

  function check() {
    if (firstFinished || !domReady || !windowLoaded || taskDone < taskTotal) return;
    finish();
  }

  function showOverlay(label, sub) {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    box.style.display = '';
    box.classList.remove('is-hidden');
    visible = true;
    root.classList.add('site-loading-active');
    titleEl.textContent = label || '正在加载，请稍候…';
    subEl.textContent = sub || '页面与图片准备中';
    setProgress(6);
    startTicker();
  }

  function track(p) {
    if (!p || typeof p.then !== 'function') return;
    taskTotal++;
    var settle = function () { taskDone++; tick(); check(); };
    Promise.resolve(p).then(settle, settle);
    tick();
  }

  // 预加载一组图片，失败或超时都不阻塞页面；返回 Promise 供 track / busy 使用
  function preloadImages(urls, onProgress, timeout) {
    urls = urls || [];
    var total = urls.length;
    if (!total) return Promise.resolve();
    var done = 0, resolved = false;
    return new Promise(function (resolve) {
      var end = function () { if (!resolved) { resolved = true; resolve(); } };
      var timer = setTimeout(end, timeout || 8000);
      urls.forEach(function (url) {
        var img = new Image(), settled = false;
        var settle = function () {
          if (settled) return;
          settled = true;
          done++;
          if (onProgress) onProgress(Math.round(done / total * 100));
          if (done === total) { clearTimeout(timer); end(); }
        };
        img.onload = settle;
        img.onerror = settle;
        img.src = url;
        if (img.complete) settle();
      });
    });
  }

  window.SiteLoading = {
    track: track,
    preloadImages: preloadImages,
    progress: function (v, label) { if (visible) setProgress(v, label); },
    // 延迟 180ms 才显示，资源已在缓存时不闪一下遮罩
    busy: function (label, sub) {
      if (!firstFinished || visible) return function () {};
      var released = false;
      var timer = setTimeout(function () { showOverlay(label, sub); }, 180);
      return function () {
        if (released) return;
        released = true;
        clearTimeout(timer);
        if (visible) hideOverlay();
      };
    },
    show: function (label, sub) { if (firstFinished && !visible) showOverlay(label, sub); },
    hide: function () { if (firstFinished) hideOverlay(); }
  };

  if (domReady) scanImages();
  else doc.addEventListener('DOMContentLoaded', function () { domReady = true; scanImages(); check(); });
  if (!windowLoaded) window.addEventListener('load', function () { windowLoaded = true; scanImages(); check(); });
  watchdog = setTimeout(finish, MAX_WAIT);
  startTicker();
  check();
}());
