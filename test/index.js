var sh = require('../../functional-shell');
var fs = require('fs');
var EMPTY_DIR_STRING = ['.gitkeep'].toString();
module.exports = {
    emptyTest: function(test) {
        test.done();
    },
    invalidshFunc: function(test) {
        test.equal(sh.parse(function() {

        }), null, "不正なshFuncはnullを返す");
        test.equal(sh.parse(function() {
            //#!/bin/sh
            //echo hello
        }), null, "不正なshFuncはnullを返す");
        test.done();
    },
    invalidFuncIgnore: function(test) {
        var process = sh(function() {
            //hogehoge
        });
        process.on('stdout', function(data) {
            test.fail("eventは発生しない");
        });
        process.on('stderr', function(data) {
            test.fail("eventは発生しない");
        });
        process.on('close', function(data) {
            test.fail("eventは発生しない");
        });
        process.on('error', function(err) {
            test.ok("errorイベントだけ発生する");
            var tmp = fs.readdirSync('./tmp');
            test.equal(tmp.toString(), EMPTY_DIR_STRING, 'tmp dirは空のまま');
            test.done();
        });
    },
    testFunctionParsing: function(test) {
        // test.expect(1);
        var testFunction1 = function(foo, bar) {
            /*
            hello world
            world
            */
        };
        var expected1 = 'hello world\nworld';
        test.equal(sh.parse(testFunction1), expected1, "パース後はスペース無くす");
        test.done();
    },
    testNoArgEchoSh: function(test) {
        // test.expect(2);
        var echo = function() {
            /*
            #!/bin/sh
            echo hello
            */
        };
        var process = sh(echo);
        process.on('stdout', function(data) {
            if (data) {
                test.equal(data.toString(), 'hello\n', "文字列とechoによる改行付きのバッファー");
            } else {
                test.fail("出力が返ってこなかった");
            }
        });
        process.on('stderr', function(data) {
            test.fail("正常なスクリプトはエラーでない");
        });
        process.on('error', function(err) {
            test.fail("正常なスクリプトはエラーでない");
        });
        process.on('close', function(data) {
            test.equal(data, 0, "終了ステータス");
            var tmp = fs.readdirSync('./tmp');
            test.equal(tmp.toString(), EMPTY_DIR_STRING, 'tmp dirは空にする');
            test.done();
        });
    },
    testArgEchoSh: function(test) {
        var echo = function() {
            /*
            #!/bin/sh
            echo $1
            */
        };

        var process = sh(echo, ["hello"]);
        process.on('stdout', function(data) {
            if (data) {
                test.equal(data.toString(), 'hello\n', "文字列とechoによる改行付きのバッファー");
            } else {
                test.fail("出力が返ってこなかった");
            }
        });
        process.on('stderr', function(data) {
            test.fail("正常なスクリプトはエラーでない");
        });
        process.on('error', function(err) {
            test.fail("正常なスクリプトはエラーでない");
        });
        process.on('close', function(data) {
            test.equal(data, 0, "終了ステータス");
            var tmp = fs.readdirSync('./tmp');
            test.equal(tmp.toString(), EMPTY_DIR_STRING, 'tmp dirは空にする');
            test.done();
        });
    },
    testArgStringEchoSh: function(test) {
        var echo = function() {
            /*
            #!/bin/sh
            echo $1
            */
        }
        var process = sh(echo, "hello");
        process.on('stdout', function(data) {
            if (data) {
                test.equal(data.toString(), 'hello\n', "文字列とechoによる改行付きのバッファー");
            } else {
                test.fail("出力が返ってこなかった");
            }
        });
        process.on('stderr', function(data) {
            test.fail("エラーは起きません");
        });
        process.on('error', function(err) {
            test.fail("エラーは起きません");
        });
        process.on('close', function(data) {
            test.equal(data, 0, "終了ステータス");
            var tmp = fs.readdirSync('./tmp');
            test.equal(tmp.toString(), EMPTY_DIR_STRING, 'tmp dirは空にする');
            test.done();
        });
    },
    testStringEchoSh: function(test) {
        var process = sh("echo $1", ["hello"]);
        process.on('stdout', function(data) {
            if (data) {
                test.equal(data.toString(), 'hello\n', "文字列とechoによる改行付きのバッファー");
            } else {
                test.fail("出力が返ってこなかった");
            }
        });
        process.on('stderr', function(data) {
            test.fail("エラーは起きません");
        });
        process.on('error', function(err) {
            test.fail("エラーは起きません");
        });
        process.on('close', function(data) {
            test.equal(data, 0, "終了ステータス");
            var tmp = fs.readdirSync('./tmp');
            test.equal(tmp.toString(), EMPTY_DIR_STRING, 'tmp dirは空にする');
            test.done();
        });
    }

}