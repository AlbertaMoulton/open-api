---
title: "Oauth"
date: "2025-07-08"
---
# OAuth API（第三方授权）

Teamgaga 开放平台使用 OAuth 2.0 授权码模式。第三方应用通过以下流程获取用户授权：

```mermaid
sequenceDiagram
    participant User as 用户
    participant App as 第三方应用
    participant Auth as TG 授权服务
    participant API as TG 资源服务

    Note over User,API: 1. 授权阶段

    User->>App: 点击"使用 Teamgaga 登录"
    App->>Auth: GET /v1/oauth/apps?app_id=xxx
    Auth-->>App: 返回应用信息和用户信息
    App->>User: 展示授权页面
    User->>Auth: GET /v1/oauth/authorize (allow=true)
    Auth-->>User: 302 重定向到 redirect_url?code=xxx

    Note over User,API: 2. Token 阶段

    User->>App: 携带 code 访问回调地址
    App->>Auth: POST /v1/oauth/token (grant_type=access_token, code=xxx)
    Auth-->>App: 返回 access_token + refresh_token

    Note over User,API: 3. 资源阶段

    App->>API: GET /v1/oauth/users (Access access_token)
    API-->>App: 返回用户信息
    App->>API: GET /v1/oauth/communities (Access access_token)
    API-->>App: 返回用户社区列表

    Note over User,API: Token 刷新（可选）

    App->>Auth: POST /v1/oauth/token (grant_type=refresh_token)
    Auth-->>App: 返回新的 access_token
```

---

## Token 操作

**接口路径**
`POST /v1/oauth/token`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Oauth Token (base64(app_id:app_secret)) |

**Body**
[TokenReq](#TokenReq) 对象

**响应参数**

- **200**：返回 [TokenResp](#TokenResp) 对象

---

## 获取授权用户信息

**接口路径**
`GET /v1/oauth/users`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Access <access_token> |

**响应参数**

- **200**：返回 [ApiUserInfo](#ApiUserInfo) 对象

---

## 获取授权用户社区列表

**接口路径**
`GET /v1/oauth/communities`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Access <access_token> |

**响应参数**

- **200**：返回 [Community](#Community) 对象数组

---