/*
 * Copyright 2007-2013 Brian Jackson (iggy@theiggy.com)
 *
 * Anything not explicitly licensed some other way is released under the new BSD license
 * http://www.opensource.org/licenses/bsd-license.php
 */

// "namespaces"
var folders = {};
var msglist = {};
var dw = {}; // miscellaneous variables
dw.viewmsg = {};

$(document).ready(function() {
	console.log('doc ready');
	
	// refresh msg list periodically
	// TODO stuff a configurable time into the body or something
	refid = window.setInterval(function(){console.log('msglist refresh'); $('#msglist .foldersel').change();}, 5*60*1000);

	$('#msglist').srvDatatable();

	// folder list
	$.getJSON('json/folderlist/?server=0', function(data) {
		console.log('folderlist callback', data);
		j = eval(data);
		$('#foldertree').append('<ul>');
		for(var i = 0 ; i < j['folders'].length ; i++) {
			$('#foldertree').append('<li><a class="foldersel" href="#">'+j['folders'][i]+'</a></li>');
		}
		$('#foldertree').append('</ul>');

		$('.foldersel').click(function(e) {
			console.log('e =', e, 'this =', this, $(this).text());
			// change the input we use to track the folder
			$('#msglist .foldersel').val($(this).text());
			// reset some of the nav variables to defaults
			// FIXME more thorough
			$('#msglist .pagesel').val('1');
			// now let the msg list know we changed some stuff
			$('#msglist .foldersel').change();
		});
	});
	$('#spinner').hide();
	$.jstree._themes = "/site_media/js/";
	
	$('#foldertree2').jstree({
		'plugins': ['core', 'themes', 'json', 'ui'],
		'json': {
			'ajax': {
				'url': 'json/folderlist2/?server=0',
				'data': function(n) {
					return {
						"operation": "subfolders",
						"id": n.attr ? n.attr('id') : 1
					};
				},
			}
		},
		'themes': {
			'theme': 'classic',
			'url': '/site_media/js/themes/classic/style.css'
		}
	});
	console.log('foldertree2 should be done now');
	

	// hide the spinner
	//$('#spinner').hide()
});

/*
 * jQuery server side datatable plugin 0.1
 *
 * Copyright (c) 2009 Brian Jackson <iggy@theiggy.com>
 *
 * A datatable plugin that does all the searching, sorting, pagination, etc. on
 * the server. This was written mainly for Django-Webmail, which uses an IMAP
 * backend. The IMAP server will almost always be better at sorting, searching,
 * etc. It could eventually be generalized to be useful to others.
 *
 * Licensed under same license as django-webmail (i.e. BSD)
 */
;(function($) {
	$.fn.srvDatatable = function() {
		console.log('start srvDatatable', this);
		var $cnt = $(this);

		var navht = '<form class="msgnav" action="msglist/" method="get"> \
			<input type="text" readonly="readonly" value="INBOX" class="foldersel" /> \
			<a href="/mail/"><img src="/site_media/images/arrow_refresh.png" alt="refresh" title="refresh"/></a> \
			<a href="#"><img src="/site_media/images/previous.png" alt="previous"/></a> \
			<a href="#"><img src="/site_media/images/dprvs.png" alt="previous"/></a> \
			<select class="pagesel"> \
			<option>1</option> \
			</select> \
			<a href="#"><img src="/site_media/images/next.png" alt="previous"/></a> \
			<a href="#"><img src="/site_media/images/fwd.png" alt="previous"/></a>  \
			Msgs Per Page: \
			<select class="perpagesel"> \
			<option>10</option> \
			<option>20</option> \
			<option selected="selected">40</option> \
			<option>50</option> \
			</select> \
			Sort: \
			<select class="sortordersel"> \
			<option>Asc</option> \
			<option>Desc</option> \
			</select> \
			';
		var tableht = '<table><tr> \
			<th style="width:60%">Subject</th> \
			<th style="width:20%">From</th> \
			<th style="width:14%">Date</th> \
			<th style="width:10%">Size</th>\
			</tr></table>';

		$cnt.append(navht);

		$cnt.append(tableht);

		var $foldersel = $cnt.find('.foldersel'),
			$pagesel = $cnt.find('.pagesel'),
			$perpagesel = $cnt.find('.perpagesel'),
			$sortordersel = $cnt.find('.sortordersel'),
			$tbl = $cnt.find('table');

		$foldersel.change(update);
		$pagesel.change(update);
		$perpagesel.change(update);
		$sortordersel.change(update);

		update();

		function getUrl() {
			return $cnt.find('.msgnav').attr('action') + // form action specifies the base of the url
			'0/' + // server
			$foldersel.val() + '/' + // folder
			$pagesel.val() + '/' + // page
			$perpagesel.val() + '/' + // msgs per page
			'date/'+
			$sortordersel.val().charAt(0) + '/' + // sort order
			'/'; // search terms
		};

		function update() {
			$.getJSON(getUrl(), function(data) {
				console.log('get msglist callback');
				j = eval(data);
				console.log('j = ', j);

				// fill pagesel
				$pagesel.empty();
				console.log(j['totalmsgs'], $perpagesel.val(), Math.ceil(j['totalmsgs'] / $perpagesel.val()));
				for(var i = 1 ; i <= Math.max(Math.ceil(j['totalmsgs'] / $perpagesel.val()), 1) ; i++) {
					var selht = '';
					if($sortordersel.val().charAt(0) == "A" && i == Math.ceil(j['stop']/$perpagesel.val()))
						selht = ' selected="selected"';
					if($sortordersel.val().charAt(0) == "D" && i == Math.floor(j['totalmsgs']/$perpagesel.val() - j['stop']/$perpagesel.val()) + 1)
						selht = ' selected="selected"';
					$pagesel.append('<option'+selht+'>' + i + '</option>');
				}

				// fill the msglist table
				$tbl.find('tr:not(:first)').remove();
				console.log(j['msglist'].length);
				for(var uid in j['msglist']) {
					msg = j['msglist'][uid];
					console.log('168', uid, msg);
					var rclass = 'odd';
					if(i % 2 == 0)
						rclass = 'even';
					// handle flags
					fclass = '';
					//console.log(msg['flags'].join());
					if(msg['flags'].join().search("\\Seen") != -1)
						rclass += ' msgseen';
					else
						rclass += ' msgunseen';
					if(msg['flags'].join().search("\\Flagged") != -1)
						fclass += ' msgimport';
//					for(var k = 0 ; k <= msg['flags'].length ; k++) {
//						if(msg['flags'][k] == "\\Seen")
//							rclass += ' msgseen';
//						else
//							rclass += ' msgunseen';
//
//						if(msg['flags'][k] == "\\Flagged")
//							fclass += ' msgimport';
//					}

					// TODO finish pulling out the <*> and stuffing it into the alt tag maybe
					r = new RegExp("&lt;.*&gt;");
					console.log("regex5", r.exec(msg['from']));

					$tbl.append('<tr class="msg ' + rclass + '" id="msg-' + msg['uid'] + '"> \
						<td class="subject' + fclass + '">' + msg['subject'] + '</td> \
						<td>' + msg['from'] + '</td> \
						<td>' + msg['date'] + '</td> \
						<td>' + Math.round((msg['size']/1024)*10)/10 + 'K</td> \
						</tr>');
				}

				// msg listener
				$('tr.msg').click(function(e) {
					console.log(this, e, this.id.replace('msg-', ''), $(window).width(), $(window).height());

					if(e.which==2) {
						// open message in new tab if message was middle clicked
						server = '0';
						folder = $('#msglist .foldersel').val();
						uid = this.id.replace('msg-', '');
						window.open('viewmsg/' + server + '/' + folder + '/' + uid + '/', '_blank');
						
						return true;
					}

					// show a modal dialog with an email msg
					server = '0';
					folder = $('#msglist .foldersel').val();
					uid = this.id.replace('msg-', '');
					dlgw = $(window).width() - 30;
					dlgh = $(window).height() - 50;
					console.log(dlgw, dlgh);
					options = {
						title: 'View Message',
						closeable: true,
						modal: true,
						position: 'center',
						width: dlgw,
						height: dlgh
					};
					//msgbox = Boxy.load('viewmsg/' + server + '/' + folder + '/' + uid + '/', options);
					//msgbox.resize(900, 500);
					dw.dialog = $('<div></div>').append('body');
					$(dw.dialog).load('viewmsg/' + server + '/' + folder + '/' + uid + '/').dialog(options);
				});
				$('tr.msg').hover(
					function() { $(this).addClass('msghover'); },
					function() { $(this).removeClass('msghover'); }
				);
			});
		};
	};
})(jQuery);

dw.viewmsg.markmsg = function(how, server, folder, uid) {
    $.getJSON('action/mark'+how+'/?server='+server+'&folder='+folder+'&uid='+uid, function(j) {
        console.log(this, j);
    });
};

