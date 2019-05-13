# MMM-GoogleTasks

Module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/) smart mirror.

Displays tasks from Google Tasks App


### Example
![Example of MMM-GoogleTasks](images/sample.png?raw=true "Example screenshot")

### Dependencies
1. The [Google Node.js client library](https://github.com/google/google-api-nodejs-client/): For authentication and Google Tasks API (v1). See Installation for instructions

## Installation
To install the module, use your terminal to:
1. Navigate to your MagicMirror's modules folder. If you are using the default installation directory, use the command:<br />`cd ~/MagicMirror/modules`
2. Clone the module:<br />`git clone https://github.com/jayked/MMM-GoogleTasks.git`
3. Install Google API:<br />`npm install googleapis`

## Authentication Setup
Google Tasks API an authenticated OAuth2 client:
1. Go [here](https://developers.google.com/tasks/quickstart/nodejs), and click "Enable the Google Tasks API" button. Follow the steps to download the credentials.json file. 
2. Move credentials.json to your MMM-GoogleTasks directory (MagicMirror/modules/MMM-GoogleTasks/)
3. [Enable Google Tasks API](https://console.cloud.google.com/apis/library/tasks.googleapis.com). Select the same project as in step 1.
4. Run authenticate.js:<br />`node authenticate.js`
5. Follow the instructions and it should print your lists. Copy the ID of the list you want to the config listID

## Using the module

### MagicMirror² Configuration

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        ...
        {
            module: 'MMM-GoogleTasks',
            header: "Google Tasks",
            position: "top_left",
            config: {
                listID: "",
                ...
                // See below for Configuration Options
            }
        },
        ...
    ]
}
```

### Configuration Options

| Option                  | Details
|------------------------ |--------------
| `listID`                | *Required* - List ID printed from authenticate.js (see installation)
| `maxResults`            | *Optional* - Max number of list items to retrieve. <br><br> **Possible values:** `0` - `100` <br> **Default value:** `10`
| `showCompleted`         | *Optional* - Show completed task items <br><br> **Possible values:** `true`  `false` <br> **Default value:** `false`
| `dateFormat`            | *Optional* - Format to use for due date <br><br> **Possible values:** See [Moment.js formats](http://momentjs.com/docs/#/parsing/string-format/) <br> **Default value:** `MMM Do` (e.g. Jan 18th)
| `updateInterval`        | *Optional* - Interval at which content updates (Milliseconds) <br><br> **Possible values:** `2000` - `86400000` (Tasks API has default maximum of 50,000 calls per day.) <br> **Default value:** `10000` (10 seconds)
| `animationSpeed`        | Speed of the update animation. (Milliseconds) <br><br> **Possible values:** `0` - `5000` <br> **Default value:** `2000` (2 seconds)
| `tableClass`            | Name of the classes issued from `main.css`. <br><br> **Possible values:** xsmall, small, medium, large, xlarge. <br> **Default value:** _small_
