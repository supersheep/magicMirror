
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
		items = toolbox.all('.item'),
		toggled = false,
		mousefield,
		widgetManager,
		desktop;
	
	function render(){
		wrap.setStyle('height',wrap.get('winHeight') - ( hd ? hd.get('clientHeight') : 0) );
		desktop.render();
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
			//Y.WidgetManagePannel.show();
			if(toggled){
				widgetManager.show();
			}
		});
		
		/**
		 * Item Drag to The Board
		 *
		**/
		Y.use('')	
			// init drag instances
			items.each(function(e,i){
				var drag= new Y.DD.Drag({
					node: e
				}).plug(Y.Plugin.DDProxy,{
					moveOnEnd: false
				});
				
				/*
				drag.plug(Y.Plugin.DDConstrained,{
					constrain2node: toolbox
				});
				*/
				
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
				
				drag.on('drag:drophit', function(e) {
					var xy = e.target.mouseXY,
						node = this.get('node');
						
					// getProperties from the node
					// and init a pannel with them and axis
					
					// infact, here I should new a "Pannel" with configs and ajaxUrl
					// what a Pannel do: 
					// a Pannel has its default configuration
					
					var type = node.getAttribute('data-type'),
						xkey= node.getAttribute('data-xkey'),
						ykeys = node.getAttribute('data-ykeys'),
						names = node.getAttribute('data-names'),
						title = node.getAttribute('data-title');
						
					// add a monitor to a desktop
					Y.MonitorFactory.produce(type,xy,desktop.getCurrent(),{
						setting:{
							"xkey":xkey,
							"ykeys":ykeys,
							"names":names						
						}
					});
					
				});
						
			// init drop instances
			var drop = new Y.DD.Drop({
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
						desktop && desktop.hideControls();
					}
					mousefield = "inside";	
				}else{
					if(mousefield!="edge"){
						desktop && desktop.showControls();	
					}
					mousefield = "edge";		
				}
			});
			
			
		});
		
		
	}
	
	
	Y.on('keydown',function(e){
		switch(e.keyCode){
			case 39:desktop.right();break; //right
			case 37:desktop.left();break; //left
			case 38:;break; //up
			case 40:;break; //down
		}
	});
	
	/**
	 * Deal Global Events
	**/
	Y.on('domready',function(){
		var desktopData = JSON.parse(localStorage.getItem("desktops")),
			myWidgets = JSON.parse(localStorage.getItem("widgets")),
			widgetsData = widgets;// global
		
		// console.log('initdata',localStorage.getItem("desktops"),desktopData);
		
		
		widgetManager = new Y.WidgetManager(widgetsData,myWidgets);
		desktop = new Y.DesktopManager(main,desktopData);
		render();
		bindEvents();
	});
	
	Y.on('windowresize',render);
	
	
});
