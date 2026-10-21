# 1.1.0 验收记录 · 2026-10-21

独立插件，不修改宿主产品代码或捆绑其他插件。宿主基线 `a0ffa35a8d0121374049df17b5e5d375009bd8f6`，Linux / Node v24.19.0 / ICU78.3 / Chromium。三个插件最终ZIP共同通过 Go race 下真实临时 testApp 导入、入口校验、工具执行、严格错误参数拒绝与沙箱工作台桥接（15.391秒）。运行 `AIDE_SOURCE=/workspace/aide bash /workspace/aide-pkg-almanac/scripts/verify-host.sh`；脚本精确清理自有临时宿主夹具，不调用真实模型或用户数据。

实际浏览器通过：黄历日期、详情、1901/2099边界、2057来源差异及1917节气；农历春节、1917闰二月、2033闰冬月、2057九月初一、方向键与月历；时间持续刷新、Asia/Kolkata/Asia/Shanghai切换、五个时区对照、2021-01-01为2020第53周、错误时区恢复与关闭。三个工作台各验收1440/390宽度、comfort/blue明暗四种主题组合，无横向溢出、页面错误或外部请求。截图在docs/evidence，时间截图显示的是测试主机真实时间。

构建/打包两次SHA一致，ZIP内每项与当前源码逐字节核对且无路径穿越、重复项；精确包摘要和运行源码指纹在release-verification-1.1.0.json。安装包不含测试/截图/原始审计夹具。关闭工作台不产生独立后台服务。

未验证：Windows/macOS实机、生产部署及付费模型端到端。此前生产start.command在CAD依赖下载遇到证书链失败，本次浏览器证据来自实际宿主testApp，不能当作生产部署成功。无需构建/发布Aide新镜像。回滚可在插件管理停用或导入仓库保留的1.0.0安装包；不修改用户工作区。

`node test/calendar-audit.test.cjs` 3组PASS，逐日72,684天对照HKO来源夹具；参考数据和测试夹具为独立提取，非旧引擎输出。lunar-javascript原库30日、此版本ICU447日差异并不等于对天文算法做了数学证伪，详见calendar-audit.md。

`node test/almanac.test.cjs` 8组PASS；`node scripts/audit-engines.cjs`复算30/447/12条日期标签差异；未修改上游vendor/lunar.js。
