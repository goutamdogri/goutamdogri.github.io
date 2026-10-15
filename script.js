(() => {
  const root = document.documentElement;

  // Theme: saved choice, else system preference
  const saved = (() => { try { return localStorage.getItem('theme'); } catch { return null; } })();
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  root.dataset.theme = saved || (prefersLight ? 'light' : 'dark');

  document.getElementById('theme').addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
  });

  // Footer year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Copy email
  const copyBtn = document.getElementById('copy');
  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      copyBtn.textContent = 'Copied to clipboard';
    } catch {
      window.location.href = 'mailto:' + email;
    }
    setTimeout(() => (copyBtn.textContent = email), 1800);
  });

  // Terminal typing (the one animated moment on load)
  const term = document.getElementById('term-body');
  const lines = JSON.parse(term.dataset.lines);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const render = (done, partial) => {
    const html = done.map(l => l.startsWith('$')
      ? `<span class="p">$</span>${l.slice(1)}`
      : `<span class="o">${l}</span>`);
    if (partial !== null) html.push(partial);
    term.innerHTML = html.join('\n') + '<span class="caret"></span>';
  };

  if (reduce) {
    render(lines, null);
    return;
  }

  const done = [];
  let li = 0, ci = 0;
  const tick = () => {
    if (li >= lines.length) return render(done, null);
    const line = lines[li];
    const isCmd = line.startsWith('$');
    if (!isCmd) { // output lines appear instantly
      done.push(line); li++; render(done, null);
      return setTimeout(tick, 280);
    }
    ci++;
    const typed = line.slice(0, ci);
    render(done, `<span class="p">$</span>${typed.slice(1)}`);
    if (ci >= line.length) { done.push(line); li++; ci = 0; return setTimeout(tick, 350); }
    setTimeout(tick, 45);
  };
  tick();
})();
