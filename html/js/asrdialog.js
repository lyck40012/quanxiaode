
let isZIndexHigh = false; // 记录唤醒气泡显示状态
let isMImageZIndexHigh = false; // 记录截图弹窗显示状态
let saveUserMessage = ''
let imgList = []
function start(result) {
  console.log("result=====>", result);

  switch (result.messageType) {
    case 2003:
      if (result.image_base64) {
        imgList.push(result.image_base64)
        chatGUI(true)
        addMessage('', 'user', result.timestamp);
      }
      break
    case 1004:
      const isFinal = result.is_final !== undefined ? result.is_final : true;
      if (result.transcriptionText && isFinal) {
        chatGUI(true)
        addMessage(result.transcriptionText, 'user', result.timestamp);
      }
      break
    case 1005:
      if (result.command === 'awaken') {
        chatLogo(true);
      } else if (result.command === 'cancel') {
        chatGUI(false)
        chatLogo(false)
        let boxContent = document.querySelector('.box-content')
        boxContent.textContent = null
        imgList = []
      }
      break
    case 2005:
      if (result.content && result.message_id) {
        chatGUI(true)
        addMessage(result.content, 'ai', result.timestamp);
      }
      imgList = []
      break;
  }
}




function addMessage(text, type = 'user', timestamp = null) {

  let boxContent = document.querySelector('.box-content')
  //时间
  const time = document.createElement('div');
  time.className = 'time';
  time.textContent = timestamp
    ? new Date(timestamp).toLocaleTimeString('zh-CN')
    : new Date().toLocaleTimeString('zh-CN');
  console.log(!text, type == 'user', !imgList.length);

  if (!text && type == 'user' && !imgList.length) return

  if (type == 'user') {
    console.log(11222);

    try {
      boxContent.textContent = null
      const userBox = document.createElement('div');
      userBox.className = 'user';
      const textBox = document.createElement('div');
      textBox.className = 'desc';
      textBox.textContent = text
      userBox.appendChild(textBox)
      if (imgList.length) {
        imgList.forEach((item, index) => {
          const img = document.createElement('img');
          img.src = item
          img.width = 80
          img.onclick = () => {
            console.log(item);
            window.open(item, '_blank');
          };
          userBox.appendChild(img)
        });

      }
      userBox.appendChild(time)
      boxContent.appendChild(userBox)
    } catch (error) {
      console.log("error====>", error);

    }
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
