/* ===== AUTH.JS — Login & Registro ===== */
'use strict';

/* ---- Utilitários ---- */
const $ = (id) => document.getElementById(id);
const $q = (sel) => document.querySelector(sel);

function showToast(msg, type = '') {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast is-show' + (type ? ' is-' + type : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3600);
}

function setError(id, msg) {
  const el = $(id);
  if (el) { el.textContent = msg; }
}
function clearErrors(...ids) {
  ids.forEach(id => { const el = $(id); if (el) el.textContent = ''; });
}

/* ---- Formatadores ---- */
function formatCpf(v) {
  return v.replace(/\D/g,'')
          .replace(/(\d{3})(\d)/,'$1.$2')
          .replace(/(\d{3})(\d)/,'$1.$2')
          .replace(/(\d{3})(\d{1,2})$/,'$1-$2')
          .slice(0,14);
}
function formatPhone(v) {
  return v.replace(/\D/g,'')
          .replace(/(\d{2})(\d)/,'($1) $2')
          .replace(/(\d{5})(\d{4})$/,'$1-$2')
          .slice(0,15);
}
function validateCpf(cpf) {
  const c = cpf.replace(/\D/g,'');
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += +c[i] * (10 - i);
  let r = 11 - (s % 11); if (r >= 10) r = 0;
  if (r !== +c[9]) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += +c[i] * (11 - i);
  r = 11 - (s % 11); if (r >= 10) r = 0;
  return r === +c[10];
}

/* ---- Storage ---- */
const STORE_KEY = 'tw_users';
const SESSION_KEY = 'tw_session';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(STORE_KEY, JSON.stringify(users));
}
function getSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}
function setSession(user, remember) {
  const s = JSON.stringify(user);
  sessionStorage.setItem(SESSION_KEY, s);
  if (remember) localStorage.setItem(SESSION_KEY, s);
}

/* ---- Seed demo account ---- */
(function seedDemo() {
  let users = getUsers();
  const exists = users.find(u => u.cpf === '12345678900');
  if (!exists) {
    users.push({
      id: 'demo',
      name: 'Josiane França',
      cpf: '12345678900',
      cpfFormatted: '123.456.789-00',
      birth: '1997-12-06',
      phone: '(32) 99178-5961',
      gender: 'Feminino',
      email: 'josifranca@email.com',
      password: 'demo123',
      createdAt: '2024-01-10',
      prontuario: {
        codigoPaciente: '1264',
        prefLembrete: 'WhatsApp',
        profissao: 'Advogada',
        rg: '12345678',
        evolucoes: [
          { data: '24/11/2022', dr: 'Dr. André Garcia', descricao: 'Avaliação geral, encaminhada para endodontia.' },
          { data: '10/03/2023', dr: 'Dra. Thallyta Welkson', descricao: 'Limpeza completa + orientação de higiene bucal.' },
          { data: '05/07/2023', dr: 'Dra. Thallyta Welkson', descricao: 'Restauração dente 12 — resina composta.' },
          { data: '18/01/2024', dr: 'Dra. Thallyta Welkson', descricao: 'Clareamento dental — sessão 1/3.' },
        ],
        consultas: [
          { data: '2024-07-10', hora: '09:00', tipo: 'Limpeza', status: 'agendado' },
          { data: '2024-07-24', hora: '10:30', tipo: 'Retorno Clareamento', status: 'agendado' },
          { data: '2024-06-12', hora: '14:00', tipo: 'Avaliação', status: 'realizado' },
        ],
        documentos: [
          { nome: 'Radiografia Panorâmica', tipo: 'Radiografia', data: '2023-04-15', tamanho: '2.4 MB' },
          { nome: 'Orçamento Clareamento', tipo: 'Orçamento', data: '2024-01-18', tamanho: '124 KB' },
          { nome: 'Atestado de Saúde Bucal', tipo: 'Atestado', data: '2023-10-05', tamanho: '87 KB' },
        ],
        anamnese: {
          alergias: 'Não',
          medicamentos: 'Nenhum',
          doencas: 'Nenhuma',
          fumante: 'Não',
          gestante: 'Não',
          pressao: 'Normal',
          obs: 'Paciente apresenta sensibilidade nos dentes superiores.'
        }
      }
    });
    saveUsers(users);
  }
})();

/* ---- Verificar sessão ativa ---- */
if (getSession()) {
  window.location.href = 'dashboard.html';
}

/* ---- Tabs ---- */
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('is-active'));
    document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('is-active'));
    tab.classList.add('is-active');
    $('panel-' + target).classList.add('is-active');
  });
});
document.querySelectorAll('[data-switch]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.switch;
    document.querySelectorAll('.auth-tab').forEach(t => {
      t.classList.toggle('is-active', t.dataset.tab === target);
    });
    document.querySelectorAll('.auth-panel').forEach(p => {
      p.classList.toggle('is-active', p.id === 'panel-' + target);
    });
  });
});

/* ---- Eye toggle ---- */
document.querySelectorAll('.eye-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const inp = $(btn.dataset.target);
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
});

/* ---- CPF mask ---- */
['loginCpf','regCpf'].forEach(id => {
  const el = $(id);
  if (el) el.addEventListener('input', () => { el.value = formatCpf(el.value); });
});

/* ---- Phone mask ---- */
const regPhone = $('regPhone');
if (regPhone) regPhone.addEventListener('input', () => { regPhone.value = formatPhone(regPhone.value); });

/* ---- LOGIN ---- */
$('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  clearErrors('loginCpfErr','loginPassErr','loginGlobalErr');

  const cpf = $('loginCpf').value.replace(/\D/g,'');
  const pass = $('loginPass').value;
  const remember = $('rememberMe').checked;

  let valid = true;
  if (cpf.length !== 11) { setError('loginCpfErr','CPF inválido'); valid = false; }
  if (!pass) { setError('loginPassErr','Informe a senha'); valid = false; }
  if (!valid) return;

  const users = getUsers();
  const user = users.find(u => u.cpf === cpf);

  if (!user || user.password !== pass) {
    setError('loginGlobalErr','CPF ou senha incorretos. Verifique os dados.');
    showToast('Credenciais inválidas', 'error');
    return;
  }

  const btn = $('loginSubmit');
  btn.disabled = true;
  btn.classList.add('is-loading');

  setSession({ id: user.id, name: user.name, cpf: user.cpf, cpfFormatted: user.cpfFormatted }, remember);
  showToast('Bem-vindo(a), ' + user.name.split(' ')[0] + '! 👋', 'success');

  setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
});

/* ---- REGISTER ---- */
$('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  clearErrors('regNameErr','regCpfErr','regPassErr','regPassConfErr','regTermsErr','regGlobalErr');

  const name  = $('regName').value.trim();
  const cpf   = $('regCpf').value.replace(/\D/g,'');
  const birth = $('regBirth').value;
  const phone = $('regPhone').value;
  const gender = $('regGender').value;
  const email = $('regEmail').value.trim();
  const pass  = $('regPass').value;
  const passC = $('regPassConf').value;
  const terms = $('regTerms').checked;

  let valid = true;

  if (name.length < 3) { setError('regNameErr','Informe o nome completo'); valid = false; }
  if (!validateCpf(cpf)) { setError('regCpfErr','CPF inválido'); valid = false; }
  if (pass.length < 6) { setError('regPassErr','Mínimo 6 caracteres'); valid = false; }
  if (pass !== passC) { setError('regPassConfErr','Senhas não coincidem'); valid = false; }
  if (!terms) { setError('regTermsErr','Aceite os termos para continuar'); valid = false; }
  if (!valid) return;

  const users = getUsers();
  if (users.find(u => u.cpf === cpf)) {
    setError('regGlobalErr','CPF já cadastrado. Faça o login.');
    return;
  }

  const newUser = {
    id: 'u_' + Date.now(),
    name, cpf,
    cpfFormatted: $('regCpf').value,
    birth, phone, gender, email,
    password: pass,
    createdAt: new Date().toISOString().slice(0,10),
    prontuario: {
      codigoPaciente: String(Math.floor(Math.random()*9000)+1000),
      prefLembrete: 'WhatsApp',
      profissao: '',
      rg: '',
      evolucoes: [],
      consultas: [],
      documentos: [],
      anamnese: { alergias:'', medicamentos:'', doencas:'', fumante:'Não', gestante:'Não', pressao:'Normal', obs:'' }
    }
  };

  users.push(newUser);
  saveUsers(users);
  setSession({ id: newUser.id, name: newUser.name, cpf: newUser.cpf, cpfFormatted: newUser.cpfFormatted }, false);
  showToast('Conta criada! Bem-vindo(a), ' + name.split(' ')[0] + ' 🎉', 'success');
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
});

/* ---- Forgot password ---- */
$('forgotBtn').addEventListener('click', () => {
  showToast('Entre em contato pelo WhatsApp para recuperar sua senha.', '');
});
