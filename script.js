// scripts.js

const animacoes = {
  sorrindo: 'animacoes/sorrindo.npg',
  servindo: 'animacoes/servindo.gif',
  questionando: 'animacoes/questionando.gif',
  despedindo: 'animacoes/despedindo.gif'
};

const recepcionistaImg = document.getElementById('recepcionista-img');

// Função para trocar animação
function trocarAnimacao(nomeAnimacao) {
  if (animacoes[nomeAnimacao]) {
    recepcionistaImg.src = animacoes[nomeAnimacao];
  }
}

// Exemplo de uso: trocar animacao para 'servindo' após 5 segundos
setTimeout(() => trocarAnimacao('servindo'), 5000);

// Você pode implementar interações para trocar a animação conforme menu clicado, por exemplo.
