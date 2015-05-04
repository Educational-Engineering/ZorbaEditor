<?php
session_start();
define('include_allowed', true);
include 'mongoConnection.php';
include 'usermanager.php';

$content = isset($_GET['content']) ? $_GET['content'] : "";
$siteURL = 'http://'.$_SERVER['HTTP_HOST'].dirname($_SERVER['PHP_SELF']);

if (!isset($_SESSION['loggedin'])) {
    $_SESSION['loggedin'] = false;
    $_SESSION['loggedinUsername'] = "";
    $_SESSION['loggedinIsAdmin'] = false;
    $_SESSION['alertmessage'] = "";
}

if (isset($_GET['uaction']) && $_GET['uaction'] == 'login') {
    //try to log in
    $res = login($_POST['username'], $_POST['password']);
    if ($res == 'OK') {
        $_SESSION['loggedin'] = true;
        $_SESSION['loggedinUsername'] = $_POST['username'];
        $_SESSION['loggedinIsAdmin'] = isAdmin($_POST['username']);
        $_SESSION['alertmessage'] = "";
        header('Location: '.$siteURL.'/');
    } else {
        //die("LOGINFAILED: ".$res);
    }
} elseif (isset($_GET['uaction']) && $_GET['uaction'] == 'logout') {
    $_SESSION['loggedin'] = false;
    $_SESSION['loggedinUsername'] = "";
    $_SESSION['loggedinIsAdmin'] = false;
    $_SESSION['alertmessage'] = "";
} elseif (isset($_GET['uaction']) && $_GET['uaction'] == 'changepw') {
    $res = changePw($_SESSION['loggedinUsername'], $_POST['passwordold'], $_POST['passwordnew']);
    if ($res == 'OK') {
        //logout
        $_SESSION['loggedin'] = false;
        $_SESSION['loggedinUsername'] = "";
        $_SESSION['loggedinIsAdmin'] = false;
        $_SESSION['alertmessage'] = "OK - Password changed succesfully";
    }
}


//USER ACTIONS
if (!$_SESSION['loggedinIsAdmin'] && $content == 'users') {
    die('You have to be admin to view and edit users!');
}
if ($content == 'users' && isset($_GET['uaction'])) {
    $alertMessage = "";
    switch ($_GET['uaction']) {
        case 'addUser':
            if ($_POST['password'] == $_POST['passwordcheck']) {
                $isadmin = isset($_POST['isadmin']);
                $res = addUser($_POST['username'], $_POST['password'], $isadmin);
                $alertMessage = $res;
            } else {
                $alertMessage = "ERROR - Passwords don't match!";
            }
            break;
        case 'changeisadmin':
            $res = changeIsAdmin($_GET['username'], $_GET['isadmin'] == '1');
            $alertMessage = $res;
            break;
        case 'deleteuser':
            $res = deleteUser($_GET['username']);
            $alertMessage = $res;
            break;
        case 'changepw':
            $res = changePw($_POST['username'], $_POST['oldpassword'], $_POST['newpasswordisadmin']);
            $alertMessage = $res;
            break;
    }
    $_SESSION['alertmessage'] = $alertMessage;

    header('Location: '.$siteURL.'/?content=users');
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <meta name="description" content="">
    <meta name="author" content="">

    <title>Dashboard Template for Bootstrap</title>

    <script type='text/javascript' src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script type='text/javascript' src="js/bootstrap.min.js"></script>
    <script type='text/javascript' src="ace/ace.js"></script>
    <script type='text/javascript' src="js/typeahead.js/typeahead.jquery.js"></script>
    <script type='text/javascript' src="js/Chart.js"></script>
    <script tpye='text/javascript' src="js/dropzone.js"></script>
    <script type="text/javascript" src="js/spectrum.js"></script>


    <!-- Bootstrap core CSS -->
    <link href="css/bootstrap.min.css" rel="stylesheet">

    <link href="css/spectrum.css" rel="stylesheet"/>
    <link href="css/dropzone/dropzone.css" rel="stylesheet">

    <!-- Custom styles for this template -->
    <link href="style.css" rel="stylesheet">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->

    <script type='text/javascript'>//<![CDATA[
        $(function () {
            var editor = ace.edit("editor");
            editor.setTheme("ace/theme/chrome");
            editor.getSession().setMode("ace/mode/javascript");
            editor.getSession().setUseWorker(false);

        });//]]>

        var global_PAGEDIR = '<?php echo $siteURL; ?>';

    </script>

    <script type='text/javascript' src="styling.js"></script>
    <script type='text/javascript' src="script2.js"></script>


</head>

<body>

<nav class="navbar navbar-fixed-top navbar-coloured">
    <div class="container-fluid">
        <div class="navbar-header">
            <span class="navbar-brand" href="#"><i>ZORBA Query Editor</i></span>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
            <ul class="nav navbar-nav navbar-right">
                <li><a href="?content=info">Info / &Uuml;ber</a></li>
                <?php if ($_SESSION['loggedin']): ?>
                    <li><a href="?content=editor">Editor</a></li>
                    <?php if ($_SESSION['loggedinIsAdmin']): ?>
                        <li><a href="?content=users">Userlist</a></li>
                    <?php endif; ?>
                    <li><a href="" data-toggle="modal" data-target=".bs-changepw-modal-lg">Change Password</a></li>
                    <li><a href="?uaction=logout">Logout <?php echo $_SESSION['loggedinUsername']; ?></a></li>
                <?php endif; ?>
            </ul>

        </div>
    </div>
</nav>

<?php



if ($_SESSION['loggedin']) {

    if ($content == 'users')
        include 'users.php';
    elseif ($content == 'info')
        include 'info.php';
    else
        include 'editor.php';

} else {
    if ($content == 'info')
        include 'info.php';
    else
        include 'login.php';
}



?>

<?php include 'snippets/modal-changepw.php'; ?>

</body>
</html>
