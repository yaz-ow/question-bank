import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { Ziggy } from './ziggy.js'

window.Ziggy = Ziggy

createInertiaApp({
    title: (title) => `${title} - ${document.head.querySelector('meta[name="application-name"]')?.content || 'Question Bank'}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.pages, import.meta.glob('../Pages/**/*.jsx')),
    setup({ el, App, props, plugin }) {
        return createEl(App, { ...props })
            .use(plugin)
            .mount(el)
    },
    progress: {
        color: '#4B5563',
    },
})

function createEl(App, props) {
    const el = document.createElement('div')
    el.id = 'app'
    el.setAttribute('data-page', JSON.stringify(props))
    return el
}