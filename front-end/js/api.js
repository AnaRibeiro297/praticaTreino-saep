const API_URL = 'http://localhost:3000';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

function verificarAutenticacao() {
  const token = localStorage.getItem('token');
  if (!token && !window.location.pathname.endsWith('index.html')) {
    window.location.href = 'index.html';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('nome');
  window.location.href = 'index.html';
}

verificarAutenticacao();