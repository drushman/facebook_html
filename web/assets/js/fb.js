function postToWall(id, title, desc)
{
	FB.ui(
	{
		method: 'feed',
		app_id: social_app_id, 	
		name: title,
		link: social_app_url + '/survey/survey/view/id/' + id + '/id_ref/' + social_user_id,
		picture: 'http://demo.modules2buy.com/fbsurvey/public/img/logo.jpg',
		caption: 'Advanced Survey on Facebook',
		description: desc
	},
	function(response) {
		//top.location.href = social_app_url + '/survey/survey/wall/id/' + id;
		});
}

var id_time_out = [];

var checkIsInstalledPage = function(fanpage,callback)
{
    FB.api('/' + fanpage[0], function(response) {
        if (response.has_added_app)
        {
        	clearTimeout(id_time_out[fanpage[0]]);
        	callback(true);
			
        	var id_page = fanpage[0];
			var tabs_added  = {};
			tabs_added[id_page] = 1;
			$.get(base_url,{
				'tabs_added': tabs_added
			});
			
            alert("You have installed YouTube application on fanpage '" + fanpage[1] + "' successfully.");
        }
        else{
        	clearTimeout(id_time_out[fanpage[0]]);
        	id_time_out[fanpage[0]] = setTimeout(function(){
                	checkIsInstalledPage(fanpage,callback);
            },2000); 
        }
    });
};

function fanPageInstalled(fanpage, callback)
{
	result = FB.api('/' + fanpage[0], function(response) {
		if (response.has_added_app == undefined)
		{
			callback(false);
			if (confirm("Please add Gallery application on fanpage '" + fanpage[1] + "' first."))
			{
				window.open("http://www.facebook.com/add.php?api_key=" + social_app_id + "&pages=1&page=" + fanpage[0], '_blank');
				
				id_time_out[fanpage[0]] = setTimeout(function(){
		            checkIsInstalledPage(fanpage,callback);
		        },2000);				
            }
		}
	});
}

function confirmInstall(id_page, callback)
{
    FB.api('/' + id_page, function(response) {
        if (response.has_added_app)
        {
        	clearTimeout(id_time_out[id_page]);
            windowInstallPage.close();
			
			var tabs_added  = {};
			tabs_added[id_page] = 1;
			$.get(base_url,{
				'tabs_added': tabs_added
			});
			
            alert("You have installed Welcome application on Fan Page successfully.");
            callback();
        }
        else{
        	clearTimeout(id_time_out[id_page]);
        	id_time_out[id_page] = setTimeout(function(){
                	confirmInstall(id_page,callback);
            },2000); 
        }
    });
}

function isPageInstalled(id_page, callback)
{
      
	result = FB.api('/' + id_page, function(response) {
             
		if (response.has_added_app == undefined)
		{
                   
                    if (confirm("Please install Welcome application on this Fan Page. Click OK"))
                    {
                        windowInstallPage = window.open("http://www.facebook.com/add.php?api_key=" + social_app_id + "&pages=1&page=" + id_page, 
                        '_blank',
                        'width=650,height=320,resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no');

                        id_time_out[id_page] = setTimeout(function(){
                            confirmInstall(id_page,callback);
                        },2000);
                    }
                    else
                    {
                        $("#id_page").val(current_page);
                    }
		}
		else
		{
			callback();
			return true;
		}
	});
}

function getPageUrl(page_name, page_id){
    var expr = /[^a-zA-Z 0-9]+/g;
    page_name = page_name.replace(expr, "");
	var page_addr = 'http://facebook.com/pages/'+page_name+'/'+page_id+'?sk=app_'+ social_app_id ;
	return page_addr;
}

function goToPage (page_name, page_id)
{
	var url = getPageUrl(page_name, page_id);    
    window.open(url, '_blank');
}

function manageFanpages(redirect_url, scope)
{
    var msg = 'You need to authorize the manage page permission before you can load your fanpages.';
	FB.login(
		function(response) {
//            console.log(response);return;
            if (response.authResponse) {
                authorizeBefore(redirect_url, msg, "manage_pages, email");
            }
            else 
            {
                alert(msg)
            }
		}
		, { scope : scope }
	);	
}

function markPageInstalled(id_page, item)
{
	result = FB.api('/' + id_page, function(response) {
		if (response.has_added_app)
		{
			var image = " <img width='16' title='Already installed' src='" + base_url +"/images/check.png'/>";
			item.parent().append(image);
		}
	});
}

function addCommentTimeline (object, href)
{
	$(object).html('<fb:comments href="' + href + '" num_posts="5" width="510"></fb:comments>');
	FB.XFBML.parse();
}

function finishedLoad(callback)
{
	FB.getLoginStatus(function(response) {
		callback();
		FB.XFBML.parse();
	});
}

function canvasScrollTo(left,top)
{
	FB.Canvas.scrollTo(left,top);
}