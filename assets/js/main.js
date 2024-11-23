document.getElementById('submitButton').addEventListener('click', async function () {
    const fileInput = document.getElementById('imageUpload');
    const resultDisplay = document.getElementById('resultDisplay');

    // Ensure a file is selected
    if (fileInput.files.length === 0) {
        resultDisplay.innerText = "Please select an image.";
        resultDisplay.style.color = "red";
        return;
    }

    // Prepare the file for upload
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);

    // Send the file to the Tornado server
    try {
        resultDisplay.innerText = "Processing...";
        resultDisplay.style.color = "blue"; // Reset to default text color

        const response = await fetch('http://192.168.2.139:8888/predict', { // Tornado server URL
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json(); // Parse JSON response
        resultDisplay.innerText = `Prediction: ${data.phenomonia_prediction}`;
        resultDisplay.style.color = data.phenomonia_prediction === "PNEUMONIA" ? "red" : "green"; // Color by result
    } catch (error) {
        console.error('Error:', error);
        resultDisplay.innerText = 'Error during prediction. Check console for details.';
        resultDisplay.style.color = "red"; // Show error in red
    }
});