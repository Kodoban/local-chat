'use strict'

findUsers();

function findUsers() {

    var queryUsersBtn = document.getElementById("queryUsersBtn");
    queryUsersBtn.addEventListener('click', function () {

            // TODO: If username field is empty, raise error message instead of printing (do not change pre-existing results in list)
            let usernameInput = document.getElementById("queriedUsername");
            let foundUsers = document.getElementById('queriedUsers');
            foundUsers.innerHTML = "";

            if ($.trim(usernameInput.value) === "") {
                let header = document.createElement('h4');
                header.style.textAlign = 'center';
                header.innerHTML = "Please enter a valid username";
                foundUsers.appendChild(header);

                usernameInput.value = "";
                    
                return;
            }
            else {
                $.ajax({
                    type: "POST",
                    url: "/search-user",
                    data: {"username" : usernameInput.value},
                    
                    success: function(response) {
                        // Check if backend returned an empty list
                        if (!$.trim(response)) {
                            let header = document.createElement('h4');
                            header.style.textAlign = 'center';
                            header.innerHTML = "No users found";
                            foundUsers.appendChild(header);
                           
                            return;
                        }
                        else {
                            response.forEach(user => {
                                    
                                // Create elements for list item

                                // Add hyperlink to user profile
                                let userProfileHyperlink = Object.assign(document.createElement('a'), {
                                    href: `${user.profile_page}`,
                                    innerHTML: `${user.name}`
                                });

                                let userProfileArea = document.createElement('div');
                                userProfileArea.appendChild(userProfileHyperlink);
                                userProfileArea.innerHTML += ` (ID: ${user.id})`;

                                // Add chat redirect button
                                let chatRedirectButton;

                                // Check if a (2-person) chat exists containing with the returned user and the logged-in user
                                // The backend returns "None" if no chats exist, the chat URL if one exists, and raises a backend error if multiple exist
                                if (user.existing_chat === "None") {
                                    chatRedirectButton = Object.assign(document.createElement('button'), {
                                        className: "btn btn-primary",
                                        innerText: "Start chat"
                                    });

                                    chatRedirectButton.addEventListener('click', function() {
                                        raiseConfirmChatPopup(user);
                                    });
                                }
                                else {
                                    chatRedirectButton = Object.assign(document.createElement('button'), {
                                        className: "btn btn-primary",
                                        innerText: "Go to chat",
                                    });

                                    chatRedirectButton.addEventListener('click', function() {
                                        location.href = `${user.existing_chat}`
                                    });
                                }

                                // Create list item and append the elements above
                                let listItem = Object.assign(document.createElement('li'), {
                                    className: "list-group-item d-flex align-items-center justify-content-between"
                                });

                                listItem.appendChild(userProfileArea);
                                listItem.appendChild(chatRedirectButton);

                                foundUsers.appendChild(listItem);
                            })
                        }
                    },
                    error: function(error) {
                        // Handle any errors that occur during the request
                        console.log(error);
                    }
                });
            }
        }, { once: true });
}

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