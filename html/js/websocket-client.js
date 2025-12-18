/**
 * 简单的WebSocket客户端封装函数
 * 提供基本的WebSocket连接和消息处理功能
 */
function isJSON(str) {
    if (typeof str !== "string") return false
    try {
        const result = JSON.parse(str)
        return typeof result === 'object' && result !== null
    } catch (error) {
        return false
    }
}

function createWebSocketClient(options = {}) {
    const {
        url = '',
        reconnectInterval = 3000,
        maxReconnectAttempts = 5,
        autoConnect = true,
        handshakeData = {
            "clientType": 1,
            "messageType": 2001
        },
        enableHandshake = true
    } = options;

    let ws = null;
    let reconnectAttempts = 0;
    let reconnectTimer = null;
    let isReconnecting = false;

    // 事件监听器
    const listeners = {
        open: [],
        close: [],
        error: [],
        message: [],
        reconnect: [],
        handshake: [],
        handshakeSuccess: [],
        handshakeError: []
    };

    /**
     * 连接WebSocket
     */
    function connect() {
        if (ws && ws.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            ws = new WebSocket(`ws://127.0.0.1:3003`);

            ws.onopen = (event) => {
                console.log('WebSocket连接已建立');
                reconnectAttempts = 0;
                isReconnecting = false;
                clearReconnectTimer();

                // 执行首次握手
                if (enableHandshake) {
                    performHandshake();
                } else {
                    emit('open', event);
                }
            };

            ws.onmessage = (event) => {
                handleMessage(event);
            };

            ws.onclose = (event) => {
                console.log('WebSocket连接已关闭');
                emit('close', event);

                // 如果不是手动关闭，尝试重连
                if (!event.wasClean && !isReconnecting) {
                    scheduleReconnect();
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket错误:', error);
                emit('error', error);
            };
        } catch (error) {
            console.error('WebSocket连接失败:', error);
            scheduleReconnect();
        }
    }

    /**
     * 断开WebSocket连接
     */
    function disconnect() {
        clearReconnectTimer();
        isReconnecting = false;
        if (ws) {
            ws.close();
            ws = null;
        }
    }

    /**
     * 安排重连
     */
    function scheduleReconnect() {
        if (isReconnecting || reconnectAttempts >= maxReconnectAttempts) {
            if (reconnectAttempts >= maxReconnectAttempts) {
                console.log('已达到最大重连次数，停止重连');
            }
            return;
        }

        isReconnecting = true;
        reconnectAttempts++;

        console.log(`尝试第 ${reconnectAttempts} 次重连，${reconnectInterval}ms 后开始...`);

        reconnectTimer = setTimeout(() => {
            emit('reconnect', { attempt: reconnectAttempts, maxAttempts: maxReconnectAttempts });
            connect();
        }, reconnectInterval);
    }

    /**
     * 清除重连定时器
     */
    function clearReconnectTimer() {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
    }

    /**
     * 发送消息
     */
    function send(data) {
        if (!isConnected()) {
            console.warn('WebSocket未连接，无法发送消息');
            return false;
        }

        try {
            const message = typeof data === 'string' ? data : JSON.stringify(data);
            ws.send(message);
            return true;
        } catch (error) {
            console.error('发送消息失败:', error);
            return false;
        }
    }

    /**
     * 检查连接状态
     */
    function isConnected() {
        return ws && ws.readyState === WebSocket.OPEN;
    }

    /**
     * 添加事件监听器
     */
    function on(event, callback) {
        if (listeners[event]) {
            listeners[event].push(callback);
        }
    }

    /**
     * 触发事件
     */
    function emit(event, data) {
        if (listeners[event]) {
            listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('事件处理器错误:', error);
                }
            });
        }
    }

    /**
     * 处理接收到的消息
     */
    function handleMessage(event) {
        // 如果启用了握手，先尝试处理握手响应
        if (enableHandshake && handleHandshakeResponse(event.data)) {
            return;
        }

        emit('message', event.data);
    }

    /**
     * 手动重连
     */
    function reconnect() {
        disconnect();
        reconnectAttempts = 0;
        connect();
    }

    /**
     * 获取重连状态
     */
    function getReconnectInfo() {
        return {
            isReconnecting,
            attempts: reconnectAttempts,
            maxAttempts: maxReconnectAttempts
        };
    }

    /**
     * 执行握手
     */
    function performHandshake() {
        try {
            emit('handshake', { data: handshakeData });
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(handshakeData));
                console.log('握手消息已发送');
            }
        } catch (error) {
            console.error('握手失败:', error);
            emit('handshakeError', error);
        }
    }

    /**
     * 处理握手响应
     */
    function handleHandshakeResponse(data) {
        try {
            const response = isJSON(data) ? JSON.parse(data) : data;

            if (response.type === 'handshakeResponse') {
                if (response.success) {
                    console.log('握手成功');
                    emit('handshakeSuccess', response);
                    emit('open', { handshakeComplete: true });
                } else {
                    console.error('握手被服务器拒绝:', response.message);
                    emit('handshakeError', new Error(response.message || '握手失败'));
                }
                return true;
            }
        } catch (error) {
            console.error('处理握手响应时出错:', error);
        }
        return false;
    }

    // 页面关闭时自动断开连接
    if (typeof window !== 'undefined') {
        const handlePageUnload = () => {
            disconnect();
        };

        window.addEventListener('beforeunload', handlePageUnload);
        window.addEventListener('unload', handlePageUnload);
    }

    // 自动连接
    if (autoConnect) {
        connect();
    }

    // 返回公共接口
    return {
        connect,
        disconnect,
        reconnect,
        send,
        isConnected,
        getReconnectInfo,
        performHandshake,
        on
    };
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = createWebSocketClient;
} else if (typeof window !== 'undefined') {
    window.createWebSocketClient = createWebSocketClient;
}
