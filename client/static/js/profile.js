'use strict'

function updateProfilePicture(input) {
    
    // TODO: Validate that the file is an image file (e.g. not a pdf disguised as a .png) (preferably here and not on backend)
    
    let uploadedPicture = input.files[0];
    let extension = "." + uploadedPicture.name.split(".").pop();
    let filename = (Math.random() + 1).toString(36).substring(2) + extension;
    let newFile = new File([uploadedPicture], filename, { type: uploadedPicture.type });

    var formData = new FormData();
    formData.append('new_profile_pic', newFile);
    formData.append('extension', extension);

    $.ajax({
        type: "POST",
        url: "/update-profile-picture",
        data: formData,
        processData: false,
        contentType: false,
        
        success: function(response) {

            // Replace the existing profile picture with the one the user added 
            var reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById("profilePic").setAttribute('src', e.target.result);
            }
            reader.readAsDataURL(uploadedPicture);

        },
        error: function(error) {
            console.log(error);
        }
    })

}

function redirectToChat() {

    let otherUserId = new URL(location.href).searchParams.get('id');
    let chatRedirectButton = document.getElementById("chatRedirect");

    if (chatRedirectButton.classList.contains("is-contact")) {
        // Redirect to existing chat
    } 
    else {
        
        let popupDiv = Object.assign(document.createElement('div'), {
            id: 'confirmChat',
            className: 'popup'
        });

        document.body.appendChild(popupDiv);

        $.ajax({
        type: "GET",
        url: "/get-user-info",
        data: {"id" : otherUserId},
        
        success: function(response) {

            let returnedUser = response;
            raiseConfirmChatPopup(returnedUser);
        },
        error: function(error) {
            console.log(error);
        }
    })
    }
}

// From search_user.js

function raiseConfirmChatPopup(user) {

    // Blur elements behind the popup
    let blurrableElements = document.getElementsByClassName('blurrable');
    for (let element of blurrableElements) {
        element.classList.toggle("active");
    }

    // Create popup elements

    // Header
    let popupHeader = Object.assign(document.createElement('h3'), { 
        id: "popupHeader", 
        innerHTML: `Start chatting with <strong>${user.name}</strong>`
    });

    // Description text
    let popupText = Object.assign(document.createElement('p'), {
        id: 'popupText',
        innerHTML: `Sending a message will start a chat with <strong>${user.name}</strong>. Continue?`
    });

    // Create fields for form

    let userIdInput = Object.assign(document.createElement('input'), {
        name: "user_id",
        value: `${user.id}`,
        hidden: "true"
    });

    let userNameInput = Object.assign(document.createElement('input'), {
        name: "user_name",
        value: `${user.name}`,
        hidden: "true"
    });

    let formSubmitTime = Object.assign(document.createElement('input'), {
        id: "formSubmitTime",
        name: "submit_time",
        hidden: "true"
    });

    let initialMessageInput = Object.assign(document.createElement('textarea'), {
        id: "initialMessage",
        name: "initial_message",
        className: "form-control",
        rows: "5",
        placeholder: "Write a message..."
    });

    let confirmNewChatButton =  Object.assign(document.createElement('button'), {
        id: 'confirmNewChatButton',
        type: "submit",
        className: "btn btn-primary",
        innerHTML: "Send"
    });

    // TODO: Check if the submit event can be added to a function in Object.assign. Otherwise use inline function in Object.assign?
    confirmNewChatButton.addEventListener('click', function(event) {

        event.preventDefault();

        let message = document.getElementById("initialMessage");
        if (!($.trim(message.value) === "")) {
            document.getElementById("formSubmitTime").value = (new Date()).toISOString();
            event.target.form.submit();
        }
        else {
            message.value = "";
            console.log("Please enter a message");
        }
    });

    // Button to cancel new chat
    let cancelNewChatButton = Object.assign(document.createElement('button'), {
        id: 'cancelNewChatButton',
        type: 'button',
        className: "btn btn-danger",
        innerHTML: "Cancel"
    });

    // TODO: Move to function and reference in Object.assign
    cancelNewChatButton.addEventListener('click', function () {

        // Remove all contents from div containing the popup
        let confirmChatPopup = document.getElementById("confirmChat");
        confirmChatPopup.innerHTML = "";

        let blurrableElements = document.getElementsByClassName('blurrable');

        for (let element of blurrableElements) {
            element.classList.remove("active");
        }

        let popup = document.getElementById("confirmChat");
        popup.classList.remove("active");

    } , { once : true });

    // Create form to pass to backend if user pressed the "start chat" button...
    let form = Object.assign(document.createElement('form'), {
        method: "POST",
        action: "/create-chat"
    });

    form.appendChild(userIdInput);
    form.appendChild(userNameInput);
    form.appendChild(formSubmitTime)
    form.appendChild(initialMessageInput);
    form.appendChild(confirmNewChatButton);
    form.appendChild(cancelNewChatButton);

    let confirmChatPopup = document.getElementById("confirmChat");
    confirmChatPopup.appendChild(popupHeader);
    confirmChatPopup.appendChild(popupText);
    confirmChatPopup.appendChild(form);
    confirmChatPopup.classList.toggle("active");
}

function checkMessageNotEmpty() {
    document.getElementById("confirmNewChatButton").addEventListener('click', function(event) {

        event.preventDefault();

        let message = document.getElementById("initialMessage");
        if (!($.trim(message.value) === "")) {
            document.getElementById("formSubmitTime").value = new Date();
            event.target.form.submit();
        }
        else {
            message.value = "";
            console.log("Please enter a message");
        }
    });
}