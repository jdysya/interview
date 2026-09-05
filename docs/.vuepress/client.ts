import { defineClientConfig } from 'vuepress/client';
import KnowledgeDiagram from './components/KnowledgeDiagram.vue';
import PracticeBoard from './components/PracticeBoard.vue';
export default defineClientConfig({
  enhance({ app }) {
    app.component('KnowledgeDiagram', KnowledgeDiagram);
    app.component('PracticeBoard', PracticeBoard);
  },
});
