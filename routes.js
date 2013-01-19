var nodeio = require('node.io');

exports.getUser = function(name, res){
    var run = new nodeio.Job({
        input: false,
        run: function () {
            this.getHtml('http://www.snapchat.com/' + name, function(err, $) {
                //Handle any request / parsing errors
                if (err) this.exit(err);

                if($('title').text == "Oops! 404"){
                    res.send({error: "No user found!"});
                    return;
                }

                var user, score, names = [], scores = [];

                    user = $('div#name a span#name_text').text;

                    //regex here removes all num digit chars
                    score = $('div#score').text.replace(/[^\d.]/g, "");

                    var pairs = [];

                    try{
                        $('div.best_name a').each(function(a) {
                            names.push(a.text);
                        });

                        $('div.best_score').each(function(a) {
                            scores.push(a.text);
                        });

                        for(var i = 0; i < names.length; i++){
                            pairs.push({name: names[i], score: scores[i]});
                        }
                    }
                    catch(error){
                        console.log("No friends lol");
                    }
                    
                    var result = {};

                    result.name = user;
                    result.score = score;
                    result.friends = pairs;

                    res.send(result);
                }
            );
        }
    });

    nodeio.start(run, {timeout: 10});
};