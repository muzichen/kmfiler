(function(window, document, $, undefined) {

    "use strict";


    var Filer = function(options) {

        var SETTINGS = $.extend({}, $.fn.filer.DEFAULTS, options);


        return this.each(function(index, ele) {
            var tpl = SETTINGS.fileTpl
            ,   btnText = SETTINGS.buttonText
            ,   classes = SETTINGS._classes
            ,   url = SETTINGS.url
            ,   limit = SETTINGS.limit
            ,   thumb = SETTINGS.thumb
            ,   append = SETTINGS.append
            ,   flItemTpl = SETTINGS.fileItem
            ,   doneCallback = SETTINGS.done
            ,   errorCallback = SETTINGS.error
            ,   ajaxMode = SETTINGS.ajaxMode
            // classes start
            ,   flContainer = classes.fileContainer
            ,   flItem = classes.fileItem
            ,   flThumb = classes.thumb
            ,   del = classes.delete
            // classes end
            ,   _this = $(this)
            ,   _form = _this.parents("form")
            ,   $form = _form.append(tpl)
            ,   uuu = {
                    init : function() {
                        this._initTpl();
                        this._initEvents();
                    },
                    _data : {
                        _filesCount : 0,
                    },
                    // 初始化上传文件的按钮样式等
                    _initTpl : function() {
                        var $button = $(classes.button);
                        btnText ? $button.html(btnText) : $button.html(" ");
                    },
                    // 初始化事件绑定
                    _initEvents : function() {
                        var self = this;
                        _form
                        .on('click', classes.button, function() {
                            _this
                                .trigger('click')
                                .off('change')
                                .on('change', function() {
                                    self._handleFiles.call(this);
                                });
                        })
                        .on('click', classes.delete, function() {
                            alert('delete');
                        });
                    },
                    _handleFiles : function() {
                        var files = this.files
                        ,   formData = new FormData
                        ,   self = this;
                        // 用于判断已选文件的个数
                        uuu._data._filesCount += files.length;
                        if (uuu._data._filesCount > limit) {
                            alert("最多只能上传" + limit + "个文件");
                            return;
                        }
                        $(files).each(function(i, ifile) {
                            if (ifile) {
                                formData.append('__files[]', ifile);
                                uuu._selectedFilesMap(ifile);
                            }
                        });
                        // 判断是否为editMode,如果不是的话则用ajax上传，如果是的话则用form表单上传
                        ajaxMode ? uuu._ajaxUploadFiles(formData) : uuu._formUploadFiles();     
                    },
                    _ajaxUploadFiles : function(data) {
                        // 用ajax实现文件的上传
                        $.ajax({
                            url : url,
                            type : 'POST',
                            data : data,
                            processData : false,
                            contentType : false,
                            mimeType:"multipart/form-data",
                            xhr : function() {
                                // 更新进度条
                                // 这里上传文件是将选择的多个文件写在一个formdata中一块儿上传，需要修改为一个文件一个文件的单独上传
                                var xhr = $.ajaxSettings.xhr();
                                
                                if (xhr.upload) {
                                    xhr.upload.addEventListener("progress", function(e) {
                                       var  percent = 0
                                       ,    pos = e.loaded || e.position
                                       ,    total = e.total;
                                       if (e.lengthComputable) {
                                           percent = Math.ceil(pos / total * 100);
                                           console.log(percent);
                                       }
                                    }, true);
                                }
                                
                                return xhr;
                            },
                            success : function(res) {
                                if ($.isFunction(doneCallback)) {
                                    doneCallback.call(null, res);
                                } else {
                                    console.log(res);
                                }
                            },
                            error : function(err) {
                                if ($.isFunction(errorCallback)) {
                                    errorCallback.call(null, err);
                                } else {
                                    console.log(err);
                                }
                            }
                        });
                    },
                    _formUploadFiles : function() {

                    },
                    _selectedFilesMap : function(file) {
                        var reader = new FileReader(),
                            secFileTpl = "";

                        reader.readAsDataURL(file);

                        reader.onload = function(e) {
                            var img = "<img src=" + e.target.result + " alt=" + file.name + ">",
                                newItem = flItemTpl.replace(/\[\[thumb\]\]/, img).replace(/\[\[name\]\]/, file.name);
                            $(append).append(newItem);
                        };

                        // 根据ajaxMode判断是否显示删除按钮

                        ajaxMode ? $(del).remove() : '';

                    }
                };  


            if (!$(this).hasClass("k-file-input")) {
                $(this).addClass("k-file-input");
            }


            uuu.init();
            


        });


    };

    $.fn.filer = Filer;

    $.fn.filer.DEFAULTS = {
            limit : 1,
            url : '',
            thumb : true,
            fileButton : "#k-file-input",
            fileTpl : "<div class=\"k-files-container\"><div class=\"k-file-fake-input\"><div class=\"k-file-input-button\"></div><div class=\"k-files\"><ul class=\"k-files-items\"></ul></div></div></div>",
            append : ".k-files-items",
            fileItem : "<li class=\"k-file-item\"><div class=\"k-file-item-container\"><div class=\"k-file-item-thumb\">[[thumb]]</div><div class=\"k-file-item-name\">[[name]]</div><a href=\"javascript:;\" class=\"k-file-delete\">X</a></div></li>",
            buttonText : "选择文件",
            done : null,
            error : null,
            ajaxMode : true,
            _classes : { 
                container : ".k-files-container",
                button : ".k-file-input-button",
                fileContainer : ".k-files-items",
                fileItem : '.k-file-item',
                thumb : '.k-file-item-thumb',
                name : '.k-file-item-name',
                delete : '.k-file-delete'
            }
    };



}(window, document, jQuery))