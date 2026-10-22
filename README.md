# 学海拾茜

Hexo + Butterfly 静态博客，构建产物整站推送到 GitHub Pages。

| 项 | 值 |
| --- | --- |
| 构建器 | Hexo 8.1.1 |
| 主题 | Butterfly 5.5.3（`themes/butterfly`） |
| Node | v24 系列，包管理用 pnpm 或 npm 均可 |

## 常用命令

```bash
npm install          # 依赖见 package.json
npx hexo clean
npx hexo server -p 4000   # 本地预览 http://127.0.0.1:4000
npx hexo generate         # 产物在 public/
npx hexo deploy           # 提交并推送，见下面的部署须知
```

推送目标配置在根 `_config.yml` 的 `deploy` 段（`type: git`，分支 `main`，仓库是 Pages 站点仓库），地址：https://cyg0825.github.io/。

## 目录结构

```
_config.yml                  站点根配置（url、permalink、search、deploy）
_config.butterfly.yml        主题配置，整份从主题 _config.yml 复制后改
scripts/wp-code-highlight.js 构建期把正文里的原始代码块换成高亮产物
scripts/copy-readme.js       构建结束时把本文件拷进产物，让仓库首页能看到说明
source/_posts/               文章
source/uploads/              正文配图
source/assets/               本地化的第三方 js/css
source/css/fontawesome/      本地化的图标字体
source/js/typed.umd.min.js   本地化的打字机脚本
source/birthday/             独立页面，front-matter 写 layout: false
source/about/ categories/ tags/ archives/
tools/wp-import.py           一次性导入脚本，日常构建不依赖
```

`source/_data` 是空目录，主题侧本来也没有友情链接数据文件。`source/archives`、`source/cc1`、`source/cc3` 是导入过程留下的空目录，可以删。

## 定制的落点

所有页面级的样式与脚本都写在 `_config.butterfly.yml` 的 `inject` 里（`head` 从 1041 行开始，`bottom` 从 1089 行开始），不改主题源码，主题升级不会被覆盖。需要操作页面已有 DOM 的脚本必须放 `bottom`，放 `head` 会跑在 `body` 之前、元素还不存在。

改动位置对照，全部以站点文件为准：

| 想改的东西 | 改哪里 |
| --- | --- |
| 菜单项、logo、站点图标、头像 | `_config.butterfly.yml` 的 `menu`（19 行）、`nav`、`favicon`、`avatar` |
| 头图与页面背景色 | `index_img`、`default_top_img`、`background`（105 行） |
| 副标题打字机 | `subtitle`（160 行），`source: 3` 走今日诗词，断网时改 `false` 并给 `sub` 填本地句子 |
| 侧栏卡片开关 | `aside`（281 行），运行天数在 `card_webinfo.runtime_date`，5.5.3 没有顶层 `runtimeshow` 键 |
| 代码块外观 | `code_blocks`（40 行）加上 `inject.head` 里的 token 配色补丁 |
| 毛玻璃头图、页脚透明、移动端抽屉收起侧栏 | `inject.head` 的 `<style>` |
| 个人信息卡搬进抽屉、音乐播放器 | `inject.bottom` |
| 第三方资源走本地 | `CDN.option`（1135 行），被覆盖的键指向本地文件 |
| 分享按钮 | `share`（511 行），列表里仍写 `twitter`，是旧配置残留 |

`_config.butterfly.yml` 与主题官方默认的逐项差异、以及本站关着或留空的项，都整理在文章 `source/_posts/butterfly.md` 里，那份文件同时是配置说明书。

## 代码块高亮

正文里的代码块长这样：`<pre class="wp-block-code"><code>`，主题只给 `figure.highlight` 上色，所以构建时由 `scripts/wp-code-highlight.js` 换成 `hexo-util` 的高亮产物。语言靠规则猜（命令白名单、SQL 关键字、Java/JS/CSS 特征等），认不出来就落 `plain`，页面上角标显示 Code。

两个必须知道的 Hexo 行为：

1. `scripts/*.js` 的文件体是被包进函数再执行的，`module.exports` 不会被调用，注册动作必须是顶层副作用，用注入进来的全局 `hexo`。
2. 配置监听只覆盖 `source` 和主题目录，`scripts/` 改了要重启 server，`hexo generate` 才会重新加载。

自检口径（在仓库根目录跑，两条都得满足）：

```bash
grep -rc '<pre class="wp-block-code"><code>' source/_posts | awk -F: '{s+=$2} END {print s}'
grep -r '<figure class="highlight' public --include=*.html | wc -l
```

前者统计待转换的原始块，后者统计产物，两条口径要对得上，产物里不该有原始块残留。注意别用裸的 `wp-block-code` 关键词搜 `public/`，`butterfly.md` 这篇文章本身在正文里提到这个类名，会多算。

主题只写了旧版 highlight.js 的类名，`inject.head` 末尾那段 CSS 补齐 hljs 11 的 `selector-*`、`function_`、`class_`、`constant_`、`type`、`invoke__`、`subst`、`language_`、`bullet`，配色沿用主题的 light 色板，深浅两套模式共用同一组色值。

## 部署须知

`npx hexo deploy` 会把 `public/` 整份复制进 `.deploy_git`，提交后推送到 Pages 仓库，属于整站替换，Pages 仓库的历史只由这条命令维护。仓库根目录能看到本文件也是这条链的一部分，产物里缺了它就查 `scripts/copy-readme.js`。**推送前先比对远端 tip**：`git ls-remote git@github.com:cyg0825/cyg0825.github.io.git main` 与 `git -C .deploy_git rev-parse HEAD` 不一致，说明仓库上有别的提交（网页上直接编辑过文件），这条命令会 force push 把它抹掉，先把那份取回来合进本地。真被抹了也能按 SHA 拉回：`https://raw.githubusercontent.com/cyg0825/cyg0825.github.io/<完整SHA>/README.md`。推送前跑一遍敏感项扫描，至少覆盖：凭据赋值、密钥文件标记、长十六进制串、IP、超过 300KB 的图片、外部 `script/link/img` 标签的 host 白名单。命中的逐项确认是原有公开内容还是新增，网盘提取码这类是文章里本来就公开的分享信息。

推完别立刻判定失败：Pages 重建有延迟，推送后线上仍是旧构建属正常。线上验证直接拉文章 URL，比对 `updated` 时间与新增段落文本。

独立页面（如 `source/birthday/`）的 front-matter 必须写 `layout: false`，否则主题会把它当文章套模板。绝对域名的链接（`https://…` 指向本站）要单独扫一遍，构建期不会自动改成相对路径。

## 内容约定

- 文章 front-matter 的 `date` 是页面上的发表于，`updated` 是更新于；只改正文时不动 `date`。
- 站点时间格式由根配置的 `date_format`、`time_format` 决定。
- 文章的 `top_img` 统一 `false`，头图走 `default_top_img`。
- 分类两级：父分类只有 `学习`、`生活`，其余分类挂在它们下面，`学生选课系统` 单独顶级。写成 `- [学习, 建站]`，数组从左到右是父到子，一篇多个分类写多行。
- 批量改 front-matter 前先停 `hexo server`，否则存一半就触发处理，hexo-abbrlink 会在残缺文件前面补一个只含 abbrlink 的块；改完用 `hexo clean` 再构建，增量生成不会清掉已删除路由的旧产物。
- 装了 `hexo-abbrlink`，它会把 abbrlink 回写进 front-matter，提交时看见这类改动属正常。
- 草稿由根配置 `render_drafts: false` 排除。
- 图片放 `source/uploads/`，新图压到 300KB 以下再入库。

## 排错

| 现象 | 原因与处理 |
| --- | --- |
| 改了 `scripts/` 没反应 | server 不监听该目录，重启 `npx hexo server` |
| 代码块是纯文本、没角标没复制按钮 | 该块的类名不是 `wp-block-code`，或 `scripts/wp-code-highlight.js` 没被加载 |
| 代码块颜色全黑 | `inject.head` 里的 hljs 11 补丁被删，或 `code_blocks.theme` 被改成 `false` |
| 搜索框搜不到内容 | 根配置缺 `search` 段（102 行），主题侧只会拿到空索引 |
| 音乐播放器不出现 | 播放器注入在 `inject.bottom`，放 `head` 时 DOM 还不存在；同时确认 `aplayerInject.enable` 为 `true`（981 行） |
| 头像/字体/打字机加载失败 | 本机访问不到公共 CDN，这类资源一律走 `CDN.option` 指向 `source/assets` 等本地目录 |
| 侧栏运行天数不显示 | 开关是 `aside.card_webinfo.runtime_date`，留空即不显示 |
| 线上还是旧内容 | Pages 重建未完成，先比对远端提交号再等构建 |
