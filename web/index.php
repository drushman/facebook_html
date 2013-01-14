<?php

require_once __DIR__.'/../vendor/autoload.php';
require_once __DIR__.'/main.php';
use VietCoop\Main;

$main = new Main();
$main->registers();
$main->mounts();
$main->routers();
$main->run();