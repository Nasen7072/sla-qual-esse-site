document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const objectivesContainer = document.getElementById('objectives-container');
  const addObjectiveBtn = document.getElementById('add-objective');
  const highContrastBtn = document.getElementById('high-contrast');
  const fontSizeIncrease = document.getElementById('font-increase');
  const fontSizeDecrease = document.getElementById('font-decrease');
  const body = document.body;
  
  // Variáveis para cálculos matemáticos
  let objectives = JSON.parse(localStorage.getItem('objectives')) || [];
  
  // Inicialização
  renderObjectives();
  setupAccessibility();
  
  // Event Listeners
  if (addObjectiveBtn) {
    addObjectiveBtn.addEventListener('click', showObjectiveForm);
  }
  
  if (highContrastBtn) {
    highContrastBtn.addEventListener('click', toggleHighContrast);
  }
  
  if (fontSizeIncrease) {
    fontSizeIncrease.addEventListener('click', increaseFontSize);
  }
  
  if (fontSizeDecrease) {
    fontSizeDecrease.addEventListener('click', decreaseFontSize);
  }
  
  // Funções principais
  function renderObjectives() {
    if (!objectivesContainer) return;
    
    objectivesContainer.innerHTML = '';
    
    if (objectives.length === 0) {
      objectivesContainer.innerHTML = '<p>Nenhum objetivo cadastrado ainda.</p>';
      return;
    }
    
    objectives.forEach((objective, index) => {
      const progressPercentage = calculateProgress(objective);
      const daysRemaining = calculateDaysRemaining(objective.deadline);
      
      const card = document.createElement('div');
      card.className = 'objective-card';
      card.innerHTML = `
        <h2 class="objective-title">${objective.title}</h2>
        <p>${objective.description}</p>
        
        <div class="math-visualization">
          <p><strong>Progresso:</strong> ${progressPercentage}%</p>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${progressPercentage}%"></div>
          </div>
          
          <p><strong>Tempo restante:</strong> ${daysRemaining} dias</p>
          <p><strong>Progresso diário necessário:</strong> ${calculateDailyProgressNeeded(objective)}% por dia</p>
        </div>
        
        <button onclick="editObjective(${index})" aria-label="Editar objetivo ${objective.title}">Editar</button>
        <button onclick="deleteObjective(${index})" aria-label="Excluir objetivo ${objective.title}">Excluir</button>
      `;
      
      objectivesContainer.appendChild(card);
    });
  }
  
  // Funções matemáticas
  function calculateProgress(objective) {
    const current = objective.currentProgress || 0;
    const total = objective.totalProgress || 100;
    return Math.min(Math.round((current / total) * 100), 100);
  }
  
  function calculateDaysRemaining(deadline) {
    if (!deadline) return 'N/A';
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }
  
  function calculateDailyProgressNeeded(objective) {
    const daysRemaining = calculateDaysRemaining(objective.deadline);
    if (daysRemaining <= 0 || daysRemaining === 'N/A') return 'N/A';
    
    const progressLeft = 100 - calculateProgress(objective);
    return (progressLeft / daysRemaining).toFixed(2);
  }
  
  // Funções de formulário
  function showObjectiveForm(editIndex = null) {
    const objective = editIndex !== null ? objectives[editIndex] : null;
    
    const formHtml = `
      <div class="objective-card">
        <h2>${objective ? 'Editar Objetivo' : 'Novo Objetivo'}</h2>
        <form id="objective-form">
          <div class="form-group">
            <label for="title">Título:</label>
            <input type="text" id="title" value="${objective ? objective.title : ''}" required>
          </div>
          
          <div class="form-group">
            <label for="description">Descrição:</label>
            <textarea id="description" required>${objective ? objective.description : ''}</textarea>
          </div>
          
          <div class="form-group">
            <label for="deadline">Prazo:</label>
            <input type="date" id="deadline" value="${objective ? objective.deadline : ''}">
          </div>
          
          <div class="form-group">
            <label for="currentProgress">Progresso atual (0-100):</label>
            <input type="number" id="currentProgress" min="0" max="100" value="${objective ? (objective.currentProgress || 0) : 0}">
          </div>
          
          <div class="form-group">
            <label for="totalProgress">Meta total (opcional):</label>
            <input type="number" id="totalProgress" min="1" value="${objective ? (objective.totalProgress || 100) : 100}">
          </div>
          
          <button type="submit">Salvar</button>
          <button type="button" onclick="cancelForm()">Cancelar</button>
        </form>
      </div>
    `;
    
    objectivesContainer.innerHTML = formHtml + objectivesContainer.innerHTML;
    
    document.getElementById('objective-form').addEventListener('submit', function(e) {
      e.preventDefault();
      saveObjective(editIndex);
    });
  }
  
  function saveObjective(editIndex) {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const deadline = document.getElementById('deadline').value;
    const currentProgress = parseInt(document.getElementById('currentProgress').value) || 0;
    const totalProgress = parseInt(document.getElementById('totalProgress').value) || 100;
    
    const objective = {
      title,
      description,
      deadline,
      currentProgress,
      totalProgress
    };
    
    if (editIndex !== null) {
      objectives[editIndex] = objective;
    } else {
      objectives.push(objective);
    }
    
    localStorage.setItem('objectives', JSON.stringify(objectives));
    renderObjectives();
  }
  
  // Funções de acessibilidade
  function setupAccessibility() {
    // Adiciona rótulos ARIA dinamicamente
    document.querySelectorAll('button').forEach(button => {
      if (!button.getAttribute('aria-label') && button.textContent) {
        button.setAttribute('aria-label', button.textContent);
      }
    });
    
    // Configura o tamanho da fonte salvo
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      document.body.style.fontSize = savedFontSize;
    }
  }
  
  function toggleHighContrast() {
    body.classList.toggle('high-contrast');
    localStorage.setItem('highContrast', body.classList.contains('high-contrast'));
  }
  
  function increaseFontSize() {
    const currentSize = parseFloat(getComputedStyle(body).fontSize);
    const newSize = currentSize * 1.1;
    body.style.fontSize = `${newSize}px`;
    localStorage.setItem('fontSize', `${newSize}px`);
  }
  
  function decreaseFontSize() {
    const currentSize = parseFloat(getComputedStyle(body).fontSize);
    const newSize = Math.max(currentSize * 0.9, 12);
    body.style.fontSize = `${newSize}px`;
    localStorage.setItem('fontSize', `${newSize}px`);
  }
  
  // Funções globais para os botões nos cards
  window.editObjective = function(index) {
    showObjectiveForm(index);
  };
  
  window.deleteObjective = function(index) {
    if (confirm('Tem certeza que deseja excluir este objetivo?')) {
      objectives.splice(index, 1);
      localStorage.setItem('objectives', JSON.stringify(objectives));
      renderObjectives();
    }
  };
  
  window.cancelForm = function() {
    renderObjectives();
  };
  
  // Verifica preferências salvas
  if (localStorage.getItem('highContrast') === 'true') {
    body.classList.add('high-contrast');
  }
});