'use strict';

// モジュールを読み込む
const fs = require('fs');
const readline = require('readline');
// データからStreamを作成
const rs = fs.ReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {} });

// 集計されたデータを格納する連想配列prefectureDataMapを作成
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト

// lineイベントをトリガーにして、アロー関数を実行
rl.on('line', (lineString) => { // 引数lineStringが受けるのは読み込んだ1行
    // 1行ごとに、次の処理を実行する
    // 文字列を','で分割し、リストに格納する
    const columns = lineString.split(',');
    // リストのデータを変数に格納する
    const year = parseInt(columns[0]); // 集計年
    const prefecture = columns[2]; // 都道府県
    const popu = parseInt(columns[7]); // 15〜19歳の人口
    // 2010年または1015年のデータのみを集める
    if (year === 2010 || year === 2015) {
        // prefectureDataMapからデータを取得
        let value = prefectureDataMap.get(prefecture);
        // prefectureDataMapのvalueの値がundefined(Falsy)→valueに初期値を代入
        if (!value) {
            value = {
                popu10: 0, // 2010年の人口
                popu15: 0, // 2015年の人口
                change: null // 人口の変化率
            };
        }
        if (year === 2010) {
            value.popu10 += popu;
        }
        if (year === 2015) {
            value.popu15 += popu;
        }
        // prefectureDataMapへ保存
        prefectureDataMap.set(prefecture, value);
    }
});

// Stream処理を開始
rl.resume();

// すべての行の読み込みが終わったら呼び出される
rl.on('close', () => {
    // 各県の変化率を計算する
    for (let [key, value] of prefectureDataMap) { // ※prefectureDataMap: Map型(各県各年男女のデータ)
    // prefectureDataMapの各要素に対してイテレーションを回す
        // Ex:) key:  '北海道' value: { popu10: 258530, popu15: 236840, change: null }
        value.change = value.popu15 / value.popu10;
    }

    // 変化率で県を並び替え
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) =>{
        return pair2[1].change - pair1[1].change;
        // pair1>pair2なら正なのでpair1は後ろに、pair1<pair2なら負なのでpair1は前にソートされる
    });
    // A rray.form(Map型)→Map型をArray型に変換 sort(無名関数)→無名関数で比較関数(並び替えのルール)を設定

    // データの整形
    const rankingStrings = rankingArray.map(([key, value]) => {
    // 配列rankingArrayの各要素を、変数[key, value]へ格納し無名関数で記述した処理を行う
        return key + ': ' + value.popu10 + '=>' + value.popu15 + ' 変化率:' + value.change; 
    });

    console.log(rankingStrings);
});