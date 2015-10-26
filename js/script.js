/*
 * Serial_Monitor application.
 * Copyright (C) 2013  Damiano Lollini
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

var connectionId = -1;
var readBuffer = "";
var baudrate = 9600;
var specialchar ="";


/* da stringa a codice ascii in un buffer */
var str2ab=function(str) {
  var buf=new ArrayBuffer(str.length);
  var bufView=new Uint8Array(buf);
  for (var i=0; i<str.length; i++) {
    bufView[i]=str.charCodeAt(i);
  }
  return buf;
};


// da buffer a stringa
var convertStringToArrayBuffer=function(str) {
  return String.fromCharCode.apply(null, new Uint8Array(str));
};




/* SCRITTURA SULLA SERIALE */
function sendData() {
  if (connectionId == -1) 
  {
    console.log("no connection")
    return;
  }
  var str = document.querySelector("#campo_tx").value
  str += specialchar;
  console.log("Send the string: " + str);
  chrome.serial.send(connectionId, str2ab(str), function(){});
};


/* LETTURA DALLA SERIALE */
function onReceiveCallback(readInfo) {
  if (readInfo.connectionId == connectionId && readInfo.data) {
    var readBuffer = convertStringToArrayBuffer(readInfo.data);
    document.querySelector("#campo_rx").value += readBuffer;
    if (document.querySelector("#cb_scroll").checked)
    {
      document.querySelector('#campo_rx').scrollTop = document.querySelector('#campo_rx').scrollHeight;
    }
  }
};



/* STATO CONNESSIONE CON LA PORTA */
function setStatus(status) {
  document.querySelector('#status').innerText = status;
};



/* DISCONNETTI DELLA PORTA */
function closePort() {
  if (connectionId == -1) {
    console.log("Disconnected from the serial port");
    return;
  }
  var onDisconnect = function(connectionInfo) {
    if (connectionInfo) {
      console.log("Disconnected from the serial port");
      connectionId = -1;
    } else {
      console.log("Disconnect failed");
    }
  }
  chrome.serial.disconnect(connectionId, onDisconnect);
}



/* CONNETTI ALLA PORTA */
function openPort() {
  var portPicker = document.querySelector('#port-picker');
  var selectedPort = portPicker.options[portPicker.selectedIndex].value;

  var onConnect = function(openInfo) {
    connectionId = openInfo.connectionId;
    console.log("connectionId: " + connectionId);
    if (connectionId == -1) {
      setStatus('Could not open');
      return;
    } else {
      setStatus("Connected to port " + selectedPort);
    }
    };

  chrome.serial.connect(selectedPort, {bitrate: baudrate}, onConnect);
};




/* ELENCO PORTE DISPONIBILI */
function listPorts() {
  var portPicker = document.querySelector('#port-picker');
  portPicker.add(new Option("Select...","Select..."));

  var onGetDevices = function(ports) {
    for (var i = 0; i < ports.length; i++) {
      console.log(ports[i].path);
      portPicker.add(new Option(ports[i].path,ports[i].path));
    }
  }
  
    chrome.serial.getDevices(onGetDevices);
};


/* ------------------------- EVENTS  ------------------------- */

document.querySelector('#bt_invia').addEventListener('click', function() {
  sendData();
  document.querySelector("#campo_tx").value ="";
});

document.querySelector('#bt_disconnect').addEventListener('click', function() {
  closePort();
  setStatus('Disconnected');
});

document.querySelector('#bt_connect').addEventListener('click', function() {
  openPort();
  setStatus('Connected');
});

document.querySelector('#bt_updatePorts').addEventListener('click', function() {
  closePort();
  setStatus('Update is done');
  var x = document.querySelector('#port-picker');
  while(x.length>0)
  {
    x.remove(0);
  }
  listPorts();
});

document.querySelector('#bt_clear').addEventListener('click', function() {
  document.querySelector("#campo_rx").value ="";
});

document.querySelector('#sl_baudrate').addEventListener('change', function() {
  baudrate = parseInt(this[this.selectedIndex].value);
});

document.querySelector('#sl_special').addEventListener('change', function() {
  var value = this[this.selectedIndex].value;
  if (value == 0)
  {
    specialchar = String.fromCharCode(10) + String.fromCharCode(13);
  }
  else
    specialchar = String.fromCharCode(value);
});


chrome.serial.onReceive.addListener(onReceiveCallback);

/* ------------------------- START  ------------------------- */

listPorts();




