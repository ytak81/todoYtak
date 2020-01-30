$(function()  {
  // Web Storageの実装確認
    if (typeof sessionStorage === 'undefined') {
      window.alert("このブラウザはWeb Storage機能が実装されていません");
    } else {
      window.alert("😊　開始します。");
    };
  
  // 一覧の初期設定
    var lists = [];
  
  // ローカルストレージの初期設定
    var storage = localStorage;
  // ローカルストレージよりタスク一覧を初期表示
    viewStorage();
  // 退避キーの初期化
    var old_key = '';
  
  // 今日の日付を表示 (Dateオブジェクトを使用)
    var today = new Date;
    var kigen = (today.getMonth()+1) + '月' + today.getDate() + '日';
    $('#today').text('本日の日付：' + kigen);
  
  // 日付の入力準備 (Datapickerを使用）
    $('#hno').datepicker({
      dateFormat: 'mm月dd日',
    });  
    $('#hdate').datepicker({
      dateFormat: 'mm月dd日',
    });
    $('#hdatez').datepicker({
      dateFormat: 'mm月dd日',
    });
  
  // 初期表示は「追加モード」
    var modeSwitch = true;
  
  /*********** イベント処理 ***********/
  
  // 中止ボタンがクリックされた場合→画面上部を初期状態に
    $('#btn1').on('click',function(e) {
      clearing();
    });
  
  // 追加・更新ボタンがクリックされた場合
    $('#btn2').on('click',function(e) {
  
      // 「追加」ボタンの場合
      if (modeSwitch) {
        addition();
      // 「更新」ボタンの場合
      } else {
        var result = window.confirm('更新します。よろしいですか？')
        if( result )
          modifying();
        else
          alert('更新処理を中止します。');
      };
  
    });
  
    // 一覧の行がクリックされた場合
  //$('.task').on('click',function(e) {　　ではなく、下記の書き方
    $(document).on('click', '.task',function(e) {
  
      // クリックした行のすべての子要素を取得
      var obj = $(this).children();
  
      // 取得した各子要素の中身を、配列に格納
      var array = [];
      $.each(obj, function(i, val) {   // この書き方がポイント
        array.push($(val).html());
      });
  
      // 配列の要素を、画面上部の初期表示値（placeholder）として編集
      $('#hno').attr('placeholder',array[1]);
      $('#hdate').attr('placeholder',array[2]);
      $('#hname').attr('placeholder',array[3]);
      $('#hdatez').attr('placeholder',array[5]);
      $('#hmemo').attr('placeholder',array[6]);
  
      switch (array[4]) {
        case '未':
          $('#hsts').val(1);
          break;
        case '作業中':
          $('#hsts').val(2);
          break;
        case '確認待ち':
          $('#hsts').val(3);
          break;
        case '完了':
          $('#hsts').val(4);
          break;
      }
  
      // ローカルストレージのキーを、配列より退避
      old_key = array[0];
  
      // 画面上部の背景色を青に変更
      $('#azone').css('background-color','skyblue');
      // 画面上部の文言を変更
      $('#stitle').text('タスクの更新（または削除）');
      $('#btn2').text('　更　新　');
      $('#btnDel').css('display','block');
  
      // 「更新モード」に変更
      modeSwitch = false;
  
    });
  
  // 削除ボタンがクリックされた場合
    $('#btnDel').on('click',function(e) {
      var result = window.confirm('削除します。よろしいですか？')
      if( result ) {
        deleting();
      }
      else {
        alert('削除処理を中止します。');
      }
    });
  
  // 完了一括削除ボタンがクリックされた場合
    $('#btn3').on('click',function(e) {
      var result = window.confirm('完了タスクを一度に削除します。よろしいですか？')
      if( result ) {
        multiDeleting();
      }
      else {
        alert('削除処理を中止します。');
      }
    });
  
  /*********** 関数 ***********/
  
  // 関数：画面の初期化
    function clearing() {
      //背景色を白に
      $('#azone').css('background-color','white');
      $('#hno').css('background-color','white');
      $('#hdate').css('background-color','white');
      $('#hname').css('background-color','white');
      //文言を変更
      $('#stitle').text('タスクの追加');
      $('#btn2').text('　追　加　');
      //削除ボタンを非表示に
      $('#btnDel').css('display','none');
      //入力値（初期表示も）をクリア
      $('#hno').val('');
      $('#hno').attr('placeholder','');
      $('#hdate').val('');
      $('#hdate').attr('placeholder','');
      $('#hname').val('');
      $('#hname').attr('placeholder','');
      $('#hmemo').val('');
      $('#hsts').val(1);
      $('#hdatez').val('');
      $('#hdatez').attr('placeholder','');
      $('#hmemo').attr('placeholder','');
  
      // 退避ストレージキーを初期化
      old_key = '';
      // 「追加モード」に変更
      modeSwitch = true;
  
    }
  
  // 関数：追加処理
    function addition() {
      var no = $('#hno').val();
      var dt = $('#hdate').val();
      var nm = $('#hname').val();
      var sts = $('#hsts').val();
      var dz = $('#hdatez').val();
      var mm = $('#hmemo').val();
      //エラーチェック
      var rtncd = errChk(no,dt,nm,sts,dz,mm);
  
      switch (rtncd) {
        case 99:
          alert('未入力です。正しく入力してください。');
          break;
        case 88:
          alert('入力済の案件と重複しています。別件を入力してください。');
          break;
        case 0:      //エラーがなければ、書込処理へ
          setStorage(no,dt,nm,sts,dz,mm);   // ローカルストレージへの書込み
          clearing();  // 書込後、画面上部を初期表示に
      };
    }
  
  // 関数：更新処理
    function modifying() {
      if ($('#hno').val() == '')
        var no = $('#hno').attr('placeholder');
      else
        var no = $('#hno').val();
  
      if ($('#hdate').val() == '')
        var dt = $('#hdate').attr('placeholder');
      else
        var dt = $('#hdate').val();
  
      if ($('#hname').val() == '')
        var nm = $('#hname').attr('placeholder');
      else
        var nm = $('#hname').val();
  
      var sts = $('#hsts').val();
  
      if ($('#hdatez').val() == '')
        var dz = $('#hdatez').attr('placeholder');
      else
        var dz = $('#hdatez').val();
  
      if ($('#hmemo').val() == '')
        var mm = $('#hmemo').attr('placeholder');
      else
        var mm = $('#hmemo').val();
  
      //エラーチェック
      var rtncd = errChk(no,dt,nm,sts,dz,mm);
  
      switch (rtncd) {
        case 99:
          alert('未入力です。正しく入力してください。');
          break;
        case 88:
          alert('入力済の案件と重複しています。別件を入力してください。');
          break;
        case 0:     //エラーがなければ、書込処理へ
          // 既存のローカルストレージの削除
          if (old_key == '')
            alert('【警告】更新前ストレージなし（追加します）');
          else
            storage.removeItem(old_key);
  
          setStorage(no,dt,nm,sts,dz,mm);
          clearing();
        };
    }
  
  // 関数：削除処理
    function deleting() {
  
      storage.removeItem(old_key);
  
     // 削除終了後、画面上部を初期表示に
      clearing();
     // 削除の結果を画面に表示
      viewStorage();
    }
  
  // 関数：完了一括削除処理
    function multiDeleting() {
      var array = [];
      for (var i = 0; i < storage.length; i++) {
        var skey = storage.key(i);
  
        if (skey.substr(0,5) == 'TODO_') {
        // ローカルストレージの値を、連想配列に変換
          var sjson = JSON.parse(storage.getItem(skey));
  
        // 状態が「完了」の場合、この行のキーを配列に格納
        　if (sjson.status == '4') {
            array.push(skey);
          };
        };
      };
  
      // 状態が「完了」の場合、この行を削除
      for (var i = 0; i < array.length; i++) {
            storage.removeItem(array[i]);
      };
  
      viewStorage()
    }
  
  // 関数：入力時のエラーチェック
    function errChk(no,dt,nm,sts,dz,mm){
      var rslt = 0;
      $('#hno').css('background-color','white');
      $('#hdate').css('background-color','white');
      $('#hname').css('background-color','white');
      $('#hdatez').css('background-color','white');
  
      // 未入力チェック
      if (no == '') {
        $('#hno').css('background-color','pink');
        rslt= 99;
      } else if (dt == '') {
        $('#hdate').css('background-color','pink');
        rslt= 99;
      } else if (nm == '') {
        $('#hname').css('background-color','pink');
        rslt= 99;
      } else if (sts == '4' && dz == '') {
        $('#hdatez').css('background-color','pink');
        rslt= 99;
      } else
      // 内容重複チェック
        for (i =0; i<lists.length; i++){
          // 名前の内容重複チェック
          if (lists[i].name == $('#hname').val()) {
            $('#hname').css('background-color','pink');
            rslt= 88;
            break;
          };
        };
      // 戻り値を設定
      return rslt;
    }
  
  // 関数：ローカルストレージへの格納
    function setStorage(no,dt,nm,sts,dz,mm){
      // valueには、連想配列の文字列をセット
      var array = {};
      array.num = no;
      array.date = dt;
      array.name = nm;
      array.status = sts;
      array.datez = dz;
      array.memo = mm;
      value = JSON.stringify( array );  // 連想配列（オブジェクト）をJSON（文字列情報）に変換
  
      // keyには、その時点での時刻を使用
      var time = new Date();
      var year = time.getFullYear();
      var month = time.getMonth()+1;
      var day = time.getDate();
      var hour = time.getHours();
      var minute = time.getMinutes();
      var second = time.getSeconds();
      var key = 'TODO_' + year + month + day + hour + minute + second;
  
      storage.setItem(key, value);　　// ローカルストレージへの書込
  
      key = "";
      value = "";
  
      viewStorage();
    }
  
  // 関数：ローカルストレージからのデータの取得と表示
    function viewStorage() {
  
      // table2から、すべてのデータ行を、一旦削除
      $('.task').remove();
  
      lists = [];
      // ローカルストレージすべての情報の取得
      for (var i=0; i < storage.length; i++) {
        var _key = storage.key(i);
  
        // ローカルストレージより、本アプリのキーをもつ値のみ取り出し
        if (_key.substr(0,5) == 'TODO_') {
  
          var _value = storage.getItem(_key);
  
          // ローカルストレージのJSONを、連想配列（オブジェクト）に格納
          var line = JSON.parse(_value);
          // 連想配列（オブジェクト）に、項目を追加
          line.key = _key;
          // 連想配列（オブジェクト）を、大きな配列に格納
          lists.push(line);
        };
      };
  
      // 複数の連想配列を、date(期限)の昇順にソート
      lists.sort( function(a, b) {
        return a.date < b.date ? -1 : 1;
      });
  
      // 「一覧」に行を追加
      for (var i=0; i < lists.length; i++) {
        var line = lists[i];    // lineは連想配列
  
        // line.statusを、文字列に変換
        switch (line.status) {
          case '1':
            var status = '未';
            var tdclass = 'sts1';
            break;
          case '2':
            var status = '作業中';
            var tdclass = 'sts2';
            break;
          case '3':
            var status = '確認待ち';
            var tdclass = 'sts3';
            break;
          case '4':
            var status = '完了';
            var tdclass = 'sts4';
            break;
        }
        // 画面下部のHTMLソースに、tr要素を追加
        var str = '<tr class="task"><td class="same">' + line.key + '</td>'
        str += '<td class="' + tdclass + '">' + line.num + '</td>'
        str += '<td class="' + tdclass + '">' + line.date + '</td>'
        str += '<td class="' + tdclass + '">' + line.name + '</td>'
        str += '<td class="' + tdclass + '">' + status + '</td>'
        str += '<td class="' + tdclass + '">' + line.datez + '</td>'
        str += '<td class="nondisp">' + line.memo + '</td></tr>'
        $('#table2').append(str);
      };
    }
  });
  