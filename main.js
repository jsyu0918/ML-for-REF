/**
 * 부동산금융투자를 위한 머신러닝 모델 - 메인 스크립트
 * 작성일: 2025년 5월 18일
 */

// DOM 요소
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileMenuClose = document.querySelector('.mobile-menu-close');
const accordionHeaders = document.querySelectorAll('.accordion-header');
const tabButtons = document.querySelectorAll('.tab-btn');
const resultTabs = document.querySelectorAll('.result-tab');
const refTabs = document.querySelectorAll('.ref-tab');
const modelDetailButtons = document.querySelectorAll('.btn-detail');
const modalClose = document.querySelector('.modal-close');
const faqQuestions = document.querySelectorAll('.faq-question');
const sliderPrev = document.querySelector('.slider-prev');
const sliderNext = document.querySelector('.slider-next');
const sliderDots = document.querySelectorAll('.dot');

// 모델 데이터
let modelsData = {};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  // 모바일 메뉴 이벤트 리스너
  setupMobileMenu();
  
  // 아코디언 이벤트 리스너
  setupAccordions();
  
  // 탭 이벤트 리스너
  setupTabs();
  
  // 모델 상세 정보 모달 이벤트 리스너
  setupModelDetailModal();
  
  // FAQ 이벤트 리스너
  setupFAQ();
  
  // 슬라이더 이벤트 리스너
  setupSlider();
  
  // 모델 데이터 로드
  loadModelsData();
  
  // 시뮬레이션 초기화
  initSimulation();
  
  // 스크롤 이벤트 리스너
  setupScrollEvents();
  
  // 콘솔에 로드 완료 메시지
  console.log('부동산금융투자를 위한 머신러닝 모델 웹페이지가 로드되었습니다.');
});

// 모바일 메뉴 설정
function setupMobileMenu() {
  mobileMenuToggle.addEventListener('click', function() {
    mobileMenu.classList.add('active');
  });
  
  mobileMenuClose.addEventListener('click', function() {
    mobileMenu.classList.remove('active');
  });
  
  // 모바일 메뉴 외부 클릭 시 닫기
  document.addEventListener('click', function(event) {
    if (!mobileMenu.contains(event.target) && !mobileMenuToggle.contains(event.target) && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
    }
  });
}

// 아코디언 설정
function setupAccordions() {
  accordionHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const accordionItem = this.parentElement;
      accordionItem.classList.toggle('active');
    });
  });
}

// 탭 설정
function setupTabs() {
  // 적용 사례 탭
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.dataset.tab;
      
      // 활성 탭 버튼 업데이트
      tabButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // 활성 탭 콘텐츠 업데이트
      const tabPanes = document.querySelectorAll('.tab-pane');
      tabPanes.forEach(pane => pane.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
    });
  });
  
  // 결과 탭
  resultTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const resultId = this.dataset.result;
      
      // 활성 탭 버튼 업데이트
      resultTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // 활성 결과 패널 업데이트
      const resultPanes = document.querySelectorAll('.result-pane');
      resultPanes.forEach(pane => pane.classList.remove('active'));
      document.getElementById(`${resultId}-result`).classList.add('active');
    });
  });
  
  // 참고자료 탭
  refTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const refId = this.dataset.ref;
      
      // 활성 탭 버튼 업데이트
      refTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // 활성 참고자료 패널 업데이트
      const refPanes = document.querySelectorAll('.ref-pane');
      refPanes.forEach(pane => pane.classList.remove('active'));
      document.getElementById(refId).classList.add('active');
    });
  });
}

// 모델 상세 정보 모달 설정
function setupModelDetailModal() {
  const modal = document.getElementById('model-detail-modal');
  
  modelDetailButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modelId = this.dataset.model;
      openModelDetailModal(modelId);
    });
  });
  
  modalClose.addEventListener('click', function() {
    modal.classList.remove('active');
  });
  
  // 모달 외부 클릭 시 닫기
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.classList.remove('active');
    }
  });
  
  // ESC 키로 모달 닫기
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });
}

// 모델 상세 정보 모달 열기
function openModelDetailModal(modelId) {
  const modal = document.getElementById('model-detail-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalContent = document.getElementById('modal-content');
  
  // 모델 데이터가 로드되었는지 확인
  if (Object.keys(modelsData).length === 0) {
    modalTitle.textContent = '데이터 로딩 중...';
    modalContent.innerHTML = '<p>모델 데이터를 불러오는 중입니다. 잠시만 기다려주세요.</p>';
    modal.classList.add('active');
    
    // 데이터 로드 후 다시 시도
    loadModelsData().then(() => {
      openModelDetailModal(modelId);
    });
    return;
  }
  
  // 모델 데이터에서 해당 모델 찾기
  const model = modelsData.models.find(m => m.id === modelId);
  
  if (!model) {
    modalTitle.textContent = '모델 정보 없음';
    modalContent.innerHTML = '<p>해당 모델에 대한 정보를 찾을 수 없습니다.</p>';
    modal.classList.add('active');
    return;
  }
  
  // 모달 제목 설정
  modalTitle.textContent = `${model.name} (${model.type})`;
  
  // 모달 내용 생성
  let content = `
    <div class="model-detail">
      <div class="model-overview">
        <h3>개요</h3>
        <p>${model.fullDescription.overview}</p>
      </div>
      
      <div class="model-math">
        <h3>수학적 정의</h3>
        <div class="math-block">
          ${model.fullDescription.mathFormulation}
        </div>
      </div>
      
      <div class="model-advantages-disadvantages">
        <div class="model-advantages">
          <h3>장점</h3>
          <ul>
            ${model.fullDescription.advantages.map(adv => `<li>${adv}</li>`).join('')}
          </ul>
        </div>
        
        <div class="model-disadvantages">
          <h3>단점</h3>
          <ul>
            ${model.fullDescription.disadvantages.map(dis => `<li>${dis}</li>`).join('')}
          </ul>
        </div>
      </div>
      
      <div class="model-applications">
        <h3>부동산금융투자 적용 분야</h3>
        <ul>
          ${model.fullDescription.realEstateApplications.map(app => `<li>${app}</li>`).join('')}
        </ul>
      </div>
      
      <div class="model-code">
        <h3>코드 예시</h3>
        <pre><code class="language-python">${model.codeExample}</code></pre>
      </div>
      
      <div class="model-parameters">
        <h3>주요 파라미터</h3>
        <table class="academic-table">
          <thead>
            <tr>
              <th>파라미터</th>
              <th>설명</th>
              <th>기본값</th>
              <th>범위/옵션</th>
            </tr>
          </thead>
          <tbody>
            ${model.parameters.map(param => `
              <tr>
                <td>${param.name}</td>
                <td>${param.description}</td>
                <td>${param.default}</td>
                <td>${param.range ? `${param.range[0]} ~ ${param.range[1]}` : (param.options ? param.options.join(', ') : '')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="model-references">
        <h3>참고문헌</h3>
        <ul class="reference-list">
          ${model.references.map(ref => `
            <li>${ref.authors} (${ref.year}). ${ref.title}. ${ref.url !== '#' ? `<a href="${ref.url}" target="_blank">링크</a>` : ''}</li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
  
  modalContent.innerHTML = content;
  
  // MathJax 재렌더링
  if (typeof MathJax !== 'undefined') {
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, modalContent]);
  }
  
  // 모달 표시
  modal.classList.add('active');
}

// FAQ 설정
function setupFAQ() {
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const faqItem = this.parentElement;
      faqItem.classList.toggle('active');
    });
  });
}

// 슬라이더 설정
function setupSlider() {
  const slides = document.querySelectorAll('.idea-slide');
  let currentSlide = 0;
  
  // 초기 슬라이드 표시
  showSlide(currentSlide);
  
  // 이전 슬라이드 버튼
  if (sliderPrev) {
    sliderPrev.addEventListener('click', function() {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    });
  }
  
  // 다음 슬라이드 버튼
  if (sliderNext) {
    sliderNext.addEventListener('click', function() {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    });
  }
  
  // 도트 네비게이션
  sliderDots.forEach((dot, index) => {
    dot.addEventListener('click', function() {
      currentSlide = index;
      showSlide(currentSlide);
    });
  });
  
  // 슬라이드 표시 함수
  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    sliderDots.forEach(dot => dot.classList.remove('active'));
    
    slides[index].classList.add('active');
    sliderDots[index].classList.add('active');
  }
  
  // 자동 슬라이드 (5초마다)
  setInterval(function() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, 5000);
}

// 모델 데이터 로드
async function loadModelsData() {
  try {
    const response = await fetch('data/models.json');
    modelsData = await response.json();
    console.log('모델 데이터 로드 완료:', modelsData.models.length + '개 모델');
    return modelsData;
  } catch (error) {
    console.error('모델 데이터 로드 오류:', error);
    return {};
  }
}

// 시뮬레이션 초기화
function initSimulation() {
  const runSimulationButton = document.getElementById('run-simulation');
  if (!runSimulationButton) return;
  
  runSimulationButton.addEventListener('click', function() {
    // 로딩 표시
    this.disabled = true;
    this.textContent = '시뮬레이션 실행 중...';
    
    // 파라미터 값 가져오기
    const modelSelect = document.getElementById('model-select');
    const dataSelect = document.getElementById('data-select');
    const learningRate = document.getElementById('param-learning-rate');
    const maxDepth = document.getElementById('param-max-depth');
    const nEstimators = document.getElementById('param-n-estimators');
    
    // 시뮬레이션 실행 (실제로는 서버에 요청하거나 TensorFlow.js 등으로 구현)
    setTimeout(function() {
      // 시뮬레이션 결과 표시 (예시)
      displaySimulationResults({
        model: modelSelect.value,
        data: dataSelect.value,
        params: {
          learning_rate: parseFloat(learningRate.value),
          max_depth: parseInt(maxDepth.value),
          n_estimators: parseInt(nEstimators.value)
        },
        metrics: {
          rmse: (Math.random() * 100 + 50).toFixed(2),
          mae: (Math.random() * 50 + 30).toFixed(2),
          r2: (Math.random() * 0.5 + 0.5).toFixed(4),
          time: (Math.random() * 5 + 1).toFixed(2) + 's'
        }
      });
      
      // 버튼 상태 복원
      runSimulationButton.disabled = false;
      runSimulationButton.textContent = '시뮬레이션 실행';
    }, 2000);
  });
  
  // 모델 선택 변경 시 파라미터 업데이트
  const modelSelect = document.getElementById('model-select');
  if (modelSelect) {
    modelSelect.addEventListener('change', updateModelParameters);
  }
  
  // 데이터셋 선택 변경 시 업로드 필드 표시/숨김
  const dataSelect = document.getElementById('data-select');
  const dataUpload = document.getElementById('data-upload');
  if (dataSelect && dataUpload) {
    dataSelect.addEventListener('change', function() {
      if (this.value === 'custom') {
        dataUpload.classList.remove('hidden');
      } else {
        dataUpload.classList.add('hidden');
      }
    });
  }
  
  // 파라미터 슬라이더 값 표시 업데이트
  const paramSliders = document.querySelectorAll('.parameter-item input[type="range"]');
  paramSliders.forEach(slider => {
    const valueDisplay = slider.nextElementSibling;
    
    // 초기값 설정
    valueDisplay.textContent = slider.value;
    
    // 값 변경 시 업데이트
    slider.addEventListener('input', function() {
      valueDisplay.textContent = this.value;
    });
  });
}

// 모델 파라미터 업데이트
function updateModelParameters() {
  const modelSelect = document.getElementById('model-select');
  const parametersContainer = document.getElementById('parameters-container');
  
  // 모델 데이터가 로드되었는지 확인
  if (Object.keys(modelsData).length === 0) {
    loadModelsData().then(() => {
      updateModelParameters();
    });
    return;
  }
  
  const selectedModel = modelSelect.value;
  const model = modelsData.models.find(m => m.id === selectedModel);
  
  if (!model) return;
  
  // 파라미터 컨테이너 초기화
  parametersContainer.innerHTML = '';
  
  // 모델 파라미터 추가
  model.parameters.forEach(param => {
    const paramItem = document.createElement('div');
    paramItem.className = 'parameter-item';
    
    // 범위형 파라미터
    if (param.range) {
      paramItem.innerHTML = `
        <label for="param-${param.name}">${param.description}</label>
        <input type="range" id="param-${param.name}" 
               min="${param.range[0]}" max="${param.range[1]}" 
               step="${(param.range[1] - param.range[0]) / 20}" 
               value="${param.default}">
        <span class="param-value">${param.default}</span>
      `;
      
      // 값 변경 이벤트 리스너
      const slider = paramItem.querySelector(`#param-${param.name}`);
      const valueDisplay = paramItem.querySelector('.param-value');
      slider.addEventListener('input', function() {
        valueDisplay.textContent = this.value;
      });
    } 
    // 옵션형 파라미터
    else if (param.options) {
      paramItem.innerHTML = `
        <label for="param-${param.name}">${param.description}</label>
        <select id="param-${param.name}" class="form-control">
          ${param.options.map(option => 
            `<option value="${option}" ${option === param.default ? 'selected' : ''}>${option}</option>`
          ).join('')}
        </select>
      `;
    }
    
    parametersContainer.appendChild(paramItem);
  });
}

// 시뮬레이션 결과 표시
function displaySimulationResults(results) {
  // 메트릭 업데이트
  document.getElementById('metric-rmse').textContent = results.metrics.rmse;
  document.getElementById('metric-mae').textContent = results.metrics.mae;
  document.getElementById('metric-r2').textContent = results.metrics.r2;
  document.getElementById('metric-time').textContent = results.metrics.time;
  
  // 예측 차트 업데이트 (Chart.js 사용)
  updatePredictionChart(results);
  
  // 변수 중요도 차트 업데이트 (Chart.js 사용)
  updateFeaturesChart(results);
  
  // 결과 해석 업데이트
  updateInterpretation(results);
}

// 예측 차트 업데이트
function updatePredictionChart(results) {
  const ctx = document.getElementById('prediction-chart');
  
  // 기존 차트 제거
  if (window.predictionChart) {
    window.predictionChart.destroy();
  }
  
  // 예시 데이터 생성
  const labels = Array.from({length: 20}, (_, i) => i + 1);
  const actualData = Array.from({length: 20}, () => Math.random() * 1000 + 500);
  const predictedData = actualData.map(val => val * (1 + (Math.random() * 0.4 - 0.2)));
  
  // 차트 생성
  window.predictionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '실제 가격',
          data: actualData,
          borderColor: '#1A365D',
          backgroundColor: 'rgba(26, 54, 93, 0.1)',
          borderWidth: 2,
          pointRadius: 3,
          fill: false
        },
        {
          label: '예측 가격',
          data: predictedData,
          borderColor: '#C84B31',
          backgroundColor: 'rgba(200, 75, 49, 0.1)',
          borderWidth: 2,
          pointRadius: 3,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '실제 가격과 예측 가격 비교',
          font: {
            family: "'Noto Serif KR', serif",
            size: 16
          }
        },
        legend: {
          position: 'top'
        },
        tooltip: {
          mode: 'index',
   
(Content truncated due to size limit. Use line ranges to read in chunks)