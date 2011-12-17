"use strict";

(function ($){ 

    $.widget('ui.container', {
        options: {
            sequence: undefined,
            classNames: '',
            id: '',
            content: ''
        },

        calculateColumnWidth: function () {
            var w = this, p = w.parent;
            return p.calculateColumnWidth();  
        },
        calculateOffset: function (offsetType) {
            var w = this, p = w.parent;
            return p.calculateContainerOffset(w.getGutterPositions(), offsetType);
        },
        calculateWidth: function () {
            var w = this, p = w.parent;
            return p.calculateContainerWidth(w.getGutterPositions());
        },
        
        getGutterPositions: function () {
            var w = this, p = w.parent;
            return p.getContainerGutterPositions(w);
        },
        
        getWidth: function () {
            var w = this;
            return w.calculateWidth();
        },

        getMinGridColumns: function () {
            var w = this, c = w.children,
                minGridColumns = 1;
            w.element.css({color: 'red !important'});
            $.each(c.strips, function (index, strip) {
                minGridColumns = Math.max(minGridColumns, strip.getMinGridColumns());
            });
            w.element.css({color: 'black !important'});
            return minGridColumns;
        },
        
        _init: function () {
            var w = this, o = w.options;
            w.parent = o.parent;
            delete o.parent;
            w.children = {
                strips: []
            };
            w.elements = {};
            w._initRender();
        },
        
        _initRender: function () {
            var w = this, o = w.options, e = w.elements, c = w.children, p = w.parent;
            e.sequence = $('<div/>');
            e.sequence.addClass('container-sequence');
            e.width = $('<div/>');
            e.width.addClass('container-width');
            e.selectors = $('<div/>');
            e.selectors.addClass('container-selectors');
            e.stripsWrapper = $('<div/>');
            e.stripsWrapper.addClass('container-strip-wrapper');
            e.addStrip = $('<div>Add strip</div>');
            e.addStrip
                .addClass('container-add-strip')
                .bind('dblclick', function (event) {
                    w.addStrip(); 
                    if (c.strips.length === 1) {
                        w.addStrip(); 
                    }
                });
            w.element
                .addClass('container')
                .append(e.sequence)
                .append(e.width)
                .append(e.selectors)
                .append(e.stripsWrapper)
                .append(e.addStrip)
                .bind('dblclick', function (event) {
                    switch (App.getActiveAction()) {
                        case 'reorderContainers':
                            (function () {
                                if (o.sequence === undefined) {
                                    w.setLowestAvailableSequence(false);
                                    p.getParent().setLowestAvailableSequence(false);
                                    App.render();
                                }
                            }());
                            break;
                        case 'getCode':
                            break;
                        case 'splitAndMergeContainers':
                            (function () {
                                var offset = w.element.offset(),
                                    offsetCenter =  event.pageX - offset.left,
                                    newGutterPosition;
                                newGutterPosition = Math.round(p.calculateGutterPosition(offsetCenter, 'center'));
                                p.splitContainer(w, newGutterPosition);
                            }());
                            break;
                        case 'containerOptions':
                            App.showContainerOptionsModal(w);
                        default:
                            break;
                    }
                    event.stopPropagation();
                });
        },
        render: function (propagate) {
            var w = this, o = w.options, c = w.children, e = w.elements, p = w.parent,
                gutterPositions = w.getGutterPositions(),
                colWidth,
                sequence,
                sequenceSet,
                selectors = [];
            if (propagate === undefined) {
                propagate = false;
            }
            if (gutterPositions === undefined) {
                return; // TODO Refactor, do not render until ready
            }
            colWidth = gutterPositions[1] - gutterPositions[0];
            if (p.hasFewContainers() && App.getActiveAction() === 'addStrip') {
                e.addStrip
                    .css({
                        width: w.getWidth()
                    })
                    .show();
            }
            else {
                e.addStrip.hide();
            }
            w.element.css({
                left: w.calculateOffset('left'),
                width: w.calculateWidth()
            });
            if (c.strips.length === 0) {
                w.element.addClass('container-without-strips');
                e.stripsWrapper.hide();
                // Sequence indicator
                sequenceSet = w.getSequence() !== undefined;
                sequence = w.getSequence(true) + 1;
                e.sequence
                    .html(sequence + '<sup>' + App.getOridinalSuffix(sequence) + '</sup>')
                    .css({
                        marginTop: (p.options.height - 90) / 2
                    });
                if (sequenceSet) {
                    e.sequence.removeClass('container-sequence-calculated');
                }
                else {
                    e.sequence.addClass('container-sequence-calculated');
                }
                // Width indicator
                e.width
                    .html(colWidth + '<span class="container-width-label">col' + (colWidth > 1 ? 's' : '') + '</span>');
                // Selectors indicator
                if (o.classNames !== '') {
                    $.each(o.classNames.split(' '), function (index, className) {
                        selectors.push('.' + className);
                    });
                }
                if (o.id !== '') {
                    selectors.push('#' + o.id);
                }
                e.selectors.text(selectors.join(' '));
            }
            else {
                w.element.removeClass('container-without-strips');
                e.stripsWrapper.show();
                e.sequence.hide();
                e.width.hide();
                e.selectors.hide();
            }
            // Render children
            if (propagate) {
                $.each(c.strips, function (index, strip) {
                    strip.render(true);
                });
            }
        },
        
        getData: function () {
            var w = this, o = w.options, c = w.children,
                data = {};
            data.options = {
                sequence: o.sequence,
                classNames: o.classNames,
                id: o.id,
                content: o.content
            };
            data.strips = [];
            $.each(c.strips, function (index, strip) {
                data.strips.push(strip.getData());
            });
            return data;
        },
        setData: function (data) {
            var w = this, c = w.children;
            w.options = data.options;
            $.each(data.strips, function (index, stripData) {
                w.addStrip(stripData.options);
            });
            $.each(data.strips, function (index, stripData) {
                c.strips[index].setData(stripData);
            });
        },
        
        generateMarkup: function () {
            var w = this, o = w.options, c = w.children,
                gutterPositions = w.getGutterPositions(),
                rootTag = App.Markup.createTag('div'),
                pushPull = w.calculatePushPullGridColumns();
            rootTag.addClass('grid_' + (gutterPositions[1] - gutterPositions[0]));
            if (pushPull > 0) {
                rootTag.addClass('push_' + pushPull);
            }
            else if (pushPull < 0) {
                rootTag.addClass('pull_' + (-pushPull));
            }
            if (o.classNames !== '') {
                $.each(o.classNames.split(' '), function (index, className) {
                    rootTag.addClass(className);
                });
            }
            if (o.id !== '') {
                rootTag.setId(o.id);
            }
            if (c.strips.length > 0) {
                $.each(c.strips, function (index, strip) {
                    rootTag.append(strip.generateMarkup());
                });
            }
            else {
                rootTag.setContent('Lorem ipsum dolor sit amet.');
            }
            return rootTag;
        },
        
        clearSequence: function (deep) {
            var w = this, o = w.options, c = w.children;
            if (deep === undefined) {
                deep = true;
            }
            o.sequence = undefined;
            if (deep) {
                $.each(c.strips, function (index, strip) {
                    strip.clearContainerSequences();
                });
            }
        },
        setLowestAvailableSequence: function (propagate) {
            var w = this, o = w.options, p = w.parent;
            if (propagate === undefined) {
                propagate = true;
            }
            o.sequence = p.getLowestAvailableSequence();
            if (propagate) {
                p.setSkippedContainerSequences(true);
            }
            w.render();
        },
        setMissingContainerSequences: function () {
            var w = this, o = w.options, c = w.children;
            if (o.sequence === undefined) {
                w.setLowestAvailableSequence(false);
                if (c.strips.length > 0) {
                    $.each(c.strips, function (index, strip) {
                        strip.setMissingContainerSequences();
                    });
                }
            }
        },
        
        getPreviousStrip: function (strip, propagate) {
            var w = this, c = w.children, p = w.parent,
                stripIndex;
            if (propagate === undefined) {
                propagate = false;
            }
            stripIndex = c.strips.indexOf(strip);
            if (stripIndex === -1) {
                throw 'Strip is not a child of this container.';
            }
            if (stripIndex > 0) {
              return c.strips[stripIndex - 1];
            }
            else if (propagate) {
              return p;
            }
        },
        getPreviousStrips: function (strip) {
            var w = this, c = w.children,
                stripIndex;
            stripIndex = c.strips.indexOf(strip);
            if (stripIndex === -1) {
                throw 'Strip is not a child of this container.';
            }
            return c.strips.slice(0, stripIndex);
        },
        getLastStrip: function () {
            var w = this, c = w.children;
            if (c.strips.length > 0) {
                return c.strips[c.strips.length - 1];
            }
        },
        getLastLeafStrip: function() {
            var w = this, c = w.children,
                lastStrip;
            lastStrip = w.getLastStrip();
            if (lastStrip !== undefined) {
                return lastStrip.getLastLeafStrip();
            }
        },
        
        calculatePushPullGridColumns: function () {
            var w = this, p = w.parent,
                pushPull = 0,
                sequence = w.getSequence(true);
            $.each(p.getLeftContainers(w), function (index, container) {
                var positions = container.getGutterPositions();
                if (container.getSequence(true) > sequence) {
                    pushPull += positions[1] - positions[0];
                }
            });
            $.each(p.getRightContainers(w), function (index, container) {
                var positions = container.getGutterPositions();
                if (container.getSequence(true) < sequence) {
                    pushPull -= positions[1] - positions[0];
                }
            });
            return pushPull;
        },

        setSequenceIfNotSet: function() {
            var w = this, o = w.options;
            if (o.sequence === undefined) {
                w.setLowestAvailableSequence(true);
            }
        },
        setSequence: function (sequence) {
            var w = this, o = w.options, p = w.parent,
                parentContainer;
            o.sequence = sequence;
            w.render(true);
            parentContainer = p.getParent();
            if (parentContainer.isContainer()) {
                parentContainer.setSequenceIfNotSet();
            }
        },
        getSequence: function (calculate) {
            var w = this, o = w.options, p = w.parent;
            if (calculate === undefined) {
                calculate = false;
            }
            if (!calculate) {
                return o.sequence;
            }
            else {
                return p.getContainerSequence(w);
            }
        },

        getParentStrip: function () {
            var w = this, p = w.parent;
            return p;
        },
        
        getStripsCount: function () {
            var w = this, c = w.children,
                stripsCount = 0;
            if (c.strips.length > 0) {
                $.each(c.strips, function(index, strip) {
                    stripsCount += strip.getStripsCount();
                });
                return stripsCount;
            }
            else {
                return 1;
            }
        },
        addStrip: function() {
            var w = this, o = w.options, e = w.elements, c = w.children, p = w.parent,
                strip = $('<div/>'),
                positions = w.getGutterPositions();
            o.sequence = undefined;
            strip.strip($.extend({
                parent: w,
                gridColumns: positions[1] - positions[0],
                gutterWidth: p.getGutterWidth(),
                outerGutter: false
            }));
            strip = strip.data('strip');
            e.stripsWrapper.append(strip.element);
            c.strips.push(strip);
            App.render(true);
        },
        
        fitGutterPositions: function () {
            var w =  this, c = w.children,
                positions = w.getGutterPositions();
            $.each(c.strips, function (index, strip) {
                strip.fitGutterPositions(positions[1] - positions[0]);
            });
        },
        
        isContainer: function () {
            return true;
        }
    });

}(jQuery));
