function log(action,obj){
	var title;
	if(APP_CONFIG['debug']){
		title = obj.constructor.name + ':' + action;
		console.count(title);
		//console.debug(title);
	}
}

var FORMATTERS = {
	time:function(t){
		var time = new Date(+t);
		return	time.getFullYear() + "-" + (
        		time.getMonth()+1) + "-" + 
    			time.getDate() + " " + 
    			time.getHours() + ":" + 
				time.getMinutes();
	},
	kilo:function(v){
		if(v>=1000){
			return (v/1000).toFixed(1) + 'k';
		}
		return v;
	}
}

var TRACK_FORMATTERS = {
	time:function(d){	
    	return 'Time:' + FORMATTERS['time'](d.x) + ',' + 'Val:' + d.y;
	}
}

var APP_CONFIG = {
	debug		: false,
	fetchItv	: 3,
	viewUrl		: '/ajax/view.txt', // /board/ajax/viewDataAction
	deskUrl		: '/ajax/desk.txt',
	defineUrl	: '/ajax/define.txt',
	widgetUrl	: '/ajax/widget.txt',
	timefield	: 'mirrorDatetime', // mirrorDatetime
	dataParser	: function(data){
		var json = JSON.parse(data);
		var data = JSON.parse(json.data);
		
		return {
			data:data,
			xkey:json.xField,
			alias:json.viewAliasName,
			names:json.viewName
		}; // Response data.
		//return JSON.parse(data).data;
	},
	customDataParser:function(data){
		//return data;
		return JSON.parse(data).data;
	},
	chartTypes	: {
		"bar":{
			"ycount":1,
			"yaxis":{
				tickFormatter:FORMATTERS['kilo']
			},
			"bars" : {
	    		show : true,
	    		shadowSize : 0,
	    		barWidth : 0.5
			},
			"mouse" : { track : true }
		},
		"line":{
			"ycount":1,
			"yaxis":{
				tickFormatter:FORMATTERS['kilo']
			},
			"mouse" : { 
				track : true,
				trackFormatter:TRACK_FORMATTERS['time']
			}
		},
		"candle":{
			"ycount":4,
		    "candles" : { show : true, candleWidth : 0.6 },
		    "xaxis"   : { noTicks : 10 }
		},
		"bubble":{
			"ycount":2,
			"bubbles" : { 
				show : true, 
				baseRadius : 5 
			},
			"mouse" : { track : true }
		},
		"pie":{
			"pie" : {
		    	show : true, 
		    	explode : 6
		    },
			xaxis : { showLabels : false },
			yaxis : { showLabels : false },
		    grid : {
    			verticalLines : false,
      			horizontalLines : false
    		},
    		legend : {
			    position : 'se',
		    	backgroundColor : '#D2E8FF'
		    },
		    "mouse" : { track : true }
		}
	}
};


var YUI_CONFIG = {
	combine:false ,//  use the Yahoo! CDN combo service for YUI resources。
	lang:"zh-Hans-CN",
	filter:'raw',//默认加载模块的*-min.js压缩文件，通过配置raw或debug，可以加载模块对应的*.js或*-debug.js。
	modules:{		//设定加载的YUI开发包之外的模块。 配置模块名及对应的文件地址和依赖模块
		'timepicker':{
			fullpath:'/resources/static/js/app/timepicker.js',
			requires:['node','event-custom','calendar','overlay','datatype','intl']
		},
		'setting':{
			fullpath:'/resources/static/js/app/setting.js',
			requires:['node','event-custom','timepicker']
		},
		'monitorPannel':{		
			fullpath:'/resources/static/js/app/monitorPannel.js',
			requires:['node','dd-drag','dd-constrain','resize','event-custom','io','setting']
		},
		'monitorFactory':{
			fullpath:'/resources/static/js/app/monitorFactory.js',
			requires:['monitorPannel']
		},
		'dropImage':{
			fullpath:'/resources/static/js/app/dropImage.js',
			requires:['event-custom']
		},
		'desktop':{
			fullpath:'/resources/static/js/app/desktop.js',
			requires:['node','event-custom','monitorFactory'],
		},
		'widgetManager':{
			fullpath:'/resources/static/js/app/widgetManager.js',
			requires:['node','dd-drag','event-custom','dropImage']
		},
		'desktopManager':{
			fullpath:'/resources/static/js/app/desktopManager.js',                   
			requires:['desktop']
		}
	} /*,                            
	groups:{			//设定加载一组YUI开发包之外的模块集合，
		'groupName':{
			base:'',
			modules:{
				'module1':{path:'',requires:[],skinnable:true}//注：设定skinnable=true可以依据YUI定义的模块组织目录结构自动加载该模块依赖的css文件
			}
		}
	}*/
};
