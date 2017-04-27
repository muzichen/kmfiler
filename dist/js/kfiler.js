/**
 * 上传文件
 * @author lichen
 * @module common/kfiler
 * @time 2017-04-12
 */
define(function (require, exports, module) {

    var $  = require('jquery');
	/**
	 * kfiler constructor function
	 * @constructor {function} Filer
	 * @param {dom} ele 
	 * @param {object} options 
	 */ 
	function Filer(ele, options) {
		this.$ele = $(ele);
		this.options = $.extend(true, {}, $.fn.DEFAULT, options);	
		// 选择的文件，用于检测文件是否重复
		this.selected = [];
		this.init();
	}

	Filer.prototype.init = function () {
		// 初始化是否多文件上传
		this.initMultiple();
		// 事件绑定
		this.bindEvents();

	}
	// 初始化是否允许多文件上传
	Filer.prototype.initMultiple = function () {
		var multiple = this.options.multiple,
			$ele = this.$ele;

		if (multiple && $ele.attr('multiple') === undefined) {
			$ele.attr('multiple', 'multiple');
			return;
		}

		if (!multiple && $ele.attr('multiple') === 'multiple') {
			$ele.removeAttr('multiple');
		}

	}

	Filer.prototype.bindEvents = function () {

		var $button = $(this.options.button),
			$ele = this.$ele,
			_this = this;

		$button.on('click', function (e) {
			$ele.trigger('click');
			e.preventDefault();
			return false;
		});

		$ele.on('change', function (e) {
			_this.prepare(e.target.files);
			_this.start(_this.selected);
		});

	}

	Filer.prototype.prepare = function (files) {

		var type = this.options.type !== null && this.options.type.split('|'),
			_this = this;

		this.selected.oldLength = this.selected.length;

		// 如果limits不为null则需要检查文件个数
		if (this.options.limits !== null && !this.checkLimit(this.selected)) {
			alert('最多可以上传' + this.options.limits + '个文件!');
			return;
		}

		
		// 检测文件是否重复

		$.each(files, function(index, file) {

			file.uploaded = false;
						
			if(!_this.checkDuplicate(file)) {
				// 如果type为null则不用检查文件类型
				if (_this.options.type === null) {
					_this.selected.push(file);
				}

				if (_this.options.type !== null && _this.checkType(file, type)) {
					_this.selected.push(file);
				}
				
			};

		});

	}

	Filer.prototype.start = function (files) {

		var $append = $(this.options.append),
			itemTpl = this.options.tpl.item,
			_this = this,
			index;
		

		if (this.selected.oldLength) 
			index = this.selected.oldLength;
		
		
		$.each(this.selected.slice(index), function (index, file) {
				var $tpl = $(itemTpl);
				file.tpl = $tpl;
				// 使用dataUrl
				if ( _this.options.dataUrl ) {
					var reader = new FileReader();

					reader.readAsDataURL(file);

					reader.onload = function () {
						$tpl.find('img').attr('src', reader.result);
						$append.append($tpl);
						_this.handleFileUpload(file, $tpl);
					}

					reader.onerror = function (error) {
						throw new Error(error);
					}
					// 使用服务器图片
				} else if ( !_this.options.dataUrl ) {
					$append.append($tpl);
					_this.handleFileUpload(file, $tpl);
				}

		});

		this.handleFileDelete();

	}
	// 文件上传
	Filer.prototype.handleFileUpload = function (file, $tpl) {

		var formData = new FormData(),
			name = this.options.filename,
			_this = this;
		
		if ($.isPlainObject(this.options.extraData)) {
			$.each(this.options.extraData, function (name, value) {
				formData.append(name, value);
			});
		}

		formData.append(name, file);

		$.ajax({
			url: _this.options.url,
			type: _this.options.method,
			data: formData,
			processData: false,
			contentType: false,
			success: function (data, textStatus, jqXHR) {
				file.uploaded = true;
				if ($.isFunction(_this.options.success)) {
					_this.options.success(data, textStatus, jqXHR, $tpl);
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				file.uploaded = false;
				if ($.isFunction(_this.options.error)) {
					_this.options.error(jqXHR, textStatus, errorThrown, $tpl);
				}
			},
			complete: function (jqXHR, textStatus) {
				var c = true;
				$.each(_this.selected, function(index, item) {
					if (!item.uploaded) {
						c = false;
						return false;
					}
				});
				if ($.isFunction(_this.options.complete) && c) {
					_this.options.complete(true, jqXHR, textStatus, $tpl);
				}
			}
		});

	}
	/**
	 * @todo 删除还有点问题
	 */
	Filer.prototype.handleFileDelete = function() {

		var del = this.options._classes.delete,
			item = this.options._classes.item,
			append = this.options.append,
			_this = this;
		

		$(append).on('click', del, function(e) {

			e.preventDefault();

			var $item = $(this).parents(item);

			$.each(_this.selected, function(index, file) {
				if (file.tpl.is($item)) {
					_this.selected.splice(index, 1);
					return false;
				}
			});
		
			
			if ($.isFunction(_this.options.delete)) {
				_this.options.delete($item);
			}
			
			
			// $.ajax({
			// 	url: delUrl,
			// 	type: _this.options.method,
			// 	data: itemDel,
			// 	success: function (data, textStatus, jqXHR) {
			// 		_this.options.success(data, textStatus, jqXHR, itemDel, 'delete');
			// 	},
			// 	error: function (jqXHR, textStatus, errorThrown) {
			// 		_this.options.error(jqXHR, textStatus, errorThrown, itemDel, 'delete');
			// 	},
			// 	complete: function (jqXHR, textStatus) {
			// 		_this.options.complete(jqXHR, textStatus, itemDel, 'delete');
			// 	}
			// });

		});


	}

	// 检测文件类型
	Filer.prototype.checkType = function (file, type) {

		var status = true;

		var ext = file.type.split('/').pop().toLowerCase();
		// 如果扩展名不存在数组中，则类型错误
		if ($.inArray(ext, type) === -1) {
			alert('文件类型错误!');
			status = false;
		}

		return status;

	}

	/**
	 * 检测文件是否重复
	 */

	Filer.prototype.checkDuplicate = function(item) {

		var duplicate = false;
		
		
		$.each(this.selected, function(index, file) {
			if (item.name === file.name) {
				duplicate = true;
				return false;
			} 
		});

		return duplicate;

	}

	/**
	 * 检测文件个数
	 */

	Filer.prototype.checkLimit = function(files) {
		var limits = this.options.limits,
			len = files.length;	
		return len >= limits ? false : true;
	}



	$.fn.kfiler = function (options) {

		if (!$.isPlainObject(options)) {
			throw new Error('参数错误');
			return;
		}

		return this.each(function () {
			new Filer(this, options);
		});

	}
	/**
	 * 默认选项
	 */
	$.fn.DEFAULT = {
		// 上传文件链接
		url : '',
		// delUrl : '',
		// 上传文件按钮的类或id
		button : '#js-fd-form-addimg',
		// 是否允许多文件上传
		multiple : true,
		// 限制上传文件个数
		limits : null,
		// 文件上传类型 jpg|png
		type : null,
		// 文件item追加的位置
		append : '.fd-form-images ul',
		// input file的name值
		filename : 'images',
		method : 'post',
		// 缩略图显示方式 base64或上传后的图
		dataUrl : false,
		// 是否显示缩略图
		thumbnail : false,
		// 文件item的模板
		tpl : {
			item : ''
		},
		// 需要与图片一起上传的额外数据
		extraData: {
			basePath : '/static/img.enhance.cn/ke/gaofen'
		},
		// 相关的class名
		_classes : {
			delete : '.fd-form-image-delete',
			item: '.fd-form-image-item'
		},
		// 文件上传成功回调函数
		success: null,
		// 文件上传出错回调函数
		error: null,
		// 全部文件上传成功回调函数,第一个参数为true的话则所有文件上传成功
		complete: null
	};
    

    return $;

});



	
