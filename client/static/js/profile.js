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