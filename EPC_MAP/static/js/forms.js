document.addEventListener('DOMContentLoaded', function() {
    // Function to control visibility of dependent questions
    function updateDependentQuestions() {
        // Get all questions that have dependencies
        const dependentQuestions = document.querySelectorAll('[data-depends-on]');

        dependentQuestions.forEach(function(dependent) {
            const dependsOnFieldName = dependent.getAttribute('data-depends-on');
            const expectedValue = dependent.getAttribute('data-depends-on-value');

            // Get the corresponding input/select element
            const dependsOnElement = document.querySelector(`[name="${dependsOnFieldName}"]`);

            if (dependsOnElement) {
                let currentValue = null;

                // Handle different input types (select, radio, etc.)
                if (dependsOnElement.type === 'select-one') {
                    currentValue = dependsOnElement.value;
                } else if (dependsOnElement.type === 'radio') {
                    currentValue = document.querySelector(`[name="${dependsOnFieldName}"]:checked`)?.value;
                } else {
                    currentValue = dependsOnElement.value;
                }

                // Show or hide the question depending on the current value
                if (currentValue === expectedValue) {
                    dependent.style.display = 'block';
                } else {
                    dependent.style.display = 'none';
                }
            }
        });
    }

    // Initial check on page load
    updateDependentQuestions();
    // Add event listeners to trigger update on change
    document.querySelectorAll('select, input').forEach(function(element) {
        element.addEventListener('change', updateDependentQuestions);
    });
});