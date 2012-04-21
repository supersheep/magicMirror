// css classes
// setting-row
// setting-field
// setting-name


YUI.add('setting',function(Y){
	var NUM_REG = /^\d+(\.?\d+)?$/;
	var CLS_ROW = 'setting-row';
	var CLS_NAME = 'setting-name';
	var CLS_FIELD = 'setting-field';
	var steps = ['year','month','day','hour','minute'];
	var valueTextMap = {
		'year':'年',
		'month':'月',
		'day':'日',
		'hour':'小时',
		'minute':'分钟',
		'xkey':'x轴字段',
		'ykeys':'y轴字段',
		'names':'视图名称',
		'step':'刻度'
	};
	var renderMap = {
		'xkey':function(){
			return Y.Node.create('<input />');
		},
		'ykeys':function(){
			return Y.Node.create('<input />');
		},
		'names':function(){
			return Y.Node.create('<input />');
		},
		'start':function(){
			return Y.Node.create('<input />');
		},
		'step':function(){
			var select = Y.Node.create('<select />');
			steps.forEach(function(e){
				var option = Y.Node.create('<option />');
				option.set('value',valueTextMap[e]);
				option.set('innerHTML',e);
				option.appendTo(select);
			});
			return select;
		}
	};
	
	var Setting = function(setting){
		var self = this;
		self.setting = setting;
		self.controlMap = {};
		self.valueMap = {};
	}

	Setting.prototype = {
			constructor : Setting,
			renderUI:function(container){
				var self = this;
				var	complete = self.complete = Y.Node.create('<input type="button" value="好" class="ok" />');
				var row,name,field;
				
				self.container = container;
				
				container.empty();
				for(var key in self.setting){
					row = Y.Node.create('<div />').addClass(CLS_ROW);
					name = Y.Node.create('<span />').addClass(CLS_NAME).set('innerHTML',valueTextMap[key] + ':');
					field = self.controlMap[key] =  renderMap[key]().addClass(CLS_FIELD);
					row.append(name);
					row.append(field);
					container.append(row);
				}
				self.bindUI();
			},
			bindUI:function(){
				var self = this;
				complete.on('click',function(){
					// serialize setting to config
					self._setback(key,val);
					self.fire('complete');
				});
			},
			_setback:function(){
				var controlMap = self.controlMap;
				var valueMap = self.valueMap;
				for(var key in controlMap){
					valueMap[key] = controlMap[key].get('value');
				}
				self.setting = valueMap;
			}
			
	}
	

	Y.augment(Setting, Y.EventTarget);
	
	Y.Setting = Setting;
});






// calendar events
/*
binner.all('.calendar').each(function(e){
	e.on('click',function(e){
		// calendar.
		var el = this;
		e.stopPropagation();
		timepicker = new Y.TimePicker(binner);

		timepicker.on("selection", function (e) {
		      currentPicker.set('value',e.datestr);
		      timepicker.hide();
		});
		timepicker.show();
		timepicker.overlay.align(el,[Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.BL]);
		//calendar.off("selectionChange");
		currentPicker = el;
		return false;
	});
});*/