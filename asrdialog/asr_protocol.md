# asrDialog.html 通信协议文档

## 概述

`asrDialog.html` 是 EdgeScopeAI 项目中的智能语音对话前端页面，通过 WebSocket 与后端服务进行双向通信。

**通信方式**: WebSocket
**服务器地址**: `ws://127.0.0.1:3003`
**协议格式**: JSON

---

## 一、消息类型定义

### 1.1 基础 ASR 消息 (1004-1012)

| 消息类型 | 值 | 方向 | 名称 |
|---------|-----|------|------|
| WEBSOCKET_MSG_ASR | 1004 | 服务器→客户端 | ASR 实时文字消息 |
| WEBSOCKET_MSG_ASR_SEND_COMMAND | 1005 | 服务器→客户端 | ASR 发送指令消息 |
| WEBSOCKET_MSG_ASR_STATUS_UPDATE | 1006 | 服务器→客户端 | ASR 状态更新消息 |
| WEBSOCKET_MSG_ASR_AWAKEN | 1007 | 服务器→客户端 | ASR 唤醒消息 |
| WEBSOCKET_MSG_ASR_BUFFER_UPDATE | 1008 | 服务器→客户端 | ASR 缓冲区更新消息 |
| WEBSOCKET_MSG_ASR_REALTIME | 1009 | 服务器→客户端 | ASR 实时识别消息 |
| WEBSOCKET_MSG_ASR_TIMEOUT | 1010 | 服务器→客户端 | ASR 监听超时消息 |
| WEBSOCKET_MSG_ASR_BUFFER_CLEAR | 1011 | 服务器→客户端 | ASR 缓冲区清空消息 |
| WEBSOCKET_MSG_ASR_SEND_CONFIRM | 1012 | 客户端→服务器 | ASR 发送确认消息 |

### 1.2 Clinical ASR 消息 (2001-2005)

| 消息类型 | 值 | 方向 | 名称 |
|---------|-----|------|------|
| WEBSOCKET_MSG_ASR_TEXT_STREAM | 2001 | 服务器→客户端 | 编辑框流式推送文本 |
| WEBSOCKET_MSG_ASR_CLEAR_INPUT | 2002 | 服务器→客户端 | 编辑框清空 |
| WEBSOCKET_MSG_ASR_WITH_SCREENSHOT | 2003 | 服务器→客户端 | 语音识别带截图 |
| WEBSOCKET_MSG_ASR_USER_MESSAGE | 2004 | 服务器→客户端 | 对话框推送用户消息 |
| WEBSOCKET_MSG_LLM_RESPONSE | 2005 | 服务器→客户端 | LLM 对话响应消息 |

### 1.3 握手消息

| 消息类型 | 值 | 方向 | 名称 |
|---------|-----|------|------|
| WEBSOCKET_MSG_HANDSHAKE | 0 | 客户端→服务器 | 握手消息 |

---

## 二、消息格式详解

### 2.1 握手消息 (messageType: 0)

**方向**: 客户端 → 服务器
**触发时机**: WebSocket 连接建立后立即发送

```json
{
    "clientType": 1,
    "messageType": 0
}
```

| 字段 | 类型 | 说明 |
|-----|------|------|
| clientType | int | 客户端类型，1=PC_MAIN 主屏幕 |
| messageType | int | 固定为 0 |

---

### 2.2 ASR 实时文字消息 (messageType: 1004)

**方向**: 服务器 → 客户端
**用途**: 发送语音识别的文本结果

```json
{
    "messageType": 1004,
    "transcriptionText": "识别的文本内容",
    "currentText": "当前识别的片段",
    "cachedText": "缓存的完整内容",
    "detectedKeyword": false,
    "timestamp": "2025-11-25 10:30:45",
    "is_final": true,
    "hasCachedContent": true
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| messageType | int | 是 | 固定为 1004 |
| transcriptionText | string | 是 | 用于显示的识别文本 |
| currentText | string | 否 | 当前识别的片段 |
| cachedText | string | 否 | 缓存的完整内容 |
| detectedKeyword | bool | 否 | 是否检测到关键词（如"发送"、"清空"） |
| timestamp | string | 否 | 时间戳 |
| is_final | bool | 否 | 是否为最终结果（true=确认文本，false=临时文本） |
| hasCachedContent | bool | 否 | 是否有缓存内容 |

**前端处理逻辑**:
- 仅处理 `is_final=true` 的消息
- 调用 `updateInput()` 更新输入框内容
- 根据 `detectedKeyword` 显示关键词高亮样式

---

### 2.3 ASR 发送指令消息 (messageType: 1005)

**方向**: 服务器 → 客户端
**用途**: 触发前端执行特定命令

```json
{
    "messageType": 1005,
    "command": "send_message",
    "text": "要发送的内容",
    "originalText": "原始识别文本",
    "timestamp": "2025-11-25 10:30:45",
    "keyword": "发送"
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| messageType | int | 是 | 固定为 1005 |
| command | string | 是 | 命令类型（见下表） |
| text | string | 否 | 处理后的文本内容 |
| originalText | string | 否 | 原始识别文本 |
| timestamp | string | 否 | 时间戳 |
| keyword | string | 否 | 触发的关键词 |

**支持的命令类型**:

| command 值 | 说明 | 前端动作 |
|-----------|------|---------|
| send_message | 发送消息 | 调用 `sendMessage()` 发送当前输入 |
| clear | 清空输入 | 调用 `clearInput()` 清空输入框 |
| cancel | 取消操作 | 取消当前操作 |
| screenshot | 截图 | 截取当前帧 |
| new_conversation | 新建对话 | 开始新的对话会话 |

---

### 2.4 ASR 状态更新消息 (messageType: 1006)

**方向**: 服务器 → 客户端
**用途**: 更新 ASR 监听状态和唤醒状态

```json
{
    "messageType": 1006,
    "isListening": true,
    "statusText": "正在监听...",
    "isAwakened": true,
    "message": "ASR系统已唤醒，请开始说话",
    "timestamp": "2025-11-25 10:30:45"
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| messageType | int | 是 | 固定为 1006 |
| isListening | bool | 否 | 是否正在监听 |
| statusText | string | 否 | 状态文本 |
| isAwakened | bool | 否 | 是否已唤醒 |
| message | string | 否 | 提示消息 |
| timestamp | string | 否 | 时间戳 |

**前端处理逻辑**:
- 更新麦克风图标状态（监听/空闲）
- 显示状态文本
- 唤醒时添加系统消息到对话区

---

### 2.5 ASR 唤醒消息 (messageType: 1007)

**方向**: 服务器 → 客户端
**用途**: 系统唤醒通知

```json
{
    "messageType": 1007,
    "message": "系统已唤醒"
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| messageType | int | 是 | 固定为 1007 |
| message | string | 是 | 唤醒提示消息 |

---

### 2.6 ASR 缓冲区更新消息 (messageType: 1008)

**方向**: 服务器 → 客户端
**用途**: 更新缓冲区内容

```json
{
    "messageType": 1008,
    "bufferContent": "缓冲区内容",
    "sentenceComplete": true
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| messageType | int | 是 | 固定为 1008 |
| bufferContent | string | 是 | 缓冲区内容 |
| sentenceComplete | bool | 否 | 句子是否完整 |

---

### 2.7 ASR 实时识别消息 (messageType: 1009)

**方向**: 服务器 → 客户端
**用途**: 实时识别中间结果

```json
{
    "messageType": 1009,
    "realtimeText": "实时识别文本",
    "isPartial": true
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| messageType | int | 是 | 固定为 1009 |
| realtimeText | string | 是 | 实时识别的文本 |
| isPartial | bool | 是 | 是否为部分结果 |

---

### 2.8 ASR 监听超时消息 (messageType: 1010)

**方向**: 服务器 → 客户端
**用途**: 通知监听超时

```json
{
    "messageType": 1010
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| messageType | int | 是 | 固定为 1010 |

---

### 2.9 ASR 缓冲区清空消息 (messageType: 1011)

**方向**: 服务器 → 客户端
**用途**: 清空缓冲区并重置状态

```json
{
    "messageType": 1011,
    "message": "缓冲区已清空"
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| messageType | int | 是 | 固定为 1011 |
| message | string | 否 | 提示消息 |

---

### 2.10 ASR 发送确认消息 (messageType: 1012)

**方向**: 客户端 → 服务器
**用途**: 用户消息发送确认

```json
{
    "messageType": 1012,
    "message": "发送成功",
    "content": "用户发送的消息内容",
    "timestamp": "2025-11-25T10:30:45.000Z"
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| messageType | int | 是 | 固定为 1012 |
| message | string | 是 | 固定为 "发送成功" |
| content | string | 是 | 用户发送的消息内容 |
| timestamp | string | 是 | ISO 格式时间戳 |

---

### 2.11 编辑框流式推送文本 (messageType: 2001)

**方向**: 服务器 → 客户端
**用途**: 流式推送识别文本（备用协议）

```json
{
    "messageType": 2001,
    "text": "识别文本",
    "is_final": true
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| messageType | int | 是 | 固定为 2001 |
| text | string | 是 | 识别的文本 |
| is_final | bool | 否 | 是否为最终结果 |

---

### 2.12 编辑框清空 (messageType: 2002)

**方向**: 服务器 → 客户端
**用途**: 清空输入框

```json
{
    "messageType": 2002
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| messageType | int | 是 | 固定为 2002 |

---

### 2.13 语音识别带截图 (messageType: 2003)

**方向**: 服务器 → 客户端
**用途**: 发送截图预览

```json
{
    "messageType": 2003,
    "image_base64": "data:image/jpeg;base64,/9j/4AAQ...",
    "patient_name": "患者姓名",
    "timestamp": "2025-11-25 10:30:45"
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| messageType | int | 是 | 固定为 2003 |
| image_base64 | string | 是 | Base64 编码的图片（含 data URI 前缀） |
| patient_name | string | 否 | 患者姓名 |
| timestamp | string | 否 | 时间戳 |

**前端处理逻辑**:
- 显示图片预览区域
- 添加系统消息提示用户可以说"发送"来发送

---

### 2.14 对话框推送用户消息 (messageType: 2004)

**方向**: 服务器 → 客户端
**用途**: 推送用户之前的消息到对话框

```json
{
    "messageType": 2004,
    "content": "用户消息内容",
    "timestamp": "2025-11-25 10:30:45"
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| messageType | int | 是 | 固定为 2004 |
| content | string | 是 | 消息内容 |
| timestamp | string | 是 | 时间戳 |

---

### 2.15 LLM 对话响应消息 (messageType: 2005)

**方向**: 服务器 → 客户端
**用途**: 流式更新 AI 回复（支持 Markdown）

```json
{
    "messageType": 2005,
    "content": "AI回复内容（支持Markdown格式）",
    "message_id": "msg_abc123",
    "conversationId": "conv_xyz789",
    "round": 1,
    "is_final": true,
    "usage": {
        "prompt_tokens": 100,
        "completion_tokens": 50
    },
    "timestamp": "2025-11-25 10:30:45"
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| messageType | int | 是 | 固定为 2005 |
| content | string | 是 | AI 回复内容（支持 Markdown） |
| message_id | string | 是 | 消息唯一标识（用于流式更新） |
| conversationId | string | 否 | 对话 ID |
| round | int | 否 | 对话轮次 |
| is_final | bool | 否 | 是否为最终回复 |
| usage | object | 否 | Token 使用统计 |
| timestamp | string | 否 | 时间戳 |

**前端处理逻辑**:
- 根据 `message_id` 查找现有消息
- 存在则更新内容，不存在则创建新消息气泡
- 使用 `marked.parse()` 渲染 Markdown

---

## 三、关键词配置

### 3.1 唤醒词

```python
WAKE_WORDS = ["晓得", "晓得晓得", "JOJO", "你好"]
```

### 3.2 控制指令词

| 指令类型 | 关键词 | 触发动作 |
|---------|--------|---------|
| 发送 | "发送", "提交" | 发送当前输入 |
| 清空 | "清空", "重来" | 清空输入框 |
| 取消 | "取消", "算了" | 取消当前操作 |
| 截图 | "截图", "拍照" | 截取当前帧 |
| 新建对话 | "新建对话", "重新开始" | 开始新对话 |

---

## 四、消息流向图

```
┌─────────────────────────────────────────────────────────────┐
│                    消息流向示意图                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  asrDialog.html (前端)          服务端 (MainService)        │
│        │                              │                     │
│        │────── 握手(0) ──────────────>│                     │
│        │                              │                     │
│        │<────── 1004 文字消息 ────────│ (ASREngine)         │
│        │                              │                     │
│        │<────── 1005 发送指令 ────────│                     │
│        │                              │                     │
│        │<────── 1006 状态更新 ────────│                     │
│        │                              │                     │
│        │<────── 2003 截图消息 ────────│                     │
│        │                              │                     │
│        │<────── 2005 LLM回复 ─────────│ (ConversationMgr)   │
│        │                              │                     │
│        │────── 1012 发送确认 ────────>│                     │
│        │                              │                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 五、相关源文件

| 文件路径 | 说明 |
|---------|------|
| `res/html/h5/asrDialog.html` | 前端 H5 页面 |
| `res/html/js/websocket-client.js` | WebSocket 客户端封装 |
| `config/settings.py` | 消息类型定义 (ConfigWebsocketMsgType) |
| `config/asr_config.py` | ASR 配置（关键词、超时等） |
| `services/main_service.py` | 主服务消息处理 |
| `services/middleware/communication/websocket_manager.py` | WebSocket 服务端 |
| `services/business/business_modules/common/asr_engine.py` | ASR 引擎 |
| `services/business/business_modules/common/conversation_manager.py` | 对话管理器 |
| `services/utils/message_formatter.py` | 消息格式化工具 |

---

## 六、端口配置

| 端口 | 用途 |
|-----|------|
| 3003 | WebSocket 服务器（asrDialog 连接） |
| 3001 | UDP 用户信息端口 |
| 3002 | UDP 目标信息端口 |
| 6006 | ASR 服务器端口 |
