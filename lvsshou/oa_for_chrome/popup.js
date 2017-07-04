var beginYear = 2017;
var beginMonth = 6;
var curDate = new Date();
curDate.setMonth(beginMonth);
/* 将日期设置为0, 这里为什么要这样设置, 我不知道原因, 这是从网上学来的 */
curDate.setDate(0);
/* 返回当月的天数 */
var maxDays = curDate.getDate();

var beginDateStr = beginYear + "-" + toDoubleString(beginMonth) + "-01";
var endDateStr = beginYear + "-" + toDoubleString(beginMonth)+"-" + maxDays;

var cardsUrl="http://oa.com/Pages/Hr/EmployeeAttendance/EmployeeCardData.aspx?action=GridBindList&BeginTime=" + beginDateStr + "&EndTime="+endDateStr+"&time=Mon%20Jul%2003%202017%2012:10:46%20GMT+0800%20(CST)&pqGrid_PageIndex=1&pqGrid_PageSize=50&pqGrid_OrderField=&pqGrid_OrderType=desc&pqGrid_Sort=UserName%2CWorkNo%2CDepartment%2CDDate%2CDTime";
var cardsResposeText;

var overtimeUrl="http://oa.com/Pages/Ec/EcOverTime/Default.aspx?action=GridBindList&command=Query&keywords=&compensation=0&time=Mon%20Jul%2003%202017%2014:18:04%20GMT+0800%20(CST)&pqGrid_PageIndex=1&pqGrid_PageSize=50&pqGrid_OrderField=&pqGrid_OrderType=desc&pqGrid_Sort=OverTimeId%2C%2C%2CNowStep%2CBillNo%2CRealName%2CCode%2CFullName%2CCreateDate%2CBeginDate%2CEndDate%2COverTimeHours%2CCompensationText"
var overtimeResposeText;

var leaveUrl="http://oa.com/Pages/Ec/EcLeave/Default.aspx?action=GridBindList&command=Query&leaveType=&startDate=" + beginDateStr + "&endDate=&keywords=&time=Mon Jul 03 2017 14:29:22 GMT+0800 (CST)&pqGrid_PageIndex=1&pqGrid_PageSize=50&pqGrid_OrderField=&pqGrid_OrderType=desc&pqGrid_Sort=LeaveId,,,NowStep,BillNo,RealName,Code,FullName,ItemName,CreateDate,BeginDate,EndDate,LeaveHours";
var leaveResposeText;


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
	    	
	    	
	    	doWork();
	    	
	});

function doWork()
{
	filterLeave();
	filterOvertime();
	
	var html=document.getElementById("user_data").innerHTML;
	var data = cardsResposeText.data;
	for(var i = 0; i < data.length-1; i +=2)
	{
		var tI = 1;
		if( (i+2) < data.length && data[i][3] == data[i+2][3] )
			tI=2;
	
		var row = "";
		row +=td(data[i][3].substring(5,data[i][3].length));
		
		if(data[i][3] != data[i+tI][3] && parseInt(data[i][4].split(":")[0]) >= 18)
			row +=td("缺卡",true);
		else
			row +=td(data[i][4],isLate(data[i][4]));
		
		if(data[i][3] != data[i+tI][3])
		{
			if(parseInt(data[i][4].split(":")[0]) >= 18)
				row +=td(data[i][4],isLate(data[i][4]));
			else
				row +=td("缺卡",true);
		}
		else
		{
			row +=td(data[i+tI][4],false,isOvertime(data[i+tI][4]));
		}
		
		if(leaveResposeText[ data[i][3] ])
		{
			row +=td(leaveResposeText[ data[i][3] ] [0]);
			row +=td(leaveResposeText[data[i][3]][1],leaveResposeText[data[i][3]][1] !="已完成",leaveResposeText[data[i][3]][1] == "已完成");
			row +=td(leaveResposeText[data[i][3]][2]);
			sumLeaveTime +=  parseFloat(leaveResposeText[data[i][3]][2])
		}
		else
		{
			row +=td("");
			row +=td("");
			row +=td("");
		}
			
		if(overtimeResposeText[ data[i][3] ])
		{
			row +=td(overtimeResposeText[ data[i][3] ][0]);
			row +=td(overtimeResposeText[data[i][3]][1],overtimeResposeText[data[i][3]][1] !="已完成",overtimeResposeText[data[i][3]][1] == "已完成");
			row +=td(overtimeResposeText[data[i][3]][2]);
			
			sumOverTime += parseFloat(overtimeResposeText[data[i][3]][2])
		}
		else
		{
			row +=td("");
			row +=td("");
			row +=td("");
		}
		
		
		
		
		
		html +=tr(row);
		
		
		if(data[i][3] != data[i+1][3])
			i -= 1;
		if( (i+2) < data.length && data[i][3] == data[i+2][3] )
			i += 1;		

	}
	
	html += tr(td("")+td("")+td("")+td("")+td("总时长:")+td(""+sumLeaveTime)+td("")+td("总时长:")+td(""+sumOverTime))
	document.getElementById("user_data").innerHTML=html;
	
}
var sumOverTime = 0.0;
var sumLeaveTime = 0.0;
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
								startTime.split(" ")[1].substring(0,5) + "~" + endTime.split(" ")[1].substring(0,5),
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
								startTime.split(" ")[1].substring(0,5) + " ~ " + endTime.split(" ")[1].substring(0,5),
								data[i][3].split("【")[0].split("(")[0],
								data[i][12]
							      ];
	}
	leaveResposeText = newData;
	
	//document.getElementById("test_div").innerHTML= leaveResposeText["2017-6-29"];
	//document.getElementById("test_div").innerHTML= JSON.stringify(leaveResposeText);
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
		return "<td>"+ str +"</td>"
	}
}


function toFullDay(str)
{
	var date = str.split("-");
	var month = toDoubleString(date[1])
	var day = toDoubleString(date[2])
	return date[0] + "-" + month + "-" + day

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
	var splitTime = time.split(":")
	var hours = splitTime[0]
	var minutes = splitTime[1]
	if(parseInt(hours) >= 10 || (parseInt(hours) >= 9 && parseInt(minutes) > 5))
		return true

	return false;
}

/*
判断是否迟到
*/
function isOvertime(time)
{
	var splitTime = time.split(":")
	var hours = splitTime[0]
	var minutes = splitTime[1]
	if(parseInt(hours) >= 20)
		return true
	return false;
}


