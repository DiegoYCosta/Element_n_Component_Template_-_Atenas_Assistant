document.addEventListener('DOMContentLoaded', () => {
  // ——— Parte 1: Imagens (.com-acoes) ———
  document.querySelectorAll('.com-acoes').forEach(img => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display  = 'inline-block';

    const actionsDiv = document.createElement('div');
    Object.assign(actionsDiv.style, {
      position:      'absolute',
      top:           '8px',
      right:         '8px',
      background:    'rgba(255,255,255,0.9)',
      borderRadius:  '4px',
      padding:       '4px',
      display:       'none',
      boxShadow:     '0 2px 4px rgba(0,0,0,0.2)',
      zIndex:        9999
    });

    const downloadBtn = document.createElement('button');
    downloadBtn.innerHTML = '<i class="bi bi-download"></i>';
    Object.assign(downloadBtn.style, {
      border:     'none',
      background: 'none',
      cursor:     'pointer',
      margin:     '2px',
      fontSize:   '1.2em'
    });
    downloadBtn.addEventListener('click', () => downloadDireto(img.src));

    const saveAsBtn = document.createElement('button');
    saveAsBtn.innerHTML = '<i class="bi bi-save2"></i>';
    Object.assign(saveAsBtn.style, {
      border:     'none',
      background: 'none',
      cursor:     'pointer',
      margin:     '2px',
      fontSize:   '1.2em'
    });
    saveAsBtn.addEventListener('click', () => salvarComo(img.src));

    actionsDiv.append(downloadBtn, saveAsBtn);
    img.parentNode.insertBefore(wrapper, img);
    wrapper.append(img, actionsDiv);

    // isolando hover da imagem do hover da legenda
    wrapper.addEventListener('mouseenter', () => actionsDiv.style.display = 'block');
    wrapper.addEventListener('mouseleave', () => actionsDiv.style.display = 'none');
  });

  // ——— Parte 2: Figcaptions ———
  document.querySelectorAll('figure figcaption').forEach(caption => {
    // 1) torna o próprio <figcaption> relativo
    Object.assign(caption.style, {
      position:   'relative',
      paddingTop: '1.2em'   // espaço para o ícone sem sobrepor o texto
    });

    // 2) cria e posiciona o botão dentro do caption
    const copyBtn = document.createElement('button');
    copyBtn.innerHTML = '<i class="bi bi-clipboard"></i>';
    Object.assign(copyBtn.style, {
      position:     'absolute',
      top:          '4px',
      right:        '4px',
      border:       'none',
      background:   'rgba(255,255,255,0.9)',
      borderRadius: '4px',
      padding:      '4px',
      cursor:       'pointer',
      display:      'none',
      boxShadow:    '0 1px 3px rgba(0,0,0,0.2)',
      zIndex:       9999,
      fontSize:     '1.2em'
    });
    caption.appendChild(copyBtn);

    // 3) hover no próprio caption (inclui o botão)
    caption.addEventListener('mouseenter', () => copyBtn.style.display = 'block');
    caption.addEventListener('mouseleave', () => copyBtn.style.display = 'none');

    // 4) ação de copy
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(caption.innerText);
        mostrarMensagem("Texto da legenda copiado com sucesso");
      } catch (err) {
        alert("Erro ao copiar texto: " + err.message);
      }
    });
  });
});

// DOWNLOAD DIRETO
async function downloadDireto(src) {
  try {
    const response = await fetch(src);
    const blob     = await response.blob();
    const url      = URL.createObjectURL(blob);
    const fileName = src.split('/').pop();

    const a = document.createElement('a');
    a.href     = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    alert("Erro ao baixar o arquivo: " + err.message);
  }
}

// SALVAR COMO (file picker)
async function salvarComo(src) {
  if (!window.showSaveFilePicker) {
    if (confirm("Seu navegador não suporta 'Salvar como'. Deseja baixar o arquivo normalmente?")) {
      return downloadDireto(src);
    }
    return;
  }
  try {
    const response = await fetch(src);
    const blob     = await response.blob();
    const fileName = src.split('/').pop();

    const fileHandle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [{
        description: 'Arquivo',
        accept: { [blob.type]: ['.' + fileName.split('.').pop()] }
      }]
    });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    mostrarMensagem("Arquivo salvo com sucesso");
  } catch (err) {
    // silêncio ao cancelar o salvar Como
  }
}

// MENSAGEM TEMPORÁRIA
function mostrarMensagem(texto) {
  const msg = document.createElement('div');
  msg.innerText = texto;
  Object.assign(msg.style, {
    position:    'fixed',
    bottom:      '20px',
    left:        '50%',
    transform:   'translateX(-50%)',
    background:  '#333',
    color:       '#fff',
    padding:     '10px 20px',
    borderRadius:'6px',
    zIndex:      10000
  });
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 1000);
}
