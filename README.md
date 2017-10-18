# WatchObject

Using Proxy, this simple library will provide a method to trigger a function with a conditional on changes to the object.

*Atm, the only captured events are "get" and "set"*


----------


```
import { WatchObject } from 'watchobject';

var wSocket = new WebSocket();
var wObject = new WatchObject();

/* Creates a proxy for wSocket and gives the object a unique ID and caches the Proxy object, then it returns the proxy */
var pWSocket = wObject.proxy(wSocket); 

/* This creates a listener that will trigger when the connectStatus variable inside the pWSocket object changes. */
wObject.watch(
	this, 
	pWSocket, 
	"connectStatus", 
	"set", 
	(object, key, oldValue, newValue)=>{ // triggered before variable change
		object[key]=newValue; // not necessary
		return object[key] == "connected";
	},
	(parent, object, key, oldValue, newValue, id, keys)={
		// this part is triggered when connectStatus="connected"
	}
);

pWSocket.connect("127.0.0.1:2700");

```
----------
And for simpler logic
```
var { WatchObject } = require('watchobject');
var wObject = new WatchObject();

function conditional(object, key, oldValue, newValue){
	return newValue==0;
}
function executeOrder626(){
	console.log("Wipe them out, all of them!");
}
var object = {
	president:1
};
var proxiedObject = wObject.watch(null, object, "president", "set", conditional, executeOrder626);
proxiedObject.president=0;
```
----------

Angular Data Service Example
```
import { Injectable } from '@angular/core';
import { WatchObject } from 'watchobject';

@Injectable()
export class WSService{
  constructor () {}
  private socket;
  private watchObject;
  private stompClient = null;
  private stompClientProxied = null;
  private subscriptions = {};
  initialize(url:string, func){
    var self = this;
    var SocketJS = require('sockjs-client');
    var Stomp = require('stompjs');
    self.socket = new SocketJS(url);

    self.watchObject = new WatchObject();

    self.stompClientProxied = Stomp.over(self.socket);

    self.stompClient = self.watchObject.proxy(self.stompClientProxied);
    self.stompClient.reconnect_delay = 5000;
    self.stompClient.connect({},function(data){
      func(self.stompClient, data);
    });

  }
  executeWhenConnected(func){
    var selfWrap = this;
    selfWrap.watcher().watch(self, selfWrap.client(), "connected", "set", function(object, key, oldValue, newValue) {
      object[key] = newValue;
      return object.connected;
    }, function(parent, object, key, oldValue, newValue, id, keys) {
      if (selfWrap.watcher().remove(object, keys, 'set', id)) {
        console.log("=========== removed observe on " + keys + " for object with id: " + object._uniqueIdentifier);
      }
      func();
    });
  }
  client(){
    return this.stompClient;
  }
  clientProxied(){
    return this.stompClientProxied;
  }
  watcher(){
    return this.watchObject;
  }
}
```
