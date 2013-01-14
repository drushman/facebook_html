$(function() {
  
  console.log("document ready");
  var oauth_scope = 'email';
  $("#config_add_to_page").click(function(){
    var id_page = $("#config_id_page").val();
    if (id_page != "")
    {
      var redirect_url = "http://apps.facebook.com/ym-welcome/admin/index/config/id_page/" + id_page;
                        isPageInstalled(id_page, function(){
                            top.location = redirect_url;
                        });
                        console.log("callbakc");
    }
    else
    {
                    alert("You must select a Fan Page or click Refresh to load the list of your Fan Pages");
    }		
	});
  
  
  $("#config_refresh_pages").click(function(){
        var redirect_url = 'http://apps.facebook.com/vchtmlapp/admin/index/config/';
        manageFanpages(redirect_url, oauth_scope);
  });
    
    
  function loadFanPages()
  {
      FB.login(
          function(response) {
              showFanpages();
          }
          , { scope : 'manage_pages' });  
  }
    
  function showFanpages()
  {
    var reload = $("#reload").length;
    if(reload>0){
      FB.api('/me/accounts', function(response) {
        var data = response.data;
        var html ='';
        for (id in response.data)
        {
          page = data[id];
          html += "<li><input type='checkbox' name='fanpages[]' value='" + page.id + "'> " + page.name + "</li>";
          $('#load_my_fanpage').remove();
        }
        if (html != '')
        {
          $('.sm_listfan').html(html);
        }
        if(is_runned && html=='')
        {
          /*create new fanpage is defined in initHead in module facebook*/
          $('.sm_listfan').html('<li>No fanpage found - <a target="_parent" href="' + social_url_fanpage_create + '">Create a Page</a></li>');
        }
        //select fanpage by default on top url
         checkPageByDefault('<?php echo $this->id_page; ?>',$('input[value="<?php echo $this->id_page; ?>"]'))
      });
    }
    $("input[name='fanpages[]']").each(function(){
      markPageInstalled($(this).val(), $(this));
    });
  }
    
    
    
    
    function initButtonGo()
    {
        var id_page = $("#id_page").val();
        if (id_page != "")
        {
            $("#gotopage").show();
        }
        else
        {
            $("#gotopage").hide();
        }
    }

    initButtonGo();

    $("#id_page").change(function(){
        var id_page = $("#id_page").val();
        var canvasUrl = "http://apps.facebook.com/vchtmlapp/admin/index/config/";
        if (id_page != "")
        {
            canvasUrl = canvasUrl + '/id_page/' + id_page;
            isPageInstalled(id_page, function(){
                top.location = canvasUrl;
            });
        }
        else
        {
            top.location = canvasUrl;
        }
    });

    $("#gotopage").click(function(){
        var page_id = $("#id_page").val();
        var page_name = $("#id_page").find("option:selected").text();

        if (page_id != "")
        { 
            goToPage(page_name, page_id);
        }
        else
        {
            alert("Please select a Fan Page to configure");
        }		
    });

    $("#allow_manage_fanpages").click(function(){
        var redirect_url = "http://apps.facebook.com/vchtmlapp/admin/index/config/";
        manageFanpages(redirect_url, oauth_scope);
    });

    var current_page = "";
    $("#id_page").val(current_page);

//    $(".ym_menu a").adjustText({defaultWidth:450});
  
});