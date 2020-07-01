import { sign } from './sign.ts'

export interface AtContent {
  /** 被@人的手机号(在content里添加@人的手机号) */
  atMobiles?: string[]
  /** @所有人时：true，否则为：false */
  isAtAll?: boolean
}

export interface LinkContent {
  /** 消息标题 */
  title: string
  /** 消息内容。如果太长只会部分展示 */
  text: string
  /** 点击消息跳转的URL */
  messageUrl: string
  /** 图片URL */
  picUrl?: string
}

export interface MarkdownContent {
  /** 首屏会话透出的展示内容 */
  title: string
  /** markdown格式的消息 */
  text: string
}

export interface ActionCardBase {
  /** 首屏会话透出的展示内容 */
  title: string
  /** markdown格式的消息 */
  text: string

  /** 0-按钮竖直排列，1-按钮横向排列 */
  btnOrientation?: '0' | '1'
}

/** 整体跳转 */
export interface ActionCardSingle extends ActionCardBase {
  /** 单个按钮的方案。(设置此项和singleURL后btns无效) */
  singleTitle: string
  /** 点击singleTitle按钮触发的URL */
  singleURL: string
}

export type ActionCardBtn = {
  /** 按钮标题 */
  title: string
  /** 点击按钮触发的URL */
  actionURL: string
}

/** 独立跳转 */
export interface ActionCardContent extends ActionCardBase {
  /** 按钮的信息：title-按钮方案，actionURL-点击按钮触发的URL */
  btns: ActionCardBtn[]
}

export interface FeedCardContent {
  /** 单条信息文本 */
  title: string
  /** 点击单条信息到跳转链接 */
  messageURL: string
  /** 单条信息后面图片的URL */
  picURL: string
}

interface DingtalkResult {
  errcode: number
  errmsg: string
}

enum Types {
  TEXT = 'text',
  LINK = 'link',
  MARKDOWN = 'markdown',
  ACTION_CARD = 'actionCard',
  FEED_CARD = 'feedCard',
}

/**
 * dingtalk docs: https://ding-doc.dingtalk.com/doc#/serverapi2/qf2nxq
 */
export default class Bot {
  constructor(private webhook: string, private secret: string) {}

  private send(content: unknown): Promise<DingtalkResult> {
    const timestamp = Date.now()
    const url = new URL(this.webhook)
    url.searchParams.set('timestamp', timestamp.toString())
    url.searchParams.set(
      'sign',
      sign(this.secret, timestamp + '\n' + this.secret)
    )

    return fetch(url.toString(), {
      method: 'POST',
      body: JSON.stringify(content),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then((result: DingtalkResult) =>
        result.errcode ? Promise.reject(result) : result
      )
  }

  /**
   * 发送纯文本消息，支持 @群内成员
   */
  text(content: string, at?: AtContent) {
    return this.send({
      msgtype: Types.TEXT,
      text: {
        content,
      },
      at,
    })
  }

  /**
   * 发送单个图文链接
   */
  link(link: LinkContent) {
    return this.send({
      msgtype: Types.LINK,
      link,
    })
  }

  /**
   * 发送 markdown 内容，支持 @群内成员
   */
  markdown(markdown: MarkdownContent, at?: AtContent) {
    return this.send({
      msgtype: Types.MARKDOWN,
      markdown,
      at,
    })
  }

  /**
   * 发送 actionCard （动作卡片）
   * 支持多个按钮，支持 markdown
   */
  actionCard(actionCard: ActionCardSingle | ActionCardContent) {
    return this.send({
      msgtype: Types.ACTION_CARD,
      actionCard,
    })
  }

  /**
   * 发送 feedCard，支持多图文链接
   * links 可包含多个 link，建议不要超过 4 个
   */
  feedCard(links: FeedCardContent[]) {
    return this.send({
      msgtype: Types.FEED_CARD,
      feedCard: {
        links,
      },
    })
  }
}
