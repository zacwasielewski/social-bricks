/*!
 * jQuery Social Bricks plugin
 * Author: Zac Wasielewski
 * Licensed under the MIT license
 */

;(function ( $, window, document, undefined ) {
	
    $.widget( "zacwasielewski.socialbricks" , {

        options: {
        	secure: null,
            networks: [],
            max_items: 20,
            date_format: "dddd, MMMM Do YYYY, h:mm:ss a",
            template: null
        },
		
        _create: function ( settings ) {

			// access the element on which the widget was called via this.element
            // access the options defined above via this.options

			if (this.options.template === null) {
				this.options.template = this.element.html();
			}
            
            Q
			.all(
				this.options.networks.map(
					$.proxy(this.getFeedItems,this)
				)
			)
			.then(
				$.proxy(function (results) {
					this.renderFeedItems(this.sortItems(this.mergeItemsArrays(results)));
				},this)
			);
		
        },
		
        _destroy: function () {
            alert('_destroy');
        },
        
        renderFeedItems: function ( items ) {
        	
			var template = this.options.template,
				render = Handlebars.compile(template);
        	
        	this.element.html(render({items:items}));
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
        	return this.networkUrlSettings[network.name].parser(data);
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
        	
        	if (this.options.secure !== null) {
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
				parser: function (data) {
					return data.data.map(function(item){
						return {
							title: item.description,
							body: item.message,
							author: item.from.name,
							source: 'Facebook',
							date: moment(item.created_time),
							image: ''
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
				parser: function (data) {
					return data.responseData.feed.entries.map(function(item){
						return {
							title: item.title,
							body: item.content,
							author: item.author,
							source: 'RSS',
							date: moment(item.publishedDate),
							image: ''
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
				parser: function (data) {
					return data.map(function(item){
						return {
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