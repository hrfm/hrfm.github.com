var __extends=this.__extends||function(j,h){function b(){this.constructor=j}b.prototype=h.prototype;j.prototype=new b},hrfm;
(function(j){var h,b=function(a,c,f){"undefined"===typeof c&&(c=void 0);"undefined"===typeof f&&(f=0);this.id=b._ID++;this._f=a;this._s=c;this.priority=f};b._ID=0;b.prototype.e=function(a){"undefined"===typeof a&&(a=null);return!1==this._f.call(this._s,a)?null:this.n};b.prototype.eq=function(a,c){"undefined"===typeof c&&(c=void 0);return a==this._f&&c==this._s};h=b;j.Closure=h;var g=function(){};g.prototype.add=function(a,c,f){"undefined"===typeof c&&(c=void 0);"undefined"===typeof f&&(f=0);var d,
b;if(this.head){d=this.head;for(b=null;d;){if(d.eq(a,c))return-1;!b&&d.priority<f&&(b=d);d=d.n}d=new h(a,c,f);b?b.p?(a=b.p,b.p=d,d.n=b,d.p=a,a.n=d):(b.p=d,d.n=b,this.head=d):(b=this.tail,b.n=d,d.p=b,this.tail=d)}else this.head=this.tail=d=new h(a,c,f);return d.id};g.prototype.rm=function(a,c){"undefined"===typeof c&&(c=void 0);for(var b=this.head;b;){if(b.eq(a,c)){this._rm(b);break}b=b.n}};g.prototype.rmById=function(a){for(var c=this.head;c;){if(c.id==a){this._rm(c);break}c=c.n}};g.prototype.rmAll=
function(){for(var a=this.head;a;)a=a.n;this.tail=this.head=null};g.prototype.exec=function(a){"undefined"===typeof a&&(a=void 0);if(this.head){var c=this.head;if("undefined"===typeof a)for(;c;)c=c.e();else for(;c;)c=c.e(a)}};g.prototype._rm=function(a){this.head==a?this.tail==a?this.tail=this.head=null:(this.head=a.n,a.n.p=null):this.tail==a?(this.tail=a.p,a.p.n=null):(a.p.n=a.n,a.n.p=a.p)};j.ClosureList=g;var e=function(){this._hash_=[]};e.prototype.on=function(a,c,b,d){"undefined"===typeof b&&
(b=this);"undefined"===typeof d&&(d=0);var e,h=a.split(" "),j=h.length;for(a=0;a<j;a++)e=h[a],this._hash_[e]||(this._hash_[e]=new g),this._hash_[e].add(c,b,d);return this};e.prototype.onWithId=function(a,b,f,d){"undefined"===typeof f&&(f=this);"undefined"===typeof d&&(d=0);this._hash_[a]||(this._hash_[a]=new g);return this._hash_[a].add(b,f,d)};e.prototype.off=function(a,b,f){"undefined"===typeof b&&(b=void 0);"undefined"===typeof f&&(f=this);if("number"===typeof a)for(var d in this._hash_)this._hash_[d].rmById(a);
else if("string"===typeof a){var g=a.split(" "),e=g.length;for(a=0;a<e;a++)d=g[a],this._hash_[d]&&("undefined"===typeof b?this._hash_[d].rmAll():this._hash_[d].rm(b,f))}return this};e.prototype.execute=function(a,b){"undefined"===typeof b&&(b=null);this._hash_[a]&&this._hash_[a].exec(b)};e.prototype.removeAllListeners=function(){for(var a in this._hash_)this._hash_[a].rmAll();this._hash_=[]};j.EventDispatcher=e})(hrfm||(hrfm={}));
var Cycle=function(j){function h(b){"undefined"===typeof b&&(b=0);j.call(this);this.running=!1;this.interval=b;this.initialTime=(new Date).getTime();this.elapsedTime=0;this._requestAnimationFrame=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(b){return setTimeout(b,17)};this._cancelAnimationFrame=window.cancelRequestAnimationFrame||window.webkitCancelAnimationFrame||window.webkitCancelRequestAnimationFrame||
window.mozCancelRequestAnimationFrame||window.oCancelRequestAnimationFrame||window.msCancelRequestAnimationFrame||clearTimeout}__extends(h,j);h.prototype.start=function(){if(!0!=this.running){var b=this,g=0,e=(new Date).getTime(),a=0,c=this.interval;this._onAnimate=0<c?function(){g=(new Date).getTime();100*c<g-e&&(e=g-c);a=g-e;if(c<a){var f=~~(a/c);e+=f*c;b.execute("cycle",f)}b.elapsedTime+=a;b._animateID=b._requestAnimationFrame.call(window,b._onAnimate)}:function(){g=(new Date).getTime();a=g-e;
b.elapsedTime+=a;b.execute("cycle",1);e=g;b._animateID=b._requestAnimationFrame.call(window,b._onAnimate)};this._animateID=this._requestAnimationFrame.call(window,b._onAnimate);this.running=!0;this.execute("start")}};h.prototype.stop=function(){!1!=this.running&&(this._onAnimate=function(){},this._cancelAnimationFrame.call(window,this._animateID),this.running=!1,this.execute("stop"))};return h}(hrfm.EventDispatcher);
