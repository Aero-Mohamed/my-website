import './bootstrap';
import '../css/app.css';
import mathjax from './utils/mathjax';

import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ZiggyVue } from '../../vendor/tightenco/ziggy';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
import asset from '@/Helpers/Asset';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
    setup({ el, App, props, plugin }) {
        const app = createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(ZiggyVue)
            .directive('mathjax', mathjax);
        app.config.globalProperties.asset = (path, recipe) => {
            return asset(path, recipe);
        }
        return app.mount(el);
    },
    progress: {
        color: '#f83768',
    },
});
