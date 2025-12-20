const asrMessageTypes = [1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 2001, 2002, 2003, 2004, 2005];
let isZIndexHigh = false; // 记录唤醒气泡显示状态
let isMImageZIndexHigh = false; // 记录截图弹窗显示状态

if (!asrMessageTypes.includes(result.messageType)) {
  // 忽略非ASR消息（如胃质控消息1001、肠质控消息1002等）
  return;
}
switch (result.messageType) {
  case 1004:
    break
  case 1007:
    chatLogo(Boolean(result.isAwakened));
    break
  case 2004:
    if (result.content) {
      chatGUI(true)
      addMessage(result.content, 'user', result.timestamp);
    }
    break
  case 2005:
    if (result.content && result.message_id) {
      chatGUI(true)
      addMessage(result.content, 'ai', result.timestamp);
    }
    break;
}




function addMessage(text, type = 'user', timestamp = null, imageBase64 = null) {

  let boxContent = document.querySelector('.box-content')
  //时间
  const time = document.createElement('div');
  time.className = 'time';
  time.textContent = timestamp
    ? new Date(timestamp).toLocaleTimeString('zh-CN')
    : new Date().toLocaleTimeString('zh-CN');


  if (type == 'user') {
    const userBox = document.createElement('div');
    userBox.className = 'user';
    const textBox = document.createElement('div');
    textBox.className = 'desc';
    textBox.textContent = text
    userBox.appendChild(textBox)
    if (imageBase64) {
      const img = document.createElement('img');
      img.src = imageBase64
      img.width = 80
      img.onclick = () => {
        window.open(imageBase64, '_blank');
      };
      userBox.appendChild(img)
    }
    userBox.appendChild(time)
    boxContent.appendChild(userBox)
  } else {
    const systemBox = document.createElement('div');
    systemBox.className = 'left-copilot';

    const avatarBox = document.createElement('div');
    avatarBox.className = 'avatar-box';

    const systemLogo = document.createElement('img');
    systemLogo.className = 'avatar-box';
    systemLogo.src = '../image/avatar.png'
    systemLogo.width = 30
    avatarBox.appendChild(systemLogo)

    const logoText = document.createElement('span');
    logoText.className = 'avatar-box';
    logoText.textContent = 'Copilot'
    avatarBox.appendChild(logoText)
    systemBox.appendChild(avatarBox)


    const systemTextContent = document.createElement('div');
    systemTextContent.className = 'content';

    const textBox = document.createElement('div');
    textBox.innerHTML = marked.parse(text);
    systemTextContent.appendChild(textBox)

    systemTextContent.appendChild(time)
    systemBox.appendChild(systemTextContent)
    boxContent.appendChild(systemBox)
  }

}






function chatLogo(shouldShow) {
  const huanxingBox = document.querySelector('.huanxing-box');
  if (!huanxingBox) return;

  const show = Boolean(shouldShow);
  if (show === isZIndexHigh) return; // 状态未变化时不重复处理

  if (show) {
    huanxingBox.style.zIndex = '99';
    setTimeout(() => {
      huanxingBox.classList.add('show');
    }, 10);
  } else {
    huanxingBox.classList.remove('show');
    setTimeout(() => {
      huanxingBox.style.zIndex = '-99';
    }, 500);
  }

  isZIndexHigh = show;
}


function chatGUI(shouldShow) {
  const mImageBox = document.querySelector('.modal');
  const huanxingBox = document.querySelector('.huanxing-box');
  if (!mImageBox) return;

  const show = Boolean(shouldShow);
  if (show === isMImageZIndexHigh) return; // 状态未变化时不重复处理

  if (show) {
    mImageBox.style.zIndex = '99';
    if (huanxingBox) {
      huanxingBox.classList.add('hide-ripple');
    }
    setTimeout(() => {
      mImageBox.classList.add('show');
    }, 10);
  } else {
    mImageBox.classList.remove('show');
    if (huanxingBox) {
      huanxingBox.classList.remove('hide-ripple');
    }
    setTimeout(() => {
      mImageBox.style.zIndex = '-99';
    }, 500);
  }

  isMImageZIndexHigh = show;
}
