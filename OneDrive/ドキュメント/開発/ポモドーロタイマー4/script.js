class PomodoroTimer {
    constructor() {
        this.isRunning = false;
        this.currentMode = 'work';
        this.workTime = 25 * 60; // 25分
        this.breakTime = 5 * 60; // 5分
        this.remainingTime = this.workTime;
        this.timer = null;
        
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.timerDisplay = document.getElementById('timer-display');
        this.startButton = document.getElementById('start-btn');
        this.stopButton = document.getElementById('stop-btn');
        this.resetButton = document.getElementById('reset-btn');
        this.workTimeInput = document.getElementById('work-time');
        this.breakTimeInput = document.getElementById('break-time');
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.start());
        this.stopButton.addEventListener('click', () => this.stop());
        this.resetButton.addEventListener('click', () => this.reset());
        this.workTimeInput.addEventListener('change', () => {
            this.workTime = parseInt(this.workTimeInput.value) * 60;
        });
        this.breakTimeInput.addEventListener('change', () => {
            this.breakTime = parseInt(this.breakTimeInput.value) * 60;
        });
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.remainingTime = this.currentMode === 'work' ? this.workTime : this.breakTime;
        this.updateDisplay();
        
        this.timer = setInterval(() => {
            if (this.remainingTime <= 0) {
                this.currentMode = this.currentMode === 'work' ? 'break' : 'work';
                this.remainingTime = this.currentMode === 'work' ? this.workTime : this.breakTime;
                this.updateDisplay();
                this.notify();
            } else {
                this.remainingTime--;
                this.updateDisplay();
            }
        }, 1000);
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.timer);
    }

    reset() {
        this.stop();
        this.currentMode = 'work';
        this.remainingTime = this.workTime;
        this.updateDisplay();
    }

    updateDisplay() {
        const minutes = Math.floor(this.remainingTime / 60);
        const seconds = this.remainingTime % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    notify() {
        if (Notification.permission === "granted") {
            new Notification(this.currentMode === 'work' ? '作業時間です' : '休憩時間です');
        }
    }
}

// デフォルトで通知を許可するようにリクエスト
Notification.requestPermission();

// タイマーのインスタンスを作成
const timer = new PomodoroTimer();
