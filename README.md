<div align="center">

# 📅 WhatsApp Dias

### Digite o dia da semana. Receba a data completa. Sem abrir calendário.

![Tampermonkey](https://img.shields.io/badge/Tampermonkey-userscript-00485B?style=for-the-badge&logo=tampermonkey&logoColor=white)
![WhatsApp Web](https://img.shields.io/badge/WhatsApp-Web-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Versão](https://img.shields.io/badge/versão-3.0-blue?style=for-the-badge)

</div>

---

## ✨ O que é

Um userscript para o **WhatsApp Web** que expande dias da semana e datas em texto formatado, direto na caixa de mensagem, enquanto você digita.

Chega de calcular de cabeça "quinta é dia quanto mesmo?" ao combinar reuniões, entregas e visitas.

## 🎬 Como funciona

Escreva o que quiser **entre dois-pontos**. Ao digitar o `:` de fechamento, o texto é substituído na hora.

| Você digita | Você recebe |
|---|---|
| `:terça:` | `terça-feira (10/11)` |
| `:terça, quarta, quinta:` | `terça-feira (10/11), quarta-feira (11/11) e quinta-feira (12/11)` |
| `:11/11:` | `quarta-feira (11/11)` |
| `:sexta, 16/11:` | `sexta-feira (06/11) e segunda-feira (16/11)` |
| `:ter qua qui:` | `terça-feira (10/11), quarta-feira (11/11) e quinta-feira (12/11)` |

> As datas acima usam como referência **quinta-feira, 05/11/2026**.

### 💬 Exemplo real: pedido de troca de dias

Ideal para combinar trocas de escala, folgas ou reposições, em que o que importa é o dia da semana ao lado de cada data.

**O que você digita:**

```
Trocar:
:06/11 e 09/11:
em virtude de:
:27/11 e 01/12:
```

**O que sai na mensagem:**

```
Trocar:
sexta-feira (06/11) e segunda-feira (09/11)
em virtude de:
sexta-feira (27/11) e terça-feira (01/12)
```

Cada bloco entre `:` é resolvido de forma independente, então dá para usar quantos quiser na mesma mensagem, misturados com texto normal.

## 🧠 Regras de interpretação

- **Dia da semana → próxima ocorrência.** O script procura o primeiro dia correspondente **a partir de amanhã**. Digitar `:quinta:` numa quinta devolve a quinta da semana seguinte.
- **Data → dia da semana correto.** `:11/11:` descobre sozinho que é quarta-feira.
- **Ano na saída:** com `INCLUIR_ANO = true`, o resultado vem como `terça-feira (10/11/2026)`.
- **Data sem ano que já passou** vira o ano seguinte.
- **Datas inválidas** (como `31/02`) são ignoradas.
- **Separadores aceitos:** vírgula, ponto e vírgula, espaço e a palavra "e".
- **Acentos e "-feira" são opcionais:** `terca`, `terça`, `terça-feira` e `ter` funcionam igual.
- **Texto não reconhecido não é alterado.** Escrever um horário como `10:30 às 11:45` não dispara nada.

### Nomes aceitos

| Dia | Formas aceitas |
|---|---|
| Segunda | `seg`, `segunda`, `segunda-feira` |
| Terça | `ter`, `terca`, `terça`, `terça-feira` |
| Quarta | `qua`, `quarta`, `quarta-feira` |
| Quinta | `qui`, `quinta`, `quinta-feira` |
| Sexta | `sex`, `sexta`, `sexta-feira` |
| Sábado | `sab`, `sabado`, `sábado` |
| Domingo | `dom`, `domingo` |

## 🚀 Instalação

### 1. Instale o Tampermonkey
Disponível na loja de extensões do **Chrome**, **Edge** e **Firefox**.

### 2. Libere a execução de scripts de usuário
Os navegadores baseados em Chromium bloqueiam userscripts por padrão.

1. Abra `edge://extensions` (ou `chrome://extensions`).
2. Clique em **Detalhes** no Tampermonkey.
3. Ative **Permitir Scripts de Usuário**.
   Se a opção não existir na sua versão, ative o **Modo do desenvolvedor** na página de extensões.

### 3. Adicione o script
1. Clique no ícone do Tampermonkey e em **Adicionar novo script...**
2. Apague o conteúdo padrão.
3. Cole o conteúdo de `whatsapp-dias.user.js`.
4. Salve com `Ctrl + S`.

### 4. Use
Recarregue o WhatsApp Web com `F5` e digite `:ter:` na caixa de mensagem. 🎉

> **Atualizando da versão anterior?** Abra o script no Tampermonkey, apague tudo, cole a versão 3.0 e salve.

## ⚙️ Configuração

No topo do arquivo `whatsapp-dias.user.js`:

```js
// false = "quinta" numa quinta devolve a quinta da semana que vem
// true  = "quinta" numa quinta devolve o próprio dia de hoje
const INCLUIR_HOJE = false;

// true  = terça-feira (10/11/2026)
// false = terça-feira (10/11)
const INCLUIR_ANO = false;

// Caractere que abre e fecha o trecho a ser convertido
const DELIMITADOR = ':';

// true = mostra no console (F12) o que o script entendeu
const DEBUG = false;
```

### Trocar o gatilho `:`
Basta mudar a constante `DELIMITADOR` (por exemplo, `'#'`). Isso é útil se o `:` conflitar com o seletor de emojis do WhatsApp, que também usa dois-pontos.

## 🌐 Funciona em outros sites?

**Hoje, só no WhatsApp Web.** O que limita é a linha `@match` no cabeçalho do script, que diz ao Tampermonkey em quais páginas ele pode rodar:

```js
// @match        https://web.whatsapp.com/*
```

A lógica em si é genérica e funciona em qualquer caixa de texto do tipo `contenteditable` (o tipo usado pelo WhatsApp, Gmail, Outlook web, Teams, Slack, etc.). Para liberar outro site, adicione mais uma linha `@match`:

```js
// @match        https://web.whatsapp.com/*
// @match        https://mail.google.com/*
```

Limitações:

- **Campos simples** (`<textarea>` e `<input>`, como a barra de busca ou comentários de muitos sites) **não são suportados**: o script só age em `contenteditable`.
- Cada site usa um editor diferente, então o comportamento pode variar e precisar de ajuste.
- Evite `@match *://*/*`: faria o script ser carregado em todas as páginas que você abrir.

## 🔧 Solução de problemas

| Sintoma | O que verificar |
|---|---|
| Nada acontece ao digitar `:ter:` | Aviso azul no menu do Tampermonkey? Ative **Permitir Scripts de Usuário** (passo 2) e recarregue a página |
| O script aparece como desativado | Clique no ícone do Tampermonkey e confirme que o script está com o botão ligado |
| Sobra um `:` na frente do resultado | Corrigido na 3.0. Se acontecer, atualize o script e recarregue o WhatsApp Web |
| Não troca quando a mensagem **começa** com `:` | Atualize para a versão mais recente. Se persistir, troque o `DELIMITADOR` ou ative o `DEBUG` e veja o console (F12) |
| Funcionava e parou | O WhatsApp Web atualizou o editor de texto. O script pode precisar de ajuste |
| `:ter:` virou algo inesperado | Confira o dia de hoje no computador: as datas são calculadas a partir dele |

## 🛠️ Como funciona por dentro

1. Escuta **um único evento**, o `keyup`, e sai na hora se a tecla solta não for o `:` (ou o `;`, que é como o teclado ABNT às vezes reporta o `:` quando o Shift é solto antes).
2. Quando for, lê o texto da linha antes do cursor na caixa de mensagem.
3. Procura o padrão `:conteúdo:` no final do texto.
4. Converte cada item para uma data, resolvendo dias da semana pela próxima ocorrência.
5. Apaga o trecho digitado **um caractere por vez, conferindo o texto da linha a cada passo**, até sobrar só o que estava antes dele. Depois digita o resultado com `document.execCommand('insertText')`, o que mantém o editor do WhatsApp consistente e o histórico de desfazer (`Ctrl + Z`) funcionando.
6. Se algo sobrar e não sair, usa um plano B que seleciona o resto e simula um "colar".

Nenhum dado sai do seu navegador. O script não faz requisições de rede nem armazena nada.

### ⚡ Desempenho

A partir da versão 3.0 o script é bem mais leve:

- Não reage mais a **qualquer tecla solta**. O listener descarta imediatamente tudo que não seja o delimitador.
- O listener de `input` (reserva) foi **removido**.
- Não há observadores de DOM, temporizadores contínuos nem laços em segundo plano. O script só trabalha por alguns milissegundos quando você digita o `:`.

## 📜 Histórico

| Versão | Mudanças |
|---|---|
| **3.0** | Corrigido o `:` que sobrava na frente do resultado. Removidos o monitoramento de qualquer tecla e o listener de `input`. Apagar o trecho agora confere o texto a cada passo. |
| 1.6 | Troca por "backspace" em vez de seleção; plano B com colar; suporte a teclado ABNT. |
| 1.0 | Primeira versão. |

## 📁 Arquivos

```
.
├── whatsapp-dias.user.js   # o userscript
└── README.md               # este arquivo
```

## ⚠️ Observações

- O WhatsApp Web é atualizado com frequência. Mudanças no editor de texto podem exigir ajustes no script.
- Este é um projeto pessoal, sem qualquer vínculo com o WhatsApp ou a Meta.

---

<div align="center">

Feito para economizar uns segundos em cada mensagem. ⏱️

</div>
