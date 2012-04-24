YUI.add('widgetManager',function(Y){
	function dom(tag,cls){
		var node = Y.Node.create('<'+tag+' />');
		cls && node.addClass(cls);
		return node;
	}
	function div(cls){
		return dom('div',cls);
	}
	
	function WidgetManager(widgets,me){
		var wrap = div('widgets'),
			ul = dom('ul','list'),
			elem = this.elem = div('widget-manager'),
			close = this.close  = div('close');
		
		me = me || [{name:"line"}];
		
		close.on('click',Y.bind(this.hide,this));
		
		elem.append(close);
		elem.append(wrap);
		wrap.append(ul);
		widgets.forEach(function(e,i){
			var li = dom('li','clear ' + (i%2?'order':'even')),
				checkbox = dom('input','checkbox').set('type','checkbox'),
				img = dom('img','icon').set('src',e.icon),
				name = dom('span','name').set('innerHTML',e.name);
			
			name = e.name;
			if(me.some(function(m){
				return m.name == name;
			})){
				
				li.addClass('active');
				checkbox.set('checked','checked');
				
			}
			
			checkbox.on('click',function(){
				li.toggleClass('active');
			});
				
			li.append(checkbox);
			li.append(img);
			li.append(name);
			ul.append(li);
		});
		
		new Y.DD.Drag({
			node: elem
		});		
		elem.appendTo('body');
		this.hide();
		
	}
	
	WidgetManager.prototype = {
		constructor : WidgetManager,
		show : function(){
			console.log('BOOM!!!');
			this.elem.setStyle('display','block');
		},
		hide:function(){
			this.elem.setStyle('display','none');	
		}
	}
	
	
	Y.WidgetManager = WidgetManager;
});