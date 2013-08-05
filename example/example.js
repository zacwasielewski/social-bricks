var container = $('#social-bricks-container');

container.socialbricks({
	networks: [
		//{name:'linkedin',id:'buddy-media'},
		//{ name:'facebook', id:'', access_token:'' },
		//{name:'pinterest',id:'potterybarn'},
		//{name:'twitter',id:'in1dotcom'},
		//{name:'googleplus',id:'105588557807820541973/posts'},
		{ name:'rss', url:'http://feeds.feedburner.com/good/lbvp' },
		//{name:'craigslist',id:'boo',areaName:'southcoast'},
		{ name:'rss', url:'https://github.com/zacwasielewski.atom', secure:'detect' }
	],
	max_items: 20,
	sort_direction: 'desc'
});

container.socialbricks("fetch",function(items){
	container.html(items);
	container.imagesLoaded( function(){
		container.isotope({
			itemSelector: '.item',
			layoutMode: 'masonry'
		});
	});

});
