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

    // show Ranking
    showRanking();

    // Canvas Setup
    var bgCol     = '#F8F9FA',
        colYellow = '#f9ba32',
        colBlue   = '#426e86',
        colRed    = '#af1c1c',
        colText   = '#2f3131',
        $canvas = $('#mycanvas'),
        canvas = d.getElementById('mycanvas'),
        ctx = canvas.getContext('2d'),
        centerX = canvas.width / 2,
        centerY = canvas.height / 2,
        r,
        timerId,
        isPlaying = false,
        target,
        scores = [],
        score = 0;

    // start page
    ctx.font = "normal 28px Verdana";
    ctx.textAlign = "center";

    // draw Circle
    var drawCircle = function() {
      // clear canvas;
      ctx.fillStyle = bgCol;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // draw
      ctx.fillStyle = colBlue;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2, false);
      ctx.fill();

      // show target
      ctx.fillStyle = colYellow;
      ctx.fillText("Target: " + target, centerX, centerY - 35);

      r+=1;
      timerId = setTimeout(drawCircle, 12);
    };

    var game = function(n) {
      // reset
      r = 0;
      score = 0;
      target = Math.floor(Math.random() * 121) + 80;
      ctx.fillStyle = bgCol;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "normal 18px Verdana";
      ctx.fillStyle = colText;
      ctx.fillText((n+1) + "回目", centerX, centerY - 70);
      ctx.font = "normal 28px Verdana";
      ctx.fillStyle = colBlue;
      ctx.fillText("Stop at Target!", centerX, centerY - 100);
      ctx.fillText("Target: " + target, centerX, centerY - 35);

      // Event
      console.log(isPlaying  );
      $canvas.on('touchend.game', touchEvent);
    };

    var touchEvent = function() {
      clearTimeout(timerId);
      if(isPlaying === false) {
        // start game
        drawCircle();
      } else {
        var gameCount = scores.length;
        // stop game
        score = 100 - Math.abs(target - r);
        console.log("target:"+target+" r:"+r+" score:"+score);

        // draw Score
        ctx.fillText("You: " + r, centerX, centerY);
        ctx.fillStyle = colRed;
        ctx.font = "bold 35px Verdana";
        ctx.fillText("Score: " + score, centerX, centerY + 50);
        ctx.fillStyle = colText;
        ctx.font = "normal 20px Verdana";

        // unbind touch event
        $canvas.off('touchend.game');
        scores[gameCount] = score;
        
        // next Game count
        gameCount += 1;
        // show score
        showScore(gameCount, score);
        
        if(gameCount >= 3) {
          // game set
          ctx.fillText("Show Total Score", centerX, centerY + 100);
          $canvas.on('touchend.gameEnd', function() {
            $canvas.off('touchend.gameEnd');
            console.log(scores);
          });
        } else {
          // next
          ctx.fillText("Touch to Next", centerX, centerY + 100);
          $canvas.on('touchend.gameStart', function() {
            $canvas.off('touchend.gameStart');
            game(gameCount);
          });
        }
      }
      isPlaying = !isPlaying;
    };

    // show user name & logout Event
    $('#username').text(user.userName + ' [Log out]')
    .on('click', function() {
      // Logout
      ncmb.User.logout()
        .then(function() {
          location.href = homePath;
        })
        .catch(function(e) {
          alert('fail logout');
          console.log(e);
        });
    });
    
    // game start
    game(0);
    
    return;
  };

  // Save Score
  var saveScore = function(score, callback) {
    var ncmb = _ncmb,
        Rank = ncmb.DataStore("Rank"),
        rank;
    // save score to nifty cloud mobile backend
    // create new record
    rank = new Rank
    // set(key, value)
    rank.set("username", user.userName);
    rank.set("score", score);
    // ACL Access Control List
    // => refs. http://mb.cloud.nifty.com/doc/current/sdkguide/javascript/role.html
    var acl = new ncmb.Acl();
    // Read role: Public
    acl.setPublicReadAccess(true);
    // Write role: user only
    acl.setUserWriteAccess(user, true);
    rank.set("acl", acl);
    // save
    rank.save()
      .then(function() {
        if(typeof(callback) === 'function') {
          callback();
        }
      });
  };

  // Show Ranking List
  var showRanking = function() {
    var ncmb = _ncmb,
        Rank = ncmb.DataStore("Rank");
    // sql
    Rank.limit(5)
      .order("score", true)
      .fetchAll()
      .then(function(ary) {
        var $table = $('#js-ranking'),
            list = '';
        $table.empty();
        $.each(ary, function(i, rank) {
          list += [
            '<tr>',
            '<td class="rank">' + (i + 1) + "位</td>",
            '<td class="user">' + rank.get("username") + "さん</td>",
            '<td class="score">' + rank.get("score") + "点</td>",
            '</tr>'
          ].join("");
        });
        $table.append(list);
      });
    return;
  };
  
  // show score
  var showScore = function(n, score) {
    var $scores = $('#js-scores');
    $scores.find('.n' + n).text(n + '回目: ' + score + '点');
    return score;
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
