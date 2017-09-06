Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

var beginYear = 2017;
var beginMonth = 0;
var endMonth = 0;
var curDate = new Date();

/*
每月10号前显示上月记录
10号后显示当月记录
*/
if(curDate.getDate() > 10 )
{
	beginMonth = curDate.getMonth()+1;
}
else
{
	beginMonth = curDate.getMonth();
}
beginYear = curDate.getFullYear();
curDate.setMonth(beginMonth);
curDate.setDate(0);

/* 返回当月的天数 */
var maxDays = curDate.getDate();
var beginDateStr = beginYear + "-" + toDoubleString(beginMonth) + "-01";

/*
计算下个月的第一天，由于接口对于endDate参数是用小于条件，所以 要用下月1号作为endDate,否则查询不到当月的最后一天
*/
var endDate = new Date();
if(new Date().getDate() > 10 )
{
	endMonth = curDate.getMonth()+2;
}
else
{
	endMonth = curDate.getMonth()+1;
}
endDate.setMonth(endMonth)
var endDateStr = endDate.getFullYear() + "-" + toDoubleString(endDate.getMonth()+1) +  "-01";


var weekNames = "日一二三四五六".split("");
var mouthData = [];
var weekData = [];
for(var i=1;i <= maxDays ; i++)
{
	curDate.setDate(i)
	mouthData[i-1] = curDate.Format("yyyy-MM-dd");
	week = weekNames[curDate.getDay()];
	if("日" == week || "六" == week)
		weekData[i-1] = "<font size='3' color='#ffffff' style='background-color:#A52A2A;' >("+week+")</font>";
	else
		weekData[i-1] = "("+week+")";
		
	
}

//打卡列表
var cardsUrl="http://oa.com/Pages/Hr/EmployeeAttendance/EmployeeCardData.aspx?action=GridBindList&BeginTime=" + beginDateStr + "&EndTime="+endDateStr+"&time=Mon%20Jul%2003%202017%2012:10:46%20GMT+0800%20(CST)&pqGrid_PageIndex=1&pqGrid_PageSize=100&pqGrid_OrderField=&pqGrid_OrderType=desc&pqGrid_Sort=UserName%2CWorkNo%2CDepartment%2CDDate%2CDTime";
var cardsResposeText;

//已提交的加班时间列表
var overtimeUrl="http://oa.com/Pages/Ec/EcOverTime/Default.aspx?action=GridBindList&command=Query&keywords=&compensation=0&time=Mon%20Jul%2003%202017%2014:18:04%20GMT+0800%20(CST)&pqGrid_PageIndex=1&pqGrid_PageSize=100&pqGrid_OrderField=&pqGrid_OrderType=desc&pqGrid_Sort=OverTimeId%2C%2C%2CNowStep%2CBillNo%2CRealName%2CCode%2CFullName%2CCreateDate%2CBeginDate%2CEndDate%2COverTimeHours%2CCompensationText"
var overtimeResposeText;

//已提交的补休时间列表
var leaveUrl="http://oa.com/Pages/Ec/EcLeave/Default.aspx?action=GridBindList&command=Query&leaveType=&startDate=" + beginDateStr + "&endDate="+endDateStr+"&keywords=&time=Mon Jul 03 2017 14:29:22 GMT+0800 (CST)&pqGrid_PageIndex=1&pqGrid_PageSize=50&pqGrid_OrderField=&pqGrid_OrderType=desc&pqGrid_Sort=LeaveId,,,NowStep,BillNo,RealName,Code,FullName,ItemName,CreateDate,BeginDate,EndDate,LeaveHours";
var leaveResposeText;

//未提交的补休时间列表
var leaveUrlNotCommit = "http://oa.com/Pages/Ec/EcLeave/Default.aspx?action=GridBindList&command=Default&leaveType=&startDate=" + beginDateStr + "&endDate="+endDateStr+"&keywords=&time=Wed%20Aug%2009%202017%2016:51:00%20GMT+0800%20(CST)&pqGrid_PageIndex=1&pqGrid_PageSize=100&OrderField_pqGrid=&pqGrid_OrderType=desc&pqGrid_Sort=LeaveId%2C%2C%2CNowStep%2CBillNo%2CRealName%2CCode%2CFullName%2CItemName%2CCreateDate%2CBeginDate%2CEndDate%2CLeaveHours"
var leaveUrlNotCommitResposeText;

document.addEventListener('DOMContentLoaded', function () 
{
	document.getElementById("test_div").innerHTML= beginDateStr + "____" + endDateStr;
 	var req = new XMLHttpRequest();
    	req.open("GET", cardsUrl, false);
    	req.send(null);
    	cardsResposeText = JSON.parse(req.responseText);
    	
    	req = new XMLHttpRequest();
    	req.open("GET", overtimeUrl, false);
    	req.send(null);
    	overtimeResposeText = JSON.parse(req.responseText);
    	
    	req = new XMLHttpRequest();
    	req.open("GET", leaveUrl, false);
    	req.send(null);
    	leaveResposeText = JSON.parse(req.responseText);
    	
    	req = new XMLHttpRequest();
    	req.open("GET", leaveUrlNotCommit, false);
    	req.send(null);
    	leaveUrlNotCommitResposeText = JSON.parse(req.responseText);
    	
    	doWork();
    	
    	if(lateList.length != 0)
	{
		document.getElementById("submitButton").onclick = fixLate;
	}
	else
	{
		document.getElementById("submitButton").style.visibility="hidden";
		
	}
	//document.getElementById("noooooooooooooo").innerHTML = leaveUrl
	totletime();
});



function doWork()
{
	filterLeave();
	filterOvertime();
	filterLeaveNotCommit();
	filterCards();
	
	var html=document.getElementById("user_data").innerHTML;
	
	for(var i = 0; i < mouthData.length; i++ )
	{
		var row = "";
		row += td(weekData[i]+" "+mouthData[i].substring(5,mouthData[i].length));
		
		if(cardsResposeText[mouthData[i]])
		{
			var start = cardsResposeText[mouthData[i]].start;
			var end = cardsResposeText[mouthData[i]].end;
			var islate = isLate(start);
			
			row += td(start == "" ? "缺卡" : start, start == "" || islate );
			row += td(end == "" ? "缺卡" : end, end == "",isOvertime(end));
			
			if(islate)
			{
				if(leaveUrlNotCommitResposeText[mouthData[i]])
				{
					var leave = leaveUrlNotCommitResposeText[mouthData[i]];
					row += td(leave[0]) + td(leave[1]) + td(leave[2]);
					sumLeaveTime +=  parseFloat(leaveUrlNotCommitResposeText[mouthData[i]][2]);
				}
				else if(leaveResposeText[ mouthData[i]])
				{
					var leave = leaveResposeText[ mouthData[i] ];
					row += td(leave[0]) + td(leave[1]) + td(leave[2]);
					sumLeaveTime +=  parseFloat(leaveResposeText[mouthData[i]][2]);
				}
				else
				{
					if(overtimeResposeText[mouthData[i]])
					{
						var overTimeStart = parseInt(overtimeResposeText[mouthData[i]][0].split(":")[0]);
						if(overTimeStart >= 18)//当天有加班时间的情况下，从下午6点后开始的，才加入自动填补休单列表 
							lateList.push({"date":mouthData[i],"time":start});	
						
					}
					else
					{
						lateList.push({"date":mouthData[i],"time":start});	
					}
					row += td("") + td("")+ td("");
				}
			}
			else
			{
			
			
				row += td("") + td("")+ td("");
			}
			
			if(overtimeResposeText[mouthData[i]])
			{
				row +=td(overtimeResposeText[mouthData[i]][0]);
				row +=td(overtimeResposeText[mouthData[i]][1],
					overtimeResposeText[mouthData[i]][1] != "已完成",
					overtimeResposeText[mouthData[i]][1] == "已完成");
				row +=td(overtimeResposeText[mouthData[i]][2]);
				sumOverTime += parseFloat(overtimeResposeText[mouthData[i]][2])
			}
			else
			{
				row += td("") + td("")+ td("");
			}
			
			
		}
		else
		{
			row += td("") + td("")  ;
			if(leaveUrlNotCommitResposeText[mouthData[i]])
			{
				var leave = leaveUrlNotCommitResposeText[mouthData[i]];
				row += td(leave[0]) + td(leave[1]) + td(leave[2]);
				sumLeaveTime +=  parseFloat(leaveUrlNotCommitResposeText[mouthData[i]][2]);
				row += td("")+ td("")+ td("");
			}
			else if(leaveResposeText[ mouthData[i]])
			{
				var leave = leaveResposeText[ mouthData[i] ];
				row += td(leave[0]) + td(leave[1]) + td(leave[2]);
				sumLeaveTime +=  parseFloat(leaveResposeText[mouthData[i]][2]);
				row += td("")+ td("")+ td("");
			}
			else
			{
				row +=  td("")+ td("")+ td("") + td("")+ td("")+ td("");
			}
		}
		html += tr(row);
	}
	html += tr(td("半年补休：")+"<td id='totleLeavetime' ></td>"+td("半年加班:")+"<td id='totleOvertime' ></td>"+td("本月补休:")+td(""+sumLeaveTime)+td("")+td("本月加班:")+td(""+sumOverTime))
	document.getElementById("user_data").innerHTML=html;
	
}




var sumOverTime = 0.0;
var sumLeaveTime = 0.0;
var lateList = new Array();

/*
整理打卡数据结构
*/
function filterCards()
{
	var data = cardsResposeText.data;
	var newData = {};
	
	for(var i = 0; i < data.length;i++)
	{
		
		if(!newData[data[i][3]])
		{
			newData[data[i][3]] = {};
			newData[data[i][3]]["start"] = "";
			newData[data[i][3]]["end"] = "";	
		}
		
		if(parseInt(data[i][4].split(":")[0]) >= 18)
		{
			newData[data[i][3]].end = data[i][4];
		}
		else if( "" == newData[data[i][3]].start )
		{
			newData[data[i][3]].start = data[i][4];
		}
		else
		{
			newData[data[i][3]].end = data[i][4];
		}
		
	}
	
	cardsResposeText = newData;

}

/*
过滤加班信息
*/
function filterOvertime()
{
	var data = overtimeResposeText.data;
	var newData = {};
	for(var i = 0; i < data.length; i++)
	{
		startTime = data[i][9];
		endTime = data[i][10];
		
		newData[toFullDay(startTime.split(" ")[0])] = [ 
								startTime.split(" ")[1].split(":")[0]+":" + startTime.split(" ")[1].split(":")[1] + "~" 
								+ endTime.split(" ")[1].split(":")[0]+":" + endTime.split(" ")[1].split(":")[1],
								data[i][3].split("【")[0].split("(")[0],
								data[i][11]
							       ];
	}
	overtimeResposeText = newData;
}

/*
过滤补休
*/
function filterLeave()
{
	var data = leaveResposeText.data;
	var newData = {};
	for(var i = 0; i < data.length; i++)
	{
		startTime = data[i][10];
		endTime = data[i][11];
		
		newData[toFullDay(startTime.split(" ")[0])] = [
								startTime.split(" ")[1].split(":")[0]+":" + startTime.split(" ")[1].split(":")[1] + 
								" ~ " + endTime.split(" ")[1].split(":")[0]+":" + endTime.split(" ")[1].split(":")[1],
								data[i][3].split("【")[0].split("(")[0],
								data[i][12]
							      ];
	}
	leaveResposeText = newData;
	
	//document.getElementById("test_div").innerHTML= leaveResposeText["2017-6-29"];
	//document.getElementById("test_div").innerHTML= JSON.stringify(leaveResposeText);
}

/*
过滤未提交的补休
*/
function filterLeaveNotCommit()
{
	var data = leaveUrlNotCommitResposeText.data;
	var newData = {};
	for(var i = 0; i < data.length; i++)
	{
		startTime = data[i][10];
		endTime = data[i][11];
		
		newData[toFullDay(startTime.split(" ")[0])] = [
								startTime.split(" ")[1].split(":")[0]+":" + startTime.split(" ")[1].split(":")[1] + 
								" ~ " + endTime.split(" ")[1].split(":")[0]+":" + endTime.split(" ")[1].split(":")[1],
								"--未提交--",
								data[i][12]
							      ];
	}
	leaveUrlNotCommitResposeText = newData;
	
	//document.getElementById("test_div").innerHTML= leaveResposeText["2017-6-29"];
	//document.getElementById("test_div").innerHTML= JSON.stringify(leaveResposeText);
}

/*
计算半年内的加班数和补息数
*/
function totletime()
{

	var testDate = new Date();
	var endDate = testDate.Format("yyyy-MM-dd"); 
	testDate.setMonth(testDate.getMonth()-6);
	var startDate = testDate.Format("yyyy-MM-dd");
	var url = "http://oa.com/Pages/Ec/EcLeave/Default.aspx?action=GridBindList&command=Query&leaveType=06&startDate=" + startDate + "&endDate=" + endDate + "&keywords=&time=Fri%20Aug%2018%202017%2014:10:38%20GMT+0800%20(CST)&pqGrid_PageIndex=1&pqGrid_PageSize=1000&pqGrid_OrderField=&pqGrid_OrderType=desc&pqGrid_Sort=LeaveHours";
	
	var req = new XMLHttpRequest();
    	req.open("GET", url, false);
    	req.send(null);
    	var data = JSON.parse(req.responseText).data;
    	
    	var totleLeavetime = 0.0;
    	if(data.length > 0)
    	{
    		for(var i=0;i < data.length; i++ )
    		{
			    	totleLeavetime += parseFloat(data[i]);	
    		}
    	}
    	
    	url = "http://oa.com/Pages/Ec/EcOverTime/Default.aspx?action=GridBindList&command=Query&keywords=&compensation=0&time=Fri%20Aug%2018%202017%2014:35:21%20GMT+0800%20(CST)&pqGrid_PageIndex=1&pqGrid_PageSize=200&pqGrid_OrderField=BeginDate&pqGrid_OrderType=desc&pqGrid_Sort=BeginDate%2COverTimeHours";
    	
    	req = new XMLHttpRequest();
    	req.open("GET", url, false);
    	req.send(null);
    	data = JSON.parse(req.responseText).data;
    	
    	var totleOvertime = 0.0;
    	if(data.length > 0)
    	{
    		for(var i=0;i < data.length; i++ )
    		{
				if(new Date(data[i][0].replace(/-/g,"/")) >= testDate)
				{
				    	totleOvertime += parseFloat(data[i][1]);	
				}
    		}
    	}
    	document.getElementById("totleLeavetime").innerHTML=totleLeavetime;
    	document.getElementById("totleOvertime").innerHTML=totleOvertime;


}




function tr(str)
{
	return "<tr>"+ str +"</tr>"
}
function td(str,isRed,isGreen)
{
	if(isGreen)
		return "<td bgcolor='#ccff99'>"+ str +"</td>"

	if(isRed)
	{
		return "<td bgcolor='#ff6666'>"+ str +"</td>"
	}
	else
	{
		return "<td >"+ str +"</td>"
	}
}


function toFullDay(str)
{
	str = ReplaceAll(str,"/","-");
	var date = str.split("-");
	var month = toDoubleString(date[1])
	var day = toDoubleString(date[2])
	return date[0] + "-" + month + "-" + day

}
function ReplaceAll(str, sptr, sptr1)
{
    while (str.indexOf(sptr) >= 0){
       str = str.replace(sptr, sptr1);
    }
    return str;
}

function toDoubleString(str)
{
	if((str+"").length==1)
		return "0"+str;
	return str
}

/*
判断是否迟到
*/
function isLate(time)
{
	if(""==time)
		return false;
	var splitTime = time.split(":")
	var hours = splitTime[0]
	var minutes = splitTime[1]
	if(parseInt(hours) >= 10 || (parseInt(hours) >= 9 && parseInt(minutes) > 5))
		return true

	return false;
}

/*
判断是否加班
*/
function isOvertime(time)
{
	if("" == time)
		return false;
	var splitTime = time.split(":")
	var hours = splitTime[0]
	var minutes = splitTime[1]
	if(parseInt(hours) >= 20)
		return true
	return false;
}

/*
自动填写补休表
*/
function fixLate()
{
	for(var i=0; i < lateList.length ; i++)
	{
		add(lateList[i].date,lateList[i].time)
	}
	document.getElementById("submitButton").style.visibility="hidden";
	location.reload();
}


/*
添加一个补休
*/
function add(fullDate,morningTime)
{
	var req = new XMLHttpRequest();
	req.open("GET", "http://oa.com/Pages/Ec/EcLeave/EditForm.aspx?workflowId=59621a4c-981d-4aa6-9e24-4cd414ff0b74", false);
	req.send(null);
	
	var objE = document.getElementById("noooooooooooooo");
	objE.innerHTML = req.responseText;
	
	var __VIEWSTATE = document.getElementById("__VIEWSTATE").value;
	var __EVENTVALIDATION = document.getElementById("__EVENTVALIDATION").value;
	var BillNo = document.getElementById("BillNo").value;
	objE.innerHTML = __VIEWSTATE.value + "<br/>" + __EVENTVALIDATION.value + "<br/>" + BillNo.value 
	
	var endTime = mathLeaveTime(morningTime);
	
	submitFrom(__VIEWSTATE,__EVENTVALIDATION,BillNo,fullDate+" 09:00:00",fullDate+" "+endTime);
	
	
}

/*
计算补休的结束时间
*/
function mathLeaveTime(time)
{
	return time;
	/*
	var time = time.split(":")
	var hour = parseInt(time[0]);
	var minute = parseInt(time[1]);
	if(minute < 30)
	{
		return toDoubleString(hour)+":30:00";	
	}
	else
	{
		return toDoubleString(hour+1)+":00:00";	
	}
	*/
}


/*
multipart/form-data,参数格式化
*/
function getMultipartFormDataParam(key,value,boundary)
{
	var addend = "\r\n";
	var str = boundary+addend;
	str += "Content-Disposition: form-data; name=\""+key+"\"" + addend + addend;
	str += value+addend;
	return str;
}

/*
提交一条补休请求接口
*/
function submitFrom(__VIEWSTATE,__EVENTVALIDATION,BillNo,BeginDate,EndDate)
{
	var req = new XMLHttpRequest();
	req.open("POST", "http://oa.com/Pages/Ec/EcLeave/EditForm.aspx?workflowId=59621a4c-981d-4aa6-9e24-4cd414ff0b74", false);
	req.setRequestHeader("Content-Type", "multipart/form-data; boundary=----WebKitFormBoundarybPriE3H2w27734Qh");
	var boundary = "------WebKitFormBoundarybPriE3H2w27734Qh";
	var data = "";
	data += getMultipartFormDataParam("__EVENTTARGET","Accept",boundary);
	data += getMultipartFormDataParam("__EVENTARGUMENT","",boundary);
	data += getMultipartFormDataParam("__VIEWSTATE",__VIEWSTATE,boundary);
	data += getMultipartFormDataParam("__EVENTVALIDATION",__EVENTVALIDATION,boundary);
	data += getMultipartFormDataParam("hidOriginalName","",boundary);
	data += getMultipartFormDataParam("hidOldFileName","",boundary);
	data += getMultipartFormDataParam("hidNewFileName","",boundary);
	data += getMultipartFormDataParam("BillNo",BillNo,boundary);
	data += getMultipartFormDataParam("LeaveType","06",boundary);
	data += getMultipartFormDataParam("DateType","2",boundary);
	data += getMultipartFormDataParam("BeginDate",BeginDate,boundary);
	data += getMultipartFormDataParam("EndDate",EndDate,boundary);
	data += getMultipartFormDataParam("LeaveHours",CalcLeaveHours(BeginDate,EndDate),boundary);
	data += getMultipartFormDataParam("Specific","补休",boundary);
	data += getMultipartFormDataParam("Proxy","",boundary);
	data += getMultipartFormDataParam("ProxyPhone","",boundary);
	data += getMultipartFormDataParam("ProxyDuty","",boundary);
	data += getMultipartFormDataParam("ProxyMatter","",boundary);
	data += getMultipartFormDataParam("Contact","",boundary); 
	data += getMultipartFormDataParam("ContactPhone","",boundary);
	data += getMultipartFormDataParam("IsAddAttach","on",boundary);
	var addend = "\r\n";
	data += boundary + addend;
	data += "Content-Disposition: form-data; name=\"fuFileLoad\"; filename=\"\"" + addend;
	data += "Content-Type: application/octet-stream" + addend+addend+addend;
	data += boundary+"--"+ addend;
	req.send(data);	
}


/*
计算一天的补休时长
*/
function CalcLeaveHours(BeginDate,EndDate) 
{
    var leaveHours = 0;
    var dateb = BeginDate;
    var datee = EndDate;
    var dttype = '2';

    if (dateb != '' && datee != '') 
    {
        var days;
        var wxbdt = new Date(dateb.replace(/-/g, "/").substring(0, 10) + " 12:00:00");     //午休开始时间
        var wxedt = new Date(dateb.replace(/-/g, "/").substring(0, 10) + " 13:30:00");     //午休结束时间

        var db = new Date(dateb.replace(/-/g, "/"));
        var de = new Date(datee.replace(/-/g, "/"));
        if (dttype == '1') {
            days = (de - db) / 1000 / 60 / 60 / 24;
            leaveHours = (parseInt(days) + 1) * 8;
        } else {
            days = de.getDate() - db.getDate();
            leaveHours = (de - db) / 1000 / 60 / 60;
            if (days > 1 || (days == 1 && parseInt(leaveHours) > 24)) {
                showTipsMsg('不能隔天按小时请假。', 3000, 3);
                $("#EndDate").val('');
                leaveHours = 0;
            } else {
                if (db <= de) {
                    if (db <= wxbdt) {
                        if (de >= wxbdt && de < wxedt)
                            leaveHours = (wxbdt - db) / 1000 / 60 / 60;
                        else {
                            if (de >= wxedt)
                                leaveHours = (de - db) / 1000 / 60 / 60 - 1.5;
                            else
                                leaveHours = (de - db) / 1000 / 60 / 60;
                        }
                    } else if (db >= wxbdt) {
                        if (db <= wxedt) {
                            if (de >= wxedt)
                                leaveHours = (de - wxedt) / 1000 / 60 / 60;
                            else
                                leaveHours = 0;
                        } else {
                            leaveHours = (de - db) / 1000 / 60 / 60;
                        }
                    }
                }
            }
        }
    }
  return leaveHours.toFixed(1);
  
}

