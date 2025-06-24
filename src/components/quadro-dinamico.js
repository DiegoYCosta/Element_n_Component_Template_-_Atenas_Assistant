/**
 * QuadroDinamico Web Component with custom drag and resize
 * Permite mover e redimensionar suavemente apenas durante interação.
 */
class QuadroDinamico extends HTMLElement {
  static get observedAttributes() {
    return [
      'width','height','background','border-color',
      'color','font-size','font-family',
      'top','left','transition','wrap-text'
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
    if (name === 'wrap-text') {
      const content = this.shadowRoot.querySelector('.content');
      content.style.whiteSpace = this.hasAttribute('wrap-text') ? 'pre-wrap' : 'pre';
    } else if (name === 'transition') {
      this.shadowRoot.querySelector('.quadro').style.transition = newVal;
    } else {
      this.style.setProperty(`--qd-${name}`, newVal);
    }
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
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .header {
          background: rgba(0,0,0,0.1);
          padding: 8px 12px;
          cursor: ${this.hasAttribute('movable') ? 'grab' : 'default'};
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header:active { cursor: grabbing; }
        .content {
          padding: 12px;
          flex: 1;
          overflow: auto;
          white-space: ${this.hasAttribute('wrap-text') ? 'pre-wrap' : 'pre'};
          line-height: 1.5;
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
          background: rgba(255, 255, 255, 0.3);
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
          background: rgba(255, 255, 255, 0.6);
        }
      </style>
      <div class="quadro" role="region" tabindex="0" aria-label="Quadro didático">
        <div class="header">
          <slot name="title"><strong>Quadro</strong></slot>
          <div class="actions"><slot name="actions"></slot></div>
        </div>
        <div class="content"><slot></slot></div>
        <div class="resizer"></div>
      </div>`;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
  }

  _enableDrag() {
    const header = this.shadowRoot.querySelector('.header');
    let startX, startY, origX, origY, dx = 0, dy = 0, rafId;
    const applyTransform = () => {
      this.style.transform = `translate(${dx}px,${dy}px)`;
      rafId = null;
    };
    const onDown = e => {
      e.preventDefault();
      header.setPointerCapture(e.pointerId);
      startX = e.clientX; startY = e.clientY;
      const rect = this.getBoundingClientRect();
      origX = rect.left; origY = rect.top; dx = 0; dy = 0;
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    };
    const onMove = e => {
      e.preventDefault();
      dx = e.clientX - startX; dy = e.clientY - startY;
      if (!rafId) rafId = requestAnimationFrame(applyTransform);
    };
    const onUp = e => {
      header.releasePointerCapture(e.pointerId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (rafId) { cancelAnimationFrame(rafId); applyTransform(); }
      const finalX = origX + dx, finalY = origY + dy;
      this.style.transform = '';
      this.style.left = `${finalX}px`;
      this.style.top = `${finalY}px`;
      this.style.setProperty('--qd-left', `${finalX}px`);
      this.style.setProperty('--qd-top', `${finalY}px`);
    };
    header.addEventListener('pointerdown', onDown);
  }

  _enableResize() {
    const quadro = this.shadowRoot.querySelector('.quadro');
    const resizer = this.shadowRoot.querySelector('.resizer');
    let startX, startY, startW, startH, newW, newH, raf;
    const applySize = () => {
      quadro.style.width = `${newW}px`;
      quadro.style.height = `${newH}px`;
      raf = null;
    };
    const onDown = e => {
      e.preventDefault();
      resizer.setPointerCapture(e.pointerId);
      const rect = quadro.getBoundingClientRect();
      startX = e.clientX; startY = e.clientY;
      startW = rect.width; startH = rect.height;
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    };
    const onMove = e => {
      e.preventDefault();
      newW = startW + (e.clientX - startX);
      newH = startH + (e.clientY - startY);
      if (!raf) raf = requestAnimationFrame(applySize);
    };
    const onUp = e => {
      resizer.releasePointerCapture(e.pointerId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (raf) { cancelAnimationFrame(raf); applySize(); }
      this.style.setProperty('--qd-width', `${newW}px`);
      this.style.setProperty('--qd-height', `${newH}px`);
    };
    resizer.addEventListener('pointerdown', onDown);
  }
}

customElements.define('quadro-dinamico', QuadroDinamico);