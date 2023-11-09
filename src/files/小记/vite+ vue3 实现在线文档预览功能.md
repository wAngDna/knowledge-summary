## vite+ vue3 实现在线文档预览功能

### 前言

勤勤恳恳(能躺则躺)做前端已经三年了，经历了好几家公司，也面试过好多公司，大家都知道面试避免不了复习，背背八股文等等，这几年积累了许多复习资料笔记。有用word记的，有用js文件注释记的，还有用txt文本文件记的...虽然记了好多，过程中都是面试结束都丢到一边去了，导致现在手里能找到已经不多了，所以想着将这些知识积累起来放一起，避免以后想看的时候找不到还得重新记一边。

因此本Demo产生了，基于Vite + vue3 实现文件预览功能，能够将md文件在线预览，以后复习资料也都放入此项目中维护，最后放到github上共享出去，让需要的人一起学习。



### Vite打包处理

因为文件目录放在了src/files下，在本地通过npm run dev 时没问题，但是执行 npm run build 时，会对src下所有文件进行解析，解析到md等文件的时候就报错了，vite默认是对public目录下的文件当作静态文件处理，所以首先是需要在vite.config.ts中增加配置 assetsInclude：

```js
export default defineConfig({
  assetsInclude: ['./src/files/**'], // 将src下的files下的所有文件当作静态文件来处理
})
```

这样files下我们的知识总结文件就当作静态文件来处理了。还有一个问题就是vite静态资源路径问题，需要增加base: './'，否则我们访问静态文件的时候会404

```js
export default defineConfig({
  base: './', // 设置静态资源路径
  assetsInclude: ['./src/files/**'], // 将src下的files下的所有文件当作静态文件来处理
})
```

### 部署Github Pages

GitHub Pages 是一项静态站点托管服务，它直接从 GitHub 上的仓库获取 HTML、CSS 和 JavaScript 文件，（可选）通过构建过程运行文件，然后发布网站。 可以在 [GitHub Pages 示例集合](https://github.com/collections/github-pages-examples)中看到 GitHub Pages 站点的示例。

本项目就是一个静态资源项目，单纯的文件预览，正好节省了服务器费用。

1. package.json 添加字段

```json
{
  "scripts": {
    "deploy": "gh-pages -d dist -r https://github.com/wAngDna/knowledge-summary.git -b gh-pages"
  },
  },
  "homepage": "https://<USERNAME>.github.io/knowledge-summary"
}

```

其中 `homepage`  字段就是静态网站的地址: 格式就是  https://<github用户名>.github.io/<仓库名> 

`scripts` 里面的 `deploy`，命令作用就是将打包后的产物`dist`目录发布到`github`上

2. github配置

github配置流程：首先创建仓库，名称自己起，然后将本地项目上传至新建的仓库中。

当代码上传至仓库后，我们本地执行`npm run build`命令将项目打包好，产生dist目录，然后执行`npm run deploy`命令，则会将`dist`目录上传至仓库中，并且自行新建分支`gh-pages`，内容就是dist目录内容

然后配置如下图：

![https://img-blog.csdnimg.cn/img_convert/90d49c1edee7248ec11340d254384615.png](https://img-blog.csdnimg.cn/img_convert/90d49c1edee7248ec11340d254384615.png)



然后配置路径为`gh-pages` 选择`root/`即可，如下图：

![https://img-blog.csdnimg.cn/img_convert/e35c83245050bff365d075ea16373240.png](https://img-blog.csdnimg.cn/img_convert/e35c83245050bff365d075ea16373240.png)



到此就配置完成了，可以直接访问了。

