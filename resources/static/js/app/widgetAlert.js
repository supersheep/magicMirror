YUI.add('widgetAlert',function(Y){
	function WidgetAlert(url){
		this.url = url;
	}	
	
	WidgetAlert.prototype = {
		startFetch : function(){
		
			//comet.subscribe("/ajax/start");
		},
		deal:function(id){
			var desktops = desktopManager.desktops;
			for(var i = 0,desktop ;desktop = desktops[i] ; i++){
				
				var pannels = desktop.pannels;
				
				for(var j = 0,pannel; pannel = pannels[j] ; j++){
					if(pannel.config.id == id){
						desktopManager.slideTo(i);
						pannel.spark();
						return;
					}
					
				}
				
				desktop = desktop
				
			}
			
			console.log(desktopManager);
		}
	}
	
	Y.WidgetAlert = WidgetAlert;
	
	
});