(function(){ 
    var plexServer = new can.Observe({
        host: null,
        port: 32400
    }),
    state = new can.Observe({
                loading: false
            }),
    pathList = new can.Observe.List(),
    curResults, main, breadcrumbs,
    Plex = can.Control({
        defaults : {
            pathList: pathList,
            state: state
        }
    },{
        /**
         * Just a local property to track the logged in state.
         */
        loggedIn: false,
        'init': function(el,options){
            var self = this;
            if(!localStorage.plexUniqueId){
                localStorage.plexUniqueId = Math.floor(Math.random()*10000)+"";
            }
            can.$('#loading').hide();
            this.loadMyPlexServers.call(self, el);
        },
        '#myPlexLogin click':function(){
            this.plexLogin.call(this);
        },
        '#plexLogin input keypress': function(el, event){
            if(event.keyCode == 13){
                this.plexLogin.call(this);
            }
        },
        'plexLogin': function(){
            var user = can.$('#username').val(),
            pass = can.$('#password').val(),
            self = this;
            self.options.state.attr('loading',true);
            can.$.ajax({
                type: 'POST',
                username: user,
                password: pass,
                headers: {
                    'X-Plex-Client-Identifier': 'ChromePlexClient'+localStorage.plexUniqueId
                },
                    
                url: 'https://my.plexapp.com/users/sign_in.xml',
                success: function(result){
                    self.options.state.attr('loading', false);
                    if(can.$("error",result).length>0){
                        alert($("error",result).text());
                        return;
                    }
                    localStorage.plexToken = can.$('authentication-token',result).text();
                    this.loggedIn = true;
                    can.$('#main').text('Loading servers...');
                    self.loadMyPlexServers.call(self, self.element);
                }
            });
        },
        'loadMyPlexServers': function(el){
            var self=this;
            self.options.state.attr('loading', false);
            if(!localStorage.plexToken){
                
                self.loggedIn = false;
                self.element.html( can.view('view/myPlexLoginForm.ejs'));
            } else {
                self.loggedIn = true;
                can.$.get('https://my.plexapp.com/pms/servers',
                {
                    'X-Plex-Token': localStorage.plexToken
                },
                function(results){
                    curResults = results;
                    self.element.html(can.view("views/plex/loadMyPlexServers",can.$('Server',results)));
                },
                'xml'
                );
            }
            var breadcrumbs = can.view('views/plex/breadcrumbs.ejs',{
                pathList: pathList, 
                loggedIn: self.loggedIn
            });
            can.$("#breadcrumbs").html(breadcrumbs);
        },
        '.server click': function(server, event){
            plexServer.attr({
                'name':can.$(server).attr('name'),
                'host':can.$(server).attr('host'),
                'port':can.$(server).attr('port')
            });
            pathList.push({
                key: "/library/sections",
                name: plexServer['name']
            });
        },
        "{pathList} change": function(el, event, index, how, newVal, oldVal){
            var self = this,
            newPath = pathList[pathList.length-1]['key'];
            var url = "http://"+plexServer.attr('host')+":"+plexServer.attr("port")+
            newPath;
            if(!self.options.state.attr('loading')){
                self.options.state.attr('loading',true);
                can.ajax({
                    url:url, 
                    data: {
                        'X-Plex-Token': localStorage.plexToken
                    }, 
                    success: function(results){
                        self.options.state.attr('loading',false);
                        var data;
                        curResults = results;
                        //first look for directories
                        data = {
                            serverName: plexServer.attr('name'),
                            dirs: can.$("[key][title]",results)
                        }
                        self.element.html(can.view('views/plex/plexList',data));
                        can.$("#breadcrumbs").html(can.view('views/plex/breadcrumbs.ejs',{
                            pathList: pathList, 
                            loggedIn: self.loggedIn
                        }));

                    },
                    error: function(xhr){
                        self.options.state.attr('loading',false);
                        var path = pathList.pop();
                        if(path == '/library/sections'){
                            path = 'Server';
                        }
                        alert('cannot connect to '+path);
                    },
                    dataType: 'xml'
                });
            }
        },
//        "{pathlist} remove": function(event, oldVals, index){
//            var self = this,
//            
//            
//        },
        '[key] click': function(dir, event){
            var key = dir.attr('key'),
            lastPath = pathList[pathList.length-1]['key'], nextPath;
            
            if(key.substring(0,1)== "/"){
                nextPath = key;
            } else {
                var currentPath = pathList[pathList.length-1]['key'];
                nextPath = currentPath+"/"+key;
            }
            if(nextPath == lastPath){
                //new path is the same as where we are... do nothing
                return;
            }
            if(state.attr('loading')){
                //in the middle of loading (don't do anything)
                return;
            }
            pathList.push({
                'key': nextPath,
                'name': dir.text()
            });
        },
        '{state} change': function(el, ev, attr, how, newVal, oldVal){
            var self = this;
            if(attr=='loading' && how=='set'){
                if(newVal == true){
                    can.$('#loading').show();
                } else {
                    can.$('#loading').hide();
                }
            }
        }
        
    });
    PlexBC = can.Control({
        defaults : {
            pathList: pathList
        }
    },{
        /**
         * handle logout click.  Logs the user out by removing the login token
         * 
         * @param el the element clicked on
         */
        '#logout click': function(el){
            delete localStorage.plexToken;
            pathList.attr([],{},true);
            main.loadMyPlexServers.call(main);
        },
        /**
         * navigate backwards in the breadcrumbs
         * 
         * grabs the index from the breadcrumb and removes all elements after
         * it from the pathList, which will trigger an event to redraw the screen
         * 
         * @param el the element clicked on
         */
        '[index] click': function(el){
            // I want to remove the items after this one (adding 1 to index to remove)
            var index = can.$(el).attr('index')*1+1,
            length = pathList.length-index;
            if(state.attr('loading')){
                //in the middle of loading (don't do anything)
                return;
            }
            pathList.splice(index,length);
            
        }
    });
    main = new Plex(can.$('#main'));
    breadcrumbs = new PlexBC(can.$('#breadcrumbs'));
})();


