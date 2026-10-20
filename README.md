# 黄历 · Almanac for Aide

一个独立的 Aide 黄历插件，提供 **公历 + 中国农历 + 传统黄历** 工作台，以及 Aide 可以直接调用的只读查询工具。MIT 许可，离线运行，无须 API Key 或 npm 安装。

## 工作台

安装并启用后，在 Aide 的插件列表中找到「黄历」，点击「黄历工作台」。支持：

- 月历同时显示公历日期、农历日期、节日和二十四节气；今天与所选日期分别标记。
- 日期选择、今天、上/下个月，支持 **1901–2099 年**；方向键移动日期，Home/End 到本周两端，PageUp/PageDown 切月。
- 每日农历、闰月、生肖、干支、宜忌、冲煞、彭祖百忌、值神、喜神与财神方位。展开可看胎神、吉神宜趋、凶神宜忌和节气时间。
- 响应式桌面/窄屏、宿主明暗主题、手动明暗切换；工作台仅通过自身两项只读工具取得数据，与 Aide 查询同源。

「今天」以 **Aide 运行环境的系统时钟 + Asia/Shanghai（UTC+8）** 确定，与容器、浏览器和 SSH 工作区默认时区无关。关闭工作台不创建后台任务，不访问网络、不读写工作区文件。

## Aide 工具

### `almanac_query({date?})`

`date` 为严格公历 `YYYY-MM-DD`；省略时为中国标准时间今天。比如：

```json
{"date":"2024-02-10"}
```

返回 `date`、`today`、`timeZone`、`gregorian`、`lunar`（年月日、闰月、生肖）、`ganzhi`、`festivals`、`solarTerms`、`huangli`（宜忌等）、`source` 与 `note`。2024-02-10 对应甲辰龙年正月初一、春节。可直接对 Aide 说：「查询 2024 年 2 月 10 日的黄历和农历」。调用沿用已有插件工具机制，不修改 Aide 核心、不与其他日期插件共用 ID。

### `almanac_month({year?, month?})`

`year`、`month` 一起提供，或一起省略使用中国标准时间本月：

```json
{"year":2024,"month":2}
```

返回整月每一天的公历/农历/闰月/节气/节日及星期一为 1、星期日为 7 的列定位。需要每日宜忌时再调用 `almanac_query`。

## 数据口径

计算使用包内固定版本 **lunar-javascript 1.7.7（MIT）**，不从网站抓取。每日宜忌采用该库的 `sect=1`（按节气所在日切换月柱），干支年以立春日为界，农历年/生肖以正月初一为界，界限明确写入工具的 `source.yearBoundary`。节气时间是中国标准时间；`solarTerms.previous` 按整日判断，节气当天包含该日节气。

**宜忌等为传统民俗资料，非科学预测，不同流派可能存在差异。节日名称不是法定放假或调休数据。** 本插件不提供个人八字推算或官方工作日安排。农历日期与干支年在立春至春节之间可能不同，是两套年界，不是换算错误。

## 安装

需要支持 protocol 1 工作台工具桥的 Aide（可用性以宿主功能为准，早于 2026-10-18 工作台工具桥的版本不支持本界面），Node.js 18 或更新。支持 Windows、Linux、macOS 与 SSH 工作区：查询在 Aide 宿主本地计算；本次实际验收为 Linux，其他平台未实测。

从本仓库 [Releases](https://github.com/skyelan1999/aide-pkg-almanac/releases) 下载 `aide-pkg-almanac-v1.0.0.zip` 和 `SHA256SUMS`，校验后在 Aide 插件管理中导入 ZIP 并启用。也可在官方插件市场查找 `almanac`。

```sh
sha256sum -c SHA256SUMS
```

独立 HTML 需要 Aide 宿主建立工作台桥，不是双击即可使用的通用网页。断开、锁屏或切换工作区后如授权被撤销，请重新打开工作台。插件本身只计算日期，但 Aide 的受信 Node 插件机制不是 OS 权限沙箱。

## 开发与验证

```sh
npm run build
npm test
python3 scripts/package.py
# 在已有 Aide 源码检出旁，用隔离临时工作台运行真实导入/工具/浏览器测试：
AIDE_SOURCE=/path/to/aide bash scripts/verify-host.sh
```

构建仅拼装本地 JS/CSS/桥代码，输出自包含 `workbench.html`；安装包不含测试、截图或运行数据。单元测试覆盖春节/元宵/中秋/除夕、闰月、清明、立春/春节不同年界、黄历固定结果、世纪边界、无效日期、跨时区和可复现构建。宿主验收不会调用真实模型或用户数据。详情见 `docs/verification.md` 和 `docs/evidence/`。

依赖来源与原许可证见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。ZIP SHA-256 仅用于完整性校验，不是作者签名。
