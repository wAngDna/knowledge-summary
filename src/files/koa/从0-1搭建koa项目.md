### 一、初始化项目

1. 新建空文件夹

2. npm init 初始化项目

3. npm install 安装依赖

   1. ```typescript
      npm i koa @types/koa koa-router @types/koa-router
      ```

4. 新建app文件夹

   1. 新建controller/index.ts

      1. ```typescript
         import { Context } from "koa";
         
         class IndexController {
             async index(ctx:Context) {
                 ctx.body = [1,2,3,9,0]
             }
         }
         
         export default new IndexController
         ```

   2. 新建router/index.ts

      1. ```typescript
         import koaRouter from 'koa-router'
         import IndexController from '../controller/IndexController'
         const router = new koaRouter({ prefix: '/admin' })
         
         router.get('/', IndexController.index)
         
         export default router
         ```

   3. 新建index.ts入口文件

      1. ```typescript
         import Koa from 'koa'
         import router from './router'
         import { Server } from 'http'
         const app = new Koa
         app.use(router.routes())
         const run = (port: any):Server => {
             return app.listen(port)
         }
         export default run
         ```

5. 修改根目录下index.ts

   1. ```typescript
      import run from './app'
      run(3000)
      ```

### 二、使用nodemon热加载

1. 全局安装nodemon依赖

   1. npm i -g nodemon

2. 在根目录下创建nodemon.json

   1. ```json
      {
          "watch": ["app/**/*.ts", "utils/**/*.ts", "./index.ts"],
          "ignore": ["node_modules"],
          "exec": "ts-node index.ts",
          "ext": ".ts"
      }
      ```

3. 修改package.json

   1. ```json
      "scripts": {
          "start": "nodemon",
          "test": "jest"
        },
      ```

### 三、使用dotenv加载配置信息

1. 安装dotenv依赖

   - ```
     npm i dotenv @types/dotenv
     ```

2. 在根目录创建.env文件，存放配置信息

   - ```typescript
     NODE_ENV=dev
     SERVER_PORT=3000
     DB_NAME=localhost
     ```

3. 在index.ts中引入并注册dotenv

   - ```typescript
     import dotenv from 'dotenv'
     dotenv.config()
     
     import Koa from 'koa'
     import router from './router'
     import {Server} from 'http'
     const app = new Koa
     app.use(router.routes())
     const run = (port: any):Server => {
         return app.listen(port)
     }
     export default run 
     ```

4. 在app目录下，创建config/index.ts，存储变量

   - ```typescript
     const config = {
         db: {
             db_host: process.env.DB_HOST,
             db_name: process.env.DB_NAME,
             db_user: process.env.DB_NAME,
             db_port: process.env.DB_NAME
         },
         server: {
             port: process.env.SERVER_PORT
         }
     }
     export default config
     ```

5. 在根目录index.ts下使用

   - ```typescript
     import run from './app'
     import config from './app/config'
     run(config.server.port)
     ```

### 四、使用log4js收集日志

1. 安装log4js依赖

   1. ```js
      npm i log4js @types/log4js
      ```

2. 在app文件夹下创建logger/index.ts

   1. ```typescript
      import * as log4js from "log4js";
      log4js.configure({
        appenders: { 
          cheese: { type: "file", filename: "logs/cheese.log" },
          access: { type: "file", filename: "logs/access.log" }
        },
        categories: {
          default: { appenders: ["cheese"], level: "info" },
          access: { appenders: ["access"], level: "info" }
        },
      });
      export const Accesslogger = log4js.getLogger('access');
      export default log4js.getLogger()
      ```

   2. 在app下创建logs文件夹

3. 在app下创建middleware/AccessLogMiddleware.ts中间件

   1. ```typescript
      import { Context, Next } from 'koa'
      import { Accesslogger } from '../logger'
      function AccessLogMiddleWare(ctx: Context, next: Next) {
          const logStr = `path:${ctx.path} | method: ${ctx.method}`
          Accesslogger.info(logStr)
          return next()
      }
      export default AccessLogMiddleWare 
      ```

4. 在app/index.ts注册中间件

   1. ```typescript
      import AccessLogMiddleWare from './middleware/AccessLogMiddleware' 
      import Koa from 'koa'
      const app = new Koa
      app
          .use(AccessLogMiddleWare)
          .use(router.routes())
      ```

### 五、使用mongoose操作MongoDB

1. 安装mongoose依赖

   1. ```typescript
      npm i mongoose @types/mongoose
      ```

2. 在db/schema/SchemaUser.ts创建用户集合字段声明

   1. ```typescript
      import { Schema } from 'mongoose'
      export const UserSchema = new Schema({
          username: {
              type: String,
              unique: true,
              require: true
          },
          password: {
              type: String,
              require: true
          },
          email: {
              type: String,
              require: true
          },
          user_id: {
              type: String,
              require: true
          },
          createAt: {
              type: Date,
              default: Date.now
          },
          usertype: {
              Type: String,
          }
      })
      ```

3. 在db/model/ModelUser.ts定义Model

   1. ```typescript
      import mongoose from 'mongoose'
      import { UserSchema } from '../schema/SchemaUser'
      export const UserModel = mongoose.model('User', UserSchema)
      ```

4. 在controller/IndexController.ts操作数据

   1. ```typescript
      import { Context } from "koa";
      import { UserModel } from '../db/model/ModelUser'
      
      import mongoose from 'mongoose';
      mongoose.connect('mongodb+srv://root:admin@cluster0.lbntp0i.mongodb.net/')
      
      function guid() {
          const S4 = () => {
              return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
          };
          return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4()
          );
      }
      class IndexController {
          async getUserList(ctx: Context) {
              ctx.body = await UserModel.find({})
          }
          async createUser(ctx: Context) {
              UserModel.create({
                  username: 'saf',
                  password: '231',
                  email: '12@qq.com',
                  user_id: guid()
              })
              ctx.body = '成功'
          }
      }
      
      export default new IndexController
      ```

5. 在router/index.ts中注册路由

   1. ```typescript
      import koaRouter from 'koa-router'
      import IndexController from '../controller/IndexController'
      const router = new koaRouter({ prefix: '/admin' })
      
      router
          .get('/userList', IndexController.getUserList)
          .get('/createUser', IndexController.createUser)
      export default router
      ```

### 六、JWT认证

1. 