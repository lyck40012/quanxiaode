const asrMessageTypes = [1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 2001, 2002, 2003, 2004, 2005];
if (!asrMessageTypes.includes(result.messageType)) {
  // 忽略非ASR消息（如胃质控消息1001、肠质控消息1002等）
  return;
}
switch (result.messageType) {
  case 1006:
    if (result.isAwakened) {
      const huanxingBox = document.querySelector('.huanxing-box');
      if (huanxingBox) {
        if (isZIndexHigh) {
          // 隐藏：先移除 show 类，触发动画
          huanxingBox.classList.remove('show');
          // 等动画完成后再改变 z-index
          setTimeout(() => {
            huanxingBox.style.zIndex = '-99';
          }, 500);
          isZIndexHigh = false;
        } else {
          // 显示：先设置 z-index，然后添加 show 类触发动画
          huanxingBox.style.zIndex = '99';
          setTimeout(() => {
            huanxingBox.classList.add('show');
          }, 10);
          isZIndexHigh = true;
        }
      }
    }
    break
  case 1004:
}