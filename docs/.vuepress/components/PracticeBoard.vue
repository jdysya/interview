<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { withBase } from 'vuepress/client';
import questions from '../data/questions.json';
const role = ref('all');
const query = ref('');
const onlyWeak = ref(false);
const scores = ref<Record<string, number>>({});
const notice = ref('');
const ready = ref(false);
const key = 'interview-wiki-practice-v1';
const ids = new Set(questions.map(q => q.id));
function normalize(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('进度格式不正确');
  const result: Record<string, number> = {};
  for (const [id, score] of Object.entries(value)) {
    if (ids.has(id) && typeof score === 'number' && Number.isInteger(score) && score >= 0 && score <= 4) result[id] = score;
  }
  return result;
}
onMounted(() => {
  try { const raw = localStorage.getItem(key); if (raw) scores.value = normalize(JSON.parse(raw)); }
  catch { notice.value = '无法读取本地进度，当前仍可练习；请导出备份。'; }
  ready.value = true;
});
const filtered = computed(() => questions.filter(q => (role.value === 'all' || q.roles.includes(role.value)) && (!onlyWeak.value || (scores.value[q.id] ?? 0) < 3) && `${q.id} ${q.title} ${q.topic}`.toLowerCase().includes(query.value.toLowerCase())));
const practiced = computed(() => Object.keys(scores.value).length);
function persist() {
  try { localStorage.setItem(key, JSON.stringify(scores.value)); notice.value = '已保存到当前浏览器。'; }
  catch { notice.value = '保存失败：浏览器存储不可用，请导出进度。'; }
}
function setScore(id: string, event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  if (value === '') delete scores.value[id]; else scores.value[id] = Number(value);
  persist();
}
function exportProgress() {
  const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), scores: scores.value }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = 'interview-progress.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function importProgress(event: Event) {
  const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
  try {
    if (file.size > 100000) throw new Error('文件不能超过 100KB');
    const data = JSON.parse(await file.text()); if (data.version !== 1) throw new Error('不支持的进度版本');
    const imported = normalize(data.scores);
    scores.value = { ...scores.value, ...imported }; persist();
  } catch (e) { notice.value = e instanceof Error ? e.message : '导入失败'; }
  input.value = '';
}
function reset() { if (window.confirm('清空当前浏览器中的所有练习评分？此操作不能撤销。')) { scores.value = {}; persist(); } }
</script>
<template>
  <section class="practice-board" aria-label="面试自测题库">
    <p><strong>{{ questions.length }} 道追问题</strong> · 已评分 {{ practiced }} 道。评分仅保存在当前浏览器，不上传服务器，也不自动跨设备同步。</p>
    <div class="practice-controls">
      <label>岗位 <select v-model="role"><option value="all">全部岗位</option><option value="backend">Java 后端</option><option value="ai">AI 应用</option><option value="agent">Agent 开发</option></select></label>
      <label class="search-label">搜索题目 <input v-model="query" type="search" placeholder="例如：快照、幂等、Q-DB" /></label>
      <label><input v-model="onlyWeak" type="checkbox" /> 仅看未掌握（未评分或低于 3 分）</label>
    </div>
    <p class="score-guide">0 不会 · 1 能说定义 · 2 能解释机制 · 3 能实现并应对反例 · 4 有可复现证据</p>
    <p aria-live="polite">当前显示 {{ filtered.length }} 道</p>
    <ol class="question-list">
      <li v-for="q in filtered" :key="q.id" class="question-row">
        <div><span class="question-meta">{{ q.id }} · {{ q.priority }} · {{ q.topic }}</span><a :href="withBase(q.path)">{{ q.title }}</a></div>
        <label>自评分 <select :disabled="!ready" :value="scores[q.id] ?? ''" :aria-label="`${q.id} 自评分`" @change="setScore(q.id, $event)"><option value="">未评分</option><option v-for="n in [0,1,2,3,4]" :key="n" :value="n">{{ n }} 分</option></select></label>
      </li>
    </ol>
    <p v-if="!filtered.length">没有匹配题目，请调整搜索词或筛选条件。</p>
    <div class="practice-controls"><button :disabled="!ready" @click="exportProgress">导出进度</button><label>导入进度 <input :disabled="!ready" type="file" accept="application/json,.json" @change="importProgress" /></label><button :disabled="!ready" @click="reset">清空评分</button></div>
    <p role="status">{{ notice }}</p>
  </section>
</template>
<style scoped>
.practice-board { padding: 1rem; border: 1px solid var(--border-color, #c7cdd5); border-radius: 14px; }
.practice-controls { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; }
.practice-controls label { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
input, select, button { font: inherit; color: inherit; background: var(--bg-color, #fff); border: 1px solid var(--border-color, #8795a5); border-radius: 6px; padding: .45rem .6rem; max-width: 100%; }
button { cursor: pointer; min-height: 40px; }
:disabled { opacity: .65; cursor: not-allowed; }
input:focus-visible, select:focus-visible, button:focus-visible { outline: 3px solid var(--theme-color, #2563eb); outline-offset: 2px; }
.question-list { padding: 0; list-style: none; }
.question-row { display: flex; justify-content: space-between; gap: 1rem; align-items: center; padding: .9rem 0; border-bottom: 1px solid var(--border-color, #c7cdd5); }
.question-row > div { min-width: 0; }.question-row a { display: block; margin-top: .3rem; }.question-row label { flex-shrink: 0; }
.question-meta, .score-guide { font-size: .85rem; }.question-meta { font-family: ui-monospace, monospace; }
@media (max-width: 600px) { .question-row { align-items: flex-start; flex-direction: column; }.search-label, .search-label input { width: 100%; }.practice-controls input[type=file] { width: 100%; } }
</style>
