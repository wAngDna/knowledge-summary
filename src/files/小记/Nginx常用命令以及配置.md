### 前言
Nginx是一款轻量级的高性能反向代理服务器和Web服务器，占用内存少、启动快，高并发能力强，在互联网项目中广泛应用，例如CDN、反向代理、负载均衡、Web应用程序、云计算等领域。

### 常用命令

开启服务：start nginx

停止服务：nginx -s stop 或者 nginx -s quit

nginx停止命令stop与quit参数的区别在于stop是快速停止nginx，可能并不保存相关信息，quit是完整有序的停止nginx  ，并保存相关信息。
nginx启动与停止命令的效果都可以通过Windows任务管理器中的进程选项卡观察。

重启服务：nginx -s reload

检查配置文件是否正确：nginx -t

查看nginx的版本信息：nginx -v

查看nginx的配置信息：nginx -t

查看nginx的运行状态：nginx -s status

查看nginx的进程信息：ps -ef | grep nginx

查看nginx的错误日志：tail -f /usr/local/nginx/logs/error.log

查看nginx的访问日志：tail -f /usr/local/nginx/logs/access.log
 



### 常用配置

nginx通过配置文件修改配置，配置文件一般在ngxin安装目录下，名为ngxin.conf的配置文件，该文件负责nginx的基础功能配置。

#### 1. 配置文件概述

配置块           功能描述
全局块           与nginx运行相关的全局设置
events块        与网络连接有关的设置
http块          代理、缓存、日志、虚拟主机等配置
server块        虚拟主机配置
location块      定义请求路由及页面处理方式

#### 2. location 路径映射

格式：

location [ = | ~ | ~* | !~ | !~* | ^~ | @ ] uri {...}

各种标识解释：

= 精确匹配

~ 区分大小写的正则匹配

~* 不区分大小写的正则匹配

!~ 区分大小写的正则不匹配

!~* 不区分大小写的正则不匹配

^~ 匹配请求字符串开始

@ 匹配请求文件中请求路径，不包括查询字符串

优先级：
- = > ~ > ~* >!~ >!~* > ^~ > @
- 匹配顺序由上至下，若匹配成功，则不再继续匹配下一个规则。
- 匹配成功后，停止继续匹配，不再继续匹配其他规则。
- 若匹配失败，则继续匹配下一个规则。
- 若匹配成功，则停止继续匹配，不再继续匹配其他

示例：

location = / {
  # 精确匹配 /，主机名后面不能带任何字符串
  # http://baidu.com [匹配成功]
  # http://baidu.com/index [匹配失败]
}

location ^~ /img/ {
  # 以 /img/ 开头的请求，都会匹配上
  # http://baidu.com/img/a.jpg [匹配成功]
  # http://baidu.com/img/b.mp4 [匹配成功]
}

location ~* /Example/ {
  # 忽略 uri 部分的大小写
  # http://baidu.com/test/Example/ [匹配成功]
  # http://baidu.com/example/ [匹配成功]
}

location /documents {
  # 如果有正则表达式可以匹配，则优先匹配正则表达式
  # http://baidu.com/documentsabc [匹配成功]
}

location / {
  # http://baidu.com/abc [匹配成功]
}

#### 3. 反向代理

反向代理是Nginx的核心功能之一，允许Nginx将来自客户端的请求转发到后端服务器，并将后端服务器的响应返回给客户端,使客户端感觉就像是直接与后端服务器通信一样。

反向代理的配置格式如下：

server {
    listen 80;
    server_name localhost;
    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}

反向代理的配置说明：

listen 80;

listen指令用于指定监听的端口，在本例中，我们将监听80端口。

常用指令：


proxy_pass：指定请求转发的目标服务器地址，在本例中，我们将请求转发到本机的8080端口。

proxy_set_header：设置请求头信息，在本例中，我们将请求头中的Host字段设置为客户端的Host字段。

proxy_hide_header：隐藏指定请求头信息，在本例中，我们将请求头中的Server字段隐藏。

proxy_redirect：修改从代理服务器返回的响应头中的Location和Refresh头字段。

配置示例：

server {
  listen 80;
  server_name localhost;
  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_hide_header Server;
    #格式：proxy_redirect 旧url 新url;
    proxy_redirect http://127.0.0.1:8080/ http://www.baidu.com/;
  }
}

反向代理不仅可以提高网站的性能和可靠性，还可以用于负载均衡、缓存静态内容、维护和安全等多种用途。

#### 4. 静态资源优化

Nginx支持静态资源的压缩、缓存、加速等功能，可以有效提高网站的性能。
为了提高静态资源的传输效率，Nginx提供了以下三个主要的优化指令：

- sendfile
解释：sendfile指令可以让Nginx直接将文件内容发送给客户端，而不再经过Nginx的缓冲区，从而提高传输效率。

- tcp_nodelay
解释：tcp_nodelay指令可以让Nginx在发送数据时，不使用Nagle算法，立即发送数据，从而提高传输效率。

- tcp_nopush
解释：tcp_nopush指令可以让Nginx在发送数据时，只要有可能，就立即发送数据，而不等待缓冲区数据满。

静态资源压缩：

在数据的传输过程中，为了进一步优化，Nginx引入了gzip模块，用于对传输的资源进行压缩，从而减少数据的传输体积，提高传输效率。

Nginx中的静态资源压缩可以在http块、server块、location块中配置。涉及的主要模块有：

Gzip模块配置指令：

gzip on; #开启gzip压缩

gzip_disable "MSIE [1-6]\."; #关闭IE6以下版本的浏览器的gzip压缩

gzip_vary on; #在响应头中增加Vary: Accept-Encoding字段，表明客户端支持gzip压缩

gzip_proxied any; #允许客户端通过代理服务器进行压缩

#### 5. 跨域

跨域资源共享（CORS）是一种安全策略，用于控制哪些网站可以访问您的资源。当您的前端应用程序和后端API位于不同的域上时，通常会遇到跨域问题。Nginx可以通过设置响应头来帮助解决这个问题。

跨域的配置格式如下：

location / {
  # 其他配置...

  # 设置允许来自所有域名请求。如果需要指定域名，将'*'替换为您的域名。
  add_header 'Access-Control-Allow-Origin' '*';

  # 允许的请求方法。
  add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';

  # 允许的请求头。
  add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';

  # 允许浏览器缓存预检请求的结果，单位为秒。
  add_header 'Access-Control-Max-Age' 1728000;

  # 允许浏览器在实际请求中携带用户凭证。
  add_header 'Access-Control-Allow-Credentials' 'true';

  # 设置响应类型为JSON。
  add_header 'Content-Type' 'application/json charset=UTF-8';

  # 针对OPTIONS请求单独处理，因为预检请求使用OPTIONS方法。
  if ($request_method = 'OPTIONS') {
    return 204;
  }
}

#### 6. 项目部署

我们现代前端项目例如react、vue等，一般都是打包出来一个dist目录，在nginx中部署特别简单：

http {
  server {
    listen       8999;
    server_name  localhost;
    # 访问项目
    location / {
      # 指定dist目录
      root /usr/www/reat-demo/dist/;
      # 访问dist目录下的index.html文件
      index  index.html;
      # 单页面应用访问刷新时，因为后端没有路由会404，所以需要将错误强制定向到index.html(交给前端程序处理)
      try_files $uri $uri/ /index.html;
    }
    # 代理api接口
    location /api/v1/ {
      proxy_pass  http://127.0.0.1:8899/api/v1/;
    }
  }
}


先介绍这么多，后面学习到了再补充～
