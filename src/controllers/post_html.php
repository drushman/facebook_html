<?php
//use Silex\Provider\FormServiceProvider;
use Symfony\Component\HttpFoundation\Request;
//use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\Response;



$post_html = $app['controllers_factory'];

$post_html->match('/', function (Request $request) use ($app){
  echo $request->getMethod();exit;
  if ('POST' == $request->getMethod()) {
    echo "callback"; exit;
  }
  
  $html = $app['form.factory']->createBuilder('form')
      ->add('html', 'textarea', array('label' => 'Html'))
      ->getForm();
  
  $html->bind($request);
  
  if ($html->isValid()) {
      $data = $html->getData();
      
//      $files = $request->files->get($form->getName());
//      $uploadedFile = $files['attachment']; //"dataFile" is the name on the field
//      $uploadedFile->move(__DIR__ . "/uploads", $uploadedFile->getClientOriginalName());
      var_dump($data);
      return true;
  }
});
//echo "callback"; exit;
return $post_html;