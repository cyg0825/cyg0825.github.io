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

    var DAILY_WISHES = [
        "你比自己想象的更强大",
        "今天也要好好爱自己",
        "一切都会慢慢变好",
        "你的存在本身就是美好",
        "每一步都算数，别急",
        "累了就休息，没关系",
        "你值得所有温柔与善意",
        "乌云后面总有太阳",
        "深呼吸，放松一下",
        "你已经做得很好了",
        "相信时间，相信成长",
        "小进步也是进步",
        "给自己一个大大的拥抱",
        "今天你微笑了吗",
        "一切安排都是最好的",
        "别怕，我在呢",
        "你的努力会被看见",
        "慢慢来，比较快",
        "照顾好自己最重要",
        "你让世界更美好",
        "风雨过后总有彩虹",
        "每一天都是新的开始",
        "你的善良温暖人间",
        "做自己的光",
        "不必完美，尽力就好",
        "你正在成为更好的自己",
        "世界因你而不同",
        "保持热爱，奔赴山海",
        "简单生活，深深欢喜",
        "今天也要加油呀",
        "你是独一无二的存在",
        "所有美好正在路上",
        "心向阳光，温暖自生",
        "好好吃饭，好好睡觉",
        "记得对自己温柔些",
        "你是重要的",
        "今天的你也很棒",
        "保持好奇，保持期待",
        "一切都会如你所愿",
        "微笑是最好的礼物",
        "你配得上所有美好",
        "慢慢沉淀，静静生长",
        "给自己一点甜头吧",
        "你正在闪闪发光",
        "今天也是特别的一天",
        "愿你被世界温柔以待",
        "小小的坚持大大的力量",
        "你是自己的英雄",
        "生活因你而精彩",
        "相信美好的事情会发生",
        "今天也要开心呀",
        "你的温暖感染着他人",
        "每一步都走向更好的自己",
        "好好呼吸，好好存在",
        "你的笑容是治愈良药",
        "慢慢走，欣赏啊",
        "一切都在慢慢变好",
        "你是被爱着的",
        "今天也要元气满满",
        "未来可期，人间值得",
        "保持善良，保持可爱",
        "你让今天变得更美好",
        "温柔待人，也被温柔以待"
    ];

    var BIRTHDAY_MONTH = 7;
    var BIRTHDAY_DAY_START = 20;
    var BIRTHDAY_DAY_END = 25;

    function isBirthdaySeason() {
        var now = new Date();
        return now.getMonth() === BIRTHDAY_MONTH
            && now.getDate() >= BIRTHDAY_DAY_START
            && now.getDate() <= BIRTHDAY_DAY_END;
    }

    function randomFrom(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    var isBirthday = isBirthdaySeason();
    var ACTIVE_WISHES = isBirthday ? BIRTHDAY_WISHES : DAILY_WISHES;

    var TIP_BG_COLORS = [
        'rgba(28, 40, 78, 0.72)', 'rgba(34, 32, 74, 0.72)', 'rgba(44, 34, 82, 0.72)',
        'rgba(24, 44, 70, 0.72)', 'rgba(52, 36, 84, 0.74)', 'rgba(30, 38, 88, 0.72)',
        'rgba(46, 30, 76, 0.72)', 'rgba(22, 46, 78, 0.72)', 'rgba(58, 40, 92, 0.74)',
        'rgba(26, 42, 66, 0.72)'
    ];

    var TIP_AREA = 16000;          // 桌面：每 16000px² 约一张卡
    var TIP_AREA_COMPACT = 26000;  // 小屏卡片小，数量也要收一点，重叠太多字会看不清
    var TIP_MIN = 30;
    var TIP_MAX = 48;
    var TIP_MIN_COMPACT = 10;
    var TIP_MAX_COMPACT = 14;
    var TIP_INTERVAL = 300;
    // 卡片尺寸不再写死：updateViewport() 按屏幕短边算出来，CSS 用 --card-* 变量同步渲染
    var WISH_W = 270;
    var WISH_H_MIN = 240;
    var TOTAL_IMAGES = 21;
    // 音乐用网易云在线歌单（与博客左下角播放器同一歌单），通过 Meting 中转取流，本地不存音频
    var METING_API = 'https://api.injahow.cn/meting/?server=netease&type=playlist&id=9086662585';
    // 浏览器规定 play() 必须在用户点击瞬间调用才允许出声；歌单是异步加载的，
    // 点击时先播这段静音音频"解锁"播放器，歌单到位后再换真正的歌
    var SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

    var MODE_GROWTH = 'growth';
    var MODE_RANDOM = 'random';
    var MODE_CURVE_CW = 'curve_cw';
    var MODE_CURVE_CCW = 'curve_ccw';
    var MODE_RIPPLE = 'ripple';
    var MODE_HEARTBEAT = 'heartbeat';
    var MODE_OUTLINE_FILL = 'outline_fill';
    var MODE_RAINFALL = 'rainfall';

    var bgContainer = document.getElementById('bgContainer');
    var overlayLayer = document.getElementById('overlayLayer');
    var mainWindow = document.getElementById('mainWindow');
    var startBtn = document.getElementById('startBtn');
    var skipBtn = document.getElementById('skipBtn');
    var mainCloseBtn = document.getElementById('mainCloseBtn');
    var closeAllBtn = document.getElementById('closeAllBtn');
    var restartBtn = document.getElementById('restartBtn');
    var musicBtn = document.getElementById('musicBtn');
    var musicNo = document.getElementById('musicNo');
    var wishesContainer = document.getElementById('wishesContainer');
    var bgAudio = document.getElementById('bgAudio');
    var titleText = document.getElementById('titleText');
    var greetingText = document.getElementById('greetingText');
    var cakeStage = document.getElementById('cakeStage');

    var naturalW = 0;
    var naturalH = 0;
    var isCompact = false;
    var currentMode = null;
    var resizeTimer = 0;
    var isClosing = false;
    var timeouts = [];
    var wishElements = [];
    var heartPositions = [];
    var heartDelays = null;
    var heartRainfall = false;
    var heartRainfallDistance = 0;
    var bgMounted = false;
    var userMuted = false;
    var curTrack = 0;
    var playlistUrls = null;
    var playlistPromise = null;
    var lastTrackIdx = -1;
    var audioUnlocked = false;
    var trackRetries = 0;

    function clamp(v, lo, hi) {
        return Math.max(lo, Math.min(hi, v));
    }

    function viewportSize() {
        var w = window.innerWidth || document.documentElement.clientWidth;
        var h = window.innerHeight || document.documentElement.clientHeight;
        return { w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)) };
    }

    // 布局直接用真实视口像素，不再用 2560×1440 固定画布整体缩放：
    // 那种做法在手机上缩放比只有 0.15，整页会被压成一小条，文字也缩到看不清
    function updateViewport() {
        var vp = viewportSize();
        naturalW = vp.w;
        naturalH = vp.h;
        isCompact = Math.min(vp.w, vp.h) < 760 || vp.w < 900;

        // 全局一个比例系数 --s，卡片/窗口/按钮/间距全部由它派生，比例才协调。
        // 1920×1080 桌面 → 0.60（卡片约 162px），手机 → 0.40（约 108px），
        // 短边越小缩得越明显，中间尺寸连续过渡；文字另有 px 下限保证看得清
        var shortSide = Math.min(naturalW, naturalH);
        var s = clamp(0.60 * Math.pow(shortSide / 1080, 0.55), 0.40, 0.72);
        WISH_W = Math.round(270 * s);
        var pad = Math.round(clamp(WISH_W * 0.066, 6, 18));
        var font = Math.round(clamp(WISH_W * 0.074, 12, 20));
        var imgH = Math.round(clamp(WISH_W * 0.30, 34, 90));
        var gap = Math.round(clamp(WISH_W * 0.05, 6, 12));
        // 卡片只有图片和文字，这里按"约三行文字"估一个平均高度作为心形点位的定位基准；
        // 实际高度随文案变化，创建卡片时再用实测高度校正中心
        WISH_H_MIN = Math.round(pad * 2 + imgH + gap + font * 1.4 * 3 + 4);

        var root = document.documentElement.style;
        root.setProperty('--s', s.toFixed(3));
        root.setProperty('--tap', (isCompact ? 44 : Math.round(46 * s)) + 'px');
        root.setProperty('--card-w', WISH_W + 'px');
        root.setProperty('--card-pad', pad + 'px');
        root.setProperty('--card-font', font + 'px');
        root.setProperty('--card-img-h', imgH + 'px');
        root.setProperty('--card-gap', gap + 'px');

        bgContainer.style.width = '100%';
        bgContainer.style.height = '100%';
        overlayLayer.style.width = naturalW + 'px';
        overlayLayer.style.height = naturalH + 'px';
        overlayLayer.style.transform = 'none';
    }

    function tipCount() {
        var n = Math.round(naturalW * naturalH / (isCompact ? TIP_AREA_COMPACT : TIP_AREA));
        if (naturalH < 520) n = Math.round(n * 0.6);   // 横屏手机高度小，少放几张才不糊成一团
        return clamp(n, isCompact ? TIP_MIN_COMPACT : TIP_MIN, isCompact ? TIP_MAX_COMPACT : TIP_MAX);
    }

    function generateHeartPositions(count, forcedMode) {
        var modes = [MODE_GROWTH, MODE_RANDOM, MODE_CURVE_CW, MODE_CURVE_CCW, MODE_RIPPLE, MODE_HEARTBEAT, MODE_OUTLINE_FILL, MODE_RAINFALL];
        // 旋转屏幕/拖动窗口时沿用当前模式，避免每帧重排都换个动画
        var mode = forcedMode && modes.indexOf(forcedMode) >= 0
            ? forcedMode
            : modes[Math.floor(Math.random() * modes.length)];
        currentMode = mode;

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

    // 心形公式坐标 → 屏幕坐标。x/y 分开缩放：竖屏时若强行等比，宽度受限会把整颗心压成一小条
    function heartLayout() {
        updateViewport();
        var padding = isCompact ? 12 : 20;
        var topReserve = isCompact ? 68 : 0;      // 手机顶部工具栏
        var bottomReserve = isCompact ? 40 : 0;   // 手机底部提示
        var usableW = Math.max(60, naturalW - padding * 2 - WISH_W);
        var usableH = Math.max(60, naturalH - topReserve - bottomReserve - padding * 2 - WISH_H_MIN);
        // 心形整体等比缩放铺满安全区；桌面/横屏再横向放宽一点，把多余宽度用起来，
        // 否则宽屏上心会被压在中间、两侧空一大片，显得很小很不协调
        var base = Math.min(usableW / 32, usableH / 32);
        var sx, sy;
        if (naturalH > naturalW) {
            // 竖屏：纵向拉伸把高度用起来（1.6 倍封顶，免得变成瘦长水滴）
            sx = base;
            sy = Math.min(base * 1.6, usableH / 32);
        } else {
            // 横屏/桌面：横向放宽，心更大更饱满
            sx = Math.min(usableW / 32, base * 1.3);
            sy = base;
        }
        return {
            cx: naturalW / 2,
            // 心形重心在原点偏下，直接以视口中线为基准即可，不要再整体下移，
            // 否则顶部会被裁切压平、看不出心形
            cy: naturalH / 2 + (topReserve - bottomReserve) / 2,
            sx: sx,
            sy: sy,
            padding: padding
        };
    }

    function toScreen(rawX, rawY, L) {
        return {
            x: clamp(L.cx + rawX * L.sx - WISH_W / 2, L.padding, Math.max(L.padding, naturalW - WISH_W - L.padding)),
            y: clamp(L.cy + rawY * L.sy - WISH_H_MIN / 2, L.padding, Math.max(L.padding, naturalH - WISH_H_MIN - L.padding))
        };
    }

    function sampleHeartPoints(count, dedup) {
        var L = heartLayout();
        var rawPositions = [];
        var step = (2 * Math.PI) / count;

        for (var i = 0; i < count; i++) {
            var t = i * step;
            var rawX = 16 * Math.pow(Math.sin(t), 3);
            var rawY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

            var pos = toScreen(rawX, rawY, L);
            pos.dist = Math.sqrt(rawX * rawX + rawY * rawY);
            rawPositions.push(pos);
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
        var L = heartLayout();
        var positions = [];
        var step = (2 * Math.PI) / count;

        for (var i = 0; i < count; i++) {
            var t = i * step;
            var rawX = 16 * Math.pow(Math.sin(t), 3);
            var rawY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            positions.push(toScreen(rawX, rawY, L));
        }

        return positions;
    }

    function generateCurveCcwPositions(count) {
        var L = heartLayout();
        var positions = [];
        var step = (2 * Math.PI) / count;

        for (var i = 0; i < count; i++) {
            var t = (2 * Math.PI) - i * step;
            var rawX = 16 * Math.pow(Math.sin(t), 3);
            var rawY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            positions.push(toScreen(rawX, rawY, L));
        }

        return positions;
    }

    function generateRipplePositions(count) {
        var positions = sampleHeartPoints(count, false);
        var L = heartLayout();

        var centerX = L.cx;
        var centerY = L.cy;

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
        var L = heartLayout();

        var outlineCount = Math.floor(count * 0.4);
        var fillCount = count - outlineCount;

        var outlinePositions = [];
        var step = (2 * Math.PI) / outlineCount;
        for (var i = 0; i < outlineCount; i++) {
            var t = i * step;
            var rawX = 16 * Math.pow(Math.sin(t), 3);
            var rawY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            outlinePositions.push(toScreen(rawX, rawY, L));
        }

        var fillPositions = [];
        for (var f = 0; f < fillCount; f++) {
            var frac = Math.random() * 0.85;
            var angle = Math.random() * 2 * Math.PI;
            var fillX = Math.cos(angle) * 16 * frac;
            var heartY = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) * frac;
            fillPositions.push(toScreen(fillX, heartY, L));
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

        var fallDistance = Math.round(clamp(naturalH * 0.3, 120, 260));

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

    function syncMusicBtn() {
        if (!musicBtn) return;
        var playing = !bgAudio.paused;
        var label = curTrack ? '第' + curTrack + '首' : '';
        musicBtn.classList.toggle('muted', !playing);
        if (musicNo) musicNo.textContent = curTrack ? String(curTrack) : '';
        musicBtn.title = (playing ? '暂停音乐' : '播放音乐') + (label ? '·' + label : '');
        musicBtn.setAttribute('aria-label', musicBtn.title);
    }

    function toggleMusic() {
        userMuted = !userMuted;
        if (userMuted) {
            bgAudio.pause();
        } else {
            bgAudio.play().catch(function(e) {
                console.log('Audio play failed:', e);
            });
        }
        syncMusicBtn();
    }

    function loadPlaylist() {
        if (playlistPromise) return playlistPromise;
        playlistPromise = fetch(METING_API).then(function(r) {
            return r.json();
        }).then(function(list) {
            playlistUrls = (list || []).filter(function(t) { return t && t.url; }).map(function(t) { return t.url; });
            return playlistUrls;
        }).catch(function(e) {
            console.log('Playlist load failed:', e);
            playlistPromise = null;
            return [];
        });
        return playlistPromise;
    }

    function unlockAudio() {
        if (audioUnlocked) return;
        audioUnlocked = true;
        bgAudio.src = SILENT_WAV;
        var p = bgAudio.play();
        if (p && p.catch) p.catch(function() {});
    }

    function playRandomMusic() {
        loadPlaylist().then(function(urls) {
            if (!urls || !urls.length) {
                syncMusicBtn();
                return;
            }
            var idx = Math.floor(Math.random() * urls.length);
            if (urls.length > 1 && lastTrackIdx >= 0) {
                while (idx === lastTrackIdx) idx = Math.floor(Math.random() * urls.length);
            }
            lastTrackIdx = idx;
            curTrack = idx + 1;
            bgAudio.src = urls[idx];
            bgAudio.volume = 0.7;
            if (userMuted) {
                syncMusicBtn();
                return;
            }
            bgAudio.play().catch(function(e) {
                console.log('Audio play failed:', e);
            });
        });
    }

    function stopMusic() {
        bgAudio.pause();
        bgAudio.currentTime = 0;
    }

    function fadeOutAndStart() {
        unlockAudio();
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
        if (musicBtn) musicBtn.classList.remove('visible');
        restartBtn.classList.add('visible');
    }

    function restartWishes() {
        restartBtn.classList.remove('visible');
        isClosing = false;
        userMuted = false;
        playRandomMusic();
        startTipWindows();
    }

    function mountBackground() {
        if (bgMounted || !cakeStage) return;
        bgMounted = true;
        import('./cake3d.js').then(function(mod) {
            if (mod && mod.mount) {
                var bg = mod.mount(cakeStage, { scene: isBirthday ? 'cake' : 'star' });
                if (bg) cakeStage.classList.add('on');
            }
        }).catch(function(e) {
            console.log('Background load failed:', e);
        });
    }

    // 卡片高度随文字变化：用实测高度把卡片中心重新对齐到心形点位
    // （点位是按 WISH_H_MIN 这个"平均高度"算出的左上角），并夹在视口内不越界
    function wishTop(el, baseTop) {
        var h = el.offsetHeight || WISH_H_MIN;
        var edge = isCompact ? 12 : 20;
        return clamp(baseTop + (WISH_H_MIN - h) / 2, edge, Math.max(edge, naturalH - h - edge));
    }

    function createRandomTipWindow(index) {
        if (isClosing) return;
        if (!naturalW || naturalW === 0) return;

        var wishText = randomFrom(ACTIVE_WISHES);
        var imgIdx = Math.floor(Math.random() * TOTAL_IMAGES);
        var imgSrc = 'img/image' + imgIdx + '.jpg';
        var bgColor = TIP_BG_COLORS[Math.floor(Math.random() * TIP_BG_COLORS.length)];

        var wishPopup = document.createElement('div');
        wishPopup.className = 'wish-popup';
        // 卡片只展示图片和文字；手机端没有背景模糊，底色调实一点，
        // 避免下层卡片的文字透上来糊成一片
        wishPopup.style.setProperty('--card-tint', isCompact
            ? bgColor.replace(/0\.7\d+\)$/, '0.94)')
            : bgColor);

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

        wishPopup.appendChild(wishImage);
        wishPopup.appendChild(wishTextEl);

        var pos = heartPositions[index % heartPositions.length];
        var targetTop = pos ? pos.y : 0;
        if (pos) wishPopup.style.left = pos.x + 'px';
        if (heartRainfall) {
            wishPopup.style.top = (targetTop - heartRainfallDistance) + 'px';
            wishPopup.style.transition = 'top 0.6s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s ease, transform 0.3s ease';
        } else {
            wishPopup.style.top = targetTop + 'px';
        }

        wishesContainer.appendChild(wishPopup);
        wishElements.push(wishPopup);

        // 插入 DOM 后才能量到真实高度；按实际高度校正中心，文字多寡都不会让心形跑偏
        targetTop = wishTop(wishPopup, targetTop);
        if (!heartRainfall) wishPopup.style.top = targetTop + 'px';

        requestAnimationFrame(function() {
            if (heartRainfall) {
                requestAnimationFrame(function() {
                    wishPopup.style.top = targetTop + 'px';
                    wishPopup.classList.add('visible');
                });
            } else {
                wishPopup.classList.add('visible');
            }
        });
    }

    function startTipWindows() {
        updateViewport();
        closeAllBtn.classList.add('visible');
        if (musicBtn) musicBtn.classList.add('visible');
        syncMusicBtn();
        mountBackground();
        var count = tipCount();
        var result = generateHeartPositions(count);
        heartPositions = result.positions;
        heartDelays = result.delays || null;
        heartRainfall = result.rainfall || false;
        heartRainfallDistance = result.rainfallFallDistance || 0;

        for (var i = 0; i < count; i++) {
            (function(idx) {
                var delay = heartDelays ? (heartDelays[idx] || idx * TIP_INTERVAL) : idx * TIP_INTERVAL;
                var timeout = setTimeout(function() {
                    if (!isClosing) {
                        createRandomTipWindow(idx);
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
    if (musicBtn) musicBtn.addEventListener('click', toggleMusic);
    bgAudio.addEventListener('play', syncMusicBtn);
    bgAudio.addEventListener('pause', syncMusicBtn);
    bgAudio.addEventListener('error', function() {
        if (userMuted || trackRetries >= 5) return;
        trackRetries++;
        playRandomMusic();
    });

    // 旋转屏幕、手机地址栏收起、桌面拖窗口都会重排；防抖避免连续 resize 时卡片乱跳
    function onViewportChange() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            updateViewport();
            if (heartPositions.length === 0) return;

            var result = generateHeartPositions(heartPositions.length, currentMode);
            heartPositions = result.positions;
            heartDelays = result.delays || null;
            heartRainfall = result.rainfall || false;
            heartRainfallDistance = result.rainfallFallDistance || 0;
            wishElements.forEach(function(el, i) {
                var pos = heartPositions[i % heartPositions.length];
                if (!pos) return;
                el.style.transition = 'none';
                el.style.left = pos.x + 'px';
                el.style.top = wishTop(el, pos.y) + 'px';
                requestAnimationFrame(function() { el.style.transition = ''; });
            });
        }, 120);
    }

    window.addEventListener('resize', onViewportChange);
    window.addEventListener('orientationchange', onViewportChange);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', onViewportChange);
    }

    function applySeasonCopy() {
        if (isBirthday) return;
        document.title = '今天也要好好的';
        if (titleText) titleText.textContent = '今日祝福';
        if (greetingText) {
            greetingText.textContent = '';
            // 第一行：今天的小幸运已送达 🌿（整段不换行，表情不会单独成行）
            var line1 = document.createElement('span');
            line1.style.whiteSpace = 'nowrap';
            line1.textContent = '今天的小幸运已送达 🌿';
            // 第二行：随机祝福 + ✨（✨ 与前面的字绑在一起，不会落单成行）
            var line2 = document.createElement('span');
            line2.appendChild(document.createTextNode(randomFrom(DAILY_WISHES)));
            var spark = document.createElement('span');
            spark.style.whiteSpace = 'nowrap';
            spark.textContent = ' ✨';
            line2.appendChild(spark);
            greetingText.appendChild(line1);
            greetingText.appendChild(document.createElement('br'));
            greetingText.appendChild(line2);
        }
        startBtn.textContent = '收下祝福';
    }

    function preloadAssets() {
        for (var i = 0; i < TOTAL_IMAGES; i++) {
            var im = new Image();
            im.src = 'img/image' + i + '.jpg';
        }
        loadPlaylist();
        import('./cake3d.js').catch(function() {});
    }

    applySeasonCopy();

    updateViewport();
    preloadAssets();
    fadeInMainWindow();
})();