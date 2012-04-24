var APP_CONFIG = {
	ajaxUrl		: '/ajax/view.php', // /board/ajax/viewDataAction
	timefield	: 'time', // mirrorDatetime
	dataParser	: function(data){
		// return JSON.parse(JSON.parse(o.responseText).data); // Response data.
		return JSON.parse(data).data;
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
			requires:['node','dd-drag','resize','event-custom','io','setting']
		},
		'monitorFactory':{
			fullpath:'/resources/static/js/app/monitorFactory.js',
			requires:['monitorPannel']
		},
		'desktop':{
			fullpath:'/resources/static/js/app/desktop.js',
			requires:['node','event-custom','monitorFactory'],
		},
		'widgetManager':{
			fullpath:'/resources/static/js/app/widgetManager.js',
			requires:['node','dd-drag','event-custom']
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
