var c=this;
function d(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var f=Object.prototype.toString.call(a);if("[object Window]"==f)return"object";if("[object Array]"==f||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==f||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==
b&&"undefined"==typeof a.call)return"object";return b};var e=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")};function g(a,b){return a<b?-1:a>b?1:0};var h;a:{var n=c.navigator;if(n){var p=n.userAgent;if(p){h=p;break a}}h=""};var q=-1!=h.indexOf("Opera")||-1!=h.indexOf("OPR"),r=-1!=h.indexOf("Trident")||-1!=h.indexOf("MSIE"),t=-1!=h.indexOf("Edge"),u=-1!=h.indexOf("Gecko")&&!(-1!=h.toLowerCase().indexOf("webkit")&&-1==h.indexOf("Edge"))&&!(-1!=h.indexOf("Trident")||-1!=h.indexOf("MSIE"))&&-1==h.indexOf("Edge"),v=-1!=h.toLowerCase().indexOf("webkit")&&-1==h.indexOf("Edge");
function w(){var a=h;if(u)return/rv\:([^\);]+)(\)|;)/.exec(a);if(t)return/Edge\/([\d\.]+)/.exec(a);if(r)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(v)return/WebKit\/(\S+)/.exec(a)}function x(){var a=c.document;return a?a.documentMode:void 0}var z=function(){if(q&&c.opera){var a=c.opera.version;return"function"==d(a)?a():a}var a="",b=w();b&&(a=b?b[1]:"");return r&&(b=x(),b>parseFloat(a))?String(b):a}(),A={};
function B(a){var b;if(!(b=A[a])){b=0;for(var f=e(String(z)).split("."),y=e(String(a)).split("."),D=Math.max(f.length,y.length),m=0;0==b&&m<D;m++){var E=f[m]||"",F=y[m]||"",G=RegExp("(\\d*)(\\D*)","g"),H=RegExp("(\\d*)(\\D*)","g");do{var k=G.exec(E)||["","",""],l=H.exec(F)||["","",""];if(0==k[0].length&&0==l[0].length)break;b=g(0==k[1].length?0:parseInt(k[1],10),0==l[1].length?0:parseInt(l[1],10))||g(0==k[2].length,0==l[2].length)||g(k[2],l[2])}while(0==b)}b=A[a]=0<=b}return b}
var C=c.document,I=C&&r?x()||("CSS1Compat"==C.compatMode?parseInt(z,10):5):void 0;!u&&!r||r&&9<=I||u&&B("1.9.1");r&&B("9");r&&B("9");!v||B("528");u&&B("1.9b")||r&&B("8")||q&&B("9.5")||v&&B("528");u&&!B("8")||r&&B("9");
