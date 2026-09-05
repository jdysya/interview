export interface DiagramNode { id: string; x: number; y: number; label: string; detail: string; tone?: 'normal' | 'warn' }
export interface DiagramEdge { path: string; label?: string; x?: number; y?: number; dashed?: boolean }
export interface Diagram { title: string; description: string; height: number; nodes: DiagramNode[]; edges: DiagramEdge[]; notes?: { x: number; y: number; text: string }[] }
const flow = (title: string, description: string, labels: [string, string][]): Diagram => ({
  title, description, height: 330,
  nodes: labels.map(([label, detail], i) => ({ id: String(i), x: [20, 280, 540, 540, 280, 20][i], y: i < 3 ? 35 : 205, label, detail })),
  edges: [
    { path: 'M220 71 H280' }, { path: 'M480 71 H540' },
    { path: 'M640 107 V205' }, { path: 'M540 241 H480' }, { path: 'M280 241 H220' },
  ],
});
export const diagrams: Record<string, Diagram> = {
  rag: flow('RAG 在线链路：先约束证据，再生成答案', '请求先绑定租户和权限，进入混合召回，然后重排、按上下文预算选证据，最终生成有来源的回答。离线文档解析和索引更新另行管理。任何阶段都可能丢失正确证据，应逐阶段记录。', [['① 用户问题','固定时间口径'],['② 身份与权限','租户、ACL、文档版本'],['③ 混合召回','关键词 + 向量'],['④ 重排与去重','相关性与证据覆盖'],['⑤ 上下文预算','证据 ID 和原文定位'],['⑥ 生成与校验','引用、拒答、数字核验']]),
  runtime: flow('Agent Runtime：模型提议，程序控制执行', '检查取消和预算后，模型提出动作；程序校验工具和参数、持久化执行意图、执行工具，再保存结果并判断是否结束。需要继续时返回预算检查，不把模型说完成作为唯一验收。', [['① 预算与取消','时间、步骤、调用上限'],['② 模型提出动作','工具名、参数、call_id'],['③ 确定性校验','权限、Schema、业务限制'],['④ 保存执行意图','业务键与参数指纹'],['⑤ 执行或查证','未知结果不盲目重试'],['⑥ 保存观察与验收','未完成则返回步骤①']]),
  database: flow('数据库查询 Agent：从意图到可追溯结果', '先确定业务口径，定位代码与逻辑表，再解析受控数据源和分片路由，读取 Schema 并生成 SQL，执行确定性校验，最后以只读身份查询并附上证据。缺少分片条件或权限时中断澄清，不擅自扩大范围。', [['① 意图与口径','时间、指标、租户'],['② 代码与逻辑表','文件位置作为证据'],['③ 数据源与分片','受控 ID，不暴露凭据'],['④ Schema 与 SQL','字段类型、关联条件'],['⑤ 校验与执行','权限、预算、行数限制'],['⑥ 分析与引用','SQL、截断标记、来源']]),
  evaluation: flow('评测闭环：把失败转成可重复的回归用例', '冻结数据集和基线，按固定预算运行，分开评估召回、生成和业务状态，再分析失败切片、单变量改动、保留集回归。线上样本需要脱敏，不能反复用保留集调参。', [['① 冻结基线','数据、Prompt、模型版本'],['② 运行候选方案','同权限、同预算'],['③ 分层评分','检索 / 生成 / 业务'],['④ 失败切片','权限、长文、无答案'],['⑤ 单变量改动','避免同时修改所有因素'],['⑥ 保留集回归','未达门槛不发布']]),
  threadpool: {
    title: '线程池提交路径：先核心线程，再队列，再最大线程', description: '线程数少于 corePoolSize 时尝试创建工作线程；否则尝试入队。入队失败后，若仍可扩容则创建线程；无法扩容或线程池关闭时进入拒绝处理。示意省略实现中的状态二次检查和竞争细节。', height: 360,
    nodes: [{id:'a',x:20,y:35,label:'提交任务',detail:'先检查运行状态'},{id:'b',x:280,y:35,label:'少于核心线程？',detail:'是：尝试新建 worker'},{id:'c',x:540,y:35,label:'队列能接收？',detail:'核心已满时尝试入队'},{id:'d',x:540,y:225,label:'少于最大线程？',detail:'队列满后尝试扩容'},{id:'e',x:280,y:225,label:'拒绝处理',detail:'饱和、关闭或创建失败',tone:'warn'},{id:'f',x:20,y:225,label:'监控与背压',detail:'排队、拒绝、下游负载'}],
    edges:[{path:'M220 71 H280'},{path:'M480 71 H540',label:'否',x:510,y:57},{path:'M640 107 V225',label:'入队失败',x:640,y:168},{path:'M540 261 H480',label:'无法扩容',x:510,y:242},{path:'M280 261 H220'}],
  },
  cache: {
    title: '缓存竞态时序：删除成功，旧值仍可能回填', description: '时间从上向下。读请求缓存未命中，读到数据库旧值 v1 后暂停。写请求提交 v2 并删除缓存。旧读请求恢复，把 v1 回填到缓存。删除成功不等于缓存此后一定最新。', height: 400,
    nodes:[{id:'r',x:20,y:20,label:'读请求',detail:'读库后可能暂停'},{id:'db',x:280,y:20,label:'数据库',detail:'权威数据 v1 → v2'},{id:'w',x:540,y:20,label:'写请求 / 缓存',detail:'失效与回填可能交错'}],
    edges:[{path:'M120 105 V375',dashed:true},{path:'M380 105 V375',dashed:true},{path:'M640 105 V375',dashed:true},{path:'M120 140 H380',label:'① 读取 v1',x:250,y:130},{path:'M640 205 H380',label:'② 提交 v2',x:510,y:195},{path:'M640 250 H565 V280 H640',label:'③ 删除缓存',x:540,y:244},{path:'M120 345 H640',label:'④ 旧读请求恢复，回填 v1',x:380,y:333}],
  },
  mvcc: {
    title: 'RR 快照：第一次一致性读之后复用 Read View', description: '事务 A 开始并执行首次普通 SELECT，看到 v1。事务 B 更新并提交 v2。A 的后续普通 SELECT 仍按原快照读 v1；A 的锁定读可以读取当前版本 v2。图中假设没有其他并发写入，且 A 没有修改该行。',height:400,
    nodes:[{id:'a',x:20,y:20,label:'事务 A：RR',detail:'首次普通 SELECT 建快照'},{id:'d',x:280,y:20,label:'数据库版本链',detail:'v2 → undo → v1'},{id:'b',x:540,y:20,label:'事务 B',detail:'更新并提交 v2'}],
    edges:[{path:'M120 105 V375',dashed:true},{path:'M380 105 V375',dashed:true},{path:'M640 105 V375',dashed:true},{path:'M120 140 H380',label:'① 快照读 v1',x:250,y:130},{path:'M640 205 H380',label:'② 提交 v2',x:510,y:195},{path:'M120 275 H380',label:'③ 同一快照仍读 v1',x:250,y:265},{path:'M120 345 H380',label:'④ 锁定读当前版本 v2',x:250,y:335}],
  },
  approval: {
    title: '审批同步状态：未知不等于失败',description:'先保存 PENDING 意图，再用稳定业务请求号创建工单。确认存在后关联并进入 LINKED。响应丢失进入 UNKNOWN，通过请求号查证：存在则关联，确认未创建才重试。业务放弃时进入 COMPENSATING，确认撤销后才进入 CLOSED。处理中状态不表示业务成功。',height:380,
    nodes:[{id:'p',x:20,y:35,label:'PENDING',detail:'持久化请求号与意图'},{id:'u',x:280,y:35,label:'UNKNOWN',detail:'超时：查询远端状态',tone:'warn'},{id:'l',x:540,y:35,label:'LINKED',detail:'已确认并保存关联'},{id:'c',x:280,y:235,label:'COMPENSATING',detail:'撤销中，可重试',tone:'warn'},{id:'d',x:540,y:235,label:'CLOSED',detail:'确认撤销 / 确认未创建'}],
    edges:[{path:'M220 71 H280',label:'响应丢失',x:250,y:54},{path:'M480 71 H540',label:'查证存在',x:510,y:54},{path:'M120 107 V160 H640 V107',label:'创建成功并关联',x:380,y:150},{path:'M380 107 V235',label:'业务放弃',x:430,y:198},{path:'M480 271 H540',label:'确认撤销',x:510,y:255}],
  },
  inventory: {
    title: '库存预占状态机：释放与扣减争夺同一前置状态',description:'预占成功进入 RESERVED；只有 RESERVED 能转换为 RELEASED 或 DEDUCTED，使用条件更新确保二者不能同时成功。预占超时进入 UNKNOWN，查证后再决定是否进入 RESERVED 或失败。释放、扣减请求各有稳定幂等键；终态重复请求返回已记录结果。',height:380,
    nodes:[{id:'p',x:20,y:35,label:'PENDING',detail:'记录预占意图'},{id:'r',x:280,y:35,label:'RESERVED',detail:'可售 = 实际 − 预占'},{id:'d',x:540,y:35,label:'DEDUCTED',detail:'审核通过：预占转扣减'},{id:'u',x:20,y:235,label:'UNKNOWN',detail:'超时后按业务键查证',tone:'warn'},{id:'f',x:280,y:235,label:'RELEASED',detail:'驳回 / 作废：释放'}],
    edges:[{path:'M220 71 H280',label:'预占成功',x:250,y:55},{path:'M480 71 H540',label:'CAS',x:510,y:55},{path:'M380 107 V235',label:'CAS 释放',x:427,y:177},{path:'M120 107 V235',label:'超时',x:148,y:177},{path:'M220 271 H250 V130 H330 V107',label:'查证已预占',x:205,y:208}],
  },
};
