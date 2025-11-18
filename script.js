document.addEventListener('DOMContentLoaded', () => {
    // Define DOM elements first
    const setupScreen = document.getElementById('setup-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    const categorySelection = document.getElementById('category-selection');
    const numQuestionsInput = document.getElementById('num-questions');
    const timerEnabledInput = document.getElementById('timer-enabled');
    const verifiedOnlyInput = document.getElementById('verified-only-enabled');
    const aiQuestionsEnabledInput = document.getElementById('ai-questions-enabled');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const progressText = document.getElementById('progress-text');
    const timerDisplay = document.getElementById('timer-display');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const confirmBtn = document.getElementById('confirm-btn');
    const explanationBtn = document.getElementById('explanation-btn');
    const nextBtn = document.getElementById('next-btn');
    const scoreSummary = document.getElementById('score-summary');
    const timeSummary = document.getElementById('time-summary');
    const studyCategories = document.getElementById('study-categories');
    const tryAgainBtn = document.getElementById('try-again-btn');
    const explanationModal = document.getElementById('explanation-modal');
    const modalExplanation = document.getElementById('modal-explanation');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const lightIcon = document.getElementById('theme-icon-light');
    const darkIcon = document.getElementById('theme-icon-dark');
    const increaseFontBtn = document.getElementById('increase-font');
    const decreaseFontBtn = document.getElementById('decrease-font');
    const uncheckAllCategoriesBtn = document.getElementById('uncheck-all-categories');
    const body = document.body;

    // App state
    let allQuestions = [];
    let activeQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timer;
    let timerInterval;
    let timeTaken = 0;
    const errorsByCategory = {};
    let currentFontIndex = 1; // 0=sm, 1=md, 2=lg

    // --- DATA LOADING ---
    async function loadQuestions() {
        try {
            const questionPromises = [];
            for (let i = 1; i <= 25; i++) {
                questionPromises.push(fetch(`questions/q${i}.json`).then(res => res.json()));
            }
            allQuestions = await Promise.all(questionPromises);
            initializeApp();
        } catch (error) {
            console.error('Error loading questions:', error);
            document.body.innerHTML = `<div class="p-4 text-center text-red-500">
                <h1 class="font-bold text-xl">Failed to load quiz data</h1>
                <p>Please make sure the 'questions' directory with all question files is available.</p>
                <p><strong>Note:</strong> If opening this as a local file, your browser might block the request. Please use a local server.</p>
            </div>`;
        }
    }

    function initializeApp() {
        // Setup UI controls
        themeToggle.addEventListener('click', () => {
            const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
        increaseFontBtn.addEventListener('click', () => applyFontSize(Math.min(currentFontIndex + 1, 2)));
        decreaseFontBtn.addEventListener('click', () => applyFontSize(Math.max(currentFontIndex - 1, 0)));
        uncheckAllCategoriesBtn.addEventListener('click', () => {
            const checkboxes = categorySelection.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        });

        // Setup quiz logic listeners
        startQuizBtn.addEventListener('click', startQuiz);
        confirmBtn.addEventListener('click', () => handleConfirm());
        explanationBtn.addEventListener('click', showExplanationModal);
        closeModalBtn.addEventListener('click', () => explanationModal.classList.add('hidden'));
        nextBtn.addEventListener('click', handleNext);
        tryAgainBtn.addEventListener('click', () => showScreen(setupScreen));

        // Initial UI state
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
        currentFontIndex = parseInt(localStorage.getItem('fontIndex')) || 1;
        applyFontSize(currentFontIndex);

        // Populate setup screen
        numQuestionsInput.max = allQuestions.length;
        numQuestionsInput.value = Math.min(parseInt(numQuestionsInput.value), allQuestions.length);
        const categories = [...new Set(allQuestions.flatMap(q => q.categories))];
        populateCategories(categories);

        showScreen(setupScreen);
    }

    // --- UI Functions ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            lightIcon.classList.remove('hidden');
            darkIcon.classList.add('hidden');
        }
    }

    function applyFontSize(index) {
        const fontClasses = ['font-sm', 'font-lg'];
        document.documentElement.classList.remove(...fontClasses);

        if (index === 0) { // Small
            document.documentElement.classList.add('font-sm');
        } else if (index === 2) { // Large
            document.documentElement.classList.add('font-lg');
        }
        // Index 1 is default, no class needed

        localStorage.setItem('fontIndex', index);
        currentFontIndex = index;
    }

    function showScreen(screen) {
        [setupScreen, quizScreen, resultsScreen].forEach(s => s.classList.add('hidden'));
        screen.classList.remove('hidden');
    }

    function populateCategories(categories) {
        categorySelection.innerHTML = '';
        // Sort categories alphabetically
        categories.sort((a, b) => a.localeCompare(b));
        categories.forEach(category => {
            const div = document.createElement('div');
            div.className = 'flex items-center';
            div.innerHTML = `
                <input id="cat-${category}" type="checkbox" value="${category}" checked class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <label for="cat-${category}" class="ml-2 text-sm text-gray-700 dark:text-gray-300">${category}</label>
            `;
            categorySelection.appendChild(div);
        });
    }

    // --- Quiz Logic Functions ---
    function startQuiz() {
        const limit = parseInt(numQuestionsInput.value);
        const useTimer = timerEnabledInput.checked;
        const verifiedOnly = verifiedOnlyInput.checked;
        const selectedCategories = Array.from(categorySelection.querySelectorAll('input:checked')).map(cb => cb.value);

        let filteredQuestions = allQuestions.filter(q => q.categories.some(cat => selectedCategories.includes(cat)));

        if (verifiedOnly) {
            filteredQuestions = filteredQuestions.filter(q => q.is_verified);
        }

        if (!aiQuestionsEnabledInput.checked) {
            filteredQuestions = filteredQuestions.filter(q => !q.is_ai_generated);
        }

        activeQuestions = shuffleArray(filteredQuestions).slice(0, limit);

        if (activeQuestions.length === 0) {
            alert("No questions found for the selected categories. Please select other categories.");
            return;
        }

        currentQuestionIndex = 0;
        score = 0;
        timeTaken = 0;
        Object.keys(errorsByCategory).forEach(key => delete errorsByCategory[key]);
        timer = useTimer;

        showScreen(quizScreen);
        displayQuestion();
        if (timer) startTimer();
    }

    function displayQuestion() {
        const question = activeQuestions[currentQuestionIndex];
        const verifiedIconPlaceholder = document.getElementById('verified-icon-placeholder');
        const aiIconPlaceholder = document.getElementById('ai-icon-placeholder');

        progressText.textContent = `Question ${currentQuestionIndex + 1} of ${activeQuestions.length}`;
        questionText.innerHTML = question.question;
        optionsContainer.innerHTML = '';

        verifiedIconPlaceholder.innerHTML = '';
        if (question.is_verified) {
            verifiedIconPlaceholder.innerHTML = `<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        }

        aiIconPlaceholder.innerHTML = '';
        if (question.is_ai_generated) {
            aiIconPlaceholder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM8 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm8 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-4 4c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/></svg>`;
        }

        const shuffledOptions = shuffleArray([...question.options]);
        const inputType = question.correct_answers.length > 1 ? 'checkbox' : 'radio';

        shuffledOptions.forEach(option => {
            const label = document.createElement('label');
            label.className = 'option-label'; // A classe principal agora está na label
            label.innerHTML = `
                <input type="${inputType}" name="option" value="${option}">
                <span class="custom-option"></span>
                <span class="text-md">${option}</span>
            `;
            optionsContainer.appendChild(label);
        });

        confirmBtn.style.display = 'block';
        explanationBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }

    function handleConfirm() {
        const selectedOptions = Array.from(optionsContainer.querySelectorAll('input:checked')).map(input => input.value);
        const question = activeQuestions[currentQuestionIndex];
        const correctAnswers = question.correct_answers;
        const isCorrect = selectedOptions.length === correctAnswers.length && selectedOptions.sort().toString() === correctAnswers.sort().toString();

        if (isCorrect) {
            score++;
        } else {
            question.categories.forEach(cat => { errorsByCategory[cat] = (errorsByCategory[cat] || 0) + 1; });
        }

        optionsContainer.querySelectorAll('.option-label').forEach(label => {
            const input = label.querySelector('input');
            input.disabled = true;
            const isCorrectAnswer = correctAnswers.includes(input.value);
            const isSelected = selectedOptions.includes(input.value);

            if (isCorrectAnswer) {
                label.classList.add('correct');
            } else if (isSelected && !isCorrectAnswer) {
                label.classList.add('incorrect');
            }
        });

        confirmBtn.style.display = 'none';
        explanationBtn.style.display = 'block';
        nextBtn.style.display = 'block';
    }

    function showExplanationModal() {
        const question = activeQuestions[currentQuestionIndex];
        modalExplanation.innerHTML = question.explanation;
        explanationModal.classList.remove('hidden');
    }

    function handleNext() {
        currentQuestionIndex++;
        if (currentQuestionIndex < activeQuestions.length) {
            displayQuestion();
        } else {
            showResults();
        }
    }

    function showResults() {
        clearInterval(timerInterval);
        showScreen(resultsScreen);
        const percentage = activeQuestions.length > 0 ? Math.round((score / activeQuestions.length) * 100) : 0;
        scoreSummary.textContent = `Your score: ${score} / ${activeQuestions.length} (${percentage}%)`;
        if (timer) {
            timeSummary.textContent = `Total time: ${timeTaken} seconds.`;
            timeSummary.style.display = 'block';
        } else {
            timeSummary.style.display = 'none';
        }
        const sortedErrorCategories = Object.entries(errorsByCategory).sort((a, b) => b[1] - a[1]);
        studyCategories.innerHTML = '';
        if (sortedErrorCategories.length > 0) {
            document.getElementById('study-suggestions').style.display = 'block';
            sortedErrorCategories.forEach(([category, count]) => {
                const li = document.createElement('li');
                li.textContent = `${category} (${count} errors)`;
                studyCategories.appendChild(li);
            });
        } else {
            document.getElementById('study-suggestions').style.display = 'none';
        }
    }

    function startTimer() {
        let timeLeft = 30 * activeQuestions.length;
        timerDisplay.style.display = 'block';
        timerInterval = setInterval(() => {
            timeTaken++;
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                showResults();
            }
        }, 1000);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- Start Application ---
    loadQuestions();
});