// css classes
// setting-row
// setting-field
// setting-name


YUI.add('setting',function(Y){
	var timepicker;
	var NUM_REG = /^\d+(\.?\d+)?$/;
	var CLS_ROW = 'setting-row';
	var CLS_NAME = 'setting-name';
	var CLS_FIELD = 'setting-field';
	var CLS_UNIT = 'setting-unit';
	var steps = ['year','month','day','hour','minute'];
	var types = ['bar','line','pie','bubble','candle'];
	var valueTextMap = {
		'year':'年',
		'title':'标题',
		'alias':'中文名',
		'month':'月',
		'day':'日',
		'hour':'小时',
		'minute':'分钟',
		'xkey':'x轴字段',
		'ykeys':'y轴字段',
		'names':'视图名称',
		'start':'起始时间',
		'end':'结束时间',
		'freq':'刷新频率',
		'type':'图表类型',
		'active':'实时',
		"bubble":'气泡图',
		"candle":'蜡烛图',
		'bar':'柱状图',
		'line':'线图',
		'pie':'饼图'
	};
	
	var valueConverter = {
		'datetime':{
			view:function(data){
				var str = "",day;
				if(!data){
					return '';
				}else{
					day = data ? new Date(data) : '';
					return day.getFullYear() + "-" + (day.getMonth()+1) + "-" + day.getDate() + " " + day.getHours() + ":" + day.getMinutes();
				}
			},
			data:function(view){
				return view ? + new Date(view) : '';
			}
		}
			
	}
	
	var unitMap = {
		'freq':'秒'
	};
	var renderMap = {
		'title':function(){
			return Y.Node.create('<input />');
		},
		'alias':function(){
			return Y.Node.create('<input />');
		},
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
			var node = Y.Node.create('<input />').set('type','datetime');
			node.on('click',function(e){
				e.stopPropagation();
				timepicker.show();
				timepicker.overlay.align(node, [Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.BL]);
				
				timepicker.on('selection',function(e){
					timepicker.hide();
					node.set('value',e.datestr);	
				});	

			});		
			return node;
		},
		'end':function(){
			var node = Y.Node.create('<input />').set('type','datetime');
			node.on('click',function(e){
				e.stopPropagation();
				timepicker.show();
				timepicker.overlay.align(node, [Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.BL]);
				
				timepicker.detach();
				timepicker.on('selection',function(e){
					timepicker.hide();
					node.set('value',e.datestr);	
				});	
			});
			
			return node;
		},
		'freq':function(){
			return Y.Node.create('<input placeholder="单位秒" />').setStyle('width',50);
		},
		'type':function(){
			var select = Y.Node.create('<select />');
			types.forEach(function(e){
				var option = Y.Node.create('<option />');
				option.set('value',e);
				option.set('innerHTML',valueTextMap[e]);
				option.appendTo(select);
			});
			return select;
		},
		'active':function(){
			return Y.Node.create('<input type="checkbox" />');
		}
	};
	
	function setFieldValue(field,value){
		
		var type = field.getAttribute('type');
		
		if(valueConverter[type]){
			value = valueConverter[type]['view'](value);
		}
		
		field.set('value',value);
	}
	
	function getFieldValue(field){
		var type = field.getAttribute('type');
		var value = field.get('value');
		if(valueConverter[type]){
			value = valueConverter[type]['data'](value);
		}
		return value;
	}
	
	function Setting(data,container){
		log('init',this);
		var self = this;
		self.data = data;
		self.container = container;
		self.controlMap = {};
		self.valueMap = {};
	}

	Setting.prototype = {
			constructor : Setting,
			setData:function(data){
				this.data = data;
			},
			renderUI:function(wrapper){
				log('renderUI',this);
				var self = this;
				var container = wrapper || self.container;
				var data = self.data;
				var	complete = self.complete = Y.Node.create('<input type="button" value="好" class="btn ok" />');
				var cancel = self.cancel = Y.Node.create('<input type="button" value="取消" class="btn cancel" />');
				var time_wrap = Y.Node.create('<div />');
				var row,name,field,unit;
				
				if(container){
					self.container = container;
				}
				
				container.empty();
				for(var key in data){
					row = Y.Node.create('<div />').addClass(CLS_ROW);
					name = Y.Node.create('<span />').addClass(CLS_NAME).set('innerHTML',valueTextMap[key] + ':');
					field = self.controlMap[key] =  renderMap[key] && renderMap[key]().addClass(CLS_FIELD);
					unit = Y.Node.create('<span />').addClass(CLS_UNIT).set('innerHTML',unitMap[key]||'');
					setFieldValue(field,data[key]);
					if(name && field && row){
						row.append(name);
						row.append(field);
						row.append(unit);
						container.append(row);
					}
				}
				container.append(complete);
				container.append(cancel);
				container.append(time_wrap);
				
				timepicker = new Y.TimePicker(time_wrap);
				
				cancel.on('click',function(){
					self.fire('cancel');
				})
				
				complete.on('click',function(){
					self.setback();
					self.fire('complete',self.data);
				});
			},
			empty:function(){
				this.container.empty();
			},
			setback:function(){
				log('setback',this);
				var self = this;
				var controlMap = self.controlMap;
				var valueMap = self.valueMap;
				var control;
				for(var key in controlMap){
					if(controlMap[key]){ 
						control = controlMap[key];
						valueMap[key] = getFieldValue(control);						
					}else{
						// valueMap[key] = null 
					}
				}
				self.data = valueMap;
				
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
