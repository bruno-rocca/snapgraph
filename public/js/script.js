$(document).ready(function() {
	$("#david").tooltip({
	   'title': 'David Hu, <font color="#1f8f92">@octopi</font>',
	   'html': true,
	   'placement': 'left'
	 });

	$("#nishant").tooltip({
	   'title': 'Nishant Shukla, <font color="#1f8f92">@binroo</font>',
	   'html': true,
	   'placement': 'right'
	 });

	$("#jasdev").tooltip({
	   'title': 'Jasdev Singh, <font color="#1f8f92">@justdavesingh</fonts>',
	   'html': true,
	   'placement': 'top'
	 });

	// tooltip always follows mouse
	$('body').mousemove(function(e) {
		$('#tooltip').css({'top': e.clientY + 20, 'left': e.clientX});
	});

	// clicking the globe shows
	var showing = false;
	$('#globe').click(function() {
		if(!showing) {
			// get high scores
			$.ajax({
				url: 'leaderboard'
			}).done(function(result) {
				$('#hiscorebody').html('');
				for(var i = 0; i < result.length; i++) {
					$('#hiscorebody').append('<tr ' + (i % 2 === 0 ? 'class="zebra1"' : '') + '><td>'+result[i]._id+'</td><td>'+result[i].score+'</td></tr>');
				}
				$('#highscores table').show('slide', {direction: 'up'}, 400);
			});
		} else {
			$('#highscores table').hide('slide', {direction: 'up'}, 400);
		}
		showing = !showing;
	});

	// clicking a tr shows their graph
	$(document).on('click', '#hiscorebody tr', function(e) {
		var user = $(this)[0].firstChild.innerHTML;
		newGraph(user);
	});

	// text search
	$('#search').keypress(function(e) {
		if(e.which === 13) {
			var user = $('#search').val();
			newGraph(user);
			e.preventDefault();
		}
	}); // end #search.keypress

	function newGraph(user) {
		magToLoading();
		$('#help').animate({opacity: 0}, 400, function() { $(this).css('visibility', 'hidden'); });
		$('#boundingbox').animate({
			marginTop: '350px'
		}, 400);
		$('#search').val(user);
		$('#highscores table').hide('slide', {direction: 'up'}, 400);
		$('#chart').html('');
		$('#top').animate({
			marginTop: '2%'
		}, 400, function() { console.log('done'); });
		$('#chart').fadeIn(400, function() {
			var graph = new myGraph("#chart");
			addToGraph(graph, user);
		});
	}

	function addToGraph(graph, name) {
		$.ajax({
			url: 'getuser?u=' + name
		}).done(function(result) {
			console.log('DONE', result);
			loadingToMag();

			if(result.error) {
				$('#top').effect('shake', {times: 4, distance:5}, 200);
			}
			if(result.children.length === 0) {
				graph.addNode(name);						
			} else {
				for(var i = 0; i < result.children.length; i++) {
					var f = result.children[i].name;

					graph.addNode(name);
					graph.addNode(f);
					graph.addLink(name, f, result.children[i].score);

				}
			}
		});

		// clicking node shows more
		$(document).on('click', 'g', function(e) {
			magToLoading();
			addToGraph(graph, e.currentTarget.__data__.id);
			$('#search').val(e.currentTarget.__data__.id);
		});
	}


	function magToLoading() {
		$('#searchStatus').attr('class', '');
		$('#searchStatus').addClass('icon-repeat');
		$('#searchStatus').addClass('icon-spin');
		$('#search').prop('disabled', true);
	}
	function loadingToMag() {
		$('#searchStatus').attr('class', '');
		$('#searchStatus').addClass('icon-search');
		$('#search').prop('disabled', false);
	}
});