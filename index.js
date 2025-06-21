import { calculate, Time } from "./calculate.js";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("sedimentForm");
  const bedDepthInput = document.getElementById("bedDepth");
  const porosityInput = document.getElementById("porosity");
  const densityInput = document.getElementById("density");
  const mediaInput = document.getElementById("media");
  const grainSizeMinValue = document.getElementById("grainSizeMinValue");
  const grainSizeMaxValue = document.getElementById("grainSizeMaxValue");

  // Modal elements
  const grainShapeModal = document.getElementById("grainShapeModal");
  const resultsModal = document.getElementById("resultsModal");
  const sphereBtn = document.getElementById("sphereBtn");
  const nonSphereBtn = document.getElementById("nonSphereBtn");

  // Result elements
  const equationText = document.getElementById("equationText");
  const resultFlowRate = document.getElementById("resultFlowRate");
  const resultInfluentTurbidity = document.getElementById(
    "resultInfluentTurbidity"
  );
  const resultCalculatedTime = document.getElementById("resultCalculatedTime");
  const resultGraph = document.getElementById("resultGraph");

  // Error message elements
  const bedDepthError = document.getElementById("bedDepthError");
  const porosityError = document.getElementById("porosityError");
  const densityError = document.getElementById("densityError");
  const mediaError = document.getElementById("mediaError");
  const grainSizeError = document.getElementById("grainSizeError");

  // Variables to store form data and calculation state
  let currentFormData = null;

  // Initialize dual-handle slider
  const grainSizeSlider = document.getElementById("grainSizeSlider");
  let grainSizeValues = [0.2, 1.0]; // Default values

  noUiSlider.create(grainSizeSlider, {
    start: [0.2, 1.0],
    connect: true,
    range: {
      min: 0.2,
      max: 1.0,
    },
    step: 0.2,
    format: {
      to: function (value) {
        return parseFloat(value.toFixed(1));
      },
      from: function (value) {
        return parseFloat(value);
      },
    },
  });

  // Update values when slider changes
  grainSizeSlider.noUiSlider.on("update", function (values, handle) {
    grainSizeValues = values.map((v) => parseFloat(v));
    grainSizeMinValue.textContent = grainSizeValues[0];
    grainSizeMaxValue.textContent = grainSizeValues[1];
    validateGrainSizeRange();
  });

  // Validation functions
  function validateBedDepth(value) {
    if (!value || value === "") {
      return "Bed depth is required";
    }
    if (parseFloat(value) <= 0) {
      return "Bed depth must be positive";
    }

    // Check if porosity is available for additional validation
    const porosityValue = porosityInput.value;
    if (porosityValue && parseFloat(porosityValue) > 0) {
      const porosity = parseFloat(porosityValue);
      const bedDepth = parseFloat(value);
      const maxAllowedDepth = 16 / (1 + porosity);

      if (bedDepth > maxAllowedDepth) {
        return `Warning : Water Overflow risk`;
      }
    }

    return null;
  }

  function validatePorosity(value) {
    if (!value || value === "") {
      return "Porosity is required";
    }
    if (parseFloat(value) <= 0) {
      return "Porosity must be positive";
    }
    return null;
  }

  function validateDensity(value) {
    if (!value || value === "") {
      return "Density is required";
    }
    if (parseFloat(value) <= 0) {
      return "Density must be positive";
    }
    return null;
  }

  function validateMedia(value) {
    if (!value || value.trim() === "") {
      return "Media is required";
    }
    if (value.trim().length < 2) {
      return "Media must be at least 2 characters long";
    }
    return null;
  }

  function validateGrainSize(minValue, maxValue) {
    if (!minValue || !maxValue) {
      return "Both minimum and maximum grain sizes are required";
    }
    const min = parseFloat(minValue);
    const max = parseFloat(maxValue);

    if (min <= 0 || max <= 0) {
      return "Grain sizes must be positive";
    }
    if (min < 0.2 || max > 1) {
      return "Grain sizes must be between 0.2 and 1 mm";
    }
    if (min >= max) {
      return "Minimum grain size must be less than maximum";
    }
    return null;
  }

  // Show/Hide error messages
  function showError(errorElement, message, targetElement = null) {
    errorElement.textContent = message;
    errorElement.classList.add("show");
    if (targetElement) {
      targetElement.parentElement.parentElement.classList.add("error");
      targetElement.parentElement.parentElement.classList.remove("success");
    } else {
      const formGroup = errorElement.parentElement;
      formGroup.classList.add("error");
      formGroup.classList.remove("success");
    }
  }

  function hideError(errorElement, targetElement = null) {
    errorElement.textContent = "";
    errorElement.classList.remove("show");
    if (targetElement) {
      targetElement.parentElement.parentElement.classList.remove("error");
      targetElement.parentElement.parentElement.classList.add("success");
    } else {
      const formGroup = errorElement.parentElement;
      formGroup.classList.remove("error");
      formGroup.classList.add("success");
    }
  }

  // Real-time validation
  function validateField(input, validator, errorElement) {
    const error = validator(input.value);
    if (error) {
      showError(errorElement, error, input);
      return false;
    } else {
      hideError(errorElement, input);
      return true;
    }
  }

  function validateGrainSizeRange() {
    const error = validateGrainSize(grainSizeValues[0], grainSizeValues[1]);
    if (error) {
      showError(grainSizeError, error);
      return false;
    } else {
      hideError(grainSizeError);
      return true;
    }
  }

  // Modal functions
  function showModal(modal) {
    modal.style.display = "flex";
  }

  function hideModal(modal) {
    modal.style.display = "none";
  }

  // Calculate and display results
  function calculateAndShowResults(isSphere) {
    const calculationResult = calculate(
      currentFormData.bedDepth,
      currentFormData.porosity,
      isSphere
    );

    if (calculationResult) {
      // Calculate the time using the Time function
      const calculatedTime = Time(
        currentFormData.porosity,
        currentFormData.bedDepth
      );

      // Populate Analysis Parameters section
      const paramGrid = document.querySelector(".param-grid");
      paramGrid.innerHTML = `
        <div class="param-item">
          <span class="param-label">Media:</span>
          <span class="param-value">${currentFormData.media}</span>
        </div>
        <div class="param-item">
          <span class="param-label">Porosity:</span>
          <span class="param-value">${currentFormData.porosity}</span>
        </div>
        <div class="param-item">
          <span class="param-label">Density:</span>
          <span class="param-value">${currentFormData.density} kg/l </span>
        </div>
        <div class="param-item">
          <span class="param-label">Bed Depth:</span>
          <span class="param-value">${currentFormData.bedDepth} cm</span>
        </div>
      `;

      // Update equation with real values
      equationText.innerHTML = `Model Equation: η = ${calculationResult.a.toFixed(
        3
      )} - ${calculationResult.b.toFixed(3)} × ${calculationResult.c.toFixed(
        3
      )}<sup>t</sup>`;

      // Update calculated time display
      resultCalculatedTime.textContent = `${calculatedTime.toFixed(2)} h`;

      // Generate and display graph
      generateGraph(calculationResult);

      // Show results modal
      showModal(resultsModal);

      // Log results
      console.log("=== Sediment Analysis Results ===");
      console.log("Input Parameters:");
      console.log("Bed Depth (h):", currentFormData.bedDepth, "cm");
      console.log("Porosity (ρ):", currentFormData.porosity);
      console.log("Density:", currentFormData.density, "g/cm³");
      console.log("Media:", currentFormData.media);
      console.log("Grain Size Range:", currentFormData.grainSize, "mm");
      console.log("Grain Shape:", isSphere ? "Sphere" : "Non-sphere");
      console.log("\nCalculated Coefficients:");
      console.log("a =", calculationResult.a);
      console.log("b =", calculationResult.b);
      console.log("c =", calculationResult.c);
      console.log("Model Equation: y = a - b × c^x");
      console.log("=====================================");
    }
  }

  // Generate graph using HTML5 Canvas
  function generateGraph(coefficients) {
    const canvas = resultGraph;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;

    // Graph settings
    const padding = 60;
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;

    // Calculate the maximum time value using the Time function
    const calculatedTime = Time(
      currentFormData.porosity,
      currentFormData.bedDepth
    );

    // Generate data points for the equation y = a - b * c^x
    const dataPoints = [];
    const xMax = calculatedTime; // Use calculated time instead of hardcoded 10
    const xMin = 0;
    let yMin = 0; // Always start from 0
    let yMax = -Infinity;

    for (let x = xMin; x <= xMax; x += calculatedTime / 100) {
      // Use dynamic step based on time range
      const y = coefficients.a - coefficients.b * Math.pow(coefficients.c, x);
      dataPoints.push({ x, y });
      yMax = Math.max(yMax, y);
    }

    // Add some padding to y-axis top only
    const yPadding = (yMax - yMin) * 0.1;
    yMax += yPadding;

    // Helper functions
    function xToCanvas(x) {
      return padding + ((x - xMin) * graphWidth) / (xMax - xMin);
    }

    function yToCanvas(y) {
      return (
        canvas.height - padding - ((y - yMin) * graphHeight) / (yMax - yMin)
      );
    }

    // Draw background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;

    // Vertical grid lines
    const xStep = calculatedTime / 10; // Dynamic step based on calculated time
    for (let x = xMin; x <= xMax; x += xStep) {
      const canvasX = xToCanvas(x);
      ctx.beginPath();
      ctx.moveTo(canvasX, padding);
      ctx.lineTo(canvasX, canvas.height - padding);
      ctx.stroke();
    }

    // Horizontal grid lines
    const yStep = (yMax - yMin) / 8;
    for (let y = yMin; y <= yMax; y += yStep) {
      const canvasY = yToCanvas(y);
      ctx.beginPath();
      ctx.moveTo(padding, canvasY);
      ctx.lineTo(canvas.width - padding, canvasY);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = "#333333";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";

    // X-axis labels
    const xLabelStep = Math.max(1, Math.ceil(calculatedTime / 10)); // Dynamic label step
    for (let x = xMin; x <= xMax; x += xLabelStep) {
      const canvasX = xToCanvas(x);
      ctx.fillText(x.toFixed(1), canvasX, canvas.height - padding + 20);
    }

    // Y-axis labels
    ctx.textAlign = "right";
    for (let y = yMin; y <= yMax; y += yStep) {
      const canvasY = yToCanvas(y);
      ctx.fillText(y.toFixed(2), padding - 10, canvasY + 5);
    }

    // Draw axis titles
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";

    // X-axis title
    ctx.fillText("Time (hr)", canvas.width / 2, canvas.height - 10);

    // Y-axis title
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Particule Retention Rate", 0, 0);
    ctx.restore();

    // Draw the curve
    ctx.strokeStyle = "#667eea";
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let i = 0; i < dataPoints.length; i++) {
      const point = dataPoints[i];
      const canvasX = xToCanvas(point.x);
      const canvasY = yToCanvas(point.y);

      if (i === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }

    ctx.stroke();

    // Draw data points
    ctx.fillStyle = "#667eea";
    for (let i = 0; i < dataPoints.length; i += 10) {
      // Show every 10th point to avoid clutter
      const point = dataPoints[i];
      const canvasX = xToCanvas(point.x);
      const canvasY = yToCanvas(point.y);

      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw title
    ctx.fillStyle = "#333333";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "Prediction Of Monomedia Filtration Performance",
      canvas.width / 2,
      30
    );

    // Draw equation
    ctx.font = "14px Arial";
    const equation = `y = ${coefficients.a.toFixed(
      3
    )} - ${coefficients.b.toFixed(3)} × ${coefficients.c.toFixed(3)}^x`;
    // ctx.fillText(equation, canvas.width / 2, 50);
  }

  // Event listeners
  bedDepthInput.addEventListener("input", () => {
    validateField(bedDepthInput, validateBedDepth, bedDepthError);
  });

  porosityInput.addEventListener("input", () => {
    validateField(porosityInput, validatePorosity, porosityError);
    // Also revalidate bed depth since its limit depends on porosity
    if (bedDepthInput.value) {
      validateField(bedDepthInput, validateBedDepth, bedDepthError);
    }
  });

  densityInput.addEventListener("input", () => {
    validateField(densityInput, validateDensity, densityError);
  });

  mediaInput.addEventListener("input", () => {
    validateField(mediaInput, validateMedia, mediaError);
  });

  // Grain shape modal event listeners
  sphereBtn.addEventListener("click", () => {
    hideModal(grainShapeModal);
    calculateAndShowResults(true);
  });

  nonSphereBtn.addEventListener("click", () => {
    hideModal(grainShapeModal);
    calculateAndShowResults(false);
  });

  // Close modals when clicking outside
  [grainShapeModal, resultsModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        hideModal(modal);
      }
    });
  });

  // Form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate all fields
    const bedDepthValid = validateField(
      bedDepthInput,
      validateBedDepth,
      bedDepthError
    );
    const porosityValid = validateField(
      porosityInput,
      validatePorosity,
      porosityError
    );
    const densityValid = validateField(
      densityInput,
      validateDensity,
      densityError
    );
    const mediaValid = validateField(mediaInput, validateMedia, mediaError);
    const grainSizeValid = validateGrainSizeRange();

    // If all validations pass
    if (
      bedDepthValid &&
      porosityValid &&
      densityValid &&
      mediaValid &&
      grainSizeValid
    ) {
      currentFormData = {
        bedDepth: parseFloat(bedDepthInput.value),
        porosity: parseFloat(porosityInput.value),
        density: parseFloat(densityInput.value),
        media: mediaInput.value.trim(),
        grainSize: {
          min: grainSizeValues[0],
          max: grainSizeValues[1],
        },
      };

      // Check if porosity <= 0.4 to show grain shape modal
      if (currentFormData.porosity <= 0.4) {
        showModal(grainShapeModal);
      } else {
        // Calculate directly for porosity > 0.4
        calculateAndShowResults(false);
      }
    } else {
      console.log(
        "Form validation failed. Please correct the errors and try again."
      );
    }
  });

  // Remove error classes when user starts typing
  [bedDepthInput, porosityInput, densityInput, mediaInput].forEach((input) => {
    input.addEventListener("focus", () => {
      input.parentElement.parentElement.classList.remove("error");
    });
  });

  // Remove error class when slider is focused
  grainSizeSlider.addEventListener("mousedown", () => {
    const formGroup = grainSizeError.parentElement;
    formGroup.classList.remove("error");
  });
});
