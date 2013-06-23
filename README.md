jQuery Social Bricks
====================

jQuery plugin to embed one or more social news feeds on a website


Usage:
------

HTML:

	<div class="social-bricks">
		{{#each items}}
			<article class="item">
				{{#if title}}
					<h1>{{{title}}}</h1>
				{{/if}}
				{{#if image}}
					<div class="image"><img src="{{image}}"></div>
				{{/if}}
				<p class="body">{{{body}}}</p>
				<a href="{{link}}"></a>
				<p class="source"><time>{{date}}</time> from {{source}}</p>
			</article>
		{{/each}}
	</div>

	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
	<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
	<script src="social-bricks-dependencies.min.js"></script>


JavaScript:

	var container = $('.social-bricks');

	container.socialbricks({
		networks: [
			{ name:'facebook', id:'{FACEBOOK_USER_ID}', access_token:'{FACEBOOK_ACCESS_TOKEN}' },
			{ name:'rss', url:'{RSS_FEED_URL}' }
		],
	});

	container.socialbricks("fetch");
