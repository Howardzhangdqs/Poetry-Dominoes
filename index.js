const fetch = require('node-fetch');
const pinyin = require('@napi-rs/pinyin').pinyin;
const chalk = require('chalk');
const rl = require('readline').createInterface({
    input: process.stdin, output: process.stdout
});

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const question = (query) => new Promise(resolve => rl.question(query, (answer) => resolve(answer)));

var print_out = function(){};

var data = {};

var keyword = "";

print_out.prototype.color = (s1, s2) => {
	let s = "", s2py = pinyin(s2);
	if (typeof s1 != 'string') s1 = s1[0];
	for(let i = 0, l = s1.length; i < l; i ++){
		let f = false;
		for (let j in s2) if (s1[i] == s2[j]) f = true;
		if (f) s += chalk.rgb(100,200,255)(s1[i]);
		else {
			f = false;
			for (let j in s2) if (pinyin(s1[i])[0] == s2) f = true;//console.log(pinyin(s1[i])[0], pinyin(s2[j])[0]), 
			if (f) s += chalk.rgb(220,50,50)(s1[i]);
			else s += s1[i];
		}
	}
	return s;
}

print_out.prototype.poem = (t) => {
	if (data[t].hasOwnProperty("source_poem"))       console.log("出处: " + data[t].source_poem);
	if (data[t].hasOwnProperty("literature_author")) console.log("作者: " + data[t].literature_author);
	if (data[t].hasOwnProperty("display_name"))      console.log("原句: " + print_out.prototype.color(data[t].display_name, keyword));
	if (data[t].hasOwnProperty("source_poem_body"))  console.log("位置: " + data[t].source_poem_body);
	console.log();
}

(async () => {
	console.clear();
	while (true) {
		keyword = await question("\n请输入待接龙的字：");
		console.clear();
		console.log("拼音：" + pinyin(keyword));
		console.log("相关的诗：\n");
		let if_redo = true;
		while (if_redo) {
			try {
				await fetch('https://hanyu.baidu.com/hanyu/ajax/sugs?mainkey=' + keyword)
					.then(res => res.json())
					.then(tdata => data = tdata.data.ret_array);
				if_redo = false;
			} catch (err) {
				if_redo = true;
				console.log('出现错误，错误信息如下：');
				console.log(err);
				await question("\n回车以重试");
				console.clear();
			}
		}
		//console.log(data);
		for (i in data) {
			//console.log(i);
			if (data[i].hasOwnProperty("type")) {
				if (data[i].type == "poemline") print_out.prototype.poem(i);
			}
			//console.log();
			//console.log(data[i]);
		}
		//console.log(data);
	}
	rl.close();
})();
