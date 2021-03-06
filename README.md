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
## And for simpler logic
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
var proxiedObject = wObject.watch(null, object, "president", "set", conditional, executeOrder626).proxy;
proxiedObject.president=0;
```
----------

## Angular Data Service Example
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
    }).proxy;
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
```
import { Component } from '@angular/core';
import { WSService } from './database/ws.service';
import { WatchObject } from 'watchobject';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor( private ws: WSService) {}
  ngOnInit() {
    self.ws.initialize('http://example.com/websocket',function(client, data){
    });
    self.ws.executeWhenConnected(function(){
      console.log("Connected to group websocket");
    });
  }
}
```

```
var wObject = new WatchObject();
var factoriedObject = wObject.watcherFactory();
var object = {
  president:0,
  triggered:0
};
var proxy = wObject.proxy(object);
var proxyFactory = factoriedObject
  .parent(this)
  .object(object)
  .key("president")
  .type("set")
  .conditional(function(object, key, oldValue, newValue){
    return newValue==1;
  })
  .complete(function(parent, object, key, oldValue, newValue, id, keys){
    object.triggered=4
  });
proxyFactory.watch();
proxyFactory
  .conditional(function(object, key, oldValue, newValue){
    return newValue==2;
  })
  .complete(function(parent, object, key, oldValue, newValue, id, keys){
    object.triggered=3
  });
proxyFactory.watch();
proxy.president=2
assert.equal(3,object.triggered);
proxy.president=1
assert.equal(4,object.triggered);
```