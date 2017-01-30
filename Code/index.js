'use strict';
var Alexa = require('alexa-sdk');
var request = require("request");

var APP_ID = "amzn1.ask.skill.e51dffe3-4c23-4eeb-894c-ce2d6825e025";
var SKILL_NAME = 'How Many People Are In Space';
var JSON_URL = "http://www.howmanypeopleareinspacerightnow.com/peopleinspace.json";
var jsonData = {};

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var loadJsonData = function (handler, callback) {
    if (JSON.stringify(jsonData) === "{}") {
        request({
            url: JSON_URL,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                jsonData = body;
                callback(body, handler);
            }
        });
    } else {
        if (typeof jsonData === "object" && jsonData.length === undefined) {
            callback(jsonData, handler);
        } else {
            callback(null, handler);
        }
    }
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetFact');
    },
    'GetNumberIntent': function () {
        this.emit('GetNumber');
    },
    'GetListIntent': function () {
        this.emit('GetList');
    },
    'GetNumber': function () {
        loadJsonData(this, function (data, handler) {
            if (data === null) {
                this.emit('CustomError');
            } else {
                var number = data.number,
                    response;
                if (number === 1) {
                    response = "There is only one person in space right now";
                } else {
                    response = "There are " + number + " people in space right now";
                }
                handler.emit(':tellWithCard', response, SKILL_NAME, response);
            }
        });
    },
    'GetList': function () {
        loadJsonData(this, function (data, handler) {
            if (data === null) {
                this.emit('CustomError');
            } else {
                var people = data.people;
                var strList = "";
                for (var index in people) {
                    var person = people[index];
                    strList += ", ";
                    if (index == people.length - 1) strList += " and ";
                    strList += " " + person.name
                        + ", a " + person.title;
                }
                var intro = "Here is a list of all people in space right now ";
                handler.emit(':tellWithCard', intro + strList, SKILL_NAME, strList);
            }
        });
    },
    'CustomError': function() {
        this.emit(':tell', "I'm sorry, I've encountered an error.", SKILL_NAME, "I've encountered an error.");
        this.emit('AMAZON.StopIntent');
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = "You can ask how many people are in space, you can ask me to list the people in space, or, you can say exit... What can I help you with?";
        var reprompt = "What can I help you with?";
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', 'Hasta La Vista!');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', 'Hasta La Vista!');
    }
};