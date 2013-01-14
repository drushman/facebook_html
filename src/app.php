<?php

use Silex\Provider\FormServiceProvider;
use Silex\Provider\TwigServiceProvider;
use Silex\Provider\UrlGeneratorServiceProvider;
use Silex\Provider\ValidatorServiceProvider;
use SilexAssetic\AsseticExtension;

$app->register(new ValidatorServiceProvider());
$app->register(new FormServiceProvider());
$app->register(new UrlGeneratorServiceProvider());
$app->register(new TwigServiceProvider(), array(
    'twig.path'           => array(__DIR__ . '/views')
));
$app['debug'] = true;
//print_r($app['twig']->render('form.twig')); exit;

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
                    // Yui compressor is disabled by default.
                    // If you need it, and you have installed it, uncomment the
                    // next line, and delete "array()"
                    //array($fm->get('yui_css'))
                    array()
                ),
                new Assetic\Cache\FilesystemCache($app['assetic.path_to_cache'])
            ));
            $am->get('styles')->setTargetPath($app['assetic.output.path_to_css']);

            $am->set('scripts', new Assetic\Asset\AssetCache(
                new Assetic\Asset\GlobAsset(
                    $app['assetic.input.path_to_js'],
                    // Yui compressor is disabled by default.
                    // If you need it, and you have installed it, uncomment the
                    // next line, and delete "array()"
                    //array($fm->get('yui_js'))
                    array()
                ),
                new Assetic\Cache\FilesystemCache($app['assetic.path_to_cache'])
            ));
            $am->get('scripts')->setTargetPath($app['assetic.output.path_to_js']);
        })
    ));
}

$app->register(new Silex\Provider\DoctrineServiceProvider());

$app->mount('/fans', include __DIR__ . '/controllers/fans.php');
