# 行程记录 · dsh-trip-log

**Turns a folder of trip notes into a timeline, route map, word cloud and photo album.**

A UI plugin for DeepSeek Harness (DSH). You already wrote down what happened — in a journal, in a chat log,
in a folder of screenshots. Trip Log reads those notes and lays them out as five views you can actually browse.
Your notes stay plain markdown inside your own git repo; the plugin only reads them, draws them, and
commits your edits back when you change the intro card.

No API keys, no accounts, no backend.

五个页签：**时间线 · 路线 · 词云 · 相册 · 总结**。

---

## What it's for

出门那几天说过的话，散在聊天记录里、日记里、相册里。回头看，你想知道的是：

- 那天几点在哪儿、干了什么 → **Timeline**
- 一共跑了多少公里、走过哪几个点 → **Route**
- 那几天嘴里念得最多的是什么 → **Word cloud**
- 拍的照片按时刻排开 → **Album**
- 一句话概括这趟、最舍不得的几件事 → **Summary**

这个插件不生成内容。**它只吃你自己写的档案**，因为你记得的东西比别人总结的准。

## 装

还没发 npm，从源码装：

```bash
git clone https://github.com/Ricardozhuyuyu/dsh-trip-log.git
cd dsh-trip-log
```

然后在 DSH 里装本地包（`plugin_manager install_bundle`，target 填这个目录的绝对路径），或者直接改 profile：

```jsonc
// ~/.dsh/profiles/<profile>/package.json
{
  "dsh": {
    "profile": {
      "bundles": [
        "dsh-trip-log"   // 或者用本地路径
      ]
    }
  }
}
```

装完重启 DSH，左侧栏会出现「行程记录」图标。

## 数据长什么样

在 `档案根目录` 下，**一趟一个子目录**，里面一份 `档案.md`：

```
旅程/
  香港-2026-10-31/
    档案.md
    图/
      yuyu-victoria-harbour-1633.png
  苏州-2026-11-07/
    档案.md
    图/
      ...
```

`档案.md` 就这么写：

```markdown
# 香港 · 2026-10-31 → 11-02

赶万圣节那场 The Weeknd。两天，一场演唱会，一双白靴，一双黑靴。

---

## 行程

**10-31 周六**

- 06:30 出门。原话就三个字：「出发，鱼鱼。」
- 08:05 国泰起飞。
- 11:47 落地赤鱲角。

**11-01 周日**

- 13:00 苏妈马来西亚菜。
- 20:28 登机口 HO1156。

## 吃了什么

- 华星冰室。
- 苏妈：椰浆饭、咖喱叻沙。

## 本鱼记着

歌单。给他圈了三梯队：

- 全场大合唱：STARBOY、HEARTLESS
- 彩蛋是第 25 首《HONG KONG》

那天下午拉开窗帘，维港的海面亮得刺眼。

## 基地

上海

## 坐标

- 香港赤鱲角 22.3080 113.9185
- 尖沙咀喜来登 22.2950 114.1722
```

### 解析规则

| 写法 | 意思 |
|---|---|
| `# 标题` | 卡片标题 |
| `---` 之前 / 第一个 `##` 之前 | 介绍段，**页面上可以直接点开改**，存回文件并自动 commit + push |
| `## 行程` | 一个分组；名字随便，`行程`/`出过的事`/`吃了什么` 都行 |
| `### 11-07 下午` | 分组里的日期段，会被记成 `day` |
| `**10-31 周六**` | 同上，单独一行的小标题 |
| 一行里有好几个 `HH:MM` | 会自动拆成多条，各自挂在自己的时刻上 |
| `## 本鱼记着` | 总结页「记着的几件事」从这一节取。冒号结尾的引导句会把下面紧跟的列表项收成「（N 项）」，不占位置 |
| `## 基地` | 出发地，**不画在路线上**，只做标注 |
| `## 坐标` | 每行 `名字 纬度 经度`，画路线用 |
| `## 图` | 会被跳过（图片按 `图/` 目录里的文件自动排） |

**坐标一律存 WGS-84**。OSM / Esri / CARTO 的瓦片都是 WGS-84 基准，全球一致，不偏移。从高德（GCJ-02）或百度（BD-09）抄来的坐标在国内会偏几百米，别直接粘。

## 地图

用 Leaflet + Esri 暗色画布瓦片，**不需要任何 API key，不需要注册开发者**。

- 瓦片挂了（`tileerror` 累计 3 次）会自动切 OpenStreetMap 兜底，再挂就退回手绘 SVG，不会白屏
- 跨 180° 经线的路线（上海 → 旧金山）目前会绕反方向，**未处理**

## 配置

```yaml
- id: trip-log
  name: dsh-trip-log
  config:
    root: '~/Documents/deepseek-harness/default-workspace/ctx/旅行'
```

`root` 不给就用上面这个默认值。

## 存储

插件本身**不存数据**。它通过本地 HTTP（`/trip-log?action=...`，只监听 127.0.0.1）读你的 markdown 和图片，改介绍段时写回文件并调 `git commit` + `git push`（仓库没初始化就只写文件）。

## 许可

MIT
