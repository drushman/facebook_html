<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Constraints as Assert;

$config = $app['controllers_factory'];
$config->match('/', function (Request $request, $type, $page_id) use ($app) {
  $thumb_image = $_image = $_image_link = $_html = $_iframe = $_type ='';
  $_height = 0;
  $active = 'html';
//  var_dump($type);
//  var_dump($page_id);
  // Check validate here
//  return true;
  $fbid = $app['facebook']->getUser();
  if (!$fbid) {
    return true;
  }
  $account = $app['facebook']->api('/me/accounts');
  $data = $account['data'];
  foreach ($data as $page) {
    if ($page['id'] == $page_id) {
      $found = TRUE;
    }
  }
  if (!$found) return "Page id not found";
    
  $post = $app['db']->fetchAssoc("SELECT * FROM content WHERE fid = ? AND page_id = ? AND type = ?", array( $fbid, $page_id, $type));
  if (!empty($post)) {
    $active = $post['active'];
    $domain = $request->getSchemeAndHttpHost();

    $path = dirname(dirname(__DIR__)) . '/web' . $post['image'];
    if (file_exists($path)) {
      $_image = $post['image'];
      $thumb_image = "{$domain}/{$post['image']}";
    }
    else {
      $_image_link = $post['image'];
      $thumb_image = $_image_link;
    }

    $_html = $post['html'];
    $_iframe = $post['iframe'];
    $_height = $post['iframe_height'];
    $_type = $post['type'];
  }
  
  $data = array('image' => $_image, 'link' => $_image_link);
  $image = $app['form.factory']->createBuilder('form', $data)
        ->add('image', 'file', array('label' => 'Upload', 'required' => FALSE,))
        ->add('link', 'url', array(
              'label' => 'Image link',
              'required' => FALSE,
              'constraints' => new Assert\Url()
          ))
        ->getForm();
  
  $data = array('html' => $_html);
  $html = $app['form.factory']->createBuilder('form', $data)
      ->add('html', 'textarea', array('label' => 'Html'))
      ->getForm();
  
  $data = array('link' => $_iframe, 'height' => $_height);
  
  $iframe = $app['form.factory']->createBuilder('form', $data)
        ->add('link', 'url', array(
            'label' => 'Iframe',
            'constraints' => array(new Assert\NotBlank(), new Assert\Url())
        ))
        ->add('height', 'integer', array('constraints' => new Assert\Max(1024)))
        ->getForm();
  
  return $app['twig']->render('form.twig', 
                              array('form_image' => $image->createView(), 
                                    'form_html' => $html->createView(),
                                    'form_iframe' => $iframe->createView(),
                                    'image' => $thumb_image,
                                    'active' => $active,
                                    'page_id' => $page_id, 
                                    'type' => $type,
                              ));
})
->convert('page_id', function ($page_id) { return (int) $page_id; });

return $config;