/**
 * QuadroDinamico Web Component with custom drag and resize,
 * gradientes animados e letreiro neon opcional.
 */
class QuadroDinamico extends HTMLElement {
  static get observedAttributes() {
    return [
      'width','height','background','border-color',
      'color','font-size','font-family',
      'top','left','transition','wrap-text',
      // Gradiente estático
      'gradient-start','gradient-end','gradient-angle',
      // Shimmer animado
      'gradient-speed','shimmer-intensity',
      // Neon
      'neon','neon-color','neon-blink-speed'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._initTemplate();
    if (this.hasAttribute('movable')) this._enableDrag();
    if (this.hasAttribute('resizable')) this._enableResize();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    const quadro = this.shadowRoot.querySelector('.quadro');
    switch (name) {
      case 'wrap-text':
        this.shadowRoot.querySelector('.content')
          .style.whiteSpace = this.hasAttribute('wrap-text') ? 'pre-wrap' : 'pre';
        break;
      case 'transition':
        quadro.style.transition = newVal;
        break;
      // quando muda qualquer variável CSS, já tá amarrado no estilo
      default:
        this.style.setProperty(`--qd-${name}`, newVal);
    }
    // alterna classes de efeito
    quadro.classList.toggle('shimmer', this.hasAttribute('gradient-speed'));
    this.shadowRoot.querySelector('.header').classList
      .toggle('neon', this.hasAttribute('neon'));
  }

  _initTemplate() {
    const tpl = document.createElement('template');
    tpl.innerHTML = `
      <style>
        :host {
          /* dimensões básicas */
          --qd-width: ${this.getAttribute('width')||'300px'};
          --qd-height: ${this.getAttribute('height')||'150px'};
          --qd-bg: ${this.getAttribute('background')||'#6b7b34'};
          --qd-border: ${this.getAttribute('border-color')||'#333'};
          --qd-color: ${this.getAttribute('color')||'#fff'};
          --qd-font-size: ${this.getAttribute('font-size')||'16px'};
          --qd-font-family: ${this.getAttribute('font-family')||'Arial, sans-serif'};
          --qd-top: ${this.getAttribute('top')||'0px'};
          --qd-left: ${this.getAttribute('left')||'0px'};
          /* gradiente estático */
          --qd-gradient-start: ${this.getAttribute('gradient-start')||this.getAttribute('background')||'#6b7b34'};
          --qd-gradient-end:   ${this.getAttribute('gradient-end')||this.getAttribute('background')||'#4a5a20'};
          --qd-gradient-angle: ${this.getAttribute('gradient-angle')||'90deg'};
          /* shimmer */
          --qd-gradient-speed: ${this.getAttribute('gradient-speed')||'5s'};
          --qd-shimmer-intensity: ${this.getAttribute('shimmer-intensity')||'0.2'};
          /* neon */
          --qd-neon-color: ${this.getAttribute('neon-color')||'#0ff'};
          --qd-neon-blink-speed: ${this.getAttribute('neon-blink-speed')||'1.5s'};

          display: inline-block;
          position: ${this.hasAttribute('movable')?'absolute':'static'};
          top: var(--qd-top);
          left: var(--qd-left);
          will-change: transform;
        }

        .quadro {
          box-sizing: border-box;
          width: var(--qd-width);
          height: var(--qd-height);
          background: var(--qd-bg);
          color: var(--qd-color);
          font-size: var(--qd-font-size);
          font-family: var(--qd-font-family);
          border: 2px solid var(--qd-border);
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          position: relative;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
          background: linear-gradient(
            var(--qd-gradient-angle),
            var(--qd-gradient-start),
            var(--qd-gradient-end)
          );
          background-size: 100% 100%;
        }

        /* shimmer animado */
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

.header {
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 10px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  font-size: 14px;
  color: var(--qd-color);
  cursor: ${this.hasAttribute('movable') ? 'grab' : 'default'};
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
        .header:active { cursor: grabbing; }

        /* efeito neon no título */
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
  padding: 10px 14px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  white-space: ${this.hasAttribute('wrap-text') ? 'pre-wrap' : 'pre'};
  line-height: 1.6;
  font-weight: 400;
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
          line-height: 1;
        }
        .resizer:hover {
          background: rgba(255,255,255,0.6);
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
  }

  _enableDrag() {
    const header = this.shadowRoot.querySelector('.header');
    let startX, startY, origX, origY, dx=0, dy=0, raf;
    const apply = () => {
      this.style.transform = `translate(${dx}px,${dy}px)`;
      raf = null;
    };
    header.addEventListener('pointerdown', e => {
      e.preventDefault();
      header.setPointerCapture(e.pointerId);
      startX = e.clientX; startY = e.clientY;
      const r = this.getBoundingClientRect();
      origX = r.left; origY = r.top; dx=0; dy=0;
      const onMove = e => {
        e.preventDefault();
        dx = e.clientX - startX;
        dy = e.clientY - startY;
        if (!raf) raf = requestAnimationFrame(apply);
      };
      const onUp = e => {
        header.releasePointerCapture(e.pointerId);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        if (raf) { cancelAnimationFrame(raf); apply(); }
        this.style.transform = '';
        this.style.left = `${origX+dx}px`;
        this.style.top  = `${origY+dy}px`;
        this.style.setProperty('--qd-left', `${origX+dx}px`);
        this.style.setProperty('--qd-top',  `${origY+dy}px`);
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
    newW = undefined;
    newH = undefined;

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

    const onUp = e => {
      resizer.releasePointerCapture(e.pointerId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (raf) cancelAnimationFrame(raf);

      // Garantir valores válidos para W/H
      const finalW = typeof newW === 'number' ? newW : startW;
      const finalH = typeof newH === 'number' ? newH : startH;

      this.style.setProperty('--qd-width',  finalW + 'px');
      this.style.setProperty('--qd-height', finalH + 'px');

      // Remover estilos inline para não sobrepor os custom properties
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
 * utilizado para exibir textos com estilo, podendo ser movido e redimensionado
 * diretamente na interface do usuário.
 *
 * Funcionalidades:
 * - Movimentação (drag): usando atributo `movable`
 * - Redimensionamento (resize): usando atributo `resizable`
 * - Gradiente estático entre duas cores
 * - Animação shimmer com velocidade e intensidade
 * - Letreiro neon piscante com cor e velocidade personalizáveis
 * - Totalmente configurável via atributos HTML
 *
 * Atributos Suportados:
 * ---------------------------------------------
 * | Atributo              | Função                                  |
 * |----------------------|------------------------------------------|
 * | width                | largura do quadro (ex: "300px")         |
 * | height               | altura do quadro (ex: "150px")          |
 * | background           | cor de fundo (hex, nome, etc.)           |
 * | border-color         | cor da borda                             |
 * | color                | cor do texto                             |
 * | font-size            | tamanho da fonte (ex: "16px")           |
 * | font-family          | fonte (ex: "Arial")                     |
 * | top / left           | posição do componente                   |
 * | wrap-text            | permite quebra de linha automática      |
 * | transition           | tempo de transição CSS personalizado    |
 * | gradient-start/end   | gradiente entre cores                    |
 * | gradient-angle       | direção do gradiente (ex: "90deg")      |
 * | gradient-speed       | ativa shimmer (ex: "5s")                |
 * | shimmer-intensity    | intensidade do brilho shimmer (0-1)      |
 * | neon                 | ativa efeito neon                        |
 * | neon-color           | cor do brilho neon                       |
 * | neon-blink-speed     | velocidade de piscar (ex: "1.5s")       |
 *
 * Slots HTML:
 * - <slot name="title"> ... </slot>         => Título do quadro
 * - <slot name="actions"> ... </slot>       => Espaço lateral superior
 * - <slot> ... </slot>                      => Conteúdo principal (texto)
 *
 * Exemplo de uso: ver ao final deste arquivo
 */

/* 
 * ===========================
 * EXEMPLOS DE USO
 * ===========================
 */

/* 1. USO TRADICIONAL E SIMPLES */
/* 
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

/* 2. MODO ROBUSTO E ESTILIZADO (UI suave lilás) */
/*
<quadro-dinamico
  width="360px"
  height="200px"
  gradient-start="#E7D6F1"
  gradient-end="#F6EEF9"
  gradient-angle="145deg"
  border-color="#B590CA"
  color="#3D2E4F"
  font-size="15px"
  font-family="Segoe UI"
  wrap-text
  movable
  resizable
  top="90px"
  left="400px"
>
  <span slot="title">Resumo Diário</span>
  <ul>
    <li>Cliente X confirmou a entrega</li>
    <li>Reunião às 14h com diretoria</li>
    <li>Atualização de sistema concluída</li>
  </ul>
</quadro-dinamico>
*/

/* 3. MODO Iluminado (fundo animado, neon, brilho, UI extravagante) */
/*
<quadro-dinamico
  width="400px"
  height="240px"
  gradient-start="rgba(255, 105, 180, 0.32)"
  gradient-end="rgba(186, 85, 211, 0.2)"
  gradient-angle="145deg"
  gradient-speed="12s"
  shimmer-intensity="0.02"
  neon
  neon-color="#aeefff"
  neon-blink-speed="2.2s"
  color="#fefefe"
  font-size="16px"
  font-family="Courier New"
  wrap-text
  movable
  resizable
  top="120px"
  left="720px"
>
  <span slot="title">🎇 Notas Luminosas</span>
  Um toque de brilho quase como um reflexo lunar na água.  
  Elegância sutil e presença sem exagero. 🌙
</quadro-dinamico>



// MAIS MODELOS DE JANELAS PRE DEFINIDAS - TEMÁTICOS //
Tema Oceânico – “Notas da Maré”
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



<quadro-dinamico
  width="370px"
  height="220px"
  gradient-start="#0f0c29"
  gradient-end="#302b63"
  gradient-angle="135deg"
  shimmer-intensity="0.04"          
  gradient-speed="15s"          
  neon
  neon-color="#66e0ff"        
  neon-blink-speed="2.5s"
  color="#e6faff"          
  font-family="Orbitron"
  wrap-text
  movable
  resizable
  top="220px"
  left="900px"
>
  <span slot="title">🌌 Galáxia Pessoal</span>
  Ideias estelares orbitam aqui.  
  Respire fundo e observe o universo se expandir lentamente 🚀
</quadro-dinamico>



<quadro-dinamico
  width="340px"
  height="200px"
  gradient-start="rgba(168, 230, 207, 0.85)"
  gradient-end="rgba(220, 237, 193, 0.7)"
  gradient-angle="45deg"
  shimmer-intensity="0.02"            
  gradient-speed="18s"            
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



Tema Retro Gamer – “Pixel Notes”
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
</quadro-dinamico>



Tema Gótico – “Teia de Sombras” - ATENÇÃO PARA COPIAR O ARQUIVO CANVA AO FINAL, TUDO JUNTO, COLANDO ELE APÓS O QUADRO-DINAMICO
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
</script>

*/