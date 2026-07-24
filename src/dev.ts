import { createApp } from 'vue';
import App from './App.vue';
import { ChatPlugin } from './plugins/chatPlugin';
import './style.css';

const app = createApp(App);

app.use(ChatPlugin, {
  webhookUrl: 'https://app.healthyline.com/webhook/ai-chat',
  title: 'HealthyLine AI Assistant',
  subtitle: 'How can I help you?'
});

app.mount('#app');

export default app;
