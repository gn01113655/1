
 // 使用counterup2數字套件
        const counterUp = window.counterUp.default
        const callback = entries => {
            entries.forEach(entry => {
                const el = entry.target
                if (entry.isIntersecting && !el.classList.contains('is-visible')) {
                    counterUp(el, {
                        duration: 2000,
                        delay: 32,
                    })
                    el.classList.add('is-visible')
                }
            })
        }

        const IO = new IntersectionObserver(callback, { threshold: 1 })

        const el01 = document.querySelector('*.counter01')
        IO.observe(el01)
        const el02 = document.querySelector('*.counter02')
        IO.observe(el02)
        const el03 = document.querySelector('*.counter03')
        IO.observe(el03)
        const el04 = document.querySelector('*.counter04')
        IO.observe(el04)