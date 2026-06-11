# Vibe Coding 群岛 2.0 — 立体像素世界设计文档(Design Spec)

- 日期:2026-06-12
- 状态:已与用户对齐方向(全 3D 体素 / Supabase / 本期含 Agent 创岛 / 四种新玩法),用户授权按本 spec 自主推进
- 一句话:把 1.0 的"草坯房"升级为**立体像素(voxel)浮空岛世界**,定下全项目设计系统,补上有判定的创意玩法、AI 能力与 Agent 创岛,并为账户/社区铺好架构。
- 上游文档:`2026-06-11-vibe-coding-islands-design.md`(1.0,内容数据与纯逻辑层继续沿用)
- 研究依据:`scratch/easy-vibe-gameplay-research.md`(原站 724 个交互组件考古)、`scratch/voxel-assets-research.md`(素材与 3D 技术验证,链接均实测)

---

## 1. 目标与定位

**北极星体验**:打开网站 = 飞进一片云海上的体素浮空岛群。岛会自转、会浮沉,镜头能拖拽;点一座岛,镜头飞进去,关卡就长在岛面上。学 easy-vibe 不再是刷题,而是**在岛上动手玩**:给老妈做访谈、进急诊室修报错、在锻造铺打提示词、拿积木拼原型——最后还能跟 AI 说一句话,**造一座属于自己的岛**。

**与 1.0 的关系**:纯逻辑层(gameLogic/achievements/storage,31 个测试)、内容数据(stage1.ts,真实 easy-vibe 内容)、四种基础题型全部保留;替换的是**呈现层(2D→3D)**、**玩法的天花板**(加四种创意玩法)、**世界的边界**(用户可创造内容)。

**差异化判断**(来自原站考古):easy-vibe 有 724 个交互组件但几乎没有判定与奖励系统;我们**交互形式抄它的精髓,游戏化系统自研**,两者组合即护城河。

## 2. 设计系统「Voxel Stardew」(全项目风格规范,后续一切开发以此为准)

### 2.1 色彩
沿用 1.0 星露谷暖调 token(`src/styles/tokens.css`),并扩展 3D 层色:

| Token | 值 | 用途 |
|---|---|---|
| `--c-grass` `#5fa64d` | 草地/岛屿顶层体素 | 2D/3D 共用 |
| `--c-grass-dark` `#3a7a2c` | 草地暗部/树叶 | |
| `--c-wood` `#8a5a3c` | 泥土层体素/木质 UI | |
| `--c-sand` `#e6c47a` | 沙滩边缘体素 | |
| 岩石灰 `#7a7a72`(新增 `--c-stone`) | 岛屿底部倒锥岩石 | 3D 专用 |
| `--c-sea` `#5b9bd5` / `--c-sea-dark` `#2e5a8a` | 云海/天空渐变 | 3D 背景 |
| `--c-cream` `#f4ecd6` / `--c-ink` `#3a2a1a` | UI 面板/描边 | 不变 |
| `--c-gold` `#f2c14e` | 强调/奖励 | 不变 |

规则:**任何新颜色必须先进 tokens.css 再使用**;3D 材质颜色从同一组十六进制取值,保证 2D UI 与 3D 世界同一色温。

### 2.2 立体像素渲染规范(3D)
- 技术:`three` + `@react-three/fiber@9`(React 19 配套)+ `@react-three/drei@10` + `@react-three/postprocessing@3`。
- **像素感三件套(强制)**:① 全场景 `<Pixelation granularity 4~6>` 后处理;② 所有材质 `flatShading`;③ 任何贴图 `NearestFilter`。目标效果对标 three.js 官方 `webgl_postprocessing_pixel` 示例。
- 光照:1 个暖色 DirectionalLight(模拟午后阳光,略带 `#f2c14e` 色温)+ 低强度 AmbientLight;禁用真实阴影贴图(用色块明暗代替,保像素感、省性能)。
- 镜头:透视相机;大地图 OrbitControls 限制 polar 角(只许俯视 30°~70°,不许钻到云海下);场景切换用相机位置 lerp 飞行(0.8~1.2s,easeInOut)。
- 动效:岛屿自转 0.05~0.1 rad/s;drei `<Float>` 浮沉幅度 0.2~0.4;悬停 = 整岛 scale 1.05 + 描边色提亮;**2D UI 动效继续用 `steps()` 缓动**保持像素跳帧感。

### 2.3 UI 规范(2D 层)
- 3D 世界之上的一切交互面板(关卡面板/HUD/成就墙/对话)都是 **2D 像素 DOM overlay**,不做 3D 内嵌 UI。
- 统一组件库 `src/ui/`:`PixelPanel`(米白底+4px 深褐描边+硬阴影)、`PixelButton`(金色,按下位移 2px)、`PixelDialog`(模态)、`PixelToast`、`HUD`、`ProgressBar`。**禁止任何页面直接手写裸样式面板**,只能用组件库。
- 字体:Press Start 2P(标题/数字/英文)+ 系统中文字体(正文 `.body-text`);标题字号阶梯 20/16/14/12px。
- 图标:emoji 为基线(已验证可用),后续可替换为 Kenney CC0 图标集,替换时一次性全换。

### 2.4 素材策略(结论来自素材调研,链接已实测)
- **岛屿主体:程序化生成体素**(InstancedMesh + BoxGeometry + simplex-noise 高度场 + 径向衰减 + 底部倒锥)。零素材依赖、调色板直接复用、每岛一个 `{seed, palette, decor}` 参数即可差异化——这是 Agent 创岛的技术前提。
- **装饰与角色:CC0 GLB 点缀**(可选增强):Kenney Nature Kit(树/石)、Blocky Characters(体素小人)、KayKit Adventurers(带动画角色)。Kenney 直链需先抓资产页解析 `href='...zip'` 再下载(哈希会变,不许硬编码);`fetch-assets.mjs` 沿用"失败警告+exit 0"契约,**程序化体素是本体,GLB 是增强**,任何素材缺失不影响完整观感。
- 许可:只用 CC0;CC-BY 素材(poly.pizza 多数浮空岛)仅作开发参考,不进产品。

## 3. 世界与场景

### 3.1 场景结构
```
App
├─ WorldScene(3D,lazy)   云海 + 浮空岛群:Stage1/2/3 官方岛 + 创造湾 + 用户岛漂浮区
├─ IslandScene(3D,lazy)  单岛放大:体素岛 + 节点物件 + 3D 小人 + 返回
├─ 2D Overlay 层          HUD / NodePanel(玩法挂载) / AchievementShelf / CreatorBay 对话 / 设置(API Key)
└─ Celebration            通关粒子烟花(升级为 3D 粒子,保留 2D 回退)
```
- 3D 场景整体 `React.lazy` 按需加载,首屏壳与 2D 资源不被 three 拖慢。
- 进岛交互:点击岛 → 相机飞向该岛 → 渐切到 IslandScene(同一 Canvas 内切换场景组,不卸载 WebGL 上下文)。
- 锁定岛:盖体素云团 + 🔒 浮标,点击弹 PixelToast「完成上一海域后解锁」。

### 3.2 岛屿与节点(3D 化)
- 节点 = 岛面上的 3D 物件:主线节点用「营火/小屋/旗帜」体素组合,宝箱节点用体素宝箱;状态三态 = 物件配色/动画(locked 灰暗、available 金色光柱+浮动箭头、done 升起小旗+✅ 浮标)。
- 小人:体素方块人(程序化 5 段身体,后续可换 Blocky Characters GLB),沿节点间 3D 路径跳点移动(位置 lerp + 跳跃弧线)。
- 节点坐标:从 1.0 的 `{x,y}%` 平面坐标升级为 `{x, z}`(岛面网格坐标),y 由岛面高度场求得——**内容数据只存逻辑坐标,渲染层负责落到岛面**,保持内容与呈现解耦。

## 4. 玩法系统

### 4.1 任务类型注册表(可插拔)
`src/game/registry.ts`:每种玩法注册 `{ type, component, validateAnswer }`。新增玩法 = 新增 `src/tasks/<type>/` 目录(组件+判分+测试)+ 注册一行。**判分逻辑必须是纯函数且有单测**(沿用 1.0 TDD 纪律)。

### 4.2 保留玩法(轻量复习型)
`quiz` / `truefalse` / `match` / `fill-prompt` 四种保留,定位为低成本知识确认节点。

### 4.3 新增玩法(本期四种,设计源自 easy-vibe 原站考古)

| 玩法 | type | 交互 | 判定 | 对应灵感 |
|---|---|---|---|---|
| **报错急诊室** | `error-er` | 病床上躺着 401/404/500/白屏「病人」,展示症状(报错截图文案/报文);玩家按章节方法论走诊断状态机:第一步选「先截图问 AI」还是「先开 F12」?第二步对症选面板(Console/Network/Elements)?第三步开处方 | 决策树路径判定(纯前端,走对路径过关,错步扣 HP 给讲解) | 原站 ApiPlayground 的 401/404/429 试错 + 常见报错章 |
| **老妈访谈屋** | `npc-dialog` | 像素屋里和 NPC「老妈」验证产品点子:每轮从 3 张问题卡选 1 张提问,NPC 按 Mom Test 规则回应(夸奖=无效情报,讲过去行为=有效情报);集满 3 张有效情报过关(违规提问 ≥3 次则失败重来)。**接入 AI 后解锁自由提问模式**:玩家手打问题,LLM 扮演老妈+裁判判定该问题合规性 | 卡牌模式:问题卡预标合规/违规,确定性判定(本体玩法,无 AI 可完整游玩);自由模式:LLM 裁判 | 原创(Mom Test 章内容天然适合)+ 原站对话情景剧 |
| **提示词锻造铺** | `prompt-forge` | 铁匠铺把模糊提示词当生铁:基础模式每轮从改进项中选择锻打(加角色/加约束/加格式/加示例),炉火颜色=提示词等级;**接入 AI 后解锁实战模式**:玩家真实撰写提示词调 LLM 完成任务(如给商品写文案),LLM 按章节要点 rubric 评分给星 | 基础模式:有效改进项命中判定;实战模式:LLM 按 rubric 打 0~5 分,≥3 过关,5 分得星 | 原站 PromptQuickStartDemo 三级升级 + 找点子/搭原型章提示词模板 |
| **原型积木台** | `proto-builder` | 给一份「业务需求卡」(取自搭原型章电商工作台案例),玩家从积木栏拖拽像素组件(导航/上传区/生成按钮/结果列表/模板库…)放进页面槽位,拼出满足需求的原型结构 | 必选组件命中数 + 槽位关系比对(纯前端) | 搭原型章 + 原站 CssPlayground 操作↔结果映射 |

### 4.4 节点映射(起源岛 2.0)
| 节点 | 1.0 玩法 | 2.0 玩法 |
|---|---|---|
| origin-1 学习地图 | quiz | quiz(保留) |
| origin-2 找到好点子 | fill-prompt | **prompt-forge**(点子打磨提示词) |
| origin-3 AI IDE 入门 | match | match(保留) |
| origin-4 搭建原型 | fill-prompt | **proto-builder**(电商工作台拼装) |
| origin-5 集成 AI 能力 | match | match(保留) |
| origin-6 完整项目实战 | quiz | quiz(保留) |
| origin-t1 双钻模型 | truefalse | truefalse(保留) |
| origin-t2 Mom Test | truefalse | **npc-dialog**(老妈访谈屋) |
| origin-t3 JTBD | quiz | quiz(保留) |
| origin-t4 常见报错 | truefalse | **error-er**(报错急诊室) |

备选玩法池(进 spec 不进本期):命令洞穴(TerminalHandsOn 移植)、踏石过河选词(NextTokenPrediction)、时光祭坛 Git 顺序锁、提示词攻防 Boss 战、上下文背包、Agent 护栏工坊、双钻寻路迷宫、AI IDE 工具铺速配。设计细节见 `scratch/easy-vibe-gameplay-research.md` 第四、五节。

## 5. AI 能力接入(AiGateway)

- `src/services/aiGateway.ts` 统一接口:`chat(messages, opts) → text`。**本期实现 BYOK**(Bring Your Own Key):设置面板填 OpenAI 兼容服务的 baseURL/apiKey/model(默认预填 DeepSeek 的 baseURL,呼应教程第 5 章),存 localStorage,绝不进 git/不上传服务器。
- Phase B 增加 `edge` 实现:Supabase Edge Function 代理,平台供 Key,用户免配置。两实现同接口,可替换。
- 无 Key 状态是**明确的功能边界**而非降级:依赖 AI 的模式(访谈自由模式/锻造实战模式/Agent 创岛)入口显示像素提示「先到设置接入 AI(免费 DeepSeek Key 也行)」并引导跳设置;不依赖 AI 的玩法全部完整可玩。调用失败(超时/401/余额)直接把错误如实弹给用户,不静默重试、不假装成功(Let it crash)。

## 6. Agent 创岛(CreatorBay 创造湾)

**本期最大差异化亮点**:用户与 AI 对话,生成一座属于自己的学习岛。

- 入口:大地图上的「创造湾」浮岛(船坞造型)。
- 流程(对话式,2~3 轮):
  1. 用户说想造什么岛(主题,如「Python 入门」「咖啡拉花」——不限编程);
  2. AI 追问关键缺口(给谁学/几个关卡/口味偏好),用户可一句话带过;
  3. AI 产出岛屿草案(岛名+节点列表+每节点学习卡与任务),用户确认或要求重生成;
  4. 系统用 zod 校验生成的 `IslandDef` JSON(节点 id/类型/任务字段全校验)——**校验失败把错误原样给 AI 自动重试一次,再失败如实报错给用户**,不静默修补数据;
  5. 预览:程序化体素岛即时渲染(seed=岛名 hash,palette 用户可选)+ 节点清单;
  6. 保存:本期存 localStorage(`vibe-islands-custom`),大地图「用户岛漂浮区」出现该岛,完整可玩(用注册表里全部玩法类型);Phase B 上 Supabase 并可分享。
- 生成约束写进系统提示词:任务类型只能用注册表已有 type;学习卡 2~4 张;判分字段必须可机器判定;内容不得编造事实来源(AI 生成内容标注「社区/AI 生成,非 easy-vibe 官方内容」)。

## 7. 账户与社区(Supabase,Phase B 实现,本期完成设计与接口预留)

- **服务接口本期就位**:`src/services/saveService.ts` 抽象 `load/persist/listCustomIslands/saveCustomIsland`,本期 `LocalSaveService` 实现;Phase B 加 `SupabaseSaveService`,UI 零改动。
- Auth:Supabase 邮箱魔法链接 + GitHub OAuth;登录后本地档一次性合并上云(冲突取进度并集、金币取大值)。
- 表设计(Phase B 建):
  - `profiles(id, username, avatar_seed, created_at)`
  - `saves(user_id pk, data jsonb, updated_at)` — 整包 SaveState
  - `islands(id, owner_id, name, def jsonb, seed, palette, is_public, plays, likes, created_at)`
  - `island_likes(user_id, island_id, pk(user_id,island_id))`
- 社区 v1(Phase B):岛屿广场(公开岛列表:按热度/最新,点进即玩)、点赞、创作者署名;v2(Phase C):评论、精选周榜、岛屿 remix。
- 内容安全:公开岛需走 LLM 审核(Edge Function)再上架;举报下架机制。

## 8. 架构(模块化、松耦合)

```
src/
├─ engine3d/      3D 呈现域(r3f):WorldScene/IslandScene/VoxelIsland 生成器/CameraRig/PixelFX
├─ game/          纯逻辑域(零 React/零 IO):gameLogic/achievements/taskRegistry/islandSchema(zod)
├─ tasks/         玩法插件,每 type 一目录:组件 + 纯函数判分 + 测试
├─ services/      可替换外设:saveService(local→supabase)/aiGateway(byok→edge)/assetService
├─ creator/       Agent 创岛:对话编排/生成提示词/校验/预览
├─ ui/            2D 像素组件库(唯一的样式来源)
├─ content/       内容即数据:官方岛 + 类型定义
└─ state/         hooks(useGameState 等),连接 game ↔ UI/3D
```
解耦规则:
1. `game/` 不 import React、不碰 IO,只有纯函数(可单测);
2. `engine3d/` 只消费 props/回调,不直接读写存档;
3. 玩法组件之间互不感知,只通过注册表被发现;
4. `services/` 全部面向接口,实现可替换(本地↔云、BYOK↔Edge);
5. 内容即数据:加岛/加节点/加玩法实例零组件改动。
依赖新增:`three`/`@react-three/fiber@9`/`@react-three/drei`/`@react-three/postprocessing`/`simplex-noise`/`zod`(全 MIT;gzip 增量约 300~350KB,lazy 加载隔离)。

## 9. 分期路线

| 期 | 内容 | 状态 |
|---|---|---|
| **Phase A(本期)** | 设计系统落地 + 全 3D 体素世界(大地图/岛屿/小人)+ 四新玩法 + BYOK AiGateway + Agent 创岛(本地) | 本 spec 主体 |
| Phase B | Supabase:账户/云存档/岛屿上云/广场+点赞/Edge AI 代理/内容审核 | 接口已预留 |
| Phase C | 社区深化(评论/精选/remix)、备选玩法池逐个上岛、音效、Stage 2/3 官方内容岛 | 备选池已设计 |

## 10. Phase A 验收标准

1. 首屏(2D 壳)秒开;3D 场景懒加载,加载中有像素风加载页。
2. 大地图:云海上 ≥4 座体素浮空岛(Stage1 可玩、Stage2/3 锁定、创造湾),全部自转+浮沉,可拖拽视角,悬停高亮,点击镜头飞入;像素化后处理生效(立体像素颗粒感)。
3. 起源岛 3D 化:10 个节点为岛面 3D 物件,三态可辨;体素小人随进度跳点移动;点节点弹 2D 像素面板,玩法可完成。
4. 四新玩法全部上岛(origin-2/4/t2/t4)且判分纯函数有单测;无 AI Key 时报错急诊室/积木台/卡牌访谈/基础锻造完整可玩。
5. 设置面板可配 BYOK;配好后访谈自由模式与锻造实战模式真实调用 LLM 并按 rubric 判定;调用失败错误如实展示。
6. 创造湾:对话→生成→zod 校验→3D 预览→保存→大地图出现用户岛→进入可玩全流程跑通;生成内容标注「AI 生成」。
7. 1.0 全部既有能力不回退:成就/金币/星星/存档/庆祝/解锁链条照常(回归测试绿)。
8. `pnpm test` 全绿(含新玩法判分单测+验收测试更新)、`tsc --noEmit` 无错、`pnpm build` 成功。
9. UI 全部走 `src/ui/` 组件库与 tokens,无游离样式;2D/3D 同色板。
10. 桌面 Chrome/Edge 流畅(大地图 ≥50fps,普通核显可跑);移动端不做承诺。

## 11. 风险与缓解

| 风险 | 缓解 |
|---|---|
| 3D 工程量超预期 | 程序化体素岛先行(零素材依赖),GLB 点缀最后做;场景按 World→Island→小人动画的顺序增量交付,每步可独立验收 |
| LLM 生成岛 JSON 不稳定 | zod 强校验 + 失败回喂 AI 重试一次 + 如实报错;生成约束写死在系统提示词;不静默修补 |
| BYOK 门槛劝退 | 不依赖 AI 的玩法占主体且完整;设置页给 DeepSeek 免费注册指引(呼应教程第 5 章,本身就是教学内容) |
| Pixelation 后处理性能 | granularity 可调;postprocessing 链只此一个效果;禁实时阴影 |
| React 19 + r3f 兼容 | 必须用 fiber v9(已调研确认);锁版本进 package.json |
| 范围蔓延 | 备选玩法池/社区互动/音效全部明确推到 B/C 期;本期只做第 10 节验收清单 |
