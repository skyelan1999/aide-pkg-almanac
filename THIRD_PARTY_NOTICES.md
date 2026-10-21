# Third-party code

- `vendor/lunar.js`: unmodified **lunar-javascript 1.7.7**, Copyright (c) 2018 6tail, MIT. The original license is `vendor/lunar-LICENSE`; upstream package metadata and npm tarball SHA-512/file SHA-256 values are in `vendor/lunar-package.json` and `vendor/provenance.json`. Source: https://github.com/6tail/lunar-javascript ; npm tarball: https://registry.npmjs.org/lunar-javascript/-/lunar-javascript-1.7.7.tgz . Calculations and traditional almanac tables come from this library; they are not official holiday/workday schedules.
- `vendor/plugin-workbench-client.js`, embedded in the generated HTML: Aide's MIT workbench bridge client, copied from `skyelan1999/aide-pkg-terminal` at its local 1.5.1 distribution, compatible with Aide protocol 1. Source: https://github.com/skyelan1999/aide/blob/2985453d014f85ee08420112947405f8c360aac8/internal/server/web/plugin-workbench-client.js . Aide copyright (c) 2026 Skye Lan. The root MIT license carries the notice.

The plugin's own code is MIT; it has no npm runtime installation or network dependency. Upstream licenses remain applicable to the vendored files.

## 香港天文台公开日期资料

`vendor/hko-reference.json` 与测试中的逐日事实由香港天文台公历与农历对照表提取，仅保留日期、月份锚点、节气标签及来源校验，不复制网页布局。©香港特别行政区政府／香港天文台，原资料权利保留；资料本身不重新声明为MIT。再利用及署名遵循 https://data.gov.hk/en/terms-and-conditions ，可用于商业及非商业用途，须注明来源并遵守条款。来源：https://www.hko.gov.hk/tc/gts/time/conversion.htm 。本插件是独立实现，不是政府或香港天文台认证产品；原始资料及未来预测均有局限。
