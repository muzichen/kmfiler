(function(window, document, $, undefined) {

    "use strict";


    var Filer = function(options) {

        var SETTINGS = $.extend({}, $.fn.filer.DEFAULTS, options);


        return this.each(function(index, ele) {
            var tpl = SETTINGS.fileTpl
            ,   btnText = SETTINGS.buttonText
            ,   classes = SETTINGS._classes
            ,   _this = $(this)
            ,   _form = _this.parents('form')
            ,   $_form = _form.append(tpl)
            ,   uuu = {
                    init : function() {
                        this._initTpl();
                    },
                    _initTpl : function() {
                        var $_button = $(classes.button);
                        btnText ? $_button.html(btnText) : $_button.html('');
                    }
                };

                console.log(_form);

            if (!$(this).hasClass('k-file-input')) {
                $(this).addClass('k-file-input');
            }


            uuu.init();
            


        });


        


    };

    $.fn.filer = Filer;

    $.fn.filer.DEFAULTS = {
            fileButton : '#k-file-input',
            fileTpl : '<div class="k-files-container"><div class="k-file-fake-input"><div class="k-file-input-button"></div></div></div>',
            buttonText : '选择文件',
            _classes : {
                container : '.k-files-container',
                button : '.k-file-input-button'
            }
    };



}(window, document, jQuery))