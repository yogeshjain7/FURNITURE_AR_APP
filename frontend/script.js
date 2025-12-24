document.addEventListener('DOMContentLoaded', () => {
  const backendUrl = '/api'; // API base URL
  let isLoggedIn = false;
  let pendingAction = null; // Stores the action to perform after login { action: 'view' | 'snapshot', card: element }
  let token = localStorage.getItem('token');

  // Furniture data will be fetched from API
  let furnitureData = [];

  // --- PWA Install Button Logic ---
  let deferredPrompt;
  const installButton = document.getElementById('install-btn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.style.display = 'block';
  });
  installButton.addEventListener('click', async () => {
    installButton.style.display = 'none';
    deferredPrompt.prompt();
  });
  window.addEventListener('appinstalled', () => {
    installButton.style.display = 'none';
    deferredPrompt = null;
  });

  // --- Slideshow Logic ---
  const slideshow = document.querySelector('.slideshow');
  if (slideshow) {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const slideshowContainer = document.getElementById('slideshow-container');
    let currentIndex = 0;
    let slideInterval;
    const moveToSlide = (index) => { slideshow.style.transform = `translateX(-${index * 100}%)`; };
    const showNextSlide = () => { currentIndex = (currentIndex + 1) % slides.length; moveToSlide(currentIndex); };
    const showPrevSlide = () => { currentIndex = (currentIndex - 1 + slides.length) % slides.length; moveToSlide(currentIndex); };
    const startSlideShow = () => { slideInterval = setInterval(showNextSlide, 5000); };
    const stopSlideShow = () => { clearInterval(slideInterval); };
    nextBtn.addEventListener('click', showNextSlide);
    prevBtn.addEventListener('click', showPrevSlide);
    slideshowContainer.addEventListener('mouseover', stopSlideShow);
    slideshowContainer.addEventListener('mouseout', startSlideShow);
    startSlideShow();
  }

  // --- Auth Modal & Form Logic (Connects to Backend) ---
  const authModal = document.getElementById('auth-modal');
  const loginNavBtn = document.getElementById('login-nav-btn');
  const authModalCloseBtn = document.getElementById('auth-modal-close-btn');
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const showLoginLink = document.getElementById('show-login');
  const showSignupLink = document.getElementById('show-signup');

  if (loginNavBtn) loginNavBtn.addEventListener('click', () => authModal.style.display = 'flex');
  if (authModalCloseBtn) authModalCloseBtn.addEventListener('click', () => {
      authModal.style.display = 'none';
      pendingAction = null; // Cancel pending action if modal is closed
  });
  
  if (showLoginLink) showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
  });
  if (showSignupLink) showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  });

  // --- Functions to execute actions after successful login ---
  function executePendingAction() {
    if (!pendingAction) return;

    if (pendingAction.action === 'view') {
        loadModel(pendingAction.card);
    } else if (pendingAction.action === 'snapshot') {
        takeSnapshot(pendingAction.card);
    }
    pendingAction = null; // Clear the action after executing it
  }

  // Email validation function
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  if (signupForm) signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const mobile = document.getElementById('signup-mobile').value;
    const password = document.getElementById('signup-password').value;

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
        const res = await fetch(`${backendUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, mobile, password })
        });
        const data = await res.json();
        alert(data.msg || "An error occurred.");
        if(res.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            isLoggedIn = true;
            authModal.style.display = 'none';
            loginNavBtn.style.display = 'none';
            document.getElementById('logout-btn').style.display = 'inline-block';
            const payload = JSON.parse(atob(token.split('.')[1]));
            const username = payload.user.username;
            document.getElementById('welcome-message').textContent = `Welcome ${username}`;
            document.getElementById('welcome-message').style.display = 'inline';
            executePendingAction();
            loadFurniture(); // Load furniture after login
        }
    } catch (err) {
        alert("Failed to connect to the server.");
    }
  });

  if (loginForm) loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
        const res = await fetch(`${backendUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        alert(data.msg || "An error occurred.");
        if(res.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            isLoggedIn = true;
            authModal.style.display = 'none';
            loginNavBtn.style.display = 'none';
            document.getElementById('logout-btn').style.display = 'inline-block';
            const payload = JSON.parse(atob(token.split('.')[1]));
            const username = payload.user.username;
            document.getElementById('welcome-message').textContent = `Welcome ${username}`;
            document.getElementById('welcome-message').style.display = 'inline';
            executePendingAction();
            loadFurniture(); // Load furniture after login
        }
    } catch (err) {
        alert("Failed to connect to the server.");
    }
  });

  // Logout functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    isLoggedIn = false;
    token = null;
    localStorage.removeItem('token');
    loginNavBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    document.getElementById('welcome-message').style.display = 'none';
    pendingAction = null; // Clear any pending actions
    // Clear furniture grid
    productGrid.innerHTML = '<p>Please log in to view furniture.</p>';
  });

  // --- Search and Filter Logic ---
  const searchBar = document.getElementById('search-bar');
  const filterButtons = document.querySelectorAll('.filter-btn');
  function filterProducts() {
    const allProductCards = document.querySelectorAll('.product-card');
    const searchQuery = searchBar.value.toLowerCase();
    const activeCategory = document.querySelector('.filter-btn.active').dataset.category;
    allProductCards.forEach(card => {
      const name = card.dataset.name.toLowerCase();
      const category = card.dataset.category;
      const matchesSearch = name.includes(searchQuery);
      const matchesCategory = (activeCategory === 'all' || category === activeCategory);
      if (matchesSearch && matchesCategory) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }
  if(searchBar) searchBar.addEventListener('input', filterProducts);
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      filterProducts();
    });
  });

  // --- Helper functions for actions ---
  function loadModel(card) {
      const modelViewer = card.querySelector('model-viewer');
      if (modelViewer && !modelViewer.hasAttribute('src')) {
          modelViewer.setAttribute('src', modelViewer.dataset.src);
      }
  }

  async function takeSnapshot(card) {
      const modelViewer = card.querySelector('model-viewer');
      if (modelViewer) {
          const blob = await modelViewer.toBlob({ idealAspect: true });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `snapshot-${card.dataset.name}.png`;
          link.click();
          URL.revokeObjectURL(url);
      }
  }

  // --- Main function to setup event listeners on each card ---
  function setupEventListenersForCard(card) {
      const arButton = card.querySelector('.ar-button');
      if(arButton) arButton.addEventListener('click', () => {
          if (!isLoggedIn) {
              pendingAction = { action: 'view', card: card };
              authModal.style.display = 'flex';
          } else {
              loadModel(card);
          }
      });

      const snapshotButton = card.querySelector('.snapshot-btn');
      if(snapshotButton) snapshotButton.addEventListener('click', () => {
          if (!isLoggedIn) {
              pendingAction = { action: 'snapshot', card: card };
              authModal.style.display = 'flex';
          } else {
              takeSnapshot(card);
          }
      });

      const clickableArea = card.querySelector('img');
      if(clickableArea) clickableArea.addEventListener('click', () => {
          const allProductCards = document.querySelectorAll('.product-card');
          const relatedModal = document.getElementById('related-modal');
          const relatedItemsGrid = document.getElementById('related-items-grid');
          relatedItemsGrid.innerHTML = '';
          const relatedItems = Array.from(allProductCards).filter(item => item.dataset.category === card.dataset.category && item.id !== card.id);
          relatedItems.slice(0, 3).forEach(item => {
              const clonedCard = item.cloneNode(true);
              setupEventListenersForCard(clonedCard); // Re-attach listeners to cloned cards
              relatedItemsGrid.appendChild(clonedCard);
          });
          if (relatedItems.length > 0) relatedModal.style.display = 'flex';
      });
  }

  // --- Related Items Modal Close Logic ---
  const relatedModal = document.getElementById('related-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => relatedModal.style.display = 'none');
  if (relatedModal) relatedModal.addEventListener('click', (event) => {
    if (event.target === relatedModal) relatedModal.style.display = 'none';
  });

  // --- Initial Data Loading Function ---
  const productGrid = document.querySelector('.product-grid');
  async function loadFurniture() {
      console.log('loadFurniture called, token:', !!token);
      if (!token) {
          productGrid.innerHTML = '<p>Please log in to view furniture.</p>';
          return;
      }
      try {
          console.log('Fetching furniture from:', `${backendUrl}/furniture`);
          const res = await fetch(`${backendUrl}/furniture`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          console.log('Fetch response status:', res.status);
          if (res.ok) {
              furnitureData = await res.json();
              console.log('Furniture data loaded:', furnitureData.length, 'items');
          } else {
              console.error('Failed to load furniture data, status:', res.status);
              alert('Failed to load furniture data');
              return;
          }
      } catch (err) {
          console.error('Error loading furniture data:', err);
          alert('Error loading furniture data');
          return;
      }
      productGrid.innerHTML = ''; // Clear grid
      furnitureData.forEach(item => {
          const card = document.createElement('div');
          card.className = 'product-card';
          card.id = `product-${item.id}`;
          card.dataset.category = item.category;
          card.dataset.name = item.name;
          card.innerHTML = `
              <img src="${item.imagePath}" alt="${item.name}">
              <h3>${item.name}</h3>
              <div class="product-dimensions"><p>${item.dimensions}</p></div>
              <model-viewer data-src="${item.modelPath}" alt="${item.name} Model" ar ar-placement="floor" auto-rotate camera-controls poster="${item.imagePath}"><div class="spinner" slot="progress-bar"></div></model-viewer>
              <div class="button-row">
                  <button class="btn ar-button">View in 3D/AR</button>
                  <button class="btn snapshot-btn">Snapshot 📸</button>
              </div>
          `;
          productGrid.appendChild(card);
          setupEventListenersForCard(card);
      });
  }

  // Always start logged out
  loadFurniture(); // Will show login message
});