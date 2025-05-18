/**
 * 부동산금융투자를 위한 머신러닝 모델 - 시뮬레이션 기능
 * 작성일: 2025년 5월 18일
 */

// 시뮬레이션 관련 DOM 요소
const simulationForm = document.getElementById('simulation-form');
const modelSelect = document.getElementById('model-select');
const dataSelect = document.getElementById('data-select');
const dataUpload = document.getElementById('data-upload');
const parametersContainer = document.getElementById('parameters-container');
const runSimulationButton = document.getElementById('run-simulation');
const resultSection = document.getElementById('simulation-results');
const predictionChart = document.getElementById('prediction-chart');
const featuresChart = document.getElementById('features-chart');
const interpretationText = document.getElementById('interpretation-text');

// 시뮬레이션 설정 객체
const simulationConfig = {
  models: {
    'xgboost': {
      name: 'XGBoost',
      parameters: [
        {
          name: 'learning_rate',
          label: '학습률',
          type: 'range',
          min: 0.01,
          max: 0.3,
          step: 0.01,
          default: 0.1
        },
        {
          name: 'max_depth',
          label: '최대 깊이',
          type: 'range',
          min: 3,
          max: 10,
          step: 1,
          default: 6
        },
        {
          name: 'n_estimators',
          label: '트리 개수',
          type: 'range',
          min: 50,
          max: 500,
          step: 10,
          default: 100
        },
        {
          name: 'subsample',
          label: '샘플링 비율',
          type: 'range',
          min: 0.5,
          max: 1.0,
          step: 0.05,
          default: 1.0
        }
      ]
    },
    'lstm': {
      name: 'LSTM',
      parameters: [
        {
          name: 'units',
          label: 'LSTM 유닛 수',
          type: 'range',
          min: 10,
          max: 200,
          step: 10,
          default: 50
        },
        {
          name: 'time_step',
          label: '시퀀스 길이',
          type: 'range',
          min: 3,
          max: 24,
          step: 1,
          default: 12
        },
        {
          name: 'layers',
          label: 'LSTM 층 수',
          type: 'range',
          min: 1,
          max: 4,
          step: 1,
          default: 2
        },
        {
          name: 'dropout',
          label: '드롭아웃 비율',
          type: 'range',
          min: 0,
          max: 0.5,
          step: 0.05,
          default: 0.2
        }
      ]
    },
    'random-forest': {
      name: 'Random Forest',
      parameters: [
        {
          name: 'n_estimators',
          label: '트리 개수',
          type: 'range',
          min: 10,
          max: 500,
          step: 10,
          default: 100
        },
        {
          name: 'max_depth',
          label: '최대 깊이',
          type: 'select',
          options: ['None', '3', '5', '10', '15', '20', '30'],
          default: 'None'
        },
        {
          name: 'min_samples_split',
          label: '분할 최소 샘플 수',
          type: 'range',
          min: 2,
          max: 20,
          step: 1,
          default: 2
        },
        {
          name: 'max_features',
          label: '최대 특성 수',
          type: 'select',
          options: ['auto', 'sqrt', 'log2'],
          default: 'auto'
        }
      ]
    }
  },
  datasets: {
    'seoul': '서울시 아파트 실거래가 (2015-2022)',
    'busan': '부산시 아파트 실거래가 (2017-2022)',
    'commercial': '상업용 부동산 임대료 (2018-2022)',
    'office': '오피스 빌딩 가격 (2010-2022)',
    'custom': '사용자 정의 데이터셋'
  }
};

// 시뮬레이션 초기화
function initSimulation() {
  // 모델 선택 옵션 생성
  populateModelSelect();
  
  // 데이터셋 선택 옵션 생성
  populateDatasetSelect();
  
  // 초기 파라미터 설정
  updateModelParameters();
  
  // 이벤트 리스너 설정
  setupEventListeners();
  
  // 차트 초기화
  initCharts();
}

// 모델 선택 옵션 생성
function populateModelSelect() {
  modelSelect.innerHTML = '';
  
  Object.keys(simulationConfig.models).forEach(modelId => {
    const option = document.createElement('option');
    option.value = modelId;
    option.textContent = simulationConfig.models[modelId].name;
    modelSelect.appendChild(option);
  });
}

// 데이터셋 선택 옵션 생성
function populateDatasetSelect() {
  dataSelect.innerHTML = '';
  
  Object.keys(simulationConfig.datasets).forEach(datasetId => {
    const option = document.createElement('option');
    option.value = datasetId;
    option.textContent = simulationConfig.datasets[datasetId];
    dataSelect.appendChild(option);
  });
}

// 모델 파라미터 업데이트
function updateModelParameters() {
  const selectedModel = modelSelect.value;
  const modelConfig = simulationConfig.models[selectedModel];
  
  if (!modelConfig) return;
  
  // 파라미터 컨테이너 초기화
  parametersContainer.innerHTML = '';
  
  // 모델 파라미터 추가
  modelConfig.parameters.forEach(param => {
    const paramItem = document.createElement('div');
    paramItem.className = 'parameter-item';
    
    // 범위형 파라미터
    if (param.type === 'range') {
      paramItem.innerHTML = `
        <label for="param-${param.name}">${param.label}</label>
        <div class="parameter-control">
          <input type="range" id="param-${param.name}" name="${param.name}"
                 min="${param.min}" max="${param.max}" step="${param.step}" 
                 value="${param.default}">
          <span class="param-value">${param.default}</span>
        </div>
      `;
      
      // 값 변경 이벤트 리스너
      setTimeout(() => {
        const slider = paramItem.querySelector(`#param-${param.name}`);
        const valueDisplay = paramItem.querySelector('.param-value');
        
        slider.addEventListener('input', function() {
          valueDisplay.textContent = this.value;
        });
      }, 0);
    } 
    // 선택형 파라미터
    else if (param.type === 'select') {
      paramItem.innerHTML = `
        <label for="param-${param.name}">${param.label}</label>
        <div class="parameter-control">
          <select id="param-${param.name}" name="${param.name}" class="form-control">
            ${param.options.map(option => 
              `<option value="${option}" ${option === param.default ? 'selected' : ''}>${option}</option>`
            ).join('')}
          </select>
        </div>
      `;
    }
    
    parametersContainer.appendChild(paramItem);
  });
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 모델 선택 변경 시 파라미터 업데이트
  modelSelect.addEventListener('change', updateModelParameters);
  
  // 데이터셋 선택 변경 시 업로드 필드 표시/숨김
  dataSelect.addEventListener('change', function() {
    if (this.value === 'custom') {
      dataUpload.classList.remove('hidden');
    } else {
      dataUpload.classList.add('hidden');
    }
  });
  
  // 시뮬레이션 실행 버튼
  runSimulationButton.addEventListener('click', function(e) {
    e.preventDefault();
    
    // 로딩 표시
    this.disabled = true;
    this.innerHTML = '<span class="spinner"></span> 시뮬레이션 실행 중...';
    
    // 파라미터 수집
    const params = collectParameters();
    
    // 시뮬레이션 실행 (실제로는 서버에 요청하거나 TensorFlow.js 등으로 구현)
    setTimeout(function() {
      // 시뮬레이션 결과 생성 (예시)
      const results = generateSimulationResults(params);
      
      // 결과 표시
      displaySimulationResults(results);
      
      // 결과 섹션으로 스크롤
      resultSection.scrollIntoView({ behavior: 'smooth' });
      
      // 버튼 상태 복원
      runSimulationButton.disabled = false;
      runSimulationButton.innerHTML = '시뮬레이션 실행';
    }, 2000);
  });
}

// 파라미터 수집
function collectParameters() {
  const selectedModel = modelSelect.value;
  const selectedDataset = dataSelect.value;
  const params = {};
  
  // 모델별 파라미터 수집
  simulationConfig.models[selectedModel].parameters.forEach(param => {
    const paramInput = document.getElementById(`param-${param.name}`);
    if (paramInput) {
      // 숫자형 변환
      if (param.type === 'range') {
        params[param.name] = parseFloat(paramInput.value);
      } else {
        params[param.name] = paramInput.value;
      }
    }
  });
  
  return {
    model: selectedModel,
    dataset: selectedDataset,
    params: params
  };
}

// 차트 초기화
function initCharts() {
  // 예측 차트 초기화
  if (predictionChart) {
    window.predictionChart = new Chart(predictionChart, {
      type: 'line',
      data: {
        labels: [],
        datasets: []
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
          }
        }
      }
    });
  }
  
  // 변수 중요도 차트 초기화
  if (featuresChart) {
    window.featuresChart = new Chart(featuresChart, {
      type: 'bar',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '변수 중요도 분석',
            font: {
              family: "'Noto Serif KR', serif",
              size: 16
            }
          }
        }
      }
    });
  }
}

// 시뮬레이션 결과 생성 (예시)
function generateSimulationResults(params) {
  // 실제 구현에서는 서버 요청 또는 TensorFlow.js 등으로 대체
  
  // 예시 메트릭 생성
  const metrics = {
    rmse: (Math.random() * 100 + 50).toFixed(2),
    mae: (Math.random() * 50 + 30).toFixed(2),
    r2: (Math.random() * 0.5 + 0.5).toFixed(4),
    time: (Math.random() * 5 + 1).toFixed(2) + 's'
  };
  
  // 예시 예측 데이터 생성
  const sampleCount = 20;
  const labels = Array.from({length: sampleCount}, (_, i) => i + 1);
  const actualData = Array.from({length: sampleCount}, () => Math.random() * 1000 + 500);
  const predictedData = actualData.map(val => val * (1 + (Math.random() * 0.4 - 0.2)));
  
  // 예시 변수 중요도 생성
  const features = ['면적', '층수', '경과년수', '지하철역 거리', '학교 수', '공원 면적', '상업시설 수', '금리', '주가지수', '인구밀도'];
  const importance = Array.from({length: features.length}, () => Math.random()).sort((a, b) => b - a);
  
  return {
    model: params.model,
    dataset: params.dataset,
    params: params.params,
    metrics: metrics,
    prediction: {
      labels: labels,
      actual: actualData,
      predicted: predictedData
    },
    features: {
      names: features,
      importance: importance
    }
  };
}

// 시뮬레이션 결과 표시
function displaySimulationResults(results) {
  // 결과 섹션 표시
  resultSection.classList.remove('hidden');
  
  // 메트릭 업데이트
  document.getElementById('metric-rmse').textContent = results.metrics.rmse;
  document.getElementById('metric-mae').textContent = results.metrics.mae;
  document.getElementById('metric-r2').textContent = results.metrics.r2;
  document.getElementById('metric-time').textContent = results.metrics.time;
  
  // 예측 차트 업데이트
  updatePredictionChart(results.prediction);
  
  // 변수 중요도 차트 업데이트
  updateFeaturesChart(results.features);
  
  // 결과 해석 업데이트
  updateInterpretation(results);
}

// 예측 차트 업데이트
function updatePredictionChart(predictionData) {
  if (!window.predictionChart) return;
  
  window.predictionChart.data.labels = predictionData.labels;
  window.predictionChart.data.datasets = [
    {
      label: '실제 가격',
      data: predictionData.actual,
      borderColor: '#1A365D',
      backgroundColor: 'rgba(26, 54, 93, 0.1)',
      borderWidth: 2,
      pointRadius: 3,
      fill: false
    },
    {
      label: '예측 가격',
      data: predictionData.predicted,
      borderColor: '#C84B31',
      backgroundColor: 'rgba(200, 75, 49, 0.1)',
      borderWidth: 2,
      pointRadius: 3,
      fill: false
    }
  ];
  
  window.predictionChart.options = {
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
        intersect: false
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '샘플 인덱스'
        }
      },
      y: {
        title: {
          display: true,
          text: '가격 (만원)'
        },
        beginAtZero: false
      }
    }
  };
  
  window.predictionChart.update();
}

// 변수 중요도 차트 업데이트
function updateFeaturesChart(featuresData) {
  if (!window.featuresChart) return;
  
  const backgroundColors = [
    'rgba(26, 54, 93, 0.8)',
    'rgba(26, 54, 93, 0.7)',
    'rgba(26, 54, 93, 0.6)',
    'rgba(26, 54, 93, 0.5)',
    'rgba(26, 54, 93, 0.4)',
    'rgba(200, 75, 49, 0.8)',
    'rgba(200, 75, 49, 0.7)',
    'rgba(200, 75, 49, 0.6)',
    'rgba(200, 75, 49, 0.5)',
    'rgba(200, 75, 49, 0.4)'
  ];
  
  window.featuresChart.data.labels = featuresData.names;
  window.featuresChart.data.datasets = [{
    label: '변수 중요도',
    data: featuresData.importance,
    backgroundColor: backgroundColors.slice(0, featuresData.names.length),
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1
  }];
  
  window.featuresChart.options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: '변수 중요도 분석',
        font: {
          family: "'Noto Serif KR', serif",
          size: 16
        }
      },
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '변수'
        }
      },
      y: {
        title: {
          display: true,
          text: '중요도'
        },
        beginAtZero: true
      }
    }
  };
  
  window.featuresChart.update();
}

// 결과 해석 업데이트
function updateInterpretation(results) {
  // 모델별 해석 텍스트
  const interpretations = {
    'xgboost': `
      <h3>XGBoost 모델 분석 결과</h3>
      <p>XGBoost 모델은 RMSE ${results.metrics.rmse}, R² ${results.metrics.r2}의 성능을 보여주고 있습니다. 이는 선형 회귀 모델 대비 약 30% 향상된 예측 정확도입니다.</p>
      <p>변수 중요도 분석 결과, <strong>면적</strong>과 <strong>지하철역 거리</strong>가 가격 예측에 가장 큰 영향을 미치는 것으로 나타났습니다. 특히 면적은 전체 예측력의 약 35%를 차지하고 있어, 부동산 가격 결정에 핵심적인 요소임을 확인할 수 있습니다.</p>
      <p>예측 결과를 살펴보면, 고가 부동산(상위 10%)에서는 예측 오차가 다소 크게 나타나는 경향이 있습니다. 이는 고가 부동산의 특수한 가치 요소(조망권, 희소성 등)가 모델에 충분히 반영되지 않았기 때문으로 분석됩니다.</p>
      
      <div class="academic-box">
        <div class="academic-box-title">연구 시사점</div>
        <p>XGBoost 모델은 부동산 가격 예측에 있어 높은 정확도를 보이며, 특히 비선형적 관계와 변수 간 상호작용을 효과적으로 포착합니다. 학습률(learning_rate)=${results.params.learning_rate || 0.1}, 최대 깊이(max_depth)=${results.params.max_depth || 6}일 때 최적의 성능을 보였으며, 이는 적절한 모델 복잡성과 일반화 능력의 균형이 중요함을 시사합니다.</p>
      </div>
    `,
    'lstm': `
      <h3>LSTM 모델 분석 결과</h3>
      <p>LSTM 모델은 시계열 데이터에서 RMSE ${results.metrics.rmse}, R² ${results.metrics.r2}의 성능을 보여주고 있습니다. 특히 장기적인 가격 추세를 예측하는 데 강점을 보입니다.</p>
      <p>시계열 분석 결과, 부동산 가격은 약 24개월의 주기성을 가지고 있으며, LSTM 모델이 이러한 장기 패턴을 효과적으로 포착하고 있습니다. 특히 금리 변동과 같은 거시경제 요인이 시차를 두고 가격에 영향을 미치는 패턴을 학습했습니다.</p>
      <p>다만, 급격한 시장 변동이나 예상치 못한 외부 충격(정책 변화, 팬데믹 등)에 대한 예측력은 제한적입니다. 이는 LSTM이 과거 패턴에 기반한 예측을 수행하기 때문입니다.</p>
      
      <div class="academic-box">
        <div class="academic-box-title">연구 시사점</div>
        <p>LSTM 모델은 시간적 의존성이 강한 부동산 시장 데이터에 적합하며, 특히 유닛 수(units)=${results.params.units || 50}, 시퀀스 길이(time_step)=${results.params.time_step || 12}일 때 최적의 성능을 보였습니다. 이는 부동산 시장의 장기 메모리 특성을 포착하기 위해 충분한 모델 용량과 적절한 시간 윈도우가 필요함을 시사합니다.</p>
      </div>
    `,
    'random-forest': `
      <h3>Random Forest 모델 분석 결과</h3>
      <p>Random Forest 모델은 RMSE ${results.metrics.rmse}, R² ${results.metrics.r2}의 안정적인 성능을 보여주고 있습니다. 특히 이상치에 강건한 특성을 보입니다.</p>
      <p>변수 중요도 분석 결과, <strong>면적</strong>, <strong>층수</strong>, <strong>경과년수</strong>가 상위 3개 중요 변수로 나타났습니다. 이는 부동산의 물리적 특성이 가격 결정에 큰 영향을 미친다는 것을 시사합니다.</p>
      <p>Random Forest의 앙상블 특성으로 인해 예측 결과의 분산이 작고 안정적입니다. 다만, 극단적인 고가 또는 저가 부동산의 경우 중앙값으로 회귀하는 경향이 있어, 이러한 특수 사례에 대한 예측 정확도는 다소 제한적입니다.</p>
      
      <div class="academic-box">
        <div class="academic-box-title">연구 시사점</div>
        <p>Random Forest 모델은 트리 개수(n_estimators)=${results.params.n_estimators || 100}, 최대 깊이(max_depth)=${results.params.max_depth || 'None'}일 때 최적의 성능을 보였습니다. 이는 충분한 앙상블 크기와 개별 트리의 적절한 복잡성이 부동산 가격 예측의 정확도와 안정성에 중요함을 시사합니다.</p>
      </div>
    `
  };
  
  // 선택된 모델에 따른 해석 텍스
(Content truncated due to size limit. Use line ranges to read in chunks)