export const THEME_KEY = "madvert-theme";

/**
 * Runs inline in <head> before first paint: resolves the theme (manual override → system preference)
 * and flags JS so progressive reveals can hide content. If the client bundle never boots,
 * the "js" flag is removed after 4s so content can never stay hidden.
 */
export const themeBootScript = `(function(){var d=document.documentElement;try{var s=localStorage.getItem('${THEME_KEY}');var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');d.setAttribute('data-theme',t);}catch(e){d.setAttribute('data-theme','dark');}d.classList.add('js');try{var it=+(localStorage.getItem('mv_intro_seen')||0);if(sessionStorage.getItem('mv_intro_seen')||Date.now()-it<864e5||window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('intro-seen');}}catch(e){d.classList.add('intro-seen');}setTimeout(function(){if(!window.__madvertReady){d.classList.remove('js');}},4000);})();`;
