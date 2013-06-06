$(document).ready(function() {
	$('#search').focus();
	var graph;
	$("#david").tooltip({
	   'title': 'David Hu, <font color="#1f8f92">@octopi</font>',
	   'html': true,
	   'placement': 'left'
	 });

	$("#nishant").tooltip({
	   'title': 'Nishant Shukla, <font color="#1f8f92">@binroot</font>',
	   'html': true,
	   'placement': 'right'
	 });

	$("#jasdev").tooltip({
	   'title': 'Jasdev Singh, <font color="#1f8f92">@jasdev</fonts>',
	   'html': true,
	   'placement': 'top'
	 });

	// tooltip always follows mouse
	$('body').mousemove(function(e) {
		$('#tooltip').css({'top': e.clientY + 20, 'left': e.clientX});
	});

	// escape exits the things
	$('body').keyup(function(e) {
		if(e.which === 27) {
			$('#highscores table').hide('slide', {direction: 'up'}, 400);
			globalShowing = false;
			$('#routes').hide('slide', {direction: 'up'}, 250); // just in case
			connectionShowing = false;
		}
	});

	// clicking the globe shows
	var globalShowing = false;
	var connectionShowing = false;
	$('#globe').click(function() {
		$('#routes').hide('slide', {direction: 'up'}, 250); // just in case
		connectionShowing = false;
		if(!globalShowing) {
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
		globalShowing = !globalShowing;
	});

	// clicking on link
	$("#link").click(function() {
		if(!connectionShowing) {
			$('#highscores table').hide('slide', {direction: 'up'}, 400); // just in case
			globalShowing = false;
			$('#routes').show('slide', {direction: 'up'}, 250);
			$('#route1').focus().val($('#search').val());
			$('#route2').val('');
		} else {
			$('#routes').hide('slide', {direction: 'up'}, 250);
		}
		connectionShowing = !connectionShowing;
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

	// searching for direct connection
	$('.route').keypress(function(e) {
		if(e.which === 13) {
			var user1 = $('#route1').val();
			var user2 = $('#route2').val();
			$.ajax({
				url: 'link?u1='+user1+'&u2='+user2
			}).done(function(result) {
				var r = JSON.parse(result);
				if(r.length > 0) {
					newGraph(user1, r);
				} else {
					$('#routes').effect('shake', {times: 4, distance:5}, 200);
				}
			});
		}
	});

	// return to home state
	$('h1').click(function() {
		$('#chart').html('').animate({opacity: 0}, 400, function() { $(this).css('visibility', 'hidden'); });
		$('#top').animate({
			marginTop: '10%'
		}, 400);
		$('#boundingbox').animate({
			marginTop: '0px'
		}, 400);
		$('#highscores table').hide('slide', {direction: 'up'}, 400);
		globalShowing = false;
		$('#routes').hide('slide', {direction: 'up'}, 250); // just in case
		connectionShowing = false;
		$('#people').css('visibility', 'visible').animate({opacity: 1}, 400);
		$('#help').css('visibility', 'visible').animate({opacity: 1}, 400);
		loadingToMag();
		$('#search').val('').focus();
	});	

	function newGraph(user, forcedNodes) {
		magToLoading();
		$('#people').animate({opacity: 0}, 400, function() { $(this).css('visibility', 'hidden'); });
		$('#help').animate({opacity: 0}, 400, function() { $(this).css('visibility', 'hidden'); });
		$('#boundingbox').animate({
			marginTop: '150px'
		}, 400);
		$('#search').val(user);
		$('#highscores table').hide('slide', {direction: 'up'}, 400);
		globalShowing = false;
		$('#routes').hide('slide', {direction: 'up'}, 250); // just in case
		connectionShowing = false;
		$('#chart').html('');
		$('#top').animate({
			marginTop: '2%'
		}, 400, function() { console.log('done'); });
		$('#chart').css('visibility', 'visible').animate({opacity: 1}, 400, function() {
			graph = new myGraph("#chart");
			console.log(forcedNodes);
			if(forcedNodes !== undefined) {
				graph.addNode(user);
				for(var i = 1; i < forcedNodes.length; i++) {
					graph.addNode(forcedNodes[i]);
					graph.addLink(forcedNodes[i-1], forcedNodes[i], 5);
				}
				loadingToMag();
			} else {
				addToGraph(graph, user);
			}
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
	}
	// clicking node shows more
	$(document).on('click', 'g', function(e) {
		magToLoading();
		addToGraph(graph, e.currentTarget.__data__.id);
		$('#search').val(e.currentTarget.__data__.id);
	        
	});


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
