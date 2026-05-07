---
title: "API 概述"
date: "2025-07-08"
---

# Teamgaga 开放平台 API 概述

当前提供了机器人交互、管理等功能以及三方应用登录授权相关的接口。

## 接入地址

Base URL: `https://open.teamgaga.com`

* **协议：** 仅支持 HTTPS
* **数据格式：** JSON
* **字符编码：** UTF-8

## 认证方式

| 认证类型 | Header 格式 | 适用接口 |
|----------|-------------|----------|
| Bot Token | `Authorization: Bot <bot_token>` | Bot API |
| Access Token | `Authorization: Access <access_token>` | OAuth 资源接口 |
| Base Token | `Authorization: Oauth <base64(app_id:app_secret)>` | OAuth Token 接口 |