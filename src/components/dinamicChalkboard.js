//ATENÇÃO, A FUNÇÃO COPIAR NÃO ESTÁ FUNCIONANDO COMO DEVERIA/EM TODAS AS SITUAÇÕES, AINDA SENDO ANALIZADO
//Exemplo no final do Script de um código que funciona e outro que não funciona

/**
 * QuadroDinamico Web Component with drag, resize,
 * gradientes animados, neon opcional, efeitos de alerta,
 * hover-opacity, fixação, botões de minimizar e copiar.
 */
class QuadroDinamico extends HTMLElement {
  static get observedAttributes() {
    return [
      'width', 'height', 'background', 'border-color',
      'color', 'font-size', 'font-family',
      'top', 'left', 'transition', 'wrap-text',
      'gradient-start', 'gradient-end', 'gradient-angle',
      'gradient-speed', 'shimmer-intensity',
      'neon', 'neon-color', 'neon-blink-speed',
      'fixo', 'minimizavel', 'hover-opacity', 'alerta', 'copiar-conteudo',
      'movable', 'resizable', 'vibrar',
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._initTemplate();
    if (!this.hasAttribute('fixo')) {
      if (this.hasAttribute('movable')) this._enableDrag();
      if (this.hasAttribute('resizable')) this._enableResize();
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    const quadro = this.shadowRoot.querySelector('.quadro');

    switch (name) {
case 'wrap-text':
  this.shadowRoot.querySelector('.content')
    .style.whiteSpace = this.hasAttribute('wrap-text') ? 'pre-wrap' : 'pre';
  break;
      case 'fixo':
      case 'hover-opacity':
      case 'alerta':
        quadro.classList.toggle(name, this.hasAttribute(name));
        break;
      case 'minimizavel':
      case 'copiar-conteudo':
        this._setupActionButtons();
        break;
      case 'transition':
        quadro.style.transition = newVal;
        break;
      case 'width':
      case 'height':
      case 'top':
      case 'left':
      case 'background':
      case 'border-color':
      case 'color':
      case 'font-size':
      case 'font-family':
      case 'gradient-start':
      case 'gradient-end':
      case 'gradient-angle':
      case 'gradient-speed':
      case 'shimmer-intensity':
      case 'neon-color':
      case 'neon-blink-speed':
        this.style.setProperty(`--qd-${name}`, newVal);
        break;
    }

    quadro.classList.toggle('shimmer', this.hasAttribute('gradient-speed'));
    this.shadowRoot.querySelector('.header').classList
      .toggle('neon', this.hasAttribute('neon'));
  }

  _setupActionButtons() {
    const actionsContainer = this.shadowRoot.querySelector('.actions');
    actionsContainer.innerHTML = '';

    if (this.hasAttribute('minimizavel')) {
      const btnMin = document.createElement('button');
      btnMin.className = 'action-btn';
      btnMin.innerHTML = '🗕';
      btnMin.title = 'Minimizar';
      btnMin.onclick = () => this._toggleMinimizado(btnMin);
      actionsContainer.appendChild(btnMin);
    }

if (this.hasAttribute('copiar-conteudo')) {
  const btnCopy = document.createElement('button');
  btnCopy.className = 'action-btn';
  btnCopy.innerHTML = '📋';
  btnCopy.title = 'Copiar conteúdo';
btnCopy.onclick = async () => {
  try {
    // Pega o slot que está exibindo o conteúdo do quadro
    const slot = this.shadowRoot.querySelector('.content slot');
    let textToCopy = '';

    // Pega todos os nós atribuídos ao slot (tudo o que está DENTRO do componente, exceto slots nomeados)
    const nodes = slot.assignedNodes({ flatten: true }).filter(n =>
    n.nodeType !== Node.TEXT_NODE || n.textContent.trim() !== ''
    );

    // Monta o texto exatamente como está renderizado (com quebra de linha para <br>, <div>, <li>, etc)
    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        textToCopy += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (['BR', 'DIV', 'P', 'LI'].includes(node.tagName)) {
          textToCopy += '\n';
        }
        textToCopy += node.innerText || node.textContent || '';
        if (['DIV', 'P', 'LI'].includes(node.tagName)) {
          textToCopy += '\n';
        }
      }
    }

    // Remove múltiplas quebras de linha e espaços em branco extras
    textToCopy = textToCopy.replace(/[ \t]+\n/g, '\n').replace(/\n{2,}/g, '\n').trim();

    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      btnCopy.innerText = '✅';
      setTimeout(() => btnCopy.innerText = '📋', 1500);
    } else {
      btnCopy.innerText = '❌';
      setTimeout(() => btnCopy.innerText = '📋', 1500);
    }
  } catch (err) {
    btnCopy.innerText = '❌';
    setTimeout(() => btnCopy.innerText = '📋', 1500);
  }
};
  actionsContainer.appendChild(btnCopy);
}}

  _toggleMinimizado(btn) {
    const quadro = this.shadowRoot.querySelector('.quadro');
    const isMin = quadro.classList.toggle('minimizado');
    btn.innerHTML = isMin ? '🗖' : '🗕';
  }

  _initTemplate() {
    const tpl = document.createElement('template');
    tpl.innerHTML = `
      <style>
        :host {
          --qd-width: ${this.getAttribute('width') || '300px'};
          --qd-height: ${this.getAttribute('height') || '150px'};
          --qd-bg: ${this.getAttribute('background') || '#6b7b34'};
          --qd-border: ${this.getAttribute('border-color') || '#333'};
          --qd-color: ${this.getAttribute('color') || '#fff'};
          --qd-font-size: ${this.getAttribute('font-size') || '16px'};
          --qd-font-family: ${this.getAttribute('font-family') || 'Arial, sans-serif'};
          --qd-top: ${this.getAttribute('top') || '0px'};
          --qd-left: ${this.getAttribute('left') || '0px'};
          --qd-gradient-start: ${this.getAttribute('gradient-start') || this.getAttribute('background') || '#6b7b34'};
          --qd-gradient-end: ${this.getAttribute('gradient-end') || this.getAttribute('background') || '#4a5a20'};
          --qd-gradient-angle: ${this.getAttribute('gradient-angle') || '90deg'};
          --qd-gradient-speed: ${this.getAttribute('gradient-speed') || '5s'};
          --qd-shimmer-intensity: ${this.getAttribute('shimmer-intensity') || '0.2'};
          --qd-neon-color: ${this.getAttribute('neon-color') || '#0ff'};
          --qd-neon-blink-speed: ${this.getAttribute('neon-blink-speed') || '1.5s'};
          display: inline-block;
          position: ${this.hasAttribute('movable') ? 'absolute' : 'static'};
          top: var(--qd-top);
          left: var(--qd-left);
          will-change: transform;
        }

        .quadro {
          box-sizing: border-box;
          width: var(--qd-width);
          height: var(--qd-height);
          background: linear-gradient(
            var(--qd-gradient-angle),
            var(--qd-gradient-start),
            var(--qd-gradient-end)
          );
          background-size: 100% 100%;
          color: var(--qd-color);
          font-size: var(--qd-font-size);
          font-family: var(--qd-font-family);
          border: 2px solid var(--qd-border);
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          position: relative;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

.quadro.vibrar {
  animation: vibrar 0.2s ease-in-out infinite;
}
    @keyframes vibrar {
      0% { transform: translate(0); }
      25% { transform: translate(-1px, 1px); }
      50% { transform: translate(1px, -1px); }
      75% { transform: translate(-1px, -1px); }
      100% { transform: translate(0); }
    }

        .quadro.shimmer {
          background: linear-gradient(
            90deg,
            var(--qd-gradient-start) 0%,
            var(--qd-gradient-end) calc(50% - var(--qd-shimmer-intensity)*100%),
            rgba(255,255,255,var(--qd-shimmer-intensity)) 50%,
            var(--qd-gradient-end) calc(50% + var(--qd-shimmer-intensity)*100%),
            var(--qd-gradient-start) 100%
          );
          background-size: 200% 100%;
          animation: shimmer var(--qd-gradient-speed) infinite;
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .quadro.fixo {
          pointer-events: auto;
        }
        .quadro.hover-opacity {
          opacity: 0.4;
          transition: opacity 0.4s ease;
        }
        .quadro.hover-opacity:hover {
          opacity: 1;
        }
        .quadro.alerta {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0px rgba(255, 0, 0, 0.5); }
          50% { box-shadow: 0 0 12px rgba(255, 0, 0, 0.7); }
        }

        .quadro.minimizado .content,
        .quadro.minimizado .resizer {
          display: none;
        }

        .header {
          background: rgba(255, 255, 255, 0.15);
          padding: 4px 10px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          border-radius: 8px 8px 0 0;
          font-weight: 600;
          font-size: 15px;
          color: var(--qd-color);
          cursor: ${this.hasAttribute('movable') ? 'grab' : 'default'};
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header:active { cursor: grabbing; }
        .header.neon ::slotted(*) {
          text-shadow:
            0 0 4px var(--qd-neon-color),
            0 0 8px var(--qd-neon-color),
            0 0 16px var(--qd-neon-color);
          animation: neon-blink var(--qd-neon-blink-speed) infinite;
        }
        @keyframes neon-blink {
          0%,50%,100% { opacity: 1; }
          25%,75%     { opacity: 0.6; }
        }

          .content {
          padding: 4px 10px;
          flex: 1;
          overflow-y: center;
          overflow-x: hidden;
          white-space: pre;
          line-height: 1.5;
          font-weight: 400;
          display: flex;
          align-items: top;
          justify-content: space-between;
        }

        .content slot {
          display: contents;
        }

        .content::before,
        .content::after {
          content: none !important;
          display: none !important;
        }
        .resizer {
          position: absolute;
          width: 20px;
          height: 20px;
          bottom: 4px;
          right: 4px;
          cursor: se-resize;
          user-select: none;
          pointer-events: all;
          z-index: 10;
          background: rgba(255,255,255,0.3);
          border: 1px solid var(--qd-border);
          border-radius: 4px;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          padding: 2px;
        }
        .resizer::before {
          content: '↘';
          font-size: 12px;
          color: var(--qd-border);
        }

        button.action-btn {
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 16px;
          margin-left: 6px;
        }
      </style>

      <div class="quadro" role="region" tabindex="0" aria-label="Quadro didático">
        <div class="header">
          <slot name="title"><strong>Quadro</strong></slot>
          <div class="actions"><slot name="actions"></slot></div>
        </div>
        <div class="content"><slot></slot></div>
        <div class="resizer"></div>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    
    const quadro = this.shadowRoot.querySelector('.quadro');
    if (this.hasAttribute('fixo')) quadro.classList.add('fixo');
    if (this.hasAttribute('hover-opacity')) quadro.classList.add('hover-opacity');
    if (this.hasAttribute('alerta')) quadro.classList.add('alerta');
    this._setupActionButtons();

        // Vibração configurável via atributo "vibrar" (em ms)
    const vibrarAttr = this.getAttribute('vibrar');
if (vibrarAttr) {
  const [durStr, freqStr] = vibrarAttr.split(',').map(s => parseInt(s.trim()));
  const vibrarDur = isNaN(durStr) ? 700 : durStr;
  const vibrarFreq = isNaN(freqStr) ? 10000 : freqStr;

  if (vibrarFreq > 0 && vibrarDur > 0 && vibrarDur < vibrarFreq) {
    setInterval(() => {
      const quadro = this.shadowRoot.querySelector('.quadro');
      if (quadro && !quadro.classList.contains('minimizado')) {
        quadro.classList.add('vibrar');
        setTimeout(() => quadro.classList.remove('vibrar'), vibrarDur);
      }
    }, vibrarFreq);
  }
}

    // Ajusta white-space inicial de acordo com atributo wrap-text
    this.shadowRoot.querySelector('.content').style.whiteSpace = this.hasAttribute('wrap-text') ? 'pre-wrap' : 'pre';
  }

  _enableDrag() {
    const header = this.shadowRoot.querySelector('.header');
    let startX, startY, origX, origY, dx = 0, dy = 0, raf;
    const apply = () => {
      this.style.transform = `translate(${dx}px,${dy}px)`;
      raf = null;
    };
    header.addEventListener('pointerdown', e => {
      e.preventDefault();
      header.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      const r = this.getBoundingClientRect();
      origX = r.left;
      origY = r.top;
      dx = dy = 0;

      const onMove = e => {
        e.preventDefault();
        dx = e.clientX - startX;
        dy = e.clientY - startY;
        if (!raf) raf = requestAnimationFrame(apply);
      };

      const onUp = () => {
        header.releasePointerCapture(e.pointerId);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        if (raf) { cancelAnimationFrame(raf); apply(); }
        this.style.transform = '';
        this.style.left = `${origX + dx}px`;
        this.style.top = `${origY + dy}px`;
        this.style.setProperty('--qd-left', `${origX + dx}px`);
        this.style.setProperty('--qd-top', `${origY + dy}px`);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    });
  }

  _enableResize() {
    const quad = this.shadowRoot.querySelector('.quadro');
    const resizer = this.shadowRoot.querySelector('.resizer');
    let startX, startY, startW, startH;
    let newW, newH;
    let raf;

    resizer.addEventListener('pointerdown', e => {
      e.preventDefault();
      resizer.setPointerCapture(e.pointerId);
      const r = quad.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startW = r.width;
      startH = r.height;

      const onMove = e => {
        e.preventDefault();
        newW = startW + (e.clientX - startX);
        newH = startH + (e.clientY - startY);
        if (!raf) {
          raf = requestAnimationFrame(() => {
            quad.style.width = newW + 'px';
            quad.style.height = newH + 'px';
            raf = null;
          });
        }
      };

      const onUp = () => {
        resizer.releasePointerCapture(e.pointerId);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        if (raf) cancelAnimationFrame(raf);
        this.style.setProperty('--qd-width', newW + 'px');
        this.style.setProperty('--qd-height', newH + 'px');
        quad.style.width = '';
        quad.style.height = '';
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    });
  }
}

customElements.define('quadro-dinamico', QuadroDinamico);


/**
 * =============================
 *  QUADRODINAMICO WEB COMPONENT
 * =============================
 *
 * Descrição:
 * Este componente HTML customizado cria um "quadro dinâmico" visual e interativo,
 * utilizado para exibir textos com estilo, podendo ser movido, redimensionado,
 * minimizado, copiado, animado e muito mais — tudo via atributos declarativos.
 *
 * Funcionalidades:
 * - Movimentação (drag): usando atributo `movable`
 * - Redimensionamento (resize): usando atributo `resizable`
 * - Gradiente estático entre duas cores
 * - Animação shimmer com velocidade e intensidade personalizáveis
 * - Letreiro neon piscante com cor e velocidade
 * - Fixação de posição e tamanho (desativa drag e resize)
 * - Efeito visual de alerta com borda pulsante
 * - Modo opaco por padrão com transição ao passar o mouse
 * - Botão de minimizar/restaurar a janela
 * - Botão de copiar conteúdo do quadro
 * - Totalmente configurável via atributos HTML
 *
 * Atributos Suportados:
 * ----------------------------------------------------------------------------
 * | Atributo             | Função                                             |
 * |----------------------|---------------------------------------------------|
 * | width                | largura do quadro (ex: "300px")                   |
 * | height               | altura do quadro (ex: "150px")                    |
 * | background           | cor de fundo (hex, nome, etc.)                   |
 * | border-color         | cor da borda                                     |
 * | color                | cor do texto                                     |
 * | font-size            | tamanho da fonte (ex: "16px")                    |
 * | font-family          | fonte (ex: "Arial", "Courier New", etc.)         |
 * | top / left           | posição do componente na tela                    |
 * | wrap-text            | permite quebra de linha automática               |
 * | transition           | tempo de transição CSS personalizado             |
 * | gradient-start/end   | define as cores do gradiente                     |
 * | gradient-angle       | direção do gradiente (ex: "90deg", "135deg")     |
 * | gradient-speed       | ativa shimmer animado (ex: "6s")                 |
 * | shimmer-intensity    | intensidade do brilho shimmer (0 a 1)            |
 * | neon                 | ativa efeito neon brilhante                      |
 * | neon-color           | cor do neon (ex: "#00ffff", "#f0f")              |
 * | neon-blink-speed     | velocidade da animação neon (ex: "1.2s")         |
 * | fixo                 | fixa o quadro na posição e desativa drag/resize  |
 * | hover-opacity        | torna o quadro opaco até o mouse passar por cima |
 * | alerta               | anima a borda com efeito pulsante (modo alerta)  |
 * | minimizavel          | adiciona botão de minimizar/restaurar            |
 * | copiar-conteudo      | adiciona botão de cópia rápida do conteúdo       |
 * | vibrar               | define vibração periódica: `"duração,intervalo"` em ms (ex: `"5000,10000"`) = vibra a caixa de texto por 5seg a cada 10seg |
 *
 * Slots HTML:
 * ----------------------------------------------------------------------------
 * - <slot name="title"> ... </slot>
 *      → Define o título do quadro, visível no topo
 *
 * - <slot name="actions"> ... </slot>
 *      → Espaço reservado no canto superior direito (ações customizadas)
 *      → Também será usado internamente para botões de minimizar/copiar
 *
 * - <slot> ... </slot>
 *      → Conteúdo principal do quadro (qualquer HTML ou texto)
 * 
 * ===========================
 * EXEMPLOS DE USO
 * ===========================
 */

/* 1. USO TRADICIONAL E SIMPLES 7/10 
<quadro-dinamico
  width="300px"
  height="180px"
  background="#556B2F"
  color="#fff"
  wrap-text
  movable
  resizable
  top="60px"
  left="100px"
>
  <span slot="title">Notas Importantes</span>
  Olá! Este é um quadro simples com fundo verde-oliva.
  Pode ser movido e redimensionado livremente.
</quadro-dinamico>
*/

/* 2. MODO ROBUSTO E ESTILIZADO (UI suave lilás) 6/10
<quadro-dinamico
  width="370px"
  height="210px"
  gradient-start="#e6d7f4"
  gradient-end="#f5f0fb"
  gradient-angle="140deg"
  border-color="#a87ec9"
  color="#3e2a4f"
  font-size="15px"
  font-family="'Segoe UI', sans-serif"
  wrap-text
  movable
  resizable
  top="90px"
  left="400px"
>
  <span slot="title" style="font-weight: 600; letter-spacing: 0.5px;">📋 Resumo Diário</span>
  <ul style="padding-left: 20px; margin: 8px 0;">
    <li>Cliente X confirmou a entrega</li>
    <li>Reunião às 14h com diretoria</li>
    <li>Atualização de sistema concluída</li>
  </ul>
</quadro-dinamico>
*/

/* 3. MODO Iluminado (fundo animado, neon, brilho, UI extravagante) 5/10
<quadro-dinamico
  width="400px"
  height="240px"
  gradient-start="rgba(255, 182, 193, 0.25)"
  gradient-end="rgba(186, 85, 211, 0.22)"
  gradient-angle="145deg"
  gradient-speed="14s"
  shimmer-intensity="0.03"
  neon
  neon-color="#afffff"
  neon-blink-speed="2s"
  color="#ffffff"
  font-size="16px"
  font-family="'Courier New', monospace"
  wrap-text
  movable
  resizable
  top="120px"
  left="720px"
>
  <span slot="title" style="
    font-weight: 800;
    text-shadow: 
      0 0 2px #fff,
      0 0 4px #afffff,
      0 0 8px #66ccff;
  ">🎇 Notas Luminosas</span>

  <div style="
    font-weight: bold;
    text-shadow: 
      0 0 2px #fff,
      0 0 4px #afffff,
      0 0 8px #66ccff;
  ">
    Um toque de brilho como reflexo lunar na água.<br />
    🌙 Elegância sutil e presença sem exagero.
  </div>
</quadro-dinamico>
*/

/* 4. MODO Alerta (treme a cada 8seg, fundo preto) 7/10
<quadro-dinamico
  width="360px"
  height="200px"
  gradient-start="#1e1e1e"
  gradient-end="#3a3a3a"
  gradient-angle="125deg"
  color="#f8f8f8"
  font-weight="500"
  font-family="Segoe UI, sans-serif"
  wrap-text
  pinned
  lock-position
  auto-hide="8000"
  transparent="0.4"
  movable
  resizable
  top="80px"
  left="400px"
  vibrar="1000,8000"

>
  <span slot="title" style="
    font-weight: 700;
    text-shadow: 0 0 2px #000;
  ">🔔 ALERTA 🔔</span>

  <div style="
    font-weight: 500;
    text-shadow: 0 0 2px rgba(0,0,0,0.5);
  ">
    Atenção! A cada 8 segundos essa mensagem, tremerá por 1segundo.
  </div>
</quadro-dinamico>
*/

// MAIS MODELOS DE JANELAS PRE DEFINIDAS - TEMÁTICOS

/* 5. TEMA Oceânico – “Notas da Maré”
<quadro-dinamico
  width="350px"
  height="190px"
  gradient-start="rgba(0, 188, 212, 0.9)"  
  gradient-end="rgba(0, 131, 143, 0.85)"   
  gradient-angle="90deg"
  shimmer-intensity="0.05"            
  gradient-speed="16s"               
  color="#e0f7fa"
  font-family="Trebuchet MS"
  wrap-text
  movable
  resizable
  top="160px"
  left="500px"
>
  <span slot="title">🌊 Diário de Bordo</span>
  As ondas trazem memórias e ideias frescas.  
  Anote o que vier com a corrente.
</quadro-dinamico>
*/

/* 6. O Guia do Mochileiro das Galáxias 8/10
<quadro-dinamico
  width="380px"
  height="240px"
  gradient-start="#0f0c29"
  gradient-end="#302b63"
  gradient-angle="135deg"
  shimmer-intensity="0.035"
  gradient-speed="16s"
  neon
  neon-color="#66e0ff"
  neon-blink-speed="2.5s"
  vibrar="4000,12000"
  color="#e6faff"
  font-size="15.5px"
  font-family="Orbitron, sans-serif"
  wrap-text
  movable
  resizable
  top="200px"
  left="880px"
  copiar-conteudo
  minimizavel
>
  <span slot="title">🌌 Galáxia Pessoal</span>
  <div style="padding-top: 6px; text-shadow: 0 0 2px #66e0ff, 0 0 4px #1bc9f4;">
    Um homem preparado encara qualquer cosmos.<br>
    <strong>Confie na sua jornada.</strong><br>
    <span style="opacity: 0.85;">
      Respire fundo e observe o universo<br>se expandir lentamente. 🚀🪐
    </span>
  </div>
</quadro-dinamico>

<script>
(() => {
  const retry = () => {
    const qd = document.querySelector('quadro-dinamico');
    if (!qd?.shadowRoot) return requestAnimationFrame(retry);

    const host = qd.shadowRoot.querySelector('.quadro');
    if (!host) return requestAnimationFrame(retry);

    // Evita múltiplos canvas (se recarregar script)
    if (host.querySelector('canvas#stars')) return;

    // CANVAS ESTELAR
    const canvas = document.createElement('canvas');
    canvas.id = 'stars';
    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0',
      zIndex: '0',
      borderRadius: '8px',
      pointerEvents: 'none',
      transition: 'filter 1s'
    });
    host.prepend(canvas);

    // Overlay escurecedor para a nave mãe
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'absolute',
      inset: '0',
      zIndex: '2',
      background: 'rgba(25,28,52,0)',
      borderRadius: '8px',
      pointerEvents: 'none',
      transition: 'background 1.5s'
    });
    host.prepend(overlay);

    // Texto flutuante "NÃO ENTRE EM PÂNICO"
    const msg = document.createElement('div');
    msg.textContent = 'NÃO ENTRE EM PÂNICO';
    Object.assign(msg.style, {
      position: 'absolute',
      left: '0', top: '0',
      fontSize: '22px',
      fontWeight: 'bold',
      fontFamily: 'Orbitron, sans-serif',
      color: '#ffe55d',
      textShadow: '0 0 10px #ffc600,0 0 24px #ffe300, 0 0 42px #ffff88',
      opacity: '0',
      pointerEvents: 'none',
      zIndex: '1',
      transition: 'opacity 2s',
      userSelect: 'none',
      letterSpacing: '2px'
    });
    host.prepend(msg);

    // Nave mãe SVG
    const nave = document.createElement('div');
    nave.innerHTML = `<svg width="120" height="38" viewBox="0 0 120 38" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="19" rx="58" ry="13" fill="#7cf" opacity="0.90"/>
      <ellipse cx="60" cy="25" rx="43" ry="7" fill="#1a2469" opacity="0.5"/>
      <ellipse cx="60" cy="17" rx="38" ry="8" fill="#fff" opacity="0.15"/>
      <rect x="20" y="15" width="80" height="7" rx="2" fill="#222a4b" opacity="0.55"/>
      <ellipse cx="60" cy="18" rx="38" ry="6" fill="#ccc" opacity="0.10"/>
      <ellipse cx="60" cy="16" rx="20" ry="4" fill="#fff" opacity="0.10"/>
    </svg>`;
    Object.assign(nave.style, {
      position: 'absolute',
      left: '-140px',
      top: '42%',
      zIndex: '3',
      opacity: '0',
      pointerEvents: 'none',
      transition: 'opacity 1.5s'
    });
    host.prepend(nave);

    // CONTEXTO DO CANVAS
    const ctx = canvas.getContext('2d');
    let width = canvas.width = host.clientWidth;
    let height = canvas.height = host.clientHeight;

    // Estrelas (3 camadas)
    const stars = [];
    const LAYERS = [
      { amount: 28, speed: 0.12, size: [0.6, 1.2], alpha: [0.16, 0.36] },
      { amount: 24, speed: 0.22, size: [1, 1.7], alpha: [0.2, 0.44] },
      { amount: 16, speed: 0.36, size: [1.5, 2.2], alpha: [0.3, 0.6] },
    ];
    for (const layer of LAYERS) {
      for (let i = 0; i < layer.amount; ++i) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * (layer.size[1] - layer.size[0]) + layer.size[0],
          a: Math.random() * (layer.alpha[1] - layer.alpha[0]) + layer.alpha[0],
          dx: (Math.random() - 0.5) * layer.speed,
          dy: (Math.random() - 0.5) * layer.speed,
          z: layer.speed,
        });
      }
    }

    // Asteroides (3, sutis)
    const asts = Array.from({ length: 3 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 4 + 4,
      dx: (Math.random() < 0.5 ? -1 : 1) * (0.13 + Math.random() * 0.11),
      dy: (Math.random() < 0.5 ? -1 : 1) * (0.07 + Math.random() * 0.09),
      a: 0.18 + Math.random() * 0.16,
      rot: Math.random() * 360
    }));

    // Parallax mouse
    let mouseX = width / 2, mouseY = height / 2;
    host.addEventListener('mousemove', e => {
      const rect = host.getBoundingClientRect();
      mouseX = (e.clientX - rect.left);
      mouseY = (e.clientY - rect.top);
    });

    // Efeito respiração sincronizado com vibrar (expansão/retração leve)
    let vibrarIntervals = (qd.getAttribute('vibrar') || '4000,12000').split(',').map(n => parseInt(n.trim()));
    let vibrarMin = vibrarIntervals[0] || 4000;
    let vibrarMax = vibrarIntervals[1] || 12000;
    let nextVibrarTime = Date.now() + vibrarMin;
    let respiracaoExpansao = true;

    function respira() {
      const scaleMin = 1;
      const scaleMax = 1.04;
      const dur = 1200; // duração da respiração (expande e retrai)
      let startTime = Date.now();

      function anim() {
        let now = Date.now();
        let elapsed = now - startTime;
        if (elapsed > dur) {
          // alterna expansão/retração
          respiracaoExpansao = !respiracaoExpansao;
          startTime = now;
          if (Date.now() > nextVibrarTime) {
            nextVibrarTime = Date.now() + (Math.random() * (vibrarMax - vibrarMin) + vibrarMin);
          }
          return;
        }
        let progress = elapsed / dur;
        if (!respiracaoExpansao) progress = 1 - progress;

        // escala entre min e max
        const scale = scaleMin + (scaleMax - scaleMin) * progress;
        host.style.transform = `scale(${scale})`;
        requestAnimationFrame(anim);
      }
      anim();
    }
    respira();

    // ANIMAÇÃO PRINCIPAL
    let overlayAlpha = 0;
    let naveAtiva = false;

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Estrelas com parallax
      for (const s of stars) {
        const px = ((mouseX - width / 2) * s.z * 0.17);
        const py = ((mouseY - height / 2) * s.z * 0.11);
        s.x += s.dx * s.z;
        s.y += s.dy * s.z;

        // Rebote elástico
        if (s.x < 0) { s.x = 0; s.dx = Math.abs(s.dx) * 0.91; }
        if (s.x > width) { s.x = width; s.dx = -Math.abs(s.dx) * 0.91; }
        if (s.y < 0) { s.y = 0; s.dy = Math.abs(s.dy) * 0.91; }
        if (s.y > height) { s.y = height; s.dy = -Math.abs(s.dy) * 0.91; }

        ctx.save();
        ctx.globalAlpha = s.a;
        ctx.beginPath();
        ctx.arc(s.x + px, s.y + py, s.r, 0, 2 * Math.PI);
        ctx.fillStyle = '#e6faff';
        ctx.shadowColor = '#e6faff';
        ctx.shadowBlur = 2 + 2 * s.z;
        ctx.fill();
        ctx.restore();
      }

      // Asteroides
      for (const a of asts) {
        a.x += a.dx * 0.96;
        a.y += a.dy * 0.96;
        a.rot += 0.011 + Math.abs(a.dx) * 0.04;
        // Rebote elástico
        if (a.x < -a.r) { a.x = -a.r; a.dx *= -0.82; }
        if (a.x > width + a.r) { a.x = width + a.r; a.dx *= -0.82; }
        if (a.y < -a.r) { a.y = -a.r; a.dy *= -0.82; }
        if (a.y > height + a.r) { a.y = height + a.r; a.dy *= -0.82; }

        ctx.save();
        ctx.globalAlpha = a.a;
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rot);
        ctx.beginPath();
        for (let t = 0; t < 2 * Math.PI; t += Math.PI / 3) {
          const rr = a.r * (0.96 + Math.random() * 0.1);
          ctx.lineTo(Math.cos(t) * rr, Math.sin(t) * rr);
        }
        ctx.closePath();
        ctx.fillStyle = '#5cf4';
        ctx.shadowColor = '#1a8';
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.restore();
      }

      // Atualiza overlay da nave mãe
      overlay.style.background = `rgba(16,16,44,${overlayAlpha})`;

      requestAnimationFrame(animate);
    }
    animate();

    // RESIZE OBSERVER para redimensionar o canvas junto com o quadro
    function resizeCanvas() {
      width = canvas.width = host.clientWidth;
      height = canvas.height = host.clientHeight;
    }
    let resizeObs = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObs.observe(host);

    // FUNÇÕES DO TEXTO FLUTUANTE "NÃO ENTRE EM PÂNICO"
    function randomFloat(min, max) {
      return Math.random() * (max - min) + min;
    }
    let lastTextX = 0, lastTextY = 0;
    function showFloatingText() {
      // Frequência raríssima: de 50s a 110s
      msg.style.opacity = '0';
      setTimeout(() => {
        // Evitar posições muito próximas
        let x, y;
        do {
          x = randomFloat(24, width - 180);
          y = randomFloat(12, height - 48);
        } while (Math.abs(x - lastTextX) < 40 && Math.abs(y - lastTextY) < 30);
        lastTextX = x;
        lastTextY = y;

        msg.style.left = `${x}px`;
        msg.style.top = `${y}px`;
        msg.style.opacity = '1';

        let t = 0;
        const dur = 7000 + Math.random() * 4000;
        const dx = randomFloat(-0.3, 0.3);
        const dy = randomFloat(-0.14, 0.14);

        function anim() {
          t += 16;
          const frac = t / dur;
          if (frac > 1) {
            msg.style.opacity = '0';
            msg.style.transform = '';
            return;
          }
          let localOpacity = Math.sin(Math.PI * Math.min(frac, 1)) * 0.87 + 0.13;
          msg.style.opacity = `${localOpacity}`;

          msg.style.transform = `translate(${dx * frac * 28}px, ${dy * frac * 16}px)`;
          requestAnimationFrame(anim);
        }
        anim();
      }, 400);
    }
    // Primeira aparição após 5~10s, depois a cada 50~110s
    setTimeout(showFloatingText, 5000 + Math.random() * 5000);
    setInterval(showFloatingText, 50000 + Math.random() * 60000);

    // FUNÇÃO DA NAVE MÃE GIGANTE, MUITO RARA
    function naveMae() {
      if (naveAtiva) return;
      naveAtiva = true;
      overlayAlpha = 0;
      nave.style.opacity = '1';
      nave.style.left = '-140px';
      nave.style.filter = 'drop-shadow(0 0 38px #4ae9ff)';

      const start = Date.now();
      const totalT = width * 7.1 + 3300 + Math.random() * 5000;

      function move() {
        let t = Date.now() - start;
        // Movimento horizontal com leve curva
        let px = -140 + (width + 180) * Math.pow(Math.min(1, t / (totalT - 2100)), 0.95);
        let py = height * 0.42 + Math.sin((px / width) * Math.PI) * 11;
        nave.style.left = `${px}px`;
        nave.style.top = `${py}px`;

        // Escurecimento do overlay no começo e fim da nave
        if (t < totalT * 0.19) overlayAlpha = t / (totalT * 0.19) * 0.28;
        else if (t > totalT * 0.81) overlayAlpha = (1 - (t - totalT * 0.81) / (totalT * 0.19)) * 0.28;
        else overlayAlpha = 0.28;

        if (t < totalT) {
          requestAnimationFrame(move);
        } else {
          overlayAlpha = 0;
          nave.style.opacity = '0';
          naveAtiva = false;
        }
      }
      move();
    }
    // Frequência muito baixa: a cada 3 a 7 minutos
    setInterval(naveMae, 180000 + Math.random() * 240000);
  };
  retry();
})();
</script>

/////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////FIM DO GUIA DO MOCHILEIRO DAS GALAXIAS////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
*/

/* 7. Tema Clean Natureza 10/10
<quadro-dinamico
  width="340px"
  height="200px"
  gradient-start="rgba(168, 230, 207, 0.85)"
  gradient-end="rgba(220, 237, 193, 0.7)"
  gradient-angle="45deg"
  shimmer-intensity="0.005"
  gradient-speed="60s"
  color="#2e7d32"
  border-color="#558b2f"
  font-family="Georgia"
  wrap-text
  movable
  resizable
  top="180px"
  left="80px"
>
  <span slot="title">🍃 Reflexões Naturais</span>
  Sinta o vento da criatividade  
  e cultive boas ideias com tranquilidade.
</quadro-dinamico>

<style>
  //Luz branca normal
  quadro-dinamico.shimmer-light {
    background: linear-gradient(
      45deg,
      transparent 0%,
      rgba(255, 255, 255, 0.02) 40%,
      rgba(255, 255, 255, 0.04) 50%,
      rgba(255, 255, 255, 0.02) 60%,
      transparent 100%
    );
    background-repeat: no-repeat;
    background-size: 200% 100%;
    animation: shimmerMove 60s linear infinite;
  }

  // Forma orgânica de tronco (simples exemplo com SVG em base64)
  quadro-dinamico.shimmer-trunk {
    background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDEwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTMwIDAgQzM1IDUwIDQwIDE1MCAzMCAyMDAgTDUwIDIwMCA1MCAwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+Cjwvc3ZnPg==");
    background-repeat: no-repeat;
    background-position: center;
    background-size: calc(100% * var(--shimmer-scale, 0.7)) calc(100% * var(--shimmer-scale, 0.7));
    opacity: var(--shimmer-opacity, 0.03);
    animation: shimmerMove 60s linear infinite;
  }

  @keyframes shimmerMove {
    0% {
      background-position: -150% 0;
    }
    100% {
      background-position: 150% 0;
    }
  }
</style>

<script>
  (function () {
    const quadro = document.querySelector('quadro-dinamico');

    function toggleShimmerEffect() {
      const useTrunk = Math.random() < 0.3; // 30% chance de usar tronco

      if (useTrunk) {
        quadro.classList.add('shimmer-trunk');
        quadro.classList.remove('shimmer-light');
        // variações suaves
        quadro.style.setProperty('--shimmer-opacity', (Math.random() * 0.04 + 0.01).toFixed(3));
        quadro.style.setProperty('--shimmer-scale', (Math.random() * 0.8 + 0.6).toFixed(2));
      } else {
        quadro.classList.add('shimmer-light');
        quadro.classList.remove('shimmer-trunk');
        quadro.style.removeProperty('--shimmer-opacity');
        quadro.style.removeProperty('--shimmer-scale');
      }
    }

    toggleShimmerEffect(); // inicializa já com um efeito
    setInterval(toggleShimmerEffect, 60000); // troca a cada 60 segundos
  })();
</script>
*/

/* 8. Tema Retro Gamer – Pixel Notes - 8/10
<quadro-dinamico
  width="320px"
  height="180px"
  background="#1a1a1a"
  border-color="#00ff00"
  color="#00ff00"
  font-family="Press Start 2P"
  wrap-text
  movable
  resizable
  top="70px"
  left="1050px"
>
  <span slot="title">🕹 Pixel Notes</span>
  Missão do dia: derrotar o chefão da procrastinação.
</quadro-dinamico>*/


/* 9. Tema Gótico – “Teia de Sombras” - ATENÇÃO PARA COPIAR O ARQUIVO CANVA AO FINAL, TUDO JUNTO, COLANDO ELE APÓS O QUADRO-DINAMICO
<quadro-dinamico
  width="360px"
  height="200px"
  gradient-start="#1b1b1b"
  gradient-end="#2a1e2d"
  gradient-angle="135deg"
  border-color="#444"
  color="#d0c9d6"
  font-size="15px"
  font-family="Cinzel, serif"
  wrap-text
  movable
  resizable
  top="80px"
  left="40px"
>
  <span slot="title">🕸 Mensagem Sombria</span>
  O tempo escorre como sombras nas paredes da memória.  
  Cada palavra aqui ecoa como passos em um castelo vazio.
</quadro-dinamico>
<!-- CANVAS DOS MORCEGOS -->
<canvas id="morcegos-canvas"></canvas>

<!-- CANVAS DA NEBLINA -->
<canvas id="neblina-canvas"></canvas>

<script>
  const morcegosCanvas = document.getElementById('morcegos-canvas');
  const neblinaCanvas = document.getElementById('neblina-canvas');
  const morcegosCtx = morcegosCanvas.getContext('2d');
  const neblinaCtx = neblinaCanvas.getContext('2d');

  let width = window.innerWidth;
  let height = window.innerHeight;

  // Estilos dos canvas
  [morcegosCanvas, neblinaCanvas].forEach(c => {
    c.width = width;
    c.height = height;
    c.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 999;
      pointer-events: none;
    `;
  });

  // MORCEGO
  class Morcego {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height * 0.5;
      this.size = 14 + Math.random() * 10;
      this.speedX = -1.2 + Math.random() * 2;
      this.speedY = -0.3 + Math.random() * 0.6;
      this.wingAngle = 0;
      this.wingSpeed = 0.2 + Math.random() * 0.2;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.wingAngle += this.wingSpeed;
      if (this.x < -50 || this.x > width + 50 || this.y > height + 50) {
        this.reset();
        this.x = width + 20; // reaparece da direita
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.size / 20, this.size / 20);
      ctx.beginPath();
      ctx.fillStyle = '#2b1f33';
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      const flap = Math.sin(this.wingAngle) * 6;
      ctx.moveTo(-10, 0);
      ctx.quadraticCurveTo(-14, flap, -20, 0);
      ctx.moveTo(10, 0);
      ctx.quadraticCurveTo(14, flap, 20, 0);
      ctx.strokeStyle = '#444';
      ctx.stroke();
      ctx.restore();
    }
  }

  const morcegos = Array.from({ length: 8 }, () => new Morcego());

  function animarMorcegos() {
    morcegosCtx.clearRect(0, 0, width, height);
    morcegos.forEach(m => {
      m.update();
      m.draw(morcegosCtx);
    });
    requestAnimationFrame(animarMorcegos);
  }

  // NEBLINA
  const nevoas = Array.from({ length: 25 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: 60 + Math.random() * 100,
    dx: -0.15 + Math.random() * 0.3,
    dy: -0.1 + Math.random() * 0.2,
    opacity: 0.015 + Math.random() * 0.03
  }));

  function animarNeblina() {
    neblinaCtx.clearRect(0, 0, width, height);
    nevoas.forEach(n => {
      neblinaCtx.beginPath();
      neblinaCtx.fillStyle = `rgba(255,255,255,${n.opacity})`;
      neblinaCtx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      neblinaCtx.fill();
      n.x += n.dx;
      n.y += n.dy;
      if (n.x < -n.r || n.y < -n.r || n.x > width + n.r || n.y > height + n.r) {
        n.x = Math.random() * width;
        n.y = Math.random() * height;
      }
    });
    requestAnimationFrame(animarNeblina);
  }

  animarMorcegos();
  animarNeblina();

  // Resize responsivo
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    [morcegosCanvas, neblinaCanvas].forEach(c => {
      c.width = width;
      c.height = height;
    });
  });
</script>/*



*///Código que funciona e que não funciona//////////
/*
não funciona:
  <quadro-dinamico
  width="360px"
  height="180px"
  gradient-start="#ffd6d6"
  gradient-end="#ffcccc"
  gradient-angle="135deg"
  hover-opacity
  movable
  wrap-text
  copiar-conteudo
  minimizavel
  top="120px"
  left="320px"
>
  <span slot="title">🚨 Atenção</span>
  Uma atualização importante está disponível para revisão.
</quadro-dinamico>

Funciona:
<quadro-dinamico
  copiar-conteudo
<div id="teste-copiar">
  Texto normal<br>
  <strong>Negrito</strong><br>
  Linha nova
</div>
<button id="btnCopiar">Copiar</button>

<script>
  document.getElementById('btnCopiar').onclick = () => {
    const div = document.getElementById('teste-copiar');
    navigator.clipboard.writeText(div.innerText).then(() => alert('Copiado!'));
  };
</script>
</quadro-dinamico> -->





possivel motivo do bug:
✅ 2. Eliminar quebras e espaços antes do conteúdo no HTML
Em vez de:

html
Copiar
Editar
<quadro-dinamico>
  <span slot="title">Título</span>
  <ul>...</ul>
</quadro-dinamico>
Use:

html
Copiar
Editar
<quadro-dinamico><span slot="title">Título</span><ul>...</ul></quadro-dinamico>
Motivo: os \n e espaços são tratados como text nodes, e mesmo invisíveis, ocupam espaço.*/