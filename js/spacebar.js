// Spacebar: only advance fragments, never change slides
document.addEventListener('keydown', function (e) {
  if (e.code === 'Space' || e.keyCode === 32) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof Reveal !== 'undefined') {
      var fragments = Reveal.availableFragments();
      if (fragments.next) {
        Reveal.nextFragment();
      }
    }
  }
}, true);
