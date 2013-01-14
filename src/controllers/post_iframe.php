<?php
use Silex\Provider\FormServiceProvider;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\Response;

$post_iframe = $app['controllers_factory'];
$post_iframe->post('/iframe/config', function (Request $request) use ($app) {
  $form->bind($request);
  
  if ($form->isValid()) {
      $data = $form->getData();
      $files = $request->files->get($form->getName());
      $uploadedFile = $files['attachment']; //"dataFile" is the name on the field
      $uploadedFile->move(__DIR__ . "/uploads", $uploadedFile->getClientOriginalName());

      return true;
  }
});
return $post_iframe;