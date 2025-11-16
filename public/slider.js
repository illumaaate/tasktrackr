// slider.js
function initSlider() {
  const slider = document.getElementById('task-slider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.slide'));
  const prev = slider.querySelector('.prev');
  const next = slider.querySelector('.next');
  const dots = Array.from(slider.querySelectorAll('.dot'));

  if (!slides.length) return;

  let index = 0;
  let autoTimer = null;
  const AUTO_DELAY = 7000; // автопереключение раз в 7 секунд

  function setActiveSlide(i) {
    slides.forEach((s, idx) => {
      const isActive = idx === i;
      s.classList.toggle('active', isActive);
      s.setAttribute('aria-hidden', String(!isActive));
    });
    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === i);
    });
    index = i;
  }

  function nextSlide() {
    const i = (index + 1) % slides.length;
    setActiveSlide(i);
  }

  function prevSlide() {
    const i = (index - 1 + slides.length) % slides.length;
    setActiveSlide(i);
  }

  function resetAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(nextSlide, AUTO_DELAY);
  }

  // кнопки
  if (prev) {
    prev.addEventListener('click', () => {
      prevSlide();
      resetAuto();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      nextSlide();
      resetAuto();
    });
  }

  // точки‑пагинация
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      setActiveSlide(idx);
      resetAuto();
    });
  });

  // управление с клавиатуры (стрелки)
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
      resetAuto();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
      resetAuto();
    }
  });

  // делаем контейнер фокусируемым для клавиатуры
  slider.setAttribute('tabindex', '0');

  // стартовое состояние
  setActiveSlide(0);
  resetAuto();
}

document.addEventListener('DOMContentLoaded', initSlider);
