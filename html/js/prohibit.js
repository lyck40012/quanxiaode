(function() {
  return
  function disableInteraction() {
    // 禁用鼠标左键（点击）
    document.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }, true);

    // 禁用右键菜单
    document.addEventListener('contextmenu', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }, true);

    // 禁用鼠标按下（不包括滚轮）
    document.addEventListener('mousedown', function(e) {
      if (e.button !== 1) { // 允许中键（滚轮点击）
        e.stopPropagation();
        e.preventDefault();
      }
    }, true);

    // 禁用键盘事件
    document.addEventListener('keydown', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }, true);
    document.addEventListener('keypress', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }, true);
    document.addEventListener('keyup', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }, true);


  }

  disableInteraction();
})();