import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { appConfig } from './lib/config.svelte';
import { initApi } from './lib/api';

await appConfig.load();

initApi();

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
