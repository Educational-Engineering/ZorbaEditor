<?php


$users = listUsers();

?>
<div class="container">
    <div class="row">
        <?php if ($_SESSION['alertmessage'] != ""):
            $alerttyp = strpos($_SESSION['alertmessage'], 'OK') > (-1) ? 'success' : 'warning';
            ?>
            <div class="alert alert-<?php echo $alerttyp; ?> alert-dismissible" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span
                        aria-hidden="true">&times;</span></button>
                <strong>Warning!</strong><?php echo $_SESSION['alertmessage']; ?>
            </div>
        <?php
            $_SESSION['alertmessage'] = "";
        endif; ?>
        <div class="col-md-8">

            <div class="row">
                <h3 class="page-header expandable expanded">Userlist</h3>
                <table class="table">
                    <tbody>
                    <tr>
                        <th>Username</th>
                        <th>Is Admin</th>
                        <th>Last Login</th>
                        <th>IP</th>
                        <th>Host address</th>
                        <th>Delete</th>
                    </tr>
                    <?php foreach ($users as $user):
                        $lastLogin = new DateTime();
                        $lastLogin = date_timestamp_set($lastLogin, $user['lastLogin']);
                        ?>
                        <tr>
                            <td><?php echo $user['username']; ?></td>
                            <td><?php echo $user['isadmin'] ? 'yes' : 'no'; ?>&nbsp;
                                <a href="?content=users&uaction=changeisadmin&username=<?php echo $user['username'] . "&isadmin=" . ($user['isadmin'] ? '0' : '1');?>">(Change)</a>
                            </td>
                            <td><?php echo $lastLogin->format('Y-m-d H:i:s'); ?></td>
                            <td><?php echo $user['ip']; ?></td>
                            <td><?php echo $user['host']; ?></td>
                            <td>
                                <a href="?content=users&uaction=deleteuser&username=<?php echo $user['username']; ?>" onclick="return confirm('Are you sure you want to delete this user?')">Delete User</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="col-md-4">

            <h3 class="page-header expandable expanded">Add New User</h3>

            <div class="bs-example">
                <form id="queryopt-form" method="post" action="index.php?content=users&uaction=addUser">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" class="form-control" name="username" placeholder="Username" required>
                    </div>
                    <div class="form-group">
                        <label>Enter Password</label>
                        <input type="password" id="inputPassword" class="form-control" placeholder="Password"
                               name="password" required>
                    </div>
                    <div class="form-group">
                        <label>Confirm Password</label>
                        <input type="password" id="inputPassword2" class="form-control" placeholder="Password"
                               name="passwordcheck" required data-match="#inputPassword" data-minlength="5">
                    </div>
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" name="isadmin" value="1">Is Admin
                        </label>
                    </div>
                    <button class="btn btn-sm btn-primary" type="submit">Add User</button>
                </form>
            </div>


        </div>
    </div>
</div>




