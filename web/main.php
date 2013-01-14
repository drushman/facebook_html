<?php

namespace VietCoop;
require_once __DIR__. '/../vendor/facebook/php-sdk/src/facebook.php';


use Silex\Application;
use Silex\ServiceProviderInterface;
use Silex\Provider\FormServiceProvider;
use Silex\Provider\TwigServiceProvider;
use Silex\Provider\UrlGeneratorServiceProvider;
use Silex\Provider\ValidatorServiceProvider;
use Silex\Provider\TranslationServiceProvider;
use Symfony\Component\HttpFoundation\Request;
use Silex\Provider\DoctrineServiceProvider;
use Symfony\Component\HttpFoundation\Response;


class Main {
  private $app;
  private $facebook_url;
  function __construct() {
    
    $this->app =  new Application();
    $this->facebook_url = "http://apps.facebook.com/vchtmlapp";
    $this->app['debug'] = TRUE;
  }
  
  public function registers() {
    $this->app->register(new TranslationServiceProvider(), array(
      'translator.messages' => array(),
    ));

    $this->app->register(new ValidatorServiceProvider());
    $this->app->register(new FormServiceProvider());
    $this->app->register(new UrlGeneratorServiceProvider());
    $this->app->register(new TwigServiceProvider(), array(
      'twig.path' => __DIR__.'/views',
    ));
    
    $this->app->register(new DoctrineServiceProvider(), array(
      'db.options' => array(
          'driver'   => 'pdo_sqlite',
          'path'     => __DIR__.'/../db.sqlite',
      ),
    ));

    $this->app->register(new FacebookServiceProvider(), array(
      'facebook.app_id'     => '130388247122711',
      'facebook.secret'     => '992afca98a9b2bda2f9459d9e110f570',
    ));
//    $this->app->register(new FacebookServiceProvider(), array(
//      'facebook.app_id'     => '478111825542946',
//      'facebook.secret'     => 'fc56199f5dd44b33f00c9b866a859370',
//    ));
    
    $this->app->register(new FacebookProfile(), array(
      'db'  => $this->app['db'],
    )); 
    
    if (isset($app['assetic.enabled']) && $app['assetic.enabled']) {
      $app->register(new AsseticExtension(), array(
          'assetic.options' => array(
              'debug'            => $app['debug'],
              'auto_dump_assets' => $app['debug'],
          ),
          'assetic.filters' => $app->protect(function($fm) use ($app) {
              $fm->set('yui_css', new Assetic\Filter\Yui\CssCompressorFilter(
                  $app['assetic.filter.yui_compressor.path']
              ));
              $fm->set('yui_js', new Assetic\Filter\Yui\JsCompressorFilter(
                  $app['assetic.filter.yui_compressor.path']
              ));
          }),
          'assetic.assets' => $app->protect(function($am, $fm) use ($app) {
              $am->set('styles', new Assetic\Asset\AssetCache(
                  new Assetic\Asset\GlobAsset(
                      $app['assetic.input.path_to_css'],
                      array()
                  ),
                  new Assetic\Cache\FilesystemCache($app['assetic.path_to_cache'])
              ));
              $am->get('styles')->setTargetPath($app['assetic.output.path_to_css']);

              $am->set('scripts', new Assetic\Asset\AssetCache(
                  new Assetic\Asset\GlobAsset(
                      $app['assetic.input.path_to_js'],
                      array()
                  ),
                  new Assetic\Cache\FilesystemCache($app['assetic.path_to_cache'])
              ));
              $am->get('scripts')->setTargetPath($app['assetic.output.path_to_js']);
          })
      ));
    }
  }
  
  public function mounts() {
    $app = $this->app;
    $app->mount('/admin/fans', include __DIR__ . '/../src/controllers/fans.php');
    $app->mount('/fans', include __DIR__ . '/../src/controllers/fans_views.php');
    $app->mount('/admin/index/config', include __DIR__ . '/../src/controllers/fans_install.php');
    $app->mount('/non-fans', include __DIR__ . '/../src/controllers/non_fans_views.php');
    $app->mount('admin/config/{type}/id_page/{page_id}', include __DIR__ . '/../src/controllers/config.php');
    
    $this->app =  $app;
  }
  
  public function routers() {
    $app = $this->app;
    
    $app->post('/post/html/{type}/{page_id}', function (Request $request, $type, $page_id) use ($app) {
      $html = $app['form.factory']->createBuilder('form')
      ->add('html', 'textarea', array('label' => 'Html'))
      ->getForm();
      
      $html->bind($request);

      if ($html->isValid()) {
          $data = $html->getData();
          $fbid = $app['facebook']->getUser();
          if (!$fbid) return 'not login';
          
          $post = $app['db']->fetchAssoc("SELECT * FROM content WHERE fid = ? AND page_id = ? AND type = ?", array($fbid, $page_id, $type));
          if (empty($post)) {
            $app['db']->insert("content", array(
              'fid'     => $fbid,
              'html'    => $data['html'],
              'active'  => 'html',
              'page_id'    => $page_id,
              'type'    => $type,
            ));
          }
          else {
            $app['db']->update("content", 
              array(
                'html'    => $data['html'],
                'active'  => 'html',
              ),
              array(
                'fid'     => $fbid,
                'page_id'     => $page_id,
                'type'     => $type,
              )
            );
          }
          return $app->redirect("{$this->facebook_url}/admin/config/{$type}/id_page/{$page_id}");
      }
    });
    
    $app->post('/post/image/{type}/{page_id}', function (Request $request, $type, $page_id) use ($app) {
      
      $image = $app['form.factory']->createBuilder('form')
        ->add('link', 'text', array(
            'label' => 'Image link',
        ))
        ->add('image', 'file', array('label' => 'Upload'))
        ->getForm();
      $image->bind($request);
      
      if ($image->isValid()) {
          $fbid = $app['facebook']->getUser();
          if (!$fbid) return 'not login';
        
          $data = $image->getData();
          if (!empty($data['image'])) {
            $path = __DIR__.'/uploads/'.$fbid;
            $filename = $data['image']->getClientOriginalName();
            $data['image']->move($path,$filename);
            $uri = "/uploads/{$fbid}/{$filename}";
          }
          if (!empty($data['link'])) {
            $uri = $data['link'];
          }
          
          if (!isset($uri)) return $app->redirect('/admin/fans');
          
          $post = $app['db']->fetchAssoc("SELECT * FROM content WHERE fid = ? AND page_id = ? AND type = ?", array($fbid, $page_id, $type));
          
          if (!empty($post)) {
            $app['db']->update("content", 
                array(
                  'image' => $uri, 
                  'active' => 'image'
                ), 
                array(
                  'fid' => $fbid,
                  'page_id' => $page_id,
                  'type'     => $type,
            ));
          }
          else {
            // Insert here
            $app['db']->insert("content", array(
              'fid'     => $fbid,
              'image'    => $uri,
              'active'  => 'image',
              'page_id'    => $page_id,
              'type'    => $type,
            ));
          }
          
          return $app->redirect("{$this->facebook_url}/admin/config/{$type}/id_page/{$page_id}");
      }
    });
    
    $app->post('/post/iframe/{type}/{page_id}', function (Request $request, $type, $page_id) use ($app) {
      $iframe = $app['form.factory']->createBuilder('form')
        ->add('link', 'text', array(
            'label' => 'Iframe',
        ))
        ->add('height', 'integer')
        ->getForm();
      
      $iframe->bind($request);

      if ($iframe->isValid()) {
          $data = $iframe->getData();

          $fbid = $app['facebook']->getUser();
          if (!$fbid) return 'not login';
          
          
          $post = $app['db']->fetchAssoc("SELECT * FROM content WHERE fid = ? AND page_id = ? AND type = ?", array($fbid, $page_id, $type));
          if (empty($post)) {
            $app['db']->insert("content", array(
              'fid'     => $fbid,
              'iframe'  => $data['link'],
              'iframe_height' => $data['height'],
              'active'  => 'iframe',
              'page_id'    => $page_id,
              'type'    => $type,
            ));
          }
          else {
            $app['db']->update("content", 
              array(
                'iframe'  => $data['link'],
                'iframe_height' => $data['height'],
                'active'  => 'iframe',
              ),
              array(
                'fid' => $fbid,
                'page_id'     => $page_id,
                'type'     => $type,
              )
            );
          }
          return $app->redirect("{$this->facebook_url}/admin/config/{$type}/id_page/{$page_id}");
      }
    });
    $this->app =  $app;
  }
  
  public function run() {
    $this->app->run();
  }
  
  
}


class FacebookServiceProvider implements ServiceProviderInterface
{
    public function register(Application $app)
    {
        $app['facebook'] = $app->share(function () use ($app) {
            return new \Facebook(array(
                'appId'  => $app['facebook.app_id'],
                'secret' => $app['facebook.secret'],
            ));
        });
    }

    public function boot(Application $app)
    {
    }
}

class FacebookProfile implements ServiceProviderInterface
{
  public function register(Application $app)
  {        
      $app['facebook_profile'] = $app->share(function () use ($app) {
        $fbid = '111111111';
        $sql = "SELECT * FROM content WHERE fid = ?";
        $profile = $app['db']->fetchAssoc($sql, array((int) $fbid));
        return $profile;
      });
  }

  public function boot(Application $app)
  {
  }
}


//class DBHandle
//{
//  public $app;
//  public function __construct($app) {
//    $this->app = $app;
//  }
//  
//  // condition array($col => 'value')
//  public function db_select($conditions) {
//    $condition = '';
//    foreach ($conditions as $col => $value) {
//      if (in_array(strtolower($col), array('end', 'or'))) {
//        $condition .= " {$col} ";
//      }
//      $condition =  " {$col} = $value ";
//    }
//    $sql = "select * from content where {$condition}";
//    $result = $app['db']->fetchAll($sql);
//    return $result;
//  }
//  
//  public function db_write_record($values) {
//    $condition = '';
//    foreach ($values as $col => $value) {
//      $condition =  " and {$col} = $value ";
//    }
//    $sql = "select * from content where {$condition}";
//    
//  }
//}