---
title: "通用"
date: "2025-07-08"
---

# Bot API（机器人接口）

> **认证方式：** `Authorization: Teamgaga Token <bot_token>`

---

## Message（消息）

### 拉消息

**接口路径**
`GET /bot/v1/messages`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| limit | query | integer | 否 | 消息最大数，默认200，最大500 |
| filter | query | string[] | 否 | 消息类型过滤：im、event |

**响应参数**

- **200**：返回 [PullMessageResp](#PullMessageResp) 对象
- **500**：拉取失败

---

### 发送消息 V1

**接口路径**
`POST /bot/v1/messages`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |

**Body**
[SendMessageReq](#SendMessageReq) 对象

**响应参数**

- **200**：返回 `{"message_id": "123"}`

---

### 发送消息 V2

**接口路径**
`POST /bot/v2/messages`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |

**Body**
[SendMessageReq](#SendMessageReq) 对象

**响应参数**

- **200**：返回 `{"message_id": "123"}`

---

### 发送批量消息

**接口路径**
`POST /bot/v1/messages/batch`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |

**Body**
[BatchSendMessageReq](#BatchSendMessageReq) 对象

**响应参数**

- **200**：返回消息 ID 数组

---

### 发送 Markdown 消息

**接口路径**
`POST /bot/v1/md_messages`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |

**Body**
[SendMDMessageReq](#SendMDMessageReq) 对象

**响应参数**

- **200**：返回 `{"message_id": "123"}`

---

### 撤回消息

**接口路径**
`DELETE /bot/v1/channels/{id1}/messages/{id2}`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| id1 | path | string | 是 | 频道 ID |
| id2 | path | string | 是 | 消息 ID |

**响应参数**

- **200**：删除成功
- **500**：删除失败

---

### 编辑消息

**接口路径**
`PATCH /bot/v1/messages/{mid}`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| mid | path | string | 是 | 消息 ID |

**Body**
[EditMessageReq](#EditMessageReq) 对象

**响应参数**

- **200**：操作成功

---

### 消息表态

**接口路径**
`PATCH /bot/v1/channels/{cid}/messages/{mid}/reaction`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| cid | path | string | 是 | 频道 ID |
| mid | path | string | 是 | 消息 ID |

**Body**
[ReactionReq](#ReactionReq) 对象

**响应参数**

- **200**：操作成功

---

### 设置消息卡槽

**接口路径**
`POST /bot/v1/messages/keys`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |

**Body**
[AddKeysReq](#AddKeysReq) 对象

**响应参数**

- **200**：操作成功

---

### 取消设置消息卡槽

**接口路径**
`DELETE /bot/v1/messages/keys`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| key | query | string | 是 | 槽 |
| member_id | query | string | 是 | 用户 ID |
| message_id | query | string | 是 | 消息 ID |
| channel_id | query | string | 是 | 频道 ID |

**响应参数**

- **200**：操作成功

---

## Community（社区）

### 社区基本信息

**接口路径**
`GET /bot/v1/communities/{cid}`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| cid | path | string | 是 | 社区 ID |

**响应参数**

- **200**：返回 [Community](#Community) 对象

---

### 社区频道列表

**接口路径**
`GET /bot/v1/communities/{id}/channels`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| id | path | string | 是 | 社区 ID |

**响应参数**

- **200**：返回 [Channel](#Channel) 对象数组

---

### 成员列表

**接口路径**
`GET /bot/v1/communities/{cid}/members`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| cid | path | string | 是 | 社区 ID |
| limit | query | integer | 否 | 请求条数 |
| after | query | string | 否 | 分页页码 |
| exclude_user_id | query | string | 否 | 排除的用户 ID |
| keyword | query | string | 否 | 搜索关键字 |

**响应参数**

- **200**：返回 [ApiUserInfo](#ApiUserInfo) 对象数组

---

### 社区成员数量

**接口路径**
`GET /bot/v1/communities/{cid}/members/count`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| cid | path | string | 是 | 社区 ID |

**响应参数**

- **200**：返回整型数量

---

### 社区主 ID

**接口路径**
`GET /bot/v1/communities/{cid}/owner`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| cid | path | string | 是 | 社区 ID |

**响应参数**

- **200**：返回字符串 ID

---

### 封禁用户

**接口路径**
`POST /bot/v1/communities/{id}/ban`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| id | path | string | 是 | 社区 ID |

**Body**
[BanReq](#BanReq) 对象

**响应参数**

- **200**：操作成功

---

### 解除封禁

**接口路径**
`DELETE /bot/v1/communities/{id}/ban`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| id | path | string | 是 | 社区 ID |
| user_id | query | string | 是 | 用户 ID |

**响应参数**

- **200**：操作成功

---

### 禁言用户

**接口路径**
`POST /bot/v1/communities/{cid}/members/{id}/mute`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| cid | path | string | 是 | 社区 ID |
| id | path | string | 是 | 用户 ID |

**Body**
[MuteReq](#MuteReq) 对象

**响应参数**

- **200**：操作成功

---

### 解除禁言

**接口路径**
`DELETE /bot/v1/communities/{cid}/members/{id}/mute`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| cid | path | string | 是 | 社区 ID |
| id | path | string | 是 | 用户 ID |

**响应参数**

- **200**：操作成功

---

## Role（身份组）

### 身份组列表

**接口路径**
`GET /bot/v1/communities/{cid}/roles`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| cid | path | string | 是 | 社区 ID |

**响应参数**

- **200**：返回 [CommunityRole](#CommunityRole) 对象数组

---

### 批量修改成员角色

**接口路径**
`PATCH /bot/v1/communities/{cid}/roles`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| cid | path | string | 是 | 社区 ID |

**Body**
[AppendMemberRolesReq](#AppendMemberRolesReq) 对象

**响应参数**

- **200**：操作成功
 
---

### 身份组成员列表

**接口路径**
`GET /bot/v1/communities/{cid}/roles/{id}/members`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| cid | path | string | 是 | 社区 ID |
| id | path | string | 是 | 身份组 ID |
| limit | query | integer | 否 | 请求条数 |
| after | query | string | 否 | 分页页码 |
| exclude_user_id | query | string | 否 | 排除的用户 ID |
| keyword | query | string | 否 | 搜索关键字 |

**响应参数**

- **200**：返回 [ApiUserInfo](#ApiUserInfo) 对象数组

---

## User（用户）

### 获取用户基本信息

**接口路径**
`GET /bot/v1/users/{id}`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| id | path | integer | 是 | 用户 ID |
| community_id | query | string | 否 | 社区 ID |

**响应参数**

- **200**：返回 [ApiUserInfo](#ApiUserInfo) 对象

---

## DM（私信）

### 获取私聊频道

**接口路径**
`POST /bot/v1/users/{id}/dm`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |
| id | path | integer | 是 | 用户 ID |

**响应参数**

- **200**：返回 [DMChannel](#DMChannel) 对象

---

## Bot（机器人）

### 机器人详情

**接口路径**
`GET /bot/v1/me`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |

**响应参数**

- **200**：返回 [Bot](#Bot) 对象

---

## Image（图片）

### 上传图片

**接口路径**
`POST /bot/v1/upload/image`

**请求参数**

| 参数名 | 位置 | 类型 | 必填 | 描述 |
|--------|------|------|------|------|
| Authorization | header | string | 是 | Bot Token |

**Body**
[ImageUploadReq](#ImageUploadReq) 对象 (multipart/form-data)

**响应参数**

- **200**：返回 [ImageUploadResp](#ImageUploadResp) 对象
- **500**：上传失败

---


# 数据结构定义

## PullMessageResp

| 字段 | 类型 | 描述 |
|------|------|------|
| im | Message[] | IM 消息列表 |
| event | Event[] | 事件通知消息列表 |

## SendMessageReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| channel_id | string | 是 | 频道 ID |
| content | string | 是 | 正文 |
| type | integer | 是 | 消息类型：0文本，15签到 |
| attachments | Attachment[] | 否 | 附件 |
| ephemeral | boolean | 否 | 临时消息 |
| user_ids | string[] | 否 | 临时消息对象 |
| disable_reactions | boolean | 否 | 禁止表态 |
| reactions | ReactionItem[] | 否 | 附加表态 |
| richtext | boolean | 否 | 富文本 |

## BatchSendMessageReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| items | BatchMessageItem[] | 是 | 批量任务列表 |

## SendMDMessageReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| channel_id | integer | 是 | 频道 ID |
| content | string | 是 | Markdown 正文 |
| title | string | 否 | 标题 |

## EditMessageReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| channel_id | string | 是 | 频道 ID |
| content | string | 是 | 正文 |
| attachments | Attachment[] | 否 | 附件 |

## ReactionReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| enable | boolean | 是 | 启用/禁用 |
| name | string | 否 | 表情名称 |

## AddKeysReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| keys | string[] | 是 | 槽列表 |
| member_id | string | 是 | 用户 ID |
| message_id | string | 是 | 消息 ID |
| channel_id | string | 是 | 频道 ID |

## BanReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| user_id | string | 是 | 用户 ID |

## MuteReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| mute_time | integer | 是 | 禁言时长（秒） |
| channel_id | string | 否 | 频道 ID |

## AppendMemberRolesReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| member_id | string | 是 | 成员 ID |
| add_role_ids | string[] | 否 | 添加的角色 ID 列表 |
| del_role_ids | string[] | 否 | 删除的角色 ID 列表 |

## JoinReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| community_id | string | 否 | 社区 ID |
| channel_id | string | 否 | 频道 ID |
| app_id | string | 否 | 应用 ID |
| permissions | string | 否 | 权限值 |

## CallbackReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| channel_id | string | 否 | 频道 ID |
| community_id | string | 否 | 社区 ID |
| bot_id | string | 是 | 机器人 ID |
| message_id | string | 否 | 消息 ID |
| data | object | 否 | 携带数据 |

## Community

| 字段 | 类型 | 描述 |
|------|------|------|
| community_id | string | 社区 ID |
| owner_id | string | 社区主 ID |
| name | string | 社区名称 |
| icon | string | 社区图标 |
| banner_image | string | 横幅图片 |
| description | string | 社区描述 |
| private | boolean | 是否私有 |
| nickname | string | 用户在社区的昵称 |

## Channel

| 字段 | 类型 | 描述 |
|------|------|------|
| channel_id | string | 频道 ID |
| community_id | string | 社区 ID |
| parent_id | string | 分类 ID |
| name | string | 频道名称 |
| position | integer | 位置 |
| type | integer | 频道类型 |
| description | string | 频道描述 |
| relation_id | string | 关联用户 ID（DM） |
| private | boolean | 是否私密 |

## CommunityRole

| 字段 | 类型 | 描述 |
|------|------|------|
| community_id | string | 社区 ID |
| role_id | string | 身份组 ID |
| color | integer | 颜色 |
| visible | boolean | 是否可见 |
| type | integer | 类型 |
| mentionable | boolean | 可被提及 |
| name | string | 名称 |
| permissions | string | 权限值 |
| position | integer | 位置 |
| tags | string | 标签 |

## ApiUserInfo

| 字段 | 类型 | 描述 |
|------|------|------|
| user_id | string | 用户 ID |
| username | string | 用户名 |
| nickname | string | 昵称 |
| avatar | string | 头像 |
| joined_at | integer | 加入时间 |
| role_ids | string[] | 角色 ID 列表 |
| community_nickname | string | 社区昵称 |
| bot | integer | 是否机器人 |
| relation | integer | 关系 |

## DMChannel

| 字段 | 类型 | 描述 |
|------|------|------|
| channel_id | string | 频道 ID |
| user | ApiUserInfo | 用户信息 |

## Bot

| 字段 | 类型 | 描述 |
|------|------|------|
| bot_id | string | 机器人 ID |
| name | string | 名称 |
| avatar | string | 头像 |
| permissions | string | 权限值 |
| type | integer | 类型 |
| privacy_mode | integer | 隐私模式 |

## ImageUploadReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| file | file | 是 | 图片文件 |
| operations | ImageOperation[] | 否 | 图片处理操作 |

## ImageUploadResp

| 字段 | 类型 | 描述 |
|------|------|------|
| url | string | 原始 URL |
| path | string | 路径 |
| cloudfront_url | string | CloudFront URL |
| md5 | string | MD5 |

## LoginReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| email | string | 否 | 邮箱（与 phone 二选一） |
| phone | string | 否 | 手机号（与 email 二选一） |
| password | string | 是 | 密码 |
| last_login_region | string | 否 | 登录城市 |
| area_code | integer | 否 | 区号（手机登录必填） |

## SmsLoginReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| phone | string | 是 | 手机号 |
| code | string | 是 | 验证码 |
| area_code | integer | 是 | 区号 |
| last_login_region | string | 否 | 登录城市 |

## UserInfo

| 字段 | 类型 | 描述 |
|------|------|------|
| open_id | string | 开平 ID |
| user_id | string | 用户 ID |
| avatar | string | 头像 |
| nickname | string | 昵称 |
| status | integer | 状态：0正常，1封禁 |
| auth_token | string | Token |
| joined_at | integer | 加入时间 |

## LoginQrcodeInfo

| 字段 | 类型 | 描述 |
|------|------|------|
| code | string | 二维码 code |
| status | integer | 状态：0待扫码，1已扫码，2已确认 |
| expire | integer | 过期时间（秒） |
| content | string | 二维码内容 |
| time | string | 生成时间 |

## ResetPasswordReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| email | string | 否 | 邮箱（与 phone 二选一） |
| phone | string | 否 | 手机号（与 email 二选一） |
| password | string | 是 | 新密码 |
| code | string | 是 | 验证码 |
| area_code | integer | 否 | 区号（手机必填） |

## VerificationCodeReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| content | string | 是 | 手机号或邮箱 |
| s_type | string | 是 | 类型：email/phone |
| b_type | string | 是 | 业务类型 |
| area_code | integer | 否 | 区号（手机必填） |
| last_login_region | string | 否 | 登录城市 |

## AppInfoResp

| 字段 | 类型 | 描述 |
|------|------|------|
| user | ApiUserInfo | 用户信息 |
| app | AppInfo | 应用信息 |
| redirect_urls | string[] | 重定向地址列表 |

## AuthorizeResp

| 字段 | 类型 | 描述 |
|------|------|------|
| code | string | 授权票据（1h有效） |
| redirect_url | string | 重定向地址 |
| state | string | 回填随机码 |
| scope | string | 授权范围 |

## TokenReq

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| code | string | 否 | 授权票据（换 access_token 时） |
| refresh | string | 否 | 刷新 Token（刷新时） |
| redirect_uri | string | 否 | 重定向地址 |
| grant_type | string | 是 | 类型：access_token/refresh_token |

## TokenResp

| 字段 | 类型 | 描述 |
|------|------|------|
| access | string | Access Token |
| refresh | string | Refresh Token |
| expires_at | integer | 过期时间戳 |
| scopes | string[] | 授权范围 |
