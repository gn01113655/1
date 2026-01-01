function observe(selector, className, threshold) {
    const items = document.querySelectorAll(selector);
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => e.isIntersecting && e.target.classList.add(className));
    }, { threshold });

    items.forEach(el => observer.observe(el));
}

export function initScrollAnimate() {
    observe(".s10-text", "show", 0.3);
    observe("#s11 .s11-item", "is-visible", 0.4);
    observe(".s06-animate", "show", 0.2);
    observe("#s13 .process-step", "show", 0.3);
    observe("#s15 .fade-slide", "show", 0.2);
}

