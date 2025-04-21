export default {
    mounted(el) {
        if (window.MathJax) {
            window.MathJax.typesetPromise([el])
        }
    },
    updated(el) {
        if (window.MathJax) {
            window.MathJax.typesetPromise([el])
        }
    }
}
