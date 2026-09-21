const section = document.querySelector('.kai-voice');
if (section) {
  const video = section.querySelector('video'), audio = section.querySelector('audio');
  const toggle = section.querySelector('.kai-voice-toggle'), wave = section.querySelector('.kai-voice-wave');
  const status = section.querySelector('.kai-voice-status'), time = section.querySelector('.kai-voice-time');
  const selectors = [...section.querySelectorAll('[data-voice-language]')];
  let language = 'zh', waveforms = {}, frame = 0, revision = 0, playing = false;
  const clock = value => { const n = Math.floor(Number.isFinite(value) ? value : 0); return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`; };
  function progress() {
    const duration = Number.isFinite(audio.duration) ? audio.duration : waveforms[language]?.duration;
    wave.style.setProperty('--voice-progress', `${duration ? Math.min(100, audio.currentTime / duration * 100) : 0}%`);
    time.textContent = `${clock(audio.currentTime)} / ${duration ? clock(duration) : '—'}`;
  }
  function drawWave() {
    const samples = waveforms[language]?.samples || [];
    for (const layer of wave.children) {
      layer.replaceChildren();
      for (let i = 0; i < 96; i++) {
        const range = samples.slice(Math.floor(i * samples.length / 96), Math.max(Math.floor((i + 1) * samples.length / 96), Math.floor(i * samples.length / 96) + 1));
        const bar = document.createElement('span');
        bar.style.setProperty('--voice-height', `${3 + Math.sqrt(Math.max(0, ...range)) * 76}px`);
        layer.appendChild(bar);
      }
    }
    progress();
  }
  function buttonState() {
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', language === 'zh' ? `${playing ? '暫停' : '播放'} Kai 的中文聲音` : `${playing ? 'Pause' : 'Play'} Kai's English voice`);
  }
  function stop() { playing = false; audio.pause(); video.pause(); cancelAnimationFrame(frame); buttonState(); progress(); }
  function tick() {
    if (!playing) return;
    // WAV is the master clock. Correct drift after buffering or browser scheduling.
    if (video.readyState >= 2 && Math.abs(video.currentTime - audio.currentTime) > .1) video.currentTime = Math.min(audio.currentTime, video.duration || audio.currentTime);
    progress(); frame = requestAnimationFrame(tick);
  }
  async function play() {
    const request = ++revision;
    if (audio.ended) { audio.currentTime = 0; video.currentTime = 0; }
    playing = true; buttonState(); status.textContent = '';
    video.muted = true; video.defaultMuted = true;
    try {
      // Both calls originate directly in the user's click; no sound autoplay.
      await Promise.all([video.play(), audio.play()]);
      if (request !== revision || !playing) return;
      cancelAnimationFrame(frame); tick();
    } catch (error) {
      if (request !== revision) return;
      stop(); status.textContent = language === 'zh' ? '無法播放，請再試一次。' : 'Unable to play. Please try again.';
    }
  }
  function select(next) {
    ++revision; stop(); language = next;
    video.poster = `kai-assets/voice/kai-voice-${language}.webp`;
    video.src = `kai-assets/voice/kai-voice-${language}.mp4`;
    audio.src = `kai-assets/voice/kai-voice-${language}.wav`;
    video.load(); audio.load();
    section.querySelector('.kai-voice-intro').innerHTML = language === 'zh' ? '聲音讓角色有了另一種存在方式。<br />現在，聽聽 Kai 怎麼說話。' : 'A voice gives the character another way to exist.<br />Now, hear Kai speak.';
    section.querySelector('.kai-voice-intro').lang = language === 'zh' ? 'zh-Hant' : 'en';
    section.querySelector('.kai-voice-language').textContent = language === 'zh' ? 'LANGUAGE / 中文' : 'LANGUAGE / ENGLISH';
    selectors.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.voiceLanguage === language)));
    status.textContent = ''; buttonState(); drawWave();
  }
  toggle.addEventListener('click', () => { if (playing) { ++revision; stop(); } else play(); });
  selectors.forEach(b => b.addEventListener('click', () => { if (language !== b.dataset.voiceLanguage) select(b.dataset.voiceLanguage); }));
  audio.addEventListener('loadedmetadata', progress);
  audio.addEventListener('timeupdate', progress);
  audio.addEventListener('ended', stop);
  audio.addEventListener('waiting', () => { if (playing) video.pause(); });
  audio.addEventListener('playing', () => { if (playing && video.paused) video.play().catch(() => stop()); });
  for (const media of [audio, video]) media.addEventListener('error', () => { stop(); status.textContent = language === 'zh' ? '素材載入失敗，請重新整理後再試。' : 'Unable to load media. Please refresh and try again.'; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { ++revision; stop(); } });
  window.addEventListener('pagehide', () => { ++revision; stop(); });
  new IntersectionObserver(entries => { if (!entries[0].isIntersecting) { ++revision; stop(); } }).observe(section);
  fetch('kai-assets/voice/waveforms.json').then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => { waveforms = data; drawWave(); }).catch(() => { status.textContent = 'Waveform unavailable.'; });
  select('zh');
}
