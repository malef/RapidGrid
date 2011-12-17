"use strict";

(function($) {
    
    $.widget('ui.helper', {
        options: {

        },
        _init: function() {
            var w = this;
            w.state = {};
            w._initRender();
        },
        _initRender: function() {
            var w = this;
            w.element
                .addClass('helper')
                .hide();
        },
        show: function(message) {
            var w = this, o = w.options;
            o.message = message;
            w.element.html(o.message).fadeIn('normal', function() {
                w.state.visible = true;
            });
        },
        clear: function() {
            var w = this, o = w.options;
            o.message = '';
            w.element.fadeOut('normal', function() {
                w.state.visible = false;
                w.element.html(o.message);
            });
        }
    });
    
}(jQuery));