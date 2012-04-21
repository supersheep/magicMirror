YUI.add('timepicker',function(Y){

    var dtdate = Y.DataType.Date;
	
	var TimePicker = function(wrapper){
		//var DesktopManager = function(container,initdata){

		var self = this;
		var overlay =this.overlay = new Y.Overlay({
			contentBox:Y.Node.create('<div />').addClass('yui3-skin-sam'),
	        visible: false,
	        tabIndex: null
	    }).render(wrapper);
		
		var calendar = this.calendar = new Y.Calendar({
			height:'245px',
			width:'245px',
			showPrevMonth: true,
			showNextMonth: true,
		    date: new Date()
		}).render(overlay.get('contentBox'));
		
		
		Y.one('body').on('click',function(){
			self.hide();
		});
		
		calendar.on('selectionChange',function(ev){
		    var date = ev.newSelection[0];
		    var datestr = dtdate.format(date);
		    self.fire('selection',{date:date,datestr:datestr});
		});	
		//console.log();
		//calendar.on('click')
		calendar.get('contentBox').on('click',function(e){
			e.stopPropagation();
		});
	}
	
	TimePicker.prototype = {
		constructor:TimePicker,
		show:function(){
			var el;
			if(!this.shown){
				this.overlay.show();
				this.shown = true;
			}
		},
		
		hide:function(){
			var el;
			if(this.shown){
				this.overlay.destroy();
				this.shown = false;
			}
		}
	}
	
	Y.augment(TimePicker, Y.EventTarget);
	
	Y.TimePicker = TimePicker;
});