Module.register("MMM-GoogleTasks",{
	// Default module config.
	defaults: {

		listID: "", // List ID (see authenticate.js)
		maxResults: 10,		
		showCompleted: false, //set showCompleted and showHidden true
		ordering: "myorder", // Order by due date or by 'my order' NOT IMPLEMENTED
		dateFormat: "MMM Do", // Format to display dates (moment.js formats)
		updateInterval: 10000, // Time between content updates (millisconds)
		animationSpeed: 2000, // Speed of the update animation (milliseconds)
		tableClass: "small", // Name of the classes issued from main.css
		
		// Pointless for a mirror, not currently implemented
		/* 
		dueMax: "2040-07-11T18:30:00.000Z", // RFC 3339 timestamp 
		dueMin: "1970-07-11T18:30:00.000Z", // RFC 3339 timestamp 
		completedMax: "2040-07-11T18:30:00.000Z", //only if showCompleted true (RFC 3339 timestamp)
		completedMin: "1970-07-11T18:30:00.000Z", //only if showCompleted true (RFC 3339 timestamp)
		 */
	},
	
	// Define required scripts
	getScripts: function () {
		return ["moment.js"];
	},

	// Define required scripts.
	getStyles: function () {
		return ["font-awesome.css", "MMM-GoogleTasks.css"];
	},

	// Define start sequence
	start: function() {

		Log.info("Starting module: " + this.name);
		this.tasks;
		this.loaded = false;
		if(!this.config.listID) {
			Log.log("config listID required");
		} else {
			this.sendSocketNotification("MODULE_READY", {});
		}

		// API requies completed config settings if showCompleted
		if(!this.config.showCompleted) {
			// delete this.config.completedMin;
			// delete this.config.completedMax;
		} else {
			this.config.showHidden = true;
		}
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;

		if (notification === "SERVICE_READY") {
			
			self.sendSocketNotification("REQUEST_UPDATE", self.config);
			
			// Create repeating call to node_helper get list
			setInterval(function() {
				self.sendSocketNotification("REQUEST_UPDATE", self.config);
			}, self.config.updateInterval);

		// Check if payload id matches module id
		} else if (notification === "UPDATE_DATA" && payload.id === self.config.listID) {
			// Handle new data
			self.loaded = true;
			if (payload.items) {
				self.tasks = payload.items;
				self.updateDom(self.config.animationSpeed)
			} else {
				self.tasks = null;
				Log.info("No tasks found.")
				self.updateDom(self.config.animationSpeed)
			}
		}
	},

	getDom: function() {

		var wrapper = document.createElement('div');
		wrapper.className = "container ";
		wrapper.className += this.config.tableClass;

		var numTasks = 0;
		if(this.tasks) {
			var numTasks = Object.keys(this.tasks).length;
		}

		if (!this.tasks) {
			wrapper.innerHTML = (this.loaded) ? "EMPTY" : "LOADING";
			wrapper.className = this.config.tableClass + " dimmed";
			return wrapper;
		}
			var titleWrapper, dateWrapper, noteWrapper;

			// ----- SORT TASKS BY DUE DATE ASC			
			if (this.config.ordering === "dateAsc" || this.config.ordering === "dateDesc") {
				this.tasks.sort(function(a, b) {
					// ---- IF DATES MATCH OR UNDEFINED, SORT ALPHABETICAL
					if (a.due == b.due) {
						if (a.title > b.title) return 1;
						if (a.title < b.title) return -1;
					} else {
						// ----- Force all undefined to the bottom
						if (b.due == undefined) {
							return -1;
						}else {
							// ----- CHECK IF DESC IS SELECTED, AND SORT.
							if (this.config.ordering === "dateDesc") return new Date(b.due) - new Date (a.due);
							// ----- ELSE SORT ASC.
							return new Date(a.due) - new Date(b.due);
						}
					}	
				});
			}

			if (this.config.ordering === "alphabeticalAsc" || this.config.ordering == "alphabeticalDesc") {
				Log.log("Alphabetical sorting not yet implemented.");
			}

			var sorted = [];
			// ------ SORT CHILDREN TO PARENT
			//find all children
			Log.log("Finding all children from " + numTasks + " tasks.");
			for (i = 0; i < numTasks; i++) {
				item = this.tasks[i];
				if (item.parent) {
					continue;
				}

				sorted.push(item);
				for (j = 0; j < numTasks; j++) {
					var child = this.tasks[j];
					if (child.parent == item.id) {
						sorted.push(child);
					}
				}
			}

			Log.log("Done sorting ready to add " + sorted.length + "items to task wrapper");

			// ------ DONE SORTING CHILDREN UNDER PARENT.

			// ------ add to wrapper
			for (i = 0; i < sorted.length; i++) {
				item = sorted[i];
				titleWrapper = document.createElement('div');
				titleWrapper.className = "item title";
				titleWrapper.innerHTML = "<i class=\"fa fa-circle-thin\" ></i>" + item.title;

				// If item is completed change icon to checkmark
				if (item.status === 'completed') {
					titleWrapper.innerHTML = "<i class=\"fa fa-check\" ></i>" + item.title;
				}

				if (item.parent) {
					titleWrapper.className = "item child";
				}

				if (item.notes) {
					noteWrapper = document.createElement('div');
					noteWrapper.className = "item notes light";
					noteWrapper.innerHTML = item.notes.replace(/\n/g , "<br>");
					titleWrapper.appendChild(noteWrapper);
				}

				dateWrapper = document.createElement('div');
				dateWrapper.className = "item date light";

				if (item.due) {
					var date = moment(item.due);
					dateWrapper.innerHTML = date.utc().format(this.config.dateFormat);
				}

				// Create borders between parent items
				if (numTasks < this.tasks.length-1 && !this.tasks[numTasks+1].parent) {
					titleWrapper.style.borderBottom = "1px solid #666";
					dateWrapper.style.borderBottom = "1px solid #666";
				}

				wrapper.appendChild(titleWrapper);
				wrapper.appendChild(dateWrapper);

				Log.log("Added " + item.id + " to wrapper");
			};
			Log.log("Done and returning wrapper");

			return wrapper;
		
	}
});
