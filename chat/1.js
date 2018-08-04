var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
/*监听端口*/    
server.listen(81,function(){
	console.log("开启成功！")
});

/*初始化用户对象用了分发消息，*/
var user = {};

//定义接受者客户端id
io.on('connection', function(socket) {
    /*开始捕捉事件*/
    socket.on('message', function(d) {
        switch (d.mine.type) { 
        /*用户上线*/  
        case 'reg':
            console.log('执行用户在线注册!');
            console.log(d.mine.id+'did的数值');
            user[d.mine.id] = socket.id;
            var num=0,uuser=[];
            for (x in user){
               uuser.push(x);
                num++;
            }
            // 在线数量
            d.num=num;
            //全局事件 
            socket.broadcast.emit('addList', d);
            console.log('用户上线了：用户id=' + d.mine.id + '| 客户端id=' + socket.id);
            break;
         /*用户发送消息*/   
        case 'chatMessage':
			console.log('发送消息了！')
            var mydata = {
                username: d.mine.username,
                avatar: d.mine.avatar,
                id: d.mine.id,
                content: d.mine.content,
                type: d.to.type,
                toid: d.to.id
            };
			  /*处理单聊事件*/
              if (d.to.type == 'friend') {
                  console.log(user[mydata.toid]+'处理单聊事件')
                if (user[mydata.toid]) {/*广播消息*/
                    io.sockets.sockets[user[mydata.toid]].emit('chatMessage', mydata);
                    console.log('【' + d.mine.username + '】对【' + d.to.name + '】说:' + d.mine.content)
                    console.log('当前的socketsid是'+user[mydata.toid])
                } else {
                    socket.emit('noonline', mydata);
                }

               
               /*处理群聊事件*/ 
            } else if (d.to.type == 'group') {
                mydata.id = mydata.toid;
                socket.broadcast.emit('chatMessage', mydata)
            }
            break
          }

        /*注销事件*/
    }).on('disconnect', function() {
        var outid=0,usernum=0;
        for (x in user) {
            usernum++;
            if (user[x] == socket.id) {
                outid=x
               delete user[x]
            }
        }
         console.log('用户ID=' + outid + '下线了');
         var out={id:outid,num:usernum-1}
         io.sockets.emit('out',out);
    })
});