import './../scss/main.scss';
import './../index.html';

// load assets
function requireAll(r) { r.keys().forEach(r); }
requireAll(require.context('../assets/', true));


init();

function init() {
  console.log('initititit');
}
