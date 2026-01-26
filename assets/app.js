/* BAR Sanctuary - Core Logic */

const STATE_KEY = 'bar_sanctuary_state';

// Initial State
const defaultState = {
    phase: 0, // 0: Normal, 1: Uncanny, 2: Intrusion
    actions: [], // Log of user actions
    logoClicks: 0,
    startTime: Date.now()
};

// State Manager
const State = {
    get: () => {
        try {
            const s = localStorage.getItem(STATE_KEY);
            return s ? JSON.parse(s) : defaultState;
        } catch (e) {
            return defaultState;
        }
    },
    save: (s) => {
        try {
            localStorage.setItem(STATE_KEY, JSON.stringify(s));
        } catch (e) { }
    },
    update: (fn) => {
        const s = State.get();
        const newS = fn(s);
        State.save(newS || s);
        return newS || s;
    }
};

// Action Logger
const logAction = (action) => {
    State.update(s => {
        const entry = `[${new Date().toISOString().split('T')[1].split('.')[0]}] ${action}`;
        let acts = [...s.actions, entry];
        if (acts.length > 20) acts.shift();
        s.actions = acts;
        return s;
    });
};

// UI Manager
const UI = {
    applyPhase: () => {
        const s = State.get();
        document.body.setAttribute('data-phase', s.phase);

        document.querySelectorAll('[data-visible-phase]').forEach(el => {
            const requiredPhase = parseInt(el.getAttribute('data-visible-phase'));
            if (s.phase >= requiredPhase) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });

        if (s.phase >= 1) {
            UI.startPersistentGlitch(); // Ensure glitch resumes on reload
            startGlitchEffects();
            startWakeHints();
        }
    },

    // TRIGGER EVENT: Normal -> Broken
    triggerGlitchEvent: () => {
        const body = document.body;

        // 1. Apply severe glitch class PERMANENTLY
        body.classList.add('glitch-severe');

        // 2. Start the permanent flash loop for 1 second
        const flashLoop = () => {
            if (Math.random() > 0.8) {
                const el = document.createElement('div');
                el.className = 'flash-overlay';
                el.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: ${Math.random() > 0.5 ? 'white' : 'red'};
                    opacity: ${Math.random() * 0.3};
                    z-index: 2147483646; pointer-events: none; mix-blend-mode: exclusion;
                `;
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 100);
            }
            setTimeout(flashLoop, 150);
        };
        flashLoop();

        // 3. Redirect to glitch page after 1 second
        setTimeout(() => {
            window.location.href = 'glitch.html';
        }, 1000);
    },

    // Resume glitch if page was reloaded in Phase 1
    startPersistentGlitch: () => {
        document.body.classList.add('glitch-severe');
        const flashLoop = () => {
            if (Math.random() > 0.8) {
                const el = document.createElement('div');
                el.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: ${Math.random() > 0.5 ? 'white' : 'red'};
                    opacity: ${Math.random() * 0.3};
                    z-index: 2147483646; pointer-events: none; mix-blend-mode: exclusion;
                `;
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 100);
            }
            setTimeout(flashLoop, 150);
        };
        flashLoop();
    },

    showFinale: () => {
        // CLEANUP: Remove phase 1 overlays
        document.body.classList.remove('glitch-severe');
        const oldInstr = document.querySelectorAll('div[style*="z-index: 99999"]');
        oldInstr.forEach(el => el.remove());
        const oldHints = document.querySelectorAll('.flash-hint');
        oldHints.forEach(el => el.remove());

        let overlay = document.getElementById('intrusion-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'intrusion-overlay';
            document.body.appendChild(overlay);
        }
        overlay.innerHTML = `<div class="terminal-text blinking-cursor"></div>`;

        const finalMsg = "あなたは夢から覚めました。\nもう遊びに行く時間です。\n\n現実は、ここにあります\nあなたの目の前に広がっています。\n\n...それとも、まだ思い出せませんか？";

        const textEl = overlay.querySelector('.terminal-text');
        typeWriter(textEl, finalMsg, () => {
            setTimeout(() => {
                const btn = document.createElement('button');
                btn.className = 'mulberry-btn';
                btn.innerText = "今日もあのBARに飲みに行く";
                btn.onclick = () => {
                    window.location.href = "https://cluster.mu/w/1c331560-bc78-44ad-9e37-98428ba614a4";
                };
                overlay.appendChild(btn);
            }, 1000);
        });
    }
};

// Subliminal hints for WAKE
function startWakeHints() {
    setInterval(() => {
        const words = ["WAKE", "KEY: WAKE", "W", "A", "K", "E", "起きろ"];
        const word = words[Math.floor(Math.random() * words.length)];
        const el = document.createElement('div');
        el.className = 'flash-hint';
        el.innerText = word;
        el.style.top = Math.random() * 80 + 10 + '%';
        el.style.left = Math.random() * 80 + 10 + '%';
        el.style.fontSize = (Math.random() * 5 + 2) + 'rem';
        el.style.color = '#ff0000';
        el.style.textShadow = '0 0 5px black';
        document.body.appendChild(el);

        setTimeout(() => el.remove(), 400);
    }, 1200);
}

// Random text glitches
function startGlitchEffects() {
    document.querySelectorAll('.variable-text').forEach(el => {
        setInterval(() => {
            if (Math.random() > 0.9) {
                el.classList.add('glitch-text');
                const original = el.innerText;
                el.innerText = randomStr(original.length);
                setTimeout(() => {
                    el.innerText = original;
                    el.classList.remove('glitch-text');
                }, 200);
            }
        }, 800);
    });
}

// Utils
const randomStr = (len) => {
    const chars = 'ASDFGHJKLQWERTYUIOPZXCVBNM@#$%&*????';
    let res = '';
    for (let i = 0; i < len; i++) res += chars[Math.floor(Math.random() * chars.length)];
    return res;
};

const typeWriter = (el, text, cb) => {
    let i = 0;
    el.innerText = "";
    const speed = 40;

    function step() {
        if (i < text.length) {
            el.innerText += text.charAt(i);
            i++;
            setTimeout(step, speed);
        } else if (cb) {
            cb();
        }
    }
    step();
};

// Screen shake utility
const shakeScreen = (intensity) => {
    const body = document.body;
    const maxOffset = intensity * 3; // 3px per intensity level
    const duration = 200; // milliseconds
    const startTime = Date.now();

    const animate = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
            const x = (Math.random() - 0.5) * maxOffset;
            const y = (Math.random() - 0.5) * maxOffset;
            body.style.transform = `translate(${x}px, ${y}px)`;
            requestAnimationFrame(animate);
        } else {
            body.style.transform = '';
        }
    };
    animate();
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // RESET STATE ON HOME PAGE VISITS
    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        console.log("Returned to Home. Resetting State.");
        localStorage.removeItem(STATE_KEY);
    }

    logAction(`VIEW: ${document.title}`);
    UI.applyPhase();

    // TRIGGER 1: Logo Clicks
    const title = document.querySelector('.site-title');
    if (title) {
        title.addEventListener('click', () => {
            State.update(s => {
                const now = Date.now();
                if (s.lastClickTime && now - s.lastClickTime > 1500) {
                    s.logoClicks = 0; // Reset if too slow
                }
                s.lastClickTime = now;
                s.logoClicks++;

                // Progressive shake from 3rd click onwards
                if (s.logoClicks >= 3 && s.logoClicks < 7) {
                    const intensity = s.logoClicks - 2; // 1 for 3rd click, up to 5 for 7th
                    shakeScreen(intensity);
                }

                if (s.phase === 0 && s.logoClicks >= 7) {
                    s.phase = 1;
                    UI.triggerGlitchEvent(); // Visual chaos first
                    // Note: No reload here anymore. Glitch stays.
                }
                return s;
            });
        });
    }

    // TRIGGER 2: Robust WAKE Input (Buffer Match)
    // Matches if the last 4 valid keystrokes form "WAKE"
    let keyBuffer = "";


    // Function to handle character input
    const handleCharInput = (char) => {
        if (char) {
            keyBuffer += char;
            if (keyBuffer.length > 10) keyBuffer = keyBuffer.slice(-5);
            console.log("Buffer:", keyBuffer);

            // Visual Feedback
            const fb = document.createElement('div');
            fb.innerText = char;
            fb.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
                font-size: 15rem; color: red; opacity: 0.8; z-index: 10001; pointer-events: none;
                text-shadow: 0 0 20px black; font-weight: bold; font-family: sans-serif; animation: fadeOut 0.5s forwards;
            `;
            document.body.appendChild(fb);
            setTimeout(() => fb.remove(), 500);

            // Check for WAKE sequence
            if (keyBuffer.toUpperCase().endsWith("WAKE")) {
                State.update(s => {
                    // Trigger if Phase 1 OR if we just want to allow it globally for safety
                    if (s.phase >= 1) {
                        s.phase = 2;
                        UI.showFinale();
                    }
                    return s;
                });
                keyBuffer = ""; // Reset
            }
        }
    };

    // Desktop keyboard input
    document.addEventListener('keydown', (e) => {
        // Map codes to characters to avoid IME/Case issues
        let char = '';
        if (e.code === 'KeyW') char = 'W';
        else if (e.code === 'KeyA') char = 'A';
        else if (e.code === 'KeyK') char = 'K';
        else if (e.code === 'KeyE') char = 'E';

        handleCharInput(char);
    });



    // --- NEW LUXURY FEATURES ---

    // 1. Scroll Observer for Fade-ins
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once visible? 
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-section, .fade-in-up').forEach(el => {
        observer.observe(el);
    });

    // 2. Parallax Effect for Hero
    const heroBg = document.querySelector('.hero-bg');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;

        // Parallax
        if (heroBg && scrolled < window.innerHeight) {
            heroBg.style.transform = `translateY(${scrolled * 0.5}px) translateZ(0)`;
        }

        // Header Glass Effect
        const header = document.querySelector('.glass-header');
        if (header) {
            if (scrolled > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // 3. Hero Text Reveal (Immediate)
    setTimeout(() => {
        const heroTagline = document.querySelector('.hero-tagline');
        const heroSub = document.querySelector('.hero-sub');
        if (heroTagline) {
            heroTagline.style.opacity = 1;
            heroTagline.style.transform = 'translateY(0)';
            heroTagline.style.transition = 'all 1.2s ease-out';
        }
        if (heroSub) {
            setTimeout(() => {
                heroSub.style.opacity = 1;
                heroSub.style.transform = 'translateY(0)';
                heroSub.style.transition = 'all 1.2s ease-out';
            }, 500);
        }
    }, 100);

    // 4. Recruit Form Logic
    const recruitForm = document.getElementById('recruit-form');
    if (recruitForm) {
        recruitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const jobType = document.getElementById('job-type').value;

            if (jobType === 'engineer') {
                alert("ご応募ありがとうございます。サイト上部の「S?UAR?Y」ロゴを7回連続でクリックすると、重大なシステムエラー（trouble name; 現実への回帰）が発生します。修理をお願いします。");
            } else {
                alert("現在、募集は停止している可能性があります。直接店舗へお越しください。");
            }
        });
    }

    // 5. Disturbing Scroll Effect
    let hasShownDisturbingMsg = false;
    window.addEventListener('scroll', () => {
        if (hasShownDisturbingMsg) return;

        const isRecruit = window.location.pathname.endsWith('recruit.html');
        // Trigger thresholds
        const triggerY = isRecruit ? 300 : 1200;

        if (window.scrollY > triggerY) {
            hasShownDisturbingMsg = true;

            const overlay = document.createElement('div');
            overlay.className = 'disturbing-overlay';

            let msg = "何か忘れていないか？"; // Default for Home
            if (isRecruit) {
                msg = "思い出せない、、";
            }

            overlay.innerHTML = `<div class="disturbing-text" data-text="${msg}">${msg}</div>`;
            document.body.appendChild(overlay);

            // Recruit page: 0.5s duration
            // Home page: 0.5s duration (was 1s in my mental model but code said 500ms which is 0.5s)
            // Code actually said: Remove after 1 seconds (comment) but code was 500ms.
            // User request for Recruit: "0.5秒間だけ" (only for 0.5 seconds).
            // Existing code had 500ms. So 500ms is correct for both.
            setTimeout(() => {
                overlay.remove();
            }, 500);
        }
    });

});
