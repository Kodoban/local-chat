'use strict'

const conversationBox = document.getElementById("conversationBox");
const messages = document.getElementById("messages");
const anchor = document.getElementById("anchor");
var socketio = io();

socketio.on('message', function(data) {
    createMessage(data.name, data.content);
});

function createMessage(name, msg) {

    /* 
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleTimeString

        For Date TO server: 
        1. Get current local time (message generated time)
            sendTime = new Date() -> Date Object: Thu Jan 04 2024 13:34:36 GMT+0200 (Eastern European Standard Time)
        2. Get local time from var
            sendTime.toLocaleString() (Check if it's possible to convert to 24-hour clock?)
            or e.g.
            sendTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); -> 13:34
        3. Convert to ISO for DB and send to server
            sendTime.toISOString() -> "2024-01-04T11:34:36.463Z"
        
        For Date FROM server to local time: See 2 and 3
        
    */


    let messageItem = Object.assign(document.createElement("div"), {
        className: "message-item"
    });

    let messageContainer = Object.assign(document.createElement("div"), {
        className: "message-container"
    });

    let messageSendTime = Object.assign(document.createElement("span"), {
        className: "metadata-send-time",
        innerHTML: `${new Date().toLocaleString()}` //TODO: update with above
    });

    let messageContent = document.createElement("span");
    if (name === "") {
        messageItem.classList.toggle("own-message");
        messageSendTime.classList.toggle("own-message-text-align");
        messageContent.classList.toggle("own-message-text-align");
        messageContent.innerHTML = `${msg}`;
    } 
    else {
        messageContent.innerHTML = `<strong>${name}: </strong>${msg}`;
    }
    

    messageContainer.appendChild(messageSendTime);
    messageContainer.appendChild(messageContent);
    messageItem.appendChild(messageContainer);
    messages.insertBefore(messageItem, anchor);

    if (name != "" && !userViewingNewestMessage()) {
        addNewMessageRibbon();
        toggleNewMessageRibbon();
    }
}

function sendMessage() {
    let message = document.getElementById("message");
    if (message.value == "") return;
    createMessage("", message.value);
    scrollToNewestMessage();
    socketio.emit('message', {data: message.value});
    message.value="";
}

function scrollToNewestMessage() {
    messages.scrollTo({top: messages.scrollHeight, bottom: 0, behavior: "smooth"});
}

function userViewingNewestMessage() {
    //https://stackoverflow.com/a/876134
    return messages.scrollTop === (messages.scrollHeight - messages.offsetHeight);
}

function addNewMessageRibbon() {

    let newMessageRibbon = Object.assign(document.createElement("div"), {
        className: "alert alert-primary new-messages-alert",
        id: "newMessageRibbon",
        role: "alert"
    });

    let newMessageRibbonText = Object.assign(document.createElement("p"), {
        className: "new-message-alert-text",
        innerHTML: "There are new messages"
    });

    let newMessageRibbonButton = Object.assign(document.createElement("button"), {
        type: "button",
        id: "closeNewMessageButton",
        className: "btn btn-primary",
        innerHTML: "Go to latest message",
        onclick: goToLatestMessage
    });

    newMessageRibbon.appendChild(newMessageRibbonText);
    newMessageRibbon.appendChild(newMessageRibbonButton);
    // document.insertBefore(newMessageRibbon, messages);
    conversationBox.insertBefore(newMessageRibbon, messages);
}

function removeNewMessageRibbon() {
    document.getElementById("newMessageRibbon").remove();
}

function toggleNewMessageRibbon() {
    document.getElementById("newMessageRibbon").classList.toggle("active");
}

function goToLatestMessage() {
    scrollToNewestMessage();
    toggleNewMessageRibbon();
    removeNewMessageRibbon();
}