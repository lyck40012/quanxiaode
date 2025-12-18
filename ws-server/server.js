import { WebSocketServer } from "ws";
import { randomUUID } from "crypto";

const PORT = process.env.WS_PORT ? Number(process.env.WS_PORT) : 3003;
const HANDSHAKE_MESSAGE_TYPE = 2001;
const HANDSHAKE_TIMEOUT = 10_000; // 握手超时时间

// 存储客户端状态，便于广播及调试
const clients = new Map();

const wss = new WebSocketServer({ port: PORT });
console.log(`WebSocket服务已启动，端口: ${PORT}`);

wss.on("connection", (socket, req) => {
    const clientId = randomUUID();
    const clientMeta = {
        id: clientId,
        ip: req.socket.remoteAddress,
        handshaked: false,
        handshakeTimer: null
    };

    clients.set(clientId, { socket, meta: clientMeta });
    console.log(`新客户端接入: ${clientMeta.ip} (${clientId})`);

    // 提示客户端先完成握手
    socket.send(JSON.stringify({
        type: "system",
        message: "连接成功，请先发送握手消息"
    }));

    // 限制握手时间，避免僵尸连接
    clientMeta.handshakeTimer = setTimeout(() => {
        if (!clientMeta.handshaked) {
            socket.send(JSON.stringify({
                type: "handshakeResponse",
                success: false,
                message: "握手超时，连接即将关闭"
            }));
            socket.close(4001, "handshake timeout");
            cleanupClient(clientId);
        }
    }, HANDSHAKE_TIMEOUT);

    socket.on("message", (raw) => {
        const payload = safeParse(raw.toString());

        if (!clientMeta.handshaked) {
            handleHandshake(socket, clientMeta, payload);
            return;
        }

        handleBusinessMessage(clientId, payload);
    });

    socket.on("close", (code, reason) => {
        console.log(`客户端断开: ${clientId}, code=${code}, reason=${reason}`);
        cleanupClient(clientId);
    });

    socket.on("error", (error) => {
        console.error(`客户端异常: ${clientId}`, error);
        cleanupClient(clientId);
    });
});

function handleHandshake(socket, clientMeta, payload) {
    if (
        !payload ||
        payload.messageType !== HANDSHAKE_MESSAGE_TYPE ||
        typeof payload.clientType === "undefined"
    ) {
        socket.send(JSON.stringify({
            type: "handshakeResponse",
            success: false,
            message: "握手消息格式不正确"
        }));
        return;
    }

    clientMeta.handshaked = true;
    if (clientMeta.handshakeTimer) {
        clearTimeout(clientMeta.handshakeTimer);
    }

    socket.send(JSON.stringify({
        type: "handshakeResponse",
        success: true,
        message: "握手成功",
        serverTime: new Date().toISOString()
    }));

    broadcast({
        type: "online",
        message: `客户端 ${clientMeta.id} 已上线`
    }, clientMeta.id);
}

function handleBusinessMessage(clientId, payload) {
    if (!payload) {
        return;
    }

    // 这里默认作为示例广播文本消息，可根据业务拓展
    const message = {
        type: "message",
        from: clientId,
        data: payload
    };

    broadcast(message, clientId);
}

function broadcast(data, excludeId) {
    const serialized = JSON.stringify(data);
    for (const [id, client] of clients.entries()) {
        if (client && client.socket.readyState === 1 && id !== excludeId) {
            client.socket.send(serialized);
        }
    }
}

function cleanupClient(clientId) {
    const client = clients.get(clientId);
    if (!client) return;

    if (client.meta.handshakeTimer) {
        clearTimeout(client.meta.handshakeTimer);
    }

    clients.delete(clientId);
}

function safeParse(str) {
    try {
        return JSON.parse(str);
    } catch (error) {
        console.error("解析消息失败", error);
        return null;
    }
}
