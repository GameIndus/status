var ws  = new WebSocket("ws:localhost:20004");

var types = {
	site: "Site Internet",
	documentation: "Documentation",
	market: "Magasin",
	main_server: "Serveur principal",
	compiler_server: "Compilation des jeux",
	tchat_server: "Tchat/collaboration"
};

ws.onopen = function() {
    ws.send("getAllStatus");
};

ws.onmessage = function(message) {
    var status = JSON.parse(message.data);

    updateStatus(status);

    this.close();
};

ws.onerror = function() {
    console.log("Socket error !");
};

function updateStatus(o) {
	var container = document.getElementById("content");
	/*
	<div class="box box-site online">
			<div class="title">Site internet</div>
			<div class="status">Service en ligne</div>
		</div>
	 */
	
	for (var i = 0; i < Object.keys(o).length; i++) {
		var key = Object.keys(o)[i];
		var obj = o[key];

		var box    = document.createElement("div");
		var title  = document.createElement("div");
		var status = document.createElement("div");

		var onlineS = obj.online ? " online" : "";

		box.className = "box box-" + key + onlineS;
		title.className = "title";
		status.className = "status";

		title.innerHTML = types[key];

		if (obj.online) {
			status.innerHTML = "Service opérationnel";
		} else {
			status.innerHTML = "Service indisponible";
		}

		if (obj.online) {
			var latS = obj.latency + "ms";
			
			if (obj.latency > 1000) {
				latS = (obj.latency / 1000) + "s";
			}

			var lat = document.createElement("div");
			lat.className = "latency";
			lat.innerHTML = '<i class="fa fa-signal"></i> Latence: <b>' + latS + '</b>';
			box.appendChild(lat);
		}

		box.appendChild(title);
		box.appendChild(status);

		container.appendChild(box);
	}

}