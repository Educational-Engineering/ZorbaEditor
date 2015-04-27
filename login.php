<?php
if(!defined('include_allowed')) {
    die('Direct access not permitted');
}
?>
<div class="container">
    <?php if ($_SESSION['alertmessage'] != ""):
        $alerttyp = strpos($_SESSION['alertmessage'], 'OK') > (-1) ? 'success' : 'warning';
        ?>
        <div class="alert alert-<?php echo $alerttyp; ?> alert-dismissible" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span
                    aria-hidden="true">&times;</span></button>
            <?php echo $_SESSION['alertmessage']; ?>
        </div>
        <?php
        $_SESSION['alertmessage'] = "";
    endif; ?>
    <form class="form-signin" method="post" action="index.php?uaction=login" autocomplete="off">
        <h2 class="form-signin-heading">Please sign in</h2>
        <label for="inputEmail" class="sr-only">Email address</label>
        <input type="text" id="inputEmail" class="form-control" name="username" placeholder="Username" required autofocus>
        <label for="inputPassword" class="sr-only">Password</label>
        <input type="password" id="inputPassword" class="form-control" placeholder="Password" name="password" required>
        <div class="checkbox">
            <label>
                <input type="checkbox" value="remember-me"> Remember me
            </label>
        </div>
        <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
    </form>

</div>
