/*global module:false*/
module.exports = function(grunt){

	
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		bower: grunt.file.readJSON('bower.json'),
		copy: {
			demo: {
				files: [
					{expand: true, src: ['src/*'], dest: 'dist/', filter: 'isFile', flatten: true}
				]
			}
		},

		uglify: {
			options: {
				beautify: {
					ascii_only : true
				},
				preserveComments: 'some'
			},
			html5shiv: {
				files: [{
					expand: true,     // Enable dynamic expansion.
					cwd: 'src/',      // Src matches are relative to this path.
					src: ['**/*.js'], // Actual pattern(s) to match.
					dest: 'dist/',   // Destination path prefix.
					ext: '.min.js'
				}]
			}
		},
		watch: {
			js: {
				files: ['src/**/*.js'],
				tasks: ['copy', 'uglify', 'bytesize']
			}
		},
		bytesize: {
			all: {
				src: [
					'dist/**.min.js'
				]
			}
		}
	});

	
	// Default task.

	

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-bytesize');

	grunt.registerTask('default', ['copy', 'uglify', 'bytesize', 'watch']);

};

/*global module:false*/
module.exports = function (grunt) {

  "use strict";

  var _ = grunt.util._;

  grunt.initConfig({

    pkg : grunt.file.readJSON("package.json"),
    meta : {
      banner : "/*<%= pkg.name %>*/",
      output : "client/dist/responsive-nav.js",
      outputMin : "client/dist/responsive-nav.min.js"
    },

    jasmine : {
      options : {
        specs : "client/test/**/*.spec.js"
      },
      src : "client/src/**/*.js"
    },

    jshint : {
      //TODO: add strict option for build
      prebuild : {
        options : {
          jshintrc : ".jshintrc"
        },
        files : {
          src : [
            "Gruntfile.js",
            "client/src/**/*.js"
          ]
        }
      },
      tests : {
        options : grunt.util._.merge(
          grunt.file.readJSON(".jshintrc"),
          grunt.file.readJSON("client/test/.jshintrc")),
        files : {
          src : ["client/test/**/*.js"]
        }
      }
    },

    rig : {
      dist : {
        files : {
          "<%= meta.output %>": ["client/src/responsive-nav.js"]
        }
      }
    },

    uglify : {
      options : {
        report : "gzip",
        banner: "<%= banner %>"
      },
      dist : {
        files : {
          "<%= meta.outputMin %>": ["<%= meta.output %>"]
        }
      }
    },

    watch : {
      options : {
        atBegin : true
      },
      files : [
        "<%= jshint.prebuild.files.src %>",
        "<%= jshint.tests.files.src %>",
        "client/src/styles/responsive-nav.css",
        "client/src/bower/bower.json"
      ],
      tasks : "default"
    },

    replace : {
      options : {
        variables : {
          "version" : "<%= pkg.version %>",
          "name" : "<%= pkg.name %>",
          "bytes" : "<%= uglify.gzip %>",
          "year" : "<%= grunt.template.today('yyyy') %>",
        },
      },
      dist :{
        options : {
          patterns: [
            {
              match: "version",
              replacement: "<%= pkg.version %>",
            }
          ]
        },
        files : [
          {
            src : ["<%= meta.output %>"],
            dest : "<%= meta.output %>"
          },
          {
            src : ["client/src/styles/responsive-nav.css"],
            dest : "client/dist/styles/responsive-nav.css"
          },
          {
            src : ["client/src/bower/bower.json"],
            dest : "client/dist/bower/bower.json"
          }
        ]
      }
    },

    shell : {
      server : {
        options : {
          stdout : true,
          stderr : true,
          failOnError : true
        }
      }
    },

    karma : {
      options : {
        frameworks : ["jasmine"],
        files : [
          "<%= jasmine.src %>",
          "<%= jasmine.options.specs %>"
        ],
        background : _.last(process.argv) !== "karma"
      },
      all : {

      }
    },

    copy : {
      responsiveNav : {
        files : [
          {
            src : "<%= meta.outputMin %>",
            dest : "responsive-nav.min.js"
          },
          {
            src : "<%= meta.output %>",
            dest : "responsive-nav.js"
          },
          {
            src : "client/dist/styles/responsive-nav.css",
            dest : "responsive-nav.css"
          },
          {
            src : "client/dist/bower/bower.json",
            dest : "bower.json"
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-jasmine");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-rigger");
  grunt.loadNpmTasks("grunt-shell");
  grunt.loadNpmTasks("grunt-replace");
  grunt.loadNpmTasks("grunt-karma");
  grunt.loadNpmTasks("grunt-contrib-copy");

  grunt.registerTask("test", ["jshint:prebuild", "jshint:tests", "jasmine", "karma:all:run"]);
  grunt.registerTask("default", ["test", "rig", "replace", "uglify", "copy"]);
};

/*! responsive-nav.js 1.0.34
 * https://github.com/viljamis/responsive-nav.js
 * http://responsive-nav.com
 *
 * Copyright (c) 2014 @viljamis
 * Available under the MIT license
 */

(function (document, window, index) {
  // Index is used to keep multiple navs on the same page namespaced

  "use strict";

  var responsiveNav = function (el, options) {

    var computed = !!window.getComputedStyle;
    
    /**
     * getComputedStyle polyfill for old browsers
     */
    if (!computed) {
      window.getComputedStyle = function(el) {
        this.el = el;
        this.getPropertyValue = function(prop) {
          var re = /(\-([a-z]){1})/g;
          if (prop === "float") {
            prop = "styleFloat";
          }
          if (re.test(prop)) {
            prop = prop.replace(re, function () {
              return arguments[2].toUpperCase();
            });
          }
          return el.currentStyle[prop] ? el.currentStyle[prop] : null;
        };
        return this;
      };
    }
    /* exported addEvent, removeEvent, getChildren, setAttributes, addClass, removeClass, forEach */
    
    /**
     * Add Event
     * fn arg can be an object or a function, thanks to handleEvent
     * read more at: http://www.thecssninja.com/javascript/handleevent
     *
     * @param  {element}  element
     * @param  {event}    event
     * @param  {Function} fn
     * @param  {boolean}  bubbling
     */
    var addEvent = function (el, evt, fn, bubble) {
        if ("addEventListener" in el) {
          // BBOS6 doesn't support handleEvent, catch and polyfill
          try {
            el.addEventListener(evt, fn, bubble);
          } catch (e) {
            if (typeof fn === "object" && fn.handleEvent) {
              el.addEventListener(evt, function (e) {
                // Bind fn as this and set first arg as event object
                fn.handleEvent.call(fn, e);
              }, bubble);
            } else {
              throw e;
            }
          }
        } else if ("attachEvent" in el) {
          // check if the callback is an object and contains handleEvent
          if (typeof fn === "object" && fn.handleEvent) {
            el.attachEvent("on" + evt, function () {
              // Bind fn as this
              fn.handleEvent.call(fn);
            });
          } else {
            el.attachEvent("on" + evt, fn);
          }
        }
      },
    
      /**
       * Remove Event
       *
       * @param  {element}  element
       * @param  {event}    event
       * @param  {Function} fn
       * @param  {boolean}  bubbling
       */
      removeEvent = function (el, evt, fn, bubble) {
        if ("removeEventListener" in el) {
          try {
            el.removeEventListener(evt, fn, bubble);
          } catch (e) {
            if (typeof fn === "object" && fn.handleEvent) {
              el.removeEventListener(evt, function (e) {
                fn.handleEvent.call(fn, e);
              }, bubble);
            } else {
              throw e;
            }
          }
        } else if ("detachEvent" in el) {
          if (typeof fn === "object" && fn.handleEvent) {
            el.detachEvent("on" + evt, function () {
              fn.handleEvent.call(fn);
            });
          } else {
            el.detachEvent("on" + evt, fn);
          }
        }
      },
    
      /**
       * Get the children of any element
       *
       * @param  {element}
       * @return {array} Returns matching elements in an array
       */
      getChildren = function (e) {
        if (e.children.length < 1) {
          throw new Error("The Nav container has no containing elements");
        }
        // Store all children in array
        var children = [];
        // Loop through children and store in array if child != TextNode
        for (var i = 0; i < e.children.length; i++) {
          if (e.children[i].nodeType === 1) {
            children.push(e.children[i]);
          }
        }
        return children;
      },
    
      /**
       * Sets multiple attributes at once
       *
       * @param {element} element
       * @param {attrs}   attrs
       */
      setAttributes = function (el, attrs) {
        for (var key in attrs) {
          el.setAttribute(key, attrs[key]);
        }
      },
    
      /**
       * Adds a class to any element
       *
       * @param {element} element
       * @param {string}  class
       */
      addClass = function (el, cls) {
        if (el.className.indexOf(cls) !== 0) {
          el.className += " " + cls;
          el.className = el.className.replace(/(^\s*)|(\s*$)/g,"");
        }
      },
    
      /**
       * Remove a class from any element
       *
       * @param  {element} element
       * @param  {string}  class
       */
      removeClass = function (el, cls) {
        var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
        el.className = el.className.replace(reg, " ").replace(/(^\s*)|(\s*$)/g,"");
      },
    
      /**
       * forEach method that passes back the stuff we need
       *
       * @param  {array}    array
       * @param  {Function} callback
       * @param  {scope}    scope
       */
      forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
          callback.call(scope, i, array[i]);
        }
      };

    var nav,
      opts,
      navToggle,
      styleElement = document.createElement("style"),
      htmlEl = document.documentElement,
      hasAnimFinished,
      isMobile,
      navOpen;

    var ResponsiveNav = function (el, options) {
        var i;

        /**
         * Default options
         * @type {Object}
         */
        this.options = {
          animate: true,                    // Boolean: Use CSS3 transitions, true or false
          transition: 284,                  // Integer: Speed of the transition, in milliseconds
          label: "Menu",                    // String: Label for the navigation toggle
          insert: "before",                 // String: Insert the toggle before or after the navigation
          customToggle: "",                 // Selector: Specify the ID of a custom toggle
          closeOnNavClick: false,           // Boolean: Close the navigation when one of the links are clicked
          openPos: "relative",              // String: Position of the opened nav, relative or static
          navClass: "nav-collapse",         // String: Default CSS class. If changed, you need to edit the CSS too!
          navActiveClass: "js-nav-active",  // String: Class that is added to <html> element when nav is active
          jsClass: "js",                    // String: 'JS enabled' class which is added to <html> element
          init: function(){},               // Function: Init callback
          open: function(){},               // Function: Open callback
          close: function(){}               // Function: Close callback
        };

        // User defined options
        for (i in options) {
          this.options[i] = options[i];
        }

        // Adds "js" class for <html>
        addClass(htmlEl, this.options.jsClass);

        // Wrapper
        this.wrapperEl = el.replace("#", "");

        // Try selecting ID first
        if (document.getElementById(this.wrapperEl)) {
          this.wrapper = document.getElementById(this.wrapperEl);

        // If element with an ID doesn't exist, use querySelector
        } else if (document.querySelector(this.wrapperEl)) {
          this.wrapper = document.querySelector(this.wrapperEl);

        // If element doesn't exists, stop here.
        } else {
          throw new Error("The nav element you are trying to select doesn't exist");
        }

        // Inner wrapper
        this.wrapper.inner = getChildren(this.wrapper);

        // For minification
        opts = this.options;
        nav = this.wrapper;

        // Init
        this._init(this);
      };

    ResponsiveNav.prototype = {

      /**
       * Unattaches events and removes any classes that were added
       */
      destroy: function () {
        this._removeStyles();
        removeClass(nav, "closed");
        removeClass(nav, "opened");
        removeClass(nav, opts.navClass);
        removeClass(nav, opts.navClass + "-" + this.index);
        removeClass(htmlEl, opts.navActiveClass);
        nav.removeAttribute("style");
        nav.removeAttribute("aria-hidden");

        removeEvent(window, "resize", this, false);
        removeEvent(window, "focus", this, false);
        removeEvent(document.body, "touchmove", this, false);
        removeEvent(navToggle, "touchstart", this, false);
        removeEvent(navToggle, "touchend", this, false);
        removeEvent(navToggle, "mouseup", this, false);
        removeEvent(navToggle, "keyup", this, false);
        removeEvent(navToggle, "click", this, false);

        if (!opts.customToggle) {
          navToggle.parentNode.removeChild(navToggle);
        } else {
          navToggle.removeAttribute("aria-hidden");
        }
      },

      /**
       * Toggles the navigation open/close
       */
      toggle: function () {
        if (hasAnimFinished === true) {
          if (!navOpen) {
            this.open();
          } else {
            this.close();
          }

          // Enable pointer events again
          this._enablePointerEvents();
        }
      },

      /**
       * Opens the navigation
       */
      open: function () {
        if (!navOpen) {
          removeClass(nav, "closed");
          addClass(nav, "opened");
          addClass(htmlEl, opts.navActiveClass);
          addClass(navToggle, "active");
          nav.style.position = opts.openPos;
          setAttributes(nav, {"aria-hidden": "false"});
          navOpen = true;
          opts.open();
        }
      },

      /**
       * Closes the navigation
       */
      close: function () {
        if (navOpen) {
          addClass(nav, "closed");
          removeClass(nav, "opened");
          removeClass(htmlEl, opts.navActiveClass);
          removeClass(navToggle, "active");
          setAttributes(nav, {"aria-hidden": "true"});

          // If animations are enabled, wait until they finish
          if (opts.animate) {
            hasAnimFinished = false;
            setTimeout(function () {
              nav.style.position = "absolute";
              hasAnimFinished = true;
            }, opts.transition + 10);

          // Animations aren't enabled, we can do these immediately
          } else {
            nav.style.position = "absolute";
          }

          navOpen = false;
          opts.close();
        }
      },

      /**
       * Resize is called on window resize and orientation change.
       * It initializes the CSS styles and height calculations.
       */
      resize: function () {

        // Resize watches navigation toggle's display state
        if (window.getComputedStyle(navToggle, null).getPropertyValue("display") !== "none") {

          isMobile = true;
          setAttributes(navToggle, {"aria-hidden": "false"});

          // If the navigation is hidden
          if (nav.className.match(/(^|\s)closed(\s|$)/)) {
            setAttributes(nav, {"aria-hidden": "true"});
            nav.style.position = "absolute";
          }

          this._createStyles();
          this._calcHeight();
        } else {

          isMobile = false;
          setAttributes(navToggle, {"aria-hidden": "true"});
          setAttributes(nav, {"aria-hidden": "false"});
          nav.style.position = opts.openPos;
          this._removeStyles();
        }
      },

      /**
       * Takes care of all even handling
       *
       * @param  {event} event
       * @return {type} returns the type of event that should be used
       */
      handleEvent: function (e) {
        var evt = e || window.event;

        switch (evt.type) {
        case "touchstart":
          this._onTouchStart(evt);
          break;
        case "touchmove":
          this._onTouchMove(evt);
          break;
        case "touchend":
        case "mouseup":
          this._onTouchEnd(evt);
          break;
        case "click":
          this._preventDefault(evt);
          break;
        case "keyup":
          this._onKeyUp(evt);
          break;
        case "focus":
        case "resize":
          this.resize(evt);
          break;
        }
      },

      /**
       * Initializes the widget
       */
      _init: function () {
        this.index = index++;

        addClass(nav, opts.navClass);
        addClass(nav, opts.navClass + "-" + this.index);
        addClass(nav, "closed");
        hasAnimFinished = true;
        navOpen = false;

        this._closeOnNavClick();
        this._createToggle();
        this._transitions();
        this.resize();

        /**
         * On IE8 the resize event triggers too early for some reason
         * so it's called here again on init to make sure all the
         * calculated styles are correct.
         */
        var self = this;
        setTimeout(function () {
          self.resize();
        }, 20);

        addEvent(window, "resize", this, false);
        addEvent(window, "focus", this, false);
        addEvent(document.body, "touchmove", this, false);
        addEvent(navToggle, "touchstart", this, false);
        addEvent(navToggle, "touchend", this, false);
        addEvent(navToggle, "mouseup", this, false);
        addEvent(navToggle, "keyup", this, false);
        addEvent(navToggle, "click", this, false);

        /**
         * Init callback here
         */
        opts.init();
      },

      /**
       * Creates Styles to the <head>
       */
      _createStyles: function () {
        if (!styleElement.parentNode) {
          styleElement.type = "text/css";
          document.getElementsByTagName("head")[0].appendChild(styleElement);
        }
      },

      /**
       * Removes styles from the <head>
       */
      _removeStyles: function () {
        if (styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      },

      /**
       * Creates Navigation Toggle
       */
      _createToggle: function () {

        // If there's no toggle, let's create one
        if (!opts.customToggle) {
          var toggle = document.createElement("a");
          toggle.innerHTML = opts.label;
          setAttributes(toggle, {
            "href": "#",
            "class": "nav-toggle"
          });

          // Determine where to insert the toggle
          if (opts.insert === "after") {
            nav.parentNode.insertBefore(toggle, nav.nextSibling);
          } else {
            nav.parentNode.insertBefore(toggle, nav);
          }

          navToggle = toggle;

        // There is a toggle already, let's use that one
        } else {
          var toggleEl = opts.customToggle.replace("#", "");

          if (document.getElementById(toggleEl)) {
            navToggle = document.getElementById(toggleEl);
          } else if (document.querySelector(toggleEl)) {
            navToggle = document.querySelector(toggleEl);
          } else {
            throw new Error("The custom nav toggle you are trying to select doesn't exist");
          }
        }
      },

      /**
       * Closes the navigation when a link inside is clicked
       */
      _closeOnNavClick: function () {
        if (opts.closeOnNavClick) {
          var links = nav.getElementsByTagName("a"),
            self = this;
          forEach(links, function (i, el) {
            addEvent(links[i], "click", function () {
              if (isMobile) {
                self.toggle();
              }
            }, false);
          });
        }
      },

      /**
       * Prevents the default tap functionality
       *
       * @param  {event} event
       */
      _preventDefault: function(e) {
        if (e.preventDefault) {
          if (e.stopImmediatePropagation) {
            e.stopImmediatePropagation();
          }
          e.preventDefault();
          e.stopPropagation();
          return false;

        // This is strictly for old IE
        } else {
          e.returnValue = false;
        }
      },

      /**
       * On touch start get the location of the touch
       * and disable pointer events on the body.
       *
       * @param  {event} event
       */
      _onTouchStart: function (e) {
        this._preventDefault(e);
        addClass(document.body, "disable-pointer-events");
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.touchHasMoved = false;

        /**
         * We remove mouseup event completely here to avoid
         * double triggering of events.
         */
        removeEvent(navToggle, "mouseup", this, false);
      },

      /**
       * Check if the user is scrolling instead of tapping and
       * re-enable pointer events if movement happed.
       *
       * @param  {event} event
       */
      _onTouchMove: function (e) {
        if (Math.abs(e.touches[0].clientX - this.startX) > 10 ||
        Math.abs(e.touches[0].clientY - this.startY) > 10) {
          this._enablePointerEvents();
          this.touchHasMoved = true;
        }
      },

      /**
       * On touch end toggle either the whole navigation or
       * a sub-navigation depending on which one was tapped.
       *
       * @param  {event} event
       */
      _onTouchEnd: function (e) {
        this._preventDefault(e);
        if (!isMobile) {
          return;
        }

        // If the user isn't scrolling
        if (!this.touchHasMoved) {

          // If the event type is touch
          if (e.type === "touchend") {
            this.toggle();
            if (opts.insert === "after") {
              setTimeout(function () {
                removeClass(document.body, "disable-pointer-events");
              }, opts.transition + 300);
            }
            return;

          // Event type was click, not touch
          } else {
            var evt = e || window.event;

            // If it isn't a right click, do toggling
            if (!(evt.which === 3 || evt.button === 2)) {
              this.toggle();
            }
          }
        }
      },

      /**
       * For keyboard accessibility, toggle the navigation on Enter
       * keypress too (also sub-navigation is keyboard accessible
       * which explains the complexity here)
       *
       * @param  {event} event
       */
      _onKeyUp: function (e) {
        var evt = e || window.event;
        if (evt.keyCode === 13) {
          this.toggle();
        }
      },

      /**
       * Enable pointer events
       */
      _enablePointerEvents: function () {
        removeClass(document.body, "disable-pointer-events");
      },

      /**
       * Adds the needed CSS transitions if animations are enabled
       */
      _transitions: function () {
        if (opts.animate) {
          var objStyle = nav.style,
            transition = "max-height " + opts.transition + "ms";

          objStyle.WebkitTransition = transition;
          objStyle.MozTransition = transition;
          objStyle.OTransition = transition;
          objStyle.transition = transition;
        }
      },

      /**
       * Calculates the height of the navigation and then creates
       * styles which are later added to the page <head>
       */
      _calcHeight: function () {
        var savedHeight = 0;
        for (var i = 0; i < nav.inner.length; i++) {
          savedHeight += nav.inner[i].offsetHeight;
        }

        // Pointer event styles are also here since they might only be confusing inside the stylesheet
        var innerStyles = "." + opts.jsClass + " ." + opts.navClass + "-" + this.index + ".opened{max-height:" + savedHeight + "px !important} ." + opts.jsClass + " .disable-pointer-events{pointer-events:none !important} ." + opts.jsClass + " ." + opts.navClass + "-" + this.index + ".opened.dropdown-active {max-height:9999px !important}";


        if (styleElement.styleSheet) {
          styleElement.styleSheet.cssText = innerStyles;
        } else {
          styleElement.innerHTML = innerStyles;
        }

        innerStyles = "";
      }

    };

    /**
     * Return new Responsive Nav
     */
    return new ResponsiveNav(el, options);

  };

  window.responsiveNav = responsiveNav;

}(document, window, 0));
/*! responsive-nav.js 1.0.34, copyright (c) 2014 @viljamis, MIT license */
!function(a,b,c){"use strict";var d=function(d,e){var f=!!b.getComputedStyle;f||(b.getComputedStyle=function(a){return this.el=a,this.getPropertyValue=function(b){var c=/(\-([a-z]){1})/g;return"float"===b&&(b="styleFloat"),c.test(b)&&(b=b.replace(c,function(){return arguments[2].toUpperCase()})),a.currentStyle[b]?a.currentStyle[b]:null},this});var g,h,i,j,k,l,m=function(a,b,c,d){if("addEventListener"in a)try{a.addEventListener(b,c,d)}catch(e){if("object"!=typeof c||!c.handleEvent)throw e;a.addEventListener(b,function(a){c.handleEvent.call(c,a)},d)}else"attachEvent"in a&&("object"==typeof c&&c.handleEvent?a.attachEvent("on"+b,function(){c.handleEvent.call(c)}):a.attachEvent("on"+b,c))},n=function(a,b,c,d){if("removeEventListener"in a)try{a.removeEventListener(b,c,d)}catch(e){if("object"!=typeof c||!c.handleEvent)throw e;a.removeEventListener(b,function(a){c.handleEvent.call(c,a)},d)}else"detachEvent"in a&&("object"==typeof c&&c.handleEvent?a.detachEvent("on"+b,function(){c.handleEvent.call(c)}):a.detachEvent("on"+b,c))},o=function(a){if(a.children.length<1)throw new Error("The Nav container has no containing elements");for(var b=[],c=0;c<a.children.length;c++)1===a.children[c].nodeType&&b.push(a.children[c]);return b},p=function(a,b){for(var c in b)a.setAttribute(c,b[c])},q=function(a,b){0!==a.className.indexOf(b)&&(a.className+=" "+b,a.className=a.className.replace(/(^\s*)|(\s*$)/g,""))},r=function(a,b){var c=new RegExp("(\\s|^)"+b+"(\\s|$)");a.className=a.className.replace(c," ").replace(/(^\s*)|(\s*$)/g,"")},s=function(a,b,c){for(var d=0;d<a.length;d++)b.call(c,d,a[d])},t=a.createElement("style"),u=a.documentElement,v=function(b,c){var d;this.options={animate:!0,transition:284,label:"Menu",insert:"before",customToggle:"",closeOnNavClick:!1,openPos:"relative",navClass:"nav-collapse",navActiveClass:"js-nav-active",jsClass:"js",init:function(){},open:function(){},close:function(){}};for(d in c)this.options[d]=c[d];if(q(u,this.options.jsClass),this.wrapperEl=b.replace("#",""),a.getElementById(this.wrapperEl))this.wrapper=a.getElementById(this.wrapperEl);else{if(!a.querySelector(this.wrapperEl))throw new Error("The nav element you are trying to select doesn't exist");this.wrapper=a.querySelector(this.wrapperEl)}this.wrapper.inner=o(this.wrapper),h=this.options,g=this.wrapper,this._init(this)};return v.prototype={destroy:function(){this._removeStyles(),r(g,"closed"),r(g,"opened"),r(g,h.navClass),r(g,h.navClass+"-"+this.index),r(u,h.navActiveClass),g.removeAttribute("style"),g.removeAttribute("aria-hidden"),n(b,"resize",this,!1),n(b,"focus",this,!1),n(a.body,"touchmove",this,!1),n(i,"touchstart",this,!1),n(i,"touchend",this,!1),n(i,"mouseup",this,!1),n(i,"keyup",this,!1),n(i,"click",this,!1),h.customToggle?i.removeAttribute("aria-hidden"):i.parentNode.removeChild(i)},toggle:function(){j===!0&&(l?this.close():this.open(),this._enablePointerEvents())},open:function(){l||(r(g,"closed"),q(g,"opened"),q(u,h.navActiveClass),q(i,"active"),g.style.position=h.openPos,p(g,{"aria-hidden":"false"}),l=!0,h.open())},close:function(){l&&(q(g,"closed"),r(g,"opened"),r(u,h.navActiveClass),r(i,"active"),p(g,{"aria-hidden":"true"}),h.animate?(j=!1,setTimeout(function(){g.style.position="absolute",j=!0},h.transition+10)):g.style.position="absolute",l=!1,h.close())},resize:function(){"none"!==b.getComputedStyle(i,null).getPropertyValue("display")?(k=!0,p(i,{"aria-hidden":"false"}),g.className.match(/(^|\s)closed(\s|$)/)&&(p(g,{"aria-hidden":"true"}),g.style.position="absolute"),this._createStyles(),this._calcHeight()):(k=!1,p(i,{"aria-hidden":"true"}),p(g,{"aria-hidden":"false"}),g.style.position=h.openPos,this._removeStyles())},handleEvent:function(a){var c=a||b.event;switch(c.type){case"touchstart":this._onTouchStart(c);break;case"touchmove":this._onTouchMove(c);break;case"touchend":case"mouseup":this._onTouchEnd(c);break;case"click":this._preventDefault(c);break;case"keyup":this._onKeyUp(c);break;case"focus":case"resize":this.resize(c)}},_init:function(){this.index=c++,q(g,h.navClass),q(g,h.navClass+"-"+this.index),q(g,"closed"),j=!0,l=!1,this._closeOnNavClick(),this._createToggle(),this._transitions(),this.resize();var d=this;setTimeout(function(){d.resize()},20),m(b,"resize",this,!1),m(b,"focus",this,!1),m(a.body,"touchmove",this,!1),m(i,"touchstart",this,!1),m(i,"touchend",this,!1),m(i,"mouseup",this,!1),m(i,"keyup",this,!1),m(i,"click",this,!1),h.init()},_createStyles:function(){t.parentNode||(t.type="text/css",a.getElementsByTagName("head")[0].appendChild(t))},_removeStyles:function(){t.parentNode&&t.parentNode.removeChild(t)},_createToggle:function(){if(h.customToggle){var b=h.customToggle.replace("#","");if(a.getElementById(b))i=a.getElementById(b);else{if(!a.querySelector(b))throw new Error("The custom nav toggle you are trying to select doesn't exist");i=a.querySelector(b)}}else{var c=a.createElement("a");c.innerHTML=h.label,p(c,{href:"#","class":"nav-toggle"}),"after"===h.insert?g.parentNode.insertBefore(c,g.nextSibling):g.parentNode.insertBefore(c,g),i=c}},_closeOnNavClick:function(){if(h.closeOnNavClick){var a=g.getElementsByTagName("a"),b=this;s(a,function(c){m(a[c],"click",function(){k&&b.toggle()},!1)})}},_preventDefault:function(a){return a.preventDefault?(a.stopImmediatePropagation&&a.stopImmediatePropagation(),a.preventDefault(),a.stopPropagation(),!1):void(a.returnValue=!1)},_onTouchStart:function(b){this._preventDefault(b),q(a.body,"disable-pointer-events"),this.startX=b.touches[0].clientX,this.startY=b.touches[0].clientY,this.touchHasMoved=!1,n(i,"mouseup",this,!1)},_onTouchMove:function(a){(Math.abs(a.touches[0].clientX-this.startX)>10||Math.abs(a.touches[0].clientY-this.startY)>10)&&(this._enablePointerEvents(),this.touchHasMoved=!0)},_onTouchEnd:function(c){if(this._preventDefault(c),k&&!this.touchHasMoved){if("touchend"===c.type)return this.toggle(),void("after"===h.insert&&setTimeout(function(){r(a.body,"disable-pointer-events")},h.transition+300));var d=c||b.event;3!==d.which&&2!==d.button&&this.toggle()}},_onKeyUp:function(a){var c=a||b.event;13===c.keyCode&&this.toggle()},_enablePointerEvents:function(){r(a.body,"disable-pointer-events")},_transitions:function(){if(h.animate){var a=g.style,b="max-height "+h.transition+"ms";a.WebkitTransition=b,a.MozTransition=b,a.OTransition=b,a.transition=b}},_calcHeight:function(){for(var a=0,b=0;b<g.inner.length;b++)a+=g.inner[b].offsetHeight;var c="."+h.jsClass+" ."+h.navClass+"-"+this.index+".opened{max-height:"+a+"px !important} ."+h.jsClass+" .disable-pointer-events{pointer-events:none !important} ."+h.jsClass+" ."+h.navClass+"-"+this.index+".opened.dropdown-active {max-height:9999px !important}";t.styleSheet?t.styleSheet.cssText=c:t.innerHTML=c,c=""}},new v(d,e)};b.responsiveNav=d}(document,window,0);

(function(){
    'use strict';    
    var gulp = require('gulp'),
        gutil = require('gulp-util'),
        connect = require('gulp-connect'),
        open = require('gulp-open'),
        less = require('gulp-less'),
        rename = require('gulp-rename'),
        header = require('gulp-header'),
        path = require('path'),
        uglify = require('gulp-uglify'),
        sourcemaps = require('gulp-sourcemaps'),
        minifyCSS = require('gulp-minify-css'),
        tap = require('gulp-tap'),
        concat = require('gulp-concat'),
        jshint = require('gulp-jshint'),
        stylish = require('jshint-stylish'),
        fs = require('fs'),
        paths = {
            root: './',
            build: {
                root: 'build/',
                styles: 'build/css/',
                scripts: 'build/js/'
            },
            dist: {
                root: 'dist/',
                styles: 'dist/css/',
                scripts: 'dist/js/'
            },
            playground: {
                root: 'playground/'
            },
            source: {
                root: 'src/',
                styles: 'src/less/',
                scripts: 'src/js/*.js'
            },
        },
        swiper = {
            filename: 'swiper',
            jsFiles: [
                'src/js/wrap-start.js',
                'src/js/swiper-intro.js',
                'src/js/core.js',
                'src/js/effects.js',
                'src/js/scrollbar.js',
                'src/js/controller.js',
                'src/js/hashnav.js',
                'src/js/keyboard.js',
                'src/js/mousewheel.js',
                'src/js/parallax.js',
                'src/js/init.js',
                'src/js/swiper-outro.js',
                'src/js/swiper-proto.js',
                'src/js/dom.js',
                'src/js/dom-plugins.js',
                'src/js/wrap-end.js',
                'src/js/amd.js'
            ],
            jQueryFiles : [
                'src/js/wrap-start.js',
                'src/js/swiper-intro.js',
                'src/js/core.js',
                'src/js/effects.js',
                'src/js/scrollbar.js',
                'src/js/controller.js',
                'src/js/hashnav.js',
                'src/js/keyboard.js',
                'src/js/mousewheel.js',
                'src/js/parallax.js',
                'src/js/init.js',
                'src/js/swiper-outro.js',
                'src/js/swiper-proto.js',
                'src/js/dom-plugins.js',
                'src/js/wrap-end.js',
                'src/js/amd.js'
            ],
            Framework7Files : [
                'src/js/swiper-intro.js',
                'src/js/core.js',
                'src/js/effects.js',
                'src/js/scrollbar.js',
                'src/js/controller.js',
                'src/js/parallax.js',
                'src/js/init.js',
                'src/js/swiper-outro.js',
                'src/js/swiper-proto.js',
            ],
            pkg: require('./bower.json'),
            banner: [
                '/**',
                ' * Swiper <%= pkg.version %>',
                ' * <%= pkg.description %>',
                ' * ',
                ' * <%= pkg.homepage %>',
                ' * ',
                ' * Copyright <%= date.year %>, <%= pkg.author %>',
                ' * The iDangero.us',
                ' * http://www.idangero.us/',
                ' * ',
                ' * Licensed under <%= pkg.license.join(" & ") %>',
                ' * ',
                ' * Released on: <%= date.month %> <%= date.day %>, <%= date.year %>',
                ' */',
                ''].join('\n'),
            date: {
                year: new Date().getFullYear(),
                month: ('January February March April May June July August September October November December').split(' ')[new Date().getMonth()],
                day: new Date().getDate()
            }
        };
        
    function addJSIndent (file, t, minusIndent) {
        var addIndent = '        ';
        var filename = file.path.split('src/js/')[1];
        if (filename === 'wrap-start.js' || filename === 'wrap-end.js' || filename === 'amd.js') {
            addIndent = '';
        }
        if (filename === 'swiper-intro.js' || filename === 'swiper-outro.js' || filename === 'dom.js' || filename === 'dom-plugins.js' || filename === 'swiper-proto.js') addIndent = '    ';
        if (minusIndent) {
            addIndent = addIndent.substring(4);
        }
        if (addIndent !== '') {
            var fileLines = fs.readFileSync(file.path).toString().split('\n');
            var newFileContents = '';
            for (var i = 0; i < fileLines.length; i++) {
                newFileContents += addIndent + fileLines[i] + (i === fileLines.length ? '' : '\n');
            }
            file.contents = new Buffer(newFileContents);
        }
    }
    gulp.task('scripts', function (cb) {
        gulp.src(swiper.jsFiles)
            .pipe(tap(function (file, t){
                addJSIndent (file, t);
            }))
            .pipe(concat(swiper.filename + '.js'))            
            .pipe(header(swiper.banner, { pkg : swiper.pkg, date: swiper.date } ))
            .pipe(gulp.dest(paths.build.scripts))

            .pipe(jshint())
            .pipe(jshint.reporter(stylish));
        gulp.src(swiper.jQueryFiles)
            .pipe(tap(function (file, t){
                addJSIndent (file, t);
            }))
            .pipe(concat(swiper.filename + '.jquery.js'))
            .pipe(header(swiper.banner, { pkg : swiper.pkg, date: swiper.date } ))
            .pipe(gulp.dest(paths.build.scripts));
        gulp.src(swiper.Framework7Files)
            .pipe(tap(function (file, t){
                addJSIndent (file, t, true);
            }))
            .pipe(concat(swiper.filename + '.framework7.js'))
            .pipe(header(swiper.banner, { pkg : swiper.pkg, date: swiper.date } ))
            .pipe(gulp.dest(paths.build.scripts))
            .pipe(connect.reload());
        cb();
    });
    gulp.task('styles', function (cb) {
        gulp.src(paths.source.styles + 'swiper.less')
            .pipe(less({
                paths: [ path.join(__dirname, 'less', 'includes') ]
            }))
            .pipe(header(swiper.banner, { pkg : swiper.pkg, date: swiper.date }))
            .pipe(rename(function(path) {
                path.basename = swiper.filename;
            }))
            .pipe(gulp.dest(paths.build.styles))
            .pipe(connect.reload());
        cb();
    });
    gulp.task('build', ['scripts', 'styles'], function (cb) {
        cb();
    });

    gulp.task('dist', function () {
        gulp.src([paths.build.scripts + swiper.filename + '.js'])
            .pipe(gulp.dest(paths.dist.scripts))
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(header(swiper.banner, { pkg : swiper.pkg, date: swiper.date }))
            .pipe(rename(function(path) {
                path.basename = swiper.filename + '.min';
            }))
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest(paths.dist.scripts));

        gulp.src([paths.build.scripts + swiper.filename + '.jquery.js'])
            .pipe(gulp.dest(paths.dist.scripts))
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(header(swiper.banner, { pkg : swiper.pkg, date: swiper.date } ))
            .pipe(rename(function(path) {
                path.basename = swiper.filename + '.jquery.min';
            }))
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest(paths.dist.scripts));

        gulp.src(paths.build.styles + '*.css')
            .pipe(gulp.dest(paths.dist.styles))
            .pipe(minifyCSS())
            .pipe(header(swiper.banner, { pkg : swiper.pkg, date: swiper.date }))
            .pipe(rename(function(path) {
                path.basename = swiper.filename + '.min';
            }))
            .pipe(gulp.dest(paths.dist.styles));
    });

    gulp.task('watch', function () {
        gulp.watch(paths.source.scripts, [ 'scripts' ]);
        gulp.watch(paths.source.styles + '*.less', [ 'styles' ]);
    });

    gulp.task('connect', function () {
        return connect.server({
            root: [ paths.root ],
            livereload: true,
            port:'3000'
        });
    });
    
    gulp.task('open', function () {
        return gulp.src(paths.playground.root + 'index.html').pipe(open('', { url: 'http://localhost:3000/' + paths.playground.root + 'index.html'}));
    });

    gulp.task('server', [ 'watch', 'connect', 'open' ]);

    gulp.task('default', [ 'server' ]);
})();
/**
* @preserve HTML5 Shiv 3.7.2 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
*/
;(function(window, document) {
/*jshint evil:true */
  /** version */
  var version = '3.7.2';

  /** Preset options */
  var options = window.html5 || {};

  /** Used to skip problem elements */
  var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

  /** Not all elements can be cloned in IE **/
  var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

  /** Detect whether the browser supports default html5 styles */
  var supportsHtml5Styles;

  /** Name of the expando, to work with multiple documents or to re-shiv one document */
  var expando = '_html5shiv';

  /** The id for the the documents expando */
  var expanID = 0;

  /** Cached data for each document */
  var expandoData = {};

  /** Detect whether the browser supports unknown elements */
  var supportsUnknownElements;

  (function() {
    try {
        var a = document.createElement('a');
        a.innerHTML = '<xyz></xyz>';
        //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
        supportsHtml5Styles = ('hidden' in a);

        supportsUnknownElements = a.childNodes.length == 1 || (function() {
          // assign a false positive if unable to shiv
          (document.createElement)('a');
          var frag = document.createDocumentFragment();
          return (
            typeof frag.cloneNode == 'undefined' ||
            typeof frag.createDocumentFragment == 'undefined' ||
            typeof frag.createElement == 'undefined'
          );
        }());
    } catch(e) {
      // assign a false positive if detection fails => unable to shiv
      supportsHtml5Styles = true;
      supportsUnknownElements = true;
    }

  }());

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a style sheet with the given CSS text and adds it to the document.
   * @private
   * @param {Document} ownerDocument The document.
   * @param {String} cssText The CSS text.
   * @returns {StyleSheet} The style element.
   */
  function addStyleSheet(ownerDocument, cssText) {
    var p = ownerDocument.createElement('p'),
        parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

    p.innerHTML = 'x<style>' + cssText + '</style>';
    return parent.insertBefore(p.lastChild, parent.firstChild);
  }

  /**
   * Returns the value of `html5.elements` as an array.
   * @private
   * @returns {Array} An array of shived element node names.
   */
  function getElements() {
    var elements = html5.elements;
    return typeof elements == 'string' ? elements.split(' ') : elements;
  }

  /**
   * Extends the built-in list of html5 elements
   * @memberOf html5
   * @param {String|Array} newElements whitespace separated list or array of new element names to shiv
   * @param {Document} ownerDocument The context document.
   */
  function addElements(newElements, ownerDocument) {
    var elements = html5.elements;
    if(typeof elements != 'string'){
      elements = elements.join(' ');
    }
    if(typeof newElements != 'string'){
      newElements = newElements.join(' ');
    }
    html5.elements = elements +' '+ newElements;
    shivDocument(ownerDocument);
  }

    /**
   * Returns the data associated to the given document
   * @private
   * @param {Document} ownerDocument The document.
   * @returns {Object} An object of data.
   */
  function getExpandoData(ownerDocument) {
    var data = expandoData[ownerDocument[expando]];
    if (!data) {
        data = {};
        expanID++;
        ownerDocument[expando] = expanID;
        expandoData[expanID] = data;
    }
    return data;
  }

  /**
   * returns a shived element for the given nodeName and document
   * @memberOf html5
   * @param {String} nodeName name of the element
   * @param {Document} ownerDocument The context document.
   * @returns {Object} The shived element.
   */
  function createElement(nodeName, ownerDocument, data){
    if (!ownerDocument) {
        ownerDocument = document;
    }
    if(supportsUnknownElements){
        return ownerDocument.createElement(nodeName);
    }
    if (!data) {
        data = getExpandoData(ownerDocument);
    }
    var node;

    if (data.cache[nodeName]) {
        node = data.cache[nodeName].cloneNode();
    } else if (saveClones.test(nodeName)) {
        node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
    } else {
        node = data.createElem(nodeName);
    }

    // Avoid adding some elements to fragments in IE < 9 because
    // * Attributes like `name` or `type` cannot be set/changed once an element
    //   is inserted into a document/fragment
    // * Link elements with `src` attributes that are inaccessible, as with
    //   a 403 response, will cause the tab/window to crash
    // * Script elements appended to fragments will execute when their `src`
    //   or `text` property is set
    return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
  }

  /**
   * returns a shived DocumentFragment for the given document
   * @memberOf html5
   * @param {Document} ownerDocument The context document.
   * @returns {Object} The shived DocumentFragment.
   */
  function createDocumentFragment(ownerDocument, data){
    if (!ownerDocument) {
        ownerDocument = document;
    }
    if(supportsUnknownElements){
        return ownerDocument.createDocumentFragment();
    }
    data = data || getExpandoData(ownerDocument);
    var clone = data.frag.cloneNode(),
        i = 0,
        elems = getElements(),
        l = elems.length;
    for(;i<l;i++){
        clone.createElement(elems[i]);
    }
    return clone;
  }

  /**
   * Shivs the `createElement` and `createDocumentFragment` methods of the document.
   * @private
   * @param {Document|DocumentFragment} ownerDocument The document.
   * @param {Object} data of the document.
   */
  function shivMethods(ownerDocument, data) {
    if (!data.cache) {
        data.cache = {};
        data.createElem = ownerDocument.createElement;
        data.createFrag = ownerDocument.createDocumentFragment;
        data.frag = data.createFrag();
    }


    ownerDocument.createElement = function(nodeName) {
      //abort shiv
      if (!html5.shivMethods) {
          return data.createElem(nodeName);
      }
      return createElement(nodeName, ownerDocument, data);
    };

    ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
      'var n=f.cloneNode(),c=n.createElement;' +
      'h.shivMethods&&(' +
        // unroll the `createElement` calls
        getElements().join().replace(/[\w\-:]+/g, function(nodeName) {
          data.createElem(nodeName);
          data.frag.createElement(nodeName);
          return 'c("' + nodeName + '")';
        }) +
      ');return n}'
    )(html5, data.frag);
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Shivs the given document.
   * @memberOf html5
   * @param {Document} ownerDocument The document to shiv.
   * @returns {Document} The shived document.
   */
  function shivDocument(ownerDocument) {
    if (!ownerDocument) {
        ownerDocument = document;
    }
    var data = getExpandoData(ownerDocument);

    if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
      data.hasCSS = !!addStyleSheet(ownerDocument,
        // corrects block display not defined in IE6/7/8/9
        'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
        // adds styling not present in IE6/7/8/9
        'mark{background:#FF0;color:#000}' +
        // hides non-rendered elements
        'template{display:none}'
      );
    }
    if (!supportsUnknownElements) {
      shivMethods(ownerDocument, data);
    }
    return ownerDocument;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The `html5` object is exposed so that more elements can be shived and
   * existing shiving can be detected on iframes.
   * @type Object
   * @example
   *
   * // options can be changed before the script is included
   * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
   */
  var html5 = {

    /**
     * An array or space separated string of node names of the elements to shiv.
     * @memberOf html5
     * @type Array|String
     */
    'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video',

    /**
     * current version of html5shiv
     */
    'version': version,

    /**
     * A flag to indicate that the HTML5 style sheet should be inserted.
     * @memberOf html5
     * @type Boolean
     */
    'shivCSS': (options.shivCSS !== false),

    /**
     * Is equal to true if a browser supports creating unknown/HTML5 elements
     * @memberOf html5
     * @type boolean
     */
    'supportsUnknownElements': supportsUnknownElements,

    /**
     * A flag to indicate that the document's `createElement` and `createDocumentFragment`
     * methods should be overwritten.
     * @memberOf html5
     * @type Boolean
     */
    'shivMethods': (options.shivMethods !== false),

    /**
     * A string to describe the type of `html5` object ("default" or "default print").
     * @memberOf html5
     * @type String
     */
    'type': 'default',

    // shivs the document according to the specified `html5` object options
    'shivDocument': shivDocument,

    //creates a shived element
    createElement: createElement,

    //creates a shived documentFragment
    createDocumentFragment: createDocumentFragment,

    //extends list of elements
    addElements: addElements
  };

  /*--------------------------------------------------------------------------*/

  // expose html5
  window.html5 = html5;

  // shiv the document
  shivDocument(document);

  /*------------------------------- Print Shiv -------------------------------*/

  /** Used to filter media types */
  var reMedia = /^$|\b(?:all|print)\b/;

  /** Used to namespace printable elements */
  var shivNamespace = 'html5shiv';

  /** Detect whether the browser supports shivable style sheets */
  var supportsShivableSheets = !supportsUnknownElements && (function() {
    // assign a false negative if unable to shiv
    var docEl = document.documentElement;
    return !(
      typeof document.namespaces == 'undefined' ||
      typeof document.parentWindow == 'undefined' ||
      typeof docEl.applyElement == 'undefined' ||
      typeof docEl.removeNode == 'undefined' ||
      typeof window.attachEvent == 'undefined'
    );
  }());

  /*--------------------------------------------------------------------------*/

  /**
   * Wraps all HTML5 elements in the given document with printable elements.
   * (eg. the "header" element is wrapped with the "html5shiv:header" element)
   * @private
   * @param {Document} ownerDocument The document.
   * @returns {Array} An array wrappers added.
   */
  function addWrappers(ownerDocument) {
    var node,
        nodes = ownerDocument.getElementsByTagName('*'),
        index = nodes.length,
        reElements = RegExp('^(?:' + getElements().join('|') + ')$', 'i'),
        result = [];

    while (index--) {
      node = nodes[index];
      if (reElements.test(node.nodeName)) {
        result.push(node.applyElement(createWrapper(node)));
      }
    }
    return result;
  }

  /**
   * Creates a printable wrapper for the given element.
   * @private
   * @param {Element} element The element.
   * @returns {Element} The wrapper.
   */
  function createWrapper(element) {
    var node,
        nodes = element.attributes,
        index = nodes.length,
        wrapper = element.ownerDocument.createElement(shivNamespace + ':' + element.nodeName);

    // copy element attributes to the wrapper
    while (index--) {
      node = nodes[index];
      node.specified && wrapper.setAttribute(node.nodeName, node.nodeValue);
    }
    // copy element styles to the wrapper
    wrapper.style.cssText = element.style.cssText;
    return wrapper;
  }

  /**
   * Shivs the given CSS text.
   * (eg. header{} becomes html5shiv\:header{})
   * @private
   * @param {String} cssText The CSS text to shiv.
   * @returns {String} The shived CSS text.
   */
  function shivCssText(cssText) {
    var pair,
        parts = cssText.split('{'),
        index = parts.length,
        reElements = RegExp('(^|[\\s,>+~])(' + getElements().join('|') + ')(?=[[\\s,>+~#.:]|$)', 'gi'),
        replacement = '$1' + shivNamespace + '\\:$2';

    while (index--) {
      pair = parts[index] = parts[index].split('}');
      pair[pair.length - 1] = pair[pair.length - 1].replace(reElements, replacement);
      parts[index] = pair.join('}');
    }
    return parts.join('{');
  }

  /**
   * Removes the given wrappers, leaving the original elements.
   * @private
   * @params {Array} wrappers An array of printable wrappers.
   */
  function removeWrappers(wrappers) {
    var index = wrappers.length;
    while (index--) {
      wrappers[index].removeNode();
    }
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Shivs the given document for print.
   * @memberOf html5
   * @param {Document} ownerDocument The document to shiv.
   * @returns {Document} The shived document.
   */
  function shivPrint(ownerDocument) {
    var shivedSheet,
        wrappers,
        data = getExpandoData(ownerDocument),
        namespaces = ownerDocument.namespaces,
        ownerWindow = ownerDocument.parentWindow;

    if (!supportsShivableSheets || ownerDocument.printShived) {
      return ownerDocument;
    }
    if (typeof namespaces[shivNamespace] == 'undefined') {
      namespaces.add(shivNamespace);
    }

    function removeSheet() {
      clearTimeout(data._removeSheetTimer);
      if (shivedSheet) {
          shivedSheet.removeNode(true);
      }
      shivedSheet= null;
    }

    ownerWindow.attachEvent('onbeforeprint', function() {

      removeSheet();

      var imports,
          length,
          sheet,
          collection = ownerDocument.styleSheets,
          cssText = [],
          index = collection.length,
          sheets = Array(index);

      // convert styleSheets collection to an array
      while (index--) {
        sheets[index] = collection[index];
      }
      // concat all style sheet CSS text
      while ((sheet = sheets.pop())) {
        // IE does not enforce a same origin policy for external style sheets...
        // but has trouble with some dynamically created stylesheets
        if (!sheet.disabled && reMedia.test(sheet.media)) {

          try {
            imports = sheet.imports;
            length = imports.length;
          } catch(er){
            length = 0;
          }

          for (index = 0; index < length; index++) {
            sheets.push(imports[index]);
          }

          try {
            cssText.push(sheet.cssText);
          } catch(er){}
        }
      }

      // wrap all HTML5 elements with printable elements and add the shived style sheet
      cssText = shivCssText(cssText.reverse().join(''));
      wrappers = addWrappers(ownerDocument);
      shivedSheet = addStyleSheet(ownerDocument, cssText);

    });

    ownerWindow.attachEvent('onafterprint', function() {
      // remove wrappers, leaving the original elements, and remove the shived style sheet
      removeWrappers(wrappers);
      clearTimeout(data._removeSheetTimer);
      data._removeSheetTimer = setTimeout(removeSheet, 500);
    });

    ownerDocument.printShived = true;
    return ownerDocument;
  }

  /*--------------------------------------------------------------------------*/

  // expose API
  html5.type += ' print';
  html5.shivPrint = shivPrint;

  // shiv for print
  shivPrint(document);

}(this, document));

/**
* @preserve HTML5 Shiv 3.7.2 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
*/
!function(a,b){function c(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function d(){var a=y.elements;return"string"==typeof a?a.split(" "):a}function e(a,b){var c=y.elements;"string"!=typeof c&&(c=c.join(" ")),"string"!=typeof a&&(a=a.join(" ")),y.elements=c+" "+a,j(b)}function f(a){var b=x[a[v]];return b||(b={},w++,a[v]=w,x[w]=b),b}function g(a,c,d){if(c||(c=b),q)return c.createElement(a);d||(d=f(c));var e;return e=d.cache[a]?d.cache[a].cloneNode():u.test(a)?(d.cache[a]=d.createElem(a)).cloneNode():d.createElem(a),!e.canHaveChildren||t.test(a)||e.tagUrn?e:d.frag.appendChild(e)}function h(a,c){if(a||(a=b),q)return a.createDocumentFragment();c=c||f(a);for(var e=c.frag.cloneNode(),g=0,h=d(),i=h.length;i>g;g++)e.createElement(h[g]);return e}function i(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return y.shivMethods?g(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+d().join().replace(/[\w\-:]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(y,b.frag)}function j(a){a||(a=b);var d=f(a);return!y.shivCSS||p||d.hasCSS||(d.hasCSS=!!c(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),q||i(a,d),a}function k(a){for(var b,c=a.getElementsByTagName("*"),e=c.length,f=RegExp("^(?:"+d().join("|")+")$","i"),g=[];e--;)b=c[e],f.test(b.nodeName)&&g.push(b.applyElement(l(b)));return g}function l(a){for(var b,c=a.attributes,d=c.length,e=a.ownerDocument.createElement(A+":"+a.nodeName);d--;)b=c[d],b.specified&&e.setAttribute(b.nodeName,b.nodeValue);return e.style.cssText=a.style.cssText,e}function m(a){for(var b,c=a.split("{"),e=c.length,f=RegExp("(^|[\\s,>+~])("+d().join("|")+")(?=[[\\s,>+~#.:]|$)","gi"),g="$1"+A+"\\:$2";e--;)b=c[e]=c[e].split("}"),b[b.length-1]=b[b.length-1].replace(f,g),c[e]=b.join("}");return c.join("{")}function n(a){for(var b=a.length;b--;)a[b].removeNode()}function o(a){function b(){clearTimeout(g._removeSheetTimer),d&&d.removeNode(!0),d=null}var d,e,g=f(a),h=a.namespaces,i=a.parentWindow;return!B||a.printShived?a:("undefined"==typeof h[A]&&h.add(A),i.attachEvent("onbeforeprint",function(){b();for(var f,g,h,i=a.styleSheets,j=[],l=i.length,n=Array(l);l--;)n[l]=i[l];for(;h=n.pop();)if(!h.disabled&&z.test(h.media)){try{f=h.imports,g=f.length}catch(o){g=0}for(l=0;g>l;l++)n.push(f[l]);try{j.push(h.cssText)}catch(o){}}j=m(j.reverse().join("")),e=k(a),d=c(a,j)}),i.attachEvent("onafterprint",function(){n(e),clearTimeout(g._removeSheetTimer),g._removeSheetTimer=setTimeout(b,500)}),a.printShived=!0,a)}var p,q,r="3.7.2",s=a.html5||{},t=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,u=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,v="_html5shiv",w=0,x={};!function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",p="hidden"in a,q=1==a.childNodes.length||function(){b.createElement("a");var a=b.createDocumentFragment();return"undefined"==typeof a.cloneNode||"undefined"==typeof a.createDocumentFragment||"undefined"==typeof a.createElement}()}catch(c){p=!0,q=!0}}();var y={elements:s.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video",version:r,shivCSS:s.shivCSS!==!1,supportsUnknownElements:q,shivMethods:s.shivMethods!==!1,type:"default",shivDocument:j,createElement:g,createDocumentFragment:h,addElements:e};a.html5=y,j(b);var z=/^$|\b(?:all|print)\b/,A="html5shiv",B=!q&&function(){var c=b.documentElement;return!("undefined"==typeof b.namespaces||"undefined"==typeof b.parentWindow||"undefined"==typeof c.applyElement||"undefined"==typeof c.removeNode||"undefined"==typeof a.attachEvent)}();y.type+=" print",y.shivPrint=o,o(b)}(this,document);
/**
* @preserve HTML5 Shiv 3.7.2 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
*/
;(function(window, document) {
/*jshint evil:true */
  /** version */
  var version = '3.7.2';

  /** Preset options */
  var options = window.html5 || {};

  /** Used to skip problem elements */
  var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

  /** Not all elements can be cloned in IE **/
  var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

  /** Detect whether the browser supports default html5 styles */
  var supportsHtml5Styles;

  /** Name of the expando, to work with multiple documents or to re-shiv one document */
  var expando = '_html5shiv';

  /** The id for the the documents expando */
  var expanID = 0;

  /** Cached data for each document */
  var expandoData = {};

  /** Detect whether the browser supports unknown elements */
  var supportsUnknownElements;

  (function() {
    try {
        var a = document.createElement('a');
        a.innerHTML = '<xyz></xyz>';
        //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
        supportsHtml5Styles = ('hidden' in a);

        supportsUnknownElements = a.childNodes.length == 1 || (function() {
          // assign a false positive if unable to shiv
          (document.createElement)('a');
          var frag = document.createDocumentFragment();
          return (
            typeof frag.cloneNode == 'undefined' ||
            typeof frag.createDocumentFragment == 'undefined' ||
            typeof frag.createElement == 'undefined'
          );
        }());
    } catch(e) {
      // assign a false positive if detection fails => unable to shiv
      supportsHtml5Styles = true;
      supportsUnknownElements = true;
    }

  }());

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a style sheet with the given CSS text and adds it to the document.
   * @private
   * @param {Document} ownerDocument The document.
   * @param {String} cssText The CSS text.
   * @returns {StyleSheet} The style element.
   */
  function addStyleSheet(ownerDocument, cssText) {
    var p = ownerDocument.createElement('p'),
        parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

    p.innerHTML = 'x<style>' + cssText + '</style>';
    return parent.insertBefore(p.lastChild, parent.firstChild);
  }

  /**
   * Returns the value of `html5.elements` as an array.
   * @private
   * @returns {Array} An array of shived element node names.
   */
  function getElements() {
    var elements = html5.elements;
    return typeof elements == 'string' ? elements.split(' ') : elements;
  }

  /**
   * Extends the built-in list of html5 elements
   * @memberOf html5
   * @param {String|Array} newElements whitespace separated list or array of new element names to shiv
   * @param {Document} ownerDocument The context document.
   */
  function addElements(newElements, ownerDocument) {
    var elements = html5.elements;
    if(typeof elements != 'string'){
      elements = elements.join(' ');
    }
    if(typeof newElements != 'string'){
      newElements = newElements.join(' ');
    }
    html5.elements = elements +' '+ newElements;
    shivDocument(ownerDocument);
  }

   /**
   * Returns the data associated to the given document
   * @private
   * @param {Document} ownerDocument The document.
   * @returns {Object} An object of data.
   */
  function getExpandoData(ownerDocument) {
    var data = expandoData[ownerDocument[expando]];
    if (!data) {
        data = {};
        expanID++;
        ownerDocument[expando] = expanID;
        expandoData[expanID] = data;
    }
    return data;
  }

  /**
   * returns a shived element for the given nodeName and document
   * @memberOf html5
   * @param {String} nodeName name of the element
   * @param {Document} ownerDocument The context document.
   * @returns {Object} The shived element.
   */
  function createElement(nodeName, ownerDocument, data){
    if (!ownerDocument) {
        ownerDocument = document;
    }
    if(supportsUnknownElements){
        return ownerDocument.createElement(nodeName);
    }
    if (!data) {
        data = getExpandoData(ownerDocument);
    }
    var node;

    if (data.cache[nodeName]) {
        node = data.cache[nodeName].cloneNode();
    } else if (saveClones.test(nodeName)) {
        node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
    } else {
        node = data.createElem(nodeName);
    }

    // Avoid adding some elements to fragments in IE < 9 because
    // * Attributes like `name` or `type` cannot be set/changed once an element
    //   is inserted into a document/fragment
    // * Link elements with `src` attributes that are inaccessible, as with
    //   a 403 response, will cause the tab/window to crash
    // * Script elements appended to fragments will execute when their `src`
    //   or `text` property is set
    return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
  }

  /**
   * returns a shived DocumentFragment for the given document
   * @memberOf html5
   * @param {Document} ownerDocument The context document.
   * @returns {Object} The shived DocumentFragment.
   */
  function createDocumentFragment(ownerDocument, data){
    if (!ownerDocument) {
        ownerDocument = document;
    }
    if(supportsUnknownElements){
        return ownerDocument.createDocumentFragment();
    }
    data = data || getExpandoData(ownerDocument);
    var clone = data.frag.cloneNode(),
        i = 0,
        elems = getElements(),
        l = elems.length;
    for(;i<l;i++){
        clone.createElement(elems[i]);
    }
    return clone;
  }

  /**
   * Shivs the `createElement` and `createDocumentFragment` methods of the document.
   * @private
   * @param {Document|DocumentFragment} ownerDocument The document.
   * @param {Object} data of the document.
   */
  function shivMethods(ownerDocument, data) {
    if (!data.cache) {
        data.cache = {};
        data.createElem = ownerDocument.createElement;
        data.createFrag = ownerDocument.createDocumentFragment;
        data.frag = data.createFrag();
    }


    ownerDocument.createElement = function(nodeName) {
      //abort shiv
      if (!html5.shivMethods) {
          return data.createElem(nodeName);
      }
      return createElement(nodeName, ownerDocument, data);
    };

    ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
      'var n=f.cloneNode(),c=n.createElement;' +
      'h.shivMethods&&(' +
        // unroll the `createElement` calls
        getElements().join().replace(/[\w\-:]+/g, function(nodeName) {
          data.createElem(nodeName);
          data.frag.createElement(nodeName);
          return 'c("' + nodeName + '")';
        }) +
      ');return n}'
    )(html5, data.frag);
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Shivs the given document.
   * @memberOf html5
   * @param {Document} ownerDocument The document to shiv.
   * @returns {Document} The shived document.
   */
  function shivDocument(ownerDocument) {
    if (!ownerDocument) {
        ownerDocument = document;
    }
    var data = getExpandoData(ownerDocument);

    if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
      data.hasCSS = !!addStyleSheet(ownerDocument,
        // corrects block display not defined in IE6/7/8/9
        'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
        // adds styling not present in IE6/7/8/9
        'mark{background:#FF0;color:#000}' +
        // hides non-rendered elements
        'template{display:none}'
      );
    }
    if (!supportsUnknownElements) {
      shivMethods(ownerDocument, data);
    }
    return ownerDocument;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The `html5` object is exposed so that more elements can be shived and
   * existing shiving can be detected on iframes.
   * @type Object
   * @example
   *
   * // options can be changed before the script is included
   * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
   */
  var html5 = {

    /**
     * An array or space separated string of node names of the elements to shiv.
     * @memberOf html5
     * @type Array|String
     */
    'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video',

    /**
     * current version of html5shiv
     */
    'version': version,

    /**
     * A flag to indicate that the HTML5 style sheet should be inserted.
     * @memberOf html5
     * @type Boolean
     */
    'shivCSS': (options.shivCSS !== false),

    /**
     * Is equal to true if a browser supports creating unknown/HTML5 elements
     * @memberOf html5
     * @type boolean
     */
    'supportsUnknownElements': supportsUnknownElements,

    /**
     * A flag to indicate that the document's `createElement` and `createDocumentFragment`
     * methods should be overwritten.
     * @memberOf html5
     * @type Boolean
     */
    'shivMethods': (options.shivMethods !== false),

    /**
     * A string to describe the type of `html5` object ("default" or "default print").
     * @memberOf html5
     * @type String
     */
    'type': 'default',

    // shivs the document according to the specified `html5` object options
    'shivDocument': shivDocument,

    //creates a shived element
    createElement: createElement,

    //creates a shived documentFragment
    createDocumentFragment: createDocumentFragment,

    //extends list of elements
    addElements: addElements
  };

  /*--------------------------------------------------------------------------*/

  // expose html5
  window.html5 = html5;

  // shiv the document
  shivDocument(document);

}(this, document));

/**
* @preserve HTML5 Shiv 3.7.2 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
*/
!function(a,b){function c(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function d(){var a=t.elements;return"string"==typeof a?a.split(" "):a}function e(a,b){var c=t.elements;"string"!=typeof c&&(c=c.join(" ")),"string"!=typeof a&&(a=a.join(" ")),t.elements=c+" "+a,j(b)}function f(a){var b=s[a[q]];return b||(b={},r++,a[q]=r,s[r]=b),b}function g(a,c,d){if(c||(c=b),l)return c.createElement(a);d||(d=f(c));var e;return e=d.cache[a]?d.cache[a].cloneNode():p.test(a)?(d.cache[a]=d.createElem(a)).cloneNode():d.createElem(a),!e.canHaveChildren||o.test(a)||e.tagUrn?e:d.frag.appendChild(e)}function h(a,c){if(a||(a=b),l)return a.createDocumentFragment();c=c||f(a);for(var e=c.frag.cloneNode(),g=0,h=d(),i=h.length;i>g;g++)e.createElement(h[g]);return e}function i(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return t.shivMethods?g(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+d().join().replace(/[\w\-:]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(t,b.frag)}function j(a){a||(a=b);var d=f(a);return!t.shivCSS||k||d.hasCSS||(d.hasCSS=!!c(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),l||i(a,d),a}var k,l,m="3.7.2",n=a.html5||{},o=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,p=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,q="_html5shiv",r=0,s={};!function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",k="hidden"in a,l=1==a.childNodes.length||function(){b.createElement("a");var a=b.createDocumentFragment();return"undefined"==typeof a.cloneNode||"undefined"==typeof a.createDocumentFragment||"undefined"==typeof a.createElement}()}catch(c){k=!0,l=!0}}();var t={elements:n.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video",version:m,shivCSS:n.shivCSS!==!1,supportsUnknownElements:l,shivMethods:n.shivMethods!==!1,type:"default",shivDocument:j,createElement:g,createDocumentFragment:h,addElements:e};a.html5=t,j(b)}(this,document);
/*! responsive-nav.js 1.0.34
 * https://github.com/viljamis/responsive-nav.js
 * http://responsive-nav.com
 *
 * Copyright (c) 2014 @viljamis
 * Available under the MIT license
 */

(function (document, window, index) {
  // Index is used to keep multiple navs on the same page namespaced

  "use strict";

  var responsiveNav = function (el, options) {

    var computed = !!window.getComputedStyle;
    
    /**
     * getComputedStyle polyfill for old browsers
     */
    if (!computed) {
      window.getComputedStyle = function(el) {
        this.el = el;
        this.getPropertyValue = function(prop) {
          var re = /(\-([a-z]){1})/g;
          if (prop === "float") {
            prop = "styleFloat";
          }
          if (re.test(prop)) {
            prop = prop.replace(re, function () {
              return arguments[2].toUpperCase();
            });
          }
          return el.currentStyle[prop] ? el.currentStyle[prop] : null;
        };
        return this;
      };
    }
    /* exported addEvent, removeEvent, getChildren, setAttributes, addClass, removeClass, forEach */
    
    /**
     * Add Event
     * fn arg can be an object or a function, thanks to handleEvent
     * read more at: http://www.thecssninja.com/javascript/handleevent
     *
     * @param  {element}  element
     * @param  {event}    event
     * @param  {Function} fn
     * @param  {boolean}  bubbling
     */
    var addEvent = function (el, evt, fn, bubble) {
        if ("addEventListener" in el) {
          // BBOS6 doesn't support handleEvent, catch and polyfill
          try {
            el.addEventListener(evt, fn, bubble);
          } catch (e) {
            if (typeof fn === "object" && fn.handleEvent) {
              el.addEventListener(evt, function (e) {
                // Bind fn as this and set first arg as event object
                fn.handleEvent.call(fn, e);
              }, bubble);
            } else {
              throw e;
            }
          }
        } else if ("attachEvent" in el) {
          // check if the callback is an object and contains handleEvent
          if (typeof fn === "object" && fn.handleEvent) {
            el.attachEvent("on" + evt, function () {
              // Bind fn as this
              fn.handleEvent.call(fn);
            });
          } else {
            el.attachEvent("on" + evt, fn);
          }
        }
      },
    
      /**
       * Remove Event
       *
       * @param  {element}  element
       * @param  {event}    event
       * @param  {Function} fn
       * @param  {boolean}  bubbling
       */
      removeEvent = function (el, evt, fn, bubble) {
        if ("removeEventListener" in el) {
          try {
            el.removeEventListener(evt, fn, bubble);
          } catch (e) {
            if (typeof fn === "object" && fn.handleEvent) {
              el.removeEventListener(evt, function (e) {
                fn.handleEvent.call(fn, e);
              }, bubble);
            } else {
              throw e;
            }
          }
        } else if ("detachEvent" in el) {
          if (typeof fn === "object" && fn.handleEvent) {
            el.detachEvent("on" + evt, function () {
              fn.handleEvent.call(fn);
            });
          } else {
            el.detachEvent("on" + evt, fn);
          }
        }
      },
    
      /**
       * Get the children of any element
       *
       * @param  {element}
       * @return {array} Returns matching elements in an array
       */
      getChildren = function (e) {
        if (e.children.length < 1) {
          throw new Error("The Nav container has no containing elements");
        }
        // Store all children in array
        var children = [];
        // Loop through children and store in array if child != TextNode
        for (var i = 0; i < e.children.length; i++) {
          if (e.children[i].nodeType === 1) {
            children.push(e.children[i]);
          }
        }
        return children;
      },
    
      /**
       * Sets multiple attributes at once
       *
       * @param {element} element
       * @param {attrs}   attrs
       */
      setAttributes = function (el, attrs) {
        for (var key in attrs) {
          el.setAttribute(key, attrs[key]);
        }
      },
    
      /**
       * Adds a class to any element
       *
       * @param {element} element
       * @param {string}  class
       */
      addClass = function (el, cls) {
        if (el.className.indexOf(cls) !== 0) {
          el.className += " " + cls;
          el.className = el.className.replace(/(^\s*)|(\s*$)/g,"");
        }
      },
    
      /**
       * Remove a class from any element
       *
       * @param  {element} element
       * @param  {string}  class
       */
      removeClass = function (el, cls) {
        var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
        el.className = el.className.replace(reg, " ").replace(/(^\s*)|(\s*$)/g,"");
      },
    
      /**
       * forEach method that passes back the stuff we need
       *
       * @param  {array}    array
       * @param  {Function} callback
       * @param  {scope}    scope
       */
      forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
          callback.call(scope, i, array[i]);
        }
      };

    var nav,
      opts,
      navToggle,
      styleElement = document.createElement("style"),
      htmlEl = document.documentElement,
      hasAnimFinished,
      isMobile,
      navOpen;

    var ResponsiveNav = function (el, options) {
        var i;

        /**
         * Default options
         * @type {Object}
         */
        this.options = {
          animate: true,                    // Boolean: Use CSS3 transitions, true or false
          transition: 284,                  // Integer: Speed of the transition, in milliseconds
          label: "Menu",                    // String: Label for the navigation toggle
          insert: "before",                 // String: Insert the toggle before or after the navigation
          customToggle: "",                 // Selector: Specify the ID of a custom toggle
          closeOnNavClick: false,           // Boolean: Close the navigation when one of the links are clicked
          openPos: "relative",              // String: Position of the opened nav, relative or static
          navClass: "nav-collapse",         // String: Default CSS class. If changed, you need to edit the CSS too!
          navActiveClass: "js-nav-active",  // String: Class that is added to <html> element when nav is active
          jsClass: "js",                    // String: 'JS enabled' class which is added to <html> element
          init: function(){},               // Function: Init callback
          open: function(){},               // Function: Open callback
          close: function(){}               // Function: Close callback
        };

        // User defined options
        for (i in options) {
          this.options[i] = options[i];
        }

        // Adds "js" class for <html>
        addClass(htmlEl, this.options.jsClass);

        // Wrapper
        this.wrapperEl = el.replace("#", "");

        // Try selecting ID first
        if (document.getElementById(this.wrapperEl)) {
          this.wrapper = document.getElementById(this.wrapperEl);

        // If element with an ID doesn't exist, use querySelector
        } else if (document.querySelector(this.wrapperEl)) {
          this.wrapper = document.querySelector(this.wrapperEl);

        // If element doesn't exists, stop here.
        } else {
          throw new Error("The nav element you are trying to select doesn't exist");
        }

        // Inner wrapper
        this.wrapper.inner = getChildren(this.wrapper);

        // For minification
        opts = this.options;
        nav = this.wrapper;

        // Init
        this._init(this);
      };

    ResponsiveNav.prototype = {

      /**
       * Unattaches events and removes any classes that were added
       */
      destroy: function () {
        this._removeStyles();
        removeClass(nav, "closed");
        removeClass(nav, "opened");
        removeClass(nav, opts.navClass);
        removeClass(nav, opts.navClass + "-" + this.index);
        removeClass(htmlEl, opts.navActiveClass);
        nav.removeAttribute("style");
        nav.removeAttribute("aria-hidden");

        removeEvent(window, "resize", this, false);
        removeEvent(window, "focus", this, false);
        removeEvent(document.body, "touchmove", this, false);
        removeEvent(navToggle, "touchstart", this, false);
        removeEvent(navToggle, "touchend", this, false);
        removeEvent(navToggle, "mouseup", this, false);
        removeEvent(navToggle, "keyup", this, false);
        removeEvent(navToggle, "click", this, false);

        if (!opts.customToggle) {
          navToggle.parentNode.removeChild(navToggle);
        } else {
          navToggle.removeAttribute("aria-hidden");
        }
      },

      /**
       * Toggles the navigation open/close
       */
      toggle: function () {
        if (hasAnimFinished === true) {
          if (!navOpen) {
            this.open();
          } else {
            this.close();
          }

          // Enable pointer events again
          this._enablePointerEvents();
        }
      },

      /**
       * Opens the navigation
       */
      open: function () {
        if (!navOpen) {
          removeClass(nav, "closed");
          addClass(nav, "opened");
          addClass(htmlEl, opts.navActiveClass);
          addClass(navToggle, "active");
          nav.style.position = opts.openPos;
          setAttributes(nav, {"aria-hidden": "false"});
          navOpen = true;
          opts.open();
        }
      },

      /**
       * Closes the navigation
       */
      close: function () {
        if (navOpen) {
          addClass(nav, "closed");
          removeClass(nav, "opened");
          removeClass(htmlEl, opts.navActiveClass);
          removeClass(navToggle, "active");
          setAttributes(nav, {"aria-hidden": "true"});

          // If animations are enabled, wait until they finish
          if (opts.animate) {
            hasAnimFinished = false;
            setTimeout(function () {
              nav.style.position = "absolute";
              hasAnimFinished = true;
            }, opts.transition + 10);

          // Animations aren't enabled, we can do these immediately
          } else {
            nav.style.position = "absolute";
          }

          navOpen = false;
          opts.close();
        }
      },

      /**
       * Resize is called on window resize and orientation change.
       * It initializes the CSS styles and height calculations.
       */
      resize: function () {

        // Resize watches navigation toggle's display state
        if (window.getComputedStyle(navToggle, null).getPropertyValue("display") !== "none") {

          isMobile = true;
          setAttributes(navToggle, {"aria-hidden": "false"});

          // If the navigation is hidden
          if (nav.className.match(/(^|\s)closed(\s|$)/)) {
            setAttributes(nav, {"aria-hidden": "true"});
            nav.style.position = "absolute";
          }

          this._createStyles();
          this._calcHeight();
        } else {

          isMobile = false;
          setAttributes(navToggle, {"aria-hidden": "true"});
          setAttributes(nav, {"aria-hidden": "false"});
          nav.style.position = opts.openPos;
          this._removeStyles();
        }
      },

      /**
       * Takes care of all even handling
       *
       * @param  {event} event
       * @return {type} returns the type of event that should be used
       */
      handleEvent: function (e) {
        var evt = e || window.event;

        switch (evt.type) {
        case "touchstart":
          this._onTouchStart(evt);
          break;
        case "touchmove":
          this._onTouchMove(evt);
          break;
        case "touchend":
        case "mouseup":
          this._onTouchEnd(evt);
          break;
        case "click":
          this._preventDefault(evt);
          break;
        case "keyup":
          this._onKeyUp(evt);
          break;
        case "focus":
        case "resize":
          this.resize(evt);
          break;
        }
      },

      /**
       * Initializes the widget
       */
      _init: function () {
        this.index = index++;

        addClass(nav, opts.navClass);
        addClass(nav, opts.navClass + "-" + this.index);
        addClass(nav, "closed");
        hasAnimFinished = true;
        navOpen = false;

        this._closeOnNavClick();
        this._createToggle();
        this._transitions();
        this.resize();

        /**
         * On IE8 the resize event triggers too early for some reason
         * so it's called here again on init to make sure all the
         * calculated styles are correct.
         */
        var self = this;
        setTimeout(function () {
          self.resize();
        }, 20);

        addEvent(window, "resize", this, false);
        addEvent(window, "focus", this, false);
        addEvent(document.body, "touchmove", this, false);
        addEvent(navToggle, "touchstart", this, false);
        addEvent(navToggle, "touchend", this, false);
        addEvent(navToggle, "mouseup", this, false);
        addEvent(navToggle, "keyup", this, false);
        addEvent(navToggle, "click", this, false);

        /**
         * Init callback here
         */
        opts.init();
      },

      /**
       * Creates Styles to the <head>
       */
      _createStyles: function () {
        if (!styleElement.parentNode) {
          styleElement.type = "text/css";
          document.getElementsByTagName("head")[0].appendChild(styleElement);
        }
      },

      /**
       * Removes styles from the <head>
       */
      _removeStyles: function () {
        if (styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      },

      /**
       * Creates Navigation Toggle
       */
      _createToggle: function () {

        // If there's no toggle, let's create one
        if (!opts.customToggle) {
          var toggle = document.createElement("a");
          toggle.innerHTML = opts.label;
          setAttributes(toggle, {
            "href": "#",
            "class": "nav-toggle"
          });

          // Determine where to insert the toggle
          if (opts.insert === "after") {
            nav.parentNode.insertBefore(toggle, nav.nextSibling);
          } else {
            nav.parentNode.insertBefore(toggle, nav);
          }

          navToggle = toggle;

        // There is a toggle already, let's use that one
        } else {
          var toggleEl = opts.customToggle.replace("#", "");

          if (document.getElementById(toggleEl)) {
            navToggle = document.getElementById(toggleEl);
          } else if (document.querySelector(toggleEl)) {
            navToggle = document.querySelector(toggleEl);
          } else {
            throw new Error("The custom nav toggle you are trying to select doesn't exist");
          }
        }
      },

      /**
       * Closes the navigation when a link inside is clicked
       */
      _closeOnNavClick: function () {
        if (opts.closeOnNavClick) {
          var links = nav.getElementsByTagName("a"),
            self = this;
          forEach(links, function (i, el) {
            addEvent(links[i], "click", function () {
              if (isMobile) {
                self.toggle();
              }
            }, false);
          });
        }
      },

      /**
       * Prevents the default tap functionality
       *
       * @param  {event} event
       */
      _preventDefault: function(e) {
        if (e.preventDefault) {
          if (e.stopImmediatePropagation) {
            e.stopImmediatePropagation();
          }
          e.preventDefault();
          e.stopPropagation();
          return false;

        // This is strictly for old IE
        } else {
          e.returnValue = false;
        }
      },

      /**
       * On touch start get the location of the touch
       * and disable pointer events on the body.
       *
       * @param  {event} event
       */
      _onTouchStart: function (e) {
        this._preventDefault(e);
        addClass(document.body, "disable-pointer-events");
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.touchHasMoved = false;

        /**
         * We remove mouseup event completely here to avoid
         * double triggering of events.
         */
        removeEvent(navToggle, "mouseup", this, false);
      },

      /**
       * Check if the user is scrolling instead of tapping and
       * re-enable pointer events if movement happed.
       *
       * @param  {event} event
       */
      _onTouchMove: function (e) {
        if (Math.abs(e.touches[0].clientX - this.startX) > 10 ||
        Math.abs(e.touches[0].clientY - this.startY) > 10) {
          this._enablePointerEvents();
          this.touchHasMoved = true;
        }
      },

      /**
       * On touch end toggle either the whole navigation or
       * a sub-navigation depending on which one was tapped.
       *
       * @param  {event} event
       */
      _onTouchEnd: function (e) {
        this._preventDefault(e);
        if (!isMobile) {
          return;
        }

        // If the user isn't scrolling
        if (!this.touchHasMoved) {

          // If the event type is touch
          if (e.type === "touchend") {
            this.toggle();
            if (opts.insert === "after") {
              setTimeout(function () {
                removeClass(document.body, "disable-pointer-events");
              }, opts.transition + 300);
            }
            return;

          // Event type was click, not touch
          } else {
            var evt = e || window.event;

            // If it isn't a right click, do toggling
            if (!(evt.which === 3 || evt.button === 2)) {
              this.toggle();
            }
          }
        }
      },

      /**
       * For keyboard accessibility, toggle the navigation on Enter
       * keypress too (also sub-navigation is keyboard accessible
       * which explains the complexity here)
       *
       * @param  {event} event
       */
      _onKeyUp: function (e) {
        var evt = e || window.event;
        if (evt.keyCode === 13) {
          this.toggle();
        }
      },

      /**
       * Enable pointer events
       */
      _enablePointerEvents: function () {
        removeClass(document.body, "disable-pointer-events");
      },

      /**
       * Adds the needed CSS transitions if animations are enabled
       */
      _transitions: function () {
        if (opts.animate) {
          var objStyle = nav.style,
            transition = "max-height " + opts.transition + "ms";

          objStyle.WebkitTransition = transition;
          objStyle.MozTransition = transition;
          objStyle.OTransition = transition;
          objStyle.transition = transition;
        }
      },

      /**
       * Calculates the height of the navigation and then creates
       * styles which are later added to the page <head>
       */
      _calcHeight: function () {
        var savedHeight = 0;
        for (var i = 0; i < nav.inner.length; i++) {
          savedHeight += nav.inner[i].offsetHeight;
        }

        // Pointer event styles are also here since they might only be confusing inside the stylesheet
        var innerStyles = "." + opts.jsClass + " ." + opts.navClass + "-" + this.index + ".opened{max-height:" + savedHeight + "px !important} ." + opts.jsClass + " .disable-pointer-events{pointer-events:none !important} ." + opts.jsClass + " ." + opts.navClass + "-" + this.index + ".opened.dropdown-active {max-height:9999px !important}";


        if (styleElement.styleSheet) {
          styleElement.styleSheet.cssText = innerStyles;
        } else {
          styleElement.innerHTML = innerStyles;
        }

        innerStyles = "";
      }

    };

    /**
     * Return new Responsive Nav
     */
    return new ResponsiveNav(el, options);

  };

  window.responsiveNav = responsiveNav;

}(document, window, 0));
!function(a,b,c){"use strict";var d=function(d,e){var f=!!b.getComputedStyle;f||(b.getComputedStyle=function(a){return this.el=a,this.getPropertyValue=function(b){var c=/(\-([a-z]){1})/g;return"float"===b&&(b="styleFloat"),c.test(b)&&(b=b.replace(c,function(){return arguments[2].toUpperCase()})),a.currentStyle[b]?a.currentStyle[b]:null},this});var g,h,i,j,k,l,m=function(a,b,c,d){if("addEventListener"in a)try{a.addEventListener(b,c,d)}catch(e){if("object"!=typeof c||!c.handleEvent)throw e;a.addEventListener(b,function(a){c.handleEvent.call(c,a)},d)}else"attachEvent"in a&&("object"==typeof c&&c.handleEvent?a.attachEvent("on"+b,function(){c.handleEvent.call(c)}):a.attachEvent("on"+b,c))},n=function(a,b,c,d){if("removeEventListener"in a)try{a.removeEventListener(b,c,d)}catch(e){if("object"!=typeof c||!c.handleEvent)throw e;a.removeEventListener(b,function(a){c.handleEvent.call(c,a)},d)}else"detachEvent"in a&&("object"==typeof c&&c.handleEvent?a.detachEvent("on"+b,function(){c.handleEvent.call(c)}):a.detachEvent("on"+b,c))},o=function(a){if(a.children.length<1)throw new Error("The Nav container has no containing elements");for(var b=[],c=0;c<a.children.length;c++)1===a.children[c].nodeType&&b.push(a.children[c]);return b},p=function(a,b){for(var c in b)a.setAttribute(c,b[c])},q=function(a,b){0!==a.className.indexOf(b)&&(a.className+=" "+b,a.className=a.className.replace(/(^\s*)|(\s*$)/g,""))},r=function(a,b){var c=new RegExp("(\\s|^)"+b+"(\\s|$)");a.className=a.className.replace(c," ").replace(/(^\s*)|(\s*$)/g,"")},s=function(a,b,c){for(var d=0;d<a.length;d++)b.call(c,d,a[d])},t=a.createElement("style"),u=a.documentElement,v=function(b,c){var d;this.options={animate:!0,transition:284,label:"Menu",insert:"before",customToggle:"",closeOnNavClick:!1,openPos:"relative",navClass:"nav-collapse",navActiveClass:"js-nav-active",jsClass:"js",init:function(){},open:function(){},close:function(){}};for(d in c)this.options[d]=c[d];if(q(u,this.options.jsClass),this.wrapperEl=b.replace("#",""),a.getElementById(this.wrapperEl))this.wrapper=a.getElementById(this.wrapperEl);else{if(!a.querySelector(this.wrapperEl))throw new Error("The nav element you are trying to select doesn't exist");this.wrapper=a.querySelector(this.wrapperEl)}this.wrapper.inner=o(this.wrapper),h=this.options,g=this.wrapper,this._init(this)};return v.prototype={destroy:function(){this._removeStyles(),r(g,"closed"),r(g,"opened"),r(g,h.navClass),r(g,h.navClass+"-"+this.index),r(u,h.navActiveClass),g.removeAttribute("style"),g.removeAttribute("aria-hidden"),n(b,"resize",this,!1),n(b,"focus",this,!1),n(a.body,"touchmove",this,!1),n(i,"touchstart",this,!1),n(i,"touchend",this,!1),n(i,"mouseup",this,!1),n(i,"keyup",this,!1),n(i,"click",this,!1),h.customToggle?i.removeAttribute("aria-hidden"):i.parentNode.removeChild(i)},toggle:function(){j===!0&&(l?this.close():this.open(),this._enablePointerEvents())},open:function(){l||(r(g,"closed"),q(g,"opened"),q(u,h.navActiveClass),q(i,"active"),g.style.position=h.openPos,p(g,{"aria-hidden":"false"}),l=!0,h.open())},close:function(){l&&(q(g,"closed"),r(g,"opened"),r(u,h.navActiveClass),r(i,"active"),p(g,{"aria-hidden":"true"}),h.animate?(j=!1,setTimeout(function(){g.style.position="absolute",j=!0},h.transition+10)):g.style.position="absolute",l=!1,h.close())},resize:function(){"none"!==b.getComputedStyle(i,null).getPropertyValue("display")?(k=!0,p(i,{"aria-hidden":"false"}),g.className.match(/(^|\s)closed(\s|$)/)&&(p(g,{"aria-hidden":"true"}),g.style.position="absolute"),this._createStyles(),this._calcHeight()):(k=!1,p(i,{"aria-hidden":"true"}),p(g,{"aria-hidden":"false"}),g.style.position=h.openPos,this._removeStyles())},handleEvent:function(a){var c=a||b.event;switch(c.type){case"touchstart":this._onTouchStart(c);break;case"touchmove":this._onTouchMove(c);break;case"touchend":case"mouseup":this._onTouchEnd(c);break;case"click":this._preventDefault(c);break;case"keyup":this._onKeyUp(c);break;case"focus":case"resize":this.resize(c)}},_init:function(){this.index=c++,q(g,h.navClass),q(g,h.navClass+"-"+this.index),q(g,"closed"),j=!0,l=!1,this._closeOnNavClick(),this._createToggle(),this._transitions(),this.resize();var d=this;setTimeout(function(){d.resize()},20),m(b,"resize",this,!1),m(b,"focus",this,!1),m(a.body,"touchmove",this,!1),m(i,"touchstart",this,!1),m(i,"touchend",this,!1),m(i,"mouseup",this,!1),m(i,"keyup",this,!1),m(i,"click",this,!1),h.init()},_createStyles:function(){t.parentNode||(t.type="text/css",a.getElementsByTagName("head")[0].appendChild(t))},_removeStyles:function(){t.parentNode&&t.parentNode.removeChild(t)},_createToggle:function(){if(h.customToggle){var b=h.customToggle.replace("#","");if(a.getElementById(b))i=a.getElementById(b);else{if(!a.querySelector(b))throw new Error("The custom nav toggle you are trying to select doesn't exist");i=a.querySelector(b)}}else{var c=a.createElement("a");c.innerHTML=h.label,p(c,{href:"#","class":"nav-toggle"}),"after"===h.insert?g.parentNode.insertBefore(c,g.nextSibling):g.parentNode.insertBefore(c,g),i=c}},_closeOnNavClick:function(){if(h.closeOnNavClick){var a=g.getElementsByTagName("a"),b=this;s(a,function(c){m(a[c],"click",function(){k&&b.toggle()},!1)})}},_preventDefault:function(a){return a.preventDefault?(a.stopImmediatePropagation&&a.stopImmediatePropagation(),a.preventDefault(),a.stopPropagation(),!1):void(a.returnValue=!1)},_onTouchStart:function(b){this._preventDefault(b),q(a.body,"disable-pointer-events"),this.startX=b.touches[0].clientX,this.startY=b.touches[0].clientY,this.touchHasMoved=!1,n(i,"mouseup",this,!1)},_onTouchMove:function(a){(Math.abs(a.touches[0].clientX-this.startX)>10||Math.abs(a.touches[0].clientY-this.startY)>10)&&(this._enablePointerEvents(),this.touchHasMoved=!0)},_onTouchEnd:function(c){if(this._preventDefault(c),k&&!this.touchHasMoved){if("touchend"===c.type)return this.toggle(),void("after"===h.insert&&setTimeout(function(){r(a.body,"disable-pointer-events")},h.transition+300));var d=c||b.event;3!==d.which&&2!==d.button&&this.toggle()}},_onKeyUp:function(a){var c=a||b.event;13===c.keyCode&&this.toggle()},_enablePointerEvents:function(){r(a.body,"disable-pointer-events")},_transitions:function(){if(h.animate){var a=g.style,b="max-height "+h.transition+"ms";a.WebkitTransition=b,a.MozTransition=b,a.OTransition=b,a.transition=b}},_calcHeight:function(){for(var a=0,b=0;b<g.inner.length;b++)a+=g.inner[b].offsetHeight;var c="."+h.jsClass+" ."+h.navClass+"-"+this.index+".opened{max-height:"+a+"px !important} ."+h.jsClass+" .disable-pointer-events{pointer-events:none !important} ."+h.jsClass+" ."+h.navClass+"-"+this.index+".opened.dropdown-active {max-height:9999px !important}";t.styleSheet?t.styleSheet.cssText=c:t.innerHTML=c,c=""}},new v(d,e)};b.responsiveNav=d}(document,window,0);
/* exported addEvent, removeEvent, getChildren, setAttributes, addClass, removeClass, forEach */

/**
 * Add Event
 * fn arg can be an object or a function, thanks to handleEvent
 * read more at: http://www.thecssninja.com/javascript/handleevent
 *
 * @param  {element}  element
 * @param  {event}    event
 * @param  {Function} fn
 * @param  {boolean}  bubbling
 */
var addEvent = function (el, evt, fn, bubble) {
    if ("addEventListener" in el) {
      // BBOS6 doesn't support handleEvent, catch and polyfill
      try {
        el.addEventListener(evt, fn, bubble);
      } catch (e) {
        if (typeof fn === "object" && fn.handleEvent) {
          el.addEventListener(evt, function (e) {
            // Bind fn as this and set first arg as event object
            fn.handleEvent.call(fn, e);
          }, bubble);
        } else {
          throw e;
        }
      }
    } else if ("attachEvent" in el) {
      // check if the callback is an object and contains handleEvent
      if (typeof fn === "object" && fn.handleEvent) {
        el.attachEvent("on" + evt, function () {
          // Bind fn as this
          fn.handleEvent.call(fn);
        });
      } else {
        el.attachEvent("on" + evt, fn);
      }
    }
  },

  /**
   * Remove Event
   *
   * @param  {element}  element
   * @param  {event}    event
   * @param  {Function} fn
   * @param  {boolean}  bubbling
   */
  removeEvent = function (el, evt, fn, bubble) {
    if ("removeEventListener" in el) {
      try {
        el.removeEventListener(evt, fn, bubble);
      } catch (e) {
        if (typeof fn === "object" && fn.handleEvent) {
          el.removeEventListener(evt, function (e) {
            fn.handleEvent.call(fn, e);
          }, bubble);
        } else {
          throw e;
        }
      }
    } else if ("detachEvent" in el) {
      if (typeof fn === "object" && fn.handleEvent) {
        el.detachEvent("on" + evt, function () {
          fn.handleEvent.call(fn);
        });
      } else {
        el.detachEvent("on" + evt, fn);
      }
    }
  },

  /**
   * Get the children of any element
   *
   * @param  {element}
   * @return {array} Returns matching elements in an array
   */
  getChildren = function (e) {
    if (e.children.length < 1) {
      throw new Error("The Nav container has no containing elements");
    }
    // Store all children in array
    var children = [];
    // Loop through children and store in array if child != TextNode
    for (var i = 0; i < e.children.length; i++) {
      if (e.children[i].nodeType === 1) {
        children.push(e.children[i]);
      }
    }
    return children;
  },

  /**
   * Sets multiple attributes at once
   *
   * @param {element} element
   * @param {attrs}   attrs
   */
  setAttributes = function (el, attrs) {
    for (var key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
  },

  /**
   * Adds a class to any element
   *
   * @param {element} element
   * @param {string}  class
   */
  addClass = function (el, cls) {
    if (el.className.indexOf(cls) !== 0) {
      el.className += " " + cls;
      el.className = el.className.replace(/(^\s*)|(\s*$)/g,"");
    }
  },

  /**
   * Remove a class from any element
   *
   * @param  {element} element
   * @param  {string}  class
   */
  removeClass = function (el, cls) {
    var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
    el.className = el.className.replace(reg, " ").replace(/(^\s*)|(\s*$)/g,"");
  },

  /**
   * forEach method that passes back the stuff we need
   *
   * @param  {array}    array
   * @param  {Function} callback
   * @param  {scope}    scope
   */
  forEach = function (array, callback, scope) {
    for (var i = 0; i < array.length; i++) {
      callback.call(scope, i, array[i]);
    }
  };

var computed = !!window.getComputedStyle;

/**
 * getComputedStyle polyfill for old browsers
 */
if (!computed) {
  window.getComputedStyle = function(el) {
    this.el = el;
    this.getPropertyValue = function(prop) {
      var re = /(\-([a-z]){1})/g;
      if (prop === "float") {
        prop = "styleFloat";
      }
      if (re.test(prop)) {
        prop = prop.replace(re, function () {
          return arguments[2].toUpperCase();
        });
      }
      return el.currentStyle[prop] ? el.currentStyle[prop] : null;
    };
    return this;
  };
}

/*! responsive-nav.js @@version
 * https://github.com/viljamis/responsive-nav.js
 * http://responsive-nav.com
 *
 * Copyright (c) @@year @viljamis
 * Available under the MIT license
 */

(function (document, window, index) {
  // Index is used to keep multiple navs on the same page namespaced

  "use strict";

  var responsiveNav = function (el, options) {

    //= polyfills.js
    //= helpers.js

    var nav,
      opts,
      navToggle,
      styleElement = document.createElement("style"),
      htmlEl = document.documentElement,
      hasAnimFinished,
      isMobile,
      navOpen;

    var ResponsiveNav = function (el, options) {
        var i;

        /**
         * Default options
         * @type {Object}
         */
        this.options = {
          animate: true,                    // Boolean: Use CSS3 transitions, true or false
          transition: 284,                  // Integer: Speed of the transition, in milliseconds
          label: "Menu",                    // String: Label for the navigation toggle
          insert: "before",                 // String: Insert the toggle before or after the navigation
          customToggle: "",                 // Selector: Specify the ID of a custom toggle
          closeOnNavClick: false,           // Boolean: Close the navigation when one of the links are clicked
          openPos: "relative",              // String: Position of the opened nav, relative or static
          navClass: "nav-collapse",         // String: Default CSS class. If changed, you need to edit the CSS too!
          navActiveClass: "js-nav-active",  // String: Class that is added to <html> element when nav is active
          jsClass: "js",                    // String: 'JS enabled' class which is added to <html> element
          init: function(){},               // Function: Init callback
          open: function(){},               // Function: Open callback
          close: function(){}               // Function: Close callback
        };

        // User defined options
        for (i in options) {
          this.options[i] = options[i];
        }

        // Adds "js" class for <html>
        addClass(htmlEl, this.options.jsClass);

        // Wrapper
        this.wrapperEl = el.replace("#", "");

        // Try selecting ID first
        if (document.getElementById(this.wrapperEl)) {
          this.wrapper = document.getElementById(this.wrapperEl);

        // If element with an ID doesn't exist, use querySelector
        } else if (document.querySelector(this.wrapperEl)) {
          this.wrapper = document.querySelector(this.wrapperEl);

        // If element doesn't exists, stop here.
        } else {
          throw new Error("The nav element you are trying to select doesn't exist");
        }

        // Inner wrapper
        this.wrapper.inner = getChildren(this.wrapper);

        // For minification
        opts = this.options;
        nav = this.wrapper;

        // Init
        this._init(this);
      };

    ResponsiveNav.prototype = {

      /**
       * Unattaches events and removes any classes that were added
       */
      destroy: function () {
        this._removeStyles();
        removeClass(nav, "closed");
        removeClass(nav, "opened");
        removeClass(nav, opts.navClass);
        removeClass(nav, opts.navClass + "-" + this.index);
        removeClass(htmlEl, opts.navActiveClass);
        nav.removeAttribute("style");
        nav.removeAttribute("aria-hidden");

        removeEvent(window, "resize", this, false);
        removeEvent(window, "focus", this, false);
        removeEvent(document.body, "touchmove", this, false);
        removeEvent(navToggle, "touchstart", this, false);
        removeEvent(navToggle, "touchend", this, false);
        removeEvent(navToggle, "mouseup", this, false);
        removeEvent(navToggle, "keyup", this, false);
        removeEvent(navToggle, "click", this, false);

        if (!opts.customToggle) {
          navToggle.parentNode.removeChild(navToggle);
        } else {
          navToggle.removeAttribute("aria-hidden");
        }
      },

      /**
       * Toggles the navigation open/close
       */
      toggle: function () {
        if (hasAnimFinished === true) {
          if (!navOpen) {
            this.open();
          } else {
            this.close();
          }

          // Enable pointer events again
          this._enablePointerEvents();
        }
      },

      /**
       * Opens the navigation
       */
      open: function () {
        if (!navOpen) {
          removeClass(nav, "closed");
          addClass(nav, "opened");
          addClass(htmlEl, opts.navActiveClass);
          addClass(navToggle, "active");
          nav.style.position = opts.openPos;
          setAttributes(nav, {"aria-hidden": "false"});
          navOpen = true;
          opts.open();
        }
      },

      /**
       * Closes the navigation
       */
      close: function () {
        if (navOpen) {
          addClass(nav, "closed");
          removeClass(nav, "opened");
          removeClass(htmlEl, opts.navActiveClass);
          removeClass(navToggle, "active");
          setAttributes(nav, {"aria-hidden": "true"});

          // If animations are enabled, wait until they finish
          if (opts.animate) {
            hasAnimFinished = false;
            setTimeout(function () {
              nav.style.position = "absolute";
              hasAnimFinished = true;
            }, opts.transition + 10);

          // Animations aren't enabled, we can do these immediately
          } else {
            nav.style.position = "absolute";
          }

          navOpen = false;
          opts.close();
        }
      },

      /**
       * Resize is called on window resize and orientation change.
       * It initializes the CSS styles and height calculations.
       */
      resize: function () {

        // Resize watches navigation toggle's display state
        if (window.getComputedStyle(navToggle, null).getPropertyValue("display") !== "none") {

          isMobile = true;
          setAttributes(navToggle, {"aria-hidden": "false"});

          // If the navigation is hidden
          if (nav.className.match(/(^|\s)closed(\s|$)/)) {
            setAttributes(nav, {"aria-hidden": "true"});
            nav.style.position = "absolute";
          }

          this._createStyles();
          this._calcHeight();
        } else {

          isMobile = false;
          setAttributes(navToggle, {"aria-hidden": "true"});
          setAttributes(nav, {"aria-hidden": "false"});
          nav.style.position = opts.openPos;
          this._removeStyles();
        }
      },

      /**
       * Takes care of all even handling
       *
       * @param  {event} event
       * @return {type} returns the type of event that should be used
       */
      handleEvent: function (e) {
        var evt = e || window.event;

        switch (evt.type) {
        case "touchstart":
          this._onTouchStart(evt);
          break;
        case "touchmove":
          this._onTouchMove(evt);
          break;
        case "touchend":
        case "mouseup":
          this._onTouchEnd(evt);
          break;
        case "click":
          this._preventDefault(evt);
          break;
        case "keyup":
          this._onKeyUp(evt);
          break;
        case "focus":
        case "resize":
          this.resize(evt);
          break;
        }
      },

      /**
       * Initializes the widget
       */
      _init: function () {
        this.index = index++;

        addClass(nav, opts.navClass);
        addClass(nav, opts.navClass + "-" + this.index);
        addClass(nav, "closed");
        hasAnimFinished = true;
        navOpen = false;

        this._closeOnNavClick();
        this._createToggle();
        this._transitions();
        this.resize();

        /**
         * On IE8 the resize event triggers too early for some reason
         * so it's called here again on init to make sure all the
         * calculated styles are correct.
         */
        var self = this;
        setTimeout(function () {
          self.resize();
        }, 20);

        addEvent(window, "resize", this, false);
        addEvent(window, "focus", this, false);
        addEvent(document.body, "touchmove", this, false);
        addEvent(navToggle, "touchstart", this, false);
        addEvent(navToggle, "touchend", this, false);
        addEvent(navToggle, "mouseup", this, false);
        addEvent(navToggle, "keyup", this, false);
        addEvent(navToggle, "click", this, false);

        /**
         * Init callback here
         */
        opts.init();
      },

      /**
       * Creates Styles to the <head>
       */
      _createStyles: function () {
        if (!styleElement.parentNode) {
          styleElement.type = "text/css";
          document.getElementsByTagName("head")[0].appendChild(styleElement);
        }
      },

      /**
       * Removes styles from the <head>
       */
      _removeStyles: function () {
        if (styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      },

      /**
       * Creates Navigation Toggle
       */
      _createToggle: function () {

        // If there's no toggle, let's create one
        if (!opts.customToggle) {
          var toggle = document.createElement("a");
          toggle.innerHTML = opts.label;
          setAttributes(toggle, {
            "href": "#",
            "class": "nav-toggle"
          });

          // Determine where to insert the toggle
          if (opts.insert === "after") {
            nav.parentNode.insertBefore(toggle, nav.nextSibling);
          } else {
            nav.parentNode.insertBefore(toggle, nav);
          }

          navToggle = toggle;

        // There is a toggle already, let's use that one
        } else {
          var toggleEl = opts.customToggle.replace("#", "");

          if (document.getElementById(toggleEl)) {
            navToggle = document.getElementById(toggleEl);
          } else if (document.querySelector(toggleEl)) {
            navToggle = document.querySelector(toggleEl);
          } else {
            throw new Error("The custom nav toggle you are trying to select doesn't exist");
          }
        }
      },

      /**
       * Closes the navigation when a link inside is clicked
       */
      _closeOnNavClick: function () {
        if (opts.closeOnNavClick) {
          var links = nav.getElementsByTagName("a"),
            self = this;
          forEach(links, function (i, el) {
            addEvent(links[i], "click", function () {
              if (isMobile) {
                self.toggle();
              }
            }, false);
          });
        }
      },

      /**
       * Prevents the default tap functionality
       *
       * @param  {event} event
       */
      _preventDefault: function(e) {
        if (e.preventDefault) {
          if (e.stopImmediatePropagation) {
            e.stopImmediatePropagation();
          }
          e.preventDefault();
          e.stopPropagation();
          return false;

        // This is strictly for old IE
        } else {
          e.returnValue = false;
        }
      },

      /**
       * On touch start get the location of the touch
       * and disable pointer events on the body.
       *
       * @param  {event} event
       */
      _onTouchStart: function (e) {
        this._preventDefault(e);
        addClass(document.body, "disable-pointer-events");
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.touchHasMoved = false;

        /**
         * We remove mouseup event completely here to avoid
         * double triggering of events.
         */
        removeEvent(navToggle, "mouseup", this, false);
      },

      /**
       * Check if the user is scrolling instead of tapping and
       * re-enable pointer events if movement happed.
       *
       * @param  {event} event
       */
      _onTouchMove: function (e) {
        if (Math.abs(e.touches[0].clientX - this.startX) > 10 ||
        Math.abs(e.touches[0].clientY - this.startY) > 10) {
          this._enablePointerEvents();
          this.touchHasMoved = true;
        }
      },

      /**
       * On touch end toggle either the whole navigation or
       * a sub-navigation depending on which one was tapped.
       *
       * @param  {event} event
       */
      _onTouchEnd: function (e) {
        this._preventDefault(e);
        if (!isMobile) {
          return;
        }

        // If the user isn't scrolling
        if (!this.touchHasMoved) {

          // If the event type is touch
          if (e.type === "touchend") {
            this.toggle();
            if (opts.insert === "after") {
              setTimeout(function () {
                removeClass(document.body, "disable-pointer-events");
              }, opts.transition + 300);
            }
            return;

          // Event type was click, not touch
          } else {
            var evt = e || window.event;

            // If it isn't a right click, do toggling
            if (!(evt.which === 3 || evt.button === 2)) {
              this.toggle();
            }
          }
        }
      },

      /**
       * For keyboard accessibility, toggle the navigation on Enter
       * keypress too (also sub-navigation is keyboard accessible
       * which explains the complexity here)
       *
       * @param  {event} event
       */
      _onKeyUp: function (e) {
        var evt = e || window.event;
        if (evt.keyCode === 13) {
          this.toggle();
        }
      },

      /**
       * Enable pointer events
       */
      _enablePointerEvents: function () {
        removeClass(document.body, "disable-pointer-events");
      },

      /**
       * Adds the needed CSS transitions if animations are enabled
       */
      _transitions: function () {
        if (opts.animate) {
          var objStyle = nav.style,
            transition = "max-height " + opts.transition + "ms";

          objStyle.WebkitTransition = transition;
          objStyle.MozTransition = transition;
          objStyle.OTransition = transition;
          objStyle.transition = transition;
        }
      },

      /**
       * Calculates the height of the navigation and then creates
       * styles which are later added to the page <head>
       */
      _calcHeight: function () {
        var savedHeight = 0;
        for (var i = 0; i < nav.inner.length; i++) {
          savedHeight += nav.inner[i].offsetHeight;
        }

        // Pointer event styles are also here since they might only be confusing inside the stylesheet
        var innerStyles = "." + opts.jsClass + " ." + opts.navClass + "-" + this.index + ".opened{max-height:" + savedHeight + "px !important} ." + opts.jsClass + " .disable-pointer-events{pointer-events:none !important} ." + opts.jsClass + " ." + opts.navClass + "-" + this.index + ".opened.dropdown-active {max-height:9999px !important}";


        if (styleElement.styleSheet) {
          styleElement.styleSheet.cssText = innerStyles;
        } else {
          styleElement.innerHTML = innerStyles;
        }

        innerStyles = "";
      }

    };

    /**
     * Return new Responsive Nav
     */
    return new ResponsiveNav(el, options);

  };

  window.responsiveNav = responsiveNav;

}(document, window, 0));

/*global describe: false, it: false */
describe("helpers", function () {

  var el = document.createElement("div"),
    event,
    eventName,
    memo = {};

  if (document.createEvent) {
    event = document.createEvent("HTMLEvents");
    event.initEvent("dataavailable", true, true);
  } else {
    event = document.createEventObject();
    event.eventType = "dataavailable";
  }

  event.eventName = eventName;
  event.memo = memo || { };

  function insertEl() {
    document.getElementsByTagName("body")[0].appendChild(el);
  }

  /**
   * addEvent
   */
  describe("addEvent", function () {

    it("adds a DOM event", function () {
      var obj;
      function customEvent() {
        obj = { a : 1, b : 2 };
      }
      addEvent(window, "dataavailable", customEvent, false);
      if (document.createEvent) {
        window.dispatchEvent(event);
      } else {
        window.fireEvent("on" + event.eventType, event);
      }
      expect(obj).toEqual({ a : 1, b : 2 });
    });

  });

  /**
   * removeEvent
   */
  describe("removeEvent", function () {

    it("removes a DOM event", function () {
      var obj;
      function customEvent() {
        obj = { a : 1, b : 2 };
      }
      addEvent(window, "dataavailable", customEvent, false);
      removeEvent(window, "dataavailable", customEvent, false);
      if (document.createEvent) {
        window.dispatchEvent(event);
      } else {
        window.fireEvent("on" + event.eventType, event);
      }
      expect(obj).toEqual(undefined);
    });

  });

  /**
   * getChildren
   */
  describe("getChildren", function () {

    it("gets and stores all children in an array", function () {
      el.innerHTML = "<div></div><div></div><span></span>";
      insertEl();
      var children = getChildren(el);
      expect(children[0].nodeName.toLowerCase()).toEqual("div");
      expect(children[1].nodeName.toLowerCase()).toEqual("div");
      expect(children[2].nodeName.toLowerCase()).toEqual("span");
    });

  });

  /**
   * setAttributes
   */
  describe("setAttributes", function () {

    it("sets multiple attributes to a single element", function () {
      insertEl();
      setAttributes(el, { "class": "added-class", "id": "added-id" });
      expect(el.className).toEqual("added-class");
      expect(el.id).toEqual("added-id");
    });

  });

  /**
   * addClass
   */
  describe("addClass", function () {

    it("checks if a class exists and adds it if it doesn't", function () {
      insertEl();
      addClass(el, "added-class-2");
      expect(el.className).toEqual("added-class added-class-2");
    });

  });

  /**
   * removeClass
   */
  describe("removeClass", function () {

    it("removes removes a class from an element", function () {
      el.className = "not-removed-class removed-class";
      insertEl();
      removeClass(el, "removed-class");
      expect(el.className).not.toEqual("removed-class");
      expect(el.className).toEqual("not-removed-class");
    });

  });

});

/*global describe: false, it: false */
describe("polyfills", function () {

  /**
   * computed
   */
  describe("computed", function () {

    it("checks if getComputedStyles is supported and polyfills it if not", function () {
      var el = document.createElement("div");
      el.style.display = "inline";
      document.getElementsByTagName("body")[0].appendChild(el);
      var test = window.getComputedStyle(el);
      expect(test.display).toEqual("inline");
    });

  });

});

/*global describe: false, it: false */
/* exported ResponsiveNav */
describe("responsive-nav", function () {

  var nav,
    selector = "navigation",
    el = document.createElement("div");

  el.className = "nav-collapse";
  el.id = selector;
  el.innerHTML = "<ul style='overflow:hidden;width:100%;height:16px;float:left;margin:0;padding:0'>" +
    "<li style='height:4px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>Home</a></li>" +
    "<li style='height:4px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>About</a></li>" +
    "<li style='height:4px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>Projects</a></li>" +
    "<li style='height:4px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>Blog</a></li>" +
    "</ul>";

  function eventFire(el, etype) {
    if (el.dispatchEvent) {
      var evObj = document.createEvent("Events");
      evObj.initEvent(etype, true, false);
      el.dispatchEvent(evObj);
    } else if (el.fireEvent) {
      el.fireEvent("on" + etype);
    }
  }

  function insertNav() {
    document.getElementsByTagName("body")[0].appendChild(el);
    nav = responsiveNav(selector);
  }

  /**
   * Resize
   */
  describe("resize", function () {

    it("calculates the height of the navigation", function () {
      el.innerHTML = "<ul style='overflow:hidden;width:100%;float:left;margin:0;padding:0'>" +
        "<li style='height:4px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>Home</a></li>" +
        "<li style='height:4px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>About</a></li>" +
        "<li style='height:4px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>Projects</a></li>" +
        "<li style='height:4px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>Blog</a></li>" +
        "</ul>";
      insertNav();
      var styleEl = document.getElementsByTagName("style")[0],
        styleContents = styleEl.innerHTML || styleEl.styleSheet.cssText.replace(/\s+/g, "").replace(/\;/g, "");
      expect(styleContents.replace(/\.opened/g, "")).toBe(".js .nav-collapse-0{max-height:16px !important} .js .disable-pointer-events{pointer-events:none !important} .js .nav-collapse-0.dropdown-active {max-height:9999px !important}");
      nav.destroy();
    });

  });

  /**
   * Init
   */
  describe("init", function () {

    it("adds a 'js' class", function () {
      insertNav();
      expect(document.documentElement.className).toBe("js");
      nav.destroy();
    });

    it("selects the element", function () {
      spyOn(document, "getElementById").andCallThrough();
      insertNav();
      expect(document.getElementById).toHaveBeenCalledWith(selector);
      expect(nav.wrapper.id).toBe(selector);
      nav.destroy();
    });

    it("creates a toggle", function () {
      insertNav();
      expect(document.querySelector(".nav-toggle").nodeName.toLowerCase()).toBe("a");
      expect(el.className).toBe("nav-collapse nav-collapse-3 closed");
      nav.destroy();
    });

    it("initializes transitions", function () {
      insertNav();
      spyOn(nav, "_transitions").andCallThrough();
      nav._transitions();
      expect(nav._transitions).toHaveBeenCalled();
      nav.destroy();
    });

    it("initializes calculations", function () {
      insertNav();
      spyOn(nav, "resize").andCallThrough();
      nav.resize();
      expect(nav.resize).toHaveBeenCalled();
      nav.destroy();
    });

    it("adds classes", function () {
      insertNav();
      expect(el.className).toBe("nav-collapse nav-collapse-6 closed");
      nav.destroy();
    });

    it("should work with multiple menus", function () {
      el.innerHTML = "<ul style='display:block;width:100%;float:left;margin:0;padding:0'>" +
        "<li style='display:block;height:10px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>Home</a></li>" +
        "<li style='display:block;height:10px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>About</a></li>" +
        "</ul>" +
        "<ul style='display:block;width:100%;float:left;margin:0;padding:0'>" +
        "<li style='height:10px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>Home</a></li>" +
        "<li style='height:10px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>About</a></li>" +
        "<li style='height:10px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>Foo</a></li>" +
        "</ul>";
      insertNav();
      var styleEl = document.getElementsByTagName("style")[0],
        styleContents = styleEl.innerHTML || styleEl.styleSheet.cssText.replace(/\s+/g, "").replace(/\;/g, "");
      expect(styleContents.replace(/\.opened/g, "")).toBe(".js .nav-collapse-7{max-height:50px !important} .js .disable-pointer-events{pointer-events:none !important} .js .nav-collapse-7.dropdown-active {max-height:9999px !important}");
      nav.destroy();
    });

    it("should work with multiple instances", function () {
      var el2 = document.createElement("div");
      el2.className = "nav-collapse";
      el2.id = "navigation2";
      el2.innerHTML = "<ul style='overflow:hidden;width:100%;height:16px;float:left;margin:0;padding:0'>" +
        "<li style='height:4px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>Home</a></li>" +
        "<li style='height:4px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>About</a></li>" +
        "<li style='height:4px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>Projects</a></li>" +
        "<li style='height:4px;overflow:hidden;width:100%;float:left;margin:0;padding:0'><a href='#'>Blog</a></li>" +
        "</ul>";
      document.getElementsByTagName("body")[0].appendChild(el);
      document.getElementsByTagName("body")[0].appendChild(el2);
      nav = responsiveNav(selector);
      var nav2 = responsiveNav("#navigation2");
      expect(el.className).toBe("nav-collapse nav-collapse-8 closed");
      expect(el2.className).toBe("nav-collapse nav-collapse-9 closed");
      nav.destroy();
      nav2.destroy();
    });

  });

  /**
   * destroy
   */
  describe("destroy", function () {

    it("destroys Responsive Nav", function () {
      insertNav();
      nav.destroy();
      expect(el.className).not.toBe("nav-collapse closed");
      expect(el.className).not.toBe("nav-collapse opened");
      expect(el.className).not.toBe("nav-collapse");
      expect(document.querySelector(".nav-toggle")).toBe(null);
      expect(el.style.position).toBe("");
      expect(el.style.maxHeight).toBe("");
      expect(el.getAttribute("aria-hidden")).not.toBe("true");
      expect(el.getAttribute("aria-hidden")).not.toBe("false");
    });

  });

  /**
   * toggle
   */
  describe("toggle", function () {

    it("toggles the navigation open and close", function () {
      insertNav();
      spyOn(nav, "toggle").andCallThrough();
      nav.toggle();
      expect(nav.toggle).toHaveBeenCalled();
      expect(el.className).toBe("nav-collapse nav-collapse-11 opened");
      expect(el.getAttribute("aria-hidden")).toBe("false");
      expect(el.style.position).toBe("relative");
      var navToggle = document.querySelector(".nav-toggle");
      expect(navToggle.className).toBe("nav-toggle active");
      nav.destroy();
    });

  });

  /**
   * open
   */
  describe("open", function () {

    it("opens the navigation", function () {
      insertNav();
      spyOn(nav, "open").andCallThrough();
      nav.open();
      expect(nav.open).toHaveBeenCalled();
      expect(el.className).toBe("nav-collapse nav-collapse-12 opened");
      expect(el.getAttribute("aria-hidden")).toBe("false");
      expect(el.style.position).toBe("relative");
      nav.destroy();
    });

  });

  /**
   * close
   */
  describe("close", function () {

    it("closes the navigation", function () {
      insertNav();
      spyOn(nav, "close").andCallThrough();
      nav.open();
      nav.close();
      expect(nav.close).toHaveBeenCalled();
      expect(el.className).toBe("nav-collapse nav-collapse-13 closed");
      expect(el.getAttribute("aria-hidden")).toBe("true");
      nav.destroy();
    });

  });

  /**
   * handleEvent
   */
  describe("handleEvent", function () {

    it("toggles the navigation on touchend", function () {
      insertNav();
      var toggle = document.querySelector(".nav-toggle");
      eventFire(toggle, "touchend");
      expect(el.className).toBe("nav-collapse nav-collapse-14 opened");
      nav.destroy();
    });

    it("toggles the navigation on mouseup", function () {
      insertNav();
      var toggle = document.querySelector(".nav-toggle");
      eventFire(toggle, "mouseup");
      expect(el.className).toBe("nav-collapse nav-collapse-15 opened");
      nav.destroy();
    });

  });

  /**
   * options
   */
  describe("options", function () {

    it("turns off animation if needed", function () {
      document.getElementsByTagName("body")[0].appendChild(el);
      nav = responsiveNav("#" + selector, { animate: false });
      expect(el.style.transition).not.toBe("max-height 250ms");
      nav.destroy();
    });

    it("controls the transition speed", function () {
      document.getElementsByTagName("body")[0].appendChild(el);
      nav = responsiveNav("#" + selector, { transition: 666 });
      if (el.style.transition) {
        expect(el.style.transition).toBe("max-height 666ms");
      } else if (el.style.webkitTransition) {
        expect(el.style.webkitTransition).toBe("max-height 666ms");
      }
      nav.destroy();
    });

    it("changes the toggle's text", function () {
      document.getElementsByTagName("body")[0].appendChild(el);
      nav = responsiveNav("#" + selector, { label: "foobar" });
      expect(document.querySelector(".nav-toggle").innerHTML).toBe("foobar");
      nav.destroy();
    });

    it("'changes the location where toggle is inserted", function () {
      document.getElementsByTagName("body")[0].appendChild(el);
      nav = responsiveNav("#" + selector, { insert: "before" });
      expect(document.querySelector(".nav-toggle").nextSibling).toBe(el);
      nav.destroy();
    });

    it("allows users to specify their own toggle", function () {
      document.getElementsByTagName("body")[0].appendChild(el);
      var button = document.createElement("button");
      button.id = "button";
      document.getElementsByTagName("body")[0].appendChild(button);
      nav = responsiveNav("#" + selector, { customToggle: "button" });
      expect(document.getElementById("button").getAttribute("aria-hidden")).toBeDefined();
      nav.destroy();
    });

    it("allows users to specify custom open position", function () {
      document.getElementsByTagName("body")[0].appendChild(el);
      nav = responsiveNav("#" + selector, { openPos: "static" });
      nav.toggle();
      expect(el.style.position).toBe("static");
      nav.destroy();
    });

    it("allows users to change the default container class", function () {
      document.getElementsByTagName("body")[0].appendChild(el);
      nav = responsiveNav("#" + selector, { navClass: "random-class" });
      expect(el.className).toBe("random-class random-class-22 closed");
      nav.destroy();
    });

    it("allows users to specify custom JS class", function () {
      document.getElementsByTagName("body")[0].appendChild(el);
      nav = responsiveNav("#" + selector, { jsClass: "foobar" });
      expect(document.documentElement.className).toBe("js foobar");
      nav.destroy();
    });

    it("allows users to have init callback", function () {
      document.getElementsByTagName("body")[0].appendChild(el);
      var foo = "bar";
      nav = responsiveNav("#" + selector, {
        init: function () { foo = "biz"; }
      });
      expect(foo).toBe("biz");
      nav.destroy();
    });

    it("allows users to have open callback", function () {
      document.getElementsByTagName("body")[0].appendChild(el);
      var foo = "bar";
      nav = responsiveNav("#" + selector, {
        open: function () { foo = "biz"; }
      });
      nav.toggle();
      expect(foo).toBe("biz");
      nav.destroy();
    });

    it("allows users to have close callback", function () {
      document.getElementsByTagName("body")[0].appendChild(el);
      var foo = "bar";
      nav = responsiveNav("#" + selector, {
        close: function () { foo = "biz"; }
      });
      nav.toggle();
      nav.toggle();
      expect(foo).toBe("biz");
      nav.destroy();
    });

  });

});

/**
 * Swiper 3.0.3
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * 
 * http://www.idangero.us/swiper/
 * 
 * Copyright 2015, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us/
 * 
 * Licensed under MIT
 * 
 * Released on: March 1, 2015
 */
(function () {
    'use strict';
    /*===========================
    Swiper
    ===========================*/
    window.Swiper = function (container, params) {

        var defaults = {
            direction: 'horizontal',
            touchEventsTarget: 'container',
            initialSlide: 0,
            speed: 300,
            // autoplay
            autoplay: false,
            autoplayDisableOnInteraction: true,
            // Free mode
            freeMode: false,
            freeModeMomentum: true,
            freeModeMomentumRatio: 1,
            freeModeMomentumBounce: true,
            freeModeMomentumBounceRatio: 1,
            // Effects
            effect: 'slide', // 'slide' or 'fade' or 'cube' or 'coverflow'
            coverflow: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows : true
            },
            cube: {
                slideShadows: true,
                shadow: true,
                shadowOffset: 20,
                shadowScale: 0.94
            },
            fade: {
                crossFade: false
            },
            // Parallax
            parallax: false,
            // Scrollbar
            scrollbar: null,
            scrollbarHide: true,
            // Keyboard Mousewheel
            keyboardControl: false,
            mousewheelControl: false,
            mousewheelForceToAxis: false,
            // Hash Navigation
            hashnav: false,
            // Slides grid
            spaceBetween: 0,
            slidesPerView: 1,
            slidesPerColumn: 1,
            slidesPerColumnFill: 'column',
            slidesPerGroup: 1,
            centeredSlides: false,
            // Touches
            touchRatio: 1,
            touchAngle: 45,
            simulateTouch: true,
            shortSwipes: true,
            longSwipes: true,
            longSwipesRatio: 0.5,
            longSwipesMs: 300,
            followFinger: true,
            onlyExternal: false,
            threshold: 0,
            touchMoveStopPropagation: true,
            // Pagination
            pagination: null,
            paginationClickable: false,
            paginationHide: false,
            // Resistance
            resistance: true,
            resistanceRatio: 0.85,
            // Next/prev buttons
            nextButton: null,
            prevButton: null,
            // Progress
            watchSlidesProgress: false,
            watchVisibility: false,
            // Cursor
            grabCursor: false,
            // Clicks
            preventClicks: true,
            preventClicksPropagation: true,
            releaseFormElements: true,
            slideToClickedSlide: false,
            // Images
            updateOnImagesReady: true,
            // loop
            loop: false,
            loopAdditionalSlides: 0,
            loopedSlides: null,
            // Control
            control: undefined,
            controlInverse: false,
            // Swiping/no swiping
            allowSwipeToPrev: true,
            allowSwipeToNext: true,
            swipeHandler: null, //'.swipe-handler',
            noSwiping: true,
            noSwipingClass: 'swiper-no-swiping',
            // NS
            slideClass: 'swiper-slide',
            slideActiveClass: 'swiper-slide-active',
            slideVisibleClass: 'swiper-slide-visible',
            slideDuplicateClass: 'swiper-slide-duplicate',
            slideNextClass: 'swiper-slide-next',
            slidePrevClass: 'swiper-slide-prev',
            wrapperClass: 'swiper-wrapper',
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active',
            buttonDisabledClass: 'swiper-button-disabled',
            paginationHiddenClass: 'swiper-pagination-hidden',
            // Observer
            observer: false,
            observeParents: false,
            // Callbacks
            runCallbacksOnInit: true
            /*
            Callbacks:
            onInit: function (swiper)
            onDestroy: function (swiper)
            onClick: function (swiper, e) 
            onTap: function (swiper, e) 
            onDoubleTap: function (swiper, e) 
            onSliderMove: function (swiper, e) 
            onSlideChangeStart: function (swiper) 
            onSlideChangeEnd: function (swiper) 
            onTransitionStart: function (swiper) 
            onTransitionEnd: function (swiper) 
            onImagesReady: function (swiper) 
            onProgress: function (swiper, progress) 
            onTouchStart: function (swiper, e) 
            onTouchMove: function (swiper, e) 
            onTouchMoveOpposite: function (swiper, e) 
            onTouchEnd: function (swiper, e) 
            onReachBeginning: function (swiper) 
            onReachEnd: function (swiper) 
            onSetTransition: function (swiper, duration) 
            onSetTranslate: function (swiper, translate) 
            onAutoplayStart: function (swiper)
            onAutoplayStop: function (swiper)
            */
        };
        params = params || {};
        for (var def in defaults) {
            if (typeof params[def] === 'undefined') {
                params[def] = defaults[def];
            }
            else if (typeof params[def] === 'object') {
                for (var deepDef in defaults[def]) {
                    if (typeof params[def][deepDef] === 'undefined') {
                        params[def][deepDef] = defaults[def][deepDef];
                    }
                }
            }
        }
        
        // Swiper
        var s = this;
        
        // Params
        s.params = params;
        /*=========================
          Dom Library and plugins
          ===========================*/
        var $;
        if (typeof Dom7 === 'undefined') {
            $ = window.Dom7 || window.Zepto || window.jQuery;
        }
        else {
            $ = Dom7;
        }
        if (!$) return;
        
        /*=========================
          Preparation - Define Container, Wrapper and Pagination
          ===========================*/
        s.container = $(container);
        if (s.container.length === 0) return;
        if (s.container.length > 1) {
            s.container.each(function () {
                new Swiper(this, params);
            });
            return;
        }
        
        // Save instance in container HTML Element and in data
        s.container[0].swiper = s;
        s.container.data('swiper', s);
        
        s.container.addClass('swiper-container-' + s.params.direction);
        
        if (s.params.freeMode) {
            s.container.addClass('swiper-container-free-mode');
        }
        // Enable slides progress when required
        if (s.params.parallax || s.params.watchVisibility) {
            s.params.watchSlidesProgress = true;
        }
        // Coverflow / 3D
        if (['cube', 'coverflow'].indexOf(s.params.effect) >= 0) {
            if (s.support.transforms3d) {
                s.params.watchSlidesProgress = true;
                s.container.addClass('swiper-container-3d');
            }
            else {
                s.params.effect = 'slide';
            }
        }
        if (s.params.effect !== 'slide') {
            s.container.addClass('swiper-container-' + s.params.effect);
        }
        if (s.params.effect === 'cube') {
            s.params.resistanceRatio = 0;
            s.params.slidesPerView = 1;
            s.params.slidesPerColumn = 1;
            s.params.slidesPerGroup = 1;
            s.params.centeredSlides = false;
            s.params.spaceBetween = 0;
        }
        if (s.params.effect === 'fade') {
            s.params.watchSlidesProgress = true;
            s.params.spaceBetween = 0;
        }
        
        // Grab Cursor
        if (s.params.grabCursor && s.support.touch) {
            s.params.grabCursor = false;
        }
        
        // Wrapper
        s.wrapper = s.container.children('.' + s.params.wrapperClass);
        
        // Pagination
        if (s.params.pagination) {
            s.paginationContainer = $(s.params.pagination);
            if (s.params.paginationClickable) {
                s.paginationContainer.addClass('swiper-pagination-clickable');
            }
        }
        
        // Is Horizontal
        function isH() {
            return s.params.direction === 'horizontal';
        }
        
        // RTL
        s.rtl = isH() && (s.container[0].dir.toLowerCase() === 'rtl' || s.container.css('direction') === 'rtl');
        if (s.rtl) s.container.addClass('swiper-container-rtl');
        
        // Wrong RTL support
        if (s.rtl) {
            s.wrongRTL = s.wrapper.css('display') === '-webkit-box';
        }
        
        // Translate
        s.translate = 0;
        
        // Progress
        s.progress = 0;
        
        // Velocity
        s.velocity = 0;
        
        // Locks, unlocks
        s.lockSwipeToNext = function () {
            s.params.allowSwipeToNext = false;
        };
        s.lockSwipeToPrev = function () {
            s.params.allowSwipeToPrev = false;
        };
        s.lockSwipes = function () {
            s.params.allowSwipeToNext = s.params.allowSwipeToPrev = false;
        };
        s.unlockSwipeToNext = function () {
            s.params.allowSwipeToNext = true;
        };
        s.unlockSwipeToPrev = function () {
            s.params.allowSwipeToPrev = true;
        };
        s.unlockSwipes = function () {
            s.params.allowSwipeToNext = s.params.allowSwipeToPrev = true;
        };
        
        // Columns
        if (s.params.slidesPerColumn > 1) {
            s.container.addClass('swiper-container-multirow');
        }
        
        
        /*=========================
          Set grab cursor
          ===========================*/
        if (s.params.grabCursor) {
            s.container[0].style.cursor = 'move';
            s.container[0].style.cursor = '-webkit-grab';
            s.container[0].style.cursor = '-moz-grab';
            s.container[0].style.cursor = 'grab';
        }
        /*=========================
          Update on Images Ready
          ===========================*/
        s.imagesToLoad = [];
        s.imagesLoaded = 0;
        
        function loadImage(img) {
            var image, src;
            var onReady = function () {
                if (typeof s === 'undefined' || s === null) return;
                if (s.imagesLoaded !== undefined) s.imagesLoaded++;
                if (s.imagesLoaded === s.imagesToLoad.length) {
                    s.update();
                    if (s.params.onImagesReady) s.params.onImagesReady(s);
                }
            };
        
            if (!img.complete) {
                src = (img.currentSrc || img.getAttribute('src'));
                if (src) {
                    image = new Image();
                    image.onload = onReady;
                    image.onerror = onReady;
                    image.src = src;
                } else {
                    onReady();
                }
        
            } else {//image already loaded...
                onReady();
            }
        }
        s.preloadImages = function () {
            s.imagesToLoad = s.container.find('img');
        
            for (var i = 0; i < s.imagesToLoad.length; i++) {
                loadImage(s.imagesToLoad[i]);
            }
        };
        
        /*=========================
          Autoplay
          ===========================*/
        s.autoplayTimeoutId = undefined;
        s.autoplaying = false;
        s.autoplayPaused = false;
        function autoplay() {
            s.autoplayTimeoutId = setTimeout(function () {
                if (s.params.loop) {
                    s.fixLoop();
                    s._slideNext();
                }
                else {
                    if (!s.isEnd) {
                        s._slideNext();
                    }
                    else {
                        if (!params.autoplayStopOnLast) {
                            s._slideTo(0);
                        }
                        else {
                            s.stopAutoplay();
                        }
                    }
                }
            }, s.params.autoplay);
        }
        s.startAutoplay = function () {
            if (typeof s.autoplayTimeoutId !== 'undefined') return false;
            if (!s.params.autoplay) return false;
            if (s.autoplaying) return false;
            s.autoplaying = true;
            if (s.params.onAutoplayStart) s.params.onAutoplayStart(s);
            autoplay();
        };
        s.stopAutoplay = function (internal) {
            if (!s.autoplayTimeoutId) return;
            if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
            s.autoplaying = false;
            s.autoplayTimeoutId = undefined;
            if (s.params.onAutoplayStop) s.params.onAutoplayStop(s);
        };
        s.pauseAutoplay = function (speed) {
            if (s.autoplayPaused) return;
            if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
            s.autoplayPaused = true;
            if (speed === 0) {
                s.autoplayPaused = false;
                autoplay();
            }
            else {
                s.wrapper.transitionEnd(function () {
                    s.autoplayPaused = false;
                    if (!s.autoplaying) {
                        s.stopAutoplay();
                    }
                    else {
                        autoplay();
                    }
                });
            }
        };
        /*=========================
          Min/Max Translate
          ===========================*/
        s.minTranslate = function () {
            return (-s.snapGrid[0]);
        };
        s.maxTranslate = function () {
            return (-s.snapGrid[s.snapGrid.length - 1]);
        };
        /*=========================
          Slider/slides sizes
          ===========================*/
        s.updateContainerSize = function () {
            s.width = s.container[0].clientWidth;
            s.height = s.container[0].clientHeight;
            s.size = isH() ? s.width : s.height;
        };
        
        s.updateSlidesSize = function () {
            s.slides = s.wrapper.children('.' + s.params.slideClass);
            s.snapGrid = [];
            s.slidesGrid = [];
            s.slidesSizesGrid = [];
            
            var spaceBetween = s.params.spaceBetween,
                slidePosition = 0,
                i,
                prevSlideSize = 0,
                index = 0;
            if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
                spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * s.size;
            }
        
            s.virtualWidth = -spaceBetween;
            // reset margins
            if (s.rtl) s.slides.css({marginLeft: '', marginTop: ''});
            else s.slides.css({marginRight: '', marginBottom: ''});
        
            var slidesNumberEvenToRows;
            if (s.params.slidesPerColumn > 1) {
                if (Math.floor(s.slides.length / s.params.slidesPerColumn) === s.slides.length / s.params.slidesPerColumn) {
                    slidesNumberEvenToRows = s.slides.length;
                }
                else {
                    slidesNumberEvenToRows = Math.ceil(s.slides.length / s.params.slidesPerColumn) * s.params.slidesPerColumn;
                }
            }
        
            // Calc slides
            var slideSize;
            for (i = 0; i < s.slides.length; i++) {
                slideSize = 0;
                var slide = s.slides.eq(i);
                if (s.params.slidesPerColumn > 1) {
                    // Set slides order
                    var newSlideOrderIndex;
                    var column, row;
                    var slidesPerColumn = s.params.slidesPerColumn;
                    var slidesPerRow;
                    if (s.params.slidesPerColumnFill === 'column') {
                        column = Math.floor(i / slidesPerColumn);
                        row = i - column * slidesPerColumn;
                        newSlideOrderIndex = column + row * slidesNumberEvenToRows / slidesPerColumn;
                        slide
                            .css({
                                '-webkit-box-ordinal-group': newSlideOrderIndex,
                                '-moz-box-ordinal-group': newSlideOrderIndex,
                                '-ms-flex-order': newSlideOrderIndex,
                                '-webkit-order': newSlideOrderIndex,
                                'order': newSlideOrderIndex
                            });
                    }
                    else {
                        slidesPerRow = slidesNumberEvenToRows / slidesPerColumn;
                        row = Math.floor(i / slidesPerRow);
                        column = i - row * slidesPerRow;
                        
                    }
                    slide
                        .css({
                            'margin-top': (row !== 0 && s.params.spaceBetween) && (s.params.spaceBetween + 'px')
                        })
                        .attr('data-swiper-column', column)
                        .attr('data-swiper-row', row);
                        
                }
                if (slide.css('display') === 'none') continue;
                if (s.params.slidesPerView === 'auto') {
                    slideSize = isH() ? slide.outerWidth(true) : slide.outerHeight(true);
                }
                else {
                    slideSize = (s.size - (s.params.slidesPerView - 1) * spaceBetween) / s.params.slidesPerView;
                    if (isH()) {
                        s.slides[i].style.width = slideSize + 'px';
                    }
                    else {
                        s.slides[i].style.height = slideSize + 'px';
                    }
                }
                s.slides[i].swiperSlideSize = slideSize;
                s.slidesSizesGrid.push(slideSize);
                
                
                if (s.params.centeredSlides) {
                    slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
                    if (i === 0) slidePosition = slidePosition - s.size / 2 - spaceBetween;
                    if (Math.abs(slidePosition) < 1 / 1000) slidePosition = 0;
                    if ((index) % s.params.slidesPerGroup === 0) s.snapGrid.push(slidePosition);
                    s.slidesGrid.push(slidePosition);
                }
                else {
                    if ((index) % s.params.slidesPerGroup === 0) s.snapGrid.push(slidePosition);
                    s.slidesGrid.push(slidePosition);
                    slidePosition = slidePosition + slideSize + spaceBetween;
                }
        
                s.virtualWidth += slideSize + spaceBetween;
        
                prevSlideSize = slideSize;
        
                index ++;
            }
            s.virtualWidth = Math.max(s.virtualWidth, s.size);
        
            var newSlidesGrid;
        
            if (s.rtl && s.wrongRTL && (s.params.effect === 'slide' || s.params.effect === 'coverflow')) {
                s.wrapper.css({width: s.virtualWidth + s.params.spaceBetween + 'px'});
            }
        
            if (s.params.slidesPerColumn > 1) {
                s.virtualWidth = (slideSize + s.params.spaceBetween) * slidesNumberEvenToRows;
                s.virtualWidth = Math.ceil(s.virtualWidth / s.params.slidesPerColumn) - s.params.spaceBetween;
                s.wrapper.css({width: s.virtualWidth + s.params.spaceBetween + 'px'});
                if (s.params.centeredSlides) {
                    newSlidesGrid = [];
                    for (i = 0; i < s.snapGrid.length; i++) {
                        if (s.snapGrid[i] < s.virtualWidth + s.snapGrid[0]) newSlidesGrid.push(s.snapGrid[i]);
                    }
                    s.snapGrid = newSlidesGrid;
                }
            }
        
            // Remove last grid elements depending on width
            if (!s.params.centeredSlides) {
                newSlidesGrid = [];
                for (i = 0; i < s.snapGrid.length; i++) {
                    if (s.snapGrid[i] <= s.virtualWidth - s.size) {
                        newSlidesGrid.push(s.snapGrid[i]);
                    }
                }
                s.snapGrid = newSlidesGrid;
                if (Math.floor(s.virtualWidth - s.size) > Math.floor(s.snapGrid[s.snapGrid.length - 1])) {
                    s.snapGrid.push(s.virtualWidth - s.size);
                }
            }
            if (s.snapGrid.length === 0) s.snapGrid = [0];
                
            if (s.params.spaceBetween !== 0) {
                if (isH()) {
                    if (s.rtl) s.slides.css({marginLeft: spaceBetween + 'px'});
                    else s.slides.css({marginRight: spaceBetween + 'px'});
                }
                else s.slides.css({marginBottom: spaceBetween + 'px'});
            }
            if (s.params.watchSlidesProgress) {
                s.updateSlidesOffset();
            }
        };
        s.updateSlidesOffset = function () {
            for (var i = 0; i < s.slides.length; i++) {
                s.slides[i].swiperSlideOffset = isH() ? s.slides[i].offsetLeft : s.slides[i].offsetTop;
            }
        };
        
        /*=========================
          Slider/slides progress
          ===========================*/
        s.updateSlidesProgress = function (translate) {
            if (typeof translate === 'undefined') {
                translate = s.translate || 0;
            }
            if (s.slides.length === 0) return;
            if (typeof s.slides[0].swiperSlideOffset === 'undefined') s.updateSlidesOffset();
        
            var offsetCenter = s.params.centeredSlides ? -translate + s.size / 2 : -translate;
            if (s.rtl) offsetCenter = s.params.centeredSlides ? translate - s.size / 2 : translate;
        
            // Visible Slides
            var containerBox = s.container[0].getBoundingClientRect();
            var sideBefore = isH() ? 'left' : 'top';
            var sideAfter = isH() ? 'right' : 'bottom';
            s.slides.removeClass(s.params.slideVisibleClass);
            for (var i = 0; i < s.slides.length; i++) {
                var slide = s.slides[i];
                var slideCenterOffset = (s.params.centeredSlides === true) ? slide.swiperSlideSize / 2 : 0;
                var slideProgress = (offsetCenter - slide.swiperSlideOffset - slideCenterOffset) / (slide.swiperSlideSize + s.params.spaceBetween);
                if (s.params.watchVisibility) {
                    var slideBefore = -(offsetCenter - slide.swiperSlideOffset - slideCenterOffset);
                    var slideAfter = slideBefore + s.slidesSizesGrid[i];
                    var isVisible =
                        (slideBefore >= 0 && slideBefore < s.size) ||
                        (slideAfter > 0 && slideAfter <= s.size) ||
                        (slideBefore <= 0 && slideAfter >= s.size);
                    if (isVisible) {
                        s.slides.eq(i).addClass(s.params.slideVisibleClass);
                    }
                }
                slide.progress = s.rtl ? -slideProgress : slideProgress;
            }
        };
        s.updateProgress = function (translate) {
            if (typeof translate === 'undefined') {
                translate = s.translate || 0;
            }
            var translatesDiff = s.maxTranslate() - s.minTranslate();
            if (translatesDiff === 0) {
                s.progress = 0;
                s.isBeginning = s.isEnd = true;
            }
            else {
                s.progress = (translate - s.minTranslate()) / (translatesDiff);
                s.isBeginning = s.progress <= 0;
                s.isEnd = s.progress >= 1;
            }
            if (s.isBeginning && s.params.onReachBeginning) s.params.onReachBeginning(s);
            if (s.isEnd && s.params.onReachEnd) s.params.onReachEnd(s);
            
            if (s.params.watchSlidesProgress) s.updateSlidesProgress(translate);
            if (s.params.onProgress) s.params.onProgress(s, s.progress);
        };
        s.updateActiveIndex = function () {
            var translate = s.rtl ? s.translate : -s.translate;
            var newActiveIndex, i, snapIndex;
            for (i = 0; i < s.slidesGrid.length; i ++) {
                if (typeof s.slidesGrid[i + 1] !== 'undefined') {
                    if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1] - (s.slidesGrid[i + 1] - s.slidesGrid[i]) / 2) {
                        newActiveIndex = i;
                    }
                    else if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1]) {
                        newActiveIndex = i + 1;
                    }
                }
                else {
                    if (translate >= s.slidesGrid[i]) {
                        newActiveIndex = i;
                    }
                }
            }
            // Normalize slideIndex
            if (newActiveIndex < 0 || typeof newActiveIndex === 'undefined') newActiveIndex = 0;
            // for (i = 0; i < s.slidesGrid.length; i++) {
                // if (- translate >= s.slidesGrid[i]) {
                    // newActiveIndex = i;
                // }
            // }
            snapIndex = Math.floor(newActiveIndex / s.params.slidesPerGroup);
            if (snapIndex >= s.snapGrid.length) snapIndex = s.snapGrid.length - 1;
        
            if (newActiveIndex === s.activeIndex) {
                return;
            }
            s.snapIndex = snapIndex;
            s.previousIndex = s.activeIndex;
            s.activeIndex = newActiveIndex;
            s.updateClasses();
        };
        
        /*=========================
          Classes
          ===========================*/
        s.updateClasses = function () {
            s.slides.removeClass(s.params.slideActiveClass + ' ' + s.params.slideNextClass + ' ' + s.params.slidePrevClass);
            var activeSlide = s.slides.eq(s.activeIndex);
            // Active classes
            activeSlide.addClass(s.params.slideActiveClass);
            activeSlide.next('.' + s.params.slideClass).addClass(s.params.slideNextClass);
            activeSlide.prev('.' + s.params.slideClass).addClass(s.params.slidePrevClass);
        
            // Pagination
            if (s.bullets && s.bullets.length > 0) {
                s.bullets.removeClass(s.params.bulletActiveClass);
                var bulletIndex;
                if (s.params.loop) {
                    bulletIndex = s.activeIndex - s.loopedSlides;
                    if (bulletIndex > s.slides.length - 1 - s.loopedSlides * 2) {
                        bulletIndex = bulletIndex - (s.slides.length - s.loopedSlides * 2);
                    }
                }
                else {
                    if (typeof s.snapIndex !== 'undefined') {
                        bulletIndex = s.snapIndex;
                    }
                    else {
                        bulletIndex = s.activeIndex || 0;
                    }
                }
                s.bullets.eq(bulletIndex).addClass(s.params.bulletActiveClass);
            }
        
            // Next/active buttons
            if (!s.params.loop) {
                if (s.params.prevButton) {
                    if (s.isBeginning) $(s.params.prevButton).addClass(s.params.buttonDisabledClass);
                    else $(s.params.prevButton).removeClass(s.params.buttonDisabledClass);
                }
                if (s.params.nextButton) {
                    if (s.isEnd) $(s.params.nextButton).addClass(s.params.buttonDisabledClass);
                    else $(s.params.nextButton).removeClass(s.params.buttonDisabledClass);
                }
            }
        };
        
        /*=========================
          Pagination
          ===========================*/
        s.updatePagination = function () {
            if (!s.params.pagination) return;
            if (s.paginationContainer && s.paginationContainer.length > 0) {
                var bulletsHTML = '';
                var numberOfBullets = s.params.loop ? s.slides.length - s.loopedSlides * 2 : s.snapGrid.length;
                for (var i = 0; i < numberOfBullets; i++) {
                    bulletsHTML += '<span class="' + s.params.bulletClass + '"></span>';
                }
                s.paginationContainer.html(bulletsHTML);
                s.bullets = s.paginationContainer.find('.' + s.params.bulletClass);
            }
        };
        /*=========================
          Common update method
          ===========================*/
        s.update = function (updateTranslate) {
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updateProgress();
            s.updatePagination();
            s.updateClasses();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            function forceSetTranslate() {
                newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
                s.setWrapperTranslate(newTranslate);
                s.updateActiveIndex();
                s.updateClasses();
            }
            if (updateTranslate) {
                var translated, newTranslate;
                if (s.params.freeMode) {
                    forceSetTranslate();
                }
                else {
                    if (s.params.slidesPerView === 'auto' && s.isEnd && !s.params.centeredSlides) {
                        translated = s.slideTo(s.slides.length - 1, 0, false, true);
                    }
                    else {
                        translated = s.slideTo(s.activeIndex, 0, false, true);
                    }
                    if (!translated) {
                        forceSetTranslate();
                    }
                }
                    
            }
        };
        
        /*=========================
          Resize Handler
          ===========================*/
        s.onResize = function () {
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updateProgress();
            if (s.params.slidesPerView === 'auto' || s.params.freeMode) s.updatePagination();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            if (s.params.freeMode) {
                var newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
                s.setWrapperTranslate(newTranslate);
                s.updateActiveIndex();
                s.updateClasses();
            }
            else {
                s.updateClasses();
                if (s.params.slidesPerView === 'auto' && s.isEnd && !s.params.centeredSlides) {
                    s.slideTo(s.slides.length - 1, 0, false, true);
                }
                else {
                    s.slideTo(s.activeIndex, 0, false, true);
                }
            }
                
        };
        
        /*=========================
          Events
          ===========================*/
        
        //Define Touch Events
        var desktopEvents = ['mousedown', 'mousemove', 'mouseup'];
        if (window.navigator.pointerEnabled) desktopEvents = ['pointerdown', 'pointermove', 'pointerup'];
        else if (window.navigator.msPointerEnabled) desktopEvents = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp'];
        s.touchEvents = {
            start : s.support.touch || !s.params.simulateTouch  ? 'touchstart' : desktopEvents[0],
            move : s.support.touch || !s.params.simulateTouch ? 'touchmove' : desktopEvents[1],
            end : s.support.touch || !s.params.simulateTouch ? 'touchend' : desktopEvents[2]
        };
            
        
        // WP8 Touch Events Fix
        if (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) {
            (s.params.touchEventsTarget === 'container' ? s.container : s.wrapper).addClass('swiper-wp8-' + s.params.direction);
        }
        
        // Attach/detach events
        s.events = function (detach) {
            var actionDom = detach ? 'off' : 'on';
            var action = detach ? 'removeEventListener' : 'addEventListener';
            var touchEventsTarget = s.params.touchEventsTarget === 'container' ? s.container[0] : s.wrapper[0];
            var target = s.support.touch ? touchEventsTarget : document;
        
            var moveCapture = s.params.nested ? true : false;
        
            //Touch Events
            if (s.browser.ie) {
                touchEventsTarget[action](s.touchEvents.start, s.onTouchStart, false);
                target[action](s.touchEvents.move, s.onTouchMove, moveCapture);
                target[action](s.touchEvents.end, s.onTouchEnd, false);
            }
            else {
                if (s.support.touch) {
                    touchEventsTarget[action](s.touchEvents.start, s.onTouchStart, false);
                    touchEventsTarget[action](s.touchEvents.move, s.onTouchMove, moveCapture);
                    touchEventsTarget[action](s.touchEvents.end, s.onTouchEnd, false);
                }
                if (params.simulateTouch && !s.device.ios && !s.device.android) {
                    touchEventsTarget[action]('mousedown', s.onTouchStart, false);
                    target[action]('mousemove', s.onTouchMove, moveCapture);
                    target[action]('mouseup', s.onTouchEnd, false);
                }
            }
            window[action]('resize', s.onResize);
        
            // Next, Prev, Index
            if (s.params.nextButton) $(s.params.nextButton)[actionDom]('click', s.onClickNext);
            if (s.params.prevButton) $(s.params.prevButton)[actionDom]('click', s.onClickPrev);
            if (s.params.pagination && s.params.paginationClickable) {
                $(s.paginationContainer)[actionDom]('click', '.' + s.params.bulletClass, s.onClickIndex);
            }
        
            // Prevent Links Clicks
            if (s.params.preventClicks || s.params.preventClicksPropagation) touchEventsTarget[action]('click', s.preventClicks, true);
        };
        s.attachEvents = function (detach) {
            s.events();
        };
        s.detachEvents = function () {
            s.events(true);
        };
        
        /*=========================
          Handle Clicks
          ===========================*/
        // Prevent Clicks
        s.allowClick = true;
        s.preventClicks = function (e) {
            if (!s.allowClick) {
                if (s.params.preventClicks) e.preventDefault();
                if (s.params.preventClicksPropagation) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
            }
        };
        // Clicks
        s.onClickNext = function (e) {
            e.preventDefault();
            s.slideNext();
        };
        s.onClickPrev = function (e) {
            e.preventDefault();
            s.slidePrev();
        };
        s.onClickIndex = function (e) {
            e.preventDefault();
            var index = $(this).index() * s.params.slidesPerGroup;
            if (s.params.loop) index = index + s.loopedSlides;
            s.slideTo(index);
        };
        
        /*=========================
          Handle Touches
          ===========================*/
        function findElementInEvent(e, selector) {
            var el = $(e.target);
            if (!el.is(selector)) {
                if (typeof selector === 'string') {
                    el = el.parents(selector);
                }
                else if (selector.nodeType) {
                    var found;
                    el.parents().each(function (index, _el) {
                        if (_el === selector) found = selector;
                    });
                    if (!found) return undefined;
                    else return selector;
                }
            }
            if (el.length === 0) {
                return undefined;
            }
            return el[0];
        }
        s.updateClickedSlide = function (e) {
            var slide = findElementInEvent(e, '.' + s.params.slideClass);
            if (slide) {
                s.clickedSlide = slide;
                s.clickedIndex = $(slide).index();
            }
            else {
                s.clickedSlide = undefined;
                s.clickedIndex = undefined;
                return;
            }
            if (s.params.slideToClickedSlide && s.clickedIndex !== undefined && s.clickedIndex !== s.activeIndex) {
                var slideToIndex = s.clickedIndex,
                    realIndex;
                if (s.params.loop) {
                    realIndex = $(s.clickedSlide).attr('data-swiper-slide-index');
                    if (slideToIndex > s.slides.length - s.params.slidesPerView) {
                        s.fixLoop();
                        slideToIndex = s.wrapper.children('.' + s.params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]').eq(0).index();
                        setTimeout(function () {
                            s.slideTo(slideToIndex);
                        }, 0);
                    }
                    else if (slideToIndex < s.params.slidesPerView - 1) {
                        s.fixLoop();
                        var duplicatedSlides = s.wrapper.children('.' + s.params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]');
                        slideToIndex = duplicatedSlides.eq(duplicatedSlides.length - 1).index();
                        setTimeout(function () {
                            s.slideTo(slideToIndex);
                        }, 0);
                    }
                    else {
                        s.slideTo(slideToIndex);
                    }
                }
                else {
                    s.slideTo(slideToIndex);
                }
            }
        };
        
        var isTouched, 
            isMoved, 
            touchStartTime, 
            isScrolling, 
            currentTranslate, 
            startTranslate, 
            allowThresholdMove,
            // Form elements to match
            formElements = 'input, select, textarea, button',
            // Last click time
            lastClickTime = Date.now(), clickTimeout,
            //Velocities
            velocities = [], 
            allowMomentumBounce;
        
        // Animating Flag
        s.animating = false;
        
        // Touches information
        s.touches = {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            diff: 0
        };
        
        // Touch handlers
        var isTouchEvent;
        s.onTouchStart = function (e) {
            if (e.originalEvent) e = e.originalEvent;
            isTouchEvent = e.type === 'touchstart';
            if (!isTouchEvent && 'which' in e && e.which === 3) return;
            if (s.params.noSwiping && findElementInEvent(e, '.' + s.params.noSwipingClass)) {
                s.allowClick = true;
                return;
            }
            if (s.params.swipeHandler) {
                if (!findElementInEvent(e, s.params.swipeHandler)) return;
            }
            isTouched = true;
            isMoved = false;
            isScrolling = undefined;
            s.touches.startX = s.touches.currentX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
            s.touches.startY = s.touches.currentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
            touchStartTime = Date.now();
            s.allowClick = true;
            s.updateContainerSize();
            s.swipeDirection = undefined;
            if (s.params.threshold > 0) allowThresholdMove = false;
            if (e.type !== 'touchstart') {
                var preventDefault = true;
                if ($(e.target).is(formElements)) preventDefault = false;
                if (document.activeElement && $(document.activeElement).is(formElements)) document.activeElement.blur();
                if (preventDefault) {
                    e.preventDefault();
                }
            }
            if (s.params.onTouchStart) s.params.onTouchStart(s, e);
        };
        
        s.onTouchMove = function (e) {
            if (e.originalEvent) e = e.originalEvent;
            if (isTouchEvent && e.type === 'mousemove') return;
            if (e.preventedByNestedSwiper) return;
            if (s.params.onlyExternal) {
                isMoved = true;
                s.allowClick = false;
                return;
            }
            if (s.params.onTouchMove) s.params.onTouchMove(s, e);
            s.allowClick = false;
            if (e.targetTouches && e.targetTouches.length > 1) return;
            
            s.touches.currentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
            s.touches.currentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
        
            if (typeof isScrolling === 'undefined') {
                var touchAngle = Math.atan2(Math.abs(s.touches.currentY - s.touches.startY), Math.abs(s.touches.currentX - s.touches.startX)) * 180 / Math.PI;
                isScrolling = isH() ? touchAngle > s.params.touchAngle : (90 - touchAngle > s.params.touchAngle);
                // isScrolling = !!(isScrolling || Math.abs(touchesCurrent.y - touchesStart.y) > Math.abs(touchesCurrent.x - touchesStart.x));
            }
            if (isScrolling && s.params.onTouchMoveOpposite) {
                s.params.onTouchMoveOpposite(s, e);
            }
            if (!isTouched) return;
            if (isScrolling)  {
                isTouched = false;
                return;
            }
            if (s.params.onSliderMove) s.params.onSliderMove(s, e);
        
            e.preventDefault();
            if (s.params.touchMoveStopPropagation && !s.params.nested) {
                e.stopPropagation();
            }
        
            if (!isMoved) {
                if (params.loop) {
                    s.fixLoop();
                }
                startTranslate = s.params.effect === 'cube' ? ((s.rtl ? -s.translate: s.translate) || 0) : s.getWrapperTranslate();
                s.setWrapperTransition(0);
                if (s.animating) {
                    s.wrapper.trigger('webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd');
                }
                if (s.params.autoplay && s.autoplaying) {
                    if (s.params.autoplayDisableOnInteraction) {
                        s.stopAutoplay();
                    }
                    else {
                        s.pauseAutoplay();
                    }
                }
                allowMomentumBounce = false;
                //Grab Cursor
                if (s.params.grabCursor) {
                    s.container[0].style.cursor = 'move';
                    s.container[0].style.cursor = '-webkit-grabbing';
                    s.container[0].style.cursor = '-moz-grabbin';
                    s.container[0].style.cursor = 'grabbing';
                }
            }
            isMoved = true;
        
            var diff = s.touches.diff = isH() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;
        
            diff = diff * s.params.touchRatio;
            if (s.rtl) diff = -diff;
        
            s.swipeDirection = diff > 0 ? 'prev' : 'next';
            currentTranslate = diff + startTranslate;
        
            var disableParentSwiper = true;
            if ((diff > 0 && currentTranslate > s.minTranslate())) {
                disableParentSwiper = false;
                if (s.params.resistance) currentTranslate = s.minTranslate() - 1 + Math.pow(-s.minTranslate() + startTranslate + diff, s.params.resistanceRatio);
            }
            else if (diff < 0 && currentTranslate < s.maxTranslate()) {
                disableParentSwiper = false;
                if (s.params.resistance) currentTranslate = s.maxTranslate() + 1 - Math.pow(s.maxTranslate() - startTranslate - diff, s.params.resistanceRatio);
            }
            
            if (disableParentSwiper) {
                e.preventedByNestedSwiper = true;
            }
        
            // Directions locks
            if (!s.params.allowSwipeToNext && s.swipeDirection === 'next' && currentTranslate < startTranslate) {
                currentTranslate = startTranslate;
            }
            if (!s.params.allowSwipeToPrev && s.swipeDirection === 'prev' && currentTranslate > startTranslate) {
                currentTranslate = startTranslate;
            }
            
            if (!s.params.followFinger) return;
        
            // Threshold
            if (s.params.threshold > 0) {
                if (Math.abs(diff) > s.params.threshold || allowThresholdMove) {
                    if (!allowThresholdMove) {
                        allowThresholdMove = true;
                        s.touches.startX = s.touches.currentX;
                        s.touches.startY = s.touches.currentY;
                        currentTranslate = startTranslate;
                        s.touches.diff = isH() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;
                        return;
                    }
                }
                else {
                    currentTranslate = startTranslate;
                    return;
                }
            }
            // Update active index in free mode
            if (s.params.freeMode || s.params.watchSlidesProgress) {
                s.updateActiveIndex();
            }
            if (s.params.freeMode) {
                //Velocity
                if (velocities.length === 0) {
                    velocities.push({
                        position: s.touches[isH() ? 'startX' : 'startY'],
                        time: touchStartTime
                    });
                }
                velocities.push({
                    position: s.touches[isH() ? 'currentX' : 'currentY'],
                    time: (new Date()).getTime()
                });
            }
            // Update progress
            s.updateProgress(currentTranslate);
            // Update translate
            s.setWrapperTranslate(currentTranslate);
        };
        s.onTouchEnd = function (e) {
            if (e.originalEvent) e = e.originalEvent;
            if (s.params.onTouchEnd) s.params.onTouchEnd(s, e);
            if (!isTouched) return;
        
            //Return Grab Cursor
            if (s.params.grabCursor && isMoved && isTouched) {
                s.container[0].style.cursor = 'move';
                s.container[0].style.cursor = '-webkit-grab';
                s.container[0].style.cursor = '-moz-grab';
                s.container[0].style.cursor = 'grab';
            }
        
            // Time diff
            var touchEndTime = Date.now();
            var timeDiff = touchEndTime - touchStartTime;
        
            // Tap, doubleTap, Click
            if (s.allowClick) {
                s.updateClickedSlide(e);
                if (s.params.onTap) s.params.onTap(s, e);
                if (timeDiff < 300 && (touchEndTime - lastClickTime) > 300) {
                    if (clickTimeout) clearTimeout(clickTimeout);
                    clickTimeout = setTimeout(function () {
                        if (!s) return;
                        if (s.params.paginationHide && s.paginationContainer.length > 0 && !$(e.target).hasClass(s.params.bulletClass)) {
                            s.paginationContainer.toggleClass(s.params.paginationHiddenClass);
                        }
                        if (s.params.onClick) s.params.onClick(s, e);
                    }, 300);
                    
                }
                if (timeDiff < 300 && (touchEndTime - lastClickTime) < 300) {
                    if (clickTimeout) clearTimeout(clickTimeout);
                    if (s.params.onDoubleTap) {
                        s.params.onDoubleTap(s, e);
                    }
                }
            }
        
            lastClickTime = Date.now();
            setTimeout(function () {
                if (s && s.allowClick) s.allowClick = true;
            }, 0);
        
            if (!isTouched || !isMoved || !s.swipeDirection || s.touches.diff === 0 || currentTranslate === startTranslate) {
                isTouched = isMoved = false;
                return;
            }
            isTouched = isMoved = false;
        
            var currentPos;
            if (s.params.followFinger) {
                currentPos = s.rtl ? s.translate : -s.translate;
            }
            else {
                currentPos = -currentTranslate;
            }
            if (s.params.freeMode) {
                if (currentPos < -s.minTranslate()) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                else if (currentPos > -s.maxTranslate()) {
                    s.slideTo(s.slides.length - 1);
                    return;
                }
                
                if (s.params.freeModeMomentum) {
                    if (velocities.length > 1) {
                        var lastMoveEvent = velocities.pop(), velocityEvent = velocities.pop();
        
                        var distance = lastMoveEvent.position - velocityEvent.position;
                        var time = lastMoveEvent.time - velocityEvent.time;
                        s.velocity = distance / time;
                        s.velocity = s.velocity / 2;
                        if (Math.abs(s.velocity) < 0.02) {
                            s.velocity = 0;
                        }
                        // this implies that the user stopped moving a finger then released.
                        // There would be no events with distance zero, so the last event is stale.
                        if (time > 150 || (new Date().getTime() - lastMoveEvent.time) > 300) {
                            s.velocity = 0;
                        }
                    } else {
                        s.velocity = 0;
                    }
        
                    velocities.length = 0;
                    var momentumDuration = 1000 * s.params.freeModeMomentumRatio;
                    var momentumDistance = s.velocity * momentumDuration;
        
                    var newPosition = s.translate + momentumDistance;
                    if (s.rtl) newPosition = - newPosition;
                    var doBounce = false;
                    var afterBouncePosition;
                    var bounceAmount = Math.abs(s.velocity) * 20 * s.params.freeModeMomentumBounceRatio;
                    if (newPosition < s.maxTranslate()) {
                        if (s.params.freeModeMomentumBounce) {
                            if (newPosition + s.maxTranslate() < -bounceAmount) {
                                newPosition = s.maxTranslate() - bounceAmount;
                            }
                            afterBouncePosition = s.maxTranslate();
                            doBounce = true;
                            allowMomentumBounce = true;
                        }
                        else {
                            newPosition = s.maxTranslate();
                        }
                    }
                    if (newPosition > s.minTranslate()) {
                        if (s.params.freeModeMomentumBounce) {
                            if (newPosition - s.minTranslate() > bounceAmount) {
                                newPosition = s.minTranslate() + bounceAmount;
                            }
                            afterBouncePosition = s.minTranslate();
                            doBounce = true;
                            allowMomentumBounce = true;
                        }
                        else {
                            newPosition = s.minTranslate();
                        }
                    }
                    //Fix duration
                    if (s.velocity !== 0) {
                        if (s.rtl) {
                            momentumDuration = Math.abs((-newPosition - s.translate) / s.velocity);
                        }
                        else {
                            momentumDuration = Math.abs((newPosition - s.translate) / s.velocity);
                        }
                    }
        
                    if (s.params.freeModeMomentumBounce && doBounce) {
                        s.updateProgress(afterBouncePosition);
                        s.setWrapperTransition(momentumDuration);
                        s.setWrapperTranslate(newPosition);
                        s.onTransitionStart();
                        s.animating = true;
                        s.wrapper.transitionEnd(function () {
                            if (!allowMomentumBounce) return;
                            if (s.params.onMomentumBounce) s.params.onMomentumBounce(s);
        
                            s.setWrapperTransition(s.params.speed);
                            s.setWrapperTranslate(afterBouncePosition);
                            s.wrapper.transitionEnd(function () {
                                s.onTransitionEnd();
                            });
                        });
                    } else if (s.velocity) {
                        s.updateProgress(newPosition);
                        s.setWrapperTransition(momentumDuration);
                        s.setWrapperTranslate(newPosition);
                        s.onTransitionStart();
                        if (!s.animating) {
                            s.animating = true;
                            s.wrapper.transitionEnd(function () {
                                s.onTransitionEnd();
                            });
                        }
                            
                    } else {
                        s.updateProgress(newPosition);
                    }
                    
                    s.updateActiveIndex();
                }
                if (!s.params.freeModeMomentum || timeDiff >= s.params.longSwipesMs) {
                    s.updateProgress();
                    s.updateActiveIndex();
                }
                return;
            }
        
            // Find current slide
            var i, stopIndex = 0, groupSize = s.slidesSizesGrid[0];
            for (i = 0; i < s.slidesGrid.length; i += s.params.slidesPerGroup) {
                if (typeof s.slidesGrid[i + s.params.slidesPerGroup] !== 'undefined') {
                    if (currentPos >= s.slidesGrid[i] && currentPos < s.slidesGrid[i + s.params.slidesPerGroup]) {
                        stopIndex = i;
                        groupSize = s.slidesGrid[i + s.params.slidesPerGroup] - s.slidesGrid[i];
                    }
                }
                else {
                    if (currentPos >= s.slidesGrid[i]) {
                        stopIndex = i;
                        groupSize = s.slidesGrid[s.slidesGrid.length - 1] - s.slidesGrid[s.slidesGrid.length - 2];
                    }
                }
            }
        
            // Find current slide size
            var ratio = (currentPos - s.slidesGrid[stopIndex]) / groupSize;
            
            if (timeDiff > s.params.longSwipesMs) {
                // Long touches
                if (!s.params.longSwipes) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                if (s.swipeDirection === 'next') {
                    if (ratio >= s.params.longSwipesRatio) s.slideTo(stopIndex + s.params.slidesPerGroup);
                    else s.slideTo(stopIndex);
        
                }
                if (s.swipeDirection === 'prev') {
                    if (ratio > (1 - s.params.longSwipesRatio)) s.slideTo(stopIndex + s.params.slidesPerGroup);
                    else s.slideTo(stopIndex);
                }
            }
            else {
                // Short swipes
                if (!s.params.shortSwipes) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                if (s.swipeDirection === 'next') {
                    s.slideTo(stopIndex + s.params.slidesPerGroup);
        
                }
                if (s.swipeDirection === 'prev') {
                    s.slideTo(stopIndex);
                }
            }
        };
        /*=========================
          Transitions
          ===========================*/
        s._slideTo = function (slideIndex, speed) {
            return s.slideTo(slideIndex, speed, true, true);
        };
        s.slideTo = function (slideIndex, speed, runCallbacks, internal) {
            if (typeof runCallbacks === 'undefined') runCallbacks = true;
            if (typeof slideIndex === 'undefined') slideIndex = 0;
            if (slideIndex < 0) slideIndex = 0;
            s.snapIndex = Math.floor(slideIndex / s.params.slidesPerGroup);
            if (s.snapIndex >= s.snapGrid.length) s.snapIndex = s.snapGrid.length - 1;
            
            var translate = - s.snapGrid[s.snapIndex];
        
            // Stop autoplay
        
            if (s.params.autoplay && s.autoplaying) {
                if (internal || !s.params.autoplayDisableOnInteraction) {
                    s.pauseAutoplay(speed);
                }
                else {
                    s.stopAutoplay();
                }
            }
            // Update progress
            s.updateProgress(translate);
        
            // Normalize slideIndex
            for (var i = 0; i < s.slidesGrid.length; i++) {
                if (- translate >= s.slidesGrid[i]) {
                    slideIndex = i;
                }
            }
        
            if (typeof speed === 'undefined') speed = s.params.speed;
            s.previousIndex = s.activeIndex || 0;
            s.activeIndex = slideIndex;
            
            if (translate === s.translate) {
                s.updateClasses();
                return false;
            }
            s.onTransitionStart(runCallbacks);
            var translateX = isH() ? translate : 0, translateY = isH() ? 0 : translate;
            if (speed === 0) {
                s.setWrapperTransition(0);
                s.setWrapperTranslate(translate);
                s.onTransitionEnd(runCallbacks);
            }
            else {
                s.setWrapperTransition(speed);
                s.setWrapperTranslate(translate);
                if (!s.animating) {
                    s.animating = true;
                    s.wrapper.transitionEnd(function () {
                        s.onTransitionEnd(runCallbacks);
                    });
                }
                    
            }
            s.updateClasses();
            return true;
        };
        
        s.onTransitionStart = function (runCallbacks) {
            if (typeof runCallbacks === 'undefined') runCallbacks = true;
            if (runCallbacks) {
                if (s.params.onTransitionStart) s.params.onTransitionStart(s);
                if (s.params.onSlideChangeStart && s.activeIndex !== s.previousIndex) s.params.onSlideChangeStart(s);
            }
        };
        s.onTransitionEnd = function (runCallbacks) {
            s.animating = false;
            s.setWrapperTransition(0);
            if (typeof runCallbacks === 'undefined') runCallbacks = true;
            if (runCallbacks) {
                if (s.params.onTransitionEnd) s.params.onTransitionEnd(s);
                if (s.params.onSlideChangeEnd && s.activeIndex !== s.previousIndex) s.params.onSlideChangeEnd(s);
            }
                
        };
        s.slideNext = function (runCallbacks, speed, internal) {
            if (s.params.loop) {
                if (s.animating) return false;
                s.fixLoop();
                var clientLeft = s.container[0].clientLeft;
                return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
            }
            else return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
        };
        s._slideNext = function (speed) {
            return s.slideNext(true, speed, true);
        };
        s.slidePrev = function (runCallbacks, speed, internal) {
            if (s.params.loop) {
                if (s.animating) return false;
                s.fixLoop();
                var clientLeft = s.container[0].clientLeft;
                return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
            }
            else return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
        };
        s._slidePrev = function (speed) {
            return s.slidePrev(true, speed, true);
        };
        s.slideReset = function (runCallbacks, speed, internal) {
            return s.slideTo(s.activeIndex, speed, runCallbacks);
        };
        
        /*=========================
          Translate/transition helpers
          ===========================*/
        s.setWrapperTransition = function (duration, byController) {
            s.wrapper.transition(duration);
            if (s.params.onSetTransition) s.params.onSetTransition(s, duration);
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                s.effects[s.params.effect].setTransition(duration);
            }
            if (s.params.parallax && s.parallax) {
                s.parallax.setTransition(duration);
            }
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.setTransition(duration);
            }
            if (s.params.control && s.controller) {
                s.controller.setTransition(duration, byController);
            }
        };
        s.setWrapperTranslate = function (translate, updateActiveIndex, byController) {
            var x = 0, y = 0, z = 0;
            if (isH()) {
                x = s.rtl ? -translate : translate;
            }
            else {
                y = translate;
            }
            
            if (s.support.transforms3d) s.wrapper.transform('translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)');
            else s.wrapper.transform('translate(' + x + 'px, ' + y + 'px)');
            s.translate = isH() ? x : y;
            if (updateActiveIndex) s.updateActiveIndex();
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                s.effects[s.params.effect].setTranslate(s.translate);
            }
            if (s.params.parallax && s.parallax) {
                s.parallax.setTranslate(s.translate);
            }
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.setTranslate(s.translate);
            }
            if (s.params.control && s.controller) {
                s.controller.setTranslate(s.translate, byController);
            }
            if (s.params.hashnav && s.hashnav) {
                s.hashnav.setHash();
            }
            if (s.params.onSetTranslate) s.params.onSetTranslate(s, s.translate);
        };
        
        s.getTranslate = function (el, axis) {
            var matrix, curTransform, curStyle, transformMatrix;
        
            // automatic axis detection
            if (typeof axis === 'undefined') {
                axis = 'x';
            }
        
            curStyle = window.getComputedStyle(el, null);
            if (window.WebKitCSSMatrix) {
                // Some old versions of Webkit choke when 'none' is passed; pass
                // empty string instead in this case
                transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
            }
            else {
                transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
                matrix = transformMatrix.toString().split(',');
            }
        
            if (axis === 'x') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m41;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[12]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[4]);
            }
            if (axis === 'y') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m42;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[13]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[5]);
            }
            if (s.rtl && curTransform) curTransform = -curTransform;
            return curTransform || 0;
        };
        s.getWrapperTranslate = function (axis) {
            if (typeof axis === 'undefined') {
                axis = isH() ? 'x' : 'y';
            }
            return s.getTranslate(s.wrapper[0], axis);
        };
        
        /*=========================
          Observer
          ===========================*/
        s.observers = [];
        function initObserver(target, options) {
            options = options || {};
            // create an observer instance
            var ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
            var observer = new ObserverFunc(function (mutations) {
                mutations.forEach(function (mutation) {
                    s.onResize();
                });
            });
             
            observer.observe(target, {
                attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
                childList: typeof options.childList === 'undefined' ? true : options.childList,
                characterData: typeof options.characterData === 'undefined' ? true : options.characterData
            });
        
            s.observers.push(observer);
        }
        s.initObservers = function () {
            if (s.params.observeParents) {
                var containerParents = s.container.parents();
                for (var i = 0; i < containerParents.length; i++) {
                    initObserver(containerParents[i]);
                }
            }
        
            // Observe container
            initObserver(s.container[0], {childList: false});
        
            // Observe wrapper
            initObserver(s.wrapper[0], {attributes: false});
        };
        s.disconnectObservers = function () {
            for (var i = 0; i < s.observers.length; i++) {
                s.observers[i].disconnect();
            }
            s.observers = [];
        };
        /*=========================
          Loop
          ===========================*/
        // Create looped slides
        s.createLoop = function () {
            // Remove duplicated slides
            s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass).remove();
        
            var slides = s.wrapper.children('.' + s.params.slideClass);
            s.loopedSlides = parseInt(s.params.loopedSlides || s.params.slidesPerView, 10);
            s.loopedSlides = s.loopedSlides + s.params.loopAdditionalSlides;
            if (s.loopedSlides > slides.length) {
                s.loopedSlides = slides.length;
            }
        
            var prependSlides = [], appendSlides = [], i;
            slides.each(function (index, el) {
                var slide = $(this);
                if (index < s.loopedSlides) appendSlides.push(el);
                if (index < slides.length && index >= slides.length - s.loopedSlides) prependSlides.push(el);
                slide.attr('data-swiper-slide-index', index);
            });
            for (i = 0; i < appendSlides.length; i++) {
                s.wrapper.append($(appendSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
            }
            for (i = prependSlides.length - 1; i >= 0; i--) {
                s.wrapper.prepend($(prependSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
            }
        };
        s.destroyLoop = function () {
            s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass).remove();
        };
        s.fixLoop = function () {
            var newIndex;
            //Fix For Negative Oversliding
            if (s.activeIndex < s.loopedSlides) {
                newIndex = s.slides.length - s.loopedSlides * 3 + s.activeIndex;
                newIndex = newIndex + s.loopedSlides;
                s.slideTo(newIndex, 0, false, true);
            }
            //Fix For Positive Oversliding
            else if ((s.params.slidesPerView === 'auto' && s.activeIndex >= s.loopedSlides * 2) || (s.activeIndex > s.slides.length - s.params.slidesPerView * 2)) {
                newIndex = -s.slides.length + s.activeIndex + s.loopedSlides;
                newIndex = newIndex + s.loopedSlides;
                s.slideTo(newIndex, 0, false, true);
            }
        };
        /*=========================
          Append/Prepend/Remove Slides
          ===========================*/
        s.appendSlide = function (slides) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            if (typeof slides === 'object' && slides.length) {
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i]) s.wrapper.append(slides[i]);
                }
            }
            else {
                s.wrapper.append(slides);
            }
            if (s.params.loop) {
                s.createLoop();
            }
            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
        };
        s.prependSlide = function (slides) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            var newActiveIndex = s.activeIndex + 1;
            if (typeof slides === 'object' && slides.length) {
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i]) s.wrapper.prepend(slides[i]);
                }
                newActiveIndex = s.activeIndex + slides.length;
            }
            else {
                s.wrapper.prepend(slides);
            }
            if (s.params.loop) {
                s.createLoop();
            }
            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
            s.slideTo(newActiveIndex, 0, false);
        };
        s.removeSlide = function (slidesIndexes) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            var newActiveIndex = s.activeIndex,
                indexToRemove;
            if (typeof slidesIndexes === 'object' && slidesIndexes.length) {
                for (var i = 0; i < slidesIndexes.length; i++) {
                    indexToRemove = slidesIndexes[i];
                    if (s.slides[indexToRemove]) s.slides.eq(indexToRemove).remove();
                    if (indexToRemove < newActiveIndex) newActiveIndex--;
                }
                newActiveIndex = Math.max(newActiveIndex, 0);
            }
            else {
                indexToRemove = slidesIndexes;
                if (s.slides[indexToRemove]) s.slides.eq(indexToRemove).remove();
                if (indexToRemove < newActiveIndex) newActiveIndex--;
                newActiveIndex = Math.max(newActiveIndex, 0);
            }
        
            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
            s.slideTo(newActiveIndex, 0, false);
        };
        s.removeAllSlides = function () {
            var slidesIndexes = [];
            for (var i = 0; i < s.slides.length; i++) {
                slidesIndexes.push(i);
            }
            s.removeSlide(slidesIndexes);
        };
        

        /*=========================
          Effects
          ===========================*/
        s.effects = {
            fade: {
                setTranslate: function () {
                    for (var i = 0; i < s.slides.length; i++) {
                        var slide = s.slides.eq(i);
                        var offset = slide[0].swiperSlideOffset;
                        var tx = -offset - s.translate;
                        var ty = 0;
                        if (!isH()) {
                            ty = tx;
                            tx = 0;
                        }
                        var slideOpacity = s.params.fade.crossFade ?
                                Math.max(1 - Math.abs(slide[0].progress), 0) :
                                1 + Math.min(Math.max(slide[0].progress, -1), 0);
                        slide
                            .css({
                                opacity: slideOpacity
                            })
                            .transform('translate3d(' + tx + 'px, ' + ty + 'px, 0px)');
        
                    }
                },
                setTransition: function (duration) {
                    s.slides.transition(duration);
                }
            },
            cube: {
                setTranslate: function () {
                    var wrapperRotate = 0, cubeShadow;
                    if (s.params.cube.shadow) {
                        if (isH()) {
                            cubeShadow = s.wrapper.find('.swiper-cube-shadow');
                            if (cubeShadow.length === 0) {
                                cubeShadow = $('<div class="swiper-cube-shadow"></div>');
                                s.wrapper.append(cubeShadow);
                            }
                            cubeShadow.css({height: s.width + 'px'});
                        }
                        else {
                            cubeShadow = s.container.find('.swiper-cube-shadow');
                            if (cubeShadow.length === 0) {
                                cubeShadow = $('<div class="swiper-cube-shadow"></div>');
                                s.container.append(cubeShadow);
                            }
                        }
                    }
                    for (var i = 0; i < s.slides.length; i++) {
                        var slide = s.slides.eq(i);
                        var slideAngle = i * 90;
                        var round = Math.floor(slideAngle / 360);
                        if (s.rtl) {
                            slideAngle = -slideAngle;
                            round = Math.floor(-slideAngle / 360);
                        }
                        var progress = Math.max(Math.min(slide[0].progress, 1), -1);
                        var tx = 0, ty = 0, tz = 0;
                        if (i % 4 === 0) {
                            tx = - round * 4 * s.size;
                            tz = 0;
                        }
                        else if ((i - 1) % 4 === 0) {
                            tx = 0;
                            tz = - round * 4 * s.size;
                        }
                        else if ((i - 2) % 4 === 0) {
                            tx = s.size + round * 4 * s.size;
                            tz = s.size;
                        }
                        else if ((i - 3) % 4 === 0) {
                            tx = - s.size;
                            tz = 3 * s.size + s.size * 4 * round;
                        }
                        if (s.rtl) {
                            tx = -tx;
                        }
                        
                        if (!isH()) {
                            ty = tx;
                            tx = 0;
                        }
                        
                        var transform = 'rotateX(' + (isH() ? 0 : -slideAngle) + 'deg) rotateY(' + (isH() ? slideAngle : 0) + 'deg) translate3d(' + tx + 'px, ' + ty + 'px, ' + tz + 'px)';
                        if (progress <= 1 && progress > -1) {
                            wrapperRotate = i * 90 + progress * 90;
                            if (s.rtl) wrapperRotate = -i * 90 - progress * 90;
                        }
                        slide.transform(transform);
                        if (s.params.cube.slideShadows) {
                            //Set shadows
                            var shadowBefore = isH() ? slide.find('.swiper-slide-shadow-left') : slide.find('.swiper-slide-shadow-top');
                            var shadowAfter = isH() ? slide.find('.swiper-slide-shadow-right') : slide.find('.swiper-slide-shadow-bottom');
                            if (shadowBefore.length === 0) {
                                shadowBefore = $('<div class="swiper-slide-shadow-' + (isH() ? 'left' : 'top') + '"></div>');
                                slide.append(shadowBefore);
                            }
                            if (shadowAfter.length === 0) {
                                shadowAfter = $('<div class="swiper-slide-shadow-' + (isH() ? 'right' : 'bottom') + '"></div>');
                                slide.append(shadowAfter);
                            }
                            var shadowOpacity = slide[0].progress;
                            if (shadowBefore.length) shadowBefore[0].style.opacity = -slide[0].progress;
                            if (shadowAfter.length) shadowAfter[0].style.opacity = slide[0].progress;
                        }
                    }
                    s.wrapper.css({
                        '-webkit-transform-origin': '50% 50% -' + (s.size / 2) + 'px',
                        '-moz-transform-origin': '50% 50% -' + (s.size / 2) + 'px',
                        '-ms-transform-origin': '50% 50% -' + (s.size / 2) + 'px',
                        'transform-origin': '50% 50% -' + (s.size / 2) + 'px'
                    });
                        
                    if (s.params.cube.shadow) {
                        if (isH()) {
                            cubeShadow.transform('translate3d(0px, ' + (s.width / 2 + s.params.cube.shadowOffset) + 'px, ' + (-s.width / 2) + 'px) rotateX(90deg) rotateZ(0deg) scale(' + (s.params.cube.shadowScale) + ')');
                        }
                        else {
                            var shadowAngle = Math.abs(wrapperRotate) - Math.floor(Math.abs(wrapperRotate) / 90) * 90;
                            var multiplier = 1.5 - (Math.sin(shadowAngle * 2 * Math.PI / 360) / 2 + Math.cos(shadowAngle * 2 * Math.PI / 360) / 2);
                            var scale1 = s.params.cube.shadowScale,
                                scale2 = s.params.cube.shadowScale / multiplier,
                                offset = s.params.cube.shadowOffset;
                            cubeShadow.transform('scale3d(' + scale1 + ', 1, ' + scale2 + ') translate3d(0px, ' + (s.height / 2 + offset) + 'px, ' + (-s.height / 2 / scale2) + 'px) rotateX(-90deg)');
                        }
                    }
                    var zFactor = (s.isSafari || s.isUiWebView) ? (-s.size / 2) : 0;
                    s.wrapper.transform('translate3d(0px,0,' + zFactor + 'px) rotateX(' + (isH() ? 0 : wrapperRotate) + 'deg) rotateY(' + (isH() ? -wrapperRotate : 0) + 'deg)');
                },
                setTransition: function (duration) {
                    s.slides.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);
                    if (s.params.cube.shadow && !isH()) {
                        s.container.find('.swiper-cube-shadow').transition(duration);
                    }
                }
            },
            coverflow: {
                setTranslate: function () {
                    var transform = s.translate;
                    var center = isH() ? -transform + s.width / 2 : -transform + s.height / 2;
                    var rotate = isH() ? s.params.coverflow.rotate: -s.params.coverflow.rotate;
                    var translate = s.params.coverflow.depth;
                    //Each slide offset from center
                    for (var i = 0, length = s.slides.length; i < length; i++) {
                        var slide = s.slides.eq(i);
                        var slideSize = s.slidesSizesGrid[i];
                        var slideOffset = slide[0].swiperSlideOffset;
                        var offsetMultiplier = (center - slideOffset - slideSize / 2) / slideSize * s.params.coverflow.modifier;
        
                        var rotateY = isH() ? rotate * offsetMultiplier : 0;
                        var rotateX = isH() ? 0 : rotate * offsetMultiplier;
                        // var rotateZ = 0
                        var translateZ = -translate * Math.abs(offsetMultiplier);
        
                        var translateY = isH() ? 0 : s.params.coverflow.stretch * (offsetMultiplier);
                        var translateX = isH() ? s.params.coverflow.stretch * (offsetMultiplier) : 0;
        
                        //Fix for ultra small values
                        if (Math.abs(translateX) < 0.001) translateX = 0;
                        if (Math.abs(translateY) < 0.001) translateY = 0;
                        if (Math.abs(translateZ) < 0.001) translateZ = 0;
                        if (Math.abs(rotateY) < 0.001) rotateY = 0;
                        if (Math.abs(rotateX) < 0.001) rotateX = 0;
        
                        var slideTransform = 'translate3d(' + translateX + 'px,' + translateY + 'px,' + translateZ + 'px)  rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
        
                        slide.transform(slideTransform);
                        slide[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
                        if (s.params.coverflow.slideShadows) {
                            //Set shadows
                            var shadowBefore = isH() ? slide.find('.swiper-slide-shadow-left') : slide.find('.swiper-slide-shadow-top');
                            var shadowAfter = isH() ? slide.find('.swiper-slide-shadow-right') : slide.find('.swiper-slide-shadow-bottom');
                            if (shadowBefore.length === 0) {
                                shadowBefore = $('<div class="swiper-slide-shadow-' + (isH() ? 'left' : 'top') + '"></div>');
                                slide.append(shadowBefore);
                            }
                            if (shadowAfter.length === 0) {
                                shadowAfter = $('<div class="swiper-slide-shadow-' + (isH() ? 'right' : 'bottom') + '"></div>');
                                slide.append(shadowAfter);
                            }
                            if (shadowBefore.length) shadowBefore[0].style.opacity = offsetMultiplier > 0 ? offsetMultiplier : 0;
                            if (shadowAfter.length) shadowAfter[0].style.opacity = (-offsetMultiplier) > 0 ? -offsetMultiplier : 0;
                        }
                    }
        
                    //Set correct perspective for IE10
                    if (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) {
                        var ws = s.wrapper.style;
                        ws.perspectiveOrigin = center + 'px 50%';
                    }
                },
                setTransition: function (duration) {
                    s.slides.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);
                }
            }
        };

        /*=========================
          Scrollbar
          ===========================*/
        s.scrollbar = {
            set: function () {
                if (!s.params.scrollbar) return;
                var sb = s.scrollbar;
                sb.track = $(s.params.scrollbar);
                sb.drag = sb.track.find('.swiper-scrollbar-drag');
                if (sb.drag.length === 0) {
                    sb.drag = $('<div class="swiper-scrollbar-drag"></div>');
                    sb.track.append(sb.drag);
                }
                sb.drag[0].style.width = '';
                sb.drag[0].style.height = '';
                sb.trackSize = isH() ? sb.track[0].offsetWidth : sb.track[0].offsetHeight;
                
                sb.divider = s.size / s.virtualWidth;
                sb.moveDivider = sb.divider * (sb.trackSize / s.size);
                sb.dragSize = sb.trackSize * sb.divider;
        
                if (isH()) {
                    sb.drag[0].style.width = sb.dragSize + 'px';
                }
                else {
                    sb.drag[0].style.height = sb.dragSize + 'px';
                }
        
                if (sb.divider >= 1) {
                    sb.track[0].style.display = 'none';
                }
                else {
                    sb.track[0].style.display = '';
                }
                if (s.params.scrollbarHide) {
                    sb.track[0].style.opacity = 0;
                }
            },
            setTranslate: function () {
                if (!s.params.scrollbar) return;
                var diff;
                var sb = s.scrollbar;
                var translate = s.translate || 0;
                var newPos;
                
                var newSize = sb.dragSize;
                newPos = (sb.trackSize - sb.dragSize) * s.progress;
                if (s.rtl && isH()) {
                    newPos = -newPos;
                    if (newPos > 0) {
                        newSize = sb.dragSize - newPos;
                        newPos = 0;
                    }
                    else if (-newPos + sb.dragSize > sb.trackSize) {
                        newSize = sb.trackSize + newPos;
                    }
                }
                else {
                    if (newPos < 0) {
                        newSize = sb.dragSize + newPos;
                        newPos = 0;
                    }
                    else if (newPos + sb.dragSize > sb.trackSize) {
                        newSize = sb.trackSize - newPos;
                    }
                }
                if (isH()) {
                    sb.drag.transform('translate3d(' + (newPos) + 'px, 0, 0)');
                    sb.drag[0].style.width = newSize + 'px';
                }
                else {
                    sb.drag.transform('translate3d(0px, ' + (newPos) + 'px, 0)');
                    sb.drag[0].style.height = newSize + 'px';
                }
                if (s.params.scrollbarHide) {
                    clearTimeout(sb.timeout);
                    sb.track[0].style.opacity = 1;
                    sb.timeout = setTimeout(function () {
                        sb.track[0].style.opacity = 0;
                        sb.track.transition(400);
                    }, 1000);
                }
            },
            setTransition: function (duration) {
                if (!s.params.scrollbar) return;
                s.scrollbar.drag.transition(duration);
            }
        };

        /*=========================
          Controller
          ===========================*/
        s.controller = {
            setTranslate: function (translate, byController) {
                var controlled = s.params.control;
                var multiplier, controlledTranslate;
                if (s.isArray(controlled)) {
                    for (var i = 0; i < controlled.length; i++) {
                        if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
                            translate = controlled[i].rtl && controlled[i].params.direction === 'horizontal' ? -s.translate : s.translate;
                            multiplier = (controlled[i].maxTranslate() - controlled[i].minTranslate()) / (s.maxTranslate() - s.minTranslate());
                            controlledTranslate = (translate - s.minTranslate()) * multiplier + controlled[i].minTranslate();
                            if (s.params.controlInverse) {
                                controlledTranslate = controlled[i].maxTranslate() - controlledTranslate;
                            }
                            controlled[i].updateProgress(controlledTranslate);
                            controlled[i].setWrapperTranslate(controlledTranslate, false, s);
                            controlled[i].updateActiveIndex();
                        }
                    }
                }
                else if (controlled instanceof Swiper && byController !== controlled) {
                    translate = controlled.rtl && controlled.params.direction === 'horizontal' ? -s.translate : s.translate;
                    multiplier = (controlled.maxTranslate() - controlled.minTranslate()) / (s.maxTranslate() - s.minTranslate());
                    controlledTranslate = (translate - s.minTranslate()) * multiplier + controlled.minTranslate();
                    if (s.params.controlInverse) {
                        controlledTranslate = controlled.maxTranslate() - controlledTranslate;
                    }
                    controlled.updateProgress(controlledTranslate);
                    controlled.setWrapperTranslate(controlledTranslate, false, s);
                    controlled.updateActiveIndex();
                }
            },
            setTransition: function (duration, byController) {
                var controlled = s.params.control;
                if (s.isArray(controlled)) {
                    for (var i = 0; i < controlled.length; i++) {
                        if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
                            controlled[i].setWrapperTransition(duration, s);
                        }
                    }
                }
                else if (controlled instanceof Swiper && byController !== controlled) {
                    controlled.setWrapperTransition(duration, s);
                }
            }
        };

        /*=========================
          Hash Navigation
          ===========================*/
        s.hashnav = {
            init: function () {
                if (!s.params.hashnav) return;
                s.hashnav.initialized = true;
                var hash = document.location.hash.replace('#', '');
                if (!hash) return;
                var speed = 0;
                for (var i = 0, length = s.slides.length; i < length; i++) {
                    var slide = s.slides.eq(i);
                    var slideHash = slide.attr('data-hash');
                    if (slideHash === hash && !slide.hasClass(s.params.slideDuplicateClass)) {
                        var index = slide.index();
                        s._slideTo(index, speed);
                    }
                }
            },
            setHash: function () {
                if (!s.hashnav.initialized || !s.params.hashnav) return;
                document.location.hash = s.slides.eq(s.activeIndex).attr('data-hash') || '';
            }
        };

        /*=========================
          Keyboard Control
          ===========================*/
        function handleKeyboard(e) {
            if (e.originalEvent) e = e.originalEvent; //jquery fix
            var kc = e.keyCode || e.charCode;
            if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
            if (document.activeElement && document.activeElement.nodeName && (document.activeElement.nodeName.toLowerCase() === 'input' || document.activeElement.nodeName.toLowerCase() === 'textarea')) {
                return false;
            }
            if (kc === 37 || kc === 39 || kc === 38 || kc === 40) {
                var inView = false;
                //Check that swiper should be inside of visible area of window
                if (s.container.parents('.swiper-slide').length > 0 && s.container.parents('.swiper-slide-active').length === 0) {
                    return;
                }
                var windowScroll = {
                    left: window.pageXOffset,
                    top: window.pageYOffset
                };
                var windowWidth = window.innerWidth;
                var windowHeight = window.innerHeight;
                var swiperOffset = s.container.offset();
                
                var swiperCoord = [
                    [swiperOffset.left, swiperOffset.top],
                    [swiperOffset.left + s.width, swiperOffset.top],
                    [swiperOffset.left, swiperOffset.top + s.height],
                    [swiperOffset.left + s.width, swiperOffset.top + s.height]
                ];
                for (var i = 0; i < swiperCoord.length; i++) {
                    var point = swiperCoord[i];
                    if (
                        point[0] >= windowScroll.left && point[0] <= windowScroll.left + windowWidth &&
                        point[1] >= windowScroll.top && point[1] <= windowScroll.top + windowHeight
                    ) {
                        inView = true;
                    }
        
                }
                if (!inView) return;
            }
            if (isH()) {
                if (kc === 37 || kc === 39) {
                    if (e.preventDefault) e.preventDefault();
                    else e.returnValue = false;
                }
                if (kc === 39) s.slideNext();
                if (kc === 37) s.slidePrev();
            }
            else {
                if (kc === 38 || kc === 40) {
                    if (e.preventDefault) e.preventDefault();
                    else e.returnValue = false;
                }
                if (kc === 40) s.slideNext();
                if (kc === 38) s.slidePrev();
            }
        }
        s.disableKeyboardControl = function () {
            $(document).off('keydown', handleKeyboard);
        };
        s.enableKeyboardControl = function () {
            $(document).on('keydown', handleKeyboard);
        };
        

        /*=========================
          Mousewheel Control
          ===========================*/
        s._wheelEvent = false;
        s._lastWheelScrollTime = (new Date()).getTime();
        if (s.params.mousewheelControl) {
            if (document.onmousewheel !== undefined) {
                s._wheelEvent = 'mousewheel';
            }
            if (!s._wheelEvent) {
                try {
                    new WheelEvent('wheel');
                    s._wheelEvent = 'wheel';
                } catch (e) {}
            }
            if (!s._wheelEvent) {
                s._wheelEvent = 'DOMMouseScroll';
            }
        }
        function handleMousewheel(e) {
            if (e.originalEvent) e = e.originalEvent; //jquery fix
            var we = s._wheelEvent;
            var delta = 0;
            //Opera & IE
            if (e.detail) delta = -e.detail;
            //WebKits
            else if (we === 'mousewheel') {
                if (s.params.mousewheelForceToAxis) {
                    if (isH()) {
                        if (Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDeltaY)) delta = e.wheelDeltaX;
                        else return;
                    }
                    else {
                        if (Math.abs(e.wheelDeltaY) > Math.abs(e.wheelDeltaX)) delta = e.wheelDeltaY;
                        else return;
                    }
                }
                else {
                    delta = e.wheelDelta;
                }
            }
            //Old FireFox
            else if (we === 'DOMMouseScroll') delta = -e.detail;
            //New FireFox
            else if (we === 'wheel') {
                if (s.params.mousewheelForceToAxis) {
                    if (isH()) {
                        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) delta = -e.deltaX;
                        else return;
                    }
                    else {
                        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) delta = -e.deltaY;
                        else return;
                    }
                }
                else {
                    delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? - e.deltaX : - e.deltaY;
                }
            }
        
            if (!s.params.freeMode) {
                if ((new Date()).getTime() - s._lastWheelScrollTime > 60) {
                    if (delta < 0) s.slideNext();
                    else s.slidePrev();
                }
                s._lastWheelScrollTime = (new Date()).getTime();
        
            }
            else {
                //Freemode or scrollContainer:
                var position = s.getWrapperTranslate() + delta;
        
                if (position > 0) position = 0;
                if (position < s.maxTranslate()) position = s.maxTranslate();
        
                s.setWrapperTransition(0);
                s.setWrapperTranslate(position);
                s.updateProgress();
                s.updateActiveIndex();
        
                // Return page scroll on edge positions
                if (position === 0 || position === s.maxTranslate()) return;
            }
            if (s.params.autoplay) s.stopAutoplay();
        
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
            return false;
        }
        s.disableMousewheelControl = function () {
            if (!s._wheelEvent) return false;
            s.container.off(s._wheelEvent, handleMousewheel);
            return true;
        };
        
        s.enableMousewheelControl = function () {
            if (!s._wheelEvent) return false;
            s.container.on(s._wheelEvent, handleMousewheel);
            return true;
        };

        /*=========================
          Parallax
          ===========================*/
        function setParallaxTransform(el, progress) {
            el = $(el);
            var p, pX, pY, tX, tY;
            
            p = el.attr('data-swiper-parallax');
            pX = el.attr('data-swiper-parallax-x');
            pY = el.attr('data-swiper-parallax-y');
            if (!pX && !pY && p) {
                if (isH()) {
                    pX = p;
                    pY = '0';
                }
                else {
                    pY = p;
                    pX = '0';
                }
            }
            else {
                if (pX) pX = pX;
                else pX = '0';
                if (pY) pY = pY;
                else pY = '0';
            }
            if ((pX).indexOf('%') >= 0) {
                pX = parseInt(pX, 10) * progress + '%';
            }
            else {
                pX = pX * progress + 'px' ;
            }
            if ((pY).indexOf('%') >= 0) {
                pY = parseInt(pY, 10) * progress + '%';
            }
            else {
                pY = pY * progress + 'px' ;
            }
            tX = pX;
            tY = pY;
        
            el.transform('translate3d(' + tX + ', ' + tY + ',0px)');
        }   
        s.parallax = {
            setTranslate: function () {
                s.container.children('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function(){
                    setParallaxTransform(this, s.progress);
                    
                });
                s.slides.each(function () {
                    var slide = $(this);
                    slide.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function () {
                        var progress = Math.min(Math.max(slide[0].progress, -1), 1);
                        setParallaxTransform(this, progress);
                    });
                });
            },
            setTransition: function (duration) {
                if (typeof duration === 'undefined') duration = s.params.speed;
                s.container.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function(){
                    var el = $(this);
                    var parallaxDuration = parseInt(el.attr('data-swiper-parallax-duration'), 10) || duration;
                    if (duration === 0) parallaxDuration = 0;
                    el.transition(parallaxDuration);
                });
            }
        };
            

        /*=========================
          Init/Destroy
          ===========================*/
        s.init = function () {
            if (s.params.loop) s.createLoop();
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updatePagination();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                if (!s.params.loop) s.updateProgress();
                s.effects[s.params.effect].setTranslate();
            }
            if (s.params.loop) {
                s.slideTo(s.params.initialSlide + s.loopedSlides, 0, s.params.runCallbacksOnInit);
            }
            else {
                s.slideTo(s.params.initialSlide, 0, s.params.runCallbacksOnInit);
                if (s.params.initialSlide === 0 && s.parallax && s.params.parallax) {
                    s.parallax.setTranslate();               
                }
            }
            s.attachEvents();
            if (s.params.observer && s.support.observer) {
                s.initObservers();
            }
            if (s.params.updateOnImagesReady) {
                s.preloadImages();
            }
            if (s.params.autoplay) {
                s.startAutoplay();
            }
            if (s.params.keyboardControl) {
                if (s.enableKeyboardControl) s.enableKeyboardControl();
            }
            if (s.params.mousewheelControl) {
                if (s.enableMousewheelControl) s.enableMousewheelControl();
            }
            if (s.params.hashnav) {
                if (s.hashnav) s.hashnav.init();
            }
            if (s.params.onInit) s.params.onInit(s);
        };
        
        // Destroy
        s.destroy = function (deleteInstance) {
            s.detachEvents();
            s.disconnectObservers();
            if (s.params.keyboardControl) {
                if (s.disableKeyboardControl) s.disableKeyboardControl();
            }
            if (s.params.mousewheelControl) {
                if (s.disableMousewheelControl) s.disableMousewheelControl();
            }
            if (s.params.onDestroy) s.params.onDestroy();
            if (deleteInstance !== false) s = null;
        };
        
        s.init();
        
        

        
        // Return swiper instance
        return s;
    };
    

    /*==================================================
        Prototype
    ====================================================*/
    Swiper.prototype = {
        isSafari: (function () {
            var ua = navigator.userAgent.toLowerCase();
            return (ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0);
        })(),
        isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent),
        isArray: function (arr) {
            return Object.prototype.toString.apply(arr) === '[object Array]';
        },
        /*==================================================
        Browser
        ====================================================*/
        browser: {
            ie: window.navigator.pointerEnabled || window.navigator.msPointerEnabled
        },
        /*==================================================
        Devices
        ====================================================*/
        device: (function () {
            var ua = navigator.userAgent;
            var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
            var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
            var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
            var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
            return {
                ios: ipad || iphone || ipad,
                android: android
            };
        })(),
        /*==================================================
        Feature Detection
        ====================================================*/
        support: {
            touch : (window.Modernizr && Modernizr.touch === true) || (function () {
                return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
            })(),
    
            transforms3d : (window.Modernizr && Modernizr.csstransforms3d === true) || (function () {
                var div = document.createElement('div').style;
                return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
            })(),
    
            flexbox: (function () {
                var div = document.createElement('div').style;
                var styles = ('WebkitBox msFlexbox MsFlexbox WebkitFlex MozBox flex').split(' ');
                for (var i = 0; i < styles.length; i++) {
                    if (styles[i] in div) return true;
                }
            })(),
    
            observer: (function () {
                return ('MutationObserver' in window || 'WebkitMutationObserver' in window);
            })()
        }
    };
    

    /*===========================
    Add .swiper plugin from Dom libraries
    ===========================*/
    var swiperDomPlugins = ['jQuery', 'Zepto', 'Dom7'];
    function addLibraryPlugin(lib) {
        lib.fn.swiper = function (params) {
            var firstInstance;
            lib(this).each(function () {
                var s = new Swiper(this, params);
                if (!firstInstance) firstInstance = s;
            });
            return firstInstance;
        };
    }
    for (var i = 0; i < swiperDomPlugins.length; i++) {
        if (window[swiperDomPlugins[i]]) {
            addLibraryPlugin(window[swiperDomPlugins[i]]);
        }
    }
    // Required DOM Plugins
    var domLib;
    if (typeof Dom7 === 'undefined') {
        domLib = window.Dom7 || window.Zepto || window.jQuery;
    }
    else {
        domLib = Dom7;
    }
    if (domLib) {
        if (!('transitionEnd' in domLib.fn)) {
            domLib.fn.transitionEnd = function (callback) {
                var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
                    i, j, dom = this;
                function fireCallBack(e) {
                    /*jshint validthis:true */
                    if (e.target !== this) return;
                    callback.call(this, e);
                    for (i = 0; i < events.length; i++) {
                        dom.off(events[i], fireCallBack);
                    }
                }
                if (callback) {
                    for (i = 0; i < events.length; i++) {
                        dom.on(events[i], fireCallBack);
                    }
                }
                return this;
            };
        }
        if (!('transform' in domLib.fn)) {
            domLib.fn.transform = function (transform) {
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
                }
                return this;
            };
        }
        if (!('transition' in domLib.fn)) {
            domLib.fn.transition = function (duration) {
                if (typeof duration !== 'string') {
                    duration = duration + 'ms';
                }
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
                }
                return this;
            };
        }
    }
        
    

})();
/*===========================
Swiper AMD Export
===========================*/
if (typeof(module) !== 'undefined')
{
    module.exports = Swiper;
}
else if (typeof define === 'function' && define.amd) {
    define([], function () {
        'use strict';
        return Swiper;
    });
}
/**
 * Swiper 3.0.3
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * 
 * http://www.idangero.us/swiper/
 * 
 * Copyright 2015, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us/
 * 
 * Licensed under MIT
 * 
 * Released on: March 1, 2015
 */
!function(){"use strict";function e(e){e.fn.swiper=function(a){var t;return e(this).each(function(){var e=new Swiper(this,a);t||(t=e)}),t}}window.Swiper=function(e,a){function t(){return"horizontal"===m.params.direction}function r(e){var a,t,r=function(){"undefined"!=typeof m&&null!==m&&(void 0!==m.imagesLoaded&&m.imagesLoaded++,m.imagesLoaded===m.imagesToLoad.length&&(m.update(),m.params.onImagesReady&&m.params.onImagesReady(m)))};e.complete?r():(t=e.currentSrc||e.getAttribute("src"),t?(a=new Image,a.onload=r,a.onerror=r,a.src=t):r())}function s(){m.autoplayTimeoutId=setTimeout(function(){m.params.loop?(m.fixLoop(),m._slideNext()):m.isEnd?a.autoplayStopOnLast?m.stopAutoplay():m._slideTo(0):m._slideNext()},m.params.autoplay)}function i(e,a){var t=f(e.target);if(!t.is(a))if("string"==typeof a)t=t.parents(a);else if(a.nodeType){var r;return t.parents().each(function(e,t){t===a&&(r=a)}),r?a:void 0}return 0===t.length?void 0:t[0]}function n(e,a){a=a||{};var t=window.MutationObserver||window.WebkitMutationObserver,r=new t(function(e){e.forEach(function(){m.onResize()})});r.observe(e,{attributes:"undefined"==typeof a.attributes?!0:a.attributes,childList:"undefined"==typeof a.childList?!0:a.childList,characterData:"undefined"==typeof a.characterData?!0:a.characterData}),m.observers.push(r)}function o(e){e.originalEvent&&(e=e.originalEvent);var a=e.keyCode||e.charCode;if(!(e.shiftKey||e.altKey||e.ctrlKey||e.metaKey)){if(document.activeElement&&document.activeElement.nodeName&&("input"===document.activeElement.nodeName.toLowerCase()||"textarea"===document.activeElement.nodeName.toLowerCase()))return!1;if(37===a||39===a||38===a||40===a){var r=!1;if(m.container.parents(".swiper-slide").length>0&&0===m.container.parents(".swiper-slide-active").length)return;for(var s={left:window.pageXOffset,top:window.pageYOffset},i=window.innerWidth,n=window.innerHeight,o=m.container.offset(),l=[[o.left,o.top],[o.left+m.width,o.top],[o.left,o.top+m.height],[o.left+m.width,o.top+m.height]],p=0;p<l.length;p++){var d=l[p];d[0]>=s.left&&d[0]<=s.left+i&&d[1]>=s.top&&d[1]<=s.top+n&&(r=!0)}if(!r)return}t()?((37===a||39===a)&&(e.preventDefault?e.preventDefault():e.returnValue=!1),39===a&&m.slideNext(),37===a&&m.slidePrev()):((38===a||40===a)&&(e.preventDefault?e.preventDefault():e.returnValue=!1),40===a&&m.slideNext(),38===a&&m.slidePrev())}}function l(e){e.originalEvent&&(e=e.originalEvent);var a=m._wheelEvent,r=0;if(e.detail)r=-e.detail;else if("mousewheel"===a)if(m.params.mousewheelForceToAxis)if(t()){if(!(Math.abs(e.wheelDeltaX)>Math.abs(e.wheelDeltaY)))return;r=e.wheelDeltaX}else{if(!(Math.abs(e.wheelDeltaY)>Math.abs(e.wheelDeltaX)))return;r=e.wheelDeltaY}else r=e.wheelDelta;else if("DOMMouseScroll"===a)r=-e.detail;else if("wheel"===a)if(m.params.mousewheelForceToAxis)if(t()){if(!(Math.abs(e.deltaX)>Math.abs(e.deltaY)))return;r=-e.deltaX}else{if(!(Math.abs(e.deltaY)>Math.abs(e.deltaX)))return;r=-e.deltaY}else r=Math.abs(e.deltaX)>Math.abs(e.deltaY)?-e.deltaX:-e.deltaY;if(m.params.freeMode){var s=m.getWrapperTranslate()+r;if(s>0&&(s=0),s<m.maxTranslate()&&(s=m.maxTranslate()),m.setWrapperTransition(0),m.setWrapperTranslate(s),m.updateProgress(),m.updateActiveIndex(),0===s||s===m.maxTranslate())return}else(new Date).getTime()-m._lastWheelScrollTime>60&&(0>r?m.slideNext():m.slidePrev()),m._lastWheelScrollTime=(new Date).getTime();return m.params.autoplay&&m.stopAutoplay(),e.preventDefault?e.preventDefault():e.returnValue=!1,!1}function p(e,a){e=f(e);var r,s,i,n,o;r=e.attr("data-swiper-parallax"),s=e.attr("data-swiper-parallax-x"),i=e.attr("data-swiper-parallax-y"),s||i||!r?(s=s?s:"0",i=i?i:"0"):t()?(s=r,i="0"):(i=r,s="0"),s=s.indexOf("%")>=0?parseInt(s,10)*a+"%":s*a+"px",i=i.indexOf("%")>=0?parseInt(i,10)*a+"%":i*a+"px",n=s,o=i,e.transform("translate3d("+n+", "+o+",0px)")}var d={direction:"horizontal",touchEventsTarget:"container",initialSlide:0,speed:300,autoplay:!1,autoplayDisableOnInteraction:!0,freeMode:!1,freeModeMomentum:!0,freeModeMomentumRatio:1,freeModeMomentumBounce:!0,freeModeMomentumBounceRatio:1,effect:"slide",coverflow:{rotate:50,stretch:0,depth:100,modifier:1,slideShadows:!0},cube:{slideShadows:!0,shadow:!0,shadowOffset:20,shadowScale:.94},fade:{crossFade:!1},parallax:!1,scrollbar:null,scrollbarHide:!0,keyboardControl:!1,mousewheelControl:!1,mousewheelForceToAxis:!1,hashnav:!1,spaceBetween:0,slidesPerView:1,slidesPerColumn:1,slidesPerColumnFill:"column",slidesPerGroup:1,centeredSlides:!1,touchRatio:1,touchAngle:45,simulateTouch:!0,shortSwipes:!0,longSwipes:!0,longSwipesRatio:.5,longSwipesMs:300,followFinger:!0,onlyExternal:!1,threshold:0,touchMoveStopPropagation:!0,pagination:null,paginationClickable:!1,paginationHide:!1,resistance:!0,resistanceRatio:.85,nextButton:null,prevButton:null,watchSlidesProgress:!1,watchVisibility:!1,grabCursor:!1,preventClicks:!0,preventClicksPropagation:!0,releaseFormElements:!0,slideToClickedSlide:!1,updateOnImagesReady:!0,loop:!1,loopAdditionalSlides:0,loopedSlides:null,control:void 0,controlInverse:!1,allowSwipeToPrev:!0,allowSwipeToNext:!0,swipeHandler:null,noSwiping:!0,noSwipingClass:"swiper-no-swiping",slideClass:"swiper-slide",slideActiveClass:"swiper-slide-active",slideVisibleClass:"swiper-slide-visible",slideDuplicateClass:"swiper-slide-duplicate",slideNextClass:"swiper-slide-next",slidePrevClass:"swiper-slide-prev",wrapperClass:"swiper-wrapper",bulletClass:"swiper-pagination-bullet",bulletActiveClass:"swiper-pagination-bullet-active",buttonDisabledClass:"swiper-button-disabled",paginationHiddenClass:"swiper-pagination-hidden",observer:!1,observeParents:!1,runCallbacksOnInit:!0};a=a||{};for(var c in d)if("undefined"==typeof a[c])a[c]=d[c];else if("object"==typeof a[c])for(var u in d[c])"undefined"==typeof a[c][u]&&(a[c][u]=d[c][u]);var m=this;m.params=a;var f;if(f="undefined"==typeof Dom7?window.Dom7||window.Zepto||window.jQuery:Dom7,f&&(m.container=f(e),0!==m.container.length)){if(m.container.length>1)return void m.container.each(function(){new Swiper(this,a)});m.container[0].swiper=m,m.container.data("swiper",m),m.container.addClass("swiper-container-"+m.params.direction),m.params.freeMode&&m.container.addClass("swiper-container-free-mode"),(m.params.parallax||m.params.watchVisibility)&&(m.params.watchSlidesProgress=!0),["cube","coverflow"].indexOf(m.params.effect)>=0&&(m.support.transforms3d?(m.params.watchSlidesProgress=!0,m.container.addClass("swiper-container-3d")):m.params.effect="slide"),"slide"!==m.params.effect&&m.container.addClass("swiper-container-"+m.params.effect),"cube"===m.params.effect&&(m.params.resistanceRatio=0,m.params.slidesPerView=1,m.params.slidesPerColumn=1,m.params.slidesPerGroup=1,m.params.centeredSlides=!1,m.params.spaceBetween=0),"fade"===m.params.effect&&(m.params.watchSlidesProgress=!0,m.params.spaceBetween=0),m.params.grabCursor&&m.support.touch&&(m.params.grabCursor=!1),m.wrapper=m.container.children("."+m.params.wrapperClass),m.params.pagination&&(m.paginationContainer=f(m.params.pagination),m.params.paginationClickable&&m.paginationContainer.addClass("swiper-pagination-clickable")),m.rtl=t()&&("rtl"===m.container[0].dir.toLowerCase()||"rtl"===m.container.css("direction")),m.rtl&&m.container.addClass("swiper-container-rtl"),m.rtl&&(m.wrongRTL="-webkit-box"===m.wrapper.css("display")),m.translate=0,m.progress=0,m.velocity=0,m.lockSwipeToNext=function(){m.params.allowSwipeToNext=!1},m.lockSwipeToPrev=function(){m.params.allowSwipeToPrev=!1},m.lockSwipes=function(){m.params.allowSwipeToNext=m.params.allowSwipeToPrev=!1},m.unlockSwipeToNext=function(){m.params.allowSwipeToNext=!0},m.unlockSwipeToPrev=function(){m.params.allowSwipeToPrev=!0},m.unlockSwipes=function(){m.params.allowSwipeToNext=m.params.allowSwipeToPrev=!0},m.params.slidesPerColumn>1&&m.container.addClass("swiper-container-multirow"),m.params.grabCursor&&(m.container[0].style.cursor="move",m.container[0].style.cursor="-webkit-grab",m.container[0].style.cursor="-moz-grab",m.container[0].style.cursor="grab"),m.imagesToLoad=[],m.imagesLoaded=0,m.preloadImages=function(){m.imagesToLoad=m.container.find("img");for(var e=0;e<m.imagesToLoad.length;e++)r(m.imagesToLoad[e])},m.autoplayTimeoutId=void 0,m.autoplaying=!1,m.autoplayPaused=!1,m.startAutoplay=function(){return"undefined"!=typeof m.autoplayTimeoutId?!1:m.params.autoplay?m.autoplaying?!1:(m.autoplaying=!0,m.params.onAutoplayStart&&m.params.onAutoplayStart(m),void s()):!1},m.stopAutoplay=function(){m.autoplayTimeoutId&&(m.autoplayTimeoutId&&clearTimeout(m.autoplayTimeoutId),m.autoplaying=!1,m.autoplayTimeoutId=void 0,m.params.onAutoplayStop&&m.params.onAutoplayStop(m))},m.pauseAutoplay=function(e){m.autoplayPaused||(m.autoplayTimeoutId&&clearTimeout(m.autoplayTimeoutId),m.autoplayPaused=!0,0===e?(m.autoplayPaused=!1,s()):m.wrapper.transitionEnd(function(){m.autoplayPaused=!1,m.autoplaying?s():m.stopAutoplay()}))},m.minTranslate=function(){return-m.snapGrid[0]},m.maxTranslate=function(){return-m.snapGrid[m.snapGrid.length-1]},m.updateContainerSize=function(){m.width=m.container[0].clientWidth,m.height=m.container[0].clientHeight,m.size=t()?m.width:m.height},m.updateSlidesSize=function(){m.slides=m.wrapper.children("."+m.params.slideClass),m.snapGrid=[],m.slidesGrid=[],m.slidesSizesGrid=[];var e,a=m.params.spaceBetween,r=0,s=0,i=0;"string"==typeof a&&a.indexOf("%")>=0&&(a=parseFloat(a.replace("%",""))/100*m.size),m.virtualWidth=-a,m.slides.css(m.rtl?{marginLeft:"",marginTop:""}:{marginRight:"",marginBottom:""});var n;m.params.slidesPerColumn>1&&(n=Math.floor(m.slides.length/m.params.slidesPerColumn)===m.slides.length/m.params.slidesPerColumn?m.slides.length:Math.ceil(m.slides.length/m.params.slidesPerColumn)*m.params.slidesPerColumn);var o;for(e=0;e<m.slides.length;e++){o=0;var l=m.slides.eq(e);if(m.params.slidesPerColumn>1){var p,d,c,u,f=m.params.slidesPerColumn;"column"===m.params.slidesPerColumnFill?(d=Math.floor(e/f),c=e-d*f,p=d+c*n/f,l.css({"-webkit-box-ordinal-group":p,"-moz-box-ordinal-group":p,"-ms-flex-order":p,"-webkit-order":p,order:p})):(u=n/f,c=Math.floor(e/u),d=e-c*u),l.css({"margin-top":0!==c&&m.params.spaceBetween&&m.params.spaceBetween+"px"}).attr("data-swiper-column",d).attr("data-swiper-row",c)}"none"!==l.css("display")&&("auto"===m.params.slidesPerView?o=t()?l.outerWidth(!0):l.outerHeight(!0):(o=(m.size-(m.params.slidesPerView-1)*a)/m.params.slidesPerView,t()?m.slides[e].style.width=o+"px":m.slides[e].style.height=o+"px"),m.slides[e].swiperSlideSize=o,m.slidesSizesGrid.push(o),m.params.centeredSlides?(r=r+o/2+s/2+a,0===e&&(r=r-m.size/2-a),Math.abs(r)<.001&&(r=0),i%m.params.slidesPerGroup===0&&m.snapGrid.push(r),m.slidesGrid.push(r)):(i%m.params.slidesPerGroup===0&&m.snapGrid.push(r),m.slidesGrid.push(r),r=r+o+a),m.virtualWidth+=o+a,s=o,i++)}m.virtualWidth=Math.max(m.virtualWidth,m.size);var h;if(m.rtl&&m.wrongRTL&&("slide"===m.params.effect||"coverflow"===m.params.effect)&&m.wrapper.css({width:m.virtualWidth+m.params.spaceBetween+"px"}),m.params.slidesPerColumn>1&&(m.virtualWidth=(o+m.params.spaceBetween)*n,m.virtualWidth=Math.ceil(m.virtualWidth/m.params.slidesPerColumn)-m.params.spaceBetween,m.wrapper.css({width:m.virtualWidth+m.params.spaceBetween+"px"}),m.params.centeredSlides)){for(h=[],e=0;e<m.snapGrid.length;e++)m.snapGrid[e]<m.virtualWidth+m.snapGrid[0]&&h.push(m.snapGrid[e]);m.snapGrid=h}if(!m.params.centeredSlides){for(h=[],e=0;e<m.snapGrid.length;e++)m.snapGrid[e]<=m.virtualWidth-m.size&&h.push(m.snapGrid[e]);m.snapGrid=h,Math.floor(m.virtualWidth-m.size)>Math.floor(m.snapGrid[m.snapGrid.length-1])&&m.snapGrid.push(m.virtualWidth-m.size)}0===m.snapGrid.length&&(m.snapGrid=[0]),0!==m.params.spaceBetween&&m.slides.css(t()?m.rtl?{marginLeft:a+"px"}:{marginRight:a+"px"}:{marginBottom:a+"px"}),m.params.watchSlidesProgress&&m.updateSlidesOffset()},m.updateSlidesOffset=function(){for(var e=0;e<m.slides.length;e++)m.slides[e].swiperSlideOffset=t()?m.slides[e].offsetLeft:m.slides[e].offsetTop},m.updateSlidesProgress=function(e){if("undefined"==typeof e&&(e=m.translate||0),0!==m.slides.length){"undefined"==typeof m.slides[0].swiperSlideOffset&&m.updateSlidesOffset();var a=m.params.centeredSlides?-e+m.size/2:-e;m.rtl&&(a=m.params.centeredSlides?e-m.size/2:e);{m.container[0].getBoundingClientRect(),t()?"left":"top",t()?"right":"bottom"}m.slides.removeClass(m.params.slideVisibleClass);for(var r=0;r<m.slides.length;r++){var s=m.slides[r],i=m.params.centeredSlides===!0?s.swiperSlideSize/2:0,n=(a-s.swiperSlideOffset-i)/(s.swiperSlideSize+m.params.spaceBetween);if(m.params.watchVisibility){var o=-(a-s.swiperSlideOffset-i),l=o+m.slidesSizesGrid[r],p=o>=0&&o<m.size||l>0&&l<=m.size||0>=o&&l>=m.size;p&&m.slides.eq(r).addClass(m.params.slideVisibleClass)}s.progress=m.rtl?-n:n}}},m.updateProgress=function(e){"undefined"==typeof e&&(e=m.translate||0);var a=m.maxTranslate()-m.minTranslate();0===a?(m.progress=0,m.isBeginning=m.isEnd=!0):(m.progress=(e-m.minTranslate())/a,m.isBeginning=m.progress<=0,m.isEnd=m.progress>=1),m.isBeginning&&m.params.onReachBeginning&&m.params.onReachBeginning(m),m.isEnd&&m.params.onReachEnd&&m.params.onReachEnd(m),m.params.watchSlidesProgress&&m.updateSlidesProgress(e),m.params.onProgress&&m.params.onProgress(m,m.progress)},m.updateActiveIndex=function(){var e,a,t,r=m.rtl?m.translate:-m.translate;for(a=0;a<m.slidesGrid.length;a++)"undefined"!=typeof m.slidesGrid[a+1]?r>=m.slidesGrid[a]&&r<m.slidesGrid[a+1]-(m.slidesGrid[a+1]-m.slidesGrid[a])/2?e=a:r>=m.slidesGrid[a]&&r<m.slidesGrid[a+1]&&(e=a+1):r>=m.slidesGrid[a]&&(e=a);(0>e||"undefined"==typeof e)&&(e=0),t=Math.floor(e/m.params.slidesPerGroup),t>=m.snapGrid.length&&(t=m.snapGrid.length-1),e!==m.activeIndex&&(m.snapIndex=t,m.previousIndex=m.activeIndex,m.activeIndex=e,m.updateClasses())},m.updateClasses=function(){m.slides.removeClass(m.params.slideActiveClass+" "+m.params.slideNextClass+" "+m.params.slidePrevClass);var e=m.slides.eq(m.activeIndex);if(e.addClass(m.params.slideActiveClass),e.next("."+m.params.slideClass).addClass(m.params.slideNextClass),e.prev("."+m.params.slideClass).addClass(m.params.slidePrevClass),m.bullets&&m.bullets.length>0){m.bullets.removeClass(m.params.bulletActiveClass);var a;m.params.loop?(a=m.activeIndex-m.loopedSlides,a>m.slides.length-1-2*m.loopedSlides&&(a-=m.slides.length-2*m.loopedSlides)):a="undefined"!=typeof m.snapIndex?m.snapIndex:m.activeIndex||0,m.bullets.eq(a).addClass(m.params.bulletActiveClass)}m.params.loop||(m.params.prevButton&&(m.isBeginning?f(m.params.prevButton).addClass(m.params.buttonDisabledClass):f(m.params.prevButton).removeClass(m.params.buttonDisabledClass)),m.params.nextButton&&(m.isEnd?f(m.params.nextButton).addClass(m.params.buttonDisabledClass):f(m.params.nextButton).removeClass(m.params.buttonDisabledClass)))},m.updatePagination=function(){if(m.params.pagination&&m.paginationContainer&&m.paginationContainer.length>0){for(var e="",a=m.params.loop?m.slides.length-2*m.loopedSlides:m.snapGrid.length,t=0;a>t;t++)e+='<span class="'+m.params.bulletClass+'"></span>';m.paginationContainer.html(e),m.bullets=m.paginationContainer.find("."+m.params.bulletClass)}},m.update=function(e){function a(){r=Math.min(Math.max(m.translate,m.maxTranslate()),m.minTranslate()),m.setWrapperTranslate(r),m.updateActiveIndex(),m.updateClasses()}if(m.updateContainerSize(),m.updateSlidesSize(),m.updateProgress(),m.updatePagination(),m.updateClasses(),m.params.scrollbar&&m.scrollbar&&m.scrollbar.set(),e){var t,r;m.params.freeMode?a():(t="auto"===m.params.slidesPerView&&m.isEnd&&!m.params.centeredSlides?m.slideTo(m.slides.length-1,0,!1,!0):m.slideTo(m.activeIndex,0,!1,!0),t||a())}},m.onResize=function(){if(m.updateContainerSize(),m.updateSlidesSize(),m.updateProgress(),("auto"===m.params.slidesPerView||m.params.freeMode)&&m.updatePagination(),m.params.scrollbar&&m.scrollbar&&m.scrollbar.set(),m.params.freeMode){var e=Math.min(Math.max(m.translate,m.maxTranslate()),m.minTranslate());m.setWrapperTranslate(e),m.updateActiveIndex(),m.updateClasses()}else m.updateClasses(),"auto"===m.params.slidesPerView&&m.isEnd&&!m.params.centeredSlides?m.slideTo(m.slides.length-1,0,!1,!0):m.slideTo(m.activeIndex,0,!1,!0)};var h=["mousedown","mousemove","mouseup"];window.navigator.pointerEnabled?h=["pointerdown","pointermove","pointerup"]:window.navigator.msPointerEnabled&&(h=["MSPointerDown","MSPointerMove","MSPointerUp"]),m.touchEvents={start:m.support.touch||!m.params.simulateTouch?"touchstart":h[0],move:m.support.touch||!m.params.simulateTouch?"touchmove":h[1],end:m.support.touch||!m.params.simulateTouch?"touchend":h[2]},(window.navigator.pointerEnabled||window.navigator.msPointerEnabled)&&("container"===m.params.touchEventsTarget?m.container:m.wrapper).addClass("swiper-wp8-"+m.params.direction),m.events=function(e){var t=e?"off":"on",r=e?"removeEventListener":"addEventListener",s="container"===m.params.touchEventsTarget?m.container[0]:m.wrapper[0],i=m.support.touch?s:document,n=m.params.nested?!0:!1;m.browser.ie?(s[r](m.touchEvents.start,m.onTouchStart,!1),i[r](m.touchEvents.move,m.onTouchMove,n),i[r](m.touchEvents.end,m.onTouchEnd,!1)):(m.support.touch&&(s[r](m.touchEvents.start,m.onTouchStart,!1),s[r](m.touchEvents.move,m.onTouchMove,n),s[r](m.touchEvents.end,m.onTouchEnd,!1)),!a.simulateTouch||m.device.ios||m.device.android||(s[r]("mousedown",m.onTouchStart,!1),i[r]("mousemove",m.onTouchMove,n),i[r]("mouseup",m.onTouchEnd,!1))),window[r]("resize",m.onResize),m.params.nextButton&&f(m.params.nextButton)[t]("click",m.onClickNext),m.params.prevButton&&f(m.params.prevButton)[t]("click",m.onClickPrev),m.params.pagination&&m.params.paginationClickable&&f(m.paginationContainer)[t]("click","."+m.params.bulletClass,m.onClickIndex),(m.params.preventClicks||m.params.preventClicksPropagation)&&s[r]("click",m.preventClicks,!0)},m.attachEvents=function(){m.events()},m.detachEvents=function(){m.events(!0)},m.allowClick=!0,m.preventClicks=function(e){m.allowClick||(m.params.preventClicks&&e.preventDefault(),m.params.preventClicksPropagation&&(e.stopPropagation(),e.stopImmediatePropagation()))},m.onClickNext=function(e){e.preventDefault(),m.slideNext()},m.onClickPrev=function(e){e.preventDefault(),m.slidePrev()},m.onClickIndex=function(e){e.preventDefault();var a=f(this).index()*m.params.slidesPerGroup;m.params.loop&&(a+=m.loopedSlides),m.slideTo(a)},m.updateClickedSlide=function(e){var a=i(e,"."+m.params.slideClass);if(!a)return m.clickedSlide=void 0,void(m.clickedIndex=void 0);if(m.clickedSlide=a,m.clickedIndex=f(a).index(),m.params.slideToClickedSlide&&void 0!==m.clickedIndex&&m.clickedIndex!==m.activeIndex){var t,r=m.clickedIndex;if(m.params.loop)if(t=f(m.clickedSlide).attr("data-swiper-slide-index"),r>m.slides.length-m.params.slidesPerView)m.fixLoop(),r=m.wrapper.children("."+m.params.slideClass+'[data-swiper-slide-index="'+t+'"]').eq(0).index(),setTimeout(function(){m.slideTo(r)},0);else if(r<m.params.slidesPerView-1){m.fixLoop();var s=m.wrapper.children("."+m.params.slideClass+'[data-swiper-slide-index="'+t+'"]');r=s.eq(s.length-1).index(),setTimeout(function(){m.slideTo(r)},0)}else m.slideTo(r);else m.slideTo(r)}};var v,w,g,T,x,b,S,y,C,M="input, select, textarea, button",P=Date.now(),E=[];m.animating=!1,m.touches={startX:0,startY:0,currentX:0,currentY:0,diff:0};var k;if(m.onTouchStart=function(e){if(e.originalEvent&&(e=e.originalEvent),k="touchstart"===e.type,k||!("which"in e)||3!==e.which){if(m.params.noSwiping&&i(e,"."+m.params.noSwipingClass))return void(m.allowClick=!0);if(!m.params.swipeHandler||i(e,m.params.swipeHandler)){if(v=!0,w=!1,T=void 0,m.touches.startX=m.touches.currentX="touchstart"===e.type?e.targetTouches[0].pageX:e.pageX,m.touches.startY=m.touches.currentY="touchstart"===e.type?e.targetTouches[0].pageY:e.pageY,g=Date.now(),m.allowClick=!0,m.updateContainerSize(),m.swipeDirection=void 0,m.params.threshold>0&&(S=!1),"touchstart"!==e.type){var a=!0;f(e.target).is(M)&&(a=!1),document.activeElement&&f(document.activeElement).is(M)&&document.activeElement.blur(),a&&e.preventDefault()}m.params.onTouchStart&&m.params.onTouchStart(m,e)}}},m.onTouchMove=function(e){if(e.originalEvent&&(e=e.originalEvent),!(k&&"mousemove"===e.type||e.preventedByNestedSwiper)){if(m.params.onlyExternal)return w=!0,void(m.allowClick=!1);if(m.params.onTouchMove&&m.params.onTouchMove(m,e),m.allowClick=!1,!(e.targetTouches&&e.targetTouches.length>1)){if(m.touches.currentX="touchmove"===e.type?e.targetTouches[0].pageX:e.pageX,m.touches.currentY="touchmove"===e.type?e.targetTouches[0].pageY:e.pageY,"undefined"==typeof T){var r=180*Math.atan2(Math.abs(m.touches.currentY-m.touches.startY),Math.abs(m.touches.currentX-m.touches.startX))/Math.PI;T=t()?r>m.params.touchAngle:90-r>m.params.touchAngle}if(T&&m.params.onTouchMoveOpposite&&m.params.onTouchMoveOpposite(m,e),v){if(T)return void(v=!1);m.params.onSliderMove&&m.params.onSliderMove(m,e),e.preventDefault(),m.params.touchMoveStopPropagation&&!m.params.nested&&e.stopPropagation(),w||(a.loop&&m.fixLoop(),b="cube"===m.params.effect?(m.rtl?-m.translate:m.translate)||0:m.getWrapperTranslate(),m.setWrapperTransition(0),m.animating&&m.wrapper.trigger("webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd"),m.params.autoplay&&m.autoplaying&&(m.params.autoplayDisableOnInteraction?m.stopAutoplay():m.pauseAutoplay()),C=!1,m.params.grabCursor&&(m.container[0].style.cursor="move",m.container[0].style.cursor="-webkit-grabbing",m.container[0].style.cursor="-moz-grabbin",m.container[0].style.cursor="grabbing")),w=!0;var s=m.touches.diff=t()?m.touches.currentX-m.touches.startX:m.touches.currentY-m.touches.startY;s*=m.params.touchRatio,m.rtl&&(s=-s),m.swipeDirection=s>0?"prev":"next",x=s+b;var i=!0;if(s>0&&x>m.minTranslate()?(i=!1,m.params.resistance&&(x=m.minTranslate()-1+Math.pow(-m.minTranslate()+b+s,m.params.resistanceRatio))):0>s&&x<m.maxTranslate()&&(i=!1,m.params.resistance&&(x=m.maxTranslate()+1-Math.pow(m.maxTranslate()-b-s,m.params.resistanceRatio))),i&&(e.preventedByNestedSwiper=!0),!m.params.allowSwipeToNext&&"next"===m.swipeDirection&&b>x&&(x=b),!m.params.allowSwipeToPrev&&"prev"===m.swipeDirection&&x>b&&(x=b),m.params.followFinger){if(m.params.threshold>0){if(!(Math.abs(s)>m.params.threshold||S))return void(x=b);if(!S)return S=!0,m.touches.startX=m.touches.currentX,m.touches.startY=m.touches.currentY,x=b,void(m.touches.diff=t()?m.touches.currentX-m.touches.startX:m.touches.currentY-m.touches.startY)}(m.params.freeMode||m.params.watchSlidesProgress)&&m.updateActiveIndex(),m.params.freeMode&&(0===E.length&&E.push({position:m.touches[t()?"startX":"startY"],time:g}),E.push({position:m.touches[t()?"currentX":"currentY"],time:(new Date).getTime()})),m.updateProgress(x),m.setWrapperTranslate(x)}}}}},m.onTouchEnd=function(e){if(e.originalEvent&&(e=e.originalEvent),m.params.onTouchEnd&&m.params.onTouchEnd(m,e),v){m.params.grabCursor&&w&&v&&(m.container[0].style.cursor="move",m.container[0].style.cursor="-webkit-grab",m.container[0].style.cursor="-moz-grab",m.container[0].style.cursor="grab");var a=Date.now(),t=a-g;if(m.allowClick&&(m.updateClickedSlide(e),m.params.onTap&&m.params.onTap(m,e),300>t&&a-P>300&&(y&&clearTimeout(y),y=setTimeout(function(){m&&(m.params.paginationHide&&m.paginationContainer.length>0&&!f(e.target).hasClass(m.params.bulletClass)&&m.paginationContainer.toggleClass(m.params.paginationHiddenClass),m.params.onClick&&m.params.onClick(m,e))},300)),300>t&&300>a-P&&(y&&clearTimeout(y),m.params.onDoubleTap&&m.params.onDoubleTap(m,e))),P=Date.now(),setTimeout(function(){m&&m.allowClick&&(m.allowClick=!0)},0),!v||!w||!m.swipeDirection||0===m.touches.diff||x===b)return void(v=w=!1);v=w=!1;var r;if(r=m.params.followFinger?m.rtl?m.translate:-m.translate:-x,m.params.freeMode){if(r<-m.minTranslate())return void m.slideTo(m.activeIndex);if(r>-m.maxTranslate())return void m.slideTo(m.slides.length-1);if(m.params.freeModeMomentum){if(E.length>1){var s=E.pop(),i=E.pop(),n=s.position-i.position,o=s.time-i.time;m.velocity=n/o,m.velocity=m.velocity/2,Math.abs(m.velocity)<.02&&(m.velocity=0),(o>150||(new Date).getTime()-s.time>300)&&(m.velocity=0)}else m.velocity=0;E.length=0;var l=1e3*m.params.freeModeMomentumRatio,p=m.velocity*l,d=m.translate+p;m.rtl&&(d=-d);var c,u=!1,h=20*Math.abs(m.velocity)*m.params.freeModeMomentumBounceRatio;d<m.maxTranslate()&&(m.params.freeModeMomentumBounce?(d+m.maxTranslate()<-h&&(d=m.maxTranslate()-h),c=m.maxTranslate(),u=!0,C=!0):d=m.maxTranslate()),d>m.minTranslate()&&(m.params.freeModeMomentumBounce?(d-m.minTranslate()>h&&(d=m.minTranslate()+h),c=m.minTranslate(),u=!0,C=!0):d=m.minTranslate()),0!==m.velocity&&(l=Math.abs(m.rtl?(-d-m.translate)/m.velocity:(d-m.translate)/m.velocity)),m.params.freeModeMomentumBounce&&u?(m.updateProgress(c),m.setWrapperTransition(l),m.setWrapperTranslate(d),m.onTransitionStart(),m.animating=!0,m.wrapper.transitionEnd(function(){C&&(m.params.onMomentumBounce&&m.params.onMomentumBounce(m),m.setWrapperTransition(m.params.speed),m.setWrapperTranslate(c),m.wrapper.transitionEnd(function(){m.onTransitionEnd()}))})):m.velocity?(m.updateProgress(d),m.setWrapperTransition(l),m.setWrapperTranslate(d),m.onTransitionStart(),m.animating||(m.animating=!0,m.wrapper.transitionEnd(function(){m.onTransitionEnd()}))):m.updateProgress(d),m.updateActiveIndex()}return void((!m.params.freeModeMomentum||t>=m.params.longSwipesMs)&&(m.updateProgress(),m.updateActiveIndex()))}var T,S=0,M=m.slidesSizesGrid[0];for(T=0;T<m.slidesGrid.length;T+=m.params.slidesPerGroup)"undefined"!=typeof m.slidesGrid[T+m.params.slidesPerGroup]?r>=m.slidesGrid[T]&&r<m.slidesGrid[T+m.params.slidesPerGroup]&&(S=T,M=m.slidesGrid[T+m.params.slidesPerGroup]-m.slidesGrid[T]):r>=m.slidesGrid[T]&&(S=T,M=m.slidesGrid[m.slidesGrid.length-1]-m.slidesGrid[m.slidesGrid.length-2]);var k=(r-m.slidesGrid[S])/M;if(t>m.params.longSwipesMs){if(!m.params.longSwipes)return void m.slideTo(m.activeIndex);"next"===m.swipeDirection&&m.slideTo(k>=m.params.longSwipesRatio?S+m.params.slidesPerGroup:S),"prev"===m.swipeDirection&&m.slideTo(k>1-m.params.longSwipesRatio?S+m.params.slidesPerGroup:S)}else{if(!m.params.shortSwipes)return void m.slideTo(m.activeIndex);"next"===m.swipeDirection&&m.slideTo(S+m.params.slidesPerGroup),"prev"===m.swipeDirection&&m.slideTo(S)}}},m._slideTo=function(e,a){return m.slideTo(e,a,!0,!0)},m.slideTo=function(e,a,r,s){"undefined"==typeof r&&(r=!0),"undefined"==typeof e&&(e=0),0>e&&(e=0),m.snapIndex=Math.floor(e/m.params.slidesPerGroup),m.snapIndex>=m.snapGrid.length&&(m.snapIndex=m.snapGrid.length-1);var i=-m.snapGrid[m.snapIndex];m.params.autoplay&&m.autoplaying&&(s||!m.params.autoplayDisableOnInteraction?m.pauseAutoplay(a):m.stopAutoplay()),m.updateProgress(i);for(var n=0;n<m.slidesGrid.length;n++)-i>=m.slidesGrid[n]&&(e=n);if("undefined"==typeof a&&(a=m.params.speed),m.previousIndex=m.activeIndex||0,m.activeIndex=e,i===m.translate)return m.updateClasses(),!1;m.onTransitionStart(r);t()?i:0,t()?0:i;return 0===a?(m.setWrapperTransition(0),m.setWrapperTranslate(i),m.onTransitionEnd(r)):(m.setWrapperTransition(a),m.setWrapperTranslate(i),m.animating||(m.animating=!0,m.wrapper.transitionEnd(function(){m.onTransitionEnd(r)}))),m.updateClasses(),!0},m.onTransitionStart=function(e){"undefined"==typeof e&&(e=!0),e&&(m.params.onTransitionStart&&m.params.onTransitionStart(m),m.params.onSlideChangeStart&&m.activeIndex!==m.previousIndex&&m.params.onSlideChangeStart(m))},m.onTransitionEnd=function(e){m.animating=!1,m.setWrapperTransition(0),"undefined"==typeof e&&(e=!0),e&&(m.params.onTransitionEnd&&m.params.onTransitionEnd(m),m.params.onSlideChangeEnd&&m.activeIndex!==m.previousIndex&&m.params.onSlideChangeEnd(m))},m.slideNext=function(e,a,t){if(m.params.loop){if(m.animating)return!1;m.fixLoop();{m.container[0].clientLeft}return m.slideTo(m.activeIndex+m.params.slidesPerGroup,a,e,t)}return m.slideTo(m.activeIndex+m.params.slidesPerGroup,a,e,t)},m._slideNext=function(e){return m.slideNext(!0,e,!0)},m.slidePrev=function(e,a,t){if(m.params.loop){if(m.animating)return!1;m.fixLoop();{m.container[0].clientLeft}return m.slideTo(m.activeIndex-1,a,e,t)}return m.slideTo(m.activeIndex-1,a,e,t)},m._slidePrev=function(e){return m.slidePrev(!0,e,!0)},m.slideReset=function(e,a){return m.slideTo(m.activeIndex,a,e)},m.setWrapperTransition=function(e,a){m.wrapper.transition(e),m.params.onSetTransition&&m.params.onSetTransition(m,e),"slide"!==m.params.effect&&m.effects[m.params.effect]&&m.effects[m.params.effect].setTransition(e),m.params.parallax&&m.parallax&&m.parallax.setTransition(e),m.params.scrollbar&&m.scrollbar&&m.scrollbar.setTransition(e),m.params.control&&m.controller&&m.controller.setTransition(e,a)},m.setWrapperTranslate=function(e,a,r){var s=0,i=0,n=0;t()?s=m.rtl?-e:e:i=e,m.wrapper.transform(m.support.transforms3d?"translate3d("+s+"px, "+i+"px, "+n+"px)":"translate("+s+"px, "+i+"px)"),m.translate=t()?s:i,a&&m.updateActiveIndex(),"slide"!==m.params.effect&&m.effects[m.params.effect]&&m.effects[m.params.effect].setTranslate(m.translate),m.params.parallax&&m.parallax&&m.parallax.setTranslate(m.translate),m.params.scrollbar&&m.scrollbar&&m.scrollbar.setTranslate(m.translate),m.params.control&&m.controller&&m.controller.setTranslate(m.translate,r),m.params.hashnav&&m.hashnav&&m.hashnav.setHash(),m.params.onSetTranslate&&m.params.onSetTranslate(m,m.translate)},m.getTranslate=function(e,a){var t,r,s,i;return"undefined"==typeof a&&(a="x"),s=window.getComputedStyle(e,null),window.WebKitCSSMatrix?i=new WebKitCSSMatrix("none"===s.webkitTransform?"":s.webkitTransform):(i=s.MozTransform||s.OTransform||s.MsTransform||s.msTransform||s.transform||s.getPropertyValue("transform").replace("translate(","matrix(1, 0, 0, 1,"),t=i.toString().split(",")),"x"===a&&(r=window.WebKitCSSMatrix?i.m41:parseFloat(16===t.length?t[12]:t[4])),"y"===a&&(r=window.WebKitCSSMatrix?i.m42:parseFloat(16===t.length?t[13]:t[5])),m.rtl&&r&&(r=-r),r||0},m.getWrapperTranslate=function(e){return"undefined"==typeof e&&(e=t()?"x":"y"),m.getTranslate(m.wrapper[0],e)},m.observers=[],m.initObservers=function(){if(m.params.observeParents)for(var e=m.container.parents(),a=0;a<e.length;a++)n(e[a]);n(m.container[0],{childList:!1}),n(m.wrapper[0],{attributes:!1})},m.disconnectObservers=function(){for(var e=0;e<m.observers.length;e++)m.observers[e].disconnect();m.observers=[]},m.createLoop=function(){m.wrapper.children("."+m.params.slideClass+"."+m.params.slideDuplicateClass).remove();var e=m.wrapper.children("."+m.params.slideClass);m.loopedSlides=parseInt(m.params.loopedSlides||m.params.slidesPerView,10),m.loopedSlides=m.loopedSlides+m.params.loopAdditionalSlides,m.loopedSlides>e.length&&(m.loopedSlides=e.length);var a,t=[],r=[];for(e.each(function(a,s){var i=f(this);a<m.loopedSlides&&r.push(s),a<e.length&&a>=e.length-m.loopedSlides&&t.push(s),i.attr("data-swiper-slide-index",a)}),a=0;a<r.length;a++)m.wrapper.append(f(r[a].cloneNode(!0)).addClass(m.params.slideDuplicateClass));for(a=t.length-1;a>=0;a--)m.wrapper.prepend(f(t[a].cloneNode(!0)).addClass(m.params.slideDuplicateClass))},m.destroyLoop=function(){m.wrapper.children("."+m.params.slideClass+"."+m.params.slideDuplicateClass).remove()},m.fixLoop=function(){var e;m.activeIndex<m.loopedSlides?(e=m.slides.length-3*m.loopedSlides+m.activeIndex,e+=m.loopedSlides,m.slideTo(e,0,!1,!0)):("auto"===m.params.slidesPerView&&m.activeIndex>=2*m.loopedSlides||m.activeIndex>m.slides.length-2*m.params.slidesPerView)&&(e=-m.slides.length+m.activeIndex+m.loopedSlides,e+=m.loopedSlides,m.slideTo(e,0,!1,!0))},m.appendSlide=function(e){if(m.params.loop&&m.destroyLoop(),"object"==typeof e&&e.length)for(var a=0;a<e.length;a++)e[a]&&m.wrapper.append(e[a]);else m.wrapper.append(e);m.params.loop&&m.createLoop(),m.params.observer&&m.support.observer||m.update(!0)},m.prependSlide=function(e){m.params.loop&&m.destroyLoop();var a=m.activeIndex+1;if("object"==typeof e&&e.length){for(var t=0;t<e.length;t++)e[t]&&m.wrapper.prepend(e[t]);a=m.activeIndex+e.length}else m.wrapper.prepend(e);m.params.loop&&m.createLoop(),m.params.observer&&m.support.observer||m.update(!0),m.slideTo(a,0,!1)},m.removeSlide=function(e){m.params.loop&&m.destroyLoop();
var a,t=m.activeIndex;if("object"==typeof e&&e.length){for(var r=0;r<e.length;r++)a=e[r],m.slides[a]&&m.slides.eq(a).remove(),t>a&&t--;t=Math.max(t,0)}else a=e,m.slides[a]&&m.slides.eq(a).remove(),t>a&&t--,t=Math.max(t,0);m.params.observer&&m.support.observer||m.update(!0),m.slideTo(t,0,!1)},m.removeAllSlides=function(){for(var e=[],a=0;a<m.slides.length;a++)e.push(a);m.removeSlide(e)},m.effects={fade:{setTranslate:function(){for(var e=0;e<m.slides.length;e++){var a=m.slides.eq(e),r=a[0].swiperSlideOffset,s=-r-m.translate,i=0;t()||(i=s,s=0);var n=m.params.fade.crossFade?Math.max(1-Math.abs(a[0].progress),0):1+Math.min(Math.max(a[0].progress,-1),0);a.css({opacity:n}).transform("translate3d("+s+"px, "+i+"px, 0px)")}},setTransition:function(e){m.slides.transition(e)}},cube:{setTranslate:function(){var e,a=0;m.params.cube.shadow&&(t()?(e=m.wrapper.find(".swiper-cube-shadow"),0===e.length&&(e=f('<div class="swiper-cube-shadow"></div>'),m.wrapper.append(e)),e.css({height:m.width+"px"})):(e=m.container.find(".swiper-cube-shadow"),0===e.length&&(e=f('<div class="swiper-cube-shadow"></div>'),m.container.append(e))));for(var r=0;r<m.slides.length;r++){var s=m.slides.eq(r),i=90*r,n=Math.floor(i/360);m.rtl&&(i=-i,n=Math.floor(-i/360));var o=Math.max(Math.min(s[0].progress,1),-1),l=0,p=0,d=0;r%4===0?(l=4*-n*m.size,d=0):(r-1)%4===0?(l=0,d=4*-n*m.size):(r-2)%4===0?(l=m.size+4*n*m.size,d=m.size):(r-3)%4===0&&(l=-m.size,d=3*m.size+4*m.size*n),m.rtl&&(l=-l),t()||(p=l,l=0);var c="rotateX("+(t()?0:-i)+"deg) rotateY("+(t()?i:0)+"deg) translate3d("+l+"px, "+p+"px, "+d+"px)";if(1>=o&&o>-1&&(a=90*r+90*o,m.rtl&&(a=90*-r-90*o)),s.transform(c),m.params.cube.slideShadows){var u=s.find(t()?".swiper-slide-shadow-left":".swiper-slide-shadow-top"),h=s.find(t()?".swiper-slide-shadow-right":".swiper-slide-shadow-bottom");0===u.length&&(u=f('<div class="swiper-slide-shadow-'+(t()?"left":"top")+'"></div>'),s.append(u)),0===h.length&&(h=f('<div class="swiper-slide-shadow-'+(t()?"right":"bottom")+'"></div>'),s.append(h));{s[0].progress}u.length&&(u[0].style.opacity=-s[0].progress),h.length&&(h[0].style.opacity=s[0].progress)}}if(m.wrapper.css({"-webkit-transform-origin":"50% 50% -"+m.size/2+"px","-moz-transform-origin":"50% 50% -"+m.size/2+"px","-ms-transform-origin":"50% 50% -"+m.size/2+"px","transform-origin":"50% 50% -"+m.size/2+"px"}),m.params.cube.shadow)if(t())e.transform("translate3d(0px, "+(m.width/2+m.params.cube.shadowOffset)+"px, "+-m.width/2+"px) rotateX(90deg) rotateZ(0deg) scale("+m.params.cube.shadowScale+")");else{var v=Math.abs(a)-90*Math.floor(Math.abs(a)/90),w=1.5-(Math.sin(2*v*Math.PI/360)/2+Math.cos(2*v*Math.PI/360)/2),g=m.params.cube.shadowScale,T=m.params.cube.shadowScale/w,x=m.params.cube.shadowOffset;e.transform("scale3d("+g+", 1, "+T+") translate3d(0px, "+(m.height/2+x)+"px, "+-m.height/2/T+"px) rotateX(-90deg)")}var b=m.isSafari||m.isUiWebView?-m.size/2:0;m.wrapper.transform("translate3d(0px,0,"+b+"px) rotateX("+(t()?0:a)+"deg) rotateY("+(t()?-a:0)+"deg)")},setTransition:function(e){m.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e),m.params.cube.shadow&&!t()&&m.container.find(".swiper-cube-shadow").transition(e)}},coverflow:{setTranslate:function(){for(var e=m.translate,a=t()?-e+m.width/2:-e+m.height/2,r=t()?m.params.coverflow.rotate:-m.params.coverflow.rotate,s=m.params.coverflow.depth,i=0,n=m.slides.length;n>i;i++){var o=m.slides.eq(i),l=m.slidesSizesGrid[i],p=o[0].swiperSlideOffset,d=(a-p-l/2)/l*m.params.coverflow.modifier,c=t()?r*d:0,u=t()?0:r*d,h=-s*Math.abs(d),v=t()?0:m.params.coverflow.stretch*d,w=t()?m.params.coverflow.stretch*d:0;Math.abs(w)<.001&&(w=0),Math.abs(v)<.001&&(v=0),Math.abs(h)<.001&&(h=0),Math.abs(c)<.001&&(c=0),Math.abs(u)<.001&&(u=0);var g="translate3d("+w+"px,"+v+"px,"+h+"px)  rotateX("+u+"deg) rotateY("+c+"deg)";if(o.transform(g),o[0].style.zIndex=-Math.abs(Math.round(d))+1,m.params.coverflow.slideShadows){var T=o.find(t()?".swiper-slide-shadow-left":".swiper-slide-shadow-top"),x=o.find(t()?".swiper-slide-shadow-right":".swiper-slide-shadow-bottom");0===T.length&&(T=f('<div class="swiper-slide-shadow-'+(t()?"left":"top")+'"></div>'),o.append(T)),0===x.length&&(x=f('<div class="swiper-slide-shadow-'+(t()?"right":"bottom")+'"></div>'),o.append(x)),T.length&&(T[0].style.opacity=d>0?d:0),x.length&&(x[0].style.opacity=-d>0?-d:0)}}if(window.navigator.pointerEnabled||window.navigator.msPointerEnabled){var b=m.wrapper.style;b.perspectiveOrigin=a+"px 50%"}},setTransition:function(e){m.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e)}}},m.scrollbar={set:function(){if(m.params.scrollbar){var e=m.scrollbar;e.track=f(m.params.scrollbar),e.drag=e.track.find(".swiper-scrollbar-drag"),0===e.drag.length&&(e.drag=f('<div class="swiper-scrollbar-drag"></div>'),e.track.append(e.drag)),e.drag[0].style.width="",e.drag[0].style.height="",e.trackSize=t()?e.track[0].offsetWidth:e.track[0].offsetHeight,e.divider=m.size/m.virtualWidth,e.moveDivider=e.divider*(e.trackSize/m.size),e.dragSize=e.trackSize*e.divider,t()?e.drag[0].style.width=e.dragSize+"px":e.drag[0].style.height=e.dragSize+"px",e.track[0].style.display=e.divider>=1?"none":"",m.params.scrollbarHide&&(e.track[0].style.opacity=0)}},setTranslate:function(){if(m.params.scrollbar){var e,a=m.scrollbar,r=(m.translate||0,a.dragSize);e=(a.trackSize-a.dragSize)*m.progress,m.rtl&&t()?(e=-e,e>0?(r=a.dragSize-e,e=0):-e+a.dragSize>a.trackSize&&(r=a.trackSize+e)):0>e?(r=a.dragSize+e,e=0):e+a.dragSize>a.trackSize&&(r=a.trackSize-e),t()?(a.drag.transform("translate3d("+e+"px, 0, 0)"),a.drag[0].style.width=r+"px"):(a.drag.transform("translate3d(0px, "+e+"px, 0)"),a.drag[0].style.height=r+"px"),m.params.scrollbarHide&&(clearTimeout(a.timeout),a.track[0].style.opacity=1,a.timeout=setTimeout(function(){a.track[0].style.opacity=0,a.track.transition(400)},1e3))}},setTransition:function(e){m.params.scrollbar&&m.scrollbar.drag.transition(e)}},m.controller={setTranslate:function(e,a){var t,r,s=m.params.control;if(m.isArray(s))for(var i=0;i<s.length;i++)s[i]!==a&&s[i]instanceof Swiper&&(e=s[i].rtl&&"horizontal"===s[i].params.direction?-m.translate:m.translate,t=(s[i].maxTranslate()-s[i].minTranslate())/(m.maxTranslate()-m.minTranslate()),r=(e-m.minTranslate())*t+s[i].minTranslate(),m.params.controlInverse&&(r=s[i].maxTranslate()-r),s[i].updateProgress(r),s[i].setWrapperTranslate(r,!1,m),s[i].updateActiveIndex());else s instanceof Swiper&&a!==s&&(e=s.rtl&&"horizontal"===s.params.direction?-m.translate:m.translate,t=(s.maxTranslate()-s.minTranslate())/(m.maxTranslate()-m.minTranslate()),r=(e-m.minTranslate())*t+s.minTranslate(),m.params.controlInverse&&(r=s.maxTranslate()-r),s.updateProgress(r),s.setWrapperTranslate(r,!1,m),s.updateActiveIndex())},setTransition:function(e,a){var t=m.params.control;if(m.isArray(t))for(var r=0;r<t.length;r++)t[r]!==a&&t[r]instanceof Swiper&&t[r].setWrapperTransition(e,m);else t instanceof Swiper&&a!==t&&t.setWrapperTransition(e,m)}},m.hashnav={init:function(){if(m.params.hashnav){m.hashnav.initialized=!0;var e=document.location.hash.replace("#","");if(e)for(var a=0,t=0,r=m.slides.length;r>t;t++){var s=m.slides.eq(t),i=s.attr("data-hash");if(i===e&&!s.hasClass(m.params.slideDuplicateClass)){var n=s.index();m._slideTo(n,a)}}}},setHash:function(){m.hashnav.initialized&&m.params.hashnav&&(document.location.hash=m.slides.eq(m.activeIndex).attr("data-hash")||"")}},m.disableKeyboardControl=function(){f(document).off("keydown",o)},m.enableKeyboardControl=function(){f(document).on("keydown",o)},m._wheelEvent=!1,m._lastWheelScrollTime=(new Date).getTime(),m.params.mousewheelControl){if(void 0!==document.onmousewheel&&(m._wheelEvent="mousewheel"),!m._wheelEvent)try{new WheelEvent("wheel"),m._wheelEvent="wheel"}catch(I){}m._wheelEvent||(m._wheelEvent="DOMMouseScroll")}return m.disableMousewheelControl=function(){return m._wheelEvent?(m.container.off(m._wheelEvent,l),!0):!1},m.enableMousewheelControl=function(){return m._wheelEvent?(m.container.on(m._wheelEvent,l),!0):!1},m.parallax={setTranslate:function(){m.container.children("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){p(this,m.progress)}),m.slides.each(function(){var e=f(this);e.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){var a=Math.min(Math.max(e[0].progress,-1),1);p(this,a)})})},setTransition:function(e){"undefined"==typeof e&&(e=m.params.speed),m.container.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){var a=f(this),t=parseInt(a.attr("data-swiper-parallax-duration"),10)||e;0===e&&(t=0),a.transition(t)})}},m.init=function(){m.params.loop&&m.createLoop(),m.updateContainerSize(),m.updateSlidesSize(),m.updatePagination(),m.params.scrollbar&&m.scrollbar&&m.scrollbar.set(),"slide"!==m.params.effect&&m.effects[m.params.effect]&&(m.params.loop||m.updateProgress(),m.effects[m.params.effect].setTranslate()),m.params.loop?m.slideTo(m.params.initialSlide+m.loopedSlides,0,m.params.runCallbacksOnInit):(m.slideTo(m.params.initialSlide,0,m.params.runCallbacksOnInit),0===m.params.initialSlide&&m.parallax&&m.params.parallax&&m.parallax.setTranslate()),m.attachEvents(),m.params.observer&&m.support.observer&&m.initObservers(),m.params.updateOnImagesReady&&m.preloadImages(),m.params.autoplay&&m.startAutoplay(),m.params.keyboardControl&&m.enableKeyboardControl&&m.enableKeyboardControl(),m.params.mousewheelControl&&m.enableMousewheelControl&&m.enableMousewheelControl(),m.params.hashnav&&m.hashnav&&m.hashnav.init(),m.params.onInit&&m.params.onInit(m)},m.destroy=function(e){m.detachEvents(),m.disconnectObservers(),m.params.keyboardControl&&m.disableKeyboardControl&&m.disableKeyboardControl(),m.params.mousewheelControl&&m.disableMousewheelControl&&m.disableMousewheelControl(),m.params.onDestroy&&m.params.onDestroy(),e!==!1&&(m=null)},m.init(),m}},Swiper.prototype={isSafari:function(){var e=navigator.userAgent.toLowerCase();return e.indexOf("safari")>=0&&e.indexOf("chrome")<0&&e.indexOf("android")<0}(),isUiWebView:/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent),isArray:function(e){return"[object Array]"===Object.prototype.toString.apply(e)},browser:{ie:window.navigator.pointerEnabled||window.navigator.msPointerEnabled},device:function(){var e=navigator.userAgent,a=e.match(/(Android);?[\s\/]+([\d.]+)?/),t=e.match(/(iPad).*OS\s([\d_]+)/),r=(e.match(/(iPod)(.*OS\s([\d_]+))?/),!t&&e.match(/(iPhone\sOS)\s([\d_]+)/));return{ios:t||r||t,android:a}}(),support:{touch:window.Modernizr&&Modernizr.touch===!0||function(){return!!("ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch)}(),transforms3d:window.Modernizr&&Modernizr.csstransforms3d===!0||function(){var e=document.createElement("div").style;return"webkitPerspective"in e||"MozPerspective"in e||"OPerspective"in e||"MsPerspective"in e||"perspective"in e}(),flexbox:function(){for(var e=document.createElement("div").style,a="WebkitBox msFlexbox MsFlexbox WebkitFlex MozBox flex".split(" "),t=0;t<a.length;t++)if(a[t]in e)return!0}(),observer:function(){return"MutationObserver"in window||"WebkitMutationObserver"in window}()}};for(var a=["jQuery","Zepto","Dom7"],t=0;t<a.length;t++)window[a[t]]&&e(window[a[t]]);var r;r="undefined"==typeof Dom7?window.Dom7||window.Zepto||window.jQuery:Dom7,r&&("transitionEnd"in r.fn||(r.fn.transitionEnd=function(e){function a(i){if(i.target===this)for(e.call(this,i),t=0;t<r.length;t++)s.off(r[t],a)}var t,r=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],s=this;if(e)for(t=0;t<r.length;t++)s.on(r[t],a);return this}),"transform"in r.fn||(r.fn.transform=function(e){for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransform=t.MsTransform=t.msTransform=t.MozTransform=t.OTransform=t.transform=e}return this}),"transition"in r.fn||(r.fn.transition=function(e){"string"!=typeof e&&(e+="ms");for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransitionDuration=t.MsTransitionDuration=t.msTransitionDuration=t.MozTransitionDuration=t.OTransitionDuration=t.transitionDuration=e}return this}))}(),"undefined"!=typeof module?module.exports=Swiper:"function"==typeof define&&define.amd&&define([],function(){"use strict";return Swiper});
//# sourceMappingURL=maps/swiper.jquery.min.js.map
/**
 * Swiper 3.0.3
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * 
 * http://www.idangero.us/swiper/
 * 
 * Copyright 2015, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us/
 * 
 * Licensed under MIT
 * 
 * Released on: March 1, 2015
 */
(function () {
    'use strict';
    /*===========================
    Swiper
    ===========================*/
    window.Swiper = function (container, params) {

        var defaults = {
            direction: 'horizontal',
            touchEventsTarget: 'container',
            initialSlide: 0,
            speed: 300,
            // autoplay
            autoplay: false,
            autoplayDisableOnInteraction: true,
            // Free mode
            freeMode: false,
            freeModeMomentum: true,
            freeModeMomentumRatio: 1,
            freeModeMomentumBounce: true,
            freeModeMomentumBounceRatio: 1,
            // Effects
            effect: 'slide', // 'slide' or 'fade' or 'cube' or 'coverflow'
            coverflow: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows : true
            },
            cube: {
                slideShadows: true,
                shadow: true,
                shadowOffset: 20,
                shadowScale: 0.94
            },
            fade: {
                crossFade: false
            },
            // Parallax
            parallax: false,
            // Scrollbar
            scrollbar: null,
            scrollbarHide: true,
            // Keyboard Mousewheel
            keyboardControl: false,
            mousewheelControl: false,
            mousewheelForceToAxis: false,
            // Hash Navigation
            hashnav: false,
            // Slides grid
            spaceBetween: 0,
            slidesPerView: 1,
            slidesPerColumn: 1,
            slidesPerColumnFill: 'column',
            slidesPerGroup: 1,
            centeredSlides: false,
            // Touches
            touchRatio: 1,
            touchAngle: 45,
            simulateTouch: true,
            shortSwipes: true,
            longSwipes: true,
            longSwipesRatio: 0.5,
            longSwipesMs: 300,
            followFinger: true,
            onlyExternal: false,
            threshold: 0,
            touchMoveStopPropagation: true,
            // Pagination
            pagination: null,
            paginationClickable: false,
            paginationHide: false,
            // Resistance
            resistance: true,
            resistanceRatio: 0.85,
            // Next/prev buttons
            nextButton: null,
            prevButton: null,
            // Progress
            watchSlidesProgress: false,
            watchVisibility: false,
            // Cursor
            grabCursor: false,
            // Clicks
            preventClicks: true,
            preventClicksPropagation: true,
            releaseFormElements: true,
            slideToClickedSlide: false,
            // Images
            updateOnImagesReady: true,
            // loop
            loop: false,
            loopAdditionalSlides: 0,
            loopedSlides: null,
            // Control
            control: undefined,
            controlInverse: false,
            // Swiping/no swiping
            allowSwipeToPrev: true,
            allowSwipeToNext: true,
            swipeHandler: null, //'.swipe-handler',
            noSwiping: true,
            noSwipingClass: 'swiper-no-swiping',
            // NS
            slideClass: 'swiper-slide',
            slideActiveClass: 'swiper-slide-active',
            slideVisibleClass: 'swiper-slide-visible',
            slideDuplicateClass: 'swiper-slide-duplicate',
            slideNextClass: 'swiper-slide-next',
            slidePrevClass: 'swiper-slide-prev',
            wrapperClass: 'swiper-wrapper',
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active',
            buttonDisabledClass: 'swiper-button-disabled',
            paginationHiddenClass: 'swiper-pagination-hidden',
            // Observer
            observer: false,
            observeParents: false,
            // Callbacks
            runCallbacksOnInit: true
            /*
            Callbacks:
            onInit: function (swiper)
            onDestroy: function (swiper)
            onClick: function (swiper, e) 
            onTap: function (swiper, e) 
            onDoubleTap: function (swiper, e) 
            onSliderMove: function (swiper, e) 
            onSlideChangeStart: function (swiper) 
            onSlideChangeEnd: function (swiper) 
            onTransitionStart: function (swiper) 
            onTransitionEnd: function (swiper) 
            onImagesReady: function (swiper) 
            onProgress: function (swiper, progress) 
            onTouchStart: function (swiper, e) 
            onTouchMove: function (swiper, e) 
            onTouchMoveOpposite: function (swiper, e) 
            onTouchEnd: function (swiper, e) 
            onReachBeginning: function (swiper) 
            onReachEnd: function (swiper) 
            onSetTransition: function (swiper, duration) 
            onSetTranslate: function (swiper, translate) 
            onAutoplayStart: function (swiper)
            onAutoplayStop: function (swiper)
            */
        };
        params = params || {};
        for (var def in defaults) {
            if (typeof params[def] === 'undefined') {
                params[def] = defaults[def];
            }
            else if (typeof params[def] === 'object') {
                for (var deepDef in defaults[def]) {
                    if (typeof params[def][deepDef] === 'undefined') {
                        params[def][deepDef] = defaults[def][deepDef];
                    }
                }
            }
        }
        
        // Swiper
        var s = this;
        
        // Params
        s.params = params;
        /*=========================
          Dom Library and plugins
          ===========================*/
        var $;
        if (typeof Dom7 === 'undefined') {
            $ = window.Dom7 || window.Zepto || window.jQuery;
        }
        else {
            $ = Dom7;
        }
        if (!$) return;
        
        /*=========================
          Preparation - Define Container, Wrapper and Pagination
          ===========================*/
        s.container = $(container);
        if (s.container.length === 0) return;
        if (s.container.length > 1) {
            s.container.each(function () {
                new Swiper(this, params);
            });
            return;
        }
        
        // Save instance in container HTML Element and in data
        s.container[0].swiper = s;
        s.container.data('swiper', s);
        
        s.container.addClass('swiper-container-' + s.params.direction);
        
        if (s.params.freeMode) {
            s.container.addClass('swiper-container-free-mode');
        }
        // Enable slides progress when required
        if (s.params.parallax || s.params.watchVisibility) {
            s.params.watchSlidesProgress = true;
        }
        // Coverflow / 3D
        if (['cube', 'coverflow'].indexOf(s.params.effect) >= 0) {
            if (s.support.transforms3d) {
                s.params.watchSlidesProgress = true;
                s.container.addClass('swiper-container-3d');
            }
            else {
                s.params.effect = 'slide';
            }
        }
        if (s.params.effect !== 'slide') {
            s.container.addClass('swiper-container-' + s.params.effect);
        }
        if (s.params.effect === 'cube') {
            s.params.resistanceRatio = 0;
            s.params.slidesPerView = 1;
            s.params.slidesPerColumn = 1;
            s.params.slidesPerGroup = 1;
            s.params.centeredSlides = false;
            s.params.spaceBetween = 0;
        }
        if (s.params.effect === 'fade') {
            s.params.watchSlidesProgress = true;
            s.params.spaceBetween = 0;
        }
        
        // Grab Cursor
        if (s.params.grabCursor && s.support.touch) {
            s.params.grabCursor = false;
        }
        
        // Wrapper
        s.wrapper = s.container.children('.' + s.params.wrapperClass);
        
        // Pagination
        if (s.params.pagination) {
            s.paginationContainer = $(s.params.pagination);
            if (s.params.paginationClickable) {
                s.paginationContainer.addClass('swiper-pagination-clickable');
            }
        }
        
        // Is Horizontal
        function isH() {
            return s.params.direction === 'horizontal';
        }
        
        // RTL
        s.rtl = isH() && (s.container[0].dir.toLowerCase() === 'rtl' || s.container.css('direction') === 'rtl');
        if (s.rtl) s.container.addClass('swiper-container-rtl');
        
        // Wrong RTL support
        if (s.rtl) {
            s.wrongRTL = s.wrapper.css('display') === '-webkit-box';
        }
        
        // Translate
        s.translate = 0;
        
        // Progress
        s.progress = 0;
        
        // Velocity
        s.velocity = 0;
        
        // Locks, unlocks
        s.lockSwipeToNext = function () {
            s.params.allowSwipeToNext = false;
        };
        s.lockSwipeToPrev = function () {
            s.params.allowSwipeToPrev = false;
        };
        s.lockSwipes = function () {
            s.params.allowSwipeToNext = s.params.allowSwipeToPrev = false;
        };
        s.unlockSwipeToNext = function () {
            s.params.allowSwipeToNext = true;
        };
        s.unlockSwipeToPrev = function () {
            s.params.allowSwipeToPrev = true;
        };
        s.unlockSwipes = function () {
            s.params.allowSwipeToNext = s.params.allowSwipeToPrev = true;
        };
        
        // Columns
        if (s.params.slidesPerColumn > 1) {
            s.container.addClass('swiper-container-multirow');
        }
        
        
        /*=========================
          Set grab cursor
          ===========================*/
        if (s.params.grabCursor) {
            s.container[0].style.cursor = 'move';
            s.container[0].style.cursor = '-webkit-grab';
            s.container[0].style.cursor = '-moz-grab';
            s.container[0].style.cursor = 'grab';
        }
        /*=========================
          Update on Images Ready
          ===========================*/
        s.imagesToLoad = [];
        s.imagesLoaded = 0;
        
        function loadImage(img) {
            var image, src;
            var onReady = function () {
                if (typeof s === 'undefined' || s === null) return;
                if (s.imagesLoaded !== undefined) s.imagesLoaded++;
                if (s.imagesLoaded === s.imagesToLoad.length) {
                    s.update();
                    if (s.params.onImagesReady) s.params.onImagesReady(s);
                }
            };
        
            if (!img.complete) {
                src = (img.currentSrc || img.getAttribute('src'));
                if (src) {
                    image = new Image();
                    image.onload = onReady;
                    image.onerror = onReady;
                    image.src = src;
                } else {
                    onReady();
                }
        
            } else {//image already loaded...
                onReady();
            }
        }
        s.preloadImages = function () {
            s.imagesToLoad = s.container.find('img');
        
            for (var i = 0; i < s.imagesToLoad.length; i++) {
                loadImage(s.imagesToLoad[i]);
            }
        };
        
        /*=========================
          Autoplay
          ===========================*/
        s.autoplayTimeoutId = undefined;
        s.autoplaying = false;
        s.autoplayPaused = false;
        function autoplay() {
            s.autoplayTimeoutId = setTimeout(function () {
                if (s.params.loop) {
                    s.fixLoop();
                    s._slideNext();
                }
                else {
                    if (!s.isEnd) {
                        s._slideNext();
                    }
                    else {
                        if (!params.autoplayStopOnLast) {
                            s._slideTo(0);
                        }
                        else {
                            s.stopAutoplay();
                        }
                    }
                }
            }, s.params.autoplay);
        }
        s.startAutoplay = function () {
            if (typeof s.autoplayTimeoutId !== 'undefined') return false;
            if (!s.params.autoplay) return false;
            if (s.autoplaying) return false;
            s.autoplaying = true;
            if (s.params.onAutoplayStart) s.params.onAutoplayStart(s);
            autoplay();
        };
        s.stopAutoplay = function (internal) {
            if (!s.autoplayTimeoutId) return;
            if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
            s.autoplaying = false;
            s.autoplayTimeoutId = undefined;
            if (s.params.onAutoplayStop) s.params.onAutoplayStop(s);
        };
        s.pauseAutoplay = function (speed) {
            if (s.autoplayPaused) return;
            if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
            s.autoplayPaused = true;
            if (speed === 0) {
                s.autoplayPaused = false;
                autoplay();
            }
            else {
                s.wrapper.transitionEnd(function () {
                    s.autoplayPaused = false;
                    if (!s.autoplaying) {
                        s.stopAutoplay();
                    }
                    else {
                        autoplay();
                    }
                });
            }
        };
        /*=========================
          Min/Max Translate
          ===========================*/
        s.minTranslate = function () {
            return (-s.snapGrid[0]);
        };
        s.maxTranslate = function () {
            return (-s.snapGrid[s.snapGrid.length - 1]);
        };
        /*=========================
          Slider/slides sizes
          ===========================*/
        s.updateContainerSize = function () {
            s.width = s.container[0].clientWidth;
            s.height = s.container[0].clientHeight;
            s.size = isH() ? s.width : s.height;
        };
        
        s.updateSlidesSize = function () {
            s.slides = s.wrapper.children('.' + s.params.slideClass);
            s.snapGrid = [];
            s.slidesGrid = [];
            s.slidesSizesGrid = [];
            
            var spaceBetween = s.params.spaceBetween,
                slidePosition = 0,
                i,
                prevSlideSize = 0,
                index = 0;
            if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
                spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * s.size;
            }
        
            s.virtualWidth = -spaceBetween;
            // reset margins
            if (s.rtl) s.slides.css({marginLeft: '', marginTop: ''});
            else s.slides.css({marginRight: '', marginBottom: ''});
        
            var slidesNumberEvenToRows;
            if (s.params.slidesPerColumn > 1) {
                if (Math.floor(s.slides.length / s.params.slidesPerColumn) === s.slides.length / s.params.slidesPerColumn) {
                    slidesNumberEvenToRows = s.slides.length;
                }
                else {
                    slidesNumberEvenToRows = Math.ceil(s.slides.length / s.params.slidesPerColumn) * s.params.slidesPerColumn;
                }
            }
        
            // Calc slides
            var slideSize;
            for (i = 0; i < s.slides.length; i++) {
                slideSize = 0;
                var slide = s.slides.eq(i);
                if (s.params.slidesPerColumn > 1) {
                    // Set slides order
                    var newSlideOrderIndex;
                    var column, row;
                    var slidesPerColumn = s.params.slidesPerColumn;
                    var slidesPerRow;
                    if (s.params.slidesPerColumnFill === 'column') {
                        column = Math.floor(i / slidesPerColumn);
                        row = i - column * slidesPerColumn;
                        newSlideOrderIndex = column + row * slidesNumberEvenToRows / slidesPerColumn;
                        slide
                            .css({
                                '-webkit-box-ordinal-group': newSlideOrderIndex,
                                '-moz-box-ordinal-group': newSlideOrderIndex,
                                '-ms-flex-order': newSlideOrderIndex,
                                '-webkit-order': newSlideOrderIndex,
                                'order': newSlideOrderIndex
                            });
                    }
                    else {
                        slidesPerRow = slidesNumberEvenToRows / slidesPerColumn;
                        row = Math.floor(i / slidesPerRow);
                        column = i - row * slidesPerRow;
                        
                    }
                    slide
                        .css({
                            'margin-top': (row !== 0 && s.params.spaceBetween) && (s.params.spaceBetween + 'px')
                        })
                        .attr('data-swiper-column', column)
                        .attr('data-swiper-row', row);
                        
                }
                if (slide.css('display') === 'none') continue;
                if (s.params.slidesPerView === 'auto') {
                    slideSize = isH() ? slide.outerWidth(true) : slide.outerHeight(true);
                }
                else {
                    slideSize = (s.size - (s.params.slidesPerView - 1) * spaceBetween) / s.params.slidesPerView;
                    if (isH()) {
                        s.slides[i].style.width = slideSize + 'px';
                    }
                    else {
                        s.slides[i].style.height = slideSize + 'px';
                    }
                }
                s.slides[i].swiperSlideSize = slideSize;
                s.slidesSizesGrid.push(slideSize);
                
                
                if (s.params.centeredSlides) {
                    slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
                    if (i === 0) slidePosition = slidePosition - s.size / 2 - spaceBetween;
                    if (Math.abs(slidePosition) < 1 / 1000) slidePosition = 0;
                    if ((index) % s.params.slidesPerGroup === 0) s.snapGrid.push(slidePosition);
                    s.slidesGrid.push(slidePosition);
                }
                else {
                    if ((index) % s.params.slidesPerGroup === 0) s.snapGrid.push(slidePosition);
                    s.slidesGrid.push(slidePosition);
                    slidePosition = slidePosition + slideSize + spaceBetween;
                }
        
                s.virtualWidth += slideSize + spaceBetween;
        
                prevSlideSize = slideSize;
        
                index ++;
            }
            s.virtualWidth = Math.max(s.virtualWidth, s.size);
        
            var newSlidesGrid;
        
            if (s.rtl && s.wrongRTL && (s.params.effect === 'slide' || s.params.effect === 'coverflow')) {
                s.wrapper.css({width: s.virtualWidth + s.params.spaceBetween + 'px'});
            }
        
            if (s.params.slidesPerColumn > 1) {
                s.virtualWidth = (slideSize + s.params.spaceBetween) * slidesNumberEvenToRows;
                s.virtualWidth = Math.ceil(s.virtualWidth / s.params.slidesPerColumn) - s.params.spaceBetween;
                s.wrapper.css({width: s.virtualWidth + s.params.spaceBetween + 'px'});
                if (s.params.centeredSlides) {
                    newSlidesGrid = [];
                    for (i = 0; i < s.snapGrid.length; i++) {
                        if (s.snapGrid[i] < s.virtualWidth + s.snapGrid[0]) newSlidesGrid.push(s.snapGrid[i]);
                    }
                    s.snapGrid = newSlidesGrid;
                }
            }
        
            // Remove last grid elements depending on width
            if (!s.params.centeredSlides) {
                newSlidesGrid = [];
                for (i = 0; i < s.snapGrid.length; i++) {
                    if (s.snapGrid[i] <= s.virtualWidth - s.size) {
                        newSlidesGrid.push(s.snapGrid[i]);
                    }
                }
                s.snapGrid = newSlidesGrid;
                if (Math.floor(s.virtualWidth - s.size) > Math.floor(s.snapGrid[s.snapGrid.length - 1])) {
                    s.snapGrid.push(s.virtualWidth - s.size);
                }
            }
            if (s.snapGrid.length === 0) s.snapGrid = [0];
                
            if (s.params.spaceBetween !== 0) {
                if (isH()) {
                    if (s.rtl) s.slides.css({marginLeft: spaceBetween + 'px'});
                    else s.slides.css({marginRight: spaceBetween + 'px'});
                }
                else s.slides.css({marginBottom: spaceBetween + 'px'});
            }
            if (s.params.watchSlidesProgress) {
                s.updateSlidesOffset();
            }
        };
        s.updateSlidesOffset = function () {
            for (var i = 0; i < s.slides.length; i++) {
                s.slides[i].swiperSlideOffset = isH() ? s.slides[i].offsetLeft : s.slides[i].offsetTop;
            }
        };
        
        /*=========================
          Slider/slides progress
          ===========================*/
        s.updateSlidesProgress = function (translate) {
            if (typeof translate === 'undefined') {
                translate = s.translate || 0;
            }
            if (s.slides.length === 0) return;
            if (typeof s.slides[0].swiperSlideOffset === 'undefined') s.updateSlidesOffset();
        
            var offsetCenter = s.params.centeredSlides ? -translate + s.size / 2 : -translate;
            if (s.rtl) offsetCenter = s.params.centeredSlides ? translate - s.size / 2 : translate;
        
            // Visible Slides
            var containerBox = s.container[0].getBoundingClientRect();
            var sideBefore = isH() ? 'left' : 'top';
            var sideAfter = isH() ? 'right' : 'bottom';
            s.slides.removeClass(s.params.slideVisibleClass);
            for (var i = 0; i < s.slides.length; i++) {
                var slide = s.slides[i];
                var slideCenterOffset = (s.params.centeredSlides === true) ? slide.swiperSlideSize / 2 : 0;
                var slideProgress = (offsetCenter - slide.swiperSlideOffset - slideCenterOffset) / (slide.swiperSlideSize + s.params.spaceBetween);
                if (s.params.watchVisibility) {
                    var slideBefore = -(offsetCenter - slide.swiperSlideOffset - slideCenterOffset);
                    var slideAfter = slideBefore + s.slidesSizesGrid[i];
                    var isVisible =
                        (slideBefore >= 0 && slideBefore < s.size) ||
                        (slideAfter > 0 && slideAfter <= s.size) ||
                        (slideBefore <= 0 && slideAfter >= s.size);
                    if (isVisible) {
                        s.slides.eq(i).addClass(s.params.slideVisibleClass);
                    }
                }
                slide.progress = s.rtl ? -slideProgress : slideProgress;
            }
        };
        s.updateProgress = function (translate) {
            if (typeof translate === 'undefined') {
                translate = s.translate || 0;
            }
            var translatesDiff = s.maxTranslate() - s.minTranslate();
            if (translatesDiff === 0) {
                s.progress = 0;
                s.isBeginning = s.isEnd = true;
            }
            else {
                s.progress = (translate - s.minTranslate()) / (translatesDiff);
                s.isBeginning = s.progress <= 0;
                s.isEnd = s.progress >= 1;
            }
            if (s.isBeginning && s.params.onReachBeginning) s.params.onReachBeginning(s);
            if (s.isEnd && s.params.onReachEnd) s.params.onReachEnd(s);
            
            if (s.params.watchSlidesProgress) s.updateSlidesProgress(translate);
            if (s.params.onProgress) s.params.onProgress(s, s.progress);
        };
        s.updateActiveIndex = function () {
            var translate = s.rtl ? s.translate : -s.translate;
            var newActiveIndex, i, snapIndex;
            for (i = 0; i < s.slidesGrid.length; i ++) {
                if (typeof s.slidesGrid[i + 1] !== 'undefined') {
                    if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1] - (s.slidesGrid[i + 1] - s.slidesGrid[i]) / 2) {
                        newActiveIndex = i;
                    }
                    else if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1]) {
                        newActiveIndex = i + 1;
                    }
                }
                else {
                    if (translate >= s.slidesGrid[i]) {
                        newActiveIndex = i;
                    }
                }
            }
            // Normalize slideIndex
            if (newActiveIndex < 0 || typeof newActiveIndex === 'undefined') newActiveIndex = 0;
            // for (i = 0; i < s.slidesGrid.length; i++) {
                // if (- translate >= s.slidesGrid[i]) {
                    // newActiveIndex = i;
                // }
            // }
            snapIndex = Math.floor(newActiveIndex / s.params.slidesPerGroup);
            if (snapIndex >= s.snapGrid.length) snapIndex = s.snapGrid.length - 1;
        
            if (newActiveIndex === s.activeIndex) {
                return;
            }
            s.snapIndex = snapIndex;
            s.previousIndex = s.activeIndex;
            s.activeIndex = newActiveIndex;
            s.updateClasses();
        };
        
        /*=========================
          Classes
          ===========================*/
        s.updateClasses = function () {
            s.slides.removeClass(s.params.slideActiveClass + ' ' + s.params.slideNextClass + ' ' + s.params.slidePrevClass);
            var activeSlide = s.slides.eq(s.activeIndex);
            // Active classes
            activeSlide.addClass(s.params.slideActiveClass);
            activeSlide.next('.' + s.params.slideClass).addClass(s.params.slideNextClass);
            activeSlide.prev('.' + s.params.slideClass).addClass(s.params.slidePrevClass);
        
            // Pagination
            if (s.bullets && s.bullets.length > 0) {
                s.bullets.removeClass(s.params.bulletActiveClass);
                var bulletIndex;
                if (s.params.loop) {
                    bulletIndex = s.activeIndex - s.loopedSlides;
                    if (bulletIndex > s.slides.length - 1 - s.loopedSlides * 2) {
                        bulletIndex = bulletIndex - (s.slides.length - s.loopedSlides * 2);
                    }
                }
                else {
                    if (typeof s.snapIndex !== 'undefined') {
                        bulletIndex = s.snapIndex;
                    }
                    else {
                        bulletIndex = s.activeIndex || 0;
                    }
                }
                s.bullets.eq(bulletIndex).addClass(s.params.bulletActiveClass);
            }
        
            // Next/active buttons
            if (!s.params.loop) {
                if (s.params.prevButton) {
                    if (s.isBeginning) $(s.params.prevButton).addClass(s.params.buttonDisabledClass);
                    else $(s.params.prevButton).removeClass(s.params.buttonDisabledClass);
                }
                if (s.params.nextButton) {
                    if (s.isEnd) $(s.params.nextButton).addClass(s.params.buttonDisabledClass);
                    else $(s.params.nextButton).removeClass(s.params.buttonDisabledClass);
                }
            }
        };
        
        /*=========================
          Pagination
          ===========================*/
        s.updatePagination = function () {
            if (!s.params.pagination) return;
            if (s.paginationContainer && s.paginationContainer.length > 0) {
                var bulletsHTML = '';
                var numberOfBullets = s.params.loop ? s.slides.length - s.loopedSlides * 2 : s.snapGrid.length;
                for (var i = 0; i < numberOfBullets; i++) {
                    bulletsHTML += '<span class="' + s.params.bulletClass + '"></span>';
                }
                s.paginationContainer.html(bulletsHTML);
                s.bullets = s.paginationContainer.find('.' + s.params.bulletClass);
            }
        };
        /*=========================
          Common update method
          ===========================*/
        s.update = function (updateTranslate) {
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updateProgress();
            s.updatePagination();
            s.updateClasses();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            function forceSetTranslate() {
                newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
                s.setWrapperTranslate(newTranslate);
                s.updateActiveIndex();
                s.updateClasses();
            }
            if (updateTranslate) {
                var translated, newTranslate;
                if (s.params.freeMode) {
                    forceSetTranslate();
                }
                else {
                    if (s.params.slidesPerView === 'auto' && s.isEnd && !s.params.centeredSlides) {
                        translated = s.slideTo(s.slides.length - 1, 0, false, true);
                    }
                    else {
                        translated = s.slideTo(s.activeIndex, 0, false, true);
                    }
                    if (!translated) {
                        forceSetTranslate();
                    }
                }
                    
            }
        };
        
        /*=========================
          Resize Handler
          ===========================*/
        s.onResize = function () {
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updateProgress();
            if (s.params.slidesPerView === 'auto' || s.params.freeMode) s.updatePagination();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            if (s.params.freeMode) {
                var newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
                s.setWrapperTranslate(newTranslate);
                s.updateActiveIndex();
                s.updateClasses();
            }
            else {
                s.updateClasses();
                if (s.params.slidesPerView === 'auto' && s.isEnd && !s.params.centeredSlides) {
                    s.slideTo(s.slides.length - 1, 0, false, true);
                }
                else {
                    s.slideTo(s.activeIndex, 0, false, true);
                }
            }
                
        };
        
        /*=========================
          Events
          ===========================*/
        
        //Define Touch Events
        var desktopEvents = ['mousedown', 'mousemove', 'mouseup'];
        if (window.navigator.pointerEnabled) desktopEvents = ['pointerdown', 'pointermove', 'pointerup'];
        else if (window.navigator.msPointerEnabled) desktopEvents = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp'];
        s.touchEvents = {
            start : s.support.touch || !s.params.simulateTouch  ? 'touchstart' : desktopEvents[0],
            move : s.support.touch || !s.params.simulateTouch ? 'touchmove' : desktopEvents[1],
            end : s.support.touch || !s.params.simulateTouch ? 'touchend' : desktopEvents[2]
        };
            
        
        // WP8 Touch Events Fix
        if (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) {
            (s.params.touchEventsTarget === 'container' ? s.container : s.wrapper).addClass('swiper-wp8-' + s.params.direction);
        }
        
        // Attach/detach events
        s.events = function (detach) {
            var actionDom = detach ? 'off' : 'on';
            var action = detach ? 'removeEventListener' : 'addEventListener';
            var touchEventsTarget = s.params.touchEventsTarget === 'container' ? s.container[0] : s.wrapper[0];
            var target = s.support.touch ? touchEventsTarget : document;
        
            var moveCapture = s.params.nested ? true : false;
        
            //Touch Events
            if (s.browser.ie) {
                touchEventsTarget[action](s.touchEvents.start, s.onTouchStart, false);
                target[action](s.touchEvents.move, s.onTouchMove, moveCapture);
                target[action](s.touchEvents.end, s.onTouchEnd, false);
            }
            else {
                if (s.support.touch) {
                    touchEventsTarget[action](s.touchEvents.start, s.onTouchStart, false);
                    touchEventsTarget[action](s.touchEvents.move, s.onTouchMove, moveCapture);
                    touchEventsTarget[action](s.touchEvents.end, s.onTouchEnd, false);
                }
                if (params.simulateTouch && !s.device.ios && !s.device.android) {
                    touchEventsTarget[action]('mousedown', s.onTouchStart, false);
                    target[action]('mousemove', s.onTouchMove, moveCapture);
                    target[action]('mouseup', s.onTouchEnd, false);
                }
            }
            window[action]('resize', s.onResize);
        
            // Next, Prev, Index
            if (s.params.nextButton) $(s.params.nextButton)[actionDom]('click', s.onClickNext);
            if (s.params.prevButton) $(s.params.prevButton)[actionDom]('click', s.onClickPrev);
            if (s.params.pagination && s.params.paginationClickable) {
                $(s.paginationContainer)[actionDom]('click', '.' + s.params.bulletClass, s.onClickIndex);
            }
        
            // Prevent Links Clicks
            if (s.params.preventClicks || s.params.preventClicksPropagation) touchEventsTarget[action]('click', s.preventClicks, true);
        };
        s.attachEvents = function (detach) {
            s.events();
        };
        s.detachEvents = function () {
            s.events(true);
        };
        
        /*=========================
          Handle Clicks
          ===========================*/
        // Prevent Clicks
        s.allowClick = true;
        s.preventClicks = function (e) {
            if (!s.allowClick) {
                if (s.params.preventClicks) e.preventDefault();
                if (s.params.preventClicksPropagation) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
            }
        };
        // Clicks
        s.onClickNext = function (e) {
            e.preventDefault();
            s.slideNext();
        };
        s.onClickPrev = function (e) {
            e.preventDefault();
            s.slidePrev();
        };
        s.onClickIndex = function (e) {
            e.preventDefault();
            var index = $(this).index() * s.params.slidesPerGroup;
            if (s.params.loop) index = index + s.loopedSlides;
            s.slideTo(index);
        };
        
        /*=========================
          Handle Touches
          ===========================*/
        function findElementInEvent(e, selector) {
            var el = $(e.target);
            if (!el.is(selector)) {
                if (typeof selector === 'string') {
                    el = el.parents(selector);
                }
                else if (selector.nodeType) {
                    var found;
                    el.parents().each(function (index, _el) {
                        if (_el === selector) found = selector;
                    });
                    if (!found) return undefined;
                    else return selector;
                }
            }
            if (el.length === 0) {
                return undefined;
            }
            return el[0];
        }
        s.updateClickedSlide = function (e) {
            var slide = findElementInEvent(e, '.' + s.params.slideClass);
            if (slide) {
                s.clickedSlide = slide;
                s.clickedIndex = $(slide).index();
            }
            else {
                s.clickedSlide = undefined;
                s.clickedIndex = undefined;
                return;
            }
            if (s.params.slideToClickedSlide && s.clickedIndex !== undefined && s.clickedIndex !== s.activeIndex) {
                var slideToIndex = s.clickedIndex,
                    realIndex;
                if (s.params.loop) {
                    realIndex = $(s.clickedSlide).attr('data-swiper-slide-index');
                    if (slideToIndex > s.slides.length - s.params.slidesPerView) {
                        s.fixLoop();
                        slideToIndex = s.wrapper.children('.' + s.params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]').eq(0).index();
                        setTimeout(function () {
                            s.slideTo(slideToIndex);
                        }, 0);
                    }
                    else if (slideToIndex < s.params.slidesPerView - 1) {
                        s.fixLoop();
                        var duplicatedSlides = s.wrapper.children('.' + s.params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]');
                        slideToIndex = duplicatedSlides.eq(duplicatedSlides.length - 1).index();
                        setTimeout(function () {
                            s.slideTo(slideToIndex);
                        }, 0);
                    }
                    else {
                        s.slideTo(slideToIndex);
                    }
                }
                else {
                    s.slideTo(slideToIndex);
                }
            }
        };
        
        var isTouched, 
            isMoved, 
            touchStartTime, 
            isScrolling, 
            currentTranslate, 
            startTranslate, 
            allowThresholdMove,
            // Form elements to match
            formElements = 'input, select, textarea, button',
            // Last click time
            lastClickTime = Date.now(), clickTimeout,
            //Velocities
            velocities = [], 
            allowMomentumBounce;
        
        // Animating Flag
        s.animating = false;
        
        // Touches information
        s.touches = {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            diff: 0
        };
        
        // Touch handlers
        var isTouchEvent;
        s.onTouchStart = function (e) {
            if (e.originalEvent) e = e.originalEvent;
            isTouchEvent = e.type === 'touchstart';
            if (!isTouchEvent && 'which' in e && e.which === 3) return;
            if (s.params.noSwiping && findElementInEvent(e, '.' + s.params.noSwipingClass)) {
                s.allowClick = true;
                return;
            }
            if (s.params.swipeHandler) {
                if (!findElementInEvent(e, s.params.swipeHandler)) return;
            }
            isTouched = true;
            isMoved = false;
            isScrolling = undefined;
            s.touches.startX = s.touches.currentX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
            s.touches.startY = s.touches.currentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
            touchStartTime = Date.now();
            s.allowClick = true;
            s.updateContainerSize();
            s.swipeDirection = undefined;
            if (s.params.threshold > 0) allowThresholdMove = false;
            if (e.type !== 'touchstart') {
                var preventDefault = true;
                if ($(e.target).is(formElements)) preventDefault = false;
                if (document.activeElement && $(document.activeElement).is(formElements)) document.activeElement.blur();
                if (preventDefault) {
                    e.preventDefault();
                }
            }
            if (s.params.onTouchStart) s.params.onTouchStart(s, e);
        };
        
        s.onTouchMove = function (e) {
            if (e.originalEvent) e = e.originalEvent;
            if (isTouchEvent && e.type === 'mousemove') return;
            if (e.preventedByNestedSwiper) return;
            if (s.params.onlyExternal) {
                isMoved = true;
                s.allowClick = false;
                return;
            }
            if (s.params.onTouchMove) s.params.onTouchMove(s, e);
            s.allowClick = false;
            if (e.targetTouches && e.targetTouches.length > 1) return;
            
            s.touches.currentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
            s.touches.currentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
        
            if (typeof isScrolling === 'undefined') {
                var touchAngle = Math.atan2(Math.abs(s.touches.currentY - s.touches.startY), Math.abs(s.touches.currentX - s.touches.startX)) * 180 / Math.PI;
                isScrolling = isH() ? touchAngle > s.params.touchAngle : (90 - touchAngle > s.params.touchAngle);
                // isScrolling = !!(isScrolling || Math.abs(touchesCurrent.y - touchesStart.y) > Math.abs(touchesCurrent.x - touchesStart.x));
            }
            if (isScrolling && s.params.onTouchMoveOpposite) {
                s.params.onTouchMoveOpposite(s, e);
            }
            if (!isTouched) return;
            if (isScrolling)  {
                isTouched = false;
                return;
            }
            if (s.params.onSliderMove) s.params.onSliderMove(s, e);
        
            e.preventDefault();
            if (s.params.touchMoveStopPropagation && !s.params.nested) {
                e.stopPropagation();
            }
        
            if (!isMoved) {
                if (params.loop) {
                    s.fixLoop();
                }
                startTranslate = s.params.effect === 'cube' ? ((s.rtl ? -s.translate: s.translate) || 0) : s.getWrapperTranslate();
                s.setWrapperTransition(0);
                if (s.animating) {
                    s.wrapper.trigger('webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd');
                }
                if (s.params.autoplay && s.autoplaying) {
                    if (s.params.autoplayDisableOnInteraction) {
                        s.stopAutoplay();
                    }
                    else {
                        s.pauseAutoplay();
                    }
                }
                allowMomentumBounce = false;
                //Grab Cursor
                if (s.params.grabCursor) {
                    s.container[0].style.cursor = 'move';
                    s.container[0].style.cursor = '-webkit-grabbing';
                    s.container[0].style.cursor = '-moz-grabbin';
                    s.container[0].style.cursor = 'grabbing';
                }
            }
            isMoved = true;
        
            var diff = s.touches.diff = isH() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;
        
            diff = diff * s.params.touchRatio;
            if (s.rtl) diff = -diff;
        
            s.swipeDirection = diff > 0 ? 'prev' : 'next';
            currentTranslate = diff + startTranslate;
        
            var disableParentSwiper = true;
            if ((diff > 0 && currentTranslate > s.minTranslate())) {
                disableParentSwiper = false;
                if (s.params.resistance) currentTranslate = s.minTranslate() - 1 + Math.pow(-s.minTranslate() + startTranslate + diff, s.params.resistanceRatio);
            }
            else if (diff < 0 && currentTranslate < s.maxTranslate()) {
                disableParentSwiper = false;
                if (s.params.resistance) currentTranslate = s.maxTranslate() + 1 - Math.pow(s.maxTranslate() - startTranslate - diff, s.params.resistanceRatio);
            }
            
            if (disableParentSwiper) {
                e.preventedByNestedSwiper = true;
            }
        
            // Directions locks
            if (!s.params.allowSwipeToNext && s.swipeDirection === 'next' && currentTranslate < startTranslate) {
                currentTranslate = startTranslate;
            }
            if (!s.params.allowSwipeToPrev && s.swipeDirection === 'prev' && currentTranslate > startTranslate) {
                currentTranslate = startTranslate;
            }
            
            if (!s.params.followFinger) return;
        
            // Threshold
            if (s.params.threshold > 0) {
                if (Math.abs(diff) > s.params.threshold || allowThresholdMove) {
                    if (!allowThresholdMove) {
                        allowThresholdMove = true;
                        s.touches.startX = s.touches.currentX;
                        s.touches.startY = s.touches.currentY;
                        currentTranslate = startTranslate;
                        s.touches.diff = isH() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;
                        return;
                    }
                }
                else {
                    currentTranslate = startTranslate;
                    return;
                }
            }
            // Update active index in free mode
            if (s.params.freeMode || s.params.watchSlidesProgress) {
                s.updateActiveIndex();
            }
            if (s.params.freeMode) {
                //Velocity
                if (velocities.length === 0) {
                    velocities.push({
                        position: s.touches[isH() ? 'startX' : 'startY'],
                        time: touchStartTime
                    });
                }
                velocities.push({
                    position: s.touches[isH() ? 'currentX' : 'currentY'],
                    time: (new Date()).getTime()
                });
            }
            // Update progress
            s.updateProgress(currentTranslate);
            // Update translate
            s.setWrapperTranslate(currentTranslate);
        };
        s.onTouchEnd = function (e) {
            if (e.originalEvent) e = e.originalEvent;
            if (s.params.onTouchEnd) s.params.onTouchEnd(s, e);
            if (!isTouched) return;
        
            //Return Grab Cursor
            if (s.params.grabCursor && isMoved && isTouched) {
                s.container[0].style.cursor = 'move';
                s.container[0].style.cursor = '-webkit-grab';
                s.container[0].style.cursor = '-moz-grab';
                s.container[0].style.cursor = 'grab';
            }
        
            // Time diff
            var touchEndTime = Date.now();
            var timeDiff = touchEndTime - touchStartTime;
        
            // Tap, doubleTap, Click
            if (s.allowClick) {
                s.updateClickedSlide(e);
                if (s.params.onTap) s.params.onTap(s, e);
                if (timeDiff < 300 && (touchEndTime - lastClickTime) > 300) {
                    if (clickTimeout) clearTimeout(clickTimeout);
                    clickTimeout = setTimeout(function () {
                        if (!s) return;
                        if (s.params.paginationHide && s.paginationContainer.length > 0 && !$(e.target).hasClass(s.params.bulletClass)) {
                            s.paginationContainer.toggleClass(s.params.paginationHiddenClass);
                        }
                        if (s.params.onClick) s.params.onClick(s, e);
                    }, 300);
                    
                }
                if (timeDiff < 300 && (touchEndTime - lastClickTime) < 300) {
                    if (clickTimeout) clearTimeout(clickTimeout);
                    if (s.params.onDoubleTap) {
                        s.params.onDoubleTap(s, e);
                    }
                }
            }
        
            lastClickTime = Date.now();
            setTimeout(function () {
                if (s && s.allowClick) s.allowClick = true;
            }, 0);
        
            if (!isTouched || !isMoved || !s.swipeDirection || s.touches.diff === 0 || currentTranslate === startTranslate) {
                isTouched = isMoved = false;
                return;
            }
            isTouched = isMoved = false;
        
            var currentPos;
            if (s.params.followFinger) {
                currentPos = s.rtl ? s.translate : -s.translate;
            }
            else {
                currentPos = -currentTranslate;
            }
            if (s.params.freeMode) {
                if (currentPos < -s.minTranslate()) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                else if (currentPos > -s.maxTranslate()) {
                    s.slideTo(s.slides.length - 1);
                    return;
                }
                
                if (s.params.freeModeMomentum) {
                    if (velocities.length > 1) {
                        var lastMoveEvent = velocities.pop(), velocityEvent = velocities.pop();
        
                        var distance = lastMoveEvent.position - velocityEvent.position;
                        var time = lastMoveEvent.time - velocityEvent.time;
                        s.velocity = distance / time;
                        s.velocity = s.velocity / 2;
                        if (Math.abs(s.velocity) < 0.02) {
                            s.velocity = 0;
                        }
                        // this implies that the user stopped moving a finger then released.
                        // There would be no events with distance zero, so the last event is stale.
                        if (time > 150 || (new Date().getTime() - lastMoveEvent.time) > 300) {
                            s.velocity = 0;
                        }
                    } else {
                        s.velocity = 0;
                    }
        
                    velocities.length = 0;
                    var momentumDuration = 1000 * s.params.freeModeMomentumRatio;
                    var momentumDistance = s.velocity * momentumDuration;
        
                    var newPosition = s.translate + momentumDistance;
                    if (s.rtl) newPosition = - newPosition;
                    var doBounce = false;
                    var afterBouncePosition;
                    var bounceAmount = Math.abs(s.velocity) * 20 * s.params.freeModeMomentumBounceRatio;
                    if (newPosition < s.maxTranslate()) {
                        if (s.params.freeModeMomentumBounce) {
                            if (newPosition + s.maxTranslate() < -bounceAmount) {
                                newPosition = s.maxTranslate() - bounceAmount;
                            }
                            afterBouncePosition = s.maxTranslate();
                            doBounce = true;
                            allowMomentumBounce = true;
                        }
                        else {
                            newPosition = s.maxTranslate();
                        }
                    }
                    if (newPosition > s.minTranslate()) {
                        if (s.params.freeModeMomentumBounce) {
                            if (newPosition - s.minTranslate() > bounceAmount) {
                                newPosition = s.minTranslate() + bounceAmount;
                            }
                            afterBouncePosition = s.minTranslate();
                            doBounce = true;
                            allowMomentumBounce = true;
                        }
                        else {
                            newPosition = s.minTranslate();
                        }
                    }
                    //Fix duration
                    if (s.velocity !== 0) {
                        if (s.rtl) {
                            momentumDuration = Math.abs((-newPosition - s.translate) / s.velocity);
                        }
                        else {
                            momentumDuration = Math.abs((newPosition - s.translate) / s.velocity);
                        }
                    }
        
                    if (s.params.freeModeMomentumBounce && doBounce) {
                        s.updateProgress(afterBouncePosition);
                        s.setWrapperTransition(momentumDuration);
                        s.setWrapperTranslate(newPosition);
                        s.onTransitionStart();
                        s.animating = true;
                        s.wrapper.transitionEnd(function () {
                            if (!allowMomentumBounce) return;
                            if (s.params.onMomentumBounce) s.params.onMomentumBounce(s);
        
                            s.setWrapperTransition(s.params.speed);
                            s.setWrapperTranslate(afterBouncePosition);
                            s.wrapper.transitionEnd(function () {
                                s.onTransitionEnd();
                            });
                        });
                    } else if (s.velocity) {
                        s.updateProgress(newPosition);
                        s.setWrapperTransition(momentumDuration);
                        s.setWrapperTranslate(newPosition);
                        s.onTransitionStart();
                        if (!s.animating) {
                            s.animating = true;
                            s.wrapper.transitionEnd(function () {
                                s.onTransitionEnd();
                            });
                        }
                            
                    } else {
                        s.updateProgress(newPosition);
                    }
                    
                    s.updateActiveIndex();
                }
                if (!s.params.freeModeMomentum || timeDiff >= s.params.longSwipesMs) {
                    s.updateProgress();
                    s.updateActiveIndex();
                }
                return;
            }
        
            // Find current slide
            var i, stopIndex = 0, groupSize = s.slidesSizesGrid[0];
            for (i = 0; i < s.slidesGrid.length; i += s.params.slidesPerGroup) {
                if (typeof s.slidesGrid[i + s.params.slidesPerGroup] !== 'undefined') {
                    if (currentPos >= s.slidesGrid[i] && currentPos < s.slidesGrid[i + s.params.slidesPerGroup]) {
                        stopIndex = i;
                        groupSize = s.slidesGrid[i + s.params.slidesPerGroup] - s.slidesGrid[i];
                    }
                }
                else {
                    if (currentPos >= s.slidesGrid[i]) {
                        stopIndex = i;
                        groupSize = s.slidesGrid[s.slidesGrid.length - 1] - s.slidesGrid[s.slidesGrid.length - 2];
                    }
                }
            }
        
            // Find current slide size
            var ratio = (currentPos - s.slidesGrid[stopIndex]) / groupSize;
            
            if (timeDiff > s.params.longSwipesMs) {
                // Long touches
                if (!s.params.longSwipes) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                if (s.swipeDirection === 'next') {
                    if (ratio >= s.params.longSwipesRatio) s.slideTo(stopIndex + s.params.slidesPerGroup);
                    else s.slideTo(stopIndex);
        
                }
                if (s.swipeDirection === 'prev') {
                    if (ratio > (1 - s.params.longSwipesRatio)) s.slideTo(stopIndex + s.params.slidesPerGroup);
                    else s.slideTo(stopIndex);
                }
            }
            else {
                // Short swipes
                if (!s.params.shortSwipes) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                if (s.swipeDirection === 'next') {
                    s.slideTo(stopIndex + s.params.slidesPerGroup);
        
                }
                if (s.swipeDirection === 'prev') {
                    s.slideTo(stopIndex);
                }
            }
        };
        /*=========================
          Transitions
          ===========================*/
        s._slideTo = function (slideIndex, speed) {
            return s.slideTo(slideIndex, speed, true, true);
        };
        s.slideTo = function (slideIndex, speed, runCallbacks, internal) {
            if (typeof runCallbacks === 'undefined') runCallbacks = true;
            if (typeof slideIndex === 'undefined') slideIndex = 0;
            if (slideIndex < 0) slideIndex = 0;
            s.snapIndex = Math.floor(slideIndex / s.params.slidesPerGroup);
            if (s.snapIndex >= s.snapGrid.length) s.snapIndex = s.snapGrid.length - 1;
            
            var translate = - s.snapGrid[s.snapIndex];
        
            // Stop autoplay
        
            if (s.params.autoplay && s.autoplaying) {
                if (internal || !s.params.autoplayDisableOnInteraction) {
                    s.pauseAutoplay(speed);
                }
                else {
                    s.stopAutoplay();
                }
            }
            // Update progress
            s.updateProgress(translate);
        
            // Normalize slideIndex
            for (var i = 0; i < s.slidesGrid.length; i++) {
                if (- translate >= s.slidesGrid[i]) {
                    slideIndex = i;
                }
            }
        
            if (typeof speed === 'undefined') speed = s.params.speed;
            s.previousIndex = s.activeIndex || 0;
            s.activeIndex = slideIndex;
            
            if (translate === s.translate) {
                s.updateClasses();
                return false;
            }
            s.onTransitionStart(runCallbacks);
            var translateX = isH() ? translate : 0, translateY = isH() ? 0 : translate;
            if (speed === 0) {
                s.setWrapperTransition(0);
                s.setWrapperTranslate(translate);
                s.onTransitionEnd(runCallbacks);
            }
            else {
                s.setWrapperTransition(speed);
                s.setWrapperTranslate(translate);
                if (!s.animating) {
                    s.animating = true;
                    s.wrapper.transitionEnd(function () {
                        s.onTransitionEnd(runCallbacks);
                    });
                }
                    
            }
            s.updateClasses();
            return true;
        };
        
        s.onTransitionStart = function (runCallbacks) {
            if (typeof runCallbacks === 'undefined') runCallbacks = true;
            if (runCallbacks) {
                if (s.params.onTransitionStart) s.params.onTransitionStart(s);
                if (s.params.onSlideChangeStart && s.activeIndex !== s.previousIndex) s.params.onSlideChangeStart(s);
            }
        };
        s.onTransitionEnd = function (runCallbacks) {
            s.animating = false;
            s.setWrapperTransition(0);
            if (typeof runCallbacks === 'undefined') runCallbacks = true;
            if (runCallbacks) {
                if (s.params.onTransitionEnd) s.params.onTransitionEnd(s);
                if (s.params.onSlideChangeEnd && s.activeIndex !== s.previousIndex) s.params.onSlideChangeEnd(s);
            }
                
        };
        s.slideNext = function (runCallbacks, speed, internal) {
            if (s.params.loop) {
                if (s.animating) return false;
                s.fixLoop();
                var clientLeft = s.container[0].clientLeft;
                return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
            }
            else return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
        };
        s._slideNext = function (speed) {
            return s.slideNext(true, speed, true);
        };
        s.slidePrev = function (runCallbacks, speed, internal) {
            if (s.params.loop) {
                if (s.animating) return false;
                s.fixLoop();
                var clientLeft = s.container[0].clientLeft;
                return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
            }
            else return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
        };
        s._slidePrev = function (speed) {
            return s.slidePrev(true, speed, true);
        };
        s.slideReset = function (runCallbacks, speed, internal) {
            return s.slideTo(s.activeIndex, speed, runCallbacks);
        };
        
        /*=========================
          Translate/transition helpers
          ===========================*/
        s.setWrapperTransition = function (duration, byController) {
            s.wrapper.transition(duration);
            if (s.params.onSetTransition) s.params.onSetTransition(s, duration);
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                s.effects[s.params.effect].setTransition(duration);
            }
            if (s.params.parallax && s.parallax) {
                s.parallax.setTransition(duration);
            }
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.setTransition(duration);
            }
            if (s.params.control && s.controller) {
                s.controller.setTransition(duration, byController);
            }
        };
        s.setWrapperTranslate = function (translate, updateActiveIndex, byController) {
            var x = 0, y = 0, z = 0;
            if (isH()) {
                x = s.rtl ? -translate : translate;
            }
            else {
                y = translate;
            }
            
            if (s.support.transforms3d) s.wrapper.transform('translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)');
            else s.wrapper.transform('translate(' + x + 'px, ' + y + 'px)');
            s.translate = isH() ? x : y;
            if (updateActiveIndex) s.updateActiveIndex();
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                s.effects[s.params.effect].setTranslate(s.translate);
            }
            if (s.params.parallax && s.parallax) {
                s.parallax.setTranslate(s.translate);
            }
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.setTranslate(s.translate);
            }
            if (s.params.control && s.controller) {
                s.controller.setTranslate(s.translate, byController);
            }
            if (s.params.hashnav && s.hashnav) {
                s.hashnav.setHash();
            }
            if (s.params.onSetTranslate) s.params.onSetTranslate(s, s.translate);
        };
        
        s.getTranslate = function (el, axis) {
            var matrix, curTransform, curStyle, transformMatrix;
        
            // automatic axis detection
            if (typeof axis === 'undefined') {
                axis = 'x';
            }
        
            curStyle = window.getComputedStyle(el, null);
            if (window.WebKitCSSMatrix) {
                // Some old versions of Webkit choke when 'none' is passed; pass
                // empty string instead in this case
                transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
            }
            else {
                transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
                matrix = transformMatrix.toString().split(',');
            }
        
            if (axis === 'x') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m41;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[12]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[4]);
            }
            if (axis === 'y') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m42;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[13]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[5]);
            }
            if (s.rtl && curTransform) curTransform = -curTransform;
            return curTransform || 0;
        };
        s.getWrapperTranslate = function (axis) {
            if (typeof axis === 'undefined') {
                axis = isH() ? 'x' : 'y';
            }
            return s.getTranslate(s.wrapper[0], axis);
        };
        
        /*=========================
          Observer
          ===========================*/
        s.observers = [];
        function initObserver(target, options) {
            options = options || {};
            // create an observer instance
            var ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
            var observer = new ObserverFunc(function (mutations) {
                mutations.forEach(function (mutation) {
                    s.onResize();
                });
            });
             
            observer.observe(target, {
                attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
                childList: typeof options.childList === 'undefined' ? true : options.childList,
                characterData: typeof options.characterData === 'undefined' ? true : options.characterData
            });
        
            s.observers.push(observer);
        }
        s.initObservers = function () {
            if (s.params.observeParents) {
                var containerParents = s.container.parents();
                for (var i = 0; i < containerParents.length; i++) {
                    initObserver(containerParents[i]);
                }
            }
        
            // Observe container
            initObserver(s.container[0], {childList: false});
        
            // Observe wrapper
            initObserver(s.wrapper[0], {attributes: false});
        };
        s.disconnectObservers = function () {
            for (var i = 0; i < s.observers.length; i++) {
                s.observers[i].disconnect();
            }
            s.observers = [];
        };
        /*=========================
          Loop
          ===========================*/
        // Create looped slides
        s.createLoop = function () {
            // Remove duplicated slides
            s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass).remove();
        
            var slides = s.wrapper.children('.' + s.params.slideClass);
            s.loopedSlides = parseInt(s.params.loopedSlides || s.params.slidesPerView, 10);
            s.loopedSlides = s.loopedSlides + s.params.loopAdditionalSlides;
            if (s.loopedSlides > slides.length) {
                s.loopedSlides = slides.length;
            }
        
            var prependSlides = [], appendSlides = [], i;
            slides.each(function (index, el) {
                var slide = $(this);
                if (index < s.loopedSlides) appendSlides.push(el);
                if (index < slides.length && index >= slides.length - s.loopedSlides) prependSlides.push(el);
                slide.attr('data-swiper-slide-index', index);
            });
            for (i = 0; i < appendSlides.length; i++) {
                s.wrapper.append($(appendSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
            }
            for (i = prependSlides.length - 1; i >= 0; i--) {
                s.wrapper.prepend($(prependSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
            }
        };
        s.destroyLoop = function () {
            s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass).remove();
        };
        s.fixLoop = function () {
            var newIndex;
            //Fix For Negative Oversliding
            if (s.activeIndex < s.loopedSlides) {
                newIndex = s.slides.length - s.loopedSlides * 3 + s.activeIndex;
                newIndex = newIndex + s.loopedSlides;
                s.slideTo(newIndex, 0, false, true);
            }
            //Fix For Positive Oversliding
            else if ((s.params.slidesPerView === 'auto' && s.activeIndex >= s.loopedSlides * 2) || (s.activeIndex > s.slides.length - s.params.slidesPerView * 2)) {
                newIndex = -s.slides.length + s.activeIndex + s.loopedSlides;
                newIndex = newIndex + s.loopedSlides;
                s.slideTo(newIndex, 0, false, true);
            }
        };
        /*=========================
          Append/Prepend/Remove Slides
          ===========================*/
        s.appendSlide = function (slides) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            if (typeof slides === 'object' && slides.length) {
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i]) s.wrapper.append(slides[i]);
                }
            }
            else {
                s.wrapper.append(slides);
            }
            if (s.params.loop) {
                s.createLoop();
            }
            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
        };
        s.prependSlide = function (slides) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            var newActiveIndex = s.activeIndex + 1;
            if (typeof slides === 'object' && slides.length) {
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i]) s.wrapper.prepend(slides[i]);
                }
                newActiveIndex = s.activeIndex + slides.length;
            }
            else {
                s.wrapper.prepend(slides);
            }
            if (s.params.loop) {
                s.createLoop();
            }
            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
            s.slideTo(newActiveIndex, 0, false);
        };
        s.removeSlide = function (slidesIndexes) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            var newActiveIndex = s.activeIndex,
                indexToRemove;
            if (typeof slidesIndexes === 'object' && slidesIndexes.length) {
                for (var i = 0; i < slidesIndexes.length; i++) {
                    indexToRemove = slidesIndexes[i];
                    if (s.slides[indexToRemove]) s.slides.eq(indexToRemove).remove();
                    if (indexToRemove < newActiveIndex) newActiveIndex--;
                }
                newActiveIndex = Math.max(newActiveIndex, 0);
            }
            else {
                indexToRemove = slidesIndexes;
                if (s.slides[indexToRemove]) s.slides.eq(indexToRemove).remove();
                if (indexToRemove < newActiveIndex) newActiveIndex--;
                newActiveIndex = Math.max(newActiveIndex, 0);
            }
        
            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
            s.slideTo(newActiveIndex, 0, false);
        };
        s.removeAllSlides = function () {
            var slidesIndexes = [];
            for (var i = 0; i < s.slides.length; i++) {
                slidesIndexes.push(i);
            }
            s.removeSlide(slidesIndexes);
        };
        

        /*=========================
          Effects
          ===========================*/
        s.effects = {
            fade: {
                setTranslate: function () {
                    for (var i = 0; i < s.slides.length; i++) {
                        var slide = s.slides.eq(i);
                        var offset = slide[0].swiperSlideOffset;
                        var tx = -offset - s.translate;
                        var ty = 0;
                        if (!isH()) {
                            ty = tx;
                            tx = 0;
                        }
                        var slideOpacity = s.params.fade.crossFade ?
                                Math.max(1 - Math.abs(slide[0].progress), 0) :
                                1 + Math.min(Math.max(slide[0].progress, -1), 0);
                        slide
                            .css({
                                opacity: slideOpacity
                            })
                            .transform('translate3d(' + tx + 'px, ' + ty + 'px, 0px)');
        
                    }
                },
                setTransition: function (duration) {
                    s.slides.transition(duration);
                }
            },
            cube: {
                setTranslate: function () {
                    var wrapperRotate = 0, cubeShadow;
                    if (s.params.cube.shadow) {
                        if (isH()) {
                            cubeShadow = s.wrapper.find('.swiper-cube-shadow');
                            if (cubeShadow.length === 0) {
                                cubeShadow = $('<div class="swiper-cube-shadow"></div>');
                                s.wrapper.append(cubeShadow);
                            }
                            cubeShadow.css({height: s.width + 'px'});
                        }
                        else {
                            cubeShadow = s.container.find('.swiper-cube-shadow');
                            if (cubeShadow.length === 0) {
                                cubeShadow = $('<div class="swiper-cube-shadow"></div>');
                                s.container.append(cubeShadow);
                            }
                        }
                    }
                    for (var i = 0; i < s.slides.length; i++) {
                        var slide = s.slides.eq(i);
                        var slideAngle = i * 90;
                        var round = Math.floor(slideAngle / 360);
                        if (s.rtl) {
                            slideAngle = -slideAngle;
                            round = Math.floor(-slideAngle / 360);
                        }
                        var progress = Math.max(Math.min(slide[0].progress, 1), -1);
                        var tx = 0, ty = 0, tz = 0;
                        if (i % 4 === 0) {
                            tx = - round * 4 * s.size;
                            tz = 0;
                        }
                        else if ((i - 1) % 4 === 0) {
                            tx = 0;
                            tz = - round * 4 * s.size;
                        }
                        else if ((i - 2) % 4 === 0) {
                            tx = s.size + round * 4 * s.size;
                            tz = s.size;
                        }
                        else if ((i - 3) % 4 === 0) {
                            tx = - s.size;
                            tz = 3 * s.size + s.size * 4 * round;
                        }
                        if (s.rtl) {
                            tx = -tx;
                        }
                        
                        if (!isH()) {
                            ty = tx;
                            tx = 0;
                        }
                        
                        var transform = 'rotateX(' + (isH() ? 0 : -slideAngle) + 'deg) rotateY(' + (isH() ? slideAngle : 0) + 'deg) translate3d(' + tx + 'px, ' + ty + 'px, ' + tz + 'px)';
                        if (progress <= 1 && progress > -1) {
                            wrapperRotate = i * 90 + progress * 90;
                            if (s.rtl) wrapperRotate = -i * 90 - progress * 90;
                        }
                        slide.transform(transform);
                        if (s.params.cube.slideShadows) {
                            //Set shadows
                            var shadowBefore = isH() ? slide.find('.swiper-slide-shadow-left') : slide.find('.swiper-slide-shadow-top');
                            var shadowAfter = isH() ? slide.find('.swiper-slide-shadow-right') : slide.find('.swiper-slide-shadow-bottom');
                            if (shadowBefore.length === 0) {
                                shadowBefore = $('<div class="swiper-slide-shadow-' + (isH() ? 'left' : 'top') + '"></div>');
                                slide.append(shadowBefore);
                            }
                            if (shadowAfter.length === 0) {
                                shadowAfter = $('<div class="swiper-slide-shadow-' + (isH() ? 'right' : 'bottom') + '"></div>');
                                slide.append(shadowAfter);
                            }
                            var shadowOpacity = slide[0].progress;
                            if (shadowBefore.length) shadowBefore[0].style.opacity = -slide[0].progress;
                            if (shadowAfter.length) shadowAfter[0].style.opacity = slide[0].progress;
                        }
                    }
                    s.wrapper.css({
                        '-webkit-transform-origin': '50% 50% -' + (s.size / 2) + 'px',
                        '-moz-transform-origin': '50% 50% -' + (s.size / 2) + 'px',
                        '-ms-transform-origin': '50% 50% -' + (s.size / 2) + 'px',
                        'transform-origin': '50% 50% -' + (s.size / 2) + 'px'
                    });
                        
                    if (s.params.cube.shadow) {
                        if (isH()) {
                            cubeShadow.transform('translate3d(0px, ' + (s.width / 2 + s.params.cube.shadowOffset) + 'px, ' + (-s.width / 2) + 'px) rotateX(90deg) rotateZ(0deg) scale(' + (s.params.cube.shadowScale) + ')');
                        }
                        else {
                            var shadowAngle = Math.abs(wrapperRotate) - Math.floor(Math.abs(wrapperRotate) / 90) * 90;
                            var multiplier = 1.5 - (Math.sin(shadowAngle * 2 * Math.PI / 360) / 2 + Math.cos(shadowAngle * 2 * Math.PI / 360) / 2);
                            var scale1 = s.params.cube.shadowScale,
                                scale2 = s.params.cube.shadowScale / multiplier,
                                offset = s.params.cube.shadowOffset;
                            cubeShadow.transform('scale3d(' + scale1 + ', 1, ' + scale2 + ') translate3d(0px, ' + (s.height / 2 + offset) + 'px, ' + (-s.height / 2 / scale2) + 'px) rotateX(-90deg)');
                        }
                    }
                    var zFactor = (s.isSafari || s.isUiWebView) ? (-s.size / 2) : 0;
                    s.wrapper.transform('translate3d(0px,0,' + zFactor + 'px) rotateX(' + (isH() ? 0 : wrapperRotate) + 'deg) rotateY(' + (isH() ? -wrapperRotate : 0) + 'deg)');
                },
                setTransition: function (duration) {
                    s.slides.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);
                    if (s.params.cube.shadow && !isH()) {
                        s.container.find('.swiper-cube-shadow').transition(duration);
                    }
                }
            },
            coverflow: {
                setTranslate: function () {
                    var transform = s.translate;
                    var center = isH() ? -transform + s.width / 2 : -transform + s.height / 2;
                    var rotate = isH() ? s.params.coverflow.rotate: -s.params.coverflow.rotate;
                    var translate = s.params.coverflow.depth;
                    //Each slide offset from center
                    for (var i = 0, length = s.slides.length; i < length; i++) {
                        var slide = s.slides.eq(i);
                        var slideSize = s.slidesSizesGrid[i];
                        var slideOffset = slide[0].swiperSlideOffset;
                        var offsetMultiplier = (center - slideOffset - slideSize / 2) / slideSize * s.params.coverflow.modifier;
        
                        var rotateY = isH() ? rotate * offsetMultiplier : 0;
                        var rotateX = isH() ? 0 : rotate * offsetMultiplier;
                        // var rotateZ = 0
                        var translateZ = -translate * Math.abs(offsetMultiplier);
        
                        var translateY = isH() ? 0 : s.params.coverflow.stretch * (offsetMultiplier);
                        var translateX = isH() ? s.params.coverflow.stretch * (offsetMultiplier) : 0;
        
                        //Fix for ultra small values
                        if (Math.abs(translateX) < 0.001) translateX = 0;
                        if (Math.abs(translateY) < 0.001) translateY = 0;
                        if (Math.abs(translateZ) < 0.001) translateZ = 0;
                        if (Math.abs(rotateY) < 0.001) rotateY = 0;
                        if (Math.abs(rotateX) < 0.001) rotateX = 0;
        
                        var slideTransform = 'translate3d(' + translateX + 'px,' + translateY + 'px,' + translateZ + 'px)  rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
        
                        slide.transform(slideTransform);
                        slide[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
                        if (s.params.coverflow.slideShadows) {
                            //Set shadows
                            var shadowBefore = isH() ? slide.find('.swiper-slide-shadow-left') : slide.find('.swiper-slide-shadow-top');
                            var shadowAfter = isH() ? slide.find('.swiper-slide-shadow-right') : slide.find('.swiper-slide-shadow-bottom');
                            if (shadowBefore.length === 0) {
                                shadowBefore = $('<div class="swiper-slide-shadow-' + (isH() ? 'left' : 'top') + '"></div>');
                                slide.append(shadowBefore);
                            }
                            if (shadowAfter.length === 0) {
                                shadowAfter = $('<div class="swiper-slide-shadow-' + (isH() ? 'right' : 'bottom') + '"></div>');
                                slide.append(shadowAfter);
                            }
                            if (shadowBefore.length) shadowBefore[0].style.opacity = offsetMultiplier > 0 ? offsetMultiplier : 0;
                            if (shadowAfter.length) shadowAfter[0].style.opacity = (-offsetMultiplier) > 0 ? -offsetMultiplier : 0;
                        }
                    }
        
                    //Set correct perspective for IE10
                    if (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) {
                        var ws = s.wrapper.style;
                        ws.perspectiveOrigin = center + 'px 50%';
                    }
                },
                setTransition: function (duration) {
                    s.slides.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);
                }
            }
        };

        /*=========================
          Scrollbar
          ===========================*/
        s.scrollbar = {
            set: function () {
                if (!s.params.scrollbar) return;
                var sb = s.scrollbar;
                sb.track = $(s.params.scrollbar);
                sb.drag = sb.track.find('.swiper-scrollbar-drag');
                if (sb.drag.length === 0) {
                    sb.drag = $('<div class="swiper-scrollbar-drag"></div>');
                    sb.track.append(sb.drag);
                }
                sb.drag[0].style.width = '';
                sb.drag[0].style.height = '';
                sb.trackSize = isH() ? sb.track[0].offsetWidth : sb.track[0].offsetHeight;
                
                sb.divider = s.size / s.virtualWidth;
                sb.moveDivider = sb.divider * (sb.trackSize / s.size);
                sb.dragSize = sb.trackSize * sb.divider;
        
                if (isH()) {
                    sb.drag[0].style.width = sb.dragSize + 'px';
                }
                else {
                    sb.drag[0].style.height = sb.dragSize + 'px';
                }
        
                if (sb.divider >= 1) {
                    sb.track[0].style.display = 'none';
                }
                else {
                    sb.track[0].style.display = '';
                }
                if (s.params.scrollbarHide) {
                    sb.track[0].style.opacity = 0;
                }
            },
            setTranslate: function () {
                if (!s.params.scrollbar) return;
                var diff;
                var sb = s.scrollbar;
                var translate = s.translate || 0;
                var newPos;
                
                var newSize = sb.dragSize;
                newPos = (sb.trackSize - sb.dragSize) * s.progress;
                if (s.rtl && isH()) {
                    newPos = -newPos;
                    if (newPos > 0) {
                        newSize = sb.dragSize - newPos;
                        newPos = 0;
                    }
                    else if (-newPos + sb.dragSize > sb.trackSize) {
                        newSize = sb.trackSize + newPos;
                    }
                }
                else {
                    if (newPos < 0) {
                        newSize = sb.dragSize + newPos;
                        newPos = 0;
                    }
                    else if (newPos + sb.dragSize > sb.trackSize) {
                        newSize = sb.trackSize - newPos;
                    }
                }
                if (isH()) {
                    sb.drag.transform('translate3d(' + (newPos) + 'px, 0, 0)');
                    sb.drag[0].style.width = newSize + 'px';
                }
                else {
                    sb.drag.transform('translate3d(0px, ' + (newPos) + 'px, 0)');
                    sb.drag[0].style.height = newSize + 'px';
                }
                if (s.params.scrollbarHide) {
                    clearTimeout(sb.timeout);
                    sb.track[0].style.opacity = 1;
                    sb.timeout = setTimeout(function () {
                        sb.track[0].style.opacity = 0;
                        sb.track.transition(400);
                    }, 1000);
                }
            },
            setTransition: function (duration) {
                if (!s.params.scrollbar) return;
                s.scrollbar.drag.transition(duration);
            }
        };

        /*=========================
          Controller
          ===========================*/
        s.controller = {
            setTranslate: function (translate, byController) {
                var controlled = s.params.control;
                var multiplier, controlledTranslate;
                if (s.isArray(controlled)) {
                    for (var i = 0; i < controlled.length; i++) {
                        if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
                            translate = controlled[i].rtl && controlled[i].params.direction === 'horizontal' ? -s.translate : s.translate;
                            multiplier = (controlled[i].maxTranslate() - controlled[i].minTranslate()) / (s.maxTranslate() - s.minTranslate());
                            controlledTranslate = (translate - s.minTranslate()) * multiplier + controlled[i].minTranslate();
                            if (s.params.controlInverse) {
                                controlledTranslate = controlled[i].maxTranslate() - controlledTranslate;
                            }
                            controlled[i].updateProgress(controlledTranslate);
                            controlled[i].setWrapperTranslate(controlledTranslate, false, s);
                            controlled[i].updateActiveIndex();
                        }
                    }
                }
                else if (controlled instanceof Swiper && byController !== controlled) {
                    translate = controlled.rtl && controlled.params.direction === 'horizontal' ? -s.translate : s.translate;
                    multiplier = (controlled.maxTranslate() - controlled.minTranslate()) / (s.maxTranslate() - s.minTranslate());
                    controlledTranslate = (translate - s.minTranslate()) * multiplier + controlled.minTranslate();
                    if (s.params.controlInverse) {
                        controlledTranslate = controlled.maxTranslate() - controlledTranslate;
                    }
                    controlled.updateProgress(controlledTranslate);
                    controlled.setWrapperTranslate(controlledTranslate, false, s);
                    controlled.updateActiveIndex();
                }
            },
            setTransition: function (duration, byController) {
                var controlled = s.params.control;
                if (s.isArray(controlled)) {
                    for (var i = 0; i < controlled.length; i++) {
                        if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
                            controlled[i].setWrapperTransition(duration, s);
                        }
                    }
                }
                else if (controlled instanceof Swiper && byController !== controlled) {
                    controlled.setWrapperTransition(duration, s);
                }
            }
        };

        /*=========================
          Hash Navigation
          ===========================*/
        s.hashnav = {
            init: function () {
                if (!s.params.hashnav) return;
                s.hashnav.initialized = true;
                var hash = document.location.hash.replace('#', '');
                if (!hash) return;
                var speed = 0;
                for (var i = 0, length = s.slides.length; i < length; i++) {
                    var slide = s.slides.eq(i);
                    var slideHash = slide.attr('data-hash');
                    if (slideHash === hash && !slide.hasClass(s.params.slideDuplicateClass)) {
                        var index = slide.index();
                        s._slideTo(index, speed);
                    }
                }
            },
            setHash: function () {
                if (!s.hashnav.initialized || !s.params.hashnav) return;
                document.location.hash = s.slides.eq(s.activeIndex).attr('data-hash') || '';
            }
        };

        /*=========================
          Keyboard Control
          ===========================*/
        function handleKeyboard(e) {
            if (e.originalEvent) e = e.originalEvent; //jquery fix
            var kc = e.keyCode || e.charCode;
            if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
            if (document.activeElement && document.activeElement.nodeName && (document.activeElement.nodeName.toLowerCase() === 'input' || document.activeElement.nodeName.toLowerCase() === 'textarea')) {
                return false;
            }
            if (kc === 37 || kc === 39 || kc === 38 || kc === 40) {
                var inView = false;
                //Check that swiper should be inside of visible area of window
                if (s.container.parents('.swiper-slide').length > 0 && s.container.parents('.swiper-slide-active').length === 0) {
                    return;
                }
                var windowScroll = {
                    left: window.pageXOffset,
                    top: window.pageYOffset
                };
                var windowWidth = window.innerWidth;
                var windowHeight = window.innerHeight;
                var swiperOffset = s.container.offset();
                
                var swiperCoord = [
                    [swiperOffset.left, swiperOffset.top],
                    [swiperOffset.left + s.width, swiperOffset.top],
                    [swiperOffset.left, swiperOffset.top + s.height],
                    [swiperOffset.left + s.width, swiperOffset.top + s.height]
                ];
                for (var i = 0; i < swiperCoord.length; i++) {
                    var point = swiperCoord[i];
                    if (
                        point[0] >= windowScroll.left && point[0] <= windowScroll.left + windowWidth &&
                        point[1] >= windowScroll.top && point[1] <= windowScroll.top + windowHeight
                    ) {
                        inView = true;
                    }
        
                }
                if (!inView) return;
            }
            if (isH()) {
                if (kc === 37 || kc === 39) {
                    if (e.preventDefault) e.preventDefault();
                    else e.returnValue = false;
                }
                if (kc === 39) s.slideNext();
                if (kc === 37) s.slidePrev();
            }
            else {
                if (kc === 38 || kc === 40) {
                    if (e.preventDefault) e.preventDefault();
                    else e.returnValue = false;
                }
                if (kc === 40) s.slideNext();
                if (kc === 38) s.slidePrev();
            }
        }
        s.disableKeyboardControl = function () {
            $(document).off('keydown', handleKeyboard);
        };
        s.enableKeyboardControl = function () {
            $(document).on('keydown', handleKeyboard);
        };
        

        /*=========================
          Mousewheel Control
          ===========================*/
        s._wheelEvent = false;
        s._lastWheelScrollTime = (new Date()).getTime();
        if (s.params.mousewheelControl) {
            if (document.onmousewheel !== undefined) {
                s._wheelEvent = 'mousewheel';
            }
            if (!s._wheelEvent) {
                try {
                    new WheelEvent('wheel');
                    s._wheelEvent = 'wheel';
                } catch (e) {}
            }
            if (!s._wheelEvent) {
                s._wheelEvent = 'DOMMouseScroll';
            }
        }
        function handleMousewheel(e) {
            if (e.originalEvent) e = e.originalEvent; //jquery fix
            var we = s._wheelEvent;
            var delta = 0;
            //Opera & IE
            if (e.detail) delta = -e.detail;
            //WebKits
            else if (we === 'mousewheel') {
                if (s.params.mousewheelForceToAxis) {
                    if (isH()) {
                        if (Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDeltaY)) delta = e.wheelDeltaX;
                        else return;
                    }
                    else {
                        if (Math.abs(e.wheelDeltaY) > Math.abs(e.wheelDeltaX)) delta = e.wheelDeltaY;
                        else return;
                    }
                }
                else {
                    delta = e.wheelDelta;
                }
            }
            //Old FireFox
            else if (we === 'DOMMouseScroll') delta = -e.detail;
            //New FireFox
            else if (we === 'wheel') {
                if (s.params.mousewheelForceToAxis) {
                    if (isH()) {
                        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) delta = -e.deltaX;
                        else return;
                    }
                    else {
                        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) delta = -e.deltaY;
                        else return;
                    }
                }
                else {
                    delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? - e.deltaX : - e.deltaY;
                }
            }
        
            if (!s.params.freeMode) {
                if ((new Date()).getTime() - s._lastWheelScrollTime > 60) {
                    if (delta < 0) s.slideNext();
                    else s.slidePrev();
                }
                s._lastWheelScrollTime = (new Date()).getTime();
        
            }
            else {
                //Freemode or scrollContainer:
                var position = s.getWrapperTranslate() + delta;
        
                if (position > 0) position = 0;
                if (position < s.maxTranslate()) position = s.maxTranslate();
        
                s.setWrapperTransition(0);
                s.setWrapperTranslate(position);
                s.updateProgress();
                s.updateActiveIndex();
        
                // Return page scroll on edge positions
                if (position === 0 || position === s.maxTranslate()) return;
            }
            if (s.params.autoplay) s.stopAutoplay();
        
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
            return false;
        }
        s.disableMousewheelControl = function () {
            if (!s._wheelEvent) return false;
            s.container.off(s._wheelEvent, handleMousewheel);
            return true;
        };
        
        s.enableMousewheelControl = function () {
            if (!s._wheelEvent) return false;
            s.container.on(s._wheelEvent, handleMousewheel);
            return true;
        };

        /*=========================
          Parallax
          ===========================*/
        function setParallaxTransform(el, progress) {
            el = $(el);
            var p, pX, pY, tX, tY;
            
            p = el.attr('data-swiper-parallax');
            pX = el.attr('data-swiper-parallax-x');
            pY = el.attr('data-swiper-parallax-y');
            if (!pX && !pY && p) {
                if (isH()) {
                    pX = p;
                    pY = '0';
                }
                else {
                    pY = p;
                    pX = '0';
                }
            }
            else {
                if (pX) pX = pX;
                else pX = '0';
                if (pY) pY = pY;
                else pY = '0';
            }
            if ((pX).indexOf('%') >= 0) {
                pX = parseInt(pX, 10) * progress + '%';
            }
            else {
                pX = pX * progress + 'px' ;
            }
            if ((pY).indexOf('%') >= 0) {
                pY = parseInt(pY, 10) * progress + '%';
            }
            else {
                pY = pY * progress + 'px' ;
            }
            tX = pX;
            tY = pY;
        
            el.transform('translate3d(' + tX + ', ' + tY + ',0px)');
        }   
        s.parallax = {
            setTranslate: function () {
                s.container.children('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function(){
                    setParallaxTransform(this, s.progress);
                    
                });
                s.slides.each(function () {
                    var slide = $(this);
                    slide.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function () {
                        var progress = Math.min(Math.max(slide[0].progress, -1), 1);
                        setParallaxTransform(this, progress);
                    });
                });
            },
            setTransition: function (duration) {
                if (typeof duration === 'undefined') duration = s.params.speed;
                s.container.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function(){
                    var el = $(this);
                    var parallaxDuration = parseInt(el.attr('data-swiper-parallax-duration'), 10) || duration;
                    if (duration === 0) parallaxDuration = 0;
                    el.transition(parallaxDuration);
                });
            }
        };
            

        /*=========================
          Init/Destroy
          ===========================*/
        s.init = function () {
            if (s.params.loop) s.createLoop();
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updatePagination();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                if (!s.params.loop) s.updateProgress();
                s.effects[s.params.effect].setTranslate();
            }
            if (s.params.loop) {
                s.slideTo(s.params.initialSlide + s.loopedSlides, 0, s.params.runCallbacksOnInit);
            }
            else {
                s.slideTo(s.params.initialSlide, 0, s.params.runCallbacksOnInit);
                if (s.params.initialSlide === 0 && s.parallax && s.params.parallax) {
                    s.parallax.setTranslate();               
                }
            }
            s.attachEvents();
            if (s.params.observer && s.support.observer) {
                s.initObservers();
            }
            if (s.params.updateOnImagesReady) {
                s.preloadImages();
            }
            if (s.params.autoplay) {
                s.startAutoplay();
            }
            if (s.params.keyboardControl) {
                if (s.enableKeyboardControl) s.enableKeyboardControl();
            }
            if (s.params.mousewheelControl) {
                if (s.enableMousewheelControl) s.enableMousewheelControl();
            }
            if (s.params.hashnav) {
                if (s.hashnav) s.hashnav.init();
            }
            if (s.params.onInit) s.params.onInit(s);
        };
        
        // Destroy
        s.destroy = function (deleteInstance) {
            s.detachEvents();
            s.disconnectObservers();
            if (s.params.keyboardControl) {
                if (s.disableKeyboardControl) s.disableKeyboardControl();
            }
            if (s.params.mousewheelControl) {
                if (s.disableMousewheelControl) s.disableMousewheelControl();
            }
            if (s.params.onDestroy) s.params.onDestroy();
            if (deleteInstance !== false) s = null;
        };
        
        s.init();
        
        

        
        // Return swiper instance
        return s;
    };
    

    /*==================================================
        Prototype
    ====================================================*/
    Swiper.prototype = {
        isSafari: (function () {
            var ua = navigator.userAgent.toLowerCase();
            return (ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0);
        })(),
        isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent),
        isArray: function (arr) {
            return Object.prototype.toString.apply(arr) === '[object Array]';
        },
        /*==================================================
        Browser
        ====================================================*/
        browser: {
            ie: window.navigator.pointerEnabled || window.navigator.msPointerEnabled
        },
        /*==================================================
        Devices
        ====================================================*/
        device: (function () {
            var ua = navigator.userAgent;
            var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
            var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
            var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
            var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
            return {
                ios: ipad || iphone || ipad,
                android: android
            };
        })(),
        /*==================================================
        Feature Detection
        ====================================================*/
        support: {
            touch : (window.Modernizr && Modernizr.touch === true) || (function () {
                return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
            })(),
    
            transforms3d : (window.Modernizr && Modernizr.csstransforms3d === true) || (function () {
                var div = document.createElement('div').style;
                return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
            })(),
    
            flexbox: (function () {
                var div = document.createElement('div').style;
                var styles = ('WebkitBox msFlexbox MsFlexbox WebkitFlex MozBox flex').split(' ');
                for (var i = 0; i < styles.length; i++) {
                    if (styles[i] in div) return true;
                }
            })(),
    
            observer: (function () {
                return ('MutationObserver' in window || 'WebkitMutationObserver' in window);
            })()
        }
    };
    

    /*===========================
    Dom7 Library
    ===========================*/
    var Dom7 = (function () {
        var Dom7 = function (arr) {
            var _this = this, i = 0;
            // Create array-like object
            for (i = 0; i < arr.length; i++) {
                _this[i] = arr[i];
            }
            _this.length = arr.length;
            // Return collection with methods
            return this;
        };
        var $ = function (selector, context) {
            var arr = [], i = 0;
            if (selector && !context) {
                if (selector instanceof Dom7) {
                    return selector;
                }
            }
            if (selector) {
                // String
                if (typeof selector === 'string') {
                    var els, tempParent, html = selector.trim();
                    if (html.indexOf('<') >= 0 && html.indexOf('>') >= 0) {
                        var toCreate = 'div';
                        if (html.indexOf('<li') === 0) toCreate = 'ul';
                        if (html.indexOf('<tr') === 0) toCreate = 'tbody';
                        if (html.indexOf('<td') === 0 || html.indexOf('<th') === 0) toCreate = 'tr';
                        if (html.indexOf('<tbody') === 0) toCreate = 'table';
                        if (html.indexOf('<option') === 0) toCreate = 'select';
                        tempParent = document.createElement(toCreate);
                        tempParent.innerHTML = selector;
                        for (i = 0; i < tempParent.childNodes.length; i++) {
                            arr.push(tempParent.childNodes[i]);
                        }
                    }
                    else {
                        if (!context && selector[0] === '#' && !selector.match(/[ .<>:~]/)) {
                            // Pure ID selector
                            els = [document.getElementById(selector.split('#')[1])];
                        }
                        else {
                            // Other selectors
                            els = (context || document).querySelectorAll(selector);
                        }
                        for (i = 0; i < els.length; i++) {
                            if (els[i]) arr.push(els[i]);
                        }
                    }
                }
                // Node/element
                else if (selector.nodeType || selector === window || selector === document) {
                    arr.push(selector);
                }
                //Array of elements or instance of Dom
                else if (selector.length > 0 && selector[0].nodeType) {
                    for (i = 0; i < selector.length; i++) {
                        arr.push(selector[i]);
                    }
                }
            }
            return new Dom7(arr);
        };
        Dom7.prototype = {
            // Classes and attriutes
            addClass: function (className) {
                if (typeof className === 'undefined') {
                    return this;
                }
                var classes = className.split(' ');
                for (var i = 0; i < classes.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        this[j].classList.add(classes[i]);
                    }
                }
                return this;
            },
            removeClass: function (className) {
                var classes = className.split(' ');
                for (var i = 0; i < classes.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        this[j].classList.remove(classes[i]);
                    }
                }
                return this;
            },
            hasClass: function (className) {
                if (!this[0]) return false;
                else return this[0].classList.contains(className);
            },
            toggleClass: function (className) {
                var classes = className.split(' ');
                for (var i = 0; i < classes.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        this[j].classList.toggle(classes[i]);
                    }
                }
                return this;
            },
            attr: function (attrs, value) {
                if (arguments.length === 1 && typeof attrs === 'string') {
                    // Get attr
                    if (this[0]) return this[0].getAttribute(attrs);
                    else return undefined;
                }
                else {
                    // Set attrs
                    for (var i = 0; i < this.length; i++) {
                        if (arguments.length === 2) {
                            // String
                            this[i].setAttribute(attrs, value);
                        }
                        else {
                            // Object
                            for (var attrName in attrs) {
                                this[i][attrName] = attrs[attrName];
                                this[i].setAttribute(attrName, attrs[attrName]);
                            }
                        }
                    }
                    return this;
                }
            },
            removeAttr: function (attr) {
                for (var i = 0; i < this.length; i++) {
                    this[i].removeAttribute(attr);
                }
            },
            data: function (key, value) {
                if (typeof value === 'undefined') {
                    // Get value
                    if (this[0]) {
                        var dataKey = this[0].getAttribute('data-' + key);
                        if (dataKey) return dataKey;
                        else if (this[0].dom7ElementDataStorage && (key in this[0].dom7ElementDataStorage)) return this[0].dom7ElementDataStorage[key];
                        else return undefined;
                    }
                    else return undefined;
                }
                else {
                    // Set value
                    for (var i = 0; i < this.length; i++) {
                        var el = this[i];
                        if (!el.dom7ElementDataStorage) el.dom7ElementDataStorage = {};
                        el.dom7ElementDataStorage[key] = value;
                    }
                    return this;
                }
            },
            // Transforms
            transform : function (transform) {
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
                }
                return this;
            },
            transition: function (duration) {
                if (typeof duration !== 'string') {
                    duration = duration + 'ms';
                }
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
                }
                return this;
            },
            //Events
            on: function (eventName, targetSelector, listener, capture) {
                function handleLiveEvent(e) {
                    var target = e.target;
                    if ($(target).is(targetSelector)) listener.call(target, e);
                    else {
                        var parents = $(target).parents();
                        for (var k = 0; k < parents.length; k++) {
                            if ($(parents[k]).is(targetSelector)) listener.call(parents[k], e);
                        }
                    }
                }
                var events = eventName.split(' ');
                var i, j;
                for (i = 0; i < this.length; i++) {
                    if (typeof targetSelector === 'function' || targetSelector === false) {
                        // Usual events
                        if (typeof targetSelector === 'function') {
                            listener = arguments[1];
                            capture = arguments[2] || false;
                        }
                        for (j = 0; j < events.length; j++) {
                            this[i].addEventListener(events[j], listener, capture);
                        }
                    }
                    else {
                        //Live events
                        for (j = 0; j < events.length; j++) {
                            if (!this[i].dom7LiveListeners) this[i].dom7LiveListeners = [];
                            this[i].dom7LiveListeners.push({listener: listener, liveListener: handleLiveEvent});
                            this[i].addEventListener(events[j], handleLiveEvent, capture);
                        }
                    }
                }
    
                return this;
            },
            off: function (eventName, targetSelector, listener, capture) {
                var events = eventName.split(' ');
                for (var i = 0; i < events.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        if (typeof targetSelector === 'function' || targetSelector === false) {
                            // Usual events
                            if (typeof targetSelector === 'function') {
                                listener = arguments[1];
                                capture = arguments[2] || false;
                            }
                            this[j].removeEventListener(events[i], listener, capture);
                        }
                        else {
                            // Live event
                            if (this[j].dom7LiveListeners) {
                                for (var k = 0; k < this[j].dom7LiveListeners.length; k++) {
                                    if (this[j].dom7LiveListeners[k].listener === listener) {
                                        this[j].removeEventListener(events[i], this[j].dom7LiveListeners[k].liveListener, capture);
                                    }
                                }
                            }
                        }
                    }
                }
                return this;
            },
            once: function (eventName, targetSelector, listener, capture) {
                var dom = this;
                if (typeof targetSelector === 'function') {
                    targetSelector = false;
                    listener = arguments[1];
                    capture = arguments[2];
                }
                function proxy(e) {
                    listener(e);
                    dom.off(eventName, targetSelector, proxy, capture);
                }
                dom.on(eventName, targetSelector, proxy, capture);
            },
            trigger: function (eventName, eventData) {
                for (var i = 0; i < this.length; i++) {
                    var evt;
                    try {
                        evt = new CustomEvent(eventName, {detail: eventData, bubbles: true, cancelable: true});
                    }
                    catch (e) {
                        evt = document.createEvent('Event');
                        evt.initEvent(eventName, true, true);
                        evt.detail = eventData;
                    }
                    this[i].dispatchEvent(evt);
                }
                return this;
            },
            transitionEnd: function (callback) {
                var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
                    i, j, dom = this;
                function fireCallBack(e) {
                    /*jshint validthis:true */
                    if (e.target !== this) return;
                    callback.call(this, e);
                    for (i = 0; i < events.length; i++) {
                        dom.off(events[i], fireCallBack);
                    }
                }
                if (callback) {
                    for (i = 0; i < events.length; i++) {
                        dom.on(events[i], fireCallBack);
                    }
                }
                return this;
            },
            // Sizing/Styles
            width: function () {
                if (this[0] === window) {
                    return window.innerWidth;
                }
                else {
                    if (this.length > 0) {
                        return parseFloat(this.css('width'));
                    }
                    else {
                        return null;
                    }
                }
            },
            outerWidth: function (includeMargins) {
                if (this.length > 0) {
                    if (includeMargins)
                        return this[0].offsetWidth + parseFloat(this.css('margin-right')) + parseFloat(this.css('margin-left'));
                    else
                        return this[0].offsetWidth;
                }
                else return null;
            },
            height: function () {
                if (this[0] === window) {
                    return window.innerHeight;
                }
                else {
                    if (this.length > 0) {
                        return parseFloat(this.css('height'));
                    }
                    else {
                        return null;
                    }
                }
            },
            outerHeight: function (includeMargins) {
                if (this.length > 0) {
                    if (includeMargins)
                        return this[0].offsetHeight + parseFloat(this.css('margin-top')) + parseFloat(this.css('margin-bottom'));
                    else
                        return this[0].offsetHeight;
                }
                else return null;
            },
            offset: function () {
                if (this.length > 0) {
                    var el = this[0];
                    var box = el.getBoundingClientRect();
                    var body = document.body;
                    var clientTop  = el.clientTop  || body.clientTop  || 0;
                    var clientLeft = el.clientLeft || body.clientLeft || 0;
                    var scrollTop  = window.pageYOffset || el.scrollTop;
                    var scrollLeft = window.pageXOffset || el.scrollLeft;
                    return {
                        top: box.top  + scrollTop  - clientTop,
                        left: box.left + scrollLeft - clientLeft
                    };
                }
                else {
                    return null;
                }
            },
            css: function (props, value) {
                var i;
                if (arguments.length === 1) {
                    if (typeof props === 'string') {
                        if (this[0]) return window.getComputedStyle(this[0], null).getPropertyValue(props);
                    }
                    else {
                        for (i = 0; i < this.length; i++) {
                            for (var prop in props) {
                                this[i].style[prop] = props[prop];
                            }
                        }
                        return this;
                    }
                }
                if (arguments.length === 2 && typeof props === 'string') {
                    for (i = 0; i < this.length; i++) {
                        this[i].style[props] = value;
                    }
                    return this;
                }
                return this;
            },
            
            //Dom manipulation
            each: function (callback) {
                for (var i = 0; i < this.length; i++) {
                    callback.call(this[i], i, this[i]);
                }
                return this;
            },
            html: function (html) {
                if (typeof html === 'undefined') {
                    return this[0] ? this[0].innerHTML : undefined;
                }
                else {
                    for (var i = 0; i < this.length; i++) {
                        this[i].innerHTML = html;
                    }
                    return this;
                }
            },
            is: function (selector) {
                if (!this[0]) return false;
                var compareWith, i;
                if (typeof selector === 'string') {
                    var el = this[0];
                    if (el === document) return selector === document;
                    if (el === window) return selector === window;
    
                    if (el.matches) return el.matches(selector);
                    else if (el.webkitMatchesSelector) return el.webkitMatchesSelector(selector);
                    else if (el.mozMatchesSelector) return el.mozMatchesSelector(selector);
                    else if (el.msMatchesSelector) return el.msMatchesSelector(selector);
                    else {
                        compareWith = $(selector);
                        for (i = 0; i < compareWith.length; i++) {
                            if (compareWith[i] === this[0]) return true;
                        }
                        return false;
                    }
                }
                else if (selector === document) return this[0] === document;
                else if (selector === window) return this[0] === window;
                else {
                    if (selector.nodeType || selector instanceof Dom7) {
                        compareWith = selector.nodeType ? [selector] : selector;
                        for (i = 0; i < compareWith.length; i++) {
                            if (compareWith[i] === this[0]) return true;
                        }
                        return false;
                    }
                    return false;
                }
                
            },
            index: function () {
                if (this[0]) {
                    var child = this[0];
                    var i = 0;
                    while ((child = child.previousSibling) !== null) {
                        if (child.nodeType === 1) i++;
                    }
                    return i;
                }
                else return undefined;
            },
            eq: function (index) {
                if (typeof index === 'undefined') return this;
                var length = this.length;
                var returnIndex;
                if (index > length - 1) {
                    return new Dom7([]);
                }
                if (index < 0) {
                    returnIndex = length + index;
                    if (returnIndex < 0) return new Dom7([]);
                    else return new Dom7([this[returnIndex]]);
                }
                return new Dom7([this[index]]);
            },
            append: function (newChild) {
                var i, j;
                for (i = 0; i < this.length; i++) {
                    if (typeof newChild === 'string') {
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newChild;
                        while (tempDiv.firstChild) {
                            this[i].appendChild(tempDiv.firstChild);
                        }
                    }
                    else if (newChild instanceof Dom7) {
                        for (j = 0; j < newChild.length; j++) {
                            this[i].appendChild(newChild[j]);
                        }
                    }
                    else {
                        this[i].appendChild(newChild);
                    }
                }
                return this;
            },
            prepend: function (newChild) {
                var i, j;
                for (i = 0; i < this.length; i++) {
                    if (typeof newChild === 'string') {
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newChild;
                        for (j = tempDiv.childNodes.length - 1; j >= 0; j--) {
                            this[i].insertBefore(tempDiv.childNodes[j], this[i].childNodes[0]);
                        }
                        // this[i].insertAdjacentHTML('afterbegin', newChild);
                    }
                    else if (newChild instanceof Dom7) {
                        for (j = 0; j < newChild.length; j++) {
                            this[i].insertBefore(newChild[j], this[i].childNodes[0]);
                        }
                    }
                    else {
                        this[i].insertBefore(newChild, this[i].childNodes[0]);
                    }
                }
                return this;
            },
            insertBefore: function (selector) {
                var before = $(selector);
                for (var i = 0; i < this.length; i++) {
                    if (before.length === 1) {
                        before[0].parentNode.insertBefore(this[i], before[0]);
                    }
                    else if (before.length > 1) {
                        for (var j = 0; j < before.length; j++) {
                            before[j].parentNode.insertBefore(this[i].cloneNode(true), before[j]);
                        }
                    }
                }
            },
            insertAfter: function (selector) {
                var after = $(selector);
                for (var i = 0; i < this.length; i++) {
                    if (after.length === 1) {
                        after[0].parentNode.insertBefore(this[i], after[0].nextSibling);
                    }
                    else if (after.length > 1) {
                        for (var j = 0; j < after.length; j++) {
                            after[j].parentNode.insertBefore(this[i].cloneNode(true), after[j].nextSibling);
                        }
                    }
                }
            },
            next: function (selector) {
                if (this.length > 0) {
                    if (selector) {
                        if (this[0].nextElementSibling && $(this[0].nextElementSibling).is(selector)) return new Dom7([this[0].nextElementSibling]);
                        else return new Dom7([]);
                    }
                    else {
                        if (this[0].nextElementSibling) return new Dom7([this[0].nextElementSibling]);
                        else return new Dom7([]);
                    }
                }
                else return new Dom7([]);
            },
            nextAll: function (selector) {
                var nextEls = [];
                var el = this[0];
                if (!el) return new Dom7([]);
                while (el.nextElementSibling) {
                    var next = el.nextElementSibling;
                    if (selector) {
                        if($(next).is(selector)) nextEls.push(next);
                    }
                    else nextEls.push(next);
                    el = next;
                }
                return new Dom7(nextEls);
            },
            prev: function (selector) {
                if (this.length > 0) {
                    if (selector) {
                        if (this[0].previousElementSibling && $(this[0].previousElementSibling).is(selector)) return new Dom7([this[0].previousElementSibling]);
                        else return new Dom7([]);
                    }
                    else {
                        if (this[0].previousElementSibling) return new Dom7([this[0].previousElementSibling]);
                        else return new Dom7([]);
                    }
                }
                else return new Dom7([]);
            },
            prevAll: function (selector) {
                var prevEls = [];
                var el = this[0];
                if (!el) return new Dom7([]);
                while (el.previousElementSibling) {
                    var prev = el.previousElementSibling;
                    if (selector) {
                        if($(prev).is(selector)) prevEls.push(prev);
                    }
                    else prevEls.push(prev);
                    el = prev;
                }
                return new Dom7(prevEls);
            },
            parent: function (selector) {
                var parents = [];
                for (var i = 0; i < this.length; i++) {
                    if (selector) {
                        if ($(this[i].parentNode).is(selector)) parents.push(this[i].parentNode);
                    }
                    else {
                        parents.push(this[i].parentNode);
                    }
                }
                return $($.unique(parents));
            },
            parents: function (selector) {
                var parents = [];
                for (var i = 0; i < this.length; i++) {
                    var parent = this[i].parentNode;
                    while (parent) {
                        if (selector) {
                            if ($(parent).is(selector)) parents.push(parent);
                        }
                        else {
                            parents.push(parent);
                        }
                        parent = parent.parentNode;
                    }
                }
                return $($.unique(parents));
            },
            find : function (selector) {
                var foundElements = [];
                for (var i = 0; i < this.length; i++) {
                    var found = this[i].querySelectorAll(selector);
                    for (var j = 0; j < found.length; j++) {
                        foundElements.push(found[j]);
                    }
                }
                return new Dom7(foundElements);
            },
            children: function (selector) {
                var children = [];
                for (var i = 0; i < this.length; i++) {
                    var childNodes = this[i].childNodes;
    
                    for (var j = 0; j < childNodes.length; j++) {
                        if (!selector) {
                            if (childNodes[j].nodeType === 1) children.push(childNodes[j]);
                        }
                        else {
                            if (childNodes[j].nodeType === 1 && $(childNodes[j]).is(selector)) children.push(childNodes[j]);
                        }
                    }
                }
                return new Dom7($.unique(children));
            },
            remove: function () {
                for (var i = 0; i < this.length; i++) {
                    if (this[i].parentNode) this[i].parentNode.removeChild(this[i]);
                }
                return this;
            },
            add: function () {
                var dom = this;
                var i, j;
                for (i = 0; i < arguments.length; i++) {
                    var toAdd = $(arguments[i]);
                    for (j = 0; j < toAdd.length; j++) {
                        dom[dom.length] = toAdd[j];
                        dom.length++;
                    }
                }
                return dom;
            }
        };
        $.fn = Dom7.prototype;
        $.unique = function (arr) {
            var unique = [];
            for (var i = 0; i < arr.length; i++) {
                if (unique.indexOf(arr[i]) === -1) unique.push(arr[i]);
            }
            return unique;
        };
    
        return $;
    })();
    

    /*===========================
    Add .swiper plugin from Dom libraries
    ===========================*/
    var swiperDomPlugins = ['jQuery', 'Zepto', 'Dom7'];
    function addLibraryPlugin(lib) {
        lib.fn.swiper = function (params) {
            var firstInstance;
            lib(this).each(function () {
                var s = new Swiper(this, params);
                if (!firstInstance) firstInstance = s;
            });
            return firstInstance;
        };
    }
    for (var i = 0; i < swiperDomPlugins.length; i++) {
        if (window[swiperDomPlugins[i]]) {
            addLibraryPlugin(window[swiperDomPlugins[i]]);
        }
    }
    // Required DOM Plugins
    var domLib;
    if (typeof Dom7 === 'undefined') {
        domLib = window.Dom7 || window.Zepto || window.jQuery;
    }
    else {
        domLib = Dom7;
    }
    if (domLib) {
        if (!('transitionEnd' in domLib.fn)) {
            domLib.fn.transitionEnd = function (callback) {
                var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
                    i, j, dom = this;
                function fireCallBack(e) {
                    /*jshint validthis:true */
                    if (e.target !== this) return;
                    callback.call(this, e);
                    for (i = 0; i < events.length; i++) {
                        dom.off(events[i], fireCallBack);
                    }
                }
                if (callback) {
                    for (i = 0; i < events.length; i++) {
                        dom.on(events[i], fireCallBack);
                    }
                }
                return this;
            };
        }
        if (!('transform' in domLib.fn)) {
            domLib.fn.transform = function (transform) {
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
                }
                return this;
            };
        }
        if (!('transition' in domLib.fn)) {
            domLib.fn.transition = function (duration) {
                if (typeof duration !== 'string') {
                    duration = duration + 'ms';
                }
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
                }
                return this;
            };
        }
    }
        
    

})();
/*===========================
Swiper AMD Export
===========================*/
if (typeof(module) !== 'undefined')
{
    module.exports = Swiper;
}
else if (typeof define === 'function' && define.amd) {
    define([], function () {
        'use strict';
        return Swiper;
    });
}
/**
 * Swiper 3.0.3
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * 
 * http://www.idangero.us/swiper/
 * 
 * Copyright 2015, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us/
 * 
 * Licensed under MIT
 * 
 * Released on: March 1, 2015
 */
!function(){"use strict";function e(e){e.fn.swiper=function(t){var a;return e(this).each(function(){var e=new Swiper(this,t);a||(a=e)}),a}}window.Swiper=function(e,a){function r(){return"horizontal"===f.params.direction}function s(e){var t,a,r=function(){"undefined"!=typeof f&&null!==f&&(void 0!==f.imagesLoaded&&f.imagesLoaded++,f.imagesLoaded===f.imagesToLoad.length&&(f.update(),f.params.onImagesReady&&f.params.onImagesReady(f)))};e.complete?r():(a=e.currentSrc||e.getAttribute("src"),a?(t=new Image,t.onload=r,t.onerror=r,t.src=a):r())}function i(){f.autoplayTimeoutId=setTimeout(function(){f.params.loop?(f.fixLoop(),f._slideNext()):f.isEnd?a.autoplayStopOnLast?f.stopAutoplay():f._slideTo(0):f._slideNext()},f.params.autoplay)}function n(e,t){var a=m(e.target);if(!a.is(t))if("string"==typeof t)a=a.parents(t);else if(t.nodeType){var r;return a.parents().each(function(e,a){a===t&&(r=t)}),r?t:void 0}return 0===a.length?void 0:a[0]}function o(e,t){t=t||{};var a=window.MutationObserver||window.WebkitMutationObserver,r=new a(function(e){e.forEach(function(){f.onResize()})});r.observe(e,{attributes:"undefined"==typeof t.attributes?!0:t.attributes,childList:"undefined"==typeof t.childList?!0:t.childList,characterData:"undefined"==typeof t.characterData?!0:t.characterData}),f.observers.push(r)}function l(e){e.originalEvent&&(e=e.originalEvent);var t=e.keyCode||e.charCode;if(!(e.shiftKey||e.altKey||e.ctrlKey||e.metaKey)){if(document.activeElement&&document.activeElement.nodeName&&("input"===document.activeElement.nodeName.toLowerCase()||"textarea"===document.activeElement.nodeName.toLowerCase()))return!1;if(37===t||39===t||38===t||40===t){var a=!1;if(f.container.parents(".swiper-slide").length>0&&0===f.container.parents(".swiper-slide-active").length)return;for(var s={left:window.pageXOffset,top:window.pageYOffset},i=window.innerWidth,n=window.innerHeight,o=f.container.offset(),l=[[o.left,o.top],[o.left+f.width,o.top],[o.left,o.top+f.height],[o.left+f.width,o.top+f.height]],d=0;d<l.length;d++){var p=l[d];p[0]>=s.left&&p[0]<=s.left+i&&p[1]>=s.top&&p[1]<=s.top+n&&(a=!0)}if(!a)return}r()?((37===t||39===t)&&(e.preventDefault?e.preventDefault():e.returnValue=!1),39===t&&f.slideNext(),37===t&&f.slidePrev()):((38===t||40===t)&&(e.preventDefault?e.preventDefault():e.returnValue=!1),40===t&&f.slideNext(),38===t&&f.slidePrev())}}function d(e){e.originalEvent&&(e=e.originalEvent);var t=f._wheelEvent,a=0;if(e.detail)a=-e.detail;else if("mousewheel"===t)if(f.params.mousewheelForceToAxis)if(r()){if(!(Math.abs(e.wheelDeltaX)>Math.abs(e.wheelDeltaY)))return;a=e.wheelDeltaX}else{if(!(Math.abs(e.wheelDeltaY)>Math.abs(e.wheelDeltaX)))return;a=e.wheelDeltaY}else a=e.wheelDelta;else if("DOMMouseScroll"===t)a=-e.detail;else if("wheel"===t)if(f.params.mousewheelForceToAxis)if(r()){if(!(Math.abs(e.deltaX)>Math.abs(e.deltaY)))return;a=-e.deltaX}else{if(!(Math.abs(e.deltaY)>Math.abs(e.deltaX)))return;a=-e.deltaY}else a=Math.abs(e.deltaX)>Math.abs(e.deltaY)?-e.deltaX:-e.deltaY;if(f.params.freeMode){var s=f.getWrapperTranslate()+a;if(s>0&&(s=0),s<f.maxTranslate()&&(s=f.maxTranslate()),f.setWrapperTransition(0),f.setWrapperTranslate(s),f.updateProgress(),f.updateActiveIndex(),0===s||s===f.maxTranslate())return}else(new Date).getTime()-f._lastWheelScrollTime>60&&(0>a?f.slideNext():f.slidePrev()),f._lastWheelScrollTime=(new Date).getTime();return f.params.autoplay&&f.stopAutoplay(),e.preventDefault?e.preventDefault():e.returnValue=!1,!1}function p(e,t){e=m(e);var a,s,i,n,o;a=e.attr("data-swiper-parallax"),s=e.attr("data-swiper-parallax-x"),i=e.attr("data-swiper-parallax-y"),s||i||!a?(s=s?s:"0",i=i?i:"0"):r()?(s=a,i="0"):(i=a,s="0"),s=s.indexOf("%")>=0?parseInt(s,10)*t+"%":s*t+"px",i=i.indexOf("%")>=0?parseInt(i,10)*t+"%":i*t+"px",n=s,o=i,e.transform("translate3d("+n+", "+o+",0px)")}var u={direction:"horizontal",touchEventsTarget:"container",initialSlide:0,speed:300,autoplay:!1,autoplayDisableOnInteraction:!0,freeMode:!1,freeModeMomentum:!0,freeModeMomentumRatio:1,freeModeMomentumBounce:!0,freeModeMomentumBounceRatio:1,effect:"slide",coverflow:{rotate:50,stretch:0,depth:100,modifier:1,slideShadows:!0},cube:{slideShadows:!0,shadow:!0,shadowOffset:20,shadowScale:.94},fade:{crossFade:!1},parallax:!1,scrollbar:null,scrollbarHide:!0,keyboardControl:!1,mousewheelControl:!1,mousewheelForceToAxis:!1,hashnav:!1,spaceBetween:0,slidesPerView:1,slidesPerColumn:1,slidesPerColumnFill:"column",slidesPerGroup:1,centeredSlides:!1,touchRatio:1,touchAngle:45,simulateTouch:!0,shortSwipes:!0,longSwipes:!0,longSwipesRatio:.5,longSwipesMs:300,followFinger:!0,onlyExternal:!1,threshold:0,touchMoveStopPropagation:!0,pagination:null,paginationClickable:!1,paginationHide:!1,resistance:!0,resistanceRatio:.85,nextButton:null,prevButton:null,watchSlidesProgress:!1,watchVisibility:!1,grabCursor:!1,preventClicks:!0,preventClicksPropagation:!0,releaseFormElements:!0,slideToClickedSlide:!1,updateOnImagesReady:!0,loop:!1,loopAdditionalSlides:0,loopedSlides:null,control:void 0,controlInverse:!1,allowSwipeToPrev:!0,allowSwipeToNext:!0,swipeHandler:null,noSwiping:!0,noSwipingClass:"swiper-no-swiping",slideClass:"swiper-slide",slideActiveClass:"swiper-slide-active",slideVisibleClass:"swiper-slide-visible",slideDuplicateClass:"swiper-slide-duplicate",slideNextClass:"swiper-slide-next",slidePrevClass:"swiper-slide-prev",wrapperClass:"swiper-wrapper",bulletClass:"swiper-pagination-bullet",bulletActiveClass:"swiper-pagination-bullet-active",buttonDisabledClass:"swiper-button-disabled",paginationHiddenClass:"swiper-pagination-hidden",observer:!1,observeParents:!1,runCallbacksOnInit:!0};a=a||{};for(var c in u)if("undefined"==typeof a[c])a[c]=u[c];else if("object"==typeof a[c])for(var h in u[c])"undefined"==typeof a[c][h]&&(a[c][h]=u[c][h]);var f=this;f.params=a;var m;if(m="undefined"==typeof t?window.Dom7||window.Zepto||window.jQuery:t,m&&(f.container=m(e),0!==f.container.length)){if(f.container.length>1)return void f.container.each(function(){new Swiper(this,a)});f.container[0].swiper=f,f.container.data("swiper",f),f.container.addClass("swiper-container-"+f.params.direction),f.params.freeMode&&f.container.addClass("swiper-container-free-mode"),(f.params.parallax||f.params.watchVisibility)&&(f.params.watchSlidesProgress=!0),["cube","coverflow"].indexOf(f.params.effect)>=0&&(f.support.transforms3d?(f.params.watchSlidesProgress=!0,f.container.addClass("swiper-container-3d")):f.params.effect="slide"),"slide"!==f.params.effect&&f.container.addClass("swiper-container-"+f.params.effect),"cube"===f.params.effect&&(f.params.resistanceRatio=0,f.params.slidesPerView=1,f.params.slidesPerColumn=1,f.params.slidesPerGroup=1,f.params.centeredSlides=!1,f.params.spaceBetween=0),"fade"===f.params.effect&&(f.params.watchSlidesProgress=!0,f.params.spaceBetween=0),f.params.grabCursor&&f.support.touch&&(f.params.grabCursor=!1),f.wrapper=f.container.children("."+f.params.wrapperClass),f.params.pagination&&(f.paginationContainer=m(f.params.pagination),f.params.paginationClickable&&f.paginationContainer.addClass("swiper-pagination-clickable")),f.rtl=r()&&("rtl"===f.container[0].dir.toLowerCase()||"rtl"===f.container.css("direction")),f.rtl&&f.container.addClass("swiper-container-rtl"),f.rtl&&(f.wrongRTL="-webkit-box"===f.wrapper.css("display")),f.translate=0,f.progress=0,f.velocity=0,f.lockSwipeToNext=function(){f.params.allowSwipeToNext=!1},f.lockSwipeToPrev=function(){f.params.allowSwipeToPrev=!1},f.lockSwipes=function(){f.params.allowSwipeToNext=f.params.allowSwipeToPrev=!1},f.unlockSwipeToNext=function(){f.params.allowSwipeToNext=!0},f.unlockSwipeToPrev=function(){f.params.allowSwipeToPrev=!0},f.unlockSwipes=function(){f.params.allowSwipeToNext=f.params.allowSwipeToPrev=!0},f.params.slidesPerColumn>1&&f.container.addClass("swiper-container-multirow"),f.params.grabCursor&&(f.container[0].style.cursor="move",f.container[0].style.cursor="-webkit-grab",f.container[0].style.cursor="-moz-grab",f.container[0].style.cursor="grab"),f.imagesToLoad=[],f.imagesLoaded=0,f.preloadImages=function(){f.imagesToLoad=f.container.find("img");for(var e=0;e<f.imagesToLoad.length;e++)s(f.imagesToLoad[e])},f.autoplayTimeoutId=void 0,f.autoplaying=!1,f.autoplayPaused=!1,f.startAutoplay=function(){return"undefined"!=typeof f.autoplayTimeoutId?!1:f.params.autoplay?f.autoplaying?!1:(f.autoplaying=!0,f.params.onAutoplayStart&&f.params.onAutoplayStart(f),void i()):!1},f.stopAutoplay=function(){f.autoplayTimeoutId&&(f.autoplayTimeoutId&&clearTimeout(f.autoplayTimeoutId),f.autoplaying=!1,f.autoplayTimeoutId=void 0,f.params.onAutoplayStop&&f.params.onAutoplayStop(f))},f.pauseAutoplay=function(e){f.autoplayPaused||(f.autoplayTimeoutId&&clearTimeout(f.autoplayTimeoutId),f.autoplayPaused=!0,0===e?(f.autoplayPaused=!1,i()):f.wrapper.transitionEnd(function(){f.autoplayPaused=!1,f.autoplaying?i():f.stopAutoplay()}))},f.minTranslate=function(){return-f.snapGrid[0]},f.maxTranslate=function(){return-f.snapGrid[f.snapGrid.length-1]},f.updateContainerSize=function(){f.width=f.container[0].clientWidth,f.height=f.container[0].clientHeight,f.size=r()?f.width:f.height},f.updateSlidesSize=function(){f.slides=f.wrapper.children("."+f.params.slideClass),f.snapGrid=[],f.slidesGrid=[],f.slidesSizesGrid=[];var e,t=f.params.spaceBetween,a=0,s=0,i=0;"string"==typeof t&&t.indexOf("%")>=0&&(t=parseFloat(t.replace("%",""))/100*f.size),f.virtualWidth=-t,f.slides.css(f.rtl?{marginLeft:"",marginTop:""}:{marginRight:"",marginBottom:""});var n;f.params.slidesPerColumn>1&&(n=Math.floor(f.slides.length/f.params.slidesPerColumn)===f.slides.length/f.params.slidesPerColumn?f.slides.length:Math.ceil(f.slides.length/f.params.slidesPerColumn)*f.params.slidesPerColumn);var o;for(e=0;e<f.slides.length;e++){o=0;var l=f.slides.eq(e);if(f.params.slidesPerColumn>1){var d,p,u,c,h=f.params.slidesPerColumn;"column"===f.params.slidesPerColumnFill?(p=Math.floor(e/h),u=e-p*h,d=p+u*n/h,l.css({"-webkit-box-ordinal-group":d,"-moz-box-ordinal-group":d,"-ms-flex-order":d,"-webkit-order":d,order:d})):(c=n/h,u=Math.floor(e/c),p=e-u*c),l.css({"margin-top":0!==u&&f.params.spaceBetween&&f.params.spaceBetween+"px"}).attr("data-swiper-column",p).attr("data-swiper-row",u)}"none"!==l.css("display")&&("auto"===f.params.slidesPerView?o=r()?l.outerWidth(!0):l.outerHeight(!0):(o=(f.size-(f.params.slidesPerView-1)*t)/f.params.slidesPerView,r()?f.slides[e].style.width=o+"px":f.slides[e].style.height=o+"px"),f.slides[e].swiperSlideSize=o,f.slidesSizesGrid.push(o),f.params.centeredSlides?(a=a+o/2+s/2+t,0===e&&(a=a-f.size/2-t),Math.abs(a)<.001&&(a=0),i%f.params.slidesPerGroup===0&&f.snapGrid.push(a),f.slidesGrid.push(a)):(i%f.params.slidesPerGroup===0&&f.snapGrid.push(a),f.slidesGrid.push(a),a=a+o+t),f.virtualWidth+=o+t,s=o,i++)}f.virtualWidth=Math.max(f.virtualWidth,f.size);var m;if(f.rtl&&f.wrongRTL&&("slide"===f.params.effect||"coverflow"===f.params.effect)&&f.wrapper.css({width:f.virtualWidth+f.params.spaceBetween+"px"}),f.params.slidesPerColumn>1&&(f.virtualWidth=(o+f.params.spaceBetween)*n,f.virtualWidth=Math.ceil(f.virtualWidth/f.params.slidesPerColumn)-f.params.spaceBetween,f.wrapper.css({width:f.virtualWidth+f.params.spaceBetween+"px"}),f.params.centeredSlides)){for(m=[],e=0;e<f.snapGrid.length;e++)f.snapGrid[e]<f.virtualWidth+f.snapGrid[0]&&m.push(f.snapGrid[e]);f.snapGrid=m}if(!f.params.centeredSlides){for(m=[],e=0;e<f.snapGrid.length;e++)f.snapGrid[e]<=f.virtualWidth-f.size&&m.push(f.snapGrid[e]);f.snapGrid=m,Math.floor(f.virtualWidth-f.size)>Math.floor(f.snapGrid[f.snapGrid.length-1])&&f.snapGrid.push(f.virtualWidth-f.size)}0===f.snapGrid.length&&(f.snapGrid=[0]),0!==f.params.spaceBetween&&f.slides.css(r()?f.rtl?{marginLeft:t+"px"}:{marginRight:t+"px"}:{marginBottom:t+"px"}),f.params.watchSlidesProgress&&f.updateSlidesOffset()},f.updateSlidesOffset=function(){for(var e=0;e<f.slides.length;e++)f.slides[e].swiperSlideOffset=r()?f.slides[e].offsetLeft:f.slides[e].offsetTop},f.updateSlidesProgress=function(e){if("undefined"==typeof e&&(e=f.translate||0),0!==f.slides.length){"undefined"==typeof f.slides[0].swiperSlideOffset&&f.updateSlidesOffset();var t=f.params.centeredSlides?-e+f.size/2:-e;f.rtl&&(t=f.params.centeredSlides?e-f.size/2:e);{f.container[0].getBoundingClientRect(),r()?"left":"top",r()?"right":"bottom"}f.slides.removeClass(f.params.slideVisibleClass);for(var a=0;a<f.slides.length;a++){var s=f.slides[a],i=f.params.centeredSlides===!0?s.swiperSlideSize/2:0,n=(t-s.swiperSlideOffset-i)/(s.swiperSlideSize+f.params.spaceBetween);if(f.params.watchVisibility){var o=-(t-s.swiperSlideOffset-i),l=o+f.slidesSizesGrid[a],d=o>=0&&o<f.size||l>0&&l<=f.size||0>=o&&l>=f.size;d&&f.slides.eq(a).addClass(f.params.slideVisibleClass)}s.progress=f.rtl?-n:n}}},f.updateProgress=function(e){"undefined"==typeof e&&(e=f.translate||0);var t=f.maxTranslate()-f.minTranslate();0===t?(f.progress=0,f.isBeginning=f.isEnd=!0):(f.progress=(e-f.minTranslate())/t,f.isBeginning=f.progress<=0,f.isEnd=f.progress>=1),f.isBeginning&&f.params.onReachBeginning&&f.params.onReachBeginning(f),f.isEnd&&f.params.onReachEnd&&f.params.onReachEnd(f),f.params.watchSlidesProgress&&f.updateSlidesProgress(e),f.params.onProgress&&f.params.onProgress(f,f.progress)},f.updateActiveIndex=function(){var e,t,a,r=f.rtl?f.translate:-f.translate;for(t=0;t<f.slidesGrid.length;t++)"undefined"!=typeof f.slidesGrid[t+1]?r>=f.slidesGrid[t]&&r<f.slidesGrid[t+1]-(f.slidesGrid[t+1]-f.slidesGrid[t])/2?e=t:r>=f.slidesGrid[t]&&r<f.slidesGrid[t+1]&&(e=t+1):r>=f.slidesGrid[t]&&(e=t);(0>e||"undefined"==typeof e)&&(e=0),a=Math.floor(e/f.params.slidesPerGroup),a>=f.snapGrid.length&&(a=f.snapGrid.length-1),e!==f.activeIndex&&(f.snapIndex=a,f.previousIndex=f.activeIndex,f.activeIndex=e,f.updateClasses())},f.updateClasses=function(){f.slides.removeClass(f.params.slideActiveClass+" "+f.params.slideNextClass+" "+f.params.slidePrevClass);var e=f.slides.eq(f.activeIndex);if(e.addClass(f.params.slideActiveClass),e.next("."+f.params.slideClass).addClass(f.params.slideNextClass),e.prev("."+f.params.slideClass).addClass(f.params.slidePrevClass),f.bullets&&f.bullets.length>0){f.bullets.removeClass(f.params.bulletActiveClass);var t;f.params.loop?(t=f.activeIndex-f.loopedSlides,t>f.slides.length-1-2*f.loopedSlides&&(t-=f.slides.length-2*f.loopedSlides)):t="undefined"!=typeof f.snapIndex?f.snapIndex:f.activeIndex||0,f.bullets.eq(t).addClass(f.params.bulletActiveClass)}f.params.loop||(f.params.prevButton&&(f.isBeginning?m(f.params.prevButton).addClass(f.params.buttonDisabledClass):m(f.params.prevButton).removeClass(f.params.buttonDisabledClass)),f.params.nextButton&&(f.isEnd?m(f.params.nextButton).addClass(f.params.buttonDisabledClass):m(f.params.nextButton).removeClass(f.params.buttonDisabledClass)))},f.updatePagination=function(){if(f.params.pagination&&f.paginationContainer&&f.paginationContainer.length>0){for(var e="",t=f.params.loop?f.slides.length-2*f.loopedSlides:f.snapGrid.length,a=0;t>a;a++)e+='<span class="'+f.params.bulletClass+'"></span>';f.paginationContainer.html(e),f.bullets=f.paginationContainer.find("."+f.params.bulletClass)}},f.update=function(e){function t(){r=Math.min(Math.max(f.translate,f.maxTranslate()),f.minTranslate()),f.setWrapperTranslate(r),f.updateActiveIndex(),f.updateClasses()}if(f.updateContainerSize(),f.updateSlidesSize(),f.updateProgress(),f.updatePagination(),f.updateClasses(),f.params.scrollbar&&f.scrollbar&&f.scrollbar.set(),e){var a,r;f.params.freeMode?t():(a="auto"===f.params.slidesPerView&&f.isEnd&&!f.params.centeredSlides?f.slideTo(f.slides.length-1,0,!1,!0):f.slideTo(f.activeIndex,0,!1,!0),a||t())}},f.onResize=function(){if(f.updateContainerSize(),f.updateSlidesSize(),f.updateProgress(),("auto"===f.params.slidesPerView||f.params.freeMode)&&f.updatePagination(),f.params.scrollbar&&f.scrollbar&&f.scrollbar.set(),f.params.freeMode){var e=Math.min(Math.max(f.translate,f.maxTranslate()),f.minTranslate());f.setWrapperTranslate(e),f.updateActiveIndex(),f.updateClasses()}else f.updateClasses(),"auto"===f.params.slidesPerView&&f.isEnd&&!f.params.centeredSlides?f.slideTo(f.slides.length-1,0,!1,!0):f.slideTo(f.activeIndex,0,!1,!0)};var v=["mousedown","mousemove","mouseup"];window.navigator.pointerEnabled?v=["pointerdown","pointermove","pointerup"]:window.navigator.msPointerEnabled&&(v=["MSPointerDown","MSPointerMove","MSPointerUp"]),f.touchEvents={start:f.support.touch||!f.params.simulateTouch?"touchstart":v[0],move:f.support.touch||!f.params.simulateTouch?"touchmove":v[1],end:f.support.touch||!f.params.simulateTouch?"touchend":v[2]},(window.navigator.pointerEnabled||window.navigator.msPointerEnabled)&&("container"===f.params.touchEventsTarget?f.container:f.wrapper).addClass("swiper-wp8-"+f.params.direction),f.events=function(e){var t=e?"off":"on",r=e?"removeEventListener":"addEventListener",s="container"===f.params.touchEventsTarget?f.container[0]:f.wrapper[0],i=f.support.touch?s:document,n=f.params.nested?!0:!1;f.browser.ie?(s[r](f.touchEvents.start,f.onTouchStart,!1),i[r](f.touchEvents.move,f.onTouchMove,n),i[r](f.touchEvents.end,f.onTouchEnd,!1)):(f.support.touch&&(s[r](f.touchEvents.start,f.onTouchStart,!1),s[r](f.touchEvents.move,f.onTouchMove,n),s[r](f.touchEvents.end,f.onTouchEnd,!1)),!a.simulateTouch||f.device.ios||f.device.android||(s[r]("mousedown",f.onTouchStart,!1),i[r]("mousemove",f.onTouchMove,n),i[r]("mouseup",f.onTouchEnd,!1))),window[r]("resize",f.onResize),f.params.nextButton&&m(f.params.nextButton)[t]("click",f.onClickNext),f.params.prevButton&&m(f.params.prevButton)[t]("click",f.onClickPrev),f.params.pagination&&f.params.paginationClickable&&m(f.paginationContainer)[t]("click","."+f.params.bulletClass,f.onClickIndex),(f.params.preventClicks||f.params.preventClicksPropagation)&&s[r]("click",f.preventClicks,!0)},f.attachEvents=function(){f.events()},f.detachEvents=function(){f.events(!0)},f.allowClick=!0,f.preventClicks=function(e){f.allowClick||(f.params.preventClicks&&e.preventDefault(),f.params.preventClicksPropagation&&(e.stopPropagation(),e.stopImmediatePropagation()))},f.onClickNext=function(e){e.preventDefault(),f.slideNext()},f.onClickPrev=function(e){e.preventDefault(),f.slidePrev()},f.onClickIndex=function(e){e.preventDefault();var t=m(this).index()*f.params.slidesPerGroup;f.params.loop&&(t+=f.loopedSlides),f.slideTo(t)},f.updateClickedSlide=function(e){var t=n(e,"."+f.params.slideClass);if(!t)return f.clickedSlide=void 0,void(f.clickedIndex=void 0);if(f.clickedSlide=t,f.clickedIndex=m(t).index(),f.params.slideToClickedSlide&&void 0!==f.clickedIndex&&f.clickedIndex!==f.activeIndex){var a,r=f.clickedIndex;if(f.params.loop)if(a=m(f.clickedSlide).attr("data-swiper-slide-index"),r>f.slides.length-f.params.slidesPerView)f.fixLoop(),r=f.wrapper.children("."+f.params.slideClass+'[data-swiper-slide-index="'+a+'"]').eq(0).index(),setTimeout(function(){f.slideTo(r)},0);else if(r<f.params.slidesPerView-1){f.fixLoop();var s=f.wrapper.children("."+f.params.slideClass+'[data-swiper-slide-index="'+a+'"]');r=s.eq(s.length-1).index(),setTimeout(function(){f.slideTo(r)},0)}else f.slideTo(r);else f.slideTo(r)}};var g,w,T,b,x,S,y,C,M,E="input, select, textarea, button",P=Date.now(),k=[];f.animating=!1,f.touches={startX:0,startY:0,currentX:0,currentY:0,diff:0};var I;if(f.onTouchStart=function(e){if(e.originalEvent&&(e=e.originalEvent),I="touchstart"===e.type,I||!("which"in e)||3!==e.which){if(f.params.noSwiping&&n(e,"."+f.params.noSwipingClass))return void(f.allowClick=!0);if(!f.params.swipeHandler||n(e,f.params.swipeHandler)){if(g=!0,w=!1,b=void 0,f.touches.startX=f.touches.currentX="touchstart"===e.type?e.targetTouches[0].pageX:e.pageX,f.touches.startY=f.touches.currentY="touchstart"===e.type?e.targetTouches[0].pageY:e.pageY,T=Date.now(),f.allowClick=!0,f.updateContainerSize(),f.swipeDirection=void 0,f.params.threshold>0&&(y=!1),"touchstart"!==e.type){var t=!0;m(e.target).is(E)&&(t=!1),document.activeElement&&m(document.activeElement).is(E)&&document.activeElement.blur(),t&&e.preventDefault()}f.params.onTouchStart&&f.params.onTouchStart(f,e)}}},f.onTouchMove=function(e){if(e.originalEvent&&(e=e.originalEvent),!(I&&"mousemove"===e.type||e.preventedByNestedSwiper)){if(f.params.onlyExternal)return w=!0,void(f.allowClick=!1);if(f.params.onTouchMove&&f.params.onTouchMove(f,e),f.allowClick=!1,!(e.targetTouches&&e.targetTouches.length>1)){if(f.touches.currentX="touchmove"===e.type?e.targetTouches[0].pageX:e.pageX,f.touches.currentY="touchmove"===e.type?e.targetTouches[0].pageY:e.pageY,"undefined"==typeof b){var t=180*Math.atan2(Math.abs(f.touches.currentY-f.touches.startY),Math.abs(f.touches.currentX-f.touches.startX))/Math.PI;b=r()?t>f.params.touchAngle:90-t>f.params.touchAngle}if(b&&f.params.onTouchMoveOpposite&&f.params.onTouchMoveOpposite(f,e),g){if(b)return void(g=!1);f.params.onSliderMove&&f.params.onSliderMove(f,e),e.preventDefault(),f.params.touchMoveStopPropagation&&!f.params.nested&&e.stopPropagation(),w||(a.loop&&f.fixLoop(),S="cube"===f.params.effect?(f.rtl?-f.translate:f.translate)||0:f.getWrapperTranslate(),f.setWrapperTransition(0),f.animating&&f.wrapper.trigger("webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd"),f.params.autoplay&&f.autoplaying&&(f.params.autoplayDisableOnInteraction?f.stopAutoplay():f.pauseAutoplay()),M=!1,f.params.grabCursor&&(f.container[0].style.cursor="move",f.container[0].style.cursor="-webkit-grabbing",f.container[0].style.cursor="-moz-grabbin",f.container[0].style.cursor="grabbing")),w=!0;var s=f.touches.diff=r()?f.touches.currentX-f.touches.startX:f.touches.currentY-f.touches.startY;s*=f.params.touchRatio,f.rtl&&(s=-s),f.swipeDirection=s>0?"prev":"next",x=s+S;var i=!0;if(s>0&&x>f.minTranslate()?(i=!1,f.params.resistance&&(x=f.minTranslate()-1+Math.pow(-f.minTranslate()+S+s,f.params.resistanceRatio))):0>s&&x<f.maxTranslate()&&(i=!1,f.params.resistance&&(x=f.maxTranslate()+1-Math.pow(f.maxTranslate()-S-s,f.params.resistanceRatio))),i&&(e.preventedByNestedSwiper=!0),!f.params.allowSwipeToNext&&"next"===f.swipeDirection&&S>x&&(x=S),!f.params.allowSwipeToPrev&&"prev"===f.swipeDirection&&x>S&&(x=S),f.params.followFinger){if(f.params.threshold>0){if(!(Math.abs(s)>f.params.threshold||y))return void(x=S);if(!y)return y=!0,f.touches.startX=f.touches.currentX,f.touches.startY=f.touches.currentY,x=S,void(f.touches.diff=r()?f.touches.currentX-f.touches.startX:f.touches.currentY-f.touches.startY)}(f.params.freeMode||f.params.watchSlidesProgress)&&f.updateActiveIndex(),f.params.freeMode&&(0===k.length&&k.push({position:f.touches[r()?"startX":"startY"],time:T}),k.push({position:f.touches[r()?"currentX":"currentY"],time:(new Date).getTime()})),f.updateProgress(x),f.setWrapperTranslate(x)}}}}},f.onTouchEnd=function(e){if(e.originalEvent&&(e=e.originalEvent),f.params.onTouchEnd&&f.params.onTouchEnd(f,e),g){f.params.grabCursor&&w&&g&&(f.container[0].style.cursor="move",f.container[0].style.cursor="-webkit-grab",f.container[0].style.cursor="-moz-grab",f.container[0].style.cursor="grab");var t=Date.now(),a=t-T;if(f.allowClick&&(f.updateClickedSlide(e),f.params.onTap&&f.params.onTap(f,e),300>a&&t-P>300&&(C&&clearTimeout(C),C=setTimeout(function(){f&&(f.params.paginationHide&&f.paginationContainer.length>0&&!m(e.target).hasClass(f.params.bulletClass)&&f.paginationContainer.toggleClass(f.params.paginationHiddenClass),f.params.onClick&&f.params.onClick(f,e))},300)),300>a&&300>t-P&&(C&&clearTimeout(C),f.params.onDoubleTap&&f.params.onDoubleTap(f,e))),P=Date.now(),setTimeout(function(){f&&f.allowClick&&(f.allowClick=!0)},0),!g||!w||!f.swipeDirection||0===f.touches.diff||x===S)return void(g=w=!1);g=w=!1;var r;if(r=f.params.followFinger?f.rtl?f.translate:-f.translate:-x,f.params.freeMode){if(r<-f.minTranslate())return void f.slideTo(f.activeIndex);if(r>-f.maxTranslate())return void f.slideTo(f.slides.length-1);if(f.params.freeModeMomentum){if(k.length>1){var s=k.pop(),i=k.pop(),n=s.position-i.position,o=s.time-i.time;f.velocity=n/o,f.velocity=f.velocity/2,Math.abs(f.velocity)<.02&&(f.velocity=0),(o>150||(new Date).getTime()-s.time>300)&&(f.velocity=0)}else f.velocity=0;k.length=0;var l=1e3*f.params.freeModeMomentumRatio,d=f.velocity*l,p=f.translate+d;f.rtl&&(p=-p);var u,c=!1,h=20*Math.abs(f.velocity)*f.params.freeModeMomentumBounceRatio;p<f.maxTranslate()&&(f.params.freeModeMomentumBounce?(p+f.maxTranslate()<-h&&(p=f.maxTranslate()-h),u=f.maxTranslate(),c=!0,M=!0):p=f.maxTranslate()),p>f.minTranslate()&&(f.params.freeModeMomentumBounce?(p-f.minTranslate()>h&&(p=f.minTranslate()+h),u=f.minTranslate(),c=!0,M=!0):p=f.minTranslate()),0!==f.velocity&&(l=Math.abs(f.rtl?(-p-f.translate)/f.velocity:(p-f.translate)/f.velocity)),f.params.freeModeMomentumBounce&&c?(f.updateProgress(u),f.setWrapperTransition(l),f.setWrapperTranslate(p),f.onTransitionStart(),f.animating=!0,f.wrapper.transitionEnd(function(){M&&(f.params.onMomentumBounce&&f.params.onMomentumBounce(f),f.setWrapperTransition(f.params.speed),f.setWrapperTranslate(u),f.wrapper.transitionEnd(function(){f.onTransitionEnd()}))})):f.velocity?(f.updateProgress(p),f.setWrapperTransition(l),f.setWrapperTranslate(p),f.onTransitionStart(),f.animating||(f.animating=!0,f.wrapper.transitionEnd(function(){f.onTransitionEnd()}))):f.updateProgress(p),f.updateActiveIndex()}return void((!f.params.freeModeMomentum||a>=f.params.longSwipesMs)&&(f.updateProgress(),f.updateActiveIndex()))}var v,b=0,y=f.slidesSizesGrid[0];for(v=0;v<f.slidesGrid.length;v+=f.params.slidesPerGroup)"undefined"!=typeof f.slidesGrid[v+f.params.slidesPerGroup]?r>=f.slidesGrid[v]&&r<f.slidesGrid[v+f.params.slidesPerGroup]&&(b=v,y=f.slidesGrid[v+f.params.slidesPerGroup]-f.slidesGrid[v]):r>=f.slidesGrid[v]&&(b=v,y=f.slidesGrid[f.slidesGrid.length-1]-f.slidesGrid[f.slidesGrid.length-2]);var E=(r-f.slidesGrid[b])/y;if(a>f.params.longSwipesMs){if(!f.params.longSwipes)return void f.slideTo(f.activeIndex);"next"===f.swipeDirection&&f.slideTo(E>=f.params.longSwipesRatio?b+f.params.slidesPerGroup:b),"prev"===f.swipeDirection&&f.slideTo(E>1-f.params.longSwipesRatio?b+f.params.slidesPerGroup:b)}else{if(!f.params.shortSwipes)return void f.slideTo(f.activeIndex);"next"===f.swipeDirection&&f.slideTo(b+f.params.slidesPerGroup),"prev"===f.swipeDirection&&f.slideTo(b)}}},f._slideTo=function(e,t){return f.slideTo(e,t,!0,!0)},f.slideTo=function(e,t,a,s){"undefined"==typeof a&&(a=!0),"undefined"==typeof e&&(e=0),0>e&&(e=0),f.snapIndex=Math.floor(e/f.params.slidesPerGroup),f.snapIndex>=f.snapGrid.length&&(f.snapIndex=f.snapGrid.length-1);var i=-f.snapGrid[f.snapIndex];f.params.autoplay&&f.autoplaying&&(s||!f.params.autoplayDisableOnInteraction?f.pauseAutoplay(t):f.stopAutoplay()),f.updateProgress(i);for(var n=0;n<f.slidesGrid.length;n++)-i>=f.slidesGrid[n]&&(e=n);if("undefined"==typeof t&&(t=f.params.speed),f.previousIndex=f.activeIndex||0,f.activeIndex=e,i===f.translate)return f.updateClasses(),!1;f.onTransitionStart(a);r()?i:0,r()?0:i;return 0===t?(f.setWrapperTransition(0),f.setWrapperTranslate(i),f.onTransitionEnd(a)):(f.setWrapperTransition(t),f.setWrapperTranslate(i),f.animating||(f.animating=!0,f.wrapper.transitionEnd(function(){f.onTransitionEnd(a)}))),f.updateClasses(),!0},f.onTransitionStart=function(e){"undefined"==typeof e&&(e=!0),e&&(f.params.onTransitionStart&&f.params.onTransitionStart(f),f.params.onSlideChangeStart&&f.activeIndex!==f.previousIndex&&f.params.onSlideChangeStart(f))},f.onTransitionEnd=function(e){f.animating=!1,f.setWrapperTransition(0),"undefined"==typeof e&&(e=!0),e&&(f.params.onTransitionEnd&&f.params.onTransitionEnd(f),f.params.onSlideChangeEnd&&f.activeIndex!==f.previousIndex&&f.params.onSlideChangeEnd(f))},f.slideNext=function(e,t,a){if(f.params.loop){if(f.animating)return!1;f.fixLoop();{f.container[0].clientLeft}return f.slideTo(f.activeIndex+f.params.slidesPerGroup,t,e,a)}return f.slideTo(f.activeIndex+f.params.slidesPerGroup,t,e,a)},f._slideNext=function(e){return f.slideNext(!0,e,!0)},f.slidePrev=function(e,t,a){if(f.params.loop){if(f.animating)return!1;f.fixLoop();{f.container[0].clientLeft}return f.slideTo(f.activeIndex-1,t,e,a)}return f.slideTo(f.activeIndex-1,t,e,a)},f._slidePrev=function(e){return f.slidePrev(!0,e,!0)},f.slideReset=function(e,t){return f.slideTo(f.activeIndex,t,e)},f.setWrapperTransition=function(e,t){f.wrapper.transition(e),f.params.onSetTransition&&f.params.onSetTransition(f,e),"slide"!==f.params.effect&&f.effects[f.params.effect]&&f.effects[f.params.effect].setTransition(e),f.params.parallax&&f.parallax&&f.parallax.setTransition(e),f.params.scrollbar&&f.scrollbar&&f.scrollbar.setTransition(e),f.params.control&&f.controller&&f.controller.setTransition(e,t)},f.setWrapperTranslate=function(e,t,a){var s=0,i=0,n=0;r()?s=f.rtl?-e:e:i=e,f.wrapper.transform(f.support.transforms3d?"translate3d("+s+"px, "+i+"px, "+n+"px)":"translate("+s+"px, "+i+"px)"),f.translate=r()?s:i,t&&f.updateActiveIndex(),"slide"!==f.params.effect&&f.effects[f.params.effect]&&f.effects[f.params.effect].setTranslate(f.translate),f.params.parallax&&f.parallax&&f.parallax.setTranslate(f.translate),f.params.scrollbar&&f.scrollbar&&f.scrollbar.setTranslate(f.translate),f.params.control&&f.controller&&f.controller.setTranslate(f.translate,a),f.params.hashnav&&f.hashnav&&f.hashnav.setHash(),f.params.onSetTranslate&&f.params.onSetTranslate(f,f.translate)},f.getTranslate=function(e,t){var a,r,s,i;return"undefined"==typeof t&&(t="x"),s=window.getComputedStyle(e,null),window.WebKitCSSMatrix?i=new WebKitCSSMatrix("none"===s.webkitTransform?"":s.webkitTransform):(i=s.MozTransform||s.OTransform||s.MsTransform||s.msTransform||s.transform||s.getPropertyValue("transform").replace("translate(","matrix(1, 0, 0, 1,"),a=i.toString().split(",")),"x"===t&&(r=window.WebKitCSSMatrix?i.m41:parseFloat(16===a.length?a[12]:a[4])),"y"===t&&(r=window.WebKitCSSMatrix?i.m42:parseFloat(16===a.length?a[13]:a[5])),f.rtl&&r&&(r=-r),r||0},f.getWrapperTranslate=function(e){return"undefined"==typeof e&&(e=r()?"x":"y"),f.getTranslate(f.wrapper[0],e)},f.observers=[],f.initObservers=function(){if(f.params.observeParents)for(var e=f.container.parents(),t=0;t<e.length;t++)o(e[t]);o(f.container[0],{childList:!1}),o(f.wrapper[0],{attributes:!1})},f.disconnectObservers=function(){for(var e=0;e<f.observers.length;e++)f.observers[e].disconnect();f.observers=[]},f.createLoop=function(){f.wrapper.children("."+f.params.slideClass+"."+f.params.slideDuplicateClass).remove();var e=f.wrapper.children("."+f.params.slideClass);f.loopedSlides=parseInt(f.params.loopedSlides||f.params.slidesPerView,10),f.loopedSlides=f.loopedSlides+f.params.loopAdditionalSlides,f.loopedSlides>e.length&&(f.loopedSlides=e.length);var t,a=[],r=[];for(e.each(function(t,s){var i=m(this);t<f.loopedSlides&&r.push(s),t<e.length&&t>=e.length-f.loopedSlides&&a.push(s),i.attr("data-swiper-slide-index",t)}),t=0;t<r.length;t++)f.wrapper.append(m(r[t].cloneNode(!0)).addClass(f.params.slideDuplicateClass));for(t=a.length-1;t>=0;t--)f.wrapper.prepend(m(a[t].cloneNode(!0)).addClass(f.params.slideDuplicateClass))},f.destroyLoop=function(){f.wrapper.children("."+f.params.slideClass+"."+f.params.slideDuplicateClass).remove()},f.fixLoop=function(){var e;f.activeIndex<f.loopedSlides?(e=f.slides.length-3*f.loopedSlides+f.activeIndex,e+=f.loopedSlides,f.slideTo(e,0,!1,!0)):("auto"===f.params.slidesPerView&&f.activeIndex>=2*f.loopedSlides||f.activeIndex>f.slides.length-2*f.params.slidesPerView)&&(e=-f.slides.length+f.activeIndex+f.loopedSlides,e+=f.loopedSlides,f.slideTo(e,0,!1,!0))},f.appendSlide=function(e){if(f.params.loop&&f.destroyLoop(),"object"==typeof e&&e.length)for(var t=0;t<e.length;t++)e[t]&&f.wrapper.append(e[t]);else f.wrapper.append(e);f.params.loop&&f.createLoop(),f.params.observer&&f.support.observer||f.update(!0)},f.prependSlide=function(e){f.params.loop&&f.destroyLoop();var t=f.activeIndex+1;if("object"==typeof e&&e.length){for(var a=0;a<e.length;a++)e[a]&&f.wrapper.prepend(e[a]);t=f.activeIndex+e.length}else f.wrapper.prepend(e);f.params.loop&&f.createLoop(),f.params.observer&&f.support.observer||f.update(!0),f.slideTo(t,0,!1)},f.removeSlide=function(e){f.params.loop&&f.destroyLoop();
var t,a=f.activeIndex;if("object"==typeof e&&e.length){for(var r=0;r<e.length;r++)t=e[r],f.slides[t]&&f.slides.eq(t).remove(),a>t&&a--;a=Math.max(a,0)}else t=e,f.slides[t]&&f.slides.eq(t).remove(),a>t&&a--,a=Math.max(a,0);f.params.observer&&f.support.observer||f.update(!0),f.slideTo(a,0,!1)},f.removeAllSlides=function(){for(var e=[],t=0;t<f.slides.length;t++)e.push(t);f.removeSlide(e)},f.effects={fade:{setTranslate:function(){for(var e=0;e<f.slides.length;e++){var t=f.slides.eq(e),a=t[0].swiperSlideOffset,s=-a-f.translate,i=0;r()||(i=s,s=0);var n=f.params.fade.crossFade?Math.max(1-Math.abs(t[0].progress),0):1+Math.min(Math.max(t[0].progress,-1),0);t.css({opacity:n}).transform("translate3d("+s+"px, "+i+"px, 0px)")}},setTransition:function(e){f.slides.transition(e)}},cube:{setTranslate:function(){var e,t=0;f.params.cube.shadow&&(r()?(e=f.wrapper.find(".swiper-cube-shadow"),0===e.length&&(e=m('<div class="swiper-cube-shadow"></div>'),f.wrapper.append(e)),e.css({height:f.width+"px"})):(e=f.container.find(".swiper-cube-shadow"),0===e.length&&(e=m('<div class="swiper-cube-shadow"></div>'),f.container.append(e))));for(var a=0;a<f.slides.length;a++){var s=f.slides.eq(a),i=90*a,n=Math.floor(i/360);f.rtl&&(i=-i,n=Math.floor(-i/360));var o=Math.max(Math.min(s[0].progress,1),-1),l=0,d=0,p=0;a%4===0?(l=4*-n*f.size,p=0):(a-1)%4===0?(l=0,p=4*-n*f.size):(a-2)%4===0?(l=f.size+4*n*f.size,p=f.size):(a-3)%4===0&&(l=-f.size,p=3*f.size+4*f.size*n),f.rtl&&(l=-l),r()||(d=l,l=0);var u="rotateX("+(r()?0:-i)+"deg) rotateY("+(r()?i:0)+"deg) translate3d("+l+"px, "+d+"px, "+p+"px)";if(1>=o&&o>-1&&(t=90*a+90*o,f.rtl&&(t=90*-a-90*o)),s.transform(u),f.params.cube.slideShadows){var c=s.find(r()?".swiper-slide-shadow-left":".swiper-slide-shadow-top"),h=s.find(r()?".swiper-slide-shadow-right":".swiper-slide-shadow-bottom");0===c.length&&(c=m('<div class="swiper-slide-shadow-'+(r()?"left":"top")+'"></div>'),s.append(c)),0===h.length&&(h=m('<div class="swiper-slide-shadow-'+(r()?"right":"bottom")+'"></div>'),s.append(h));{s[0].progress}c.length&&(c[0].style.opacity=-s[0].progress),h.length&&(h[0].style.opacity=s[0].progress)}}if(f.wrapper.css({"-webkit-transform-origin":"50% 50% -"+f.size/2+"px","-moz-transform-origin":"50% 50% -"+f.size/2+"px","-ms-transform-origin":"50% 50% -"+f.size/2+"px","transform-origin":"50% 50% -"+f.size/2+"px"}),f.params.cube.shadow)if(r())e.transform("translate3d(0px, "+(f.width/2+f.params.cube.shadowOffset)+"px, "+-f.width/2+"px) rotateX(90deg) rotateZ(0deg) scale("+f.params.cube.shadowScale+")");else{var v=Math.abs(t)-90*Math.floor(Math.abs(t)/90),g=1.5-(Math.sin(2*v*Math.PI/360)/2+Math.cos(2*v*Math.PI/360)/2),w=f.params.cube.shadowScale,T=f.params.cube.shadowScale/g,b=f.params.cube.shadowOffset;e.transform("scale3d("+w+", 1, "+T+") translate3d(0px, "+(f.height/2+b)+"px, "+-f.height/2/T+"px) rotateX(-90deg)")}var x=f.isSafari||f.isUiWebView?-f.size/2:0;f.wrapper.transform("translate3d(0px,0,"+x+"px) rotateX("+(r()?0:t)+"deg) rotateY("+(r()?-t:0)+"deg)")},setTransition:function(e){f.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e),f.params.cube.shadow&&!r()&&f.container.find(".swiper-cube-shadow").transition(e)}},coverflow:{setTranslate:function(){for(var e=f.translate,t=r()?-e+f.width/2:-e+f.height/2,a=r()?f.params.coverflow.rotate:-f.params.coverflow.rotate,s=f.params.coverflow.depth,i=0,n=f.slides.length;n>i;i++){var o=f.slides.eq(i),l=f.slidesSizesGrid[i],d=o[0].swiperSlideOffset,p=(t-d-l/2)/l*f.params.coverflow.modifier,u=r()?a*p:0,c=r()?0:a*p,h=-s*Math.abs(p),v=r()?0:f.params.coverflow.stretch*p,g=r()?f.params.coverflow.stretch*p:0;Math.abs(g)<.001&&(g=0),Math.abs(v)<.001&&(v=0),Math.abs(h)<.001&&(h=0),Math.abs(u)<.001&&(u=0),Math.abs(c)<.001&&(c=0);var w="translate3d("+g+"px,"+v+"px,"+h+"px)  rotateX("+c+"deg) rotateY("+u+"deg)";if(o.transform(w),o[0].style.zIndex=-Math.abs(Math.round(p))+1,f.params.coverflow.slideShadows){var T=o.find(r()?".swiper-slide-shadow-left":".swiper-slide-shadow-top"),b=o.find(r()?".swiper-slide-shadow-right":".swiper-slide-shadow-bottom");0===T.length&&(T=m('<div class="swiper-slide-shadow-'+(r()?"left":"top")+'"></div>'),o.append(T)),0===b.length&&(b=m('<div class="swiper-slide-shadow-'+(r()?"right":"bottom")+'"></div>'),o.append(b)),T.length&&(T[0].style.opacity=p>0?p:0),b.length&&(b[0].style.opacity=-p>0?-p:0)}}if(window.navigator.pointerEnabled||window.navigator.msPointerEnabled){var x=f.wrapper.style;x.perspectiveOrigin=t+"px 50%"}},setTransition:function(e){f.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e)}}},f.scrollbar={set:function(){if(f.params.scrollbar){var e=f.scrollbar;e.track=m(f.params.scrollbar),e.drag=e.track.find(".swiper-scrollbar-drag"),0===e.drag.length&&(e.drag=m('<div class="swiper-scrollbar-drag"></div>'),e.track.append(e.drag)),e.drag[0].style.width="",e.drag[0].style.height="",e.trackSize=r()?e.track[0].offsetWidth:e.track[0].offsetHeight,e.divider=f.size/f.virtualWidth,e.moveDivider=e.divider*(e.trackSize/f.size),e.dragSize=e.trackSize*e.divider,r()?e.drag[0].style.width=e.dragSize+"px":e.drag[0].style.height=e.dragSize+"px",e.track[0].style.display=e.divider>=1?"none":"",f.params.scrollbarHide&&(e.track[0].style.opacity=0)}},setTranslate:function(){if(f.params.scrollbar){var e,t=f.scrollbar,a=(f.translate||0,t.dragSize);e=(t.trackSize-t.dragSize)*f.progress,f.rtl&&r()?(e=-e,e>0?(a=t.dragSize-e,e=0):-e+t.dragSize>t.trackSize&&(a=t.trackSize+e)):0>e?(a=t.dragSize+e,e=0):e+t.dragSize>t.trackSize&&(a=t.trackSize-e),r()?(t.drag.transform("translate3d("+e+"px, 0, 0)"),t.drag[0].style.width=a+"px"):(t.drag.transform("translate3d(0px, "+e+"px, 0)"),t.drag[0].style.height=a+"px"),f.params.scrollbarHide&&(clearTimeout(t.timeout),t.track[0].style.opacity=1,t.timeout=setTimeout(function(){t.track[0].style.opacity=0,t.track.transition(400)},1e3))}},setTransition:function(e){f.params.scrollbar&&f.scrollbar.drag.transition(e)}},f.controller={setTranslate:function(e,t){var a,r,s=f.params.control;if(f.isArray(s))for(var i=0;i<s.length;i++)s[i]!==t&&s[i]instanceof Swiper&&(e=s[i].rtl&&"horizontal"===s[i].params.direction?-f.translate:f.translate,a=(s[i].maxTranslate()-s[i].minTranslate())/(f.maxTranslate()-f.minTranslate()),r=(e-f.minTranslate())*a+s[i].minTranslate(),f.params.controlInverse&&(r=s[i].maxTranslate()-r),s[i].updateProgress(r),s[i].setWrapperTranslate(r,!1,f),s[i].updateActiveIndex());else s instanceof Swiper&&t!==s&&(e=s.rtl&&"horizontal"===s.params.direction?-f.translate:f.translate,a=(s.maxTranslate()-s.minTranslate())/(f.maxTranslate()-f.minTranslate()),r=(e-f.minTranslate())*a+s.minTranslate(),f.params.controlInverse&&(r=s.maxTranslate()-r),s.updateProgress(r),s.setWrapperTranslate(r,!1,f),s.updateActiveIndex())},setTransition:function(e,t){var a=f.params.control;if(f.isArray(a))for(var r=0;r<a.length;r++)a[r]!==t&&a[r]instanceof Swiper&&a[r].setWrapperTransition(e,f);else a instanceof Swiper&&t!==a&&a.setWrapperTransition(e,f)}},f.hashnav={init:function(){if(f.params.hashnav){f.hashnav.initialized=!0;var e=document.location.hash.replace("#","");if(e)for(var t=0,a=0,r=f.slides.length;r>a;a++){var s=f.slides.eq(a),i=s.attr("data-hash");if(i===e&&!s.hasClass(f.params.slideDuplicateClass)){var n=s.index();f._slideTo(n,t)}}}},setHash:function(){f.hashnav.initialized&&f.params.hashnav&&(document.location.hash=f.slides.eq(f.activeIndex).attr("data-hash")||"")}},f.disableKeyboardControl=function(){m(document).off("keydown",l)},f.enableKeyboardControl=function(){m(document).on("keydown",l)},f._wheelEvent=!1,f._lastWheelScrollTime=(new Date).getTime(),f.params.mousewheelControl){if(void 0!==document.onmousewheel&&(f._wheelEvent="mousewheel"),!f._wheelEvent)try{new WheelEvent("wheel"),f._wheelEvent="wheel"}catch(z){}f._wheelEvent||(f._wheelEvent="DOMMouseScroll")}return f.disableMousewheelControl=function(){return f._wheelEvent?(f.container.off(f._wheelEvent,d),!0):!1},f.enableMousewheelControl=function(){return f._wheelEvent?(f.container.on(f._wheelEvent,d),!0):!1},f.parallax={setTranslate:function(){f.container.children("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){p(this,f.progress)}),f.slides.each(function(){var e=m(this);e.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){var t=Math.min(Math.max(e[0].progress,-1),1);p(this,t)})})},setTransition:function(e){"undefined"==typeof e&&(e=f.params.speed),f.container.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){var t=m(this),a=parseInt(t.attr("data-swiper-parallax-duration"),10)||e;0===e&&(a=0),t.transition(a)})}},f.init=function(){f.params.loop&&f.createLoop(),f.updateContainerSize(),f.updateSlidesSize(),f.updatePagination(),f.params.scrollbar&&f.scrollbar&&f.scrollbar.set(),"slide"!==f.params.effect&&f.effects[f.params.effect]&&(f.params.loop||f.updateProgress(),f.effects[f.params.effect].setTranslate()),f.params.loop?f.slideTo(f.params.initialSlide+f.loopedSlides,0,f.params.runCallbacksOnInit):(f.slideTo(f.params.initialSlide,0,f.params.runCallbacksOnInit),0===f.params.initialSlide&&f.parallax&&f.params.parallax&&f.parallax.setTranslate()),f.attachEvents(),f.params.observer&&f.support.observer&&f.initObservers(),f.params.updateOnImagesReady&&f.preloadImages(),f.params.autoplay&&f.startAutoplay(),f.params.keyboardControl&&f.enableKeyboardControl&&f.enableKeyboardControl(),f.params.mousewheelControl&&f.enableMousewheelControl&&f.enableMousewheelControl(),f.params.hashnav&&f.hashnav&&f.hashnav.init(),f.params.onInit&&f.params.onInit(f)},f.destroy=function(e){f.detachEvents(),f.disconnectObservers(),f.params.keyboardControl&&f.disableKeyboardControl&&f.disableKeyboardControl(),f.params.mousewheelControl&&f.disableMousewheelControl&&f.disableMousewheelControl(),f.params.onDestroy&&f.params.onDestroy(),e!==!1&&(f=null)},f.init(),f}},Swiper.prototype={isSafari:function(){var e=navigator.userAgent.toLowerCase();return e.indexOf("safari")>=0&&e.indexOf("chrome")<0&&e.indexOf("android")<0}(),isUiWebView:/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent),isArray:function(e){return"[object Array]"===Object.prototype.toString.apply(e)},browser:{ie:window.navigator.pointerEnabled||window.navigator.msPointerEnabled},device:function(){var e=navigator.userAgent,t=e.match(/(Android);?[\s\/]+([\d.]+)?/),a=e.match(/(iPad).*OS\s([\d_]+)/),r=(e.match(/(iPod)(.*OS\s([\d_]+))?/),!a&&e.match(/(iPhone\sOS)\s([\d_]+)/));return{ios:a||r||a,android:t}}(),support:{touch:window.Modernizr&&Modernizr.touch===!0||function(){return!!("ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch)}(),transforms3d:window.Modernizr&&Modernizr.csstransforms3d===!0||function(){var e=document.createElement("div").style;return"webkitPerspective"in e||"MozPerspective"in e||"OPerspective"in e||"MsPerspective"in e||"perspective"in e}(),flexbox:function(){for(var e=document.createElement("div").style,t="WebkitBox msFlexbox MsFlexbox WebkitFlex MozBox flex".split(" "),a=0;a<t.length;a++)if(t[a]in e)return!0}(),observer:function(){return"MutationObserver"in window||"WebkitMutationObserver"in window}()}};for(var t=(function(){var e=function(e){var t=this,a=0;for(a=0;a<e.length;a++)t[a]=e[a];return t.length=e.length,this},t=function(t,a){var r=[],s=0;if(t&&!a&&t instanceof e)return t;if(t)if("string"==typeof t){var i,n,o=t.trim();if(o.indexOf("<")>=0&&o.indexOf(">")>=0){var l="div";for(0===o.indexOf("<li")&&(l="ul"),0===o.indexOf("<tr")&&(l="tbody"),(0===o.indexOf("<td")||0===o.indexOf("<th"))&&(l="tr"),0===o.indexOf("<tbody")&&(l="table"),0===o.indexOf("<option")&&(l="select"),n=document.createElement(l),n.innerHTML=t,s=0;s<n.childNodes.length;s++)r.push(n.childNodes[s])}else for(i=a||"#"!==t[0]||t.match(/[ .<>:~]/)?(a||document).querySelectorAll(t):[document.getElementById(t.split("#")[1])],s=0;s<i.length;s++)i[s]&&r.push(i[s])}else if(t.nodeType||t===window||t===document)r.push(t);else if(t.length>0&&t[0].nodeType)for(s=0;s<t.length;s++)r.push(t[s]);return new e(r)};return e.prototype={addClass:function(e){if("undefined"==typeof e)return this;for(var t=e.split(" "),a=0;a<t.length;a++)for(var r=0;r<this.length;r++)this[r].classList.add(t[a]);return this},removeClass:function(e){for(var t=e.split(" "),a=0;a<t.length;a++)for(var r=0;r<this.length;r++)this[r].classList.remove(t[a]);return this},hasClass:function(e){return this[0]?this[0].classList.contains(e):!1},toggleClass:function(e){for(var t=e.split(" "),a=0;a<t.length;a++)for(var r=0;r<this.length;r++)this[r].classList.toggle(t[a]);return this},attr:function(e,t){if(1===arguments.length&&"string"==typeof e)return this[0]?this[0].getAttribute(e):void 0;for(var a=0;a<this.length;a++)if(2===arguments.length)this[a].setAttribute(e,t);else for(var r in e)this[a][r]=e[r],this[a].setAttribute(r,e[r]);return this},removeAttr:function(e){for(var t=0;t<this.length;t++)this[t].removeAttribute(e)},data:function(e,t){if("undefined"==typeof t){if(this[0]){var a=this[0].getAttribute("data-"+e);return a?a:this[0].dom7ElementDataStorage&&e in this[0].dom7ElementDataStorage?this[0].dom7ElementDataStorage[e]:void 0}return void 0}for(var r=0;r<this.length;r++){var s=this[r];s.dom7ElementDataStorage||(s.dom7ElementDataStorage={}),s.dom7ElementDataStorage[e]=t}return this},transform:function(e){for(var t=0;t<this.length;t++){var a=this[t].style;a.webkitTransform=a.MsTransform=a.msTransform=a.MozTransform=a.OTransform=a.transform=e}return this},transition:function(e){"string"!=typeof e&&(e+="ms");for(var t=0;t<this.length;t++){var a=this[t].style;a.webkitTransitionDuration=a.MsTransitionDuration=a.msTransitionDuration=a.MozTransitionDuration=a.OTransitionDuration=a.transitionDuration=e}return this},on:function(e,a,r,s){function i(e){var s=e.target;if(t(s).is(a))r.call(s,e);else for(var i=t(s).parents(),n=0;n<i.length;n++)t(i[n]).is(a)&&r.call(i[n],e)}var n,o,l=e.split(" ");for(n=0;n<this.length;n++)if("function"==typeof a||a===!1)for("function"==typeof a&&(r=arguments[1],s=arguments[2]||!1),o=0;o<l.length;o++)this[n].addEventListener(l[o],r,s);else for(o=0;o<l.length;o++)this[n].dom7LiveListeners||(this[n].dom7LiveListeners=[]),this[n].dom7LiveListeners.push({listener:r,liveListener:i}),this[n].addEventListener(l[o],i,s);return this},off:function(e,t,a,r){for(var s=e.split(" "),i=0;i<s.length;i++)for(var n=0;n<this.length;n++)if("function"==typeof t||t===!1)"function"==typeof t&&(a=arguments[1],r=arguments[2]||!1),this[n].removeEventListener(s[i],a,r);else if(this[n].dom7LiveListeners)for(var o=0;o<this[n].dom7LiveListeners.length;o++)this[n].dom7LiveListeners[o].listener===a&&this[n].removeEventListener(s[i],this[n].dom7LiveListeners[o].liveListener,r);return this},once:function(e,t,a,r){function s(n){a(n),i.off(e,t,s,r)}var i=this;"function"==typeof t&&(t=!1,a=arguments[1],r=arguments[2]),i.on(e,t,s,r)},trigger:function(e,t){for(var a=0;a<this.length;a++){var r;try{r=new CustomEvent(e,{detail:t,bubbles:!0,cancelable:!0})}catch(s){r=document.createEvent("Event"),r.initEvent(e,!0,!0),r.detail=t}this[a].dispatchEvent(r)}return this},transitionEnd:function(e){function t(i){if(i.target===this)for(e.call(this,i),a=0;a<r.length;a++)s.off(r[a],t)}var a,r=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],s=this;if(e)for(a=0;a<r.length;a++)s.on(r[a],t);return this},width:function(){return this[0]===window?window.innerWidth:this.length>0?parseFloat(this.css("width")):null},outerWidth:function(e){return this.length>0?e?this[0].offsetWidth+parseFloat(this.css("margin-right"))+parseFloat(this.css("margin-left")):this[0].offsetWidth:null},height:function(){return this[0]===window?window.innerHeight:this.length>0?parseFloat(this.css("height")):null},outerHeight:function(e){return this.length>0?e?this[0].offsetHeight+parseFloat(this.css("margin-top"))+parseFloat(this.css("margin-bottom")):this[0].offsetHeight:null},offset:function(){if(this.length>0){var e=this[0],t=e.getBoundingClientRect(),a=document.body,r=e.clientTop||a.clientTop||0,s=e.clientLeft||a.clientLeft||0,i=window.pageYOffset||e.scrollTop,n=window.pageXOffset||e.scrollLeft;return{top:t.top+i-r,left:t.left+n-s}}return null},css:function(e,t){var a;if(1===arguments.length){if("string"!=typeof e){for(a=0;a<this.length;a++)for(var r in e)this[a].style[r]=e[r];return this}if(this[0])return window.getComputedStyle(this[0],null).getPropertyValue(e)}if(2===arguments.length&&"string"==typeof e){for(a=0;a<this.length;a++)this[a].style[e]=t;return this}return this},each:function(e){for(var t=0;t<this.length;t++)e.call(this[t],t,this[t]);return this},html:function(e){if("undefined"==typeof e)return this[0]?this[0].innerHTML:void 0;for(var t=0;t<this.length;t++)this[t].innerHTML=e;return this},is:function(a){if(!this[0])return!1;var r,s;if("string"==typeof a){var i=this[0];if(i===document)return a===document;if(i===window)return a===window;if(i.matches)return i.matches(a);if(i.webkitMatchesSelector)return i.webkitMatchesSelector(a);if(i.mozMatchesSelector)return i.mozMatchesSelector(a);if(i.msMatchesSelector)return i.msMatchesSelector(a);for(r=t(a),s=0;s<r.length;s++)if(r[s]===this[0])return!0;return!1}if(a===document)return this[0]===document;if(a===window)return this[0]===window;if(a.nodeType||a instanceof e){for(r=a.nodeType?[a]:a,s=0;s<r.length;s++)if(r[s]===this[0])return!0;return!1}return!1},index:function(){if(this[0]){for(var e=this[0],t=0;null!==(e=e.previousSibling);)1===e.nodeType&&t++;return t}return void 0},eq:function(t){if("undefined"==typeof t)return this;var a,r=this.length;return t>r-1?new e([]):0>t?(a=r+t,new e(0>a?[]:[this[a]])):new e([this[t]])},append:function(t){var a,r;for(a=0;a<this.length;a++)if("string"==typeof t){var s=document.createElement("div");for(s.innerHTML=t;s.firstChild;)this[a].appendChild(s.firstChild)}else if(t instanceof e)for(r=0;r<t.length;r++)this[a].appendChild(t[r]);else this[a].appendChild(t);return this},prepend:function(t){var a,r;for(a=0;a<this.length;a++)if("string"==typeof t){var s=document.createElement("div");for(s.innerHTML=t,r=s.childNodes.length-1;r>=0;r--)this[a].insertBefore(s.childNodes[r],this[a].childNodes[0])}else if(t instanceof e)for(r=0;r<t.length;r++)this[a].insertBefore(t[r],this[a].childNodes[0]);else this[a].insertBefore(t,this[a].childNodes[0]);return this},insertBefore:function(e){for(var a=t(e),r=0;r<this.length;r++)if(1===a.length)a[0].parentNode.insertBefore(this[r],a[0]);else if(a.length>1)for(var s=0;s<a.length;s++)a[s].parentNode.insertBefore(this[r].cloneNode(!0),a[s])},insertAfter:function(e){for(var a=t(e),r=0;r<this.length;r++)if(1===a.length)a[0].parentNode.insertBefore(this[r],a[0].nextSibling);else if(a.length>1)for(var s=0;s<a.length;s++)a[s].parentNode.insertBefore(this[r].cloneNode(!0),a[s].nextSibling)},next:function(a){return new e(this.length>0?a?this[0].nextElementSibling&&t(this[0].nextElementSibling).is(a)?[this[0].nextElementSibling]:[]:this[0].nextElementSibling?[this[0].nextElementSibling]:[]:[])},nextAll:function(a){var r=[],s=this[0];if(!s)return new e([]);for(;s.nextElementSibling;){var i=s.nextElementSibling;a?t(i).is(a)&&r.push(i):r.push(i),s=i}return new e(r)},prev:function(a){return new e(this.length>0?a?this[0].previousElementSibling&&t(this[0].previousElementSibling).is(a)?[this[0].previousElementSibling]:[]:this[0].previousElementSibling?[this[0].previousElementSibling]:[]:[])},prevAll:function(a){var r=[],s=this[0];if(!s)return new e([]);for(;s.previousElementSibling;){var i=s.previousElementSibling;a?t(i).is(a)&&r.push(i):r.push(i),s=i}return new e(r)},parent:function(e){for(var a=[],r=0;r<this.length;r++)e?t(this[r].parentNode).is(e)&&a.push(this[r].parentNode):a.push(this[r].parentNode);return t(t.unique(a))},parents:function(e){for(var a=[],r=0;r<this.length;r++)for(var s=this[r].parentNode;s;)e?t(s).is(e)&&a.push(s):a.push(s),s=s.parentNode;return t(t.unique(a))},find:function(t){for(var a=[],r=0;r<this.length;r++)for(var s=this[r].querySelectorAll(t),i=0;i<s.length;i++)a.push(s[i]);return new e(a)},children:function(a){for(var r=[],s=0;s<this.length;s++)for(var i=this[s].childNodes,n=0;n<i.length;n++)a?1===i[n].nodeType&&t(i[n]).is(a)&&r.push(i[n]):1===i[n].nodeType&&r.push(i[n]);return new e(t.unique(r))},remove:function(){for(var e=0;e<this.length;e++)this[e].parentNode&&this[e].parentNode.removeChild(this[e]);return this},add:function(){var e,a,r=this;for(e=0;e<arguments.length;e++){var s=t(arguments[e]);for(a=0;a<s.length;a++)r[r.length]=s[a],r.length++}return r}},t.fn=e.prototype,t.unique=function(e){for(var t=[],a=0;a<e.length;a++)-1===t.indexOf(e[a])&&t.push(e[a]);return t},t}()),a=["jQuery","Zepto","Dom7"],r=0;r<a.length;r++)window[a[r]]&&e(window[a[r]]);var s;s="undefined"==typeof t?window.Dom7||window.Zepto||window.jQuery:t,s&&("transitionEnd"in s.fn||(s.fn.transitionEnd=function(e){function t(i){if(i.target===this)for(e.call(this,i),a=0;a<r.length;a++)s.off(r[a],t)}var a,r=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],s=this;if(e)for(a=0;a<r.length;a++)s.on(r[a],t);return this}),"transform"in s.fn||(s.fn.transform=function(e){for(var t=0;t<this.length;t++){var a=this[t].style;a.webkitTransform=a.MsTransform=a.msTransform=a.MozTransform=a.OTransform=a.transform=e}return this}),"transition"in s.fn||(s.fn.transition=function(e){"string"!=typeof e&&(e+="ms");for(var t=0;t<this.length;t++){var a=this[t].style;a.webkitTransitionDuration=a.MsTransitionDuration=a.msTransitionDuration=a.MozTransitionDuration=a.OTransitionDuration=a.transitionDuration=e}return this}))}(),"undefined"!=typeof module?module.exports=Swiper:"function"==typeof define&&define.amd&&define([],function(){"use strict";return Swiper});
//# sourceMappingURL=maps/swiper.min.js.map
/*===========================
Swiper AMD Export
===========================*/
if (typeof(module) !== 'undefined')
{
    module.exports = Swiper;
}
else if (typeof define === 'function' && define.amd) {
    define([], function () {
        'use strict';
        return Swiper;
    });
}
/*=========================
  Controller
  ===========================*/
s.controller = {
    setTranslate: function (translate, byController) {
        var controlled = s.params.control;
        var multiplier, controlledTranslate;
        if (s.isArray(controlled)) {
            for (var i = 0; i < controlled.length; i++) {
                if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
                    translate = controlled[i].rtl && controlled[i].params.direction === 'horizontal' ? -s.translate : s.translate;
                    multiplier = (controlled[i].maxTranslate() - controlled[i].minTranslate()) / (s.maxTranslate() - s.minTranslate());
                    controlledTranslate = (translate - s.minTranslate()) * multiplier + controlled[i].minTranslate();
                    if (s.params.controlInverse) {
                        controlledTranslate = controlled[i].maxTranslate() - controlledTranslate;
                    }
                    controlled[i].updateProgress(controlledTranslate);
                    controlled[i].setWrapperTranslate(controlledTranslate, false, s);
                    controlled[i].updateActiveIndex();
                }
            }
        }
        else if (controlled instanceof Swiper && byController !== controlled) {
            translate = controlled.rtl && controlled.params.direction === 'horizontal' ? -s.translate : s.translate;
            multiplier = (controlled.maxTranslate() - controlled.minTranslate()) / (s.maxTranslate() - s.minTranslate());
            controlledTranslate = (translate - s.minTranslate()) * multiplier + controlled.minTranslate();
            if (s.params.controlInverse) {
                controlledTranslate = controlled.maxTranslate() - controlledTranslate;
            }
            controlled.updateProgress(controlledTranslate);
            controlled.setWrapperTranslate(controlledTranslate, false, s);
            controlled.updateActiveIndex();
        }
    },
    setTransition: function (duration, byController) {
        var controlled = s.params.control;
        if (s.isArray(controlled)) {
            for (var i = 0; i < controlled.length; i++) {
                if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
                    controlled[i].setWrapperTransition(duration, s);
                }
            }
        }
        else if (controlled instanceof Swiper && byController !== controlled) {
            controlled.setWrapperTransition(duration, s);
        }
    }
};
var defaults = {
    direction: 'horizontal',
    touchEventsTarget: 'container',
    initialSlide: 0,
    speed: 300,
    // autoplay
    autoplay: false,
    autoplayDisableOnInteraction: true,
    // Free mode
    freeMode: false,
    freeModeMomentum: true,
    freeModeMomentumRatio: 1,
    freeModeMomentumBounce: true,
    freeModeMomentumBounceRatio: 1,
    // Effects
    effect: 'slide', // 'slide' or 'fade' or 'cube' or 'coverflow'
    coverflow: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows : true
    },
    cube: {
        slideShadows: true,
        shadow: true,
        shadowOffset: 20,
        shadowScale: 0.94
    },
    fade: {
        crossFade: false
    },
    // Parallax
    parallax: false,
    // Scrollbar
    scrollbar: null,
    scrollbarHide: true,
    // Keyboard Mousewheel
    keyboardControl: false,
    mousewheelControl: false,
    mousewheelForceToAxis: false,
    // Hash Navigation
    hashnav: false,
    // Slides grid
    spaceBetween: 0,
    slidesPerView: 1,
    slidesPerColumn: 1,
    slidesPerColumnFill: 'column',
    slidesPerGroup: 1,
    centeredSlides: false,
    // Touches
    touchRatio: 1,
    touchAngle: 45,
    simulateTouch: true,
    shortSwipes: true,
    longSwipes: true,
    longSwipesRatio: 0.5,
    longSwipesMs: 300,
    followFinger: true,
    onlyExternal: false,
    threshold: 0,
    touchMoveStopPropagation: true,
    // Pagination
    pagination: null,
    paginationClickable: false,
    paginationHide: false,
    // Resistance
    resistance: true,
    resistanceRatio: 0.85,
    // Next/prev buttons
    nextButton: null,
    prevButton: null,
    // Progress
    watchSlidesProgress: false,
    watchVisibility: false,
    // Cursor
    grabCursor: false,
    // Clicks
    preventClicks: true,
    preventClicksPropagation: true,
    releaseFormElements: true,
    slideToClickedSlide: false,
    // Images
    updateOnImagesReady: true,
    // loop
    loop: false,
    loopAdditionalSlides: 0,
    loopedSlides: null,
    // Control
    control: undefined,
    controlInverse: false,
    // Swiping/no swiping
    allowSwipeToPrev: true,
    allowSwipeToNext: true,
    swipeHandler: null, //'.swipe-handler',
    noSwiping: true,
    noSwipingClass: 'swiper-no-swiping',
    // NS
    slideClass: 'swiper-slide',
    slideActiveClass: 'swiper-slide-active',
    slideVisibleClass: 'swiper-slide-visible',
    slideDuplicateClass: 'swiper-slide-duplicate',
    slideNextClass: 'swiper-slide-next',
    slidePrevClass: 'swiper-slide-prev',
    wrapperClass: 'swiper-wrapper',
    bulletClass: 'swiper-pagination-bullet',
    bulletActiveClass: 'swiper-pagination-bullet-active',
    buttonDisabledClass: 'swiper-button-disabled',
    paginationHiddenClass: 'swiper-pagination-hidden',
    // Observer
    observer: false,
    observeParents: false,
    // Callbacks
    runCallbacksOnInit: true
    /*
    Callbacks:
    onInit: function (swiper)
    onDestroy: function (swiper)
    onClick: function (swiper, e) 
    onTap: function (swiper, e) 
    onDoubleTap: function (swiper, e) 
    onSliderMove: function (swiper, e) 
    onSlideChangeStart: function (swiper) 
    onSlideChangeEnd: function (swiper) 
    onTransitionStart: function (swiper) 
    onTransitionEnd: function (swiper) 
    onImagesReady: function (swiper) 
    onProgress: function (swiper, progress) 
    onTouchStart: function (swiper, e) 
    onTouchMove: function (swiper, e) 
    onTouchMoveOpposite: function (swiper, e) 
    onTouchEnd: function (swiper, e) 
    onReachBeginning: function (swiper) 
    onReachEnd: function (swiper) 
    onSetTransition: function (swiper, duration) 
    onSetTranslate: function (swiper, translate) 
    onAutoplayStart: function (swiper)
    onAutoplayStop: function (swiper)
    */
};
params = params || {};
for (var def in defaults) {
    if (typeof params[def] === 'undefined') {
        params[def] = defaults[def];
    }
    else if (typeof params[def] === 'object') {
        for (var deepDef in defaults[def]) {
            if (typeof params[def][deepDef] === 'undefined') {
                params[def][deepDef] = defaults[def][deepDef];
            }
        }
    }
}

// Swiper
var s = this;

// Params
s.params = params;
/*=========================
  Dom Library and plugins
  ===========================*/
var $;
if (typeof Dom7 === 'undefined') {
    $ = window.Dom7 || window.Zepto || window.jQuery;
}
else {
    $ = Dom7;
}
if (!$) return;

/*=========================
  Preparation - Define Container, Wrapper and Pagination
  ===========================*/
s.container = $(container);
if (s.container.length === 0) return;
if (s.container.length > 1) {
    s.container.each(function () {
        new Swiper(this, params);
    });
    return;
}

// Save instance in container HTML Element and in data
s.container[0].swiper = s;
s.container.data('swiper', s);

s.container.addClass('swiper-container-' + s.params.direction);

if (s.params.freeMode) {
    s.container.addClass('swiper-container-free-mode');
}
// Enable slides progress when required
if (s.params.parallax || s.params.watchVisibility) {
    s.params.watchSlidesProgress = true;
}
// Coverflow / 3D
if (['cube', 'coverflow'].indexOf(s.params.effect) >= 0) {
    if (s.support.transforms3d) {
        s.params.watchSlidesProgress = true;
        s.container.addClass('swiper-container-3d');
    }
    else {
        s.params.effect = 'slide';
    }
}
if (s.params.effect !== 'slide') {
    s.container.addClass('swiper-container-' + s.params.effect);
}
if (s.params.effect === 'cube') {
    s.params.resistanceRatio = 0;
    s.params.slidesPerView = 1;
    s.params.slidesPerColumn = 1;
    s.params.slidesPerGroup = 1;
    s.params.centeredSlides = false;
    s.params.spaceBetween = 0;
}
if (s.params.effect === 'fade') {
    s.params.watchSlidesProgress = true;
    s.params.spaceBetween = 0;
}

// Grab Cursor
if (s.params.grabCursor && s.support.touch) {
    s.params.grabCursor = false;
}

// Wrapper
s.wrapper = s.container.children('.' + s.params.wrapperClass);

// Pagination
if (s.params.pagination) {
    s.paginationContainer = $(s.params.pagination);
    if (s.params.paginationClickable) {
        s.paginationContainer.addClass('swiper-pagination-clickable');
    }
}

// Is Horizontal
function isH() {
    return s.params.direction === 'horizontal';
}

// RTL
s.rtl = isH() && (s.container[0].dir.toLowerCase() === 'rtl' || s.container.css('direction') === 'rtl');
if (s.rtl) s.container.addClass('swiper-container-rtl');

// Wrong RTL support
if (s.rtl) {
    s.wrongRTL = s.wrapper.css('display') === '-webkit-box';
}

// Translate
s.translate = 0;

// Progress
s.progress = 0;

// Velocity
s.velocity = 0;

// Locks, unlocks
s.lockSwipeToNext = function () {
    s.params.allowSwipeToNext = false;
};
s.lockSwipeToPrev = function () {
    s.params.allowSwipeToPrev = false;
};
s.lockSwipes = function () {
    s.params.allowSwipeToNext = s.params.allowSwipeToPrev = false;
};
s.unlockSwipeToNext = function () {
    s.params.allowSwipeToNext = true;
};
s.unlockSwipeToPrev = function () {
    s.params.allowSwipeToPrev = true;
};
s.unlockSwipes = function () {
    s.params.allowSwipeToNext = s.params.allowSwipeToPrev = true;
};

// Columns
if (s.params.slidesPerColumn > 1) {
    s.container.addClass('swiper-container-multirow');
}


/*=========================
  Set grab cursor
  ===========================*/
if (s.params.grabCursor) {
    s.container[0].style.cursor = 'move';
    s.container[0].style.cursor = '-webkit-grab';
    s.container[0].style.cursor = '-moz-grab';
    s.container[0].style.cursor = 'grab';
}
/*=========================
  Update on Images Ready
  ===========================*/
s.imagesToLoad = [];
s.imagesLoaded = 0;

function loadImage(img) {
    var image, src;
    var onReady = function () {
        if (typeof s === 'undefined' || s === null) return;
        if (s.imagesLoaded !== undefined) s.imagesLoaded++;
        if (s.imagesLoaded === s.imagesToLoad.length) {
            s.update();
            if (s.params.onImagesReady) s.params.onImagesReady(s);
        }
    };

    if (!img.complete) {
        src = (img.currentSrc || img.getAttribute('src'));
        if (src) {
            image = new Image();
            image.onload = onReady;
            image.onerror = onReady;
            image.src = src;
        } else {
            onReady();
        }

    } else {//image already loaded...
        onReady();
    }
}
s.preloadImages = function () {
    s.imagesToLoad = s.container.find('img');

    for (var i = 0; i < s.imagesToLoad.length; i++) {
        loadImage(s.imagesToLoad[i]);
    }
};

/*=========================
  Autoplay
  ===========================*/
s.autoplayTimeoutId = undefined;
s.autoplaying = false;
s.autoplayPaused = false;
function autoplay() {
    s.autoplayTimeoutId = setTimeout(function () {
        if (s.params.loop) {
            s.fixLoop();
            s._slideNext();
        }
        else {
            if (!s.isEnd) {
                s._slideNext();
            }
            else {
                if (!params.autoplayStopOnLast) {
                    s._slideTo(0);
                }
                else {
                    s.stopAutoplay();
                }
            }
        }
    }, s.params.autoplay);
}
s.startAutoplay = function () {
    if (typeof s.autoplayTimeoutId !== 'undefined') return false;
    if (!s.params.autoplay) return false;
    if (s.autoplaying) return false;
    s.autoplaying = true;
    if (s.params.onAutoplayStart) s.params.onAutoplayStart(s);
    autoplay();
};
s.stopAutoplay = function (internal) {
    if (!s.autoplayTimeoutId) return;
    if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
    s.autoplaying = false;
    s.autoplayTimeoutId = undefined;
    if (s.params.onAutoplayStop) s.params.onAutoplayStop(s);
};
s.pauseAutoplay = function (speed) {
    if (s.autoplayPaused) return;
    if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
    s.autoplayPaused = true;
    if (speed === 0) {
        s.autoplayPaused = false;
        autoplay();
    }
    else {
        s.wrapper.transitionEnd(function () {
            s.autoplayPaused = false;
            if (!s.autoplaying) {
                s.stopAutoplay();
            }
            else {
                autoplay();
            }
        });
    }
};
/*=========================
  Min/Max Translate
  ===========================*/
s.minTranslate = function () {
    return (-s.snapGrid[0]);
};
s.maxTranslate = function () {
    return (-s.snapGrid[s.snapGrid.length - 1]);
};
/*=========================
  Slider/slides sizes
  ===========================*/
s.updateContainerSize = function () {
    s.width = s.container[0].clientWidth;
    s.height = s.container[0].clientHeight;
    s.size = isH() ? s.width : s.height;
};

s.updateSlidesSize = function () {
    s.slides = s.wrapper.children('.' + s.params.slideClass);
    s.snapGrid = [];
    s.slidesGrid = [];
    s.slidesSizesGrid = [];
    
    var spaceBetween = s.params.spaceBetween,
        slidePosition = 0,
        i,
        prevSlideSize = 0,
        index = 0;
    if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
        spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * s.size;
    }

    s.virtualWidth = -spaceBetween;
    // reset margins
    if (s.rtl) s.slides.css({marginLeft: '', marginTop: ''});
    else s.slides.css({marginRight: '', marginBottom: ''});

    var slidesNumberEvenToRows;
    if (s.params.slidesPerColumn > 1) {
        if (Math.floor(s.slides.length / s.params.slidesPerColumn) === s.slides.length / s.params.slidesPerColumn) {
            slidesNumberEvenToRows = s.slides.length;
        }
        else {
            slidesNumberEvenToRows = Math.ceil(s.slides.length / s.params.slidesPerColumn) * s.params.slidesPerColumn;
        }
    }

    // Calc slides
    var slideSize;
    for (i = 0; i < s.slides.length; i++) {
        slideSize = 0;
        var slide = s.slides.eq(i);
        if (s.params.slidesPerColumn > 1) {
            // Set slides order
            var newSlideOrderIndex;
            var column, row;
            var slidesPerColumn = s.params.slidesPerColumn;
            var slidesPerRow;
            if (s.params.slidesPerColumnFill === 'column') {
                column = Math.floor(i / slidesPerColumn);
                row = i - column * slidesPerColumn;
                newSlideOrderIndex = column + row * slidesNumberEvenToRows / slidesPerColumn;
                slide
                    .css({
                        '-webkit-box-ordinal-group': newSlideOrderIndex,
                        '-moz-box-ordinal-group': newSlideOrderIndex,
                        '-ms-flex-order': newSlideOrderIndex,
                        '-webkit-order': newSlideOrderIndex,
                        'order': newSlideOrderIndex
                    });
            }
            else {
                slidesPerRow = slidesNumberEvenToRows / slidesPerColumn;
                row = Math.floor(i / slidesPerRow);
                column = i - row * slidesPerRow;
                
            }
            slide
                .css({
                    'margin-top': (row !== 0 && s.params.spaceBetween) && (s.params.spaceBetween + 'px')
                })
                .attr('data-swiper-column', column)
                .attr('data-swiper-row', row);
                
        }
        if (slide.css('display') === 'none') continue;
        if (s.params.slidesPerView === 'auto') {
            slideSize = isH() ? slide.outerWidth(true) : slide.outerHeight(true);
        }
        else {
            slideSize = (s.size - (s.params.slidesPerView - 1) * spaceBetween) / s.params.slidesPerView;
            if (isH()) {
                s.slides[i].style.width = slideSize + 'px';
            }
            else {
                s.slides[i].style.height = slideSize + 'px';
            }
        }
        s.slides[i].swiperSlideSize = slideSize;
        s.slidesSizesGrid.push(slideSize);
        
        
        if (s.params.centeredSlides) {
            slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
            if (i === 0) slidePosition = slidePosition - s.size / 2 - spaceBetween;
            if (Math.abs(slidePosition) < 1 / 1000) slidePosition = 0;
            if ((index) % s.params.slidesPerGroup === 0) s.snapGrid.push(slidePosition);
            s.slidesGrid.push(slidePosition);
        }
        else {
            if ((index) % s.params.slidesPerGroup === 0) s.snapGrid.push(slidePosition);
            s.slidesGrid.push(slidePosition);
            slidePosition = slidePosition + slideSize + spaceBetween;
        }

        s.virtualWidth += slideSize + spaceBetween;

        prevSlideSize = slideSize;

        index ++;
    }
    s.virtualWidth = Math.max(s.virtualWidth, s.size);

    var newSlidesGrid;

    if (s.rtl && s.wrongRTL && (s.params.effect === 'slide' || s.params.effect === 'coverflow')) {
        s.wrapper.css({width: s.virtualWidth + s.params.spaceBetween + 'px'});
    }

    if (s.params.slidesPerColumn > 1) {
        s.virtualWidth = (slideSize + s.params.spaceBetween) * slidesNumberEvenToRows;
        s.virtualWidth = Math.ceil(s.virtualWidth / s.params.slidesPerColumn) - s.params.spaceBetween;
        s.wrapper.css({width: s.virtualWidth + s.params.spaceBetween + 'px'});
        if (s.params.centeredSlides) {
            newSlidesGrid = [];
            for (i = 0; i < s.snapGrid.length; i++) {
                if (s.snapGrid[i] < s.virtualWidth + s.snapGrid[0]) newSlidesGrid.push(s.snapGrid[i]);
            }
            s.snapGrid = newSlidesGrid;
        }
    }

    // Remove last grid elements depending on width
    if (!s.params.centeredSlides) {
        newSlidesGrid = [];
        for (i = 0; i < s.snapGrid.length; i++) {
            if (s.snapGrid[i] <= s.virtualWidth - s.size) {
                newSlidesGrid.push(s.snapGrid[i]);
            }
        }
        s.snapGrid = newSlidesGrid;
        if (Math.floor(s.virtualWidth - s.size) > Math.floor(s.snapGrid[s.snapGrid.length - 1])) {
            s.snapGrid.push(s.virtualWidth - s.size);
        }
    }
    if (s.snapGrid.length === 0) s.snapGrid = [0];
        
    if (s.params.spaceBetween !== 0) {
        if (isH()) {
            if (s.rtl) s.slides.css({marginLeft: spaceBetween + 'px'});
            else s.slides.css({marginRight: spaceBetween + 'px'});
        }
        else s.slides.css({marginBottom: spaceBetween + 'px'});
    }
    if (s.params.watchSlidesProgress) {
        s.updateSlidesOffset();
    }
};
s.updateSlidesOffset = function () {
    for (var i = 0; i < s.slides.length; i++) {
        s.slides[i].swiperSlideOffset = isH() ? s.slides[i].offsetLeft : s.slides[i].offsetTop;
    }
};

/*=========================
  Slider/slides progress
  ===========================*/
s.updateSlidesProgress = function (translate) {
    if (typeof translate === 'undefined') {
        translate = s.translate || 0;
    }
    if (s.slides.length === 0) return;
    if (typeof s.slides[0].swiperSlideOffset === 'undefined') s.updateSlidesOffset();

    var offsetCenter = s.params.centeredSlides ? -translate + s.size / 2 : -translate;
    if (s.rtl) offsetCenter = s.params.centeredSlides ? translate - s.size / 2 : translate;

    // Visible Slides
    var containerBox = s.container[0].getBoundingClientRect();
    var sideBefore = isH() ? 'left' : 'top';
    var sideAfter = isH() ? 'right' : 'bottom';
    s.slides.removeClass(s.params.slideVisibleClass);
    for (var i = 0; i < s.slides.length; i++) {
        var slide = s.slides[i];
        var slideCenterOffset = (s.params.centeredSlides === true) ? slide.swiperSlideSize / 2 : 0;
        var slideProgress = (offsetCenter - slide.swiperSlideOffset - slideCenterOffset) / (slide.swiperSlideSize + s.params.spaceBetween);
        if (s.params.watchVisibility) {
            var slideBefore = -(offsetCenter - slide.swiperSlideOffset - slideCenterOffset);
            var slideAfter = slideBefore + s.slidesSizesGrid[i];
            var isVisible =
                (slideBefore >= 0 && slideBefore < s.size) ||
                (slideAfter > 0 && slideAfter <= s.size) ||
                (slideBefore <= 0 && slideAfter >= s.size);
            if (isVisible) {
                s.slides.eq(i).addClass(s.params.slideVisibleClass);
            }
        }
        slide.progress = s.rtl ? -slideProgress : slideProgress;
    }
};
s.updateProgress = function (translate) {
    if (typeof translate === 'undefined') {
        translate = s.translate || 0;
    }
    var translatesDiff = s.maxTranslate() - s.minTranslate();
    if (translatesDiff === 0) {
        s.progress = 0;
        s.isBeginning = s.isEnd = true;
    }
    else {
        s.progress = (translate - s.minTranslate()) / (translatesDiff);
        s.isBeginning = s.progress <= 0;
        s.isEnd = s.progress >= 1;
    }
    if (s.isBeginning && s.params.onReachBeginning) s.params.onReachBeginning(s);
    if (s.isEnd && s.params.onReachEnd) s.params.onReachEnd(s);
    
    if (s.params.watchSlidesProgress) s.updateSlidesProgress(translate);
    if (s.params.onProgress) s.params.onProgress(s, s.progress);
};
s.updateActiveIndex = function () {
    var translate = s.rtl ? s.translate : -s.translate;
    var newActiveIndex, i, snapIndex;
    for (i = 0; i < s.slidesGrid.length; i ++) {
        if (typeof s.slidesGrid[i + 1] !== 'undefined') {
            if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1] - (s.slidesGrid[i + 1] - s.slidesGrid[i]) / 2) {
                newActiveIndex = i;
            }
            else if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1]) {
                newActiveIndex = i + 1;
            }
        }
        else {
            if (translate >= s.slidesGrid[i]) {
                newActiveIndex = i;
            }
        }
    }
    // Normalize slideIndex
    if (newActiveIndex < 0 || typeof newActiveIndex === 'undefined') newActiveIndex = 0;
    // for (i = 0; i < s.slidesGrid.length; i++) {
        // if (- translate >= s.slidesGrid[i]) {
            // newActiveIndex = i;
        // }
    // }
    snapIndex = Math.floor(newActiveIndex / s.params.slidesPerGroup);
    if (snapIndex >= s.snapGrid.length) snapIndex = s.snapGrid.length - 1;

    if (newActiveIndex === s.activeIndex) {
        return;
    }
    s.snapIndex = snapIndex;
    s.previousIndex = s.activeIndex;
    s.activeIndex = newActiveIndex;
    s.updateClasses();
};

/*=========================
  Classes
  ===========================*/
s.updateClasses = function () {
    s.slides.removeClass(s.params.slideActiveClass + ' ' + s.params.slideNextClass + ' ' + s.params.slidePrevClass);
    var activeSlide = s.slides.eq(s.activeIndex);
    // Active classes
    activeSlide.addClass(s.params.slideActiveClass);
    activeSlide.next('.' + s.params.slideClass).addClass(s.params.slideNextClass);
    activeSlide.prev('.' + s.params.slideClass).addClass(s.params.slidePrevClass);

    // Pagination
    if (s.bullets && s.bullets.length > 0) {
        s.bullets.removeClass(s.params.bulletActiveClass);
        var bulletIndex;
        if (s.params.loop) {
            bulletIndex = s.activeIndex - s.loopedSlides;
            if (bulletIndex > s.slides.length - 1 - s.loopedSlides * 2) {
                bulletIndex = bulletIndex - (s.slides.length - s.loopedSlides * 2);
            }
        }
        else {
            if (typeof s.snapIndex !== 'undefined') {
                bulletIndex = s.snapIndex;
            }
            else {
                bulletIndex = s.activeIndex || 0;
            }
        }
        s.bullets.eq(bulletIndex).addClass(s.params.bulletActiveClass);
    }

    // Next/active buttons
    if (!s.params.loop) {
        if (s.params.prevButton) {
            if (s.isBeginning) $(s.params.prevButton).addClass(s.params.buttonDisabledClass);
            else $(s.params.prevButton).removeClass(s.params.buttonDisabledClass);
        }
        if (s.params.nextButton) {
            if (s.isEnd) $(s.params.nextButton).addClass(s.params.buttonDisabledClass);
            else $(s.params.nextButton).removeClass(s.params.buttonDisabledClass);
        }
    }
};

/*=========================
  Pagination
  ===========================*/
s.updatePagination = function () {
    if (!s.params.pagination) return;
    if (s.paginationContainer && s.paginationContainer.length > 0) {
        var bulletsHTML = '';
        var numberOfBullets = s.params.loop ? s.slides.length - s.loopedSlides * 2 : s.snapGrid.length;
        for (var i = 0; i < numberOfBullets; i++) {
            bulletsHTML += '<span class="' + s.params.bulletClass + '"></span>';
        }
        s.paginationContainer.html(bulletsHTML);
        s.bullets = s.paginationContainer.find('.' + s.params.bulletClass);
    }
};
/*=========================
  Common update method
  ===========================*/
s.update = function (updateTranslate) {
    s.updateContainerSize();
    s.updateSlidesSize();
    s.updateProgress();
    s.updatePagination();
    s.updateClasses();
    if (s.params.scrollbar && s.scrollbar) {
        s.scrollbar.set();
    }
    function forceSetTranslate() {
        newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
        s.setWrapperTranslate(newTranslate);
        s.updateActiveIndex();
        s.updateClasses();
    }
    if (updateTranslate) {
        var translated, newTranslate;
        if (s.params.freeMode) {
            forceSetTranslate();
        }
        else {
            if (s.params.slidesPerView === 'auto' && s.isEnd && !s.params.centeredSlides) {
                translated = s.slideTo(s.slides.length - 1, 0, false, true);
            }
            else {
                translated = s.slideTo(s.activeIndex, 0, false, true);
            }
            if (!translated) {
                forceSetTranslate();
            }
        }
            
    }
};

/*=========================
  Resize Handler
  ===========================*/
s.onResize = function () {
    s.updateContainerSize();
    s.updateSlidesSize();
    s.updateProgress();
    if (s.params.slidesPerView === 'auto' || s.params.freeMode) s.updatePagination();
    if (s.params.scrollbar && s.scrollbar) {
        s.scrollbar.set();
    }
    if (s.params.freeMode) {
        var newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
        s.setWrapperTranslate(newTranslate);
        s.updateActiveIndex();
        s.updateClasses();
    }
    else {
        s.updateClasses();
        if (s.params.slidesPerView === 'auto' && s.isEnd && !s.params.centeredSlides) {
            s.slideTo(s.slides.length - 1, 0, false, true);
        }
        else {
            s.slideTo(s.activeIndex, 0, false, true);
        }
    }
        
};

/*=========================
  Events
  ===========================*/

//Define Touch Events
var desktopEvents = ['mousedown', 'mousemove', 'mouseup'];
if (window.navigator.pointerEnabled) desktopEvents = ['pointerdown', 'pointermove', 'pointerup'];
else if (window.navigator.msPointerEnabled) desktopEvents = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp'];
s.touchEvents = {
    start : s.support.touch || !s.params.simulateTouch  ? 'touchstart' : desktopEvents[0],
    move : s.support.touch || !s.params.simulateTouch ? 'touchmove' : desktopEvents[1],
    end : s.support.touch || !s.params.simulateTouch ? 'touchend' : desktopEvents[2]
};
    

// WP8 Touch Events Fix
if (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) {
    (s.params.touchEventsTarget === 'container' ? s.container : s.wrapper).addClass('swiper-wp8-' + s.params.direction);
}

// Attach/detach events
s.events = function (detach) {
    var actionDom = detach ? 'off' : 'on';
    var action = detach ? 'removeEventListener' : 'addEventListener';
    var touchEventsTarget = s.params.touchEventsTarget === 'container' ? s.container[0] : s.wrapper[0];
    var target = s.support.touch ? touchEventsTarget : document;

    var moveCapture = s.params.nested ? true : false;

    //Touch Events
    if (s.browser.ie) {
        touchEventsTarget[action](s.touchEvents.start, s.onTouchStart, false);
        target[action](s.touchEvents.move, s.onTouchMove, moveCapture);
        target[action](s.touchEvents.end, s.onTouchEnd, false);
    }
    else {
        if (s.support.touch) {
            touchEventsTarget[action](s.touchEvents.start, s.onTouchStart, false);
            touchEventsTarget[action](s.touchEvents.move, s.onTouchMove, moveCapture);
            touchEventsTarget[action](s.touchEvents.end, s.onTouchEnd, false);
        }
        if (params.simulateTouch && !s.device.ios && !s.device.android) {
            touchEventsTarget[action]('mousedown', s.onTouchStart, false);
            target[action]('mousemove', s.onTouchMove, moveCapture);
            target[action]('mouseup', s.onTouchEnd, false);
        }
    }
    window[action]('resize', s.onResize);

    // Next, Prev, Index
    if (s.params.nextButton) $(s.params.nextButton)[actionDom]('click', s.onClickNext);
    if (s.params.prevButton) $(s.params.prevButton)[actionDom]('click', s.onClickPrev);
    if (s.params.pagination && s.params.paginationClickable) {
        $(s.paginationContainer)[actionDom]('click', '.' + s.params.bulletClass, s.onClickIndex);
    }

    // Prevent Links Clicks
    if (s.params.preventClicks || s.params.preventClicksPropagation) touchEventsTarget[action]('click', s.preventClicks, true);
};
s.attachEvents = function (detach) {
    s.events();
};
s.detachEvents = function () {
    s.events(true);
};

/*=========================
  Handle Clicks
  ===========================*/
// Prevent Clicks
s.allowClick = true;
s.preventClicks = function (e) {
    if (!s.allowClick) {
        if (s.params.preventClicks) e.preventDefault();
        if (s.params.preventClicksPropagation) {
            e.stopPropagation();
            e.stopImmediatePropagation();
        }
    }
};
// Clicks
s.onClickNext = function (e) {
    e.preventDefault();
    s.slideNext();
};
s.onClickPrev = function (e) {
    e.preventDefault();
    s.slidePrev();
};
s.onClickIndex = function (e) {
    e.preventDefault();
    var index = $(this).index() * s.params.slidesPerGroup;
    if (s.params.loop) index = index + s.loopedSlides;
    s.slideTo(index);
};

/*=========================
  Handle Touches
  ===========================*/
function findElementInEvent(e, selector) {
    var el = $(e.target);
    if (!el.is(selector)) {
        if (typeof selector === 'string') {
            el = el.parents(selector);
        }
        else if (selector.nodeType) {
            var found;
            el.parents().each(function (index, _el) {
                if (_el === selector) found = selector;
            });
            if (!found) return undefined;
            else return selector;
        }
    }
    if (el.length === 0) {
        return undefined;
    }
    return el[0];
}
s.updateClickedSlide = function (e) {
    var slide = findElementInEvent(e, '.' + s.params.slideClass);
    if (slide) {
        s.clickedSlide = slide;
        s.clickedIndex = $(slide).index();
    }
    else {
        s.clickedSlide = undefined;
        s.clickedIndex = undefined;
        return;
    }
    if (s.params.slideToClickedSlide && s.clickedIndex !== undefined && s.clickedIndex !== s.activeIndex) {
        var slideToIndex = s.clickedIndex,
            realIndex;
        if (s.params.loop) {
            realIndex = $(s.clickedSlide).attr('data-swiper-slide-index');
            if (slideToIndex > s.slides.length - s.params.slidesPerView) {
                s.fixLoop();
                slideToIndex = s.wrapper.children('.' + s.params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]').eq(0).index();
                setTimeout(function () {
                    s.slideTo(slideToIndex);
                }, 0);
            }
            else if (slideToIndex < s.params.slidesPerView - 1) {
                s.fixLoop();
                var duplicatedSlides = s.wrapper.children('.' + s.params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]');
                slideToIndex = duplicatedSlides.eq(duplicatedSlides.length - 1).index();
                setTimeout(function () {
                    s.slideTo(slideToIndex);
                }, 0);
            }
            else {
                s.slideTo(slideToIndex);
            }
        }
        else {
            s.slideTo(slideToIndex);
        }
    }
};

var isTouched, 
    isMoved, 
    touchStartTime, 
    isScrolling, 
    currentTranslate, 
    startTranslate, 
    allowThresholdMove,
    // Form elements to match
    formElements = 'input, select, textarea, button',
    // Last click time
    lastClickTime = Date.now(), clickTimeout,
    //Velocities
    velocities = [], 
    allowMomentumBounce;

// Animating Flag
s.animating = false;

// Touches information
s.touches = {
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    diff: 0
};

// Touch handlers
var isTouchEvent;
s.onTouchStart = function (e) {
    if (e.originalEvent) e = e.originalEvent;
    isTouchEvent = e.type === 'touchstart';
    if (!isTouchEvent && 'which' in e && e.which === 3) return;
    if (s.params.noSwiping && findElementInEvent(e, '.' + s.params.noSwipingClass)) {
        s.allowClick = true;
        return;
    }
    if (s.params.swipeHandler) {
        if (!findElementInEvent(e, s.params.swipeHandler)) return;
    }
    isTouched = true;
    isMoved = false;
    isScrolling = undefined;
    s.touches.startX = s.touches.currentX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
    s.touches.startY = s.touches.currentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
    touchStartTime = Date.now();
    s.allowClick = true;
    s.updateContainerSize();
    s.swipeDirection = undefined;
    if (s.params.threshold > 0) allowThresholdMove = false;
    if (e.type !== 'touchstart') {
        var preventDefault = true;
        if ($(e.target).is(formElements)) preventDefault = false;
        if (document.activeElement && $(document.activeElement).is(formElements)) document.activeElement.blur();
        if (preventDefault) {
            e.preventDefault();
        }
    }
    if (s.params.onTouchStart) s.params.onTouchStart(s, e);
};

s.onTouchMove = function (e) {
    if (e.originalEvent) e = e.originalEvent;
    if (isTouchEvent && e.type === 'mousemove') return;
    if (e.preventedByNestedSwiper) return;
    if (s.params.onlyExternal) {
        isMoved = true;
        s.allowClick = false;
        return;
    }
    if (s.params.onTouchMove) s.params.onTouchMove(s, e);
    s.allowClick = false;
    if (e.targetTouches && e.targetTouches.length > 1) return;
    
    s.touches.currentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
    s.touches.currentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

    if (typeof isScrolling === 'undefined') {
        var touchAngle = Math.atan2(Math.abs(s.touches.currentY - s.touches.startY), Math.abs(s.touches.currentX - s.touches.startX)) * 180 / Math.PI;
        isScrolling = isH() ? touchAngle > s.params.touchAngle : (90 - touchAngle > s.params.touchAngle);
        // isScrolling = !!(isScrolling || Math.abs(touchesCurrent.y - touchesStart.y) > Math.abs(touchesCurrent.x - touchesStart.x));
    }
    if (isScrolling && s.params.onTouchMoveOpposite) {
        s.params.onTouchMoveOpposite(s, e);
    }
    if (!isTouched) return;
    if (isScrolling)  {
        isTouched = false;
        return;
    }
    if (s.params.onSliderMove) s.params.onSliderMove(s, e);

    e.preventDefault();
    if (s.params.touchMoveStopPropagation && !s.params.nested) {
        e.stopPropagation();
    }

    if (!isMoved) {
        if (params.loop) {
            s.fixLoop();
        }
        startTranslate = s.params.effect === 'cube' ? ((s.rtl ? -s.translate: s.translate) || 0) : s.getWrapperTranslate();
        s.setWrapperTransition(0);
        if (s.animating) {
            s.wrapper.trigger('webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd');
        }
        if (s.params.autoplay && s.autoplaying) {
            if (s.params.autoplayDisableOnInteraction) {
                s.stopAutoplay();
            }
            else {
                s.pauseAutoplay();
            }
        }
        allowMomentumBounce = false;
        //Grab Cursor
        if (s.params.grabCursor) {
            s.container[0].style.cursor = 'move';
            s.container[0].style.cursor = '-webkit-grabbing';
            s.container[0].style.cursor = '-moz-grabbin';
            s.container[0].style.cursor = 'grabbing';
        }
    }
    isMoved = true;

    var diff = s.touches.diff = isH() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;

    diff = diff * s.params.touchRatio;
    if (s.rtl) diff = -diff;

    s.swipeDirection = diff > 0 ? 'prev' : 'next';
    currentTranslate = diff + startTranslate;

    var disableParentSwiper = true;
    if ((diff > 0 && currentTranslate > s.minTranslate())) {
        disableParentSwiper = false;
        if (s.params.resistance) currentTranslate = s.minTranslate() - 1 + Math.pow(-s.minTranslate() + startTranslate + diff, s.params.resistanceRatio);
    }
    else if (diff < 0 && currentTranslate < s.maxTranslate()) {
        disableParentSwiper = false;
        if (s.params.resistance) currentTranslate = s.maxTranslate() + 1 - Math.pow(s.maxTranslate() - startTranslate - diff, s.params.resistanceRatio);
    }
    
    if (disableParentSwiper) {
        e.preventedByNestedSwiper = true;
    }

    // Directions locks
    if (!s.params.allowSwipeToNext && s.swipeDirection === 'next' && currentTranslate < startTranslate) {
        currentTranslate = startTranslate;
    }
    if (!s.params.allowSwipeToPrev && s.swipeDirection === 'prev' && currentTranslate > startTranslate) {
        currentTranslate = startTranslate;
    }
    
    if (!s.params.followFinger) return;

    // Threshold
    if (s.params.threshold > 0) {
        if (Math.abs(diff) > s.params.threshold || allowThresholdMove) {
            if (!allowThresholdMove) {
                allowThresholdMove = true;
                s.touches.startX = s.touches.currentX;
                s.touches.startY = s.touches.currentY;
                currentTranslate = startTranslate;
                s.touches.diff = isH() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;
                return;
            }
        }
        else {
            currentTranslate = startTranslate;
            return;
        }
    }
    // Update active index in free mode
    if (s.params.freeMode || s.params.watchSlidesProgress) {
        s.updateActiveIndex();
    }
    if (s.params.freeMode) {
        //Velocity
        if (velocities.length === 0) {
            velocities.push({
                position: s.touches[isH() ? 'startX' : 'startY'],
                time: touchStartTime
            });
        }
        velocities.push({
            position: s.touches[isH() ? 'currentX' : 'currentY'],
            time: (new Date()).getTime()
        });
    }
    // Update progress
    s.updateProgress(currentTranslate);
    // Update translate
    s.setWrapperTranslate(currentTranslate);
};
s.onTouchEnd = function (e) {
    if (e.originalEvent) e = e.originalEvent;
    if (s.params.onTouchEnd) s.params.onTouchEnd(s, e);
    if (!isTouched) return;

    //Return Grab Cursor
    if (s.params.grabCursor && isMoved && isTouched) {
        s.container[0].style.cursor = 'move';
        s.container[0].style.cursor = '-webkit-grab';
        s.container[0].style.cursor = '-moz-grab';
        s.container[0].style.cursor = 'grab';
    }

    // Time diff
    var touchEndTime = Date.now();
    var timeDiff = touchEndTime - touchStartTime;

    // Tap, doubleTap, Click
    if (s.allowClick) {
        s.updateClickedSlide(e);
        if (s.params.onTap) s.params.onTap(s, e);
        if (timeDiff < 300 && (touchEndTime - lastClickTime) > 300) {
            if (clickTimeout) clearTimeout(clickTimeout);
            clickTimeout = setTimeout(function () {
                if (!s) return;
                if (s.params.paginationHide && s.paginationContainer.length > 0 && !$(e.target).hasClass(s.params.bulletClass)) {
                    s.paginationContainer.toggleClass(s.params.paginationHiddenClass);
                }
                if (s.params.onClick) s.params.onClick(s, e);
            }, 300);
            
        }
        if (timeDiff < 300 && (touchEndTime - lastClickTime) < 300) {
            if (clickTimeout) clearTimeout(clickTimeout);
            if (s.params.onDoubleTap) {
                s.params.onDoubleTap(s, e);
            }
        }
    }

    lastClickTime = Date.now();
    setTimeout(function () {
        if (s && s.allowClick) s.allowClick = true;
    }, 0);

    if (!isTouched || !isMoved || !s.swipeDirection || s.touches.diff === 0 || currentTranslate === startTranslate) {
        isTouched = isMoved = false;
        return;
    }
    isTouched = isMoved = false;

    var currentPos;
    if (s.params.followFinger) {
        currentPos = s.rtl ? s.translate : -s.translate;
    }
    else {
        currentPos = -currentTranslate;
    }
    if (s.params.freeMode) {
        if (currentPos < -s.minTranslate()) {
            s.slideTo(s.activeIndex);
            return;
        }
        else if (currentPos > -s.maxTranslate()) {
            s.slideTo(s.slides.length - 1);
            return;
        }
        
        if (s.params.freeModeMomentum) {
            if (velocities.length > 1) {
                var lastMoveEvent = velocities.pop(), velocityEvent = velocities.pop();

                var distance = lastMoveEvent.position - velocityEvent.position;
                var time = lastMoveEvent.time - velocityEvent.time;
                s.velocity = distance / time;
                s.velocity = s.velocity / 2;
                if (Math.abs(s.velocity) < 0.02) {
                    s.velocity = 0;
                }
                // this implies that the user stopped moving a finger then released.
                // There would be no events with distance zero, so the last event is stale.
                if (time > 150 || (new Date().getTime() - lastMoveEvent.time) > 300) {
                    s.velocity = 0;
                }
            } else {
                s.velocity = 0;
            }

            velocities.length = 0;
            var momentumDuration = 1000 * s.params.freeModeMomentumRatio;
            var momentumDistance = s.velocity * momentumDuration;

            var newPosition = s.translate + momentumDistance;
            if (s.rtl) newPosition = - newPosition;
            var doBounce = false;
            var afterBouncePosition;
            var bounceAmount = Math.abs(s.velocity) * 20 * s.params.freeModeMomentumBounceRatio;
            if (newPosition < s.maxTranslate()) {
                if (s.params.freeModeMomentumBounce) {
                    if (newPosition + s.maxTranslate() < -bounceAmount) {
                        newPosition = s.maxTranslate() - bounceAmount;
                    }
                    afterBouncePosition = s.maxTranslate();
                    doBounce = true;
                    allowMomentumBounce = true;
                }
                else {
                    newPosition = s.maxTranslate();
                }
            }
            if (newPosition > s.minTranslate()) {
                if (s.params.freeModeMomentumBounce) {
                    if (newPosition - s.minTranslate() > bounceAmount) {
                        newPosition = s.minTranslate() + bounceAmount;
                    }
                    afterBouncePosition = s.minTranslate();
                    doBounce = true;
                    allowMomentumBounce = true;
                }
                else {
                    newPosition = s.minTranslate();
                }
            }
            //Fix duration
            if (s.velocity !== 0) {
                if (s.rtl) {
                    momentumDuration = Math.abs((-newPosition - s.translate) / s.velocity);
                }
                else {
                    momentumDuration = Math.abs((newPosition - s.translate) / s.velocity);
                }
            }

            if (s.params.freeModeMomentumBounce && doBounce) {
                s.updateProgress(afterBouncePosition);
                s.setWrapperTransition(momentumDuration);
                s.setWrapperTranslate(newPosition);
                s.onTransitionStart();
                s.animating = true;
                s.wrapper.transitionEnd(function () {
                    if (!allowMomentumBounce) return;
                    if (s.params.onMomentumBounce) s.params.onMomentumBounce(s);

                    s.setWrapperTransition(s.params.speed);
                    s.setWrapperTranslate(afterBouncePosition);
                    s.wrapper.transitionEnd(function () {
                        s.onTransitionEnd();
                    });
                });
            } else if (s.velocity) {
                s.updateProgress(newPosition);
                s.setWrapperTransition(momentumDuration);
                s.setWrapperTranslate(newPosition);
                s.onTransitionStart();
                if (!s.animating) {
                    s.animating = true;
                    s.wrapper.transitionEnd(function () {
                        s.onTransitionEnd();
                    });
                }
                    
            } else {
                s.updateProgress(newPosition);
            }
            
            s.updateActiveIndex();
        }
        if (!s.params.freeModeMomentum || timeDiff >= s.params.longSwipesMs) {
            s.updateProgress();
            s.updateActiveIndex();
        }
        return;
    }

    // Find current slide
    var i, stopIndex = 0, groupSize = s.slidesSizesGrid[0];
    for (i = 0; i < s.slidesGrid.length; i += s.params.slidesPerGroup) {
        if (typeof s.slidesGrid[i + s.params.slidesPerGroup] !== 'undefined') {
            if (currentPos >= s.slidesGrid[i] && currentPos < s.slidesGrid[i + s.params.slidesPerGroup]) {
                stopIndex = i;
                groupSize = s.slidesGrid[i + s.params.slidesPerGroup] - s.slidesGrid[i];
            }
        }
        else {
            if (currentPos >= s.slidesGrid[i]) {
                stopIndex = i;
                groupSize = s.slidesGrid[s.slidesGrid.length - 1] - s.slidesGrid[s.slidesGrid.length - 2];
            }
        }
    }

    // Find current slide size
    var ratio = (currentPos - s.slidesGrid[stopIndex]) / groupSize;
    
    if (timeDiff > s.params.longSwipesMs) {
        // Long touches
        if (!s.params.longSwipes) {
            s.slideTo(s.activeIndex);
            return;
        }
        if (s.swipeDirection === 'next') {
            if (ratio >= s.params.longSwipesRatio) s.slideTo(stopIndex + s.params.slidesPerGroup);
            else s.slideTo(stopIndex);

        }
        if (s.swipeDirection === 'prev') {
            if (ratio > (1 - s.params.longSwipesRatio)) s.slideTo(stopIndex + s.params.slidesPerGroup);
            else s.slideTo(stopIndex);
        }
    }
    else {
        // Short swipes
        if (!s.params.shortSwipes) {
            s.slideTo(s.activeIndex);
            return;
        }
        if (s.swipeDirection === 'next') {
            s.slideTo(stopIndex + s.params.slidesPerGroup);

        }
        if (s.swipeDirection === 'prev') {
            s.slideTo(stopIndex);
        }
    }
};
/*=========================
  Transitions
  ===========================*/
s._slideTo = function (slideIndex, speed) {
    return s.slideTo(slideIndex, speed, true, true);
};
s.slideTo = function (slideIndex, speed, runCallbacks, internal) {
    if (typeof runCallbacks === 'undefined') runCallbacks = true;
    if (typeof slideIndex === 'undefined') slideIndex = 0;
    if (slideIndex < 0) slideIndex = 0;
    s.snapIndex = Math.floor(slideIndex / s.params.slidesPerGroup);
    if (s.snapIndex >= s.snapGrid.length) s.snapIndex = s.snapGrid.length - 1;
    
    var translate = - s.snapGrid[s.snapIndex];

    // Stop autoplay

    if (s.params.autoplay && s.autoplaying) {
        if (internal || !s.params.autoplayDisableOnInteraction) {
            s.pauseAutoplay(speed);
        }
        else {
            s.stopAutoplay();
        }
    }
    // Update progress
    s.updateProgress(translate);

    // Normalize slideIndex
    for (var i = 0; i < s.slidesGrid.length; i++) {
        if (- translate >= s.slidesGrid[i]) {
            slideIndex = i;
        }
    }

    if (typeof speed === 'undefined') speed = s.params.speed;
    s.previousIndex = s.activeIndex || 0;
    s.activeIndex = slideIndex;
    
    if (translate === s.translate) {
        s.updateClasses();
        return false;
    }
    s.onTransitionStart(runCallbacks);
    var translateX = isH() ? translate : 0, translateY = isH() ? 0 : translate;
    if (speed === 0) {
        s.setWrapperTransition(0);
        s.setWrapperTranslate(translate);
        s.onTransitionEnd(runCallbacks);
    }
    else {
        s.setWrapperTransition(speed);
        s.setWrapperTranslate(translate);
        if (!s.animating) {
            s.animating = true;
            s.wrapper.transitionEnd(function () {
                s.onTransitionEnd(runCallbacks);
            });
        }
            
    }
    s.updateClasses();
    return true;
};

s.onTransitionStart = function (runCallbacks) {
    if (typeof runCallbacks === 'undefined') runCallbacks = true;
    if (runCallbacks) {
        if (s.params.onTransitionStart) s.params.onTransitionStart(s);
        if (s.params.onSlideChangeStart && s.activeIndex !== s.previousIndex) s.params.onSlideChangeStart(s);
    }
};
s.onTransitionEnd = function (runCallbacks) {
    s.animating = false;
    s.setWrapperTransition(0);
    if (typeof runCallbacks === 'undefined') runCallbacks = true;
    if (runCallbacks) {
        if (s.params.onTransitionEnd) s.params.onTransitionEnd(s);
        if (s.params.onSlideChangeEnd && s.activeIndex !== s.previousIndex) s.params.onSlideChangeEnd(s);
    }
        
};
s.slideNext = function (runCallbacks, speed, internal) {
    if (s.params.loop) {
        if (s.animating) return false;
        s.fixLoop();
        var clientLeft = s.container[0].clientLeft;
        return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
    }
    else return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
};
s._slideNext = function (speed) {
    return s.slideNext(true, speed, true);
};
s.slidePrev = function (runCallbacks, speed, internal) {
    if (s.params.loop) {
        if (s.animating) return false;
        s.fixLoop();
        var clientLeft = s.container[0].clientLeft;
        return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
    }
    else return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
};
s._slidePrev = function (speed) {
    return s.slidePrev(true, speed, true);
};
s.slideReset = function (runCallbacks, speed, internal) {
    return s.slideTo(s.activeIndex, speed, runCallbacks);
};

/*=========================
  Translate/transition helpers
  ===========================*/
s.setWrapperTransition = function (duration, byController) {
    s.wrapper.transition(duration);
    if (s.params.onSetTransition) s.params.onSetTransition(s, duration);
    if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
        s.effects[s.params.effect].setTransition(duration);
    }
    if (s.params.parallax && s.parallax) {
        s.parallax.setTransition(duration);
    }
    if (s.params.scrollbar && s.scrollbar) {
        s.scrollbar.setTransition(duration);
    }
    if (s.params.control && s.controller) {
        s.controller.setTransition(duration, byController);
    }
};
s.setWrapperTranslate = function (translate, updateActiveIndex, byController) {
    var x = 0, y = 0, z = 0;
    if (isH()) {
        x = s.rtl ? -translate : translate;
    }
    else {
        y = translate;
    }
    
    if (s.support.transforms3d) s.wrapper.transform('translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)');
    else s.wrapper.transform('translate(' + x + 'px, ' + y + 'px)');
    s.translate = isH() ? x : y;
    if (updateActiveIndex) s.updateActiveIndex();
    if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
        s.effects[s.params.effect].setTranslate(s.translate);
    }
    if (s.params.parallax && s.parallax) {
        s.parallax.setTranslate(s.translate);
    }
    if (s.params.scrollbar && s.scrollbar) {
        s.scrollbar.setTranslate(s.translate);
    }
    if (s.params.control && s.controller) {
        s.controller.setTranslate(s.translate, byController);
    }
    if (s.params.hashnav && s.hashnav) {
        s.hashnav.setHash();
    }
    if (s.params.onSetTranslate) s.params.onSetTranslate(s, s.translate);
};

s.getTranslate = function (el, axis) {
    var matrix, curTransform, curStyle, transformMatrix;

    // automatic axis detection
    if (typeof axis === 'undefined') {
        axis = 'x';
    }

    curStyle = window.getComputedStyle(el, null);
    if (window.WebKitCSSMatrix) {
        // Some old versions of Webkit choke when 'none' is passed; pass
        // empty string instead in this case
        transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
    }
    else {
        transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
        matrix = transformMatrix.toString().split(',');
    }

    if (axis === 'x') {
        //Latest Chrome and webkits Fix
        if (window.WebKitCSSMatrix)
            curTransform = transformMatrix.m41;
        //Crazy IE10 Matrix
        else if (matrix.length === 16)
            curTransform = parseFloat(matrix[12]);
        //Normal Browsers
        else
            curTransform = parseFloat(matrix[4]);
    }
    if (axis === 'y') {
        //Latest Chrome and webkits Fix
        if (window.WebKitCSSMatrix)
            curTransform = transformMatrix.m42;
        //Crazy IE10 Matrix
        else if (matrix.length === 16)
            curTransform = parseFloat(matrix[13]);
        //Normal Browsers
        else
            curTransform = parseFloat(matrix[5]);
    }
    if (s.rtl && curTransform) curTransform = -curTransform;
    return curTransform || 0;
};
s.getWrapperTranslate = function (axis) {
    if (typeof axis === 'undefined') {
        axis = isH() ? 'x' : 'y';
    }
    return s.getTranslate(s.wrapper[0], axis);
};

/*=========================
  Observer
  ===========================*/
s.observers = [];
function initObserver(target, options) {
    options = options || {};
    // create an observer instance
    var ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
    var observer = new ObserverFunc(function (mutations) {
        mutations.forEach(function (mutation) {
            s.onResize();
        });
    });
     
    observer.observe(target, {
        attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
        childList: typeof options.childList === 'undefined' ? true : options.childList,
        characterData: typeof options.characterData === 'undefined' ? true : options.characterData
    });

    s.observers.push(observer);
}
s.initObservers = function () {
    if (s.params.observeParents) {
        var containerParents = s.container.parents();
        for (var i = 0; i < containerParents.length; i++) {
            initObserver(containerParents[i]);
        }
    }

    // Observe container
    initObserver(s.container[0], {childList: false});

    // Observe wrapper
    initObserver(s.wrapper[0], {attributes: false});
};
s.disconnectObservers = function () {
    for (var i = 0; i < s.observers.length; i++) {
        s.observers[i].disconnect();
    }
    s.observers = [];
};
/*=========================
  Loop
  ===========================*/
// Create looped slides
s.createLoop = function () {
    // Remove duplicated slides
    s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass).remove();

    var slides = s.wrapper.children('.' + s.params.slideClass);
    s.loopedSlides = parseInt(s.params.loopedSlides || s.params.slidesPerView, 10);
    s.loopedSlides = s.loopedSlides + s.params.loopAdditionalSlides;
    if (s.loopedSlides > slides.length) {
        s.loopedSlides = slides.length;
    }

    var prependSlides = [], appendSlides = [], i;
    slides.each(function (index, el) {
        var slide = $(this);
        if (index < s.loopedSlides) appendSlides.push(el);
        if (index < slides.length && index >= slides.length - s.loopedSlides) prependSlides.push(el);
        slide.attr('data-swiper-slide-index', index);
    });
    for (i = 0; i < appendSlides.length; i++) {
        s.wrapper.append($(appendSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
    }
    for (i = prependSlides.length - 1; i >= 0; i--) {
        s.wrapper.prepend($(prependSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
    }
};
s.destroyLoop = function () {
    s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass).remove();
};
s.fixLoop = function () {
    var newIndex;
    //Fix For Negative Oversliding
    if (s.activeIndex < s.loopedSlides) {
        newIndex = s.slides.length - s.loopedSlides * 3 + s.activeIndex;
        newIndex = newIndex + s.loopedSlides;
        s.slideTo(newIndex, 0, false, true);
    }
    //Fix For Positive Oversliding
    else if ((s.params.slidesPerView === 'auto' && s.activeIndex >= s.loopedSlides * 2) || (s.activeIndex > s.slides.length - s.params.slidesPerView * 2)) {
        newIndex = -s.slides.length + s.activeIndex + s.loopedSlides;
        newIndex = newIndex + s.loopedSlides;
        s.slideTo(newIndex, 0, false, true);
    }
};
/*=========================
  Append/Prepend/Remove Slides
  ===========================*/
s.appendSlide = function (slides) {
    if (s.params.loop) {
        s.destroyLoop();
    }
    if (typeof slides === 'object' && slides.length) {
        for (var i = 0; i < slides.length; i++) {
            if (slides[i]) s.wrapper.append(slides[i]);
        }
    }
    else {
        s.wrapper.append(slides);
    }
    if (s.params.loop) {
        s.createLoop();
    }
    if (!(s.params.observer && s.support.observer)) {
        s.update(true);
    }
};
s.prependSlide = function (slides) {
    if (s.params.loop) {
        s.destroyLoop();
    }
    var newActiveIndex = s.activeIndex + 1;
    if (typeof slides === 'object' && slides.length) {
        for (var i = 0; i < slides.length; i++) {
            if (slides[i]) s.wrapper.prepend(slides[i]);
        }
        newActiveIndex = s.activeIndex + slides.length;
    }
    else {
        s.wrapper.prepend(slides);
    }
    if (s.params.loop) {
        s.createLoop();
    }
    if (!(s.params.observer && s.support.observer)) {
        s.update(true);
    }
    s.slideTo(newActiveIndex, 0, false);
};
s.removeSlide = function (slidesIndexes) {
    if (s.params.loop) {
        s.destroyLoop();
    }
    var newActiveIndex = s.activeIndex,
        indexToRemove;
    if (typeof slidesIndexes === 'object' && slidesIndexes.length) {
        for (var i = 0; i < slidesIndexes.length; i++) {
            indexToRemove = slidesIndexes[i];
            if (s.slides[indexToRemove]) s.slides.eq(indexToRemove).remove();
            if (indexToRemove < newActiveIndex) newActiveIndex--;
        }
        newActiveIndex = Math.max(newActiveIndex, 0);
    }
    else {
        indexToRemove = slidesIndexes;
        if (s.slides[indexToRemove]) s.slides.eq(indexToRemove).remove();
        if (indexToRemove < newActiveIndex) newActiveIndex--;
        newActiveIndex = Math.max(newActiveIndex, 0);
    }

    if (!(s.params.observer && s.support.observer)) {
        s.update(true);
    }
    s.slideTo(newActiveIndex, 0, false);
};
s.removeAllSlides = function () {
    var slidesIndexes = [];
    for (var i = 0; i < s.slides.length; i++) {
        slidesIndexes.push(i);
    }
    s.removeSlide(slidesIndexes);
};

/*===========================
Add .swiper plugin from Dom libraries
===========================*/
var swiperDomPlugins = ['jQuery', 'Zepto', 'Dom7'];
function addLibraryPlugin(lib) {
    lib.fn.swiper = function (params) {
        var firstInstance;
        lib(this).each(function () {
            var s = new Swiper(this, params);
            if (!firstInstance) firstInstance = s;
        });
        return firstInstance;
    };
}
for (var i = 0; i < swiperDomPlugins.length; i++) {
    if (window[swiperDomPlugins[i]]) {
        addLibraryPlugin(window[swiperDomPlugins[i]]);
    }
}
// Required DOM Plugins
var domLib;
if (typeof Dom7 === 'undefined') {
    domLib = window.Dom7 || window.Zepto || window.jQuery;
}
else {
    domLib = Dom7;
}
if (domLib) {
    if (!('transitionEnd' in domLib.fn)) {
        domLib.fn.transitionEnd = function (callback) {
            var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
                i, j, dom = this;
            function fireCallBack(e) {
                /*jshint validthis:true */
                if (e.target !== this) return;
                callback.call(this, e);
                for (i = 0; i < events.length; i++) {
                    dom.off(events[i], fireCallBack);
                }
            }
            if (callback) {
                for (i = 0; i < events.length; i++) {
                    dom.on(events[i], fireCallBack);
                }
            }
            return this;
        };
    }
    if (!('transform' in domLib.fn)) {
        domLib.fn.transform = function (transform) {
            for (var i = 0; i < this.length; i++) {
                var elStyle = this[i].style;
                elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
            }
            return this;
        };
    }
    if (!('transition' in domLib.fn)) {
        domLib.fn.transition = function (duration) {
            if (typeof duration !== 'string') {
                duration = duration + 'ms';
            }
            for (var i = 0; i < this.length; i++) {
                var elStyle = this[i].style;
                elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
            }
            return this;
        };
    }
}
    

/*===========================
Dom7 Library
===========================*/
var Dom7 = (function () {
    var Dom7 = function (arr) {
        var _this = this, i = 0;
        // Create array-like object
        for (i = 0; i < arr.length; i++) {
            _this[i] = arr[i];
        }
        _this.length = arr.length;
        // Return collection with methods
        return this;
    };
    var $ = function (selector, context) {
        var arr = [], i = 0;
        if (selector && !context) {
            if (selector instanceof Dom7) {
                return selector;
            }
        }
        if (selector) {
            // String
            if (typeof selector === 'string') {
                var els, tempParent, html = selector.trim();
                if (html.indexOf('<') >= 0 && html.indexOf('>') >= 0) {
                    var toCreate = 'div';
                    if (html.indexOf('<li') === 0) toCreate = 'ul';
                    if (html.indexOf('<tr') === 0) toCreate = 'tbody';
                    if (html.indexOf('<td') === 0 || html.indexOf('<th') === 0) toCreate = 'tr';
                    if (html.indexOf('<tbody') === 0) toCreate = 'table';
                    if (html.indexOf('<option') === 0) toCreate = 'select';
                    tempParent = document.createElement(toCreate);
                    tempParent.innerHTML = selector;
                    for (i = 0; i < tempParent.childNodes.length; i++) {
                        arr.push(tempParent.childNodes[i]);
                    }
                }
                else {
                    if (!context && selector[0] === '#' && !selector.match(/[ .<>:~]/)) {
                        // Pure ID selector
                        els = [document.getElementById(selector.split('#')[1])];
                    }
                    else {
                        // Other selectors
                        els = (context || document).querySelectorAll(selector);
                    }
                    for (i = 0; i < els.length; i++) {
                        if (els[i]) arr.push(els[i]);
                    }
                }
            }
            // Node/element
            else if (selector.nodeType || selector === window || selector === document) {
                arr.push(selector);
            }
            //Array of elements or instance of Dom
            else if (selector.length > 0 && selector[0].nodeType) {
                for (i = 0; i < selector.length; i++) {
                    arr.push(selector[i]);
                }
            }
        }
        return new Dom7(arr);
    };
    Dom7.prototype = {
        // Classes and attriutes
        addClass: function (className) {
            if (typeof className === 'undefined') {
                return this;
            }
            var classes = className.split(' ');
            for (var i = 0; i < classes.length; i++) {
                for (var j = 0; j < this.length; j++) {
                    this[j].classList.add(classes[i]);
                }
            }
            return this;
        },
        removeClass: function (className) {
            var classes = className.split(' ');
            for (var i = 0; i < classes.length; i++) {
                for (var j = 0; j < this.length; j++) {
                    this[j].classList.remove(classes[i]);
                }
            }
            return this;
        },
        hasClass: function (className) {
            if (!this[0]) return false;
            else return this[0].classList.contains(className);
        },
        toggleClass: function (className) {
            var classes = className.split(' ');
            for (var i = 0; i < classes.length; i++) {
                for (var j = 0; j < this.length; j++) {
                    this[j].classList.toggle(classes[i]);
                }
            }
            return this;
        },
        attr: function (attrs, value) {
            if (arguments.length === 1 && typeof attrs === 'string') {
                // Get attr
                if (this[0]) return this[0].getAttribute(attrs);
                else return undefined;
            }
            else {
                // Set attrs
                for (var i = 0; i < this.length; i++) {
                    if (arguments.length === 2) {
                        // String
                        this[i].setAttribute(attrs, value);
                    }
                    else {
                        // Object
                        for (var attrName in attrs) {
                            this[i][attrName] = attrs[attrName];
                            this[i].setAttribute(attrName, attrs[attrName]);
                        }
                    }
                }
                return this;
            }
        },
        removeAttr: function (attr) {
            for (var i = 0; i < this.length; i++) {
                this[i].removeAttribute(attr);
            }
        },
        data: function (key, value) {
            if (typeof value === 'undefined') {
                // Get value
                if (this[0]) {
                    var dataKey = this[0].getAttribute('data-' + key);
                    if (dataKey) return dataKey;
                    else if (this[0].dom7ElementDataStorage && (key in this[0].dom7ElementDataStorage)) return this[0].dom7ElementDataStorage[key];
                    else return undefined;
                }
                else return undefined;
            }
            else {
                // Set value
                for (var i = 0; i < this.length; i++) {
                    var el = this[i];
                    if (!el.dom7ElementDataStorage) el.dom7ElementDataStorage = {};
                    el.dom7ElementDataStorage[key] = value;
                }
                return this;
            }
        },
        // Transforms
        transform : function (transform) {
            for (var i = 0; i < this.length; i++) {
                var elStyle = this[i].style;
                elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
            }
            return this;
        },
        transition: function (duration) {
            if (typeof duration !== 'string') {
                duration = duration + 'ms';
            }
            for (var i = 0; i < this.length; i++) {
                var elStyle = this[i].style;
                elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
            }
            return this;
        },
        //Events
        on: function (eventName, targetSelector, listener, capture) {
            function handleLiveEvent(e) {
                var target = e.target;
                if ($(target).is(targetSelector)) listener.call(target, e);
                else {
                    var parents = $(target).parents();
                    for (var k = 0; k < parents.length; k++) {
                        if ($(parents[k]).is(targetSelector)) listener.call(parents[k], e);
                    }
                }
            }
            var events = eventName.split(' ');
            var i, j;
            for (i = 0; i < this.length; i++) {
                if (typeof targetSelector === 'function' || targetSelector === false) {
                    // Usual events
                    if (typeof targetSelector === 'function') {
                        listener = arguments[1];
                        capture = arguments[2] || false;
                    }
                    for (j = 0; j < events.length; j++) {
                        this[i].addEventListener(events[j], listener, capture);
                    }
                }
                else {
                    //Live events
                    for (j = 0; j < events.length; j++) {
                        if (!this[i].dom7LiveListeners) this[i].dom7LiveListeners = [];
                        this[i].dom7LiveListeners.push({listener: listener, liveListener: handleLiveEvent});
                        this[i].addEventListener(events[j], handleLiveEvent, capture);
                    }
                }
            }

            return this;
        },
        off: function (eventName, targetSelector, listener, capture) {
            var events = eventName.split(' ');
            for (var i = 0; i < events.length; i++) {
                for (var j = 0; j < this.length; j++) {
                    if (typeof targetSelector === 'function' || targetSelector === false) {
                        // Usual events
                        if (typeof targetSelector === 'function') {
                            listener = arguments[1];
                            capture = arguments[2] || false;
                        }
                        this[j].removeEventListener(events[i], listener, capture);
                    }
                    else {
                        // Live event
                        if (this[j].dom7LiveListeners) {
                            for (var k = 0; k < this[j].dom7LiveListeners.length; k++) {
                                if (this[j].dom7LiveListeners[k].listener === listener) {
                                    this[j].removeEventListener(events[i], this[j].dom7LiveListeners[k].liveListener, capture);
                                }
                            }
                        }
                    }
                }
            }
            return this;
        },
        once: function (eventName, targetSelector, listener, capture) {
            var dom = this;
            if (typeof targetSelector === 'function') {
                targetSelector = false;
                listener = arguments[1];
                capture = arguments[2];
            }
            function proxy(e) {
                listener(e);
                dom.off(eventName, targetSelector, proxy, capture);
            }
            dom.on(eventName, targetSelector, proxy, capture);
        },
        trigger: function (eventName, eventData) {
            for (var i = 0; i < this.length; i++) {
                var evt;
                try {
                    evt = new CustomEvent(eventName, {detail: eventData, bubbles: true, cancelable: true});
                }
                catch (e) {
                    evt = document.createEvent('Event');
                    evt.initEvent(eventName, true, true);
                    evt.detail = eventData;
                }
                this[i].dispatchEvent(evt);
            }
            return this;
        },
        transitionEnd: function (callback) {
            var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
                i, j, dom = this;
            function fireCallBack(e) {
                /*jshint validthis:true */
                if (e.target !== this) return;
                callback.call(this, e);
                for (i = 0; i < events.length; i++) {
                    dom.off(events[i], fireCallBack);
                }
            }
            if (callback) {
                for (i = 0; i < events.length; i++) {
                    dom.on(events[i], fireCallBack);
                }
            }
            return this;
        },
        // Sizing/Styles
        width: function () {
            if (this[0] === window) {
                return window.innerWidth;
            }
            else {
                if (this.length > 0) {
                    return parseFloat(this.css('width'));
                }
                else {
                    return null;
                }
            }
        },
        outerWidth: function (includeMargins) {
            if (this.length > 0) {
                if (includeMargins)
                    return this[0].offsetWidth + parseFloat(this.css('margin-right')) + parseFloat(this.css('margin-left'));
                else
                    return this[0].offsetWidth;
            }
            else return null;
        },
        height: function () {
            if (this[0] === window) {
                return window.innerHeight;
            }
            else {
                if (this.length > 0) {
                    return parseFloat(this.css('height'));
                }
                else {
                    return null;
                }
            }
        },
        outerHeight: function (includeMargins) {
            if (this.length > 0) {
                if (includeMargins)
                    return this[0].offsetHeight + parseFloat(this.css('margin-top')) + parseFloat(this.css('margin-bottom'));
                else
                    return this[0].offsetHeight;
            }
            else return null;
        },
        offset: function () {
            if (this.length > 0) {
                var el = this[0];
                var box = el.getBoundingClientRect();
                var body = document.body;
                var clientTop  = el.clientTop  || body.clientTop  || 0;
                var clientLeft = el.clientLeft || body.clientLeft || 0;
                var scrollTop  = window.pageYOffset || el.scrollTop;
                var scrollLeft = window.pageXOffset || el.scrollLeft;
                return {
                    top: box.top  + scrollTop  - clientTop,
                    left: box.left + scrollLeft - clientLeft
                };
            }
            else {
                return null;
            }
        },
        css: function (props, value) {
            var i;
            if (arguments.length === 1) {
                if (typeof props === 'string') {
                    if (this[0]) return window.getComputedStyle(this[0], null).getPropertyValue(props);
                }
                else {
                    for (i = 0; i < this.length; i++) {
                        for (var prop in props) {
                            this[i].style[prop] = props[prop];
                        }
                    }
                    return this;
                }
            }
            if (arguments.length === 2 && typeof props === 'string') {
                for (i = 0; i < this.length; i++) {
                    this[i].style[props] = value;
                }
                return this;
            }
            return this;
        },
        
        //Dom manipulation
        each: function (callback) {
            for (var i = 0; i < this.length; i++) {
                callback.call(this[i], i, this[i]);
            }
            return this;
        },
        html: function (html) {
            if (typeof html === 'undefined') {
                return this[0] ? this[0].innerHTML : undefined;
            }
            else {
                for (var i = 0; i < this.length; i++) {
                    this[i].innerHTML = html;
                }
                return this;
            }
        },
        is: function (selector) {
            if (!this[0]) return false;
            var compareWith, i;
            if (typeof selector === 'string') {
                var el = this[0];
                if (el === document) return selector === document;
                if (el === window) return selector === window;

                if (el.matches) return el.matches(selector);
                else if (el.webkitMatchesSelector) return el.webkitMatchesSelector(selector);
                else if (el.mozMatchesSelector) return el.mozMatchesSelector(selector);
                else if (el.msMatchesSelector) return el.msMatchesSelector(selector);
                else {
                    compareWith = $(selector);
                    for (i = 0; i < compareWith.length; i++) {
                        if (compareWith[i] === this[0]) return true;
                    }
                    return false;
                }
            }
            else if (selector === document) return this[0] === document;
            else if (selector === window) return this[0] === window;
            else {
                if (selector.nodeType || selector instanceof Dom7) {
                    compareWith = selector.nodeType ? [selector] : selector;
                    for (i = 0; i < compareWith.length; i++) {
                        if (compareWith[i] === this[0]) return true;
                    }
                    return false;
                }
                return false;
            }
            
        },
        index: function () {
            if (this[0]) {
                var child = this[0];
                var i = 0;
                while ((child = child.previousSibling) !== null) {
                    if (child.nodeType === 1) i++;
                }
                return i;
            }
            else return undefined;
        },
        eq: function (index) {
            if (typeof index === 'undefined') return this;
            var length = this.length;
            var returnIndex;
            if (index > length - 1) {
                return new Dom7([]);
            }
            if (index < 0) {
                returnIndex = length + index;
                if (returnIndex < 0) return new Dom7([]);
                else return new Dom7([this[returnIndex]]);
            }
            return new Dom7([this[index]]);
        },
        append: function (newChild) {
            var i, j;
            for (i = 0; i < this.length; i++) {
                if (typeof newChild === 'string') {
                    var tempDiv = document.createElement('div');
                    tempDiv.innerHTML = newChild;
                    while (tempDiv.firstChild) {
                        this[i].appendChild(tempDiv.firstChild);
                    }
                }
                else if (newChild instanceof Dom7) {
                    for (j = 0; j < newChild.length; j++) {
                        this[i].appendChild(newChild[j]);
                    }
                }
                else {
                    this[i].appendChild(newChild);
                }
            }
            return this;
        },
        prepend: function (newChild) {
            var i, j;
            for (i = 0; i < this.length; i++) {
                if (typeof newChild === 'string') {
                    var tempDiv = document.createElement('div');
                    tempDiv.innerHTML = newChild;
                    for (j = tempDiv.childNodes.length - 1; j >= 0; j--) {
                        this[i].insertBefore(tempDiv.childNodes[j], this[i].childNodes[0]);
                    }
                    // this[i].insertAdjacentHTML('afterbegin', newChild);
                }
                else if (newChild instanceof Dom7) {
                    for (j = 0; j < newChild.length; j++) {
                        this[i].insertBefore(newChild[j], this[i].childNodes[0]);
                    }
                }
                else {
                    this[i].insertBefore(newChild, this[i].childNodes[0]);
                }
            }
            return this;
        },
        insertBefore: function (selector) {
            var before = $(selector);
            for (var i = 0; i < this.length; i++) {
                if (before.length === 1) {
                    before[0].parentNode.insertBefore(this[i], before[0]);
                }
                else if (before.length > 1) {
                    for (var j = 0; j < before.length; j++) {
                        before[j].parentNode.insertBefore(this[i].cloneNode(true), before[j]);
                    }
                }
            }
        },
        insertAfter: function (selector) {
            var after = $(selector);
            for (var i = 0; i < this.length; i++) {
                if (after.length === 1) {
                    after[0].parentNode.insertBefore(this[i], after[0].nextSibling);
                }
                else if (after.length > 1) {
                    for (var j = 0; j < after.length; j++) {
                        after[j].parentNode.insertBefore(this[i].cloneNode(true), after[j].nextSibling);
                    }
                }
            }
        },
        next: function (selector) {
            if (this.length > 0) {
                if (selector) {
                    if (this[0].nextElementSibling && $(this[0].nextElementSibling).is(selector)) return new Dom7([this[0].nextElementSibling]);
                    else return new Dom7([]);
                }
                else {
                    if (this[0].nextElementSibling) return new Dom7([this[0].nextElementSibling]);
                    else return new Dom7([]);
                }
            }
            else return new Dom7([]);
        },
        nextAll: function (selector) {
            var nextEls = [];
            var el = this[0];
            if (!el) return new Dom7([]);
            while (el.nextElementSibling) {
                var next = el.nextElementSibling;
                if (selector) {
                    if($(next).is(selector)) nextEls.push(next);
                }
                else nextEls.push(next);
                el = next;
            }
            return new Dom7(nextEls);
        },
        prev: function (selector) {
            if (this.length > 0) {
                if (selector) {
                    if (this[0].previousElementSibling && $(this[0].previousElementSibling).is(selector)) return new Dom7([this[0].previousElementSibling]);
                    else return new Dom7([]);
                }
                else {
                    if (this[0].previousElementSibling) return new Dom7([this[0].previousElementSibling]);
                    else return new Dom7([]);
                }
            }
            else return new Dom7([]);
        },
        prevAll: function (selector) {
            var prevEls = [];
            var el = this[0];
            if (!el) return new Dom7([]);
            while (el.previousElementSibling) {
                var prev = el.previousElementSibling;
                if (selector) {
                    if($(prev).is(selector)) prevEls.push(prev);
                }
                else prevEls.push(prev);
                el = prev;
            }
            return new Dom7(prevEls);
        },
        parent: function (selector) {
            var parents = [];
            for (var i = 0; i < this.length; i++) {
                if (selector) {
                    if ($(this[i].parentNode).is(selector)) parents.push(this[i].parentNode);
                }
                else {
                    parents.push(this[i].parentNode);
                }
            }
            return $($.unique(parents));
        },
        parents: function (selector) {
            var parents = [];
            for (var i = 0; i < this.length; i++) {
                var parent = this[i].parentNode;
                while (parent) {
                    if (selector) {
                        if ($(parent).is(selector)) parents.push(parent);
                    }
                    else {
                        parents.push(parent);
                    }
                    parent = parent.parentNode;
                }
            }
            return $($.unique(parents));
        },
        find : function (selector) {
            var foundElements = [];
            for (var i = 0; i < this.length; i++) {
                var found = this[i].querySelectorAll(selector);
                for (var j = 0; j < found.length; j++) {
                    foundElements.push(found[j]);
                }
            }
            return new Dom7(foundElements);
        },
        children: function (selector) {
            var children = [];
            for (var i = 0; i < this.length; i++) {
                var childNodes = this[i].childNodes;

                for (var j = 0; j < childNodes.length; j++) {
                    if (!selector) {
                        if (childNodes[j].nodeType === 1) children.push(childNodes[j]);
                    }
                    else {
                        if (childNodes[j].nodeType === 1 && $(childNodes[j]).is(selector)) children.push(childNodes[j]);
                    }
                }
            }
            return new Dom7($.unique(children));
        },
        remove: function () {
            for (var i = 0; i < this.length; i++) {
                if (this[i].parentNode) this[i].parentNode.removeChild(this[i]);
            }
            return this;
        },
        add: function () {
            var dom = this;
            var i, j;
            for (i = 0; i < arguments.length; i++) {
                var toAdd = $(arguments[i]);
                for (j = 0; j < toAdd.length; j++) {
                    dom[dom.length] = toAdd[j];
                    dom.length++;
                }
            }
            return dom;
        }
    };
    $.fn = Dom7.prototype;
    $.unique = function (arr) {
        var unique = [];
        for (var i = 0; i < arr.length; i++) {
            if (unique.indexOf(arr[i]) === -1) unique.push(arr[i]);
        }
        return unique;
    };

    return $;
})();

/*=========================
  Effects
  ===========================*/
s.effects = {
    fade: {
        setTranslate: function () {
            for (var i = 0; i < s.slides.length; i++) {
                var slide = s.slides.eq(i);
                var offset = slide[0].swiperSlideOffset;
                var tx = -offset - s.translate;
                var ty = 0;
                if (!isH()) {
                    ty = tx;
                    tx = 0;
                }
                var slideOpacity = s.params.fade.crossFade ?
                        Math.max(1 - Math.abs(slide[0].progress), 0) :
                        1 + Math.min(Math.max(slide[0].progress, -1), 0);
                slide
                    .css({
                        opacity: slideOpacity
                    })
                    .transform('translate3d(' + tx + 'px, ' + ty + 'px, 0px)');

            }
        },
        setTransition: function (duration) {
            s.slides.transition(duration);
        }
    },
    cube: {
        setTranslate: function () {
            var wrapperRotate = 0, cubeShadow;
            if (s.params.cube.shadow) {
                if (isH()) {
                    cubeShadow = s.wrapper.find('.swiper-cube-shadow');
                    if (cubeShadow.length === 0) {
                        cubeShadow = $('<div class="swiper-cube-shadow"></div>');
                        s.wrapper.append(cubeShadow);
                    }
                    cubeShadow.css({height: s.width + 'px'});
                }
                else {
                    cubeShadow = s.container.find('.swiper-cube-shadow');
                    if (cubeShadow.length === 0) {
                        cubeShadow = $('<div class="swiper-cube-shadow"></div>');
                        s.container.append(cubeShadow);
                    }
                }
            }
            for (var i = 0; i < s.slides.length; i++) {
                var slide = s.slides.eq(i);
                var slideAngle = i * 90;
                var round = Math.floor(slideAngle / 360);
                if (s.rtl) {
                    slideAngle = -slideAngle;
                    round = Math.floor(-slideAngle / 360);
                }
                var progress = Math.max(Math.min(slide[0].progress, 1), -1);
                var tx = 0, ty = 0, tz = 0;
                if (i % 4 === 0) {
                    tx = - round * 4 * s.size;
                    tz = 0;
                }
                else if ((i - 1) % 4 === 0) {
                    tx = 0;
                    tz = - round * 4 * s.size;
                }
                else if ((i - 2) % 4 === 0) {
                    tx = s.size + round * 4 * s.size;
                    tz = s.size;
                }
                else if ((i - 3) % 4 === 0) {
                    tx = - s.size;
                    tz = 3 * s.size + s.size * 4 * round;
                }
                if (s.rtl) {
                    tx = -tx;
                }
                
                if (!isH()) {
                    ty = tx;
                    tx = 0;
                }
                
                var transform = 'rotateX(' + (isH() ? 0 : -slideAngle) + 'deg) rotateY(' + (isH() ? slideAngle : 0) + 'deg) translate3d(' + tx + 'px, ' + ty + 'px, ' + tz + 'px)';
                if (progress <= 1 && progress > -1) {
                    wrapperRotate = i * 90 + progress * 90;
                    if (s.rtl) wrapperRotate = -i * 90 - progress * 90;
                }
                slide.transform(transform);
                if (s.params.cube.slideShadows) {
                    //Set shadows
                    var shadowBefore = isH() ? slide.find('.swiper-slide-shadow-left') : slide.find('.swiper-slide-shadow-top');
                    var shadowAfter = isH() ? slide.find('.swiper-slide-shadow-right') : slide.find('.swiper-slide-shadow-bottom');
                    if (shadowBefore.length === 0) {
                        shadowBefore = $('<div class="swiper-slide-shadow-' + (isH() ? 'left' : 'top') + '"></div>');
                        slide.append(shadowBefore);
                    }
                    if (shadowAfter.length === 0) {
                        shadowAfter = $('<div class="swiper-slide-shadow-' + (isH() ? 'right' : 'bottom') + '"></div>');
                        slide.append(shadowAfter);
                    }
                    var shadowOpacity = slide[0].progress;
                    if (shadowBefore.length) shadowBefore[0].style.opacity = -slide[0].progress;
                    if (shadowAfter.length) shadowAfter[0].style.opacity = slide[0].progress;
                }
            }
            s.wrapper.css({
                '-webkit-transform-origin': '50% 50% -' + (s.size / 2) + 'px',
                '-moz-transform-origin': '50% 50% -' + (s.size / 2) + 'px',
                '-ms-transform-origin': '50% 50% -' + (s.size / 2) + 'px',
                'transform-origin': '50% 50% -' + (s.size / 2) + 'px'
            });
                
            if (s.params.cube.shadow) {
                if (isH()) {
                    cubeShadow.transform('translate3d(0px, ' + (s.width / 2 + s.params.cube.shadowOffset) + 'px, ' + (-s.width / 2) + 'px) rotateX(90deg) rotateZ(0deg) scale(' + (s.params.cube.shadowScale) + ')');
                }
                else {
                    var shadowAngle = Math.abs(wrapperRotate) - Math.floor(Math.abs(wrapperRotate) / 90) * 90;
                    var multiplier = 1.5 - (Math.sin(shadowAngle * 2 * Math.PI / 360) / 2 + Math.cos(shadowAngle * 2 * Math.PI / 360) / 2);
                    var scale1 = s.params.cube.shadowScale,
                        scale2 = s.params.cube.shadowScale / multiplier,
                        offset = s.params.cube.shadowOffset;
                    cubeShadow.transform('scale3d(' + scale1 + ', 1, ' + scale2 + ') translate3d(0px, ' + (s.height / 2 + offset) + 'px, ' + (-s.height / 2 / scale2) + 'px) rotateX(-90deg)');
                }
            }
            var zFactor = (s.isSafari || s.isUiWebView) ? (-s.size / 2) : 0;
            s.wrapper.transform('translate3d(0px,0,' + zFactor + 'px) rotateX(' + (isH() ? 0 : wrapperRotate) + 'deg) rotateY(' + (isH() ? -wrapperRotate : 0) + 'deg)');
        },
        setTransition: function (duration) {
            s.slides.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);
            if (s.params.cube.shadow && !isH()) {
                s.container.find('.swiper-cube-shadow').transition(duration);
            }
        }
    },
    coverflow: {
        setTranslate: function () {
            var transform = s.translate;
            var center = isH() ? -transform + s.width / 2 : -transform + s.height / 2;
            var rotate = isH() ? s.params.coverflow.rotate: -s.params.coverflow.rotate;
            var translate = s.params.coverflow.depth;
            //Each slide offset from center
            for (var i = 0, length = s.slides.length; i < length; i++) {
                var slide = s.slides.eq(i);
                var slideSize = s.slidesSizesGrid[i];
                var slideOffset = slide[0].swiperSlideOffset;
                var offsetMultiplier = (center - slideOffset - slideSize / 2) / slideSize * s.params.coverflow.modifier;

                var rotateY = isH() ? rotate * offsetMultiplier : 0;
                var rotateX = isH() ? 0 : rotate * offsetMultiplier;
                // var rotateZ = 0
                var translateZ = -translate * Math.abs(offsetMultiplier);

                var translateY = isH() ? 0 : s.params.coverflow.stretch * (offsetMultiplier);
                var translateX = isH() ? s.params.coverflow.stretch * (offsetMultiplier) : 0;

                //Fix for ultra small values
                if (Math.abs(translateX) < 0.001) translateX = 0;
                if (Math.abs(translateY) < 0.001) translateY = 0;
                if (Math.abs(translateZ) < 0.001) translateZ = 0;
                if (Math.abs(rotateY) < 0.001) rotateY = 0;
                if (Math.abs(rotateX) < 0.001) rotateX = 0;

                var slideTransform = 'translate3d(' + translateX + 'px,' + translateY + 'px,' + translateZ + 'px)  rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';

                slide.transform(slideTransform);
                slide[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
                if (s.params.coverflow.slideShadows) {
                    //Set shadows
                    var shadowBefore = isH() ? slide.find('.swiper-slide-shadow-left') : slide.find('.swiper-slide-shadow-top');
                    var shadowAfter = isH() ? slide.find('.swiper-slide-shadow-right') : slide.find('.swiper-slide-shadow-bottom');
                    if (shadowBefore.length === 0) {
                        shadowBefore = $('<div class="swiper-slide-shadow-' + (isH() ? 'left' : 'top') + '"></div>');
                        slide.append(shadowBefore);
                    }
                    if (shadowAfter.length === 0) {
                        shadowAfter = $('<div class="swiper-slide-shadow-' + (isH() ? 'right' : 'bottom') + '"></div>');
                        slide.append(shadowAfter);
                    }
                    if (shadowBefore.length) shadowBefore[0].style.opacity = offsetMultiplier > 0 ? offsetMultiplier : 0;
                    if (shadowAfter.length) shadowAfter[0].style.opacity = (-offsetMultiplier) > 0 ? -offsetMultiplier : 0;
                }
            }

            //Set correct perspective for IE10
            if (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) {
                var ws = s.wrapper.style;
                ws.perspectiveOrigin = center + 'px 50%';
            }
        },
        setTransition: function (duration) {
            s.slides.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);
        }
    }
};
/*=========================
  Hash Navigation
  ===========================*/
s.hashnav = {
    init: function () {
        if (!s.params.hashnav) return;
        s.hashnav.initialized = true;
        var hash = document.location.hash.replace('#', '');
        if (!hash) return;
        var speed = 0;
        for (var i = 0, length = s.slides.length; i < length; i++) {
            var slide = s.slides.eq(i);
            var slideHash = slide.attr('data-hash');
            if (slideHash === hash && !slide.hasClass(s.params.slideDuplicateClass)) {
                var index = slide.index();
                s._slideTo(index, speed);
            }
        }
    },
    setHash: function () {
        if (!s.hashnav.initialized || !s.params.hashnav) return;
        document.location.hash = s.slides.eq(s.activeIndex).attr('data-hash') || '';
    }
};
/*=========================
  Init/Destroy
  ===========================*/
s.init = function () {
    if (s.params.loop) s.createLoop();
    s.updateContainerSize();
    s.updateSlidesSize();
    s.updatePagination();
    if (s.params.scrollbar && s.scrollbar) {
        s.scrollbar.set();
    }
    if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
        if (!s.params.loop) s.updateProgress();
        s.effects[s.params.effect].setTranslate();
    }
    if (s.params.loop) {
        s.slideTo(s.params.initialSlide + s.loopedSlides, 0, s.params.runCallbacksOnInit);
    }
    else {
        s.slideTo(s.params.initialSlide, 0, s.params.runCallbacksOnInit);
        if (s.params.initialSlide === 0 && s.parallax && s.params.parallax) {
            s.parallax.setTranslate();               
        }
    }
    s.attachEvents();
    if (s.params.observer && s.support.observer) {
        s.initObservers();
    }
    if (s.params.updateOnImagesReady) {
        s.preloadImages();
    }
    if (s.params.autoplay) {
        s.startAutoplay();
    }
    if (s.params.keyboardControl) {
        if (s.enableKeyboardControl) s.enableKeyboardControl();
    }
    if (s.params.mousewheelControl) {
        if (s.enableMousewheelControl) s.enableMousewheelControl();
    }
    if (s.params.hashnav) {
        if (s.hashnav) s.hashnav.init();
    }
    if (s.params.onInit) s.params.onInit(s);
};

// Destroy
s.destroy = function (deleteInstance) {
    s.detachEvents();
    s.disconnectObservers();
    if (s.params.keyboardControl) {
        if (s.disableKeyboardControl) s.disableKeyboardControl();
    }
    if (s.params.mousewheelControl) {
        if (s.disableMousewheelControl) s.disableMousewheelControl();
    }
    if (s.params.onDestroy) s.params.onDestroy();
    if (deleteInstance !== false) s = null;
};

s.init();


/*=========================
  Keyboard Control
  ===========================*/
function handleKeyboard(e) {
    if (e.originalEvent) e = e.originalEvent; //jquery fix
    var kc = e.keyCode || e.charCode;
    if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
    if (document.activeElement && document.activeElement.nodeName && (document.activeElement.nodeName.toLowerCase() === 'input' || document.activeElement.nodeName.toLowerCase() === 'textarea')) {
        return false;
    }
    if (kc === 37 || kc === 39 || kc === 38 || kc === 40) {
        var inView = false;
        //Check that swiper should be inside of visible area of window
        if (s.container.parents('.swiper-slide').length > 0 && s.container.parents('.swiper-slide-active').length === 0) {
            return;
        }
        var windowScroll = {
            left: window.pageXOffset,
            top: window.pageYOffset
        };
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var swiperOffset = s.container.offset();
        
        var swiperCoord = [
            [swiperOffset.left, swiperOffset.top],
            [swiperOffset.left + s.width, swiperOffset.top],
            [swiperOffset.left, swiperOffset.top + s.height],
            [swiperOffset.left + s.width, swiperOffset.top + s.height]
        ];
        for (var i = 0; i < swiperCoord.length; i++) {
            var point = swiperCoord[i];
            if (
                point[0] >= windowScroll.left && point[0] <= windowScroll.left + windowWidth &&
                point[1] >= windowScroll.top && point[1] <= windowScroll.top + windowHeight
            ) {
                inView = true;
            }

        }
        if (!inView) return;
    }
    if (isH()) {
        if (kc === 37 || kc === 39) {
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
        }
        if (kc === 39) s.slideNext();
        if (kc === 37) s.slidePrev();
    }
    else {
        if (kc === 38 || kc === 40) {
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
        }
        if (kc === 40) s.slideNext();
        if (kc === 38) s.slidePrev();
    }
}
s.disableKeyboardControl = function () {
    $(document).off('keydown', handleKeyboard);
};
s.enableKeyboardControl = function () {
    $(document).on('keydown', handleKeyboard);
};

/*=========================
  Mousewheel Control
  ===========================*/
s._wheelEvent = false;
s._lastWheelScrollTime = (new Date()).getTime();
if (s.params.mousewheelControl) {
    if (document.onmousewheel !== undefined) {
        s._wheelEvent = 'mousewheel';
    }
    if (!s._wheelEvent) {
        try {
            new WheelEvent('wheel');
            s._wheelEvent = 'wheel';
        } catch (e) {}
    }
    if (!s._wheelEvent) {
        s._wheelEvent = 'DOMMouseScroll';
    }
}
function handleMousewheel(e) {
    if (e.originalEvent) e = e.originalEvent; //jquery fix
    var we = s._wheelEvent;
    var delta = 0;
    //Opera & IE
    if (e.detail) delta = -e.detail;
    //WebKits
    else if (we === 'mousewheel') {
        if (s.params.mousewheelForceToAxis) {
            if (isH()) {
                if (Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDeltaY)) delta = e.wheelDeltaX;
                else return;
            }
            else {
                if (Math.abs(e.wheelDeltaY) > Math.abs(e.wheelDeltaX)) delta = e.wheelDeltaY;
                else return;
            }
        }
        else {
            delta = e.wheelDelta;
        }
    }
    //Old FireFox
    else if (we === 'DOMMouseScroll') delta = -e.detail;
    //New FireFox
    else if (we === 'wheel') {
        if (s.params.mousewheelForceToAxis) {
            if (isH()) {
                if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) delta = -e.deltaX;
                else return;
            }
            else {
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) delta = -e.deltaY;
                else return;
            }
        }
        else {
            delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? - e.deltaX : - e.deltaY;
        }
    }

    if (!s.params.freeMode) {
        if ((new Date()).getTime() - s._lastWheelScrollTime > 60) {
            if (delta < 0) s.slideNext();
            else s.slidePrev();
        }
        s._lastWheelScrollTime = (new Date()).getTime();

    }
    else {
        //Freemode or scrollContainer:
        var position = s.getWrapperTranslate() + delta;

        if (position > 0) position = 0;
        if (position < s.maxTranslate()) position = s.maxTranslate();

        s.setWrapperTransition(0);
        s.setWrapperTranslate(position);
        s.updateProgress();
        s.updateActiveIndex();

        // Return page scroll on edge positions
        if (position === 0 || position === s.maxTranslate()) return;
    }
    if (s.params.autoplay) s.stopAutoplay();

    if (e.preventDefault) e.preventDefault();
    else e.returnValue = false;
    return false;
}
s.disableMousewheelControl = function () {
    if (!s._wheelEvent) return false;
    s.container.off(s._wheelEvent, handleMousewheel);
    return true;
};

s.enableMousewheelControl = function () {
    if (!s._wheelEvent) return false;
    s.container.on(s._wheelEvent, handleMousewheel);
    return true;
};
/*=========================
  Parallax
  ===========================*/
function setParallaxTransform(el, progress) {
    el = $(el);
    var p, pX, pY, tX, tY;
    
    p = el.attr('data-swiper-parallax');
    pX = el.attr('data-swiper-parallax-x');
    pY = el.attr('data-swiper-parallax-y');
    if (!pX && !pY && p) {
        if (isH()) {
            pX = p;
            pY = '0';
        }
        else {
            pY = p;
            pX = '0';
        }
    }
    else {
        if (pX) pX = pX;
        else pX = '0';
        if (pY) pY = pY;
        else pY = '0';
    }
    if ((pX).indexOf('%') >= 0) {
        pX = parseInt(pX, 10) * progress + '%';
    }
    else {
        pX = pX * progress + 'px' ;
    }
    if ((pY).indexOf('%') >= 0) {
        pY = parseInt(pY, 10) * progress + '%';
    }
    else {
        pY = pY * progress + 'px' ;
    }
    tX = pX;
    tY = pY;

    el.transform('translate3d(' + tX + ', ' + tY + ',0px)');
}   
s.parallax = {
    setTranslate: function () {
        s.container.children('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function(){
            setParallaxTransform(this, s.progress);
            
        });
        s.slides.each(function () {
            var slide = $(this);
            slide.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function () {
                var progress = Math.min(Math.max(slide[0].progress, -1), 1);
                setParallaxTransform(this, progress);
            });
        });
    },
    setTransition: function (duration) {
        if (typeof duration === 'undefined') duration = s.params.speed;
        s.container.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function(){
            var el = $(this);
            var parallaxDuration = parseInt(el.attr('data-swiper-parallax-duration'), 10) || duration;
            if (duration === 0) parallaxDuration = 0;
            el.transition(parallaxDuration);
        });
    }
};
    
/*=========================
  Scrollbar
  ===========================*/
s.scrollbar = {
    set: function () {
        if (!s.params.scrollbar) return;
        var sb = s.scrollbar;
        sb.track = $(s.params.scrollbar);
        sb.drag = sb.track.find('.swiper-scrollbar-drag');
        if (sb.drag.length === 0) {
            sb.drag = $('<div class="swiper-scrollbar-drag"></div>');
            sb.track.append(sb.drag);
        }
        sb.drag[0].style.width = '';
        sb.drag[0].style.height = '';
        sb.trackSize = isH() ? sb.track[0].offsetWidth : sb.track[0].offsetHeight;
        
        sb.divider = s.size / s.virtualWidth;
        sb.moveDivider = sb.divider * (sb.trackSize / s.size);
        sb.dragSize = sb.trackSize * sb.divider;

        if (isH()) {
            sb.drag[0].style.width = sb.dragSize + 'px';
        }
        else {
            sb.drag[0].style.height = sb.dragSize + 'px';
        }

        if (sb.divider >= 1) {
            sb.track[0].style.display = 'none';
        }
        else {
            sb.track[0].style.display = '';
        }
        if (s.params.scrollbarHide) {
            sb.track[0].style.opacity = 0;
        }
    },
    setTranslate: function () {
        if (!s.params.scrollbar) return;
        var diff;
        var sb = s.scrollbar;
        var translate = s.translate || 0;
        var newPos;
        
        var newSize = sb.dragSize;
        newPos = (sb.trackSize - sb.dragSize) * s.progress;
        if (s.rtl && isH()) {
            newPos = -newPos;
            if (newPos > 0) {
                newSize = sb.dragSize - newPos;
                newPos = 0;
            }
            else if (-newPos + sb.dragSize > sb.trackSize) {
                newSize = sb.trackSize + newPos;
            }
        }
        else {
            if (newPos < 0) {
                newSize = sb.dragSize + newPos;
                newPos = 0;
            }
            else if (newPos + sb.dragSize > sb.trackSize) {
                newSize = sb.trackSize - newPos;
            }
        }
        if (isH()) {
            sb.drag.transform('translate3d(' + (newPos) + 'px, 0, 0)');
            sb.drag[0].style.width = newSize + 'px';
        }
        else {
            sb.drag.transform('translate3d(0px, ' + (newPos) + 'px, 0)');
            sb.drag[0].style.height = newSize + 'px';
        }
        if (s.params.scrollbarHide) {
            clearTimeout(sb.timeout);
            sb.track[0].style.opacity = 1;
            sb.timeout = setTimeout(function () {
                sb.track[0].style.opacity = 0;
                sb.track.transition(400);
            }, 1000);
        }
    },
    setTransition: function (duration) {
        if (!s.params.scrollbar) return;
        s.scrollbar.drag.transition(duration);
    }
};
/*===========================
Swiper
===========================*/
window.Swiper = function (container, params) {
    
    // Return swiper instance
    return s;
};

/*==================================================
    Prototype
====================================================*/
Swiper.prototype = {
    isSafari: (function () {
        var ua = navigator.userAgent.toLowerCase();
        return (ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0);
    })(),
    isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent),
    isArray: function (arr) {
        return Object.prototype.toString.apply(arr) === '[object Array]';
    },
    /*==================================================
    Browser
    ====================================================*/
    browser: {
        ie: window.navigator.pointerEnabled || window.navigator.msPointerEnabled
    },
    /*==================================================
    Devices
    ====================================================*/
    device: (function () {
        var ua = navigator.userAgent;
        var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
        var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
        var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
        return {
            ios: ipad || iphone || ipad,
            android: android
        };
    })(),
    /*==================================================
    Feature Detection
    ====================================================*/
    support: {
        touch : (window.Modernizr && Modernizr.touch === true) || (function () {
            return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
        })(),

        transforms3d : (window.Modernizr && Modernizr.csstransforms3d === true) || (function () {
            var div = document.createElement('div').style;
            return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
        })(),

        flexbox: (function () {
            var div = document.createElement('div').style;
            var styles = ('WebkitBox msFlexbox MsFlexbox WebkitFlex MozBox flex').split(' ');
            for (var i = 0; i < styles.length; i++) {
                if (styles[i] in div) return true;
            }
        })(),

        observer: (function () {
            return ('MutationObserver' in window || 'WebkitMutationObserver' in window);
        })()
    }
};

})();
(function () {
    'use strict';