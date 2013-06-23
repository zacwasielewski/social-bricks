var container = $('.social-bricks');

container.socialbricks({
	networks: [
		//{name:'linkedin',id:'buddy-media'},
		{ name:'facebook', id:'sunyit', access_token:'550907728298677|TKbJGxmXgDgRMbeEVSxvZcWQWtE' },
		//{name:'pinterest',id:'potterybarn'},
		//{name:'twitter',id:'in1dotcom'},
		//{name:'googleplus',id:'105588557807820541973/posts'},
		{ name:'rss', url:'http://feeds.feedburner.com/good/lbvp' },
		{ name:'rss', url:'http://www.makebetterwebsites.com/feed/' },
		//{name:'craigslist',id:'boo',areaName:'southcoast'},
		{ name:'rss', url:'https://www.facebook.com/feeds/page.php?format=rss20&id=7092621023', secure:'detect' }
	],
	max_items: 20,
});

//container.socialbricks("fetch");

container.socialbricks("fetch",function(items){
	container.html(items);
	container.imagesLoaded( function(){
		container.isotope({
			itemSelector: '.item',
			layoutMode: 'masonry'
		});
	});

});
