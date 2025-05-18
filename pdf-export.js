/**
 * 부동산금융투자를 위한 머신러닝 모델 - PDF 내보내기 기능
 * 작성일: 2025년 5월 18일
 */

// PDF 내보내기 관련 DOM 요소
const generatePdfButton = document.getElementById('generate-pdf');
const includeIntroCheckbox = document.getElementById('include-intro');
const includeModelsCheckbox = document.getElementById('include-models');
const includeCasesCheckbox = document.getElementById('include-cases');
const includeCodeCheckbox = document.getElementById('include-code');
const includeResultsCheckbox = document.getElementById('include-results');
const modelAllCheckbox = document.getElementById('model-all');
const modelXgboostCheckbox = document.getElementById('model-xgboost');
const modelLstmCheckbox = document.getElementById('model-lstm');
const modelRfCheckbox = document.getElementById('model-rf');
const pdfTitleInput = document.getElementById('pdf-title');
const pdfAuthorInput = document.getElementById('pdf-author');
const pdfFormatSelect = document.getElementById('pdf-format');

// PDF 내보내기 설정 객체
const pdfExportConfig = {
  filename: '부동산금융투자를_위한_머신러닝_모델.pdf',
  margin: 10,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { 
    scale: 2,
    useCORS: true,
    letterRendering: true
  },
  jsPDF: { 
    unit: 'mm', 
    format: 'a4', 
    orientation: 'portrait' 
  }
};

// MathJax 렌더링 완료 확인 함수
function isMathJaxReady() {
  return typeof MathJax !== 'undefined' && MathJax.Hub && MathJax.Hub.Queue;
}

// 모델 선택 체크박스 상호작용 설정
function setupModelCheckboxes() {
  // '모든 모델' 체크박스 변경 시 다른 모델 체크박스 상태 업데이트
  modelAllCheckbox.addEventListener('change', function() {
    const isChecked = this.checked;
    [modelXgboostCheckbox, modelLstmCheckbox, modelRfCheckbox].forEach(checkbox => {
      checkbox.checked = false;
      checkbox.disabled = isChecked;
    });
  });

  // 개별 모델 체크박스 변경 시 '모든 모델' 체크박스 상태 업데이트
  [modelXgboostCheckbox, modelLstmCheckbox, modelRfCheckbox].forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        modelAllCheckbox.checked = false;
      }
      
      // 모든 개별 모델이 선택되지 않았을 경우 '모든 모델' 자동 선택
      const anyModelSelected = [modelXgboostCheckbox, modelLstmCheckbox, modelRfCheckbox].some(cb => cb.checked);
      if (!anyModelSelected) {
        modelAllCheckbox.checked = true;
      }
    });
  });
}

// PDF 내보내기 준비 함수 (콘텐츠 필터링)
function preparePdfContent() {
  // 원본 콘텐츠 복제
  const contentContainer = document.createElement('div');
  contentContainer.className = 'pdf-container';
  
  // PDF 제목 및 메타데이터 설정
  const title = pdfTitleInput.value || '부동산금융투자를 위한 머신러닝 모델';
  const author = pdfAuthorInput.value || '';
  const format = pdfFormatSelect.value || 'a4';
  
  // PDF 설정 업데이트
  pdfExportConfig.filename = `${title.replace(/\s+/g, '_')}.pdf`;
  pdfExportConfig.jsPDF.format = format;
  
  // PDF 헤더 추가
  const header = document.createElement('div');
  header.className = 'pdf-header';
  header.innerHTML = `
    <h1>${title}</h1>
    ${author ? `<p class="pdf-author">작성자: ${author}</p>` : ''}
    <p class="pdf-date">생성일: ${new Date().toLocaleDateString('ko-KR')}</p>
    <hr>
  `;
  contentContainer.appendChild(header);
  
  // 선택된 섹션에 따라 콘텐츠 추가
  if (includeIntroCheckbox.checked) {
    const introSection = document.getElementById('intro').cloneNode(true);
    contentContainer.appendChild(introSection);
  }
  
  if (includeModelsCheckbox.checked) {
    const modelsSection = document.getElementById('models').cloneNode(true);
    
    // 선택된 모델만 포함
    if (!modelAllCheckbox.checked) {
      const modelCards = modelsSection.querySelectorAll('.model-card');
      modelCards.forEach(card => {
        const modelId = card.id;
        const shouldInclude = 
          (modelId === 'xgboost' && modelXgboostCheckbox.checked) ||
          (modelId === 'lstm' && modelLstmCheckbox.checked) ||
          (modelId === 'random-forest' && modelRfCheckbox.checked);
        
        if (!shouldInclude) {
          card.remove();
        }
      });
    }
    
    contentContainer.appendChild(modelsSection);
    
    // 선택된 모델의 상세 정보 추가
    if (!modelAllCheckbox.checked) {
      // 모델 상세 정보는 동적으로 생성되므로 여기서는 기본 구조만 추가
      const modelDetailsSection = document.createElement('div');
      modelDetailsSection.className = 'pdf-model-details';
      modelDetailsSection.innerHTML = '<h2>모델 상세 정보</h2>';
      
      // 선택된 모델에 따라 상세 정보 추가
      if (modelXgboostCheckbox.checked) {
        const xgboostDetails = createModelDetailContent('xgboost');
        modelDetailsSection.appendChild(xgboostDetails);
      }
      
      if (modelLstmCheckbox.checked) {
        const lstmDetails = createModelDetailContent('lstm');
        modelDetailsSection.appendChild(lstmDetails);
      }
      
      if (modelRfCheckbox.checked) {
        const rfDetails = createModelDetailContent('random-forest');
        modelDetailsSection.appendChild(rfDetails);
      }
      
      contentContainer.appendChild(modelDetailsSection);
    }
  }
  
  if (includeCasesCheckbox.checked) {
    const casesSection = document.getElementById('cases').cloneNode(true);
    
    // 탭 콘텐츠 처리 (PDF에서는 모든 탭 콘텐츠 표시)
    const tabPanes = casesSection.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
      pane.classList.add('active');
      pane.style.display = 'block';
    });
    
    contentContainer.appendChild(casesSection);
  }
  
  if (includeCodeCheckbox.checked) {
    // 코드 예시 섹션 추가
    const codeSection = document.createElement('div');
    codeSection.className = 'section';
    codeSection.innerHTML = `
      <h2>코드 예시</h2>
      <p class="section-intro">부동산금융투자 연구에 머신러닝 모델을 적용하기 위한 Python 코드 예시입니다.</p>
    `;
    
    // 선택된 모델에 따라 코드 예시 추가
    if (modelAllCheckbox.checked || modelXgboostCheckbox.checked) {
      const xgboostCode = document.querySelector('#code-snippet').cloneNode(true);
      const codeContainer = document.createElement('div');
      codeContainer.className = 'code-example';
      codeContainer.innerHTML = '<h3>XGBoost 코드 예시</h3>';
      codeContainer.appendChild(xgboostCode);
      codeSection.appendChild(codeContainer);
    }
    
    if (modelAllCheckbox.checked || modelLstmCheckbox.checked) {
      // LSTM 코드 예시 (JSON 데이터에서 가져옴)
      const codeContainer = document.createElement('div');
      codeContainer.className = 'code-example';
      codeContainer.innerHTML = `
        <h3>LSTM 코드 예시</h3>
        <pre><code class="language-python">
import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error

# 데이터 로드 및 전처리
data = pd.read_csv('real_estate_time_series.csv')
price_data = data['price'].values.reshape(-1, 1)

# 데이터 정규화
scaler = MinMaxScaler(feature_range=(0, 1))
price_scaled = scaler.fit_transform(price_data)

# 시계열 데이터셋 생성 함수
def create_dataset(dataset, time_step=1):
    X, y = [], []
    for i in range(len(dataset) - time_step - 1):
        X.append(dataset[i:(i + time_step), 0])
        y.append(dataset[i + time_step, 0])
    return np.array(X), np.array(y)

# 시계열 데이터셋 생성
time_step = 12  # 12개월 데이터로 다음 달 예측
X, y = create_dataset(price_scaled, time_step)

# 데이터셋 형태 변환 (LSTM 입력용)
X = X.reshape(X.shape[0], X.shape[1], 1)

# 학습/테스트 분할
train_size = int(len(X) * 0.8)
X_train, X_test = X[:train_size], X[train_size:]
y_train, y_test = y[:train_size], y[train_size:]

# LSTM 모델 구축
model = Sequential()
model.add(LSTM(50, return_sequences=True, input_shape=(time_step, 1)))
model.add(LSTM(50))
model.add(Dense(1))
model.compile(optimizer='adam', loss='mean_squared_error')

# 모델 학습
model.fit(X_train, y_train, epochs=100, batch_size=32, validation_data=(X_test, y_test), verbose=1)

# 예측 및 평가
y_pred = model.predict(X_test)
y_pred = scaler.inverse_transform(y_pred.reshape(-1, 1))
y_test_actual = scaler.inverse_transform(y_test.reshape(-1, 1))

rmse = np.sqrt(mean_squared_error(y_test_actual, y_pred))
print(f'RMSE: {rmse:.2f}')
        </code></pre>
      `;
      codeSection.appendChild(codeContainer);
    }
    
    if (modelAllCheckbox.checked || modelRfCheckbox.checked) {
      // Random Forest 코드 예시 (JSON 데이터에서 가져옴)
      const codeContainer = document.createElement('div');
      codeContainer.className = 'code-example';
      codeContainer.innerHTML = `
        <h3>Random Forest 코드 예시</h3>
        <pre><code class="language-python">
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# 데이터 로드
data = pd.read_csv('real_estate_data.csv')

# 특성과 타겟 분리
X = data.drop('price', axis=1)
y = data['price']

# 학습/테스트 데이터 분할
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Random Forest 모델 생성 및 학습
model = RandomForestRegressor(
    n_estimators=100,
    max_depth=None,
    min_samples_split=2,
    random_state=42
)
model.fit(X_train, y_train)

# 예측 및 평가
y_pred = model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f'RMSE: {rmse:.2f}')
print(f'R²: {r2:.4f}')

# 변수 중요도 확인
importance = model.feature_importances_
feature_importance = pd.DataFrame({
    'Feature': X.columns,
    'Importance': importance
}).sort_values('Importance', ascending=False)

print(feature_importance.head(10))
        </code></pre>
      `;
      codeSection.appendChild(codeContainer);
    }
    
    contentContainer.appendChild(codeSection);
  }
  
  if (includeResultsCheckbox.checked && document.getElementById('prediction-chart')) {
    // 시뮬레이션 결과 섹션 추가
    const resultsSection = document.createElement('div');
    resultsSection.className = 'section';
    resultsSection.innerHTML = `
      <h2>시뮬레이션 결과</h2>
      <p class="section-intro">실행한 머신러닝 모델의 시뮬레이션 결과입니다.</p>
    `;
    
    // 예측 결과 차트 추가
    const predictionChart = document.getElementById('prediction-chart').cloneNode(true);
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.appendChild(predictionChart);
    resultsSection.appendChild(chartContainer);
    
    // 성능 지표 추가
    const metricsContainer = document.createElement('div');
    metricsContainer.className = 'metrics-grid';
    
    const metrics = ['rmse', 'mae', 'r2', 'time'];
    metrics.forEach(metric => {
      const metricValue = document.getElementById(`metric-${metric}`).textContent;
      const metricCard = document.createElement('div');
      metricCard.className = 'metric-card';
      metricCard.innerHTML = `
        <h4>${metric.toUpperCase()}</h4>
        <div class="metric-value">${metricValue}</div>
      `;
      metricsContainer.appendChild(metricCard);
    });
    
    resultsSection.appendChild(metricsContainer);
    
    // 결과 해석 추가
    const interpretationText = document.getElementById('interpretation-text').cloneNode(true);
    resultsSection.appendChild(interpretationText);
    
    contentContainer.appendChild(resultsSection);
  }
  
  // 요약 및 참고문헌 섹션 추가
  const summarySection = document.createElement('div');
  summarySection.className = 'section';
  summarySection.innerHTML = `
    <h2>요약 및 참고문헌</h2>
    <div class="summary-content">
      <p>본 문서는 부동산금융투자 연구에 적용 가능한 다양한 머신러닝 모델을 소개하고, 각 모델의 작동 원리, 장단점, 적용 사례 등을 설명하였다. 특히 XGBoost, LSTM, Random Forest 등의 모델이 부동산 가격 예측, 투자 위험 분석, 시장 세분화 등 다양한 부동산금융 문제에 효과적으로 적용될 수 있음을 보여주었다.</p>
      
      <h3>주요 참고문헌</h3>
      <ul class="reference-list">
        <li>Chen, T., & Guestrin, C. (2016). XGBoost: A Scalable Tree Boosting System. In Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining (pp. 785-794).</li>
        <li>Hochreiter, S., & Schmidhuber, J. (1997). Long Short-Term Memory. Neural Computation, 9(8), 1735-1780.</li>
        <li>Breiman, L. (2001). Random Forests. Machine Learning, 45(1), 5-32.</li>
        <li>김OO, 이OO (2022). 머신러닝 기법을 활용한 부동산 가격 예측 모형 연구. 부동산학연구, 28(3), 45-67.</li>
      </ul>
    </div>
  `;
  contentContainer.appendChild(summarySection);
  
  // 푸터 추가
  const footer = document.createElement('div');
  footer.className = 'pdf-footer';
  footer.innerHTML = `
    <hr>
    <p>© 2025 부동산금융투자를 위한 머신러닝 모델 | 생성일: ${new Date().toLocaleDateString('ko-KR')}</p>
  `;
  contentContainer.appendChild(footer);
  
  return contentContainer;
}

// 모델 상세 정보 콘텐츠 생성 함수
function createModelDetailContent(modelId) {
  const modelDetail = document.createElement('div');
  modelDetail.className = 'model-detail';
  
  // 실제 구현에서는 JSON 데이터에서 모델 정보를 가져와 동적으로 생성
  // 여기서는 예시로 XGBoost 모델 정보만 하드코딩
  if (modelId === 'xgboost') {
    modelDetail.innerHTML = `
      <h3>XGBoost 상세 정보</h3>
      <div class="model-description">
        <p>XGBoost(eXtreme Gradient Boosting)는 그래디언트 부스팅 의사결정 트리(GBDT) 알고리즘의 최적화된 분산 구현체로, 2016년 Tianqi Chen과 Carlos Guestrin에 의해 개발되었다. 이 알고리즘은 여러 개의 약한 예측 모델(주로 의사결정 트리)을 순차적으로 학습시켜 이전 모델의 오차를 보완하는 방식으로 작동한다.</p>
        
        <div class="math-block">
          <h4>수학적 정의</h4>
          <p>XGBoost의 목적 함수는 다음과 같이 정의된다:</p>
          <div class="math-formula">
            \[ \mathcal{L} = \sum_{i=1}^{n} l(y_i, \hat{y}_i) + \sum_{k=1}^{K} \Omega(f_k) \]
          </div>
          <p>여기서 $l$은 손실 함수, $\Omega$는 정규화 항, $f_k$는 $k$번째 트리를 나타낸다. 예측값은 모든 트리의 출력 합으로 계산된다:</p>
          <div class="math-formula">
            \[ \hat{y}_i = \sum_{k=1}^{K} f_k(x_i) \]
          </div>
        </div>
        
        <div class="advantages-disadvantages">
          <div class="advantages">
            <h4>장점</h4>
            <ul>
              <li>높은 예측 정확도: 다양한 머신러닝 경진대회에서 우수한 성능을 보임</li>
              <li>효율적인 계산: 병렬 처리와 캐시 최적화를 통한 빠른 학습 속도</li>
              <li>과적합 방지: 정규화 기법을 내장하여 일반화 성능 향상</li>
              <li>결측치 처리: 자체적인 결측값 처리 알고리즘 포함</li>
              <li>변수 중요도: 특성 중요도를 자동으로 계산하여 모델 해석 용이</li>
            </ul>
          </div>
          <div class="disadvantages">
            <h4>단점</h4>
            <ul>
              <li>블랙박스 성향: 개별 트리는 해석 가능하나 전체 모델은 복잡함</li>
              <li>하이퍼파라미터 민감성: 최적 성능을 위한 파라미터 튜닝 필요</li>
              <li>메모리 사용량: 대규모 데이터셋에서 상당한 메모리 요구</li>
              <li>시계열 데이터 한계: 시간적 의존성을 직접적으로 모델링하지 않음</li>
            </ul>
          </div>
        </div>
        
        <div class="applications">
          <h4>부동산금융투자 적용 분야</h4>
          <ul>
            <li>부동산 가격 예측: 물리적 특성, 입지 조건, 경제 지표 등을 활용한 가격 모델링</li>
            <li>투자 수익률 예측: 다양한 요인을 고려한 ROI 예측</li>
            <li>시장 세분화: 유사한 특성을 가진 부동산 그룹 식별</li>
            <li>가치 평가 요인 분석: 가격 결정에 영향을 미치는 주요 변수 식별</li>
          </ul>
        </div>
      </div>
    `;
  } else if (modelId === 'lstm') {
    modelDetail.innerHTML = `
      <h3>LSTM 상세 정보</h3>
      <div class="model-description">
        <p>LSTM(Long Short-Term Memory)은 1997년 Hochreiter와 Schmidhuber에 의해 제안된 특수한 형태의 순환 신경망(RNN)으로, 기존 RNN의 장기 의존성 학습 문제(기울기 소실/폭발 문제)를 해결하기 위해 설계되었다. LSTM은 셀 상태(cell state)와 다양한 게이트 메커니즘을 통해 시계열 데이터에서 장기적인 패턴을 효과적으로 학습할 수 있다.</p>
        
        <!-- LSTM 상세 내용 -->
      </div>
    `;
  } else if (modelId === 'random-forest') {
    modelDetail.innerHTML = `
      <h3>Random Forest 상세 정보</h3>
      <div class="model-description">
        <p>Random Forest는 Leo Breiman에 의해 2001년에 제안된 앙상블 학습 방법으로, 다수의 의사결정 트리를 독립적으로 학습시키고 그 결과를 결합하는 방식으로 작동한다. 각 트리는 원본 데이터셋에서 부트스트랩 샘플링(중복을 허용한 무작위 샘플링)을 통해 선택된 데이터로 학습되며, 각 노드에서의 분할 시 전체 특성 중 무작위 하위 집합만을 고려한다.</p>
        
        <!-- Random Forest 상세 내용 -->
      </div>
    `;
  }
  
  return modelDetail;
}

// PDF 생성 및 다운로드 함수
function generatePdf() {
  // 로딩 표시
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator';
  loadingIndicator.innerHTML = `
    <div class="loading-spinner"></div>
    <p>PDF 생성 중...</p>
  `;
  document.body.appendChild(loadingIndicator);
  
  // MathJax 렌더링 완료 확인
  if (isMathJaxReady()) {
    MathJax.Hub.Queue(function() {
      setTimeout(function() {
        // PDF 콘텐츠 준비
        const pdfContent = preparePdfContent();
        
       
(Content truncated due to size limit. Use line ranges to read in chunks)