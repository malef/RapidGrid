"use strict";

(function ($){ 

    $.widget('ui.page', {
        options: {
            width: 960,
            gridColumns: 16,
            gutterWidth: 10
        },

        getWidth: function () {
            var w = this, o = w.options;
            return o.width;
        },
        getGridColumns: function () {
            var w = this, o = w.options;
            return o.gridColumns;
        },
        getGutterWidth: function () {
            var w = this, o = w.options;
            return o.gutterWidth;
        },

        setNaturalContainerSequence: function () {
            var w = this, c = w.children;
            $.each(c.strips, function(index, strip) {
                strip.setNaturalContainerSequence();
            });
//            w.render();
        },

        _init: function () {
            var w = this, o = w.options;
            w.children = {
                strips: []
            };
            w._initRender();
        },
        _initRender: function () {
            var w = this, o = w.options, c = w.children, e = w.elements = {};
            e.stripsWrapper = $('<div/>');
            e.insert = $('<div/>');
            e.stripsWrapper
                .addClass('page-strip-wrapper')
                .css({width: o.width})
                .sortable({
                    distance: 50,
                    stop: function(event, ui) {
                        var reorderedStrips = [];
                        $('> .strip', e.stripsWrapper).each(function(index, strip) {
                            reorderedStrips.push($(strip).data('strip'));
                        });
                        c.strips = reorderedStrips;
                        w.render(true);
                    }
                });
            e.insert
                .text('Add strip')
                .addClass('page-insert')
                .css({width: o.width})
                .bind('dblclick', function () {
                    App.addStrip(w);
                });
            w.element
                .addClass('page')
                .css({width: o.width})
                .append(e.stripsWrapper)
                .append(e.insert);
        },
        addStrip: function (stripOptions) {
            var w = this, e = w.elements, c = w.children,
                strip = $('<div/>');
            strip.strip($.extend({
                parent: w,
                gridColumns: w.getGridColumns(),
                gutterWidth: w.getGutterWidth()
            }, stripOptions));
            strip = strip.data('strip');
            e.stripsWrapper.append(strip.element);
            c.strips.push(strip);
            strip.render(true);
            return w;
        },
        render: function (propagate) {
            var w = this, o = w.options, c = w.children;
            if (propagate === undefined) {
                propagate = false;
            }
            if (propagate) {
                $.each(c.strips, function (index, strip) {
                    strip.render(true);
                });
            }
        },
        
        getData: function () {
            var w = this, o = w.options, e = w.elements, c = w.children,
                data = {};
            data.options = {
                width: o.width,
                gridColumns: o.gridColumns,
                gutterWidth: o.gutterWidth
            };
            data.strips = [];
            $.each(c.strips, function (index, strip) {
                data.strips.push(strip.getData());
            });
            return data;
        },
        setData: function (data) {
            var w = this, o = w.options, c = w.children;
            $.each(data.strips, function (index, stripData) {
                w.addStrip(stripData.options);
            });
            $.each(c.strips, function (index, strip) {
                strip.setData(data.strips[index]);
            });
        },
        
        generateStylesheet: function () {
            var w = this, o = w.options, c = w.children,
                gridColumnsList = [],
                gutterWidthList = [],
                maxGridColumns;

            $.each(c.strips, function (index, strip) {
                gridColumnsList.push(strip.getGridColumns());
                gutterWidthList.push(strip.getGutterWidth());
            });
            $.unique(gridColumnsList);
            $.unique(gutterWidthList);
            maxGridColumns = Math.max.apply(this, gridColumnsList);

            // body
            App.Stylesheet.addEntry('body', {'min-width' : o.width + 'px'});

            // .container_N
            $.each(gridColumnsList, function (index, gridColumns) {
                App.Stylesheet.addEntry('.container_' + gridColumns, {
                    'margin-left': 'auto',
                    'margin-right': 'auto',
                    'width': o.width + 'px'
                });
            });

            // .grid_1..Nmax
            // .push_1..Nmax
            // .pull_1..Nmax
            (function () {
                var index;
                for (index = 1; index <= maxGridColumns; index++) {
                    App.Stylesheet.addEntry('.grid_' + index, {
                        'display': 'inline',
                        'float': 'left',
                    	'position': 'relative'
                    });
                }
                for (index = 1; index <= maxGridColumns; index++) {
                    App.Stylesheet.addEntry('.push_' + index, {
                        'position': 'relative'
                    });
                }
                for (index = 1; index <= maxGridColumns; index++) {
                    App.Stylesheet.addEntry('.pull_' + index, {
                        'position': 'relative'
                    });
                }
            }());

            // .alpha
            // .omega
            App.Stylesheet
              .addEntry('.alpha', {'margin-left': '0'})
              .addEntry('.omega', {'margin-right': '0'});

            // .container_N_gutter_W .grid_1..N,
            $.each(c.strips, function (index, strip) {
                var index2,
                    columnWidth = o.width / strip.getGridColumns();
                for (index2 = 1; index2 <= strip.getGridColumns(); index2++) {
                    App.Stylesheet.addEntry('.container_' + strip.getGridColumns() + '_gutter_' + strip.getGutterWidth() + ' .grid_' + index2, {
                        'width': (index2 * columnWidth - 2 * strip.getGutterWidth()) + 'px', 
                        'margin-left': strip.getGutterWidth() + 'px',
                        'margin-right': strip.getGutterWidth() + 'px'
                    });
                }
            });
            
            // .container_N .prefix_1..N, .container_N .suffix_1..N,
            // .container_N .push_1..N, .container_N .pull_1..N,
            $.each(gridColumnsList, function (index, gridColumns) {
                var index2,
                    columnWidth = o.width / gridColumns;
                for (index2 = 1; index2 <= gridColumns - 1; index2++) {
                    App.Stylesheet.addEntry('.container_' + gridColumns + ' .prefix_' + index2, {
                        'padding-left': (index2 * columnWidth) + 'px'
                    });
                }
                for (index2 = 1; index2 <= gridColumns - 1; index2++) {
                    App.Stylesheet.addEntry('.container_' + gridColumns + ' .suffix_' + index2, {
                        'padding-right': (index2 * columnWidth) + 'px'
                    });
                }
                for (index2 = 1; index2 <= gridColumns - 1; index2++) {
                    App.Stylesheet.addEntry('.container_' + gridColumns + ' .push_' + index2, {
                        'left': (index2 * columnWidth) + 'px'
                    });
                }
                for (index2 = 1; index2 <= gridColumns - 1; index2++) {
                    App.Stylesheet.addEntry('.container_' + gridColumns + ' .pull_' + index2, {
                        'left': -(index2 * columnWidth) + 'px'
                    });
                }
            });

            // .clear, .clearfix
            App.Stylesheet
                .addEntry('.clear', {
                    'clear': 'both',
                    'display': 'block',
                    'overflow': 'hidden',
                    'visibility': 'hidden',
                    'width': '0',
                    'height': '0'                    
                })
                .addEntry('.clearfix:before', {
                    'content': "'.'",
                    'display': 'block',
                    'overflow': 'hidden',
                    'visibility': 'hidden',
                    'width': '0',
                    'height': '0'
                })
                .addEntry('.clearfix:after', {
                    'content': "'.'",
                    'display': 'block',
                    'overflow': 'hidden',
                    'visibility': 'hidden',
                    'width': '0',
                    'height': '0',
                    'clear': 'both'
                })
                .addEntry('.clearfix', {
                    'zoom': '1'
                });
              
            return App.Stylesheet.render().join('\n');
        },
        
        generateMarkup: function () {
            var w = this, c = w.children,
                rootTag = App.Markup.createTag('div');
            rootTag.addClass('layout');
            $.each(c.strips, function (index, strip) {
                rootTag.append(strip.generateMarkup());
            });
            return rootTag.render().join('');
        },
        
        clearContainerSequences: function () {
            var w = this, c = w.children;
            $.each(c.strips, function (index, strip) {
                strip.clearContainerSequences();
            });
            w.render(true);
        },
        setLowestAvailableSequence: function () {
            // nop
        },
        setMissingContainerSequences: function () {
            var w = this, c = w.children;
            $.each(c.strips, function(index, strip) {
                strip.setMissingContainerSequences();
            });
        },

        getParentStrip: function() {
            return undefined;
        },
        getPreviousStrip: function (strip) { // Propagate argument is intentionally ignored.
            var w = this, c = w.children,
                stripIndex;
            stripIndex = c.strips.indexOf(strip);
            if (stripIndex === -1) {
                throw 'Strip is not a child of this page.';
            }
            if (stripIndex > 0) {
              return c.strips[stripIndex - 1];
            }
        },
        getPreviousStrips: function (strip) {
            var w = this, c = w.children,
                stripIndex;
            stripIndex = c.strips.indexOf(strip);
            if (stripIndex === -1) {
                throw 'Strip is not a child of this page.';
            }
            return c.strips.slice(0, stripIndex);
        },
        
        getSequence: function (calculate) {
            // Calculate is ignored intentionally
            return 0;
        },
        
        isContainer: function () {
            return false;
        }
    });

}(jQuery));