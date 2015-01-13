
function buildDashboard(home, edit) {
	var menudata = '';
	for (var cnt = 0; cnt < home.arBtnset.length; cnt++) { // create buttons on screen
		var btn = home.arBtnset[cnt];
		btn.id = cnt;
		menudata += '<div name="airporttile" id="tilebtn-'+ cnt + 
		'" class="tile ' + getTilesize(btn.txt) + ' ' + (btn.dmod == 'TRM'? 'trm' : '') +
		' ' + getTilecolor(btn.bc) + '" onclick="'+ (edit? '' : 'location.href=\'' + openlink( btn ) + '\'') + ';">\
	            <div class="tile-content">\
	                <h3>' + btn.txt +'</h3>\
	                <p><b>'+ getTerminals(btn.trm) + 
	                '<br>' + getFlighttype(btn.flight) + 
	                '<br>(' + btn.time + ')</b></p>\
	            </div>' + 
	            (edit?('<div class="brand">' + 
	    		        '<div class="badge bg-color-red error" name="subtilebtn" style="margin-right:0px;"></div>' +
	    			    '</div>'):'')
	        + '</div>';
	}
	
	return menudata;
}

function getTilecolor(text){
	var str;
	switch(text){
		case "b": {str = "bg-color-blue"; break;}
		case "y": {str = "bg-color-yellow"; break;}
		case "g": {str = "bg-color-green"; break;}
		case "p": {str = "bg-color-pink"; break;}
		case "gl": {str = "bg-color-greenLight"; break;}
		case "r": {str = "bg-color-red"; break;}
		case "bl": {str = "bg-color-blueLight"; break;}
		case "bd": {str = "bg-color-blueDark"; break;}
		case "o": {str = "bg-color-orange"; break;}
		case "gd": {str = "bg-color-greenDark"; break;}
		case "pu": {str = "bg-color-purple"; break;}
		case "pd": {str = "bg-color-pinkDark"; break;}
		case "od": {str = "bg-color-orangeDark"; break;}
		case "d": {str = "bg-color-darken"; break;}
		default: {str = "";}
	}
	return str;
}

function getTilesize(text){
	var str = text;
	
	for(var sIndx = 0, cnt = 0; sIndx >= 0; cnt++){
		str = str.substring(sIndx);
		sIndx = str.indexOf(' ');
		if((sIndx > 12) || (cnt > 1)){
			return 'double';
		}
		else if(sIndx > 0){
			sIndx++;
		}
		else if(sIndx < 0){
			if((str.length > 12) || (text.length > 26))
				return 'double';
			else
				break;
		}
	}
	
	return '';
}

function getFlighttype(flight){
	var str;
	switch(flight){
		case "A": {str = "Arrivals"; break;}
		case "D": {str =  "Departures"; break;}
		default: {str = "";}
	}
	return str;
}

function getTerminals(ar_trm){
	var str = ar_trm.length ? 'Terminal(s) ' : 'All Terminals';
	for(var i = 0; i < ar_trm.length; i++){
		str += ar_trm[i] + (i < (ar_trm.length - 1)? ', ': '');
	}
	return str;
}

var file_arr = [['LHR_1_D_L','lhrt1dl.xml.gz'],
		['LHR_1_D_U','lhrt1dz.xml.gz'],
		['LHR_1_A_L','lhrt1al.xml.gz'],
		['LHR_1_A_U','lhrt1az.xml.gz'],
		
		['LHR_3_D_L','lhrt3dl.xml.gz'],
                ['LHR_3_D_U','lhrt3dz.xml.gz'],
                ['LHR_3_A_L','lhrt3al.xml.gz'],
                ['LHR_3_A_U','lhrt3az.xml.gz'],
                
		['LHR_5_D_L','lhrt5dl.xml.gz'],
                ['LHR_5_D_U','lhrt5dz.xml.gz'],
                ['LHR_5_A_L','lhrt5al.xml.gz'],
                ['LHR_5_A_U','lhrt5az.xml.gz'],

                ['LGW_N_D_L','lgwtndl.xml.gz'],
                ['LGW_N_D_U','lgwtndz.xml.gz'],
                ['LGW_N_A_L','lgwtnal.xml.gz'],
                ['LGW_N_A_U','lgwtnaz.xml.gz'],

                ['LCY__D_L','lcytdl.xml.gz'],
                ['LCY__D_U','lcytdz.xml.gz'],
                ['LCY__A_L','lcytal.xml.gz'],
                ['LCY__A_U','lcytaz.xml.gz'],

                ['JFK_7_D_L','jfkt7dl.xml.gz'],
                ['JFK_7_D_U','jfkt7dz.xml.gz'],
                ['JFK_7_A_L','jfkt7al.xml.gz'],
                ['JFK_7_A_U','jfkt7az.xml.gz'],

		];

//onclick="' + openlink('https://etmplus-uat.baplc.com/ETMclient.html?gzFile=lhrt5dz.xml.gz') + ';">\
function openlink(btnset){

        var pushurl = 'ngETMclient.html?gzFile=';

	for(var cnt = 0; file_arr.length > cnt; cnt++) {
		if(file_arr[cnt][0] ==  btnset.code + '_' + (btnset.trm.length ? btnset.trm[0] : '') + '_' + btnset.flight + '_' + btnset.time.substring(0,1)) {
			pushurl += file_arr[cnt][1];

			if (btnset.dmod == 'TRM' && btnset.code == 'LHR') {
				pushurl = pushurl.substring(0, pushurl.indexOf('.xml.gz')) + '_a'  + '.xml.gz&MOD=TRM';	
			}

			break;
		}
	}

	return pushurl;
}

/* will required for real work
function openlink(btnset){
	
	var pushurl = 'https://etmplus-uat.baplc.com/metro2/etmpushclient.html';
	return pushurl + 
	'?STNTXT=' + btnset.txt + 
	'&STNCOD=' + btnset.code +
	'&STNTRM=' + btnset.trm +
	'&STNTIM=' + btnset.time +
	'&STNDMO=' + btnset.dmod +
	'&STNDA=' + btnset.flight ;
}
*/
var MAX_BTNS = 10;

function Dashboard(){

	this.arBtnset;
	this.btnset_cnt = getBtnsetCount();
	this.addButton = addButton;
	this.loadAllViewSets = loadAllViewSets;
	this.getBtnsetCount = getBtnsetCount;
	this.loadBtnset = loadBtnset;
	this.add_arBtnset = add_arBtnset;

	function getBtnsetCount() {
		btnset_cnt = Get_Cookie("btnset_cnt");

		if(!btnset_cnt) 
			btnset_cnt = 0;
		
		return btnset_cnt;
	}
	
	function add_arBtnset(array) {
		var max_ar = array;
		var dest =  null;
		for(var i = 1, sindex = 0; sindex < array.length; i++, sindex+=MAX_BTNS){
			
			max_ar = cpArray(array, sindex, array.length - sindex);
			dest = cpArray(max_ar, 0, max_ar.length > MAX_BTNS ? MAX_BTNS : max_ar.length);

			Set_Cookie("btnset" + i, base64_encode(JSONcompress(JSON.stringify(dest))));
			Set_Cookie("btnset_cnt", i);
		}
	}
	
	function cpArray(src, sIndex, len){
		if(sIndex > src.length)
			return null;
		
		var dest = new Array();
		for (var i = 0; i < len; i++){
				dest.push(src[sIndex+i]);
		}
		
		return dest;
	}
	
	function addButton(tilebtn) {
		var ar_lastbtn = JSON.parse(JSONdecompress(base64_decode(Get_Cookie("btnset" + btnset_cnt))));

		if(ar_lastbtn && ar_lastbtn.length < MAX_BTNS) {
			ar_lastbtn.push(tilebtn);
		}
		else {
			ar_lastbtn = new Array();
			ar_lastbtn.push(tilebtn);
			btnset_cnt++;
		}
		
		Set_Cookie("btnset" + btnset_cnt, base64_encode(JSONcompress(JSON.stringify(ar_lastbtn))));
		Set_Cookie("btnset_cnt", btnset_cnt);
	}
	
	function loadBtnset(index) { 
		//index starts from 1
		if(index > btnset_cnt)
			return null;
		
		return JSON.parse(JSONdecompress(base64_decode(Get_Cookie("btnset" + index))));
	}
	
	function JSONcompress(str) {
		if(!str) return null;
		return str.replace(/","/g,'&').replace(/":"/g,'=').replace(/\s/g,'_').replace(/":/g,'~');
	}

	function JSONdecompress(str) {
		if(!str) return null;
		return str.replace(/&/g,"\",\"").replace(/=/g,"\":\"").replace(/_/g,' ').replace(/~/g,"\":");
	}
	
	function loadAllViewSets() {

//		if(!btnset_cnt){
//			Set_Cookie("btnset_cnt", 1);
//			btnset_cnt = 1;
//		}
		
		this.arBtnset = new Array();
		for(var i = 0; i < btnset_cnt; i++){
			var btndata = loadBtnset(i+1);
			for(var cnt = 0; cnt < btndata.length; cnt++) {
				this.arBtnset.push(btndata[cnt]);
			}
		}
		
		return this.arBtnset;
	}
}

function Btnset(id, artile_btn) {
	this.id = id;
	this.tile_btns = artile_btn;
}

function tile_btn() {

	this.id = 0;
	this.code = '';
	this.txt = ''; 
	this.trm = new Array();
	this.time = ''; 
	this.flight = '';
	this.dmod = '';
	this.bc = '';
	this.setTile_btn = setTile_btn;
	
	function setTile_btn(id, airportcode, airporttext, 
			terminal, localtime, flight, displaymode, btncolor) {
		
		this.id = id;
		this.code = airportcode;
		this.txt = airporttext; 
		this.trm = terminal;
		this.time = localtime; 
		this.flight = flight;
		this.dmod = displaymode;
		this.bc = btncolor;
	}
}
