function createDateFromMMDDYY(dateString) {
  const parts = dateString.split('/');
  var year = parseInt(parts[2]);
  year += 2000;
  const month = parseInt(parts[0]) - 1;
  const day = parseInt(parts[1]);

  return new Date(year, month, day);
}

function dateToMMDDYY(date) {
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();
  const year = date.getFullYear().toString().slice(-2);

  return month + '/' + day + '/' + year;
}



function processTimezone(timezone, timestampMessage){
  const ind = timestampMessage.lastIndexOf(":");
  const hours = parseInt(timestampMessage.substring(ind - 2, ind).trim());
  const minutes = parseInt(timestampMessage.substring(ind + 1, ind + 3));
  const ampm = timestampMessage.substring(ind + 4, ind + 6);

  var currTime = hours + minutes / 60;
  if (ampm === "PM"){
    currTime += 12;
  }else if (ampm === "AM" && hours == 12){
    currTime -= 12;
  }


  var theirTime = currTime + timezone;
  var finalMessage = "";
  if (theirTime < 0 || theirTime >= 24){
    if (timestampMessage.includes(",")){
      const today = createDateFromMMDDYY(timestampMessage.substring(0, timestampMessage.indexOf(",")));
      if (theirTime < 0){
        const yesterday = new Date();
        if (theirTime < -24){
          yesterday.setDate(today.getDate() - 2); // confusing naming, but it's for the two people from Kiribati
        }else{
          yesterday.setDate(today.getDate() - 1);
        }
        finalMessage = dateToMMDDYY(yesterday) + ", ";
      }else{
        const tomorrow = new Date();
        if (theirTime >= 48){
          tomorrow.setDate(today.getDate() + 2);
        }else{
          tomorrow.setDate(today.getDate() + 1);
        }
        finalMessage = dateToMMDDYY(tomorrow) + ", ";
      }
    }else if (timestampMessage.includes("Yesterday at")){
      if (theirTime < 0){
        if (theirTime < -24){
          finalMessage = "Two days before yesterday, ";
        }else{
          finalMessage = "Day before yesterday, ";
        }
      }else{
        if (theirTime >= 48){
          finalMessage = "Tomorrow, ";
        } //today is just default
      }
    }else{
      if (theirTime < 0){
        if (theirTime < -24){
          finalMessage = "Day before yesterday, ";
        }else{
          finalMessage = "Yesterday, ";
        }
      }else{
        if (theirTime >= 48){
          finalMessage = "Day after tomorrow, ";
        }else{
          finalMessage = "Tomorrow, ";
        }
      }
    }
  }

  //special cases
  // if (timestampMessage.includes("Yesterday at") && 0 <= theirTime && theirTime < 24){
  //   finalMessage = "Yesterday, ";
  // }else if (timestampMessage.includes(",")){
  //   finalMessage = timestampMessage.substring(0, timestampMessage.indexOf(",")) + ", ";
  // }

  theirTime = ((theirTime % 24) + 24) % 24;
  var theirHours = Math.floor(theirTime);
  const theirMinutes = (Math.round((theirTime - theirHours) * 60)).toString().padStart(2, "0");
  var theirAmpm = "AM"
  if (theirHours >= 12){
    theirAmpm = "PM";
    theirHours -= 12;
  }else if (theirHours == 0){
    theirHours = 12;
  }


  finalMessage += theirHours + ":" + theirMinutes + " " + theirAmpm;
  return finalMessage;
}



function injectTimezoneLabels() {
  const headers = document.querySelectorAll('h3[class*="header_c19a55"]');

  headers.forEach(function(header) {

    const usernameSpan = header.querySelector('span[class*="username_c19a55"]');
    const username = usernameSpan.textContent;
  
    const timestampSpan = header.querySelector('span[class*="timestamp_c19a55"]');
    const timestamp = timestampSpan.textContent.substring(3);

    if (header.dataset.timezoneInjected === "true") return;
    header.dataset.timezoneInjected = "true"; //mark early before async "get" call
      
    chrome.storage.local.get("timezoneMap", (data) => {
      const userTimezoneMap = data.timezoneMap;
      if (userTimezoneMap != null){
        const timezone = userTimezoneMap[username];
        if (timezone != null) {
          const label = document.createElement("span");
          label.textContent = `(${processTimezone(timezone, timestamp)})`;
          
          if (!timestamp.includes("Yesterday at") && !timestamp.includes(",")){
            label.style.marginRight = "6px";
            timestampSpan.insertBefore(label, timestampSpan.children[0]);
          }else{
            label.style.marginLeft = "6px";
            timestampSpan.appendChild(label);
          }
        }
      }
      
    });


  });
}

function observeTimezoneLabels() {
  const observer = new MutationObserver(() => {
    injectTimezoneLabels();
  });

  observer.observe(document.body, { 
    childList: true, subtree: true 
  });
}

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     if (request.greeting === "insertLabels"){
//       injectTimezoneLabels();
//     }
//   }
// );


observeTimezoneLabels();
