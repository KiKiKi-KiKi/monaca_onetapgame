$(function() {
  !function(w, d) {
    // mBaas init
    var application_key = APP.appkey,
        client_key = APP.ckey,
        ncmb = new NCMB(application_key, client_key);

    var strTrim = function(str) {
      return str.replace(/　/g," ").trim();
    };

    // create new Account
    var createNewUserAccount = function(username, password) {
      // create new user
      var user = new ncmb.User({
        userName: username,
        password: password
      });
      // create new User's Account
      user.signUpByAccount()
        .then(function() {
          // login with new User
          ncmb.User.login(username, password)
            .then(function() {
              alert('新規会員登録成功');
            });
        });
      return user;
    };

    // Login
    $(d).on('submit', '#js-login', function() {
      var $user = $('#username'),
          $pass = $('password'),
          username = $user.val(),
          password = $pass.val();
      username = strTrim(username);
      password = strTrim(password);
      if(username && password) {
        // Login
        ncmb.User.login(username, password)
          .then(function() {
            // seccess Login
            alert('ログイン成功');
          })
          .catch(function() {
            // fail Login
            if( w.confirm('新規会員登録を行いますか？') ) {
              createNewUserAccount(username, password);
            }
          });
      } else {
        if(!username) {
          $user.addClass('error');
        }
        if(!password) {
          $pass.addClass('error');
        }
      }
      return false;
    });
  }(window, document);
});
