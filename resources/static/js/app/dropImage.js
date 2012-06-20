YUI.add('dropImage',function(Y){


// 判断是否图片
function isImage(type) {
	switch (type) {
	case 'image/jpeg':
	case 'image/png':
	case 'image/gif':
	case 'image/bmp':
	case 'image/jpg':
		return true;
	default:
		return false;
	}
}

function handleFileSelect(evt){
	evt.stopPropagation();
	evt.preventDefault();
	var self = this,
		cnt = this.container,
		files = evt._event.dataTransfer.files,
		f = files[0],
		type = f.type ? f.type : 'n/a',
		isImg = isImage(type),
		reader = new FileReader(),
		img;
		
	// 处理得到的图片
	if (isImg) {
		reader.onload = function (e) {
			var img = Y.Node.create('<img />'),
				dataurl = e.target.result;
			img.addClass('preview').setAttribute('src',dataurl);
			cnt.empty().append(img);
			self.fire('load',{
				filedata:f
			});
		};
		reader.readAsDataURL(f);
	} else {
		alert('"o((>ω< ))o"，你传进来的不是图片！！');
	}
	
	cnt.setStyle('border','none');
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
}

function handleDragLeave(evt){ 
	this.setStyle('border', 'none'); 
}

function handlerDragEnter(evt){
	this.setStyle('border','1px #39d dashed');
	this.setStyle('width',48);
	this.setStyle('height',48);

}		

function DropImage(cnt){
	cnt.on('dragenter',handlerDragEnter);
	cnt.on('dragover',handleDragOver);
	cnt.on('drop',Y.bind(handleFileSelect,this));
	cnt.on('dragleave',handleDragLeave);
	this.container = cnt;
	return this;
}

Y.augment(DropImage, Y.EventTarget);

Y.DropImage=DropImage;

});