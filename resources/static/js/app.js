
// TODO:
// 1. Listen mousemove and show/hide elems

YUI(YUI_CONFIG).use('desktopManager','monitorFactory','widgetManager','dd-drag','dd-drop','dd-proxy',function(Y) {
	
	var body = Y.one('body'),
		wrap = body.one('.wrap'),
		hd = body.one('.hd'),
		main = body.one('.main'),
		toolbox = wrap.one('.toolbox'),
		toggle = toolbox.one('.toggle'),
		manage = toolbox.one('.manage'),
		toggled = false,
		mousefield,
		widgetManager,
		desktopManager;
	
	function render(){
		wrap.setStyle('height',wrap.get('winHeight') - ( hd ? hd.get('clientHeight') : 0) );
		desktopManager.renderUI();
	}
	
	function bindEvents(){
	
		/**
		 * Toggle The Pannel
		 *
		**/	
		toggle.on('click',function(){
			main.toggleClass('active');
			toolbox.toggleClass('active');
			toggled = !toggled;
		});
		
		/**
		 * Manage Widgets
		 *
		**/
		manage.on('click',function(){
			if(toggled){
				widgetManager.show();
			}
		});
		
		
		new Y.DD.Drop({
			node: main
		});

	
		// mousemove events to show/hide controls
		Y.on('mousemove',function(e){
			var winHeight = wrap.get('winHeight'),
				winWidth = wrap.get('winWidth'),
				margin = 120,
				x = e.clientX,
				y = e.clientY;
				
			if((x>margin && x<winWidth-margin)&&(y>margin)){
				if(mousefield!="inside"){
					desktopManager && desktopManager.hideControls();
				}
				mousefield = "inside";	
			}else{
				if(mousefield!="edge"){
					desktopManager && desktopManager.showControls();	
				}
				mousefield = "edge";		
			}
		});
		
	}
	
	
	Y.on('keydown',function(e){
		switch(e.keyCode){
			case 39:desktopManager.right();break; //right
			case 37:desktopManager.left();break; //left
			case 38:;break; //up
			case 40:;break; //down
		}
	});
	
	
	function init(desk,widgets,allwidgets){
		if(desk!=null && widgets!=null){
			desk = desk ? JSON.parse(desk) : {desktops:[[]],current:0};
			widgets = widgets ? JSON.parse(widgets) : [];
			
			desktopManager = new Y.DesktopManager(main,desk);
			widgetManager = new Y.WidgetManager(allwidgets,widgets,desktopManager);
			
			render();
			bindEvents();
		}
	}
	
	/**
	 * Deal Global Events
	**/
	Y.on('domready',function(){
		var ls_desktopData = localStorage.getItem("desktops"),
			ls_widgets = localStorage.getItem("widgets");
		
		function success(id,o,type){
			if(type == "desk"){
				ls_desktopData = APP_CONFIG['customDataParser'](o.responseText);
			}else if(type == "widgets"){
				ls_widgets = APP_CONFIG['customDataParser'](o.responseText);
			}
			
			
			init(ls_desktopData,ls_widgets,widgetsData);
		}	
		
			
		init(ls_desktopData,ls_widgets,widgetsData);	
		
		if(!ls_desktopData){
			YUI().use('io', function (Y) {
			    Y.on('io:success', success,Y,'desk');
   				Y.io(APP_CONFIG['deskUrl']);
			});
		}
		
		if(!ls_widgets){
			YUI().use('io', function (Y) {
			    Y.on('io:success', success,Y,'widgets');
   				Y.io(APP_CONFIG['widgetUrl']);
			});
		}
		// console.log('initdata',localStorage.getItem("desktops"),desktopData);
		
		
	});
	
	Y.on('windowresize',render);
	
	
});
