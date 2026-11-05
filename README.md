<div align="center">

# 📅 WhatsApp Dias

### Digite o dia da semana. Receba a data completa. Sem abrir calendário.

![Tampermonkey](https://img.shields.io/badge/Tampermonkey-userscript-00485B?style=for-the-badge&logo=tampermonkey&logoColor=white)
![WhatsApp Web](https://img.shields.io/badge/WhatsApp-Web-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Versão](https://img.shields.io/badge/versão-1.1-blue?style=for-the-badge)

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

## 🧠 Regras de interpretação

- **Dia da semana → próxima ocorrência.** O script procura o primeiro dia correspondente **a partir de amanhã**. Digitar `:quinta:` numa quinta devolve a quinta da semana seguinte.
- **Data → dia da semana correto.** `:11/11:` descobre sozinho que é quarta-feira.
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

## ⚙️ Configuração

No topo do arquivo `whatsapp-dias.user.js`:

```js
// false = "quinta" numa quinta devolve a quinta da semana que vem
// true  = "quinta" numa quinta devolve o próprio dia de hoje
const INCLUIR_HOJE = false;
```

### Trocar o gatilho `:`
O delimitador pode ser trocado por outro caractere (`;`, `/`, `#`...). É preciso alterar três pontos no código:

- a checagem `ev.key !== ':'` no listener de `keyup`
- a checagem `ev.data === ':'` no listener de `input`
- a expressão regular em `tratar()`, que procura `:...:` no final do texto

## 🔧 Solução de problemas

| Sintoma | O que verificar |
|---|---|
| Nada acontece ao digitar `:ter:` | Aviso azul no menu do Tampermonkey? Ative **Permitir Scripts de Usuário** (passo 2) e recarregue a página |
| O script aparece como desativado | Clique no ícone do Tampermonkey e confirme que o script está com o botão ligado |
| Funcionava e parou | O WhatsApp Web atualizou o editor de texto. O script pode precisar de ajuste |
| `:ter:` virou algo inesperado | Confira o dia de hoje no computador: as datas são calculadas a partir dele |

## 🛠️ Como funciona por dentro

1. Escuta o evento `keyup` (e `input` como reserva) em toda a página.
2. Quando o caractere digitado é `:`, lê o texto antes do cursor na caixa de mensagem.
3. Procura o padrão `:conteúdo:` no final do texto.
4. Converte cada item para uma data, resolvendo dias da semana pela próxima ocorrência.
5. Seleciona o trecho digitado e o substitui com `document.execCommand('insertText')`, o que mantém o editor do WhatsApp consistente e o histórico de desfazer (`Ctrl + Z`) funcionando.

Nenhum dado sai do seu navegador. O script não faz requisições de rede nem armazena nada.

## 📁 Arquivos

```
.
├── expandor-day.js   # o userscript
└── README.md         # este arquivo
```

## ⚠️ Observações

- O WhatsApp Web é atualizado com frequência. Mudanças no editor de texto podem exigir ajustes no script.
- Este é um projeto pessoal, sem qualquer vínculo com o WhatsApp ou a Meta.

---

<div align="center">

Feito para economizar uns segundos em cada mensagem. ⏱️

</div>
