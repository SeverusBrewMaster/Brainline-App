document.addEventListener('DOMContentLoaded', function() {
    try {
        // Get the canvas element
        const ctx = document.getElementById('pieChart').getContext('2d');
        
        // Risk factor labels
        const riskFactors = [
            'Smoking/Tobacco',
            'Hypertension',
            'Age > 60',
            'Alcohol Abuse',
            'Atrial Fibrillation',
            'Diabetes',
            'Obesity',
            'Family History',
            'Stress',
            'Sedentary Lifestyle',
            'History of TIA',
            'Previous Disease'
        ];
        
        // Colors for each risk factor
        const colors = [
            '#FF6384', // Red
            '#36A2EB', // Blue
            '#FFCE56', // Yellow
            '#4BC0C0', // Teal
            '#9966FF', // Purple
            '#FF9F40', // Orange
            '#8AC926', // Green
            '#C5979D', // Mauve
            '#1982C4', // Bright Blue
            '#6A4C93', // Dark Purple
            '#F13C20', // Bright Red
            '#5D675B'  // Gray Green
        ];
        
        // Initial placeholder data (default to 1 for each factor for demonstration)
        const initialData = Array(riskFactors.length).fill(1);
        
        // Create the pie chart
        const pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: riskFactors,
                datasets: [{
                    data: initialData,
                    backgroundColor: colors,
                    borderColor: 'white',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            boxWidth: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return context.label + ': ' + percentage + '%';
                            }
                        }
                    }
                }
            }
        });
        
        // Function to update chart data based on risk factor presence
        window.updateRiskFactors = function(factors) {
            // Default all factors to 0
            const newData = Array(factors.length).fill(0);
            
            // Set values based on presence (1) or absence (0)
            factors.forEach((value, index) => {
                // We add 1 to each value so that 0's don't disappear from the chart
                // For factors that are present (1), we make them more prominent (value 2)
                newData[index] = value === 1 ? 2 : 1;
            });
            
            // Update the chart
            pieChart.data.datasets[0].data = newData;
            pieChart.update();
            
            // In the real case, you might want to only show present factors:
            // const presentFactors = factors.map((value, index) => value === 1 ? index : -1).filter(i => i !== -1);
            // const presentLabels = presentFactors.map(index => riskFactors[index]);
            // const presentData = presentFactors.map(() => 1);
            // const presentColors = presentFactors.map(index => colors[index]);
            // 
            // pieChart.data.labels = presentLabels;
            // pieChart.data.datasets[0].data = presentData;
            // pieChart.data.datasets[0].backgroundColor = presentColors;
            // pieChart.update();
        };
        
        // Function to get color information for external legend
        window.getRiskFactorColors = function() {
            return riskFactors.map((factor, index) => {
                return {
                    name: factor,
                    color: colors[index]
                };
            });
        };
        
        
        updateRiskFactors([1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0]);
        
    } catch (error) {
        console.error('Error initializing chart:', error);
        
        // Display error message in the chart container
        const container = document.querySelector('.chart-container');
        container.innerHTML = '<div style="color: red; text-align: center; padding: 20px;">Error initializing chart: ' + error.message + '</div>';
    }
});