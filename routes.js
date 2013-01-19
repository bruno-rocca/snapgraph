var nodeio = require('node.io');
var db = require('./db.js');

exports.getUser = function(name, res, fun){
    var runner = new nodeio.Job({
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
                        try{
                            //1 friend case, refactor (submit pull request to nodeio, this is pretty bad)
                            names.push($('div.best_name a').text);
                            scores.push($('div.best_score').text);
                            pairs.push({name: names[0], score: scores[0]});
                        }
                        catch(innerError){
                            //Really no friends
                            console.log(innerError);
                        }
                    }
                    
                    var obj = {};

                    obj.name = user;
                    obj.score = score;
                    obj.friends = pairs;

                    db.addUser(obj, function(){
                            if(res){
                                res.send(obj);
                            }
                            if(fun){
                                fun(obj);
                            }
                        }
                    );
                }
            );
        }
    });

    nodeio.start(runner, {timeout: 100});
};

var seen = [];

exports.refreshGraph = function(user, res){
    //Refreshes graph to DB given a username until it can't recurse any farther
    var curUser = exports.getUser(user, res, function(out){
        
        console.log(seen);

        if(seen.indexOf(out.name) > -1){
            return;
        }
        else{
            seen.push(out.name);
            for(var i = 0; i < out.friends.length; i++){

                console.log(out.friends[i].name);

                if(seen.indexOf(out.friends[i].name) > -1){
                    continue;
                }
                else{
                    exports.refreshGraph(out.friends[i].name, res);
                }
            }

            res.send("Done");
        }
    });
};