export class GameHud {
  constructor({ document, isTouch, map, roads }) {
    this.isTouch = isTouch;
    this.map = map;
    this.roads = roads;
    this.score = document.getElementById('hud-score');
    this.streak = document.getElementById('hud-streak');
    this.chests = document.getElementById('hud-chests');
    this.collectibles = document.getElementById('hud-coins');
    this.scorePops = document.getElementById('score-pops');
    this.sessionTime = document.getElementById('hud-session-time');
    this.announcer = document.getElementById('screen-reader-announcer');
    this.lastSessionSecond = null;
    this.toastElement = document.getElementById('toast');
    this.interactPrompt = document.getElementById('interact-prompt');
    this.actionButton = document.getElementById('action-btn');
    this.objective = document.getElementById('objective-guide');
    this.objectiveArrow = document.getElementById('objective-arrow');
    this.objectiveName = document.getElementById('objective-name');
    this.objectiveDistance = document.getElementById('objective-distance');
    this.hintButton = document.getElementById('hint-btn');
    this.minimap = document.getElementById('minimap');
    this.context = this.minimap.getContext('2d');
    this.toastTimer = null;
    this.stampBtn = document.getElementById('stamp-btn');
    this.albumBtn = document.getElementById('album-btn');
    this.albumThumbs = document.getElementById('album-thumbs');
    this.questBanner = document.getElementById('quest-banner');
    this.albumGrid = document.getElementById('album-grid');
    this.albumEmpty = document.getElementById('album-empty');
    this.stampGrid = document.getElementById('stamp-grid');
  }

  update(state, totalChests) {
    this.score.textContent = `分數 Score: ${state.score}`;
    this.chests.textContent = `寶箱 🎁 ${state.chestsOpened} / ${totalChests}`;
    this.collectibles.innerHTML = `💰 ${state.coinsCollected} &nbsp;⭐ ${state.starsCollected}`;
    if (this.streak) {
      const show = state.streak >= 2;
      this.streak.classList.toggle('hidden', !show);
      if (show) {
        this.streak.textContent = `🔥 連擊 Combo ${state.streak}`;
        this.streak.classList.toggle('hot', state.streak >= 5);
      }
    }
  }

  popScore(text, clientX, clientY) {
    if (!this.scorePops) return;
    const el = document.createElement('div');
    el.className = 'score-pop';
    el.textContent = text;
    el.style.left = `${clientX}px`;
    el.style.top = `${clientY}px`;
    this.scorePops.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }

  updateSessionClock(secondsRemaining) {
    const hidden = secondsRemaining == null;
    this.sessionTime.classList.toggle('hidden', hidden);
    if (hidden || secondsRemaining === this.lastSessionSecond) return;
    this.lastSessionSecond = secondsRemaining;
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = String(secondsRemaining % 60).padStart(2, '0');
    this.sessionTime.textContent = `⏱ ${minutes}:${seconds}`;
    this.sessionTime.classList.toggle('urgent', secondsRemaining <= 60);
    if ([60, 30, 10].includes(secondsRemaining)) {
      this.announcer.textContent = `快線剩餘 ${secondsRemaining} 秒。 Quick Hunt: ${secondsRemaining} seconds remaining.`;
    }
  }

  toast(message, duration = 2400) {
    this.toastElement.textContent = message;
    this.toastElement.classList.remove('hidden');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastElement.classList.add('hidden'), duration);
  }

  setPrompt(html) {
    const hidden = html === null;
    this.interactPrompt.classList.toggle('hidden', hidden);
    if (!hidden) this.interactPrompt.innerHTML = html;
    if (this.isTouch) this.actionButton.classList.toggle('hidden', hidden);
  }

  bindHint(callback) { this.hintButton.addEventListener('click', callback); }

  showObjective({ hint, distance, angle, inactive }) {
    this.objectiveArrow.style.transform = `rotate(${angle}rad)`;
    this.objectiveName.textContent = hint;
    this.objectiveDistance.textContent = `最近寶箱 · ${Math.round(distance)}m`;
    this.hintButton.classList.toggle('attention', inactive);
    this.objective.classList.remove('hidden');
  }

  hideObjective() { this.objective.classList.add('hidden'); }

  showQuest(text) {
    if (!this.questBanner) return;
    this.questBanner.textContent = text;
    this.questBanner.classList.remove('hidden');
  }

  hideQuest() { this.questBanner?.classList.add('hidden'); }

  setStamps(stamps, defs) {
    const earned = Object.values(stamps).filter(Boolean).length;
    if (this.stampBtn) this.stampBtn.textContent = `🎫 ${earned}/${defs.length}`;
    if (!this.stampGrid) return;
    this.stampGrid.replaceChildren(...defs.map(def => {
      const slot = document.createElement('div');
      slot.className = 'stamp-slot' + (stamps[def.id] ? ' earned' : '');
      slot.innerHTML = `<div class="stamp-emoji">${def.emoji}</div><b>${def.title}</b><small>${stamps[def.id] ? def.done : def.hint}</small>`;
      return slot;
    }));
  }

  addPolaroid({ name, dataUrl, album }) {
    if (this.albumBtn) this.albumBtn.textContent = `📷 ${album.length}`;
    if (this.albumThumbs && dataUrl) {
      const thumb = document.createElement('div');
      thumb.className = 'polaroid-thumb';
      const img = document.createElement('img');
      img.alt = name;
      img.src = dataUrl;
      thumb.appendChild(img);
      this.albumThumbs.appendChild(thumb);
    }
    this.renderAlbum(album);
  }

  renderAlbum(album) {
    if (!this.albumGrid) return;
    const empty = !album.length;
    this.albumEmpty?.classList.toggle('hidden', !empty);
    this.albumGrid.replaceChildren(...album.map(item => {
      const fig = document.createElement('figure');
      fig.className = 'polaroid';
      const img = document.createElement('img');
      img.alt = item.name;
      img.src = item.dataUrl || '';
      const cap = document.createElement('figcaption');
      cap.textContent = item.name;
      fig.append(img, cap);
      return fig;
    }));
  }

  clearHintAttention() { this.hintButton.classList.remove('attention'); }

  mapPoint(x, z) {
    return [
      (this.map.maxX - x) / (this.map.maxX - this.map.minX) * this.minimap.width,
      (this.map.maxZ - z) / (this.map.maxZ - this.map.minZ) * this.minimap.height,
    ];
  }

  drawMinimap({ world, chests, player, now, dog = null, photos = [] }) {
    const context = this.context, minimap = this.minimap;
    context.clearRect(0, 0, minimap.width, minimap.height);
    context.fillStyle = 'rgba(15,18,52,0.9)'; context.fillRect(0, 0, minimap.width, minimap.height);
    context.fillStyle = '#16335e';
    const [, waterY] = this.mapPoint(0, 124); context.fillRect(0, 0, minimap.width, waterY);
    context.strokeStyle = '#4a5170';
    for (const road of this.roads) {
      context.lineWidth = Math.max(2, (road.vertical ? road.w : road.d) / 5);
      const a = road.vertical ? this.mapPoint(road.x, road.z - road.d / 2) : this.mapPoint(road.x - road.w / 2, road.z);
      const b = road.vertical ? this.mapPoint(road.x, road.z + road.d / 2) : this.mapPoint(road.x + road.w / 2, road.z);
      context.beginPath(); context.moveTo(a[0], a[1]); context.lineTo(b[0], b[1]); context.stroke();
    }
    for (const item of world.minimapItems) {
      const [x, y] = this.mapPoint(item.x, item.z); context.fillStyle = item.color;
      context.fillRect(x - item.r / 2, y - item.r / 2, item.r, item.r);
    }
    const pulse = .6 + Math.sin(now / 250) * .4;
    for (const chest of chests) {
      if (chest.userData.opened || chest.userData.active === false) continue;
      const [x, y] = this.mapPoint(chest.position.x, chest.position.z);
      context.fillStyle = `rgba(255, 211, 92, ${.5 + pulse * .5})`;
      context.beginPath(); context.arc(x, y, 3.5 + pulse * 2, 0, 7); context.fill();
    }
    for (const photo of photos || []) {
      const [px, py] = this.mapPoint(photo.x, photo.z);
      context.fillStyle = '#7df0ff';
      context.beginPath(); context.arc(px, py, 3, 0, 7); context.fill();
    }
    if (dog) {
      const [dx, dy] = this.mapPoint(dog.position.x, dog.position.z);
      context.fillStyle = '#c89058';
      context.beginPath(); context.arc(dx, dy, 3.5, 0, 7); context.fill();
    }
    const [x, y] = this.mapPoint(player.position.x, player.position.z);
    context.fillStyle = '#ff8fb6'; context.beginPath(); context.arc(x, y, 5, 0, 7); context.fill();
    context.strokeStyle = '#fff'; context.lineWidth = 2; context.stroke();
  }
}
