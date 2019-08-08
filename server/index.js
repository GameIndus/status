var port = 20004;
var secs = 60;

var ws       = require('nodejs-websocket');
var loadtest = require('loadtest');

var statues  = {};
var progress = false;

var server = ws.createServer(function (conn) {
  	conn.on("text", function (str) {
    	if (str == "getAllStatus") {
    		conn.sendText(JSON.stringify(statues));
    		conn.close();
    	}
    });
}).listen(port);


function reloadStatus(){
	if (progress) {
		return false;
	}
	
	progress = true;

	log(" ");
	log("Vérification des services...", "auto");
	
	var sitePinged = false, docsPinged = false, marketPinged = false, mainPinged = false,
		compilerPinged = false, tchatPinged = false;

	// Force finish with error, after X seconds
	var tff = setTimeout(function(){
		finished(true);
	}, 30 * 1000);

	// Site web
	pingUrl("gameindus.fr", function(status, latency) {
		if(sitePinged) return false;
		sitePinged = true;
		statues["site"] = {online: status, latency: latency}; 

		// Documentation
		pingUrl("docs.gameindus.fr", function(status2, latency2) {
		    if(docsPinged) return false;
			docsPinged = true;

			statues["documentation"] = {online: status2, latency: latency2}; 

			// Documentation
			pingUrl("market.gameindus.fr", function(status2b, latency2b) {
			    if(marketPinged) return false;
				marketPinged = true;

				statues["market"] = {online: status2b, latency: latency2b}; 
			
				// Serveurs
				pingUrl("gameindus.fr:20001/socket.io/socket.io.js", function(status3, latency3) {
				    if(mainPinged) return false;
					mainPinged = true;

					statues["main_server"] = {online: status3, latency: latency3}; 

					pingUrl("gameindus.fr:20003/socket.io/socket.io.js", function(status4, latency4) {
					    if(compilerPinged) return false;
						compilerPinged = true;

						statues["compiler_server"] = {online: status4, latency: latency4}; 

						pingUrl("gameindus.fr:20004/socket.io/socket.io.js", function(status5, latency5) {
						    if(tchatPinged) return false;
							tchatPinged = true;

							statues["tchat_server"] = {online: status5, latency: latency5}; 

							clearTimeout(tff);
							finished();
						});
					});
				});
			});
		});
	});

	var finished = function(error){
		if (!progress) {
			return false;
		}

		if (error) {
			log("Erreur lors de la vérification.");
		} else {
			log("Services vérifés.", "auto");
		}
		
		log("Nouvelle vérification dans " + secs + " secondes.");
		log(" ");

		setTimeout(function() {
			reloadStatus();
		}, secs * 1000);

		progress = false;
	};
}

log(" ");
log("[INFO] Server started on port :"+port+".");

reloadStatus();


function pad(a,b){for(var c=a+"";c.length<b;)c="0"+c;return c}

function log(message) {
    if (message == " ") {
		console.log(message);
		return false;
	}

    var date = new Date();
    var prefix = "[" + pad(date.getHours(), 2) + ":" + pad(date.getMinutes(), 2) + ":" + ("0" + date.getSeconds()).slice(-2) + "]"; 

    console.log(prefix + " " + message);
}

function pingUrl(url, callback){
	function statusCallback(error, result, latency) {
		var status  = true;
		var lat     = latency.meanLatencyMs;

		if (latency.totalErrors >= 1) {
			status = false;
			lat = -1;
		}

	    callback(status, lat);
	}
	 
	var options = {
	    url: "https://" + url,
	    maxRequests: 1,
	    statusCallback: statusCallback
	};

	loadtest.loadTest(options, function(error){});
}