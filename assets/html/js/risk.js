function calculateRisk() {
    let totalSum = 0;
    let inputs = document.querySelectorAll('input[type="radio"]:checked');
    let allQuestionsAnswered = document.querySelectorAll('input[type="radio"]:checked').length === 12;
    
    if (!allQuestionsAnswered) {
        alert("Please answer all questions before calculating your risk score.");
        return;
    }
    
    inputs.forEach(input => {
        totalSum += parseInt(input.value);
    });

    // Set up modal content
document.getElementById("scoreDisplay").innerText = totalSum;

let modalHeader = document.getElementById("modalHeader");
let riskTitle = document.getElementById("riskTitle");
let riskIcon = document.getElementById("riskIcon");
let riskProgress = document.getElementById("riskProgress");
let riskDescription = document.getElementById("riskDescription");

const maxScore = 19; // Maximum possible score
const percentage = (totalSum / maxScore) * 100; // Dynamic percentage

riskProgress.style.width = `${percentage}%`; // Set progress bar width dynamically

if (totalSum <= 3) {
    modalHeader.className = "modal-header low-risk";
    riskTitle.innerText = "Low Risk";
    riskIcon.innerHTML = '<i class="fas fa-check-circle" style="color: var(--success-color);"></i>';
    riskProgress.className = "progress-bar bg-success";
    riskDescription.innerText = "Your risk assessment indicates a low risk level. Continue maintaining a healthy lifestyle.";
} else if (totalSum > 3 && totalSum <= 7) {
    modalHeader.className = "modal-header moderate-risk";
    riskTitle.innerText = "Moderate Risk";
    riskIcon.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: var(--warning-color);"></i>';
    riskProgress.className = "progress-bar bg-warning";
    riskDescription.innerText = "Your risk assessment indicates a moderate risk level. Consider lifestyle changes and consult with a healthcare professional.";
} else {
    modalHeader.className = "modal-header high-risk";
    riskTitle.innerText = "High Risk";
    riskIcon.innerHTML = '<i class="fas fa-exclamation-circle" style="color: var(--danger-color);"></i>';
    riskProgress.className = "progress-bar bg-danger";
    riskDescription.innerText = "Your risk assessment indicates a high risk level. Please consult with a healthcare professional promptly.";
}


    // Show modal
    document.getElementById("resultModal").classList.add("show");
}

function closeModal() {
    document.getElementById("resultModal").classList.remove("show");
}

// Close modal if clicking outside of it
window.onclick = function(event) {
    let modal = document.getElementById("resultModal");
    if (event.target == modal) {
        closeModal();
    }
}