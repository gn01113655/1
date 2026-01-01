        // 右下方滑動才淡入按鈕
        const backToTopBtn = document.getElementById("backToTop");

        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add("show");   // 淡入
            } else {
                backToTopBtn.classList.remove("show"); // 淡出
            }
        });

        // 點擊後回到最上面（平滑滾動）
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
      