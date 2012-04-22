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
	
	
	function kickoff(arr,index){
		var i = +index;
			before = arr.slice(0,i),
			after = arr.slice(i+1,arr.length);
		
		return before.concat(after);
	}
	
	
	
	var Desktop = function(idx){
		this.elem = Dom.create('<div/>').addClass('desktop');
		this.index = idx;
		this.pannels = [];
	}
	
	Desktop.prototype = {
		constructor:Desktop,
		add:function(modulePannel){
			this.pannels.push(modulePannel);
			this.sync();
		},
		remove:function(pannel){
			var self = this,
				arr = self.pannels,
				l = arr.length;
			for(var i = 0 ; i <= arr.length ; i++){
				if(arr[i].guid == pannel.guid){
					break;
				}
			}
			pannel.elem.setStyles({
				'opacity':0
			});
			pannel.elem.one('.card').setStyles({
				'width':0,
				'height':0,
				'overflow':'hidden'
			});
			
			// remove the pannel
				clearInterval(pannel.clock);
				self.elem.removeChild(pannel.elem);
				pannel = null;
			
			
			self.pannels = kickoff(arr,i);
			
			self.sync();
		},
		resize:function(){
			var elem = this.elem;
			elem.setStyle('width',elem.get('winWidth'));
		},
		destroy:function(){
			this.pannels = [];
			this.elem.remove();
			this.sync();
		},
		sync:function(){
			this.fire("sync");
		}
	}
	
	
	Y.augment(Desktop, Y.EventTarget);
	Y.Desktop = Desktop;
	
});
