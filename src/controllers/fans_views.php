<?php
use Symfony\Component\HttpFoundation\Request;


$fan_view = $app['controllers_factory'];
$fan_view->match('/', function(Request $request) use ($app) {

  
//  
  
//  $fbid = $app['facebook']->getUser();
//  $token = "AAADjin7DxTgBAHgz3pNgAiJnc7vcP45mrCgpZAZBxVjKKXPA9OnkWIyYcAGrpJFM1ZAhIuM3iGFla0VPu6ZA9mH1IuSHmbk4JAZCZBgO3gJgZDZD";
//  $app['facebook']->setAccessToken($token);
  $fbid = $app['facebook']->getUser();
//  var_dump($fbid);exit;
////  var_dump($fbid);
  if (empty($fbid)) {
//      $loginUrl = $app['facebook']->getLoginUrl(array( 'next' => "http://apps.facebook.com/vchtmlapp"));
      $loginUrl = $app['facebook']->getLoginUrl();
//    echo $loginUrl;
//    print "<a href={$loginUrl}></a>";
//    var_dump($loginUrl); exit;
//      return http_redirect($loginUrl);
//    return $app->redirect($loginUrl);
  }
//  else {
//    $pageUrl = "https://www.facebook.com/dialog/pagetab?app_id=";
//    $pageUrl .= "{$app['facebook']->getAppId()}&next={$request->getSchemeAndHttpHost()}/fans";
//    return $app->redirect($pageUrl);
//  }
//  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
//$app['facebook']->setAccessToken('');
//echo $app['facebook']->getAccessToken();
//  exit;
//$loginUrl = $app['facebook']->getLoginUrl(array( 'next' => "http://apps.facebook.com/vchtmlapp"));
////echo $loginUrl; exit;
//return $app->redirect($loginUrl);      
//  // Get User ID
  $signed_request = $app['facebook']->getSignedRequest();
//  var_dump($signed_request['page']['id']);exit;
  $page_id = $signed_request['page']['id'];
////  $signed_request = $app['facebook']->getapp_data();
// 
//  $fbid = $app['facebook']->getUser();
//  $naitik = $app['facebook']->api("/me/accounts");
  
  //Create Query
//  $params = array(
//      'method' => 'fql.query',
//      'access_token' => $signed_request['oauth_token'],
////      'query' => "SELECT uid, pic, pic_square, name FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = 100004785217220)",
//      'query' => "SELECT page_id from page_admin where uid = '100004785217220'",
//
//  );
//  $result = $app['facebook']->api($params);
//  var_dump($result);
  
  
  
//  var_dump($naitik);
//  var_dump($signed_request);
//  $page_id = $signed_request["page"]["id"];
//  $is_admin = $signed_request["page"]["admin"];
//  $is_liked = $signed_request["page"]["liked"];
//  echo "----------------------";
//  echo "page" . $page_id;
//  echo "----------------------";
//  echo $is_admin;
//  echo "----------------------";
//  echo $is_liked;
//  var_dump($fbid);
//  exit;
  
  
  
  
  
  
  
  
  if ($fbid) {
   $post = $app['db']->fetchAssoc("SELECT * FROM content WHERE page_id = ?", array($page_id));
//   var_dump($post);exit;
    if (!empty($post)) {
      $active = $post['active'];
      $domain = $request->getSchemeAndHttpHost();
      
      $path = dirname(dirname(__DIR__)) . '/web' . $post['image'];
      $_image = file_exists($path) ? "{$domain}/{$post['image']}" : $post['image'];
      $_html = $post['html'];
      $_iframe = $post['iframe'];
      $_height = $post['iframe_height'];
      $_type = $post['type'];
    }
  }
  
  // Login or logout url will be needed depending on current user state.
//  if ($user) {
//    $logoutUrl = $app['facebook']->getLogoutUrl();
//    var_dump($user);
//  } else {
//    $loginUrl = $app['facebook']->getLoginUrl(array( 'next' => $request->getSchemeAndHttpHost() . '/fans' ));
//  }
  
  $pageUrl = "{$app['facebook']->getAppId()}&next={$request->getSchemeAndHttpHost()}/fans";
  
//  $active = 0;
//  
////  $image = 'http://html.app.drupal.vc/uploads/bear.JPG';
//  $html = '';
//  if ($active ==  'html') {
//    return $_html;
//  }
  
  return $app['twig']->render('fan-view.twig', array(
                              'user' => $fbid,
                              'logoutUrl' => isset($logoutUrl) ? $logoutUrl : '',
                              'loginUrl' => isset($loginUrl) ? $loginUrl : '',
                              'pageUrl' => isset($pageUrl) ? $pageUrl : '',
                              'image' => isset($_image) ? $_image : '',
                              'html' => isset($_html) ? $_html : '',
                              'iframe' => isset($_iframe) ? $_iframe : '',
                              'iframe_height' => isset($_height) ? $_height : '',
                              'active' => isset($active) ? $active : '',
  )); 
  
});

return $fan_view;
