document.addEventListener("DOMContentLoaded", function() {
    const sosButton = document.getElementById("sosButton");
    const callButton = document.getElementById("callButton");
    const smsButton = document.getElementById("smsButton");
    const fakeCallButton = document.getElementById("fakeCallButton");
    const locationButton = document.getElementById("locationButton");
    const alarmButton = document.getElementById("alarmButton");
    const flashlightButton = document.getElementById("flashlightButton");
    const saveContactButton = document.getElementById("saveContact");
    const alarmSoundInput = document.getElementById("alarmSound");
    const fakeCallSoundInput = document.getElementById("fakeCallSound");

    let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
    let alarmAudio = new Audio(localStorage.getItem("alarmSound"));
    let fakeCallAudio = new Audio(localStorage.getItem("fakeCallSound"));
    
    // Request Permissions
    navigator.permissions.query({ name: "geolocation" });
    navigator.permissions.query({ name: "camera" });
    navigator.permissions.query({ name: "microphone" });
    navigator.permissions.query({ name: "notifications" });

    // Save Emergency Contact
    saveContactButton.addEventListener("click", function() {
        const name = document.getElementById("contactName").value;
        const number = document.getElementById("contactNumber").value;
        const priority = document.getElementById("priority").value;
        const locationAccess = document.getElementById("locationAccess").checked;
        
        if (name && number) {
            contacts.push({ name, number, priority, locationAccess });
            contacts.sort((a, b) => a.priority - b.priority);
            localStorage.setItem("contacts", JSON.stringify(contacts));
            alert("Contact saved successfully!");
        } else {
            alert("Please enter a valid name and number.");
        }
    });

    // Emergency Call (Priority-Based)
    callButton.addEventListener("click", function() {
        if (contacts.length > 0) {
            callPriorityContact(0);
        } else {
            alert("No emergency contacts saved.");
        }
    });

    function callPriorityContact(index) {
        if (index < contacts.length) {
            let contact = contacts[index];
            window.location.href = `tel:${contact.number}`;
            setTimeout(() => callPriorityContact(index + 1), 10000);
        }
    }

    // Send Emergency SMS
    smsButton.addEventListener("click", function() {
        if (contacts.length > 0) {
            contacts.forEach(contact => {
                let smsURL = `sms:${contact.number}?body=Emergency! Please help.`;
                window.open(smsURL, '_blank');
            });
        } else {
            alert("No emergency contacts saved.");
        }
    });

    // Share Live Location via WhatsApp
    locationButton.addEventListener("click", function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                let locationURL = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
                contacts.forEach(contact => {
                    if (contact.locationAccess) {
                        let whatsappURL = `https://wa.me/${contact.number}?text=Emergency! My location: ${locationURL}`;
                        window.open(whatsappURL, '_blank');
                    }
                });
            }, () => {
                alert("Location access denied.");
            });
        } else {
            alert("Geolocation not supported.");
        }
    });

    // Fake Call
    fakeCallButton.addEventListener("click", function() {
        if (fakeCallAudio.src) {
            fakeCallAudio.play();
            alert("Fake call started!");
        } else {
            alert("Please select a fake call sound.");
        }
    });

    // Loud Alarm
    alarmButton.addEventListener("click", function() {
        if (alarmAudio.src) {
            alarmAudio.play();
            alert("Loud alarm activated!");
        } else {
            alert("Please select an alarm sound.");
        }
    });

    // Load Custom Alarm Sound
    alarmSoundInput.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            alarmAudio.src = url;
            localStorage.setItem("alarmSound", url);
        }
    });

    // Load Custom Fake Call Sound
    fakeCallSoundInput.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            fakeCallAudio.src = url;
            localStorage.setItem("fakeCallSound", url);
        }
    });

    // Toggle Flashlight
    flashlightButton.addEventListener("click", async function() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            if (capabilities.torch) {
                await track.applyConstraints({ advanced: [{ torch: true }] });
                setTimeout(() => track.stop(), 5000);
            }
        } catch (error) {
            alert("Flashlight not supported on this device.");
        }
    });
});
