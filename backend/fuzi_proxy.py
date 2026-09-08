# -*- coding: utf-8 -*-
"""
法护启航 · 夫子·明察（fuzi-mingcha）本地代理（FastAPI）
=====================================================
作用：为浏览器端提供一个“带 CORS 的 OpenAI 兼容接口”，
并把请求转发到本机正在运行的 vLLM / 其他 OpenAI 兼容服务。

为什么要代理：
  1) 纯前端页面直接请求 vLLM 会遇跨域（CORS）限制；
  2) 可统一默认模型名、隐藏上游细节、便于演示。

使用：
  pip install -r backend/requirements.txt
  python backend/fuzi_proxy.py

默认监听： http://127.0.0.1:8001/v1
环境变量：
  FUZI_UPSTREAM   上游地址，默认 http://127.0.0.1:8000/v1 （即 vLLM 默认端口）
  FUZI_MODEL      默认模型名，默认 fuzi-mingcha-v1_0
  PORT            代理监听端口，默认 8001
"""
import os
import logging

import httpx
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

UPSTREAM = os.environ.get("FUZI_UPSTREAM", "http://127.0.0.1:8000/v1").rstrip("/")
MODEL = os.environ.get("FUZI_MODEL", "fuzi-mingcha-v1_0")
PORT = int(os.environ.get("PORT", "8001"))

# 转发时需要剔除的逐跳（hop-by-hop）响应/请求头
HOP_HEADERS = {
    "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
    "te", "trailers", "transfer-encoding", "upgrade", "host", "content-length",
}

app = FastAPI(title="法护启航 · 夫子·明察代理", version="1.0")

# 允许浏览器（包括 file:// 打开页面）跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = httpx.AsyncClient(timeout=httpx.Timeout(600.0, connect=15.0))


@app.get("/")
async def root():
    return {
        "name": "法护启航 · 夫子·明察代理",
        "upstream": UPSTREAM,
        "model": MODEL,
        "health": "/health",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """健康检查：顺带探测上游 vLLM 是否在线"""
    try:
        r = await client.get(UPSTREAM + "/models", timeout=8)
        ok = r.status_code < 400
        return {
            "status": "ok" if ok else "upstream_error",
            "upstream": UPSTREAM,
            "model": MODEL,
            "upstream_status": r.status_code,
        }
    except Exception as exc:  # noqa: BLE001
        return JSONResponse(
            {"status": "down", "upstream": UPSTREAM, "model": MODEL, "error": str(exc)},
            status_code=503,
        )


@app.api_route("/v1/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
async def proxy(path: str, request: Request):
    """把 /v1/* 下的请求原样转发给上游（vLLM 等）"""
    url = UPSTREAM + "/" + path
    headers = {k: v for k, v in request.headers.items() if k.lower() not in HOP_HEADERS}
    body = await request.body()
    try:
        resp = await client.request(request.method, url, headers=headers, content=body)
    except Exception as exc:  # noqa: BLE001
        return JSONResponse(
            {
                "error": {
                    "message": f"无法连接上游模型服务 {UPSTREAM}：{exc}。请先启动 vLLM 等本地服务。",
                    "type": "upstream_error",
                }
            },
            status_code=502,
        )
    out_headers = {k: v for k, v in resp.headers.items() if k.lower() not in HOP_HEADERS}
    return Response(
        content=resp.content,
        status_code=resp.status_code,
        headers=out_headers,
        media_type=resp.headers.get("content-type"),
    )


if __name__ == "__main__":
    logging.info("法护启航代理启动： http://127.0.0.1:%s/v1  ->  上游 %s （模型 %s）", PORT, UPSTREAM, MODEL)
    uvicorn.run(app, host="127.0.0.1", port=PORT)