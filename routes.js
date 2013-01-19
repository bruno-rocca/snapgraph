var nodeio = require('node.io');

exports.getUser = function(name){
    var run = new nodeio.Job({
        input: false,
        run: function () {
            this.getHtml('http://www.snapchat.com/' + name, function(err, $) {
                        //Handle any request / parsing errors
                        if (err) this.exit(err);

                        var user = "", score;

                        user = $('div#name a span#name_text').text;
                        score = $('div#score').text;

                        this.emit(user + ", " + score);

                        var names = [], output = [];

                        // $('div.best_name a').each(function(a) {
                        //     names.push(a.text);
                        // });

                        // this.emit(names);
                        }
                    );
        }
    });

    nodeio.start(run, {timeout: 10}, function(err, output){
        console.log(output);
    });
};