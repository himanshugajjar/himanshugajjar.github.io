
function loadXMLDoc(dname, strval){
	if(!strval){
		
		if(window.XMLHttpRequest){
			xhttp = new XMLHttpRequest();
		}
		else {
			xhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xhttp.open("GET", dname, false);
		try { xhttp.responseType = 'msxml-document'; } catch(e){}
		xhttp.send();

		//IE9 and above versions
/*		browser = navigator.sayswho.split(" ");
		if( browser[0] == "MSIE" && parseFloat(browser[1]) > 10.0) {
			
		}
*/		
		return xhttp.responseXML;
		
	}else {
		
		if (window.DOMParser) {
			parser = new DOMParser();
			xmlDoc = parser.parseFromString(strval,"text/xml");
		}
		else {// Internet Explorer
			xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async = false;
			xmlDoc.loadXML(strval); 
		}
		return xmlDoc;
	}
}

function getXMLasString(xmlNode) {
        try {
                var str = (new XMLSerializer()).serializeToString(xmlNode);
                return str; // (new XMLSerializer()).serializeToString(xmlNode);
        } catch (e) {
                try {
                        return xmlNode.xml;
                } catch (e) {
                        // alert('Xmlserializer and .xml not supported');
                }
        }
        return null;
}

function copyNode(xmlNode) {
        try {
                copyxml = xmlNode.cloneNode(true);
        } catch (err) {
        }
        if (!copyxml) {
                copyxml = StringtoXML(getXMLasString(xmlNode));
        }
        return copyxml;
}

function StringtoXML(text) {
        if (window.ActiveXObject) {
                var doc = new ActiveXObject('Microsoft.XMLDOM');
                doc.async = 'false';
                doc.loadXML(text);
        } else {
                var parser = new DOMParser();
                var doc = parser.parseFromString(text, 'text/xml');
        }
        return doc;
}


function addItemToCmb(element, text, value, data)
{
    // Create an Option object
    var opt = document.createElement("option");
    
    // Add an Option object to Drop Down/List Box
    document.getElementById(element).options.add(opt);
    // Assign text and value to Option object
    opt.text = text;
    opt.value = value;
    opt.trm = data;
}

function findSelection(field) {
    var elmt = document.getElementsByName(field);
    var sizes = elmt.length;
    for (var i=0; i < sizes; i++) {
            if (elmt[i].checked==true) {
            return elmt[i].value;
        }
    }
}

function getSelectedVal(field) {
    var elmt = document.getElementById(field);
    return elmt.options[elmt.selectedIndex].value;
}

function getSelectedTxt(field) {
    var elmt = document.getElementById(field);
    return elmt.options[elmt.selectedIndex].text;
}

function showMessage(caption, msg, icon) {
	
	$("#freeow").freeow(caption, msg, {
	    classes: ["smokey", icon],
	    autoHide: true,
	    prepend: true,
	    autoHideDelay: 2000
	});
}

function log(message){
	if(true && typeof console == "object"){
		console.log(message);
	}
}

//LZW Compression/Decompression for Strings
var LZW = {
    compress: function (uncompressed) {
        "use strict";
        // Build the dictionary.
        if(!uncompressed) return uncompressed;
        var i,
            dictionary = {},
            c,
            wc,
            w = "",
            result = [],
            dictSize = 256;
        for (i = 0; i < 256; i += 1) {
            dictionary[String.fromCharCode(i)] = i;
        }
 
        for (i = 0; i < uncompressed.length; i += 1) {
            c = uncompressed.charAt(i);
            wc = w + c;
            if (dictionary[wc]) {
                w = wc;
            } else {
                result.push(dictionary[w]);
                // Add wc to the dictionary.
                dictionary[wc] = dictSize++;
                w = String(c);
            }
        }
 
        // Output the code for w.
        if (w !== "") {
            result.push(dictionary[w]);
        }
        return result.toString();
    },
 
 
    decompress: function (compressed) {
        "use strict";
        if(!compressed) return compressed;
        // Build the dictionary.
        var i,
            dictionary = [],
            w,
            result,
            k,
            entry = "",
            dictSize = 256;
        for (i = 0; i < 256; i += 1) {
            dictionary[i] = String.fromCharCode(i);
        }
 
        w = String.fromCharCode(compressed[0]);
        result = w;
        for (i = 1; i < compressed.length; i += 1) {
            k = compressed[i];
            if (dictionary[k]) {
                entry = dictionary[k];
            } else {
                if (k === dictSize) {
                    entry = w + w.charAt(0);
                } else {
                    return '';
                }
            }
 
            result += entry;
 
            // Add w+entry[0] to the dictionary.
            dictionary[dictSize++] = w + entry.charAt(0);
 
            w = entry;
        }
        return result;
    }
};

function base64_encode (data) {
	  // http://kevin.vanzonneveld.net
	  // +   original by: Tyler Akins (http://rumkin.com)
	  // +   improved by: Bayron Guevara
	  // +   improved by: Thunder.m
	  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // +   bugfixed by: Pellentesque Malesuada
	  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // +   improved by: Rafał Kukawski (http://kukawski.pl)
	  // *     example 1: base64_encode('Kevin van Zonneveld');
	  // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
	  // mozilla has this native
	  // - but breaks in 2.0.0.12!
	  //if (typeof this.window['btoa'] == 'function') {
	  //    return btoa(data);
	  //}
	  var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
	    ac = 0,
	    enc = "",
	    tmp_arr = [];

	  if (!data) {
	    return data;
	  }

	  do { // pack three octets into four hexets
	    o1 = data.charCodeAt(i++);
	    o2 = data.charCodeAt(i++);
	    o3 = data.charCodeAt(i++);

	    bits = o1 << 16 | o2 << 8 | o3;

	    h1 = bits >> 18 & 0x3f;
	    h2 = bits >> 12 & 0x3f;
	    h3 = bits >> 6 & 0x3f;
	    h4 = bits & 0x3f;

	    // use hexets to index into b64, and append result to encoded string
	    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	  } while (i < data.length);

	  enc = tmp_arr.join('');

	  var r = data.length % 3;

	  return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);

}

function base64_decode (data) {
	  // http://kevin.vanzonneveld.net
	  // +   original by: Tyler Akins (http://rumkin.com)
	  // +   improved by: Thunder.m
	  // +      input by: Aman Gupta
	  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // +   bugfixed by: Onno Marsman
	  // +   bugfixed by: Pellentesque Malesuada
	  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // +      input by: Brett Zamir (http://brett-zamir.me)
	  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
	  // *     returns 1: 'Kevin van Zonneveld'
	  // mozilla has this native
	  // - but breaks in 2.0.0.12!
	  //if (typeof this.window['atob'] == 'function') {
	  //    return atob(data);
	  //}
	  var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
	    ac = 0,
	    dec = "",
	    tmp_arr = [];

	  if (!data) {
	    return data;
	  }

	  data += '';

	  do { // unpack four hexets into three octets using index points in b64
	    h1 = b64.indexOf(data.charAt(i++));
	    h2 = b64.indexOf(data.charAt(i++));
	    h3 = b64.indexOf(data.charAt(i++));
	    h4 = b64.indexOf(data.charAt(i++));

	    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

	    o1 = bits >> 16 & 0xff;
	    o2 = bits >> 8 & 0xff;
	    o3 = bits & 0xff;

	    if (h3 == 64) {
	      tmp_arr[ac++] = String.fromCharCode(o1);
	    } else if (h4 == 64) {
	      tmp_arr[ac++] = String.fromCharCode(o1, o2);
	    } else {
	      tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
	    }
	  } while (i < data.length);

	  dec = tmp_arr.join('');

	  return dec;
}

function blinkChanges(selector) {
	
	$(selector).css("visibility", ($(selector).css("visibility") != 'visible') ? 'visible' : 'hidden');
}

var pageSize = 10;
function sorting(selector, arstr){
	
	var table = $(selector);
    //arstr = new Array('#stcode', '#date','#flno');
    for(x in arstr) {
        $(arstr[x])
        .wrapInner('<span title="sort this column"/>')
        .each(function(){
            
            var th = $(this),
                thIndex = th.index(),
                inverse = false;

            th.click(function(){
                
                table.find('td').filter(function(){
                    
                    return $(this).index() === thIndex;
                    
                }).sortElements(function(a, b){
                    
                    return $.text([a]) > $.text([b]) ?
                        inverse ? -1 : 1
                        : inverse ? 1 : -1;
                    
                }, function(){
                    // parentNode is the element we want to move
                    return this.parentNode; 
                    
                });
                
                $('#flights > tbody > tr:even').css("background-color", dataaltBackground);
                $('#flights > tbody > tr:odd').css("background-color",dataBackground);
                $("#flights").paginateTable({ rowsPerPage: pageSize, cPageNum: $('.currentPage').text() });
                inverse = !inverse;
            });
                
        });
    }
}

function swapColumns(selector, clm, after){
	$.each($(selector + " tr"), function() { 
//	    $(this).children(":eq("+ changeby + ")").after($(this).children(":eq("+ to + ")"));
	    $(this).children(clm).after($(this).children(after));
	});
}

function getURLParam() {
	  var searchString = window.location.search.substring(1)
	    , params = searchString.split("&")
	    , hash = {}
	    ;

	  for (var i = 0; i < params.length; i++) {
	    var val = params[i].split("=");
	    hash[unescape(val[0])] = unescape(val[1]);
	  }
	  return hash;
}

function RGB2HTML(red, green, blue) {
	var decColor = fillZero(red.toString(16)) + fillZero(green.toString(16))
			+ fillZero(blue.toString(16));
	return decColor.toUpperCase(); // .toString(16);
}

function jsfnInit(){
	if (!String.prototype.trim) {
		//code for trim
		String.prototype.trim=function(){return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};
		String.prototype.ltrim=function(){return this.replace(/^\s+/,'');};
		String.prototype.rtrim=function(){return this.replace(/\s+$/,'');};
		String.prototype.fulltrim=function(){return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');};		
	}	

	navigator.sayswho = (function(){
	    var ua= navigator.userAgent, tem, 
	    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d\.]+)/i) || [];
	    if(/trident/i.test(M[1])){
	        tem=  /\brv[ :]+(\d+(\.\d+)?)/g.exec(ua) || [];
	        return 'IE '+(tem[1] || '');
	    }
	    M= M[2]? [M[1], M[2]]:[navigator.appName, navigator.appVersion, '-?'];
	    if((tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
	    return M.join(' ');
	})();

}

//dbStoreData
function Set_Cookie(key, data) {
	localStorage.setItem( 'etm_' + key + window.location.host, data);
}

function Get_Cookie(key) {
	return localStorage.getItem( 'etm_' + key + window.location.host);
}

function Delete_Cookie(key) {
	return localStorage.removeItem( 'etm_' + key + window.location.host);
}
