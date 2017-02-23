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
            ,   doneCallback = SETTINGS.done
            ,   _this = $(this)
            ,   _form = _this.parents("form")
            ,   $form = _form.append(tpl)
            ,   uuu = {
                    init : function() {
                        this._initTpl();
                        this._initEvents();
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
                                .on('change', function() {
                                    self._handleFiles.call(this);
                                });
                        });
                    },
                    _handleFiles : function() {
                        var files = this.files
                        ,   fileLen = files.length
                        ,   formData = new FormData;
                        if (fileLen > limit) {
                            alert("最多只能上传" + limit + "个文件");
                            return;
                        }
                        $(files).each(function(i, ifile) {
                            if (ifile) {
                                formData.append('__files[]', ifile);
                            }
                        });
                        uuu._uploadFiles(formData);
                    },
                    _uploadFiles : function(data) {
                        // 用ajax实现文件的上传
                        $.ajax({
                            url : url,
                            type : 'POST',
                            data : data,
                            processData : false,
                            contentType : false,
                            mimeType:"multipart/form-data"
                        }).done(function(res) {
                           if ($.isFunction(doneCallback)) {
                               doneCallback.call(null, res);
                           } else {
                               alert('Done is not a function!');
                           }
                        });
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
            fileButton : "#k-file-input",
            fileTpl : "<div class=\"k-files-container\"><div class=\"k-file-fake-input\"><div class=\"k-file-input-button\"></div></div></div>",
            buttonText : "选择文件",
            done : null,
            _classes : {
                container : ".k-files-container",
                button : ".k-file-input-button"
            }
    };



}(window, document, jQuery))