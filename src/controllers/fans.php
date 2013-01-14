<?php

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\Request;



$fan = $app['controllers_factory'];

$fan->match('/', function (Request $request) use ($app) {
  $thumb_image = $_image = $_image_link = '';
  $active = 'html';
  $fbid = $app['facebook']->getUser();
  if ($fbid) {
    
    $post = $app['db']->fetchAssoc("SELECT * FROM content WHERE fid = ?", array((int) $fbid));
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
                                    'active' => $active
                              ));
});


return $fan;


