var bricks = $('#social-bricks').socialbricks({
	networks: [
		//{name:'linkedin',id:'buddy-media'},
		{ name:'facebook', id:'sunyit', access_token:'550907728298677|TKbJGxmXgDgRMbeEVSxvZcWQWtE' },
		//{name:'pinterest',id:'potterybarn'},
		//{name:'twitter',id:'in1dotcom'},
		//{name:'googleplus',id:'105588557807820541973/posts'},
		{name:'rss', url:' http://feeds.feedburner.com/good/lbvp'},
		{name:'rss', url:'http://www.makebetterwebsites.com/feed/'},
		//{name:'craigslist',id:'boo',areaName:'southcoast'},
		//{name:'rss',id:'http://www.houzz.com/getGalleries/featured/out-rss'}
		{name:'rss', url:'https://www.facebook.com/feeds/page.php?format=rss20&id=7092621023', secure:'detect'}
	],
	layout: 'isotope',
	limit: 6,
	random: false,
	//fields: ['source','heading','text','date','image'],
	theme: 'sunyit'
});