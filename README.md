# MyLinuxSetup
自用的linux环境配置及工具

## bin/alpha
C;把百分数转换为两位16进制字符，例: 输入：alpha 70   输出：B2 ; 
## bin/ssproxy
sh;用于开启或关闭代理模式的脚本，例：输入 ssproxy on ;系统代理设置为手动，http/https地址指向127.0.0.1 host 1080
## lushou/lshost
用的改模拟器测试host工具




# IM项目PC端包壳
用于把WEBIM项目包壳为PC端项目并提示桌面端扩展功能，如系统托盘消息通知

### ElectronJs 官方文档
[点击跳转](https://electronjs.org/docs)

### 注意事项
此项目只支持win7 32位以上系统环境,建议打包使用32位模式打包

### 项目主要文件

* main.js                APP主进程代码，启动APP，打开窗口，接收通信

* package.json		 项目打包配置

* index.html		 主窗口的布局代码

### 开发事项
本地资源读取路径一定要采定 __dirname 这个常量来拼接
通信使用ipc类，目前有[message_read] 和 [message_new] 两个通信协议
