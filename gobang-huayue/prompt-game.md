# 五子棋对弈动画「星穹落子」· 制作规范 v1.0

> 日期：2026-10-25 ｜ 状态：已定稿 v1.0（全息取子台取子 · 弧线飞行 · 波纹落子 · 自动补子）｜ 本文件是对弈系列的唯一依据
> 与开场片的关系：开场 `gobang-huayue.mp4`（14.0s/420 帧，规范见 prompt.md v1.7）**锁死只读**；对弈动画独立成片，最终成片 = 开场 ∥ 对弈（ffmpeg concat 直拼，同 1920×1080/30fps/h264_nvenc）。落子坐标由用户以 `MOVES` 数据提供，不写死分镜。

## 1. 文件结构

| 文件 | 作用 |
|---|---|
| `gobang-huayue.mp4` | 开场片（锁死，拼接段一） |
| `game.html` | 对弈片本体（由 starcodex.html 拷贝 + 5 处手术，见 §5；含 S7 落子引擎） |
| `game-config.js` | **对弈唯一日常入口**：`MOVES` 落子序列 + `PERIOD` 单手时长；并 re-export config.js 全部风格开关 |
| `game/gobang-game-*.mp4` | 对弈成片输出（按手数命名） |
| `_style/game/engine.part.js` | S7 引擎源稿（与 game.html 内嵌份保持同步） |
| `_style/game/montage.mjs` | 落子帧检条图脚本（注意 openfilm 整数秒缓存名是 `Ns.png`） |

## 2. 无缝铁律（拼接零缝）

- **片内时间 = 对弈片 t + T_OPEN(14.0)**：`window.film.frame = gt => frame(gt + T_OPEN)`，对弈 t=0 逐像素 ≡ 开场末帧（星野旋转/取子台呼吸/光锥闪烁/旋柱自转相位全部连续；已做逐像素 diff 验证，仅棋盒高光边缘亚可见混排噪声）。
- 相机**静机位持镜**：camAt 的 remap 自带钳制，t≥14.0 恒停在末键 (0,3.60,0.32) 俯视 85°，不加任何新相机键。
- 坐标系同 prompt.md §4：天元 (0,0)，+x 右 +y 上；世界坐标 `x=gx*S, z=-gy*S`（S=0.15 格距）；落子定格高度 `y=0.012`（与花月三子一致，含 rim 光圈与软影）。
- **禁改开场部分任何闭式**；S7 新增状态全为 t 的纯函数（无累积、无随机）。

## 3. 单手节拍（v1.0 定稿：PERIOD=2.4s）

u = t − 手起点（手 k 起点 = T_OPEN + k·PERIOD）：

| u（s） | 动作 |
|---|---|
| 0.10–0.30 | 蓄势：本色盒柱顶子微升 0.05 + slotGlow 预亮（scale 0.22，op≤0.4） |
| 0.30–0.75 | 拔起：离柱上升 0.45，**同时向碗轴心收拢 0.7**（规避近俯视高度径向外扩，读感=从仓口提出） |
| 0.75–1.35 | 弧线飞行：inOutCubic 水平插值 + sin 抬升 0.16，飞子带辉光（op 0.45） |
| 1.35–1.55 | 坠落：inQuad 从悬停 0.42 落至 0.012；软影于落前 0.5s 渐入 |
| 1.55 | **落子定格**（棋子恒久）：波纹环 0.5s 扩散（scale 0.07→0.55，op 0.8→0，`#9BEEFF`）+ 落点闪光 0.5s |
| 1.85–2.15 | 补子：柱顶 outBack 弹出新子 + slotGlow 回闪；柱恒 6 颗 |
| →2.40 | 收静回待机（其余 5 颗与全部呼吸相位不受影响） |

## 4. 机制要点

- **取子源**：`BOWL_MODE='holo'` 柱顶第 6 颗（`SLOT_I=5`，构建式 `a=5*2.35+0.5, rr=0.115+0.035, ty=0.075+5*0.03`，呼吸 `slotBob(t)` 与 holo 块同式）；黑盒 `bowlC.items[0]` / 白盒 `items[1]`，按 `MOVES[k].c` 取对应盒。
- **MOVES 格式**：`{c:'B'|'W', x:int, y:int}`；黑白轮流由数据自证，引擎不做规则校验。
- 片长 = `MOVES.length × PERIOD`；**game/film.html 的 hash `#t=0,N` 与 `game.html` 内 `PERIOD` 三处必须同步**（本版 2.4）。
- 波纹/闪光/软影每手一套（单 mesh 复用，多手时只显示最新一手窗口），落子棋子与软影按手数永久累加。

## 5. game.html 生成与渲染（工程坑）

- 生成：拷贝 starcodex.html → ①title ②import 改 `./game-config.js`（含 MOVES/PERIOD）③`const T_OPEN=14.0; const DUR=T_OPEN+MOVES.length*PERIOD`（frame 首行钳制用）④`composer.render()` 前插 `updateMoves(t);` ⑤`window.film` 的 duration/frame 改为 `MOVES.length*PERIOD` / `gt=>frame(gt+T_OPEN)`；S7 引擎插在 window.film 注释前。
- **openfilm 页面必须位于项目文件夹内**（film.html 引 `../game.html` 报 "there is no such file"）→ 渲染对弈片用**临时换入法**：备份 film.html → 写入 `src="game.html#t=0,N"` → `npx openfilm render --out game/xxx.mp4` → 立即还原 film.html（防覆盖开场成片，--out 必带）。
- QC：`npx openfilm look game.html <t>` 可直接抽帧单页（无需换入）；确定性双绘 + 首帧 vs 开场末帧逐像素 diff。

## 6. 验收清单

- [ ] 对弈 t=0 与开场 t=14 逐像素一致（diff 仅星点/混排噪声）
- [ ] 每手 2.4s±0，落子棋子位置 = MOVES 坐标 × S 映射，与网格线对位
- [ ] 取子台柱恒 6 颗：取走窗口 (0.30–1.85) 柱顶不可见，2.15 后补齐
- [ ] 波纹 1.55+0.5=2.05 消散，无残留环
- [ ] 黑白各从对应盒取子；盒的呼吸/旋柱相位在整片连续
- [ ] 确定性抽查：同 t 两次渲染逐像素一致

## 7. 后续复用

加一手 = `MOVES` 追加一条 + 改两处 hash/片长说明；换节奏 = 只改 `PERIOD`（§3 节拍表按比例微调相位常数 MV_*）。黑白盒取子、落子特效、静机位全部自动沿用。
