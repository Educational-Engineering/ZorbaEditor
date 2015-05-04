<?php
/**
 * Created by IntelliJ IDEA.
 * User: Matthias
 * Date: 01.05.2015
 * Time: 09:58
 */


$string = strtr(base64_encode(openssl_random_pseudo_bytes(30)), '+/=', '-_,');
echo $string;

?>