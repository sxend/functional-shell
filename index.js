var spawn = require('child_process').spawn,
    fs = require('fs');
var FunctionalShell = function(sh, args) {
    args = [].concat(args);
    var events = {};
    var result = {
        on: function(ev, callback) {
            if (typeof callback === 'function') {
                events[ev] = callback;
            }
        }
    };

    function errorOnlyResult(r) {
        r.on = function(ev, callback) {
            if (ev == 'error') {
                callback(new Error('invalid shFunc'));
            }
        };
        return r;
    };

    var parsedScript = (typeof sh === 'function') ? FunctionalShell.parse(sh): sh;
    if (!parsedScript) {
        return errorOnlyResult(result);
    }
    var tmpDirName = __dirname + "/tmp";
    var tmpShName = tmpDirName + "/" + Date.now() + ".sh";
    var mode = {
        mode: 493
    };

    function errorReport(err) {
        if (err && events.error) {
            events.error(err);
        }
    }
    fs.lstat('./tmp', function(err, stats) {
        if (err) {
            errorReport(err);
            return;
        }
        if (!stats || !stats.isDirectory()) {
            errorReport(new Error("invalid tmp Directory"));
            return;
        }
        fs.writeFile(tmpShName, parsedScript, mode, function(err) {
            if (err) {
                errorReport(err);
                return;
            }
            var process = spawn(tmpShName, args);

            process.stdout.on('data', function(data) {
                if (events.stdout) {
                    events.stdout(data);
                }
            });

            process.stderr.on('data', function(data) {
                if (events.stderr) {
                    events.stderr(data);
                }
            });

            process.on('close', function(data) {
                fs.unlink(tmpShName, function(err) {
                    errorReport(err);
                    if (events.close) {
                        events.close(data);
                    }
                });
            });
            process.on('error', errorReport);

        });
    });

    return result;
};
var REGEXS = {
    COMMENT_REGEX: /\/\*([.\n\s\S]*)\*\//,
    FRONT_SPACE_REGEX: /\n\s*/g
}

FunctionalShell.parse = function parse(shFunction) {
    var match = shFunction.toString().match(REGEXS.COMMENT_REGEX);
    if (match) {
        return match[1].replace(REGEXS.FRONT_SPACE_REGEX, '\n').trim();
    }
    return null;
}
module.exports = FunctionalShell;