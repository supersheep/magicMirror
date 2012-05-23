YUI.add('timepicker',function(Y){

    var dtdate = Y.DataType.Date;
	
	function TimePicker(wrap){
		log('init:TimePicker');
		var self = this;
		var overlay = this.overlay = new Y.Overlay({
			contentBox:Y.Node.create('<div />').addClass('yui3-skin-sam'),
	        visible: false,
	        tabIndex: null
	    }).render(wrap);
		
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
		    var date = new Date(ev.newSelection[0]);
		    var datestr;
		    
		    date.setHours(0);
		    datestr = dtdate.format(date,{format:"%x %l:%M:%S"});
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
			log('show',this);
			var el;
			if(!this.shown){
				this.overlay.get('contentBox').setStyle('display','block');
				this.overlay.show();
				this.shown = true;
			}
		},
		
		hide:function(){
			log('show',this);
			var el;
			if(this.shown){
				this.overlay.get('contentBox').setStyle('display','none');
				this.overlay.hide();
				this.shown = false;
			}
		}
	}
	
	Y.augment(TimePicker, Y.EventTarget);
	
	Y.TimePicker = TimePicker;
});
