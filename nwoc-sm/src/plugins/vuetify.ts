import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

// dark theme
let mql;
if (window.matchMedia && typeof window.matchMedia === 'function') {
  mql = window.matchMedia('(prefers-color-scheme: dark)');
  if (mql.addEventListener && typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', e => vuetify.framework.theme.dark = e.matches);
  }
}

const vuetify = new Vuetify({
  theme: { dark: mql && !!mql.matches },
  icons: { iconfont: 'mdiSvg' }
});

export default vuetify;
