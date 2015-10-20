if (Meteor.isClient) {
  Session.setDefault('message', '');

  function syntaxHighlight(json) {
    if (typeof json != 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }

  Template.fetch.helpers({
    message: function () {
      return Session.get('message');
    }
  });

  Template.fetch.events({
    'click button': function () {
      Meteor.call('callContext', function(err,res) {
        if (err) {
          console.error(err);
        }
        console.log(res);
        if (typeof res !== 'undefined') {
          var disp = JSON.stringify(res, null, 2);
          disp = syntaxHighlight(disp);
          Session.set('message', disp);
        }
      });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    Future = Npm.require('fibers/future');
  });
  Meteor.methods({
    callContext: function() {
      var future = new Future();
      var result;
      var ID = "56269c53ce2f152f078b4567";
      var ContextIO = Npm.require('contextio');
      console.log('key: ' + Meteor.settings.ctxKey);
      console.log('secret: ' + Meteor.settings.ctxSecret);
      var ctxioClient = new ContextIO.Client('2.0', 'https://api.context.io', {
        key: Meteor.settings.ctxKey,
        secret: Meteor.settings.ctxSecret
      });
      ctxioClient.accounts(ID).messages().get({limit:5,include_body:1}, function (err, response) {
        if (err) {
          throw err;
        }
        console.log(response.body);
        future["return"](response.body);
      });
      return future.wait();
    }
  });
}
