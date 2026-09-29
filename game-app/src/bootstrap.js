// Keep the HTML loading screen visible while the game module graph downloads.
// A failed import must offer recovery rather than an endless loading animation.
import('./main.jsx').catch(error=>{
  console.error('Unable to load the game:',error);
  const screen=document.querySelector('.career-startup');
  if(!screen)return;
  screen.classList.add('career-startup-error');
  screen.querySelector('[role="status"]')?.setAttribute('role','alert');
  screen.querySelector('h1').textContent='The game couldn’t load';
  screen.querySelector('p').textContent='Check that the local game server is running, then reload. Your saved career has not been cleared.';
  screen.querySelector('.career-startup-pulse')?.remove();
  const retry=screen.querySelector('button');
  retry.hidden=false;
  retry.addEventListener('click',()=>window.location.reload());
});
