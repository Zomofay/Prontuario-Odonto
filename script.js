/* ===== SCRIPT.JS — Funcionalidades do site ===== */
'use strict';

/* ================================================================
   CURSOR PERSONALIZADO
================================================================ */
const cursorRing = document.getElementById('cursorRing');
if (cursorRing) {
  // Mostrar cursor ao mover o mouse
  document.addEventListener('mousemove', (e) => {
    cursorRing.style.left = e.clientX + 'px';
    cursorRing.style.top = e.clientY + 'px';
    cursorRing.classList.add('is-visible');
  });
  
  // Esconder cursor ao sair da janela
  document.addEventListener('mouseleave', () => {
    cursorRing.classList.remove('is-visible');
  });
  
  // Efeito hover em elementos interativos
  document.addEventListener('mouseover', (e) => {
    const isInteractive = e.target.tagName === 'A' || 
                         e.target.tagName === 'BUTTON' || 
                         e.target.closest('button') ||
                         e.target.closest('a');
    if (isInteractive) {
      cursorRing.classList.add('is-hovering');
    }
  });
  
  document.addEventListener('mouseout', (e) => {
    const isInteractive = e.target.tagName === 'A' || 
                         e.target.tagName === 'BUTTON' || 
                         e.target.closest('button') ||
                         e.target.closest('a');
    if (isInteractive) {
      cursorRing.classList.remove('is-hovering');
    }
  });
}

/* ================================================================
   MENU MOBILE
================================================================ */
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', 
      navToggle.getAttribute('aria-expanded') === 'false' ? 'true' : 'false'
    );
  });
  
  // Fechar menu ao clicar em um link
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ================================================================
   COUNTERS (animação de números)
================================================================ */
const counters = document.querySelectorAll('.counter');
if (counters.length > 0) {
  const observerOptions = { threshold: 0.5 };
  const observerCallback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        const target = parseInt(entry.target.dataset.target);
        const suffix = entry.target.dataset.suffix || '';
        let current = 0;
        const increment = Math.ceil(target / 50);
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          entry.target.textContent = current + suffix;
        }, 40);
        
        entry.target.dataset.animated = 'true';
      }
    });
  };
  
  const observer = new IntersectionObserver(observerCallback, observerOptions);
  counters.forEach(counter => observer.observe(counter));
}

/* ================================================================
   SCROLL HORIZONTAL (Jornada)
================================================================ */
const journeyWrapper = document.getElementById('journeyWrapper');
const journeyTrack = document.getElementById('journeyTrack');
const journeyPrev = document.getElementById('journeyPrev');
const journeyNext = document.getElementById('journeyNext');
const journeyDots = document.querySelectorAll('.journey__dot');

if (journeyWrapper && journeyTrack) {
  let scrollIndex = 0;
  const itemWidth = 350;
  
  const updateJourney = () => {
    journeyTrack.style.transform = `translateX(-${scrollIndex * itemWidth}px)`;
    journeyDots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === scrollIndex);
    });
  };
  
  if (journeyNext) {
    journeyNext.addEventListener('click', () => {
      const maxScroll = journeyTrack.children.length - 1;
      if (scrollIndex < maxScroll) {
        scrollIndex++;
        updateJourney();
      }
    });
  }
  
  if (journeyPrev) {
    journeyPrev.addEventListener('click', () => {
      if (scrollIndex > 0) {
        scrollIndex--;
        updateJourney();
      }
    });
  }
  
  journeyDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      scrollIndex = index;
      updateJourney();
    });
  });
}

/* ================================================================
   SCROLL HORIZONTAL (Serviços)
================================================================ */
const servicesWrapper = document.getElementById('servicesWrapper');
const servicesTrack = document.getElementById('servicesTrack');

if (servicesWrapper && servicesTrack) {
  let serviceScrollIndex = 0;
  const serviceItemWidth = 320;
  
  // Auto-scroll dos serviços (opcional)
  setInterval(() => {
    const maxScroll = Math.ceil(servicesTrack.scrollWidth / serviceItemWidth) - 1;
    serviceScrollIndex = (serviceScrollIndex + 1) % (maxScroll + 1);
    servicesTrack.style.transform = `translateX(-${serviceScrollIndex * serviceItemWidth}px)`;
  }, 5000);
}

/* ================================================================
   SMOOTH SCROLL E NAVBAR ATIVA
================================================================ */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  // Navbar background ao scroll
  if (navbar) {
    navbar.classList.toggle('is-scrolled', window.scrollY > 50);
  }
  
  // Destacar nav link da seção atual
  let current = '';
  document.querySelectorAll('section[id]').forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('is-active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('is-active');
    }
  });
});

/* ================================================================
   FADE-IN ANIMATION (Intersection Observer)
================================================================ */
const fadeInElements = document.querySelectorAll('.fade-in');
if (fadeInElements.length > 0) {
  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeInObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  fadeInElements.forEach(el => fadeInObserver.observe(el));
}

/* ================================================================
   INICIALIZAÇÃO
================================================================ */
console.log('✅ Script carregado com sucesso!');
