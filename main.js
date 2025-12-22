// RobotNik Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Add scroll animation classes to elements
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const sectionHeader = section.querySelector('.section-header, .section-title, .mission-title, .environmental-title, .calculator-title');
        if (sectionHeader) {
            sectionHeader.classList.add('fade-in-up');
        }
        
        const cards = section.querySelectorAll('.problem-card, .tech-module, .environmental-stat, .calculator-card');
        cards.forEach((card, index) => {
            if (index % 2 === 0) {
                card.classList.add('fade-in-left');
            } else {
                card.classList.add('fade-in-right');
            }
        });
    });
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right').forEach(el => {
        observer.observe(el);
    });
    
    // Calculator functionality
    const farmSizeInput = document.getElementById('farm-size');
    const daysResult = document.getElementById('days-result');
    const hoursResult = document.getElementById('hours-result');
    
    const pesticideUsageInput = document.getElementById('pesticide-usage');
    const pesticideSaved = document.getElementById('pesticide-saved');
    
    if (farmSizeInput && daysResult && hoursResult) {
        farmSizeInput.addEventListener('input', calculateCoverage);
    }
    
    if (pesticideUsageInput && pesticideSaved) {
        pesticideUsageInput.addEventListener('input', calculateEnvironmentalImpact);
    }
    
    function calculateCoverage() {
        const farmSize = parseFloat(farmSizeInput.value);
        if (!isNaN(farmSize) && farmSize > 0) {
            // RobotNik can cover 2.9 decares per 8-hour shift
            const robotCoveragePerShift = 2.9;
            const shiftsNeeded = farmSize / robotCoveragePerShift;
            const daysNeeded = Math.ceil(shiftsNeeded);
            const hoursNeeded = Math.ceil(shiftsNeeded * 8);
            
            daysResult.textContent = daysNeeded;
            hoursResult.textContent = hoursNeeded;
        } else {
            daysResult.textContent = '-';
            hoursResult.textContent = '-';
        }
    }
    
    function calculateEnvironmentalImpact() {
        const pesticideUsage = parseFloat(pesticideUsageInput.value);
        const farmSize = parseFloat(farmSizeInput.value) || 10; // Default to 10 if not specified
        
        if (!isNaN(pesticideUsage) && pesticideUsage >= 0) {
            // Calculate pesticides saved per year
            const pesticidesSavedKg = (pesticideUsage * farmSize).toFixed(1);
            pesticideSaved.textContent = pesticidesSavedKg + ' kg/year';
        } else {
            pesticideSaved.textContent = '-';
        }
    }
    
    // Animated counters for environmental impact section
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = Math.ceil(target / (duration / 16));
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = current.toLocaleString();
            }
        }, 16);
    }
    
    // Start counter animations when they come into view
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.textContent.replace(/,/g, ''));
                animateCounter(element, target);
                counterObserver.unobserve(element);
            }
        });
    }, {
        threshold: 0.5
    });
    
    document.querySelectorAll('#pesticide-counter, #area-counter, #farmer-counter').forEach(el => {
        counterObserver.observe(el);
    });
});


    
    // Impact Calculator Functions
    function updateImpactCalculations() {
        const robotCount = parseInt(document.getElementById('robot-count').value) || 100;
        
        // Constants
        const decaresPerRobotPerShift = 2.9;
        const shiftsPerDay = 2;
        const seasonDays = 120; // 4 months weeding season
        const pesticidePerDecare = 0.3; // kg/decare, converted to liters (roughly 1:1)
        const humanProductivityPerShift = 0.15; // decares per human per 8-hour shift
        
        // Calculations
        const decaresPerRobotPerDay = decaresPerRobotPerShift * shiftsPerDay;
        const totalDecaresPerSeason = robotCount * decaresPerRobotPerDay * seasonDays;
        const pesticidesSaved = totalDecaresPerSeason * pesticidePerDecare;
        const humansLiberated = Math.round((robotCount * decaresPerRobotPerShift) / humanProductivityPerShift);
        
        // Update display
        const coverageElement = document.getElementById('coverage-result');
        const humansElement = document.getElementById('humans-freed');
        const pesticidesElement = document.getElementById('pesticides-eliminated');
        
        if (coverageElement) coverageElement.textContent = totalDecaresPerSeason.toLocaleString();
        if (humansElement) humansElement.textContent = humansLiberated.toLocaleString();
        if (pesticidesElement) pesticidesElement.textContent = Math.round(pesticidesSaved).toLocaleString();
    }
    
    // Land size slider update
    function updateLandSize() {
        const landSlider = document.getElementById('land-size');
        const landValue = document.querySelector('.land-value');
        if (landSlider && landValue) {
            landValue.textContent = landSlider.value;
        }
    }
    
    // Impact calculator event listeners
    const robotInput = document.getElementById('robot-count');
    const landSlider = document.getElementById('land-size');
    
    if (robotInput) {
        robotInput.addEventListener('input', updateImpactCalculations);
        updateImpactCalculations(); // Initial calculation
    }
    
    if (landSlider) {
        landSlider.addEventListener('input', updateLandSize);
        updateLandSize(); // Initial update
    }

