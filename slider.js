new Swiper(".mpf-swiper", {
    slidesPerView: 1,
    spaceBetween: 16,
    loop: false,
    speed: 450,
    a11y: { enabled: true },

    // autoplay opcional (se quiser, descomenta)
    // autoplay: { delay: 4500, disableOnInteraction: false },

    pagination: {
      el: ".mpf-swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".mpf-swiper-next",
      prevEl: ".mpf-swiper-prev",
    },
  });