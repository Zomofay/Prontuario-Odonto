/* ===== DASHBOARD.JS — Prontuário Digital ===== */
'use strict';

const $ = (id) => document.getElementById(id);
const $all = (sel) => document.querySelectorAll(sel);

/* ================================================================
   TOAST
================================================================ */
window.showToast = function(msg, type = '') {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast is-show' + (type ? ' is-' + type : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3600);
};

/* ================================================================
   UTILS
================================================================ */
const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MONTHS_FULL  = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function parseDate(str) {
  if (!str) return null;
  if (str.includes('-')) { const [y,m,d] = str.split('-'); return new Date(+y,+m-1,+d); }
  if (str.includes('/')) { const [d,m,y] = str.split('/'); return new Date(+y,+m-1,+d); }
  return null;
}
function formatDateBR(str) {
  const d = parseDate(str);
  return d ? d.toLocaleDateString('pt-BR') : (str || '—');
}
function daysBetween(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return null;
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  return Math.round((d - hoje) / 86400000);
}
function emptyState(icon, text) {
  return `<div class="empty-state"><div class="empty-state__icon">${icon}</div><p>${text}</p></div>`;
}
function badgeStatus(status) {
  return `<span class="agenda-badge badge-${status}">${status === 'agendado' ? 'Agendado' : 'Realizado'}</span>`;
}
function infoItem(label, value) {
  return `<div class="info-item"><label>${label}</label><span>${value || '—'}</span></div>`;
}
function docIcon(tipo) {
  return {'Radiografia':'🦷','Orçamento':'💰','Atestado':'📜','Receita':'💊','Exame':'🔬'}[tipo] || '📄';
}

/* ================================================================
   SESSION / STORAGE
================================================================ */
const SESSION_KEY = 'tw_session';
const STORE_KEY   = 'tw_users';

function getSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}
function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch { return []; }
}
function saveUsers(u) { localStorage.setItem(STORE_KEY, JSON.stringify(u)); }
function getUser(id) { return getUsers().find(u => u.id === id) || null; }

/* ---- Proteção de rota ---- */
const session = getSession();
if (!session) { window.location.href = 'auth.html'; throw 0; }
const user = getUser(session.id);
if (!user)    { window.location.href = 'auth.html'; throw 0; }
const p = user.prontuario;

/* ================================================================
   TOPBAR — nome, avatar, saudação
================================================================ */
const firstName = user.name.split(' ')[0];
const initial   = firstName[0].toUpperCase();
$('topbarAvatar').textContent = initial;
$('topbarName').textContent   = firstName;

const hour = new Date().getHours();
const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
$('greetingText').textContent = `${greeting}, ${firstName}! 👋`;

/* ================================================================
   NAVEGAÇÃO
================================================================ */
const SECTION_TITLES = {
  overview:   'Visão Geral',
  prontuario: 'Prontuário',
  agenda:     'Agenda',
  evolucoes:  'Evoluções',
  documentos: 'Documentos',
  anamnese:   'Anamnese',
  perfil:     'Meu Perfil'
};

const RENDERERS = {};

function showSection(name) {
  $all('.nav-item').forEach(el => el.classList.toggle('is-active', el.dataset.section === name));
  $all('.section').forEach(el => el.classList.toggle('is-active', el.id === 'section-' + name));
  $('topbarTitle').textContent = SECTION_TITLES[name] || '';
  closeSidebar();
  if (RENDERERS[name]) RENDERERS[name]();
}

$all('.nav-item').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); showSection(el.dataset.section); });
});
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-goto]');
  if (btn) showSection(btn.dataset.goto);
});

/* ================================================================
   SIDEBAR MOBILE
================================================================ */
function closeSidebar() {
  $('sidebar').classList.remove('is-open');
  $('sidebarOverlay').classList.remove('is-show');
  document.body.style.overflow = '';
}
$('menuBtn').addEventListener('click', () => {
  const open = $('sidebar').classList.toggle('is-open');
  $('sidebarOverlay').classList.toggle('is-show', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
$('sidebarOverlay').addEventListener('click', closeSidebar);

/* ================================================================
   LOGOUT
================================================================ */
$('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'auth.html';
});

/* ================================================================
   SEÇÃO: VISÃO GERAL
================================================================ */
RENDERERS.overview = function() {
  /* — stats — */
  const proximas = (p.consultas || [])
    .filter(c => c.status === 'agendado')
    .sort((a,b) => parseDate(a.data) - parseDate(b.data));

  $('statsProxConsulta').textContent = proximas.length ? formatDateBR(proximas[0].data) : 'Nenhuma';
  $('statsEvolucoes').textContent    = (p.evolucoes  || []).length;
  $('statsDocumentos').textContent   = (p.documentos || []).length;
  $('statsCodigo').textContent       = p.codigoPaciente || '—';

  /* — banner próxima consulta — */
  const existing = document.querySelector('.next-banner');
  if (existing) existing.remove();
  if (proximas.length) {
    const next = proximas[0];
    const diff = daysBetween(next.data);
    let label = '';
    if (diff === 0)      label = `🔔 Sua consulta é <strong>hoje</strong>! — ${next.hora} · ${next.tipo}`;
    else if (diff === 1) label = `🔔 Sua consulta é <strong>amanhã</strong>! — ${next.hora} · ${next.tipo}`;
    else if (diff > 0)   label = `📅 Próxima consulta em <strong>${diff} dias</strong> — ${formatDateBR(next.data)} às ${next.hora} · ${next.tipo}`;

    if (label) {
      const banner = document.createElement('div');
      banner.className = 'next-banner';
      banner.innerHTML = `
        <div class="next-banner__icon">🦷</div>
        <div class="next-banner__text">${label}</div>
        <a href="https://wa.me/5500000000000" target="_blank" class="next-banner__btn">Confirmar via WhatsApp</a>
      `;
      $('section-overview').querySelector('.page-header').insertAdjacentElement('afterend', banner);
    }
  }

  /* — próximas consultas (mini lista) — */
  const ccEl = $('overviewConsultas');
  const upcoming = proximas.slice(0,3);
  ccEl.innerHTML = upcoming.length
    ? upcoming.map(c => miniAgendaItem(c)).join('')
    : emptyState('📅','Nenhuma consulta agendada.<br>Agende pelo WhatsApp!');

  /* — últimas evoluções (mini lista) — */
  const eeEl = $('overviewEvolucoes');
  const evos = [...(p.evolucoes || [])].reverse().slice(0,3);
  eeEl.innerHTML = evos.length
    ? evos.map(e => miniEvoItem(e)).join('')
    : emptyState('📋','Nenhuma evolução registrada ainda.');
};

function miniAgendaItem(c) {
  const d   = parseDate(c.data);
  const day = d ? String(d.getDate()).padStart(2,'0') : '--';
  const mon = d ? MONTHS_SHORT[d.getMonth()] : '--';
  return `<div class="agenda-item">
    <div class="agenda-item__date"><span class="day">${day}</span><span class="mon">${mon}</span></div>
    <div class="agenda-item__info">
      <div class="agenda-item__tipo">${c.tipo}</div>
      <div class="agenda-item__hora">🕐 ${c.hora}</div>
    </div>
    ${badgeStatus(c.status)}
  </div>`;
}
function miniEvoItem(e) {
  return `<div class="evo-item">
    <div class="evo-item__dr">${e.dr}</div>
    <div class="evo-item__text">${e.descricao}</div>
    <div class="evo-item__date">📅 ${e.data}</div>
  </div>`;
}

/* ================================================================
   SEÇÃO: PRONTUÁRIO
================================================================ */
RENDERERS.prontuario = function() {
  $('pronDados').innerHTML = [
    infoItem('Nome completo', user.name),
    infoItem('Data de nascimento', formatDateBR(user.birth)),
    infoItem('Gênero', user.gender),
    infoItem('CPF', user.cpfFormatted),
    infoItem('RG', p.rg),
    infoItem('Profissão', p.profissao),
  ].join('');

  $('pronContato').innerHTML = [
    infoItem('Celular / WhatsApp', user.phone),
    infoItem('E-mail', user.email),
    infoItem('Pref. de lembrete', p.prefLembrete),
    infoItem('Cadastrado em', formatDateBR(user.createdAt)),
  ].join('');

  $('pronOdonto').innerHTML = [
    infoItem('Código do paciente', p.codigoPaciente),
    infoItem('Total de consultas', (p.consultas  || []).length),
    infoItem('Total de evoluções', (p.evolucoes  || []).length),
    infoItem('Documentos arquivados', (p.documentos || []).length),
    infoItem('Alergias conhecidas', p.anamnese?.alergias),
    infoItem('Medicamentos em uso', p.anamnese?.medicamentos),
  ].join('');
};

/* ================================================================
   SEÇÃO: AGENDA
================================================================ */
let agendaFilter = 'agendado';

RENDERERS.agenda = function() {
  $all('.agenda-tab').forEach(tab => {
    tab.classList.toggle('is-active', tab.dataset.filter === agendaFilter);
    tab.onclick = () => { agendaFilter = tab.dataset.filter; RENDERERS.agenda(); };
  });

  const consultas = (p.consultas || [])
    .filter(c => agendaFilter === 'all' ? true : c.status === agendaFilter)
    .sort((a,b) => {
      const diff = parseDate(a.data) - parseDate(b.data);
      return agendaFilter === 'realizado' ? -diff : diff;
    });

  const list = $('agendaList');
  if (!consultas.length) {
    list.innerHTML = emptyState('📅',
      agendaFilter === 'agendado'
        ? 'Nenhuma consulta agendada.<br>Use o WhatsApp para marcar!'
        : 'Nenhum registro encontrado.');
    return;
  }

  list.innerHTML = consultas.map(c => {
    const d   = parseDate(c.data);
    const day = d ? String(d.getDate()).padStart(2,'0') : '--';
    const mon = d ? MONTHS_SHORT[d.getMonth()] : '--';
    const yr  = d ? d.getFullYear() : '--';
    const diff = daysBetween(c.data);
    let diffLabel = '';
    if (c.status === 'agendado') {
      if (diff === 0)       diffLabel = '<span class="badge-hoje">Hoje!</span>';
      else if (diff === 1)  diffLabel = '<span class="badge-amanha">Amanhã</span>';
      else if (diff > 0)    diffLabel = `<span class="badge-dias">em ${diff}d</span>`;
    }
    return `<div class="full-agenda-item">
      <div class="fai-date"><div class="d">${day}</div><div class="m">${mon}</div><div class="y">${yr}</div></div>
      <div class="fai-info">
        <strong>${c.tipo} ${diffLabel}</strong>
        <span>🕐 ${c.hora}</span>
      </div>
      ${badgeStatus(c.status)}
    </div>`;
  }).join('');
};

/* ================================================================
   SEÇÃO: EVOLUÇÕES
================================================================ */
RENDERERS.evolucoes = function() {
  const list = $('evolucoesList');
  const evos = [...(p.evolucoes || [])].reverse();
  if (!evos.length) {
    list.innerHTML = emptyState('📋','Nenhuma evolução registrada ainda.');
    return;
  }
  list.innerHTML = evos.map(e => `
    <div class="evo-full-item">
      <div class="evo-full-item__header">
        <span class="evo-full-item__dr">👩‍⚕️ ${e.dr}</span>
        <span class="evo-full-item__date">📅 ${e.data}</span>
      </div>
      <div class="evo-full-item__text">${e.descricao}</div>
    </div>
  `).join('');
};

/* ================================================================
   SEÇÃO: DOCUMENTOS
================================================================ */
RENDERERS.documentos = function() {
  const list = $('documentosList');
  const docs = p.documentos || [];
  if (!docs.length) {
    list.innerHTML = emptyState('📁','Nenhum documento arquivado ainda.<br>Solicite pelo WhatsApp.');
    return;
  }
  list.innerHTML = docs.map(d => `
    <div class="doc-card">
      <div class="doc-card__icon">${docIcon(d.tipo)}</div>
      <div>
        <div class="doc-card__name">${d.nome}</div>
        <div class="doc-card__meta">${formatDateBR(d.data)} · ${d.tamanho}</div>
      </div>
      <div class="doc-card__footer">
        <span class="doc-badge">${d.tipo}</span>
        <button class="doc-download" onclick="showToast('Solicite o arquivo diretamente na clínica ou pelo WhatsApp. 📲','')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Solicitar
        </button>
      </div>
    </div>
  `).join('');
};

/* ================================================================
   SEÇÃO: ANAMNESE
================================================================ */
RENDERERS.anamnese = function() {
  const a = p.anamnese || {};
  $('anamneseContent').innerHTML = [
    infoItem('Alergias',             a.alergias),
    infoItem('Medicamentos em uso',  a.medicamentos),
    infoItem('Doenças pré-existentes', a.doencas),
    infoItem('Fumante',              a.fumante),
    infoItem('Gestante',             a.gestante),
    infoItem('Pressão arterial',     a.pressao),
    `<div class="info-item" style="grid-column:1/-1">
      <label>Observações clínicas</label>
      <span>${a.obs || '—'}</span>
    </div>`,
  ].join('');
};

/* ================================================================
   SEÇÃO: PERFIL
================================================================ */
RENDERERS.perfil = function() {
  $('perfilAvatar').textContent = initial;
  $('perfilName').textContent   = user.name;
  $('perfilCpf').textContent    = 'CPF: ' + (user.cpfFormatted || '—');

  $('perfilInfo').innerHTML = [
    infoItem('Nome', user.name),
    infoItem('CPF', user.cpfFormatted),
    infoItem('Nascimento', formatDateBR(user.birth)),
    infoItem('Celular', user.phone),
    infoItem('E-mail', user.email || '—'),
    infoItem('Gênero', user.gender || '—'),
  ].join('');
};

/* — Alterar senha — */
$('changePassForm').addEventListener('submit', e => {
  e.preventDefault();
  const err = $('passFormErr');
  err.textContent = '';

  const oldPass  = $('oldPass').value;
  const newPass  = $('newPass').value;
  const newPassC = $('newPassConf').value;

  const freshUser = getUser(user.id);
  if (!oldPass || oldPass !== freshUser.password) {
    err.textContent = 'Senha atual incorreta.'; return;
  }
  if (newPass.length < 6) {
    err.textContent = 'A nova senha deve ter no mínimo 6 caracteres.'; return;
  }
  if (newPass !== newPassC) {
    err.textContent = 'As senhas não coincidem.'; return;
  }

  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx !== -1) { users[idx].password = newPass; saveUsers(users); user.password = newPass; }

  $('oldPass').value = $('newPass').value = $('newPassConf').value = '';
  showToast('Senha alterada com sucesso! 🔒', 'success');
});

/* ================================================================
   INICIALIZAÇÃO
================================================================ */
showSection('overview');
