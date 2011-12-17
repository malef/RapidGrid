<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>RapidGrid</title>
        <script type="text/javascript" src="jqueryui/js/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="jqueryui/js/jquery-ui-1.8.16.custom.min.js"></script>
        <script type="text/javascript" src="js/json2.js"></script>
        <script type="text/javascript" src="bootstrap/js/bootstrap-modal.js"></script>
        <script type="text/javascript" src="js/widget.page.js"></script>
        <script type="text/javascript" src="js/widget.strip.js"></script>
        <script type="text/javascript" src="js/widget.gutter.js"></script>
        <script type="text/javascript" src="js/widget.container.js"></script>
<!--        <script type="text/javascript" src="js/widget.helper.js"></script>-->
        <script type="text/javascript" src="js/app.js"></script>
        <script type="text/javascript" src="js/init.js"></script>
        <link rel="stylesheet" type="text/css" href="css/reset.css"></link>
        <link rel="stylesheet" type="text/css" href="css/base.css"></link>
        <link rel="stylesheet" type="text/css" href="jqueryui/css/ui-lightness/jquery-ui-1.8.16.custom.css"></link>
        <link rel="stylesheet" type="text/css" href="bootstrap/bootstrap.css"></link>
        <style>
            html {
                height: 100%;
                overflow-x: auto;
                overflow-y: scroll;
            }
            body {
                background: #e4e4e4 url(images/stripe.png) scroll repeat top left;
                min-height: 100%;
                padding: 0;
                position: relative;
                padding-top: 40px;
                padding-bottom: 80px;
            }
            .helper {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 600px;
                line-height: 30px;
                padding: 0 5px;
                background-color: #fff;
                border-top: 1px solid #bbb;
                border-right: 1px solid #bbb;
                z-index: 10;
                opacity: 0.7;
            }
            .page {
                background-color: #ccc;
                margin: 0 auto 40px;
            }
            .page-insert {
                background-color: #f6a828;
                line-height: 20px;
                text-align: center;
                color: #555;
                font-weight: bold;
            }
            .strip {
                background-color: #ddd;
                position: relative;
                margin: 0 0 1px 0;
            }
            .gutter {
                height: 100%;
                position: absolute !important;
                top: 0 !important;
                cursor: ew-resize;
                background-color: sandybrown;
            }
            .gutter-dragged {
                background-color: violet;
            }
            .gutter-helper {
                background-color: transparent;
            }
            .container {
                height: 100%;
                position: absolute !important;
                top: 0 !important;
                overflow: hidden;
            }
            .container-without-strips {
                background-color: #F0F0F0;
            }
            .container .container-sequence,
            .container .container-width,
            .container .container-selectors {
                font-weight: bold;
                opacity: 1;
                margin-left: 4px;
                margin-right: 4px;
                text-align: center;
                font-size: 200%;
                line-height: 30px;
            }
            .container .container-width {
                font-size: 200%;
                line-height: 30px;
                background-color: #999;
                color: #EEE;
                white-space: nowrap;
            }
            .container .container-sequence {
                font-size: 200%;
                line-height: 30px;
                color: #999;
                white-space: nowrap;
            }
            .container .container-selectors {
                font-size: 100%;
                line-height: 15px;
                color: #999;
            }
            .container .container-sequence-calculated {
                opacity: 0.4;
            }
            .container-dragged {
                background-color: #f6f6f6;
            }
            .container-dragged > .container-width {
                opacity: 1;
                background-color: violet;
            }
            .strip:hover .container .container-width {
                display: block;
            }
            .container .container-width .container-width-label {
                font-size: 60%;
            }
            .strip .ui-resizable-s {
                bottom: 0;
                height: 7px;
                position: absolute;
                width: 100%;
                z-index: 10;
                cursor: s-resize;
            }
            .ui-resizable-resizing .ui-resizable-s {
                background-color: violet;
            }
            .strip .strip-height {
                position: absolute;
                top: 0;
                padding-left: 0.2em;
                padding-right: 0.2em;
                width: 2.5em;
                font-size: 200%;
                font-weight: bold;
                color: #bbb;
                background-color: #eee;
                opacity: 0.5;
                text-align: right;
                display: none;
            }
            .strip .strip-height .strip-height-label {
                font-size: 60%;
            }
            
            .container-debug {
                display: inline-block;
                padding: 4px;
                position: absolute;
                top: 2px;
                left: 2px;
                background-color: skyblue;
                color: #fff;
                font-size: 80%;
                border-radius: 4px;
            }
            
            .modal .modal-body p.help {
                font-size: 80%;
                opacity: 0.6;
            }
            .modal .modal-body p.help .example {
                display: inline-block;
                background-color: #eee;
                padding: 1px 2px;
                border: 1px solid #ddd;
            }
            
            #page-options-page-width-decrease,
            #page-options-page-width-increase,
            #page-options-gutter-width-decrease,
            #page-options-gutter-width-increase {
                display: inline-block; 
                padding: 1px 0;
                width: 10px;
                text-align: center;
                color: #000;
                text-decoration: none;
                font-weight: normal;
            }
            
            textarea#get-code-styles {
                margin-bottom: 1em;
            }
            
            textarea#get-code-styles,
            textarea#get-code-markup {
                width: 520px;
            }
            
            .topbar .clear {
                clear: both;
            }
            .topbar .topbar-inner {
                text-align: center;
            }
            .topbar .topbar-inner-inner {
                display: inline-block;
                width: 68em;
            }
            
            .topbar div > ul .active > a, .nav .active > a {
                background-color: #ccc;
                background-color: rgba(255, 255, 255, 0.95);
                color: #000000;
            }
            .modal.fade {
                margin-top: -350px;
            }
            .modal.in {
                margin-top: -150px;
            }
            
            .container-add-strip {
                bottom: 0;
                position: absolute;
                text-align: center;
                background-color: #f6a828;
                line-height: 20px;
                padding-bottom: 7px;
                color: #555;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="topbar" data-scrollspy="scrollspy">
            <div class="topbar-inner">
                <div class="topbar-inner-inner">
                    <a class="brand" href="#">RapidGrid</a>
                    <ul class="nav">
                        <li><a href="#" id="menu-add-strip">Add nested strip</a></li>
                        <!-- <li><a href="#" id="menu-remove-strip">Remove strip</a></li> -->
                        <li><a href="#" id="menu-reorder-containers">Reorder containers</a></li>
                        <li><a href="#" id="menu-get-code">Get the code</a></li>
                        <li><a href="#" id="menu-split-and-merge-containers">Split and merge containers</a></li>
                        <li><a href="#" id="menu-container-options">Container options</a></li>
                        <li><a href="#" id="menu-clear">Clear</a></li>
                    </ul>
                    <div class="clear"></div>
                </div>
            </div>
        </div>
        
        <div id="debug"></div>
        
        <div id="app"></div>
        
        <!-- Modals -->
        
        <div id="page-options-hash-modal" class="modal fade">
            <div class="modal-header">
                <h3>Load existing layout</h3>
            </div>
            <div class="modal-body">
                <p>Enter hash of your previously created layout or create a new layout.</p>
                <input type="text" name="page_options_hash" id="page-options-hash"/>
            </div>
            <div class="modal-footer">
                <a href="#" class="create-layout btn primary">Create new layout</a>
                <a href="#" class="load-layout btn primary">Load layout</a>
            </div>
        </div>
        
        <div id="page-options-grid-columns-modal" class="modal fade">
            <div class="modal-header">
                <h3>Page setup - grid columns</h3>
            </div>
            <div class="modal-body">
                <p>Select number of grid columns.</p>
                <input type="text" name="page_options_grid_columns" id="page-options-grid-columns" class="small"/>
                <p class="help">Enter one or more numbers separated with spaces, eg. <span class="example">12 16</span>.</p>
            </div>
            <div class="modal-footer">
                <a href="#" class="next-step btn primary">Next step</a>
            </div>
        </div>
        
        <div id="page-options-page-width-modal" class="modal fade">
            <div class="modal-header">
                <h3>Page setup - page width</h3>
            </div>
            <div class="modal-body">
                <p>Select page width.</p>
                <div class="clearfix">
                    <div class="input-prepend">
                        <span class="add-on">
                            <a href="#" class="decrease">-</a>
                            <a href="#" class="increase">+</a>
                        </span>
                        <input type="text" name="page_options_page_width" id="page-options-page-width" class="small"/>
                    </div>
                </div>
                <p class="help">Enter width of page in pixels, eg. <span class="example">960</span>.<br/>Width will be adjusted to the multiple of <span id="least-common-multiple"></span> to fit number of grid columns specified earlier.</p>
            </div>
            <div class="modal-footer">
                <a href="#" class="next-step btn primary">Next step</a>
                <a href="#" class="previous-step btn secondary">Previous step</a>
            </div>
        </div>
        
        <div id="page-options-gutter-width-modal" class="modal fade">
            <div class="modal-header">
                <h3>Page setup - gutter width</h3>
            </div>
            <div class="modal-body">
                <p>Select gutter width.</p>
                <div class="clearfix">
                    <div class="input-prepend">
                        <span class="add-on">
                            <a href="#" class="decrease">-</a>
                            <a href="#" class="increase">+</a>
                        </span>
                        <input type="text" name="page_options_gutter_width" id="page-options-gutter-width" class="small"/>
                    </div>
                </div>
                <p class="help">Enter gutter width in pixels, eg. <span class="example">10</span>. Column is <span class="column-width-hint"></span> pixels wide.</p>
            </div>
            <div class="modal-footer">
                <a href="#" class="next-step btn primary">Create page</a>
                <a href="#" class="previous-step btn secondary">Previous step</a>
            </div>
        </div>
        
        <div id="add-strip-modal" class="modal fade">
            <div class="modal-header">
                <h3>Add nested strip</h3>
            </div>
            <div class="modal-body">
                <p>Select number of grid columns.</p>
                <select name="add_strip_grid_columns" id="add-strip-grid-columns" class="small"></select>
                <p class="help">All listed numbers are divisors of current page width.</p>
                <p>Select gutter width.</p>
                <div class="clearfix">
                    <div class="input-prepend">
                        <span class="add-on">
                            <a href="#" class="decrease">-</a>
                            <a href="#" class="increase">+</a>
                        </span>
                        <input type="text" name="add_strip_gutter_width" id="add-strip-gutter-width" class="small"/>
                    </div>
                </div>
                <p class="help">Enter gutter width in pixels, eg. <span class="example">10</span>. Column is <span class="column-width-hint"></span> pixels wide.</p>
            </div>
            <div class="modal-footer">
                <a href="#" class="add-strip btn primary">Add strip</a>
                <a href="#" class="cancel btn secondary">Cancel</a>
            </div>
        </div>
        
        <div id="get-code-modal" class="modal fade">
            <div class="modal-header">
                <a href="#" class="close">x</a><h3>Styles and markup</h3>
            </div>
            <div class="modal-body">
                <p>Copy styles and markup for created layout.</p>
                <div>
                    <textarea name ="styles" id="get-code-styles" rows="3"></textarea>
                </div><div>
                    <textarea name ="markup" id="get-code-markup" rows="3"></textarea>
                </div>
                <p>You can also save this layout and retrieve it later using returned hash. <span class="hash-hint"></span></p>
            </div>
            <div class="modal-footer">
                <a href="#" class="save btn primary">Save</a>
            </div>
        </div>
        
        <div id="container-options-modal" class="modal fade">
            <div class="modal-header">
                <h3>Container options</h3>
            </div>
            <div class="modal-body">
                <p>Set container class attribute.</p>
                <input type="text" name="container_options_class" id="container-options-class" class="xlarge"/>
                <p>Set container id attribute.</p>
                <input type="text" name="container_options_id" id="container-options-id" class="xlarge"/>
<!--                <p>Set container content.</p>
                <textarea name="container_options_content" id="container-options-content" class="xlarge"></textarea>-->
            </div>
            <div class="modal-footer">
                <a href="#" class="save btn primary">Save</a>
                <a href="#" class="cancel btn secondary">Cancel</a>
            </div>
        </div>
        
    </body>
</html>
