$(function() {
  /**
   *  conf.js
   *  APP = {
   *   appkey: application_key,
   *   ckey: client_key
   *  }
   */
   
  // mBaas init
  var application_key = APP.appkey,
      client_key = APP.ckey,
      ncmb = new NCMB(application_key, client_key);

  var gamePath = './game.html';

  // Utility
  var strTrim = function(str) {
    return str.replace(/　/g," ").trim();
  };
  
  var loginInit = function(w, d) {
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
              location.href = gamePath;
            });
        });
      return user;
    };

    // Login
    $(d).on('submit', '#js-login', function() {
      var $user = $('#username'),
          $pass = $('#password'),
          username = $user.val(),
          password = $pass.val();
      console.log(username, password);
      if(username && password) {
        // Login
        ncmb.User.login(username, password)
          .then(function() {
            // seccess Login
            alert('ログイン成功');
            location.href = gamePath;
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
  }
  
  // init
  !function(w, d) {
    var $b = $('body'),
        key = $b.data('key');
    
    console.log(key);
    
    switch(key) {
      case 'game':
      
      break;
      case 'login':
      default:
        // Check Already Login-ed
        // Current User
        var user = ncmb.User.getCurrentUser();
        // logined user
        if(user !== null) {
          location.href = gamePath;
        }
        loginInit(w, d);
      break;
    }
  }(window, document);
});
