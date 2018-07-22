var NodeHelper = require("node_helper");
const {google} = require('googleapis');
const fs = require('fs');

module.exports = NodeHelper.create({

    start: function() {
        
        console.log("Starting node helper for: " + this.name);

        this.oAuth2Client;
        this.service;
    },

    socketNotificationReceived: function(notification, payload) {

        if (notification === "MODULE_READY") {
            if(!this.service) {
                this.authenticate();
            } else {
                // Check if tasks service is already running, avoids running authentication twice
                console.log("TASKS SERVICE ALREADY RUNNING, DONT NEED TO AUTHENTICATE AGAIN")
                this.sendSocketNotification("SERVICE_READY", {});
            }
        } else if (notification === "REQUEST_UPDATE") {
            this.getList(payload);
        }
    },

    authenticate: function() {
        var self = this;

        fs.readFile(self.path + '/credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Tasks API.
            authorize(JSON.parse(content), self.startTasksService);
          });

        function authorize(credentials, callback) {
            const {client_secret, client_id, redirect_uris} = credentials.installed;
            self.oAuth2Client = new google.auth.OAuth2(
                client_id, client_secret, redirect_uris[0]);
          
            // Check if we have previously stored a token.
            fs.readFile(self.path + '/token.json', (err, token) => {
              if (err) return console.log('Error loading token');
              self.oAuth2Client.setCredentials(JSON.parse(token));
              callback(self.oAuth2Client, self);
            });
        }
    },

    startTasksService: function(auth, self) {
        self.service = google.tasks({version: 'v1', auth});
        self.sendSocketNotification("SERVICE_READY", {});
    },

    getList: function(config) {
        var self = this;

        if(!self.service) {
            console.log("Refresh required"); 
            return;
        }

        self.service.tasks.list({
            tasklist: config.listID,
            maxResults: config.maxResults,
            showCompleted: config.showCompleted,
            showHidden: config.showHidden,
        }, (err, res) => {
            if (err) return console.error('The API returned an error: ' + err);

            // Testing
            /* 
            const tasksList = res.data.items;
            console.log(tasksList);
            if (tasksList) {
                tasksList.forEach((task) => {
                    console.log(task);
                });
            } else {
                console.log('No tasks found.');
            }
             */

            var payload = {id: config.listID, items: res.data.items};
            self.sendSocketNotification("UPDATE_DATA", payload);
        });
    },
});