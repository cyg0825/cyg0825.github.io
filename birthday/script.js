(function() {
    var BIRTHDAY_WISHES = [
        "生日快乐！愿你一年比一年更美好",
        "愿所有的幸福都围绕着你，生日快乐！",
        "今天是你的专属日，愿你被温柔以待",
        "生日快乐！愿你所愿皆所成，所求皆如愿",
        "愿你三冬暖，愿你春不寒，生日快乐",
        "愿未来的每一天都有星光相伴，生日快乐",
        "愿你所有的努力都不被辜负，生日快乐！",
        "愿你永远年轻，永远热泪盈眶，生日快乐",
        "愿时光待你如初，愿岁月不负你，生日快乐",
        "愿你眼里有光，心中有爱，生日快乐！",
        "愿你每一岁都奔走在热爱里，生日快乐",
        "愿世界温柔待你，愿岁月静好，生日快乐",
        "愿你往后的日子皆有阳光，生日快乐！",
        "愿你一生努力一生被爱，生日快乐",
        "愿你拥有面包、玫瑰与星辰大海，生日快乐",
        "愿你的笑容永远灿烂，生日快乐！",
        "愿时光不老，我们不散，生日快乐",
        "愿你所想之事皆可如愿，生日快乐！",
        "愿你继续兴致盎然与世界交手，生日快乐",
        "愿你所有快乐无需假装，生日快乐！",
        "愿你清澈明亮，愿你一生有爱，生日快乐",
        "愿你做个温柔的人，拥有岁月的垂青",
        "愿你走过千山万水归来仍是少年，生日快乐！",
        "愿你此生尽兴，赤诚善良，生日快乐",
        "愿世间所有美好与你不期而遇，生日快乐！",
        "愿你不负自己，不负岁月，生日快乐",
        "愿你在每个夜晚有星光，每个清晨有暖阳",
        "愿你永远保持热爱，奔赴下一场山海",
        "愿你相信，所有的美好都在路上，生日快乐",
        "愿你的生活充满诗意与远方，生日快乐",
        "愿你心之所向皆可至，生日快乐！",
        "愿你被这个世界温柔相待，生日快乐",
        "愿你永远是那个最特别的存在，生日快乐",
        "愿你余生漫漫，皆是欢喜，生日快乐",
        "愿你想要的都拥有，得不到的都释怀",
        "愿你如阳光，明媚不忧伤，生日快乐",
        "愿你活得像自己，温柔且坚定，生日快乐",
        "愿你成为自己的太阳，无需凭借谁的光",
        "愿你此生尽兴，生日快乐！",
        "愿时光能缓，愿故人不散，生日快乐",
        "愿你永远相信美好的事情即将发生",
        "愿你的人生比童话更精彩，生日快乐",
        "愿你眼里有星辰，心中有大海，生日快乐",
        "愿所有的好运都藏在你未来的日子里",
        "愿你继续向前走，别回头，生日快乐",
        "愿你比昨天更快乐，比明天更期待",
        "愿你一生被爱，一生可爱，生日快乐",
        "愿你在自己的世界里闪闪发光，生日快乐",
        "愿你拥有无尽的勇气和温柔，生日快乐",
        "愿你是清欢也是惊喜，生日快乐",
        "愿世界温柔以待，愿岁月不负初心",
        "愿你活出自己想要的样子，生日快乐",
        "愿你永远有一颗少女心，生日快乐",
        "愿你永远相信爱与美好，生日快乐",
        "愿你的每一个梦都能实现，生日快乐",
        "愿你被爱包围，被幸福填满，生日快乐",
        "愿你走过的路都繁花盛开，生日快乐",
        "愿你拥有最真挚的朋友，最温暖的陪伴",
        "愿你的未来如星辰般闪耀，生日快乐",
        "愿时光善待你，愿生活宠爱你",
        "愿你永远幸福，永远被爱，生日快乐",
        "愿你一生顺遂，万事如意，生日快乐",
        "愿你永远年轻，永远美好，生日快乐",
        "愿所有的美好如约而至，生日快乐",
        "愿你的人生如诗如画，生日快乐",
        "愿你此生无憾，此生有光，生日快乐",
        "愿你永远被世界温柔相待，生日快乐",
        "愿你的故事有人听，愿你的笑容有人疼",
        "愿你永远是那个幸运的孩子，生日快乐",
        "愿你的付出都有回报，生日快乐",
        "愿你活成自己喜欢的样子，生日快乐",
        "愿你的生命中充满阳光和雨露",
        "愿你永远被爱，永远被珍惜，生日快乐",
        "愿你的每一天都充满惊喜和感动",
        "愿你的世界永远春暖花开，生日快乐",
        "愿你如夏花般绚烂，生日快乐",
        "愿你的未来充满无限可能，生日快乐",
        "愿你永远保持善良和勇气，生日快乐",
        "愿你一生平安喜乐，生日快乐",
        "愿你永远被幸福包围，生日快乐",
        "愿你的人生一路高歌，生日快乐",
        "愿你永远有梦，永远有光，生日快乐",
        "愿你的生命如花般绽放，生日快乐",
        "愿所有的温柔都能被岁月妥善收藏",
        "愿你永远被生活温柔相待，生日快乐",
        "愿你此生有爱，此生有光，生日快乐",
        "愿你的人生充满浪漫和惊喜，生日快乐",
        "愿你永远是最幸福的那个人，生日快乐",
        "愿你所有的愿望都能实现，生日快乐",
        "愿你的生活永远充满阳光，生日快乐",
        "愿你的人生如彩虹般绚丽，生日快乐",
        "愿你永远年轻，永远快乐，生日快乐",
        "愿你永远被爱，永远被幸福包围",
        "愿你的人生故事精彩无比，生日快乐",
        "愿你永远相信奇迹，生日快乐",
        "愿你的生命充满意义，生日快乐",
        "愿你的未来一片光明，生日快乐",
        "愿你的每一步都走向更好的自己",
        "愿你永远被温柔以待，生日快乐",
        "愿你的人生充满美好和期待",
        "愿你永远是自己，不必讨好谁，生日快乐",
        "愿你活成自己最爱的模样，生日快乐",
        "愿你勇敢做自己，世界都为你让路",
        "愿你不被定义，不必解释，生日快乐",
        "愿你爱自己胜过爱别人，生日快乐",
        "愿你自由而热烈，坦荡而勇敢",
        "愿你忠于自己，热爱不减，生日快乐",
        "愿你成为自己的英雄，生日快乐",
        "愿你不慌不忙，做自己的光",
        "愿你永远有做自己的勇气，生日快乐",
        "愿你心中有海，眼中有光，做自己",
        "愿你按自己的节奏生长，生日快乐",
        "愿你不被世俗同化，保持自己的热爱",
        "愿你活得洒脱，笑得坦荡，生日快乐",
        "愿你接受自己的不完美，生日快乐",
        "愿你相信自己值得一切美好",
        "愿你坚持自己的热爱，生日快乐",
        "愿你成为自己最坚实的依靠",
        "愿你永远站在自己这一边",
        "愿你永远不要为别人而活",
        "愿你独立勇敢，闪闪发光",
        "愿你是自己最好的朋友",
        "愿你永远支持自己，生日快乐"
    ];

    var TIP_BG_COLORS = [
        'rgb(238, 230, 250)', 'rgb(221, 214, 243)', 'rgb(206, 197, 231)',
        'rgb(255, 228, 238)', 'rgb(243, 224, 247)', 'rgb(216, 191, 216)',
        'rgb(255, 218, 225)', 'rgb(218, 212, 243)', 'rgb(225, 212, 231)',
        'rgb(255, 205, 220)', 'rgb(238, 223, 247)', 'rgb(245, 230, 235)',
        'rgb(218, 212, 243)', 'rgb(250, 220, 235)', 'rgb(230, 220, 240)',
        'rgb(255, 215, 225)', 'rgb(240, 225, 245)', 'rgb(220, 200, 230)',
        'rgb(255, 225, 235)', 'rgb(232, 220, 248)'
    ];

    var TIP_COUNT = 99;
    var TIP_INTERVAL = 450;
    var WISH_W = 270;
    var WISH_H_MIN = 120;
    var TOTAL_IMAGES = 21;
    var TOTAL_AUDIOS = 4;

    var MODE_GROWTH = 'growth';
    var MODE_RANDOM = 'random';
    var MODE_CURVE_CW = 'curve_cw';
    var MODE_CURVE_CCW = 'curve_ccw';
    var MODE_RIPPLE = 'ripple';
    var MODE_HEARTBEAT = 'heartbeat';
    var MODE_OUTLINE_FILL = 'outline_fill';
    var MODE_RAINFALL = 'rainfall';

    var bgContainer = document.getElementById('bgContainer');
    var bgImage = document.getElementById('bgImage');
    var overlayLayer = document.getElementById('overlayLayer');
    var mainWindow = document.getElementById('mainWindow');
    var startBtn = document.getElementById('startBtn');
    var skipBtn = document.getElementById('skipBtn');
    var mainCloseBtn = document.getElementById('mainCloseBtn');
    var closeAllBtn = document.getElementById('closeAllBtn');
    var restartBtn = document.getElementById('restartBtn');
    var wishesContainer = document.getElementById('wishesContainer');
    var bgAudio = document.getElementById('bgAudio');

    var naturalW = 0;
    var naturalH = 0;
    var curScale = 1;
    var wishesCreated = 0;
    var isClosing = false;
    var timeouts = [];
    var wishElements = [];
    var heartPositions = [];
    var heartDelays = null;
    var heartRainfall = false;
    var heartRainfallDistance = 0;

    function updateScale() {
        if (!bgImage.naturalWidth) return;

        naturalW = bgImage.naturalWidth;
        naturalH = bgImage.naturalHeight;

        var displayedW = bgImage.clientWidth;
        var displayedH = bgImage.clientHeight;

        if (!displayedW || !displayedH) return;

        curScale = displayedW / naturalW;

        overlayLayer.style.width = naturalW + 'px';
        overlayLayer.style.height = naturalH + 'px';
        overlayLayer.style.transform = 'scale(' + curScale + ')';
    }

    function generateHeartPositions(count) {
        var modes = [MODE_GROWTH, MODE_RANDOM, MODE_CURVE_CW, MODE_CURVE_CCW, MODE_RIPPLE, MODE_HEARTBEAT, MODE_OUTLINE_FILL, MODE_RAINFALL];
        var mode = modes[Math.floor(Math.random() * modes.length)];

        if (mode === MODE_GROWTH) {
            return { positions: generateGrowthPositions(count), delays: null };
        } else if (mode === MODE_RANDOM) {
            return { positions: generateRandomPositions(count), delays: null };
        } else if (mode === MODE_CURVE_CW) {
            return { positions: generateCurveCwPositions(count), delays: null };
        } else if (mode === MODE_CURVE_CCW) {
            return { positions: generateCurveCcwPositions(count), delays: null };
        } else if (mode === MODE_RIPPLE) {
            return generateRipplePositions(count);
        } else if (mode === MODE_HEARTBEAT) {
            return generateHeartbeatPositions(count);
        } else if (mode === MODE_OUTLINE_FILL) {
            return generateOutlineFillPositions(count);
        } else {
            return generateRainfallPositions(count);
        }
    }

    function sampleHeartPoints(count, dedup) {
        updateScale();

        var centerX = naturalW / 2;
        var centerY = naturalH / 2;
        var offsetY = -naturalH * 0.15;
        var padding = 20;
        var availableW = naturalW - padding * 2 - WISH_W;
        var availableH = naturalH - padding * 2 - WISH_H_MIN;
        var heartScale = Math.min(availableW / 32, availableH / 32);

        var rawPositions = [];
        var step = (2 * Math.PI) / count;

        for (var i = 0; i < count; i++) {
            var t = i * step;
            var rawX = 16 * Math.pow(Math.sin(t), 3);
            var rawY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

            var x = centerX + rawX * heartScale - WISH_W / 2;
            var y = centerY + offsetY + rawY * heartScale - WISH_H_MIN / 2;

            rawPositions.push({
                x: Math.max(5, x),
                y: Math.max(5, y),
                dist: Math.sqrt(Math.pow(rawX, 2) + Math.pow(rawY, 2))
            });
        }

        if (dedup === false) {
            var plainPositions = [];
            for (var p = 0; p < rawPositions.length; p++) {
                plainPositions.push({ x: rawPositions[p].x, y: rawPositions[p].y });
            }
            return plainPositions;
        }

        rawPositions.sort(function(a, b) {
            return a.dist - b.dist;
        });

        var minDist = Math.min(WISH_W, WISH_H_MIN) * 0.35;
        var positions = [];
        for (var j = 0; j < rawPositions.length; j++) {
            var dup = false;
            for (var k = 0; k < positions.length; k++) {
                var dx = rawPositions[j].x - positions[k].x;
                var dy = rawPositions[j].y - positions[k].y;
                if (Math.sqrt(dx * dx + dy * dy) < minDist) {
                    dup = true;
                    break;
                }
            }
            if (!dup) {
                positions.push({ x: rawPositions[j].x, y: rawPositions[j].y });
            }
        }

        return positions;
    }

    function generateGrowthPositions(count) {
        return sampleHeartPoints(count, false);
    }

    function generateRandomPositions(count) {
        var positions = sampleHeartPoints(count, false);
        for (var i = positions.length - 1; i > 0; i--) {
            var r = Math.floor(Math.random() * (i + 1));
            var tmp = positions[i];
            positions[i] = positions[r];
            positions[r] = tmp;
        }
        return positions;
    }

    function generateCurveCwPositions(count) {
        updateScale();

        var centerX = naturalW / 2;
        var centerY = naturalH / 2;
        var offsetY = -naturalH * 0.15;
        var padding = 20;
        var availableW = naturalW - padding * 2 - WISH_W;
        var availableH = naturalH - padding * 2 - WISH_H_MIN;
        var heartScale = Math.min(availableW / 32, availableH / 32);

        var positions = [];
        var step = (2 * Math.PI) / count;

        for (var i = 0; i < count; i++) {
            var t = i * step;
            var rawX = 16 * Math.pow(Math.sin(t), 3);
            var rawY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

            var x = centerX + rawX * heartScale - WISH_W / 2;
            var y = centerY + offsetY + rawY * heartScale - WISH_H_MIN / 2;

            positions.push({
                x: Math.max(5, x),
                y: Math.max(5, y)
            });
        }

        return positions;
    }

    function generateCurveCcwPositions(count) {
        updateScale();

        var centerX = naturalW / 2;
        var centerY = naturalH / 2;
        var offsetY = -naturalH * 0.15;
        var padding = 20;
        var availableW = naturalW - padding * 2 - WISH_W;
        var availableH = naturalH - padding * 2 - WISH_H_MIN;
        var heartScale = Math.min(availableW / 32, availableH / 32);

        var positions = [];
        var step = (2 * Math.PI) / count;

        for (var i = 0; i < count; i++) {
            var t = (2 * Math.PI) - i * step;
            var rawX = 16 * Math.pow(Math.sin(t), 3);
            var rawY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

            var x = centerX + rawX * heartScale - WISH_W / 2;
            var y = centerY + offsetY + rawY * heartScale - WISH_H_MIN / 2;

            positions.push({
                x: Math.max(5, x),
                y: Math.max(5, y)
            });
        }

        return positions;
    }

    function generateRipplePositions(count) {
        var positions = sampleHeartPoints(count, false);

        var centerX = naturalW / 2;
        var centerY = naturalH / 2 - naturalH * 0.15;

        var withDist = positions.map(function(p) {
            return {
                pos: p,
                dist: Math.sqrt(Math.pow(p.x + WISH_W / 2 - centerX, 2) + Math.pow(p.y + WISH_H_MIN / 2 - centerY, 2))
            };
        });

        withDist.sort(function(a, b) { return a.dist - b.dist; });

        var maxDist = withDist[withDist.length - 1].dist;
        var ringCount = 4;
        var ringInterval = maxDist / ringCount;

        var finalPositions = [];
        var delays = [];
        var lastDelay = 0;

        for (var r = 0; r < ringCount; r++) {
            var ringStart = r * ringInterval;
            var ringEnd = (r + 1) * ringInterval;
            var ring = withDist.filter(function(item) {
                return item.dist >= ringStart && item.dist < ringEnd;
            });

            for (var s = ring.length - 1; s > 0; s--) {
                var sr = Math.floor(Math.random() * (s + 1));
                var st = ring[s];
                ring[s] = ring[sr];
                ring[sr] = st;
            }

            for (var d = 0; d < ring.length; d++) {
                finalPositions.push(ring[d].pos);
                delays.push(lastDelay);
                lastDelay += 260;
            }
        }

        return { positions: finalPositions, delays: delays };
    }

    function generateHeartbeatPositions(count) {
        var positions = sampleHeartPoints(count, false);

        for (var i = positions.length - 1; i > 0; i--) {
            var r = Math.floor(Math.random() * (i + 1));
            var tmp = positions[i];
            positions[i] = positions[r];
            positions[r] = tmp;
        }

        var delays = [];
        var beatPattern = [150, 150, 500];
        var beatIdx = 0;
        var totalDelay = 0;

        for (var j = 0; j < positions.length; j++) {
            totalDelay += beatPattern[beatIdx % beatPattern.length];
            delays.push(totalDelay);
            beatIdx++;
        }

        return { positions: positions, delays: delays };
    }

    function generateOutlineFillPositions(count) {
        updateScale();

        var centerX = naturalW / 2;
        var centerY = naturalH / 2;
        var offsetY = -naturalH * 0.15;
        var padding = 20;
        var availableW = naturalW - padding * 2 - WISH_W;
        var availableH = naturalH - padding * 2 - WISH_H_MIN;
        var heartScale = Math.min(availableW / 32, availableH / 32);

        var outlineCount = Math.floor(count * 0.4);
        var fillCount = count - outlineCount;

        var outlinePositions = [];
        var step = (2 * Math.PI) / outlineCount;
        for (var i = 0; i < outlineCount; i++) {
            var t = i * step;
            var rawX = 16 * Math.pow(Math.sin(t), 3);
            var rawY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            outlinePositions.push({
                x: Math.max(5, centerX + rawX * heartScale - WISH_W / 2),
                y: Math.max(5, centerY + offsetY + rawY * heartScale - WISH_H_MIN / 2)
            });
        }

        var fillPositions = [];
        var centerRawX = 0;
        var centerRawY = 0;
        for (var f = 0; f < fillCount; f++) {
            var frac = Math.random() * 0.85;
            var angle = Math.random() * 2 * Math.PI;
            var rawX = centerRawX + Math.cos(angle) * 16 * frac;
            var rawY = centerRawY + Math.sin(angle) * 13 * frac * (0.7 + 0.3 * Math.random());
            var heartY = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) * frac;
            fillPositions.push({
                x: Math.max(5, centerX + rawX * heartScale - WISH_W / 2),
                y: Math.max(5, centerY + offsetY + heartY * heartScale - WISH_H_MIN / 2)
            });
        }

        var positions = outlinePositions.concat(fillPositions);

        var delays = [];
        for (var d = 0; d < outlinePositions.length; d++) {
            delays.push(d * 200);
        }
        var fillBaseDelay = outlinePositions.length * 200 + 300;
        for (var e = 0; e < fillPositions.length; e++) {
            delays.push(fillBaseDelay + e * 500);
        }

        return { positions: positions, delays: delays };
    }

    function generateRainfallPositions(count) {
        var positions = sampleHeartPoints(count, false);

        for (var i = positions.length - 1; i > 0; i--) {
            var r = Math.floor(Math.random() * (i + 1));
            var tmp = positions[i];
            positions[i] = positions[r];
            positions[r] = tmp;
        }

        var fallDistance = Math.max(naturalH * 0.3, 200);

        var delays = [];
        for (var j = 0; j < positions.length; j++) {
            delays.push(j * 300);
        }

        return {
            positions: positions,
            delays: delays,
            rainfall: true,
            rainfallFallDistance: fallDistance
        };
    }

    function fadeInMainWindow() {
        setTimeout(function() {
            mainWindow.classList.add('visible');
        }, 100);
    }

    function playRandomMusic() {
        var audioIdx = Math.floor(Math.random() * TOTAL_AUDIOS) + 1;
        bgAudio.src = 'vo/' + audioIdx + '.mp3';
        bgAudio.volume = 0.7;
        bgAudio.play().catch(function(e) {
            console.log('Audio play failed:', e);
        });
    }

    function stopMusic() {
        bgAudio.pause();
        bgAudio.currentTime = 0;
    }

    function fadeOutAndStart() {
        mainWindow.classList.add('fading-out');
        setTimeout(function() {
            mainWindow.style.display = 'none';
            playRandomMusic();
            startTipWindows();
        }, 500);
    }

    function closeAllWindows() {
        isClosing = true;
        timeouts.forEach(function(t) { clearTimeout(t); });
        timeouts = [];

        wishElements.forEach(function(el) {
            el.style.opacity = '0';
            setTimeout(function() { el.remove(); }, 300);
        });
        wishElements = [];

        if (mainWindow.style.display !== 'none') {
            mainWindow.style.display = 'none';
        }

        stopMusic();
        closeAllBtn.classList.remove('visible');
        restartBtn.classList.add('visible');
    }

    function restartWishes() {
        restartBtn.classList.remove('visible');
        isClosing = false;
        playRandomMusic();
        startTipWindows();
    }

    function createRandomTipWindow(index) {
        if (isClosing) return;
        if (!naturalW || naturalW === 0) return;

        var wishText = BIRTHDAY_WISHES[Math.floor(Math.random() * BIRTHDAY_WISHES.length)];
        var imgIdx = Math.floor(Math.random() * TOTAL_IMAGES);
        var imgSrc = 'img/image' + imgIdx + '.jpg';
        var bgColor = TIP_BG_COLORS[Math.floor(Math.random() * TIP_BG_COLORS.length)];

        var wishPopup = document.createElement('div');
        wishPopup.className = 'wish-popup';
        wishPopup.style.background = bgColor;

        var wishImage = document.createElement('img');
        wishImage.className = 'wish-image';
        wishImage.src = imgSrc;
        wishImage.alt = '祝福图片';
        wishImage.onerror = function() {
            this.style.display = 'none';
        };

        var wishTextEl = document.createElement('div');
        wishTextEl.className = 'wish-text';
        wishTextEl.textContent = wishText;

        var wishBtn = document.createElement('button');
        wishBtn.className = 'wish-btn';
        wishBtn.textContent = '收下';
        wishBtn.addEventListener('click', function() {
            wishPopup.style.opacity = '0';
            wishPopup.style.transform = 'scale(0.8)';
            setTimeout(function() {
                wishPopup.remove();
                wishElements = wishElements.filter(function(el) { return el !== wishPopup; });
            }, 300);
        });

        wishPopup.appendChild(wishImage);
        wishPopup.appendChild(wishTextEl);
        wishPopup.appendChild(wishBtn);

        var pos = heartPositions[index % heartPositions.length];
        if (pos) {
            if (heartRainfall) {
                wishPopup.style.left = pos.x + 'px';
                wishPopup.style.top = (pos.y - heartRainfallDistance) + 'px';
                wishPopup.style.transition = 'top 0.6s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s ease, transform 0.3s ease';
            } else {
                wishPopup.style.left = pos.x + 'px';
                wishPopup.style.top = pos.y + 'px';
            }
        }

        wishesContainer.appendChild(wishPopup);
        wishElements.push(wishPopup);

        requestAnimationFrame(function() {
            if (heartRainfall) {
                requestAnimationFrame(function() {
                    wishPopup.style.top = pos.y + 'px';
                    wishPopup.classList.add('visible');
                });
            } else {
                wishPopup.classList.add('visible');
            }
        });
    }

    function startTipWindows() {
        updateScale();
        closeAllBtn.classList.add('visible');
        wishesCreated = 0;
        var result = generateHeartPositions(TIP_COUNT);
        heartPositions = result.positions;
        heartDelays = result.delays || null;
        heartRainfall = result.rainfall || false;
        heartRainfallDistance = result.rainfallFallDistance || 0;

        for (var i = 0; i < TIP_COUNT; i++) {
            (function(idx) {
                var delay = heartDelays ? (heartDelays[idx] || idx * TIP_INTERVAL) : idx * TIP_INTERVAL;
                var timeout = setTimeout(function() {
                    if (!isClosing) {
                        createRandomTipWindow(idx);
                        wishesCreated++;
                    }
                }, delay);
                timeouts.push(timeout);
            })(i);
        }
    }

    startBtn.addEventListener('click', fadeOutAndStart);
    skipBtn.addEventListener('click', closeAllWindows);
    mainCloseBtn.addEventListener('click', closeAllWindows);
    closeAllBtn.addEventListener('click', closeAllWindows);
    restartBtn.addEventListener('click', restartWishes);

    window.addEventListener('resize', function() {
        updateScale();

        if (heartPositions.length > 0) {
            var result = generateHeartPositions(TIP_COUNT);
            heartPositions = result.positions;
            heartDelays = result.delays || null;
            heartRainfall = result.rainfall || false;
            heartRainfallDistance = result.rainfallFallDistance || 0;
            wishElements.forEach(function(el, i) {
                var pos = heartPositions[i % heartPositions.length];
                if (pos) {
                    el.style.left = pos.x + 'px';
                    el.style.top = heartRainfall ? (pos.y - heartRainfallDistance) + 'px' : pos.y + 'px';
                }
            });
        }
    });

    if (bgImage.complete && bgImage.naturalWidth) {
        updateScale();
        fadeInMainWindow();
    } else {
        bgImage.addEventListener('load', function() {
            updateScale();
            fadeInMainWindow();
        });
    }
})();