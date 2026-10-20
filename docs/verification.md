# Almanac 1.0.0 verification

本插件为独立 `almanac` 包，不修改或捆绑 Aide 默认插件。宿主验收基线为 Aide `2985453d014f85ee08420112947405f8c360aac8`，Linux / Node.js / Chromium。本次不部署 Aide 或构建宿主镜像，不宣称 Windows/macOS 实机验收。

- `npm run build`：PASS，自包含 HTML 20,040 字节，小于宿主 2 MiB 限制；无外部脚本、样式或字体依赖。
- `npm test`：PASS，7 个测试组。覆盖已知春节/元宵/中秋/除夕日期、闰二月、清明、立春与春节不同年界、黄历固定结果、整月与每日结果一致、世纪边界、严格无效输入、时区独立、vendor 哈希、工具实际注册、构建复现及宿主单文件入口兼容。
- `AIDE_SOURCE=/workspace/aide bash scripts/verify-host.sh`：PASS，Go race 下真实 ZIP 导入、宿主执行工具、错误输入拒绝及工作台桥接。使用临时工作区/数据，未调用真实模型、用户设备或联系人。脚本仅复制本插件自有测试夹具到宿主测试目录，完成后精确删除；宿主产品源码无改动。
- Chromium：PASS，实际 Aide 页面中的沙箱 iframe 与 MessagePort。上海今日不受洛杉矶浏览器时区影响；月历、日期按钮/回车、日期箭头键与焦点、上/下月、春节/闰月/节气、1901/2099 禁用边界、详情、宿主主题和手动主题、今天、故障反馈/重试、关闭均通过。1440/390 像素，蓝色/舒适明暗各一组，无横向溢出，无浏览器异常或外部请求。关闭自有浏览器、上下文与服务。
- ZIP：显式文件清单、固定时间戳、无需安装依赖，可复现。精确 SHA-256 见 `packages/v1.0.0/SHA256SUMS` 和 `evidence/verification.json`，测试使用同一安装包。

截图和机器结果位于 `docs/evidence/`。亮色桌面为 `comfort-light-1440.png`，窄屏日详情为 `comfort-light-daily-390.png`。图片仅含合成查询日期，没有用户会话或凭据。

历法和民俗数据来自固定 MIT lunar-javascript 1.7.7，不表示官方黄历或调休安排。未来历法/流派版本如需更新，必须升插件版本并重新打包，不在运行时联网更新表格。

部署边界：需要支持 protocol 1 工作台工具桥的 Aide；旧宿主只有插件注册功能时不能使用该界面。当前既有 Aide 全量发布门禁不用于替代独立插件验收，也不意味着宿主新镜像已经部署。本插件发布以本仓库可复现构建、单测、实际宿主/浏览器验收、ZIP 摘要和市场校验作为独立门禁。

回滚：卸载/停用 `almanac` 即停止提供本插件工具和工作台，不修改工作区或用户文件。市场下架可撤回独立 listing，不影响 LunarCalendar/CurrentTime。
