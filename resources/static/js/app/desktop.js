// TODO:
// 1. when slideback, do nothing, yes, not destroy it.
// 2. when slideup, if not the last, push view from cache. or if last , the "push" button become a "add" button
// 3. when mouseover the top, use can close the current desktop. yes , destroy it

/*
 data structs
desktops [
	[pannel1,pannel2,pannel3],
]
*/

YUI.add('desktop',function(Y){
		
	
	var Dom = Y.Node;
	var winWidth,winHeight;
	
	
	function Desktop(idx){
			log('init',this);
		this.elem = Dom.create('<div/>').addClass('desktop');
		this.index = idx;
		this.pannels = [];
	}
	
	Desktop.prototype = {
		constructor:Desktop,
		addPannel:function(modulePannel){
			log('addPannel',this);
			this.pannels.push(modulePannel);
		},
		removePannel:function(pannel){
			log('removePannel',this);
			
			var desktop = this,
				pannels = desktop.pannels;
				
			for(var i = 0,l=pannels.length ; i < l ; i++){
				if(pannels[i] == pannel){
					break;
				}
			}
			
			
			// remove the pannel
			pannel.stopFetch();
			
			desktop.elem.removeChild(pannel.elem);
			pannel = null;
		
			
			pannels.splice(i,1);
		},
		resize:function(){
			log('resize',this);
			var elem = this.elem;
			elem.setStyle('width',elem.get('winWidth'));
		},
		destroy:function(){
			log('destroy',this);
			this.pannels = [];
			this.elem.remove();
		},
		sync:function(){
			log('sync',this);
			this.fire("sync");
		}
	}
	
	
	Y.augment(Desktop, Y.EventTarget);
	Y.Desktop = Desktop;
	
});
