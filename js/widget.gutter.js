"use strict";

(function($){ 

    $.widget('ui.gutter', {
        options: {},
        
        calculateOffset: function(offsetType) {
            var w = this, p = w.parent;
            return p.calculateGutterOffset(w.getPosition(), offsetType);
        },
        calculateWidth: function() {
            var w = this, p = w.parent;
            return p.calculateGutterWidth();
        },
        
        getPosition: function() {
            var w = this, p = w.parent;
            return p.getGutterPosition(w);
        },
        
        getLeftContainer: function() {
            var w = this, o = w.options, p = w.parent;
            return p.getContainer(p.getGutterIndex(w));
        },
        getRightContainer: function() {
            var w = this, o = w.options, p = w.parent;
            return p.getContainer(p.getGutterIndex(w) + 1);
        },
        
        getLeftGutterPosition: function() {
            var w = this, o = w.options, p = w.parent;
            return p.getGutterPosition(p.getGutterIndex(w) - 1);
        },
        getRightGutterPosition: function() {
            var w = this, o = w.options, p = w.parent;
            return p.getGutterPosition(p.getGutterIndex(w) + 1);
        },
        
        _init: function() {
            var w = this, o = w.options;
            w.parent = o.parent;
            delete o.parent;
            w._initRender();
        },
        _initRender: function() {
            var w = this, p = w.parent;
            w.element
                .addClass('gutter')
                .draggable({
                    axis: 'x',
                    containment: p.element,
                    distance: w.calculateWidth() / 2,
                    grid: [p.calculateColumnWidth(), 1],
                    helper: function() {
                        return w.element.clone().addClass('gutter-helper');
                    },
                    start: function() {
                        p.element.css({cursor: 'ew-resize'});
                        w.element.addClass('gutter-dragged');
                        w.getRightContainer().element.addClass('container-dragged');
                        w.getLeftContainer().element.addClass('container-dragged');
                    },
                    stop: function() {
                        p.element.css({cursor: 'auto'});
                        w.element.removeClass('gutter-dragged');
                        w.getRightContainer().element.removeClass('container-dragged');
                        w.getLeftContainer().element.removeClass('container-dragged');
                    }
                })
//                .mouseenter(function(event, ui) {
//                    w.element.trigger({
//                        type: 'helper_show', 
//                        helperMessage: 'Drag the gutter to adjust adjacent columns width. Double click to remove gutter and merge adjacent containers.'
//                    });
//                })
//                .mouseleave(function(event, ui) {
//                    w.element.trigger({
//                        type: 'helper_clear'
//                    });
//                })
                .bind('drag', function(event, ui) {
                    var newPosition = p.calculateGutterPosition(parseInt(ui.helper.css('left'), 'left'));
                    p.moveGutter(w, newPosition);
                    p.render(true);
                })
                .bind('dblclick', function(event) {
                    switch (App.getActiveAction()) {
                        case 'splitAndMergeContainers':
                            p.mergeAdjacentContainers(w);
                            break;
                        default:
                            break;
                    }
                });
        },
        render: function() {
            var w = this;
            if (w.getPosition() === undefined) {
                return;
            }
            w.element.css({
                left: w.calculateOffset('left'),
                width: w.calculateWidth()
            });
        }
    });

}(jQuery));
