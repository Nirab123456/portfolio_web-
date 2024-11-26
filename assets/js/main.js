document.getElementById('submitButton').addEventListener('click', async function () {
    const fileInput = document.getElementById('imageUpload');
    const resultDisplay = document.getElementById('resultDisplay');

    // Ensure a file is selected
    if (fileInput.files.length === 0) {
        resultDisplay.innerText = "Please select an image.";
        resultDisplay.style.color = "red"; // Error message in red
        return;
    }

    // Prepare the file for upload
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);

    // Send the file to the Tornado server
    try {
        resultDisplay.innerText = "Processing...";
        resultDisplay.style.color = "blue"; // Reset to default text color while processing

        const response = await fetch('http://localhost:8888/predict', { // Tornado server URL
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json(); // Parse JSON response
        const prediction = data.phenomonia_prediction;

        // Update the display based on the prediction
        resultDisplay.innerText = `Prediction: ${prediction}`;
        if (prediction === "PNEUMONIA") {
            resultDisplay.style.color = "red"; // Highlight PNEUMONIA in red
        } else if (prediction === "NORMAL") {
            resultDisplay.style.color = "green"; // Highlight NORMAL in green
        } else if (prediction === "UNKNOWN") {
            resultDisplay.style.color = "white"; // Regular black color for UNKNOWN
        }
    } catch (error) {
        console.error('Error:', error);
        resultDisplay.innerText = 'Error during prediction. Check console for details.';
        resultDisplay.style.color = "red"; // Show error in red
    }
});


        // Add event listener for the submit button

        // Helper function to normalize input data
        function normalizeInput(input, min, scale) {
            return (input - min) / scale;
        }

        // Argmax function
        function argmax(array) {
            return array.reduce((maxIndex, value, index, arr) => {
                return value > arr[maxIndex] ? index : maxIndex;
            }, 0);
        }

// Run model with inputs
async function runModel(inputs) {
    try {
        // Load ONNX model
        const session = new onnx.InferenceSession();
        await session.loadModel('./final_model.onnx'); // Make sure the model file is in the correct path

        // Prepare the input tensor
        const inputTensor = new onnx.Tensor(new Float32Array(inputs), 'float32', [1, 11]);

        // Run inference
        const outputMap = await session.run([inputTensor]);
        const outputData = outputMap.values().next().value.data;



        // Perform `argmax` to get the predicted class
        const predictedClass = argmax(outputData);

        console.log("Prediction Output:", Array.from(outputData).join(", "));
        console.log("Predicted Class:", predictedClass);

    } catch (error) {
        // Handle errors
        console.error("Error during model prediction:", error);
    }
}

// Submit form and prepare normalized data
async function CVDsubmitForm() {
    // Min-Max scaler parameters (from your Python code)
    const minValues = [10798.0, 1.0, 55.0, 11.0, 90.0, 60.0, 1.0, 1.0, 0.0, 0.0, 0.0];
    const scaleValues = [12915.0, 1.0, 195.0, 189.0, 90.0, 60.0, 2.0, 2.0, 1.0, 1.0, 1.0];

    // Gather input values
    const age = parseFloat(document.getElementById('age').value); // Ensure the input is parsed as a float

    console.log("Age:", age);
    let genderIndex;
    if (document.getElementById('btnradio1').checked) {
        genderIndex = 1; // Male
    } else if (document.getElementById('btnradio1-1').checked) {
        genderIndex = 2; // Female
    } else {
        alert("Please select a gender.");
        return;
    }
    const height = parseFloat(document.getElementById('hight').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const systolicBP = parseFloat(document.getElementById('systolic').value);
    const diastolicBP = parseFloat(document.getElementById('diastolic').value);
    const cholesterol = parseFloat(document.getElementById('cholesterol').value);
    const glucose = parseFloat(document.getElementById('glucose').value);
    const smoke = parseFloat(document.getElementById('smoke').value);
    const alcohol = parseFloat(document.getElementById('alchole').value);
    const activity = parseFloat(document.getElementById('activity').value);

    // Combine inputs into an array
    const rawInputs = [
        age,
        genderIndex,
        height,
        weight,
        systolicBP,
        diastolicBP,
        cholesterol,
        glucose,
        smoke,
        alcohol,
        activity,
    ];

    // Normalize inputs using Min-Max scaling
    const normalizedInputs = rawInputs.map((value, index) => 
        normalizeInput(value, minValues[index], scaleValues[index])
    );

    console.log("Normalized Inputs:", normalizedInputs);


    // Run the ONNX model with the normalized inputs
    await runModel(normalizedInputs);
}