$(function() {
  $("input:radio[name='content_type']").click(function() {
    $(".group-hidden").hide();
    $("#form-"+$(this).val()).show();
  });
  
  
  $(document).ready(function() {
    
    FB.init({
      appId      : '130388247122711', // App ID from the App Dashboard
      channelUrl : "http://apps.facebook.com/vchtmlapp",
      status     : true, // check the login status upon init?
      cookie     : true, // set sessions cookies to allow your server to access the session?
      xfbml      : true  // parse XFBML tags on this page?
    });
    
    FB.getLoginStatus(function(response) {
      if (response.status != 'connected' &&  response.status != 'not_authorized') {
        $url  = "http://www.facebook.com/dialog/oauth/";
        $url += "?client_id=YOUR_APP_ID";
        $url += "&redirect_uri=YOUR_REDIRECT_URL";
        $url += "&state=YOUR_STATE_VALUE";
        $url += "&scope=COMMA_SEPARATED_LIST_OF_PERMISSION_NAMES";
//        $url += "";
//        $url += "";
//        $url += "";
//        $url += "";
        var obj = {
          method: 'pagetab',
          redirect_uri: 'http://apps.facebook.com/vchtmlapp/admin/index/config/'
        };
        FB.ui(obj);
      }
    });
    
    
  });
  
  
});
  