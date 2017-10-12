exports.WatchObject = class {
  constructor(){
    this.objects = {};
    this.triggers = {
      set: {},
      get: {},
      delete: {}
    };
  }
  obj2Hash(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 25; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
  check(oTarget, sKey, newValue, type, self){
    if(!self.triggers[type][oTarget._uniqueIdentifier]){
      return;
    }
    if(!self.triggers[type][oTarget._uniqueIdentifier][sKey]){
      return;
    }
    var triggers = self.triggers[type][oTarget._uniqueIdentifier][sKey];
    var s = triggers.length;
    for(var i=0;i<s;i++){
      var tmp = triggers[i];
      switch(type) {
        case "get":
          if(tmp[1](oTarget, sKey)){
            tmp[2](tmp[0], oTarget, sKey);
          }
          break;
        case "set":
          if(tmp[1](oTarget, sKey, oTarget[sKey], newValue)){
            tmp[2](tmp[0], oTarget, sKey, oTarget[sKey], newValue);
          }
          break;
      }
    }
  }
  watch(parent, object, key, type, conditionalFunction, onCompleteFunction){
    var self = this;
    if(!object._uniqueIdentifier){
      var validator = {
        get: function (oTarget, sKey) {
          self.check(oTarget, sKey, null, "get", self);
          return oTarget[sKey];
        },
        set: function (oTarget, sKey, vValue) {
          self.check(oTarget, sKey, vValue, "set", self);
          return oTarget[sKey]=vValue;
        },
      };
      object._uniqueIdentifier = self.obj2Hash();
      self.objects[object._uniqueIdentifier] = new Proxy(object, validator);
    }
    if(!self.triggers[type][object._uniqueIdentifier]){
      self.triggers[type][object._uniqueIdentifier] = {};
    }
    if(!self.triggers[type][object._uniqueIdentifier][key]){
      self.triggers[type][object._uniqueIdentifier][key] = new Array();
    }
    self.triggers[type][object._uniqueIdentifier][key].push([parent, conditionalFunction, onCompleteFunction]);
    return self.objects[object._uniqueIdentifier];
  }
}