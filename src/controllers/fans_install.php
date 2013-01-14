<?php

use Symfony\Component\HttpFoundation\Request;


$install = $app['controllers_factory'];
$install->match('/', function (Request $request) use ($app) {
  $signed_request = $app['facebook']->getSignedRequest();
  $pages = array();
  
//  $app['facebook']->setAccessToken(NULL);
  $user = $app['facebook']->getUser();
//  var_dump($user);
//  return true;
  
  if ($user) {
    $account = $app['facebook']->api('/me/accounts');
    $data = $account['data'];
    foreach ($data as $page) {
      $pages[$page['id']] = $page['name'];
//      $menu->url  = "/admin/config/page/{$page['id']}/";
//      $menu->text = "type"
    } 
  }
  
  
  
  return $app['twig']->render('install.twig', array('pages' => $pages));
});

return $install;