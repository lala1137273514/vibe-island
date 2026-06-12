# 本地素材包

这个入口只给本机私用素材准备。不要把第三方游戏原始素材提交到 Git 或部署到公开站点。

## 用法

1. 在项目里创建 `public/local-assets/`。
2. 把 `public/local-assets.example.json` 复制为 `public/local-assets/manifest.json`。
3. 把自己的图片放进 `public/local-assets/sprites/`。
4. 修改 manifest 里的路径。
5. 刷新网页,设置面板会显示素材包加载状态。

## manifest 格式

```json
{
  "name": "我的本地素材包",
  "sprites": {
    "themes": {
      "origin": "sprites/origin.png",
      "desert": "sprites/desert.png",
      "snow": "sprites/snow.png",
      "creator": "sprites/creator.png",
      "custom": "sprites/custom.png"
    },
    "islands": {
      "origin": "sprites/origin-special.png"
    }
  }
}
```

`islands` 会覆盖 `themes`。路径只能写 `public/local-assets/` 下面的相对路径。
