<script setup lang="ts">
import { computed, useId } from 'vue';
import { diagrams } from '../data/diagrams';
const props = defineProps<{ name: string }>();
const uid = useId();
const diagram = computed(() => diagrams[props.name]);
</script>

<template>
  <figure v-if="diagram" class="knowledge-diagram" :data-diagram="name">
    <figcaption>{{ diagram.title }}</figcaption>
    <div class="diagram-scroll" tabindex="0" :aria-label="`${diagram.title}，可横向滚动；下方有文字版`">
      <svg :viewBox="`0 0 760 ${diagram.height}`" role="img" :aria-labelledby="`${uid}-title ${uid}-desc`">
        <title :id="`${uid}-title`">{{ diagram.title }}</title>
        <desc :id="`${uid}-desc`">{{ diagram.description }}</desc>
        <defs><marker :id="`${uid}-arrow`" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" class="arrow-head" /></marker></defs>
        <g v-for="(edge, i) in diagram.edges" :key="`edge-${i}`">
          <path :d="edge.path" class="diagram-edge" :class="{ dashed: edge.dashed }" :marker-end="`url(#${uid}-arrow)`" />
          <text v-if="edge.label" :x="edge.x" :y="edge.y" class="edge-label">{{ edge.label }}</text>
        </g>
        <g v-for="node in diagram.nodes" :key="node.id" :transform="`translate(${node.x},${node.y})`">
          <rect width="200" height="72" rx="12" :class="['diagram-node', node.tone || 'normal']" />
          <text x="100" y="29" class="node-title">{{ node.label }}</text>
          <text x="100" y="52" class="node-detail">{{ node.detail }}</text>
        </g>
        <g v-for="(note, i) in diagram.notes || []" :key="`note-${i}`"><text :x="note.x" :y="note.y" class="diagram-note">{{ note.text }}</text></g>
      </svg>
    </div>
    <details><summary>展开图示文字说明</summary><p>{{ diagram.description }}</p></details>
  </figure>
  <p v-else role="alert">未找到图示：{{ name }}</p>
</template>

<style scoped>
.knowledge-diagram { margin: 1.8rem 0; padding: 1rem; border: 1px solid var(--border-color, #c7cdd5); border-radius: 14px; background: var(--bg-color-secondary, #f8fafc); }
figcaption { font-weight: 700; margin-bottom: .6rem; }
.diagram-scroll { overflow-x: auto; overscroll-behavior-x: contain; border-radius: 8px; }
.diagram-scroll:focus-visible { outline: 3px solid var(--theme-color, #2563eb); outline-offset: 3px; }
svg { display: block; width: 100%; min-width: 640px; color: var(--text-color, #243247); }
.diagram-node { fill: var(--bg-color, #fff); stroke: #65778e; stroke-width: 1.5; }
.diagram-node.warn { stroke: #b66a00; stroke-width: 2; stroke-dasharray: 5 3; }
.node-title { fill: currentColor; font-size: 17px; font-weight: 650; text-anchor: middle; }
.node-detail { fill: currentColor; font-size: 13px; text-anchor: middle; }
.diagram-edge { fill: none; stroke: #65778e; stroke-width: 2; }
.diagram-edge.dashed { stroke-dasharray: 6 5; }
.arrow-head { fill: #65778e; }
.edge-label { fill: currentColor; font-size: 13px; text-anchor: middle; paint-order: stroke; stroke: var(--bg-color-secondary, #f8fafc); stroke-width: 5px; stroke-linejoin: round; }
.diagram-note { fill: currentColor; font-size: 14px; text-anchor: middle; }
details { margin-top: .6rem; font-size: .9rem; }
summary { cursor: pointer; padding: .35rem 0; }
@media print { .diagram-scroll { overflow: visible; } svg { min-width: 0; } }
</style>
