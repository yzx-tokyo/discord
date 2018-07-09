var Discord = require('discord.io'),
    logger  = require('winston'),
    auth    = require('./auth.json'),
    bot;

var pattern = /^([1-9]\d*|0)$/;
var menbers = '';
var otherMenbers = '';
var tabuls = '';
var adFlg = false;
var tbFlg = false;
var endFlg = false;
var reUserID = '';
var retMsg = ''; 

logger.level = 'debug';


var StringBuffer = function(string) {
    this.buffer = [];

    this.append = function(string) {
        this.buffer.push(string);
        return this;
    };

    this.toString = function() {
        return this.buffer.join('');
    };

    if (string) {
        this.append(string);
    }
};


// BOT 初期設定
bot = new Discord.Client({
    token   : auth.token,
    autorun : true
});

//起動時に実行するコード
bot.on('ready', function (evt) {
    logger.info('Discord に接続されました。');
    logger.info('アカウント : ' + bot.username + ' ( ID : ' + bot.id + ' )');
});

//メッセージ受信時の挙動
bot.on('message', function (user, userID, channelID, message, evt) {

    // botの発言の場合は処理を止める
    if (userID == bot.id) {
        return false
    }
    // 課金していないプレイヤーの入力待ち
    if (endFlg) {
        // 「卓分けします」の発言者が同じ場合は処理を進める
        if (reUserID == userID){
            endFlg = false;
            retMsg = creatArray(message);
            bot.sendMessage({
                to      : channelID,
                message : retMsg
            });
        }
    }

    // 課金メンバーの入力待ち
    if (adFlg) {
        // 「卓分けします」の発言者が同じ場合は処理を進める
        if (reUserID == userID){
          
            if (message == 'いません') {
                retMsg = '了解しました。参加メンバーを教えて下さい'
            }
            retMsg = kakinList(message) + '人ですね。他のメンバーを教えて下さい'
            adFlg = false;
            endFlg = true;
            bot.sendMessage({
                to      : channelID,
                message : retMsg
            });
        }
    }

    // 卓分けの数入力待ちの返答
    if (tbFlg) {
        // 「卓分けします」の発言者が同じ場合は処理を進める
        if (reUserID == userID){
            retMsg =  '数値を入力してください';

            if (pattern.test(message)) {
                tbFlg = false;
                adFlg = true;
                tabuls = message;
                vals = '課金メンバーは誰がいますか？'
            }

            bot.sendMessage({
                to      : channelID,
                message : vals
            });
        }
    }

    //メッセージが”やっほー”だった場合に”やっほー（やまびこ）”と返してみます。
    if(message == 'やっほー') {
        bot.sendMessage({
            to      : channelID,
            message : 'やっほー（やまびこ）'
        });
    }

    if(message == '私はだれ') {
        bot.sendMessage({
            to      : channelID,
            message : 'ユーザーは' + user + '：ユーザーIDは' + userID
        });
    }

    if(message == '卓分けします' || message == '卓わけします'
        || message == '卓立てします' || message == '卓たてします') {
        tbFlg = true;
        reUserID = userID;
        bot.sendMessage({
            to      : channelID,
            message : '何人ずつでわけますか？'
        });
    }

    if(message == '334') {
        retMsg =  creatArray2();
        bot.sendMessage({
            to      : channelID,
            message : retMsg
        });
    }

    if(message == '卓分けテスト') {
        retMsg =  creatArray2();
        bot.sendMessage({
            to      : channelID,
            message : retMsg
        });
    }

    if(message == '日大のブランドは大丈夫ですか？') {
        retMsg =  'ウチダが全て悪い！';
        bot.sendMessage({
            to      : channelID,
            message : retMsg
        });
    }

    if(message == 'なんでや阪神関係あるやろ') {
        retMsg =  'せやな';
        bot.sendMessage({
            to      : channelID,
            message : retMsg
        });
    }

});

/**
 * 数値を返す
 */
function tbList(msg) {
    var pattern = /^([1-9]\d*|0)$/;
    if (pattern.test(msg)) {
        return '';
    } else {
        return '数値を入力してください';
    }
}


/**
 * 
 */
function kakinList(str) {
    menbers = str.split(',');
    return menbers.length;
}

/**
 * シャッフル処理
 * @param {*} array 
 */
function shuffle(array) {
    var n = array.length, t, i;
  
    while (n) {
      i = Math.floor(Math.random() * n--);
      t = array[n];
      array[n] = array[i];
      array[i] = t;
    }
    return array;
}

/**
 * 配列を宣言する処理
 * 例);
 * retMsg = '卓分けは以下の通りです \n 1番卓：yzx ,おかぴ, 三月 \n 2番卓：うりはり, かも, れとれと'
 */
function creatArray(message) {
    menbers = shuffle(menbers);
    var tabulsNum = new Array(tabuls.length);

    for(i = 0; i < tabuls.length; i++) {
        tabulsNum[i] = new Array(tabuls.charAt(i));
        for(x = 0; x < tabuls.charAt(i); x++) {
            tabulsNum[i][x] = '';
        }
    }

    for(i = 0; i < tabulsNum.length; i++) {
        tabulsNum[i][0] = menbers[0];
        menbers.shift();
    }

    otherMenbers = message.split(',');
    while(menbers.length > 0) {
        otherMenbers.push(menbers[0]);
        menbers.shift();
    }
    otherMenbers = shuffle(otherMenbers);

    var sb = new StringBuffer();
    sb.append('卓分けは以下の通りです \n');

    for(i = 0; i < tabulsNum.length; i++) {
        sb.append([i + 1]).append('番卓： ').append(tabulsNum[i][0]);
        for (c = 1; c < tabulsNum[i].length; c++) {
            sb.append(', ').append(otherMenbers[0]);
            otherMenbers.shift();
        }
        sb.append('\n');
    }
    return sb;
}

/**
 * 配列を宣言する処理
 */
function creatArray2() {
    var nahan = '334';

    menbers = shuffle(['石', 'チョキ', 'パー', '桃太郎']);
    var tabuls = new Array(3);

    for(i = 0; i < tabuls.length; i++) {
        tabuls[i] = new Array(nahan.charAt(i));
        for(x = 0; x < nahan.charAt(i); x++) {
            tabuls[i][x] = '';
        }
    }

    for(i = 0; i < tabuls.length; i++) {
        tabuls[i][0] = menbers[0];
        menbers.shift();
    }

    otherMenbers = ['11', '12', '21', '22', '31', '32', '33'];
    while(menbers.length > 0) {
        otherMenbers.push(menbers[0]);
        menbers.shift();
    }

    otherMenbers = shuffle(otherMenbers);

    var sb = new StringBuffer();
    sb.append('卓分けは以下の通りです \n');

    for(i = 0; i < tabuls.length; i++) {
        sb.append([i + 1]).append('番卓： ').append(tabuls[i][0]);
        for (c = 1; c < tabuls[i].length; c++) {
            sb.append(', ').append(otherMenbers[0]);
            otherMenbers.shift();
        }
        sb.append('\n');
    }
    return 'な阪関';
}
