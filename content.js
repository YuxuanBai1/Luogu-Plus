// Remove Luogu Ads
(function() {
  // AD
  const AD_PATTERNS = [
    // Commercial
    /(taobao|jd|pinduoduo)\.com/i,
    /item\.taobao\.com/i,
    /\.(tmall|1688)\.com/i,
    
    // Luogu
    /class\.luogu\.com\.cn\/course\//i,  // Course
    /blog\//i,
    /discuss\//i
  ];

  // Protected
  const PROTECTED_SELECTORS = [
    '#sidebar',         // Sidebar
    '.navigation',      // Navigation
    '.menu-list',       // Menu list
    'a[href^="/"]',     // Ordinary links
    'a[href*="user"]',   // User links
    '.card.padding-default' // Display card
  ];

  // Benben Board
   const REMOVE_BOARD = [
    {
      selector: '.lg-article',
      condition: (element) => {
        const h2 = element.querySelector('h2');
        return h2 && h2.textContent.trim() === '有什么新鲜事告诉大家';
      }
    }
  ];

  // isProtected
  function isProtected(element) {
    return PROTECTED_SELECTORS.some(selector => 
      element.closest(selector) !== null
    );
  }

  // AD detection
  function removeAds() {
    document.querySelectorAll('a[href], div.ad-container').forEach(element => {
      if (isProtected(element)) return;
      
      // Link AD
      const href = element.getAttribute('href');
      if (href && AD_PATTERNS.some(regex => regex.test(href))) {
        element.closest('div, section')?.remove();
        return;
      }
      
      // Visual AD
      if (element.textContent.match(/推广|广告|赞助/)) {
        const style = getComputedStyle(element);
        if (style.display.includes('banner') || style.zIndex > 1000) {
          element.remove();
        }
      }
    });
  }
  
  // Board detection
  function removeBorad() {
     REMOVE_BOARD.forEach(section => {
      document.querySelectorAll(section.selector).forEach(element => {
        if (section.condition(element) && !isProtected(element)) {
          element.remove();
        }
      });
    });
  }

  // Initial cleanup + security monitoring
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (!mutation.target.closest(PROTECTED_SELECTORS.join(','))) {
        removeAds();
        removeBorad();
      }
    });
  });

  removeAds();
  removeBorad();
  observer.observe(document, { childList: true, subtree: true });
})();

(function() {
    // life is not easy.TAT...
    const GithubLinkHTML = `
    <div class="lg-article am-hide-star" id="luogu-plus-star-section">
        <h2>少侠给个Star⭐呗！十分感谢❤️</h2>
        <p>生活不易，只求一份精神食粮。请少侠给个Star⭐！十分感谢❤️</p>
        <p>
            <strong>Github链接</strong><br>
            <a href="https://github.com/YuxuanBai1/Luogu-Plus" target="_blank">Luogu Plus - 洛谷加大杯</a> 
        </p>
    </div>`;

    let retryCount = 0;
    const maxRetry = 20; // 10 seconds (500ms × 20)

    function findAndInsert() {
        // Find target container
        const rightColumn = document.querySelector('.am-u-lg-3.am-u-md-4.lg-right');
        
        if (!rightColumn) {
            return false;
        }
        
        // Check if already exists
        if (document.getElementById('luogu-plus-star-section')) {
            return true;
        }
        
        // Insert
        rightColumn.insertAdjacentHTML('beforeend', GithubLinkHTML);
        
        // Periodic check to prevent removal
        setInterval(() => {
            if (!document.getElementById('luogu-plus-star-section')) {
                findAndInsert();
            }
        }, 3000);
        
        return true;
    }

    function init() {
        if (!findAndInsert()) {
            const retryInterval = setInterval(() => {
                retryCount++;
                if (findAndInsert() || retryCount >= maxRetry) {
                    clearInterval(retryInterval);
                }
            }, 500);
        }
    }

    // DOM mutation observer
    const observer = new MutationObserver(() => {
        if (!document.getElementById('luogu-plus-star-section')) {
            findAndInsert();
        }
    });

    // Initialization
    if (document.readyState === 'complete') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
    
    observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    });
})();

// Replace homepage
(function() {
  // Replace AD with Greeting
  function replaceAdWithGreeting() {
    const leftColumn = document.querySelector('.am-g > .am-u-md-8');
    if (!leftColumn) return;
    
    // Get avatar url
    const avatarImg = document.querySelector('.avatar');
    const avatarUrl = avatarImg ? avatarImg.src : 'https://cdn.luogu.com.cn/upload/usericon/1.png';
    const tmp = document.querySelector('.avatar');
    let userid = '0'; // default value

    if (tmp && tmp.src) {
      // Get "userid.png"
      const urlParts = tmp.src.split('/');
      const filename = urlParts[urlParts.length - 1];
      // Remove ".png", become userid
      userid = filename.includes('.') ? filename.split('.')[0] : filename;
    }
    // username and color class
    const colorClass = getUserColorClass();
    const username = getUsername();

    // homepage
    leftColumn.innerHTML = `
    <div class="welcome-card" style="
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        height: 100%;
        display: flex;
        flex-direction: column;
    ">
        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 15px;">
            <div class="avatar-container" style="
                flex-shrink: 0;
                width: 80px;
                height: 80px;
            ">
                <img src="${avatarUrl}" alt="头像" style="
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid #e0e0e0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                ">
            </div>
            
            <div class="welcome-content" style="
                flex: 1;
                text-align: left;
            ">
                <h2 style="margin: 0 0 5px 0; color: #4a7bd9; font-size: 1.5em;">
                    你好，<a href="/user/${userid}" class="${colorClass}" style="color: inherit;">${username}</a> ！
                </h2>
                <p style="margin: 0 0 10px 0; color: #666;">${getRandomEncouragement()}</p>
            </div>
        </div>
        
        <div class="button-container" style="
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 15px;
        ">
            <a href="/problem/random" class="action-btn" style="
                padding: 8px 12px;
                background: #4a7bd9;
                color: white;
                border-radius: 4px;
                text-decoration: none;
                white-space: nowrap;
                flex: 1 0 auto;
                max-width: 150px;
                text-align: center;
                font-size: 0.9em;
            ">
                <i class="am-icon-search"></i> 今日推荐
            </a>
            <a href="/article?category=4" class="action-btn" style="
                padding: 8px 12px;
                background: #5cb85c;
                color: white;
                border-radius: 4px;
                text-decoration: none;
                white-space: nowrap;
                flex: 1 0 auto;
                max-width: 150px;
                text-align: center;
                font-size: 0.9em;
            ">
                <i class="am-icon-book"></i> 算法笔记
            </a>
            <a href="/discuss" class="action-btn" style="
                padding: 8px 12px;
                background: #f0ad4e;
                color: white;
                border-radius: 4px;
                text-decoration: none;
                white-space: nowrap;
                flex: 1 0 auto;
                max-width: 150px;
                text-align: center;
                font-size: 0.9em;
            ">
                <i class="am-icon-comments"></i> 社区讨论
            </a>
        </div>
        
        <!-- Create Benben Container -->
        <div class="benben-form-container"></div>
    </div>`;
    
    // Add Benben Form
    const benbenContainer = leftColumn.querySelector('.benben-form-container');
    if (benbenContainer) {
      const benbenForm = createBenbenForm();
      benbenContainer.appendChild(benbenForm);
      
      // Create event listeners
      const benbenInput = benbenForm.querySelector('.benben-input');
      const benbenSubmit = benbenForm.querySelector('.benben-submit');
      
      benbenSubmit.addEventListener('click', () => {
        const content = benbenInput.value.trim();
        if (!content) { // If content is empty
          showBenbenResult('犇犇内容不能为空！', false);
          return;
        }
        
        // Display the status of "Sending"
        const loadingScreen = createBenbenLoadingScreen();
        
        sendBenben(content)
          .then(() => {
            loadingScreen.remove();
            showBenbenResult('犇犇发送成功！', true); // Success
            benbenInput.value = '';
          })
          .catch(error => {
            loadingScreen.remove();
            showBenbenResult('发送失败: ' + error, false); // Failed
          });
      });
    }
  }

  // Get Color Class
  function getUserColorClass() {
    try {
      // Find all class names that contain "lg-fg-"
      const elements = document.querySelectorAll('[class*="lg-fg-"]');
      for (const element of elements) {
        if (element.querySelector('a[href*="/user/"]')) {
          const classes = element.className.split(' ');
          const colorClass = classes.find(cls => cls.startsWith('lg-fg-'));
          if (colorClass) return colorClass;
        }
      }
      
      // Return the corresponding class name according to the dynamic level color rules of Luogu
      const userLink = document.querySelector('.lg-punch a[href*="user"]');
      if (userLink) {
        if (userLink.classList.contains('lg-fg-purple')) return 'lg-fg-purple'; // Purple (Admin)
        if (userLink.classList.contains('lg-fg-red')) return 'lg-fg-red'; // Red
        if (userLink.classList.contains('lg-fg-orange')) return 'lg-fg-orange'; // Orange
        if (userLink.classList.contains('lg-fg-green')) return 'lg-fg-green'; // Green
        if (userLink.classList.contains('lg-fg-blue')) return 'lg-fg-blue'; // Blue
        if (userLink.classList.contains('lg-fg-gray')) return 'lg-fg-gray'; // Gray
        if (userLink.classList.contains('lg-fg-brown')) return 'lg-fg-brown'; // Brown (Cheaters)
      }
      
      return 'lg-fg-gray'; // Default Name Color
    } catch (e) {
      return 'lg-fg-gray';
    }
  }

  // Get Username
  function getUsername() {
    try {
      const userLink = document.querySelector('.lg-punch a[href*="user"]');
      return userLink ? userLink.textContent : '同学';
    } catch (e) {
      return '同学';
    }
  }

  // Random Encouragement
  function getRandomEncouragement() {
    // Determination
    const encouragements = [
      '今天也是努力学习的一天！',
      '坚持刷题，进步看得见！',
      '每个bug都是进步的机会！',
      '编程之路，贵在坚持！',
      '你已经解决了N个问题，继续加油！',
      '不抛弃不放弃，终将成为大牛！',
      'bug改不完？那是你在走上坡路！',
      '代码要run，人生要燃！',
      '凌晨四点的IDE见证你的努力！',
      '从Hello World到改变世界！',
      '你的提交记录就是成长日记！',
      'AC一道题，智商+1！',
      '今天不刷题，比赛两行泪！',
      '二分答案一时爽，一直二分一直爽！',
      'DP虐我千百遍，我待DP如初恋！',
      '代码一次过，人品已爆发！',
      'AC不是终点，而是下一题的起点！',
      '算法是程序的灵魂，你值得拥有！',
      'CE不可怕，少个分号才尴尬！',
      '编译器：你代码有语法错误！ 我：不，是你在针对我！',
      'PC是出题人给你的提示：再想想边界条件！',
      'PC？说明离AC只差一个思路！',
      'WA是算法之路的必修课！',
      'WA不可怕，可怕的是不知道为什么WA！',
      'WA了？恭喜，你离AC又近了一步！',
      'RE提醒你：数组别越界，指针别乱飞！',
      'RE是计算机在说：‘你的逻辑有点问题’！',
      'TLE？优化算法，再战！',
      '暴力过不了？找更优解！',
      'TLE：你的代码还能更快！',
      'MLE警告：内存不是无限的！',
      '开数组别太豪横，小心MLE制裁！',
      'OLE？你B话太多了！',
      '输出太多？评测机都看不下去了！',
      'OLE提醒你：别在循环里乱打印！',
      'UKE？玄学错误，建议重启人生（bushi）！',
      '遇到UKE，说明你的代码让评测机都懵了！',
      'UKE是隐藏关卡，解出来你就是真大佬！',
      'AC是目标，WA是过程，RE是教训，TLE是动力',
      '今天的你：WA->TLE->RE->CE->OLE->……AC！',
      '你和代码之间必须有一个能run。'
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  // Create Benben Form
  function createBenbenForm() {
    const form = document.createElement('div');
    form.style.marginTop = '15px';
    form.style.borderTop = '1px solid #eee';
    form.style.paddingTop = '15px';
    
    form.innerHTML = `
      <div style="display: flex; gap: 8px;">
        <input type="text" class="benben-input" placeholder="有什么新鲜事告诉大家" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <button class="benben-submit" style="padding: 8px 16px; background: #DD514C; color: white; border: none; border-radius: 4px; cursor: pointer;">发射犇犇！</button>
      </div>
    `;
    
    return form;
  }

  // Create Benben Loading Screen
  function createBenbenLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    loadingScreen.innerHTML = `
      <div style="
        background: white;
        border-radius: 8px;
        padding: 25px;
        width: 200px;
        text-align: center;
      ">
        <div class="spinner" style="
          width: 40px;
          height: 40px;
          border: 4px solid rgba(74,123,217,0.3);
          border-radius: 50%;
          border-top-color: #4a7bd9;
          margin: 0 auto 15px;
          animation: spin 1s linear infinite;
        "></div>
        <p>发送中...</p>
      </div>
    `;
    
    // Create the spin animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    loadingScreen.appendChild(style);
    
    document.body.appendChild(loadingScreen);
    return loadingScreen;
  }

  // Show Benben Result
  function showBenbenResult(message, isSuccess) {
    const resultScreen = document.createElement('div');
    resultScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    resultScreen.innerHTML = `
      <div style="
        background: white;
        border-radius: 8px;
        padding: 25px;
        width: 250px;
        text-align: center;
      ">
        <div style="
          font-size: 48px;
          margin-bottom: 15px;
          color: ${isSuccess ? '#4a7bd9' : '#DD514C'};
        ">${isSuccess ? '✓' : '✗'}</div>
        <p style="margin-bottom: 20px;">${message}</p>
        <button class="close-btn" style="
          padding: 8px 16px;
          background: #4a7bd9;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">关闭</button>
      </div>
    `;
    
    document.body.appendChild(resultScreen);
    
    // Click the "Close" button
    resultScreen.querySelector('.close-btn').addEventListener('click', () => {
      resultScreen.remove();
    });
    
    // Click on the mask layer to close the pop-up window
    resultScreen.addEventListener('click', (e) => {
      if (e.target === resultScreen) {
        resultScreen.remove();
      }
    });
  }

  // Send Benben Message
  function sendBenben(content) {
    return new Promise((resolve, reject) => {
      const encodedContent = encodeURIComponent(content);
      const formData = `content=${encodedContent}`;
      
      fetch('https://www.luogu.com.cn/api/feed/postBenben', { // Luogu API
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
        },
        body: formData,
        credentials: 'include'
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('犇犇发送失败'); // Failed
        }
      })
      .then(data => {
        if (data.status && data.status === 200) {
          resolve();
        } else {
          reject(data.errorMessage || '未知错误'); // Unknown error
        }
      })
      .catch(error => {
        reject(error.message);
      });
    });
  }

  // init
  function init() {
    replaceAdWithGreeting();
    const checkInterval = setInterval(() => {
      const adSlider = document.querySelector('.am-u-md-8 .am-slider');
      if (adSlider) {
        replaceAdWithGreeting();
      } else {
        clearInterval(checkInterval);
      }
    }, 500);
    setTimeout(() => clearInterval(checkInterval), 5000);
  }

  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();