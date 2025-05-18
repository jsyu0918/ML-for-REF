/**
 * 부동산금융투자를 위한 머신러닝 모델 - 검색 기능
 * 작성일: 2025년 5월 18일
 */

// 검색 관련 DOM 요소
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const searchContainer = document.querySelector('.search-container');

// 검색 결과 표시를 위한 모달 생성
let searchModal = document.createElement('div');
searchModal.className = 'modal search-modal';
searchModal.innerHTML = `
  <div class="modal-content">
    <div class="modal-header">
      <h2>검색 결과</h2>
      <button class="modal-close" aria-label="닫기">
        <span class="material-icons">close</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="search-stats">
        <p><span id="search-count">0</span>개의 결과가 검색되었습니다.</p>
      </div>
      <div class="search-filters">
        <button class="search-filter active" data-filter="all">전체</button>
        <button class="search-filter" data-filter="models">모델</button>
        <button class="search-filter" data-filter="cases">적용 사례</button>
        <button class="search-filter" data-filter="glossary">용어</button>
        <button class="search-filter" data-filter="code">코드</button>
      </div>
      <div id="search-results" class="search-results">
        <!-- 검색 결과가 여기에 동적으로 추가됩니다 -->
      </div>
      <div id="search-no-results" class="search-no-results hidden">
        <p>검색 결과가 없습니다. 다른 검색어를 시도해보세요.</p>
        <div class="search-suggestions">
          <h3>추천 검색어:</h3>
          <div class="suggestion-tags">
            <span class="suggestion-tag">XGBoost</span>
            <span class="suggestion-tag">LSTM</span>
            <span class="suggestion-tag">Random Forest</span>
            <span class="suggestion-tag">부동산 가격 예측</span>
            <span class="suggestion-tag">시계열 분석</span>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
document.body.appendChild(searchModal);

// 검색 데이터 구조 (실제 구현에서는 더 많은 콘텐츠 포함)
const searchData = [
  {
    id: 'xgboost',
    title: 'XGBoost',
    category: 'models',
    content: 'Extreme Gradient Boosting의 약자로, 그래디언트 부스팅 프레임워크의 최적화된 구현체이다. 높은 예측 성능과 계산 효율성을 특징으로 한다.',
    tags: ['앙상블 학습', '의사결정 트리', '부스팅', '회귀', '분류'],
    url: '#xgboost'
  },
  {
    id: 'lstm',
    title: 'LSTM',
    category: 'models',
    content: 'Long Short-Term Memory의 약자로, 시계열 데이터에서 장기 의존성을 학습할 수 있는 특수한 순환 신경망(RNN) 구조이다.',
    tags: ['딥러닝', '시계열', '순환 신경망', '장기 의존성'],
    url: '#lstm'
  },
  {
    id: 'random-forest',
    title: 'Random Forest',
    category: 'models',
    content: '다수의 의사결정 트리를 구축하고 그 예측을 결합하여 과적합을 줄이고 정확도를 높이는 앙상블 학습 방법이다.',
    tags: ['앙상블 학습', '의사결정 트리', '배깅', '회귀', '분류'],
    url: '#random-forest'
  },
  {
    id: 'case1',
    title: 'XGBoost를 활용한 아파트 가격 예측 모델',
    category: 'cases',
    content: '서울시 25개 구의 아파트 실거래가 데이터(2015-2022)를 활용하여 XGBoost 모델로 가격 예측 시스템을 구축한 사례이다.',
    tags: ['가격 예측', 'XGBoost', '아파트', '서울시', '실거래가'],
    url: '#case1'
  },
  {
    id: 'overfitting',
    title: '과적합(Overfitting)',
    category: 'glossary',
    content: '모델이 훈련 데이터에 지나치게 최적화되어 새로운 데이터에 대한 일반화 성능이 저하되는 현상.',
    tags: ['머신러닝 용어', '모델 평가', '일반화'],
    url: '#glossary'
  },
  {
    id: 'gradient-boosting',
    title: '그래디언트 부스팅(Gradient Boosting)',
    category: 'glossary',
    content: '이전 모델의 오차를 보완하는 방향으로 순차적으로 모델을 추가하는 앙상블 학습 방법.',
    tags: ['머신러닝 용어', '앙상블 학습', '부스팅'],
    url: '#glossary'
  },
  {
    id: 'code-xgboost',
    title: 'XGBoost 코드 예시',
    category: 'code',
    content: 'import pandas as pd\nimport numpy as np\nfrom xgboost import XGBRegressor\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score',
    tags: ['Python', 'XGBoost', '코드 예시', '회귀'],
    url: '#code-snippet'
  }
];

// 검색 인덱스 생성 (실제 구현에서는 더 효율적인 인덱싱 방법 사용)
let searchIndex = {};
searchData.forEach(item => {
  // 제목, 내용, 태그에서 검색 가능한 키워드 추출
  const keywords = [
    ...item.title.toLowerCase().split(/\s+/),
    ...item.content.toLowerCase().split(/\s+/),
    ...item.tags.map(tag => tag.toLowerCase())
  ];
  
  // 중복 제거 및 불용어 필터링
  const uniqueKeywords = [...new Set(keywords)].filter(keyword => 
    keyword.length > 1 && 
    !['의', '에', '를', '이', '가', '은', '는', '및', '와', '과', '로', '으로', '에서'].includes(keyword)
  );
  
  // 인덱스에 추가
  uniqueKeywords.forEach(keyword => {
    if (!searchIndex[keyword]) {
      searchIndex[keyword] = [];
    }
    searchIndex[keyword].push(item.id);
  });
});

// 검색 실행 함수
function performSearch(query) {
  if (!query || query.trim() === '') {
    return [];
  }
  
  query = query.toLowerCase().trim();
  const queryTerms = query.split(/\s+/);
  let resultIds = new Set();
  let resultScores = {};
  
  // 각 검색어에 대해 결과 수집
  queryTerms.forEach(term => {
    // 정확한 일치
    if (searchIndex[term]) {
      searchIndex[term].forEach(id => {
        resultIds.add(id);
        resultScores[id] = (resultScores[id] || 0) + 3; // 정확한 일치는 높은 점수
      });
    }
    
    // 부분 일치 (접두사 검색)
    Object.keys(searchIndex).forEach(keyword => {
      if (keyword.startsWith(term) && term !== keyword) {
        searchIndex[keyword].forEach(id => {
          resultIds.add(id);
          resultScores[id] = (resultScores[id] || 0) + 2; // 접두사 일치는 중간 점수
        });
      }
    });
    
    // 포함 검색 (부분 문자열)
    Object.keys(searchIndex).forEach(keyword => {
      if (keyword.includes(term) && !keyword.startsWith(term)) {
        searchIndex[keyword].forEach(id => {
          resultIds.add(id);
          resultScores[id] = (resultScores[id] || 0) + 1; // 부분 일치는 낮은 점수
        });
      }
    });
  });
  
  // 결과를 점수에 따라 정렬
  const results = Array.from(resultIds)
    .map(id => {
      const item = searchData.find(item => item.id === id);
      return {
        ...item,
        score: resultScores[id]
      };
    })
    .sort((a, b) => b.score - a.score);
  
  return results;
}

// 검색 결과 표시 함수
function displaySearchResults(results, query) {
  const searchResultsContainer = document.getElementById('search-results');
  const searchNoResults = document.getElementById('search-no-results');
  const searchCount = document.getElementById('search-count');
  
  // 결과 개수 업데이트
  searchCount.textContent = results.length;
  
  // 결과 컨테이너 초기화
  searchResultsContainer.innerHTML = '';
  
  if (results.length === 0) {
    // 결과가 없는 경우
    searchResultsContainer.classList.add('hidden');
    searchNoResults.classList.remove('hidden');
    return;
  }
  
  // 결과가 있는 경우
  searchResultsContainer.classList.remove('hidden');
  searchNoResults.classList.add('hidden');
  
  // 검색어 하이라이팅 함수
  function highlightText(text, query) {
    if (!query) return text;
    
    const queryTerms = query.toLowerCase().split(/\s+/);
    let highlightedText = text;
    
    queryTerms.forEach(term => {
      if (term.length < 2) return; // 짧은 검색어는 하이라이팅 제외
      
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<span class="highlight-primary">$1</span>');
    });
    
    return highlightedText;
  }
  
  // 결과 항목 생성 및 추가
  results.forEach(result => {
    const resultElement = document.createElement('div');
    resultElement.className = `search-result-item ${result.category}`;
    
    // 결과 내용 생성
    const contentPreview = result.content.length > 150 
      ? result.content.substring(0, 150) + '...' 
      : result.content;
    
    resultElement.innerHTML = `
      <h3 class="result-title">
        <a href="${result.url}">${highlightText(result.title, query)}</a>
        <span class="result-category">${getCategoryName(result.category)}</span>
      </h3>
      <p class="result-content">${highlightText(contentPreview, query)}</p>
      <div class="result-tags">
        ${result.tags.map(tag => `<span class="result-tag">${tag}</span>`).join('')}
      </div>
    `;
    
    searchResultsContainer.appendChild(resultElement);
  });
  
  // 검색 모달 표시
  document.querySelector('.search-modal').classList.add('active');
}

// 카테고리 이름 변환 함수
function getCategoryName(category) {
  const categoryNames = {
    'models': '모델',
    'cases': '적용 사례',
    'glossary': '용어',
    'code': '코드'
  };
  return categoryNames[category] || category;
}

// 검색 필터 기능
function setupSearchFilters() {
  const filterButtons = document.querySelectorAll('.search-filter');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // 활성 필터 업데이트
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      const filter = button.dataset.filter;
      const resultItems = document.querySelectorAll('.search-result-item');
      
      // 필터링 적용
      resultItems.forEach(item => {
        if (filter === 'all' || item.classList.contains(filter)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
      
      // 필터링 후 결과 개수 업데이트
      const visibleResults = document.querySelectorAll('.search-result-item[style="display: block"]');
      document.getElementById('search-count').textContent = visibleResults.length;
    });
  });
}

// 검색 제안 기능
function setupSearchSuggestions() {
  const suggestionTags = document.querySelectorAll('.suggestion-tag');
  
  suggestionTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const query = tag.textContent;
      searchInput.value = query;
      executeSearch(query);
    });
  });
}

// 실시간 검색 제안 기능
function setupLiveSearchSuggestions() {
  let suggestionsContainer = document.createElement('div');
  suggestionsContainer.className = 'search-suggestions-dropdown hidden';
  searchContainer.appendChild(suggestionsContainer);
  
  searchInput.addEventListener('input', debounce(() => {
    const query = searchInput.value.trim();
    
    if (query.length < 2) {
      suggestionsContainer.classList.add('hidden');
      return;
    }
    
    // 검색어에 기반한 제안 생성
    const suggestions = generateSuggestions(query);
    
    if (suggestions.length === 0) {
      suggestionsContainer.classList.add('hidden');
      return;
    }
    
    // 제안 표시
    suggestionsContainer.innerHTML = '';
    suggestions.forEach(suggestion => {
      const suggestionElement = document.createElement('div');
      suggestionElement.className = 'search-suggestion-item';
      suggestionElement.textContent = suggestion;
      suggestionElement.addEventListener('click', () => {
        searchInput.value = suggestion;
        executeSearch(suggestion);
        suggestionsContainer.classList.add('hidden');
      });
      suggestionsContainer.appendChild(suggestionElement);
    });
    
    suggestionsContainer.classList.remove('hidden');
  }, 300));
  
  // 포커스 아웃 시 제안 숨기기
  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target)) {
      suggestionsContainer.classList.add('hidden');
    }
  });
}

// 검색어 제안 생성 함수
function generateSuggestions(query) {
  if (!query || query.length < 2) return [];
  
  query = query.toLowerCase();
  const suggestions = new Set();
  
  // 인덱스에서 일치하는 키워드 찾기
  Object.keys(searchIndex).forEach(keyword => {
    if (keyword.includes(query) && suggestions.size < 5) {
      suggestions.add(keyword);
    }
  });
  
  // 데이터에서 일치하는 제목 찾기
  searchData.forEach(item => {
    if (item.title.toLowerCase().includes(query) && suggestions.size < 5) {
      suggestions.add(item.title);
    }
  });
  
  return Array.from(suggestions);
}

// 디바운스 함수 (연속 호출 방지)
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// 검색 실행 함수
function executeSearch(query) {
  const results = performSearch(query);
  displaySearchResults(results, query);
}

// 모바일 검색 토글 기능
function setupMobileSearch() {
  const searchToggle = document.createElement('button');
  searchToggle.className = 'mobile-search-toggle';
  searchToggle.innerHTML = '<span class="material-icons">search</span>';
  searchToggle.setAttribute('aria-label', '검색');
  
  // 모바일 메뉴 토글 버튼 옆에 추가
  mobileMenuToggle.parentNode.insertBefore(searchToggle, mobileMenuToggle.nextSibling);
  
  // 검색 토글 이벤트
  searchToggle.addEventListener('click', () => {
    searchContainer.classList.toggle('active');
    if (searchContainer.classList.contains('active')) {
      searchInput.focus();
    }
  });
}

// 검색 모달 닫기 기능
function setupSearchModalClose() {
  const closeButton = document.querySelector('.search-modal .modal-close');
  closeButton.addEventListener('click', () => {
    document.querySelector('.search-modal').classList.remove('active');
  });
  
  // ESC 키로 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.querySelector('.search-modal').classList.contains('active')) {
      document.querySelector('.search-modal').classList.remove('active');
    }
  });
}

// 검색 이벤트 리스너 설정
function setupSearchListeners() {
  // 검색 버튼 클릭
  searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      executeSearch(query);
    }
  });
  
  // 엔터 키 입력
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        executeSearch(query);
      }
    }
  });
}

// 검색 기능 초기화
function initSearch() {
  setupSearchListeners();
  setupSearchFilters();
  setupSearchSuggestions();
  setupLiveSearchSuggestions();
  setupMobileSearch();
  setupSearchModalClose();
  
  // 검색 스타일 추가
  const searchStyle = document.createElement('style');
  searchStyle.textContent = `
    /* 검색 결과 모달 스타일 */
    .search-modal .modal-content {
      max-width: 800px;
    }
    
    .search-stats {
      margin-bottom: var(--space-md);
      color: #666;
    }
    
    .search-filters {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs);
      margin-bottom: var(--space-md);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--space-sm);
    }
    
    .search-filter {
      background: none;
      border: none;
      padding: var(--space-xs) var(--space-sm);
      cursor: pointer;
      font-family: var(--font-sans);
      font-weight: 500;
      color: var(--color-black);
      position: relative;
    }
    
    .search-filter::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 0;
      height: 2px;
      background-color: var(--color-primary);
      transition: width var(--transition-normal);
    }
    
    .search-filter:hover::after {
      width: 100%;
    }
    
    .search-filter.active {
      color: var(--color-primary);
    }
    
    .search-filter.active::after {
      width: 100%;
    }
    
    .search-result-item {
      margin-bottom: var(--space-md);
      padding-bottom: var(--space-md);
      border-bottom: 1px solid var(--color-border);
    }
    
    .search-result-item:last-child {
      border-bottom: none;
    }
    
    .result-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-xs);
    }
    
    .result-title a {
      color: var(--color-primary);
      font-size: 1.2rem;
      margin-right: var(--space-sm);
    }
    
    .result-category {
      background-color: var(--color-light-bg);
      color: var(--color-primary);
      padding: 0.2em 0.6em;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 500;
      white-space: nowrap;
    }
    
    .result-content {
      margin-bottom: var(--space-sm);
    }
    
    .result-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs);
    }
    
    .result-tag {
      background-color: var(--color-light-bg);
      padding: 0.2em 0.6em;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
    }
    
    .highlight-primary {
      background-color: rg
(Content truncated due to size limit. Use line ranges to read in chunks)