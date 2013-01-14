function addTab(caption, url)
{
	if (caption.length > 30)
	{
		caption = caption.substr(0, 30) + "...";
	}
	$('#tabs').append('<li class="active"><a target="_top" href="'+url+'"><span class="tab_item tab_item_selected">'+caption+'</span></a></li>');
}

function selectTab(id)
{
	$('#' + id).addClass('active');
}

function currentList(index, num_page, class_name)
{
    var current_obj = $("#" + class_name + "_" + index);
    showList(current_obj);
    if (parseInt(index, 10) == 0)
        {
            $("#video_paginator .prev").addClass("disabled");
        }
    
    if (parseInt(index, 10) == parseInt(num_page, 10))
        {
            $("#video_paginator .next").addClass("disabled");
        }
    canvasScrollTo(0, 0);
}

function nextList(index, num_page, class_name)
{
    var current_obj = $("#" + class_name + "_" + index);
    hideList(current_obj);
    currentList(parseInt(index, 10) + 1, num_page, class_name);
    
    if (parseInt(index, 10) == 0)
        {
            $("#video_paginator .prev").removeClass("disabled");
        }
}

function prevList(index, num_page, class_name)
{
    var current_obj = $("#" + class_name + "_" + index);
    hideList(current_obj);
    
    currentList(parseInt(index, 10) - 1, num_page, class_name);
    
    if (parseInt(index, 10) == parseInt(num_page, 10))
        {
            $("#video_paginator .next").removeClass("disabled");
        }
}

function hideList(obj)
{
   obj.addClass("hidden");
}

function showList(obj)
{
    obj.removeClass("hidden");
}

function ajaxSendMessage(send_url, message, callback)
{
    $.post(
        send_url,
        {
            'message': message
        },
        callback
    );
}