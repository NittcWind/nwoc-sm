import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

// dark theme
const mql = matchMedia('(prefers-color-scheme: dark)');
mql.addEventListener('change', e => vuetify.framework.theme.dark = e.matches);

const vuetify = new Vuetify({
  theme: { dark: mql.matches }
});

export default vuetify;
