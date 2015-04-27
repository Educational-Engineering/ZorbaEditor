<div class="modal fade bs-changepw-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-sm">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="gridSystemModalLabel">Change Password</h4>
      </div>
      <div class="modal-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-8">
              <form id="changepw-form" method="post" action="index.php?uaction=changepw">
                <div class="form-group">
                  <label>Old Password</label>
                  <input type="password" id="inputPassword" class="form-control" placeholder="Password"
                         name="passwordold" required>
                </div>
                <div class="form-group">
                  <label>Enter New Password</label>
                  <input type="password" id="inputPassword" class="form-control" placeholder="Password"
                         name="passwordnew" required>
                </div>
                <div class="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" id="inputPassword2" class="form-control" placeholder="Password"
                         name="passwordnew2" required data-match="#inputPassword" data-minlength="5">
                </div>
                <button class="btn btn-sm btn-primary" type="submit">Change Password</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
