<?php
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Form\AbstractType;

require_once(__DIR__.'/../Form/Type/ImageType.php');

$non_fan = $app['controllers_factory'];

$non_fan->match('/', function (Request $request) use ($app) {
  $profile = $app['facebook_profile'];

  $image = $app['form.factory']->createBuilder('form')
        ->add('link', 'text', array(
            'label' => 'Image link',
            'constraints' => new Assert\Url()
        ))
        ->add('image', 'file', array('label' => 'Upload'))
        ->add('image_filed',new ImageType(),array('attr' => array('src' => $profile['image'])))
        ->getForm();
    
  $html = $app['form.factory']->createBuilder('form')
      ->add('html', 'textarea', array('label' => 'Html'))
      ->getForm();
  
  $iframe = $app['form.factory']->createBuilder('form')
        ->add('link', 'text', array(
            'label' => 'Iframe',
            'constraints' => array(new Assert\NotBlank(), new Assert\Url())
        ))
        ->add('height', 'integer', array('constraints' => new Assert\Max(1024)))
        ->getForm();
  
  return $app['twig']->render('form.twig', 
                              array('form_image' => $image->createView(), 
                                    'form_html' => $html->createView(),
                                    'form_iframe' => $iframe->createView()
                              ));
});

return $non_fan;