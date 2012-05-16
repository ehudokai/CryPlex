(function(){ 
var plexServer = new can.Observe({
    host: null,
    port: 32400
}),
pathList = new can.Observe.List({
        
    }),
curResults,
Plex = can.Control({
  defaults : { pathList: pathList }
},{
    'init': function(el,options){
        var self = this;
        if(!localStorage.plexUniqueId){
            localStorage.plexUniqueId = Math.floor(Math.random()*10000)+"";
        }
        this.loadMyPlexServers(el);
    },
    '#myPlexLogin click':function(){
        this.plexLogin();
    },
    '#plexLogin input keypress': function(el, event){
        if(event.keyCode == 13){
            this.plexLogin();
        }
    },
    'plexLogin': function(){
        var user = can.$('#username').val();
        var pass = can.$('#password').val();
        can.$.ajax({
            type: 'POST',
            username: user,
            password: pass,
            headers: {
                'X-Plex-Client-Identifier': 'ChromePlexClient'+localStorage.plexUniqueId
            },
                    
            url: 'https://my.plexapp.com/users/sign_in.xml',
            success: function(result){
                if(can.$("error",result).length>0){
                    alert($("error",result).text());
                    return;
                }
                localStorage.plexToken = can.$('authentication-token',result).text();
                can.$('#main').text('Loading servers...');
                this.loadMyPlexServers();
            }
        });
    },
    'loadMyPlexServers': function(el){
        if(!localStorage.plexToken){
            this.element.html( can.view('view/myPlexLoginForm.ejs'));
        } else {
            can.$.get('https://my.plexapp.com/pms/servers',
            {
                'X-Plex-Token': localStorage.plexToken
                },
            function(results){
                curResults = results;
                can.$(el).html(can.view("views/plex/loadMyPlexServers",can.$('Server',results)));
            },
            'xml'
            );
        }
    },
    '.server click': function(server, event){
        plexServer.attr({
            'name':can.$(server).attr('name'),
            'host':can.$(server).attr('host'),
            'port':can.$(server).attr('port')
        });
        pathList.push("/library/sections");
    },
    "{pathList} add": function(event){
        var self = this,
        newPath = pathList.attr(pathList.length-1);
        var url = "http://"+plexServer.attr('host')+":"+plexServer.attr("port")+
        newPath;
        can.ajax({
            url:url, 
            data: {
                'X-Plex-Token': localStorage.plexToken
                }, 
            success: function(results){
                var data;
                curResults = results;
                //first look for directories
                data = {
                    serverName: plexServer.attr('name'),
                    dirs: can.$("[key][title]",results)
                }
                self.element.html(can.view('views/plex/plexList',data));
            
            }, 
            dataType: 'xml'
        });
    },
    '[key] click': function(dir, event){
        var key = dir.attr('key');
        if(key.substring(0,1)== "/"){
            pathList.push(key);
        } else {
            var currentPath = pathList.attr(pathList.length-1),
            newPath = currentPath+"/"+key;
            pathList.push(newPath);
            
        }
    }
        
});
new Plex(can.$('#main'));
})();


