YUI.add('widgetManager',function(Y){
	
	function dom(tag,cls){
	
		var node = Y.Node.create('<'+tag+' />');
		cls && node.addClass(cls);
		return node;
		
	}
	
	function div(cls){
	
		return dom('div',cls);
		
	}
	
	// server to client
	function parseData(data){
		return {
			config:{
				title:data.name,
				names:data.view,
				xkey:data.xField,
				ykeys:data.yField
			},
			cate:data.cate,
			icon:data.imageSource,
			id:data.id
		};
	}
	
	
	// client to server
	function parseKey(obj){
		var map = {
			"title":"name",
			"xkey":"xField",
			"ykeys":"yField",
			"names":"view",
			"id":"id",
			"cate":"cate",
			"icon":"imageSource"
		},ret = {};
		
		for(var i in obj){
			ret[map[i]] = obj[i];
		}
		
		ret["mode"] = obj["mode"] || "save";
		                  
		
		return ret;
	}
	
	
	
	function initDrag(li,o){
		// 初始化拖放
		var id = o.id;
		var drag= new Y.DD.Drag({
			node: li
		}).plug(Y.Plugin.DDProxy,{
			moveOnEnd: false
		});
		
		drag.on('drag:start',function(){
			var p = this.get('dragNode'),
				n = this.get('node');

			p.setStyle('opacity', .25);
			if (!this._playerStart) {
				this._playerStart = this.nodeXY;
			}
			p.set('innerHTML', n.get('innerHTML'));
			p.setStyles({
				backgroundColor: n.getStyle('backgroundColor'),
				color: n.getStyle('color'),
				border:'none',
				opacity: .65
			});
			p.addClass('item');						
		});
		
		drag.on('drag:end', function(e) {
			var n = this.get('node');
			n.setStyle('opacity', '1');
		});
		
		// 拖拽结束
		drag.on('drag:drophit', function(e) {
			var xy = e.target.mouseXY,
				desktop = desktopManager.getCurrentDesktop(),
				node = this.get('node');
				
				console.log(o);
			// add a monitor to a desktop
			monitorFactory.produce(id,xy,desktop,{
				config:o.config
			});
			
			desktop.sync();
			
		});
	}
	
	
	function IconPannel(){
		var self = this,
			iconpannel = this.elem = div('iconpannel'),
			inner = this.inner = div('iconpannel_inner').appendTo(iconpannel),
			icon_list = div('icon_list').appendTo(inner);
		
		self._shown = false;
		for(var i=0;i<ICON_COUNT;i++){
			var img = dom('img').set('src','/resources/static/img/' + (i+1) + '.png');
			img.on('click',function(){
				var src = this.getAttribute('src');
				var imgnode = dom('img').setAttribute('src',src);
				self.fire('selected',{
					src:src,
					imgnode:imgnode
				});
				self.hide();
			});
			icon_list.append(img);	
		}
	}
	
	IconPannel.prototype = {
		constructor:IconPannel,
		show:function(){
			this.inner.setStyles({
				width:200,
				height:200
			})
			this.elem.setStyles({
				width:200,
				height:200,
				opacity:1
			});
			
			this._shown = true;
		},
		toggle:function(){
			this[this._shown?"hide":"show"]();
		},
		hide:function(){
			this.inner.setStyles({
				width:0,
				height:0
			});
			
			this.elem.setStyles({
				opacity:0,
				width:0,
				height:0
			});
			this._shown = false;
		}
	}
	
	Y.augment(IconPannel, Y.EventTarget);
	
	
	
	
	
	function MyWidgetLi(widgetdata){
		var self = this;
		
		self.elem = dom('li','item');
		self.update(widgetdata);
	}
	
	MyWidgetLi.prototype = {
		constructor:MyWidgetLi,
		renderUI:function(){
			var li = this.elem,
				data = this.data,
				title = data.config.title,
				icon = data.icon,
				img = dom('img').setAttribute('src',icon),
				p = dom('p','title').set('innerHTML',title);
			
			li.empty();
			li.append(img);
			li.append(p);
		},
		update:function(widgetdata){
			this.data = widgetdata;
			this.renderUI();
		},
		remove:function(){
			this.elem.remove();
		},
		appendTo:function(node){
			this.elem.appendTo(node);
		}
	}
		
	Y.augment(MyWidgetLi, Y.EventTarget);
	
	
	function WidgetLi(widgetdata,manager){
		var self = this,
			li = dom('li','clear'),
			checkbox = dom('input','checkbox').set('type','checkbox'),
			edit = dom('span','edit').set('innerHTML','编辑'),
			img = dom('img','icon'),
			title = dom('span','title');
		
		li.append(checkbox);
		li.append(img);
		li.append(title);
		li.append(edit);
		
		
		checkbox.on('click',function(e){
			var checked = e.target.get('checked');
			if(checked){
				self.fire('add',self);
			}else{
				self.fire('remove',self);
			}
			manager.sync();
		});
		
		edit.on('click',function(){
			self.fire('edit',self);
		})
		
		self.elem = li;
		self.img = img;
		self.title = title;
		self.checkbox = checkbox;
		self.data = widgetdata;
		
		self.update(widgetdata);
	}
	
	WidgetLi.prototype = {
		constructor:WidgetLi,
		appendTo:function(node){
			this.elem.appendTo(node);
		},
		update:function(widgetdata){
			var self = this,
				title = widgetdata.config.title;
				
			self.data = widgetdata;
			self.img.setAttribute('src',widgetdata.icon);
			self.title.set('innerHTML',title);
			self.title.setAttribute('title',title);
		}
	}
	
	Y.augment(WidgetLi, Y.EventTarget);
	
	
	function EditPannel(manager){
		var	self = this,
			elem = div('editpannel'),
			icon = div('icon'),
			imgholder = div('imgholder'),
			iconhint = div('iconhint').set('innerHTML','点此选择图片'),
			settings = div('settings'),
			setting_pannel = new Y.Setting(null,settings),
			icon_pannel = new IconPannel();
		
		self.manager = manager;
		self.setting_pannel = setting_pannel;
		self.icon_pannel = icon_pannel;
		self.iconhint = iconhint;
		self.imgholder = imgholder;
		self.iconsrc = "";
		
		elem.append(icon);
			icon.append(icon_pannel.elem);
			icon.append(iconhint);
			icon.append(imgholder);
		elem.append(settings);
		
		imgholder.on('click',function(){
			icon_pannel.toggle();
		});
		
		icon_pannel.on('selected',function(e){
			var src = e.src,
				imgnode = e.imgnode;
				
			self.iconsrc = src;
			iconhint.setStyle('visibility','hidden');
			imgholder.empty().append(imgnode);
		});
		
		setting_pannel.on('cancel',function(){
			self.hide();
		})
		self.elem = elem;
	}
	
	EditPannel.prototype = {
		constructor : EditPannel,
		renderEdit:function(widgetdata){
			var self = this,
				id = widgetdata.id,
				cate = widgetdata.cate,
				imgnode = dom('img').setAttribute('src',widgetdata.icon);
				setting_pannel = self.setting_pannel;

			self.iconsrc = widgetdata.icon;
			setting_pannel.setData(widgetdata.config);
			setting_pannel.addData('cate',cate);
			self.imgholder.empty();
			self.imgholder.append(imgnode);
			
			self.icon_pannel.hide();
			
			self.iconhint.setStyle('visibility','hidden');
			setting_pannel.renderUI();
			
			setting_pannel.detach('complete');
			setting_pannel.on('complete',function(setting){
				YUI().use('io',function(Y){
					Y.on('io:success', function(id, o){
						var data = JSON.parse(o.responseText);
						self.fire('update',parseData(data));
						setTimeout(function(){
							setting_pannel.empty();
						},500);
						self.hide();
					},Y);
					
	   				Y.io(APP_CONFIG['defineUrl'],{
        				method: "POST",
        				data:parseKey(Y.merge({id:id,icon:self.iconsrc},setting))
	   				});
				});
			});
		},
		renderCreate:function(){
			
			var self = this,
				setting_pannel = self.setting_pannel;

			setting_pannel.setData({title:"",names:"",xkey:"",ykeys:"",cate:self.manager.tabs.getCurrent().name});
			
			self.iconsrc = "";
			
			self.imgholder.empty();
			
			self.icon_pannel.hide();
			
			self.iconhint.setStyle('visibility','visible');
			setting_pannel.renderUI();
			setting_pannel.detach('complete');
			setting_pannel.on('complete',function(setting){
				
				// show the loading effect
				
				YUI().use('io',function(Y){
					Y.on('io:success', function(id, o){
						var data = JSON.parse(o.responseText);
						self.fire('create',parseData(data),true); // switchToTab true
						setTimeout(function(){
							setting_pannel.empty();
						},500);
						self.hide();
					},Y);
					
	   				Y.io(APP_CONFIG['defineUrl'],{
        				method: "POST",
        				data:parseKey(Y.merge({icon:self.iconsrc},setting))
	   				});
				});
				
				
			});
		},
		show:function(wraper){
			var elem = this.elem;
			
			elem.setStyle('height',this.manager.wrap.get('clientHeight'));
			elem.setStyle('left',240);
		},
		
		hide:function(){
			this.elem.setStyle('left',10);
		}
		
	}
	
	Y.augment(EditPannel, Y.EventTarget);
	
	
	
	function List(itemConstructor){
		this.list = [];
		this.itemConstructor = itemConstructor;
	}
	
	List.prototype = {
		constructor:List,
		// List增删
		indexOf:function(id){
			var list = this.list;
			for(var i = 0,current;current = list[i];i++){
				if(current.data.id == id){
					return i;
				}
			}
			return -1;
		},
		
		add:function(item){
			var list = this.list;
			var id = item.data.id;
			
			if(item.constructor != this.itemConstructor){
				throw "constructor not fit";
			}
			
			if(this.indexOf(id,list) == -1){
				list.push(item);
			}
		},
		
		get:function(id){
			var list = this.list;
			var index = this.indexOf(id,list);
			return list[index];
		},
		
		remove:function(id,list){
			var list = this.list;
			var index = this.indexOf(id,list);
			if(index != -1){
				list[index].remove(); // remove the elem
				list.splice(index,1); // remove from data
			}
		}
	}
	
	
	/*
		Tab
		- add(Widget)
	*/
	function Tab(name){
		var tabBody = div('tab-body'),
			bodyUl = dom('ul');
		
		
		tabBody.append(bodyUl);
		
		this.name = name;
		this.head = div('tab-header').set('innerHTML',name);
		this.body = tabBody;
		this.widgets = [];
	}
	
	Tab.prototype = {
		constructor:Tab,
		add:function(widget_li){
			this.body.one('ul').append(widget_li.elem);
			this.widgets.push(widget_li);
		},
		remove:function(widget_li){
			var widgets = this.widgets,
				ul = this.body.one('ul');
			ul.removeChild(widget_li.elem);
			
			for(var i=0;i<widgets.length;i++){
				if(widgets[i] == widget_li){
					widgets.splice(i,1);
				}
			}
		},
		show:function(){
			this.head.addClass('active');
			this.body.addClass('active');
		},
		hide:function(){
			this.head.removeClass('active');
			this.body.removeClass('active');
		}
	}

	
	/*
		Tabs
		- add(Tab)
		- getTab {return head,body}
	*/
	function Tabs(cls){
		var elem = this.elem = div(cls);
		var head = this.head = div('header clear');
		var body = this.body = div('body');
		
		elem.append(head);
		elem.append(body);
		
		
		this.tabs = {};
	}
	
	Tabs.prototype = {
		constructor:Tabs,
		moveToTab:function(name,widget_li){
			var cate = widget_li.data.cate;
			var from = this.get(cate);
			var to = this.get(name);
			
			from.remove(widget_li);
			to.add(widget_li);
			this.switchTo(name);
		},
		addToTab:function(name,widget_li){
			var tab,
				other_name = '未分类';
			
			name = name || other_name;
			
			tab = this.get(name);
			if(!tab){
				tab = this.add(name);
			}				
			tab.add(widget_li);			
		},
		switchTo:function(name){
			var tabs = this.tabs,
				current = this.current,
				tab = null,
				tabname = null;
			
			if(name!=current){			
				tabs[name].show();
				tabs[current].hide();
				
				this.current = name;
			}
		},
		add:function(name){
			
			var self = this,
				tab = new Tab(name);
				
			if(Object.keys(this.tabs).length == 0){
				this.current = name;
				tab.show();
			}
			
			tab.head.on('click',function(){
				self.switchTo(name);
			});
			
			this.tabs[name] = tab;
			
			this.head.append(tab.head);
			this.body.append(tab.body);
			
			return tab;
		},
		getCurrent:function(){
			return this.tabs[this.current];
		},
		get:function(name){
			return this.tabs[name];
		}
	}
	

	// 初始化widgetPannel
	/*
		- all_widgets: List
		- user_widgets: List
		- my_widgets: Array
		- elem: Y_Node		the main container
		- edit_pannel: Y_Node	editingpannel behand the front face
		- toolbar: Y_Node		bottom tools
		- ul: Y_Node		list container
		- wrap: Y_Node		absolute to cover the setting pannel
	*/
	
	
	
	
	function WidgetManager(all_widgets_data,my_widgets_data){
		log('init',this);
		var self = this,
			edit_pannel = new EditPannel(self),
			tabs = new Tabs('tabs'),
			wrap = div('widgets'),
			pannel = div('pannel'),
			elem = div('widget-manager'),
			close = div('close'),
			title = div('title clear').set('innerHTML','<span class="title_text">管理Widget…</span>'),
			createbtn = div('create').set('innerHTML','new');
			
			
		// my_widgets = my_widgets || [{name:"line"}];
		close.on('click',Y.bind(this.hide,this));
		
		elem.append(close);
		elem.append(wrap);
			wrap.append(title);
				title.append(createbtn);
			wrap.append(tabs.elem);
		elem.append(edit_pannel.elem);
		elem.appendTo('body');
		
		self.elem = elem;
		self.tabs = tabs;
		self.edit_pannel = edit_pannel;
		self.toolbar = Y.Node.one('.tools');
		self.all_widgets = new List(WidgetLi); // all data
		self.my_widgets = new List(MyWidgetLi); // preset data
		
		
		// add to list
		all_widgets_data.forEach(function(widget){
			self.addWidgetToBank(widget,false);
		});
		
		// add to botton tool bar
		my_widgets_data.forEach(function(id){
			var widget_li = self.all_widgets.get(id);
			if(widget_li){
				self.addWidget(widget_li);
			}
		});
		
		// bind create event
		createbtn.on('click',Y.bind(self.createWidget,self));
		
		close.on('click',Y.bind(self.hide,self));
		
		edit_pannel.on({
			'create':Y.bind(self.addWidgetToBank,self),
			'update':Y.bind(self.updateWidget,self)
		});
		
		// pannel can drag
		new Y.DD.Drag({
			node: elem
		}).addHandle(title);	
		
		self.wrap = wrap;
		
		// hide when init
		self.hide();
		
	}
		
	WidgetManager.prototype = {
		constructor : WidgetManager,
		
		// 应用级函数
		getConfig:function(id){
			var widget = this.all_widgets.get(id);
			if(widget){
				return widget.data.config;
			}
			
			return false;
		},
		
		// 展开edit_pannel
		createWidget:function(){
			var edit_pannel = this.edit_pannel;
			
			edit_pannel.renderCreate();
			edit_pannel.show();
		},
		
		editWidget:function(widget){
			var edit_pannel = this.edit_pannel;
			
			edit_pannel.renderEdit(widget.data);
			edit_pannel.show();
		},
		
		// edit_pannel完成后的动作
		updateWidget:function(widgetdata){
			var self = this,
				widget,mywidget,
				cate = widgetdata.cate
				id = widgetdata.id; // widgetdata
				
			widget = self.all_widgets.get(id);
			if(widget){				
				if(cate != widget.data.cate){
					self.tabs.moveToTab(cate,widget);
				}
				widget.update(widgetdata);
			}
			mywidget = self.my_widgets.get(id);
			mywidget && mywidget.update(widgetdata);	
			
		},
		
		
		// edit_pannel完成后的动作
		addWidgetToBank:function(widgetdata,switchToTab){
			var self = this,
				tabs = self.tabs,
				tab = null,
				tab_other = null,
				str_other = '其他',
				id = widgetdata.id,
				cate = widgetdata.cate,
				all_widgets = self.all_widgets,
				widget_li = new WidgetLi(widgetdata,self);
				
			widget_li.elem.addClass(all_widgets.list.length%2?'order':'even');
			widget_li.on({
				'add':Y.bind(self.addWidget,self),
				'remove':Y.bind(self.removeWidget,self),
				'edit':Y.bind(self.editWidget,self)
			});
			
			
			tabs.addToTab(cate,widget_li);
			switchToTab && tabs.switchTo(cate);
			all_widgets.add(widget_li);
			
			// which will be proccessed in monitorFactory;
			self.fire('addone',widgetdata);
		},
		
		
		// 从底盘添加删除
		addWidget:function(widget){
			log('addWidget',this);
			var self = this,
				my_widget = new MyWidgetLi(widget.data);
					
			// UI	
			widget.checkbox.set('checked','checked');
			my_widget.appendTo(this.toolbar);
			
			initDrag(my_widget.elem,widget.data);
			
			// INSTANCE
			this.my_widgets.add(my_widget);
		},
		
		removeWidget:function(widget){
			log('removeWidget',this);
			
			widget.checkbox.set('checked',false);
			this.my_widgets.remove(widget.data.id);
		},
				
		// 同步数据
		sync:function(){
			log('sync',this);
			var ids,my_widgets=this.my_widgets.list;
			
			ids = my_widgets.map(function(widget){
				return widget.data.id;
			});
			
			ids = JSON.stringify(ids);
			
			
			localStorage.setItem('widgets',ids);
			YUI().use('io',function(Y){
   				Y.io(APP_CONFIG['widgetUrl'],{
					method: 'POST',
					data: 'data='+ids
   				});
			});
		},
		
		show : function(){
			log('show',this);
			this.elem.setStyle('display','block');
		},
		hide:function(){
			log('hide',this);
			this.elem.setStyle('display','none');	
		}
	}
	
	
	Y.augment(WidgetManager, Y.EventTarget);
	
	Y.WidgetManager = WidgetManager;
});