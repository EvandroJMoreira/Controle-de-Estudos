let startTime;           // Armazena o momento em que o cronômetro foi iniciado
let intervalId;          // Armazena o ID do setInterval, para podermos parar depois
let elapsedTime = 0;     // Tempo acumulado (em milissegundos), caso pare e continue depois

const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const saveBtn = document.getElementById('saveBtn');
const descriptionEl = document.getElementById('description');
const logTable = document.getElementById('logTable');

startBtn.addEventListener('click', () => {
    startTime = Date.now() - elapsedTime;
    intervalId = setInterval(updateTimer, 1000);
    startBtn.disabled = true;
    stopBtn.disabled = false;
});

function updateTimer() {
    elapsedTime = Date.now() - startTime;

    const totalSeconds = Math.floor(elapsedTime / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    timerEl.textContent = `${hours}:${minutes}:${seconds}`;
}

stopBtn.addEventListener('click', () => {
    clearInterval(intervalId);            // Para a contagem de tempo
    startBtn.disabled = false;            // Reativa o botão Iniciar
    stopBtn.disabled = true;             // Desativa o botão Parar
});

saveBtn.addEventListener('click', () => {
    if (elapsedTime === 0) {
      alert('Você precisa registrar algum tempo antes de salvar.');
      return;
    }
  
    const now = new Date();
    const data = now.toLocaleDateString('pt-BR');
    const segundosTotais = Math.floor(elapsedTime / 1000);
    const novaDescricao = descriptionEl.value.trim();
  
    if (novaDescricao === '') {
      alert('Por favor, escreva uma descrição do que foi feito.');
      return;
    }
  
    // Recupera registros anteriores
    const registros = JSON.parse(localStorage.getItem('registros')) || [];
  
    // Verifica se já existe um registro para o dia
    const indexDoDia = registros.findIndex(r => r.data === data);
  
    if (indexDoDia !== -1) {
      // Já existe: soma o tempo e junta as descrições
      registros[indexDoDia].tempo += segundosTotais;
      registros[indexDoDia].descricao += `; ${novaDescricao}`;
    } else {
      // Ainda não existe: cria novo
      registros.push({
        data: data,
        tempo: segundosTotais,
        descricao: novaDescricao
      });
    }
  
    // Salva de volta no localStorage
    localStorage.setItem('registros', JSON.stringify(registros));
  
    // Limpa a tabela e recarrega tudo
    logTable.innerHTML = '';
    registros.forEach(registro => {
      adicionarLinhaTabela(registro.data, formatarTempo(registro.tempo), registro.descricao);
    });

    atualizarGrafico(registros); 
  
    // Reset
    elapsedTime = 0;
    timerEl.textContent = '00:00:00';
    descriptionEl.value = '';
    clearInterval(intervalId);
    startBtn.disabled = false;
    stopBtn.disabled = true;
  });

window.addEventListener('load', () => {
    const registrosSalvos = JSON.parse(localStorage.getItem('registros')) || [];
    registrosSalvos.forEach(registro => {
      adicionarLinhaTabela(registro.data, formatarTempo(registro.tempo), registro.descricao);
    });
    atualizarGrafico(registrosSalvos);
  });

  function formatarTempo(segundosTotais) {
    const horas = String(Math.floor(segundosTotais / 3600)).padStart(2, '0');
    const minutos = String(Math.floor((segundosTotais % 3600) / 60)).padStart(2, '0');
    const segundos = String(segundosTotais % 60).padStart(2, '0');
    return `${horas}:${minutos}:${segundos}`;
  }
  
  function adicionarLinhaTabela(data, tempo, descricao) {
    const novaLinha = document.createElement('tr');
    novaLinha.innerHTML = `
      <td>${data}</td>
      <td>${tempo}</td>
      <td>${descricao}</td>
    `;
    logTable.appendChild(novaLinha);
  }
  
  let chart; // variável global para podermos atualizar depois

function atualizarGrafico(registros) {
  const labels = registros.map(r => r.data);
  const temposMinutos = registros.map(r => Math.floor(r.tempo / 60));

  const ctx = document.getElementById('studyChart').getContext('2d');

  // Destroi gráfico anterior, se existir
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Minutos Estudados',
        data: temposMinutos,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Minutos'
          }
        }
      }
    }
  });
}

const printBtn = document.getElementById('printBtn');

printBtn.addEventListener('click', () => {
  window.print();
});
