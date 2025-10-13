// Minimal interactions for RobotNik product site

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initRoiCalculator();
    initContactForm();
});

function initScrollReveal() {
    const animatedSections = document.querySelectorAll('section[data-animate]');
    if (!animatedSections.length) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

    animatedSections.forEach((section) => observer.observe(section));
}

function initRoiCalculator() {
    const landSizeInput = document.getElementById('land-size');
    const robotCountInput = document.getElementById('robot-count');
    const outputs = {
        speedMultiplier: document.getElementById('speed-multiplier'),
        robotDays: document.getElementById('robot-days'),
        manualDays: document.getElementById('manual-days'),
        costSavings: document.getElementById('cost-savings'),
        robotCost: document.getElementById('robot-cost'),
        manualCost: document.getElementById('manual-cost'),
        paybackTime: document.getElementById('payback-time'),
        annualSavings: document.getElementById('annual-savings')
    };

    if (!landSizeInput || !robotCountInput) {
        return;
    }

    if (Object.values(outputs).some((element) => !element)) {
        return;
    }

    const euroFormat = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    });

    const dayFormat = new Intl.NumberFormat('en-US');

    const defaults = {
        landSize: 30,
        robotCount: 1
    };

    const constants = {
        robotCapacityPerDay: 2.9,
        humanCapacityPerDay: 1.0,
        workerWagePerDay: 35,
        robotOperatingCostPerDay: 5,
        sessionsPerSeason: 4,
        robotPrice: 10000
    };

    const calculate = () => {
        const rawLand = parseFloat(landSizeInput.value);
        const rawRobots = parseInt(robotCountInput.value, 10);

        const landSize = Number.isFinite(rawLand) && rawLand >= 0 ? rawLand : defaults.landSize;
        const robotCount = Number.isFinite(rawRobots) && rawRobots > 0
            ? rawRobots
            : defaults.robotCount;
        const workPresent = landSize > 0;

        const totalRobotCapacity = robotCount * constants.robotCapacityPerDay;
        const robotDaysNeeded = totalRobotCapacity > 0 && workPresent
            ? Math.ceil(landSize / totalRobotCapacity)
            : workPresent ? 1 : 0;
        const manualDaysNeeded = constants.humanCapacityPerDay > 0 && workPresent
            ? Math.ceil(landSize / constants.humanCapacityPerDay)
            : 0;

        const robotCostPerSession = robotDaysNeeded * constants.robotOperatingCostPerDay;
        const manualCostPerSession = manualDaysNeeded * constants.workerWagePerDay;
        const robotCostPerSeason = robotCostPerSession * constants.sessionsPerSeason;
        const manualCostPerSeason = manualCostPerSession * constants.sessionsPerSeason;
        const savingsPerSeason = manualCostPerSeason - robotCostPerSeason;

        const ratio = workPresent && robotDaysNeeded > 0
            ? manualDaysNeeded / robotDaysNeeded
            : Number.NaN;
        const paybackYears = savingsPerSeason > 0
            ? (robotCount * constants.robotPrice) / savingsPerSeason
            : Number.NaN;

        outputs.speedMultiplier.textContent = Number.isFinite(ratio)
            ? `${ratio.toFixed(1)}x`
            : '–';
        outputs.robotDays.textContent = `${dayFormat.format(robotDaysNeeded)} days`;
        outputs.manualDays.textContent = `${dayFormat.format(manualDaysNeeded)} days`;

        outputs.costSavings.textContent = euroFormat.format(Math.round(savingsPerSeason));
        outputs.robotCost.textContent = euroFormat.format(Math.round(robotCostPerSeason));
        outputs.manualCost.textContent = euroFormat.format(Math.round(manualCostPerSeason));
        outputs.paybackTime.textContent = Number.isFinite(paybackYears)
            ? paybackYears.toFixed(1)
            : '–';
        outputs.annualSavings.textContent = euroFormat.format(Math.round(savingsPerSeason));
    };

    landSizeInput.addEventListener('input', calculate);
    robotCountInput.addEventListener('input', calculate);
    calculate();
}

function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) {
        return;
    }

    const statusElement = document.getElementById('contact-status');

    form.addEventListener('submit', async (event) => {
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        event.preventDefault();

        if (statusElement) {
            statusElement.textContent = 'Sending…';
        }

        const formData = new FormData(form);
        const body = new URLSearchParams(formData).toString();
        const endpoint = form.getAttribute('action') || '/';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body
            });

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            form.reset();
            if (statusElement) {
                statusElement.textContent = 'Thanks for reaching out. We will reply soon.';
            }
        } catch (error) {
            console.error('Contact form submission failed', error);
            if (statusElement) {
                statusElement.textContent = 'Delivery failed. Email hello@robotnik.ag.';
            }
        }
    });
}
