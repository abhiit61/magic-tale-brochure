document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Navigation & Mobile Drawer
     ========================================================================== */
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    
    // Animate hamburger lines
    const spans = mobileToggle.querySelectorAll('span');
    if (mobileToggle.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });

  // Close mobile drawer on navigation click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      const spans = mobileToggle.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    });
  });


  /* ==========================================================================
     2. Interactive Wizard Form (Steps Navigation)
     ========================================================================== */
  const steps = document.querySelectorAll('.wizard-step');
  const stepLines = document.querySelectorAll('.wizard-step-line');
  const formSteps = document.querySelectorAll('.form-step');
  const nextBtns = document.querySelectorAll('.next-step-btn');
  const prevBtns = document.querySelectorAll('.prev-step-btn');

  // Validate Step 1 before proceeding
  function validateStep1() {
    const nameInput = document.getElementById('child-name');
    if (!nameInput.value.trim()) {
      nameInput.style.borderColor = 'var(--color-secondary)';
      nameInput.focus();
      return false;
    }
    nameInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    return true;
  }

  // Handle Forward Step Navigation
  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const nextStepNum = parseInt(btn.getAttribute('data-next'));
      
      // Validation Check
      if (nextStepNum === 2 && !validateStep1()) {
        return;
      }

      goToStep(nextStepNum);
    });
  });

  // Handle Backward Step Navigation
  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const prevStepNum = parseInt(btn.getAttribute('data-prev'));
      goToStep(prevStepNum);
    });
  });

  function goToStep(stepNum) {
    // Update step classes
    steps.forEach((step, idx) => {
      const currentStepVal = idx + 1;
      step.classList.remove('active', 'completed');
      
      if (currentStepVal === stepNum) {
        step.classList.add('active');
      } else if (currentStepVal < stepNum) {
        step.classList.add('completed');
      }
    });

    // Update lines in-between steps
    stepLines.forEach((line, idx) => {
      const lineNum = idx + 1;
      if (lineNum < stepNum) {
        line.classList.add('completed-line');
      } else {
        line.classList.remove('completed-line');
      }
    });

    // Toggle Form Step Containers
    formSteps.forEach(stepContainer => {
      stepContainer.classList.remove('active');
    });
    document.getElementById(`form-step-${stepNum}`).classList.add('active');
  }


  /* ==========================================================================
     3. Drag and Drop Photo Upload & Scanner Simulation
     ========================================================================== */
  const uploadZone = document.getElementById('upload-zone');
  const photoInput = document.getElementById('photo-input');
  const previewsContainer = document.getElementById('uploaded-previews-container');
  const scannerAlert = document.getElementById('scanner-alert');
  const photoNextBtn = document.getElementById('photo-next-btn');
  const coverAvatarContainer = document.getElementById('avatar-empty-state');
  const coverAvatarImg = document.getElementById('child-photo-placeholder');
  const embeddedFaceHeadElements = document.querySelectorAll('.embedded-character-head');
  const embeddedFaceImages = document.querySelectorAll('.embedded-face-img');

  let uploadedImages = [];

  // Drag Events
  ['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
    }, false);
  });

  uploadZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handlePhotoFiles(files);
  });

  uploadZone.addEventListener('click', () => {
    photoInput.click();
  });

  photoInput.addEventListener('change', () => {
    handlePhotoFiles(photoInput.files);
  });

  function handlePhotoFiles(files) {
    if (!files.length) return;

    // Show simulated scanner animation
    scannerAlert.style.display = 'block';
    photoNextBtn.disabled = true;

    // Simulate AI scanning structure of the faces
    setTimeout(() => {
      scannerAlert.style.display = 'none';

      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target.result;
            if (uploadedImages.length < 3) {
              uploadedImages.push(dataUrl);
              renderThumbnails();
              updateAvatarPreview(dataUrl);
            }
          };
          reader.readAsDataURL(file);
        }
      });

      photoNextBtn.disabled = false;
    }, 1800);
  }

  function renderThumbnails() {
    previewsContainer.innerHTML = '';
    uploadedImages.forEach((imgUrl, index) => {
      const thumb = document.createElement('div');
      thumb.className = 'preview-thumbnail';
      
      const img = document.createElement('img');
      img.src = imgUrl;
      img.alt = `Uploaded Face ${index + 1}`;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-thumb-btn';
      removeBtn.innerHTML = '×';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        uploadedImages.splice(index, 1);
        renderThumbnails();
        
        if (uploadedImages.length === 0) {
          photoNextBtn.disabled = true;
          // Reset cover avatar
          coverAvatarContainer.style.display = 'block';
          coverAvatarImg.style.display = 'none';
          // Hide embedded page faces
          embeddedFaceHeadElements.forEach(el => el.style.display = 'none');
        } else {
          updateAvatarPreview(uploadedImages[0]);
        }
      });

      thumb.appendChild(img);
      thumb.appendChild(removeBtn);
      previewsContainer.appendChild(thumb);
    });
  }

  function updateAvatarPreview(imgUrl) {
    // Update cover circular avatar
    coverAvatarContainer.style.display = 'none';
    coverAvatarImg.src = imgUrl;
    coverAvatarImg.style.display = 'block';

    // Update embedded illustrations circular face overlay
    embeddedFaceHeadElements.forEach(el => el.style.display = 'block');
    embeddedFaceImages.forEach(img => {
      img.src = imgUrl;
    });
  }


  /* ==========================================================================
     4. Story Themes Selection
     ========================================================================== */
  const themeCards = document.querySelectorAll('.theme-card');
  let selectedTheme = 'cosmic';

  // Config mapping themes to assets & colors
  const themeConfigs = {
    cosmic: {
      image: 'assets/cosmic_quest.jpg',
      title: 'The Cosmic Voyage of',
      gradient: 'linear-gradient(135deg, rgba(38,20,95,0.85) 0%, rgba(9,10,35,0.95) 100%)',
      defaultLocation: 'The Nebula Valley',
      defaultQuest: 'finding the lost starlight compass'
    },
    fantasy: {
      image: 'assets/magical_forest.jpg',
      title: 'The Whispering Forest of',
      gradient: 'linear-gradient(135deg, rgba(16,73,50,0.85) 0%, rgba(5,20,15,0.95) 100%)',
      defaultLocation: 'The Emerald Meadow',
      defaultQuest: 'saving the glowing fox cub'
    },
    hero: {
      image: 'assets/future_hero.jpg',
      title: 'The Future Blueprint of',
      gradient: 'linear-gradient(135deg, rgba(87,35,20,0.85) 0%, rgba(20,5,10,0.95) 100%)',
      defaultLocation: 'The Tech Workshop',
      defaultQuest: 'assembling the helpful starlight robot'
    },
    cultural: {
      image: 'assets/cultural_journey.jpg',
      title: 'The Golden Kingdom of',
      gradient: 'linear-gradient(135deg, rgba(95,20,70,0.85) 0%, rgba(25,5,20,0.95) 100%)',
      defaultLocation: 'The Sunlit Palace Grounds',
      defaultQuest: 'uniting the lantern spirits'
    }
  };

  themeCards.forEach(card => {
    card.addEventListener('click', () => {
      themeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedTheme = card.getAttribute('data-theme');
      
      // Auto fill setting and core event based on selected theme if untouched
      const locationInput = document.getElementById('story-location');
      const eventInput = document.getElementById('story-event');
      const themeConfig = themeConfigs[selectedTheme];

      locationInput.value = themeConfig.defaultLocation;
      eventInput.value = themeConfig.defaultQuest;
    });
  });


  /* ==========================================================================
     5. Generate Free Preview Logic
     ========================================================================== */
  const generatePreviewBtn = document.getElementById('generate-preview-btn');
  const previewLoader = document.getElementById('preview-loader');
  
  // Elements to update in Book Preview
  const bookTitleDisp = document.getElementById('book-title-disp');
  const childNameBadge = document.getElementById('child-name-badge');
  const previewCoverBg = document.getElementById('preview-cover-bg');
  
  // Page Elements
  const p1Heading = document.getElementById('page-1-heading');
  const p1Body = document.getElementById('page-1-body');
  const p1Img = document.getElementById('page-1-img');
  
  const p2Heading = document.getElementById('page-2-heading');
  const p2Body = document.getElementById('page-2-body');
  const p2Img = document.getElementById('page-2-img');
  
  const p3Heading = document.getElementById('page-3-heading');
  const p3Body = document.getElementById('page-3-body');
  const p3Moral = document.getElementById('page-3-moral-disp');
  const p3Img = document.getElementById('page-3-img');

  generatePreviewBtn.addEventListener('click', () => {
    // 1. Gather custom inputs
    const childName = document.getElementById('child-name').value.trim() || 'Aria';
    const childAge = document.getElementById('child-age').value;
    const pronouns = document.getElementById('child-gender').value;
    const hobbies = document.getElementById('child-hobbies').value.trim() || 'drawing, stargazing';
    const culture = document.getElementById('child-culture').value.trim() || 'cultural lantern festivals';
    const location = document.getElementById('story-location').value.trim() || 'The Nebula Valley';
    const event = document.getElementById('story-event').value.trim() || 'finding the lost starlight compass';
    const moral = document.getElementById('story-moral').value;

    const themeConfig = themeConfigs[selectedTheme];

    // Pronoun Helpers
    const pronounSubject = pronouns === 'he' ? 'He' : (pronouns === 'she' ? 'She' : 'They');
    const pronounPossessive = pronouns === 'he' ? 'his' : (pronouns === 'she' ? 'her' : 'their');
    const pronounObject = pronouns === 'he' ? 'him' : (pronouns === 'she' ? 'her' : 'them');

    // 2. Show book loading simulation
    previewLoader.style.display = 'flex';
    
    // Smooth scroll to studio preview section
    document.getElementById('studio').scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      // 3. Update preview state variables
      bookTitleDisp.innerText = `${themeConfig.title} ${childName}`;
      childNameBadge.innerText = childName;
      
      // Update Cover Design Elements
      previewCoverBg.style.backgroundImage = `${themeConfig.gradient}, url('${themeConfig.image}')`;

      // Update Page 1 Contents
      p1Heading.innerText = `An Unexpected Adventure`;
      p1Body.innerHTML = `Once upon a time, in a magical place called <strong>${location}</strong>, there lived a bright ${childAge}-year-old child named <strong>${childName}</strong>. ${childName} was unlike any other child; ${pronounSubject.toLowerCase()} had a huge passion for <strong>${hobbies}</strong>, drawing stories and imagining massive galaxies.`;
      p1Img.style.backgroundImage = `url('${themeConfig.image}')`;

      // Update Page 2 Contents
      p2Heading.innerText = `The Call to Action`;
      p2Body.innerHTML = `One day, a grand quest unfolded! ${childName} set off on a crucial mission: <strong>${event}</strong>. Armed with only ${pronounPossessive} determination and the warmth of <strong>${culture}</strong> traditions, ${pronounSubject.toLowerCase()} ventured bravely forward.`;
      p2Img.style.backgroundImage = `url('${themeConfig.image}')`;

      // Update Page 3 Contents
      p3Heading.innerText = `The Starry Lesson`;
      p3Body.innerHTML = `Through perseverance and kindness, ${childName} saved the day and restored harmony. In honor of ${pronounPossessive} triumph, the sky lit up, spelling a glowing reminder for everyone: <strong id="page-3-moral-disp">"${moral}"</strong>.`;
      p3Moral.innerText = `"${moral}"`;
      p3Img.style.backgroundImage = `url('${themeConfig.image}')`;

      // Hide Loader & Reset book position to Cover Page
      previewLoader.style.display = 'none';
      resetBookPages();
    }, 1800);
  });


  /* ==========================================================================
     6. Interactive Flip Book Page Flipping
     ========================================================================== */
  const pages = document.querySelectorAll('.book-page');
  const prevPageBtn = document.getElementById('prev-page-btn');
  const nextPageBtn = document.getElementById('next-page-btn');
  const pageIndicator = document.getElementById('page-indicator');
  
  let currentPageIndex = 0; // 0 = Cover, 1 = Page 1, 2 = Page 2, 3 = Page 3

  function resetBookPages() {
    currentPageIndex = 0;
    showPage(0);
  }

  function showPage(index) {
    pages.forEach((page, idx) => {
      page.style.display = 'none';
      page.classList.remove('active-page');
    });

    const activePage = pages[index];
    if (activePage) {
      activePage.style.display = 'block';
      activePage.classList.add('active-page');
      
      // Page animation hook
      activePage.style.animation = 'fadeIn 0.5s ease-out';
    }

    // Update Controls & Indicators
    currentPageIndex = index;
    if (currentPageIndex === 0) {
      prevPageBtn.disabled = true;
      nextPageBtn.disabled = false;
      pageIndicator.innerText = 'Cover';
    } else {
      prevPageBtn.disabled = false;
      nextPageBtn.disabled = currentPageIndex === pages.length - 1;
      pageIndicator.innerText = `Page ${currentPageIndex} of 3`;
    }
  }

  nextPageBtn.addEventListener('click', () => {
    if (currentPageIndex < pages.length - 1) {
      showPage(currentPageIndex + 1);
    }
  });

  prevPageBtn.addEventListener('click', () => {
    if (currentPageIndex > 0) {
      showPage(currentPageIndex - 1);
    }
  });


  /* ==========================================================================
     7. Checkout Order Modal
     ========================================================================== */
  const checkoutBtn = document.getElementById('checkout-btn');
  const checkoutModal = document.getElementById('checkout-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  
  const summaryName = document.getElementById('summary-name');
  const summaryTheme = document.getElementById('summary-theme');
  const summaryMoral = document.getElementById('summary-moral');

  checkoutBtn.addEventListener('click', () => {
    const childName = document.getElementById('child-name').value.trim() || 'Aria';
    const moral = document.getElementById('story-moral').value;
    
    // Set Summary Details
    summaryName.innerText = childName;
    summaryTheme.innerText = selectedTheme.toUpperCase();
    summaryMoral.innerText = moral;

    // Show Modal
    checkoutModal.style.display = 'flex';
  });

  closeModalBtn.addEventListener('click', () => {
    checkoutModal.style.display = 'none';
  });


  /* ==========================================================================
     8. Accordion FAQ Animation
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other accordion items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-answer').style.maxHeight = '0';
      });

      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

});
