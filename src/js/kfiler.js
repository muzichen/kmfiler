(function(window, document, $, undefined) {

    "use strict";

    function Filer(ele, options) {
		this.$ele = $(ele);
		this.options = $.extend(true, {}, $.fn.DEFAULT, options);
		// 选择的文件，用于检测文件是否重复
		this.selected = [];
		this.init();
	}

	Filer.prototype.init = function () {
		
		this.initMultiple();

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

		var type = this.options.type.split('|'),
			_this = this;

		this.selected.oldLength = this.selected.length;
		
		// 检测文件是否重复

		$.each(files, function(index, file) {
						
			if(!_this.checkDuplicate(file) && _this.checkType(file, type)) {

				_this.selected.push(file);
				
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
				if ($.isFunction(_this.options.success)) {
					_this.options.success(data, textStatus, jqXHR, $tpl);
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				if ($.isFunction(_this.options.error)) {
					_this.options.error(jqXHR, textStatus, errorThrown, $tpl);
				}
			},
			complete: function (jqXHR, textStatus) {
				if ($.isFunction(_this.options.complete)) {
					_this.options.complete(jqXHR, textStatus, $tpl);
				}
			}
		});

		this.handleFileDelete($tpl);


	}
	/**
	 * @todo 删除还有点问题
	 */
	Filer.prototype.handleFileDelete = function() {

		var del = this.options._classes.delete,
			item = this.options._classes.item,
			_this = this;

		$(item).find(del).on('click', function(e) {
			

			var $item = $(this).parents(item);
			
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

			e.stopPropagation();
			return false;

		});


	}

	// 检测文件类型
	Filer.prototype.checkType = function (file, type) {

		var status = null;

		var ext = file.type.split('/').pop().toLowerCase();

		if ($.inArray(ext, type) === -1) {
			alert('文件类型错误!');
			status = false;
		} else {
			status = true;
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



	$.fn.kfiler = function (options) {

		if (!$.isPlainObject(options)) {
			throw new Error('参数错误');
			return;
		}

		return this.each(function () {
			new Filer(this, options);
		});

	}

	$.fn.DEFAULT = {
		url : '',
		// delUrl : '',
		button : '#js-fd-form-addimg',
		multiple : true,
		limits : 4,
		type : 'jpg|png',
		append : '.fd-form-images ul',
		filename : 'images',
		method : 'post',
		dataUrl : false,
		thumbnail : false,
		tpl : {
			item : ''
		},
		extraData: {
			basePath : '/static/img.enhance.cn/ke/gaofen'
		},
		_classes : {
			delete : '.fd-form-image-delete',
			item: '.fd-form-image-item'
		},
		success: null,
		delete: null
	};


}(window, document, jQuery))