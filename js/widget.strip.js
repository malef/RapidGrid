"use strict";

(function ($){ 

    $.widget('ui.strip', {
        
        options: {
            height: 160,
            outerGutter: true,
            gutterPositions: []
        },
        
        calculateColumnWidth: function () {
            var w = this, o = w.options, p = w.parent,
                columnWidth,
                parentStrip;
            parentStrip = p.getParentStrip();
            if (parentStrip !== undefined) {
                columnWidth = parentStrip.calculateColumnWidth();
            }
            else {
                columnWidth = (w.getWidth() + (o.outerGutter ? 0 : w.getGutterWidth())) / w.getGridColumns();  
                if (Math.floor(columnWidth) != columnWidth) {
                    throw "Column width must be integer number.";
                }
            }
            return columnWidth;
        },
        calculateGutterOffset: function (position, offsetType) { // TODO rename
            var w = this, o = w.options,
                hgw = w.getGutterWidth() / 2;
            if (offsetType === undefined) {
                offsetType = 'left';
            }
            return position * w.calculateColumnWidth() + ((offsetType === 'left' ? 0 : 0) + (o.outerGutter ? -1 : -2)) * hgw;
        },
        calculateGutterWidth: function () {
            var w = this, o = w.options;
            return w.getGutterWidth();
        },
        calculateGutterPosition: function (offset, offsetType) { // TODO improve for offsetType = 'center'
            var w = this, o = w.options, 
                hgw = w.getGutterWidth() / 2;
            if (offsetType === undefined) {
                offsetType = 'left';
            }
            return (offset + (o.outerGutter ? 1 : 2) * hgw) / w.calculateColumnWidth();
        },
        calculateContainerOffset: function (positions, offsetType) { // TODO improve for offsetType = 'center'
            var w = this, o = w.options, 
                hgw = w.getGutterWidth() / 2;
            if (offsetType === undefined) {
                offsetType = 'left';
            }
            if (offsetType === 'left') {
                return w.calculateGutterOffset(positions[0], 'left') + w.getGutterWidth();
            }
            else {
                return w.calculateGutterOffset(positions[0], 'center') + w.calculateGutterOffset(positions[1], 'center') / 2;
            }
        },
        calculateContainerWidth: function (positions) {
            var w = this, o = w.options;
            return (positions[1] - positions[0]) * w.calculateColumnWidth() - w.getGutterWidth();
        },
        
        getWidth: function () {
            var w = this, p = w.parent;
            return p.getWidth();
        },
        getGridColumns: function () {
            var w = this, o = w.options;
            return o.gridColumns;
        },
        getRootGridColumns: function () {
            var w = this, p = w.parent,
                parentStrip;
            parentStrip = p.getParentStrip();
            if (parentStrip === undefined) {
                return w.getGridColumns();
            }
            else {
                return parentStrip.getRootGridColumns();
            }
        },
        getGutterWidth: function () {
            var w = this, o = w.options;
            return o.gutterWidth;
        },
        
        getMinGridColumns: function () {
            var w = this, o = w.options, c = w.children,
                minGridColumns = 0;
            $.each(c.containers, function (index, container) {
                minGridColumns += container.getMinGridColumns();
            });
            return minGridColumns;
        },

        getGutterIndex: function (gutter) {
            var w = this, c = w.children,
                index;
            index = c.gutters.indexOf(gutter);
            if (index < 0 && index >= c.gutters.length) {
                return;
            }
            return index;
        },
        getGutterPosition: function (gutter) {
            var w = this, o = w.options, g = o.gutterPositions, c = w.children,
                index;
            index = w.getGutterIndex(gutter);
            if (index === undefined) {
                return;
            }
            return g[index + 1];
        },
        getGutter: function (index) {
            var w = this, c = w.children;
            if (index < 0 && index >= c.gutters.length) {
                return;
            }
            return c.gutters[index];
        },
        
        getContainerIndex: function (container) {
            var w = this, c = w.children,
                index;
            index = c.containers.indexOf(container);
            if (index === -1) {
                return;
            }
            return index;
        },
        getContainer: function (index) {
            var w = this, c = w.children;
            if (index < 0 && index >= c.containers.length) {
                return;
            }
            return c.containers[index];
        },
        getContainerGutterPositions: function (container) {
            var w = this, o = w.options, g = o.gutterPositions,
                index;
            index = w.getContainerIndex(container);
            if (index === undefined) {
                return;
            }
            return g.slice(index, index + 2);
        },
        
        moveGutter: function (gutter, newPosition) {
            var w = this, o = w.options, g = o.gutterPositions, c = w.children,
                index;
            index = c.gutters.indexOf(gutter);
            if (index === -1) {
                return;
            }
            if (
                    c.containers[index].getMinGridColumns() > newPosition - g[index]
                    || c.containers[index + 1].getMinGridColumns() > g[index + 2] - newPosition
            ) {
                return;
            }
            g[index + 1] = newPosition;
            c.containers[index].fitGutterPositions();
            c.containers[index + 1].fitGutterPositions();
            w.render(true);
        },
        
        _init: function () {
            var w = this, o = w.options;
            w.parent = o.parent;
            delete o.parent;
            w.augmentGutterPositions();
            w._initRender();
        },
        _initRender: function () {
            var w = this, o = w.options, e = w.elements = {}, c = w.children = {},
                index;
            w.element
                .addClass('strip')
                .css({
                    width: w.getWidth(),
                    height: o.height
                })
                .resizable({
                    minHeight: 90,  // TODO Check for max strips count in child containers
                    handles: 's',
                    resize: function (event, ui) {
                        o.height = w.element.height();
                        w.render(true);
                    },
                    start: function (event, ui) {
                        e.heightIndicator.show();
//                        w.element.trigger({
//                            type: 'helper_show',
//                            helperMessage: 'Drag to adjust strip height.'
//                        });
                    },
                    stop: function (event, ui) {
                        e.heightIndicator.hide();
//                        w.element.trigger({
//                            type: 'helper_clear'
//                        });
                    }
                });
            e.heightIndicator = $('<div/>').addClass('strip-height');
            w.element.append(e.heightIndicator);
            c.gutters = [];
            for (index = 0; index < o.gutterPositions.length - 2; index++) {
                var gutter = $('<div/>');
                gutter.gutter({
                    parent: w,
                    index: index,
                    position: o.gutterPositions[index + 1],
                    width: w.getGutterWidth()
                });
                w.element.append(gutter);
                c.gutters[index] = gutter.data('gutter');
            }
            c.containers = [];
            for (index = 0; index < o.gutterPositions.length - 1; index++) {
                var container = $('<div/>');
                container.container({
                    parent: w,
                    leftGutterPosition: o.gutterPositions[index],
                    rightGutterPosition: o.gutterPositions[index + 1],
                    index: index
                });
                w.element.append(container);
                c.containers.push(container.data('container'));
            }
        },
        
        render: function (propagate) {
            var w = this, o = w.options, e = w.elements, c = w.children,
                paddingTop;
            if (propagate === undefined) {
                propagate = false;
            }
            e.heightIndicator
                .html(o.height + '<span class="strip-height-label">px</span>')
                .css({
                    paddingTop: paddingTop = (o.height - 30) / 2,
                    height: o.height - paddingTop,
                    right: w.getWidth() + 10
                });
            w.element.css({
                width: w.getWidth()
            });
            if (propagate) {
                $.each(c.containers, function (index, container) {
                    container.render(true);
                });
                $.each(c.gutters, function (index, gutter) {
                    gutter.render();
                });
            }
        },
        
        getData: function () {
            var w = this, o = w.options, c = w.children,
                data = {};
            data.options = {
                height: o.height,
                gridColumns: w.getGridColumns(),
                gutterWidth: w.getGutterWidth(),
                outerGutter: o.outerGutter,
                gutterPositions: o.gutterPositions
            };  
            data.containers = [];
            $.each(c.containers, function (index, container) {
                data.containers.push(container.getData());
            });
            return data;
        },
        setData: function (data) {
            var w = this, o = w.options, c = w.children;
            $.each(data.containers, function (index, containerData) {
                c.containers[index].setData(containerData);
            });
        },
        
        /**
         * Adjusts strip to new grid columns count by stretching or shrinking containers, starting from right side
         * of the strip. Finally calls render to update view.
         */
        fitGutterPositions: function (newGridColumns) {
            var w = this, o = w.options, g = o.gutterPositions, c = w.children,
                index = 1,
                newGutterPosition;
            // Check if new grid columns count is valid.
            if (newGridColumns < w.getMinGridColumns()) {
                throw 'This strip cannot be fitted.';
            }
            // Stretch containers which are to narrow, starting from left side.
            while (index < g.length) {
                g[index] = Math.max(g[index], g[index - 1] + c.containers[index - 1].getMinGridColumns());
                index++;
            }
            // Shrink containers which can be narrower, starting from right side.
            index = g.length - 1,
            g[index] = newGridColumns;
            index--;
            while (index > 0 && g[index] > (newGutterPosition = g[index + 1] - c.containers[index].getMinGridColumns())) {
                g[index] = newGutterPosition;
                index -= 1;
            }
            // Pass new positions to containers which are children of this widget.
            $.each(c.containers, function (index, container) {
               container.fitGutterPositions(); 
            });
            // Update display.
            w.render();
        },
        splitContainer: function (container, newGutterPosition) { // TODO update to new widgets, no new gutter is added
            var w = this, o = w.options, g = o.gutterPositions, c = w.children, 
                index,
                newContainer = $('<div/>'), newGutter = $('<div/>'),
                leftmostPossibleGutterPosition, rightmostPossibleGutterPosition;
            index = c.containers.indexOf(container);
            if (index === -1) {
                return;
            }
            // Create new container with proposeg left gutter position.
            newContainer = newContainer.container({
                parent: w,
                leftGutterPosition: newGutterPosition,
                rightGutterPosition: g[index + 1]
            });
            newContainer = newContainer.data('container');
            // Check if both containers can be fitted in available space.
            leftmostPossibleGutterPosition = g[index] + container.getMinGridColumns();
            rightmostPossibleGutterPosition = g[index + 1] - newContainer.getMinGridColumns()
            if (leftmostPossibleGutterPosition > rightmostPossibleGutterPosition) {
                return;
            }
            // Adjust new gutter position.
            newGutterPosition = Math.min(Math.max(leftmostPossibleGutterPosition, newGutterPosition), rightmostPossibleGutterPosition);
            // Adjust containers gutter positions and update widget.
            g.splice(index + 1, 0, newGutterPosition);
            c.containers.splice(index + 1, 0, newContainer);
            newContainer.element.insertAfter(container.element);
            newGutter = newGutter.gutter({
                parent: w,
                position: g[index + 1]
            });
            newGutter = newGutter.data('gutter');
            c.gutters.splice(index, 0, newGutter);
            if (index > 0) {
                newGutter.element.insertAfter(c.gutters[index - 1].element);
            }
            else {
                newGutter.element.prependTo(w.element);
            }
            App.render(true);
        },
        mergeAdjacentContainers: function (gutter) {
            var w = this, o = w.options, g = o.gutterPositions, c = w.children, 
                index,
                leftContainer, rightContainer,
                removedContainerSequence;
            index = c.gutters.indexOf(gutter);
            if (index === -1) {
                return;
            }
            g.splice(index + 1, 1);
            gutter.element.detach();
            c.gutters.splice(index, 1);
            leftContainer = c.containers[index];
            rightContainer = c.containers[index + 1];
            if (leftContainer.getMinGridColumns() < rightContainer.getMinGridColumns()) {
                leftContainer.element.detach();
                c.containers.splice(index, 1);
                removedContainerSequence = leftContainer.getSequence();
            }
            else {
                rightContainer.element.detach();
                c.containers.splice(index + 1, 1);
                removedContainerSequence = rightContainer.getSequence();
            }
            if (removedContainerSequence !== undefined) {
                $.each(c.containers, function (index, container) {
                    var containerSequence = container.getSequence();
                    if (containerSequence !== undefined && containerSequence > removedContainerSequence) {
                        container.setSequence(containerSequence - 1);
                    }
                });
            }
            App.render(true);
        },

        augmentGutterPositions: function (gutterPositions) {
            var w = this, o = w.options, g = o.gutterPositions;
            if (g[0] !== 0) {
                g.splice(0, 0, 0);
            }
            if (g[g.length - 1] !== w.getGridColumns()) {
                g.splice(g.length, 0, w.getGridColumns());
            }
        },
        
        generateMarkup: function () {
            // TODO Must be modified for inner strip (no separate .container_N tag, only .grid_N tags).
            var w = this, o = w.options, c = w.children, p = w.parent,
                rootTag, tags = [],
                sequences = [],
                sequenceContainerMap = {},
                leftmostContainer,
                rightmostContainer;
            $.each(c.containers, function (index, container) {
                var sequence = container.getSequence(true);
                sequences.push(sequence);
                sequenceContainerMap[sequence] = container;
            });
            if (p.isContainer()) {
                leftmostContainer = c.containers.slice(0, 1)[0];
                rightmostContainer = c.containers.slice(-1)[0];
            }
            sequences.sort(function (a, b) {
                return (a < b) ? -1 : ((a > b) ? 1 : 0);
            });
            $.each(sequences, function (index, sequence) {
                var container = sequenceContainerMap[sequence],
                    containerTag;
                containerTag = sequenceContainerMap[sequence].generateMarkup();
                if (p.isContainer()) {
                    if (container === leftmostContainer) {
                        containerTag.addClass('alpha');
                    }
                    if (container === rightmostContainer) {
                        containerTag.addClass('omega');
                    }
                }
                tags.push(containerTag);
            });
            if (!p.isContainer()) {
                rootTag = App.Markup.createTag('div');
                rootTag.addClass('container_' + w.getRootGridColumns());
                rootTag.addClass('container_' + w.getRootGridColumns() + '_gutter_' + w.getGutterWidth());
                rootTag.addClass('clearfix');
                rootTag.append(tags);
                return rootTag;
            }
            else {
                tags.push(App.Markup.createTag('div').addClass('clear').noNewLine());
                return tags;
            }
        },
        
        clearContainerSequences: function () {
            var w = this, c = w.children;
            $.each(c.containers, function (index, container) {
                container.clearSequence(true);
            });
        },
        getLowestAvailableSequence: function () {
            var w = this, c = w.children,
                lowestSequence = -1;
            $.each(c.containers, function (index, container) {
                var sequence = container.getSequence();
                if (sequence !== undefined) {
                    lowestSequence = Math.max(lowestSequence, sequence);
                }
            });
            return lowestSequence + 1;
        },
        setSkippedContainerSequences: function (propagate) {
            var w = this, c = w.children, p = w.parent;
            if (propagate === undefined) {
                propagate = false;
            }
            if (propagate) {
                $.each(p.getPreviousStrips(w), function (index, strip) {
                    strip.setSkippedContainerSequences();
                });
                p.setLowestAvailableSequence();
            }
            else {
                $.each(c.containers, function (index, container) {
                    if (container.getSequence() === undefined) {
                        container.setLowestAvailableSequence(false);
                    }
                });
            }
        },
        setMissingContainerSequences: function () {
            var w = this, c = w.children;
            $.each(c.containers, function(index, container) {
                container.setMissingContainerSequences();
            });
        },
        areAllContainerSequencesSet: function () {
            var w = this, c = w.children,
                allContainerSequencesSet = true;
            $.each(c.containers, function(index, container) {
                if (container.getSequence() === undefined) {
                    allContainerSequencesSet = false;
                    return false;
                }
            });
            return allContainerSequencesSet;
        },
        
        getLeftContainers: function(container) {
            var w = this, c = w.children,
                containerIndex;
            containerIndex = c.containers.indexOf(container);
            if (containerIndex === -1) {
                throw 'Container is not a child of this strip';
            }
            return c.containers.slice(0, containerIndex);
        },
        getRightContainers: function(container) {
            var w = this, c = w.children,
                containerIndex;
            containerIndex = c.containers.indexOf(container);
            if (containerIndex === -1) {
                throw 'Container is not a child of this strip';
            }
            return c.containers.slice(containerIndex + 1);
        },

        getContainersCount: function () {
            var w = this, c = w.children;
            return c.containers.length;
        },
        getContainerMinSequence: function() {
            var w = this, c = w.children, p = w.parent,
                previousStrip;
            // TODO This needs to be refactored
            previousStrip = p.getPreviousStrip(w);
            if (previousStrip === undefined) {
                return 0;
            }
            else {
                return p.getContainerSequence(); // TODO This is strip
            }
        },

        /**
         * Get last leaf strip or container that is a descendant of this strip
         * 
         * In case of leaf strip, if there are no descendant strips, the strip itself is returned.
         * In case of container, each strip must have at least one container, so container will be returned always.
         */
        getLastLeafStripOrContainer: function(targetType) {
            var w = this, c = w.children,
                lastContainer,
                lastContainerSequence,
                target;
            if (['leafStrip', 'container'].indexOf(targetType) === -1) {
                throw 'Target type must be \'leafStrip\' or \'container\'';
            }
            // TODO Should this return strip itself when it has no leaf strips? I think it should
            if (targetType === 'leafStrip') {
                target = w;
            }
            function updateTarget() {
                var lastContainerLastStrip,
                    lastLeafStrip;
                if (targetType === 'leafStrip') {
                    lastContainerLastStrip = lastContainer.getLastStrip();
                    if (lastContainerLastStrip !== undefined) {
                        lastLeafStrip = lastContainerLastStrip.getLastLeafStrip();
                        if (lastLeafStrip !== undefined) {
                            target = lastLeafStrip;
                        }
                    }
                }
                else {
                    target = lastContainer;
                }
            }
            // If there was at least one container with undefined sequence then lastContainerSequence is also undefined
            // Leftmost container
            lastContainer = c.containers[0];
            lastContainerSequence = c.containers[0].getSequence();
            updateTarget();
            // Next containers
            $.each(c.containers.slice(1), function (index, container) {
                var containerSequence = container.getSequence();
                if (containerSequence === undefined) {
                    // Rightmost container (so far) with undefined sequence
                    lastContainer = container;
                    lastContainerSequence = containerSequence;
                    updateTarget();

                }
                else if (lastContainerSequence !== undefined && containerSequence > lastContainerSequence) {
                    // Container with greatest sequence (so far), no containers with undefined sequence encountered before
                    lastContainer = container;
                    lastContainerSequence = containerSequence;
                    updateTarget();
                }
            });
            return target;
        },
        /**
         * Proxy for getLastLeafStripOrContainer
         */
        getLastContainer: function() {
            var w = this;
            return w.getLastLeafStripOrContainer('container');
        },
        /**
         * Proxy for getLastLeafStripOrContainer
         */
        getLastLeafStrip: function() {
            // TODO Should this return strip itself when it has no leaf strips? I think it should
            var w = this;
            return w.getLastLeafStripOrContainer('leafStrip');
        },
        /**
         * Find previous leaf strip.
         */
        getPreviousLeafStrip: function () {
            var w = this, p = w.parent,
                previousStrip,
                parentStrip,
                previousContainer,
                previousContainerLeafStrip;
            // Get previous strip which is sibling to this strip.
            previousStrip = p.getPreviousStrip(w);
            if (previousStrip !== undefined) {
                // There is a previous strip that is a child of same parent, return its last leaf strip
                return previousStrip.getLastLeafStrip();
            }
            else {
                // There is no previous strip that is a child of same parent, call parent,
                // get previous container AS DEFINED BY SEQUENCE and return its last leaf strip
                parentStrip = p.getParentStrip();
                if (parentStrip === undefined) {
                    // This strip is a child of page, no parent strip exists
                    return undefined;
                }
                previousContainer = parentStrip.getPreviousContainer(p);
                if (previousContainer !== undefined) {
                    // There is a previous container in parent strip
                    previousContainerLeafStrip = previousContainer.getLastLeafStrip();
                    if (previousContainerLeafStrip !== undefined) {
                        // There is a leaf strip in previous container of parent strip, return it
                        return previousContainerLeafStrip;
                    }
                }
                // There are no strips in previous container in parent strip
                // or there is no previous container in parent strip
                // - call same function recursively on parent strip and return result
                return parentStrip.getPreviousLeafStrip();
            }
        },
        
        getFirstContainerSequence: function() {
            var w = this,
                previousLeafStrip;
            // Return next possible sequence
            previousLeafStrip = w.getPreviousLeafStrip();
            if (previousLeafStrip === undefined) {
                return 0;
            }
            else {
                return previousLeafStrip.getLastContainer().getSequence(true) + 1;
            }
        },
        getContainerSequence: function(container) {
            var w = this, o = w.options, c = w.children, p = w.parent,
                containerSequenceOffset = -1,
                previousContainer,
                previousContainerLastLeafStrip,
                previousLeafStrip;
            if (c.containers.indexOf(container) === -1) {
                throw 'Container is not a child of this strip';
            }
            previousContainer = w.getPreviousContainer(container);
            if (previousContainer !== undefined) {
                previousContainerLastLeafStrip = previousContainer.getLastLeafStrip();
                if (previousContainerLastLeafStrip === undefined) {
                    return previousContainer.getSequence(true) + 1;
                }
                else {
                    return previousContainerLastLeafStrip.getLastContainer().getSequence(true) + 1;
                }
            }
            else {
                previousLeafStrip = w.getPreviousLeafStrip();
                if (previousLeafStrip === undefined) {
                    return p.getSequence(true);
                }
                else {
                    return previousLeafStrip.getLastContainer().getSequence(true) + 1;
                }
            }
        },
        
        getStripsCount: function () {
            var w = this, c = w.children,
                stripsCount = 1;
            $.each(c.containers, function(index, container) {
                stripsCount = Math.max(stripsCount, container.getStripsCount());
            });
            return stripsCount;
        },
        
        getPreviousContainer: function (container) {
            var w = this, c = w.children,
                index,
                containerSequence,
                previousContainerWithoutSequence,
                previousContainerWithSequence,
                previousContainerWithSequenceSequence;
            index = c.containers.indexOf(container);
            if (index === -1) {
                throw 'Container is not a child of this strip';
            }
            containerSequence = container.getSequence();
            if (containerSequence === undefined) {
                $.each(c.containers, function (index2, container2) {
                    var container2Sequence;
                    if (container2 !== container) {
                        // Strips to the left with sequence not set
                        if (index2 < index) {
                            container2Sequence = container2.getSequence();
                            if (container2Sequence === undefined) {
                                previousContainerWithoutSequence = container2;
                            }
                        }
                        // Strips with sequence set
                        else if (container2.getSequence() !== undefined) {
                            previousContainerWithSequence = container2;
                        }
                    }
                });
            }
            else {
                $.each(c.containers, function (index2, container2) {
                    if (container2 !== container) {
                        var container2Sequence = container2.getSequence();
                        if (
                                container2Sequence !== undefined
                                && container2Sequence < containerSequence
                                && (previousContainerWithSequence === undefined || container2Sequence > previousContainerWithSequenceSequence)
                        ) {
                            previousContainerWithSequence = container2;
                            previousContainerWithSequenceSequence = container2Sequence;
                        }
                    }
                });
            }
            if (previousContainerWithoutSequence !== undefined) {
                return previousContainerWithoutSequence;
            }
            else {
                return previousContainerWithSequence;
            }
        },
    
        hasFewContainers: function () {
            var w = this, c = w.children;
            return (c.containers.length > 1);
        },
        
        getParent: function () {
            var w = this, p = w.parent;
            return p;
        }
    });

}(jQuery));
