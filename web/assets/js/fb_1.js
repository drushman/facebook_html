Social = {};
Social.Dialog				= {};
Social.windowInstallPage	= null;
Social.pagesList			= {};
Social.isPageInstalled = function(e, options)
{
	var checkbox 		= e.target;
	var id_page			= e.target.value;
	if( checkbox.checked )
	{
		//If have to optimize this, because list fanpages are already from list checkboxes
		FB.api('/me/accounts', function(response) {
			var data = fbRemoveAppList(response.data);
			if( data && data.length > 0 )
			{
				var queries = [];
				for (id in data)
				{
					var page = data[id];
					queries.push({
						method			: 'GET',
						relative_url	: '/'+page.id
					});
				}
				FB.api('/', 'POST',{
						batch:queries
					},
					function(responses){
						Social.pagesList = [];
						for(i in responses)
						{
							var response	= responses[i];
							var pageInfo	= jQuery.parseJSON(response.body);
							Social.pagesList[pageInfo.id] = pageInfo;
						}
						if( !Social.pagesList[id_page]['has_added_app'] )
						{
							checkbox.checked = false;
							Social.getDialog().create({
								title:options['title'],
								content: options['template'],
								minWidth: 500,
								buttons: {
									Ok: function(){
										checkbox.checked = false;
										$(this).dialog("close");
										Social.windowInstallPage = window.open(
											"http://www.facebook.com/add.php?api_key=" + social_app_id + "&pages=1&page=" + id_page,
											'_blank',
											'width=650,height=320,resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no'
											);
										id_timeout = setTimeout(function(){
											Social.checkPageInstalled({
												id_page		: id_page,
												pageName	: options.pageName,
												checkbox	: checkbox
											})
										},5000);
									},
									Cancel: function()
									{
										checkbox.checked = false;
										$(this).dialog("close");
									}
								}
							});
						}
					}
				);
			}
		});
	}
};

Social.checkPageInstalled = function(options)
{
	var checkbox	= options.checkbox;
	FB.api('/me/accounts', function(response) {
		var data = fbRemoveAppList(response.data);
		if( data && data.length > 0 )
		{
			var queries = [];
			for (id in data)
			{
				var page = data[id];
				queries.push({
					method			: 'GET',
					relative_url	: '/'+page.id
				});
			}
			FB.api('/', 'POST',{
					batch:queries
				},
				function(responses){
					var _oldPagesList = {};
					for(i in responses)
					{
						var response	= responses[i];
						var pageInfo	= jQuery.parseJSON(response.body);
						_oldPagesList[pageInfo.id] = pageInfo;
					}
					var isChanged	= false;
					var pageInstalled  = {};
					for(id in _oldPagesList)
					{
						if( _oldPagesList[id]['has_added_app'] && (_oldPagesList[id]['has_added_app'] !== Social.pagesList[id]['has_added_app']) )
						{
							pageInstalled[id] = 1;
							isChanged = true;
						}
					}
					$.get(base_url,{
						tabs_added: pageInstalled
					});
					if( isChanged )
					{
						Social.windowInstallPage.close();
						Social.pagesList = _oldPagesList;

						$(":checkbox").filter(function(){
							if( this.name === (options.pageName+'[]') )
							{
								return true;
							}
							return false;
						}).each(function(){
							if( Social.pagesList[this.value]['has_added_app'] )
							{
								var image = " <img width='16' title='Already installed' src='" +base_url+ "/facebook/img/apply-icon.gif'/>";
								$(this).parent().children('img').remove();
								$(this).parent().append(image);
								if( $(this).is(checkbox) )
								{
									checkbox.checked = true;
								}
							}
						});
						Social.getDialog().create({
							title	: 'App is installed successfully',
							content	: add_fanpage_successfully,
							buttons	: {
								Close : function(){
									$(this).dialog("close");
								}
							}
						});
					}
					else
					{
						if( Social.windowInstallPage && !Social.windowInstallPage.closed )
						{
							setTimeout(function(){
								Social.checkPageInstalled(options);
							},2000);
						}
						checkbox.checked = false;
					}
				}
			);
		}
	});
}
Social.redirect = function(url){
	if( url.search('facebook.com/') !== -1 )
	{
		top.location.href = url;
	}
	else
	{
		location.href = url;
	}
}
Social.handleCommentNotify = function(url, data, callback)
{
	FB.Event.subscribe('comment.create', function(response){
		var fbCommentObject = response;
		var query1 = "SELECT post_fbid, fromid, object_id, text, time FROM comment WHERE object_id IN (SELECT comments_fbid FROM link_stat WHERE url = '" + response.href +"') ORDER BY time DESC LIMIT 1";
		var query2 = "SELECT name FROM user WHERE uid IN (SELECT fromid FROM #comment)";
		var multiQuery = {
			comment: query1,
			user: query2
		};
		FB.api({
			method: 'fql.multiquery',
			queries: multiQuery
		}, function(response){
			if (response[0] != undefined && response[1] != undefined)
			{
				data.message	= response[0].fql_result_set[0].text;
				data.time 		= response[0].fql_result_set[0].time;
				data.user_name 	= response[1].fql_result_set[0].name;
				data.user_id 	= response[0].fql_result_set[0].fromid;
				data.href		= fbCommentObject.href;
				if (callback && typeof(callback) === "function")
					$.post(
	    	            url,
	    	            data,
	    	            callback
	    	        );
				else
					$.post(
	    	            url,
	    	            data
	    	        );
			}
		});
	});
};

Social.Dialog.create = function(options)
{
	if( $('#dialog').length === 0)
	{
		var $dialog = $('<div id="dialog"></div>');
		$("body").append($dialog);
	}
	var settings = {
		title		: 'Confirm this action',
		autoOpen	: false,
		modal		: true,
		draggable	: false,
		resizable	: false,
		minWidth	: 420,
		minHeight	: 70,
		buttons		: {
			"Ok": function(){
				$(this).dialog("close");
			},
			"Cancel": function(){
				$(this).dialog("close");
			}
		}
	};
	if( options['onOk'] )
	{
		settings.buttons['Ok'] =  options['onOk'];
		delete options['onOk'];
	}
	if( options['onClose'] )
	{
		settings.buttons['Cancel'] =  options['onClose'];
		delete options['onClose'];
	}
	settings = $.extend(settings,options);
	FB.Canvas._pageInfo = {clientWidth:0,clientHeight:0,scrollLeft:0,scrollTop:0,offsetLeft:0,offsetTop:0};
	FB.Canvas.getPageInfo(
		function(info) {
			$("#dialog").html(settings.content);
			$("#dialog").dialog(settings);
			//Update position
			var width		= $(".ui-dialog").width() || $("#dialog").dialog( "option", "width" ) + 20;
			var height		= $(".ui-dialog").height() || $("#dialog").dialog( "option", "height" ) + 20;
			var posX		= parseInt(($("body").width()-width)/2,10);
			var posY		= info.scrollTop - info.offsetTop + parseInt((info.clientHeight - height)/2,10);
			$("#dialog").dialog("option","position",[posX, posY]);
			$("#dialog").dialog("open");
			if( settings.init )
			{
				settings.init.call($("#dialog").get(0));
			}
		}
	);
};
Social.getDialog = function()
{
	return Social.Dialog;
};
Social.share = function(options, callback)
{
	options = options || {};
	if( this instanceof Element )
	{
		if( !options['link'] )
		{
			options['link'] = $(this).data('href');
		}
		if( options['link'].search('id_user_ref') === -1)
		{
			/*Because reason: FB auto append info about referrer user */
//			if( options['link'].search(/\?/) === -1 )
//				options['link'] += '?';
//			else
//				options['link'] += '&';
//			options['link']	+= 'id_user_ref='+$(this).attr('data-ref');
			options['link']	+= '/id_user_ref/'+$(this).attr('data-ref');
		}
	}
	var data = $.extend(options,{
		method: 'feed'
	});
	FB.ui(data,callback||function(response){
		//Not yet implement
	});
};
Social.invite = function(message, data, callback){
	message = message || '';
	data	= data || {};
	if( this instanceof Element )
	{
		if( !message )
		{
			message = $(this).data('message');
		}
		if( !data['id_object'] )
		{
			data['id_object'] = $(this).attr('data-id-object');
		}
		if( !data['id_page'] )
		{
			data['id_page'] = $(this).attr('data-id-page');
		}
		if( !data['id_ref'] )
		{
			data['id_ref'] = $(this).attr('data-ref');
		}
	}
	FB.ui({
		method	: 'apprequests',
		message	: message,
		data	: data
	}, callback || function(response){
		//Not yet implement
	});
};
/**
 *
 */
Social.hasPersmissions = function(callback, options)
{
	var arrPermission	= options['scope']?options['scope'].split(','):[];
	for(var i = 0, n = arrPermission.length; i < n; i++)
	{
		arrPermission[i] = $.trim(arrPermission[i]);
	}
	var isOK = true;
	FB.getLoginStatus(function(response){
		if( !response.authResponse ){
			callback(false, response);
			return;
		}
		FB.api('/me/permissions', function (responsePermission) {
			for(var i = 0, n = arrPermission.length; i < n; i++)
			{
				if(responsePermission.data[0][arrPermission[i]]!=1)
				{
					isOK = false;
					break;
				}
			}
			callback(isOK, response);
		});
	});
};
Social.authorize = function(callback, options){
	if( options && options['force'])
	{
		FB.login(function(response){
			if( response.authResponse ){
				Social.hasPersmissions(function(result, response){
					if (!result)
					{
						Social.getDialog().create({
							title: options['title'],
							content: options['content'],
							minWidth: 500,
							buttons	: {
								Close : function(){
									$(this).dialog("close");
									return;
								}
							}
						});
					}
					else
						callback(response);
				}, options);
			}
			else
			{
				Social.getDialog().create({
					title: options['title'],
					content: options['content'],
					minWidth: 500,
					buttons	: {
						Close : function(){
							$(this).dialog("close");
							return;
						}
					}
				});
			}
		}, options );
		return;
	}
	FB.getLoginStatus(function(response){
		if( !response.authResponse ){
			FB.login(function(response){
				if( response.authResponse ){
					callback(response);
				}
			}, options );
		} else {
			var arrPermission	= options['scope'].split(',') || [];
			var isOK = true;
			FB.api('/me/permissions', function (responsePermission) {
				for(var i = 0, n = arrPermission.length; i < n; i++)
				{
					if(responsePermission.data[0][arrPermission[i]]!=1)
					{
						isOK = false;
						break;
					}
				}
				if(isOK)
				{
					callback(response);
				}
				else
				{
					FB.login(function(response) {
							if( response.authResponse )
							{
								callback(response);
							}
						}
						, options
					);
				}
			});
		}
	});
};

Social.post = function(url, data, callback, options){
	var settings = {
		scope	: '',
		type	: ''
	};
	if ( jQuery.isFunction( data ) ) {
		options		= options || callback;
		callback	= data;
		data		= {};
	}
	if( options )
	{
		jQuery.extend(settings, options);
	}
	Social.authorize(function(response){
		data = jQuery.extend(data,{
			signed_request : response.authResponse.signedRequest
		}),
		jQuery.post(url,
			data,
			callback,
			settings.type
		);
	},settings);
};

Social.bind = function(selector, type, callback, options)
{
	jQuery.extend(options, {force: true});
	Social.hasPersmissions(function(result, response){
		$(selector).bind(type, function(e){
			e.preventDefault();
			var obj		= this;
			var event	= e;
			if( result )
			{
				return callback.apply(obj, [event, response]);
			}
			else
			{
				Social.authorize(function(response){
					callback.apply(obj, [event, response]);
				}, options);
			}
			return false;
		});
	},options);
};
/**
 *
 * @param Object options - jQuery UI Dialog Option
 * @param Function callback - a callback function(boolean: result){}
 * @returns undefined
 */
Social.confirm = function(options,callback){
	if( options['buttons'] )
	{
		delete options['buttons'];
	}
	options = $.extend({
		title		: 'Please confirm this action',
		content		: 'Not yet implemented'
	},options);
	$.extend(options,{
		buttons: {
			Ok : function(){
				$(this).dialog("close");
				callback(true);
			},
			Cancel: function(){
				$(this).dialog("close");
				callback(false);
			}
		}
	});
	Social.getDialog().create(options);
};

Social.baseUrl = function(pathname){
	var returnUrl = '';
	//Repair in the future
	if( Social.configs && Social.configs.baseUrl) {
		returnUrl = Social.configs.baseUrl;
	}
	if ('baseURI' in document) {
		returnUrl = document.baseURI;
	}
	else {
		var baseTags = document.getElementsByTagName("base");
		if (baseTags.length > 0) {
			returnUrl = baseTags[0].href;
		}
		else {
			returnUrl = window.location.href;
		}
	}
	returnUrl = returnUrl.replace(/\/$/, '');
	if( pathname ) {
		pathname = pathname.replace(/^\//, '');
		if( pathname ){
			return [returnUrl, pathname].join('/');
		}
	}
	return returnUrl;
};

jQuery.fn.ymSelectPage = function(options) {
	var settings 		= {
		template: '<div>Not yet defined</div>'
	};
	options = $.extend( settings, options );
	function init(options)
	{
		var obj = this;
		$(this).focus(function(){
			$(this).data('oldValue',this.value);
		});
		$(this).change(function(e)
		{
			var url			= this.value;
			var elements	= this.value.split("/");
			var key_id_page	= elements[elements.length-2];
			if( $.inArray(key_id_page,['id_page','pages']) !== -1 )
			{
				var id_page  = elements[elements.length-1];
				FB.api('/'+id_page,function(response){
					if( !response.has_added_app){
						Social.getDialog().create({
							title: options['title'],
							content: options['template'],
							closeIcon: true,
							minWidth: 500,
							onClose: function() {
								obj.value = $(obj).data('oldValue');
								$(this).dialog("close");
							},
							onOk: function(){
								Social.windowInstallPage = window.open(
									"http://www.facebook.com/add.php?api_key=" + social_app_id + "&pages=1&page=" + id_page,
									'_blank',
									'width=650,height=320,resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no'
								);
								setTimeout(function(){
									confirmInstall.call(obj,id_page,function(){
										Social.redirect(url);
									});
								},5000);
								$(this).dialog("close");
							},
							close: function(event, ui) {
								var code = event.which || event.keycode;
								if( code === 27 )
								{
									obj.value = $(obj).data('oldValue');
								}
							},
							visible: true,
							init: function()
							{

							}
						});
						return;
					}
					Social.redirect(url);
				});
			}
			else
			{
				Social.redirect(url);
			}
			return false;
		});
	}
	function confirmInstall(id_page, callback)
	{
		var obj = this;
	    FB.api('/' + id_page, function(response){
	        if (response.has_added_app)
	        {
	            Social.windowInstallPage.close();
				var tabs_added  = {};
				tabs_added[id_page] = 1;
				$.get(base_url,{
					'tabs_added': tabs_added
				});
	            alert(options.translate['ADD_FANPAGE_SUCCESSFUL']);
	            callback();
	        }
	        else{
				if( Social.windowInstallPage && !Social.windowInstallPage.closed )
				{
					setTimeout(function(){
						confirmInstall.call(obj,id_page, callback);
					},2000);
				}
				else
				{
					obj.value = $(obj).data('oldValue');
				}
	        }
	    });
	}
	return this.each(function() {
		if ( options ) {
			init.call(this,options);
		}
	});
};

jQuery.fn.ymHandleFanpages = function(options){
	var isExistCreatePageLink = false;
	var settings = {
        scope       : 'manage_pages',
		pageName	: 'id_page',
		selector	: '#reload',
		translate	: {
			LOAD_MY_FAN_PAGES	:'Load my Fan Pages',
			CREATE_A_PAGE		:'You do not create any page before. Create page now.'
		}
	};
	$.extend(settings, options);
	function markPageIsInstalled(settings)
	{
		$("input[name='"+settings.pageName+"[]']",this).each(function(){
			var id_page = this.value;
			FB.api('/' + id_page, $.proxy(function(response) {
				if (response.has_added_app)
				{
					var image = " <img width='16' title='Already installed' src='" +base_url+ "/facebook/img/apply-icon.gif'/>";
					$(this).parent().children('img').remove();
					$(this).parent().append(image);
				}
			},this));
		});
	}
	function init(settings){
		var isExistFanPages = $("input[name='"+settings.pageName+"[]']",this).length === 0;
		var obj				= this;
		if( isExistFanPages )
		{
			$(settings.selector).html([
				'<div class="sm_btn green load_fanpages"><span>',
				settings.translate.LOAD_MY_FAN_PAGES,
				'</span></div>'
				].join('')
			);
			$(settings.selector).delegate('.load_fanpages', 'click', function(e){
				FB.login(function(response) {
					if( response.status === 'connected')
					{
						if( response.authResponse )
						{
							FB.api('/me/accounts', function(response) {
								var data = fbRemoveAppList(response.data);
								if( data && data.length > 0 )
								{
									var html = '';
									for (id in data)
									{
										var page = data[id];
										html += "<label><input name='"+settings.pageName+"[]' type='checkbox' value='" + page.id + "'>" + page.name + "</label>";
									}
									if (html !== '')
									{
										$(settings.selector).html(html);
										markPageIsInstalled.call(obj,settings);
									}
								}
								else
								{
									if( !isExistCreatePageLink )
									{
										$(settings.selector).append([
												'<a class="fb_create_page_link" href="',
												social_url_fanpage_create,
												'" target="_blank">',
												settings.translate.CREATE_A_PAGE,
												'</a>'
											].join('')
										);
										isExistCreatePageLink = true;
									}
								}
							});
						}
					}
				}, {scope: settings.scope});
			});
		}
		else
		{
			markPageIsInstalled.call(this,settings);
		}
		$(settings.selector).delegate("input", 'change', function(e){
			Social.isPageInstalled(e,{
				pageName	: settings.pageName,
				title		: settings.confirmTitle,
				template	: settings.confirmTemplate
			});
		});
	}
	return this.each(function() {
		if ( options ) {
			FB.getLoginStatus($.proxy(function(){
				init.call(this,settings);
			},this));
		}
	});
}
var window_install;
/**
 * @deprecated use function $.ymHandleFanpages
 */
function isPageInstalled(id_page, checkbox,check_box_obj)
{

	result = FB.api('/' + id_page, function(response) {
		if (response.has_added_app)
		{
			checkbox.checked = true;
		}
		else
		{
			if(confirm(confirm_add_fanpage))
			{
				window_install = window.open("http://www.facebook.com/add.php?api_key=" + social_app_id + "&pages=1&page=" + id_page, '_blank');
				setTimeout(function(){
					checkPageInstalled(id_page,checkbox,check_box_obj)
				},5000);
				checkbox.checked = false;
			}
			else
			{
				checkbox.checked = false;
			}
		}
	});

}
/**
 * @deprecated use function $.ymHandleFanpages
 */
function checkPageInstalled(id_page, checkbox, check_box_obj)
{
	result = FB.api('/' + id_page, function(response) {
		if (response.has_added_app)
		{
			var image = " <img width='16' title='Already installed' src='" +base_url+ "/facebook/img/apply-icon.gif'/>";
			check_box_obj.parent().children('img').remove();
			check_box_obj.parent().append(image);
			checkbox.checked = true;
            window_install.close();
			var tabs_added  = {};
			tabs_added[id_page] = 1;
			$.get(base_url,{
				'tabs_added': tabs_added
			});
			alert(add_fanpage_successfully);
		}
		else
		{
			setTimeout(function(){
				checkPageInstalled(id_page,checkbox, check_box_obj)
			},3000);
			checkbox.checked = false;
		}
	});
}
function postToWall(title, desc, href, image, caption)
{
    FB.ui(
        {
            method: 'feed',
            app_id: social_app_id,
            name: title,
            link: href+'?ref='+social_user_id,
            picture: image,
            caption: caption,
            description: desc
        },
        function(response) {
        	// nothing to do here
        }
    );
}
function authorizeBeforeShare(share_url)
{
	FB.getLoginStatus(function(response) {
		FB.login(
			function(response) {
				if (response.authResponse) {
					FB.api('/me', function(response) {
						share(response.id, share_url);
					});
				} else {
					alert('You need to authorize the application before you can vote, share or invite friends.')
				}
			}
			, {
				scope : ''
			});
	});
}
function authorizeBeforeInvite(entry_title, url)
{
	FB.getLoginStatus(function(response) {
		FB.login(
			function(response) {
				if (response.authResponse) {
					FB.api('/me', function(response) {
						inviteFriends(entry_title, url);
					});
				} else {
					alert('You need to authorize the application before you can vote, share or invite friends.')
				}
			}
			, {
				scope : ''
			});
	});
}
function authorizeBeforeVote(redirect_url)
{
	FB.getLoginStatus(function(response) {
		FB.login(
			function(response) {
				if (response.authResponse) {
					FB.api('/me', function(response) {
						top.location = redirect_url;
					});
				} else {
					alert('You need to authorize the application before you can vote, share or invite friends.')
				}
			}
			, {
				scope : ''
			});
	});
}
function authorizeBeforeGotoSubmit(redirect_url,permission)
{
	authorizeBefore(redirect_url, 'You need to authorize the application before you can submit an entry', permission);
}
function authorizeBefore(redirect_url, msg, permission)
{
  console.log("callback authorizeBefore");
	FB.getLoginStatus(function(response) {
		FB.login(
			function(response) {
				if (response.authResponse) {
					FB.api('/me', function(response) {
//            console.log(response);
						top.location = redirect_url;
					});
				} else {
					alert(msg)
				}
			}
			, {
				scope : permission
			});
	});
}
function authorizeManagePages(redirect_url)
{
	FB.getLoginStatus(function(response) {
		FB.login(
			function(response) {
				if (response.authResponse) {
					FB.api('/me', function(response) {
						top.location = redirect_url;
					});
				} else {
					alert('You need to authorize the manage page permission before you can load your Fan Pages.')
				}
			}
			, {
				scope : 'manage_pages'
			});
	});
}
function fbShare(share_url)
{
	var url = 'http://www.facebook.com/sharer/sharer.php?u=' + share_url;
	window.open(
		url,
		'popUpWindow',
		'width=650,height=320,resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no'
	);
	return false;
}

function fbRemoveAppList(data)
{
	var arrReturn = [];
	for(id in data)
	{
		var page = data[id];
		if( page['category'] != 'Application')
		{
			arrReturn.push(page);
		}
	}
	return arrReturn;
}

function inviteFriends(entry_title, url)
{
	FB.ui({
		method: 'send',
		name: entry_title,
		link: url,
		display:'popup'
	});
}
function fbRecommend()
{
	var params = {};
	params['message']	= $(this).data('message');
	params['title']		= $(this).data('title');
	params['data']		= {};
	params['data']['id_object']		= $(this).attr('data-id_object');
	params['data']['id_page']		= $(this).attr('data-id_page');
	params['data']['object_type']	= $(this).data('object_type');
	fbSendAppRequests(params)
}
function share(share_url)
{
	window.open(
		'http://www.facebook.com/sharer/sharer.php?u=' + share_url,
		'popUpWindow',
		'width=650,height=320,resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no'
		);
	return false;
}
function fbSendAppRequests(params)
{
	FB.ui({
		method:		'apprequests',
		title:		params['title'],
		message:	params['message'],
		data:		params['data']
	});
}