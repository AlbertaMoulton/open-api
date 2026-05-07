# 模型定义表格

## AddKeysReq
| 字段名      | 类型       | 必填 | 描述       |
|-------------|------------|------|------------|
| channel_id  | string     | 是   | 频道id     |
| keys        | string[]   | 是   | 槽         |
| member_id   | string     | 是   | 用户id     |
| message_id  | string     | 是   | 消息id     |

## ApiUserInfo
| 字段名             | 类型           | 必填 | 描述           |
|--------------------|--------------|------|----------------|
| user_id            | string       | 是   | 用户ID         |
| username           | string       | 是   | 用户名         |
| nickname           | string       | 是   | 昵称           |
| avatar             | string?      | 否   | 头像           |
| bot                | integer? | 否   | 是否机器人     |
| community_nickname | string?  | 否   | 社区昵称       |
| joined_at          | integer? | 否   | 加入时间       |
| role_ids           | string[]     | 否   | 角色ID列表     |

## App
| 字段名                 | 类型                | 必填 | 描述                          |
|------------------------|---------------------|------|-------------------------------|
| app_id                 | string              | 是   | 应用ID                        |
| name                   | string              | 是   | 应用名称                      |
| bot_id                 | string              | 是   | 机器人ID                      |
| created_at             | integer             | 是   | 创建时间                      |
| public_key             | string              | 是   | 公钥                          |
| market                 | boolean             | 是   | 是否上架                      |
| market_v2              | integer             | 是   | 上架状态                      |
| status                 | integer             | 是   | 应用状态(0正常/1停用/2禁用)   |
| description            | string?         | 否   | 简介                          |
| icon                   | string?         | 否   | 应用图标                      |
| commands               | CommandInfo[]?  | 否   | 指令集                        |
| install_params         | InstallParams?  | 否   | 安装参数                      |
| installed_count        | integer?        | 否   | 安装数量                      |
| privacy_policy         | string?         | 否   | 隐私政策                      |
| terms_of_service       | string?         | 否   | 服务条款                      |

## AppInfoResp
| 字段名         | 类型          | 必填 | 描述               |
|----------------|---------------|------|--------------------|
| user           | ApiUserInfo   | 是   | 用户信息           |
| app            | App           | 是   | 应用信息           |
| redirect_urls  | string[]? | 否   | 重定向地址列表     |

## AppScope
**类型**: string  
**枚举值**:
- `"communities"`
- `"user.info"`

## AppStats
| 字段名      | 类型      | 必填 | 描述                         |
|-------------|-----------|------|------------------------------|
| app_id      | string    | 是   | 应用id                       |
| pv          | integer   | 是   | 应用安装次数                 |
| uv          | integer   | 是   | 按社区id去重的应用安装次数   |
| updated_at  | string    | 是   | 数据统计更新时间             |

## AppendMemberRolesReq
| 字段名        | 类型       | 必填 | 描述           |
|---------------|------------|------|----------------|
| member_id     | string     | 是   | 成员ID         |
| add_role_ids  | string[]   | 否   | 添加的角色ID   |
| del_role_ids  | string[]   | 否   | 删除的角色ID   |

## Attachment
| 字段名         | 类型          | 必填 | 描述         |
|----------------|---------------|------|--------------|
| filename       | string        | 是   | 文件名       |
| url            | string        | 是   | URL地址      |
| size           | integer       | 是   | 文件大小     |
| blur_hash      | string?   | 否   | 模糊哈希     |
| content_type   | string?   | 否   | 内容类型     |
| duration_secs  | number?   | 否   | 持续时间     |
| height         | integer?  | 否   | 高度         |
| id             | integer?  | 否   | ID           |
| thumbnail      | string?   | 否   | 缩略图       |
| width          | integer?  | 否   | 宽度         |

## BanReq
| 字段名    | 类型    | 必填 | 描述    |
|-----------|---------|------|---------|
| user_id   | string  | 是   | 用户id  |

## BatchMessageItem
| 字段名             | 类型            | 必填 | 描述               |
|--------------------|-----------------|------|--------------------|
| channel_ids        | string[]        | 是   | 频道id列表         |
| content            | string          | 是   | 正文               |
| type               | integer         | 是   | 消息类型           |
| attachments        | Attachment[]    | 否   | 附件               |
| disable_reactions  | boolean?    | 否   | 禁止用户新增表态   |
| ephemeral          | boolean?    | 否   | 临时消息           |
| reactions          | ReactionItem[]  | 否   | 附加表态内容       |
| richtext           | boolean?    | 否   | 富文本             |
| user_ids           | string[]        | 否   | 临时消息的对象     |

## BatchSendMessageReq
| 字段名  | 类型                | 必填 | 描述         |
|---------|---------------------|------|--------------|
| items   | BatchMessageItem[]  | 是   | 批量任务列表 |

## Bot
| 字段名             | 类型          | 必填 | 描述                          |
|--------------------|---------------|------|-------------------------------|
| bot_id             | string        | 是   | 机器人ID                      |
| name               | string        | 是   | 机器人名称                    |
| permissions        | string        | 是   | 权限值                        |
| type               | BotType       | 是   | 机器人类型(0工具/1游戏/2影音) |
| privacy_mode       | integer       | 是   | 接收消息范围(0私聊+@/1全量)   |
| created_at         | integer       | 是   | 创建时间                      |
| avatar             | string?   | 否   | 头像                          |
| privacy_policy     | string?   | 否   | 隐私政策                      |
| terms_of_service   | string?   | 否   | 服务条款                      |
| token              | string?   | 否   | 生成token                     |

## BotType
**类型**: string  
**枚举值**:
- `"Tools"`
- `"Game"`
- `"Media"`

## BotTypeInfo
| 字段名  | 类型    | 必填 | 描述    |
|---------|---------|------|---------|
| name    | string  | 是   | 名称    |
| value   | integer | 是   | 值      |

## BusinessCode
**类型**: string  
**枚举值**:  
完整错误码列表（详见文档）

## CallbackReq
| 字段名        | 类型           | 必填 | 描述        |
|---------------|----------------|------|-------------|
| bot_id        | string         | 是   | 机器人id    |
| channel_id    | string?    | 否   | 频道id      |
| community_id  | string?    | 否   | 社区id      |
| data          | any            | 否   | 携带数据    |
| message_id    | string?    | 否   | 消息id      |

## Channel
| 字段名         | 类型           | 必填 | 描述           |
|----------------|----------------|------|----------------|
| channel_id     | string         | 是   | 频道id         |
| community_id   | string         | 是   | 社区id         |
| parent_id      | string         | 是   | 分类id         |
| name           | string         | 是   | 频道名称       |
| position       | integer        | 是   | 位置           |
| type           | integer        | 是   | 类型           |
| description    | string         | 是   | 频道描述       |
| private        | boolean?   | 否   | 私密           |
| relation_id    | string?    | 否   | 关联用户id(dm) |

## CommandInfo
| 字段名          | 类型           | 必填 | 描述                     |
|-----------------|----------------|------|--------------------------|
| command_id      | string         | 是   | command id               |
| name            | string         | 是   | 指令名称                 |
| visible_level   | integer        | 是   | 可见级别(0全部可见)      |
| type            | integer        | 是   | 指令类型(0小程序/1 H5页) |
| updated_at      | integer        | 是   | 更新时间                 |
| content         | string         | 否   | 访问链接                 |
| description     | string?    | 否   | 简介                     |
| pin             | integer?   | 否   | 顶置标识（顶置时间戳）   |

## CommandReq
| 字段名          | 类型            | 必填 | 描述                     |
|-----------------|-----------------|------|--------------------------|
| name            | string          | 是   | 指令名称                 |
| visible_level   | integer         | 是   | 可见级别(0全部可见)      |
| type            | integer         | 是   | 指令类型(0小程序/1 H5页) |
| command_id      | integer?    | 否   | command id               |
| content         | string          | 否   | 访问链接                 |
| description     | string?     | 否   | 简介                     |
| pin             | integer?    | 否   | 顶置标识（顶置时间戳）   |

## Community
| 字段名         | 类型           | 必填 | 描述         |
|----------------|----------------|------|--------------|
| community_id   | string         | 是   | 社区ID       |
| owner_id       | string         | 是   | 所有者ID     |
| name           | string         | 是   | 名称         |
| icon           | string         | 是   | 图标         |
| description    | string         | 是   | 描述         |
| private        | boolean        | 是   | 是否私有     |
| banner_image   | string?    | 否   | 横幅图片     |
| nickname       | string?    | 否   | 昵称         |





## CommunityBasicInfo
| 字段名         | 类型           | 必填 | 描述         |
|----------------|----------------|------|--------------|
| community_id   | string         | 是   | 社区ID       |
| owner_id       | string         | 是   | 所有者ID     |
| name           | string         | 是   | 名称         |
| icon           | string         | 是   | 图标         |
| status         | integer?   | 否   | 状态         |

## CommunityRole
| 字段名         | 类型           | 必填 | 描述                |
|----------------|----------------|------|---------------------|
| community_id   | string         | 是   | 社区ID              |
| role_id        | string         | 是   | 角色ID              |
| color          | integer        | 是   | 颜色值              |
| visible        | boolean        | 是   | 是否可见            |
| type           | integer        | 是   | 类型                |
| mentionable    | boolean        | 是   | 是否可提及          |
| name           | string         | 是   | 名称                |
| permissions    | string         | 是   | 权限值              |
| position       | integer        | 是   | 位置                |
| tags           | string?    | 否   | 标签                |

## CreateAppReq
| 字段名         | 类型           | 必填 | 描述         |
|----------------|----------------|------|--------------|
| name           | string         | 是   | 应用名称     |

## DMChannel
| 字段名         | 类型               | 必填 | 描述         |
|----------------|------------------|------|--------------|
| channel_id     | string           | 是   | 频道ID       |
| user           | [ApiUserInfo](#ApiUserInfo) | 是   | 用户信息     |

## EditMessageReq
| 字段名         | 类型                | 必填 | 描述         |
|----------------|-------------------|------|--------------|
| channel_id     | string            | 是   | 频道id       |
| content        | string            | 是   | 正文         |
| attachments    | [Attachment](#Attachment)[] | 否   | 附件         |

## Event
| 字段名             | 类型             | 必填 | 描述                     |
|--------------------|----------------|------|--------------------------|
| action            | [EventType](#EventType) | 是   | 事件类型                 |
| data              | any            | 是   | 携带数据                 |
| channel_id        | string?    | 否   | 频道ID                   |
| community_bots    | integer[]? | 否   | 社区机器人列表           |
| community_id      | string?    | 否   | 社区ID                   |
| created_at        | string?    | 否   | 创建时间                 |
| message_id        | string?    | 否   | 消息ID                   |
| user_id           | string?    | 否   | 用户ID                   |

## EventType
**类型**: string  
**枚举值**:
- `"Reaction"`
- `"Join"`
- `"Callback"`
- `"DeleteMessage"`
- `"Unknown"`

## Hello
| 字段名         | 类型           | 必填 | 描述         |
|----------------|----------------|------|--------------|
| text           | string         | 是   | 文本内容     |

## ImageOperation
| 字段名         | 类型           | 必填 | 描述                     |
|----------------|----------------|------|--------------------------|
| operation      | string         | 是   | 操作类型(如resize)       |
| params         | array          | 是   | 操作参数数组             |

## ImageUploadReq
| 字段名         | 类型                         | 必填 | 描述                         |
|----------------|----------------------------|------|------------------------------|
| filename       | string?                | 否   | 图片文件名                   |
| operations     | [ImageOperation](#ImageOperation)[]? | 否   | 图片处理操作列表             |

## ImageUploadResp
| 字段名           | 类型       | 必填 | 描述                       |
|------------------|------------|------|----------------------------|
| url              | string     | 是   | 图片原始URL                |
| path             | string     | 是   | 图片路径                   |
| md5              | string     | 是   | MD5值                      |
| cloudfront_url   | string?    | 否   | 图片CloudFront URL         |

## InstallParam
| 字段名         | 类型           | 必填 | 描述         |
|----------------|----------------|------|--------------|
| scopes         | string[]       | 是   | scopes       |
| permissions    | string         | 是   | 权限         |

## InstallParams
| 字段名         | 类型             | 必填 | 描述         |
|----------------|------------------|------|--------------|
| community      | InstallParam     | 否   | 社区安装参数 |
| user           | InstallParam     | 否   | 用户安装参数 |

## JoinReq
| 字段名         | 类型           | 必填 | 描述         |
|----------------|----------------|------|--------------|
| app_id         | string?    | 否   | 应用id       |
| channel_id     | string?    | 否   | 频道id       |
| community_id   | string?    | 否   | 社区id       |
| permissions    | string?    | 否   | 权限值       |

## LoginQrcodeInfo
| 字段名         | 类型           | 必填 | 描述                   |
|----------------|----------------|------|------------------------|
| code           | string         | 是   | 二维码代码             |
| status         | integer        | 是   | 状态(0待扫码/1已扫码/2已确认)|
| expire         | integer        | 是   | 过期时间(秒)           |
| content        | string         | 是   | 二维码内容             |
| time           | integer        | 是   | 生成时间               |

## LoginReq
| 字段名             | 类型           | 必填 | 描述                   |
|--------------------|----------------|------|------------------------|
| password           | string         | 是   | 登录密码               |
| area_code          | integer?   | 否   | 区号(手机号登录必选)   |
| email              | string?    | 否   | 登录邮箱               |
| last_login_region  | string?    | 否   | 本次登录城市           |
| phone              | string?    | 否   | 登录手机号码           |

## Message
| 字段名           | 类型             | 必填 | 描述           |
|------------------|------------------|------|----------------|
| channel_id       | integer          | 是   | 频道ID         |
| user_id          | integer          | 是   | 用户ID         |
| message_id       | integer          | 是   | 消息ID         |
| channel_type     | integer          | 是   | 频道类型       |
| attachments      | string?      | 否   | 附件           |
| author           | any              | 否   | 作者信息       |
| community_id     | integer?     | 否   | 社区ID         |
| content          | string?      | 否   | 内容           |
| created_at       | string?      | 否   | 创建时间       |
| flags            | integer?     | 否   | 标记           |
| nonce            | integer?     | 否   | 随机数         |

## MuteReq
| 字段名         | 类型           | 必填 | 描述           |
|----------------|----------------|------|----------------|
| mute_time      | integer        | 是   | 禁言时长(秒)   |
| channel_id     | string?    | 否   | 频道id         |

## PullMessageResp
| 字段名         | 类型           | 必填 | 描述           |
|----------------|----------------|------|----------------|
| event          | Event[]?   | 否   | 事件通知消息   |
| im             | Message[]? | 否   | im消息         |

## ReactionItem
| 字段名         | 类型           | 必填 | 描述             |
|----------------|----------------|------|------------------|
| avatar         | string?    | 否   | 头像             |
| name           | string?    | 否   | 名称(与头像二选一) |


## ReactionReq
| 字段名         | 类型           | 必填 | 描述             |
|----------------|----------------|------|------------------|
| enable         | boolean        | 是   | 是否启用         |
| avatar         | string?    | 否   | 头像             |
| name           | string?    | 否   | 名称(与头像二选一) |

## ResetPasswordReq
| 字段名         | 类型           | 必填 | 描述               |
|----------------|----------------|------|--------------------|
| password       | string         | 是   | 登录密码           |
| area_code      | integer?   | 否   | 区号(手机号登录必选)|
| code           | string?    | 否   | 短信验证码         |
| email          | string?    | 否   | 登陆邮箱           |
| phone          | string?    | 否   | 登陆手机号         |

## SendMessageReq
| 字段名             | 类型            | 必填 | 描述               |
|--------------------|-----------------|------|--------------------|
| channel_id         | string          | 是   | 频道id             |
| content            | string          | 是   | 正文               |
| type               | integer         | 是   | 消息类型(0文本消息)|
| attachments        | Attachment[]    | 否   | 附件               |
| disable_reactions  | boolean?    | 否   | 禁止用户新增表态   |
| ephemeral          | boolean?    | 否   | 临时消息           |
| reactions          | ReactionItem[]  | 否   | 附加表态内容       |
| richtext           | boolean?    | 否   | 富文本             |
| user_ids           | string[]        | 否   | 临时消息的对象     |

## SmsLoginReq
| 字段名             | 类型           | 必填 | 描述               |
|--------------------|----------------|------|--------------------|
| code               | string         | 是   | 登陆验证码         |
| area_code          | integer?   | 否   | 区号(手机号登录必选)|
| last_login_region  | string?    | 否   | 本次登陆城市       |
| phone              | string?    | 否   | 登陆手机号         |

## SubmitReviewReq
| 字段名           | 类型    | 必填 | 描述                           |
|------------------|---------|------|--------------------------------|
| publish_method   | integer | 是   | 发布方式(0审核后直接发布/1手动发布) |

## TokenReq
| 字段名         | 类型           | 必填 | 描述                             |
|----------------|----------------|------|----------------------------------|
| code           | string?    | 否   | 授权票据(换access_token)         |
| grant_type     | string?    | 否   | 授权类型                         |
| redirect_uri   | string?    | 否   | 重定向地址                       |
| refresh        | string?    | 否   | 刷新Token                        |

## TokenResp
| 字段名         | 类型           | 必填 | 描述             |
|----------------|----------------|------|------------------|
| access         | string         | 是   | 用户信息token    |
| expires_at     | integer        | 是   | 过期时间戳       |
| refresh        | string?    | 否   | 刷新token        |
| scopes         | string[]       | 否   | 授权范围         |

## UpdateAppReq
| 字段名             | 类型               | 必填 | 描述                                 |
|--------------------|--------------------|------|--------------------------------------|
| commands           | CommandReq[]?  | 否   | 指令集                               |
| description        | string?        | 否   | 简介                                 |
| icon               | string?        | 否   | 应用图标                             |
| install_params     | InstallParams? | 否   | 安装参数                             |
| name               | string?        | 否   | 应用名称                             |
| privacy_policy     | string?        | 否   | 隐私政策                             |
| redirect           | string?        | 否   | 当前选中的oauth回调地址              |
| redirects          | string[]?      | 否   | oauth回调地址列表                    |
| scopes             | string[]?      | 否   | oauth授权范围                        |
| terms_of_service   | string?        | 否   | 服务条款                             |
| whites             | object             | 否   | 白名单{communities:[], users:[]}     |

## UpdateBotReq
| 字段名         | 类型           | 必填 | 描述                          |
|----------------|----------------|------|-------------------------------|
| avatar         | string?    | 否   | 头像                          |
| name           | string?    | 否   | 机器人名称                    |
| permissions    | string         | 否   | 权限值                        |
| privacy_mode   | integer?   | 否   | 接收消息范围(0私聊+@/1全量)   |
| type           | integer?   | 否   | 机器人类型                    |

## UserInfo
| 字段名         | 类型           | 必填 | 描述                   |
|----------------|----------------|------|------------------------|
| open_id        | string         | 是   | 开平id                 |
| avatar         | string         | 是   | teamgaga头像           |
| nickname       | string         | 是   | teamgaga个人昵称       |
| status         | integer        | 是   | 状态(0正常/1封禁)      |
| joined_at      | integer        | 是   | 加入时间               |
| auth_token     | string?    | 否   | token                  |

## VerificationCodeReq
| 字段名             | 类型           | 必填 | 描述                                                                 |
|--------------------|----------------|------|----------------------------------------------------------------------|
| content            | string         | 是   | 手机号/邮箱号                                                       |
| s_type             | string         | 是   | 验证码发送类型("email"或"phone")                                    |
| b_type             | string         | 是   | 业务类型(注册/登陆/重置密码等)                                      |
| area_code          | integer?   | 否   | 手机号区号                                                          |
| last_login_region  | string?    | 否   | 最后登录地区                                                        |

## VerifyReviewRep
| 字段名         | 类型    | 必填 | 描述                                                                 |
|----------------|---------|------|----------------------------------------------------------------------|
| status         | integer | 是   | 状态位组合(0x01元数据/0x02服务条款/0x04隐私政策/0x08安装链接/0x10双因素) |

## Whites
| 字段名         | 类型           | 必填 | 描述                     |
|----------------|----------------|------|--------------------------|
| communities    | string[]?  | 否   | 社区白名单列表           |
| users          | string[]?  | 否   | 用户白名单列表           |

## String
**类型**: string  
通用字符串类型

## SwitchReq
| 字段名         | 类型    | 必填 | 描述             |
|----------------|---------|------|------------------|
| enable         | integer | 是   | 开关状态(1开/0关)|

## BusinessCode (详细)
**类型**: string  
**完整错误码枚举值**:

| 错误码 | 描述 |
|--------|------|
| 0 | 失败 |
| 1000 | 成功 |
| 1001 | 重复 |
| 1002 | 未找到 |
| 1003 | 无效参数 |
| 1004 | 数据库错误 |
| 1005 | Redis错误 |
| 1006 | 生成令牌错误 |
| 1007 | JSON错误 |
| 1008 | 类型转换错误 |
| 1009 | HTTP错误 |
| 1010 | ES错误（ElasticSearch错误） |
| 1011 | 检测错误 |
| 1012 | 请求过于频繁 |
| 1013 | IP错误 |
| 1014 | 请求参数错误 |
| 1100 | 账户不存在 |
| 1101 | 账户未激活 |
| 1102 | 已注册 |
| 1103 | 令牌错误 |
| 1104 | 账户已存在 |
| 1105 | 用户名已存在 |
| 1106 | 手机号查询错误 |
| 1107 | 邮箱查询错误 |
| 1108 | 验证码错误 |
| 1109 | 邮件发送错误 |
| 1111 | 无效密码 |
| 1112 | 用户不存在 |
| 1113 | IP变更 |
| 1114 | 验证码已过期 |
| 1115 | 用户注册失败 |
| 1116 | 短信发送错误 |
| 1117 | 密码与账户相同 |
| 1118 | 第三方账户已存在 |
| 1119 | 用户已注销 |
| 1120 | 修改邮箱失败 |
| 1121 | 修改手机号失败 |
| 1122 | 添加邮箱失败 |
| 1123 | 用户登录失败 |
| 1124 | 重置密码失败 |
| 1200 | 权限拒绝 |
| 1201 | 已是好友 |
| 1202 | 已被屏蔽 |
| 1203 | 正在屏蔽 |
| 1204 | 关系错误 |
| 1205 | 添加中 |
| 1206 | 已添加 |
| 1207 | 非好友 |
| 1208 | 陌生人不能发送消息 |
| 1209 | 冷却时间 |
| 1210 | 好友请求已过期 |
| 1211 | 无法添加好友 |
| 1212 | 用户已被封禁 |
| 2000 | 创建社区失败 |
| 2001 | 获取社区黑名单失败 |
| 2002 | 添加社区黑名单失败 |
| 2003 | 删除社区黑名单失败 |
| 2005 | 用户已被社区封禁 |
| 2006 | 删除社区失败 |
| 2007 | 更新邀请码失败 |
| 2008 | 删除频道失败 |
| 2009 | 达到邀请码限制 |
| 2010 | 退出社区失败 |
| 2011 | 无法加入社区 |
| 2012 | 角色名称过长！ |
| 2013 | 昵称为空！ |
| 2014 | 禁言时间设置错误！ |
| 2015 | 禁言权限错误！ |
| 2016 | 无法加入社区！ |
| 2017 | 暂停邀请！ |
| 2018 | 社区所有者不能操作！ |
| 2019 | 不能操作自己！ |
| 2020 | 解除绑定条件不满足！ |
| 2021 | 贴图组限制 |
| 2022 | 贴图限制 |
| 2103 | 添加分类失败 |
| 2104 | 删除分类失败 |
| 2400 | 创建频道失败 |
| 2401 | 欢迎频道不能被删除，请先更改欢迎频道 |
| 2402 | 频道不存在 |
| 2403 | 频道消息不存在 |
| 2404 | 社区内禁止私聊 |
| 2405 | 双方都设置了黑名单 |
| 2406 | 没有共同社区 |
| 2407 | 频道用户限制 |
| 2408 | 群组用户限制 |
| 2409 | 群组不存在 |
| 2410 | 安全设置不存在 |
| 2411 | 群组邀请已启用 |
| 2412 | 群组已申请 |
| 2413 | 管理员不能踢出其他管理员 |
| 2414 | 只有所有者可以设置管理员 |
| 2415 | 管理员数量超过限制，最多允许3个管理员 |
| 2416 | 申请已被其他管理员处理 |
| 2700 | 帖子未找到 |
| 2701 | 请先取消设置的加热 |
| 3000 | 网关发送失败 |
| 3001 | Protobuf编码错误 |
| 3002 | 无法添加回应 |
| 3003 | 消息撤回已过期 |
| 3100 | 无效代码 |
| 3101 | 代码已过期 |
| 3102 | 代码已用完 |
| 3103 | 只有群主可以邀请 |
| 3400 | 电话忙线 |
