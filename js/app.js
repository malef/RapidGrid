"use strict";

var App = (function ($) {

    var initialized = false,
        modals = {},
        gridColumns = [16],
        pageWidthStep = 1,
        pageWidth = 960,
        columnWidth,
        gutterWidth = 10,
        page = $('<div/>'),
//        helper = $('<div/>'),
        addStripTarget,
        Markup,
        Stylesheet,
        activeAction;

    Markup = (function () {

        var rootTags = [],
            indent = '    ';

        function Tag(tagName) {
            this.tagName = tagName;
            this.classNames = [];
            this.id = null;
            this.children = [];
            this.content = null;
            this.newLine = true;
        }

        Tag.prototype.addClass = function (className) {
            if (this.classNames.indexOf(className) === -1) {
                this.classNames.push(className);
            }
            return this;
        };

        Tag.prototype.setId = function (id) {
            this.id = id;
            return this;
        };

        Tag.prototype.append = function (tagOrTags) {
            if (this.content !== null) {
                throw 'Tag already has content.';
            }
            if (!$.isArray(tagOrTags)) {
                tagOrTags = [tagOrTags];
            }
            this.children = this.children.concat(tagOrTags);
            return this;
        };

        Tag.prototype.setContent = function (content) {
            if (this.children.length !== 0) {
                throw 'Tag already has children.';
            }
            this.content = content;
            return this;
        };
        
        Tag.prototype.noNewLine = function () {
            this.newLine = false;
            return this;
        };

        Tag.prototype.render = function () {
            var output = [],
                closingTagComment = '',
                noNewLine = (this.children.length === 0 && !this.newLine),
                openingTag, closingTag;
            // Descendant tags.
            $.each(this.children, function (index, child) {
                var childOutput = child.render();
                $.each(childOutput, function (lineIndex) {
                    childOutput[lineIndex] = indent + childOutput[lineIndex];
                });
                output = output.concat(childOutput); 
            });
            // Opening tag.
            openingTag = '' +
                '<' + 
                    this.tagName + 
                    (this.classNames.length > 0 ? (' class="' + this.classNames.join(' ') + '"') : '') +
                    (this.id !== null ? (' id="' + this.id + '"') : '') +
                '>';
            // Closing tag with comment
            if (!noNewLine && (this.classNames.length > 0 || this.id !== null)) {
                closingTagComment =
                    '<!--' + 
                        (this.classNames.length > 0 ? (' .' + this.classNames.join(' .') + ' ') : '') + 
                        (this.id !== null ? (' #' + this.id) : '') + 
                    ' -->';
            }
            closingTag = '</' + this.tagName + '>' + closingTagComment;
            if (noNewLine) {
                output = [openingTag + closingTag + '\n'];
            }
            else {
                output.unshift(openingTag + '\n');
                output.push(closingTag + '\n');
            }
            return output;
        };

        return {
            createTag: function (tag) {
                return new Tag(tag);
            },
            append: function (tag) {
                rootTags.push(tag);
                return this;
            },
            render: function () {
                var output = [];
                $.each(rootTags, function (index, rootTag) {
                    output = output.concat(rootTag.render());
                });
                return output;
            }
        };

    }());

    Stylesheet = (function () {

        var entries = [];

        function Entry(selector, styles) {
            var that = this;
            this.selector = selector;
            this.styles = {};
            $.each(styles, function (key, value) {
                that.addStyle(key, value);
            });
        }

        Entry.prototype.addStyle = function (key, value) {
            this.styles[key] = value;
        };

        Entry.prototype.render = function () {
            var output = '';
            $.each(this.styles, function (key, value) {
                output += key + ': ' + value + '; ';
            });
            output = this.selector + ' { ' + output + '}';
            return output;
        };

        function Separator(label) {
          this.label = label;
        }

        Separator.prototype.render = function () {
            var output;
            if (this.label === undefined) {
                output = '\n\n';
            }
            else {
                output = '\n/* ' + this.label + ' */\n';
            }
            return output;
        };

        return {
            addEntry: function (selector, styles) {
                entries.push(new Entry(selector, styles));
                return this;
            },
            addSeparator: function (label) {
                entries.push(new Separator(label));
                return this;
            },
            render: function () {
                var output = [];
                $.each(entries, function (index, entry) {
                    output.push(entry.render());
                });
                return output;
            }
        };

    }());


    function leastCommonMultiple(values) {
        var divider,
            dividersProduct = 1,
            divisible;
        values = [].concat(values);
        if (values.length === 1) {
            return values[0];
        }
        else {
            while (values.indexOf(1) === -1 && (divider <= Math.min.apply(this, values) || divider === undefined)) {
                divider = 2;
                while (divider <= Math.min.apply(this, values)) {
                    divisible = false;
                    $.each(values, function (index, value) {
                        if (value % divider === 0) {
                            divisible = true;
                            values[index] = value / divider;
                        }
                    });
                    if (divisible) {
                        dividersProduct *= divider;
                    }
                    else {
                        divider += 1;
                    }
                }
            }
            $.each(values, function (index, value) {
                dividersProduct *= value;
            });
            return dividersProduct;
        }
    }

    function calculatePossibleGridColumns() {
        var divider = 1,
            quotient = pageWidth,
            possibleGridColumns = [];
        while (divider <= quotient) {
            if (pageWidth % divider === 0) {
                possibleGridColumns.push(divider);
                if (possibleGridColumns.indexOf(quotient) === -1 && divider > 1) {
                    possibleGridColumns.push(quotient);
                }
            }
            divider += 1;
            quotient = pageWidth / divider;
        }
        possibleGridColumns.sort(function (a, b) {
            return (a < b) ? -1 : ((a > b) ? 1 : 0);
        });
        return possibleGridColumns;
    }
    
    function initialize() {
        modals = {
            hash: $('#page-options-hash-modal'),
            gridColumns: $('#page-options-grid-columns-modal'),
            pageWidth: $('#page-options-page-width-modal'),
            gutterWidth: $('#page-options-gutter-width-modal'),
            addStrip: $('#add-strip-modal'),
            getCode: $('#get-code-modal'),
            containerOptions: $('#container-options-modal')
        };

        (function (modal) {
            var createLayoutButton = $('.create-layout', modal),
                loadLayoutButton = $('.load-layout', modal),
                input = $('input#page-options-hash'),
                hasHash;

            modal.modal();

            hasHash = (function () {
                var jqXhr;
                loadLayoutButton.addClass('disabled');
                return function (event) {
                    var hash = input.val();
                    if (jqXhr !== undefined && !(jqXhr.isResolved() || jqXhr.isRejected())) {
                        jqXhr.abort();
                    }
                    jqXhr = $.ajax({
                        url: 'server.php',
                        type: 'post',
                        data: {
                            action: 'has', 
                            key: hash 
                        },
                        dataType: 'json',
                        success: function (data) {
                            if (data.has === true) {
                                loadLayoutButton.removeClass('disabled');
                            }
                            else {
                                loadLayoutButton.addClass('disabled');
                            }
                            jqXhr = undefined;
                        }
                    });
                };
            }());
            
            input
                .bind('keyup', hasHash)
                .bind('change', hasHash);

            createLayoutButton.bind('click', function (event) {
                modal.modal('hide');
                modals.gridColumns.modal('show');
                event.preventDefault(); 
            });
            
            loadLayoutButton.bind('click', function (event) {
                var hash = input.val();
                $.ajax({
                    url: 'server.php',
                    type: 'post',
                    data: {
                        action: 'get', 
                        key: hash
                    },
                    dataType: 'json',
                    success: function (data) {
                        App.setData(data.value);
                        modal.modal('hide');
                    }
                });
                event.preventDefault(); 
            });
        }(modals.hash));

        (function (modal) {
            var nextStepButton = $('.next-step', modal),
                input = $('input#page-options-grid-columns', modal);

            modal
                .modal()
                .bind('show', function (event) {
                    input.val(gridColumns.join(' '));
                });

            nextStepButton.bind('click', function (event) {
                gridColumns = input.val().split(' ');
                $.each(gridColumns, function (index, value) {
                    gridColumns[index] = parseInt(value, 10);
                });
                modal.modal('hide');
                modals.pageWidth.modal('show');
                event.preventDefault(); 
            });
        }(modals.gridColumns));

        (function (modal) {
            var nextStepButton = $('.next-step', modal),
                previousStepButton = $('.previous-step', modal),
                decreaseButton = $('.decrease', modal),
                increaseButton = $('.increase', modal),
                input = $('input#page-options-page-width', modal),
                pageWidthStepHint = $('#least-common-multiple', modal);

            modal
                .modal()
                .bind('show', function (event) {
                    pageWidthStep = leastCommonMultiple(gridColumns);
                    pageWidthStepHint.text(pageWidthStep);
                    pageWidth = Math.floor(pageWidth / pageWidthStep) * pageWidthStep;
                    input.val(pageWidth);
                });

            decreaseButton.bind('click', function (event) {
                pageWidth -= pageWidthStep;
                pageWidth = Math.max(pageWidthStep, pageWidth);
                input.val(pageWidth);
            });
            increaseButton.bind('click', function (event) {
                pageWidth += pageWidthStep;
                input.val(pageWidth);
            });

            input.bind('change', function () {
                pageWidth = parseInt(input.val(), 10);
                pageWidth = Math.floor(pageWidth / pageWidthStep) * pageWidthStep;
                input.val(pageWidth);
            });

            nextStepButton.bind('click', function (event) {
                modal.modal('hide');
                modals.gutterWidth.modal('show');
                event.preventDefault(); 
            });
            previousStepButton.bind('click', function (event) {
                modal.modal('hide');
                modals.gridColumns.modal('show');
                event.preventDefault(); 
            });
        }(modals.pageWidth));

        (function (modal) {
            var nextStepButton = $('.next-step', modal),
                previousStepButton = $('.previous-step', modal),
                increaseButton = $('.increase', modal),
                decreaseButton = $('.decrease', modal),
                input = $('input#page-options-gutter-width', modal),
                stepHint = $('.column-width-hint', modal);

            modal
                .modal()
                .bind('show', function (event) {
                    columnWidth = pageWidth / Math.max.apply(this, gridColumns);
                    gutterWidth = Math.min(gutterWidth, columnWidth);
                    gutterWidth = Math.floor(gutterWidth / 2) * 2;
                    stepHint.text(columnWidth);
                    input.val(gutterWidth);
                });

            decreaseButton.bind('click', function (event) {
                gutterWidth -= 2;
                gutterWidth = Math.max(0, gutterWidth);
                input.val(gutterWidth);
            });
            increaseButton.bind('click', function (event) {
                gutterWidth += 2;
                gutterWidth = Math.min(gutterWidth, columnWidth);
                gutterWidth = Math.floor(gutterWidth / 2) * 2;
                input.val(gutterWidth);
            });

            input.bind('change', function () {
                gutterWidth = parseInt(input.val(), 10);
                gutterWidth = Math.max(0, gutterWidth);
                gutterWidth = Math.min(gutterWidth, columnWidth);
                gutterWidth = Math.floor(gutterWidth / 2) * 2;
                input.val(gutterWidth);
            });

            nextStepButton.bind('click', function (event) {
                modal.modal('hide');
                page
                    .page({
                        gridColumns: gridColumns[0],
                        width: pageWidth,
                        gutterWidth: gutterWidth
                    })
                    .page('addStrip', {});
                event.preventDefault(); 
            });
            previousStepButton.bind('click', function (event) {
                modal.modal('hide');
                modals.pageWidth.modal('show');
                event.preventDefault(); 
            });
        }(modals.gutterWidth));

        (function (modal) {
            var increaseButton = $('.increase', modal),
                decreaseButton = $('.decrease', modal),
                addStripButton = $('.add-strip', modal),
                cancelButton = $('.cancel', modal),
                select = $('select#add-strip-grid-columns', modal),
                input = $('input#add-strip-gutter-width', modal),
                columnWidthHint = $('.column-width-hint', modal),
                stripGridColumns,
                stripGutterWidth,
                stripColumnWidth;

            modal
                .modal()
                .bind('show', function (event) {
                    stripGridColumns = gridColumns[0];
                    stripGutterWidth = gutterWidth;
                    stripColumnWidth = columnWidth;
                    
                    $('option', select).detach();
                    $.each(calculatePossibleGridColumns(), function (index, value) {
                        var option = $('<option/>');
                        option
                            .attr('value', value)
                            .text(value);
                        if (value === stripGridColumns) {
                            option.attr('selected', 'selected');
                        }
                        select.append(option);
                    });
                    
                    input.val(stripGutterWidth);
                    columnWidthHint.text(stripColumnWidth);
                });

            select.bind('change', function () {
                stripGridColumns = parseInt(select.val(), 10);
                stripColumnWidth = pageWidth / stripGridColumns;
                stripGutterWidth = Math.min(stripGutterWidth, stripColumnWidth);
                stripGutterWidth = Math.floor(stripGutterWidth / 2) * 2;
                columnWidthHint.text(stripColumnWidth);
                input.val(stripGutterWidth);
            });
            
            input.bind('change', function () {
                stripGutterWidth = parseInt(input.val(), 10);
                stripGutterWidth = Math.min(stripGutterWidth, stripColumnWidth);
                stripGutterWidth = Math.floor(stripGutterWidth / 2) * 2;
                input.val(stripGutterWidth);
            });
            
            decreaseButton.bind('click', function (event) {
                stripGutterWidth -= 2;
                stripGutterWidth = Math.max(0, stripGutterWidth);
                input.val(stripGutterWidth);
            });
            increaseButton.bind('click', function (event) {
                stripGutterWidth += 2;
                stripGutterWidth = Math.min(stripGutterWidth, stripColumnWidth);
                stripGutterWidth = Math.floor(stripGutterWidth / 2) * 2;
                input.val(stripGutterWidth);
            });
            
            addStripButton.bind('click', function (event) {
                addStripTarget.addStrip({
                    gridColumns: stripGridColumns,
                    gutterWidth: stripGutterWidth
                });
                modal.modal('hide');
            });
            cancelButton.bind('click', function (event) {
                modal.modal('hide');
            });
        }(modals.addStrip));

        (function (modal) {
            var saveButton = $('.save', modal),
                stylesTextarea = $('textarea#get-code-styles', modal),
                markupTextarea = $('textarea#get-code-markup', modal),
                hashHint = $('.hash-hint', modal);

            modal
                .modal()
                .bind('show', function (event) {
                    // Uncomment if all container sequences should be sent before preparing code.
                    // page.page('setMissingContainerSequences');
                    stylesTextarea.val(App.generateStylesheet());
                    markupTextarea.val(App.generateMarkup());
                    hashHint.html('');
                });

            saveButton.bind('click', function (event) {
                $.ajax({
                    url: 'server.php',
                    type: 'post',
                    data: {
                        action: 'set',
                        value: JSON.stringify(App.getData())
                    },
                    dataType: 'json',
                    success: function (data) {
                        hashHint.html('Layout can be loaded using <strong>' + data.key + '</strong> hash.');
                    }
                });
                saveButton.addClass('disabled');
            });
        }(modals.getCode));

        (function (modal) {
            var saveButton = $('.save', modal),
                cancelButton = $('.cancel', modal),
                classInput = $('#container-options-class', modal),
                idInput = $('#container-options-id', modal),
//                contentTextarea = $('#container-options-content', modal),
                container;
               
            modal
                .modal()
                .bind('show', function (event) {
                    container = modal.data('container');
                    classInput.val(container.options.classNames);
                    idInput.val(container.options.id);
//                    contentTextarea.val(container.options.content);
                });

            saveButton.bind('click', function (event) {
                container.options.classNames = classInput.val();
                container.options.id = idInput.val();
//                container.options.content = contentTextarea.val();
                modal.modal('hide');
            });
            cancelButton.bind('click', function (event) {
                modal.modal('hide');
            });
        }(modals.containerOptions));

//        helper.helper();

//        page
//            .bind('helper_show', function (e) {
//                helper.helper('show', e.helperMessage);
//            })
//            .bind('helper_clear', function (e) {
//                helper.helper('clear');
//            });

//        $('body').append(helper);
        $('#app').append(page);

        // Menu items
        
        (function (menuItem, allMenuItems) {
            var active = false;
            function on() {
                menuItem.parent('li').addClass('active');
                activeAction = 'addStrip';
                active = true;
                page.page('render', true);
            }
            function off() {
                menuItem.parent('li').removeClass('active');
                activeAction = undefined;
                active = false;
                page.page('render', true);
            }
            menuItem.bind('click', function (event) {
                if (!active) {
                    on();
                }
                else {
                    off();
                }
            });
            allMenuItems.not(menuItem).bind('click', function (event) {
                if (active) {
                    off();
                }
            });
        }($('.nav #menu-add-strip'), $('.nav a')));
        
        (function (menuItem, allMenuItems) {
            var active = false;
            function on() {
                page.page('clearContainerSequences');
                menuItem.parent('li').addClass('active');
                activeAction = 'reorderContainers';
                active = true;
            }
            function off() {
                // Uncomment if all sequences should be set after deactivating this menu item.
                // page.page('setMissingContainerSequences');
                menuItem.parent('li').removeClass('active');
                activeAction = undefined;
                active = false;
            }
            menuItem.bind('click', function (event) {
                if (!active) {
                    on();
                }
                else {
                    off();
                }
            });
            allMenuItems.not(menuItem).bind('click', function (event) {
                if (active) {
                    off();
                }
            });
        }($('.nav #menu-reorder-containers'), $('.nav a')));
        
        (function (menuItem, allMenuItems) {
            var active = false;
            function on() {
                modals.getCode.modal('show');
                menuItem.parent('li').addClass('active');
                activeAction = 'getCode';
                active = true;
            }
            function off() {
                modals.getCode.modal('hide');
                menuItem.parent('li').removeClass('active');
                activeAction = undefined;
                active = false;
            }
            menuItem.bind('click', function (event) {
                if (!active) {
                    on();
                }
                else {
                    off();
                }
            });
            allMenuItems.not(menuItem).bind('click', function (event) {
                if (active) {
                    off();
                }
            });
        }($('.nav #menu-get-code'), $('.nav a')));
        
        (function (menuItem, allMenuItems) {
            var active = false;
            function on() {
                menuItem.parent('li').addClass('active');
                activeAction = 'splitAndMergeContainers';
                active = true;
            }
            function off() {
                menuItem.parent('li').removeClass('active');
                activeAction = undefined;
                active = false;
            }
            menuItem.bind('click', function (event) {
                if (!active) {
                    on();
                }
                else {
                    off();
                }
            });
            allMenuItems.not(menuItem).bind('click', function (event) {
                if (active) {
                    off();
                }
            });
        }($('.nav #menu-split-and-merge-containers'), $('.nav a')));
        
        (function (menuItem, allMenuItems) {
            var active = false;
            function on() {
                menuItem.parent('li').addClass('active');
                activeAction = 'containerOptions';
                active = true;
            }
            function off() {
                modals.containerOptions.modal('hide');
                menuItem.parent('li').removeClass('active');
                activeAction = undefined;
                active = false;
            }
            menuItem.bind('click', function (event) {
                if (!active) {
                    on();
                }
                else {
                    off();
                }
            });
            allMenuItems.not(menuItem).bind('click', function (event) {
                if (active) {
                    off();
                }
            });
        }($('.nav #menu-container-options'), $('.nav a')));
        
        (function (menuItem) {
            menuItem.bind('click', function (event) {
                if (activeAction === undefined) {
                    page.detach();
                    page = $('<div/>');
                    $('#app').append(page);
                    modals.hash.modal('show');
                }
            });
        }($('.nav #menu-clear')));
        
        initialized = true;
    }
    
    return {
        init: function () {
            if (!initialized) {
                initialize();
            }
            modals.hash.modal('show');
        },
        addStrip: function (container) {
            addStripTarget = container;
            modals.addStrip.modal('show');
        },

        getData: function () {
            var data = {};
            data.page = page.page('getData');
            return data;
        },
        setData: function (data) {
            page.page(data.page.options);
            page.page('setData', data.page);
            this.render(true);
        },
        
        generateMarkup: function () {
            return page.page('generateMarkup');
        },
        generateStylesheet: function () {
            return page.page('generateStylesheet');
        },
        
        getActiveAction: function () {
            return activeAction;
        },
        
        showContainerOptionsModal: function (container) {
            modals.containerOptions.data('container', container);
            modals.containerOptions.modal('show');
        },
        
        getOridinalSuffix: function (number) {
            switch (number % 10) {
                case 1:
                    return 'st';
                case 2:
                    return 'nd';
                case 3:
                    return 'rd';
                default:
                    return 'th';
            }
        },
        
        render: function () {
            page.page('render', true);
        },
        
        Markup: Markup,
        Stylesheet: Stylesheet
    };

}(jQuery));