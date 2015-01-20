/*fight detail factory*/

app.factory('detailFlight', function ($http, $location) {
    var rowData = [];
    var colDef = [];
    var cellprop = [];
    var change = 0;

    return {
	colDef: function () {
            if ((change & 1) == 1) {
                change &= 6;
            }
            return colDef;
        },
        cellprop: function () {
            if ((change & 2) == 2) {
                change &= 5;
            }
            return cellprop;
        },
        rowData: function () {
            if ((change & 4) == 4) {
                change &= 3;
            }
            return rowData;
        },
        setcolDef: function (data) {
            colDef = data;
            change |= 1;
        },
        setcellprop: function (data) {
            cellprop = data;
            change |= 2;
        },
        setrowData: function (data) {
            rowData = data;
            change |= 4;
        },
        change: function () {
            return change;
        },
        selectDelaycode: function (cd) {
            var $sp = $('#editModal').scope();
            for(var i = 0; i < $sp.sdelaycode.length; i++) {
                if($sp.sdelaycode[i].sqn == cd.sqn) {
                    //$sp.sdelaycode[i].code = cd.code;
                    //$sp.sdelaycode[i].delay = cd.delay;
                    if(cd.code == '') { $sp.selectedcode = $sp.delaycode[0]; $("#select_code").val(0); }
                    else {
                        $("#select_code option:contains(" + cd.code + ")").each(function(indx) {
                                         if($(this).html() == cd.code) {
                                             $(this).attr('selected', 'selected');
                                             $sp.selectedcode = $sp.delaycode[$(this).val()];
                                             return false;
                                         }
                                  });
                    }
                    $sp.sdelay = cd.delay;
                    $sp.cdupdate = i;
                    $sp.predelete = false;
                    $sp.deletemark = $sp.sdelaycode[i];
                    $("button[id^='btn-dc-']").removeClass("active");
                    $('#btn-dc-' + cd.sqn).addClass("active");
                }
            }
        },
        removeDelaycode: function (scode) {
            var $sp = $('#editModal').scope();
            if($sp.cdupdate != -1) {
                $sp.sdelaycode[$sp.cdupdate].code = '';
                $sp.sdelaycode[$sp.cdupdate].delay = '';
                $sp.predelete = false;
                $sp.sdelay = '';
                $('#btn-dc-' + $sp.sdelaycode[$sp.cdupdate].sqn).removeClass("active");
                $sp.selectedcode = $sp.delaycode[0];
                $("#select_code").val(0);
                $sp.cdupdate = -1;
            }
        },
        addupdateDelaycode: function (scode, sdelay) {
            var $sp = $('#editModal').scope();
            if($sp.cdupdate != -1) {
                dc = $sp.sdelaycode[$sp.cdupdate];
                dc.code = scode.DelayCode;
                dc.delay = sdelay;             
                $sp.cdupdate = -1;
                $('#btn-dc-' + dc.sqn).removeClass("active");
                return;
            }
            if (scode == undefined || scode.DelayCode == undefined || scode.DelayCode == '' || sdelay == undefined || sdelay == '' ) return;
            if($sp.sdelaycode.length < 6) {
                $sp.sdelaycode.push({sqn : $sp.sdelaycode.length + 1, code: scode.DelayCode, delay: sdelay});
            } else {
               $sp.message = "You can add only six delay codes." 
            }
        },
	clickCell: function (col, columns, row, enable) {
            if (col == undefined) return;
            if (col.editable.length && enable == 'on') {
                var $sp = $('#editModal').scope();
                $sp.commentdata = row["EventTweet"] != undefined ? row["EventTweet"].trim().slice(0) : row["EventComment"].trim().slice(0);
                $('#editcomment').parent().removeClass("has-error");
                $sp.editmodel_msg = '';
                $sp.cdupdate = -1;

                if(!$sp.delaycode) {
                    //load delaycode 
                    $http.get($location.protocol() + '://' + $location.host() + '/metro2/data/delaycodes.json').success(function (datafile) {
                        if(datafile) {
                            datafile.DelayType.unshift({DelayCode :'', DelayCodeDec: ''});
                            $sp.delaycode = datafile.DelayType; 
                            $("#select_code").val(0);
                        }
                    });
                }
                var colprefix;
                var sfunc;
                var val = row["KeyData"].split('|');
                var file = (val[4] + val[0] + val[1] + val[2]).replace(/ /g, '');
                var strxml = '/metro?gzFile=message_store/';

                colprefix = '_delaycoded.dat.gz';
                sfunc = function (datafile) {
                                fdelay = createJSON(datafile);
                                if(!fdelay || !fdelay.mFlightUpdate) return;
                                fdelay = fdelay.mFlightUpdate.DepartureMovementDetail.MovementDelays.Delay;
                                //create table to display
                                for(i = 0; i < fdelay.length; i++) {
                                        if(!fdelay[i].DelaySequenceNumber) continue;
                                        $sp.OrgDelayCodes.push({"sqn": fdelay[i].DelaySequenceNumber,
                                                "code" : fdelay[i].BA_DelayReasonCode ? fdelay[i].BA_DelayReasonCode: '',
                                                "delay" : fdelay[i].DelayDuration ? fdelay[i].DelayDuration/100 : ''});
                                }
                        }

                $http.get($location.protocol() + '://' + $location.host() + strxml + file + colprefix).success(function (datafile) {
                        $sp.OrgDelayCodes = [];
                        sfunc(datafile);
                        angular.copy($sp.OrgDelayCodes, $sp.sdelaycode);
                        //if(sp.popover.Rows.length)$('#popoverModal').modal('show');
                }).error(function(err){log(err)});

                $sp.editrow = row;
	        $sp.editetd = row['EstimatedDepartureDateTime'];

                if(!$sp.sdelaycode) $sp.sdelaycode = [];
                $sp.sdelay = '';
                if(!$sp.deletemark) $sp.deletemark = {};

                $('#editetd').datetimepicker({ pickDate: false, pickSeconds: false });
                $('#editModal').modal('show');
                //$('.modal-backdrop').css("top", -800);
                $("#select_code").val(0);
           }
           if (col.popover) {
               	//popup the info
                var colprefix;
		var sfunc;
                var val = row["KeyData"].split('|');
                var file = (val[4] + val[0] + val[1] + val[2]).replace(/ /g, '');
                var strxml = '/metro?gzFile=message_store/';
                var sp = $('#popoverModal').scope();
                
		sp.popover = {};
        	sp.popover.title =  (val[0] + val[1] + val[2]).replace(/ /g, '') + ' ' + val[4];
                sp.popover.Rows = [];
                sp.popover.Cols = [];

		if(col.field == 'FICODisruptionFlag'){
			colprefix = '_disruption.dat.gz'; //file = '2013-11-17BA255'; // testing
                        sfunc = function (datafile) {
                                data = createJSON(datafile);
                                if(!data || !data.mDisruptionUpdate) return;
				data = data.mDisruptionUpdate.DisruptionDetail;
                                //create table to display
                                sp.popover.Cols = [{"name":"c1", "text":"Disruption Time"},
                                	{"name":"c2", "text":"Disruption Comment"}];

                              	sp.popover.Rows.push({"c1": data.DisruptionTimeStamp,
                                         "c2" : data.DisruptionComment });
                               
                        }

		}
		else if(col.field == 'ETM_DepartureDelayMinutes' || col.field == 'ETM_ArrivalDelayMinutes'){
			colprefix = '_delaycoded.dat.gz';
			sfunc = function (datafile) {
        	        	fdelay = createJSON(datafile);
                	        if(!fdelay || !fdelay.mFlightUpdate) return;
				fdelay = fdelay.mFlightUpdate.DepartureMovementDetail.MovementDelays.Delay;
                        	//create table to display
                	        sp.popover.Cols = [{"name":"c1", "text":"#"},
                                	{"name":"c2", "text":"Delay Code"},
                                        {"name":"c3", "text":"Delay Duration"}];

                                for(i = 0; i < fdelay.length; i++) {
					if(!fdelay[i].BA_DelayReasonCode) continue;
                                       	sp.popover.Rows.push({"c1": fdelay[i].DelaySequenceNumber,
                                        	"c2" : fdelay[i].BA_DelayReasonCode,
                                                "c3" : fdelay[i].DelayDuration });
                               	}
			}
            	}
		else if(col.field == 'LoadMessageStatus') {
			colprefix = '_LDM.dat.gz';
                        sfunc = function (datafile) {
                                data = createJSON(datafile);
                                if(!data  || !data.mFlightLoadPlan) return;
                                data = data.mFlightLoadPlan.FlightLoadPlanDetail;
                                //create table to display
                                sp.popover.Cols = [{"name":"c1", "text":"Original Message"}];
                                sp.popover.Rows.push({"c1": data.OriginalSourceMessage});
                        }
		}
		else if( col.field == 'ContainerPalletMessageStatus') {
			colprefix = '_CPM.dat.gz';
                        sfunc = function (datafile) {
                                data = createJSON(datafile);
                                if(!data || !data.mFlightLoadPlan ) return;
                                data = data.mFlightLoadPlan.FlightLoadPlanDetail;
                                //create table to display
                                sp.popover.Cols = [{"name":"c1", "text":"Original Message"}];
                                sp.popover.Rows.push({"c1": data.OriginalSourceMessage});
                        }

		}
		else { return; }

                $http.get($location.protocol() + '://' + $location.host() + strxml + file + colprefix).success(function (datafile) {
			sfunc(datafile);
               		if(sp.popover.Rows.length)$('#popoverModal').modal('show');
                }).error(function(err){log(err)});

           }
       }

    }
});
