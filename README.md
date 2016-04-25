# monaca_onetapgame

Monaca x NIFTY Cloud mobile backend
refs. [動画で解説！「ワンタップゲーム」を作ってみよう【全18回】](https://www.youtube.com/watch?list=PLSNY40p4warnBncJBdRQsogxA8dhRa06y&v=NA0FdQME78U)

### conf.jsを作成する

```sh
$ mv conf.js.sample conf.js
```

`conf.js`に[NIFTY Cloud moblie backend](http://mb.cloud.nifty.com/)の**アプリケーションキー**・**クライアントキー**を指定する
```javascript
APP = {
  appkey: 'YOUR APPLICATION KEY',
  ckey: 'YOUR CLIENT KEY'
}
```

アプリケーションキー・クライアントキーは[NIFTY Cloud moblie backend](http://mb.cloud.nifty.com/)の管理画面 > アプリの設定 で確認できる。
