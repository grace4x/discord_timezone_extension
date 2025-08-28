
document.getElementById("save").onclick = function(){

  const username = document.getElementById("username").value.trim();
  const timezoneString = document.getElementById("timezone").value.trim();

  if (!username) {
    console.log("Username missing!");
    return;
  }
  
  var timezone = parseFloat(timezoneString);

  if (timezoneString === ""){
    timezone = 0;
  }

  if (Number.isNaN(timezone) || Math.abs(timezone) > 26){
    console.log("Invalid timezone!"); //will appear in the popup's console
    return;
  }

  chrome.storage.local.get("timezoneMap", function(result){
    var timezoneMap = result.timezoneMap;
    if (timezoneMap == null){
      timezoneMap = {[username]: timezone};
    }else{
      if (timezone == 0){
        delete timezoneMap[username];
      }else{
        timezoneMap[username] = timezone;
      }
    }
    
    chrome.storage.local.set({"timezoneMap" : timezoneMap});
  });

  // async () => {
  // const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  // chrome.tabs.sendMessage(tab.id, {greeting: "insertLabels"});
  // }

};





document.getElementById("save_your_timezone").onclick = function(){
  const timezoneString = document.getElementById("your_timezone").value.trim();
  var timezone = parseFloat(timezoneString);

  if (Number.isNaN(timezone) || Math.abs(timezone) > 26){
    console.log("Invalid timezone!");
    return;
  }

  chrome.storage.local.get("timezoneMap", function(result){
    var timezoneMap = result.timezoneMap;
    if (timezoneMap == null){
      console.log("You don't have any timezones saved yet.")
      return;
    }

    for (const key in timezoneMap) {
      timezoneMap[key] = parseFloat(timezoneMap[key]) - timezone;
    }
    
    chrome.storage.local.set({"timezoneMap" : timezoneMap});
  });
};