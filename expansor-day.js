// ==UserScript==
// @name         WhatsApp Web - Expansor de dias da semana
// @namespace    local.whatsapp.dias
// @version      1.1
// @author       Nerddy22
// @description  Digite :terça, quarta, quinta: ou :11/11: e vira "terça-feira (10/11), quarta-feira (11/11) e quinta-feira (12/11)"
// @match        https://web.whatsapp.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Se true, digitar o dia de hoje ("quinta" numa quinta) retorna hoje.
  // Se false, retorna o próximo (semana que vem).
  const INCLUIR_HOJE = false;

  const NOMES = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
                 'quinta-feira', 'sexta-feira', 'sábado'];

  // chave normalizada (sem acento, sem "-feira") -> índice do dia (0 = domingo)
  const DIAS = {
    dom: 0, domingo: 0,
    seg: 1, segunda: 1,
    ter: 2, terca: 2,
    qua: 3, quarta: 3,
    qui: 4, quinta: 4,
    sex: 5, sexta: 5,
    sab: 6, sabado: 6,
  };

  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (d) => `${NOMES[d.getDay()]} (${pad(d.getDate())}/${pad(d.getMonth() + 1)})`;

  function normaliza(s) {
    return s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/-?feira/g, '');
  }

  function proximoDiaSemana(idx) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (!INCLUIR_HOJE) d.setDate(d.getDate() + 1);
    while (d.getDay() !== idx) d.setDate(d.getDate() + 1);
    return d;
  }

  function dataExplicita(dia, mes, ano) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let y = ano ? Number(ano) : hoje.getFullYear();
    if (ano && ano.length === 2) y += 2000;
    let d = new Date(y, Number(mes) - 1, Number(dia));
    if (d.getMonth() !== Number(mes) - 1) return null; // data inválida (ex.: 31/02)
    // sem ano e já passou? usa o ano seguinte
    if (!ano && d < hoje) d = new Date(y + 1, Number(mes) - 1, Number(dia));
    return d;
  }

  function converte(conteudo) {
    const tokens = normaliza(conteudo)
      .split(/\s*[,;]\s*|\s+e\s+|\s+/)
      .filter(Boolean);
    if (!tokens.length) return null;

    const datas = [];
    for (const t of tokens) {
      const m = t.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
      if (m) {
        const d = dataExplicita(m[1], m[2], m[3]);
        if (!d) return null;
        datas.push(d);
      } else if (t in DIAS) {
        datas.push(proximoDiaSemana(DIAS[t]));
      } else {
        return null; // token desconhecido: não mexe em nada
      }
    }

    const txt = datas.map(fmt);
    if (txt.length === 1) return txt[0];
    return txt.slice(0, -1).join(', ') + ' e ' + txt[txt.length - 1];
  }

  function tratar() {
    const alvo = document.activeElement;
    if (!alvo || !alvo.isContentEditable) return;

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !sel.isCollapsed) return;
    const no = sel.anchorNode;
    if (!no || no.nodeType !== Node.TEXT_NODE) return;

    const antes = no.textContent.slice(0, sel.anchorOffset);
    const m = antes.match(/:([^:\n]{2,80}):$/);
    if (!m) return;

    const resultado = converte(m[1]);
    if (!resultado) return;

    // seleciona o ":...:" digitado e substitui
    const tamanho = m[0].length;
    for (let i = 0; i < tamanho; i++) {
      sel.modify('extend', 'backward', 'character');
    }
    document.execCommand('insertText', false, resultado);
  }

  // keyup: funciona mesmo quando o editor bloqueia o evento "input" nativo
  document.addEventListener('keyup', (ev) => {
    if (ev.key !== ':') return;
    setTimeout(tratar, 0);
  }, true);

  // reserva
  document.addEventListener('input', (ev) => {
    if (ev.inputType === 'insertText' && ev.data === ':') setTimeout(tratar, 0);
  }, true);
})();
