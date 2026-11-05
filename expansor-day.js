// ==UserScript==
// @name         WhatsApp Web - Expansor de dias da semana
// @namespace    local.whatsapp.dias
// @version      3.2
// @author       Nerddy22
// @description  Digite :terça, quarta, quinta: ou :11/11: e vira "terça-feira (10/11), quarta-feira (11/11) e quinta-feira (12/11)"
// @match        https://web.whatsapp.com/*
// @grant        none
// ==/UserScript==

/*
 * USO
 * Escreva entre dois-pontos; ao digitar o ":" de fechamento o texto é trocado.
 *
 *   :terça, quarta, quinta:  ->  terça-feira (10/11), quarta-feira (11/11) e quinta-feira (12/11)
 *   :11/11:                  ->  quarta-feira (11/11)
 *   :ter qua qui:            ->  mesmo resultado de "terça, quarta, quinta"
 *
 *   :hoje:                   ->  quinta-feira (05/11)
 *
 * (Exemplos calculados com referência em 05/11/2026.)
 *
 * v3.2
 *  - Novo: :hoje: devolve o dia de hoje (também funciona misturado: :hoje, sexta:).
 *  - A troca agora seleciona o trecho e insere o resultado por cima, em uma
 *    operação só, em vez de apagar letra por letra e reescrever. Se o editor
 *    não aceitar, cai para colar e, por último, para o backspace conferido.
 *
 * v3.1
 *  - Depois de trocar, confere a linha inteira (duas vezes) e remove qualquer
 *    caractere que tenha sobrado antes do resultado (ex.: o ":" de abertura).
 *
 * v3.0
 *  - Corrigido: sobrava um ":" na frente do resultado. Agora o script confere
 *    o texto da linha a cada apagada e só para quando sobrou exatamente o que
 *    estava antes do trecho digitado.
 *  - Leve: o único listener é o keyup, e ele sai na hora se a tecla não for o
 *    delimitador. O listener de "input" foi removido.
 */

(function () {
  'use strict';

  // Se true, digitar o dia de hoje ("quinta" numa quinta) retorna hoje.
  // Se false, retorna o próximo (semana que vem).
  const INCLUIR_HOJE = false;

  // true  -> terça-feira (10/11/2026)
  // false -> terça-feira (10/11)
  const INCLUIR_ANO = false;

  // Caractere que abre e fecha o trecho a ser convertido.
  // Se o ":" der conflito com o seletor de emojis do WhatsApp, troque por
  // outro, por exemplo '#'.
  const DELIMITADOR = ':';

  // true = escreve no console (F12) o que o script entendeu, para diagnóstico
  const DEBUG = true;

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

  // Teclas que podem disparar a verificação. Em teclado ABNT o ":" é Shift + ";"
  // e, se o Shift é solto antes, o keyup chega como ";". Por isso as duas contam.
  const TECLAS = new Set([DELIMITADOR]);
  if (DELIMITADOR === ':') TECLAS.add(';');

  const escapaRegex = (s) => s.replace(/[\\^$.*+?()[\]{}|\/-]/g, '\\$&');
  const D = escapaRegex(DELIMITADOR);
  const PADRAO = new RegExp(D + '([^' + D + '\\n]{2,80})' + D + '$');

  const log = (...a) => { if (DEBUG) console.log('[WhatsApp Dias]', ...a); };

  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (d) =>
    `${NOMES[d.getDay()]} (${pad(d.getDate())}/${pad(d.getMonth() + 1)}` +
    `${INCLUIR_ANO ? '/' + d.getFullYear() : ''})`;

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
      } else if (t === 'hoje') {
        const h = new Date();
        h.setHours(0, 0, 0, 0);
        datas.push(h);
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

  // Lê o texto da linha atual, do começo dela até o cursor.
  // <br> (Shift+Enter) vira "\n" para o trecho nunca atravessar linhas.
  function textoDaLinhaAteCursor(alvo, sel) {
    let linha = sel.anchorNode;
    while (linha && linha !== alvo &&
           !(linha.nodeType === 1 && /^(P|DIV|LI)$/.test(linha.tagName))) {
      linha = linha.parentNode;
    }
    if (!linha) linha = alvo;

    const r = document.createRange();
    r.selectNodeContents(linha);
    r.setEnd(sel.anchorNode, sel.anchorOffset);

    const walker = document.createTreeWalker(
      r.cloneContents(), NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let out = '';
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (n.nodeType === Node.TEXT_NODE) out += n.nodeValue;
      else if (n.nodeName === 'BR') out += '\n';
    }
    // \u00a0 (espaço "duro") vira espaço normal; o tamanho continua o mesmo
    return out.replace(/\u00a0/g, ' ');
  }

  // Versão segura: devolve null se não houver cursor válido.
  function lerLinha(alvo) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !sel.anchorNode) return null;
    return textoDaLinhaAteCursor(alvo, sel);
  }

  // Nó de texto logo antes do cursor (e a posição dentro dele).
  function noDeTextoAntesDoCursor(sel) {
    const no = sel.anchorNode;
    const off = sel.anchorOffset;
    if (!no) return null;
    if (no.nodeType === Node.TEXT_NODE) return { no, off };

    let t = no.childNodes[off - 1];
    while (t && t.nodeType !== Node.TEXT_NODE) t = t.lastChild;
    return t ? { no: t, off: t.textContent.length } : null;
  }

  // Seleciona os últimos n caracteres antes do cursor (usado só no plano B).
  function selecionarTrecho(sel, n, esperado) {
    const pos = noDeTextoAntesDoCursor(sel);
    if (pos && pos.off >= n &&
        pos.no.textContent.slice(pos.off - n, pos.off).replace(/\u00a0/g, ' ') === esperado) {
      sel.setBaseAndExtent(pos.no, pos.off - n, pos.no, pos.off);
      return;
    }
    for (let i = 0; i < n; i++) sel.modify('extend', 'backward', 'character');
  }

  // Plano B: simula um "colar" no editor (o WhatsApp trata colar muito bem).
  function colar(alvo, texto) {
    const dt = new DataTransfer();
    dt.setData('text/plain', texto);
    alvo.dispatchEvent(new ClipboardEvent('paste', {
      clipboardData: dt, bubbles: true, cancelable: true,
    }));
  }

  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  const semQuebraFinal = (s) => s.replace(/\n+$/, '');
  let ocupado = false; // evita rodar duas vezes ao mesmo tempo

  // ---- utilitários de linha inteira (usados na conferência e no reparo) ----

  // Elemento da linha (P/DIV/LI) onde está o cursor.
  function linhaAtual(alvo) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !sel.anchorNode) return null;
    let linha = sel.anchorNode;
    while (linha && linha !== alvo &&
           !(linha.nodeType === 1 && /^(P|DIV|LI)$/.test(linha.tagName))) {
      linha = linha.parentNode;
    }
    return linha || alvo;
  }

  // Texto COMPLETO da linha (antes e depois do cursor). <br> conta como "\n".
  function textoCompleto(linha) {
    const walker = document.createTreeWalker(
      linha, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let out = '';
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (n.nodeType === Node.TEXT_NODE) out += n.nodeValue;
      else if (n.nodeName === 'BR') out += '\n';
    }
    return out.replace(/\u00a0/g, ' ');
  }

  // Coloca o cursor na posição "offset" do texto da linha.
  function colocarCursor(linha, offset) {
    const walker = document.createTreeWalker(
      linha, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let acc = 0;
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (n.nodeType === Node.TEXT_NODE) {
        const len = n.nodeValue.length;
        if (offset <= acc + len) {
          window.getSelection().collapse(n, offset - acc);
          return true;
        }
        acc += len;
      } else if (n.nodeName === 'BR') {
        acc += 1;
      }
    }
    return false;
  }

  // Se entre o prefixo e o resultado sobrou lixo (ex.: o ":" de abertura, ou o
  // trecho original quando o editor inseriu ao lado em vez de substituir),
  // apaga só esse lixo e devolve o cursor para depois do resultado.
  async function reparar(alvo, prefixo, resultado, resto, max) {
    const linha = linhaAtual(alvo);
    if (!linha) return false;
    const full = textoCompleto(linha);
    const fim = resultado + resto;
    if (!full.startsWith(prefixo) || !full.endsWith(fim)) return false;
    const extra = full.length - prefixo.length - fim.length;
    if (extra <= 0 || extra > max) return false; // 0 = já está certo
    log('sobra detectada:', JSON.stringify(full.slice(prefixo.length, prefixo.length + extra)));

    if (!colocarCursor(linha, prefixo.length + extra)) return false;
    await esperar(30);
    for (let i = 0; i < extra; i++) {
      document.execCommand('delete');
      await esperar(25);
    }
    const l2 = linhaAtual(alvo) || linha;
    colocarCursor(l2, prefixo.length + resultado.length);
    await esperar(30);
    log('sobra removida; linha agora:', JSON.stringify(textoCompleto(l2)));
    return true;
  }

  // Troca o trecho digitado pelo resultado.
  //
  // A) Seleciona o trecho, ESPERA o editor registrar a seleção e insere o
  //    resultado por cima (uma única operação, sem apagar letra por letra).
  //    O problema antigo de "entrar ao lado do original" vinha de inserir antes
  //    de o editor perceber a seleção; por isso a espera.
  // B) Se nada mudou, tenta simular um "colar" sobre a seleção.
  // C) Último recurso: apaga com backspace conferindo a linha a cada passo.
  // Depois de cada tentativa, confere a linha inteira e remove qualquer sobra.
  async function substituir(alvo, m, resultado, antes) {
    ocupado = true;
    try {
      const n = m[0].length;
      const prefixo = antes.slice(0, antes.length - n);

      const l0 = linhaAtual(alvo);
      const full0 = l0 ? textoCompleto(l0) : '';
      const resto = full0.startsWith(antes) ? full0.slice(antes.length) : '';
      const esperado = semQuebraFinal(prefixo + resultado + resto);
      log('linha antes:', JSON.stringify(full0), '| prefixo:', JSON.stringify(prefixo));

      const linhaOk = () => {
        const l = linhaAtual(alvo);
        return !!l && semQuebraFinal(textoCompleto(l)) === esperado;
      };
      const intacta = () => {
        const l = linhaAtual(alvo);
        return !!l && textoCompleto(l) === full0;
      };
      // confere e conserta (até 2 vezes, dando tempo para o editor assentar)
      const conferir = async () => {
        for (let i = 0; i < 2; i++) {
          if (linhaOk()) return true;
          await reparar(alvo, prefixo, resultado, resto, n);
          await esperar(120);
        }
        return linhaOk();
      };

      const sel = window.getSelection();

      // A) selecionar + inserir
      selecionarTrecho(sel, n, m[0]);
      await esperar(50);
      log('selecionado:', JSON.stringify(sel.toString()));
      document.execCommand('insertText', false, resultado);
      await esperar(80);
      if (await conferir()) { log('trocado (A)'); return; }

      // B) colar sobre a seleção
      if (intacta()) {
        log('A não mudou nada; tentando colar');
        selecionarTrecho(sel, n, m[0]);
        await esperar(50);
        colar(alvo, resultado);
        await esperar(80);
        if (await conferir()) { log('trocado (B)'); return; }
      }

      // C) apagar com backspace, conferindo a linha a cada passo
      if (intacta()) {
        log('B não mudou nada; tentando backspace');
        const alvoPrefixo = semQuebraFinal(prefixo);
        for (let i = 0; i < n + 6; i++) {
          const atual = lerLinha(alvo);
          if (atual === null) return;
          if (semQuebraFinal(atual) === alvoPrefixo) break;
          if (!atual.startsWith(prefixo)) break;
          document.execCommand('delete');
          await esperar(8);
        }
        document.execCommand('insertText', false, resultado);
        await esperar(80);
        if (await conferir()) { log('trocado (C)'); return; }
      }

      log('não consegui trocar. linha agora:',
          JSON.stringify(textoCompleto(linhaAtual(alvo) || alvo)));
    } finally {
      ocupado = false;
    }
  }

  function tratar() {
    if (ocupado) return;
    const alvo = document.activeElement;
    if (!alvo || !alvo.isContentEditable) return;

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !sel.isCollapsed || !sel.anchorNode) return;

    const antes = textoDaLinhaAteCursor(alvo, sel);
    if (!antes.endsWith(DELIMITADOR)) return;

    const m = antes.match(PADRAO);
    log('texto até o cursor:', JSON.stringify(antes));
    if (!m) return;

    const resultado = converte(m[1]);
    log(JSON.stringify(m[1]), '->', resultado);
    if (!resultado) return;

    substituir(alvo, m, resultado, antes);
  }

  // Único listener do script. Sai imediatamente se a tecla não for o delimitador.
  document.addEventListener('keyup', (e) => {
    if (!TECLAS.has(e.key)) return;
    setTimeout(tratar, 0);
  }, true);
})();
