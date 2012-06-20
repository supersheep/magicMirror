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
	fetchItv	: 3000,
	viewUrl		: '/ajax/view.txt', // /board/ajax/viewDataAction
	deskUrl		: '/ajax/desk.txt',
	defineUrl	: '/ajax/define.txt',
	widgetUrl	: '/ajax/widget.txt',
	timefield	: 'mirrorDatetime', // mirrorDatetime
	dataParser	: function(data){
		var json,data;
	
		try{
			json = JSON.parse(data);
		}catch(e){
			console.error("json parse error",data);
		}
		
		try{
			data = JSON.parse(json.data);
		}catch(e){
			console.error("json parse error",json.data);
		}	
		
		return {
			data:data,
			xkey:json.xField,
			alias:json.viewAliasName,
			names:json.viewName
		}; // Response data.	
	},
	customDataParser:function(data){
		var ret;
		try{
			ret = JSON.parse(data).data;
		}catch(e){
			console.log("自定义widget",data);
			ret = [];
		}
		return ret;
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
		'chartTypes':{
			fullpath:'/resources/static/js/app/chartTypes.js'
		},
		'monitorPannel':{		
			fullpath:'/resources/static/js/app/monitorPannel.js',
			requires:['node','dd-drag','dd-constrain','resize','event-custom','io','setting','chartTypes']
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
		},
		'widgetAlert':{
			fullpath:'/resources/static/js/app/widgetAlert.js',
			requires:[]
		}
	}
};
