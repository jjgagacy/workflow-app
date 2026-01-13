if (typeof window !== 'undefined') {
  const header = document.querySelector('header');

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.setAttribute('data-scrolled', 'true');
    } else {
      header.removeAttribute('data-scrolled');
    }
  };

  // 初始检查
  handleScroll();

  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleScroll);
}