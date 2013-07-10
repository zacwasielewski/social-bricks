/*!
 * jQuery Social Bricks plugin
 * Author: Zac Wasielewski
 * Licensed under the MIT license
 */

;(function ( $, window, document, undefined ) {
	
    $.widget( "zacwasielewski.socialbricks" , {

        options: {
            networks: [],
        	secure: null,
            max_items: 20,
            max_title_length: 50,
            max_body_length: 200,
            date_format: "dddd, MMMM Do YYYY, h:mm:ss a",
            template: null,
            layout: null
        },
		
        _create: function ( settings ) {

			// access the element on which the widget was called via this.element
            // access the options defined above via this.options

			if (this.options.template === null) {
				this.options.template = this.element.html();
			}
            
        },
		
        _destroy: function () {
            alert('_destroy');
        },
        
        fetch: function (callback) {
        	
        	var that = this;
        	
            Q
			.all(
				this.options.networks.map(
					$.proxy(this.getFeedItems,this)
				)
			)
			.then(
				$.proxy(function (results) {
				
					var items = this.sortItems(this.mergeItemsArrays(results)),
						html;
					
					items.splice( this.options.max_items, (items.length - this.options.max_items) );
					html = this.renderFeedItems(items);
					
					if (callback !== undefined) {
						this.element.empty();
						callback(html);
					} else {
						this.element.html(html);				
					}
				},this)
			);
        	
        },
        
        getFeedItems: function ( network ) {
        	
        	var that = this,
        		deferred = Q.defer(),
        		settings = {
        			success: function (data) {
        				deferred.resolve( that.parseFeedData(network,data) );
        			},
        			error: function (status) {
        				deferred.resolve(null);
        			}
        		},
        		args = this.makeNetworkUrlArgs(network),
        		url  = this.makeNetworkUrl(network,args)
        	;
        	
        	// we need to pass in our own success/error callbacks here so that we're able to return the deferred object created above
        	this.fetchRemote(url,settings);
	        
	        return deferred.promise;
        },
        
        parseFeedData: function ( network, data ) {
        	return this.networkUrlSettings[network.name].parser(data,this);
        },
        
        renderFeedItems: function ( items ) {
			var template = this.options.template,
				render = Handlebars.compile(template);
        	return render({items:items});
        },
        
        fetchRemote: function ( url, customSettings ) {
        	
        	var deferred = Q.defer(),
        		defaultSettings = {
        			url: url,
        			type: "GET",
        			dataType: 'json',
        			crossDomain: true,
        			success: function (data) {
        				deferred.resolve(data);
        			},
        			error: function (status) {
        				deferred.resolve(null);
        			}
        		},
        		settings = $.extend({}, defaultSettings, customSettings)
        	;
			
        	$.ajax(settings);
			
        	return deferred.promise;
        },
        
        mergeItemsArrays: function ( items_arrays ) {
			return [].concat.apply([],items_arrays);
        },
        
        sortItems: function ( items ) {
        	
        	return items;
        	
        },
        
        makeNetworkUrlArgs: function (network) {
        	
        	var errors = [],
        		networkUrlSettings = this.networkUrlSettings[network.name],
        		args = $.extend({}, networkUrlSettings.defaults, network)
        	;
        	
        	if (this.options.secure === null) {
        		args.protocol = '';
        	} else {
        		switch (this.options.secure) {
        			case 'detect':	args.protocol = ''; break;
        			case true:		args.protocol = 'https:'; break;
        			case false:		args.protocol = 'http:'; break;        				
        		}
        	}
        	
        	if (networkUrlSettings.prepare) {
				$.each(networkUrlSettings.prepare,function(key,prepare_func){
					args[key] = prepare_func(args[key]);
				});
			}
			
        	if (networkUrlSettings.required) {
				$.each(networkUrlSettings.required,function(i,required_arg){
					if (!(required_arg in args)) {
						console.log("Error: missing required '" + required_arg + "' setting for network '" + network.name + "'");
					}
				});
				if (errors.length) return false;
			}
        	
        	return args;
        },
        
        makeNetworkUrl: function (network,args) {
        	if (args === undefined) args = {};
			var template = this.networkUrlSettings[network.name].template;
			return Handlebars.compile(template)(args);
        },

		networkUrlSettings: {
			'facebook': {
				template: '{{protocol}}//graph.facebook.com/sunyit/posts?limit={{max_items}}&access_token={{access_token}}',
				defaults: {
					protocol: 'https:',
					max_items: 10,
				},
				required: [ 'access_token' ],
				parser: function (json,widget) {
					return json.data.map(function(item){
						return {
							network: 'facebook',
							title: widget._truncateText(item.description,widget.options.max_title_length),
							body:  widget._truncateText(item.message,widget.options.max_body_length),
							author: item.from.name,
							source: 'Facebook',
							date: moment(item.created_time).from(),
							image: item.picture
						}
					});
				}
			},
			'rss': {
				template: '{{protocol}}//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num={{max_items}}&callback=?&q={{url}}',
				defaults: {
					protocol: 'http:',
					max_items: 10,
				},
				required: [ 'url' ],
				prepare: {
					url: function (arg) { return encodeURIComponent(arg) }
				},
				parser: function (json,widget) {
					return json.responseData.feed.entries.map(function(item){
						return {
							network: 'rss',
							title: widget._truncateText(widget._stripHTML(item.title),widget.options.max_title_length),
							body:  widget._truncateText(widget._stripHTML(item.content),widget.options.max_body_length),
							author: item.author,
							source: 'RSS',
							date: moment(item.publishedDate).from(),
							image: widget._getNthImageFromHTML(item.content,0)
						}
					});
				}
			},
			'twitter': {
				template: '{{protocol}}//api.twitter.com/1/statuses/user_timeline.json?include_entities=true&include_rts=true&screen_name={{username}}&count={{max_items}}',
				defaults: {
					protocol: 'https:',
					max_items: 10,
				},
				required: [ 'username' ],
				parser: function (json,that) {
					return json.map(function(item){
						return {
							network: 'twitter',
							title: item.description,
							body: item.message,
							author: item.from.name,
							source: 'Twitter',
							date: moment(item.created_time),
							image: ''
						}
					});
				}
			},
		},

		_stripHTML: function (html) {
			var tmp = document.createElement("DIV");
			tmp.innerHTML = html;
			return tmp.textContent||tmp.innerText;
		},

		_getNthImageFromHTML: function (html,n) {
			var tmp = document.createElement("DIV");
			tmp.innerHTML = html;
			var img = $(tmp).find('img').get(n);
			return (img && img.src) || null;
		},
		
		_truncateText: function (text, maxLength, ellipseText) {
			ellipseText = ellipseText || '&hellip;';

			if (!text || text.length < maxLength) 
				return text;

			//Find the last piece of string that contain a series of not A-Za-z0-9_ followed by A-Za-z0-9_ starting from maxLength
			var m = text.substr(0, maxLength).match(/([^A-Za-z0-9_]*)[A-Za-z0-9_]*$/);
			if(!m) return ellipseText;

			//Position of last output character
			var lastCharPosition = maxLength-m[0].length;

			//If it is a space or "[" or "(" or "{" then stop one before. 
			if(/[\s\(\[\{]/.test(text[lastCharPosition])) lastCharPosition--;

			//Make sure we do not just return a letter..
			return (lastCharPosition ? text.substr(0, lastCharPosition+1) : '') + ellipseText;
		}
		
        //destroy: function () {
        //    alert('destroy');
		//
        //    // this.element.removeStuff();
        //    // For UI 1.8, destroy must be invoked from the
        //    // base widget
        //    $.Widget.prototype.destroy.call(this);
        //    // For UI 1.9, define _destroy instead and don't
        //    // worry about
        //    // calling the base widget
        //},
		
        //methodB: function ( event ) {
        //    //_trigger dispatches callbacks the plugin user
        //    // can subscribe to
        //    // signature: _trigger( "callbackName" , [eventObject],
        //    // [uiObject] )
        //    // eg. this._trigger( "hover", e /*where e.type ==
        //    // "mouseenter"*/, { hovered: $(e.target)});
        //    console.log("methodB called");
        //},
		//
        //methodA: function ( event ) {
        //    this._trigger("dataChanged", event, {
        //        key: "someValue"
        //    });
        //},
		
        // Respond to any changes the user makes to the
        // option method
        //_setOption: function ( key, value ) {
        //    switch (key) {
        //    case "someValue":
        //        //this.options.someValue = doSomethingWith( value );
        //        break;
        //    default:
        //        //this.options[ key ] = value;
        //        break;
        //    }
		//
        //    // For UI 1.8, _setOption must be manually invoked
        //    // from the base widget
        //    $.Widget.prototype._setOption.apply( this, arguments );
        //    // For UI 1.9 the _super method can be used instead
        //    // this._super( "_setOption", key, value );
        //},
        
                
    });

})( jQuery, window, document );