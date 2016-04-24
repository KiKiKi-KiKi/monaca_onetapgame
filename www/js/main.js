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
      _ncmb = new NCMB(application_key, client_key);

  var homePath = './index.html', 
      gamePath = './game.html';

  // Utility
  var strTrim = function(str) {
    return str.replace(/　/g," ").trim();
  };
  
  // index Page
  var loginInit = function(w, d) {
    console.log('> loginInit');
    var ncmb = _ncmb;
    
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

      username = strTrim(username);
      password = strTrim(password);
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
    return;
  };
  
  // Game Page
  var gameInit = function(w, d, user) {
    console.log('> gameInit');
    var ncmb = _ncmb;
    
    // Canvas Setup
    var canvas = d.getElementById('mycanvas'),
        ctx = canvas.getContext('2d'),
        centerX = canvas.width / 2,
        centerY = canvas.height / 2;
    // start page
    ctx.font = "normal 28px Verdana";
    ctx.textAlign = "center";
    ctx.fillStyle = "#f9ba32";
    ctx.fillText("Stop at Target!", centerX, centerY);
    
    // show user name
    $('#username').text(user.userName + ' [Log out]')
    .on('click', function() {
      // Logout
      ncmb.User.logout()
        .then(function() {
          location.href = homePath;
        })
        .catch(function() {
          alert('fail');
        });
    });
    return;
  };
  
  // init
  !function(w, d) {
    var key = $('#js-pagekey').val(),
        // Current User
        user = _ncmb.User.getCurrentUser();

    console.log(key);
    switch(key) {
      case 'game':
        // Check Login:ed
        if(user === null) {
          location.href = homePath;
        }
        gameInit(w, d, user);
      break;
      case 'login':
      default:
        // Check Already Login:ed
        if(user !== null) {
          location.href = gamePath;
        } else {
          loginInit(w, d);
        }
      break;
    }
  }(window, document);
});
